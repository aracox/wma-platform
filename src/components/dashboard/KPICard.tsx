import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  unit: string;
  trend?: number;
  icon: React.ReactNode;
  accentColor?: string;
  className?: string;
}

export default function KPICard({ label, value, unit, trend, icon, accentColor = "#1976D2", className }: KPICardProps) {
  return (
    <div className={cn("kpi-card group", className)}>
      <div className="flex items-start justify-between mb-4">
        <div
          className="p-2.5 rounded-xl"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend >= 0 ? "bg-quality-excellent/10 text-quality-excellent" : "bg-quality-critical/10 text-quality-critical"
          )}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary-800" style={{ color: accentColor }}>{value}</span>
          <span className="text-sm text-text-secondary">{unit}</span>
        </div>
        <p className="text-sm text-text-secondary font-medium">{label}</p>
      </div>
      {/* Bottom accent bar */}
      <div className="mt-4 h-1 rounded-full bg-border overflow-hidden">
        <div className="h-full w-3/4 rounded-full" style={{ backgroundColor: accentColor, opacity: 0.4 }} />
      </div>
    </div>
  );
}
