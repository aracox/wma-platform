"use client";
import { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Lock, Shield, FileText, X, Edit, Save, Building2, ChevronDown, Check, Paperclip, ExternalLink } from "lucide-react";
import { cn, formatDateTimeBE } from "@/lib/utils";
import { useAppStore } from "@/store";
import { CooperationRequest } from "@/types";
import { getLaos } from "@/data/lao";

const STATUS_LABELS: Record<string, { th: string; color: string; desc: string }> = {
  coordination: {
    th: "1. ประสานงาน",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    desc: "ประสานงานในพื้นที่เป้าหมายตามแผนปฏิบัติการจัดการน้ำเสียชุมชนระยะ 20 ปี"
  },
  agreement: {
    th: "2. ลงนามข้อตกลง (MOU/MOA)",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    desc: "อปท. ต้องเสนอเรื่องเข้าสภาท้องถิ่นและผู้ว่าราชการจังหวัดเพื่อขออนุมัติ"
  },
  land_acquisition: {
    th: "3. จัดหาพื้นที่",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
    desc: "องค์กรปกครองส่วนท้องถิ่น (อปท.) เป็นผู้จัดหาพื้นที่สำหรับก่อสร้างศูนย์ฯ"
  },
  construction: {
    th: "4. ก่อสร้างศูนย์ฯ",
    color: "bg-orange-100 text-orange-700 border-orange-200",
    desc: "องค์การจัดการน้ำเสีย (อจน.) เป็นผู้รับผิดชอบดำเนินการก่อสร้างทั้งหมด"
  },
  management: {
    th: "5. บริหารจัดการ",
    color: "bg-green-100 text-green-700 border-green-200",
    desc: "อจน. และ อปท. บริหารจัดการศูนย์บริหารจัดการคุณภาพน้ำร่วมกัน"
  }
};

const statusOrder = ["coordination", "agreement", "land_acquisition", "construction", "management"] as const;

export default function CooperationPage() {
  const locale = useLocale();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const cooperations = useAppStore((s) => s.cooperations);
  const cooperationsLoaded = useAppStore((s) => s.cooperationsLoaded);
  const fetchCooperations = useAppStore((s) => s.fetchCooperations);
  const updateCooperationStatus = useAppStore((s) => s.updateCooperationStatus);
  const updateCooperationFields = useAppStore((s) => s.updateCooperationFields);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!cooperationsLoaded) fetchCooperations();
  }, [cooperationsLoaded, fetchCooperations]);

  const isAdmin = currentUser?.role === "admin";
  const isOfficer = currentUser?.role === "official";

  // Data for Admin LAO dropdown
  const allLaos = useMemo(() => getLaos(), []);
  const [adminSelectedLaoId, setAdminSelectedLaoId] = useState("");

  // Create Form state
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [localPlan, setLocalPlan] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [attachments, setAttachments] = useState<{ name: string; url: string; size?: string; type?: string }[]>([]);
  
  // UX Tab state: "history" | "create"
  const [activeTab, setActiveTab] = useState<"history" | "create">("history");

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files);

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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<CooperationRequest>>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // Status List state
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState<string | null>(null);
  const [pendingStatuses, setPendingStatuses] = useState<Record<string, CooperationRequest["status"]>>({});

  const isSelectingLao = isAdmin || !currentUser?.laoId;

  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filtered cooperations: Admin sees all; users see requests created by them or for their LAO
  const baseCooperations = useMemo(() => {
    return isAdmin 
      ? cooperations 
      : cooperations.filter(
          (c) => 
            c.reportedBy === currentUser?.id || 
            c.reportedBy === currentUser?.email || 
            (currentUser?.laoId && c.laoId === currentUser.laoId)
        );
  }, [isAdmin, cooperations, currentUser]);

  const filteredCooperations = useMemo(() => {
    if (statusFilter === "all") return baseCooperations;
    return baseCooperations.filter((c) => c.status === statusFilter);
  }, [baseCooperations, statusFilter]);

  // Form derived state
  const targetLaoId = isSelectingLao ? adminSelectedLaoId : currentUser?.laoId;
  const selectedLao = useMemo(() => {
    return allLaos.find((l) => l.id === targetLaoId);
  }, [allLaos, targetLaoId]);

  const targetLaoName = isSelectingLao ? (selectedLao?.name || "") : currentUser?.laoName;
  const targetProvince = isSelectingLao ? (selectedLao?.province || "ไม่ระบุ") : (currentUser?.province || "ไม่ระบุ");
  
  const canSubmit = !!(
    targetLaoId &&
    subject.trim() && 
    details.trim() && 
    expectedOutcome.trim()
  );

  const handleSubmit = async () => {
    if (!canSubmit || !currentUser) return;
    setSubmitting(true);

    const lat = selectedLao?.lat || 13.75;
    const lng = selectedLao?.lng || 100.5;

    const body = {
      subject,
      details,
      localPlan: details,
      expectedOutcome,
      laoId: targetLaoId,
      laoName: targetLaoName || "ไม่ระบุ อปท.",
      lat,
      lng,
      province: targetProvince,
      reportedBy: currentUser.id,
      attachments,
    };

    try {
      const res = await fetch("/api/cooperation/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSubmitted(true);
        setSubject("");
        setDetails("");
        setLocalPlan("");
        setExpectedOutcome("");
        setAttachments([]);
        if (isAdmin) setAdminSelectedLaoId("");
        await fetchCooperations();
        setActiveTab("history");
      }
    } catch (err) {
      console.error("Failed to submit cooperation request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (req: CooperationRequest) => {
    setEditingId(req.id);
    setEditValues({
      subject: req.subject,
      details: req.details,
      localPlan: req.localPlan,
      expectedOutcome: req.expectedOutcome,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSavingEdit(true);
    await updateCooperationFields(editingId, editValues);
    setSavingEdit(false);
    setEditingId(null);
  };

  const handleStatusChange = (reqId: string, status: CooperationRequest["status"]) => {
    setPendingStatuses((prev) => ({ ...prev, [reqId]: status }));
    setStatusSaved(null);
  };

  const handleStatusSave = async (reqId: string) => {
    const newStatus = pendingStatuses[reqId];
    if (!newStatus) return;
    setStatusUpdating(reqId);
    await updateCooperationStatus(reqId, newStatus);
    setPendingStatuses((prev) => { const n = { ...prev }; delete n[reqId]; return n; });
    setStatusUpdating(null);
    setStatusSaved(reqId);
    setTimeout(() => setStatusSaved(null), 2000);
  };

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
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
            <h2 className="text-2xl font-black text-slate-900">กรุณาเข้าสู่ระบบก่อนเสนอโครงการ</h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              กรุณาเข้าสู่ระบบด้วยบัญชีของคุณเพื่อเสนอโครงการสร้างศูนย์บริหารจัดการคุณภาพน้ำร่วมกับ อจน. และติดตามสถานะดำเนินงาน
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => router.push(`/${locale}/auth/login/user?callbackUrl=/${locale}/cooperation`)}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
            >
              เข้าสู่ระบบเพื่อเสนอโครงการ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 animate-fade-up">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">ขอสร้างศูนย์บริหารจัดการคุณภาพน้ำร่วมกับ อจน.</h1>
          </div>
          
          {/* User Context Badge */}
          <div className="sm:self-center self-start flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border bg-primary-50 border-primary-200 text-primary-700">
            {isAdmin ? "ผู้ดูแลระบบ (ทุกพื้นที่)" : (currentUser.laoName || (currentUser.email ? `ผู้ใช้งาน: ${currentUser.email}` : "ผู้ใช้งานทั่วไป"))}
          </div>
        </div>

        {/* Tab Card Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Top Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/60">
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all cursor-pointer",
                activeTab === "history"
                  ? "border-primary-600 text-primary-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/70"
              )}
            >
              <FileText className="h-4 w-4" />
              <span>
                {isAdmin ? "ประวัติการขอจัดตั้งศูนย์ฯ (ทุก อปท.)" : "ประวัติการขอจัดตั้งศูนย์ฯ"}
              </span>
              <span className={cn(
                "ml-1 px-2 py-0.5 text-xs font-semibold rounded-full",
                activeTab === "history" ? "bg-primary-100 text-primary-700" : "bg-slate-200 text-slate-500"
              )}>
                {baseCooperations.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("create")}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-all cursor-pointer",
                activeTab === "create"
                  ? "border-primary-600 text-primary-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-white/70"
              )}
            >
              <Building2 className="h-4 w-4" />
              <span>แบบเสนอความประสงค์สร้างศูนย์ฯ</span>
            </button>
          </div>

          {/* Global Submitted Banner */}
          {submitted && (
            <div className="mx-6 mt-4 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-5 py-3.5 text-green-700 text-sm font-semibold animate-fade-up shadow-sm">
              <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
              ยื่นความประสงค์สร้างศูนย์บริหารจัดการคุณภาพน้ำเรียบร้อยแล้ว (กำลังเริ่มต้นขั้นตอนที่ 1 ประสานงานในพื้นที่)
              <button onClick={() => setSubmitted(false)} className="ml-auto text-green-600 hover:text-green-800 cursor-pointer p-1"><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* TAB 1: Create Proposal Form */}
          {activeTab === "create" && currentUser && (
            <div className="animate-fade-up">
            <div className="p-6 space-y-6">
              {submitted && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm font-semibold animate-fade-up">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  ยื่นความประสงค์สร้างศูนย์บริหารจัดการคุณภาพน้ำเรียบร้อยแล้ว (กำลังเริ่มต้นขั้นตอนที่ 1 ประสานงานในพื้นที่)
                  <button onClick={() => setSubmitted(false)} className="ml-auto"><X className="h-4 w-4" /></button>
                </div>
              )}

              {/* LAO Selector (Admin or User without assigned LAO) */}
              {isSelectingLao && (
                <div className="p-4 bg-gray-50 border border-border rounded-xl mb-6">
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    เลือก อปท. ที่ต้องการยื่นข้อเสนอโครงการร่วมมือกับ อจน. <span className="text-rose-500 ml-1">*</span>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Field 1: Subject / Objective */}
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    1. วัตถุประสงค์ / ความต้องการหลัก <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none"
                    placeholder="ระบุวัตถุประสงค์ในการสร้างศูนย์ เช่น พัฒนาระบบบำบัดน้ำเสียหลักสำหรับเขตเทศบาล เพื่อแก้ไขปัญหาสิ่งแวดล้อมอย่างยั่งยืน..."
                  />
                </div>

                {/* Field 2: Site Readiness */}
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    2. ความพร้อมเรื่องพื้นที่สำหรับก่อสร้าง <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm resize-none"
                    placeholder="อธิบายรายละเอียดพื้นที่, สภาพปัญหาปัจจุบัน, และความพร้อมของ อปท. ในการจัดเตรียมพื้นที่สร้างศูนย์..."
                  />
                </div>

                {/* Field 3: Expected Outcome */}
                <div>
                  <label className="block text-sm font-bold text-primary-800 mb-2">
                    3. ผลลัพธ์ที่คาดว่าจะได้รับ <span className="text-rose-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm resize-none"
                    placeholder="เช่น รองรับปริมาณน้ำเสียชุมชน 2,500 ลบ.ม./วัน, ลดค่าความสกปรกของน้ำทิ้งก่อนปล่อยลงแม่น้ำสำคัญ..."
                  />
                </div>
              </div>

              {/* File Attachments Control */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-sm font-bold text-primary-800">
                    แนบไฟล์เอกสาร / รูปภาพเพิ่มเติม <span className="text-xs text-slate-400 font-normal">(ไม่บังคับ)</span>
                  </label>
                  <span className="text-xs text-slate-400">
                    รองรับไฟล์รูปภาพ, PDF, Word, Excel (แนบได้หลายไฟล์)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all border shadow-sm bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300">
                    <Paperclip className="h-4 w-4 text-primary-600" />
                    <span>แนบไฟล์...</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Attachments preview list */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
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

              {/* Submitter info & Submit Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <span className="font-semibold px-2 py-1 bg-gray-100 rounded-md truncate max-w-[150px]">
                    ผู้แจ้ง: {currentUser.name}
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
                    <><Send className="h-4 w-4" /> ส่งความต้องการความร่วมมือ</>
                  )}
                </button>
              </div>
            </div>
            </div>
          )}

          {/* TAB 2: History List */}
          {activeTab === "history" && (
            <div className="p-6 space-y-4 animate-fade-up">
            <div className="flex items-center justify-end">
              <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full border border-primary-200">
                {filteredCooperations.length} / {baseCooperations.length} รายการ
              </span>
            </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-3 py-1.5 rounded-xl font-bold transition-all border whitespace-nowrap cursor-pointer",
                statusFilter === "all"
                  ? "bg-primary-800 text-white border-primary-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              )}
            >
              ทั้งหมด ({baseCooperations.length})
            </button>

            {Object.entries(STATUS_LABELS).map(([key, val]) => {
              const count = baseCooperations.filter((c) => c.status === key).length;
              const isActive = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl font-bold transition-all border whitespace-nowrap cursor-pointer flex items-center gap-1.5",
                    isActive
                      ? "bg-primary-600 text-white border-primary-700 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <span>{val.th}</span>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded-md text-[10px]",
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredCooperations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <p className="text-text-secondary text-sm">
                {statusFilter === "all"
                  ? "ยังไม่มีประวัติการส่งความประสงค์เสนอความร่วมมือ"
                  : `ไม่พบรายการในสถานะ "${STATUS_LABELS[statusFilter]?.th || statusFilter}"`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {[...filteredCooperations].reverse().map((req) => {
                const safeStatus = (statusOrder as readonly string[]).includes(req.status) ? req.status : "coordination";
                const pendingStatus = pendingStatuses[req.id];
                const displayStatus = pendingStatus ?? safeStatus;
                const isEditing = editingId === req.id;
                
                // Officers can edit their own LAO's requests. Admins can edit anything.
                const canEdit = isAdmin || currentUser.laoId === req.laoId;

                const activeIndex = statusOrder.indexOf(safeStatus);

                const statusLeftBorderClass = 
                  safeStatus === "coordination" ? "border-l-yellow-500" :
                  safeStatus === "agreement" ? "border-l-blue-500" :
                  safeStatus === "land_acquisition" ? "border-l-indigo-500" :
                  safeStatus === "construction" ? "border-l-orange-500" :
                  "border-l-green-500";

                return (
                  <div key={req.id} className={cn(
                    "bg-white rounded-2xl border-y border-r p-6 space-y-6 shadow-sm transition-all border-l-4",
                    statusLeftBorderClass,
                    isEditing ? "border-primary-400 ring-4 ring-primary-50/50" : "border-slate-200 hover:shadow-md hover:shadow-slate-200/40"
                  )}>
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-primary-700" />
                        </div>
                        <div>
                          <div className="font-bold text-primary-800 text-sm md:text-base leading-tight">
                            {req.laoName}
                          </div>
                          <div className="text-xs text-text-secondary mt-0.5">
                            {formatDateTimeBE(req.createdAt, locale)} · จังหวัด{req.province}
                            {req.updatedAt && <span className="text-primary-500 font-medium ml-1">(แก้ไขแล้ว)</span>}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {canEdit && !isEditing && (
                          <button
                            onClick={() => startEdit(req)}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-colors border border-transparent hover:border-primary-200"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            แก้ไข
                          </button>
                        )}
                        <span className={cn("text-xs px-2.5 py-1 rounded-full border font-bold shadow-sm whitespace-nowrap", STATUS_LABELS[safeStatus].color)}>
                          {STATUS_LABELS[safeStatus].th}
                        </span>
                      </div>
                    </div>

                    {/* Stepper Progress Bar */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5 space-y-4">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        ความคืบหน้าโครงการความร่วมมือ (5 ขั้นตอนหลัก)
                      </div>
                      
                      {/* Flex/grid-based Stepper for both mobile and desktop */}
                      <div className="relative flex flex-col md:flex-row items-stretch md:items-start justify-between gap-4 md:gap-2 select-none">
                        {/* Background line for desktop */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 hidden md:block z-0" />
                        
                        {statusOrder.map((stepKey, idx) => {
                          const stepInfo = STATUS_LABELS[stepKey];
                          const isCompleted = idx < activeIndex;
                          const isActive = idx === activeIndex;
                          const isFuture = idx > activeIndex;

                          return (
                            <div key={stepKey} className="flex md:flex-col items-center md:text-center gap-3.5 md:gap-2 flex-1 relative z-10 w-full">
                              {/* Connector line for mobile vertical view */}
                              {idx < statusOrder.length - 1 && (
                                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-200 md:hidden -z-10" />
                              )}
                              
                              {/* Step circle */}
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all duration-300 shadow-sm flex-shrink-0",
                                isCompleted ? "bg-green-500 border-green-600 text-white" :
                                isActive ? "bg-primary-600 border-primary-700 text-white ring-4 ring-primary-100 scale-105" :
                                "bg-white border-slate-300 text-slate-400"
                              )}>
                                {isCompleted ? <Check className="h-4 w-4" /> : idx + 1}
                              </div>
                              
                              {/* Stepper label */}
                              <div className="flex-1 md:flex-none">
                                <div className={cn(
                                  "text-xs font-bold leading-tight transition-colors",
                                  isCompleted ? "text-green-700" :
                                  isActive ? "text-primary-800 font-black" :
                                  "text-slate-500"
                                )}>
                                  {stepInfo.th}
                                </div>
                                <div className="text-[10px] text-slate-400 leading-tight max-w-[130px] md:mx-auto mt-0.5">
                                  {stepInfo.desc}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3-Column Data Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                      {/* Column 1 */}
                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-2">1. วัตถุประสงค์ / ความต้องการหลัก</label>
                        {isEditing ? (
                          <textarea
                            value={editValues.subject || ""}
                            onChange={(e) => setEditValues({ ...editValues, subject: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-none bg-white font-medium"
                          />
                        ) : (
                          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-wrap font-medium">{req.subject}</p>
                        )}
                      </div>
                      
                      {/* Column 2 */}
                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-2">2. ความพร้อมเรื่องพื้นที่สำหรับก่อสร้าง</label>
                        {isEditing ? (
                          <textarea
                            value={editValues.details || ""}
                            onChange={(e) => setEditValues({ ...editValues, details: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none transition-all text-sm resize-none bg-white font-medium"
                          />
                        ) : (
                          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-wrap font-medium">{req.details || req.localPlan}</p>
                        )}
                      </div>
                      
                      {/* Column 3 */}
                      <div>
                        <label className="block text-sm font-bold text-primary-800 mb-2">3. ผลลัพธ์ที่คาดว่าจะได้รับ</label>
                        {isEditing ? (
                          <textarea
                            value={editValues.expectedOutcome || ""}
                            onChange={(e) => setEditValues({ ...editValues, expectedOutcome: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all text-sm resize-none bg-white font-medium"
                          />
                        ) : (
                          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-wrap font-medium">{req.expectedOutcome}</p>
                        )}
                      </div>
                    </div>

                    {/* Display Attached Files if any */}
                    {req.attachments && req.attachments.length > 0 && (
                      <div className="pt-3 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1.5">
                          📎 ไฟล์แนบ ({req.attachments.length} ไฟล์):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {req.attachments.map((att, attIdx) => (
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

                    {/* Status Update Controls (Only for Admin to save/edit status, but canEdit ensures we display appropriate actions) */}
                    {isAdmin && !isEditing && (
                      <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-border/50">
                        <span className="text-xs text-text-secondary font-medium mr-1">อัปเดตขั้นตอนดำเนินงาน (เฉพาะผู้ดูแลระบบ):</span>
                        
                        <div className="relative">
                          <select
                            value={displayStatus}
                            onChange={(e) => handleStatusChange(req.id, e.target.value as CooperationRequest["status"])}
                            className={cn(
                              "appearance-none pl-4 pr-8 py-1.5 text-xs font-bold rounded-full border outline-none shadow-sm transition-colors cursor-pointer",
                              displayStatus === "coordination" ? "bg-yellow-100 border-yellow-200 text-yellow-700 focus:ring-2 focus:ring-yellow-200 hover:bg-yellow-200/60" :
                              displayStatus === "agreement" ? "bg-blue-100 border-blue-200 text-blue-700 focus:ring-2 focus:ring-blue-200 hover:bg-blue-200/60" :
                              displayStatus === "land_acquisition" ? "bg-indigo-100 border-indigo-200 text-indigo-700 focus:ring-2 focus:ring-indigo-200 hover:bg-indigo-200/60" :
                              displayStatus === "construction" ? "bg-orange-100 border-orange-200 text-orange-700 focus:ring-2 focus:ring-orange-200 hover:bg-orange-200/60" :
                              "bg-green-100 border-green-200 text-green-700 focus:ring-2 focus:ring-green-200 hover:bg-green-200/60"
                            )}
                          >
                            {statusOrder.map(s => (
                              <option key={s} value={s} className="bg-white text-gray-800 font-medium">
                                {STATUS_LABELS[s].th}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className={cn(
                            "absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none",
                            displayStatus === "coordination" ? "text-yellow-700" :
                            displayStatus === "agreement" ? "text-blue-700" :
                            displayStatus === "land_acquisition" ? "text-indigo-700" :
                            displayStatus === "construction" ? "text-orange-700" :
                            "text-green-700"
                          )} />
                        </div>

                        {pendingStatus && pendingStatus !== req.status && (
                          <button
                            onClick={() => handleStatusSave(req.id)}
                            disabled={statusUpdating === req.id}
                            className="text-xs font-bold px-4 py-1.5 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-sm ml-1"
                          >
                            {statusUpdating === req.id ? "กำลังบันทึก..." : "บันทึกขั้นตอนดำเนินงาน"}
                          </button>
                        )}
                        {statusSaved === req.id && (
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
        )}

        </div>{/* end Tab Card Container */}

      </div>
    </div>
  );
}
