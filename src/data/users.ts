export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  nameEn: string;
  role: "official" | "admin";
  email: string;
  // For officers: the LAO org they belong to
  laoId?: string;
  laoName?: string;
  province?: string;
  provinceEn?: string;
}

export const USERS: User[] = [
  // ─── Admin ────────────────────────────────────────────────
  {
    id: "u01",
    username: "admin",
    password: "admin1234",
    name: "ผู้ดูแลระบบ",
    nameEn: "System Admin",
    role: "admin",
    email: "admin@wma.or.th",
  },

  // ─── LAO Officers (tied to real อปท. IDs from the CSV) ───
  {
    id: "u02",
    username: "off_bkk",
    password: "bkk1234",
    name: "ณัฐพล สุขสวัสดิ์",
    nameEn: "Nattapon Suksawat",
    role: "official",
    email: "nattapon@bkk.muni.th",
    // เทศบาลนครกรุงเทพ (ID from re01 CSV)
    laoId: "10800001",
    laoName: "กรุงเทพมหานคร",
    province: "กรุงเทพมหานคร",
    provinceEn: "Bangkok",
  },
  {
    id: "u03",
    username: "off_cm",
    password: "cm1234",
    name: "วิภา มณีรัตน์",
    nameEn: "Wipa Maneerat",
    role: "official",
    email: "wipa@cm.muni.th",
    // เทศบาลนครเชียงใหม่
    laoId: "50100001",
    laoName: "เทศบาลนครเชียงใหม่",
    province: "เชียงใหม่",
    provinceEn: "Chiang Mai",
  },
  {
    id: "u04",
    username: "off_kk",
    password: "kk1234",
    name: "ประสิทธิ์ แก้วใส",
    nameEn: "Prasit Kaewsai",
    role: "official",
    email: "prasit@kk.muni.th",
    // เทศบาลนครขอนแก่น
    laoId: "40100001",
    laoName: "เทศบาลนครขอนแก่น",
    province: "ขอนแก่น",
    provinceEn: "Khon Kaen",
  },
  {
    id: "u05",
    username: "off_pkt",
    password: "pkt1234",
    name: "ทิพย์วรรณ สุขสบาย",
    nameEn: "Thipwan Suksabai",
    role: "official",
    email: "thipwan@pkt.muni.th",
    // เทศบาลเมืองภูเก็ต
    laoId: "83000001",
    laoName: "เทศบาลเมืองภูเก็ต",
    province: "ภูเก็ต",
    provinceEn: "Phuket",
  },
];
