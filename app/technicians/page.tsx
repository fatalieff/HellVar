"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { supabase } from "@/lib/supabase/client";
import { Profile, ProviderDetails } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { WriteReviewDialog } from "@/components/reviews/write-review-dialog";
import { ProviderReview } from "@/lib/types/database";
import { cn } from "@/lib/utils";
import {
  Trophy,
  MapPin,
  Sparkles,
  Heart,
  Search,
  Star,
  Phone,
  MessageSquare,
  MessageSquarePlus,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Clock3,
  BriefcaseBusiness,
  Wrench,
  ChevronRight,
  Zap,
  Filter,
  Users,
  Award,
  Clock4,
  Compass,
  Layers,
} from "lucide-react";

const USER_COORDINATES = { lat: 40.3894, lng: 49.8032 };

const getStableCoordinates = (userId: string) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 100) / 100) * 0.05 - 0.025;
  const lngOffset = ((Math.abs(hash >> 8) % 100) / 100) * 0.05 - 0.025;
  return {
    lat: USER_COORDINATES.lat + latOffset,
    lng: USER_COORDINATES.lng + lngOffset,
  };
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
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

type CategoryKey =
  | "all"
  | "electric"
  | "plumbing"
  | "cleaning"
  | "nanny"
  | "boiler"
  | "it_tech"
  | "repair"
  | "moving";

const CATEGORY_LOOKUP: Record<Exclude<CategoryKey, "all">, string[]> = {
  electric: ["Elektrik", "elektrik"],
  plumbing: ["Santexnik", "santexnik", "Santexnika", "santexnika"],
  cleaning: ["Təmizlik xidməti", "təmizlik xidməti", "Təmizlik", "təmizlik"],
  nanny: ["Dayə", "dayə"],
  boiler: ["Kombi Ustası", "kombi ustası", "Kombi", "kombi"],
  it_tech: ["İT / Texniki yardım", "it / texniki yardım", "Digər", "digər"],
  repair: [
    "Ev təmiri",
    "ev təmiri",
    "Mebel Ustası",
    "Rəngsaz",
    "Alçipan Ustası",
    "Kafel-Metlax Ustası",
  ],
  moving: [
    "Daşınma xidməti",
    "Daşınma xidmətləri",
    "Daşınma",
    "daşınma",
    "Ev daşınması",
    "Ofis daşınması",
    "Bağ daşınması",
    "Nakliye",
    "Moving",
  ],
};

const TABS = [
  {
    key: "top",
    Icon: Trophy,
    tone: "from-amber-400/20 to-yellow-500/10 text-amber-600",
  },
  {
    key: "nearby",
    Icon: Compass,
    tone: "from-sky-400/20 to-blue-500/10 text-sky-600",
  },
  {
    key: "new",
    Icon: Sparkles,
    tone: "from-violet-400/20 to-purple-500/10 text-violet-600",
  },
  {
    key: "favorites",
    Icon: Heart,
    tone: "from-rose-400/20 to-pink-500/10 text-rose-600",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

type ProviderWithProfile = ProviderDetails & {
  profiles: Profile | null;
  distance?: number;
  coordinates?: { lat: number; lng: number };
};

export default function TechniciansPage() {
  const { t } = useI18n();
  const router = useRouter();
  const cats = t.categories;

  const tabs = useMemo(
    () =>
      TABS.map(({ key, Icon, tone }) => ({
        key,
        Icon,
        tone,
        label: t.techniciansPage.tabs[key],
      })),
    [t],
  );

  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderWithProfile[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("top");
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Rəy dialog state
  const [reviewDialogState, setReviewDialogState] = useState<{
    open: boolean;
    providerId: string;
    name: string;
    category: string;
    initialRating: number;
  }>({ open: false, providerId: "", name: "", category: "", initialRating: 5 });

  const { favorites, toggleFavorite, isFavorite, clearFavorites } =
    useFavoritesStore();

  // Demo/fallback ustalar - DB boş olduqda göstərilir
  const DEMO_PROVIDERS: ProviderWithProfile[] = useMemo(() => {
    const cats = [
      "Elektrik",
      "Santexnik",
      "Təmizlik xidməti",
      "Dayə",
      "Kombi Ustası",
      "İT / Texniki yardım",
      "Ev təmiri",
      "Mebel Ustası",
      "Rəngsaz",
    ];
    const firstNames = [
      "Elçin",
      "Elxan",
      "Sərxan",
      "Leyla",
      "Tural",
      "Mətanət",
      "Rəşad",
      "Aysel",
      "Pərviz",
      "Sevda",
      "Vüqar",
      "Elmurad",
    ];
    const lastNames = [
      "Məmmədov",
      "Hüseynov",
      "Kazımlı",
      "Əliyev",
      "Qurbanov",
      "Mustafayev",
      "Həsənli",
      "Quliyeva",
      "Babayev",
      "Rüstəmov",
      "Vəliyev",
      "Əsgərov",
    ];
    const addresses = [
      "Bakı, Nəsimi r.",
      "Bakı, Xətai r.",
      "Bakı, Nərimanov r.",
      "Bakı, Səbail r.",
      "Bakı, Binəqədi r.",
      "Bakı, Yasamal r.",
      "Bakı, Pirşağı",
      "Bakı, Xırdalan",
    ];

    const list: ProviderWithProfile[] = Array.from({ length: 12 }, (_, i) => {
      const uid = `demo-provider-${i + 1}`;
      const coords = getStableCoordinates(uid);
      const distance = calculateDistance(
        USER_COORDINATES.lat,
        USER_COORDINATES.lng,
        coords.lat,
        coords.lng,
      );
      const cat = cats[i % cats.length];
      return {
        user_id: uid,
        category: cat,
        working_radius_km: [5, 10, 15, 20, 25][i % 5],
        profile_status: i < 9 ? "APPROVED" : "PENDING",
        documents_uploaded: i % 3 !== 2,
        rating: [4.8, 4.9, 4.7, 4.6, 5.0, 4.5, 4.4, 4.8, 4.9, 4.6, 4.7, 4.8][i],
        hourly_rate: [25, 30, 35, 20, 40, 50, 30, 45, 15, 80, 35, 40][i],
        bio: `${cat} sahəsində ${[3, 5, 8, 10, 12, 15, 2, 7][i % 8]} il peşəkar təcrübə. Müştəri məmnuniyyəti əsas hədəfdir. Vaxtında və keyfiyyətli iş!`,
        years_experience: [3, 5, 8, 10, 12, 15, 2, 7, 20, 14, 6, 11][i],
        completed_jobs: [42, 88, 120, 35, 210, 156, 18, 74, 305, 192, 61, 275][
          i
        ],
        is_online: i % 3 !== 2,
        profiles: {
          id: uid,
          first_name: firstNames[i % firstNames.length],
          last_name: lastNames[i % lastNames.length],
          phone: `+99450${String(1000000 + i * 7).padStart(7, "0")}`,
          address: addresses[i % addresses.length],
          role: "PROVIDER",
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Profile,
        coordinates: coords,
        distance: Number(distance.toFixed(1)),
      };
    });
    return list;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setDbError(null);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const { data: dbProviders, error: dbError } = await supabase.from(
        "provider_details",
      ).select(`
          user_id,
          category,
          working_radius_km,
          profile_status,
          documents_uploaded,
          rating,
          hourly_rate,
          bio,
          years_experience,
          completed_jobs,
          is_online
        `);
      // ⚠️ APPROVED FILTERİ SİLİNDİ - hamısı gələcək

      if (dbError) {
        console.warn("Provider_details alınmadı:", dbError.message);
        setDbError(dbError.message);
        // Fallback: demo data göstər
        setProviders(DEMO_PROVIDERS);
        return;
      }

      if (!dbProviders || dbProviders.length === 0) {
        console.info("DB-də usta yoxdur, demo data göstərilir");
        setProviders(DEMO_PROVIDERS);
        return;
      }

      const providerIds = dbProviders.map((p) => p.user_id);
      let profilesById: Record<string, Profile> = {};

      if (providerIds.length > 0) {
        try {
          const { data: profileRows, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .in("id", providerIds);
          if (!profileError && profileRows) {
            profilesById = Object.fromEntries(
              profileRows.map((p) => [p.id, p as Profile]),
            );
          }
        } catch (profileErr) {
          console.warn("Profil məlumatları alınmadı:", profileErr);
        }
      }

      const formatted = (dbProviders as ProviderDetails[]).map((provider) => {
        const coords = getStableCoordinates(provider.user_id);
        const distance = calculateDistance(
          USER_COORDINATES.lat,
          USER_COORDINATES.lng,
          coords.lat,
          coords.lng,
        );
        return {
          ...provider,
          profiles: profilesById[provider.user_id] ?? null,
          coordinates: coords,
          distance: Number(distance.toFixed(1)),
        } as ProviderWithProfile;
      });

      setProviders(formatted);
    } catch (err) {
      console.error("Ustalar yüklənərkən xəta:", err);
      setDbError((err as Error).message || "Unknown error");
      setProviders(DEMO_PROVIDERS);
    } finally {
      setLoading(false);
    }
  }, [DEMO_PROVIDERS]);

  useEffect(() => {
    const t = window.setTimeout(() => void loadData(), 0);
    return () => window.clearTimeout(t);
  }, [loadData]);

  const stats = useMemo(() => {
    const total = providers.length;
    const verified = providers.filter((p) => p.documents_uploaded).length;
    const avgRating =
      total > 0
        ? (
            providers.reduce((acc, p) => acc + (p.rating || 0), 0) / total
          ).toFixed(1)
        : "0.0";
    const online = providers.filter((p) => p.is_online).length;
    return { total, verified, avgRating, online };
  }, [providers]);

  const filteredProviders = useMemo(() => {
    let result = [...providers];

    if (currentUserId) {
      result = result.filter((p) => p.user_id !== currentUserId);
    }

    if (activeCategory !== "all") {
      const validCats = CATEGORY_LOOKUP[activeCategory];
      result = result.filter((p) => validCats.includes(p.category));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const fullName =
          `${p.profiles?.first_name} ${p.profiles?.last_name}`.toLowerCase();
        const address = (p.profiles?.address || "").toLowerCase();
        const cat = p.category.toLowerCase();
        return fullName.includes(q) || address.includes(q) || cat.includes(q);
      });
    }

    switch (activeTab) {
      case "top":
        result.sort((a, b) => {
          const s1 = (b.rating || 0) * 2 + (b.completed_jobs || 0) * 0.1;
          const s2 = (a.rating || 0) * 2 + (a.completed_jobs || 0) * 0.1;
          return s1 - s2;
        });
        break;
      case "nearby":
        result.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      case "new":
        result.reverse();
        break;
      case "favorites":
        result = result.filter((p) => isFavorite(p.user_id));
        break;
    }

    return result;
  }, [
    providers,
    currentUserId,
    activeCategory,
    searchQuery,
    activeTab,
    isFavorite,
  ]);

  const heroProviders = useMemo(() => {
    return [...providers]
      .filter((p) => !currentUserId || p.user_id !== currentUserId)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);
  }, [providers, currentUserId]);

  const categoryOptions: Array<{ key: CategoryKey; label: string }> = [
    { key: "all", label: t.techniciansPage.categoryAllLabel },
    { key: "electric", label: cats.electric as string },
    { key: "plumbing", label: cats.plumbing as string },
    { key: "cleaning", label: cats.cleaning as string },
    { key: "nanny", label: cats.nanny as string },
    { key: "boiler", label: cats.boiler as string },
    { key: "it_tech", label: cats.it_tech as string },
    { key: "repair", label: cats.repair as string },
    { key: "moving", label: cats.moving as string },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 0%, oklch(0.7900 0.1400 70.00 / 0.10), transparent 50%), radial-gradient(circle at 85% 10%, oklch(0.6231 0.1880 41.11 / 0.08), transparent 45%)",
        }}
      />

      {/* ============ HERO / STATS ============ */}
      <section className="relative pt-14 pb-10 sm:pt-20 sm:pb-14 overflow-hidden">
        <Container size="xl">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-4 animate-fade-up">
            <Badge
              variant="accent"
              className="mx-auto gap-1.5 px-3 py-1 rounded-full animate-lift"
            >
              <Trophy className="size-3.5" />
              {t.techniciansPage.heroBadge}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {t.techniciansPage.heroTitle}
              <span className="block mt-1 bg-gradient-primary bg-clip-text text-transparent">
                {t.techniciansPage.heroHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed">
              {t.techniciansPage.heroSubtitle}
            </p>
          </div>

          {/* Stats strip */}
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 sm:mt-14 animate-lift"
            style={{ animationDelay: "120ms" }}
          >
            <StatCard
              Icon={Users}
              tone="from-orange-400/20 to-amber-500/10 text-orange-600"
              value={`${stats.total}+`}
              label={t.techniciansPage.stats.activeProviders}
            />
            <StatCard
              Icon={ShieldCheck}
              tone="from-emerald-400/20 to-green-500/10 text-emerald-600"
              value={`${stats.verified}`}
              label={t.techniciansPage.stats.verified}
            />
            <StatCard
              Icon={Star}
              tone="from-amber-400/20 to-yellow-500/10 text-amber-600"
              value={`${stats.avgRating} ★`}
              label={t.techniciansPage.stats.averageRating}
            />
            <StatCard
              Icon={Zap}
              tone="from-sky-400/20 to-blue-500/10 text-sky-600"
              value={`${stats.online}`}
              label={t.techniciansPage.stats.onlineNow}
            />
          </div>

          {/* Top 3 Masters Podium */}
          {!loading && heroProviders.length >= 3 && (
            <div
              className="mt-12 sm:mt-16 animate-lift"
              style={{ animationDelay: "240ms" }}
            >
              <div className="flex items-end justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Award className="size-5 text-amber-500" />
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    {t.techniciansPage.podiumTitle}
                  </h2>
                </div>
                <Link
                  href="#all"
                  className="group hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t.common.viewAll}
                  <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                {/* #2 */}
                <PodiumCard
                  rank={2}
                  provider={heroProviders[1]}
                  onWriteReview={() =>
                    setReviewDialogState({
                      open: true,
                      providerId: heroProviders[1].user_id,
                      name: `${heroProviders[1].profiles?.first_name || ""} ${heroProviders[1].profiles?.last_name || ""}`.trim(),
                      category: heroProviders[1].category,
                      initialRating: Math.round(heroProviders[1].rating || 5),
                    })
                  }
                />
                {/* #1 */}
                <div className="md:-mb-2 relative z-10">
                  <PodiumCard
                    rank={1}
                    provider={heroProviders[0]}
                    onWriteReview={() =>
                      setReviewDialogState({
                        open: true,
                        providerId: heroProviders[0].user_id,
                        name: `${heroProviders[0].profiles?.first_name || ""} ${heroProviders[0].profiles?.last_name || ""}`.trim(),
                        category: heroProviders[0].category,
                        initialRating: Math.round(heroProviders[0].rating || 5),
                      })
                    }
                  />
                </div>
                {/* #3 */}
                <PodiumCard
                  rank={3}
                  provider={heroProviders[2]}
                  onWriteReview={() =>
                    setReviewDialogState({
                      open: true,
                      providerId: heroProviders[2].user_id,
                      name: `${heroProviders[2].profiles?.first_name || ""} ${heroProviders[2].profiles?.last_name || ""}`.trim(),
                      category: heroProviders[2].category,
                      initialRating: Math.round(heroProviders[2].rating || 5),
                    })
                  }
                />
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* ============ TABS + SEARCH + FILTERS ============ */}
      <section
        id="all"
        className="border-y border-border/60 bg-white/70 backdrop-blur-md sticky top-16 z-30"
      >
        <Container size="xl" className="py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1 rounded-2xl border border-border/60 w-fit">
              {tabs.map(({ key, label, Icon, tone }) => {
                const count =
                  key === "favorites"
                    ? providers.filter((p) => isFavorite(p.user_id)).length
                    : providers.filter(
                        (p) => !currentUserId || p.user_id !== currentUserId,
                      ).length;
                const isActive = activeTab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={cn(
                      "group inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300",
                      isActive
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/50",
                    )}
                  >
                    <span
                      className={cn(
                        "size-4 rounded-md grid place-items-center transition-colors",
                        isActive
                          ? tone
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span>{label}</span>
                    <span
                      className={cn(
                        "text-[10px] font-black px-1.5 py-0.5 rounded-full",
                        isActive
                          ? key === "favorites"
                            ? "bg-rose-100 text-rose-600"
                            : "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search + Category Chips */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 min-w-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5" />
                <Input
                  placeholder={t.techniciansPage.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-11 bg-white rounded-2xl border-border/60 shadow-sm text-sm"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0">
                <Filter className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
                {categoryOptions.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300",
                        isActive
                          ? "bg-gradient-primary text-white shadow-glow-primary"
                          : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {activeTab === "favorites" && favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFavorites}
                className="text-xs font-bold border-destructive/30 text-destructive hover:bg-destructive/5 shrink-0"
              >
                <Heart className="size-3.5 mr-1.5" />
                {t.techniciansPage.resetFilters}
              </Button>
            )}
          </div>
        </Container>
      </section>

      {/* ============ PROVIDERS GRID ============ */}
      <section className="py-10 sm:py-14">
        <Container size="xl">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <Loader2 className="size-10 animate-spin mx-auto text-primary" />
                <p className="mt-4 text-sm font-semibold text-muted-foreground">
                  {t.techniciansPage.loading}
                </p>
              </motion.div>
            ) : filteredProviders.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center border border-dashed border-border rounded-3xl bg-white p-12 sm:p-16 text-center shadow-sm"
              >
                <div
                  className={cn(
                    "size-20 rounded-3xl grid place-items-center mb-5",
                    activeTab === "favorites"
                      ? "bg-rose-50 text-rose-500"
                      : "bg-slate-50 text-muted-foreground",
                  )}
                >
                  {activeTab === "favorites" ? (
                    <Heart className="size-9" />
                  ) : activeTab === "nearby" ? (
                    <Compass className="size-9" />
                  ) : (
                    <Search className="size-9" />
                  )}
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {activeTab === "favorites"
                    ? t.techniciansPage.emptyFavoritesTitle
                    : t.techniciansPage.emptyNoMatchTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                  {activeTab === "favorites"
                    ? t.techniciansPage.emptyFavoritesDescription
                    : t.techniciansPage.emptyNoMatchDescription}
                </p>
                {activeTab !== "favorites" && activeTab !== "top" && (
                  <Button
                    onClick={() => {
                      setActiveTab("top");
                      setActiveCategory("all");
                      setSearchQuery("");
                    }}
                    variant="premium"
                    className="mt-6 h-11 rounded-2xl px-6 gap-1.5"
                  >
                    {t.techniciansPage.resetFilters}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
                {activeTab === "favorites" && (
                  <Button
                    onClick={() => setActiveTab("top")}
                    variant="premium"
                    className="mt-6 h-11 rounded-2xl px-6 gap-1.5"
                  >
                    {t.techniciansPage.discoverProviders}
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
              >
                {filteredProviders.map((provider, i) => (
                  <motion.div
                    key={provider.user_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: Math.min(i, 12) * 40 }}
                  >
                    <MasterCard
                      provider={provider}
                      isFavorite={isFavorite(provider.user_id)}
                      onToggleFavorite={() => toggleFavorite(provider.user_id)}
                      onViewProfile={() =>
                        router.push(`/technicians/${provider.user_id}`)
                      }
                      onChat={() =>
                        router.push(`/chat?recipient=${provider.user_id}`)
                      }
                      onWriteReview={() =>
                        setReviewDialogState({
                          open: true,
                          providerId: provider.user_id,
                          name: `${provider.profiles?.first_name || ""} ${provider.profiles?.last_name || ""}`.trim(),
                          category: provider.category,
                          initialRating: Math.round(provider.rating || 5),
                        })
                      }
                      badge={
                        activeTab === "top" ? (
                          <RankBadge rank={i + 1} />
                        ) : activeTab === "nearby" ? (
                          <Badge className="bg-sky-50 text-sky-600 border-sky-200 rounded-full text-[10px] font-bold">
                            <MapPin className="size-3 mr-1" />
                            {provider.distance} km
                          </Badge>
                        ) : activeTab === "new" ? (
                          <Badge className="bg-violet-50 text-violet-600 border-violet-200 rounded-full text-[10px] font-bold">
                            <Sparkles className="size-3 mr-1" />
                            Yeni
                          </Badge>
                        ) : null
                      }
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </section>

      {/* ============ CTA BECOME TECHNICIAN ============ */}
      <section className="pb-16 sm:pb-20">
        <Container size="xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary px-6 py-10 sm:px-12 sm:py-14 text-white shadow-premium-lg animate-lift">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-white/15 blur-3xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-24 size-72 rounded-full bg-white/10 blur-3xl"
            />

            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] items-center">
              <div className="flex flex-col gap-3 max-w-xl">
                <Badge className="bg-white/15 text-white border-white/20 rounded-full w-fit font-bold backdrop-blur-sm">
                  <Wrench className="size-3.5 mr-1.5" />
                  {t.techniciansPage.cta.badge}
                </Badge>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
                  {t.techniciansPage.cta.title}
                </h3>
                <p className="text-white/90 leading-7 sm:text-lg">
                  {t.techniciansPage.cta.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="size-5" />{" "}
                    {t.techniciansPage.cta.verifiedProfile}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Zap className="size-5" />{" "}
                    {t.techniciansPage.cta.urgentJobs}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Layers className="size-5" /> {t.techniciansPage.cta.stats}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full lg:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-foreground hover:bg-white/95 shadow-none h-12 rounded-2xl px-6 font-bold flex-1 lg:flex-none"
                >
                  <Link href="/signup" className="gap-2">
                    <Sparkles className="size-4.5" />
                    {t.techniciansPage.cta.button}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* WRITE REVIEW DIALOG */}
      <WriteReviewDialog
        open={reviewDialogState.open}
        onOpenChange={(open) =>
          setReviewDialogState((prev) => ({ ...prev, open }))
        }
        providerId={reviewDialogState.providerId}
        providerName={reviewDialogState.name}
        providerCategory={reviewDialogState.category}
        providerInitialRating={reviewDialogState.initialRating}
        onSuccess={() => void loadData()}
      />
    </div>
  );
}

/* ============== COMPONENTS ============== */

function StatCard({
  Icon,
  tone,
  value,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
  value: string;
  label: string;
}) {
  return (
    <Card className="group border-border/60 bg-card overflow-hidden shadow-sm transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 hover:border-primary/20">
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={cn(
            "size-12 rounded-2xl grid place-items-center bg-gradient-to-br shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-110",
            tone,
          )}
        >
          <Icon className="size-5.5" />
        </div>
        <div className="min-w-0">
          <div className="text-2xl font-black tracking-tight text-foreground">
            {value}
          </div>
          <div className="text-xs font-semibold text-muted-foreground mt-0.5">
            {label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const map: Record<
    number,
    { cls: string; Icon: React.ComponentType<{ className?: string }> }
  > = {
    1: { cls: "bg-amber-100 text-amber-700 border-amber-200", Icon: Award },
    2: { cls: "bg-slate-100 text-slate-700 border-slate-200", Icon: Award },
    3: { cls: "bg-orange-100 text-orange-700 border-orange-200", Icon: Award },
  };
  const cfg = map[rank] || {
    cls: "bg-primary/10 text-primary border-primary/20",
    Icon: Trophy,
  };
  const CfgIcon = cfg.Icon;
  return (
    <Badge className={cn("rounded-full text-[10px] font-bold", cfg.cls)}>
      <CfgIcon className="size-3 mr-1" />
      {rank === 1
        ? "1-ci"
        : rank === 2
          ? "2-ci"
          : rank === 3
            ? "3-cü"
            : `#${rank}`}
    </Badge>
  );
}

function PodiumCard({
  rank,
  provider,
  onWriteReview,
}: {
  rank: number;
  provider: ProviderWithProfile;
  onWriteReview: () => void;
}) {
  const { t } = useI18n();
  const colors: Record<number, string> = {
    1: "from-amber-400 via-orange-400 to-orange-500",
    2: "from-slate-300 via-slate-400 to-slate-500",
    3: "from-orange-300 via-amber-500 to-orange-600",
  };
  const badges: Record<number, string> = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };
  const heightMap: Record<number, string> = {
    1: "h-20",
    2: "h-16",
    3: "h-12",
  };
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavoritesStore();

  return (
    <Card
      className={cn(
        "group relative border bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5",
        rank === 1
          ? "shadow-premium-lg border-primary/30"
          : "shadow-sm border-border/60 hover:shadow-premium-lg hover:border-primary/20",
      )}
    >
      <div
        className={cn(
          "w-full bg-gradient-to-br text-white p-5 flex items-center gap-4",
          colors[rank],
        )}
      >
        <div className="relative">
          <div className="size-16 rounded-2xl bg-white/25 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center font-black text-2xl shadow-lg">
            {provider.profiles?.first_name?.[0]}
            {provider.profiles?.last_name?.[0]}
            <span
              className={cn(
                "absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-white flex items-center justify-center text-[9px]",
                provider.is_online ? "bg-emerald-400" : "bg-slate-300",
              )}
            />
          </div>
          <span className="absolute -top-3 -right-3 text-3xl drop-shadow">
            {badges[rank]}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/80">
            {t.techniciansPage.podium.rankLabel} #{rank}
          </div>
          <h3 className="font-bold text-lg leading-tight truncate">
            {provider.profiles?.first_name} {provider.profiles?.last_name}
          </h3>
          <div className="text-xs font-semibold text-white/90 mt-0.5 flex items-center gap-1.5">
            <span className="truncate">{provider.category}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <MiniStat
            Icon={Star}
            value={(provider.rating || 5.0).toFixed(1)}
            label={t.techniciansPage.card.ratingLabel}
          />
          <MiniStat
            Icon={BriefcaseBusiness}
            value={String(provider.completed_jobs || 0)}
            label={t.techniciansPage.card.jobsLabel}
          />
          <MiniStat
            Icon={MapPin}
            value={`${provider.distance || 0}km`}
            label={t.techniciansPage.card.distanceLabel}
          />
        </div>

        <div className="h-px bg-border/60" />

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t.techniciansPage.card.hourlyLabel}
            </span>
            <div className="text-lg font-black text-foreground">
              {provider.hourly_rate
                ? `${provider.hourly_rate} ₼`
                : t.techniciansPage.card.negotiable}
            </div>
          </div>

          <button
            onClick={() => toggleFavorite(provider.user_id)}
            className={cn(
              "size-10 rounded-xl grid place-items-center border transition-all duration-300 shrink-0",
              isFavorite(provider.user_id)
                ? "bg-rose-50 border-rose-200 text-rose-500 shadow-sm"
                : "bg-slate-50 border-border text-muted-foreground hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50",
            )}
            title={t.techniciansPage.card.favoriteButtonTitle}
          >
            <Heart
              className={cn(
                "size-4.5 transition-transform duration-300",
                isFavorite(provider.user_id) && "fill-current scale-110",
              )}
            />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <Button
            onClick={() => router.push(`/technicians/${provider.user_id}`)}
            variant="outline"
            size="sm"
            className="h-10 rounded-xl text-[11px] font-bold border-border hover:bg-slate-50"
            title={t.techniciansPage.card.profileButton}
          >
            {t.techniciansPage.card.profileButton}
          </Button>
          <Button
            onClick={onWriteReview}
            variant="outline"
            size="sm"
            className="h-10 rounded-xl text-[11px] font-bold border-border hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"
            title={t.techniciansPage.card.reviewButton}
          >
            <MessageSquarePlus className="size-3.5 mr-1" />
            {t.techniciansPage.card.reviewButton}
          </Button>
          <Button
            onClick={() => router.push(`/chat?recipient=${provider.user_id}`)}
            variant="premium"
            size="sm"
            className="h-10 rounded-xl text-[11px] font-bold gap-1 shadow-glow-primary"
            title={t.techniciansPage.card.writeButton}
          >
            <MessageSquare className="size-3.5" />
            {t.techniciansPage.card.writeButton}
          </Button>
        </div>

        {/* Podium bar */}
        <div
          aria-hidden
          className={cn(
            "mx-auto rounded-t-lg bg-gradient-to-b from-muted/50 to-muted/10 border border-b-0 border-border/60",
            heightMap[rank],
            "w-[70%]",
            rank === 1 ? "mt-2" : "",
          )}
        />
      </CardContent>
    </Card>
  );
}

function MiniStat({
  Icon,
  value,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-slate-50/50 px-2 py-2.5 text-center">
      <Icon className="size-3.5 mx-auto text-primary mb-1" />
      <div className="text-[13px] font-black tracking-tight text-foreground leading-none">
        {value}
      </div>
      <div className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

function MasterCard({
  provider,
  isFavorite,
  onToggleFavorite,
  onViewProfile,
  onChat,
  onWriteReview,
  badge,
}: {
  provider: ProviderWithProfile;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onViewProfile: () => void;
  onChat: () => void;
  onWriteReview: () => void;
  badge?: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <Card className="group flex flex-col h-full overflow-hidden border border-border/60 bg-white transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 hover:border-primary/20">
      <CardContent className="p-5 flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative shrink-0">
              <div className="size-12 rounded-2xl bg-gradient-primary text-white flex items-center justify-center font-black text-base shadow-sm">
                {provider.profiles?.first_name?.[0]}
                {provider.profiles?.last_name?.[0]}
              </div>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white shadow-sm",
                  provider.is_online ? "bg-emerald-500" : "bg-slate-350",
                )}
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                {provider.profiles?.first_name} {provider.profiles?.last_name}
              </h3>
              <div className="flex flex-wrap items-center gap-1 mt-1">
                <span className="inline-block text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold border">
                  {provider.category}
                </span>
                {badge}
              </div>
            </div>
          </div>

          <button
            onClick={onToggleFavorite}
            className={cn(
              "size-9 rounded-xl grid place-items-center border transition-all duration-300 shrink-0",
              isFavorite
                ? "bg-rose-50 border-rose-200 text-rose-500 shadow-sm"
                : "bg-slate-50 border-border text-muted-foreground hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50",
            )}
            aria-label={t.techniciansPage.card.favoriteButtonTitle}
          >
            <Heart
              className={cn(
                "size-4 transition-transform duration-300",
                isFavorite && "fill-current scale-110",
              )}
            />
          </button>
        </div>

        {/* Rating & Verified */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-xl text-xs font-black shadow-sm/5">
            <Star className="size-3.5 fill-amber-500 text-amber-500" />
            <span>{provider.rating ? provider.rating.toFixed(1) : "5.0"}</span>
          </div>
          {provider.documents_uploaded && (
            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 rounded-full text-[10px] font-bold">
              <ShieldCheck className="size-3 mr-1" />
              ŞV
            </Badge>
          )}
          <div className="ml-auto text-[10px] font-bold text-muted-foreground">
            {provider.completed_jobs ?? 0}{" "}
            {provider.completed_jobs === 1 ? "iş" : "iş"}
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {provider.bio || t.dashboard.noBio}
        </p>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3 border-t border-b border-border/60 py-3 text-[11px] font-semibold text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock3 className="size-3.5 text-primary shrink-0" />
            <span>
              {t.dashboard.experienceLabel}:{" "}
              {provider.years_experience
                ? `${provider.years_experience} il`
                : "—"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock4 className="size-3.5 text-primary shrink-0" />
            <span>
              {t.techniciansPage.card.radiusLabel}: {provider.working_radius_km}{" "}
              km
            </span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin className="size-3.5 text-primary shrink-0" />
            <span className="truncate">
              {provider.profiles?.address || t.dashboard.unknownAddress}
            </span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="flex items-center justify-between gap-4 mt-auto pt-1">
          <div>
            <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
              {t.dashboard.priceLabel}
            </span>
            <span className="text-base font-black text-foreground">
              {provider.hourly_rate
                ? `${provider.hourly_rate} ₼`
                : t.techniciansPage.card.negotiable}
            </span>
          </div>

          <div className="flex gap-1.5">
            <Button
              onClick={onViewProfile}
              variant="outline"
              size="sm"
              className="h-9 px-2.5 rounded-lg text-[11px] font-bold border-border hover:bg-slate-50"
              title={t.techniciansPage.card.profileButton}
            >
              {t.techniciansPage.card.profileButton}
            </Button>
            <Button
              onClick={onWriteReview}
              variant="outline"
              size="sm"
              className="h-9 px-2.5 rounded-lg text-[11px] font-bold border-border hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600"
              title={t.techniciansPage.card.reviewButton}
            >
              <MessageSquarePlus className="size-3.5 mr-1" />
              {t.techniciansPage.card.reviewButton}
            </Button>
            <Button
              onClick={onChat}
              variant="premium"
              size="sm"
              className="h-9 px-2.5 rounded-lg text-[11px] font-bold gap-1 shadow-glow-primary"
              title={t.techniciansPage.card.writeButton}
            >
              <MessageSquare className="size-3.5" />
              {t.techniciansPage.card.writeButton}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
