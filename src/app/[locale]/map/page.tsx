"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Building2, Droplets, AlertCircle, Layers, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";

const MapClient = dynamic(() => import("@/components/map/MapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-primary-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-primary-600 font-medium text-sm">กำลังโหลดแผนที่...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [layers, setLayers] = useState({ facilities: true, waterQuality: true, reports: true });
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");

  const facilities = useAppStore((s) => s.facilities);
  const facilitiesLoaded = useAppStore((s) => s.facilitiesLoaded);
  const fetchFacilities = useAppStore((s) => s.fetchFacilities);

  useEffect(() => { if (!facilitiesLoaded) fetchFacilities(); }, [facilitiesLoaded, fetchFacilities]);

  const toggleLayer = (key: keyof typeof layers) =>
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  const provinces = [...new Set(facilities.map((f) => f.province))].sort();
  const stats = {
    operational: facilities.filter((f) => f.status === "operational").length,
    non_operational: facilities.filter((f) => f.status === "non_operational").length,
    construction: facilities.filter((f) => f.status === "construction").length,
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Toolbar */}
      <div className="bg-white border-b border-border px-4 py-2.5 flex items-center gap-3 flex-shrink-0 shadow-sm">
        <h1 className="font-bold text-primary-800 text-base hidden sm:block">แผนที่ระบบบำบัดน้ำเสีย</h1>

        {/* Quick stats */}
        <div className="hidden md:flex items-center gap-3 text-xs ml-2">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-quality-excellent" /><span className="text-text-secondary">{stats.operational} เปิดใช้งาน</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-quality-critical" /><span className="text-text-secondary">{stats.non_operational} ปิดใช้งาน</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-quality-fair" /><span className="text-text-secondary">{stats.construction} ก่อสร้าง</span></div>
        </div>

        <div className="flex-1" />

        {/* Province filter */}
        <div className="relative">
          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-border text-sm text-text-secondary focus:border-primary-400 focus:outline-none bg-white cursor-pointer"
          >
            <option value="">ทุกจังหวัด</option>
            {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-secondary pointer-events-none" />
        </div>

        {/* Layer toggle */}
        <div className="relative">
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors",
              showLayerPanel ? "border-primary-400 text-primary-700 bg-primary-50" : "border-border text-text-secondary hover:border-primary-300"
            )}
          >
            <Layers className="h-4 w-4" /> ชั้นข้อมูล
          </button>
          {showLayerPanel && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-border shadow-xl p-3 w-52 z-20 space-y-2">
              {[
                { key: "facilities" as const, icon: Building2, label: "ระบบบำบัดน้ำเสีย", color: "text-primary-600" },
                { key: "waterQuality" as const, icon: Droplets, label: "คุณภาพน้ำ", color: "text-quality-good" },
                { key: "reports" as const, icon: AlertCircle, label: "รายงานชุมชน", color: "text-orange-500" },
              ].map(({ key, icon: Icon, label, color }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0",
                    layers[key] ? "border-primary-500 bg-primary-500" : "border-border bg-white group-hover:border-primary-300"
                  )}>
                    {layers[key] && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={layers[key]} onChange={() => toggleLayer(key)} />
                  <Icon className={cn("h-4 w-4 flex-shrink-0", color)} />
                  <span className="text-sm text-text-secondary">{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map fills remaining height */}
      <div className="flex-1 relative overflow-hidden">
        <MapClient layers={layers} selectedProvince={selectedProvince} />
      </div>
    </div>
  );
}
