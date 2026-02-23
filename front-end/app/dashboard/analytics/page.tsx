// app/dashboard/analytics/page.tsx

"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useProfile } from "@/hooks/useProfile";

interface LinkAnalytics {
  link_id: string;
  link_title: string;
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
  const { profile } = useProfile();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        if (!profile) {
          setLoading(false);
          return;
        };
        const profileData = profile;

        const { data: linksData } = await supabase
          .from("links")
          .select("id, title")
          .eq("public_id", profileData.id);

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
          return {
            link_id: id,
            link_title: linksData.find((l) => l.id === id)?.title || "",
            clicks,
          };
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
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([date, totalClicks]) => ({ date, totalClicks }));

        setAnalytics(analyticsData);
        setTotalClicks(total);
        setDailyClicks(dailyData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    getUserData();
  }, [supabase, profile]);

  const chartConfig = {
    totalClicks: {
      label: "Total Clicks",
      color: "hsl(var(--chart-1))",
    },
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

  return (
    <div className="flex justify-center">
      <div className="max-w-6xl w-full flex flex-col gap-5 p-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Card className="w-full pt-10">
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={dailyClicks}>
                <CartesianGrid vertical={false} />

                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />

                <YAxis tickLine={false} axisLine={false} />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />

                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--chart-1))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>

                <Area
                  type="monotone"
                  dataKey="totalClicks"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#fill)"
                />

                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Klik per link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Click per link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-6">
              {analytics.map((item) => (
                <li key={item.link_id}>
                  <Card className="p-4 flex flex-col items-center w-auto bg-violet-50 text-violet-600 border-violet-100 shadow-none text-sm font-semibold uppercase">
                    <span>{item.link_title}</span>
                    <span>{item.clicks} clicks</span>
                  </Card>
                </li>
              ))}
            </ul>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Total: {totalClicks} clicks
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
