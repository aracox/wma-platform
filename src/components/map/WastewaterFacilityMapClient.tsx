"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, Droplets } from "lucide-react";
import { WastewaterFacility, TREATMENT_TYPE_LABELS, ALL_LOCATIONS as ALL } from "@/data/wastewaterFacilities";

const FACILITY_PIN_COLOR = "#0e7490"; // cyan-700

interface Props {
  facilities: WastewaterFacility[];
  selectedProvince: string;
  selectedDistrict: string;
  searchQuery?: string;
}

export default function WastewaterFacilityMapClient({ facilities, selectedProvince, selectedDistrict, searchQuery = "" }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  const [mapReady, setMapReady] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<WastewaterFacility | null>(null);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((m) => m.remove());
    markers.current = [];
  }, []);

  const addMarkers = useCallback(() => {
    if (!map.current) return;
    clearMarkers();

    let filtered = facilities;
    if (selectedProvince && selectedProvince !== ALL) {
      filtered = filtered.filter((f) => f.province === selectedProvince);
    }
    if (selectedDistrict && selectedDistrict !== ALL) {
      filtered = filtered.filter((f) => f.district === selectedDistrict);
    }

    if (map.current && filtered.length > 0 && (selectedProvince || selectedDistrict || searchQuery)) {
      const lats = filtered.map((c) => c.lat);
      const lngs = filtered.map((c) => c.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      if (minLat === maxLat && minLng === maxLng) {
        map.current.flyTo({ center: [minLng, minLat], zoom: 12, duration: 1200 });
      } else {
        map.current.fitBounds(
          [[minLng, minLat], [maxLng, maxLat]],
          { padding: 80, maxZoom: 13, duration: 1200 }
        );
      }
    } else if (map.current && !selectedProvince && !selectedDistrict && !searchQuery) {
      map.current.flyTo({ center: [101.0, 13.5], zoom: 5.5, duration: 1200 });
    }

    filtered.forEach((facility) => {
      const el = document.createElement("div");
      el.title = facility.name;
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50%;
        background: ${FACILITY_PIN_COLOR};
        border: 2.5px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.28);
        cursor: pointer;
        transition: box-shadow 0.15s;
      `;
      el.addEventListener("mouseenter", () => {
        el.style.boxShadow = "0 0 0 5px rgba(14,116,144,0.35), 0 2px 8px rgba(0,0,0,0.3)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.28)";
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedFacility(facility);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([facility.lng, facility.lat])
        .addTo(map.current!);
      markers.current.push(marker);
    });
  }, [facilities, selectedProvince, selectedDistrict, searchQuery, clearMarkers]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [101.0, 13.5],
      zoom: 5.5,
      minZoom: 4,
      maxZoom: 16,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.current.on("load", () => setMapReady(true));
    map.current.on("click", () => setSelectedFacility(null));

    return () => {
      clearMarkers();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapReady) addMarkers();
  }, [mapReady, facilities, selectedProvince, selectedDistrict, searchQuery, addMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-8 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-xs z-10">
        <div className="font-bold text-gray-700 mb-2">สัญลักษณ์</div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ background: FACILITY_PIN_COLOR }} />
          <span className="text-gray-600">ระบบบำบัดน้ำเสีย อจน.</span>
        </div>
      </div>

      {/* Selected Facility Panel */}
      {selectedFacility && (
        <div
          className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-cyan-800 to-cyan-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-bold">ระบบบำบัดน้ำเสีย</span>
            </div>
            <button onClick={() => setSelectedFacility(null)} className="text-white/70 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              {selectedFacility.treatmentType && (
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100 mb-2">
                  {selectedFacility.treatmentType} — {TREATMENT_TYPE_LABELS[selectedFacility.treatmentType] || selectedFacility.treatmentType}
                </div>
              )}
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{selectedFacility.orgName || selectedFacility.name}</h3>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex gap-1">
                <span className="text-gray-400 w-16 flex-shrink-0">ที่ตั้ง</span>
                <span className="font-medium text-gray-800">
                  ต.{selectedFacility.subdistrict} อ.{selectedFacility.district} จ.{selectedFacility.province}
                </span>
              </div>
              {selectedFacility.population !== null && (
                <div className="flex gap-1">
                  <span className="text-gray-400 w-16 flex-shrink-0">ประชากร</span>
                  <span className="font-medium text-gray-800">{selectedFacility.population.toLocaleString()} คน</span>
                </div>
              )}
              {selectedFacility.capacityCubicMetersPerDay !== null && (
                <div className="flex gap-1">
                  <span className="text-gray-400 w-16 flex-shrink-0">ขนาดบำบัด</span>
                  <span className="font-medium text-gray-800">
                    {selectedFacility.capacityCubicMetersPerDay.toLocaleString()} ลบ.ม./วัน
                  </span>
                </div>
              )}
              {selectedFacility.projectType && (
                <div className="flex gap-1">
                  <span className="text-gray-400 w-16 flex-shrink-0">โครงการ</span>
                  <span className="font-medium text-gray-800">{selectedFacility.projectType}</span>
                </div>
              )}
              {selectedFacility.constructionYear !== null && (
                <div className="flex gap-1">
                  <span className="text-gray-400 w-16 flex-shrink-0">ปีก่อสร้าง</span>
                  <span className="font-medium text-gray-800">พ.ศ. {selectedFacility.constructionYear}</span>
                </div>
              )}
              {selectedFacility.wmaOperationYear !== null && (
                <div className="flex gap-1">
                  <span className="text-gray-400 w-16 flex-shrink-0">อจน. เดินระบบ</span>
                  <span className="font-medium text-gray-800">พ.ศ. {selectedFacility.wmaOperationYear}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-2 font-mono text-xs text-gray-500 flex justify-between items-center">
              <span>{selectedFacility.lat.toFixed(5)}</span>
              <span className="text-gray-300">|</span>
              <span>{selectedFacility.lng.toFixed(5)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
