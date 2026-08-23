import { Phone, Printer, Mail, MapPin, Facebook, Youtube, Instagram, Twitter, MessageCircle } from "lucide-react";

export default function JoinWmaPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-10 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 md:p-10 text-white border border-primary-900 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-3">ร่วมงาน อจน.</h1>
            <p className="text-sm md:text-base text-blue-100/90 max-w-3xl leading-relaxed">
              องค์การจัดการน้ำเสีย (อจน.) กระทรวงมหาดไทย — ช่องทางติดต่อและข้อมูลองค์กร
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact details */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">ที่ตั้งสำนักงาน</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  333 อาคารเล้าเป้งง้วน 1 ชั้น 23 ถนนวิภาวดีรังสิต แขวงจอมพล เขตจตุจักร กรุงเทพฯ 10900
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">โทรศัพท์</h3>
                <ul className="text-slate-600 text-sm leading-relaxed space-y-0.5">
                  <li>โทรศัพท์กลาง: 0-2273-8530-39</li>
                  <li>กองกลาง: 0-2273-8550</li>
                  <li>กองสารสนเทศและประเมินผล: 0-2273-8564</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Printer className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">โทรสาร</h3>
                <p className="text-slate-600 text-sm leading-relaxed">0-2273-8577, 0-2273-8577-79</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">อีเมล</h3>
                <a href="mailto:saraban@wma.or.th" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  saraban@wma.or.th
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 mb-1">แชทออนไลน์</h3>
                <a
                  href="https://m.me/WMA38"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  m.me/WMA38 (Facebook Messenger)
                </a>
              </div>
            </div>
          </div>

          {/* Social channels */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <h3 className="font-bold text-slate-900 mb-4">ช่องทางโซเชียลมีเดีย</h3>
            <div className="space-y-3">
              <a
                href="https://www.facebook.com/WMA38"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-slate-700">Facebook: WMA38</span>
              </a>
              <a
                href="https://www.youtube.com/channel/UCXK-ow6q0qGQmnHGy3HvUmQ"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <Youtube className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-slate-700">YouTube</span>
              </a>
              <a
                href="https://www.instagram.com/wastewatermanagementauthority"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <Instagram className="w-5 h-5 text-pink-600" />
                <span className="text-sm font-medium text-slate-700">Instagram: wastewatermanagementauthority</span>
              </a>
              <a
                href="https://twitter.com/wma2538"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <Twitter className="w-5 h-5 text-slate-800" />
                <span className="text-sm font-medium text-slate-700">Twitter/X: @wma2538</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
