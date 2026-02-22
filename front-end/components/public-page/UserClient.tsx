// components/UserClient.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Globe, ScanQrCode } from "lucide-react";
import { publicFetch } from "@/lib/api";
import QRModal from "./QRModal";

interface Link {
  id: string;
  title: string;
  url: string;
  order_index: number;
}

interface Profile {
  public_link: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  background_color?: string;
  text_color?: string;
  button_color?: string;
  avatar_radius?: number;
  button_radius?: number;
}

interface LayoutComponent {
  id?: number;
  components: string;
  order_index: number;
}

interface ProfileData {
  profile: Profile;
  links: Link[];
  layout?: LayoutComponent[];
}

export default function UserClient() {
  const params = useParams();
  const public_link = params.public_link as string;

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await publicFetch(`/api/v1/profile/${public_link}`);

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

    if (public_link) {
      fetchProfile();
    }
  }, [public_link]);

  const handleLinkClick = async (linkId: string, url: string) => {
    try {
      await publicFetch(`/api/v1/links/${linkId}/click`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to track click:", err);
    }
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
          <p className="text-xl text-slate-600 mb-8">{error || "User not found"}</p>
          <a href="/" className="text-[#6366F1] hover:underline">Go to homepage</a>
        </div>
      </div>
    );
  }

  const { profile, links, layout } = data;
  const backgroundColor = profile.background_color || "#F8FAFC";
  const textColor = profile.text_color || "#0F172A";
  const buttonColor = profile.button_color || "#6366F1";
  const avatarRadius = profile.avatar_radius ? `${profile.avatar_radius}px` : "9999px";
  const buttonRadius = profile.button_radius ? `${profile.button_radius}px` : "9999px";
  const qrLink = `${window.location.origin}/${profile.public_link}`;

  // Default layout order if not provided by backend
  const defaultOrder = ["avatar", "public_link", "display_name", "bio", "links"];
  const componentOrder = layout && layout.length > 0
    ? layout.sort((a, b) => a.order_index - b.order_index).map(c => c.components)
    : defaultOrder;

  // Render each component based on layout order
  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case "avatar":
        return (
          <div key="avatar" className="w-24 h-24 bg-slate-200 mb-4 shadow-lg overflow-hidden border-4 border-white"
            style={{ borderRadius: avatarRadius }}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.public_link} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ color: textColor }}>
                {profile.public_link.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        );

      case "public_link":
        return (
          <h1 key="public_link" className="text-2xl font-bold mb-2" style={{ color: textColor }}>
            @{profile.public_link}
          </h1>
        );

      case "display_name":
        return profile.display_name ? (
          <p key="display_name" className="text-lg mb-2" style={{ color: textColor, opacity: 0.8 }}>
            {profile.display_name}
          </p>
        ) : null;

      case "bio":
        return profile.bio ? (
          <p key="bio" className="text-center max-w-md px-4 mb-8" style={{ color: textColor, opacity: 0.7 }}>
            {profile.bio}
          </p>
        ) : null;

      case "links":
        return (
          <div key="links" className="space-y-4 mb-12 w-full">
            {links.length === 0 ? (
              <p className="text-center py-8" style={{ color: textColor, opacity: 0.5 }}>No links yet</p>
            ) : (
              links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.id, link.url)}
                  className="w-full py-4 px-6 font-medium text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  style={{ backgroundColor: buttonColor, borderRadius: buttonRadius }}
                >
                  {link.title}
                </button>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor }}>
      <div className="w-full max-w-[680px]">
        <div className="w-full flex justify-end mb-4">
          <button onClick={() => setOpen(true)} style={{ color: textColor }} title="Scan QR Code">
            <ScanQrCode />
          </button>
        </div>

        {/* Render components in custom layout order */}
        <div className="flex flex-col items-center">
          {componentOrder.map((componentName) => renderComponent(componentName))}
        </div>

        {/* Branding */}
        <div className="flex items-center justify-center gap-2 opacity-40 mt-8">
          <Globe className="w-4 h-4" style={{ color: textColor }} />
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: textColor }}>
            LINKHUB
          </span>
        </div>
      </div>

      <QRModal open={open} onClose={() => setOpen(false)} url={qrLink} />
    </div>
  );
}