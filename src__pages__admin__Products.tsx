import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { fetchAllProductsAdmin, deleteProduct } from "@/services/products";
import { ConfirmModal } from "@/components/ui/States";
import { toman, discountPercent } from "@/utils/format";
import { useToast } from "@/hooks/useToast";
import type { Product } from "@/types";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const { push } = useToast();

  function load() {
    setLoading(true);
    fetchAllProductsAdmin()
      .then(setProducts)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteProduct(toDelete.id);
      push("محصول حذف شد.", "success");
      setToDelete(null);
      load();
    } catch {
      push("حذف محصول با خطا مواجه شد.", "error");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">محصولات</h1>
        <Link
          to="/admin/products/new"
          className="flex items-center gap-1.5 bg-ink text-white text-sm px-4 py-2.5 rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <Plus size={16} /> محصول جدید
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-400">در حال بارگذاری...</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-neutral-400">هنوز محصولی ثبت نشده است.</p>
      ) : (
        <div className="bg-white border border-line rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-mist text-neutral-500 text-xs">
              <tr>
                <th className="text-right font-normal px-4 py-3">محصول</th>
                <th className="text-right font-normal px-4 py-3">دسته‌بندی</th>
                <th className="text-right font-normal px-4 py-3">قیمت</th>
                <th className="text-right font-normal px-4 py-3">موجودی</th>
                <th className="text-right font-normal px-4 py-3">وضعیت</th>
                <th className="text-right font-normal px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const img = p.images?.find((i) => i.is_primary)?.image_url ?? p.images?.[0]?.image_url;
                const pct = discountPercent(p.original_price, p.discount_price);
                return (
                  <tr key={p.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-mist overflow-hidden shrink-0 flex items-center justify-center">
                          {img ? (
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff size={14} className="text-neutral-300" />
                          )}
                        </div>
                        <span className="line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{p.category?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      {p.discount_price ? (
                        <span>
                          {toman(p.discount_price)}{" "}
                          <span className="text-xs text-neutral-400">(%{pct.toLocaleString("fa-IR")})</span>
                        </span>
                      ) : (
                        toman(p.original_price)
                      )}
                    </td>
                    <td className="px-4 py-3">{p.stock.toLocaleString("fa-IR")}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          p.is_active ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {p.is_active ? "فعال" : "غیرفعال"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/products/${p.id}`} className="p-1.5 hover:bg-mist rounded-lg">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => setToDelete(p)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        title="حذف محصول"
        description={`آیا از حذف «${toDelete?.name}» مطمئن هستید؟`}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
