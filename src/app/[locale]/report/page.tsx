"use client";
import { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { 
  Send, CheckCircle, Lock, Shield, FileText, X, Edit, Save, 
  Building2, ChevronDown, Paperclip, FileImage, Trash2, ExternalLink 
} from "lucide-react";
import { cn, formatDateTimeBE } from "@/lib/utils";
import { useAppStore } from "@/store";
import { CommunityReport } from "@/types";

const STATUS_LABELS: Record<string, { th: string; color: string }> = {
  pending:   { th: "รอดำเนินการ",    color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  reviewing: { th: "กำลังตรวจสอบ",  color: "bg-blue-100 text-blue-700 border-blue-200" },
  resolved:  { th: "แก้ไขแล้ว",      color: "bg-green-100 text-green-700 border-green-200" },
};

export default function ReportPage() {
  const locale = useLocale();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const reports = useAppStore((s) => s.reports);
  const reportsLoaded = useAppStore((s) => s.reportsLoaded);
  const fetchReports = useAppStore((s) => s.fetchReports);
  const updateReportStatus = useAppStore((s) => s.updateReportStatus);
  const updateReportFields = useAppStore((s) => s.updateReportFields);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (!reportsLoaded) fetchReports(); }, [reportsLoaded, fetchReports]);

  const isAdmin = currentUser?.role === "admin";
  const isOfficer = currentUser?.role === "official";
  const isUser = currentUser?.role === "user" || (!isAdmin && !isOfficer);

  // Free-text location for Admin / Public User (no LAO lookup required)
  const [locationText, setLocationText] = useState("");

  // Create Form state
  const [details, setDetails] = useState("");
  const [laoActivities, setLaoActivities] = useState("");
  const [communityParticipation, setCommunityParticipation] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; url: string; size?: string; type?: string }[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CommunityReport>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSaveError, setEditSaveError] = useState(false);

  // Status List state
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState<string | null>(null);
  const [statusSaveError, setStatusSaveError] = useState<string | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, CommunityReport["status"]>>({});

  // Filtered reports: Admins see all, Public users see their email reports, Officers see their LAO reports
  const myReports = useMemo(() => {
    if (isAdmin) return reports;
    if (isUser && currentUser?.email) {
      const emailLower = currentUser.email.toLowerCase();
      return reports.filter((r) => 
        (r.reportedByEmail && r.reportedByEmail.toLowerCase() === emailLower) ||
        (r.reportedBy && r.reportedBy.toLowerCase() === emailLower)
      );
    }
    if (isOfficer && currentUser?.laoId) {
      return reports.filter((r) => r.laoId === currentUser.laoId);
    }
    return reports;
  }, [reports, isAdmin, isUser, isOfficer, currentUser]);

  // Form derived state
  const isSelectingLao = isAdmin || isUser || !currentUser?.laoId;
  const targetLaoId = isSelectingLao ? locationText.trim() : currentUser?.laoId;
  const targetLaoName = isSelectingLao ? locationText.trim() : currentUser?.laoName;
  const targetProvince = isSelectingLao ? "ไม่ระบุ" : (currentUser?.province || "ไม่ระบุ");
  
  const canSubmit = !!(
    targetLaoId &&
    details.trim()
  );

  const MAX_ATTACHMENTS = 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const chosenFiles = Array.from(e.target.files);
    const imageFiles = chosenFiles.filter((file) => file.type.startsWith("image/"));
    const selectedFiles = imageFiles.slice(0, Math.max(0, MAX_ATTACHMENTS - attachments.length));

    if (imageFiles.length < chosenFiles.length) {
      setSubmitError("รองรับไฟล์รูปภาพเท่านั้น");
    } else if (imageFiles.length > selectedFiles.length) {
      setSubmitError(`แนบไฟล์ได้สูงสุด ${MAX_ATTACHMENTS} ไฟล์`);
    }
    e.target.value = "";

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const formattedSize = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
          : `${Math.round(file.size / 1024)} KB`;

        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            url: result,
            size: formattedSize,
            type: file.type,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async () => {
    if (!canSubmit || !currentUser) return;
    setSubmitting(true);
    setSubmitError("");

    const body = {
      systemInfo: details,
      identifiedIssues: details,
      laoActivities: laoActivities.trim() || "-",
      communityParticipation: communityParticipation.trim() || "-",
      attachments,
      laoId: targetLaoId,
      laoName: targetLaoName || "ไม่ระบุ อปท.",
      lat: 13.75,
      lng: 100.5,
      province: targetProvince,
      reportedBy: currentUser.email || currentUser.id,
      reportedByEmail: currentUser.email,
    };

    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(true);
        setDetails("");
        setLaoActivities("");
        setCommunityParticipation("");
        setAttachments([]);
        if (isSelectingLao) setLocationText("");
        await fetchReports();
      } else {
        const data = await res.json();
        setSubmitError(data.error || "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      console.error("Failed to submit report:", err);
      setSubmitError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (report: CommunityReport) => {
    setEditingId(report.id);
    const mergedDetails = report.systemInfo === report.identifiedIssues
      ? report.systemInfo
      : [report.systemInfo, report.identifiedIssues].filter(Boolean).join("\n");
    setEditValues({
      systemInfo: mergedDetails,
      identifiedIssues: mergedDetails,
      communityParticipation: report.communityParticipation,
      attachments: report.attachments || [],
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    setEditSaveError(false);
    const success = await updateReportFields(editingId, editValues);
    setSavingEdit(false);
    if (success) {
      setEditingId(null);
    } else {
      setEditSaveError(true);
      setTimeout(() => setEditSaveError(false), 4000);
    }
  };

  const handleStatusChange = (reportId: string, status: CommunityReport["status"]) => {
    setPendingStatuses((prev) => ({ ...prev, [reportId]: status }));
    setStatusSaved(null);
    setStatusSaveError(null);
  };

  const handleStatusSave = async (reportId: string) => {
    const newStatus = pendingStatuses[reportId];
    if (!newStatus) return;
    setStatusUpdating(reportId);
    setStatusSaveError(null);
    const success = await updateReportStatus(reportId, newStatus);
    setStatusUpdating(null);
    if (success) {
      setPendingStatuses((prev) => { const n = { ...prev }; delete n[reportId]; return n; });
      setStatusSaved(reportId);
      setTimeout(() => setStatusSaved(null), 2000);
    } else {
      setStatusSaveError(reportId);
      setTimeout(() => setStatusSaveError(null), 4000);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-up">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-up">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">กรุณาเข้าสู่ระบบก่อนแจ้งปัญหา</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              กรุณาเข้าสู่ระบบด้วยบัญชีของคุณเพื่อบันทึกข้อมูล รายงานปัญหา และติดตามผลการดำเนินงานการจัดการน้ำเสีย
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push(`/${locale}/auth/login/user?callbackUrl=/${locale}/report`)}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              เข้าสู่ระบบเพื่อแจ้งปัญหา
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 animate-fade-up">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">แจ้งปัญหา</h1>
          </div>
          
          {/* User Context Badge */}
          <div className="sm:self-center self-start flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-primary-50 border-primary-200 text-primary-700">
            <Shield className="h-3.5 w-3.5" />
            {isAdmin ? "ผู้ดูแลระบบ (ทุกพื้นที่)" : isUser ? `ผู้ใช้งาน: ${currentUser.email}` : (currentUser.laoName || "เจ้าหน้าที่")}
          </div>
        </div>

        {/* Report Form Component */}
        {(isOfficer || isAdmin || isUser) && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary-900 to-primary-800 border-b border-primary-950 px-6 py-4.5 flex items-center gap-2 text-white font-bold">
              <FileText className="h-5 w-5 text-blue-200" />
              แบบฟอร์มบันทึกข้อมูลแจ้งปัญหาน้ำเสีย
            </div>
          
          <div className="p-6 space-y-6">
            {submitted && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold animate-fade-up">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                บันทึกรายงานข้อมูลเรียบร้อยแล้ว
                <button onClick={() => setSubmitted(false)} className="ml-auto"><X className="h-4 w-4" /></button>
              </div>
            )}

            {submitError && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-rose-700 text-sm font-semibold animate-fade-up">
                <X className="h-5 w-5 flex-shrink-0" />
                {submitError}
                <button onClick={() => setSubmitError("")} className="ml-auto"><X className="h-4 w-4" /></button>
              </div>
            )}

            {/* Admin or Public User LAO Selector */}
            {isSelectingLao && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6">
                <label className="block text-sm font-bold text-primary-800 mb-2">
                  <Building2 className="h-4 w-4 inline-block mr-1.5 text-primary-600" />
                  สถานที่ <span className="text-red-500">*</span>
                </label>
                <div className="max-w-md">
                  <input
                    type="text"
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder="ระบุสถานที่ที่ต้องการรายงาน"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm bg-white font-medium"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Details (merged system info + identified issues) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary-800 mb-2">
                  1. ปัญหาที่พบ <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  disabled={!targetLaoId}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                  placeholder="เช่น ระบบบำบัดน้ำเสียแบบ Aerated lagoon สามารถรองรับน้ำเสียได้สูงสุด 1,500 ลบ.ม. ต่อวัน คุณภาพน้ำในแหล่งน้ำเสื่อมโทรม ตรวจพบการลักลอบปล่อยน้ำเสีย..."
                />
              </div>

              {/* Field 2: Additional Info & Attachments */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-primary-800 mb-2">
                  2. เบอร์ติดต่อ <span className="text-slate-400 font-normal text-xs">(ไม่บังคับ)</span>
                </label>
                <textarea
                  value={communityParticipation}
                  onChange={(e) => setCommunityParticipation(e.target.value)}
                  disabled={!targetLaoId}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                  placeholder="ระบุเบอร์ติดต่อ (ถ้ามี)"
                />

                {/* File Attachments Control */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <label className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border shadow-sm",
                      targetLaoId
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    )}>
                      <Paperclip className="h-4 w-4 text-primary-600" />
                      <span>แนบไฟล์รูปภาพ...</span>
                      <input
                        type="file"
                        multiple
                        disabled={!targetLaoId || attachments.length >= MAX_ATTACHMENTS}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400">
                      รองรับไฟล์รูปภาพเท่านั้น (สูงสุด {MAX_ATTACHMENTS} ไฟล์)
                    </span>
                  </div>

                  {/* Attachments preview list */}
                  {attachments.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {attachments.map((att, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {att.type?.startsWith("image/") ? (
                              <img src={att.url} alt={att.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                            ) : (
                              <FileText className="h-5 w-5 text-primary-600 flex-shrink-0" />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-slate-800 truncate">{att.name}</p>
                              <p className="text-[10px] text-slate-400">{att.size || "ไฟล์แนบ"}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1 transition-colors cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Reporter info & Submit */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold px-2 py-1 bg-slate-100 rounded-md truncate max-w-[150px]">
                  ผู้รายงาน: {currentUser.name}
                </span>
                <span className="truncate max-w-[200px]">
                  สถานที่: {targetLaoName || "ยังไม่ระบุสถานที่"}
                </span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={cn(
                  "w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-2.5 font-bold rounded-xl transition-all text-sm cursor-pointer",
                  canSubmit && !submitting
                    ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
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
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {isAdmin ? "ประวัติการรายงานทั้งหมด" : isUser ? "ประวัติการรายงานของคุณ" : `ประวัติการรายงานของ ${currentUser.laoName || ""}`}
            </h2>
            <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              {myReports.length} รายการ
            </span>
          </div>

          {myReports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-sm">ยังไม่มีประวัติการรายงาน</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...myReports].reverse().map((report) => {
                const pendingStatus = pendingStatuses[report.id];
                const displayStatus = pendingStatus ?? report.status;
                const isEditing = editingId === report.id;
                const canEdit = isAdmin || currentUser.email === report.reportedByEmail || currentUser.laoId === report.laoId;

                const statusLeftBorderClass =
                  report.status === "pending" ? "border-l-yellow-500" :
                  report.status === "reviewing" ? "border-l-blue-500" :
                  "border-l-green-500";

                const SLA_MS = 48 * 60 * 60 * 1000;
                const isOverdue = report.status === "pending" && (Date.now() - new Date(report.createdAt).getTime()) > SLA_MS;

                return (
                  <div key={report.id} className={cn(
                    "bg-white rounded-2xl border-y border-r p-6 space-y-4 shadow-sm transition-all border-l-4",
                    statusLeftBorderClass,
                    isEditing ? "border-primary-400 ring-4 ring-primary-50/50" : "border-slate-200 hover:shadow-md"
                  )}>
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary-700" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm md:text-base leading-tight">
                            {report.laoName}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {formatDateTimeBE(report.createdAt, locale)} · จังหวัด{report.province}
                            {report.updatedAt && <span className="text-primary-600 font-medium ml-1">(แก้ไขแล้ว)</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {canEdit && !isEditing && (
                          <button
                            onClick={() => startEdit(report)}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary-200 cursor-pointer"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            แก้ไข
                          </button>
                        )}
                        <span className={cn("text-xs px-2.5 py-1 rounded-full border font-bold shadow-sm whitespace-nowrap", STATUS_LABELS[report.status].color)}>
                          {STATUS_LABELS[report.status].th}
                        </span>
                        {isOverdue && (
                          <span className="text-xs px-2.5 py-1 rounded-full border font-bold shadow-sm whitespace-nowrap bg-red-100 text-red-700 border-red-200">
                            ⚠️ เกิน SLA (48 ชม.)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      {/* Column 1: Details (merged system info + identified issues) */}
                      <div className="md:col-span-2 space-y-1">
                        <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wide">1. ปัญหาที่พบ</h4>
                        {isEditing ? (
                          <textarea
                            value={editValues.systemInfo || ""}
                            onChange={(e) => setEditValues({ ...editValues, systemInfo: e.target.value, identifiedIssues: e.target.value })}
                            rows={3}
                            className="w-full text-xs p-2.5 bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                          />
                        ) : (
                          <p className="text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-transparent whitespace-pre-line">
                            {report.systemInfo === report.identifiedIssues
                              ? report.systemInfo
                              : [report.systemInfo, report.identifiedIssues].filter(Boolean).join("\n")}
                          </p>
                        )}
                      </div>

                      {/* Column 2: Additional Info & Attachments */}
                      <div className="md:col-span-2 space-y-1">
                        <h4 className="font-bold text-green-700 text-xs uppercase tracking-wide">2. เบอร์ติดต่อ</h4>
                        {isEditing ? (
                          <textarea
                            value={editValues.communityParticipation || ""}
                            onChange={(e) => setEditValues({ ...editValues, communityParticipation: e.target.value })}
                            rows={3}
                            className="w-full text-xs p-2.5 bg-green-50/30 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-100 outline-none resize-none"
                          />
                        ) : (
                          <p className="text-slate-600 leading-relaxed bg-green-50/50 p-2.5 rounded-lg border border-transparent">{report.communityParticipation}</p>
                        )}

                        {/* Display Attached Files if any */}
                        {report.attachments && report.attachments.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                              📎 ไฟล์แนบ ({report.attachments.length} ไฟล์):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {report.attachments.map((att, attIdx) => (
                                <a
                                  key={attIdx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-colors group"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    {att.type?.startsWith("image/") ? (
                                      <img src={att.url} alt={att.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                                    ) : (
                                      <FileText className="h-5 w-5 text-primary-600 flex-shrink-0" />
                                    )}
                                    <div className="truncate">
                                      <p className="font-semibold text-slate-800 truncate group-hover:text-primary-600">{att.name}</p>
                                      <p className="text-[10px] text-slate-400">{att.size || "ไฟล์แนบ"}</p>
                                    </div>
                                  </div>
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-600 flex-shrink-0 ml-1" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Editing Controls */}
                    {isEditing && (
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                        {editSaveError && (
                          <span className="text-xs font-semibold text-red-600 mr-1">
                            ⚠️ บันทึกไม่สำเร็จ กรุณาลองใหม่
                          </span>
                        )}
                        <button
                          onClick={() => setEditingId(null)}
                          disabled={savingEdit}
                          className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                        >
                          ยกเลิก
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={savingEdit}
                          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-primary-600 text-white hover:bg-primary-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {savingEdit ? "กำลังบันทึก..." : <><Save className="h-3.5 w-3.5" /> บันทึกการแก้ไข</>}
                        </button>
                      </div>
                    )}

                    {/* Status Update Controls */}
                    {canEdit && !isEditing && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
                        <span className="text-xs text-slate-500 font-medium mr-1">อัปเดตสถานะ:</span>
                        
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
                              <option key={s} value={s} className="bg-white text-slate-800 font-medium">
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
                            className="text-xs font-bold px-4 py-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-sm ml-1 cursor-pointer"
                          >
                            {statusUpdating === report.id ? "กำลังบันทึก..." : "บันทึกสถานะ"}
                          </button>
                        )}
                        {statusSaved === report.id && (
                          <span className="text-sm border border-green-200 bg-green-50 text-green-600 px-2 py-0.5 rounded-full inline-flex items-center">✅</span>
                        )}
                        {statusSaveError === report.id && (
                          <span className="text-xs font-semibold border border-red-200 bg-red-50 text-red-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            ⚠️ บันทึกไม่สำเร็จ
                          </span>
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
    </div>
  );
}
