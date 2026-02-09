// components/DashboardHeader.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { LogoutButton } from '@/components/logout-button';
import { ProfileDialog } from './ProfileDialog';
import { Profile } from '@/types';
import QRModal from './QRModal';

interface DashboardHeaderProps {
  profile: Profile;
  onUpdateProfile: (e: React.FormEvent) => Promise<void> | void;
  isUpdating: boolean;
  previewUrl: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileChange: (profile: Profile) => void;
}

export function DashboardHeader({
  profile,
  onUpdateProfile,
  isUpdating,
  previewUrl,
  fileInputRef,
  onFileChange,
  onProfileChange
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // Determine active tab based on current path
  const isLinksActive = pathname === '/dashboard';
  const isAppearanceActive = pathname === '/dashboard/appearance';
  const isAnalyticsActive = pathname === '/dashboard/analytics';

  // Construct the public URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/${profile.username || ''}`;

  return (
    <nav className="border-b bg-white px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <Link href="/dashboard">
          <h1 className="text-xl font-bold text-[#4F46E5] cursor-pointer hover:text-[#4338CA] transition-colors">
            LinkHub
          </h1>
        </Link>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
          <Link href="/dashboard">
            <span className={`pb-4 mt-4 cursor-pointer transition-colors ${isLinksActive
              ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
              : 'hover:text-slate-800'
              }`}>
              Links
            </span>
          </Link>
          <Link href="/dashboard/appearance">
            <span className={`pb-4 mt-4 cursor-pointer transition-colors ${isAppearanceActive
              ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
              : 'hover:text-slate-800'
              }`}>
              Appearance
            </span>
          </Link>
          <Link href="/dashboard/analytics">
            <span className={`pb-4 mt-4 cursor-pointer transition-colors ${isAnalyticsActive
              ? 'text-[#4F46E5] border-b-2 border-[#4F46E5]'
              : 'hover:text-slate-800'
              }`}>
              Analytics
            </span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-full" onClick={() => setIsQRModalOpen(true)}>
          <Share2 className="w-4 h-4 mr-2" /> Share
        </Button>
        <LogoutButton />

        <ProfileDialog
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          isUpdating={isUpdating}
          previewUrl={previewUrl}
          fileInputRef={fileInputRef}
          onFileChange={onFileChange}
          onProfileChange={onProfileChange}
        />

        {/* The QR Modal */}
        <QRModal
          open={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          url={shareUrl}
        />

      </div>
    </nav>
  );
}