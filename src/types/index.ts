export type Locale = "th" | "en";

export type SystemStatus = "operational" | "non_operational" | "construction" | "cancelled";

export type WaterQualityLevel = "excellent" | "good" | "fair" | "poor" | "critical";

export type UserRole = "public" | "coordinator" | "official" | "admin";

export interface TreatmentFacility {
  id: string;
  name: string;
  nameEn: string;
  province: string;
  provinceEn: string;
  lat: number;
  lng: number;
  status: SystemStatus;
  capacity: number; // m³/day
  currentLoad: number; // m³/day
  operator: string;
  lastUpdated: string;
}

export interface WaterQualitySensor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  province: string;
  level: WaterQualityLevel;
  bod: number; // mg/L
  cod: number; // mg/L
  ph: number;
  tss: number; // mg/L
  timestamp: string;
}

export interface CommunityReport {
  id: string;
  type?: "facility" | "water_quality" | "community";
  category: "odor" | "discharge" | "overflow" | "other";
  description: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  status: "pending" | "reviewing" | "resolved";
  createdAt: string;
  updatedAt?: string;
  province: string;
  facilityId?: string;
  sensorId?: string;
  reportedBy?: string;
  facilityName?: string;
  sensorName?: string;
}

export interface FeedItem {
  id: string;
  type: "news" | "report" | "research" | "alert";
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  imageUrl?: string;
  publishedAt: string;
  source: "wma" | "chula" | "community" | "government";
}

export interface KPIStat {
  id: string;
  labelKey: string;
  unitKey: string;
  value: number;
  trend?: number; // percentage change
  icon: string;
  color: string;
}
