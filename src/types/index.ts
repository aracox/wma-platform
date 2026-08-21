export type SystemStatus =
  | "operational"
  | "non_operational"
  | "construction"
  | "cancelled"
  | "under_maintenance"
  | "temporarily_closed";

export type WaterQualityLevel = "excellent" | "good" | "fair" | "poor" | "critical";
export type ReportCategory = "odor" | "discharge" | "overflow" | "other";
export type ReportType = "community" | "facility" | "water_quality";

export type UserRole = "official" | "admin" | "user";

export interface User {
  id: string;
  username: string;
  name: string;
  nameEn: string;
  role: UserRole;
  email: string;
  laoId?: string;
  laoName?: string;
  province?: string;
  provinceEn?: string;
}

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
  isPublic?: boolean;
}

export type CooperationStatus = "coordination" | "agreement" | "land_acquisition" | "construction" | "management";

export interface CooperationRequest {
  id: string;
  asOfDate?: string;
  // Legacy free-text fields (pre official-form alignment)
  subject?: string;
  details?: string;
  localPlan?: string;
  expectedOutcome?: string;
  // Official-form-aligned fields
  willingToParticipate?: "yes" | "no";
  notParticipatingReason?: string;
  hasLandReady?: "yes" | "no";
  informantName?: string;
  informantPosition?: string;
  informantAgencyAddress?: string;
  informantPhone?: string;
  informantMobile?: string;
  informantFax?: string;
  informantEmail?: string;
  laoId: string;
  laoName: string;
  lat: number;
  lng: number;
  province: string;
  status: CooperationStatus;
  createdAt: string;
  updatedAt?: string;
  reportedBy: string;
  attachments?: { name: string; url: string; size?: string; type?: string }[];
}
