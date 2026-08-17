"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Profile, ProviderDetails } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProviderProfileDialog } from "@/components/provider/provider-profile-dialog";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { BAKU_CENTER, calculateDistance, getDistrictCoordinates } from "@/lib/locations";
import dynamic from "next/dynamic";

// Leaflet SSR-də işləmir — yalnız brauzerdə yüklə
const MapView = dynamic(() => import("@/components/dashboard/map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => null,
});
import { 
  Search, 
  MapPin, 
  Sliders, 
  Map as MapIcon, 
  List, 
  Star, 
  Phone, 
  MessageSquare, 
  Loader2,
  ShieldCheck,
  Compass,
} from "lucide-react";

// Types
type ProviderWithProfile = ProviderDetails & {
  profiles: Profile | null;
  distance?: number;
  coordinates?: { lat: number; lng: number };
};

type DashboardCategory = "all" | "urgent" | "plumbing" | "electric" | "nanny" | "cleaning" | "boiler" | "it_tech" | "repair" | "moving" | "barber";

export function DashboardClient() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<Profile["role"] | null>(null);
  const [providers, setProviders] = useState<ProviderWithProfile[]>([]);
  const [reviewCounts, setReviewCounts] = useState<Record<string, number>>({});
  const [userAddress, setUserAddress] = useState("Yasamal, İnşaatçılar m/s");
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number }>(BAKU_CENTER);

  // Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [radius, setRadius] = useState(3); // default 3 km
  const [selectedCategory, setSelectedCategory] = useState<DashboardCategory>("all");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");

  // Active selected provider on Map
  const [activeProviderId, setActiveProviderId] = useState<string | null>(null);

  const loadReviewCounts = useCallback(async (providerIds: string[]) => {
    if (providerIds.length === 0) {
      setReviewCounts({});
      return;
    }

    const { data, error } = await supabase
      .from("provider_reviews")
      .select("provider_id")
      .in("provider_id", providerIds);

    if (error) {
      console.error("Rəy sayı yüklənmədi:", error);
      setReviewCounts({});
      return;
    }

    const counts = (data || []).reduce<Record<string, number>>((acc, row) => {
      acc[row.provider_id] = (acc[row.provider_id] || 0) + 1;
      return acc;
    }, {});

    setReviewCounts(counts);
  }, []);

  // Müştərinin real lokasiyasını brauzer geolocation ilə almaq
  const locateUser = useCallback(async (fallback: { lat: number; lng: number }, userId: string | null) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });
      const newCoords = {
        lat: Number(position.coords.latitude.toFixed(6)),
        lng: Number(position.coords.longitude.toFixed(6)),
      };
      setUserCoordinates(newCoords);

      // DB-yə yaz yalnız əhəmiyyətli hərəkət olduqda (realtime sonsuz dövrü olmasın)
      if (userId) {
        const moved = calculateDistance(fallback.lat, fallback.lng, newCoords.lat, newCoords.lng);
        if (moved > 0.1) {
          await supabase
            .from("profiles")
            .update({ latitude: newCoords.lat, longitude: newCoords.lng })
            .eq("id", userId);
        }
      }
    } catch {
      // İcazə verilmədi və ya xəta — fallback (rayon mərkəzi) davam edir
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let userCoords = BAKU_CENTER;

      if (user) {
        setCurrentUserId(user.id);

        const { data: profile } = await supabase
          .from("profiles")
          .select("address, role, latitude, longitude")
          .eq("id", user.id)
          .single();

        if (profile?.address) {
          setUserAddress(profile.address);
        }

        if (profile?.role) {
          setCurrentUserRole(profile.role);
        }

        userCoords =
          (typeof profile?.latitude === "number" && typeof profile?.longitude === "number")
            ? { lat: profile.latitude, lng: profile.longitude }
            : getDistrictCoordinates(profile?.address) ?? BAKU_CENTER;
        setUserCoordinates(userCoords);

        // Brauzer geolocation ilə real yerini almağa çalış
        void locateUser(userCoords, user.id);
      }

      let providersQuery = supabase
        .from("provider_details")
        .select(`
          user_id,
          category,
          working_radius_km,
          profile_status,
          documents_uploaded,
          rating,
          hourly_rate,
          price_min,
          price_max,
          bio,
          is_online
        `);

      if (user) {
        providersQuery = providersQuery.neq("user_id", user.id);
      }

      const { data: dbProviders, error: dbError } = await providersQuery;

      if (dbError) throw dbError;

      const providerIds = (dbProviders || []).map((provider) => provider.user_id);
      let profilesById: Record<string, Profile> = {};

      if (providerIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, phone, role, address, avatar_url, latitude, longitude")
          .in("id", providerIds);

        if (profileError) throw profileError;

        profilesById = Object.fromEntries(
          (profileRows || []).map((profile) => [profile.id, profile])
        );
      }

      const formattedDbProviders = ((dbProviders || []) as ProviderDetails[]).map((provider) => {
        const profile = profilesById[provider.user_id];
        const coords =
          (profile && typeof profile.latitude === "number" && typeof profile.longitude === "number")
            ? { lat: profile.latitude, lng: profile.longitude }
            : getDistrictCoordinates(profile?.address) ?? BAKU_CENTER;

        return {
          ...provider,
          profiles: profile ?? null,
          coordinates: coords,
        } as ProviderWithProfile;
      });

      setProviders(formattedDbProviders);
      await loadReviewCounts(formattedDbProviders.map((provider) => provider.user_id));
    } catch (err) {
      console.error("Dashboard məlumatları yüklənərkən xəta:", err);
      setProviders([]);
      setReviewCounts({});
    } finally {
      setLoading(false);
    }
  }, [loadReviewCounts, locateUser]);

  // Fetch Session & Approved Providers
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboard();
    }, 0);

    const channel = supabase
      .channel("customer-provider-map")
      .on("postgres_changes", { event: "*", schema: "public", table: "provider_details" }, () => void loadDashboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void loadDashboard())
      .on("postgres_changes", { event: "*", schema: "public", table: "provider_reviews" }, () => void loadDashboard())
      .subscribe();

    return () => {
      window.clearTimeout(timeoutId);
      void supabase.removeChannel(channel);
    };
  }, [loadDashboard]);

  // Məsafələri cari lokasiyadan (geolocation daxil) hər renderdə hesabla — xəritə ilə uyğun olsun
  const providersWithDistance = useMemo(
    () =>
      providers.map((provider) => {
        if (!provider.coordinates) return provider;
        const distance = calculateDistance(
          userCoordinates.lat,
          userCoordinates.lng,
          provider.coordinates.lat,
          provider.coordinates.lng
        );
        return { ...provider, distance: Number(distance.toFixed(1)) };
      }),
    [providers, userCoordinates]
  );

  const activeProvider = useMemo(
    () => providersWithDistance.find((provider) => provider.user_id === activeProviderId) ?? null,
    [activeProviderId, providersWithDistance]
  );

  const categoryOptions: Array<{ key: DashboardCategory; label: string }> = [
    { key: "all", label: t.dashboard.all },
    { key: "urgent", label: t.dashboard.emergency },
    { key: "plumbing", label: t.categories.plumbing },
    { key: "electric", label: t.categories.electric },
    { key: "nanny", label: t.categories.nanny },
    { key: "cleaning", label: t.categories.cleaning },
    { key: "boiler", label: t.categories.boiler },
    { key: "it_tech", label: t.categories.it_tech },
    { key: "repair", label: t.categories.repair },
    { key: "moving", label: t.categories.moving },
    { key: "barber", label: t.categories.barber },
  ];

  const categoryLookup: Record<Exclude<DashboardCategory, "all">, string> = {
    urgent: "",
    plumbing: "Santexnik",
    electric: "Elektrik",
    nanny: "Dayə",
    cleaning: "Təmizlik xidməti",
    boiler: "Kombi Ustası",
    it_tech: "İT / Texniki yardım",
    repair: "Ev təmiri",
    moving: "Daşınma xidməti",
    barber: "Bərbər",
  };

  // Filter logic
  const filteredProviders = providersWithDistance.filter((p) => {
    // Never show the currently authenticated provider in customer mode.
    if (currentUserId && p.user_id === currentUserId) return false;

    // 1. Radius filter
    if (p.distance && p.distance > radius) return false;

    // 1b. Ustanın öz iş radiusu (working_radius_km) — xidmət sahəsindən kənar müştərilərə görünməsin
    if (p.working_radius_km != null && p.distance != null && p.distance > p.working_radius_km) return false;

    // 2. Category filter
    if (selectedCategory !== "all") {
      if (selectedCategory === "urgent") {
        if ((p.rating || 0) < 4.8) return false;
      } else if (selectedCategory === "cleaning") {
        if (p.category !== "Təmizlik" && p.category !== "Təmizlik xidməti") return false;
      } else if (selectedCategory === "repair") {
        const repairCats = ["Ev təmiri", "Mebel Ustası", "Rəngsaz", "Alçipan Ustası", "Kafel-Metlax Ustası", "Kondisioner Ustası"];
        if (!repairCats.includes(p.category)) return false;
      } else if (p.category !== categoryLookup[selectedCategory]) {
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

  const closeProviderProfile = () => {
    setActiveProviderId(null);
  };

  const openProviderProfile = (provider: ProviderWithProfile) => {
    setActiveProviderId(provider.user_id);
  };

  return (
    <div className="flex-1 flex flex-col w-full">
      {/* FILTER & SEARCH PANEL */}
      <section className="bg-white border-b border-border py-4 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center gap-4">
          
          {/* Left Side: Address info & Categories */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 flex-1 min-w-0">
            <div className="flex items-center gap-2 h-10 w-fit max-w-full shrink-0 bg-muted/40 border border-border px-3.5 rounded-xl">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground/80 truncate">
                {userAddress}
              </span>
            </div>

            {/* Categories list badges - Balanced wrapping */}
            <div className="flex flex-wrap items-center gap-2">
              {categoryOptions.map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      closeProviderProfile();
                    }}
                    className={`h-9 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap inline-flex items-center transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "bg-muted/65 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {cat.key === "urgent" ? `⚡ ${cat.label}` : cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search bar & Radius Slider & View Toggle */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Search Input */}
            <div className="relative w-full sm:w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder={t.dashboard.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-3 bg-muted/40 border-border focus-visible:ring-primary text-xs rounded-xl"
              />
            </div>

            {/* Radius slider panel */}
            <div className="flex items-center gap-2.5 h-10 bg-muted/20 border border-border/60 px-3.5 rounded-xl shrink-0">
              <Sliders className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="range"
                min="1"
                max="10"
                value={radius}
                onChange={(e) => {
                  setRadius(Number(e.target.value));
                  setActiveProviderId(null);
                }}
                className="w-[120px] accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground w-9 text-right shrink-0">
                {radius} km
              </span>
            </div>

            {/* View toggle button */}
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border shrink-0 h-10 self-start sm:self-auto">
              <button
                onClick={() => setViewMode("map")}
                className={`flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all h-full ${
                  viewMode === "map"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>{t.dashboard.mapView}</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center justify-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold transition-all h-full ${
                  viewMode === "list"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>{t.dashboard.listView}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN DASHBOARD CONTENT */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">{t.dashboard.loading}</p>
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
                      {t.dashboard.providersFound} ({filteredProviders.length})
                    </span>
                    <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      {t.dashboard.radius}: {radius} km
                    </span>
                  </div>

                  <div className="flex-1 p-4 space-y-3.5">
                    {filteredProviders.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground space-y-2">
                        <MapPin className="w-8 h-8 mx-auto text-muted-foreground/50" />
                        <p className="text-sm font-medium">{t.dashboard.noProviders}</p>
                        <p className="text-xs">{t.dashboard.noProvidersHint}</p>
                      </div>
                    ) : (
                      filteredProviders.map((p) => {
                        const isActive = activeProvider?.user_id === p.user_id;
                        return (
                          <div
                            key={p.user_id}
                            onClick={() => openProviderProfile(p)}
                            className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-premium group bg-white ${
                              isActive
                                ? "border-primary ring-2 ring-primary/20 shadow-glow-primary"
                                : "border-border"
                            }`}
                          >
                            <div className="flex items-start space-x-3.5">
                              <UserAvatar
                                avatarUrl={p.profiles?.avatar_url}
                                name={`${p.profiles?.first_name} ${p.profiles?.last_name}`}
                                className="size-11 border border-border group-hover:border-primary/20 transition-colors"
                                fallbackClassName="bg-slate-100 text-muted-foreground"
                              />
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
                                    <span>{t.dashboard.verified}</span>
                                  </span>
                                  <span className="text-[10px] text-muted-foreground font-medium flex items-center space-x-0.5">
                                    <Compass className="w-3 h-3 shrink-0" />
                                    <span>{t.dashboard.distance.replace("{distance}", String(p.distance))}</span>
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

                {/* LEAFLET CANLI XƏRİTƏ */}
                <div className="flex-1 h-full relative overflow-hidden">
                  <MapView
                    center={userCoordinates}
                    providers={filteredProviders}
                    radiusKm={radius}
                    activeProviderId={activeProviderId}
                    userLabel={t.dashboard.yourLocation}
                    onSelectProvider={(id) => setActiveProviderId(id)}
                  />
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
                      <h3 className="font-bold text-foreground">{t.dashboard.noProviders}</h3>
                      <p className="text-xs mt-1">{t.dashboard.noProvidersHint}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProviders.map((p) => (
                      <div
                        key={p.user_id}
                        onClick={() => openProviderProfile(p)}
                        className="border border-border shadow-premium hover:shadow-premium-lg rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col justify-between bg-white"
                      >
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3.5">
                              <UserAvatar
                                avatarUrl={p.profiles?.avatar_url}
                                name={`${p.profiles?.first_name} ${p.profiles?.last_name}`}
                                className="size-12 border border-border group-hover:border-primary/20 transition-colors"
                                fallbackClassName="bg-slate-100 text-muted-foreground"
                              />
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
                            <span className="text-xs font-bold text-foreground">{p.rating || "0.0"}</span>
                            <span className="text-xs text-muted-foreground">({reviewCounts[p.user_id] || 0} {t.common.reviews})</span>

                            <span className="ml-auto text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full flex items-center space-x-0.5">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                              <span>{t.dashboard.verified}</span>
                            </span>
                          </div>
                        </div>

                        <div
                          className="bg-slate-50/50 p-4 border-t border-border flex space-x-2.5"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Button 
                            asChild 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs font-semibold h-9 rounded-lg border-border hover:bg-muted text-foreground"
                          >
                            <a href={`tel:${p.profiles?.phone}`}>
                              <Phone className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                              {t.dashboard.call}
                            </a>
                          </Button>
                          <Button 
                            onClick={() => router.push(loc(`/chat?recipient=${p.user_id}`))}
                            variant="premium" 
                            size="sm" 
                            className="w-full text-xs font-semibold h-9 rounded-lg text-white shadow-glow-primary"
                          >
                            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                            {t.dashboard.chat}
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

      <ProviderProfileDialog
        open={Boolean(activeProvider)}
        provider={activeProvider}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onClose={closeProviderProfile}
      />
    </div>
  );
}
