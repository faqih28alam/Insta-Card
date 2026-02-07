// components/PhonePreview.tsx
import React from 'react';
import { Globe } from 'lucide-react';
import { Link, Profile } from '@/types';

interface PhonePreviewProps {
  profile: Profile;
  links: Link[];
}

export function PhonePreview({ profile, links }: PhonePreviewProps) {
  return (
    <div className="hidden lg:block w-[320px] sticky top-24 h-fit">
      <div className="relative border-[12px] border-[#0F172A] rounded-[3rem] aspect-[9/19] bg-white shadow-2xl overflow-hidden">
        {/* Phone Screen Content */}
        <div className="p-6 flex flex-col items-center h-full">
          {/* PREVIEW AVATAR */}
          <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 shadow-inner overflow-hidden border border-slate-100">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <h3 className="font-bold text-[#0F172A]">@{profile.username}</h3>
          <p className="text-[11px] text-slate-500 mb-8 text-center px-4">
            {profile.bio}
          </p>

          <div className="w-full space-y-3 overflow-y-auto">
            {links.map((link) => (
              <div
                key={link.id}
                className="w-full py-3 px-4 rounded-full bg-[#6366F1] text-white text-[13px] font-medium text-center shadow-sm"
              >
                {link.title}
              </div>
            ))}
          </div>

          <div className="mt-auto pt-4 flex items-center gap-1 opacity-40">
            <Globe className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-widest uppercase">
              LinkHub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
