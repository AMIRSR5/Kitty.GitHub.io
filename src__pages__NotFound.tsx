import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-5 py-32 text-center">
      <div className="text-6xl font-bold mb-4">۴۰۴</div>
      <p className="text-neutral-500 mb-6">صفحه مورد نظر پیدا نشد.</p>
      <Link to="/" className="text-ink underline text-sm">
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}
