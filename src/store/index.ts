import { create } from "zustand";
import { TreatmentFacility, WaterQualitySensor, CommunityReport, SystemStatus, WaterQualityLevel } from "@/types";
import { User } from "@/data/users";

interface AppState {
  // Auth
  currentUser: User | null;
  login: (user: User) => void;
  logout: () => void;

  // Facilities (from API)
  facilities: TreatmentFacility[];
  facilitiesLoaded: boolean;
  fetchFacilities: () => Promise<void>;
  updateFacilityStatus: (id: string, status: SystemStatus) => Promise<void>;

  // Sensors (from API)
  sensors: WaterQualitySensor[];
  sensorsLoaded: boolean;
  fetchSensors: () => Promise<void>;
  updateSensorLevel: (id: string, level: WaterQualityLevel) => Promise<void>;

  // Reports (from API)
  reports: CommunityReport[];
  reportsLoaded: boolean;
  fetchReports: () => Promise<void>;
  updateReportStatus: (reportId: string, status: CommunityReport["status"]) => Promise<void>;

  // Map state
  mapLayers: {
    facilities: boolean;
    waterQuality: boolean;
    reports: boolean;
  };
  selectedProvince: string;
  toggleLayer: (layer: keyof AppState["mapLayers"]) => void;
  setProvince: (province: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Auth
  currentUser: null,
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),

  // Facilities
  facilities: [],
  facilitiesLoaded: false,
  fetchFacilities: async () => {
    try {
      const res = await fetch("/api/facilities");
      if (res.ok) {
        const data = await res.json();
        set({ facilities: data, facilitiesLoaded: true });
      }
    } catch (err) {
      console.error("Failed to fetch facilities:", err);
    }
  },
  updateFacilityStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      facilities: state.facilities.map((f) =>
        f.id === id ? { ...f, status } : f
      ),
    }));
    try {
      const res = await fetch("/api/facilities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        get().fetchFacilities();
        console.error("Failed to save facility status");
      }
    } catch (err) {
      get().fetchFacilities();
      console.error("Failed to save facility status:", err);
    }
  },

  // Sensors
  sensors: [],
  sensorsLoaded: false,
  fetchSensors: async () => {
    try {
      const res = await fetch("/api/sensors");
      if (res.ok) {
        const data = await res.json();
        set({ sensors: data, sensorsLoaded: true });
      }
    } catch (err) {
      console.error("Failed to fetch sensors:", err);
    }
  },
  updateSensorLevel: async (id, level) => {
    // Optimistic update
    set((state) => ({
      sensors: state.sensors.map((s) =>
        s.id === id ? { ...s, level } : s
      ),
    }));
    try {
      const res = await fetch("/api/sensors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, level }),
      });
      if (!res.ok) {
        get().fetchSensors();
        console.error("Failed to save sensor level");
      }
    } catch (err) {
      get().fetchSensors();
      console.error("Failed to save sensor level:", err);
    }
  },

  // Reports
  reports: [],
  reportsLoaded: false,
  fetchReports: async () => {
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        set({ reports: data, reportsLoaded: true });
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  },
  updateReportStatus: async (reportId, status) => {
    // Optimistic update
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === reportId ? { ...r, status } : r
      ),
    }));
    try {
      const res = await fetch("/api/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reportId, status }),
      });
      if (!res.ok) {
        get().fetchReports();
        console.error("Failed to save status update");
      }
    } catch (err) {
      get().fetchReports();
      console.error("Failed to save status update:", err);
    }
  },

  // Map
  mapLayers: {
    facilities: true,
    waterQuality: true,
    reports: true,
  },
  selectedProvince: "",
  toggleLayer: (layer) =>
    set((state) => ({
      mapLayers: {
        ...state.mapLayers,
        [layer]: !state.mapLayers[layer],
      },
    })),
  setProvince: (province) => set({ selectedProvince: province }),
}));
