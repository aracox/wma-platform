"use client";
import { useRef, useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { X, Building2 } from "lucide-react";
import { LaoItem } from "@/data/lao";
import Link from "next/link";

// Unique teal color for LAO pins
const LAO_PIN_COLOR = "#0891b2"; // cyan-600

interface Props {
  laos: LaoItem[];
  selectedProvince: string;
}

export default function LaoMapClient({ laos, selectedProvince }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);
  const locale = useLocale();

  const [mapReady, setMapReady] = useState(false);
  const [selectedLao, setSelectedLao] = useState<LaoItem | null>(null);

  const clearMarkers = useCallback(() => {
    markers.current.forEach((m) => m.remove());
    markers.current = [];
  }, []);

  const addMarkers = useCallback(() => {
    if (!map.current) return;
    clearMarkers();

    const filtered = selectedProvince
      ? laos.filter((l) => l.province === selectedProvince)
      : laos;

    // Require GPS-level decimal precision on at least one axis
    const hasGpsPrecision = (n: number) =>
      Math.abs(n * 1000 - Math.round(n * 1000)) > 0.01;

    // Thailand's shape is irregular — use latitude-zone longitude limits
    // rather than a simple rectangle to avoid plotting in Laos/Myanmar
    const inThailand = (lat: number, lng: number): boolean => {
      if (lat < 5.5 || lat > 20.5) return false;
      if (lat >= 19.0) return lng >= 97.5 && lng <= 100.8;  // Far north (Chiang Rai tip)
      if (lat >= 17.5) return lng >= 97.5 && lng <= 102.2;  // Upper north
      if (lat >= 15.0) return lng >= 98.0 && lng <= 104.7;  // North/Northeast
      if (lat >= 12.0) return lng >= 98.5 && lng <= 105.0;  // Central/East
      return lng >= 98.5 && lng <= 102.5;                   // South (peninsula)
    };

    const withCoords = filtered.filter(
      (l) =>
        l.lat !== 0 && l.lng !== 0 &&
        inThailand(l.lat, l.lng) &&
        (hasGpsPrecision(l.lat) || hasGpsPrecision(l.lng))
    );

    withCoords.forEach((lao) => {
      const el = document.createElement("div");
      el.title = lao.name;
      el.style.cssText = `
        width: 20px; height: 20px; border-radius: 50%;
        background: ${LAO_PIN_COLOR};
        border: 2.5px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.28);
        cursor: pointer;
        transition: box-shadow 0.15s, transform 0.15s;
        transform-origin: center center;
        will-change: transform;
      `;
      el.addEventListener("mouseenter", () => {
        el.style.boxShadow = "0 0 0 5px rgba(8,145,178,0.35), 0 2px 8px rgba(0,0,0,0.3)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.28)";
      });
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedLao(lao);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([lao.lng, lao.lat])
        .addTo(map.current!);
      markers.current.push(marker);
    });
  }, [laos, selectedProvince, clearMarkers]);

  // Init map
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
    map.current.on("click", () => setSelectedLao(null));

    return () => {
      clearMarkers();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Refresh markers when data/filter changes
  useEffect(() => {
    if (mapReady) addMarkers();
  }, [mapReady, laos, selectedProvince, addMarkers]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Legend */}
      <div className="absolute bottom-8 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-3 text-xs z-10">
        <div className="font-bold text-gray-700 mb-2">สัญลักษณ์</div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-white shadow-sm" style={{ background: LAO_PIN_COLOR }} />
          <span className="text-gray-600">องค์กรปกครองส่วนท้องถิ่น (อปท.)</span>
        </div>
      </div>

      {/* Selected LAO Panel */}
      {selectedLao && (
        <div
          className="absolute top-4 left-4 w-72 bg-white/5 backdrop-blur-md rounded-xl shadow-xl border border-white/20 overflow-hidden z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-500 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-white" />
              <span className="text-white text-sm font-bold">ข้อมูล อปท.</span>
            </div>
            <button onClick={() => setSelectedLao(null)} className="text-white/70 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-100 mb-2">
                {selectedLao.type}
              </div>
              <h3 className="font-bold text-gray-900 text-sm leading-snug">{selectedLao.name}</h3>
            </div>

            <div className="space-y-1 text-xs text-gray-600">
              <div className="flex gap-1">
                <span className="text-gray-400 w-12 flex-shrink-0">จังหวัด</span>
                <span className="font-medium text-gray-800">{selectedLao.province}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-gray-400 w-12 flex-shrink-0">อำเภอ</span>
                <span className="font-medium text-gray-800">{selectedLao.district}</span>
              </div>
              <div className="flex gap-1">
                <span className="text-gray-400 w-12 flex-shrink-0">ตำบล</span>
                <span className="font-medium text-gray-800">{selectedLao.subdistrict}</span>
              </div>
              {selectedLao.zipcode && (
                <div className="flex gap-1 items-center">
                  <span className="text-gray-400 w-16 flex-shrink-0 whitespace-nowrap">ไปรษณีย์</span>
                  <span className="font-medium text-gray-800">{selectedLao.zipcode}</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-lg p-2 font-mono text-xs text-gray-500 flex justify-between items-center">
              <span>{selectedLao.lat.toFixed(5)}</span>
              <span className="text-gray-300">|</span>
              <span>{selectedLao.lng.toFixed(5)}</span>
            </div>

            <Link
              href={`/${locale}/lao/${selectedLao.id}`}
              className="block w-full text-center bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
            >
              ดูข้อมูลเพิ่มเติม →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
