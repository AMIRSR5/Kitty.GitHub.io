import { supabase } from "@/lib/supabase";
import type { Category } from "@/types";

export async function fetchCategories(onlyActive = true): Promise<Category[]> {
  let query = supabase.from("categories").select("*").order("name", { ascending: true });
  if (onlyActive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export type CategoryInput = Omit<Category, "id" | "created_at">;

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data, error } = await supabase.from("categories").insert(input).select().single();
  if (error) throw error;
  return data as Category;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Category;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}
