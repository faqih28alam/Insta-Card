// components/PhonePreview.tsx

"use client";

import { Globe, ExternalLink } from "lucide-react";
import {
  LayoutBlock,
} from "@/components/dashboard/LayoutCustomizer";
import { useProfile } from "@/hooks/useProfile";

const alignClass: Record<string, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

export function PhonePreview() {

  const { profile, links, layoutBlocks } = useProfile();

  if (!profile || !links || !layoutBlocks) return null;

  const backgroundColor = profile.background_color || "#F8FAFC";
  const textColor = profile.text_color || "#0F172A";
  const buttonColor = profile.button_color || "#6366F1";
  const avatarRadius = profile.avatar_radius;
  const buttonRadius = profile.button_radius;
  const layout = layoutBlocks;

  const handleClick = () => {
    const url = `${window.location.origin}/${profile.public_link}`;
    window.open(url, "_blank");
  };

  // Render each block according to layout order + visibility
  const renderBlock = (block: LayoutBlock) => {
    if (!block.visible) return null;
    const align = alignClass[block.align] ?? alignClass.center;

    switch (block.id) {
      case "avatar":
        return (
          <div key="avatar" className="flex justify-center w-full mb-3">
            <div
              className="w-16 h-16 bg-slate-200 shadow-inner overflow-hidden border-2 border-white/60 flex-shrink-0"
              style={{ borderRadius: avatarRadius }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-xl font-bold"
                  style={{ color: textColor, borderRadius: avatarRadius }}
                >
                  {profile.public_link?.charAt(0).toUpperCase() ?? "U"}
                </div>
              )}
            </div>
          </div>
        );

      case "display_name":
        return profile.display_name ? (
          <div
            key="display_name"
            className={`flex flex-col w-full mb-0.5 ${align}`}
          >
            <span
              className="text-[13px] font-bold"
              style={{ color: textColor }}
            >
              {profile.display_name}
            </span>
          </div>
        ) : null;

      case "public_link":
        return (
          <div
            key="public_link"
            className={`flex flex-col w-full mb-2 ${align}`}
          >
            <span
              className="text-[11px] font-semibold"
              style={{ color: textColor, opacity: 0.6 }}
            >
              @{profile.public_link}
            </span>
          </div>
        );

      case "bio":
        return profile.bio ? (
          <div key="bio" className={`flex flex-col w-full mb-4 px-2 ${align}`}>
            <span
              className="text-[10px] leading-relaxed"
              style={{ color: textColor, opacity: 0.65 }}
            >
              {profile.bio}
            </span>
          </div>
        ) : null;

      case "links":
        return (
          <div key="links" className="w-full space-y-2 mb-4">
            {links.length === 0 ? (
              <p
                className="text-[10px] text-center py-3"
                style={{ color: textColor, opacity: 0.35 }}
              >
                No links yet
              </p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="w-full py-2.5 px-4 text-white text-[11px] font-semibold text-center shadow-sm"
                  style={{
                    backgroundColor: buttonColor,
                    borderRadius: buttonRadius,
                  }}
                >
                  {link.title}
                </div>
              ))
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="hidden lg:block w-[300px] sticky top-24 h-fit">
      {/* Hint */}
      <div className="mb-2 text-center">
        <button
          onClick={handleClick}
          className="text-xs text-slate-400 hover:text-[#6366F1] transition-colors flex items-center gap-1.5 mx-auto"
        >
          <ExternalLink className="w-3 h-3" />
          Click preview to view public page
        </button>
      </div>

      {/* Phone shell */}
      <button
        onClick={handleClick}
        className="relative border-[10px] border-[#0F172A] rounded-[2.8rem] aspect-[9/19] bg-white shadow-2xl overflow-hidden w-full hover:scale-[1.015] transition-all duration-200 cursor-pointer group"
      >
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-[#6366F1]/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#0F172A] rounded-b-2xl z-20" />

        {/* Screen */}
        <div
          className="h-full pt-6 pb-4 px-4 flex flex-col items-center overflow-y-auto"
          style={{ backgroundColor }}
        >
          {/* Render blocks in order */}
          {layout.map((block) => renderBlock(block))}

          {/* Branding always at bottom */}
          <div className="mt-auto pt-2 flex items-center gap-1 opacity-30">
            <Globe className="w-2.5 h-2.5" style={{ color: textColor }} />
            <span
              className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: textColor }}
            >
              LinkHub
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
