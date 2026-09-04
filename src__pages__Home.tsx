import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Star } from "lucide-react";
import Hero3D from "@/components/three/Hero3D";
import ProductCard from "@/components/ui/ProductCard";
import { ProductGridSkeleton, EmptyState } from "@/components/ui/States";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCategories } from "@/hooks/useCategories";
import { fetchProducts } from "@/services/products";
import type { Product } from "@/types";

export default function Home() {
  const { settings } = useSiteSettings();
  const { categories, loading: catsLoading } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ sort: "newest" })
      .then((data) => setProducts(data.slice(0, 6)))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section
        data-hero-section
        className="relative h-[100vh] overflow-hidden bg-black text-white"
      >
        <Hero3D heroSelector="[data-hero-section]" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <span className="text-xs tracking-[0.3em] text-white/50 mb-4">BABAK SHOP</span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">{settings.hero_title}</h1>
          <p className="text-white/70 text-base md:text-lg max-w-md">{settings.hero_description}</p>
          <div className="mt-10 flex items-center gap-2 text-white/40 text-xs">
            <span>اسکرول کنید</span>
            <div className="w-px h-8 bg-white/30 animate-pulse" />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />
      </section>

      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-bold mb-8">دسته‌بندی‌ها</h2>
        {catsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-mist animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState message="هنوز دسته‌بندی‌ای ثبت نشده است." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="group border border-line rounded-2xl p-6 text-center hover:border-ink hover:shadow-md transition-all bg-neutral-50"
              >
                <div className="w-10 h-10 rounded-full bg-black/5 mx-auto mb-3 group-hover:bg-ink group-hover:scale-110 transition-all" />
                <div className="text-sm font-medium">{c.name}</div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-5 py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">محصولات جدید</h2>
          <Link to="/shop" className="text-sm text-neutral-500 flex items-center gap-1 hover:text-ink transition-colors">
            مشاهده همه <ChevronLeft size={14} />
          </Link>
        </div>
        {loading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section className="bg-black text-white py-20 px-5 text-center">
        <Star size={20} className="mx-auto mb-4 text-white/50" />
        <h2 className="text-2xl font-bold mb-3">{settings.about_title}</h2>
        <p className="text-white/60 max-w-xl mx-auto text-sm leading-7">{settings.about_content}</p>
      </section>
    </div>
  );
}
