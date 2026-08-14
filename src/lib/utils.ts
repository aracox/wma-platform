import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateBE(dateStr: string | number | Date | undefined | null, locale: string = "th"): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      if (locale === "th" || locale.startsWith("th")) {
        return String(dateStr).replace(/\b(19|20)\d{2}\b/g, (year) => String(parseInt(year, 10) + 543));
      }
      return String(dateStr);
    }

    const isTh = locale === "th" || locale.startsWith("th");
    const year = d.getFullYear();
    const displayYear = isTh ? year + 543 : year;
    const day = d.getDate();

    if (isTh) {
      const thaiMonths = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      return `${day} ${thaiMonths[d.getMonth()]} ${displayYear}`;
    } else {
      const enMonths = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return `${day} ${enMonths[d.getMonth()]} ${displayYear}`;
    }
  } catch {
    return String(dateStr);
  }
}

export function formatDateTimeBE(dateStr: string | number | Date | undefined | null, locale: string = "th"): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const isTh = locale === "th" || locale.startsWith("th");
    const dateFormatted = formatDateBE(d, locale);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return isTh ? `${dateFormatted} ${hours}:${minutes} น.` : `${dateFormatted} ${hours}:${minutes}`;
  } catch {
    return String(dateStr);
  }
}
