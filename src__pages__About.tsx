import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function About() {
  const { settings } = useSiteSettings();
  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      {settings.hero_image && (
        <img
          src={settings.hero_image}
          alt={settings.about_title}
          className="w-full aspect-video object-cover rounded-2xl mb-8"
        />
      )}
      <h1 className="text-3xl font-bold mb-4">{settings.about_title}</h1>
      <p className="text-neutral-600 leading-8 whitespace-pre-line">{settings.about_content}</p>
    </div>
  );
}
