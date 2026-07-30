export type Locale = "th";

export type SystemStatus = "operational" | "non_operational" | "construction" | "cancelled";

export type WaterQualityLevel = "excellent" | "good" | "fair" | "poor" | "critical";
export type ReportCategory = "odor" | "discharge" | "overflow" | "other";
export type ReportType = "community" | "facility" | "water_quality";

export type UserRole = "official" | "admin" | "user";

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
  // New specific LAO 4-column report fields
  systemInfo: string;
  identifiedIssues: string;
  laoActivities: string;
  communityParticipation: string;
  // LAO context
  laoId: string;
  laoName: string;
  
  province: string;
  lat: number;
  lng: number;
  category?: ReportCategory;
  type?: ReportType;
  
  status: "pending" | "reviewing" | "resolved";
  createdAt: string;
  updatedAt?: string;
  reportedBy?: string;
  reportedByEmail?: string;
  attachments?: { name: string; url: string; size?: string; type?: string }[];
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

export interface LocalOrg {
  id: string;
  name: string;
  nameEn: string;
  province: string;
  provinceEn: string;
  district: string;
  subdistrict: string;
  type: "ทน." | "ทม." | "ทต." | "อบต." | "เมืองพัทยา" | "กทม.";
  lat: number;
  lng: number;
  wastewaterSystemIds: string[]; // refer to TreatmentFacility.id
  contact: {
    tel: string;
    website: string;
    address: string;
  };
}

export interface LocalActivity {
  id: string;
  laoId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  date: string;
  status: "planned" | "in_progress" | "completed";
  budget?: number;
}

export interface CommunityEvent {
  id: string;
  laoId: string;
  title: string;
  titleEn: string;
  date: string;
  location: string;
  participants: number;
  description: string;
  descriptionEn: string;
  photoUrl?: string;
}

export interface AnnouncementItem {
  id: string;
  type: "system" | "lao" | "community";
  titleTh: string;
  titleEn: string;
  summaryTh: string;
  summaryEn: string;
  detailsTh?: string;
  detailsEn?: string;
  provinceTh: string;
  provinceEn: string;
  date: string;
  statusTh?: string;
  statusEn?: string;
}

export type CooperationStatus = "coordination" | "agreement" | "land_acquisition" | "construction" | "management";

export interface CooperationRequest {
  id: string;
  subject: string;
  details: string;
  localPlan: string;
  expectedOutcome: string;
  laoId: string;
  laoName: string;
  lat: number;
  lng: number;
  province: string;
  status: CooperationStatus;
  createdAt: string;
  updatedAt?: string;
  reportedBy: string;
}
