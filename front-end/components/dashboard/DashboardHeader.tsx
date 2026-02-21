// components/DashboardHeader.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Share2,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Palette,
  BarChart2,
  LogOut,
  ExternalLink,
  Settings2
} from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import QRModal from "../public-page/QRModal";
import { useProfile } from "@/hooks/useProfile";
import { ProfileDialog } from "./ProfileDialog";

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const { profile } = useProfile();

  if (!profile) return null;

  const isLinksActive = pathname === "/dashboard";
  const isAppearanceActive = pathname === "/dashboard/appearance";
  const isAnalyticsActive = pathname === "/dashboard/analytics";

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/${profile.public_link || ""}`;

  const navLinks = [
    {
      href: "/dashboard",
      label: "Links",
      icon: <LayoutDashboard className="w-4 h-4" />,
      isActive: isLinksActive,
    },
    {
      href: "/dashboard/appearance",
      label: "Appearance",
      icon: <Palette className="w-4 h-4" />,
      isActive: isAppearanceActive,
    },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      icon: <BarChart2 className="w-4 h-4" />,
      isActive: isAnalyticsActive,
    },
  ];

  const initials = profile.display_name
    ? profile.display_name.slice(0, 2).toUpperCase()
    : "U";

  return (
    <nav className="border-b bg-white px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      {/* Left: Logo + Desktop Nav Tabs */}
      <div className="flex items-center gap-8">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors">
            LinkHub
          </h1>
        </Link>

        {/* Desktop Nav Tabs — hidden on mobile */}
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
          {navLinks.map(({ href, label, isActive }) => (
            <Link key={href} href={href}>
              <span
                className={`pb-4 mt-4 inline-block cursor-pointer transition-colors ${isActive
                  ? "text-[#4F46E5] border-b-2 border-[#4F46E5]"
                  : "hover:text-slate-800"
                  }`}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          className="rounded-full hidden sm:flex"
          onClick={() => setIsQRModalOpen(true)}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        {/* Bell Icon */}
        <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-slate-800">
          <Bell className="w-5 h-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-slate-100 transition-colors focus:outline-none">
              <Avatar className="w-7 h-7">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name || "User"} />
                <AvatarFallback className="text-xs bg-indigo-100 text-indigo-600 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-slate-700 hidden sm:block max-w-[120px] truncate">
                {profile.display_name || profile.public_link}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56 p-1.5">
            {/* Profile Info Header */}
            <div className="flex items-center gap-3 px-2 py-2.5 mb-1">
              <Avatar className="w-9 h-9">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name || "User"} />
                <AvatarFallback className="text-sm bg-indigo-100 text-indigo-600 font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-800 truncate">
                  {profile.display_name || "Your Name"}
                </span>
                <span className="text-xs text-slate-400 truncate">
                  {baseUrl}/{profile.public_link}
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Mobile-only Nav Links */}
            <div className="md:hidden">
              {navLinks.map(({ href, label, icon, isActive }) => (
                <DropdownMenuItem
                  key={href}
                  onClick={() => router.push(href)}
                  className={`flex items-center gap-2.5 cursor-pointer rounded-md my-0.5 ${isActive ? "text-[#4F46E5] bg-indigo-50 font-medium" : ""
                    }`}
                >
                  {icon}
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>

            {/* Share on mobile */}
            <DropdownMenuItem
              className="sm:hidden flex items-center gap-2.5 cursor-pointer rounded-md"
              onClick={() => setIsQRModalOpen(true)}
            >
              <Share2 className="w-4 h-4" />
              Share
            </DropdownMenuItem>

            {/* View Public Page */}
            <DropdownMenuItem
              onClick={() => window.open(shareUrl, "_blank")}
              className="flex items-center gap-2.5 cursor-pointer rounded-md"
            >
              <ExternalLink className="w-4 h-4" />
              View my page
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Settings */}
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex items-center gap-2.5 cursor-pointer rounded-md p-0"
            >
              <ProfileDialog
                trigger={
                  <div className="flex items-center gap-2.5 w-full px-2 py-1.5">
                    <Settings2 className="w-4 h-4" />
                    Settings
                  </div>
                }
              />
            </DropdownMenuItem>

            {/* Logout */}
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex items-center gap-2.5 cursor-pointer rounded-md p-0"
            >
              <div className="flex items-center gap-2.5 w-full px-2 py-1.5">
                <LogOut className="w-4 h-4 shrink-0" />
                <LogoutButton />
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <QRModal
        open={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        url={shareUrl}
      />
    </nav>
  );
}