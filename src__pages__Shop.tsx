import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { ProductGridSkeleton, EmptyState, ErrorState } from "@/components/ui/States";
import { useCategories } from "@/hooks/useCategories";
import { fetchProducts } from "@/services/products";
import type { Product, SortOption } from "@/types";

const SORTS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const { categories } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const search = params.get("q") ?? "";
  const categoryId = params.get("category") ?? "";
  const onlyDiscounted = params.get("discount") === "1";
  const onlyInStock = params.get("stock") === "1";
  const sort = (params.get("sort") as SortOption) ?? "newest";

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetchProducts({ search, categoryId, onlyDiscounted, onlyInStock, sort })
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, categoryId, onlyDiscounted, onlyInStock, sort]);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">فروشگاه</h1>
        <button
          onClick={() => setFilterOpen(true)}
          className="md:hidden flex items-center gap-1 text-sm border border-line rounded-full px-3 py-1.5"
        >
          <SlidersHorizontal size={14} /> فیلتر
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters - desktop */}
        <aside className="hidden md:block w-56 shrink-0 space-y-6">
          <FilterPanel
            categories={categories}
            categoryId={categoryId}
            onlyDiscounted={onlyDiscounted}
            onlyInStock={onlyInStock}
            setParam={setParam}
          />
        </aside>

        {/* Filters - mobile drawer */}
        {filterOpen && (
          <div className="fixed inset-0 z-[150] md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setFilterOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto animate-fadeUp">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold">فیلترها</span>
                <button onClick={() => setFilterOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <FilterPanel
                categories={categories}
                categoryId={categoryId}
                onlyDiscounted={onlyDiscounted}
                onlyInStock={onlyInStock}
                setParam={setParam}
              />
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs text-neutral-400">{products.length.toLocaleString("fa-IR")} محصول</span>
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              className="text-sm border border-line rounded-full px-3 py-1.5 bg-white outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <ProductGridSkeleton count={9} />
          ) : error ? (
            <ErrorState />
          ) : products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPanel({
  categories,
  categoryId,
  onlyDiscounted,
  onlyInStock,
  setParam,
}: {
  categories: { id: string; name: string }[];
  categoryId: string;
  onlyDiscounted: boolean;
  onlyInStock: boolean;
  setParam: (key: string, value: string | null) => void;
}) {
  return (
    <>
      <div>
        <div className="text-sm font-medium mb-3">دسته‌بندی</div>
        <div className="flex flex-col gap-2 text-sm text-neutral-600">
          <button
            onClick={() => setParam("category", null)}
            className={`text-right ${!categoryId ? "text-ink font-medium" : ""}`}
          >
            همه
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setParam("category", c.id)}
              className={`text-right ${categoryId === c.id ? "text-ink font-medium" : ""}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-line space-y-3">
        <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyDiscounted}
            onChange={(e) => setParam("discount", e.target.checked ? "1" : null)}
          />
          فقط تخفیف‌دارها
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(e) => setParam("stock", e.target.checked ? "1" : null)}
          />
          فقط موجودها
        </label>
      </div>
    </>
  );
}
