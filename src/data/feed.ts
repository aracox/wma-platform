import { FeedItem } from "@/types";

export const NEWS_ITEMS: FeedItem[] = [
  { id: "n01", type: "news", source: "wma", title: "เปิดใช้งานระบบบำบัดน้ำเสียแห่งใหม่ที่จังหวัดเชียงใหม่", titleEn: "New wastewater treatment system launched in Chiang Mai", summary: "องค์การจัดการน้ำเสียเปิดใช้งานระบบบำบัดน้ำเสียแห่งใหม่ความจุ 5,000 ม.³/วัน รองรับประชากรกว่า 50,000 คน", summaryEn: "WMA launched a new 5,000 m³/day treatment system serving over 50,000 residents.", publishedAt: "2026-03-15" },
  { id: "n02", type: "research", source: "chula", title: "ผลการศึกษาคุณภาพน้ำในแม่น้ำเจ้าพระยา ประจำปี 2568", titleEn: "Annual Chao Phraya River Water Quality Study 2025", summary: "จุฬาลงกรณ์มหาวิทยาลัยเผยผลการตรวจวัดคุณภาพน้ำ พบค่า BOD ลดลง 12% จากปีก่อน แต่ยังเกินค่ามาตรฐานในบางพื้นที่", summaryEn: "Chulalongkorn University reports 12% BOD reduction in Chao Phraya, though some areas still exceed standards.", publishedAt: "2026-03-10" },
  { id: "n03", type: "alert", source: "community", title: "แจ้งเหตุน้ำเสียในคลองแสนแสบ เขตมีนบุรี", titleEn: "Wastewater alert - Saen Saep Canal, Min Buri", summary: "ชุมชนรายงานพบน้ำเสียบริเวณคลองแสนแสบ กำลังดำเนินการตรวจสอบโดยเจ้าหน้าที่", summaryEn: "Community reported wastewater discharge near Saen Saep Canal. Investigation underway.", publishedAt: "2026-03-18" },
  { id: "n04", type: "news", source: "government", title: "กรมควบคุมมลพิษประกาศปรับปรุงค่ามาตรฐานน้ำทิ้ง พ.ศ. 2568", titleEn: "PCD announces updated effluent standards 2025", summary: "กรมควบคุมมลพิษปรับค่า BOD มาตรฐานน้ำทิ้งจาก 20 mg/L เหลือ 15 mg/L เพื่อยกระดับคุณภาพน้ำในแหล่งน้ำธรรมชาติ", summaryEn: "PCD tightened BOD effluent standards from 20 to 15 mg/L to improve natural water quality.", publishedAt: "2026-03-08" },
  { id: "n05", type: "research", source: "chula", title: "โครงการวิจัย: เทคโนโลยีบำบัดน้ำเสียด้วยพลังงานแสงอาทิตย์", titleEn: "Research: Solar-Powered Wastewater Treatment Technology", summary: "ทีมวิจัยจุฬาฯ พัฒนาระบบบำบัดน้ำเสียพลังงานแสงอาทิตย์สำหรับชุมชนขนาดเล็ก ลดต้นทุนการดำเนินการได้ถึง 40%", summaryEn: "Chula researchers developed solar-powered wastewater treatment for small communities, reducing operating costs by 40%.", publishedAt: "2026-03-05" },
];

export interface LegalItem {
  id: string;
  title: string;
  titleEn: string;
  category: "act" | "regulation" | "standard" | "announcement";
  description: string;
  descriptionEn: string;
  year: number;
  agency: string;
  documentUrl?: string;
}

export const LEGAL_ITEMS: LegalItem[] = [
  { id: "l01", title: "พระราชบัญญัติส่งเสริมและรักษาคุณภาพสิ่งแวดล้อมแห่งชาติ พ.ศ. 2535", titleEn: "Enhancement and Conservation of National Environmental Quality Act B.E. 2535", category: "act", description: "กฎหมายหลักด้านสิ่งแวดล้อมของประเทศไทย กำหนดมาตรฐานคุณภาพสิ่งแวดล้อม มาตรฐานควบคุมมลพิษ และกลไกการบังคับใช้กฎหมาย", descriptionEn: "Thailand's primary environmental law establishing environmental quality standards, pollution control standards, and enforcement mechanisms.", year: 2535, agency: "กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม" },
  { id: "l02", title: "มาตรฐานควบคุมการระบายน้ำทิ้งจากระบบบำบัดน้ำเสียรวมของชุมชน", titleEn: "Effluent Standards for Community Wastewater Treatment Systems", category: "standard", description: "กำหนดค่ามาตรฐานน้ำทิ้งจากระบบบำบัดน้ำเสียรวมของชุมชน ได้แก่ BOD ≤ 20 mg/L, SS ≤ 30 mg/L, pH 5-9, TKN ≤ 35 mg/L", descriptionEn: "Sets effluent standards from community wastewater treatment systems: BOD ≤ 20 mg/L, SS ≤ 30 mg/L, pH 5-9, TKN ≤ 35 mg/L.", year: 2553, agency: "กรมควบคุมมลพิษ" },
  { id: "l03", title: "พระราชกฤษฎีกาจัดตั้งองค์การจัดการน้ำเสีย พ.ศ. 2538", titleEn: "Royal Decree Establishing the Wastewater Management Authority B.E. 2538", category: "regulation", description: "กฎหมายจัดตั้งองค์การจัดการน้ำเสีย (อจน.) กำหนดอำนาจหน้าที่และขอบเขตการดำเนินงาน", descriptionEn: "Legislation establishing the Wastewater Management Authority (WMA), defining its mandate and operational scope.", year: 2538, agency: "องค์การจัดการน้ำเสีย" },
  { id: "l04", title: "ประกาศกระทรวงทรัพยากรธรรมชาติฯ เรื่องมาตรฐานคุณภาพน้ำในแหล่งน้ำผิวดิน", titleEn: "Surface Water Quality Standards", category: "announcement", description: "กำหนดมาตรฐานคุณภาพน้ำในแหล่งน้ำผิวดิน แบ่งเป็น 5 ประเภทตามการใช้ประโยชน์ ตั้งแต่น้ำดิบสำหรับผลิตน้ำประปา ถึงน้ำเพื่อการเกษตร", descriptionEn: "Classifies surface water into 5 quality types based on intended use, from raw water for waterworks to agricultural water.", year: 2560, agency: "กรมควบคุมมลพิษ" },
  { id: "l05", title: "พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)", titleEn: "Personal Data Protection Act B.E. 2562 (PDPA)", category: "act", description: "กฎหมายคุ้มครองข้อมูลส่วนบุคคล มีผลต่อการเก็บและใช้ข้อมูลในระบบแพลตฟอร์มนี้ รวมถึงข้อมูลการรายงานปัญหาจากประชาชน", descriptionEn: "Personal data protection law affecting how this platform collects and uses data, including citizen report information.", year: 2562, agency: "สำนักงานคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล" },
];

export interface ParticipationItem {
  id: string;
  title: string;
  titleEn: string;
  type: "guide" | "activity" | "network" | "campaign";
  description: string;
  descriptionEn: string;
  imageEmoji: string;
  actionLabel: string;
  actionLabelEn: string;
}

export const PARTICIPATION_ITEMS: ParticipationItem[] = [
  { id: "p01", title: "วิธีการแจ้งปัญหาน้ำเสียในชุมชน", titleEn: "How to Report Wastewater Issues", type: "guide", description: "คู่มือสำหรับประชาชนในการแจ้งปัญหาน้ำเสียผ่านแพลตฟอร์ม พร้อมขั้นตอนการถ่ายรูป ระบุตำแหน่ง และส่งรายงาน", descriptionEn: "Citizen guide for reporting wastewater issues through the platform, including photo, location, and submission steps.", imageEmoji: "📍", actionLabel: "แจ้งปัญหาเลย", actionLabelEn: "Report Now" },
  { id: "p02", title: "เครือข่ายอาสาสมัครตรวจคุณภาพน้ำ", titleEn: "Water Quality Volunteer Network", type: "network", description: "เข้าร่วมเป็นอาสาสมัครตรวจวัดคุณภาพน้ำในชุมชนของคุณ รับชุดตรวจวัดฟรีและการฝึกอบรมจากทีมนักวิจัยจุฬาลงกรณ์มหาวิทยาลัย", descriptionEn: "Join as a volunteer water quality monitor in your community. Receive free test kits and training from Chula research team.", imageEmoji: "🧪", actionLabel: "สมัครอาสาสมัคร", actionLabelEn: "Join as Volunteer" },
  { id: "p03", title: "กิจกรรมทำความสะอาดคลองชุมชน", titleEn: "Community Canal Cleanup Activities", type: "activity", description: "ร่วมกิจกรรมทำความสะอาดคลองและแหล่งน้ำในชุมชน จัดขึ้นทุกเดือน ในพื้นที่กรุงเทพฯ และจังหวัดใกล้เคียง", descriptionEn: "Join monthly canal and waterway cleanup activities in Bangkok and surrounding provinces.", imageEmoji: "🌊", actionLabel: "ดูกำหนดการ", actionLabelEn: "View Schedule" },
  { id: "p04", title: "รายงานผลการมีส่วนร่วมประจำปี 2567", titleEn: "Annual Participation Report 2024", type: "guide", description: "สรุปผลการมีส่วนร่วมของภาคประชาชนในการจัดการน้ำเสียปีที่ผ่านมา มีผู้รายงาน 1,284 ราย อาสาสมัคร 342 คน ใน 47 จังหวัด", descriptionEn: "Summary of citizen participation in wastewater management: 1,284 reports, 342 volunteers, 47 provinces.", imageEmoji: "📊", actionLabel: "ดาวน์โหลดรายงาน", actionLabelEn: "Download Report" },
  { id: "p05", title: "โครงการ 'หมู่บ้านน้ำสะอาด'", titleEn: "'Clean Water Village' Project", type: "campaign", description: "โครงการนำร่องในการสร้างความตระหนักและการมีส่วนร่วมของชุมชนในการบำบัดน้ำเสีย กำลังรับสมัครหมู่บ้านเพิ่มเติม 20 แห่ง", descriptionEn: "Pilot project building community awareness and participation in wastewater management. Recruiting 20 more villages.", imageEmoji: "🏘️", actionLabel: "สมัครโครงการ", actionLabelEn: "Apply Now" },
  { id: "p06", title: "แบบสอบถามความพึงพอใจการบริการ อจน.", titleEn: "WMA Service Satisfaction Survey", type: "activity", description: "ร่วมแสดงความคิดเห็นเกี่ยวกับคุณภาพการให้บริการขององค์การจัดการน้ำเสีย เพื่อพัฒนาการให้บริการในอนาคต", descriptionEn: "Share your feedback on WMA service quality to help improve future services.", imageEmoji: "📝", actionLabel: "ทำแบบสอบถาม", actionLabelEn: "Take Survey" },
];
