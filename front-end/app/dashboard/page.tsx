"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { DashboardHeader } from "@/components/DashboardHeader";
import { LinkEditor } from "@/components/LinkEditor";
import { PhonePreview } from "@/components/PhonePreview";
import { Link, Profile } from "@/types";
import { useRouter } from "next/navigation";

// ✅ Created once outside component — stable reference, won't trigger useEffect re-runs
const supabase = createClient();

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile>({
    public_link: "",
    display_name: "",
    bio: "",
    avatar_url: "",
  });
  const [publicId, setPublicId] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState<Link>({ id: "", title: "", url: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [token, setToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  // ✅ MOVED UP: Hook must be declared before any useEffect that calls setLinks
  const { links, setLinks, sensors, handleDragEnd } = useDragAndDrop({
    onReorder: async (newLinks) => {
      try {
        await apiFetch("/api/v1/links/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: publicId,
            links: newLinks.map((link, index) => ({
              id: link.id,
              order_index: index,
            })),
          }),
        });
      } catch (error) {
        console.error("Failed to save new order:", error);
      }
    },
  });

  // Clean url from facebook redirect
  useEffect(() => {
    if (window.location.hash === "#_=_") {
      history.replaceState
        ? history.replaceState(null, "", window.location.href.split("#")[0])
        : (window.location.hash = "");
    }
  }, []);

  // Fetch session token
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

  // Fetch user data on mount
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Error fetching user:", error?.message);
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, public_link, display_name, bio, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileData) {
        // No profile → create via OAuth endpoint
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

        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setProfile({
              public_link: result.data.public_link,
              display_name: result.data.display_name,
              bio: "",
              avatar_url: "",
            });
            setPublicId(result.data.id);
          }
        } else {
          const err = await response.json();
          console.error("OAuth profile create failed:", err);
        }
        return;
      }

      // Profile exists — set all state
      setProfile({
        public_link: profileData.public_link || "",
        display_name: profileData.display_name || "",
        bio: profileData.bio || "",
        avatar_url: profileData.avatar_url || "",
      });
      setPublicId(profileData.id);
      setPreviewUrl(profileData.avatar_url || "");

      // Fetch links using profiles.id as public_id
      const { data: linksData } = await supabase
        .from("links")
        .select("id, title, url, order_index")
        .eq("public_id", profileData.id)
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
    };

    getUserData();
  }, []); // ✅ Empty array: only runs once on mount

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

    try {
      const formData = new FormData();
      formData.append("public_id", publicId);
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
        if (result.data?.avatar_url) {
          setProfile((prev) => ({ ...prev, avatar_url: result.data.avatar_url }));
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

  // Handle adding a new link
  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newLink.title.trim() || !newLink.url.trim()) {
      alert("Please fill in both title and URL");
      return;
    }

    try {
      const response = await apiFetch("/api/v1/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: publicId,        // profiles.id → maps to links.public_id
          title: newLink.title,
          url: newLink.url,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === "success") {
        setLinks((prevLinks) => [...prevLinks, result.data]);
        setNewLink({ id: "", title: "", url: "" });
        setIsAddDialogOpen(false);
      } else {
        throw new Error(result.message || "Failed to add link");
      }
    } catch (error: any) {
      console.error("Failed to add link", error);
      alert(error.message || "Failed to add link. Please try again.");
    }
  };

  // Handle updating a link
  const handleUpdateLink = (id: string, field: "title" | "url", value: string) => {
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link))
    );

    const key = `${id}-${field}`;
    if (debounceTimers.current[key]) clearTimeout(debounceTimers.current[key]);

    debounceTimers.current[key] = setTimeout(() => {
      apiFetch(`/api/v1/links/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
    }, 600);
  };

  // Handle deleting a link
  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await apiFetch(`/api/v1/links/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setLinks(links.filter((link) => link.id !== id));
      } else {
        const error = await response.json();
        alert(error.message || "Failed to delete link");
      }
    } catch (error) {
      console.error("Failed to delete link", error);
      alert("Failed to delete link. Please try again.");
    }
  };

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
        <LinkEditor
          links={links}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          isAddDialogOpen={isAddDialogOpen}
          onAddDialogChange={setIsAddDialogOpen}
          newLink={newLink}
          onNewLinkChange={setNewLink}
          onAddLink={handleAddLink}
          onUpdateLink={handleUpdateLink}
          onDeleteLink={handleDeleteLink}
        />

        <PhonePreview profile={profile} links={links} />
      </main>
    </div>
  );
}