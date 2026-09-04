import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, Star, Upload } from "lucide-react";
import {
  fetchAllProductsAdmin,
  createProduct,
  updateProduct,
  addProductImage,
  deleteProductImage,
  setPrimaryImage,
} from "@/services/products";
import { fetchCategories } from "@/services/categories";
import { uploadProductImage, deleteProductImageFile } from "@/services/storage";
import { slugify, discountPercent, toman } from "@/utils/format";
import { useToast } from "@/hooks/useToast";
import type { Category, Product, ProductImage } from "@/types";

const EMPTY = {
  name: "",
  slug: "",
  brand: "",
  category_id: "",
  description: "",
  specifications: "",
  original_price: 0,
  discount_price: "" as number | "",
  stock: 0,
  is_active: true,
  rubika_url: "",
  torob_url: "",
  seo_title: "",
  seo_description: "",
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === "new";
  const navigate = useNavigate();
  const { push } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [productId, setProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories(false).then(setCategories);
  }, []);

  useEffect(() => {
    if (isNew) return;
    fetchAllProductsAdmin().then((all) => {
      const p = all.find((x) => x.id === id);
      if (p) {
        setForm({
          name: p.name,
          slug: p.slug,
          brand: p.brand ?? "",
          category_id: p.category_id ?? "",
          description: p.description ?? "",
          specifications: p.specifications ?? "",
          original_price: p.original_price,
          discount_price: p.discount_price ?? "",
          stock: p.stock,
          is_active: p.is_active,
          rubika_url: p.rubika_url ?? "",
          torob_url: p.torob_url ?? "",
          seo_title: p.seo_title ?? "",
          seo_description: p.seo_description ?? "",
        });
        setImages(p.images ?? []);
        setProductId(p.id);
      }
      setLoading(false);
    });
  }, [id, isNew]);

  const pct = discountPercent(form.original_price, form.discount_price === "" ? null : Number(form.discount_price));

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.original_price) {
      push("نام محصول و قیمت اصلی الزامی است.", "error");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      brand: form.brand || null,
      category_id: form.category_id || null,
      description: form.description || null,
      specifications: form.specifications || null,
      original_price: Number(form.original_price),
      discount_price: form.discount_price === "" ? null : Number(form.discount_price),
      stock: Number(form.stock),
      is_active: form.is_active,
      rubika_url: form.rubika_url || null,
      torob_url: form.torob_url || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    };
    try {
      if (isNew) {
        const created = await createProduct(payload);
        push("محصول ایجاد شد.", "success");
        navigate(`/admin/products/${created.id}`);
      } else if (productId) {
        await updateProduct(productId, payload);
        push("تغییرات ذخیره شد.", "success");
      }
    } catch {
      push("ذخیره‌سازی با خطا مواجه شد.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || !productId) {
      if (!productId) push("ابتدا محصول را ذخیره کنید تا بتوانید تصویر اضافه کنید.", "info");
      return;
    }
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file, form.slug || slugify(form.name));
        const img = await addProductImage({
          product_id: productId,
          image_url: url,
          alt_text: form.name,
          sort_order: images.length,
          is_primary: images.length === 0,
        });
        setImages((prev) => [...prev, img]);
      }
      push("تصاویر آپلود شدند.", "success");
    } catch (err) {
      push(err instanceof Error ? err.message : "آپلود تصویر با خطا مواجه شد.", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteImage(img: ProductImage) {
    try {
      await deleteProductImage(img.id);
      await deleteProductImageFile(img.image_url);
      setImages((prev) => prev.filter((i) => i.id !== img.id));
    } catch {
      push("حذف تصویر با خطا مواجه شد.", "error");
    }
  }

  async function handleSetPrimary(img: ProductImage) {
    if (!productId) return;
    await setPrimaryImage(productId, img.id);
    setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === img.id })));
  }

  if (loading) return <p className="text-sm text-neutral-400">در حال بارگذاری...</p>;

  return (
    <form onSubmit={handleSave} className="max-w-3xl">
      <h1 className="text-xl font-bold mb-6">{isNew ? "محصول جدید" : "ویرایش محصول"}</h1>

      <div className="bg-white border border-line rounded-2xl p-6 space-y-4 mb-6">
        <Field label="نام محصول *">
          <input value={form.name} onChange={(e) => update("name", e.target.value)} className="input" />
        </Field>
        <Field label="Slug (خالی بگذارید تا خودکار ساخته شود)">
          <input value={form.slug} onChange={(e) => update("slug", e.target.value)} className="input" dir="ltr" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="برند">
            <input value={form.brand} onChange={(e) => update("brand", e.target.value)} className="input" />
          </Field>
          <Field label="دسته‌بندی">
            <select value={form.category_id} onChange={(e) => update("category_id", e.target.value)} className="input">
              <option value="">انتخاب کنید</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="توضیحات">
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            className="input resize-none"
          />
        </Field>
        <Field label="مشخصات">
          <textarea
            value={form.specifications}
            onChange={(e) => update("specifications", e.target.value)}
            rows={3}
            className="input resize-none"
          />
        </Field>
      </div>

      <div className="bg-white border border-line rounded-2xl p-6 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="قیمت اصلی (تومان) *">
            <input
              type="number"
              value={form.original_price}
              onChange={(e) => update("original_price", Number(e.target.value) as never)}
              className="input"
            />
          </Field>
          <Field label="قیمت با تخفیف (خالی = بدون تخفیف)">
            <input
              type="number"
              value={form.discount_price}
              onChange={(e) => update("discount_price", (e.target.value === "" ? "" : Number(e.target.value)) as never)}
              className="input"
            />
          </Field>
        </div>
        {pct > 0 && (
          <div className="text-xs text-green-600">
            محاسبه خودکار: %{pct.toLocaleString("fa-IR")} تخفیف — قیمت نهایی{" "}
            {toman(Number(form.discount_price))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="موجودی">
            <input
              type="number"
              value={form.stock}
              onChange={(e) => update("stock", Number(e.target.value) as never)}
              className="input"
            />
          </Field>
          <Field label="وضعیت">
            <label className="flex items-center gap-2 h-11 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
              فعال و قابل نمایش
            </label>
          </Field>
        </div>
      </div>

      <div className="bg-white border border-line rounded-2xl p-6 space-y-4 mb-6">
        <Field label="لینک خرید روبیکا (اختصاصی این محصول، اختیاری)">
          <input value={form.rubika_url} onChange={(e) => update("rubika_url", e.target.value)} className="input" dir="ltr" />
        </Field>
        <Field label="لینک ترب (اختیاری - نبود لینک یعنی دکمه نمایش داده نشود)">
          <input value={form.torob_url} onChange={(e) => update("torob_url", e.target.value)} className="input" dir="ltr" />
        </Field>
      </div>

      <div className="bg-white border border-line rounded-2xl p-6 space-y-4 mb-6">
        <div className="text-sm font-medium mb-1">SEO</div>
        <Field label="SEO Title">
          <input value={form.seo_title} onChange={(e) => update("seo_title", e.target.value)} className="input" />
        </Field>
        <Field label="SEO Description">
          <textarea
            value={form.seo_description}
            onChange={(e) => update("seo_description", e.target.value)}
            rows={2}
            className="input resize-none"
          />
        </Field>
      </div>

      <div className="bg-white border border-line rounded-2xl p-6 mb-6">
        <div className="text-sm font-medium mb-4">تصاویر محصول</div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
          {images.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-line group">
              <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button type="button" onClick={() => handleSetPrimary(img)} className="p-1.5 bg-white rounded-full">
                  <Star size={12} className={img.is_primary ? "fill-yellow-400 text-yellow-400" : ""} />
                </button>
                <button type="button" onClick={() => handleDeleteImage(img)} className="p-1.5 bg-white rounded-full text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
              {img.is_primary && (
                <span className="absolute bottom-1 right-1 text-[10px] bg-ink text-white px-1.5 py-0.5 rounded-full">
                  اصلی
                </span>
              )}
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-line flex flex-col items-center justify-center gap-1 text-neutral-400 text-xs cursor-pointer hover:border-ink transition-colors">
            <Upload size={16} />
            {uploading ? "در حال آپلود..." : "افزودن تصویر"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
              hidden
              disabled={uploading}
              onChange={(e) => handleUpload(e.target.files)}
            />
          </label>
        </div>
        {!productId && (
          <p className="text-xs text-neutral-400">ابتدا محصول را ذخیره کنید، سپس می‌توانید تصویر اضافه کنید.</p>
        )}
      </div>

      <button
        disabled={saving}
        className="bg-ink text-white text-sm px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50"
      >
        {saving ? "در حال ذخیره..." : "ذخیره محصول"}
      </button>

      <style>{`.input { width: 100%; border: 1px solid #e5e5e5; border-radius: 0.75rem; padding: 0.65rem 1rem; font-size: 0.875rem; outline: none; } .input:focus { border-color: #0a0a0a; }`}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-neutral-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
