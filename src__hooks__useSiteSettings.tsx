import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { SiteSettings } from "@/types";
import { fetchSiteSettings } from "@/services/settings";

const DEFAULTS: SiteSettings = {
  id: "",
  site_name: "بابک شاپ",
  logo_url: null,
  favicon_url: null,
  hero_title: "بابک شاپ",
  hero_description: "زیبایی، کیفیت، انتخابی مطمئن",
  hero_image: null,
  about_title: "درباره بابک شاپ",
  about_content: "ارائه‌دهنده لوازم آرایشی و بهداشتی اصل و باکیفیت.",
  phone: null,
  email: null,
  address: null,
  location_url: null,
  working_hours: null,
  rubika_url: import.meta.env.VITE_DEFAULT_RUBIKA_URL ?? null,
  torob_url: null,
  instagram_url: null,
  telegram_url: null,
  feedback_email: "sa0ar0a0@gmail.com",
  footer_text: null,
};

interface Ctx {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<Ctx>({ settings: DEFAULTS, loading: true, refresh: async () => {} });

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await fetchSiteSettings();
      if (data) setSettings(data);
    } catch (e) {
      // fall back to DEFAULTS silently — the storefront should still render
      // eslint-disable-next-line no-console
      console.error("Failed to load site settings", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh: load }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
