import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { Building2, Droplets, Users, Wind, ArrowRight, MapPin, AlertCircle } from "lucide-react";
import KPICard from "@/components/dashboard/KPICard";
import FeedCard from "@/components/dashboard/FeedCard";
import StatusDonut from "@/components/dashboard/StatusDonutClient";
import { FeedItem } from "@/types";

// Mock data - replace with API calls
const MOCK_KPI = [
  { id: "systems", value: 216, trend: 4.2, color: "#1976D2", icon: "building" },
  { id: "volume", value: "572.9", trend: 1.8, color: "#4DB8E8", icon: "droplets" },
];

const MOCK_STATUS = [
  { status: "operational", count: 152 },
  { status: "non_operational", count: 28 },
  { status: "construction", count: 24 },
  { status: "cancelled", count: 12 },
];

const MOCK_FEED: FeedItem[] = [
  {
    id: "1", type: "news", source: "wma",
    title: "เปิดใช้งานระบบบำบัดน้ำเสียแห่งใหม่ที่จังหวัดเชียงใหม่",
    titleEn: "New wastewater treatment system launched in Chiang Mai",
    summary: "องค์การจัดการน้ำเสียเปิดใช้งานระบบบำบัดน้ำเสียแห่งใหม่ความจุ 5,000 ม.³/วัน",
    summaryEn: "WMA launched a new 5,000 m³/day treatment system in Chiang Mai province.",
    publishedAt: "2026-03-15",
  },
  {
    id: "2", type: "research", source: "chula",
    title: "ผลการศึกษาคุณภาพน้ำในแม่น้ำเจ้าพระยา ประจำปี 2568",
    titleEn: "Annual Chao Phraya River Water Quality Study 2025",
    summary: "จุฬาลงกรณ์มหาวิทยาลัยเผยผลการตรวจวัดคุณภาพน้ำ พบค่า BOD ลดลง 12% จากปีก่อน",
    summaryEn: "Chulalongkorn University reports 12% BOD reduction in Chao Phraya compared to last year.",
    publishedAt: "2026-03-10",
  },
  {
    id: "3", type: "alert", source: "community",
    title: "แจ้งเหตุน้ำเสียในคลองแสนแสบ เขตมีนบุรี",
    titleEn: "Wastewater alert - Saen Saep Canal, Min Buri district",
    summary: "ชุมชนรายงานพบน้ำเสียบริเวณคลองแสนแสบ กำลังดำเนินการตรวจสอบ",
    summaryEn: "Community reported wastewater discharge near Saen Saep Canal. Investigation underway.",
    publishedAt: "2026-03-18",
  },
];

const ICONS: Record<string, React.ReactNode> = {
  building: <Building2 className="h-6 w-6" />,
  droplets: <Droplets className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  wind: <Wind className="h-6 w-6" />,
};

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative wave-divider bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 text-white py-20 px-4 overflow-hidden">
        {/* Decorative water circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-300/10 rounded-full" />
          <div className="absolute bottom-0 -left-10 w-64 h-64 bg-primary-400/10 rounded-full" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-6 mb-6 opacity-80">
            <div className="flex flex-col items-center">
              <Droplets className="h-8 w-8 text-primary-300 mb-1" />
              <span className="text-xs text-primary-300">WMA</span>
            </div>
            <div className="w-px bg-chula-500/50" />
            <div className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-chula-500/30 flex items-center justify-center mb-1">
                <span className="text-chula-300 text-xs font-bold">CU</span>
              </div>
              <span className="text-xs text-chula-300">Chula</span>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {t("hero.title")}
          </h1>
          <p className="text-primary-200 text-lg mb-8 max-w-2xl mx-auto">{t("hero.subtitle")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/map`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-800 font-semibold rounded-xl hover:bg-primary-100 transition-colors shadow-lg"
            >
              <MapPin className="h-5 w-5" />
              {t("hero.cta_map")}
            </Link>
            <Link
              href={`/${locale}/report`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-chula-500 text-white font-semibold rounded-xl hover:bg-chula-700 transition-colors shadow-lg"
            >
              <AlertCircle className="h-5 w-5" />
              {t("hero.cta_report")}
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="max-w-4xl mx-auto px-4 py-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_KPI.map((kpi) => (
            <KPICard
              key={kpi.id}
              label={t(`kpi.${kpi.id}`)}
              value={kpi.value}
              unit={t(`kpi.${kpi.id}_unit`)}
              trend={kpi.trend}
              icon={ICONS[kpi.icon]}
              accentColor={kpi.color}
            />
          ))}
        </div>
      </section>

      {/* Status + Feed */}
      <section className="max-w-7xl mx-auto px-4 pb-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status donut */}
          <div className="lg:col-span-1">
            <StatusDonut data={MOCK_STATUS} />
          </div>
          {/* Feed */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary-800">{t("latest_reports")}</h2>
              <Link href={`/${locale}/feed`} className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium">
                {tCommon("view_all")} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {MOCK_FEED.map((item) => <FeedCard key={item.id} item={item} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Chula Research Strip */}
      <section className="bg-chula-100 border-t border-chula-300/20 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-chula-700 text-xs font-semibold uppercase tracking-wider mb-1">{t("research_highlight")}</div>
            <h3 className="text-primary-800 font-bold text-lg">โครงการวิจัยจุฬาลงกรณ์มหาวิทยาลัย</h3>
            <p className="text-text-secondary text-sm mt-1">ติดตามงานวิจัยด้านการจัดการน้ำเสียและสิ่งแวดล้อม</p>
          </div>
          <Link
            href={`/${locale}/feed`}
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-chula-500 text-white font-semibold rounded-xl hover:bg-chula-700 transition-colors text-sm"
          >
            ดูงานวิจัย <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
