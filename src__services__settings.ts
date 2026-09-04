import { supabase } from "@/lib/supabase";
import type { SiteSettings } from "@/types";

// site_settings is a single-row table (id is fixed/known ahead of time).
// We just fetch the first row rather than hardcoding an id, so seeding stays simple.
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateSiteSettings(
  id: string,
  input: Partial<Omit<SiteSettings, "id">>
): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("site_settings")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as SiteSettings;
}
