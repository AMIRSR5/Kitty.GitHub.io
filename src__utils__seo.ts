import type { Product, SiteSettings } from "@/types";

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? "property" : "name";
  let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setJsonLd(id: string, data: unknown) {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function setSiteSeo(settings: SiteSettings) {
  document.title = `${settings.site_name} | فروشگاه لوازم آرایشی و بهداشتی`;
  setMeta("description", settings.hero_description);
  setMeta("og:title", settings.site_name, true);
  setMeta("og:description", settings.hero_description, true);
  if (settings.hero_image) setMeta("og:image", settings.hero_image, true);

  setJsonLd("ld-organization", {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.site_name,
    telephone: settings.phone ?? undefined,
    address: settings.address ?? undefined,
  });
}

export function setProductSeo(product: Product) {
  const title = product.seo_title || product.name;
  const description = product.seo_description || product.description || "";
  document.title = `${title} | بابک شاپ`;
  setMeta("description", description);
  setMeta("og:title", title, true);
  setMeta("og:description", description, true);
  const image = product.images?.find((i) => i.is_primary)?.image_url ?? product.images?.[0]?.image_url;
  if (image) setMeta("og:image", image, true);

  setJsonLd("ld-product", {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description,
    image: image ? [image] : undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "IRT",
      price: product.discount_price || product.original_price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  });

  setJsonLd("ld-breadcrumb", {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "صفحه اصلی", item: "/" },
      { "@type": "ListItem", position: 2, name: "فروشگاه", item: "/shop" },
      { "@type": "ListItem", position: 3, name: product.name },
    ],
  });
}
