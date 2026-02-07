// components/DashboardHeader.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { LogoutButton } from '@/components/logout-button';
import { ProfileDialog } from './ProfileDialog';
import { Profile } from '@/types';

interface DashboardHeaderProps {
  profile: Profile;
  onUpdateProfile: (e: React.FormEvent) => Promise<void> | void;
  isUpdating: boolean;
  previewUrl: string;
  fileInputRef: React.RefObject<HTMLInputElement>;  // ← No "| null" here!
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
  return (
    <nav className="border-b bg-white px-6 py-3 flex justify-between items-center sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <h1 className="text-xl font-bold text-[#4F46E5]">LinkHub</h1>
        <div className="hidden md:flex gap-6 text-sm font-medium text-slate-500">
          <span className="text-[#4F46E5] border-b-2 border-[#4F46E5] pb-4 mt-4">
            Links
          </span>
          <span className="hover:text-slate-800 cursor-pointer pb-4 mt-4">
            Appearance
          </span>
          <span className="hover:text-slate-800 cursor-pointer pb-4 mt-4">
            Analytics
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="rounded-full">
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
      </div>
    </nav>
  );
}
