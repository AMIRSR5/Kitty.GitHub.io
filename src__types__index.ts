export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  category_id: string | null;
  description: string | null;
  specifications: string | null;
  original_price: number;
  discount_price: number | null;
  stock: number;
  is_active: boolean;
  rubika_url: string | null;
  torob_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  // joined data (populated client-side)
  category?: Category | null;
  images?: ProductImage[];
}

export interface SiteSettings {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  hero_title: string;
  hero_description: string;
  hero_image: string | null;
  about_title: string;
  about_content: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  location_url: string | null;
  working_hours: string | null;
  rubika_url: string | null;
  torob_url: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  feedback_email: string;
  footer_text: string | null;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "resolved";
  created_at: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  name: string;
  role: "admin" | "editor";
  created_at: string;
}

export type SortOption = "newest" | "cheapest" | "expensive" | "discount";
