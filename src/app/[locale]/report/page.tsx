"use client";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Building2, Droplets, AlertCircle, Send, CheckCircle, Lock, Shield, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { CommunityReport, SystemStatus } from "@/types";

type ReportType = "facility" | "water_quality" | "community";

const COMMUNITY_CATEGORIES = ["odor", "discharge", "overflow", "other"] as const;

const STATUS_LABELS: Record<string, { th: string; color: string }> = {
  pending:   { th: "รอดำเนินการ",    color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  reviewing: { th: "กำลังตรวจสอบ",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  resolved:  { th: "แก้ไขแล้ว",      color: "bg-green-100 text-green-700 border-green-200" },
};

const TYPE_LABELS: Record<ReportType, { th: string; icon: any; color: string; bg: string }> = {
  facility:      { th: "ระบบบำบัดน้ำเสีย", icon: Building2,   color: "text-primary-700",  bg: "bg-primary-50 border-primary-400" },
  water_quality: { th: "คุณภาพน้ำ",         icon: Droplets,    color: "text-cyan-700",     bg: "bg-cyan-50 border-cyan-400" },
  community:     { th: "รายงานชุมชน",        icon: AlertCircle, color: "text-orange-700",   bg: "bg-orange-50 border-orange-400" },
};

const CAT_LABELS: Record<string, string> = {
  odor: "กลิ่นเหม็น", discharge: "ปล่อยน้ำเสีย", overflow: "น้ำล้น", other: "อื่นๆ",
};

export default function ReportPage() {
  const locale = useLocale();
  const router = useRouter();

  const currentUser = useAppStore((s) => s.currentUser);
  const facilities = useAppStore((s) => s.facilities);
  const sensors = useAppStore((s) => s.sensors);
  const reports = useAppStore((s) => s.reports);
  const facilitiesLoaded = useAppStore((s) => s.facilitiesLoaded);
  const sensorsLoaded = useAppStore((s) => s.sensorsLoaded);
  const reportsLoaded = useAppStore((s) => s.reportsLoaded);
  const fetchFacilities = useAppStore((s) => s.fetchFacilities);
  const fetchSensors = useAppStore((s) => s.fetchSensors);
  const fetchReports = useAppStore((s) => s.fetchReports);
  const updateReportStatus = useAppStore((s) => s.updateReportStatus);

  useEffect(() => { if (!facilitiesLoaded) fetchFacilities(); }, [facilitiesLoaded, fetchFacilities]);
  useEffect(() => { if (!sensorsLoaded) fetchSensors(); }, [sensorsLoaded, fetchSensors]);
  useEffect(() => { if (!reportsLoaded) fetchReports(); }, [reportsLoaded, fetchReports]);

  // Form state
  const [activeTab, setActiveTab] = useState<ReportType>("facility");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [selectedSensorId, setSelectedSensorId] = useState("");
  const [communityCategory, setCommunityCategory] = useState<"odor" | "discharge" | "overflow" | "other">("odor");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Report list state
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState<string | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, CommunityReport["status"]>>({});

  const isAdmin = currentUser?.role === "admin";
  const hasProvince = !!currentUser?.province;

  // Province filter for officers
  const provinceFilter = isAdmin ? null : currentUser?.province;

  // Filtered data for form dropdowns
  const myFacilities = provinceFilter
    ? facilities.filter((f) => f.province === provinceFilter)
    : facilities;
  const mySensors = provinceFilter
    ? sensors.filter((s) => s.province === provinceFilter)
    : sensors;

  // Filtered reports for the list below
  const myReports = provinceFilter
    ? reports.filter((r) => r.province === provinceFilter)
    : reports;

  const selectedFacility = facilities.find((f) => f.id === selectedFacilityId);
  const selectedSensor = sensors.find((s) => s.id === selectedSensorId);

  const canSubmit = description.trim().length > 0 && (
    activeTab === "community" ||
    (activeTab === "facility" && selectedFacilityId) ||
    (activeTab === "water_quality" && selectedSensorId)
  );

  const handleSubmit = async () => {
    if (!canSubmit || !currentUser) return;
    setSubmitting(true);

    let lat = currentUser.provinceLat ?? 13.7563;
    let lng = currentUser.provinceLng ?? 100.5018;

    if (activeTab === "facility" && selectedFacility) {
      lat = selectedFacility.lat;
      lng = selectedFacility.lng;
    } else if (activeTab === "water_quality" && selectedSensor) {
      lat = selectedSensor.lat;
      lng = selectedSensor.lng;
    }

    const body = {
      type: activeTab,
      category: activeTab === "community" ? communityCategory : "other",
      description,
      lat,
      lng,
      province: currentUser.province || "ไม่ระบุ",
      reportedBy: currentUser.id,
      ...(activeTab === "facility" && selectedFacility && {
        facilityId: selectedFacility.id,
        facilityName: selectedFacility.name,
      }),
      ...(activeTab === "water_quality" && selectedSensor && {
        sensorId: selectedSensor.id,
        sensorName: selectedSensor.name,
      }),
    };

    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(true);
        setDescription("");
        setSelectedFacilityId("");
        setSelectedSensorId("");
        await fetchReports();
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = (reportId: string, status: CommunityReport["status"]) => {
    setPendingStatuses((prev) => ({ ...prev, [reportId]: status }));
    setStatusSaved(null);
  };

  const handleStatusSave = async (reportId: string) => {
    const newStatus = pendingStatuses[reportId];
    if (!newStatus) return;
    setStatusUpdating(reportId);
    await updateReportStatus(reportId, newStatus);
    setPendingStatuses((prev) => { const n = { ...prev }; delete n[reportId]; return n; });
    setStatusUpdating(null);
    setStatusSaved(reportId);
    setTimeout(() => setStatusSaved(null), 2000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-4 animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-primary-400" />
          </div>
          <h2 className="text-xl font-bold text-primary-800">กรุณาเข้าสู่ระบบก่อน</h2>
          <p className="text-text-secondary text-sm">เจ้าหน้าที่ต้องเข้าสู่ระบบเพื่อแจ้งปัญหา</p>
          <button
            onClick={() => router.push(`/${locale}/auth/login`)}
            className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">แจ้งปัญหา / รายงานสถานการณ์</h1>
          <p className="text-text-secondary text-sm mt-1">บันทึกปัญหาที่พบเพื่อให้ปรากฏบนแผนที่</p>
        </div>
        {currentUser.province && (
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-xl text-xs font-semibold text-primary-700">
            <Shield className="h-3.5 w-3.5" />
            {currentUser.province}
          </div>
        )}
        {isAdmin && (
          <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-chula-50 border border-chula-200 rounded-xl text-xs font-semibold text-chula-700">
            <Shield className="h-3.5 w-3.5" />
            ผู้ดูแลระบบ (ทุกจังหวัด)
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* 3 Tab buttons */}
        <div className="grid grid-cols-3 border-b border-border">
          {(["facility", "water_quality", "community"] as ReportType[]).map((tab) => {
            const { th, icon: Icon, color, bg } = TYPE_LABELS[tab];
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSubmitted(false); }}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-4 px-2 text-xs font-semibold border-b-2 transition-all",
                  active
                    ? `border-primary-500 ${color} bg-primary-50/60`
                    : "border-transparent text-text-secondary hover:text-primary-600 hover:bg-primary-50/40"
                )}
              >
                <Icon className={cn("h-5 w-5", active ? color : "text-text-secondary")} />
                <span className="text-center leading-tight">{th}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-5">
          {submitted && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold animate-fade-up">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              บันทึกรายงานเรียบร้อยแล้ว — ปรากฏบนแผนที่แล้ว
              <button onClick={() => setSubmitted(false)} className="ml-auto"><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* Tab: ระบบบำบัดน้ำเสีย */}
          {activeTab === "facility" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2">
                  เลือกระบบบำบัดน้ำเสีย {provinceFilter && <span className="text-text-secondary font-normal">({provinceFilter})</span>}
                </label>
                <div className="relative">
                  <select
                    value={selectedFacilityId}
                    onChange={(e) => setSelectedFacilityId(e.target.value)}
                    className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-white"
                  >
                    <option value="">-- เลือกระบบบำบัดน้ำเสีย --</option>
                    {myFacilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.province}) — {
                          { operational: "เปิดใช้งาน", non_operational: "ปิดใช้งาน", construction: "กำลังก่อสร้าง", cancelled: "ยกเลิก" }[f.status]
                        }
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                </div>
                {selectedFacility && (
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">{selectedFacility.province}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      ความจุ {selectedFacility.capacity.toLocaleString()} ม.³/วัน
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: คุณภาพน้ำ */}
          {activeTab === "water_quality" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-primary-800 mb-2">
                  เลือกสถานีตรวจวัด {provinceFilter && <span className="text-text-secondary font-normal">({provinceFilter})</span>}
                </label>
                <div className="relative">
                  <select
                    value={selectedSensorId}
                    onChange={(e) => setSelectedSensorId(e.target.value)}
                    className="w-full appearance-none pl-4 pr-9 py-2.5 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-white"
                  >
                    <option value="">-- เลือกสถานีตรวจวัด --</option>
                    {mySensors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {
                          { excellent: "ดีมาก", good: "ดี", fair: "พอใช้", poor: "แย่", critical: "วิกฤต" }[s.level]
                        }
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
                </div>
                {selectedSensor && (
                  <div className="mt-2 flex gap-2 text-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 font-medium">
                      {{ excellent: "ดีมาก", good: "ดี", fair: "พอใช้", poor: "แย่", critical: "วิกฤต" }[selectedSensor.level]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">BOD: {selectedSensor.bod} mg/L</span>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">pH: {selectedSensor.ph}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: รายงานชุมชน */}
          {activeTab === "community" && (
            <div>
              <label className="block text-sm font-semibold text-primary-800 mb-3">ประเภทปัญหา</label>
              <div className="grid grid-cols-2 gap-2">
                {COMMUNITY_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCommunityCategory(cat)}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all",
                      communityCategory === cat
                        ? "border-orange-400 bg-orange-50 text-orange-700"
                        : "border-border bg-white text-text-secondary hover:border-orange-300"
                    )}
                  >
                    {CAT_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description — shared across all tabs */}
          <div>
            <label className="block text-sm font-semibold text-primary-800 mb-2">รายละเอียดปัญหา</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none"
              placeholder={
                activeTab === "facility" ? "อธิบายปัญหาของระบบบำบัดน้ำเสีย เช่น ระบบชำรุด, ประสิทธิภาพลดลง..." :
                activeTab === "water_quality" ? "อธิบายสภาพน้ำที่พบ เช่น น้ำสีผิดปกติ, มีกลิ่น, ค่าวัดสูงผิดปกติ..." :
                "อธิบายปัญหาที่พบในชุมชน..."
              }
            />
          </div>

          {/* Reporter info */}
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-surface rounded-xl px-3 py-2">
            <Shield className="h-3.5 w-3.5 text-primary-400" />
            <span>รายงานโดย: <span className="font-semibold text-primary-700">{currentUser.name}</span></span>
            {currentUser.province && (
              <><span className="text-border">·</span><span>{currentUser.province}</span></>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 font-bold rounded-xl transition-all text-sm",
              canSubmit && !submitting
                ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังบันทึก...</>
            ) : (
              <><Send className="h-4 w-4" /> บันทึกรายงาน</>
            )}
          </button>
        </div>
      </div>

      {/* My Province Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-primary-800">
            รายงานในพื้นที่{currentUser.province ? ` — ${currentUser.province}` : "ทั้งหมด"}
          </h2>
          <span className="text-xs text-text-secondary bg-surface px-3 py-1 rounded-full border border-border">
            {myReports.length} รายการ
          </span>
        </div>

        {myReports.length === 0 ? (
          <div className="text-center py-12 text-text-secondary text-sm">ยังไม่มีรายงานในพื้นที่นี้</div>
        ) : (
          <div className="space-y-3">
            {[...myReports].reverse().map((report) => {
              const rType = (report.type || "community") as ReportType;
              const TypeIcon = TYPE_LABELS[rType].icon;
              const pendingStatus = pendingStatuses[report.id];
              const displayStatus = pendingStatus ?? report.status;

              return (
                <div key={report.id} className="bg-white rounded-xl border border-border p-4 space-y-3">
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      rType === "facility" ? "bg-primary-100" : rType === "water_quality" ? "bg-cyan-100" : "bg-orange-100"
                    )}>
                      <TypeIcon className={cn("h-4 w-4", TYPE_LABELS[rType].color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={cn("text-xs font-semibold", TYPE_LABELS[rType].color)}>
                          {TYPE_LABELS[rType].th}
                        </span>
                        {rType === "community" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {CAT_LABELS[report.category]}
                          </span>
                        )}
                        {(report.facilityName || report.sensorName) && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 truncate max-w-[160px]">
                            {report.facilityName || report.sensorName}
                          </span>
                        )}
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold ml-auto", STATUS_LABELS[report.status].color)}>
                          {STATUS_LABELS[report.status].th}
                        </span>
                      </div>
                      <p className="text-sm text-primary-800 leading-snug">{report.description}</p>
                      <div className="text-xs text-text-secondary mt-1">
                        {new Date(report.createdAt).toLocaleString("th-TH")} · {report.province}
                      </div>
                    </div>
                  </div>

                  {/* Status update */}
                  <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                    <span className="text-xs text-text-secondary font-medium flex-shrink-0">อัปเดต:</span>
                    <div className="flex gap-1.5 flex-1">
                      {(["pending", "reviewing", "resolved"] as const).map((s) => {
                        const isSelected = displayStatus === s;
                        const colors: Record<string, string> = {
                          pending:   isSelected ? "bg-yellow-500 text-white border-yellow-500" : "border-yellow-200 text-yellow-700 hover:bg-yellow-50",
                          reviewing: isSelected ? "bg-blue-500 text-white border-blue-500"   : "border-blue-200 text-blue-700 hover:bg-blue-50",
                          resolved:  isSelected ? "bg-green-500 text-white border-green-500" : "border-green-200 text-green-700 hover:bg-green-50",
                        };
                        return (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(report.id, s)}
                            className={cn("flex-1 text-xs font-semibold py-1 px-1.5 rounded-lg border transition-colors", colors[s])}
                          >
                            {STATUS_LABELS[s].th}
                          </button>
                        );
                      })}
                    </div>
                    {pendingStatus && pendingStatus !== report.status && (
                      <button
                        onClick={() => handleStatusSave(report.id)}
                        disabled={statusUpdating === report.id}
                        className="flex-shrink-0 text-xs font-bold px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60"
                      >
                        {statusUpdating === report.id ? "..." : "💾"}
                      </button>
                    )}
                    {statusSaved === report.id && (
                      <span className="text-xs text-green-600 font-semibold flex-shrink-0">✅</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
