import { supabase } from "@/lib/supabase";
import type { Product, ProductImage, SortOption } from "@/types";

const PRODUCT_SELECT = `*, category:categories(*), images:product_images(*)`;

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  onlyDiscounted?: boolean;
  onlyInStock?: boolean;
  sort?: SortOption;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);

  if (filters.search) {
    const term = filters.search.trim();
    query = query.or(
      `name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`
    );
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.onlyDiscounted) {
    query = query.not("discount_price", "is", null);
  }
  if (filters.onlyInStock) {
    query = query.gt("stock", 0);
  }

  switch (filters.sort) {
    case "cheapest":
      query = query.order("original_price", { ascending: true });
      break;
    case "expensive":
      query = query.order("original_price", { ascending: false });
      break;
    case "newest":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;

  let products = (data ?? []) as Product[];

  // "بیشترین تخفیف" sort is computed client-side (percent is derived, not stored)
  if (filters.sort === "discount") {
    products = products
      .slice()
      .sort((a, b) => {
        const pctA = a.discount_price ? (a.original_price - a.discount_price) / a.original_price : 0;
        const pctB = b.discount_price ? (b.original_price - b.discount_price) / b.original_price : 0;
        return pctB - pctA;
      });
  }

  return products.map(normalizeImages);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeImages(data as Product) : null;
}

// --- Admin (requires authenticated session + RLS admin policy) -----------

export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalizeImages);
}

export type ProductInput = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "category" | "images"
>;

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert(input)
    .select(PRODUCT_SELECT)
    .single();
  if (error) throw error;
  return normalizeImages(data as Product);
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PRODUCT_SELECT)
    .single();
  if (error) throw error;
  return normalizeImages(data as Product);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function addProductImage(image: Omit<ProductImage, "id" | "created_at">) {
  const { data, error } = await supabase.from("product_images").insert(image).select().single();
  if (error) throw error;
  return data as ProductImage;
}

export async function deleteProductImage(id: string) {
  const { error } = await supabase.from("product_images").delete().eq("id", id);
  if (error) throw error;
}

export async function setPrimaryImage(productId: string, imageId: string) {
  // clear existing primary, then set the new one (two small writes, RLS-safe)
  await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);
  if (error) throw error;
}

function normalizeImages(p: Product): Product {
  const images = (p.images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  return { ...p, images };
}
