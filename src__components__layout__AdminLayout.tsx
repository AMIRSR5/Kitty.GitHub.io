import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Settings as SettingsIcon,
  MessageSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const LINKS = [
  { to: "/admin", label: "داشبورد", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "محصولات", icon: Package },
  { to: "/admin/categories", label: "دسته‌بندی‌ها", icon: FolderTree },
  { to: "/admin/feedback", label: "پیام‌ها", icon: MessageSquare },
  { to: "/admin/settings", label: "تنظیمات سایت", icon: SettingsIcon },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen flex bg-mist">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:flex-col w-60 border-l border-line bg-white p-5">
        <SidebarContent onSignOut={signOut} />
      </aside>

      {/* Sidebar - mobile */}
      {open && (
        <div className="fixed inset-0 z-[150] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-64 bg-white p-5">
            <SidebarContent onSignOut={signOut} onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-line">
          <span className="font-bold">پنل مدیریت</span>
          <button onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
        </div>
        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ onSignOut, onNavigate }: { onSignOut: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="font-bold text-lg">بابک شاپ</div>
        {onNavigate && (
          <button onClick={onNavigate} className="md:hidden">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive ? "bg-ink text-white" : "text-neutral-600 hover:bg-mist"
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
      <button
        onClick={onSignOut}
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors mt-4"
      >
        <LogOut size={16} /> خروج
      </button>
    </>
  );
}
