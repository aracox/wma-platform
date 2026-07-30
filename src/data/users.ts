export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  nameEn: string;
  role: "official" | "admin" | "user";
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
  // ─── General User ─────────────────────────────────────────
  {
    id: "u02",
    username: "user",
    password: "user1234",
    name: "ประชาชนทั่วไป",
    nameEn: "General User",
    role: "official",
    email: "user@community.or.th",
  },
];
