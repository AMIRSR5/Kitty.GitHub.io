import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, ShieldCheck } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { label: "صفحه اصلی", to: "/" },
  { label: "فروشگاه", to: "/shop" },
  { label: "دسته‌بندی‌ها", to: "/shop" },
  { label: "درباره ما", to: "/about" },
  { label: "انتقادات و پیشنهادات", to: "/contact" },
];

export default function Header() {
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/85 backdrop-blur-md border-b border-line shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-5 py-4">
        <Link to="/" className="text-xl font-bold tracking-tight">
          {settings.site_name}
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-700">
          {NAV.map((item) => (
            <Link key={item.label} to={item.to} className="hover:text-ink transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="جستجو"
            onClick={() => setSearchOpen((v) => !v)}
            className="w-9 h-9 rounded-full border border-line hover:bg-mist transition-colors flex items-center justify-center"
          >
            <Search size={16} />
          </button>
          {user && (
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1 text-xs border border-line rounded-full px-3 py-1.5 hover:bg-mist transition-colors"
            >
              <ShieldCheck size={14} /> پنل مدیریت
            </Link>
          )}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="منو"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-line bg-white px-5 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            <Search size={16} className="text-neutral-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجوی محصول، دسته‌بندی، برند..."
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
        </form>
      )}

      {menuOpen && (
        <div className="md:hidden px-5 pb-4 flex flex-col gap-3 text-sm text-neutral-700 border-t border-line bg-white">
          {NAV.map((item) => (
            <Link key={item.label} to={item.to} className="pt-3" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          {user && (
            <Link to="/admin" className="pt-1 text-ink font-medium" onClick={() => setMenuOpen(false)}>
              پنل مدیریت
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
