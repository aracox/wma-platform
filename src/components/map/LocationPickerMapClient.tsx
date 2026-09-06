"use client";
import { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Crosshair } from "lucide-react";

// CP AXTRA Blue — R48,G111,B199
const PIN_COLOR = "#306FC7";

export interface PickedLocation {
  lat: number;
  lng: number;
}

interface Props {
  value: PickedLocation | null;
  onChange: (coords: PickedLocation) => void;
}

// Click (or drag the pin) to choose a point. Used by the optional
// "เลือกตำแหน่งจากแผนที่" field on /report-issue.
export default function LocationPickerMapClient({ value, onChange }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  // onChange identity can change between renders; read it through a ref so the
  // map handlers registered on mount always call the latest one.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState("");

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: value ? [value.lng, value.lat] : [101.0, 13.5],
      zoom: value ? 14 : 5.5,
      minZoom: 4,
      maxZoom: 18,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    map.current.on("click", (e) => {
      onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    return () => {
      marker.current?.remove();
      marker.current = null;
      map.current?.remove();
      map.current = null;
    };
    // Mount once — `value` is only read for the initial camera position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the pin in sync with the selected coordinates
  useEffect(() => {
    if (!map.current) return;

    if (!value) {
      marker.current?.remove();
      marker.current = null;
      return;
    }

    if (!marker.current) {
      marker.current = new maplibregl.Marker({ color: PIN_COLOR, draggable: true })
        .setLngLat([value.lng, value.lat])
        .addTo(map.current);
      marker.current.on("dragend", () => {
        const pos = marker.current?.getLngLat();
        if (pos) onChangeRef.current({ lat: pos.lat, lng: pos.lng });
      });
    } else {
      marker.current.setLngLat([value.lng, value.lat]);
    }
  }, [value]);

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    setLocating(true);
    setGeoError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onChangeRef.current(coords);
        map.current?.flyTo({ center: [coords.lng, coords.lat], zoom: 16 });
      },
      () => {
        setLocating(false);
        setGeoError("ไม่สามารถระบุตำแหน่งของคุณได้ กรุณาเลือกจากแผนที่");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {/* Hint shown until a point is chosen */}
      {!value && (
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 pointer-events-none">
          แตะบนแผนที่เพื่อปักหมุดตำแหน่ง
        </div>
      )}

      <button
        type="button"
        onClick={useMyLocation}
        disabled={locating}
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 shadow-sm text-xs font-bold text-primary-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
      >
        <Crosshair className={locating ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
        {locating ? "กำลังค้นหา..." : "ตำแหน่งของฉัน"}
      </button>

      {geoError && (
        <div className="absolute bottom-14 right-3 z-10 max-w-[220px] bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold px-3 py-2 rounded-xl shadow-sm">
          {geoError}
        </div>
      )}
    </div>
  );
}
