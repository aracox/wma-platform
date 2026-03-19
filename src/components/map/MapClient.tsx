"use client";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useLocale } from "next-intl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { TreatmentFacility, WaterQualitySensor, CommunityReport, SystemStatus, WaterQualityLevel } from "@/types";
import { cn } from "@/lib/utils";
import { X, Building2, Droplets, AlertCircle, Shield, Lock, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store";

const STATUS_COLORS: Record<string, string> = {
  operational:     "#43A047",
  non_operational: "#E53935",
  construction:    "#FFC107",
  cancelled:       "#90A4AE",
};

const QUALITY_COLORS: Record<string, string> = {
  excellent: "#43A047",
  good:      "#8BC34A",
  fair:      "#FFC107",
  poor:      "#FF7043",
  critical:  "#E53935",
};

const REPORT_COLORS: Record<string, string> = {
  odor:      "#9C27B0",
  discharge: "#F44336",
  overflow:  "#FF9800",
  other:     "#607D8B",
};

// Colors for reports filed by officers (type-based)
const REPORT_TYPE_COLORS: Record<string, string> = {
  facility:      "#1B2E6B",  // dark navy — facility issue
  water_quality: "#00BCD4",  // cyan — water quality issue
  community:     "",          // use REPORT_COLORS by category
};

const REPORT_STATUS_BORDER: Record<string, string> = {
  pending:   "#FFC107",
  reviewing: "#1976D2",
  resolved:  "#43A047",
};

interface Layers {
  facilities: boolean;
  waterQuality: boolean;
  reports: boolean;
}

interface Props {
  layers: Layers;
  selectedProvince: string;
}

export default function MapClient({ layers, selectedProvince }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const locale = useLocale();

  const [selectedFacility, setSelectedFacility] = useState<TreatmentFacility | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<WaterQualitySensor | null>(null);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);

  // Facility status update state
  const [pendingFacilityStatus, setPendingFacilityStatus] = useState<SystemStatus | null>(null);
  const [savingFacility, setSavingFacility] = useState(false);
  const [savedFacility, setSavedFacility] = useState(false);

  // Sensor level update state
  const [pendingSensorLevel, setPendingSensorLevel] = useState<WaterQualityLevel | null>(null);
  const [savingSensor, setSavingSensor] = useState(false);
  const [savedSensor, setSavedSensor] = useState(false);

  // Report status update state
  const [pendingStatus, setPendingStatus] = useState<CommunityReport["status"] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [mapReady, setMapReady] = useState(false);
  const [legendOpen, setLegendOpen] = useState({ facilities: true, waterQuality: true, reports: true });
  const toggleLegend = (key: keyof typeof legendOpen) =>
    setLegendOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const currentUser = useAppStore((s) => s.currentUser);

  const facilities = useAppStore((s) => s.facilities);
  const facilitiesLoaded = useAppStore((s) => s.facilitiesLoaded);
  const fetchFacilities = useAppStore((s) => s.fetchFacilities);
  const updateFacilityStatus = useAppStore((s) => s.updateFacilityStatus);

  const sensors = useAppStore((s) => s.sensors);
  const sensorsLoaded = useAppStore((s) => s.sensorsLoaded);
  const fetchSensors = useAppStore((s) => s.fetchSensors);
  const updateSensorLevel = useAppStore((s) => s.updateSensorLevel);

  const reports = useAppStore((s) => s.reports);
  const reportsLoaded = useAppStore((s) => s.reportsLoaded);
  const fetchReports = useAppStore((s) => s.fetchReports);
  const updateReportStatus = useAppStore((s) => s.updateReportStatus);

  // Province officers see only their province's data on the map
  const officerProvince = currentUser?.role === "official" && currentUser.province
    ? currentUser.province
    : null;

  const visibleFacilities = useMemo(
    () => officerProvince ? facilities.filter((f) => f.province === officerProvince) : facilities,
    [facilities, officerProvince]
  );
  const visibleSensors = useMemo(
    () => officerProvince ? sensors.filter((s) => s.province === officerProvince) : sensors,
    [sensors, officerProvince]
  );
  const visibleReports = useMemo(
    () => officerProvince ? reports.filter((r) => r.province === officerProvince) : reports,
    [reports, officerProvince]
  );
  const selectedReportCategory = selectedReport?.category ?? "other";

  useEffect(() => { if (!facilitiesLoaded) fetchFacilities(); }, [facilitiesLoaded, fetchFacilities]);
  useEffect(() => { if (!sensorsLoaded) fetchSensors(); }, [sensorsLoaded, fetchSensors]);
  useEffect(() => { if (!reportsLoaded) fetchReports(); }, [reportsLoaded, fetchReports]);

  // Sync selected items when store data changes
  useEffect(() => {
    if (selectedFacility) {
      const updated = facilities.find((f) => f.id === selectedFacility.id);
      if (updated && updated.status !== selectedFacility.status) setSelectedFacility(updated);
    }
  }, [facilities, selectedFacility]);

  useEffect(() => {
    if (selectedSensor) {
      const updated = sensors.find((s) => s.id === selectedSensor.id);
      if (updated && updated.level !== selectedSensor.level) setSelectedSensor(updated);
    }
  }, [sensors, selectedSensor]);

  useEffect(() => {
    if (selectedReport) {
      const updated = reports.find((r) => r.id === selectedReport.id);
      if (updated && updated.status !== selectedReport.status) setSelectedReport(updated);
    }
  }, [reports, selectedReport]);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((m) => m.remove());
    markers.current = [];
  }, []);

  const addMarkers = useCallback(() => {
    if (!map.current) return;
    clearMarkers();

    // Facilities
    if (layers.facilities) {
      const filtered = selectedProvince
        ? visibleFacilities.filter((f) => f.province === selectedProvince || f.provinceEn === selectedProvince)
        : visibleFacilities;

      filtered.forEach((facility) => {
        const el = document.createElement("div");
        el.className = "facility-marker";
        el.style.cssText = `
          width: 24px; height: 24px; border-radius: 50%;
          background: ${STATUS_COLORS[facility.status] || "#90A4AE"};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: box-shadow 0.15s;
        `;
        el.addEventListener("mouseenter", () => { el.style.boxShadow = "0 0 0 4px rgba(25,118,210,0.3), 0 2px 8px rgba(0,0,0,0.3)"; });
        el.addEventListener("mouseleave", () => { el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"; });
        el.addEventListener("click", () => {
          setSelectedFacility(facility);
          setSelectedSensor(null);
          setSelectedReport(null);
          setPendingFacilityStatus(null);
          setSavedFacility(false);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([facility.lng, facility.lat])
          .addTo(map.current!);
        markers.current.push(marker);
      });
    }

    // Sensors
    if (layers.waterQuality) {
      visibleSensors.forEach((sensor) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: 22px; height: 22px; border-radius: 3px;
          background: ${QUALITY_COLORS[sensor.level] || "#90A4AE"};
          border: 2.5px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          cursor: pointer;
          transition: box-shadow 0.15s;
        `;
        el.addEventListener("mouseenter", () => { el.style.boxShadow = "0 0 0 4px rgba(25,118,210,0.25), 0 2px 6px rgba(0,0,0,0.25)"; });
        el.addEventListener("mouseleave", () => { el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)"; });
        el.addEventListener("click", () => {
          setSelectedSensor(sensor);
          setSelectedFacility(null);
          setSelectedReport(null);
          setPendingSensorLevel(null);
          setSavedSensor(false);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([sensor.lng, sensor.lat])
          .addTo(map.current!);
        markers.current.push(marker);
      });
    }

    // Community reports
    if (layers.reports) {
      visibleReports.forEach((report) => {
        const statusBorder = REPORT_STATUS_BORDER[report.status] || "#FFC107";
        const rType = report.type ?? "community";
        const reportCategory = report.category ?? "other";
        const triColor = rType !== "community"
          ? REPORT_TYPE_COLORS[rType]
          : (REPORT_COLORS[reportCategory] || "#607D8B");
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: box-shadow 0.15s;
          border-radius: 50%;
        `;
        const el = document.createElement("div");
        el.style.cssText = `
          width: 0; height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-bottom: 22px solid ${triColor};
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
          position: relative;
        `;
        const dot = document.createElement("div");
        dot.style.cssText = `
          position: absolute; bottom: -25px; left: 50%; transform: translateX(-50%);
          width: 8px; height: 8px; border-radius: 50%;
          background: ${statusBorder};
          border: 1.5px solid white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        `;
        el.appendChild(dot);
        wrapper.appendChild(el);
        wrapper.addEventListener("mouseenter", () => { wrapper.style.boxShadow = "0 0 0 4px rgba(244,67,54,0.25)"; });
        wrapper.addEventListener("mouseleave", () => { wrapper.style.boxShadow = "none"; });
        wrapper.addEventListener("click", () => {
          setSelectedReport(report);
          setSelectedFacility(null);
          setSelectedSensor(null);
          setPendingStatus(null);
          setSaved(false);
        });

        const marker = new maplibregl.Marker({ element: wrapper, anchor: "center" })
          .setLngLat([report.lng, report.lat])
          .addTo(map.current!);
        markers.current.push(marker);
      });
    }
  }, [layers, selectedProvince, clearMarkers, visibleFacilities, visibleSensors, visibleReports]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [101.0, 13.5],
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 16,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.current.on("load", () => {
      setMapReady(true);
    });

    return () => {
      clearMarkers();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapReady) addMarkers();
  }, [mapReady, layers, selectedProvince, visibleFacilities, visibleSensors, visibleReports, addMarkers]);

  const loadPct = selectedFacility
    ? Math.round((selectedFacility.currentLoad / selectedFacility.capacity) * 100)
    : 0;

  const anyPanelOpen = !!(selectedFacility || selectedSensor || selectedReport);

  function closeAll() {
    setSelectedFacility(null);
    setSelectedSensor(null);
    setSelectedReport(null);
    setPendingFacilityStatus(null);
    setPendingSensorLevel(null);
    setPendingStatus(null);
    setSavedFacility(false);
    setSavedSensor(false);
    setSaved(false);
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Invisible backdrop — clicking outside any panel closes it */}
      {anyPanelOpen && (
        <div
          className="absolute inset-0 z-[5]"
          onClick={closeAll}
        />
      )}

      {/* ── Facility Detail Panel ── */}
      {selectedFacility && (
        <div className="absolute top-4 left-4 w-80 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-up z-10" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-primary-800 to-primary-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-bold">ระบบบำบัดน้ำเสีย</span>
            </div>
            <button onClick={() => setSelectedFacility(null)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-primary-800 text-sm leading-snug">
              {locale === "th" ? selectedFacility.name : selectedFacility.nameEn}
            </h3>
            <div className="flex gap-2 flex-wrap">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold border",
                selectedFacility.status === "operational" ? "badge-operational" :
                selectedFacility.status === "non_operational" ? "badge-non-operational" :
                "badge-construction"
              )}>
                {{ operational: "เปิดใช้งาน", non_operational: "ปิดใช้งาน", construction: "กำลังก่อสร้าง", cancelled: "ยกเลิก" }[selectedFacility.status]}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {locale === "th" ? selectedFacility.province : selectedFacility.provinceEn}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-surface rounded-lg p-2">
                <div className="text-text-secondary mb-0.5">ความจุ</div>
                <div className="font-bold text-primary-800">{selectedFacility.capacity.toLocaleString()} ม.³/วัน</div>
              </div>
              <div className="bg-surface rounded-lg p-2">
                <div className="text-text-secondary mb-0.5">ปริมาณจริง</div>
                <div className="font-bold text-primary-800">{selectedFacility.currentLoad.toLocaleString()} ม.³/วัน</div>
              </div>
            </div>

            {selectedFacility.status === "operational" && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">การใช้งาน</span>
                  <span className={cn("font-bold", loadPct > 90 ? "text-quality-critical" : loadPct > 70 ? "text-quality-fair" : "text-quality-excellent")}>
                    {loadPct}%
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${loadPct}%`,
                    background: loadPct > 90 ? "#E53935" : loadPct > 70 ? "#FFC107" : "#43A047"
                  }} />
                </div>
              </div>
            )}

            <div className="text-xs text-text-secondary">ผู้ดำเนินการ: {selectedFacility.operator}</div>

            {/* Status update — logged-in only */}
            {currentUser ? (
              <div className="bg-surface rounded-lg p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                  <Shield className="h-3.5 w-3.5" />
                  {locale === "th" ? "อัปเดตสถานะ" : "Update Status"}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["operational", "non_operational", "construction", "cancelled"] as SystemStatus[]).map((s) => {
                    const displayStatus = pendingFacilityStatus ?? selectedFacility.status;
                    const isSelected = displayStatus === s;
                    const labels: Record<SystemStatus, string> = {
                      operational: "เปิดใช้งาน",
                      non_operational: "ปิดใช้งาน",
                      construction: "กำลังก่อสร้าง",
                      cancelled: "ยกเลิก",
                    };
                    const colors: Record<SystemStatus, string> = {
                      operational: isSelected ? "bg-green-500 text-white border-green-500" : "border-green-300 text-green-700 hover:bg-green-50",
                      non_operational: isSelected ? "bg-red-500 text-white border-red-500" : "border-red-300 text-red-700 hover:bg-red-50",
                      construction: isSelected ? "bg-yellow-500 text-white border-yellow-500" : "border-yellow-300 text-yellow-700 hover:bg-yellow-50",
                      cancelled: isSelected ? "bg-gray-400 text-white border-gray-400" : "border-gray-300 text-gray-600 hover:bg-gray-50",
                    };
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setPendingFacilityStatus(selectedFacility.status === s ? null : s);
                          setSavedFacility(false);
                        }}
                        className={cn("text-xs font-semibold py-1.5 px-2 rounded-lg border transition-colors text-center", colors[s])}
                      >
                        {labels[s]}
                      </button>
                    );
                  })}
                </div>

                {pendingFacilityStatus && pendingFacilityStatus !== selectedFacility.status && (
                  <button
                    onClick={async () => {
                      setSavingFacility(true);
                      setSavedFacility(false);
                      await updateFacilityStatus(selectedFacility.id, pendingFacilityStatus);
                      setSelectedFacility({ ...selectedFacility, status: pendingFacilityStatus });
                      setSavingFacility(false);
                      setSavedFacility(true);
                      setPendingFacilityStatus(null);
                      setTimeout(() => setSavedFacility(false), 2500);
                    }}
                    disabled={savingFacility}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all",
                      savingFacility
                        ? "bg-primary-300 text-white cursor-wait"
                        : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                    )}
                  >
                    {savingFacility ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {locale === "th" ? "กำลังบันทึก..." : "Saving..."}
                      </>
                    ) : (
                      <>💾 {locale === "th" ? "บันทึก" : "Save"}</>
                    )}
                  </button>
                )}

                {savedFacility && (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-quality-excellent animate-fade-up">
                    ✅ {locale === "th" ? "บันทึกเรียบร้อยแล้ว" : "Saved successfully"}
                  </div>
                )}
                <div className="text-[10px] text-text-secondary">
                  {locale === "th" ? `โดย: ${currentUser.name}` : `By: ${currentUser.nameEn}`}
                </div>
              </div>
            ) : (
              <div className="text-xs text-text-secondary bg-surface rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                {locale === "th" ? "เข้าสู่ระบบเพื่ออัปเดตสถานะ" : "Sign in to update status"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Sensor Detail Panel ── */}
      {selectedSensor && (
        <div className="absolute top-4 left-4 w-80 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-up z-10" onClick={(e) => e.stopPropagation()}>
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: QUALITY_COLORS[selectedSensor.level] }}>
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-bold">สถานีตรวจวัดคุณภาพน้ำ</span>
            </div>
            <button onClick={() => setSelectedSensor(null)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-primary-800 text-sm leading-snug">{selectedSensor.name}</h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { label: "BOD", value: selectedSensor.bod, unit: "mg/L" },
                { label: "COD", value: selectedSensor.cod, unit: "mg/L" },
                { label: "pH", value: selectedSensor.ph, unit: "" },
                { label: "TSS", value: selectedSensor.tss, unit: "mg/L" },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-surface rounded-lg p-2">
                  <div className="text-text-secondary mb-0.5">{label}</div>
                  <div className="font-bold text-primary-800">{value} {unit}</div>
                </div>
              ))}
            </div>

            <div className="text-xs text-text-secondary">
              อัปเดตล่าสุด: {new Date(selectedSensor.timestamp).toLocaleString(locale === "th" ? "th-TH" : "en-US")}
            </div>

            {/* Quality level update — logged-in only */}
            {currentUser ? (
              <div className="bg-surface rounded-lg p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                  <Shield className="h-3.5 w-3.5" />
                  {locale === "th" ? "อัปเดตระดับคุณภาพน้ำ" : "Update Quality Level"}
                </div>
                <div className="flex flex-col gap-1.5">
                  {(["excellent", "good", "fair", "poor", "critical"] as WaterQualityLevel[]).map((lvl) => {
                    const displayLevel = pendingSensorLevel ?? selectedSensor.level;
                    const isSelected = displayLevel === lvl;
                    const labels: Record<WaterQualityLevel, string> = {
                      excellent: "ดีมาก", good: "ดี", fair: "พอใช้", poor: "แย่", critical: "วิกฤต",
                    };
                    return (
                      <button
                        key={lvl}
                        onClick={() => {
                          setPendingSensorLevel(selectedSensor.level === lvl ? null : lvl);
                          setSavedSensor(false);
                        }}
                        className={cn(
                          "flex items-center gap-2 text-xs font-semibold py-1.5 px-3 rounded-lg border transition-colors",
                          isSelected ? "text-white border-transparent" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                        )}
                        style={isSelected ? { background: QUALITY_COLORS[lvl] } : {}}
                      >
                        <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: QUALITY_COLORS[lvl] }} />
                        {labels[lvl]}
                      </button>
                    );
                  })}
                </div>

                {pendingSensorLevel && pendingSensorLevel !== selectedSensor.level && (
                  <button
                    onClick={async () => {
                      setSavingSensor(true);
                      setSavedSensor(false);
                      await updateSensorLevel(selectedSensor.id, pendingSensorLevel);
                      setSelectedSensor({ ...selectedSensor, level: pendingSensorLevel });
                      setSavingSensor(false);
                      setSavedSensor(true);
                      setPendingSensorLevel(null);
                      setTimeout(() => setSavedSensor(false), 2500);
                    }}
                    disabled={savingSensor}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all",
                      savingSensor
                        ? "bg-primary-300 text-white cursor-wait"
                        : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                    )}
                  >
                    {savingSensor ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {locale === "th" ? "กำลังบันทึก..." : "Saving..."}
                      </>
                    ) : (
                      <>💾 {locale === "th" ? "บันทึก" : "Save"}</>
                    )}
                  </button>
                )}

                {savedSensor && (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-quality-excellent animate-fade-up">
                    ✅ {locale === "th" ? "บันทึกเรียบร้อยแล้ว" : "Saved successfully"}
                  </div>
                )}
                <div className="text-[10px] text-text-secondary">
                  {locale === "th" ? `โดย: ${currentUser.name}` : `By: ${currentUser.nameEn}`}
                </div>
              </div>
            ) : (
              <div className="text-xs text-text-secondary bg-surface rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                {locale === "th" ? "เข้าสู่ระบบเพื่ออัปเดตสถานะ" : "Sign in to update status"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Report Detail Panel ── */}
      {selectedReport && (
        <div className="absolute top-4 left-4 w-80 bg-white rounded-xl shadow-xl border border-border overflow-hidden animate-fade-up z-10" onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-bold">รายงานจากชุมชน</span>
            </div>
            <button onClick={() => setSelectedReport(null)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold",
                { odor: "bg-purple-100 text-purple-700", discharge: "bg-red-100 text-red-700", overflow: "bg-orange-100 text-orange-700", other: "bg-gray-100 text-gray-700" }[selectedReportCategory]
              )}>
                {{ odor: "กลิ่นเหม็น", discharge: "ปล่อยน้ำเสีย", overflow: "น้ำล้น", other: "อื่นๆ" }[selectedReportCategory]}
              </span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold",
                { pending: "bg-yellow-100 text-yellow-700", reviewing: "bg-blue-100 text-blue-700", resolved: "bg-green-100 text-green-700" }[selectedReport.status]
              )}>
                {{ pending: "รอดำเนินการ", reviewing: "กำลังตรวจสอบ", resolved: "แก้ไขแล้ว" }[selectedReport.status]}
              </span>
            </div>

            {currentUser ? (
              <div className="bg-surface rounded-lg p-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700">
                  <Shield className="h-3.5 w-3.5" />
                  {locale === "th" ? "อัปเดตสถานะ" : "Update Status"}
                </div>
                <div className="flex gap-1.5">
                  {(["pending", "reviewing", "resolved"] as const).map((s) => {
                    const displayStatus = pendingStatus ?? selectedReport.status;
                    const isSelected = displayStatus === s;
                    const labels: Record<string, string> = { pending: "รอดำเนินการ", reviewing: "กำลังตรวจสอบ", resolved: "แก้ไขแล้ว" };
                    const colors: Record<string, string> = {
                      pending: isSelected ? "bg-yellow-500 text-white border-yellow-500" : "border-yellow-300 text-yellow-700 hover:bg-yellow-50",
                      reviewing: isSelected ? "bg-blue-500 text-white border-blue-500" : "border-blue-300 text-blue-700 hover:bg-blue-50",
                      resolved: isSelected ? "bg-green-500 text-white border-green-500" : "border-green-300 text-green-700 hover:bg-green-50",
                    };
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setPendingStatus(selectedReport.status === s ? null : s);
                          setSaved(false);
                        }}
                        className={cn("flex-1 text-xs font-semibold py-1.5 px-2 rounded-lg border transition-colors", colors[s])}
                      >
                        {labels[s]}
                      </button>
                    );
                  })}
                </div>

                {pendingStatus && pendingStatus !== selectedReport.status && (
                  <button
                    onClick={async () => {
                      setSaving(true);
                      setSaved(false);
                      await updateReportStatus(selectedReport.id, pendingStatus);
                      setSelectedReport({ ...selectedReport, status: pendingStatus });
                      setSaving(false);
                      setSaved(true);
                      setPendingStatus(null);
                      setTimeout(() => setSaved(false), 2500);
                    }}
                    disabled={saving}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all",
                      saving ? "bg-primary-300 text-white cursor-wait" : "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                    )}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {locale === "th" ? "กำลังบันทึก..." : "Saving..."}
                      </>
                    ) : (
                      <>💾 {locale === "th" ? "บันทึก" : "Save"}</>
                    )}
                  </button>
                )}

                {saved && (
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-quality-excellent animate-fade-up">
                    ✅ {locale === "th" ? "บันทึกเรียบร้อยแล้ว" : "Saved successfully"}
                  </div>
                )}
                <div className="text-[10px] text-text-secondary">
                  {locale === "th" ? `โดย: ${currentUser.name}` : `By: ${currentUser.nameEn}`}
                </div>
              </div>
            ) : (
              <div className="text-xs text-text-secondary bg-surface rounded-lg px-3 py-2 flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                {locale === "th" ? "เข้าสู่ระบบเพื่ออัปเดตสถานะ" : "Sign in to update status"}
              </div>
            )}

            <p className="text-sm text-primary-800">{selectedReport.identifiedIssues || "-"}</p>
            <div className="text-xs text-text-secondary space-y-0.5">
              <div>จังหวัด: {selectedReport.province}</div>
              <div>วันที่: {new Date(selectedReport.createdAt).toLocaleString(locale === "th" ? "th-TH" : "en-US")}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      <div className="absolute bottom-8 right-4 bg-white rounded-xl shadow-lg border border-border p-3 text-xs z-10 max-h-[70vh] overflow-y-auto w-44" onClick={(e) => e.stopPropagation()}>
        <div className="font-semibold text-primary-800 mb-2">สัญลักษณ์</div>

        {layers.facilities && (
          <div className="border-t border-border/60 pt-2 pb-1">
            <button
              onClick={() => toggleLegend("facilities")}
              className="w-full flex items-center justify-between gap-1.5 text-left group"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-primary-500 border border-white shadow-sm flex-shrink-0" />
                <span className="font-semibold text-primary-800">ระบบบำบัดน้ำเสีย</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-text-secondary transition-transform duration-200 flex-shrink-0", legendOpen.facilities && "rotate-180")} />
            </button>
            {legendOpen.facilities && (
              <div className="mt-1.5 space-y-0.5 pl-1">
                {[["operational","#43A047","เปิดใช้งาน"],["non_operational","#E53935","ปิดใช้งาน"],["construction","#FFC107","กำลังก่อสร้าง"]].map(([key, color, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="text-text-secondary">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {layers.waterQuality && (
          <div className="border-t border-border/60 pt-2 pb-1">
            <button
              onClick={() => toggleLegend("waterQuality")}
              className="w-full flex items-center justify-between gap-1.5 text-left group"
            >
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-none bg-primary-400 border border-white shadow-sm flex-shrink-0" />
                <span className="font-semibold text-primary-800">คุณภาพน้ำ</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-text-secondary transition-transform duration-200 flex-shrink-0", legendOpen.waterQuality && "rotate-180")} />
            </button>
            {legendOpen.waterQuality && (
              <div className="mt-1.5 space-y-0.5 pl-1">
                {[["#43A047","ดีมาก"],["#8BC34A","ดี"],["#FFC107","พอใช้"],["#FF7043","แย่"],["#E53935","วิกฤต"]].map(([color, label]) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-none flex-shrink-0" style={{ background: color }} />
                    <span className="text-text-secondary">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {layers.reports && (
          <div className="border-t border-border/60 pt-2 pb-1">
            <button
              onClick={() => toggleLegend("reports")}
              className="w-full flex items-center justify-between gap-1.5 text-left group"
            >
              <div className="flex items-center gap-1.5">
                <div className="flex-shrink-0" style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: "9px solid #F44336" }} />
                <span className="font-semibold text-primary-800">รายงานชุมชน</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 text-text-secondary transition-transform duration-200 flex-shrink-0", legendOpen.reports && "rotate-180")} />
            </button>
            {legendOpen.reports && (
              <div className="mt-1.5 pl-1 space-y-1.5">
                <div>
                  <div className="text-[10px] text-text-secondary font-medium mb-0.5">ประเภท (เจ้าหน้าที่):</div>
                  <div className="space-y-0.5">
                    {[["#1B2E6B","ระบบบำบัดน้ำเสีย"],["#00BCD4","คุณภาพน้ำ"]].map(([color, label]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="flex-shrink-0" style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `7px solid ${color}` }} />
                        <span className="text-text-secondary">{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-text-secondary font-medium mb-0.5 mt-1.5">ประเภท (ชุมชน):</div>
                  <div className="space-y-0.5">
                    {[["#9C27B0","กลิ่นเหม็น"],["#F44336","ปล่อยน้ำเสีย"],["#FF9800","น้ำล้น"],["#607D8B","อื่นๆ"]].map(([color, label]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="flex-shrink-0" style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: `7px solid ${color}` }} />
                        <span className="text-text-secondary">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-text-secondary font-medium mb-0.5">สถานะ (จุด):</div>
                  <div className="space-y-0.5">
                    {[["#FFC107","รอดำเนินการ"],["#1976D2","กำลังตรวจสอบ"],["#43A047","แก้ไขแล้ว"]].map(([color, label]) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full flex-shrink-0 border border-white shadow-sm" style={{ background: color }} />
                        <span className="text-text-secondary">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
