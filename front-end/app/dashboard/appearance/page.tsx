"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PhonePreview } from "@/components/PhonePreview";
import { Check } from "lucide-react";
import { Profile, Link } from "@/types";
import { useRouter } from "next/navigation";

interface Theme {
  id: string;
  name: string;
  description: string;
  background_color: string;
  text_color: string;
  button_color: string;
}

const THEMES: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "Classic and professional",
    background_color: "#F8FAFC",
    text_color: "#0F172A",
    button_color: "#6366F1",
  },
  {
    id: "light",
    name: "Light",
    description: "Clean and minimal",
    background_color: "#FFFFFF",
    text_color: "#1F2937",
    button_color: "#10B981",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Modern and sleek",
    background_color: "#1F2937",
    text_color: "#F9FAFB",
    button_color: "#F59E0B",
  },
];

export default function AppearancePage() {
  const supabase = createClient();
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<Profile>({
    username: "username",
    bio: "My bio is empty",
    avatar: "",
  });
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<string>("default");
  const [token, setToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // For profile dialog (reusing DashboardHeader)
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null!);

  // Fetch session token
  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/auth/login");
      }
      const token = data.session?.access_token;
      setToken(token || "");
    };
    fetchSession();
  }, [router, supabase]);

  // Fetch user data
  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error?.message);
        return;
      }

      // Fetch profile from database
      const { data: profileData } = await supabase
        .from("profiles")
        .select("username, bio, avatar_url, theme_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profileData) {
        setProfile({
          username: profileData.username || "username",
          bio: profileData.bio || "My bio is empty",
          avatar: profileData.avatar_url || "",
        });
        setPreviewUrl(profileData.avatar_url || "");

        // Set selected theme from database
        setSelectedTheme(profileData.theme_id || "default");
      }

      // Fetch links
      const { data: linksData } = await supabase
        .from("links")
        .select("id, title, url, order_index")
        .eq("user_id", user.id)
        .order("order_index", { ascending: true });

      if (linksData) {
        setLinks(
          linksData.map((link) => ({
            id: link.id.toString(),
            title: link.title,
            url: link.url,
          })),
        );
      }
    };

    getUserData();
  }, [supabase]);

  // Handle file change for avatar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Handle profile update (from header)
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
        if (result.data && result.data.avatar_url) {
          setProfile((prev) => ({ ...prev, avatar: result.data.avatar_url }));
          setPreviewUrl(result.data.avatar_url);
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

  // Handle theme selection and auto-save
  const handleThemeSelect = async (themeId: string) => {
    const selectedThemeData = THEMES.find((t) => t.id === themeId);
    if (!selectedThemeData) return;

    const payload = {
      theme_id: themeId,
      background_color: selectedThemeData.background_color,
      text_color: selectedThemeData.text_color,
      button_color: selectedThemeData.button_color,
    };

    // DEBUG: See what front-end is sending
    console.log("Sending to Backend:", payload);

    setSelectedTheme(themeId);
    setIsSaving(true);

    try {
      // Backend endpoint for theme update
      const response = await apiFetch("/api/v1/user/theme", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // DEBUG: Check console for response content
      console.log("Raw Payload:", JSON.stringify(payload, null, 2));

      if (!response.ok) {
        alert("Failed to save theme");
        console.log("Failed to save theme");
        // Revert selection on failure
        setSelectedTheme(selectedTheme);
      } else {
        // Optional: Success feedback
        console.log("Theme saved successfully!");
        alert("Theme saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save theme:", error);
      alert("Failed to save theme");
      // Revert selection on failure
      setSelectedTheme(selectedTheme);
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  // Get current theme colors for preview
  const getCurrentTheme = () => {
    return THEMES.find((t) => t.id === selectedTheme) || THEMES[0];
  };

  const currentTheme = getCurrentTheme();

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
        {/* Left Side - Theme Selection */}
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2">
              Appearance
            </h2>
            <p className="text-slate-600">
              Customize how your profile looks to visitors
            </p>
          </div>

          {/* Theme Templates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0F172A]">
              Choose a Theme
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  disabled={isSaving}
                  className={`relative p-6 rounded-xl border-2 transition-all ${
                    selectedTheme === theme.id
                      ? "border-[#6366F1] bg-[#EEF2FF] shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow"
                  } ${
                    isSaving
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {/* Checkmark for selected theme */}
                  {selectedTheme === theme.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-[#6366F1] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  {/* Theme Name */}
                  <div className="text-left mb-4">
                    <h4 className="text-lg font-bold text-[#0F172A] mb-1">
                      {theme.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {theme.description}
                    </p>
                  </div>

                  {/* Theme Preview */}
                  <div
                    className="w-full h-40 rounded-lg overflow-hidden"
                    style={{ backgroundColor: theme.background_color }}
                  >
                    <div className="p-4 space-y-2.5">
                      {/* Avatar placeholder */}
                      <div
                        className="w-12 h-12 rounded-full mx-auto"
                        style={{
                          backgroundColor:
                            theme.id === "dark" ? "#374151" : "#E5E7EB",
                        }}
                      />
                      {/* Username */}
                      <div
                        className="text-xs font-bold text-center"
                        style={{ color: theme.text_color }}
                      >
                        @username
                      </div>
                      {/* Bio */}
                      <div
                        className="text-[9px] text-center opacity-60"
                        style={{ color: theme.text_color }}
                      >
                        Your bio here
                      </div>
                      {/* Link buttons */}
                      <div className="space-y-1.5">
                        <div
                          className="w-full py-2 rounded-full text-[10px] font-medium text-white text-center"
                          style={{ backgroundColor: theme.button_color }}
                        >
                          Link 1
                        </div>
                        <div
                          className="w-full py-2 rounded-full text-[10px] font-medium text-white text-center"
                          style={{ backgroundColor: theme.button_color }}
                        >
                          Link 2
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Save indicator */}
          {isSaving && (
            <div className="flex items-center gap-2 text-[#6366F1] bg-[#EEF2FF] px-4 py-3 rounded-lg">
              <div className="w-4 h-4 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Saving theme...</span>
            </div>
          )}

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Theme changes are saved automatically and
              will appear on your public profile immediately!
            </p>
          </div>
        </div>

        {/* Right Side - Live Preview using PhonePreview component */}
        <div className="lg:w-[320px]">
          <div className="sticky top-24 space-y-4">
            {/* Using the existing PhonePreview component with theme colors */}
            <PhonePreview
              profile={profile}
              links={links}
              theme={{
                background_color: currentTheme.background_color,
                text_color: currentTheme.text_color,
                button_color: currentTheme.button_color,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
