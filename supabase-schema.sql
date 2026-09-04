-- =============================================================================
-- بابک شاپ | Supabase Schema
-- این فایل را کامل در SQL Editor پروژه Supabase خود اجرا کنید.
-- =============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  brand text,
  category_id uuid references categories(id) on delete set null,
  description text,
  specifications text,
  original_price numeric(12,0) not null check (original_price >= 0),
  discount_price numeric(12,0) check (discount_price is null or discount_price >= 0),
  stock integer not null default 0,
  is_active boolean not null default true,
  rubika_url text,
  torob_url text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_slug on products(slug);

create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_product_images_product on product_images(product_id);

create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  site_name text not null default 'بابک شاپ',
  logo_url text,
  favicon_url text,
  hero_title text not null default 'بابک شاپ',
  hero_description text not null default 'زیبایی، کیفیت، انتخابی مطمئن',
  hero_image text,
  about_title text not null default 'درباره بابک شاپ',
  about_content text not null default 'ارائه‌دهنده لوازم آرایشی و بهداشتی اصل و باکیفیت.',
  phone text,
  email text,
  address text,
  location_url text,
  working_hours text,
  rubika_url text,
  torob_url text,
  instagram_url text,
  telegram_url text,
  feedback_email text not null default 'sa0ar0a0@gmail.com',
  footer_text text
);

create table if not exists feedback (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','read','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists admin_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  name text not null,
  role text not null default 'admin' check (role in ('admin','editor')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at auto-touch trigger for products
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table site_settings enable row level security;
alter table feedback enable row level security;
alter table admin_profiles enable row level security;

-- Helper: is the current auth user an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_profiles where user_id = auth.uid()
  );
$$ language sql stable security definer;

-- categories: public can read active rows, admins can do everything
create policy "categories_public_read" on categories
  for select using (is_active = true or is_admin());
create policy "categories_admin_write" on categories
  for insert with check (is_admin());
create policy "categories_admin_update" on categories
  for update using (is_admin());
create policy "categories_admin_delete" on categories
  for delete using (is_admin());

-- products: public can read active rows, admins can do everything
create policy "products_public_read" on products
  for select using (is_active = true or is_admin());
create policy "products_admin_write" on products
  for insert with check (is_admin());
create policy "products_admin_update" on products
  for update using (is_admin());
create policy "products_admin_delete" on products
  for delete using (is_admin());

-- product_images: readable if the parent product is readable; admin-only writes
create policy "product_images_public_read" on product_images
  for select using (
    exists (
      select 1 from products p
      where p.id = product_images.product_id
        and (p.is_active = true or is_admin())
    )
  );
create policy "product_images_admin_write" on product_images
  for insert with check (is_admin());
create policy "product_images_admin_update" on product_images
  for update using (is_admin());
create policy "product_images_admin_delete" on product_images
  for delete using (is_admin());

-- site_settings: public read, admin write
create policy "settings_public_read" on site_settings
  for select using (true);
create policy "settings_admin_update" on site_settings
  for update using (is_admin());

-- feedback: anyone can insert (contact form), only admins can read/update
create policy "feedback_public_insert" on feedback
  for insert with check (true);
create policy "feedback_admin_read" on feedback
  for select using (is_admin());
create policy "feedback_admin_update" on feedback
  for update using (is_admin());

-- admin_profiles: admins can read the list (needed for is_admin() checks via RLS-safe function)
create policy "admin_profiles_self_read" on admin_profiles
  for select using (user_id = auth.uid() or is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket for product images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_bucket_public_read"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_bucket_admin_insert"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and is_admin());

create policy "product_images_bucket_admin_delete"
  on storage.objects for delete
  using (bucket_id = 'product-images' and is_admin());

-- ---------------------------------------------------------------------------
-- Seed data (demo only — safe to delete from the admin panel later)
-- ---------------------------------------------------------------------------
insert into site_settings (site_name, hero_title, hero_description, about_title, about_content, feedback_email)
select 'بابک شاپ', 'بابک شاپ', 'زیبایی، کیفیت، انتخابی مطمئن',
       'درباره بابک شاپ', 'بابک شاپ ارائه‌دهنده لوازم آرایشی و بهداشتی اصل و باکیفیت با تجربه خرید ساده و مطمئن است.',
       'sa0ar0a0@gmail.com'
where not exists (select 1 from site_settings);

insert into categories (name, slug, description) values
  ('آرایشی', 'makeup', 'محصولات آرایشی'),
  ('مراقبت پوست', 'skincare', 'محصولات مراقبت از پوست'),
  ('مراقبت مو', 'haircare', 'محصولات مراقبت از مو'),
  ('بهداشت شخصی', 'personal-care', 'محصولات بهداشت شخصی'),
  ('عطر و ادکلن', 'perfume', 'عطر و ادکلن'),
  ('محصولات بهداشتی', 'hygiene', 'محصولات بهداشتی'),
  ('سایر', 'other', 'سایر محصولات')
on conflict (slug) do nothing;

insert into products (name, slug, brand, category_id, description, original_price, discount_price, stock, is_active)
select 'کرم مرطوب‌کننده', 'moisturizing-cream', 'Demo Brand', c.id,
       'کرم مرطوب‌کننده مناسب انواع پوست.', 1250000, 950000, 25, true
from categories c where c.slug = 'skincare'
on conflict (slug) do nothing;

insert into products (name, slug, brand, category_id, description, original_price, discount_price, stock, is_active)
select 'رژ لب', 'lipstick', 'Demo Brand', c.id,
       'رژ لب مات با ماندگاری بالا.', 480000, null, 40, true
from categories c where c.slug = 'makeup'
on conflict (slug) do nothing;

insert into products (name, slug, brand, category_id, description, original_price, discount_price, stock, is_active)
select 'ضد آفتاب', 'sunscreen', 'Demo Brand', c.id,
       'ضد آفتاب SPF50 مناسب پوست چرب و مختلط.', 690000, 520000, 30, true
from categories c where c.slug = 'skincare'
on conflict (slug) do nothing;

insert into products (name, slug, brand, category_id, description, original_price, discount_price, stock, is_active)
select 'شامپو', 'shampoo', 'Demo Brand', c.id,
       'شامپو تقویت‌کننده و ضدریزش مو.', 350000, null, 50, true
from categories c where c.slug = 'haircare'
on conflict (slug) do nothing;

insert into products (name, slug, brand, category_id, description, original_price, discount_price, stock, is_active)
select 'سرم پوست', 'skin-serum', 'Demo Brand', c.id,
       'سرم روشن‌کننده و ضدلک پوست.', 1450000, 1090000, 15, true
from categories c where c.slug = 'skincare'
on conflict (slug) do nothing;

-- =============================================================================
-- بعد از اجرای این فایل:
-- 1) یک کاربر Admin از بخش Authentication > Users در Supabase Dashboard بسازید
--    (یا با supabase.auth.signUp یک بار در کنسول ثبت کنید).
-- 2) سپس ردیف زیر را با user_id همان کاربر جایگزین و اجرا کنید:
--
--    insert into admin_profiles (user_id, name, role)
--    values ('YOUR-AUTH-USER-UUID', 'مدیر بابک شاپ', 'admin');
--
-- بدون این ردیف، is_admin() همیشه false برمی‌گرداند و کاربر به پنل دسترسی نخواهد داشت.
-- =============================================================================
