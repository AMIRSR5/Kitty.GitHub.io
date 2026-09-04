import { supabase } from "@/lib/supabase";

const BUCKET = "product-images";
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "فرمت تصویر مجاز نیست. فقط JPG, PNG, WEBP, AVIF.";
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `حجم تصویر نباید بیشتر از ${MAX_SIZE_MB}MB باشد.`;
  }
  return null;
}

export async function uploadProductImage(file: File, productSlug: string): Promise<string> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const ext = file.name.split(".").pop();
  const path = `${productSlug}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImageFile(publicUrl: string): Promise<void> {
  // publicUrl looks like: .../storage/v1/object/public/product-images/<path>
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(BUCKET).remove([path]);
}
