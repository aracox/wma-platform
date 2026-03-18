import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number, locale: string = "th-TH"): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function getQualityColor(level: "excellent" | "good" | "fair" | "poor" | "critical"): string {
  const map = {
    excellent: "#43A047",
    good: "#8BC34A",
    fair: "#FFC107",
    poor: "#FF7043",
    critical: "#E53935",
  };
  return map[level];
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    operational: "badge-operational",
    non_operational: "badge-non-operational",
    construction: "badge-construction",
    cancelled: "bg-gray-100 text-gray-500 border border-gray-200",
  };
  return map[status] ?? "bg-gray-100 text-gray-500";
}
