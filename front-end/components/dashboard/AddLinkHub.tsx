// components/dashboard/AddLinkHub.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus, User } from "lucide-react";
import { apiFetch, publicFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface AddLinkHubProps {
    trigger?: React.ReactNode;
    onCreated?: () => void;
}

export function AddLinkHub({ trigger, onCreated }: AddLinkHubProps) {
    const { profile } = useProfile();
    const [displayName, setDisplayName] = useState(profile?.display_name || "");
    const [open, setOpen] = useState(false);
    const [publicLink, setPublicLink] = useState("");
    const [available, setAvailable] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [token, setToken] = useState("");
    const [userId, setUserId] = useState("");

    const router = useRouter();
    const supabase = createClient();

    // Pre-fill display name
    useEffect(() => {
        if (profile?.display_name) {
            setDisplayName(profile.display_name);
        }
    }, [profile?.display_name]);

    // Get session on mount
    useEffect(() => {
        const fetchSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (!data.session) {
                router.push("/auth/login");
                return;
            }
            setToken(data.session.access_token);
            setUserId(data.session.user.id);
        };
        fetchSession();
    }, []);

    // Debounced public link availability check — same logic as SignUpForm
    useEffect(() => {
        setAvailable(false);
        if (!publicLink || publicLink.length < 3) return;

        const timer = setTimeout(async () => {
            try {
                const response = await publicFetch(`/api/v1/profile/check/${publicLink}`);
                const data = await response.json();
                setAvailable(data.available);
            } catch {
                setAvailable(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [publicLink]);

    // Reset form when dialog closes
    const handleOpenChange = (val: boolean) => {
        setOpen(val);
        if (!val) {
            setPublicLink("");
            setAvailable(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!available || !publicLink || !userId) return;
        setIsCreating(true);

        try {
            const response = await publicFetch("/api/v1/profile/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: userId,
                    public_link: publicLink,
                    display_name: displayName,
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                alert(err.message || "Failed to create LinkHub");
                return;
            }

            setOpen(false);
            onCreated?.();
            router.refresh();

            console.log("LinkHub created successfully");
            alert("LinkHub created successfully");

        } catch (error: any) {
            console.error("Create LinkHub failed:", error);
            alert(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button variant="outline" className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create new LinkHub
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreate}>
                    <DialogHeader>
                        <DialogTitle>Create new LinkHub</DialogTitle>
                        <DialogDescription>
                            Set up a new public page with its own unique link.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-4">

                        {/* Public Link — same pattern as SignUpForm */}
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="new-public-link">Public Link</Label>
                                <div className="h-4">
                                    {publicLink && (
                                        available
                                            ? <span className="text-sm text-green-500">Available</span>
                                            : <span className="text-sm text-red-500">Unavailable</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 h-10 bg-muted rounded-l-lg border border-r-0 text-sm text-gray-400 font-medium">
                                    linkhub.id/
                                </span>
                                <Input
                                    id="new-public-link"
                                    spellCheck={false}
                                    placeholder="your-link"
                                    value={publicLink}
                                    onChange={(e) => setPublicLink(e.target.value)}
                                    className="rounded-l-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#6366F1] hover:bg-[#4F46E5]"
                            disabled={isCreating || !available}
                        >
                            {isCreating ? "Creating..." : "Create LinkHub"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}