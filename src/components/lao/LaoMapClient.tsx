"use client";
import { useMemo } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import { Building2 } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { LocalOrg } from "@/types";

export default function LaoMapClient({ lao }: { lao: LocalOrg }) {
  const initialViewState = useMemo(
    () => ({
      longitude: lao.lng,
      latitude: lao.lat,
      zoom: 14,
    }),
    [lao]
  );

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-border shadow-sm">
      <Map
        initialViewState={initialViewState}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        interactive={true}
      >
        <NavigationControl position="bottom-right" />
        
        <Marker longitude={lao.lng} latitude={lao.lat} anchor="bottom">
          <div className="relative group cursor-pointer pb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary-500 z-10 relative pointer-events-none">
              <Building2 className="w-5 h-5 text-primary-600" />
            </div>
            {/* Map Pin Tail */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary-500 rotate-45 z-0" />
          </div>
        </Marker>
      </Map>
    </div>
  );
}
