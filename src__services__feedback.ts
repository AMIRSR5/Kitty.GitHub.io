import { supabase } from "@/lib/supabase";
import type { Feedback } from "@/types";

export interface FeedbackInput {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}

// Public insert (allowed by RLS policy for anon role, status defaults to 'new').
// Email notification: this simply writes the row. To actually email the admin,
// deploy a Supabase Edge Function ("notify-feedback") that listens via a DB
// webhook/trigger on INSERT and calls Resend/SMTP. Keeping that server-side
// is required — real email sending cannot happen from the browser.
export async function submitFeedback(input: FeedbackInput): Promise<void> {
  const { error } = await supabase.from("feedback").insert({ ...input, status: "new" });
  if (error) throw error;
}

export async function fetchFeedbackAdmin(): Promise<Feedback[]> {
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function updateFeedbackStatus(id: string, status: Feedback["status"]): Promise<void> {
  const { error } = await supabase.from("feedback").update({ status }).eq("id", id);
  if (error) throw error;
}
