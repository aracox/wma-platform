"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, Droplets } from "lucide-react";
import { WmaFacility, DspotFacility, ALL_LOCATIONS as ALL } from "@/data/wastewaterFacilities";

const WMA_PIN_COLOR = "#007bff";
const DSPOT_PIN_COLOR = "#28a745";

interface Props {
  wmaFacilities: WmaFacility[];
  dspotFacilities: DspotFacility[];
  showWma: boolean;
  showDspot: boolean;
  selectedProvince: string;
  searchQuery?: string;
}

type Selected = { type: "wma"; data: WmaFacility } | { type: "dspot"; data: DspotFacility };

function makePinEl(color: string, title: string, onClick: () => void) {
  const el = document.createElement("div");
  el.title = title;
  el.style.cssText = `
    width: 16px; height: 16px; border-radius: 50%;
    background: ${color};
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.28);
    cursor: pointer;
    transition: box-shadow 0.15s;
  `;
  el.addEventListener("mouseenter", () => {
    el.style.boxShadow = "0 0 0 5px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.3)";
  });
  el.addEventListener("mouseleave", () => {
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.28)";
  });
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onClick();
  });
  return el;
}

export default function WastewaterFacilityMapClient({
  wmaFacilities,
  dspotFacilities,
  showWma,
  showDspot,
  selectedProvince,
  searchQuery = "",
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const wmaMarkers = useRef<maplibregl.Marker[]>([]);
  const dspotMarkers = useRef<maplibregl.Marker[]>([]);

  const [mapReady, setMapReady] = useState(false);
  const [selected, setSelected] = useState<Selected | null>(null);

  const clearMarkers = useCallback(() => {
    wmaMarkers.current.forEach((m) => m.remove());
    wmaMarkers.current = [];
    dspotMarkers.current.forEach((m) => m.remove());
    dspotMarkers.current = [];
  }, []);

  const addMarkers = useCallback(() => {
    if (!map.current) return;
    clearMarkers();

    let filteredWma = wmaFacilities;
    if (selectedProvince && selectedProvince !== ALL) {
      filteredWma = filteredWma.filter((f) => f.province === selectedProvince);
    }
    // Matches the source site's behavior: DSPOT markers hide while a
    // province filter or search is active, leaving just the narrowed WMA set.
    const dspotVisible = showDspot && !searchQuery && !selectedProvince;

    const wmaToShow = showWma ? filteredWma : [];
    const dspotToShow = dspotVisible ? dspotFacilities : [];

    const allCoords = [...wmaToShow, ...dspotToShow];
    if (map.current && allCoords.length > 0 && (selectedProvince || searchQuery)) {
      const lats = allCoords.map((c) => c.lat);
      const lngs = allCoords.map((c) => c.lng);
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
    } else if (map.current && !selectedProvince && !searchQuery) {
      map.current.flyTo({ center: [101.0, 13.5], zoom: 5.5, duration: 1200 });
    }

    wmaToShow.forEach((facility) => {
      const el = makePinEl(WMA_PIN_COLOR, facility.title, () => setSelected({ type: "wma", data: facility }));
      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([facility.lng, facility.lat])
        .addTo(map.current!);
      wmaMarkers.current.push(marker);
    });

    dspotToShow.forEach((facility) => {
      const el = makePinEl(DSPOT_PIN_COLOR, facility.title, () => setSelected({ type: "dspot", data: facility }));
      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([facility.lng, facility.lat])
        .addTo(map.current!);
      dspotMarkers.current.push(marker);
    });
  }, [wmaFacilities, dspotFacilities, showWma, showDspot, selectedProvince, searchQuery, clearMarkers]);

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
    map.current.on("click", () => setSelected(null));

    return () => {
      clearMarkers();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapReady) addMarkers();
  }, [mapReady, addMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-8 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-xs z-10 space-y-1.5">
        <div className="font-bold text-gray-700 mb-1">สัญลักษณ์</div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ background: WMA_PIN_COLOR }} />
          <span className="text-gray-600">WMA — ศูนย์บริหารจัดการคุณภาพน้ำ</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ background: DSPOT_PIN_COLOR }} />
          <span className="text-gray-600">DSPOT — โรงควบคุมคุณภาพน้ำ</span>
        </div>
      </div>

      {/* Selected facility panel */}
      {selected && (
        <div
          className="absolute top-4 left-4 w-80 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="px-4 py-3 flex items-center justify-between"
            style={{ background: selected.type === "wma" ? WMA_PIN_COLOR : DSPOT_PIN_COLOR }}
          >
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-bold">{selected.type === "wma" ? "WMA" : "DSPOT"}</span>
            </div>
            <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>

          {selected.type === "wma" ? (
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{selected.data.orgName || selected.data.title}</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex gap-1">
                  <span className="text-gray-400 w-20 flex-shrink-0">จังหวัด</span>
                  <span className="font-medium text-gray-800">{selected.data.province}</span>
                </div>
                {selected.data.wastewaterVolumeToday !== null && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">น้ำเสียวันนี้</span>
                    <span className="font-medium text-gray-800">{selected.data.wastewaterVolumeToday.toLocaleString()} ลบ.ม.</span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-2 font-mono text-xs text-gray-500 flex justify-between items-center">
                <span>{selected.data.lat.toFixed(5)}</span>
                <span className="text-gray-300">|</span>
                <span>{selected.data.lng.toFixed(5)}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{selected.data.title}</h3>
              <div className="space-y-1 text-xs text-gray-600">
                {selected.data.location && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">ที่ตั้ง</span>
                    <span className="font-medium text-gray-800">{selected.data.location}</span>
                  </div>
                )}
                {selected.data.region && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">เขตพื้นที่</span>
                    <span className="font-medium text-gray-800">{selected.data.region}</span>
                  </div>
                )}
                {selected.data.basin && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">แอ่งน้ำ</span>
                    <span className="font-medium text-gray-800">{selected.data.basin}</span>
                  </div>
                )}
                {selected.data.plantType && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">ระบบบำบัด</span>
                    <span className="font-medium text-gray-800">{selected.data.plantType}</span>
                  </div>
                )}
                {selected.data.operatingUnit && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">ผู้ดำเนินการ</span>
                    <span className="font-medium text-gray-800">{selected.data.operatingUnit}</span>
                  </div>
                )}
                {selected.data.status && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">สถานะ</span>
                    <span className="font-medium text-gray-800">{selected.data.status}</span>
                  </div>
                )}
                {selected.data.wastewaterVolume !== null && (
                  <div className="flex gap-1">
                    <span className="text-gray-400 w-20 flex-shrink-0">ปริมาณน้ำเสีย</span>
                    <span className="font-medium text-gray-800">
                      {selected.data.wastewaterVolume.toLocaleString()} ลบ.ม.
                      {selected.data.reportYear ? ` (พ.ศ. ${selected.data.reportYear})` : ""}
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-2 font-mono text-xs text-gray-500 flex justify-between items-center">
                <span>{selected.data.lat.toFixed(5)}</span>
                <span className="text-gray-300">|</span>
                <span>{selected.data.lng.toFixed(5)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
