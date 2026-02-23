import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetchToken = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error("Token error:", error.message);
    return null;
  }

  return data.session?.access_token ?? null;
};
