import { ExternalLink, Megaphone } from "lucide-react";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/WMA38";
// Facebook's Page Plugin "timeline" tab renders its content column at a
// fixed ~500px regardless of the width requested — passing a larger width
// just adds empty space around it, it doesn't make posts wider. So the card
// is sized to fit the widget instead of stretching the widget to fit the page.
const EMBED_WIDTH = 560;

export default function AnnouncementsPage() {
  const embedSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    FACEBOOK_PAGE_URL
  )}&tabs=timeline&width=${EMBED_WIDTH}&height=800&small_header=false&hide_cover=false&show_facepile=true`;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-10 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 rounded-3xl p-8 md:p-10 text-white border border-primary-900 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">ข่าวและประชาสัมพันธ์</h1>
            </div>
            <p className="text-sm md:text-base text-blue-100/90 max-w-3xl leading-relaxed">
              ข่าวสารและกิจกรรมล่าสุดจากองค์การจัดการน้ำเสีย (อจน.) อัปเดตจากเพจ Facebook ทางการ
            </p>
          </div>
        </div>

        {/* Facebook Page embed — card sized to fit the widget, not stretched to the page width */}
        <div className="mx-auto max-w-fit bg-white rounded-3xl shadow-sm border border-gray-100 p-4 md:p-6 flex flex-col items-center">
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <iframe
              src={embedSrc}
              width={EMBED_WIDTH}
              height="800"
              style={{ border: "none", overflow: "hidden", display: "block" }}
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
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
          >
            เปิดเพจ Facebook ทางการ
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
