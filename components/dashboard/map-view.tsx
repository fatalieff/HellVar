"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapProvider = {
  user_id: string;
  coordinates?: { lat: number; lng: number } | null;
  profiles: {
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  } | null;
  rating?: number | null;
};

type MapViewProps = {
  center: { lat: number; lng: number };
  providers: MapProvider[];
  radiusKm: number;
  activeProviderId: string | null;
  userLabel: string;
  onSelectProvider: (id: string) => void;
};

const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıları';

const providerIcon = (provider: MapProvider, isActive: boolean) => {
  const name = `${provider.profiles?.first_name ?? ""} ${provider.profiles?.last_name ?? ""}`.trim();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const avatarHtml = provider.profiles?.avatar_url
    ? `<img src="${provider.profiles.avatar_url}" alt="${name}" class="hv-pin-avatar" />`
    : `<span class="hv-pin-initials">${initials || "?"}</span>`;

  return L.divIcon({
    className: "hv-pin-wrap",
    html: `
      <div class="hv-pin ${isActive ? "hv-pin-active" : ""}">
        <div class="hv-pin-body">
          ${avatarHtml}
          <span class="hv-pin-badge">⚙️</span>
        </div>
        <div class="hv-pin-tip"></div>
      </div>
    `,
    iconSize: [42, 54],
    iconAnchor: [21, 50],
    popupAnchor: [0, -50],
  });
};

const userIcon = L.divIcon({
  className: "hv-user-wrap",
  html: `
    <div class="hv-user-pulse"></div>
    <div class="hv-user-pin">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

export function MapView({
  center,
  providers,
  radiusKm,
  activeProviderId,
  userLabel,
  onSelectProvider,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const onSelectRef = useRef(onSelectProvider);

  useEffect(() => {
    onSelectRef.current = onSelectProvider;
  }, [onSelectProvider]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center.lat, center.lng],
      zoom: 12,
      scrollWheelZoom: false,
    });
    L.tileLayer(TILE_URL, { attribution: ATTRIBUTION }).addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      radiusCircleRef.current = null;
      markersRef.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User marker + radius circle
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([center.lat, center.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      })
        .bindTooltip(userLabel, { direction: "top", offset: [0, -18] })
        .addTo(map);
    } else {
      userMarkerRef.current.setLatLng([center.lat, center.lng]);
    }

    if (!radiusCircleRef.current) {
      radiusCircleRef.current = L.circle([center.lat, center.lng], {
        radius: radiusKm * 1000,
        color: "#e3520a",
        weight: 2,
        opacity: 0.6,
        fillColor: "#e3520a",
        fillOpacity: 0.06,
      }).addTo(map);
    } else {
      radiusCircleRef.current.setLatLng([center.lat, center.lng]);
      radiusCircleRef.current.setRadius(radiusKm * 1000);
    }
  }, [center, radiusKm, userLabel]);

  // Provider markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();

    providers.forEach((provider) => {
      if (!provider.coordinates) return;
      seen.add(provider.user_id);
      const marker = markersRef.current[provider.user_id];
      const isActive = provider.user_id === activeProviderId;

      if (!marker) {
        const newMarker = L.marker([provider.coordinates.lat, provider.coordinates.lng], {
          icon: providerIcon(provider, isActive),
          zIndexOffset: isActive ? 500 : 0,
        }).addTo(map);
        newMarker.on("click", () => onSelectRef.current(provider.user_id));
        markersRef.current[provider.user_id] = newMarker;
      } else {
        marker.setIcon(providerIcon(provider, isActive));
        marker.setZIndexOffset(isActive ? 500 : 0);
      }
    });

    Object.keys(markersRef.current).forEach((id) => {
      if (!seen.has(id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    // Xəritəni bütün marker + radius dairəsinə uyğunlaşdır
    const bounds = L.latLngBounds([[center.lat, center.lng]] as L.LatLngBoundsLiteral);
    if (radiusCircleRef.current) {
      bounds.extend(radiusCircleRef.current.getBounds());
    }
    providers.forEach((provider) => {
      if (provider.coordinates) {
        bounds.extend([provider.coordinates.lat, provider.coordinates.lng] as [number, number]);
      }
    });

    if (providers.length > 0) {
      map.fitBounds(bounds.pad(0.15), { maxZoom: 15 });
    } else {
      map.setView([center.lat, center.lng], 12);
    }
  }, [providers, activeProviderId, center]);

  return <div ref={containerRef} className="h-full w-full z-0" />;
}
