"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, GripVertical, Trash2, BarChart3, User, Globe, Share2, Camera } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client"

// Define types
interface Link {
    id: string;
    title: string;
    url: string;
}

interface Profile {
    username: string;
    bio: string;
    avatar: string;
}

export default function DashboardPage() {
    const supabase = createClient();

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const [links, setLinks] = useState<Link[]>([]);

    // State for Add Link Dialog
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newLink, setNewLink] = useState<Omit<Link, 'id'>>({
        title: "",
        url: "",
    });

    // State for Profile
    const [profile, setProfile] = useState<Profile>({
        username: " ",
        bio: " ",
        avatar: "",
    });
    // State for Update Profile
    const [isUpdating, setIsUpdating] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(profile.avatar);

    // Frontend logic to handle Delete Account
    // const handleDeleteAccount = async (id: string) => {
    //     try {
    //         // Connect to your backend dev's route
    //         const response = await fetch(`${baseUrl}/api/v1/user/delete`, {
    //             method: "DELETE",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ linkId: id }),
    //         });

    //         if (response.ok) {
    //             setLinks(links.filter((link) => link.id !== id));
    //         }
    //     } catch (error) {
    //         console.error("Failed to delete link", error);
    //     }
    // };

    const handleDeleteLink = async () => {
        console.log("function handleDeleteLink called: not implemented yet");
        // try {
        //         // Connect to your backend dev's route
        //         const response = await fetch(`${baseUrl}/api/v1/user/links/delete`, {
        //             method: "DELETE",
        //             headers: { "Content-Type": "application/json" },
        //             body: JSON.stringify({ linkId: id }),
        //         });

        //         if (response.ok) {
        //             setLinks(links.filter((link) => link.id !== id));
        //         }
        //     } catch (error) {
        //         console.error("Failed to delete link", error);
        //     }
        // }
    };

    // Handle Add New Link
    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!newLink.title.trim() || !newLink.url.trim()) {
            alert("Please fill in both title and URL");
            return;
        }

        try {
            // Create new link object with a unique ID
            const linkToAdd = {
                id: Date.now().toString(), // Simple ID generation
                title: newLink.title,
                url: newLink.url,
            };

            // If you have a backend endpoint for adding links, uncomment and use this:
            /*
            const response = await fetch(`${baseUrl}/api/v1/user/links/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(linkToAdd),
            });
 
            if (response.ok) {
                const result = await response.json();
                setLinks([...links, result.link]);
            }
            */

            // For now, just add to local state
            setLinks([...links, linkToAdd]);

            // Reset form and close dialog
            setNewLink({ title: "", url: "" });
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error("Failed to add link", error);
            alert("Failed to add link. Please try again.");
        }
    };

    // Handle inline editing of links
    const handleUpdateLink = (id: string, field: 'title' | 'url', value: string) => {
        setLinks(links.map(link =>
            link.id === id ? { ...link, [field]: value } : link
        ));

        // If you want to save to backend immediately on change:
        /*
        debounce(() => {
            fetch(`${baseUrl}/api/v1/user/links/update`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkId: id, [field]: value }),
            });
        }, 500);
        */
    };

    // FETCH DATA FROM SUPABASE ON LOAD
    useEffect(() => {
        const getUserData = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                console.error("Error fetching user:", error.message);
                return;
            }

            if (user?.user_metadata) {
                const metadata = user.user_metadata;
                setProfile({
                    username: metadata.username || "username",
                    bio: metadata.bio || "My bio is empty",
                    avatar: metadata.avatar || "",
                });
            }
        };

        getUserData();
    }, [supabase]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            // Create a local preview so the user sees the change immediately
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle Profile Update
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            // Use FormData for Multer compatibility
            const formData = new FormData();
            formData.append("username", profile.username);
            formData.append("bio", profile.bio);

            if (selectedFile) {
                formData.append("avatar", selectedFile); // 'avatar' must match your multer upload.single('avatar')
            }

            const response = await fetch(`${baseUrl}/api/v1/user/update`, {
                method: "POST",
                body: formData, // Do NOT set Content-Type header; the browser sets it automatically for FormData
            });

            if (response.ok) {
                const result = await response.json();
                alert("Profile updated!");
                // Update the profile state with the new URL returned from the backend
                if (result.avatarUrl) {
                    setProfile(prev => ({ ...prev, avatar: result.avatarUrl }));
                }
            }
        } catch (error: any) {
            console.error("Update failed:", error);
            alert(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header Navigation */}
            <nav className="border-b bg-white px-6 py-3 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-8">
                    <h1 className="text-xl font-bold text-[#4F46E5]">LinkHub</h1>
                    <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
                        <span className="text-[#4F46E5] border-b-2 border-[#4F46E5] pb-4 mt-4">Links</span>
                        <span className="hover:text-slate-800 cursor-pointer pb-4 mt-4">Appearance</span>
                        <span className="hover:text-slate-800 cursor-pointer pb-4 mt-4">Analytics</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" className="rounded-full">
                        <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                    <LogoutButton />
                    {/* PROFILE EDIT DIALOG */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center border border-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-colors group">
                                {profile.avatar ? (
                                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <User className="w-5 h-5 text-[#6366F1]" />
                                )}
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleUpdateProfile}>
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                    <DialogDescription>
                                        Suit your Profile here
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-6 py-4">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative w-20 h-20 bg-slate-100 rounded-full border flex items-center justify-center cursor-pointer hover:bg-slate-200 group overflow-hidden"
                                    >
                                        {previewUrl || profile.avatar ? (
                                            <img src={previewUrl || profile.avatar} className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-bold">
                                            CHANGE
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={profile.username}
                                            onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Input
                                            id="bio"
                                            value={profile.bio}
                                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-[#6366F1] hover:bg-[#4F46E5]" disabled={isUpdating}>
                                        {isUpdating ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </nav>

            {/* 2. Main Content Layout */}
            <main className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 p-6">

                {/* Editor Side (Left) */}
                <div className="flex-1 space-y-6">
                    {/* ADD NEW LINK DIALOG */}
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full py-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md text-lg font-semibold">
                                <Plus className="mr-2 h-5 w-5" /> Add New Link
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleAddLink}>
                                <DialogHeader>
                                    <DialogTitle>Add New Link</DialogTitle>
                                    <DialogDescription>
                                        Add a new link to your profile
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="link-title">Title</Label>
                                        <Input
                                            id="link-title"
                                            placeholder="Instagram"
                                            value={newLink.title}
                                            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="link-url">URL</Label>
                                        <Input
                                            id="link-url"
                                            type="url"
                                            placeholder="https://instagram.com/username"
                                            value={newLink.url}
                                            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="bg-[#6366F1] hover:bg-[#4F46E5]">
                                        Add Link
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <div className="space-y-4">
                        {links.map((link) => (
                            <Card key={link.id} className="p-4 border-slate-200 shadow-sm bg-white group hover:border-[#6366F1] transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="mt-3 cursor-grab text-slate-300 group-hover:text-slate-400">
                                        <GripVertical className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={link.title}
                                                onChange={(e) => handleUpdateLink(link.id, 'title', e.target.value)}
                                                className="h-7 font-bold text-[#0F172A] border-none p-0 focus-visible:ring-0 text-base"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={link.url}
                                                onChange={(e) => handleUpdateLink(link.id, 'url', e.target.value)}
                                                className="h-5 text-[#475569] border-none p-0 focus-visible:ring-0 text-sm italic"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteLink()}
                                            className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Live Preview Side (Right) */}
                <div className="hidden lg:block w-[320px] sticky top-24 h-fit">
                    <div className="relative border-[12px] border-[#0F172A] rounded-[3rem] aspect-[9/19] bg-white shadow-2xl overflow-hidden">
                        {/* Phone Screen Content */}
                        <div className="p-6 flex flex-col items-center h-full">
                            {/* PREVIEW AVATAR */}
                            <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 shadow-inner overflow-hidden border border-slate-100">
                                {profile.avatar && (
                                    <img src={profile.avatar} alt="Preview" className="w-full h-full object-cover" />
                                )}
                            </div>
                            <h3 className="font-bold text-[#0F172A]">@{profile.username}</h3>
                            <p className="text-[11px] text-slate-500 mb-8 text-center px-4">{profile.bio}</p>

                            <div className="w-full space-y-3 overflow-y-auto">
                                {links.map((link) => (
                                    <div key={link.id} className="w-full py-3 px-4 rounded-full bg-[#6366F1] text-white text-[13px] font-medium text-center shadow-sm">
                                        {link.title}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-auto pt-4 flex items-center gap-1 opacity-40">
                                <Globe className="w-3 h-3" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">LinkHub</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}