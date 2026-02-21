"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { apiFetch } from "@/lib/api";
import {
  LayoutBlock,
  BlockType,
  DEFAULT_LAYOUT_BLOCKS,
} from "@/components/dashboard/LayoutCustomizer";

export default function Initializer() {
  const supabase = createClient();
  const router = useRouter();
  const { setProfile, setLayoutBlocks, setLinks, setInitialized } =
    useProfile();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/auth/login");
    };
    fetchSession();
  }, []);

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

      const { data: profileData } = await supabase
        .from("profiles")
        .select(
          "id, public_link, display_name, bio, avatar_url, theme_id, background_color, text_color, button_color, avatar_radius, button_radius"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      let activeProfile = profileData;

      if (!activeProfile) {
        const meta = user.user_metadata || {};
        const newProfile = {
          user_id: user.id,
          public_link:
            meta.user_name ||
            meta.preferred_username ||
            meta.name ||
            meta.full_name ||
            `user_${user.id.slice(0, 8)}`,
          display_name: meta.full_name || meta.name || "New User",
        };

        const response = await apiFetch("/api/v1/profile/oauth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newProfile),
        });

        if (!response.ok) {
          const err = await response.json();
          console.error("OAuth profile create failed:", err);
          return;
        }

        const result = await response.json();
        activeProfile = result.data;
      }

      if (!activeProfile) return;

      setProfile({
        id: activeProfile.id,
        public_link: activeProfile.public_link,
        display_name: activeProfile.display_name || "",
        bio: activeProfile.bio || "",
        avatar_url: activeProfile.avatar_url,
        theme_id: activeProfile.theme_id || "default",
        background_color: activeProfile.background_color || "#F8FAFC",
        text_color: activeProfile.text_color || "#0F172A",
        button_color: activeProfile.button_color || "#6366F1",
        avatar_radius: activeProfile.avatar_radius || 1,
        button_radius: activeProfile.button_radius || 1,
      });

      const { data: linksData } = await supabase
        .from("links")
        .select("id, title, url, order_index")
        .eq("public_id", activeProfile.id)
        .order("order_index", { ascending: true });

      if (linksData) {
        // ✅ setLinks is now available — hook is declared above
        setLinks(
          linksData.map((link) => ({
            id: link.id.toString(),
            title: link.title,
            url: link.url,
          }))
        );
      }

      const { data: layoutData } = await supabase
        .from("layout")
        .select("id, order_index, components")
        .eq("public_id", activeProfile.id)
        .order("order_index", { ascending: true });

      if (layoutData && layoutData.length > 0) {
        const loadedBlocks = layoutData
          .map((c: any) => {
            const blockId = c.components as BlockType;
            return DEFAULT_LAYOUT_BLOCKS.find((b) => b.id === blockId) ?? null;
          })
          .filter((b: LayoutBlock | null): b is LayoutBlock => b !== null);

        if (loadedBlocks.length > 0) setLayoutBlocks(loadedBlocks);
      }

      setInitialized(true);
    };

    getUserData();
  }, []);

  return null;
}
