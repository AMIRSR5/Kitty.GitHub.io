import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-neutral-400">در حال بررسی ورود...</div>;
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
}
