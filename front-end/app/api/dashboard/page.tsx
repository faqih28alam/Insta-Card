"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, GripVertical, Trash2, BarChart3, User, Globe, Share2 } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
// import { createClient } from "@/lib/supabase/server";

// export default async function DashboardPage() {
export default function DashboardPage() {
    // const supabase = await createClient();
    // // You can also use getUser() which will be slower.
    // const { data } = await supabase.auth.getClaims();
    // const user = data?.claims;

    const [links, setLinks] = useState([
        { id: "1", title: "Instagram", url: "https://instagram.com/username" },
        { id: "2", title: "Portofolio", url: "https://mywork.com" },
    ]);

    // Frontend logic to handle Delete
    const handleDelete = async (id: string) => {
        try {
            // Connect to your backend dev's route
            const response = await fetch(`/api/v1/user/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ linkId: id }),
            });

            if (response.ok) {
                setLinks(links.filter((link) => link.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete link", error);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* 1. Header Navigation */}
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
                    <div className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center border border-[#6366F1]">
                        <User className="w-5 h-5 text-[#6366F1]" />
                    </div>
                </div>
            </nav>

            {/* 2. Main Content Layout */}
            <main className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 p-6">

                {/* Editor Side (Left) */}
                <div className="flex-1 space-y-6">
                    <Button className="w-full py-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl shadow-md text-lg font-semibold">
                        <Plus className="mr-2 h-5 w-5" /> Add New Link
                    </Button>

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
                                                defaultValue={link.title}
                                                className="h-7 font-bold text-[#0F172A] border-none p-0 focus-visible:ring-0 text-base"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                defaultValue={link.url}
                                                className="h-5 text-[#475569] border-none p-0 focus-visible:ring-0 text-sm italic"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(link.id)}
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
                            <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 shadow-inner" />
                            <h3 className="font-bold text-[#0F172A]">@username</h3>
                            <p className="text-xs text-slate-500 mb-8">Bio description here...</p>

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