import { Link } from "react-router-dom";
import { ShoppingBag, ImageOff } from "lucide-react";
import type { Product } from "@/types";
import { toman, discountPercent } from "@/utils/format";

export default function ProductCard({ product }: { product: Product }) {
  const pct = discountPercent(product.original_price, product.discount_price);
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ?? product.images?.[0]?.image_url;
  const outOfStock = product.stock <= 0;

  return (
    <div className="group border border-line rounded-2xl overflow-hidden bg-white hover:shadow-xl transition-all duration-300">
      <Link to={`/product/${product.slug}`} className="block relative aspect-square bg-mist overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.images?.find((i) => i.is_primary)?.alt_text ?? product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <ImageOff size={28} />
          </div>
        )}
        {pct > 0 && (
          <span className="absolute top-3 right-3 bg-ink text-white text-xs px-2 py-1 rounded-full">
            %{pct.toLocaleString("fa-IR")}
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-medium text-neutral-600">
            ناموجود
          </span>
        )}
      </Link>
      <div className="p-4">
        {product.category && <div className="text-xs text-neutral-400 mb-1">{product.category.name}</div>}
        <Link to={`/product/${product.slug}`} className="text-sm font-medium mb-2 line-clamp-1 block">
          {product.name}
        </Link>
        <div className="flex items-center gap-2">
          {product.discount_price ? (
            <>
              <span className="text-sm font-bold">{toman(product.discount_price)}</span>
              <span className="text-xs text-neutral-400 line-through">{toman(product.original_price)}</span>
            </>
          ) : (
            <span className="text-sm font-bold">{toman(product.original_price)}</span>
          )}
        </div>
        <Link
          to={`/product/${product.slug}`}
          className="mt-3 w-full bg-ink text-white text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          <ShoppingBag size={14} /> مشاهده محصول
        </Link>
      </div>
    </div>
  );
}
