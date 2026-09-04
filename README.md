# بابک شاپ

فروشگاه اینترنتی لوازم آرایشی و بهداشتی — React + TypeScript + Vite + Tailwind + Supabase.

## پیش‌نیاز
- Node.js نسخه 20 به بالا
- یک اکانت رایگان [Supabase](https://supabase.com)
- اکانت GitHub (برای Deploy روی GitHub Pages)

---

## ۱) نصب پروژه

```bash
git clone <repo-url>
cd babak-shop
npm install
```

## ۲) ساخت پروژه Supabase

1. به [supabase.com](https://supabase.com) بروید و یک پروژه جدید بسازید.
2. از مسیر **Project Settings → API** دو مقدار زیر را کپی کنید:
   - `Project URL`
   - `anon public key`

## ۳) ساخت Database و اجرای SQL

1. در Dashboard پروژه به بخش **SQL Editor** بروید.
2. کل محتوای فایل `supabase-schema.sql` (در ریشه‌ی همین پروژه) را کپی و اجرا کنید.
   این کار جدول‌ها، Foreign Key ها، Index ها، RLS، Policy ها، باکت Storage و چند محصول Demo را می‌سازد.

## ۴) ساخت Storage Bucket

اسکریپت SQL بالا باکت `product-images` را به‌صورت خودکار می‌سازد (public). نیازی به کار دستی نیست؛ فقط مطمئن شوید در بخش **Storage** این باکت وجود دارد.

## ۵) تنظیم Environment Variables

```bash
cp .env.example .env
```

مقادیر `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` را با مقادیر مرحله ۲ پر کنید.
`VITE_DEFAULT_RUBIKA_URL` را هم با لینک صفحه PV روبیکای خودتان پر کنید (بعداً هم از پنل مدیریت قابل تغییر است).

⚠️ هرگز `service_role key` را در این فایل یا در کد Frontend قرار ندهید. فقط `anon key` استفاده می‌شود.

## ۶) ساخت کاربر Admin

1. در Supabase Dashboard به **Authentication → Users** بروید و یک کاربر با ایمیل/رمز عبور دلخواه بسازید.
2. UUID همان کاربر را کپی کنید.
3. در SQL Editor اجرا کنید:

```sql
insert into admin_profiles (user_id, name, role)
values ('USER-UUID-اینجا', 'مدیر بابک شاپ', 'admin');
```

بدون این مرحله، ورود به پنل مدیریت (`/admin`) با خطای دسترسی مواجه می‌شود چون RLS این کاربر را ادمین نمی‌شناسد.

## ۷) اجرای Local

```bash
npm run dev
```

سایت روی `http://localhost:5173` بالا می‌آید. برای ورود به پنل مدیریت به `/#/admin/login` بروید.

## ۸) Build

```bash
npm run build
```

خروجی در پوشه‌ی `dist/` ساخته می‌شود. `npm run preview` برای تست خروجی Build.

## ۹) Deploy روی GitHub Pages

پروژه از **HashRouter** استفاده می‌کند (`/#/shop`, `/#/product/...`) تا Refresh صفحات روی GitHub Pages باعث خطای 404 نشود — نیازی به تنظیم اضافه نیست.

1. مقدار `base` در `vite.config.ts` را با نام Repository خودتان هماهنگ کنید:
   ```ts
   base: "/نام-ریپازیتوری-شما/"
   ```
2. در تنظیمات Repository → **Settings → Pages** گزینه‌ی Source را روی **GitHub Actions** بگذارید.
3. در **Settings → Secrets and variables → Actions** سه Secret زیر را اضافه کنید:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_DEFAULT_RUBIKA_URL`
4. با هر `push` به شاخه‌ی `main`، Workflow موجود در `.github/workflows/deploy.yml` به‌صورت خودکار Build و Deploy می‌کند.

---

## ساختار پروژه

```
src/
  components/   کامپوننت‌های قابل استفاده مجدد (layout, ui, three)
  pages/        صفحات فروشگاه + پنل مدیریت (pages/admin)
  services/     لایه‌ی ارتباط با Supabase (products, categories, settings, feedback, storage)
  hooks/        useAuth, useSiteSettings, useCategories, useToast
  lib/          کلاینت Supabase
  types/        تایپ‌های TypeScript متناظر با اسکیمای دیتابیس
  utils/        فرمت قیمت/تخفیف، SEO، slugify
```

## ارسال ایمیل برای فرم انتقادات

فرم انتقادات پیام را در جدول `feedback` ذخیره می‌کند (این بخش کاملاً واقعی و کاربردی است).
برای ارسال خودکار ایمیل به مدیر، چون ارسال ایمیل باید سمت سرور انجام شود، پیشنهاد می‌شود یک **Supabase Edge Function** بسازید که با Database Webhook روی رویداد INSERT جدول `feedback` اجرا شود و از سرویس [Resend](https://resend.com) یا SMTP برای ارسال استفاده کند. ایمیل مقصد از تنظیمات سایت (`site_settings.feedback_email`) خوانده می‌شود.

## نکات امنیتی

- Row Level Security روی همه‌ی جدول‌ها فعال است.
- فقط کاربرانی که ردیف متناظر در `admin_profiles` دارند دسترسی نوشتن (Insert/Update/Delete) دارند.
- کاربر عادی فقط محصولات و دسته‌بندی‌های `is_active = true` را می‌بیند.
- `service_role key` هرگز نباید در Frontend استفاده شود.

## محدودیت شناخته‌شده

ارسال ایمیل واقعی (Resend/SMTP) در این نسخه پیاده‌سازی نشده چون نیاز به یک سرویس سمت سرور (Edge Function) و اطلاعات حساب شما (API Key سرویس ایمیل) دارد. ساختار داده و پنل مدیریت کاملاً آماده‌ی اتصال است.
