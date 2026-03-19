import rawLaos from "./laos.json";

export interface LaoItem {
  id: string;
  province: string;
  district: string;
  subdistrict: string;
  type: string;
  name: string;
  address: string;
  moo: string;
  zipcode: string;
  area: string;
  lat: number;
  lng: number;
  website: string;
}

export interface WastewaterSystemData {
  id: string;
  name: string;
  status: "operational" | "non_operational" | "construction";
  capacityCubicMetersPerDay: number;
  servedPopulation: number;
  lastMaintained: string;
}

export interface LaoActivity {
  id: string;
  title: string;
  date: string;
  description: string;
  category: "wastewater_management" | "community_participation";
  imageUrl?: string;
}

export interface LaoDetail extends LaoItem {
  wastewaterSystems: WastewaterSystemData[];
  activities: LaoActivity[];
}

const LAOS_DATA: LaoItem[] = rawLaos as LaoItem[];

// Utility functions to access LAO data
export const getLaos = (): LaoItem[] => {
  return LAOS_DATA;
};

export const getLaoById = (id: string): LaoDetail | undefined => {
  const base = LAOS_DATA.find((l) => l.id === id);
  if (!base) return undefined;

  // Mocking the extra data specific to this LAO ID
  return {
    ...base,
    wastewaterSystems: [
      {
        id: `sys-${id}-1`,
        name: `ระบบบำบัดน้ำเสียชุมชน ${base.name}แห่งที่ 1`,
        status: "operational",
        capacityCubicMetersPerDay: 500 + Math.floor(Math.random() * 2000),
        servedPopulation: 1000 + Math.floor(Math.random() * 10000),
        lastMaintained: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
      }
    ],
    activities: [
      {
        id: `act-${id}-1`,
        title: "การจัดทำแผนแม่บทการจัดการน้ำเสีย",
        date: "2026-02-15",
        description: `อปท. ${base.name} ร่วมมือกับองค์การจัดการน้ำเสีย จัดกิจกรรมเชิงปฏิบัติการสร้างแผนแม่บทเพื่อยกระดับระบบบำบัดท้องถิ่น`,
        category: "wastewater_management"
      },
      {
        id: `act-${id}-2`,
        title: "กิจกรรมจิตอาสาฟื้นฟูแหล่งน้ำชุมชน",
        date: "2026-03-05",
        description: `ประชาชนในพื้นที่ ${base.subdistrict} ร่วมกันทำกิจกรรมจิตอาสาเก็บขยะและปรับปรุงภูมิทัศน์ริมคลอง`,
        category: "community_participation"
      }
    ]
  };
};

export const searchLaos = (query: string, limit = 50): LaoItem[] => {
  if (!query) return LAOS_DATA.slice(0, limit);
  const loQuery = query.toLowerCase();
  
  return LAOS_DATA.filter(l => 
    l.name.toLowerCase().includes(loQuery) ||
    l.province.toLowerCase().includes(loQuery) ||
    l.district.toLowerCase().includes(loQuery) ||
    l.id.includes(loQuery)
  ).slice(0, limit);
};
