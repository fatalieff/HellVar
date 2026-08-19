"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { supabase } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bolt,
  Droplets,
  Sparkles as CleaningIcon,
  Heart,
  Flame,
  Laptop,
  Wrench,
  Truck,
  Scissors,
  Search,
  Star,
  MapPin,
  Activity,
  BriefcaseBusiness,
  Clock3,
  ShieldCheck,
  Phone,
  MessageSquare,
  Loader2,
  ArrowLeft,
  AlertCircle,
  SlidersHorizontal,
  X,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type CategoryKey =
  | "electric"
  | "plumbing"
  | "cleaning"
  | "nanny"
  | "boiler"
  | "it_tech"
  | "repair"
  | "moving"
  | "barber";

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  address?: string | null;
  avatar_url?: string | null;
};

type ProviderDetails = {
  user_id: string;
  category: string;
  working_radius_km: number;
  documents_uploaded: boolean;
  profile_status: string;
  rating?: number | null;
  hourly_rate?: number | null;
  bio?: string | null;
  years_experience?: number | null;
  completed_jobs?: number | null;
  is_online: boolean;
};

type ProviderWithProfile = ProviderDetails & {
  profiles: Profile | null;
  distance?: number;
  coordinates?: { lat: number; lng: number };
};

type ReviewAuthor = Pick<Profile, "id" | "first_name" | "last_name">;

type ProviderReviewWithCustomer = {
  id: string;
  provider_id: string;
  customer_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
  customer: ReviewAuthor | null;
};

const CATEGORY_META: Record<
  CategoryKey,
  {
    Icon: React.ComponentType<{ className?: string }>;
    tone: string;
    image: string;
  }
> = {
  electric: {
    Icon: Bolt,
    tone: "from-amber-400/20 to-yellow-500/10 text-amber-600 dark:text-amber-400",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
  },
  plumbing: {
    Icon: Droplets,
    tone: "from-sky-400/20 to-blue-500/10 text-sky-600 dark:text-sky-400",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop",
  },
  cleaning: {
    Icon: CleaningIcon,
    tone: "from-emerald-400/20 to-green-500/10 text-emerald-600 dark:text-emerald-400",
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop",
  },
  nanny: {
    Icon: Heart,
    tone: "from-pink-400/20 to-rose-500/10 text-pink-600",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
  },
  boiler: {
    Icon: Flame,
    tone: "from-orange-400/20 to-red-500/10 text-orange-600",
    image:
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=400&auto=format&fit=crop",
  },
  it_tech: {
    Icon: Laptop,
    tone: "from-indigo-400/20 to-violet-500/10 text-indigo-600",
    image:
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=400&auto=format&fit=crop",
  },
  repair: {
    Icon: Wrench,
    tone: "from-amber-500/20 to-orange-500/10 text-orange-600",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
  },
  moving: {
    Icon: Truck,
    tone: "from-purple-400/20 to-indigo-500/10 text-indigo-600",
    image:
      "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=400&auto=format&fit=crop",
  },
  barber: {
    Icon: Scissors,
    tone: "from-slate-400/20 to-zinc-500/10 text-slate-600",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop",
  },
};

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

const CATEGORY_CANONICAL_KEYS: Record<string, string> = {
  Elektrik: "Elektrik",
  elektrik: "Elektrik",
  electric: "Elektrik",
  Electric: "Elektrik",
  Santexnik: "Santexnik",
  santexnik: "Santexnik",
  plumbing: "Santexnik",
  Plumbing: "Santexnik",
  Santexnika: "Santexnik",
  santexnika: "Santexnik",
  "Təmizlik xidməti": "Təmizlik xidməti",
  "təmizlik xidməti": "Təmizlik xidməti",
  cleaning: "Təmizlik xidməti",
  Cleaning: "Təmizlik xidməti",
  Təmizlik: "Təmizlik xidməti",
  təmizlik: "Təmizlik xidməti",
  Dayə: "Dayə",
  dayə: "Dayə",
  nanny: "Dayə",
  Nanny: "Dayə",
  "Kombi Ustası": "Kombi Ustası",
  "kombi ustası": "Kombi Ustası",
  boiler: "Kombi Ustası",
  Boiler: "Kombi Ustası",
  Kombi: "Kombi Ustası",
  kombi: "Kombi Ustası",
  "İT / Texniki yardım": "İT / Texniki yardım",
  "it / texniki yardım": "İT / Texniki yardım",
  it_tech: "İT / Texniki yardım",
  "IT Support": "İT / Texniki yardım",
  "Ev təmiri": "Ev təmiri",
  "ev təmiri": "Ev təmiri",
  repair: "Ev təmiri",
  Repair: "Ev təmiri",
  "Mebel Ustası": "Mebel Ustası",
  Rəngsaz: "Rəngsaz",
  "Alçipan Ustası": "Alçipan Ustası",
  "Kafel-Metlax Ustası": "Kafel-Metlax Ustası",
  "Kondisioner Ustası": "Kondisioner Ustası",
  "Daşınma xidməti": "Daşınma xidməti",
  "Daşınma xidmətləri": "Daşınma xidməti",
  Daşınma: "Daşınma xidməti",
  daşınma: "Daşınma xidməti",
  moving: "Daşınma xidməti",
  Moving: "Daşınma xidməti",
  "Ev daşınması": "Daşınma xidməti",
  "Ofis daşınması": "Daşınma xidməti",
  "Bağ daşınması": "Daşınma xidməti",
  Nakliye: "Daşınma xidməti",
  Bərbər: "Bərbər",
  bərbər: "Bərbər",
  Berber: "Bərbər",
  berber: "Bərbər",
  Barber: "Bərbər",
  barber: "Bərbər",
  "Saç kəsimi": "Bərbər",
  Saqqal: "Bərbər",
  Digər: "Digər",
  digər: "Digər",
};

const localizeCategory = (raw: string, t: Dictionary): string => {
  const canonical = CATEGORY_CANONICAL_KEYS[raw] ?? raw;
  const localized = t.auth?.signUp?.providerCategories?.[canonical];
  return localized || raw;
};

const getDatabaseCategoriesForCategory = (categoryKey: string): string[] => {
  switch (categoryKey) {
    case "electric":
      return ["Elektrik", "elektrik", "electric", "Electric"];
    case "plumbing":
      return [
        "Santexnik",
        "santexnik",
        "plumbing",
        "Plumbing",
        "Santexnika",
        "santexnika",
      ];
    case "cleaning":
      return [
        "Təmizlik xidməti",
        "təmizlik xidməti",
        "cleaning",
        "Cleaning",
        "Təmizlik",
        "təmizlik",
      ];
    case "nanny":
      return ["Dayə", "dayə", "nanny", "Nanny"];
    case "boiler":
      return [
        "Kombi Ustası",
        "kombi ustası",
        "boiler",
        "Boiler",
        "Kombi",
        "kombi",
      ];
    case "it_tech":
      return [
        "İT / Texniki yardım",
        "it / texniki yardım",
        "it_tech",
        "IT Support",
        "Digər",
        "digər",
      ];
    case "repair":
      return [
        "Ev təmiri",
        "ev təmiri",
        "repair",
        "Repair",
        "Mebel Ustası",
        "Rəngsaz",
        "Alçipan Ustası",
        "Kafel-Metlax Ustası",
        "Bərpa",
        "bərpa",
      ];
    case "moving":
      return [
        "Daşınma xidməti",
        "Daşınma xidmətləri",
        "Daşınma",
        "daşınma",
        "moving",
        "Moving",
        "Ev daşınması",
        "Ofis daşınması",
        "Bağ daşınması",
        "Nakliye",
      ];
    case "barber":
      return [
        "Bərbər",
        "bərbər",
        "Berber",
        "berber",
        "Barber",
        "barber",
        "Saç kəsimi",
        "Saqqal",
      ];
    default:
      return [
        categoryKey,
        categoryKey.toLowerCase(),
        categoryKey.toUpperCase(),
      ];
  }
};

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRequestAction = searchParams.get("action") === "request";

  const resolvedParams = React.use(params);
  const categoryKey = resolvedParams.category as CategoryKey;

  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const cats = t.categories;

  // States
  const [providers, setProviders] = useState<ProviderWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [radiusFilter, setRadiusFilter] = useState<number>(10); // default 10 km
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [minExperience, setMinExperience] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [onlineOnly, setOnlineOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>("rating");

  // Selected Provider Details Modal
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [reviews, setReviews] = useState<ProviderReviewWithCustomer[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const selectedProvider = useMemo(() => {
    return providers.find((p) => p.user_id === selectedProviderId) || null;
  }, [providers, selectedProviderId]);

  // Load providers from Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        const dbCategories = getDatabaseCategoriesForCategory(categoryKey);

        let dbProviders: any[] = [];
        let dbError: any = null;

        // Try querying all fields (real migrations)
        const primaryQuery = await supabase
          .from("provider_details")
          .select(
            `
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
          `,
          )
          .in("category", dbCategories);

        dbProviders = primaryQuery.data || [];
        dbError = primaryQuery.error;

        // If column does not exist (error 42703), retry with baseline fields
        if (dbError && dbError.code === "42703") {
          console.warn(
            "New provider details columns do not exist. Retrying with baseline fields...",
          );
          const fallbackQuery = await supabase
            .from("provider_details")
            .select(
              `
              user_id,
              category,
              working_radius_km,
              profile_status,
              documents_uploaded,
              rating,
              hourly_rate,
              is_online
            `,
            )
            .in("category", dbCategories);

          if (fallbackQuery.error) {
            throw fallbackQuery.error;
          }
          dbProviders = (fallbackQuery.data || []).map((provider: any) => ({
            ...provider,
            bio: null,
            years_experience: null,
            completed_jobs: 0,
          }));
          dbError = null;
        } else if (dbError) {
          throw dbError;
        }

        if (!dbProviders || dbProviders.length === 0) {
          setProviders([]);
          return;
        }

        // Fetch profiles for active providers
        const providerIds = dbProviders.map((p) => p.user_id);
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, phone, role, address, avatar_url")
          .in("id", providerIds);

        if (profileError) throw profileError;

        const profilesById = Object.fromEntries(
          (profileRows || []).map((p) => [p.id, p]),
        );

        const formatted = dbProviders.map((provider) => {
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
        console.error("Usta məlumatları yüklənərkən xəta:", err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    void fetchData();
  }, [categoryKey]);

  // Load reviews when selected provider changes
  useEffect(() => {
    const providerId = selectedProviderId;
    if (!providerId) {
      setReviews([]);
      return;
    }

    async function fetchReviews(targetProviderId: string) {
      setReviewsLoading(true);
      try {
        const { data: reviewRows, error: reviewError } = await supabase
          .from("provider_reviews")
          .select(
            `
            id,
            provider_id,
            customer_id,
            rating,
            comment,
            created_at,
            updated_at
          `,
          )
          .eq("provider_id", targetProviderId)
          .order("created_at", { ascending: false });

        if (reviewError) {
          const missingTable =
            reviewError.code === "42P01" ||
            reviewError.code === "PGRST205" ||
            (typeof reviewError.message === "string" &&
              reviewError.message.includes("Could not find the table"));
          if (missingTable) {
            console.warn(
              "provider_reviews table does not exist. Gracefully ignoring reviews...",
            );
            setReviews([]);
            return;
          }
          throw reviewError;
        }

        if (!reviewRows || reviewRows.length === 0) {
          setReviews([]);
          return;
        }

        const customerIds = reviewRows.map((r) => r.customer_id);
        const { data: customerRows, error: customerError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", customerIds);

        if (customerError) throw customerError;

        const customersById = Object.fromEntries(
          (customerRows || []).map((c) => [c.id, c]),
        );

        const formattedReviews = reviewRows.map((r) => ({
          ...r,
          customer: customersById[r.customer_id] ?? null,
        })) as ProviderReviewWithCustomer[];

        setReviews(formattedReviews);
      } catch (err) {
        console.error("Rəylər yüklənərkən xəta:", err);
      } finally {
        setReviewsLoading(false);
      }
    }
    void fetchReviews(providerId);
  }, [selectedProviderId]);

  // Filters & Sorting Calculation
  const filteredAndSortedProviders = useMemo(() => {
    let result = [...providers];

    // Exclude logged in provider
    if (currentUserId) {
      result = result.filter((p) => p.user_id !== currentUserId);
    }

    // Apply Search query (Name or Address)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const fullName =
          `${p.profiles?.first_name} ${p.profiles?.last_name}`.toLowerCase();
        const address = (p.profiles?.address || "").toLowerCase();
        return fullName.includes(q) || address.includes(q);
      });
    }

    // Radius Filter
    if (radiusFilter !== null) {
      result = result.filter((p) => (p.distance ?? 0) <= radiusFilter);
    }

    // Min / Max Price
    if (minPrice.trim() !== "") {
      result = result.filter((p) => (p.hourly_rate || 0) >= Number(minPrice));
    }
    if (maxPrice.trim() !== "") {
      result = result.filter((p) => (p.hourly_rate || 0) <= Number(maxPrice));
    }

    // Experience
    if (minExperience > 0) {
      result = result.filter((p) => (p.years_experience || 0) >= minExperience);
    }

    // Rating
    if (minRating > 0) {
      result = result.filter((p) => (p.rating || 0) >= minRating);
    }

    // Online only
    if (onlineOnly) {
      result = result.filter((p) => p.is_online);
    }

    // Sort logic
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "price_asc":
          return (a.hourly_rate || 0) - (b.hourly_rate || 0);
        case "price_desc":
          return (b.hourly_rate || 0) - (a.hourly_rate || 0);
        case "experience":
          return (b.years_experience || 0) - (a.years_experience || 0);
        case "completed_jobs":
          return (b.completed_jobs || 0) - (a.completed_jobs || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [
    providers,
    currentUserId,
    searchQuery,
    radiusFilter,
    minPrice,
    maxPrice,
    minExperience,
    minRating,
    onlineOnly,
    sortBy,
  ]);

  const activeCategoryMeta = CATEGORY_META[categoryKey];

  if (!cats || !cats[categoryKey]) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="size-10 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">
          {t.categoriesPage.detail.loading}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-background">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% -10%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 50%)",
        }}
      />

      {/* Header section */}
      <section className="border-b border-border/60 bg-white/70 dark:bg-card/50 backdrop-blur-md py-8">
        <Container size="xl">
          <div className="flex flex-col gap-4">
            <Link
              href={loc("/categories")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              {t.nav.categories}
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {activeCategoryMeta && (
                  <div
                    className={cn(
                      "size-14 rounded-2xl grid place-items-center bg-gradient-to-br shadow-premium shrink-0",
                      activeCategoryMeta.tone,
                    )}
                  >
                    <activeCategoryMeta.Icon className="size-7" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {t.categoriesPage.detail.titleTemplate.replace(
                      "{category}",
                      cats[categoryKey] as string,
                    )}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                    {(cats as Record<string, string>)[`${categoryKey}_desc`]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-full self-start md:self-auto">
                <Users className="size-3.5" />
                {providers.length} {t.techniciansPage.stats.activeProviders}
              </div>
            </div>

            {/* Request Action Warning Banner */}
            {isRequestAction && (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-fade-in shadow-sm">
                <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t.categoriesPage.requestBannerTitle}
                  </p>
                  <p className="text-xs text-muted-foreground leading-normal">
                    {t.categoriesPage.requestBannerText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Main Content Grid (Filters + Master listing) */}
      <section className="py-8 flex-1">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
            {/* Filters Sidebar */}
            <aside className="space-y-6 bg-white dark:bg-card border border-border/60 rounded-3xl p-5 shadow-sm self-start">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="size-4 text-muted-foreground" />
                  {t.categoriesPage.detail.filtersTitle}
                </h2>
                {(searchQuery ||
                  minPrice ||
                  maxPrice ||
                  minExperience > 0 ||
                  minRating > 0 ||
                  onlineOnly ||
                  radiusFilter !== 10) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setRadiusFilter(10);
                      setMinPrice("");
                      setMaxPrice("");
                      setMinExperience(0);
                      setMinRating(0);
                      setOnlineOnly(false);
                    }}
                    className="text-xs text-primary hover:underline font-semibold cursor-pointer"
                  >
                    {t.categoriesPage.detail.clearFilters}
                  </button>
                )}
              </div>

              {/* Sorting */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t.categoriesPage.detail.sortingLabel}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full text-xs font-semibold text-foreground border border-border bg-slate-50/50 dark:bg-muted/40 rounded-xl p-2.5 outline-none focus:border-primary transition-colors cursor-pointer"
                >
                  <option value="rating">
                    {t.categoriesPage.detail.sortOptions.ratingDesc}
                  </option>
                  <option value="price_asc">
                    {t.categoriesPage.detail.sortOptions.priceAsc}
                  </option>
                  <option value="price_desc">
                    {t.categoriesPage.detail.sortOptions.priceDesc}
                  </option>
                  <option value="experience">
                    {t.categoriesPage.detail.sortOptions.experience}
                  </option>
                  <option value="completed_jobs">
                    {t.categoriesPage.detail.sortOptions.completedJobs}
                  </option>
                </select>
              </div>

              {/* Radius filter */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t.categoriesPage.detail.searchRadiusLabel}
                  </label>
                  <span className="text-xs font-semibold text-primary">
                    {radiusFilter} km
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radiusFilter}
                  onChange={(e) => setRadiusFilter(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-100 dark:bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Hourly rate range */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t.categoriesPage.detail.hourlyRateLabel}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder={t.categoriesPage.detail.minPricePlaceholder}
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="h-9 text-xs rounded-xl text-center"
                  />
                  <Input
                    placeholder={t.categoriesPage.detail.maxPricePlaceholder}
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="h-9 text-xs rounded-xl text-center"
                  />
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    {t.categoriesPage.detail.minExperienceLabel}
                  </label>
                  <span className="text-xs font-semibold text-primary">
                    {minExperience
                      ? t.categoriesPage.detail.experienceUnit.replace(
                          "{count}",
                          String(minExperience),
                        )
                      : t.categoriesPage.detail.allLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={minExperience}
                  onChange={(e) => setMinExperience(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 bg-slate-100 dark:bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  {t.categoriesPage.detail.minRatingLabel}
                </label>
                <div className="flex gap-2">
                  {[0, 4.0, 4.5, 4.8].map((ratingVal) => (
                    <button
                      key={ratingVal}
                      onClick={() => setMinRating(ratingVal)}
                      className={cn(
                        "flex-1 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer",
                        minRating === ratingVal
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-slate-50 dark:bg-muted/40 text-foreground hover:bg-slate-100 dark:hover:bg-muted/60",
                      )}
                    >
                      {ratingVal === 0
                        ? t.categoriesPage.detail.allLabel
                        : `${ratingVal} ★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Online toggle */}
              <div className="flex items-center justify-between border-t border-border/80 pt-4">
                <label
                  htmlFor="online-filter-toggle"
                  className="text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer"
                >
                  {t.categoriesPage.detail.onlineOnlyLabel}
                </label>
                <button
                  id="online-filter-toggle"
                  onClick={() => setOnlineOnly(!onlineOnly)}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                    onlineOnly ? "bg-primary" : "bg-slate-200 dark:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                      onlineOnly ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </div>
            </aside>

            {/* Providers Listing Grid */}
            <main className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-4.5" />
                <Input
                  placeholder={t.categoriesPage.detail.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 h-12 bg-white dark:bg-card rounded-2xl border border-border/60 shadow-sm text-sm"
                />
              </div>

              {error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 p-4 text-red-700 dark:text-red-400 animate-fade-in shadow-sm">
                  <AlertCircle className="size-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{t.common.error}</p>
                    <p className="text-xs text-red-650/90 leading-normal">
                      {t.categoriesPage.detail.loadError.replace(
                        "{error}",
                        error,
                      )}
                    </p>
                  </div>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="size-10 animate-spin text-primary" />
                  <p className="mt-4 text-sm font-semibold text-muted-foreground">
                    {t.categoriesPage.detail.loading}
                  </p>
                </div>
              ) : filteredAndSortedProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed border-border rounded-3xl bg-white dark:bg-card p-12 text-center shadow-sm">
                  <div className="size-16 rounded-2xl bg-slate-50 dark:bg-muted/40 text-muted-foreground flex items-center justify-center mb-4">
                    <Search className="size-7" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {t.categoriesPage.detail.emptyTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-sm">
                    {t.categoriesPage.detail.emptyDescription}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredAndSortedProviders.map((provider) => (
                    <Card
                      key={provider.user_id}
                      className="group flex flex-col h-full overflow-hidden border border-border/60 bg-white dark:bg-card transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 hover:border-primary/20"
                    >
                      <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                        {/* Provider profile summary header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <UserAvatar
                                avatarUrl={provider.profiles?.avatar_url}
                                name={`${provider.profiles?.first_name} ${provider.profiles?.last_name}`}
                                className="size-12 rounded-xl shadow-sm"
                                fallbackClassName="rounded-xl bg-gradient-primary text-white font-bold text-base"
                              />

                              {/* Online Status Dot Badge */}
                              <span
                                className={cn(
                                  "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white dark:border-card shadow-sm",
                                  provider.is_online
                                    ? "bg-emerald-500"
                                    : "bg-slate-300 dark:bg-slate-600",
                                )}
                              />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                                {provider.profiles?.first_name}{" "}
                                {provider.profiles?.last_name}
                              </h3>
                              <span className="text-[10px] bg-slate-100 dark:bg-secondary text-slate-700 dark:text-muted-foreground px-2 py-0.5 rounded-full font-semibold border mt-0.5 inline-block">
                                {localizeCategory(provider.category, t)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-xl text-xs font-bold shadow-sm/5">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            <span>
                              {provider.rating
                                ? provider.rating.toFixed(1)
                                : "5.0"}
                            </span>
                          </div>
                        </div>

                        {/* Bio description */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                          {provider.bio || t.dashboard.noBio}
                        </p>

                        {/* Provider metadata items */}
                        <div className="grid grid-cols-2 gap-3 border-t border-b border-border/60 py-3 text-[11px] font-semibold text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock3 className="size-3.5 text-primary" />
                            <span>
                              {t.dashboard.experienceLabel}:{" "}
                              {provider.years_experience
                                ? t.categoriesPage.detail.experienceUnit.replace(
                                    "{count}",
                                    String(provider.years_experience),
                                  )
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <BriefcaseBusiness className="size-3.5 text-primary" />
                            <span>
                              {t.techniciansPage.card.jobsLabel}:{" "}
                              {provider.completed_jobs
                                ? `${provider.completed_jobs}`
                                : "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 col-span-2">
                            <MapPin className="size-3.5 text-primary shrink-0" />
                            <span className="truncate">
                              {provider.profiles?.address ||
                                t.techniciansPage.card.addressNotProvided}
                            </span>
                          </div>
                        </div>

                        {/* Price & Actions row */}
                        <div className="flex items-end justify-between gap-1.5 mt-auto pt-2">
                          <div className="min-w-0 shrink">
                            <span className="text-[10px] text-muted-foreground block font-semibold uppercase tracking-wider">
                              {t.techniciansPage.card.hourlyLabel}
                            </span>
                            <span className="text-sm font-extrabold text-foreground leading-tight">
                              {provider.hourly_rate
                                ? `${provider.hourly_rate} AZN`
                                : t.techniciansPage.card.negotiable}
                            </span>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <Button
                              onClick={() =>
                                setSelectedProviderId(provider.user_id)
                              }
                              variant="outline"
                              size="sm"
                              className="h-8 min-w-0 px-2 rounded-lg text-[11px] font-bold border-border hover:bg-slate-50 dark:hover:bg-muted/40 cursor-pointer"
                            >
                              {t.categoriesPage.viewButton}
                            </Button>
                            <Button
                              onClick={() =>
                                router.push(
                                  `/chat?recipient=${provider.user_id}`,
                                )
                              }
                              variant="premium"
                              size="sm"
                              className="h-8 min-w-0 px-2 rounded-lg text-[11px] font-bold gap-1 cursor-pointer"
                            >
                              <MessageSquare className="size-3 shrink-0" />
                              {t.categoriesPage.requestButton}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </main>
          </div>
        </Container>
      </section>

      {/* Provider Details Dialog Modal */}
      <Dialog
        open={selectedProviderId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedProviderId(null);
        }}
      >
        <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-3xl p-6 border-border shadow-premium-lg">
          {selectedProvider && (
            <div className="flex flex-col gap-6">
              {/* Header profile info */}
              <DialogHeader className="flex flex-col gap-4 border-b border-border/80 pb-4 text-left">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                      <UserAvatar
                        avatarUrl={selectedProvider.profiles?.avatar_url}
                        name={`${selectedProvider.profiles?.first_name} ${selectedProvider.profiles?.last_name}`}
                        className="size-14 rounded-2xl shadow-glow-primary"
                        fallbackClassName="rounded-2xl bg-gradient-primary text-white font-bold text-xl"
                      />

                      <span
                        className={cn(
                          "absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-white dark:border-card shadow-sm",
                          selectedProvider.is_online
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-600",
                        )}
                      />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-foreground">
                        {selectedProvider.profiles?.first_name}{" "}
                        {selectedProvider.profiles?.last_name}
                      </DialogTitle>
                      <DialogDescription className="text-xs font-semibold text-muted-foreground mt-0.5">
                        {localizeCategory(selectedProvider.category, t)} ·{" "}
                        {selectedProvider.distance
                          ? `${t.dashboard.distance.replace(
                              "{distance}",
                              String(selectedProvider.distance),
                            )}`
                          : "Baku"}
                      </DialogDescription>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-2xl text-sm font-extrabold shadow-sm/5">
                    <Star className="size-4 fill-amber-500 text-amber-500" />
                    <span>
                      {selectedProvider.rating
                        ? selectedProvider.rating.toFixed(1)
                        : "5.0"}
                    </span>
                  </div>
                </div>

                {/* Call/Message quick CTA buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 rounded-xl font-bold cursor-pointer"
                  >
                    <a href={`tel:${selectedProvider.profiles?.phone}`}>
                      <Phone className="mr-2 size-4 text-emerald-500" />
                      {t.dashboard.call}
                    </a>
                  </Button>
                  <Button
                    onClick={() =>
                      router.push(loc(`/chat?recipient=${selectedProvider.user_id}`))
                    }
                    variant="premium"
                    className="h-10 rounded-xl font-bold cursor-pointer"
                  >
                    <MessageSquare className="mr-2 size-4" />
                    {t.dashboard.chat}
                  </Button>
                </div>
              </DialogHeader>

              {/* Bio & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-6">
                {/* About & Bio */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t.dashboard.aboutLabel}
                    </h4>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {selectedProvider.bio || t.dashboard.noBio}
                    </p>
                  </div>

                  {/* Real reviews listing */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {t.dashboard.customerReviews} ({reviews.length})
                    </h4>

                    {reviewsLoading ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
                        <Loader2 className="size-4 animate-spin text-primary" />
                        <span>{t.categoriesPage.detail.reviewsLoading}</span>
                      </div>
                    ) : reviews.length === 0 ? (
                      <p className="text-xs text-muted-foreground border border-dashed border-border rounded-xl bg-slate-50/50 dark:bg-muted/30 p-4">
                        {t.dashboard.noReviewsYet}
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                        {reviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-xl border border-border bg-slate-50/50 dark:bg-muted/30 p-3 flex flex-col gap-1.5"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-foreground">
                                {review.customer
                                  ? `${review.customer.first_name} ${review.customer.last_name}`
                                  : t.bookings.customerGeneric}
                              </span>
                              <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                                <Star className="size-3 fill-amber-500 text-amber-500" />
                                <span>{review.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            {review.comment && (
                              <p className="text-xs text-foreground/75 leading-relaxed bg-white dark:bg-card border border-border/40 rounded-lg p-2 mt-0.5">
                                {review.comment}
                              </p>
                            )}
                            <span className="text-[9px] text-muted-foreground text-right block">
                              {new Date(
                                review.created_at,
                              ).toLocaleDateString(locale)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar details info box */}
                <div className="space-y-4 bg-slate-50 dark:bg-muted/30 border border-border/80 rounded-2xl p-4 self-start">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                      {t.techniciansPage.card.hourlyLabel}
                    </span>
                    <span className="text-lg font-black text-foreground">
                      {selectedProvider.hourly_rate
                        ? `${selectedProvider.hourly_rate} AZN`
                        : t.techniciansPage.card.negotiable}
                    </span>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-2 text-xs font-semibold text-foreground/80">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        {t.dashboard.radius}:
                      </span>
                      <span>{selectedProvider.working_radius_km} km</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        {t.dashboard.experienceLabel}:
                      </span>
                      <span>
                        {selectedProvider.years_experience
                          ? t.categoriesPage.detail.experienceUnit.replace(
                              "{count}",
                              String(selectedProvider.years_experience),
                            )
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        {t.dashboard.completedJobsLabel}:
                      </span>
                      <span>
                        {selectedProvider.completed_jobs
                          ? `${selectedProvider.completed_jobs}`
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">
                        {t.categoriesPage.detail.verificationLabel ??
                          t.dashboard.verified}:
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                        <ShieldCheck className="size-3.5 fill-emerald-100" />
                        {t.categoriesPage.detail.activeStatus ?? t.common.active}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-border/60" />

                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                      {t.dashboard.addressLabel}
                    </span>
                    <p className="text-xs leading-normal font-semibold text-foreground/85">
                      {selectedProvider.profiles?.address ||
                        t.profileMenu.notProvided}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
