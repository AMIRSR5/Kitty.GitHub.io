import { useState } from "react";
import { MapPin, Phone, Clock, Send } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { submitFeedback } from "@/services/feedback";
import { useToast } from "@/hooks/useToast";

export default function Contact() {
  const { settings } = useSiteSettings();
  const { push } = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      push("لطفاً فیلدهای الزامی را پر کنید.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback({ ...form, phone: form.phone || null });
      push("پیام شما با موفقیت ارسال شد.", "success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      push("ارسال پیام با خطا مواجه شد.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <h1 className="text-2xl font-bold mb-6">تماس با ما</h1>
        <div className="space-y-4 text-sm text-neutral-600 mb-8">
          {settings.phone && (
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-neutral-400" /> {settings.phone}
            </div>
          )}
          {settings.address && (
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-neutral-400" /> {settings.address}
            </div>
          )}
          {settings.working_hours && (
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-neutral-400" /> {settings.working_hours}
            </div>
          )}
        </div>

        {settings.location_url && (
          <a
            href={settings.location_url}
            target="_blank"
            rel="noreferrer"
            className="block rounded-2xl overflow-hidden border border-line h-56 bg-mist flex items-center justify-center text-sm text-neutral-400 hover:text-ink transition-colors"
          >
            مشاهده موقعیت روی نقشه
          </a>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-2">انتقادات و پیشنهادات</h2>
        <p className="text-sm text-neutral-500 mb-6">نظر شما به ما در بهتر شدن کمک می‌کند.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="نام شما"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-ink transition-colors"
          />
          <input
            type="email"
            placeholder="ایمیل"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-ink transition-colors"
          />
          <input
            placeholder="شماره تماس (اختیاری)"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-ink transition-colors"
          />
          <input
            placeholder="موضوع"
            value={form.subject}
            onChange={(e) => update("subject", e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-ink transition-colors"
          />
          <textarea
            placeholder="متن پیام"
            rows={5}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className="w-full border border-line rounded-xl px-4 py-3 text-sm outline-none focus:border-ink transition-colors resize-none"
          />
          <button
            disabled={submitting}
            className="w-full bg-ink text-white text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <Send size={16} /> {submitting ? "در حال ارسال..." : "ارسال پیام"}
          </button>
        </form>
      </div>
    </div>
  );
}
