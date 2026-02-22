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

  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profileData) return;

      if (profileData) {

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
      }
    };

    getUserData();
  }, [supabase]);

  const chartConfig = {
    totalClicks: {
      label: "Total Clicks",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Analytics</h1>
      <p>Total clicks: {totalClicks}</p>

      <Card>
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
          <CardTitle>Clicks per Link</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {analytics.map((item) => (
              <li key={item.link_id}>
                {item.link_title}: {item.clicks} clicks
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
