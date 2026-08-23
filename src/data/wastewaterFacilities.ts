import rawWma from "./wmaFacilities.json";
import rawDspot from "./dspotFacilities.json";

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
const dspotFacilities = rawDspot as DspotFacility[];

export function getWmaFacilities(): WmaFacility[] {
  return wmaFacilities;
}

export function getDspotFacilities(): DspotFacility[] {
  return dspotFacilities;
}

// Sentinel value for the explicit "ทุกจังหวัด" / "ทุกอำเภอ" (show all) option,
// kept distinct from "" (the "-- เลือก --" placeholder) so a <select> can
// tell the two apart, even though both mean "don't filter".
export const ALL_LOCATIONS = "__ALL__";

export const TREATMENT_TYPE_LABELS: Record<string, string> = {
  SP: "Stabilization Pond",
  AS: "Activated Sludge",
  AL: "Aerated Lagoon",
  OD: "Oxidation Ditch",
  SBR: "Sequencing Batch Reactor",
};
