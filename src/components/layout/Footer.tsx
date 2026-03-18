import { useTranslations } from "next-intl";
import { Droplets } from "lucide-react";

export default function Footer() {
  const t = useTranslations("common");
  return (
    <footer className="bg-primary-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4 text-xs text-white/40">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Droplets className="h-3 w-3 text-primary-400" />
            <span className="text-white/60">{t("by_wma")}</span>
          </span>
          <span className="text-white/20">·</span>
          <span className="text-chula-400/80">{t("research_by")}</span>
        </div>
        <span suppressHydrationWarning>© {new Date().getFullYear()} WMA & Chulalongkorn University</span>
      </div>
    </footer>
  );
}
