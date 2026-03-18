export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  nameEn: string;
  role: "public" | "coordinator" | "official" | "admin";
  email: string;
  province?: string;
  provinceEn?: string;
  provinceLat?: number;
  provinceLng?: number;
}

export const USERS: User[] = [
  {
    id: "u01",
    username: "test",
    password: "test",
    name: "ผู้ดูแลระบบ",
    nameEn: "System Admin",
    role: "admin",
    email: "admin@wma.or.th",
  },
  {
    id: "u02",
    username: "officer1",
    password: "officer1",
    name: "สมชาย วิศวกรสิ่งแวดล้อม",
    nameEn: "Somchai Environmental Engineer",
    role: "official",
    email: "somchai@wma.or.th",
  },
  {
    id: "u03",
    username: "coord1",
    password: "coord1",
    name: "สมหญิง ประสานงานชุมชน",
    nameEn: "Somying Community Coordinator",
    role: "coordinator",
    email: "somying@community.org",
  },
  // Province officers
  {
    id: "u04",
    username: "off_bkk",
    password: "bkk1234",
    name: "ณัฐพล สุขสวัสดิ์",
    nameEn: "Nattapon Suksawat",
    role: "official",
    email: "nattapon@wma.or.th",
    province: "กรุงเทพมหานคร",
    provinceEn: "Bangkok",
    provinceLat: 13.7563,
    provinceLng: 100.5018,
  },
  {
    id: "u05",
    username: "off_cm",
    password: "cm1234",
    name: "วิภา มณีรัตน์",
    nameEn: "Wipa Maneerat",
    role: "official",
    email: "wipa@wma.or.th",
    province: "เชียงใหม่",
    provinceEn: "Chiang Mai",
    provinceLat: 18.7883,
    provinceLng: 98.9853,
  },
  {
    id: "u06",
    username: "off_kk",
    password: "kk1234",
    name: "ประสิทธิ์ แก้วใส",
    nameEn: "Prasit Kaewsai",
    role: "official",
    email: "prasit@wma.or.th",
    province: "ขอนแก่น",
    provinceEn: "Khon Kaen",
    provinceLat: 16.4322,
    provinceLng: 102.8236,
  },
  {
    id: "u07",
    username: "off_pkt",
    password: "pkt1234",
    name: "ทิพย์วรรณ สุขสบาย",
    nameEn: "Thipwan Suksabai",
    role: "official",
    email: "thipwan@wma.or.th",
    province: "ภูเก็ต",
    provinceEn: "Phuket",
    provinceLat: 7.8804,
    provinceLng: 98.3923,
  },
];
