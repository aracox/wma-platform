import rawWma from "./wmaFacilities.json";
import rawDspot from "./dspotFacilities.json";
import rawWmaDetails from "./wmaFacilityDetails.json";

// Snapshot pulled once from the live WMA dashboard (164.115.22.99) and saved
// locally — not re-fetched on every load. Re-run the pull manually if the
// source data changes.

export interface WmaFacility {
  id: string;
  title: string;
  orgName: string;
  province: string;
  wastewaterVolumeToday: number | null;
  lat: number;
  lng: number;
}

// General-info detail for a WMA site, joined from the WMA workbook
// ("ข้อมูลทั่วไป ให้พี่เล็ก.xlsx") by scripts/parse-wma-details.js.
export interface WmaFacilityDetail {
  abbr: string | null;
  system: string | null;
  address: string | null;
  /** Design treatment capacity, ลบ.ม./วัน */
  capacity: number | null;
  /** Capacity as recorded by คพ (PCD); only present for some sites */
  capacityPcd: number | null;
  contactName: string | null;
  phones: string[];
  email: string | null;
  /** Public co-use amenities built over/around the plant; see AMENITY_LABELS */
  amenities: string[];
  /** How the workbook row was tied to this facility — "name" or "coord" */
  matchedBy: string;
  matchDistanceKm: number | null;
}

export interface DspotFacility {
  id: string;
  title: string;
  wastewaterVolume: number | null;
  reportYear: number | null;
  region: string;
  zone: string;
  basin: string;
  location: string;
  plantType: string | null;
  manageType: string | null;
  operatingUnit: string | null;
  status: string | null;
  lat: number;
  lng: number;
}

const wmaFacilities = rawWma as WmaFacility[];
const wmaDetails = rawWmaDetails as Record<string, WmaFacilityDetail>;
const dspotFacilities = rawDspot as DspotFacility[];

export function getWmaFacilities(): WmaFacility[] {
  return wmaFacilities;
}

export function getWmaFacilityDetail(id: string): WmaFacilityDetail | null {
  return wmaDetails[id] || null;
}

export function getDspotFacilities(): DspotFacility[] {
  return dspotFacilities;
}

// Sentinel value for the explicit "ทุกจังหวัด" / "ทุกอำเภอ" (show all) option,
// kept distinct from "" (the "-- เลือก --" placeholder) so a <select> can
// tell the two apart, even though both mean "don't filter".
export const ALL_LOCATIONS = "__ALL__";

// Co-use amenities the WMA workbook tracks per site
export const AMENITY_LABELS: Record<string, string> = {
  underground: "ระบบบำบัดใต้ดิน",
  park: "สวนสาธารณะ",
  golf: "สนามกอล์ฟ",
  exerciseYard: "ลานออกกำลังกาย",
  futsal: "สนามฟุตซอล",
  aquarium: "อควาเรียม",
};

export const TREATMENT_TYPE_LABELS: Record<string, string> = {
  SP: "Stabilization Pond",
  AS: "Activated Sludge",
  AL: "Aerated Lagoon",
  OD: "Oxidation Ditch",
  SBR: "Sequencing Batch Reactor",
};
