"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Profile, ProviderDetails, ProfileRole } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Sliders, 
  Map as MapIcon, 
  List, 
  Star, 
  Phone, 
  MessageSquare, 
  User, 
  Loader2,
  ShieldCheck,
  Compass
} from "lucide-react";

// Types
type ProviderWithProfile = ProviderDetails & {
  profiles: Profile | null;
  distance?: number;
  coordinates?: { lat: number; lng: number };
};

// Baku / Yasamal User Center Coordinate
const USER_COORDINATES = { lat: 40.3894, lng: 49.8032 };

const CATEGORIES = ["Hamısı", "Təcili", "Santexnik", "Elektrik", "Dayə", "Təmizlik", "Kombi Ustası"];

// Realistic seed data to show if DB is empty or during local tests
const MOCK_PROVIDERS: ProviderWithProfile[] = [
  {
    user_id: "mock-provider-1",
    category: "Santexnik",
    working_radius_km: 10,
    profile_status: "APPROVED",
    rating: 4.9,
    hourly_rate: 15,
    documents_uploaded: true,
    is_online: true,
    profiles: {
      id: "mock-provider-1",
      first_name: "Murad",
      last_name: "Fataliyev",
      phone: "+994501112233",
      role: "PROVIDER",
      address: "Yasamal rayonu, Yeni Yasamal"
    }
  },
  {
    user_id: "mock-provider-2",
    category: "Elektrik",
    working_radius_km: 5,
    profile_status: "APPROVED",
    rating: 4.8,
    hourly_rate: 18,
    documents_uploaded: true,
    is_online: true,
    profiles: {
      id: "mock-provider-2",
      first_name: "Elnur",
      last_name: "Qasımov",
      phone: "+994553334455",
      role: "PROVIDER",
      address: "Yasamal rayonu, İnşaatçılar"
    }
  },
  {
    user_id: "mock-provider-3",
    category: "Dayə",
    working_radius_km: 7,
    profile_status: "APPROVED",
    rating: 4.7,
    hourly_rate: 10,
    documents_uploaded: true,
    is_online: true,
    profiles: {
      id: "mock-provider-3",
      first_name: "Leyla",
      last_name: "Məmmədova",
      phone: "+994705556677",
      role: "PROVIDER",
      address: "Yasamal rayonu, Elmlər Akademiyası"
    }
  },
  {
    user_id: "mock-provider-4",
    category: "Təmizlik",
    working_radius_km: 15,
    profile_status: "APPROVED",
    rating: 4.6,
    hourly_rate: 12,
    documents_uploaded: true,
    is_online: true,
    profiles: {
      id: "mock-provider-4",
      first_name: "Günel",
      last_name: "Əliyeva",
      phone: "+994508889900",
      role: "PROVIDER",
      address: "Nəsimi rayonu, 28 May"
    }
  },
  {
    user_id: "mock-provider-5",
    category: "Kombi Ustası",
    working_radius_km: 8,
    profile_status: "APPROVED",
    rating: 4.9,
    hourly_rate: 22,
    documents_uploaded: true,
    is_online: true,
    profiles: {
      id: "mock-provider-5",
      first_name: "Rəşad",
      last_name: "Baxşəliyev",
      phone: "+994552223344",
      role: "PROVIDER",
      address: "Yasamal rayonu, 20 Yanvar"
    }
  }
];

// Helper: Stable mock coordinate generator based on User ID
const getStableCoordinates = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 100) / 100) * 0.05 - 0.025;
  const lngOffset = ((Math.abs(hash >> 8) % 100) / 100) * 0.05 - 0.025;
  return {
    lat: USER_COORDINATES.lat + latOffset,
    lng: USER_COORDINATES.lng + lngOffset
  };
};

// Helper: Haversine distance calculator in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius
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

export function DashboardClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderWithProfile[]>([]);
  const [userAddress, setUserAddress] = useState("Yasamal, İnşaatçılar m/s");

  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(3); // default 3 km
  const [selectedCategory, setSelectedCategory] = useState("Hamısı");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Active selected provider on Map
  const [activeProvider, setActiveProvider] = useState<ProviderWithProfile | null>(null);

  // Fetch Session & Approved Providers
  useEffect(() => {
    async function initDashboard() {
      setLoading(true);
      try {
        // 1. Get authenticated user and address
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("address")
            .eq("id", user.id)
            .single();

          if (profile && profile.address) {
            setUserAddress(profile.address);
          }
        }

        // 2. Fetch approved providers and join their profiles
        const { data: dbProviders, error: dbError } = await supabase
          .from("provider_details")
          .select(`
            user_id,
            category,
            working_radius_km,
            profile_status,
            rating,
            hourly_rate,
            profiles:user_id (
              id,
              first_name,
              last_name,
              phone,
              role,
              address
            )
          `)
          .eq("profile_status", "APPROVED");

        if (dbError) throw dbError;

        // Parse and calculate distances
        const formattedDbProviders = (dbProviders || []).map((p: any) => {
          const coords = getStableCoordinates(p.user_id);
          const distance = calculateDistance(
            USER_COORDINATES.lat,
            USER_COORDINATES.lng,
            coords.lat,
            coords.lng
          );
          
          return {
            ...p,
            profiles: Array.isArray(p.profiles) ? p.profiles[0] : p.profiles,
            coordinates: coords,
            distance: Number(distance.toFixed(1))
          };
        });

        // 3. Fallback to mock data if DB is empty
        if (formattedDbProviders.length === 0) {
          const seededMocks = MOCK_PROVIDERS.map((p) => {
            const coords = getStableCoordinates(p.user_id);
            const distance = calculateDistance(
              USER_COORDINATES.lat,
              USER_COORDINATES.lng,
              coords.lat,
              coords.lng
            );
            return {
              ...p,
              coordinates: coords,
              distance: Number(distance.toFixed(1))
            };
          });
          setProviders(seededMocks);
        } else {
          setProviders(formattedDbProviders);
        }

      } catch (err) {
        console.error("Dashboard məlumatları yüklənərkən xəta:", err);
        // Fallback to mock data on error so page is usable
        const seededMocks = MOCK_PROVIDERS.map((p) => {
          const coords = getStableCoordinates(p.user_id);
          const distance = calculateDistance(
            USER_COORDINATES.lat,
            USER_COORDINATES.lng,
            coords.lat,
            coords.lng
          );
          return {
            ...p,
            coordinates: coords,
            distance: Number(distance.toFixed(1))
          };
        });
        setProviders(seededMocks);
      } finally {
        setLoading(false);
      }
    }

    initDashboard();
  }, []);

  // Filter logic
  const filteredProviders = providers.filter((p) => {
    // 1. Radius filter
    if (p.distance && p.distance > radius) return false;

    // 2. Category filter
    if (selectedCategory !== "Hamısı") {
      if (selectedCategory === "Təcili") {
        if ((p.rating || 0) < 4.8) return false;
      } else if (p.category !== selectedCategory) {
        return false;
      }
    }

    // 3. Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const nameMatch = `${p.profiles?.first_name} ${p.profiles?.last_name}`.toLowerCase().includes(query);
      const catMatch = p.category.toLowerCase().includes(query);
      const addressMatch = p.profiles?.address?.toLowerCase().includes(query) || false;
      if (!nameMatch && !catMatch && !addressMatch) return false;
    }

    return true;
  });

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* FILTER & SEARCH PANEL */}
      <section className="bg-white border-b border-border py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left Side: Address info & Categories */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 flex-1">
            <div className="flex items-center text-xs text-muted-foreground bg-muted/40 border border-border px-3 py-1.5 rounded-lg shrink-0 w-fit">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mr-1.5" />
              <span className="font-semibold text-foreground/80 truncate max-w-[180px]">
                {userAddress}
              </span>
            </div>

            {/* Categories list badges - Balanced wrapping */}
            <div className="flex flex-wrap items-center gap-1.5 py-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setActiveProvider(null);
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted/65 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat === "Təcili" ? "⚡ Təcili" : cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar & Radius Slider & View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Usta və ya xidmət..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 bg-muted/40 border-border focus-visible:ring-primary text-xs h-9.5"
              />
            </div>

            {/* Radius slider panel */}
            <div className="flex items-center space-x-3 bg-muted/20 border border-border/60 px-3 py-1.5 rounded-lg">
              <Sliders className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex items-center space-x-2.5 min-w-[140px]">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={radius}
                  onChange={(e) => {
                    setRadius(Number(e.target.value));
                    setActiveProvider(null);
                  }}
                  className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground w-8 text-right shrink-0">
                  {radius} km
                </span>
              </div>
            </div>

            {/* View toggle button */}
            <div className="flex bg-muted/60 p-1 rounded-lg border border-border shrink-0 self-start sm:self-auto">
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "map"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Xəritə</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  viewMode === "list"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Siyahı</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN DASHBOARD CONTENT */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Məhəllənizdəki ustalar axtarılır...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row relative bg-slate-50/30">
          <AnimatePresence mode="wait">
            {viewMode === "map" ? (
              // MAP VIEW LAYER
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col md:flex-row h-[calc(100vh-180px)] w-full overflow-hidden"
              >
                {/* Desktop Sidebar (Left side) */}
                <div className="hidden md:flex flex-col w-80 lg:w-96 border-r border-border bg-white h-full overflow-y-auto shrink-0 shadow-sm">
                  <div className="p-4 border-b border-border bg-slate-50/50 flex justify-between items-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Tapılan ustalar ({filteredProviders.length})
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      Radius: {radius} km
                    </span>
                  </div>

                  <div className="flex-1 p-4 space-y-3.5">
                    {filteredProviders.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground space-y-2">
                        <MapPin className="w-8 h-8 mx-auto text-muted-foreground/50" />
                        <p className="text-sm font-medium">Bu məsafədə usta tapılmadı.</p>
                        <p className="text-xs">Radius slideri çəkərək süzgəci genişləndirin.</p>
                      </div>
                    ) : (
                      filteredProviders.map((p) => {
                        const isActive = activeProvider?.user_id === p.user_id;
                        return (
                          <div
                            key={p.user_id}
                            onClick={() => setActiveProvider(p)}
                            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-premium group bg-white ${
                              isActive
                                ? "border-primary ring-2 ring-primary/20 shadow-glow-primary"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-start space-x-3.5">
                              <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold text-muted-foreground shrink-0 border border-border group-hover:border-primary/20 transition-colors">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-1">
                                  <h3 className="font-bold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                                    {p.profiles?.first_name} {p.profiles?.last_name}
                                  </h3>
                                  <span className="text-xs font-bold text-primary shrink-0">
                                    {p.hourly_rate} ₼/saat
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1 mt-0.5">
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    {p.category}
                                  </span>
                                  <span className="text-muted-foreground/60 text-xs">•</span>
                                  <span className="text-xs font-medium text-foreground/80 flex items-center space-x-0.5">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                                    <span>{p.rating || "5.0"}</span>
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1.5 mt-2.5">
                                  <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                                    <ShieldCheck className="w-3 h-3 shrink-0" />
                                    <span>ŞV Təsdiqlənib</span>
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-medium flex items-center space-x-0.5">
                                    <Compass className="w-3 h-3 shrink-0" />
                                    <span>{p.distance} km uzaqlıqda</span>
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* INTERACTIVE VECTOR MAP CONTAINER */}
                <div className="flex-1 h-full relative bg-slate-900 overflow-hidden flex items-center justify-center">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                  
                  {/* Radar Circles */}
                  <div className="absolute w-[240px] h-[240px] border border-white/5 rounded-full flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-white/20 -mt-[236px] absolute">1 km</span>
                  </div>
                  <div className="absolute w-[440px] h-[440px] border border-white/5 rounded-full flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-white/20 -mt-[436px] absolute">3 km</span>
                  </div>
                  <div className="absolute w-[680px] h-[680px] border border-white/5 rounded-full flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-white/20 -mt-[676px] absolute">5 km</span>
                  </div>
                  <div className="absolute w-[980px] h-[980px] border border-white/5 rounded-full flex items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-white/20 -mt-[976px] absolute">10 km</span>
                  </div>

                  {/* Baku Yasamal Mock Roads & Districts Drawing */}
                  <svg className="absolute inset-0 w-full h-full text-white/5 pointer-events-none opacity-40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M-100,200 L900,600" stroke="currentColor" strokeWidth="6" fill="none" />
                    <path d="M200,-100 L300,900" stroke="currentColor" strokeWidth="8" fill="none" />
                    <circle cx="350" cy="300" r="280" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="6 6" />
                    <text x="120" y="80" fill="currentColor" fontSize="12" className="font-semibold select-none">YASAMAL RAYONU</text>
                    <text x="450" y="480" fill="currentColor" fontSize="12" className="font-semibold select-none">YENİ YASAMAL</text>
                  </svg>

                  {/* USER CENTER MARKER */}
                  <div className="absolute z-10 flex flex-col items-center justify-center">
                    <span className="absolute w-12 h-12 rounded-full bg-primary/20 animate-ping" />
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-2 border-white shadow-premium relative z-10">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="bg-primary text-[9px] font-bold text-white px-2 py-0.5 rounded-full shadow-sm mt-1 z-10 whitespace-nowrap">
                      Siz buradasınız
                    </span>
                  </div>

                  {/* PROVIDER PINS MARKERS ON MAP */}
                  {filteredProviders.map((p) => {
                    const coords = p.coordinates || USER_COORDINATES;
                    const xOffset = (coords.lng - USER_COORDINATES.lng) * 9000;
                    const yOffset = (USER_COORDINATES.lat - coords.lat) * 9000;
                    
                    const isSelected = activeProvider?.user_id === p.user_id;

                    return (
                      <motion.div
                        key={p.user_id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute z-20 cursor-pointer"
                        style={{
                          transform: `translate(${xOffset}px, ${yOffset}px)`
                        }}
                        onClick={() => setActiveProvider(p)}
                      >
                        <div className="relative flex flex-col items-center group">
                          <div className={`absolute bottom-full mb-1.5 px-2 py-1 bg-slate-800 text-white rounded-lg flex items-center space-x-1.5 shadow-lg scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-30`}>
                            <span className="text-[10px] font-bold">{p.profiles?.first_name}</span>
                            <span className="text-[8px] bg-primary px-1 rounded text-white">{p.rating} ★</span>
                          </div>

                          <div className={`w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg border-2 transition-all duration-300 relative ${
                            isSelected 
                              ? "border-primary scale-125 ring-4 ring-primary/20" 
                              : "border-slate-700 hover:border-primary hover:scale-110"
                          }`}>
                            <span className="text-slate-800 font-bold text-xs">
                              {p.profiles?.first_name[0]}
                            </span>
                            <span className="absolute -bottom-1.5 -right-1 w-4 h-4 rounded-full bg-slate-900 border border-white flex items-center justify-center text-[8px] text-white">
                              ⚙️
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* ACTIVE PROVIDER POPUP CARD OVERLAY */}
                  <AnimatePresence>
                    {activeProvider && (
                      <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.95 }}
                        className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-white rounded-xl border border-border shadow-premium-lg overflow-hidden z-30"
                      >
                        <div className="p-4 flex flex-col space-y-3.5">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-muted-foreground border border-border">
                                <User className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-foreground text-sm">
                                  {activeProvider.profiles?.first_name} {activeProvider.profiles?.last_name}
                                </h4>
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  {activeProvider.category}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => setActiveProvider(null)}
                              className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs border-y border-border/60 py-2 bg-slate-50/50 px-2 rounded-lg">
                            <span className="font-medium text-muted-foreground flex items-center space-x-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-foreground font-semibold">{activeProvider.rating}</span>
                              <span className="text-muted-foreground">(24 rəy)</span>
                            </span>
                            <span className="font-bold text-primary">
                              {activeProvider.hourly_rate} ₼/saat
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            <span className="truncate max-w-[150px]">{activeProvider.profiles?.address || "Yasamal rayonu"}</span>
                            <span>•</span>
                            <span className="font-medium text-foreground whitespace-nowrap">{activeProvider.distance} km uzaqlıqda</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1.5">
                            <Button 
                              asChild 
                              variant="outline" 
                              size="sm" 
                              className="w-full text-xs font-semibold h-8.5 rounded-lg border-border hover:bg-muted text-foreground"
                            >
                              <a href={`tel:${activeProvider.profiles?.phone}`}>
                                <Phone className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                                Zəng Et
                              </a>
                            </Button>
                            <Button 
                              onClick={() => router.push(`/chat?recipient=${activeProvider.user_id}`)}
                              variant="premium" 
                              size="sm" 
                              className="w-full text-xs font-semibold h-8.5 rounded-lg text-white shadow-glow-primary"
                            >
                              <MessageSquare className="w-3.5 h-3.5 mr-1" />
                              Çatda Yaz
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              // GRID CARD / LIST VIEW LAYER
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.3 }}
                className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"
              >
                {filteredProviders.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground space-y-4 max-w-sm mx-auto">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground/60">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Axtarışa uyğun usta tapılmadı</h3>
                      <p className="text-xs mt-1">Süzgəc parametrlərini (radius, kateqoriya) dəyişərək yenidən axtarmağa çalışın.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProviders.map((p) => (
                      <div
                        key={p.user_id}
                        className="bg-card border border-border shadow-premium hover:shadow-premium-lg rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col justify-between bg-white"
                      >
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3.5">
                              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-muted-foreground border border-border group-hover:border-primary/20 transition-colors">
                                <User className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                                  {p.profiles?.first_name} {p.profiles?.last_name}
                                </h3>
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full">
                                  {p.category}
                                </span>
                              </div>
                            </div>

                            <span className="text-sm font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                              {p.hourly_rate} ₼/saat
                            </span>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1.5 pt-1">
                            <div className="flex items-center space-x-1.5">
                              <MapPin className="w-4 h-4 text-primary shrink-0" />
                              <span className="truncate">{p.profiles?.address || "Bakı şəhəri"}</span>
                            </div>
                            <div className="flex items-center space-x-1.5 pl-5 font-semibold text-foreground/80">
                              <span>{p.distance} km uzaqlıqda</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 border-t border-border/60 pt-3">
                            <div className="flex items-center text-amber-400">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                            </div>
                            <span className="text-xs font-bold text-foreground">{p.rating}</span>
                            <span className="text-xs text-muted-foreground">(18 rəy)</span>

                            <span className="ml-auto text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>ŞV Təsdiqlənib</span>
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50/50 p-4 border-t border-border flex space-x-2.5">
                          <Button 
                            asChild 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs font-semibold h-9 rounded-lg border-border hover:bg-muted text-foreground"
                          >
                            <a href={`tel:${p.profiles?.phone}`}>
                              <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                              Zəng Et
                            </a>
                          </Button>
                          <Button 
                            onClick={() => router.push(`/chat?recipient=${p.user_id}`)}
                            variant="premium" 
                            size="sm" 
                            className="w-full text-xs font-semibold h-9 rounded-lg text-white shadow-glow-primary"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            Çatda Yaz
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
