"use client";

import { useMemo, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Plus, Search, Trash2, Edit3, 
  Building2, CalendarDays, Users, AlertCircle, 
  CheckCircle2, Megaphone, Globe, X
} from "lucide-react";
import { cn, formatDateBE } from "@/lib/utils";
import { useAppStore } from "@/store";
import { AnnouncementItem } from "@/types";

const CATEGORIES = [
  { id: "system", labelTh: "ระบบบำบัดของ อปท.", labelEn: "LAO Systems", icon: Building2, color: "text-primary-600 bg-primary-50 border-primary-100" },
  { id: "lao", labelTh: "กิจกรรมของ อปท.", labelEn: "LAO Activities", icon: CalendarDays, color: "text-chula-700 bg-chula-50 border-chula-100" },
] as const;

const PROVINCES_THAI = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", "ขอนแก่น", "จันทบุรี",
  "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง",
  "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์",
  "นนทบุรี", "นราธิวาส", "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์",
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", "พัทลุง", "พิจิตร", "พิษณุโลก",
  "เพชรบุรี", "เพชรบูรณ์", "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", "ยโสธร",
  "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย",
  "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", "สมุทรสงคราม", "สมุทรสาคร",
  "สระแก้ว", "สระบุรี", "สิงห์บุรี", "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์",
  "หนองคาย", "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", "อุทัยธานี",
  "อุบลราชธานี"
];

export default function FeedCMSPage() {
  const locale = useLocale();
  const isThai = locale === "th";
  const router = useRouter();

  // Store bindings
  const announcements = useAppStore((s) => s.announcements);
  const loadAnnouncements = useAppStore((s) => s.loadAnnouncements);
  const createAnnouncement = useAppStore((s) => s.createAnnouncement);
  const updateAnnouncement = useAppStore((s) => s.updateAnnouncement);
  const deleteAnnouncement = useAppStore((s) => s.deleteAnnouncement);
  const currentUser = useAppStore((s) => s.currentUser);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AnnouncementItem | null>(null);
  
  // Form fields
  const [formType, setFormType] = useState<"system" | "lao" | "community">("system");
  const [titleTh, setTitleTh] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [summaryTh, setSummaryTh] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [provinceTh, setProvinceTh] = useState("");
  const [provinceEn, setProvinceEn] = useState("");
  const [date, setDate] = useState("");
  const [statusTh, setStatusTh] = useState("");
  const [statusEn, setStatusEn] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [formError, setFormError] = useState("");

  // Load state
  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  // Admin Guard redirect check
  useEffect(() => {
    // If user is loaded and NOT an admin, redirect back to feed
    if (currentUser && currentUser.role !== "admin") {
      router.push(`/${locale}/feed`);
    }
  }, [currentUser, router, locale]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = announcements;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.titleTh.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.summaryTh.toLowerCase().includes(q) ||
          item.summaryEn.toLowerCase().includes(q) ||
          item.provinceTh.toLowerCase().includes(q) ||
          item.provinceEn.toLowerCase().includes(q)
      );
    }

    return result;
  }, [announcements, searchQuery]);

  // Form setup for Creating
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setFormType("system");
    setTitleTh("");
    setTitleEn("");
    setSummaryTh("");
    setSummaryEn("");
    setProvinceTh("");
    setProvinceEn("");
    setDate(new Date().toISOString().split("T")[0]);
    setStatusTh("ดำเนินการแล้ว");
    setStatusEn("Completed");
    setIsPublic(true);
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Form setup for Editing
  const handleOpenEdit = (item: AnnouncementItem) => {
    setSelectedItem(item);
    setFormType(item.type);
    setTitleTh(item.titleTh);
    setTitleEn(item.titleEn);
    setSummaryTh(item.summaryTh);
    setSummaryEn(item.summaryEn);
    setProvinceTh(item.provinceTh);
    setProvinceEn(item.provinceEn);
    setDate(item.date);
    setStatusTh(item.statusTh || "");
    setStatusEn(item.statusEn || "");
    setIsPublic(item.isPublic !== false);
    setFormError("");
    setIsFormModalOpen(true);
  };

  // Form Submission
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titleTh.trim() || !summaryTh.trim() || !provinceTh.trim()) {
      setFormError(isThai ? "กรุณากรอกข้อมูลภาษาไทยให้ครบถ้วน" : "Please fill in all Thai fields (required)");
      return;
    }

    const payload: Omit<AnnouncementItem, "id"> = {
      type: formType,
      titleTh: titleTh.trim(),
      titleEn: titleEn.trim() || titleTh.trim(), // fallback
      summaryTh: summaryTh.trim(),
      summaryEn: summaryEn.trim() || summaryTh.trim(), // fallback
      provinceTh: provinceTh.trim(),
      provinceEn: provinceEn.trim() || provinceTh.trim(), // fallback
      date: date || new Date().toISOString().split("T")[0],
      statusTh: statusTh.trim() || "ดำเนินการแล้ว",
      statusEn: statusEn.trim() || "Completed",
    };

    if (selectedItem) {
      updateAnnouncement(selectedItem.id, payload);
    } else {
      const newId = `a${Date.now()}`;
      createAnnouncement({ id: newId, ...payload });
    }

    setIsFormModalOpen(false);
  };

  // Delete setup
  const handleOpenDelete = (item: AnnouncementItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteAnnouncement(selectedItem.id);
    }
    setIsDeleteModalOpen(false);
  };

  // Guard view while redirecting
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {isThai ? "ปฏิเสธการเข้าถึง" : "Access Denied"}
        </h1>
        <p className="text-slate-500 mb-6">
          {isThai ? "เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถจัดการหน้านี้ได้" : "Only administrators can access this management console."}
        </p>
        <button 
          onClick={() => router.push(`/${locale}/feed`)}
          className="flex items-center text-primary-700 hover:text-primary-800 font-bold bg-white border border-slate-200 px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isThai ? "กลับไปยังหน้าข่าวสาร" : "Go to Public Feed"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 pb-20">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button 
              onClick={() => router.push(`/${locale}/feed`)}
              className="flex items-center text-slate-500 hover:text-slate-700 text-sm font-semibold mb-3 group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
              {isThai ? "กลับไปหน้าข่าวสารหลัก" : "Back to Public Feed"}
            </button>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Megaphone className="h-7 w-7 text-primary-700" />
              {isThai ? "ระบบจัดการข่าวสารและประกาศ (CMS)" : "Feed Management Console (CMS)"}
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              {isThai 
                ? "เพิ่ม แก้ไข หรือลบรายการประกาศข่าวสารเพื่อแสดงบนหน้าสาธารณะ" 
                : "Create, edit, or remove announcement cards displayed on the public feed."}
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-primary-800 hover:bg-primary-900 text-white px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 text-sm cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            {isThai ? "สร้างข่าวสารใหม่" : "Add Announcement"}
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6">
          <div className="relative w-full shadow-sm rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl leading-5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
              placeholder={isThai ? "ค้นหาข่าวสารด้วยชื่อ หัวข้อ หรือจังหวัด..." : "Search news by title, body, or province..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Dashboard Grid list of CMS cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item) => {
            const catInfo = CATEGORIES.find((c) => c.id === item.type);
            return (
              <div 
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow group"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => updateAnnouncement(item.id, { isPublic: item.isPublic === false ? true : false })}
                      className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold transition cursor-pointer border",
                        item.isPublic !== false 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      )}
                      title={isThai ? "คลิกเพื่อเปลี่ยนสถานะการเผยแพร่" : "Click to toggle publication status"}
                    >
                      <span className={cn("w-2 h-2 rounded-full", item.isPublic !== false ? "bg-emerald-500" : "bg-slate-400")} />
                      {item.isPublic !== false ? (isThai ? "เผยแพร่แล้ว (Public)" : "Public") : (isThai ? "ไม่เผยแพร่ (Not Public)" : "Not Public")}
                    </button>
                    <span className="text-xs font-bold text-slate-400">ID: {item.id}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs font-semibold text-slate-500">จ.{item.provinceTh}</span>
                    <span className="text-xs text-slate-300">|</span>
                    <span className="text-xs text-slate-500">{formatDateBE(item.date, locale)}</span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-primary-800 transition-colors leading-tight">
                    {isThai ? item.titleTh : item.titleEn}
                  </h2>
                  <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                    {isThai ? item.summaryTh : item.summaryEn}
                  </p>
                </div>

                {/* CRUD Actions */}
                <div className="flex md:flex-col gap-2 shrink-0 justify-end pt-4 md:pt-0 border-t border-slate-100 md:border-t-0">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {isThai ? "แก้ไข" : "Edit"}
                  </button>
                  <button
                    onClick={() => handleOpenDelete(item)}
                    className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {isThai ? "ลบ" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {isThai ? "ไม่พบข้อมูลข่าวสาร" : "No announcements found"}
              </h3>
              <p className="text-slate-500 text-sm">
                {isThai ? "ลองค้นหาด้วยคำสำคัญอื่น หรือสร้างข่าวสารใหม่" : "Try searching using different terms or create a new feed card."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE & EDIT FORM DIALOG MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
          
          {/* Form Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/50 w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 z-10">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary-900 to-indigo-900 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-white" />
                <h3 className="font-bold text-lg text-white">
                  {selectedItem 
                    ? (isThai ? "แก้ไขข่าวสาร" : "Edit Announcement") 
                    : (isThai ? "สร้างข่าวสารใหม่" : "Create Announcement")}
                </h3>
              </div>
              <button 
                onClick={() => setIsFormModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Grid 2: Date, Location, and Publication Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Date Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {isThai ? "วันที่ประกาศ" : "Announcement Date"}
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-slate-250 rounded-xl px-3 py-2 text-sm text-slate-850 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                {/* Province Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {isThai ? "จังหวัด" : "Province"}
                  </label>
                  <select
                    value={provinceTh}
                    onChange={(e) => {
                      setProvinceTh(e.target.value);
                      setProvinceEn(e.target.value);
                    }}
                    className="w-full border border-slate-250 rounded-xl px-3 py-2 text-sm text-slate-850 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-medium"
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    {PROVINCES_THAI.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Publication Status Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {isThai ? "สถานะการเผยแพร่" : "Publication Status"}
                  </label>
                  <select
                    value={isPublic ? "public" : "draft"}
                    onChange={(e) => setIsPublic(e.target.value === "public")}
                    className="w-full border border-slate-250 rounded-xl px-3 py-2 text-sm text-slate-850 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
                  >
                    <option value="public">🟢 {isThai ? "เผยแพร่แล้ว (Public)" : "Public"}</option>
                    <option value="draft">⚪ {isThai ? "ไม่เผยแพร่ (Not Public)" : "Not Public"}</option>
                  </select>
                </div>
              </div>

              {/* News Details Content */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {isThai ? "หัวข้อข่าวสาร *" : "Announcement Title *"}
                  </label>
                  <input
                    type="text"
                    value={titleTh}
                    onChange={(e) => {
                      setTitleTh(e.target.value);
                      setTitleEn(e.target.value);
                    }}
                    placeholder="พิมพ์หัวข้อข่าวสาร..."
                    className="w-full border border-slate-250 rounded-xl px-3 py-2.5 text-sm text-slate-850 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 font-semibold"
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    {isThai ? "รายละเอียด/บทคัดย่อ *" : "Summary Description *"}
                  </label>
                  <textarea
                    rows={4}
                    value={summaryTh}
                    onChange={(e) => {
                      setSummaryTh(e.target.value);
                      setSummaryEn(e.target.value);
                    }}
                    placeholder="พิมพ์คำอธิบายหรือเนื้อหาข่าวสาร..."
                    className="w-full border border-slate-250 rounded-xl px-3 py-2 text-sm text-slate-850 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 leading-relaxed"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition cursor-pointer"
                >
                  {isThai ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-800 hover:bg-primary-900 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
                >
                  {isThai ? "บันทึกข้อมูล" : "Save Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {isDeleteModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          
          {/* Confirm Dialog Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/50 w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-200 z-10">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {isThai ? "ยืนยันการลบข่าวสาร" : "Confirm Deletion"}
            </h3>
            
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {isThai 
                ? `คุณต้องการลบข่าวสารหัวข้อ "${selectedItem.titleTh}" ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้`
                : `Are you sure you want to delete the announcement "${selectedItem.titleEn}"? This action cannot be undone.`}
            </p>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition cursor-pointer"
              >
                {isThai ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-md transition cursor-pointer"
              >
                {isThai ? "ลบรายการ" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
