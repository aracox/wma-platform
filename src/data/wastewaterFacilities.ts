import rawFacilities from "./wastewaterFacilities.json";

export interface WastewaterFacility {
  id: string;
  name: string;
  orgName: string;
  subdistrict: string;
  district: string;
  province: string;
  population: number | null;
  treatmentType: string | null;
  capacityCubicMetersPerDay: number | null;
  projectType: string | null;
  constructionYear: number | null;
  wmaOperationYear: number | null;
  lat: number;
  lng: number;
}

const facilities = rawFacilities as WastewaterFacility[];

export function getWastewaterFacilities(): WastewaterFacility[] {
  return facilities;
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
};
