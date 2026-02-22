// app/dashboard/appearance/page.tsx

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiFetch } from "@/lib/api";
// import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PhonePreview } from "@/components/dashboard/PhonePreview";
import {
  LayoutCustomizer,
  LayoutBlock,
  BlockType,
  DEFAULT_LAYOUT_BLOCKS,
} from "@/components/dashboard/LayoutCustomizer";
import { Check, LayoutTemplate, RotateCcw, Save } from "lucide-react";
// import { Profile, Link } from "@/types";
import { useRouter } from "next/navigation";

// At the top of page.tsx
import dynamic from "next/dynamic";
import { Slider } from "@/components/ui/slider";
import { useProfile } from "@/hooks/useProfile";
const Colorful = dynamic(
  () => import("@uiw/react-color").then((m) => m.Colorful),
  {
    ssr: false,
  }
);

interface Theme {
  id: string;
  name: string;
  description: string;
  background_color: string;
  text_color: string;
  button_color: string;
}

const PRESET_THEMES: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "Classic and professional",
    background_color: "#F8FAFC",
    text_color: "#0F172A",
    button_color: "#6366F1",
  },
  {
    id: "light",
    name: "Light",
    description: "Clean and minimal",
    background_color: "#FFFFFF",
    text_color: "#1F2937",
    button_color: "#10B981",
  },
  {
    id: "dark",
    name: "Dark",
    description: "Modern and sleek",
    background_color: "#1F2937",
    text_color: "#F9FAFB",
    button_color: "#F59E0B",
  },
];

const supabase = createClient();

export default function AppearancePage() {
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<string>("default");
  const [token, setToken] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [backgroundHex, setBackgroundHex] = useState("#F8FAFC");
  const [textHex, setTextHex] = useState("#0F172A");
  const [buttonHex, setButtonHex] = useState("#6366F1");
  const [isSavingLayout, setIsSavingLayout] = useState(false);
  const [layoutRowIds, setLayoutRowIds] = useState<Record<string, number>>({});
  const [avatarRadius, setAvatarRadius] = useState<number[]>([1]);
  const [buttonRadius, setButtonRadius] = useState<number[]>([1]);

  const { profile, setProfile, layoutBlocks, setLayoutBlocks, initialized } =
    useProfile();

  useEffect(() => {
    const fetchSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) router.push("/auth/login");
      setToken(data.session?.access_token || "");
    };
    fetchSession();
  }, [router]);

  useEffect(() => {
    if (!profile) return;

    setSelectedTheme(profile.theme_id || "default");
    setBackgroundHex(profile.background_color || "#F8FAFC");
    setTextHex(profile.text_color || "#0F172A");
    setButtonHex(profile.button_color || "#6366F1");

    setAvatarRadius(
      Array.isArray(profile.avatar_radius)
        ? profile.avatar_radius
        : [profile.avatar_radius ?? 1]
    );

    setButtonRadius(
      Array.isArray(profile.button_radius)
        ? profile.button_radius
        : [profile.button_radius ?? 1]
    );
  }, [profile]);

  useEffect(() => {
    if (!profile) return;

    const fetchIds = async () => {
      const { data: layoutData } = await supabase
        .from("layout")
        .select("id, components")
        .eq("public_id", profile?.id);
      if (layoutData) {
        // Store row IDs keyed by component name
        const rowIds: Record<string, number> = {};
        layoutData.forEach((c: any) => {
          rowIds[c.components] = c.id;
        });
        setLayoutRowIds(rowIds);
      }
    };

    fetchIds();
  }, [profile]);

  if (!initialized || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  const handleThemeSelect = async (themeId: string) => {
    const t = PRESET_THEMES.find((t) => t.id === themeId);
    if (!t) return;

    setProfile((prev) =>
      prev
        ? {
          ...prev,
          theme_id: themeId,
          background_color: t.background_color,
          text_color: t.text_color,
          button_color: t.button_color,
        }
        : prev
    );

    setBackgroundHex(t.background_color);
    setTextHex(t.text_color);
    setButtonHex(t.button_color);
    setSelectedTheme(themeId);
    setIsSaving(true);

    try {
      const response = await apiFetch("/api/v1/profile/theme", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          public_id: profile.id,
          theme_id: themeId,
          background_color: t.background_color,
          text_color: t.text_color,
          button_color: t.button_color,
        }),
      });
      if (!response.ok) alert("Failed to save theme");
    } catch {
      alert("Failed to save theme");
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleSaveCustomColors = async () => {
    setSelectedTheme("costum");
    setIsSaving(true);
    try {
      const response = await apiFetch("/api/v1/profile/theme", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          public_id: profile.id,
          theme_id: "costum",
          background_color: backgroundHex,
          text_color: textHex,
          button_color: buttonHex,
          avatar_radius: avatarRadius[0],
          button_radius: buttonRadius[0],
        }),
      });
      if (!response.ok) {
        alert("Failed to save custom colors");
      } else {
        alert("Custom colors saved!");
      }
    } catch {
      alert("Failed to save custom colors");
    } finally {
      setTimeout(() => setIsSaving(false), 500);
    }
  };

  const handleSaveLayout = async () => {
    setIsSavingLayout(true);
    try {
      // Send component name (text) + order_index — matching the DB schema
      const components = layoutBlocks.map((block, index) => ({
        id: layoutRowIds[block.id],
        order_index: index,
      }));

      console.log(components);

      const response = await apiFetch("/api/v1/profile/layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          public_id: profile.id,
          components,
        }),
      });

      if (!response.ok) {
        alert("Failed to save layout");
      } else {
        alert("Layout saved successfully!");
      }
    } catch (error) {
      console.error("Failed to save layout:", error);
      alert("Failed to save layout");
    } finally {
      setTimeout(() => setIsSavingLayout(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <main className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 p-6">
        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0F172A] mb-1">
              Appearance
            </h2>
            <p className="text-sm text-slate-500">
              Customize how your profile looks to visitors
            </p>
          </div>

          {/* Preset Themes */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Preset Themes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PRESET_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeSelect(theme.id)}
                  disabled={isSaving}
                  className={`relative p-5 rounded-2xl border-2 transition-all text-left ${selectedTheme === theme.id
                    ? "border-[#6366F1] bg-[#EEF2FF] shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    } ${isSaving
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                    }`}
                >
                  {selectedTheme === theme.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-[#6366F1] rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <h4 className="text-sm font-bold text-[#0F172A] mb-0.5">
                    {theme.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">
                    {theme.description}
                  </p>
                  <div
                    className="w-full h-32 rounded-xl overflow-hidden"
                    style={{ backgroundColor: theme.background_color }}
                  >
                    <div className="p-3 space-y-2">
                      <div
                        className="w-8 h-8 rounded-full mx-auto"
                        style={{
                          backgroundColor:
                            theme.id === "dark" ? "#374151" : "#E5E7EB",
                        }}
                      />
                      <div
                        className="text-[9px] font-bold text-center"
                        style={{ color: theme.text_color }}
                      >
                        @username
                      </div>
                      <div className="space-y-1">
                        <div
                          className="w-full py-1.5 rounded-full text-[8px] font-semibold text-white text-center"
                          style={{ backgroundColor: theme.button_color }}
                        >
                          Link 1
                        </div>
                        <div
                          className="w-full py-1.5 rounded-full text-[8px] font-semibold text-white text-center"
                          style={{ backgroundColor: theme.button_color }}
                        >
                          Link 2
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Custom Colors */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Custom Colors
              </h3>
              {selectedTheme === "costum" && (
                <span className="text-[11px] bg-[#6366F1] text-white px-2.5 py-0.5 rounded-full font-semibold">
                  Active
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  label: "Background",
                  hex: backgroundHex,
                  set: setBackgroundHex,
                  profileKey: "background_color",
                },
                {
                  label: "Text",
                  hex: textHex,
                  set: setTextHex,
                  profileKey: "text_color",
                },
                {
                  label: "Button",
                  hex: buttonHex,
                  set: setButtonHex,
                  profileKey: "button_color",
                },
              ].map(({ label, hex, set, profileKey }) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    {label}
                  </p>

                  <Colorful
                    color={hex}
                    onChange={(c: any) => {
                      const newHex = c.hex;

                      set(newHex);

                      setProfile((prev) =>
                        prev
                          ? {
                            ...prev,
                            [profileKey]: newHex,
                            theme_id: "costum",
                          }
                          : prev
                      );
                    }}
                  />

                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md border border-slate-200 shadow-inner"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="text-xs font-mono text-slate-500">
                      {hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-5 mt-8">
              <section className="space-y-2">
                <div className="flex justify-between px-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Avatar
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    {avatarRadius[0]}
                  </p>
                </div>

                <Slider
                  min={1}
                  max={50}
                  value={avatarRadius}
                  onValueChange={(value) => {
                    setAvatarRadius(value);
                    setProfile((prev) =>
                      prev
                        ? {
                          ...prev,
                          avatar_radius: value[0],
                          theme_id: "costum",
                        }
                        : prev
                    );
                  }}
                  step={1}
                />
              </section>

              <section className="space-y-2">
                <div className="flex justify-between px-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Button
                  </p>
                  <p className="text-xs font-semibold text-slate-600">
                    {buttonRadius[0]}
                  </p>
                </div>

                <Slider
                  min={1}
                  max={50}
                  value={buttonRadius}
                  onValueChange={(value) => {
                    setButtonRadius(value);
                    setProfile((prev) =>
                      prev
                        ? {
                          ...prev,
                          button_radius: value[0],
                          theme_id: "costum",
                        }
                        : prev
                    );
                  }}
                  step={1}
                />
              </section>
            </div>

            <button
              onClick={handleSaveCustomColors}
              disabled={isSaving}
              className="w-full mt-6 py-2.5 px-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Saving..." : "Save Custom Colors"}
            </button>
          </section>

          {/* Layout Customizer */}
          <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
                  <LayoutTemplate className="w-3.5 h-3.5 text-[#6366F1]" />
                </div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  Layout
                </h3>
              </div>
              <button
                onClick={() => setLayoutBlocks(DEFAULT_LAYOUT_BLOCKS)}
                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                title="Reset to default"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5 ml-9">
              Drag to reorder · click <span className="font-semibold">eye</span>{" "}
              to show/hide · click <span className="font-semibold">align</span>{" "}
              icon to cycle alignment
            </p>

            <LayoutCustomizer
              blocks={layoutBlocks}
              onChange={setLayoutBlocks}
            />

            {/* Save button */}
            <button
              onClick={handleSaveLayout}
              disabled={isSavingLayout}
              className="w-full mt-4 py-2.5 px-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-xl text-sm font-semibold shadow-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSavingLayout ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Layout
                </>
              )}
            </button>

            <div className="mt-4 flex items-center gap-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                Live preview updates instantly
              </div>
            </div>
          </section>

          {(isSaving || isSavingLayout) && (
            <div className="flex items-center gap-2 text-[#6366F1] bg-[#EEF2FF] px-4 py-3 rounded-xl text-sm">
              <div className="w-4 h-4 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          )}
        </div>

        <div className="lg:w-[300px]">
          <div className="sticky top-24">
            <PhonePreview />
          </div>
        </div>
      </main>
    </div>
  );
}
