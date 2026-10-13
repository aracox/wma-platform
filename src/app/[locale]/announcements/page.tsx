"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Megaphone,
  ExternalLink,
  Columns,
  Maximize2,
  Share2,
  Sparkles,
  MessageCircle,
  ThumbsUp,
  ShieldCheck,
  Phone,
  Globe,
  Radio,
  Clock,
  Compass,
  RefreshCw,
  Send,
  CheckCircle2,
  AlertCircle,
  Zap,
  Calendar,
  Layers,
} from "lucide-react";
import { formatDateBE } from "@/lib/utils";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/WMA38";
const MESSENGER_URL = "https://m.me/WMA38";
const WMA_WEBSITE_URL = "https://www.wma.or.th";
const WEBHOOK_URL_PROD = "https://wma-platform.vercel.app/th/webhook/facebook";

interface SyncedPost {
  seq: number;
  id: string;
  message?: string;
  picture?: string;
  permalinkUrl?: string;
  createdTime?: string;
  syncedAt?: string;
}

// Sample fallback posts to demonstrate Option 4 if the database is initially empty
const FALLBACK_POSTS: SyncedPost[] = [
  {
    seq: 1,
    id: "fb_sample_1",
    message:
      "อจน. ร่วมกับเทศบาลนครเกาะสมุย ลงพื้นที่ตรวจสอบประสิทธิภาพการเดินระบบบำบัดน้ำเสียรวม เพื่อรองรับปริมาณน้ำเสียชุมชนและนักท่องเที่ยวอย่างยั่งยืน พร้อมนำเทคโนโลยี IoT ตรวจวัดคุณภาพน้ำแบบเรียลไทม์",
    picture: "/images/hero-slide-1.jpg",
    permalinkUrl: FACEBOOK_PAGE_URL,
    createdTime: "2026-10-13T09:30:00+07:00",
  },
  {
    seq: 2,
    id: "fb_sample_2",
    message:
      "ความรู้สิ่งแวดล้อม: 3 ขั้นตอนง่ายๆ ในการดูแลและดักไขมันก่อนปล่อยลงสู่ระบบรวบรวมน้ำเสียสาธารณะ ช่วยลดปัญหากลิ่นรบกวนและป้องกันท่ออุดตันในเขตชุมชน",
    picture: "/images/hero-slide-2.jpg",
    permalinkUrl: FACEBOOK_PAGE_URL,
    createdTime: "2026-10-12T14:15:00+07:00",
  },
  {
    seq: 3,
    id: "fb_sample_3",
    message:
      "ภาพบรรยากาศการจัดอบรมเชิงปฏิบัติการ 'การมีส่วนร่วมของภาคประชาชนในการเฝ้าระวังคุณภาพน้ำ' เพื่อสร้างจิตสำนึกและเครือข่ายอนุรักษ์ลุ่มน้ำร่วมกับองค์กรปกครองส่วนท้องถิ่น",
    picture: "/images/hero-slide-3.jpg",
    permalinkUrl: FACEBOOK_PAGE_URL,
    createdTime: "2026-10-11T11:00:00+07:00",
  },
];

export default function AnnouncementsPage() {
  // Option switcher:
  // "1" = Social Hub 2 Columns
  // "2" = Centered Stream
  // "3" = FB Page Cover Banner & Tabs
  // "4" = Live Webhook Native Feed (Make.com -> Webhook -> Native Cards)
  const [activeLayout, setActiveLayout] = useState<"1" | "2" | "3" | "4">("4");
  const [fbTab, setFbTab] = useState<"timeline" | "messages">("timeline");

  // State for Option 4
  const [syncedPosts, setSyncedPosts] = useState<SyncedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  // Facebook Page plugin iframe URLs
  const embedTimelineSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    FACEBOOK_PAGE_URL
  )}&tabs=timeline&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  const embedMessagesSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    FACEBOOK_PAGE_URL
  )}&tabs=messages&width=500&height=800&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`;

  const currentEmbedSrc = fbTab === "timeline" ? embedTimelineSrc : embedMessagesSrc;

  // Load Synced Posts from Database via API
  const fetchSyncedPosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/facebook/posts");
      const data = await res.json();
      if (data?.posts && data.posts.length > 0) {
        setSyncedPosts(data.posts);
      } else {
        setSyncedPosts(FALLBACK_POSTS);
      }
    } catch {
      setSyncedPosts(FALLBACK_POSTS);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchSyncedPosts();
  }, []);

  // Simulate pushing a new post through the webhook locally
  const handleSimulateWebhook = async () => {
    setIsTestingWebhook(true);
    setTestNotification(null);
    try {
      const sampleId = `post_${Date.now()}`;
      const sampleMessages = [
        "อจน. เดินหน้าโครงการพัฒนาเครือข่ายบำบัดน้ำเสียต้นแบบ ร่วมกับ อปท. ภาคเหนือ พร้อมส่งมอบศูนย์การเรียนรู้ระบบบำบัดน้ำเสียให้แก่เยาวชน",
        "รายงานผลการตรวจวัดคุณภาพน้ำประจำสัปดาห์: ค่า BOD และ DO ในระบบบำบัดน้ำเสียรวมทุกศูนย์อยู่ในเกณฑ์มาตรฐาน พร้อมเดินระบบตลอด 24 ชั่วโมง",
        "ขอเชิญชวนประชาชนร่วมกิจกรรมลดการทิ้งขยะลงสู่คูคลอง และสนับสนุนการใช้ถังดักไขมันในครัวเรือนเพื่อฟื้นฟูสภาพแวดล้อมชุมชน",
      ];
      const randomMsg = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      const samplePictures = [
        "/images/hero-slide-4.jpg",
        "/images/hero-slide-5.jpg",
        "/images/mission-real-1.png",
      ];
      const randomPic = samplePictures[Math.floor(Math.random() * samplePictures.length)];

      const res = await fetch("/th/webhook/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sampleId,
          message: randomMsg,
          full_picture: randomPic,
          permalink_url: FACEBOOK_PAGE_URL,
          created_time: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setTestNotification("✅ จำลองส่งโพสต์เข้า Webhook สำเร็จ! ข้อมูลบันทึกลง Database เรียบร้อย");
        await fetchSyncedPosts();
      } else {
        setTestNotification("⚠️ ส่งไม่สำเร็จ กรุณาตรวจสอบสถานะ API");
      }
    } catch {
      setTestNotification("⚠️ เกิดข้อผิดพลาดในการทดสอบ Webhook");
    } finally {
      setIsTestingWebhook(false);
      setTimeout(() => setTestNotification(null), 6000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* ============================================================== */}
        {/* TOP INTERACTIVE PREVIEW SWITCHER BAR                           */}
        {/* ============================================================== */}
        <section className="mb-8 rounded-3xl border border-primary-100 bg-white p-5 shadow-lg shadow-primary-900/5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-md shadow-primary-700/20 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-slate-900">
                    เลือกรูปแบบการแสดงผลข่าวสาร Facebook
                  </h2>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    Option 4 Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  รองรับทั้ง Make.com Webhook (การ์ดจริงเต็มจอ) และ Facebook Embed Iframe
                </p>
              </div>
            </div>

            {/* Layout Mode Selector Buttons */}
            <div className="inline-flex flex-wrap rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80 gap-1">
              <button
                onClick={() => setActiveLayout("4")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLayout === "4"
                    ? "bg-white text-primary-900 shadow-sm font-extrabold ring-1 ring-primary-500/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                แบบที่ 4: Live Webhook Feed (แนะนำ)
              </button>

              <button
                onClick={() => setActiveLayout("1")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLayout === "1"
                    ? "bg-white text-primary-900 shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                แบบที่ 1: Social Hub 2 คอลัมน์
              </button>

              <button
                onClick={() => setActiveLayout("2")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLayout === "2"
                    ? "bg-white text-primary-900 shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                แบบที่ 2: ฟีดกระชับกึ่งกลาง
              </button>

              <button
                onClick={() => setActiveLayout("3")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeLayout === "3"
                    ? "bg-white text-primary-900 shadow-sm font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                แบบที่ 3: Cover Banner & Tabs
              </button>
            </div>
          </div>

          {/* Explanation badge */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-2">
            <span className="font-bold text-primary-700">คำอธิบายแบบที่ {activeLayout}:</span>
            {activeLayout === "4" && (
              <span>
                รับข้อมูลโพสต์จริงจาก Make.com ผ่าน Webhook มาบันทึกลง Database แล้วนำมาเรนเดอร์เป็นการ์ดข่าว 3 คอลัมน์แบบเต็มจอ 100% ไม่มีข้อจำกัดเรื่องขนาดของ iframe
              </span>
            )}
            {activeLayout === "1" && (
              <span>
                แก้ปัญหา iframe ไม่เต็มจอ โดยแบ่งเป็น 2 คอลัมน์: ฝั่งซ้ายเป็นข้อมูลเพจทางการและช่องทางติดต่อ ฝั่งขวาเป็น Facebook Live Feed
              </span>
            )}
            {activeLayout === "2" && (
              <span>
                ย่อความกว้างทั้งหน้าให้เป็น Container ขนาดกะทัดรัด (Max-W-2XL) เพื่อให้หัวข้อและกล่อง Facebook Widget กว้างเท่ากัน
              </span>
            )}
            {activeLayout === "3" && (
              <span>
                ออกแบบเสมือนหน้า Facebook Fanpage มีแบนเนอร์ปก โลโก้ อจน. และปุ่มสลับแท็บโพสต์สด หรือแท็บส่งข้อความ Messenger
              </span>
            )}
          </div>
        </section>

        {/* ============================================================== */}
        {/* OPTION 4: LIVE WEBHOOK FEED (MAKE.COM -> WEBHOOK -> CARDS)     */}
        {/* ============================================================== */}
        {activeLayout === "4" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 md:p-10 text-white border border-primary-900 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                      ข่าวและกิจกรรม องค์การจัดการน้ำเสีย
                    </h1>
                  </div>
                  <p className="text-sm md:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                    อัปเดตแบบเรียลไทม์จาก Facebook เพจทางการ (@WMA38) ซิงค์อัตโนมัติผ่าน Make.com Webhook
                    แสดงผลในรูปแบบการ์ดข่าวสารของเว็บไซต์ อจน. 100%
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={FACEBOOK_PAGE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all active:scale-95"
                  >
                    <ThumbsUp className="w-4 h-4 text-blue-600" />
                    เพจ Facebook ทางการ
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Webhook Endpoint Status Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Webhook Integration Status
                    </h3>
                    <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono break-all">
                    Endpoint: <span className="font-bold text-primary-700">{WEBHOOK_URL_PROD}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={fetchSyncedPosts}
                    disabled={loadingPosts}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingPosts ? "animate-spin" : ""}`} />
                    รีเฟรชข้อมูล ({syncedPosts.length})
                  </button>

                  <button
                    onClick={handleSimulateWebhook}
                    disabled={isTestingWebhook}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-primary-50 hover:bg-primary-100 text-primary-900 border border-primary-200 transition-colors"
                  >
                    <Send className={`w-3.5 h-3.5 text-primary-600 ${isTestingWebhook ? "animate-bounce" : ""}`} />
                    จำลองส่งโพสต์ทดสอบ
                  </button>
                </div>
              </div>

              {testNotification && (
                <div className="mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{testNotification}</span>
                </div>
              )}
            </div>

            {/* Native 3-Column Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {syncedPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-primary-200 transition-all flex flex-col group"
                >
                  {/* Post Image */}
                  <div className="h-48 relative bg-slate-100 overflow-hidden">
                    <Image
                      src={post.picture || "/images/hero-slide-1.jpg"}
                      alt="WMA Facebook Update"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-600/90 backdrop-blur-md text-white shadow-xs flex items-center gap-1">
                        f Facebook Post
                      </span>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary-600" />
                          {post.createdTime ? formatDateBE(post.createdTime, "th") : "เมื่อเร็วๆ นี้"}
                        </span>
                        <span>•</span>
                        <span className="text-slate-400">@WMA38</span>
                      </div>

                      <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-normal line-clamp-4">
                        {post.message || "ดูรายละเอียดกิจกรรมและข้อมูลเพิ่มเติมบนเพจทางการขององค์การจัดการน้ำเสีย"}
                      </p>
                    </div>

                    {/* Bottom Action Link */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">องค์การจัดการน้ำเสีย</span>
                      <a
                        href={post.permalinkUrl || FACEBOOK_PAGE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 group-hover:translate-x-0.5 transition-transform"
                      >
                        อ่านบน Facebook
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* OPTION 1: 2 COLUMNS (FB INFO & ACTIONS + LIVE FEED)            */}
        {/* ============================================================== */}
        {activeLayout === "1" && (
          <div className="space-y-8 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 md:p-10 text-white border border-primary-900 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <Megaphone className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                      ข่าวและประชาสัมพันธ์ (Facebook ทางการ)
                    </h1>
                  </div>
                  <p className="text-sm md:text-base text-blue-100/90 max-w-2xl leading-relaxed">
                    ศูนย์รวมข้อมูลข่าวสาร กิจกรรม และความเคลื่อนไหวล่าสุด เชื่อมต่อสดจากเพจ Facebook
                    องค์การจัดการน้ำเสีย (@WMA38)
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-emerald-200">
                    Live Feed Connected
                  </span>
                </div>
              </div>
            </div>

            {/* 2 Columns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column (5 cols): Official FB Profile & Channel Hub */}
              <div className="lg:col-span-5 space-y-6">
                {/* Official Page Card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary-50 p-2 border border-primary-100 flex items-center justify-center relative shrink-0 shadow-xs">
                      <Image
                        src="/images/wma-logo.png"
                        alt="WMA Logo"
                        width={52}
                        height={52}
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="text-base font-extrabold text-slate-900 leading-tight">
                          องค์การจัดการน้ำเสีย
                        </h2>
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">@WMA38 • เพจทางการ</p>
                      <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        รัฐวิสาหกิจ สังกัดกระทรวงมหาดไทย
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    ช่องทางสื่อสารหลักของ อจน. เพื่อเผยแพร่องค์ความรู้ ข่าวสารการพัฒนาและบริหารจัดการระบบบำบัดน้ำเสียรวมชุมชนทั่วประเทศไทย
                  </p>

                  {/* Primary Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={FACEBOOK_PAGE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      ติดตามเพจ
                    </a>

                    <a
                      href={MESSENGER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      ส่งข้อความ
                    </a>
                  </div>
                </div>

                {/* Topics Covered on FB */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    หมวดหมู่เนื้อหาที่อัปเดตบนเพจ
                  </h3>
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">กิจกรรมและโครงการ อปท.:</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">ภาพการลงพื้นที่ตรวจสอบระบบ การรับมอบและเดินระบบบำบัดน้ำเสีย</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">อินโฟกราฟิกความรู้:</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">การติดตั้งบ่อดักไขมัน การใช้น้ำอย่างคุ้มค่า และการอนุรักษ์แหล่งน้ำ</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900">ประกาศและสื่อประชาสัมพันธ์:</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">ประกาศรับสมัครงาน จัดซื้อจัดจ้าง และรายงานประจำปี</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Contacts */}
                <div className="bg-gradient-to-br from-blue-50/60 to-cyan-50/60 rounded-3xl border border-blue-100 p-5 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-primary-600" />
                    ข้อมูลติดต่อ อจน. เพิ่มเติม
                  </h3>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>โทรศัพท์: 0 2273 8530</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <a href={WMA_WEBSITE_URL} target="_blank" rel="noreferrer" className="text-primary-700 hover:underline">
                        เว็บไซต์หลัก: www.wma.or.th
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Facebook Page Feed Widget */}
              <div className="lg:col-span-7 sticky top-6">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 flex flex-col items-center">
                  <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        f
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900">Facebook Live Timeline</h3>
                        <p className="text-[10px] text-slate-500">โพสต์และวิดีโอล่าสุดจาก @WMA38</p>
                      </div>
                    </div>
                    <a
                      href={FACEBOOK_PAGE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      เปิดบน Facebook
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Facebook Iframe Container with controlled max width */}
                  <div className="w-full flex justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                    <iframe
                      src={embedTimelineSrc}
                      width="500"
                      height="800"
                      style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
                      scrolling="no"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      title="Facebook Page: องค์การจัดการน้ำเสีย"
                    />
                  </div>

                  <a
                    href={FACEBOOK_PAGE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3.5 w-full py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    กดถูกใจและติดตามเพจ อจน.
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* OPTION 2: CENTERED COMPACT FEED (MATCHING WIDGET WIDTH)        */}
        {/* ============================================================== */}
        {activeLayout === "2" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header tailored specifically to the feed width */}
            <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-6 md:p-8 text-white border border-primary-900 shadow-xl text-center relative overflow-hidden">
              <div className="inline-flex p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-3">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
                ข่าวและประชาสัมพันธ์ อจน.
              </h1>
              <p className="mt-2 text-xs md:text-sm text-blue-100/90 leading-relaxed max-w-lg mx-auto">
                ติดตามข่าวสาร กิจกรรม และความเคลื่อนไหวจากเพจ Facebook ทางการ @WMA38
              </p>
            </div>

            {/* Centered Facebook Embed Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-700">Facebook Timeline Widget</span>
                </div>
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  @WMA38
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="w-full flex justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <iframe
                  src={embedTimelineSrc}
                  width="500"
                  height="800"
                  style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Facebook Page: องค์การจัดการน้ำเสีย"
                />
              </div>

              <div className="w-full mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">องค์การจัดการน้ำเสีย (อจน.)</span>
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
                >
                  เปิดดูใน Facebook
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* OPTION 3: FB COVER BANNER & INTERACTIVE TABS                   */}
        {/* ============================================================== */}
        {activeLayout === "3" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Facebook Styled Page Header Card */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Cover Photo Area */}
              <div className="h-44 md:h-56 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 relative">
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-4 left-6 text-white text-xs font-semibold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  เพจทางการ • องค์การจัดการน้ำเสีย
                </div>
              </div>

              {/* Profile Bar Area */}
              <div className="p-6 pt-0 relative">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4">
                  <div className="flex items-end gap-4">
                    <div className="w-24 h-24 rounded-2xl bg-white p-2.5 shadow-xl border-4 border-white flex items-center justify-center shrink-0">
                      <Image
                        src="/images/wma-logo.png"
                        alt="WMA Logo"
                        width={70}
                        height={70}
                        className="object-contain"
                      />
                    </div>
                    <div className="mb-1">
                      <div className="flex items-center gap-1.5">
                        <h1 className="text-xl md:text-2xl font-black text-slate-900">
                          องค์การจัดการน้ำเสีย
                        </h1>
                        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 font-medium">@WMA38 • Wastewater Management Authority</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <a
                      href={FACEBOOK_PAGE_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      ติดตามเพจ
                    </a>
                    <a
                      href={MESSENGER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      ส่งข้อความ
                    </a>
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => setFbTab("timeline")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      fbTab === "timeline"
                        ? "bg-primary-50 text-primary-900 border border-primary-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    โพสต์และกิจกรรม (Timeline)
                  </button>
                  <button
                    onClick={() => setFbTab("messages")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      fbTab === "messages"
                        ? "bg-primary-50 text-primary-900 border border-primary-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    ข้อความ (Messenger)
                  </button>
                </div>
              </div>
            </div>

            {/* Embed Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center">
              <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs">
                <span className="font-bold text-slate-800">
                  {fbTab === "timeline" ? "ฟีดโพสต์ล่าสุดจาก Facebook" : "ส่งข้อความถึงเพจ อจน."}
                </span>
                <span className="text-slate-400">อัปเดตแบบเรียลไทม์</span>
              </div>

              <div className="w-full flex justify-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                <iframe
                  src={currentEmbedSrc}
                  width="500"
                  height="800"
                  style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Facebook Page: องค์การจัดการน้ำเสีย"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
