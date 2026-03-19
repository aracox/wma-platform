"use client";
import { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Lock, Shield, FileText, X, Edit, Save, Building2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { CommunityReport } from "@/types";
import { getLaos } from "@/data/lao";

const STATUS_LABELS: Record<string, { th: string; color: string }> = {
  pending:   { th: "รอดำเนินการ",    color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  reviewing: { th: "กำลังตรวจสอบ",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  resolved:  { th: "แก้ไขแล้ว",      color: "bg-green-100 text-green-700 border-green-200" },
};

export default function ReportPage() {
  const locale = useLocale();
  const router = useRouter();

  const currentUser = useAppStore((s) => s.currentUser);
  const reports = useAppStore((s) => s.reports);
  const reportsLoaded = useAppStore((s) => s.reportsLoaded);
  const fetchReports = useAppStore((s) => s.fetchReports);
  const updateReportStatus = useAppStore((s) => s.updateReportStatus);
  const updateReportFields = useAppStore((s) => s.updateReportFields);

  useEffect(() => { if (!reportsLoaded) fetchReports(); }, [reportsLoaded, fetchReports]);

  const isAdmin = currentUser?.role === "admin";
  const isOfficer = currentUser?.role === "official";

  // Data for Admin LAO dropdown
  const allLaos = useMemo(() => getLaos(), []);
  const [adminSelectedLaoId, setAdminSelectedLaoId] = useState("");

  // Create Form state
  const [systemInfo, setSystemInfo] = useState("");
  const [identifiedIssues, setIdentifiedIssues] = useState("");
  const [laoActivities, setLaoActivities] = useState("");
  const [communityParticipation, setCommunityParticipation] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CommunityReport>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Status List state
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState<string | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, CommunityReport["status"]>>({});

  // Filtered reports
  const myReports = isAdmin 
    ? reports 
    : reports.filter((r) => r.laoId === currentUser?.laoId);

  // Form derived state
  const targetLaoId = isAdmin ? adminSelectedLaoId : currentUser?.laoId;
  const selectedLao = isAdmin ? allLaos.find((l) => l.id === adminSelectedLaoId) : null;
  const targetLaoName = isAdmin ? (selectedLao?.name || "") : currentUser?.laoName;
  const targetProvince = isAdmin ? (selectedLao?.province || "ไม่ระบุ") : (currentUser?.province || "ไม่ระบุ");
  
  const canSubmit = !!(
    targetLaoId &&
    systemInfo.trim() && 
    identifiedIssues.trim() && 
    laoActivities.trim() && 
    communityParticipation.trim()
  );

  const handleSubmit = async () => {
    if (!canSubmit || !currentUser) return;
    setSubmitting(true);

    const lat = isAdmin ? (selectedLao?.lat || 13.75) : 13.75;
    const lng = isAdmin ? (selectedLao?.lng || 100.5) : 100.5;

    const body = {
      systemInfo,
      identifiedIssues,
      laoActivities,
      communityParticipation,
      laoId: targetLaoId,
      laoName: targetLaoName || "ไม่ระบุ อปท.",
      lat,
      lng,
      province: targetProvince,
      reportedBy: currentUser.id,
    };

    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(true);
        setSystemInfo("");
        setIdentifiedIssues("");
        setLaoActivities("");
        setCommunityParticipation("");
        if (isAdmin) setAdminSelectedLaoId("");
        await fetchReports();
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (report: CommunityReport) => {
    setEditingId(report.id);
    setEditValues({
      systemInfo: report.systemInfo,
      identifiedIssues: report.identifiedIssues,
      laoActivities: report.laoActivities,
      communityParticipation: report.communityParticipation,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    await updateReportFields(editingId, editValues);
    setSavingEdit(false);
    setEditingId(null);
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
          <p className="text-text-secondary text-sm">เจ้าหน้าที่ต้องเข้าสู่ระบบเพื่อรายงานปัญหา อปท.</p>
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">แจ้งปัญหา / รายงานผลการดำเนินงาน</h1>
          <p className="text-text-secondary text-sm mt-1">รายงานข้อมูลและกิจกรรมการจัดการน้ำเสียของ อปท.</p>
        </div>
        
        {/* User Context Badge */}
        <div className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border bg-primary-50 border-primary-200 text-primary-700">
          <Shield className="h-3.5 w-3.5" />
          {isAdmin ? "ผู้ดูแลระบบ (ทุกพื้นที่)" : currentUser.laoName}
        </div>
      </div>

      {/* Report Form Component */}
      {(isOfficer || isAdmin) && (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="bg-primary-50 border-b border-border px-6 py-4 flex items-center gap-2 text-primary-800 font-bold">
            <FileText className="h-5 w-5" />
            แบบฟอร์มบันทึกข้อมูลรายงานระดับท้องถิ่น
          </div>
          
          <div className="p-6 space-y-6">
            {submitted && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold animate-fade-up">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                บันทึกรายงานข้อมูล อปท. เรียบร้อยแล้ว (ข้อมูลถูกจัดเก็บอย่างถาวร)
                <button onClick={() => setSubmitted(false)} className="ml-auto"><X className="h-4 w-4" /></button>
              </div>
            )}

            {!currentUser.laoId && !isAdmin && (
              <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm mb-4 border border-yellow-200">
                คุณยังไม่มีสังกัด อปท. ในระบบ กรุณาติดต่อผู้ดูแลระบบเพื่อเชื่อมโยงบัญชี
              </div>
            )}

            {/* Admin LAO Selector */}
            {isAdmin && (
              <div className="p-4 bg-gray-50 border border-border rounded-xl mb-6">
                <label className="block text-sm font-bold text-primary-800 mb-2">
                  <Shield className="h-4 w-4 inline-block mr-1.5 text-chula-600" />
                  เลือก อปท. ที่ต้องการรายงานแทน (เฉพาะ Admin)
                </label>
                <div className="relative max-w-md">
                  <select
                    value={adminSelectedLaoId}
                    onChange={(e) => setAdminSelectedLaoId(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-border focus:border-chula-400 focus:ring-2 focus:ring-chula-100 outline-none text-sm bg-white font-medium"
                  >
                    <option value="">-- ค้นหาและเลือก อปท. --</option>
                    {allLaos.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} จ.{l.province}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: System Info */}
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">1. ข้อมูลระบบบำบัดน้ำเสีย</label>
                <textarea
                  value={systemInfo}
                  onChange={(e) => setSystemInfo(e.target.value)}
                  disabled={!targetLaoId}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="เช่น ระบบบำบัดน้ำเสียแบบ Aerated lagoon สามารถรองรับน้ำเสียได้สูงสุด 1,500 ลบ.ม. ต่อวัน..."
                />
              </div>

              {/* Field 2: Identified Issues */}
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">2. ปัญหาที่พบ</label>
                <textarea
                  value={identifiedIssues}
                  onChange={(e) => setIdentifiedIssues(e.target.value)}
                  disabled={!targetLaoId}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed bg-orange-50/30"
                  placeholder="เช่น คุณภาพน้ำในแหล่งน้ำเสื่อมโทรม, ขาดอุปกรณ์เร่งด่วน, ตรวจพบการลักลอบปล่อยน้ำเสีย..."
                />
              </div>

              {/* Field 3: LAO Activities */}
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">3. กิจกรรมของ อปท.</label>
                <textarea
                  value={laoActivities}
                  onChange={(e) => setLaoActivities(e.target.value)}
                  disabled={!targetLaoId}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="เช่น การจัดกิจกรรมทำความสะอาดแหล่งน้ำ, การปรับปรุงระบบรวบรวมน้ำเสีย..."
                />
              </div>

              {/* Field 4: Community Participation */}
              <div>
                <label className="block text-sm font-bold text-primary-800 mb-2">4. การมีส่วนร่วมของชุมชน</label>
                <textarea
                  value={communityParticipation}
                  onChange={(e) => setCommunityParticipation(e.target.value)}
                  disabled={!targetLaoId}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm resize-none disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="เช่น แผนงานรณรงค์ส่งเสริมให้บ้านเรือนติดตั้งถังดักไขมัน, การเฝ้าระวังคุณภาพน้ำโดยชุมชน..."
                />
              </div>
            </div>

            {/* Reporter info & Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <span className="font-semibold px-2 py-1 bg-gray-100 rounded-md truncate max-w-[150px]">
                  ผู้รายงาน: {currentUser.name}
                </span>
                <span className="truncate max-w-[200px]">
                  อปท: {targetLaoName || "ยังไม่เลือก อปท."}
                </span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={cn(
                  "w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 font-bold rounded-xl transition-all text-sm",
                  canSubmit && !submitting
                    ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> กำลังบันทึก...</>
                ) : (
                  <><Send className="h-4 w-4" /> ส่งรายงาน</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-primary-800">
            {isAdmin ? "ประวัติการรายงานทั้งหมด" : `ประวัติการรายงานของ ${currentUser.laoName || ""}`}
          </h2>
          <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-200">
            {myReports.length} รายการ
          </span>
        </div>

        {myReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-border">
            <p className="text-text-secondary text-sm">ยังไม่มีประวัติการรายงาน</p>
          </div>
        ) : (
          <div className="space-y-4">
            {[...myReports].reverse().map((report) => {
              const pendingStatus = pendingStatuses[report.id];
              const displayStatus = pendingStatus ?? report.status;
              const isEditing = editingId === report.id;
              
              // Officers can edit their own LAO's reports. Admins can edit anything.
              const canEdit = isAdmin || currentUser.laoId === report.laoId;

              return (
                <div key={report.id} className={cn(
                  "bg-white rounded-xl border p-5 space-y-4 shadow-sm transition-all",
                  isEditing ? "border-primary-400 ring-4 ring-primary-50" : "border-border hover:shadow-md"
                )}>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-4 w-4 text-primary-700" />
                      </div>
                      <div>
                        <div className="font-bold text-primary-800 text-sm md:text-base leading-tight">
                          {report.laoName}
                        </div>
                        <div className="text-xs text-text-secondary mt-0.5">
                          {new Date(report.createdAt).toLocaleString("th-TH")} · จังหวัด{report.province}
                          {report.updatedAt && <span className="text-primary-500 font-medium ml-1">(แก้ไขแล้ว)</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {canEdit && !isEditing && (
                        <button
                          onClick={() => startEdit(report)}
                          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary-200"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          แก้ไข
                        </button>
                      )}
                      <span className={cn("text-xs px-2.5 py-1 rounded-full border font-bold shadow-sm whitespace-nowrap", STATUS_LABELS[report.status].color)}>
                        {STATUS_LABELS[report.status].th}
                      </span>
                    </div>
                  </div>

                  {/* 4-Column Data Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    {/* Column 1 */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wide">1. ข้อมูลระบบบำบัดน้ำเสีย</h4>
                      {isEditing ? (
                        <textarea
                          value={editValues.systemInfo || ""}
                          onChange={(e) => setEditValues({ ...editValues, systemInfo: e.target.value })}
                          rows={3}
                          className="w-full text-xs p-2.5 bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 leading-relaxed bg-gray-50/50 p-2.5 rounded-lg border border-transparent">{report.systemInfo}</p>
                      )}
                    </div>
                    
                    {/* Column 2 */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-orange-700 text-xs uppercase tracking-wide">2. ปัญหาที่พบ</h4>
                      {isEditing ? (
                        <textarea
                          value={editValues.identifiedIssues || ""}
                          onChange={(e) => setEditValues({ ...editValues, identifiedIssues: e.target.value })}
                          rows={3}
                          className="w-full text-xs p-2.5 bg-orange-50/30 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                        />
                      ) : (
                        <p className="text-gray-800 leading-relaxed bg-orange-50/50 p-2.5 rounded-lg border border-transparent">{report.identifiedIssues}</p>
                      )}
                    </div>
                    
                    {/* Column 3 */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-cyan-700 text-xs uppercase tracking-wide">3. กิจกรรมของ อปท.</h4>
                      {isEditing ? (
                        <textarea
                          value={editValues.laoActivities || ""}
                          onChange={(e) => setEditValues({ ...editValues, laoActivities: e.target.value })}
                          rows={3}
                          className="w-full text-xs p-2.5 bg-cyan-50/30 border border-cyan-300 rounded-lg focus:ring-2 focus:ring-cyan-100 outline-none resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 leading-relaxed bg-cyan-50/50 p-2.5 rounded-lg border border-transparent">{report.laoActivities}</p>
                      )}
                    </div>
                    
                    {/* Column 4 */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-green-700 text-xs uppercase tracking-wide">4. การมีส่วนร่วมของชุมชน</h4>
                       {isEditing ? (
                        <textarea
                          value={editValues.communityParticipation || ""}
                          onChange={(e) => setEditValues({ ...editValues, communityParticipation: e.target.value })}
                          rows={3}
                          className="w-full text-xs p-2.5 bg-green-50/30 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-100 outline-none resize-none"
                        />
                      ) : (
                        <p className="text-gray-600 leading-relaxed bg-green-50/50 p-2.5 rounded-lg border border-transparent">{report.communityParticipation}</p>
                      )}
                    </div>
                  </div>

                  {/* Editing Controls */}
                  {isEditing && (
                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                      <button
                        onClick={() => setEditingId(null)}
                        disabled={savingEdit}
                        className="px-4 py-1.5 text-xs font-semibold text-text-secondary hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-border"
                      >
                        ยกเลิก
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {savingEdit ? "กำลังบันทึก..." : <><Save className="h-3.5 w-3.5" /> บันทึกการแก้ไข</>}
                      </button>
                    </div>
                  )}

                  {/* Status Update Controls */}
                  {canEdit && !isEditing && (
                    <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border/50">
                      <span className="text-xs text-text-secondary font-medium mr-1">อัปเดตสถานะ:</span>
                      
                      <div className="relative">
                        <select
                          value={displayStatus}
                          onChange={(e) => handleStatusChange(report.id, e.target.value as CommunityReport["status"])}
                          className={cn(
                            "appearance-none pl-4 pr-8 py-1.5 text-xs font-bold rounded-full border outline-none shadow-sm transition-colors cursor-pointer",
                            displayStatus === "pending" ? "bg-yellow-100 border-yellow-200 text-yellow-700 focus:ring-2 focus:ring-yellow-200 hover:bg-yellow-200/60" :
                            displayStatus === "reviewing" ? "bg-blue-100 border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-200 hover:bg-blue-200/60" :
                            "bg-green-100 border-green-200 text-green-700 focus:ring-2 focus:ring-green-200 hover:bg-green-200/60"
                          )}
                        >
                          {(["pending", "reviewing", "resolved"] as const).map(s => (
                            <option key={s} value={s} className="bg-white text-gray-800 font-medium">
                              {STATUS_LABELS[s].th}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className={cn(
                          "absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none",
                          displayStatus === "pending" ? "text-yellow-700" :
                          displayStatus === "reviewing" ? "text-blue-700" :
                          "text-green-700"
                        )} />
                      </div>

                      {pendingStatus && pendingStatus !== report.status && (
                        <button
                          onClick={() => handleStatusSave(report.id)}
                          disabled={statusUpdating === report.id}
                          className="text-xs font-bold px-4 py-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-sm ml-1"
                        >
                          {statusUpdating === report.id ? "กำลังบันทึก..." : "บันทึกสถานะ"}
                        </button>
                      )}
                      {statusSaved === report.id && (
                        <span className="text-sm border border-green-200 bg-green-50 text-green-600 px-2 py-0.5 rounded-full inline-flex items-center">✅</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
