import { useEffect, useState } from "react";
import { fetchSiteSettings, updateSiteSettings } from "@/services/settings";
import { useToast } from "@/hooks/useToast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import type { SiteSettings } from "@/types";

export default function AdminSettings() {
  const { refresh } = useSiteSettings();
  const { push } = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const { id, ...rest } = settings;
      await updateSiteSettings(id, rest);
      await refresh();
      push("تنظیمات ذخیره شد.", "success");
    } catch {
      push("ذخیره‌سازی با خطا مواجه شد.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-400">در حال بارگذاری...</p>;
  if (!settings) return <p className="text-sm text-red-500">ردیف تنظیمات سایت پیدا نشد. ابتدا SQL Seed را اجرا کنید.</p>;

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold">تنظیمات سایت</h1>

      <Section title="عمومی">
        <Field label="نام سایت">
          <input className="input" value={settings.site_name} onChange={(e) => update("site_name", e.target.value)} />
        </Field>
        <Field label="لوگو (URL)">
          <input className="input" dir="ltr" value={settings.logo_url ?? ""} onChange={(e) => update("logo_url", e.target.value)} />
        </Field>
        <Field label="Favicon (URL)">
          <input className="input" dir="ltr" value={settings.favicon_url ?? ""} onChange={(e) => update("favicon_url", e.target.value)} />
        </Field>
      </Section>

      <Section title="Hero">
        <Field label="عنوان Hero">
          <input className="input" value={settings.hero_title} onChange={(e) => update("hero_title", e.target.value)} />
        </Field>
        <Field label="زیرعنوان Hero">
          <input className="input" value={settings.hero_description} onChange={(e) => update("hero_description", e.target.value)} />
        </Field>
        <Field label="تصویر Hero (URL)">
          <input className="input" dir="ltr" value={settings.hero_image ?? ""} onChange={(e) => update("hero_image", e.target.value)} />
        </Field>
      </Section>

      <Section title="درباره ما">
        <Field label="عنوان">
          <input className="input" value={settings.about_title} onChange={(e) => update("about_title", e.target.value)} />
        </Field>
        <Field label="متن">
          <textarea className="input resize-none" rows={4} value={settings.about_content} onChange={(e) => update("about_content", e.target.value)} />
        </Field>
      </Section>

      <Section title="تماس و موقعیت">
        <Field label="تلفن"><input className="input" value={settings.phone ?? ""} onChange={(e) => update("phone", e.target.value)} /></Field>
        <Field label="ایمیل"><input className="input" dir="ltr" value={settings.email ?? ""} onChange={(e) => update("email", e.target.value)} /></Field>
        <Field label="آدرس"><input className="input" value={settings.address ?? ""} onChange={(e) => update("address", e.target.value)} /></Field>
        <Field label="لینک Google Maps"><input className="input" dir="ltr" value={settings.location_url ?? ""} onChange={(e) => update("location_url", e.target.value)} /></Field>
        <Field label="ساعت کاری"><input className="input" value={settings.working_hours ?? ""} onChange={(e) => update("working_hours", e.target.value)} /></Field>
      </Section>

      <Section title="لینک‌ها و شبکه‌های اجتماعی">
        <Field label="لینک عمومی روبیکا"><input className="input" dir="ltr" value={settings.rubika_url ?? ""} onChange={(e) => update("rubika_url", e.target.value)} /></Field>
        <Field label="لینک عمومی ترب"><input className="input" dir="ltr" value={settings.torob_url ?? ""} onChange={(e) => update("torob_url", e.target.value)} /></Field>
        <Field label="اینستاگرام"><input className="input" dir="ltr" value={settings.instagram_url ?? ""} onChange={(e) => update("instagram_url", e.target.value)} /></Field>
        <Field label="تلگرام"><input className="input" dir="ltr" value={settings.telegram_url ?? ""} onChange={(e) => update("telegram_url", e.target.value)} /></Field>
      </Section>

      <Section title="فوتر و انتقادات">
        <Field label="متن فوتر"><input className="input" value={settings.footer_text ?? ""} onChange={(e) => update("footer_text", e.target.value)} /></Field>
        <Field label="ایمیل دریافت انتقادات و پیشنهادات">
          <input className="input" dir="ltr" value={settings.feedback_email} onChange={(e) => update("feedback_email", e.target.value)} />
        </Field>
      </Section>

      <button disabled={saving} className="bg-ink text-white text-sm px-6 py-3 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">
        {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
      </button>

      <style>{`.input { width: 100%; border: 1px solid #e5e5e5; border-radius: 0.75rem; padding: 0.6rem 1rem; font-size: 0.875rem; outline: none; } .input:focus { border-color: #0a0a0a; }`}</style>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-2xl p-6 space-y-3">
      <div className="text-sm font-medium mb-1">{title}</div>
      {children}
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-neutral-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
