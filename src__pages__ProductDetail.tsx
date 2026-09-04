import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, ExternalLink, ImageOff } from "lucide-react";
import { fetchProductBySlug } from "@/services/products";
import { toman, discountPercent } from "@/utils/format";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { setProductSeo } from "@/utils/seo";
import { ErrorState } from "@/components/ui/States";
import type { Product } from "@/types";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSiteSettings();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(false);
    fetchProductBySlug(slug)
      .then((data) => {
        setProduct(data);
        if (data) setProductSeo(data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 py-16 animate-pulse">در حال بارگذاری...</div>;
  }
  if (error) return <ErrorState />;
  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-24 text-center text-neutral-400">
        محصول مورد نظر پیدا نشد.
        <div className="mt-4">
          <Link to="/shop" className="text-ink underline text-sm">
            بازگشت به فروشگاه
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images ?? [];
  const pct = discountPercent(product.original_price, product.discount_price);
  const rubikaUrl = product.rubika_url || settings.rubika_url;
  const torobUrl = product.torob_url;

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 grid md:grid-cols-2 gap-10">
      {/* Gallery */}
      <div>
        <div
          className="relative aspect-square bg-mist rounded-2xl overflow-hidden cursor-zoom-in"
          onClick={() => setZoom(true)}
        >
          {images[activeImage] ? (
            <img
              src={images[activeImage].image_url}
              alt={images[activeImage].alt_text ?? product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-300">
              <ImageOff size={40} />
            </div>
          )}
          {pct > 0 && (
            <span className="absolute top-4 right-4 bg-ink text-white text-xs px-2.5 py-1 rounded-full">
              %{pct.toLocaleString("fa-IR")} تخفیف
            </span>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                  activeImage === i ? "border-ink" : "border-transparent"
                }`}
              >
                <img src={img.image_url} alt={img.alt_text ?? ""} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {zoom && images[activeImage] && (
          <div
            className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-6"
            onClick={() => setZoom(false)}
          >
            <img
              src={images[activeImage].image_url}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.category && <div className="text-xs text-neutral-400 mb-2">{product.category.name}</div>}
        <h1 className="text-2xl font-bold mb-1">{product.name}</h1>
        {product.brand && <div className="text-sm text-neutral-400 mb-4">{product.brand}</div>}

        <div className="flex items-center gap-3 mb-6">
          {product.discount_price ? (
            <>
              <span className="text-2xl font-bold">{toman(product.discount_price)}</span>
              <span className="text-sm text-neutral-400 line-through">{toman(product.original_price)}</span>
            </>
          ) : (
            <span className="text-2xl font-bold">{toman(product.original_price)}</span>
          )}
        </div>

        <div className="text-sm mb-6">
          {product.stock > 0 ? (
            <span className="text-green-600">موجود در انبار</span>
          ) : (
            <span className="text-red-500">ناموجود</span>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-neutral-600 leading-7 mb-6 whitespace-pre-line">{product.description}</p>
        )}
        {product.specifications && (
          <div className="border-t border-line pt-4 mb-6">
            <div className="text-sm font-medium mb-2">مشخصات</div>
            <p className="text-sm text-neutral-500 leading-7 whitespace-pre-line">{product.specifications}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {rubikaUrl && product.stock > 0 && (
            <a
              href={rubikaUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-ink text-white text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
            >
              <ShoppingBag size={16} /> خرید محصول
            </a>
          )}
          {torobUrl && (
            <a
              href={torobUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 border border-line text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-mist transition-colors"
            >
              <ExternalLink size={16} /> خرید از ترب
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
