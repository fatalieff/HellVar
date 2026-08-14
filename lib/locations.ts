// Bakı rayonlarının mərkəz koordinatları (Leaflet xəritəsi üçün)
export const BAKU_CENTER = { lat: 40.4093, lng: 49.8671 };

export const BAKU_DISTRICT_COORDS: Record<string, { lat: number; lng: number }> = {
  "Yasamal": { lat: 40.3736, lng: 49.8033 },
  "Nərimanov": { lat: 40.4048, lng: 49.8577 },
  "Nəsimi": { lat: 40.3804, lng: 49.8385 },
  "Xətai": { lat: 40.3998, lng: 49.8736 },
  "Səbail": { lat: 40.3595, lng: 49.8540 },
  "Binəqədi": { lat: 40.4652, lng: 49.8282 },
  "Sabunçu": { lat: 40.4497, lng: 49.9385 },
  "Suraxanı": { lat: 40.4204, lng: 49.9967 },
  "Qaradağ": { lat: 40.2688, lng: 49.5395 },
  "Xəzər": { lat: 40.4204, lng: 50.1880 },
  "Pirallahı": { lat: 40.4663, lng: 50.3306 },
};

export const BAKU_DISTRICTS = Object.keys(BAKU_DISTRICT_COORDS);

// Bakı rayonunun adından mərkəz koordinatını qaytarır (tapılmazsa null)
export const getDistrictCoordinates = (
  district: string | null | undefined
): { lat: number; lng: number } | null => {
  if (!district) return null;
  const found = BAKU_DISTRICTS.find(
    (name) => district.trim().toLowerCase().startsWith(name.toLowerCase())
  );
  return found ? BAKU_DISTRICT_COORDS[found] : null;
};

// Haversine məsafəsi (km)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};