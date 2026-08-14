"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { supabase } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Profile, ProviderDetails, ProviderReview } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Star,
  Phone,
  MessageSquare,
  MapPin,
  ShieldCheck,
  Clock3,
  BriefcaseBusiness,
  Activity,
  User,
  Heart,
  Loader2,
  ChevronRight,
  Award,
  CheckCircle2,
  Camera,
  ArrowUpRight,
  FileCheck2,
  CircleDollarSign,
  Share2,
  CalendarClock,
  Navigation,
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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

type ReviewAuthor = Pick<Profile, "id" | "first_name" | "last_name">;
type ProviderReviewWithCustomer = ProviderReview & {
  customer: ReviewAuthor | null;
};

type ProviderWithProfile = ProviderDetails & {
  profiles: Profile | null;
  distance?: number;
};

export default function TechnicianProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const resolvedParams = React.use(params);
  const providerId = resolvedParams.id;

  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState<ProviderWithProfile | null>(null);
  const [relatedProviders, setRelatedProviders] = useState<
    ProviderWithProfile[]
  >([]);
  const [reviews, setReviews] = useState<ProviderReviewWithCustomer[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<
    Profile["role"] | null
  >(null);

  // Review composer
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const loadProfile = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();
          if (profile?.role) setCurrentUserRole(profile.role);
        }

        const { data: provRow, error: provErr } = await supabase
          .from("provider_details")
          .select("*")
          .eq("user_id", id)
          .single();

        if (provErr || !provRow) {
          router.replace(loc("/technicians"));
          return;
        }

        const { data: profileRow } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        const coords = getStableCoordinates(id);
        const distance = calculateDistance(
          USER_COORDINATES.lat,
          USER_COORDINATES.lng,
          coords.lat,
          coords.lng,
        );

        setProvider({
          ...(provRow as ProviderDetails),
          profiles: (profileRow as Profile) ?? null,
          distance: Number(distance.toFixed(1)),
        });

        // Load related providers (same category, exclude current)
        const { data: relatedRows } = await supabase
          .from("provider_details")
          .select("*")
          .eq("category", (provRow as ProviderDetails).category)
          .eq("profile_status", "APPROVED")
          .neq("user_id", id)
          .limit(4);

        if (relatedRows && relatedRows.length > 0) {
          const rIds = relatedRows.map((r) => r.user_id);
          const { data: rProfiles } = await supabase
            .from("profiles")
            .select("*")
            .in("id", rIds);
          const rpMap = Object.fromEntries(
            ((rProfiles || []) as Profile[]).map((p) => [p.id, p]),
          );

          const related = (relatedRows as ProviderDetails[]).map((rp) => {
            const rc = getStableCoordinates(rp.user_id);
            const rd = calculateDistance(
              USER_COORDINATES.lat,
              USER_COORDINATES.lng,
              rc.lat,
              rc.lng,
            );
            return {
              ...rp,
              profiles: rpMap[rp.user_id] ?? null,
              distance: Number(rd.toFixed(1)),
            } as ProviderWithProfile;
          });
          related.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          setRelatedProviders(related);
        }
      } catch (err) {
        console.error("Usta profili yüklənərkən xəta:", err);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const loadReviews = useCallback(
    async (id: string) => {
      setReviewsLoading(true);
      setReviewError(null);
      try {
        const { data: reviewRows, error } = await supabase
          .from("provider_reviews")
          .select("*")
          .eq("provider_id", id)
          .order("updated_at", { ascending: false });

        const missingTable =
          error && (
            error.code === "42P01" ||
            error.code === "PGRST205" ||
            (typeof error.message === "string" && error.message.includes("Could not find the table"))
          );
        if (error && !missingTable) throw error;
        if (!reviewRows) {
          setReviews([]);
          return;
        }

        const customerIds = Array.from(
          new Set(reviewRows.map((r) => r.customer_id).filter(Boolean)),
        ) as string[];
        let customerMap: Record<string, ReviewAuthor> = {};
        if (customerIds.length > 0) {
          const { data: cp } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .in("id", customerIds);
          if (cp)
            customerMap = Object.fromEntries(
              cp.map((p) => [p.id, p as ReviewAuthor]),
            );
        }

        const formatted = (reviewRows as ProviderReview[]).map((r) => ({
          ...r,
          customer: customerMap[r.customer_id] ?? null,
        })) as ProviderReviewWithCustomer[];

        setReviews(formatted);

        // Pre-fill own review if exists
        if (currentUserId) {
          const own = formatted.find((r) => r.customer_id === currentUserId);
          if (own) {
            setReviewRating(own.rating);
            setReviewComment(own.comment || "");
          }
        }
      } catch (err) {
        console.error("Rəylər yüklənərkən xəta:", err);
      } finally {
        setReviewsLoading(false);
      }
    },
    [currentUserId],
  );

  useEffect(() => {
    void loadProfile(providerId);
  }, [providerId, loadProfile]);

  useEffect(() => {
    if (providerId) void loadReviews(providerId);
  }, [providerId, loadReviews]);

  const canReview = Boolean(currentUserId && currentUserRole === "CUSTOMER");
  const ownReview = useMemo(
    () => reviews.find((r) => r.customer_id === currentUserId) || null,
    [reviews, currentUserId],
  );

  const reviewStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total,
        avg: provider?.rating ? Number(provider.rating.toFixed(1)) : "5.0",
        distribution: [0, 0, 0, 0, 0] as number[],
      };
    }
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const dist: number[] = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const idx = Math.min(4, Math.max(0, Math.round(r.rating) - 1));
      dist[idx]++;
    });
    return { total, avg: (sum / total).toFixed(1), distribution: dist };
  }, [reviews, provider]);

  const handleSubmitReview = async () => {
    if (!canReview) {
      setReviewError(t.dashboard.reviewRequiredRole);
      return;
    }
    const trimmed = reviewComment.trim();
    if (trimmed.length < 3) {
      setReviewError(t.dashboard.reviewMinLength);
      return;
    }
    setSavingReview(true);
    setReviewError(null);
    try {
      if (ownReview) {
        const { error } = await supabase
          .from("provider_reviews")
          .update({ rating: reviewRating, comment: trimmed })
          .eq("id", ownReview.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("provider_reviews").insert({
          provider_id: providerId,
          customer_id: currentUserId!,
          rating: reviewRating,
          comment: trimmed,
        });
        if (error) throw error;
      }
      await loadReviews(providerId);
      await loadProfile(providerId);
    } catch (err) {
      console.error("Rəy göndərilərkən xəta:", err);
      setReviewError(t.dashboard.reviewSaveError);
    } finally {
      setSavingReview(false);
    }
  };

  if (loading || !provider) {
    return <ProfileSkeleton />;
  }

  const isFav = isFavorite(provider.user_id);
  const fullName =
    `${provider.profiles?.first_name} ${provider.profiles?.last_name}`.trim();
  const displayRating =
    (Number(reviewStats.avg) || Number(provider.rating) || 5).toFixed(1);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60">
      {/* Ambient background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 0%, oklch(0.7900 0.1400 70.00 / 0.10), transparent 45%), radial-gradient(circle at 90% 12%, oklch(0.6231 0.1880 41.11 / 0.06), transparent 40%)",
        }}
      />

      {/* Back breadcrumb */}
      <section className="pt-8 pb-4">
        <Container size="xl">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link
              href={loc("/technicians")}
              className="group inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
              Bütün ustalara qayıt
            </Link>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => toggleFavorite(provider.user_id)}
                variant="outline"
                size="sm"
                className={cn(
                  "h-9 rounded-xl gap-1.5 text-xs font-bold border-border",
                  isFav &&
                    "border-rose-200 text-rose-500 bg-rose-50 hover:bg-rose-50",
                )}
              >
                <Heart className={cn("size-4", isFav && "fill-current")} />
                {isFav ? "Favoritlərdədir" : "Favoritlərə əlavə et"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl gap-1.5 text-xs font-bold border-border"
                onClick={() => {
                  if (navigator.share) {
                    void navigator.share({
                      title: `HəllVar - ${fullName}`,
                      text: `${provider.category} ustası ${fullName} - HəllVar`,
                      url: window.location.href,
                    });
                  }
                }}
              >
                <Share2 className="size-4" />
                Paylaş
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== PROFILE HEADER / HERO ===== */}
      <section className="pb-6 sm:pb-10">
        <Container size="xl">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-white shadow-premium">
            {/* Gradient Banner */}
            <div className="relative h-44 sm:h-56 bg-gradient-primary overflow-hidden">
              <div
                aria-hidden
                className="absolute -top-20 -right-16 size-72 rounded-full bg-white/20 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-28 left-1/4 size-80 rounded-full bg-white/10 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute top-0 right-1/3 size-44 rounded-full bg-accent/40 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -left-24 -top-28 size-80 rounded-full border-[3px] border-white/10"
              />
              <div
                aria-hidden
                className="absolute -left-10 -top-14 size-56 rounded-full border-2 border-white/10"
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:28px_28px]" />
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            <div className="p-5 sm:p-8 -mt-20 sm:-mt-28 relative">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                {/* Avatar + Name */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-5 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      aria-hidden
                      className="absolute -inset-1.5 rounded-[22px] bg-gradient-primary opacity-90 blur-md"
                    />
                    <UserAvatar
                      avatarUrl={provider.profiles?.avatar_url}
                      name={fullName}
                      className="relative size-28 sm:size-36 rounded-3xl border-4 border-white shadow-premium-lg"
                      fallbackClassName="rounded-3xl bg-white text-foreground text-4xl sm:text-5xl font-black"
                    />
                    <span
                      className={cn(
                        "absolute bottom-2 right-2 size-5 rounded-full border-4 border-white shadow-sm",
                        provider.is_online ? "bg-emerald-500" : "bg-slate-300",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                      {provider.profile_status === "APPROVED" && (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 rounded-full text-[11px] font-bold">
                          <ShieldCheck className="size-3.5 mr-1" />
                          ŞV Təsdiqlənib
                        </Badge>
                      )}
                      <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full text-[11px] font-bold">
                        {provider.category}
                      </Badge>
                      {provider.documents_uploaded && (
                        <Badge className="bg-sky-50 text-sky-600 border-sky-200 rounded-full text-[11px] font-bold">
                          <FileCheck2 className="size-3.5 mr-1" />
                          Sənədlər yüklənib
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      {fullName}
                    </h1>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded-lg text-xs font-black">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span className="tabular-nums">{displayRating}</span>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                          ({reviewStats.total} rəy)
                        </span>
                      </div>
                      <span className="size-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        <span className="tabular-nums">{provider.distance} km</span>
                        məsafədə
                      </div>
                      <span className="size-1 rounded-full bg-border" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Navigation className="size-3.5 text-primary" />
                        <span className="tabular-nums">{provider.working_radius_km} km</span>
                        işləyir
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price + CTA Buttons */}
                <div className="flex flex-col gap-3 sm:min-w-[300px]">
                  <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-4">
                    <div
                      aria-hidden
                      className="absolute -right-8 -top-12 size-32 rounded-full bg-primary/50 blur-2xl"
                    />
                    <div
                      aria-hidden
                      className="absolute -left-6 -bottom-14 size-28 rounded-full bg-accent/30 blur-2xl"
                    />
                    <div className="relative flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">
                          Saatlıq Qiymət
                        </div>
                        <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5 tabular-nums">
                          {provider.hourly_rate ? (
                            <>
                              {provider.hourly_rate}
                              <span className="text-lg font-bold text-white/55 ml-1">
                                ₼
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl">Danışıqla</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={cn(
                            "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black ring-1",
                            provider.is_online
                              ? "bg-emerald-400/15 text-emerald-300 ring-emerald-300/25"
                              : "bg-white/10 text-white/60 ring-white/10",
                          )}
                        >
                          <Activity className="size-3" />
                          {provider.is_online
                            ? t.dashboard.onlineNow
                            : t.dashboard.offlineNow}
                        </span>
                        <span className="text-[10px] font-semibold text-white/45">
                          {provider.hourly_rate
                            ? "saat üçün · danışıqla mümkündür"
                            : "qiymət üçün əlaqə saxlayın"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 rounded-xl font-bold border-border hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-600"
                    >
                      <a href={`tel:${provider.profiles?.phone}`}>
                        <Phone className="size-4 mr-1.5 text-emerald-500" />
                        {t.dashboard.call}
                      </a>
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(loc(`/chat?recipient=${provider.user_id}`))
                      }
                      variant="premium"
                      className="h-11 rounded-xl font-bold gap-1.5 shadow-glow-primary"
                    >
                      <MessageSquare className="size-4" />
                      {t.dashboard.chat}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="pb-8 sm:pb-10">
        <Container size="xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard
              Icon={Star}
              tone="from-amber-400/20 to-yellow-500/10 text-amber-600"
              label="Orta Reytinq"
              value={displayRating}
              sub={`${reviewStats.total} rəy əsasında`}
            />
            <MetricCard
              Icon={BriefcaseBusiness}
              tone="from-orange-400/20 to-amber-500/10 text-orange-600"
              label="Tamamlanmış İş"
              value={String(provider.completed_jobs || 0)}
              sub="Təcrübə nişanı"
            />
            <MetricCard
              Icon={Clock3}
              tone="from-sky-400/20 to-blue-500/10 text-sky-600"
              label="İş Təcrübəsi"
              value={
                provider.years_experience
                  ? `${provider.years_experience} il`
                  : "—"
              }
              sub="Peşəkar təcrübə"
            />
            <MetricCard
              Icon={MapPin}
              tone="from-emerald-400/20 to-green-500/10 text-emerald-600"
              label="Ünvan"
              value={provider.profiles?.address ? "Bakı" : "—"}
              sub={provider.profiles?.address || "Ünvan qeyd edilməyib"}
              truncate
            />
          </div>
        </Container>
      </section>

      {/* ===== MAIN 2 COLUMN LAYOUT ===== */}
      <section className="pb-12">
        <Container size="xl">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8">
            {/* LEFT COLUMN */}
            <div className="space-y-6 order-last lg:order-none">
              {/* About */}
              <Card className="border-border/60">
                <CardContent className="p-5 sm:p-6">
                  <SectionHeader
                    Icon={User}
                    title={t.dashboard.aboutLabel}
                    subtitle="Usta özü haqqında"
                  />
                  <p className="text-sm leading-7 text-foreground/80 whitespace-pre-line">
                    {provider.bio ||
                      `Bu usta haqqında ətraflı məlumat hələ əlavə edilməyib. ${provider.category} sahəsində peşəkar xidmət göstərir.`}
                  </p>
                </CardContent>
              </Card>

              {/* Gallery */}
              <Card className="border-border/60">
                <CardContent className="p-5 sm:p-6">
                  <SectionHeader
                    Icon={Camera}
                    title="İşdən Nümunələr"
                    subtitle="Son tamamlanmış layihələrdən seçmə"
                    action={
                      <Badge className="bg-muted text-muted-foreground rounded-full text-[10px] font-bold">
                        6 şəkil
                      </Badge>
                    }
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      "photo-1621905251189-08b45d6a269e",
                      "photo-1504307651254-35680f356dfd",
                      "photo-1527515637462-cff94eecc1ac",
                      "photo-1585338107529-13afc5f02586",
                      "photo-1588508065123-287b28e013da",
                      "photo-1581578731548-c64695cc6952",
                    ].map((id, i) => (
                      <div
                        key={i}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-border/60"
                      >
                        <img
                          src={`https://images.unsplash.com/${id}?q=80&w=400&auto=format&fit=crop`}
                          alt={`İş nümunəsi ${i + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-white">
                            <Camera className="size-3" />
                            İş nümunəsi {i + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact / Service Info */}
              <Card className="border-border/60">
                <CardContent className="p-5 sm:p-6">
                  <SectionHeader
                    Icon={CalendarClock}
                    title="Əlaqə və Xidmət Məlumatları"
                    subtitle="Usta ilə əlaqə və xidmət şərtləri"
                  />

                  <div className="grid sm:grid-cols-2 gap-3">
                    <InfoRow
                      Icon={Phone}
                      label="Telefon"
                      value={provider.profiles?.phone || "-"}
                      href={`tel:${provider.profiles?.phone}`}
                    />
                    <InfoRow
                      Icon={MapPin}
                      label="Ünvan"
                      value={
                        provider.profiles?.address || "Ünvan qeyd edilməyib"
                      }
                    />
                    <InfoRow
                      Icon={CircleDollarSign}
                      label="Qiymət Aralığı"
                      value={
                        provider.hourly_rate
                          ? `${provider.hourly_rate} ₼ / saat`
                          : "Danışıqla"
                      }
                    />
                    <InfoRow
                      Icon={Navigation}
                      label="İş Radiusu"
                      value={`${provider.working_radius_km} km`}
                    />
                    <InfoRow
                      Icon={Award}
                      label="Kateqoriya"
                      value={provider.category}
                    />
                    <InfoRow
                      Icon={CheckCircle2}
                      label="Sənədlər"
                      value={
                        provider.documents_uploaded
                          ? "Təsdiqlənmiş"
                          : "Gözləmədə"
                      }
                      success={provider.documents_uploaded}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* REVIEWS */}
              <Card className="border-border/60">
                <CardContent className="p-5 sm:p-6">
                  {reviewStats.total > 0 ? (
                    <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-slate-50 to-white p-5 sm:p-6 mb-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
                      {/* Big average */}
                      <div className="flex items-center gap-4 sm:flex-col sm:items-start sm:gap-1">
                        <div className="text-5xl font-black tracking-tight text-foreground tabular-nums leading-none">
                          {reviewStats.avg}
                        </div>
                        <div>
                          <div className="flex items-center gap-0.5 mt-1 sm:mt-2">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "size-4",
                                  i <= Math.round(Number(reviewStats.avg))
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-200 text-slate-200",
                                )}
                              />
                            ))}
                          </div>
                          <div className="text-xs font-semibold text-muted-foreground mt-1.5 sm:mt-1 tabular-nums">
                            {reviewStats.total} rəy ·{" "}
                            {t.dashboard.customerReviews}
                          </div>
                        </div>
                      </div>

                      {/* Distribution */}
                      <div className="space-y-1.5">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviewStats.distribution[stars - 1];
                          const pct = (count / reviewStats.total) * 100;
                          return (
                            <div
                              key={stars}
                              className="flex items-center gap-2.5"
                            >
                              <span className="text-[11px] font-bold w-7 shrink-0 flex items-center gap-0.5">
                                {stars}
                                <Star className="size-2.5 fill-amber-400 text-amber-400" />
                              </span>
                              <div className="flex-1 h-1.5 rounded-full bg-slate-200/80 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground w-6 shrink-0 text-right tabular-nums">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <SectionHeader
                      Icon={Star}
                      title="Müştəri Rəyləri"
                      subtitle="Hələ heç bir rəy yoxdur"
                      action={
                        <Badge className="bg-muted text-muted-foreground rounded-full text-[10px] font-bold">
                          {reviewStats.total} rəy
                        </Badge>
                      }
                    />
                  )}

                  {/* Review Composer */}
                  <div className="rounded-2xl border border-border bg-slate-50/50 p-4 sm:p-5 mb-6">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="text-sm font-bold tracking-tight">
                        {ownReview ? "Rəyinizi yeniləyin" : "Sizin rəyiniz"}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setReviewRating(val)}
                            disabled={!canReview || savingReview}
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition disabled:opacity-60 disabled:cursor-not-allowed",
                              val <= reviewRating
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-border bg-white text-muted-foreground",
                            )}
                          >
                            <Star
                              className={cn(
                                "size-3.5",
                                val <= reviewRating
                                  ? "fill-amber-400 text-amber-400"
                                  : "",
                              )}
                            />
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder={t.dashboard.reviewPlaceholder}
                      disabled={!canReview || savingReview}
                      className="w-full min-h-24 rounded-xl border border-input bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    {reviewError ? (
                      <p className="mt-3 text-xs font-semibold text-red-600">
                        {reviewError}
                      </p>
                    ) : !canReview ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {t.dashboard.reviewAuthHint}
                      </p>
                    ) : null}

                    <Button
                      type="button"
                      onClick={handleSubmitReview}
                      disabled={!canReview || savingReview}
                      variant="premium"
                      className="mt-4 h-10 rounded-xl px-5 text-xs font-bold gap-1.5"
                    >
                      {savingReview ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : ownReview ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <MessageSquare className="size-3.5" />
                      )}
                      {savingReview
                        ? "Göndərilir..."
                        : ownReview
                          ? t.dashboard.updateReview
                          : t.dashboard.submitReview}
                    </Button>
                  </div>

                  {/* Reviews List */}
                  {reviewsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t.common.loading}</span>
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border bg-slate-50 p-8 text-center">
                      <div className="size-12 rounded-2xl bg-muted grid place-items-center mx-auto mb-3 text-muted-foreground">
                        <Star className="size-6" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        {t.dashboard.noReviewsYet}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Bu ustaya ilk rəy yazan siz olun!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-premium"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                                {review.customer?.first_name?.[0] || "M"}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-foreground truncate">
                                  {review.customer
                                    ? `${review.customer.first_name} ${review.customer.last_name}`
                                    : "Anonim Müştəri"}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground mt-0.5">
                                  <Clock3 className="size-3" />
                                  {new Date(
                                    review.updated_at,
                                  ).toLocaleDateString("az-AZ")}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg text-xs font-black shrink-0">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              <span className="tabular-nums">
                                {review.rating.toFixed(1)}
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm leading-7 text-foreground/80 bg-slate-50/60 rounded-xl p-3 border border-border/50">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN (Sticky) */}
            <div className="space-y-6 lg:sticky lg:top-28 self-start order-first lg:order-none">
              {/* Quick Booking Summary */}
              <Card className="border-border/60 overflow-hidden">
                <div className="relative overflow-hidden bg-gradient-primary p-5 text-white">
                  <div
                    aria-hidden
                    className="absolute -right-8 -top-10 size-28 rounded-full bg-white/15 blur-2xl"
                  />
                  <div
                    aria-hidden
                    className="absolute -left-6 -bottom-12 size-24 rounded-full bg-white/10 blur-2xl"
                  />
                  <div className="relative flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-white/15 ring-1 ring-white/25 grid place-items-center backdrop-blur-sm shrink-0">
                      <CalendarClock className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg tracking-tight leading-none">
                        Xidmət Sifarişi
                      </h3>
                      <p className="text-[11px] text-white/80 mt-1">
                        Sürətli və birbaşa əlaqə
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-semibold">
                        Saatlıq qiymət
                      </span>
                      <span className="font-black text-foreground tabular-nums">
                        {provider.hourly_rate
                          ? `${provider.hourly_rate} ₼`
                          : "Danışıqla"}
                      </span>
                    </div>
                    <div className="h-px bg-border/60" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-semibold">
                        Məsafə
                      </span>
                      <span className="font-bold text-foreground tabular-nums">
                        {provider.distance} km
                      </span>
                    </div>
                    <div className="h-px bg-border/60" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-semibold">
                        Status
                      </span>
                      <span
                        className={cn(
                          "flex items-center gap-1 font-bold text-[11px] px-2.5 py-1 rounded-full",
                          provider.is_online
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-600",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            provider.is_online
                              ? "bg-emerald-500"
                              : "bg-slate-400",
                          )}
                        />
                        {provider.is_online
                          ? t.dashboard.onlineNow
                          : t.dashboard.offlineNow}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2.5">
                    <Button
                      asChild
                      className="w-full h-11 rounded-xl font-bold"
                      variant="outline"
                    >
                      <a href={`tel:${provider.profiles?.phone}`}>
                        <Phone className="size-4 mr-1.5 text-emerald-500" />
                        Zəng Et
                      </a>
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(loc(`/chat?recipient=${provider.user_id}`))
                      }
                      variant="premium"
                      className="w-full h-11 rounded-xl font-bold gap-1.5 shadow-glow-primary"
                    >
                      <MessageSquare className="size-4" />
                      Sifariş Üçün Yaz
                    </Button>
                  </div>

                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-3">
                    <Clock3 className="size-3.5 shrink-0" />
                    Usta adətən 5 dəqiqə ərzində cavab verir
                  </p>
                </CardContent>
              </Card>

              {/* Verified Badge */}
              <Card className="border-emerald-200 bg-emerald-50/40">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="size-11 rounded-xl bg-emerald-100 border border-emerald-200 grid place-items-center shrink-0 text-emerald-600 shadow-sm">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-800">
                      Təsdiqlənmiş Usta
                    </h4>
                    <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
                      Sənədlər və şəxsiyyət məlumatları HəllVar komandası
                      tərəfindən yoxlanıb təsdiqlənib. Etibarlı seçim!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== RELATED / SIMILAR PROVIDERS ===== */}
      {relatedProviders.length > 0 && (
        <section className="pb-16 sm:pb-20">
          <Container size="xl">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <Badge className="bg-primary/10 text-primary border-primary/20 rounded-full text-[11px] font-bold mb-2">
                  <ChevronRight className="size-3.5 mr-1" />
                  Oxşar Ustalar
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Eyni kateqoriyada digər peşəkarlar
                </h2>
              </div>
              <Link
                href={loc("/technicians")}
                className="group hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Hamısını gör
                <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedProviders.map((rp) => (
                <RelatedCard
                  key={rp.user_id}
                  provider={rp}
                  onClick={() => router.push(loc(`/technicians/${rp.user_id}`))}
                  onChat={() => router.push(loc(`/chat?recipient=${rp.user_id}`))}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}

/* ========= COMPONENTS ========= */

function MetricCard({
  Icon,
  tone,
  label,
  value,
  sub,
  truncate,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  tone: string;
  label: string;
  value: string;
  sub: string;
  truncate?: boolean;
}) {
  return (
    <Card className="group border-border/60 bg-white shadow-sm transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-0.5 hover:border-primary/20">
      <CardContent className="p-4 sm:p-5 flex items-center gap-4">
        <div
          className={cn(
            "size-12 rounded-2xl grid place-items-center bg-gradient-to-br ring-1 ring-black/5 shadow-sm shrink-0 transition-transform duration-300 group-hover:scale-105",
            tone,
          )}
        >
          <Icon className="size-5.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-0.5 tabular-nums">
            {value}
          </div>
          <div
            className={cn(
              "text-xs text-muted-foreground mt-1 leading-tight",
              truncate && "truncate",
            )}
            title={sub}
          >
            {sub}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  Icon,
  label,
  value,
  href,
  success,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  success?: boolean;
}) {
  const content = (
    <div className="group/info flex items-center gap-3.5 rounded-2xl border border-border/70 bg-white px-4 py-3.5 transition-all duration-200 hover:border-primary/25 hover:shadow-sm">
      <div className="size-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 text-primary ring-1 ring-primary/10 grid place-items-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div
          className={cn(
            "text-sm font-bold mt-0.5 truncate",
            success ? "text-emerald-600" : "text-foreground",
          )}
          title={value}
        >
          {value}
        </div>
      </div>
      {href ? (
        <ArrowUpRight className="size-4 text-muted-foreground/60 group-hover/info:text-primary transition-colors shrink-0" />
      ) : null}
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  );
}

function RelatedCard({
  provider,
  onClick,
  onChat,
}: {
  provider: ProviderWithProfile;
  onClick: () => void;
  onChat: () => void;
}) {
  return (
    <Card className="group flex flex-col h-full overflow-hidden border border-border/60 bg-white transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1 hover:border-primary/20 cursor-pointer">
      <div onClick={onClick} className="flex-1">
        <CardContent className="p-5 flex flex-col gap-4 h-full">
          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0">
              <div className="size-11 rounded-2xl bg-gradient-primary text-white flex items-center justify-center font-black text-base shadow-sm">
                {provider.profiles?.first_name?.[0]}
                {provider.profiles?.last_name?.[0]}
              </div>
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white shadow-sm",
                  provider.is_online ? "bg-emerald-500" : "bg-slate-300",
                )}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                {provider.profiles?.first_name} {provider.profiles?.last_name}
              </h3>
              <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-muted-foreground">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                <span className="tabular-nums">
                  {provider.rating?.toFixed(1) || "5.0"}
                </span>
                <span className="mx-1">·</span>
                <span className="truncate">{provider.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
            <MapPin className="size-3 text-primary shrink-0" />
            <span className="truncate">
              {provider.profiles?.address || "Bakı"}
            </span>
            <span>·</span>
            <span className="shrink-0 tabular-nums">{provider.distance} km</span>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Qiymət
              </div>
              <div className="text-base font-black text-foreground tabular-nums">
                {provider.hourly_rate
                  ? `${provider.hourly_rate} ₼`
                  : "Danışıqla"}
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="px-5 pb-5 pt-0" onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={onChat}
          variant="premium"
          size="sm"
          className="w-full h-9 rounded-xl text-xs font-bold gap-1.5 shadow-glow-primary"
        >
          <MessageSquare className="size-3.5" />
          Əlaqə Saxla
        </Button>
      </div>
    </Card>
  );
}

function SectionHeader({
  Icon,
  title,
  subtitle,
  action,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="size-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/15 text-primary ring-1 ring-primary/10 grid place-items-center shrink-0">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/60">
      <div className="pt-8 pb-4">
        <Container size="xl">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Skeleton className="h-4 w-40" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-36 rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
        </Container>
      </div>

      <section className="pt-6 pb-6 sm:pb-10">
        <Container size="xl">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-white shadow-premium">
            <Skeleton className="h-44 sm:h-56 w-full rounded-none bg-gradient-primary/10" />
            <div className="p-5 sm:p-8 -mt-20 sm:-mt-28 relative">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                  <Skeleton className="size-28 sm:size-36 rounded-3xl border-4 border-white shrink-0" />
                  <div className="flex-1 min-w-0 space-y-3 pt-14 sm:pt-16 pb-1">
                    <Skeleton className="h-6 w-64 max-w-full" />
                    <Skeleton className="h-4 w-52 max-w-full" />
                    <Skeleton className="h-4 w-40 max-w-full" />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:min-w-[300px]">
                  <Skeleton className="h-24 rounded-2xl" />
                  <div className="grid grid-cols-2 gap-2.5">
                    <Skeleton className="h-11 rounded-xl" />
                    <Skeleton className="h-11 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container size="xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </Container>
    </div>
  );
}
