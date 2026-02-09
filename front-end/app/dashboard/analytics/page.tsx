"use client";

import { createClient } from "@/lib/supabase/client";
import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Profile, Link } from "@/types";
import { apiFetch } from "@/lib/api";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LinkAnalytics {
  link_id: string;
  clicks: number;
}

interface DailyClicks {
  date: string;
  totalClicks: number;
}

export default function AnalyticsPage() {
  const supabase = createClient();
  const [analytics, setAnalytics] = useState<LinkAnalytics[]>([]);
  const [dailyClicks, setDailyClicks] = useState<DailyClicks[]>([]);
  const [totalClicks, setTotalClicks] = useState<number>(0);

  // For profile dialog (reusing DashboardHeader)
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = React.useRef<HTMLInputElement>(null!);
  const [profile, setProfile] = useState<Profile>({
    username: "username",
    bio: "My bio is empty",
    avatar: "",
  });
  const [token, setToken] = useState("")

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: linksData } = await supabase
        .from("links")
        .select("id")
        .eq("user_id", user.id);

      if (!linksData || linksData.length === 0) return;

      const linkIds = linksData.map((link) => link.id);

      // Ambil semua klik untuk link user
      const { data: linkClicks } = await supabase
        .from("link_clicks")
        .select("link_id, created_at")
        .in("link_id", linkIds);

      if (!linkClicks) return;

      // Hitung klik per link
      const analyticsData: LinkAnalytics[] = linkIds.map((id) => {
        const clicks = linkClicks.filter((c) => c.link_id === id).length;
        return { link_id: id, clicks };
      });

      // Total klik semua link
      const total = analyticsData.reduce((sum, item) => sum + item.clicks, 0);

      // Hitung total klik per hari dengan format "2026 Feb 09"
      const clicksByDay: Record<string, number> = {};
      linkClicks.forEach((c) => {
        const date = new Date(c.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        });
        clicksByDay[date] = (clicksByDay[date] || 0) + 1;
      });

      const dailyData: DailyClicks[] = Object.entries(clicksByDay)
        .sort(
          ([a], [b]) =>
            new Date(a).getTime() - new Date(b).getTime()
        )
        .map(([date, totalClicks]) => ({ date, totalClicks }));

      setAnalytics(analyticsData);
      setTotalClicks(total);
      setDailyClicks(dailyData);
    };

    getUserData();
  }, [supabase]);

  // Handle profile update (from header)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.append("username", profile.username);
      formData.append("bio", profile.bio);

      if (selectedFile) {
        formData.append("avatar", selectedFile);
      }

      const response = await apiFetch("/api/v1/user/update", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert("Profile updated!");
        if (result.data && result.data.avatar_url) {
          setProfile((prev) => ({ ...prev, avatar: result.data.avatar_url }));
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
  // Handle file change for avatar (from header)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        isUpdating={isUpdating}
        previewUrl={previewUrl}
        fileInputRef={fileInputRef}
        onFileChange={handleFileChange}
        onProfileChange={setProfile}
      />
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p>Total clicks: {totalClicks}</p>

      {/* Line chart total klik per hari */}
      <Card>
        <CardHeader>
          <CardTitle>Total Clicks per Day</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyClicks}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="totalClicks" stroke="#4F46E5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Klik per link */}
      <Card>
        <CardHeader>
          <CardTitle>Clicks per Link</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {analytics.map((item) => (
              <li key={item.link_id}>
                Link {item.link_id}: {item.clicks} clicks
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
