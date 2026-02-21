// components/ProfileDialog.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { User, Camera } from "lucide-react";
// import { Profile } from "@/types";
import { apiFetch, publicFetch } from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// interface ProfileDialogProps {
//   profile: Profile;
//   onUpdateProfile: (e: React.FormEvent) => Promise<void> | void;
//   isUpdating: boolean;
//   previewUrl: string;
//   fileInputRef: React.RefObject<HTMLInputElement>;
//   onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onProfileChange: (profile: Profile) => void;
// }

export function ProfileDialog() {
  //   {
  //   profile,
  //   onUpdateProfile,
  //   isUpdating,
  //   previewUrl,
  //   fileInputRef,
  //   onFileChange,
  //   onProfileChange,
  // }: ProfileDialogProps

  const [publicLink, setPublicLink] = useState("");
  const [available, setAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [token, setToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null!);

  const { profile, setProfile } = useProfile();
  const router = useRouter();
  const supabase = createClient();

  if (!profile) return null;

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/auth/login");
      }
      setToken(data.session?.access_token || "");
    };
    fetchSession();
  }, []);

  useEffect(() => {
    setPublicLink(profile.public_link);

    const timer = setTimeout(() => {
      if (!publicLink) {
        setAvailable(false);
        return;
      }

      if (publicLink.length < 3) {
        setAvailable(false);
        return;
      }

      if (publicLink === profile.public_link) {
        setAvailable(true);
        return;
      }

      const checkPublicLink = async () => {
        try {
          const response = await publicFetch(
            `/api/v1/profile/check/${publicLink}`
          );
          const data = await response.json();
          setAvailable(data.available);
        } catch {
          setAvailable(false);
        }
      };

      checkPublicLink();
    }, 500);

    return () => clearTimeout(timer);
  }, [publicLink, profile]);

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
    if (!profile) return;

    try {
      const formData = new FormData();
      formData.append("public_id", profile.id as string);
      formData.append("public_link", profile.public_link);
      formData.append("display_name", profile.display_name || "");
      formData.append("bio", profile.bio || "");

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const response = await apiFetch("/api/v1/profile/update", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert("Profile updated!");
        if (result.data) {
          setProfile((prev) =>
            prev ? { ...prev, avatar_url: result.data } : prev
          );
          setPreviewUrl(result.data);
        }
      } else {
        alert("Failed to update profile");
      }
    } catch (error: any) {
      console.error("Update failed:", error);
      alert(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-9 h-9 bg-[#EEF2FF] rounded-full flex items-center justify-center border border-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-colors group">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <User className="w-5 h-5 text-[#6366F1]" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleUpdateProfile}>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>Suit your Profile here</DialogDescription>
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
              {previewUrl || profile.avatar_url ? (
                <img
                  src={previewUrl || profile.avatar_url}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="public-link">Public Link</Label>

                <div className="h-4">
                  {publicLink &&
                    (available ? (
                      <span className="text-sm text-green-500">Available</span>
                    ) : (
                      <span className="text-sm text-red-500">Unavailable</span>
                    ))}
                </div>
              </div>

              <Input
                id="public-link"
                value={profile.public_link}
                onChange={(e) => {
                  setProfile({ ...profile, public_link: e.target.value });
                  setPublicLink(e.target.value);
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={profile.bio}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
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
