"use client";

import { createContext, useContext, useState } from "react";
import { Link, Profile } from "@/types";
import {
  LayoutBlock,
  DEFAULT_LAYOUT_BLOCKS,
} from "@/components/dashboard/LayoutCustomizer";

type ProfileContextType = {
  profile: Profile | null;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;

  initialized: boolean;
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>;

  layoutBlocks: LayoutBlock[];
  setLayoutBlocks: React.Dispatch<React.SetStateAction<LayoutBlock[]>>;

  links: Link[];
  setLinks: (links: Link[] | ((prev: Link[]) => Link[])) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [layoutBlocks, setLayoutBlocks] = useState<LayoutBlock[]>(
    DEFAULT_LAYOUT_BLOCKS
  );
  const [links, setLinks] = useState<Link[]>([]);
  const [initialized, setInitialized] = useState(false);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        setProfile,
        initialized,
        setInitialized,
        layoutBlocks,
        setLayoutBlocks,
        links,
        setLinks,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
