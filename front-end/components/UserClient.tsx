"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Globe } from "lucide-react";
import { publicFetch } from "@/lib/api";

interface Link {
  id: string;
  title: string;
  url: string;
  order_index: number;
}

interface Profile {
  username: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  background_color?: string;
  text_color?: string;
  button_color?: string;
}

interface ProfileData {
  profile: Profile;
  links: Link[];
}

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await publicFetch(`/api/v1/user/${username}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError("Failed to load profile");
          }
          setLoading(false);
          return;
        }

        const result = await response.json();
        setData(result.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username]);

  const handleLinkClick = async (linkId: string, url: string) => {
    // Track click analytics (optional)
    try {
      await publicFetch(`/api/v1/links/${linkId}/click`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to track click:", err);
    }

    // Open link in new tab
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">404</h1>
          <p className="text-xl text-slate-600 mb-8">
            {error || "User not found"}
          </p>
          <a href="/" className="text-[#6366F1] hover:underline">
            Go to homepage
          </a>
        </div>
      </div>
    );
  }

  const { profile, links } = data;
  const backgroundColor = profile.background_color || "#F8FAFC";
  const textColor = profile.text_color || "#0F172A";
  const buttonColor = profile.button_color || "#6366F1";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor }}
    >
      <div className="w-full max-w-[680px]">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 shadow-lg overflow-hidden border-4 border-white">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-bold"
                style={{ color: textColor }}
              >
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Username */}
          <h1 className="text-2xl font-bold mb-2" style={{ color: textColor }}>
            @{profile.username}
          </h1>

          {/* Display Name (if different from username) */}
          {profile.display_name &&
            profile.display_name !== profile.username && (
              <p
                className="text-lg mb-2"
                style={{ color: textColor, opacity: 0.8 }}
              >
                {profile.display_name}
              </p>
            )}

          {/* Bio */}
          {profile.bio && (
            <p
              className="text-center max-w-md px-4"
              style={{ color: textColor, opacity: 0.7 }}
            >
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4 mb-12">
          {links.length === 0 ? (
            <p
              className="text-center py-8"
              style={{ color: textColor, opacity: 0.5 }}
            >
              No links yet
            </p>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.id, link.url)}
                className="w-full py-4 px-6 rounded-full font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                style={{ backgroundColor: buttonColor }}
              >
                {link.title}
              </button>
            ))
          )}
        </div>

        {/* LinkHub Branding */}
        <div className="flex items-center justify-center gap-2 opacity-40">
          <Globe className="w-4 h-4" style={{ color: textColor }} />
          <span
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: textColor }}
          >
            LinkHub
          </span>
        </div>
      </div>
    </div>
  );
}
