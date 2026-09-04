import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, PackageX, FolderTree, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchAllProductsAdmin } from "@/services/products";
import { fetchFeedbackAdmin } from "@/services/feedback";
import { formatDate } from "@/utils/format";
import type { Product, Feedback, Category } from "@/types";

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAllProductsAdmin(),
      supabase.from("categories").select("*"),
      fetchFeedbackAdmin(),
    ])
      .then(([prods, catsRes, fb]) => {
        setProducts(prods);
        setCategories(catsRes.data ?? []);
        setFeedback(fb);
      })
      .finally(() => setLoading(false));
  }, []);

  const activeCount = products.filter((p) => p.is_active).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  const stats = [
    { label: "تعداد محصولات", value: products.length, icon: Package },
    { label: "محصولات فعال", value: activeCount, icon: Package },
    { label: "محصولات ناموجود", value: outOfStock, icon: PackageX },
    { label: "دسته‌بندی‌ها", value: categories.length, icon: FolderTree },
    { label: "پیام‌های دریافتی", value: feedback.length, icon: MessageSquare },
  ];

  if (loading) return <div className="text-sm text-neutral-400">در حال بارگذاری...</div>;

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">داشبورد</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-line rounded-2xl p-5">
            <Icon size={18} className="text-neutral-400 mb-3" />
            <div className="text-2xl font-bold">{value.toLocaleString("fa-IR")}</div>
            <div className="text-xs text-neutral-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">آخرین محصولات</h2>
            <Link to="/admin/products" className="text-xs text-neutral-400 hover:text-ink">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1">{p.name}</span>
                <span className="text-xs text-neutral-400 shrink-0">{formatDate(p.created_at)}</span>
              </div>
            ))}
            {products.length === 0 && <p className="text-xs text-neutral-400">محصولی ثبت نشده است.</p>}
          </div>
        </div>

        <div className="bg-white border border-line rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium">آخرین پیام‌ها</h2>
            <Link to="/admin/feedback" className="text-xs text-neutral-400 hover:text-ink">
              مشاهده همه
            </Link>
          </div>
          <div className="space-y-3">
            {feedback.slice(0, 5).map((f) => (
              <div key={f.id} className="flex items-center justify-between text-sm">
                <span className="line-clamp-1">{f.subject}</span>
                <span className="text-xs text-neutral-400 shrink-0">{formatDate(f.created_at)}</span>
              </div>
            ))}
            {feedback.length === 0 && <p className="text-xs text-neutral-400">پیامی دریافت نشده است.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
