"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LinkEditor } from "@/components/LinkEditor";
import { PhonePreview } from "@/components/PhonePreview";
import { Link, Profile } from "@/types";

export default function DashboardPage() {
    const supabase = createClient();
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    // State
    const [profile, setProfile] = useState<Profile>({
        username: " ",
        bio: " ",
        avatar: "",
    });
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newLink, setNewLink] = useState<Omit<Link, "id">>({
        title: "",
        url: "",
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(profile.avatar);
    const [token, setToken] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null!);

    // Drag and drop hook
    const { links, setLinks, sensors, handleDragEnd } = useDragAndDrop({
        initialLinks: [],
        onReorder: async (newLinks) => {
            // Save new order to backend
            try {
                await fetch(`${baseUrl}/api/v1/user/links/reorder`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        links: newLinks.map((link, index) => ({
                            id: link.id,
                            display_order: index,
                        })),
                    }),
                });
            } catch (error) {
                console.error('Failed to save new order:', error);
            }
        },
    });

    // Fetch session token
    useEffect(() => {
        const fetchSession = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            setToken(token || "");
        };
        fetchSession();
    }, []);

    // Fetch user data on mount
    useEffect(() => {
        const getUserData = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

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

    // Handle file selection for avatar
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Handle profile update
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const formData = new FormData();
            formData.append("username", profile.username);
            formData.append("bio", profile.bio);

            if (selectedFile) {
                formData.append("avatar", selectedFile);
            }

            const response = await apiFetch("/api/v1/user/update", {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                alert("Profile updated!");
                if (result.data) {
                    setProfile((prev) => ({ ...prev, avatar: result.data }));
                }
            }
        } catch (error: any) {
            console.error("Update failed:", error);
            alert(error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Handle adding a new link
    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newLink.title.trim() || !newLink.url.trim()) {
            alert("Please fill in both title and URL");
            return;
        }

        try {
            const linkToAdd: Link = {
                id: Date.now().toString(),
                title: newLink.title,
                url: newLink.url,
            };

            // TODO: Uncomment when backend is ready
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

            setLinks([...links, linkToAdd]);
            setNewLink({ title: "", url: "" });
            setIsAddDialogOpen(false);
        } catch (error) {
            console.error("Failed to add link", error);
            alert("Failed to add link. Please try again.");
        }
    };

    // Handle updating a link
    const handleUpdateLink = (
        id: string,
        field: "title" | "url",
        value: string
    ) => {
        setLinks(
            links.map((link) =>
                link.id === id ? { ...link, [field]: value } : link
            )
        );

        // TODO: Uncomment when backend is ready
        /*
        fetch(`${baseUrl}/api/v1/user/links/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linkId: id, [field]: value }),
        });
        */
    };

    // Handle deleting a link
    const handleDeleteLink = () => {
        console.log("function handleDeleteLink called: not implemented yet");
        // TODO: Implement when backend is ready
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <DashboardHeader
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                isUpdating={isUpdating}
                previewUrl={previewUrl}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onProfileChange={setProfile}
            />

            <main className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 p-6">
                <LinkEditor
                    links={links}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    isAddDialogOpen={isAddDialogOpen}
                    onAddDialogChange={setIsAddDialogOpen}
                    newLink={newLink}
                    onNewLinkChange={setNewLink}
                    onAddLink={handleAddLink}
                    onUpdateLink={handleUpdateLink}
                    onDeleteLink={handleDeleteLink}
                />

                <PhonePreview profile={profile} links={links} />
            </main>
        </div>
    );
}