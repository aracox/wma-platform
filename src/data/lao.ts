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

  // Deriving deterministic values from the ID to avoid hydration mismatch
  const numericId = parseInt(id.replace(/\D/g, ""), 10) || 1000;
  const capacity = 500 + (numericId % 2000);
  const servedPopulation = 1000 + (numericId % 10000);
  
  // Deriving a deterministic maintenance date (e.g. 2024 or 2025)
  const year = 2025 - (numericId % 2);
  const month = String((numericId % 12) + 1).padStart(2, '0');
  const day = String((numericId % 28) + 1).padStart(2, '0');
  const lastMaintained = `${year}-${month}-${day}`;

  // Mocking the extra data specific to this LAO ID
  return {
    ...base,
    wastewaterSystems: [
      {
        id: `sys-${id}-1`,
        name: `ระบบบำบัดน้ำเสียชุมชน ${base.name}แห่งที่ 1`,
        status: "operational",
        capacityCubicMetersPerDay: capacity,
        servedPopulation: servedPopulation,
        lastMaintained: lastMaintained,
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

