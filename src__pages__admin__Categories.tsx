import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X } from "lucide-react";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/services/categories";
import { slugify } from "@/utils/format";
import { useToast } from "@/hooks/useToast";
import { ConfirmModal } from "@/components/ui/States";
import type { Category } from "@/types";

const EMPTY = { name: "", slug: "", description: "", image_url: "", is_active: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState<Category | null>(null);
  const { push } = useToast();

  function load() {
    setLoading(true);
    fetchCategories(false)
      .then(setCategories)
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  }
  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      image_url: c.image_url ?? "",
      is_active: c.is_active,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) {
      push("نام دسته‌بندی الزامی است.", "error");
      return;
    }
    const payload = {
      name: form.name,
      slug: form.slug || slugify(form.name),
      description: form.description || null,
      image_url: form.image_url || null,
      is_active: form.is_active,
    };
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        push("دسته‌بندی ویرایش شد.", "success");
      } else {
        await createCategory(payload);
        push("دسته‌بندی ایجاد شد.", "success");
      }
      setShowForm(false);
      load();
    } catch {
      push("ذخیره‌سازی با خطا مواجه شد.", "error");
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteCategory(toDelete.id);
      push("دسته‌بندی حذف شد.", "success");
      setToDelete(null);
      load();
    } catch {
      push("حذف با خطا مواجه شد (ممکن است محصولاتی به این دسته وصل باشند).", "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">دسته‌بندی‌ها</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-ink text-white text-sm px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Plus size={16} /> دسته‌بندی جدید
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">در حال بارگذاری...</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-white border border-line rounded-2xl p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium">{c.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.is_active ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {c.is_active ? "فعال" : "غیرفعال"}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mb-4 line-clamp-2">{c.description || "بدون توضیح"}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-mist rounded-lg">
                  <Pencil size={14} />
                </button>
                <button onClick={() => setToDelete(c)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[150] bg-black/40 flex items-center justify-center px-5" onClick={() => setShowForm(false)}>
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">{editing ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}</h2>
              <button type="button" onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
            <input
              placeholder="نام دسته‌بندی"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
            <input
              placeholder="Slug (اختیاری)"
              dir="ltr"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ink"
            />
            <textarea
              placeholder="توضیح کوتاه"
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-line rounded-xl px-4 py-2.5 text-sm outline-none focus:border-ink resize-none"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              فعال
            </label>
            <button className="w-full bg-ink text-white text-sm py-3 rounded-xl hover:bg-neutral-800 transition-colors">
              ذخیره
            </button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="حذف دسته‌بندی"
        description={`آیا از حذف «${toDelete?.name}» مطمئن هستید؟`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
