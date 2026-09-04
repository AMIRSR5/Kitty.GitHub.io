import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useCategories } from "@/hooks/useCategories";

export default function Footer() {
  const { settings } = useSiteSettings();
  const { categories } = useCategories();

  return (
    <footer className="bg-mist border-t border-line pt-14 pb-8 px-5">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="text-lg font-bold mb-3">{settings.site_name}</div>
          <p className="text-neutral-500 leading-6 text-xs">{settings.about_content}</p>
        </div>
        <div>
          <div className="font-medium mb-3">دسترسی سریع</div>
          <div className="flex flex-col gap-2 text-neutral-500 text-xs">
            <Link to="/shop">فروشگاه</Link>
            <Link to="/about">درباره ما</Link>
            <Link to="/contact">انتقادات و پیشنهادات</Link>
          </div>
        </div>
        <div>
          <div className="font-medium mb-3">دسته‌بندی‌ها</div>
          <div className="flex flex-col gap-2 text-neutral-500 text-xs">
            {categories.slice(0, 5).map((c) => (
              <Link key={c.id} to={`/shop?category=${c.id}`}>
                {c.name}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="font-medium mb-3">تماس با ما</div>
          <div className="flex flex-col gap-2 text-neutral-500 text-xs">
            {settings.phone && <span>{settings.phone}</span>}
            {settings.address && <span>{settings.address}</span>}
            {settings.working_hours && <span>{settings.working_hours}</span>}
            {settings.rubika_url && (
              <a href={settings.rubika_url} target="_blank" rel="noreferrer">
                روبیکا
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-line text-xs text-neutral-400 text-center">
        {settings.footer_text || `© ${settings.site_name}`}
      </div>
    </footer>
  );
}
