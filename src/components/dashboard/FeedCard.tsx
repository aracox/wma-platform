import { useLocale, useFormatter } from "next-intl";
import { cn } from "@/lib/utils";
import { FeedItem } from "@/types";
import { Calendar, ExternalLink } from "lucide-react";

const sourceStyles: Record<string, string> = {
  wma: "bg-primary-100 text-primary-700",
  chula: "bg-chula-100 text-chula-700",
  community: "bg-quality-good/10 text-quality-good",
  government: "bg-gray-100 text-gray-600",
};

const sourceLabels: Record<string, string> = {
  wma: "WMA",
  chula: "Chula",
  community: "ชุมชน",
  government: "ภาครัฐ",
};

interface Props { item: FeedItem; }

export default function FeedCard({ item }: Props) {
  const locale = useLocale();
  const format = useFormatter();
  const title = locale === "th" ? item.title : item.titleEn;
  const summary = locale === "th" ? item.summary : item.summaryEn;

  return (
    <div className="kpi-card flex gap-4 p-4 group cursor-pointer">
      {item.imageUrl && (
        <img src={item.imageUrl} alt={title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", sourceStyles[item.source])}>
            {sourceLabels[item.source]}
          </span>
          <span className="flex items-center gap-1 text-xs text-text-secondary">
            <Calendar className="h-3 w-3" />
            {format.dateTime(new Date(item.publishedAt), { year: "numeric", month: "numeric", day: "numeric" })}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-primary-800 truncate group-hover:text-primary-600 transition-colors">{title}</h4>
        <p className="text-xs text-text-secondary mt-1 line-clamp-2">{summary}</p>
      </div>
      <ExternalLink className="h-4 w-4 text-border flex-shrink-0 mt-1 group-hover:text-primary-400 transition-colors" />
    </div>
  );
}
