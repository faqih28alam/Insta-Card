// components/PhonePreview.tsx
import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { Link, Profile } from '@/types';

interface PhonePreviewProps {
  profile: Profile;
  links: Link[];
  theme?: {
    background_color?: string;
    text_color?: string;
    button_color?: string;
  };
}

export function PhonePreview({ profile, links, theme }: PhonePreviewProps) {
  const backgroundColor = theme?.background_color || '#F8FAFC';
  const textColor = theme?.text_color || '#0F172A';
  const buttonColor = theme?.button_color || '#6366F1';

  const handleClick = () => {
    const url = `${window.location.origin}/${profile.public_link}`;
    window.open(url, '_blank');
  };

  return (
    <div className="hidden lg:block w-[320px] sticky top-24 h-fit">
      <div className="mb-2 text-center">
        <button
          onClick={handleClick}
          className="text-xs text-slate-500 hover:text-[#6366F1] transition-colors flex items-center gap-1 mx-auto group"
        >
          <ExternalLink className="w-3 h-3" />
          <span>Click preview to view public page</span>
        </button>
      </div>

      <button
        onClick={handleClick}
        className="relative border-[12px] border-[#0F172A] rounded-[3rem] aspect-[9/19] bg-white shadow-2xl overflow-hidden w-full hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
      >
        <div className="absolute inset-0 bg-[#6366F1]/5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />

        <div
          className="p-6 flex flex-col items-center h-full overflow-y-auto relative"
          style={{ backgroundColor }}
        >
          {/* Avatar */}
          <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 shadow-inner overflow-hidden border border-slate-100">

            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-2xl font-bold"
                style={{ color: textColor }}
              >

                {profile.public_link?.charAt(0).toUpperCase() ?? "U"}
              </div>
            )}
          </div>

          {/* Public link */}
          <h3 className="font-bold mb-1" style={{ color: textColor }}>
            @{profile.public_link}
          </h3>

          {profile.display_name && (
            <p
              className="text-[12px] mb-1"
              style={{ color: textColor, opacity: 0.8 }}
            >
              {profile.display_name}
            </p>
          )}

          {/* Bio */}
          {profile.bio && (
            <p
              className="text-[11px] mb-8 text-center px-4"
              style={{ color: textColor, opacity: 0.7 }}
            >
              {profile.bio}
            </p>
          )}

          {/* Links */}
          <div className="w-full space-y-3 overflow-y-auto flex-1">
            {links.length === 0 ? (
              <p
                className="text-[11px] text-center py-4"
                style={{ color: textColor, opacity: 0.4 }}
              >
                No links yet
              </p>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="w-full py-3 px-4 rounded-full text-white text-[13px] font-medium text-center shadow-sm"
                  style={{ backgroundColor: buttonColor }}
                >
                  {link.title}
                </div>
              ))
            )}
          </div>

          {/* Branding */}
          <div className="mt-auto pt-4 flex items-center gap-1 opacity-40">
            <Globe className="w-3 h-3" style={{ color: textColor }} />
            <span
              className="text-[10px] font-bold tracking-widest uppercase"
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