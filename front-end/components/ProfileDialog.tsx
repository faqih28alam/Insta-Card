// components/ProfileDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { User, Camera } from 'lucide-react';
import { Profile } from '@/types';

interface ProfileDialogProps {
  profile: Profile;
  onUpdateProfile: (e: React.FormEvent) => Promise<void> | void;
  isUpdating: boolean;
  previewUrl: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProfileChange: (profile: Profile) => void;
}

export function ProfileDialog({ 
  profile, 
  onUpdateProfile,
  isUpdating,
  previewUrl,
  fileInputRef,
  onFileChange,
  onProfileChange
}: ProfileDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center border border-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-colors group">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-[#6366F1]" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={onUpdateProfile}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Suit your Profile here</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              className="hidden"
              accept="image/*"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 bg-slate-100 rounded-full border flex items-center justify-center cursor-pointer hover:bg-slate-200 group overflow-hidden"
            >
              {previewUrl || profile.avatar ? (
                <img
                  src={previewUrl || profile.avatar}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
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
                onChange={(e) =>
                  onProfileChange({ ...profile, username: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={profile.bio}
                onChange={(e) =>
                  onProfileChange({ ...profile, bio: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-[#6366F1] hover:bg-[#4F46E5]"
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
