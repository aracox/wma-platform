"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import LaoDirectoryMapView from "@/components/map/LaoDirectoryMapView";
import TreatmentMapView from "@/components/map/TreatmentMapView";

const TABS = [
  { key: "lao", label: "แผนที่ อปท." },
  { key: "treatment", label: "แผนที่ระบบบำบัดน้ำเสีย" },
] as const;

function LaoMapPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = searchParams.get("tab") === "treatment" ? "treatment" : "lao";

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    if (tab === "lao") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Tab switcher */}
      <div className="bg-white border-b border-gray-200 px-4 pt-2 flex items-center gap-1 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 transition-colors -mb-px",
              activeTab === tab.key
                ? "border-primary-600 text-primary-700"
                : "border-transparent text-text-secondary hover:text-primary-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {activeTab === "lao" ? <LaoDirectoryMapView /> : <TreatmentMapView />}
      </div>
    </div>
  );
}

export default function LaoMapPage() {
  return (
    <Suspense>
      <LaoMapPageInner />
    </Suspense>
  );
}
