// components/dashboard/SwitchLinkHub.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw, Plus, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { AddLinkHub } from "./AddLinkHub";
import {
    LayoutBlock,
    BlockType,
    DEFAULT_LAYOUT_BLOCKS,
} from "@/components/dashboard/LayoutCustomizer";

interface LinkHubProfile {
    id: string;
    public_link: string;
    display_name: string | undefined; // ← match Profile type
    avatar_url: string | undefined; // ← match Profile type
}

interface SwitchLinkHubProps {
    trigger?: React.ReactNode;
}

export function SwitchLinkHub({ trigger }: SwitchLinkHubProps) {
    const [open, setOpen] = useState(false);
    const [profiles, setProfiles] = useState<LinkHubProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const { profile, setProfile, setLayoutBlocks, setLinks } = useProfile();
    const supabase = createClient();

    // Fetch all profiles for this user
    useEffect(() => {
        if (!open) return;

        const fetchProfiles = async () => {
            setLoading(true);
            try {
                const { data: session } = await supabase.auth.getSession();
                if (!session.session) return;

                const { data, error } = await supabase
                    .from("profiles")
                    .select("id, public_link, display_name, avatar_url")
                    .eq("user_id", session.session.user.id)
                    .order("created_at", { ascending: true });

                if (!error && data) setProfiles(data);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [open]);

    const handleSwitch = async (selected: string) => {
        // Update the active profile in context
        const { data, error } = await supabase
            .from("profiles")
            .select(
                "id, public_link, display_name, bio, avatar_url, theme_id, background_color, text_color, button_color, avatar_radius, button_radius"
            )
            .eq("id", selected)
            .maybeSingle();

        if (error) {
            console.error(error.message);
            return;
        }

        if (data) {
            setProfile({
                id: data.id,
                public_link: data.public_link,
                display_name: data.display_name || "",
                bio: data.bio || "",
                avatar_url: data.avatar_url,
                theme_id: data.theme_id || "default",
                background_color: data.background_color || "#F8FAFC",
                text_color: data.text_color || "#0F172A",
                button_color: data.button_color || "#6366F1",
                avatar_radius: data.avatar_radius || 1,
                button_radius: data.button_radius || 1,
            });

            const { data: linksData } = await supabase
                .from("links")
                .select("id, title, url, order_index")
                .eq("public_id", data.id)
                .order("order_index", { ascending: true });

            if (linksData) {
                setLinks(
                    linksData.map((link) => ({
                        id: link.id.toString(),
                        title: link.title,
                        url: link.url,
                    }))
                );
            }

            const { data: layoutData } = await supabase
                .from("layout")
                .select("id, order_index, components")
                .eq("public_id", data.id)
                .order("order_index", { ascending: true });

            if (layoutData && layoutData.length > 0) {
                const loadedBlocks = layoutData
                    .map((c: any) => {
                        const blockId = c.components as BlockType;
                        return DEFAULT_LAYOUT_BLOCKS.find((b) => b.id === blockId) ?? null;
                    })
                    .filter((b: LayoutBlock | null): b is LayoutBlock => b !== null);

                if (loadedBlocks.length > 0) setLayoutBlocks(loadedBlocks);
            }
        }

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <button className="flex items-center gap-2.5 w-full px-2 py-1.5 text-sm rounded-md hover:bg-slate-100">
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                        Switch LinkHubs
                    </button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden">
                <DialogHeader className="px-6 pt-6 pb-2">
                    <DialogTitle className="text-center text-base font-semibold">
                        Switch LinkHubs
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col px-4 pb-4 gap-1 max-h-[400px] overflow-y-auto">
                    {loading ? (
                        <div className="text-center py-8 text-sm text-slate-400">
                            Loading...
                        </div>
                    ) : (
                        profiles.map((p) => {
                            const isActive = p.id === profile?.id;
                            const initials = p.display_name
                                ? p.display_name.slice(0, 2).toUpperCase()
                                : "U";

                            return (
                                <button
                                    key={p.id}
                                    onClick={() => handleSwitch(p.id)}
                                    className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl transition-colors text-left
                                        ${isActive
                                            ? "bg-indigo-50 ring-2 ring-[#6366F1]"
                                            : "hover:bg-slate-50"
                                        }`}
                                >
                                    {/* Avatar */}
                                    <Avatar
                                        className={`w-11 h-11 shrink-0 ${isActive ? "ring-2 ring-[#6366F1] ring-offset-1" : ""
                                            }`}
                                    >
                                        <AvatarImage src={p.avatar_url || undefined} />
                                        <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold text-sm">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Info */}
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-semibold text-slate-800 truncate">
                                            @{p.display_name || p.public_link}
                                        </span>
                                        <span className="text-xs text-slate-400 truncate">
                                            linkhub.id/{p.public_link}
                                        </span>
                                    </div>

                                    {/* Right side */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-xs border border-slate-300 text-slate-500 rounded px-2 py-0.5">
                                            Free
                                        </span>
                                        {isActive && <Check className="w-4 h-4 text-[#6366F1]" />}
                                    </div>
                                </button>
                            );
                        })
                    )}

                    {/* Divider */}
                    <div className="border-t my-2" />

                    {/* Create New — reuses AddLinkHub */}
                    <AddLinkHub
                        trigger={
                            <button className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left">
                                <div className="w-11 h-11 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
                                    <Plus className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="text-sm font-medium text-slate-600">
                                    Create New LinkHub
                                </span>
                            </button>
                        }
                        onCreated={() => {
                            setOpen(false);
                        }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
