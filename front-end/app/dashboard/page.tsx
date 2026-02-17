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

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<Profile>({
    public_link: " ",
    display_name: " ",
    bio: " ",
    avatar: "",
  });
  const [publicId, setPublicId] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState<Link>({
    id: "",
    title: "",
    url: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(profile.avatar);
  const [token, setToken] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null!);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

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
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/auth/login");
      }
      const token = data.session?.access_token;
      setToken(token || "");
    };
    fetchSession();
  }, []);

  // Fetch user data on mount
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

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, public_link, display_name, bio, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile) {
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
              bio: "My bio is empty",
              avatar: "",
            });

            setPublicId(result.data.id);
          }
        } else {
          const err = await response.json();
          console.error("OAuth profile create failed:", err);
          return;
        }
      }

      if (profile) {
        setProfile({
          public_link: profile.public_link || "username",
          display_name: profile.display_name || "New User",
          bio: profile.bio || "My bio is empty",
          avatar: profile.avatar_url || "",
        });

        setPublicId(profile.id);
      }
    };

    getUserData();
  }, [supabase]);

  // Drag and drop hook
  const { links, setLinks, sensors, handleDragEnd } = useDragAndDrop({
    initialLinks: [],
    onReorder: async (newLinks) => {
      // Save new order to backend
      try {
        await apiFetch("/api/v1/links/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
      formData.append("display_name", profile.display_name);
      formData.append("bio", profile.bio);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const response = await apiFetch("/api/v1/profile/update", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert("Profile updated!");
        if (result.data) {
          setProfile((prev) => ({ ...prev, avatar: result.data }));
        }
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
      const linkToAdd: Link = {
        title: newLink.title,
        url: newLink.url,
      };

      const response = await apiFetch("/api/v1/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(linkToAdd),
      });

      if (response.ok) {
        const result = await response.json();
        setLinks([...links, result.data]);
      }

      setNewLink({ id: "", title: "", url: "" });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add link", error);
      alert("Failed to add link. Please try again.");
    }
  };

  // Handle updating a link
  const handleUpdateLink = (
    id: string,
    field: "title" | "url",
    value: string,
  ) => {
    // Update UI
    setLinks((prev) =>
      prev.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    );

    const key = `${id}-${field}`;

    // Clear debounce
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }

    // Send update request
    debounceTimers.current[key] = setTimeout(() => {
      apiFetch(`/api/v1/links/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });
    }, 600); // Delay for 600ms
  };

  // Handle deleting a link
  const handleDeleteLink = async (id: string) => {
    // Ask for confirmation first
    if (!confirm("Are you sure you want to delete this link?")) {
      return;
    }

    try {
      // Call DELETE endpoint with link ID in URL
      const response = await apiFetch(`/api/v1/links/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setLinks(links.filter((link) => link.id !== id));
        alert("Link deleted successfully!");
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
