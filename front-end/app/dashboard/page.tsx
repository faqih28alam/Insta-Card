"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { LinkEditor } from "@/components/dashboard/LinkEditor";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import { Link } from "@/types";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";

const supabase = createClient();

export default function DashboardPage() {
  const router = useRouter();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLink, setNewLink] = useState<Link>({ id: "", title: "", url: "" });
  const [token, setToken] = useState("");
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const { profile, links, setLinks, initialized } = useProfile();

  const { sensors, handleDragEnd } = useDragAndDrop({
    links,
    setLinks,
    onReorder: async (newLinks) => {
      try {
        await apiFetch("/api/v1/links/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: profile?.id,
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
    if (initialized) {
      fetchSession();
    }
  }, [router]);

  if (!initialized || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

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
          id: profile?.id,
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
  const handleUpdateLink = (
    id: string,
    field: "title" | "url",
    value: string
  ) => {
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

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* <DashboardHeader /> */}

      <main className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 p-6">
        <LinkEditor
          links={links}
          sensors={sensors}
          onDragEnd={handleDragEnd}
          isAddDialogOpen={isAddDialogOpen}
          onAddDialogChange={setIsAddDialogOpen}
          newLink={newLink}
          onNewLinkChange={(link) => setNewLink({ id: "", ...link })}
          onAddLink={handleAddLink}
          onUpdateLink={handleUpdateLink}
          onDeleteLink={handleDeleteLink}
        />

        <PhonePreview />
      </main>
    </div>
  );
}
