"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { supabase } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Profile, ProviderDetails, ProviderReview } from "@/lib/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ImageIcon,
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
  const { t } = useI18n();
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
          router.replace("/technicians");
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-12 space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">
          Usta profili yüklənir...
        </p>
      </div>
    );
  }

  const isFav = isFavorite(provider.user_id);
  const fullName =
    `${provider.profiles?.first_name} ${provider.profiles?.last_name}`.trim();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 0%, oklch(0.7900 0.1400 70.00 / 0.08), transparent 50%)",
        }}
      />

      {/* Back breadcrumb */}
      <section className="pt-8 pb-4">
        <Container size="xl">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Link
              href="/technicians"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
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
          <Card className="border-border/60 overflow-hidden shadow-premium">
            {/* Gradient Banner */}
            <div className="relative h-40 sm:h-52 bg-gradient-primary">
              <div
                className="absolute inset-0 opacity-40 mix-blend-overlay"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.25) 0, transparent 45%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0, transparent 45%)",
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
            </div>

            <CardContent className="p-5 sm:p-8 -mt-20 sm:-mt-28 relative">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                {/* Avatar + Name */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                  <div className="relative">
                    <UserAvatar
                      avatarUrl={provider.profiles?.avatar_url}
                      name={fullName}
                      className="size-28 sm:size-36 rounded-3xl border-4 border-white shadow-premium-lg"
                      fallbackClassName="rounded-3xl bg-white text-foreground text-4xl sm:text-5xl font-black"
                    />
                    <span
                      className={cn(
                        "absolute bottom-2 right-2 size-5 rounded-full border-4 border-white shadow-sm",
                        provider.is_online
                          ? "bg-emerald-500"
                          : "bg-slate-300",
                      )}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
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
                      {provider.is_online ? (
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 rounded-full text-[11px] font-bold">
                          <Activity className="size-3.5 mr-1" />
                          {t.dashboard.onlineNow}
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-50 text-slate-600 border-slate-200 rounded-full text-[11px] font-bold">
                          <Activity className="size-3.5 mr-1" />
                          {t.dashboard.offlineNow}
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                      {fullName}
                    </h1>

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Star className="size-4.5 fill-amber-400 text-amber-400" />
                        <span className="text-base font-black text-foreground">
                          {Number(reviewStats.avg) ||
                            provider.rating?.toFixed(1) ||
                            "5.0"}
                        </span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          ({reviewStats.total || 0} rəy)
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-4 w-px" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <MapPin className="size-4 text-primary" />
                        {provider.distance} km məsafədə
                      </div>
                      <Separator orientation="vertical" className="h-4 w-px" />
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Navigation className="size-4 text-primary" />
                        {provider.working_radius_km} km işləyir
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price + CTA Buttons */}
                <div className="flex flex-col gap-3 sm:min-w-[280px]">
                  <div className="rounded-2xl border border-border bg-slate-50/80 px-4 py-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Saatlıq Qiymət
                    </div>
                    <div className="text-3xl font-black tracking-tight text-foreground mt-0.5">
                      {provider.hourly_rate ? (
                        <>
                          {provider.hourly_rate}
                          <span className="text-lg text-muted-foreground ml-1">
                            ₼
                          </span>
                        </>
                      ) : (
                        <span className="text-xl text-primary">Danışıqla</span>
                      )}
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
                        router.push(`/chat?recipient=${provider.user_id}`)
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
            </CardContent>
          </Card>
        </Container>
      </section>

      {/* ===== STATS STRIP ===== */}
      <section className="pb-8">
        <Container size="xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              Icon={Star}
              tone="from-amber-400/20 to-yellow-500/10 text-amber-600"
              label="Orta Reytinq"
              value={String(
                Number(reviewStats.avg) || provider.rating?.toFixed(1) || "5.0",
              )}
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              {/* About */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="size-5 text-primary" />
                    <h2 className="text-lg font-bold tracking-tight">
                      {t.dashboard.aboutLabel}
                    </h2>
                  </div>
                  <p className="text-sm leading-7 text-foreground/80 whitespace-pre-line">
                    {provider.bio ||
                      `Bu usta haqqında ətraflı məlumat hələ əlavə edilməyib. ${provider.category} sahəsində peşəkar xidmət göstərir.`}
                  </p>
                </CardContent>
              </Card>

              {/* Gallery placeholder */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="size-5 text-primary" />
                      <h2 className="text-lg font-bold tracking-tight">
                        İşdən Nümunələr
                      </h2>
                    </div>
                    <Badge className="bg-muted text-muted-foreground rounded-full text-[10px] font-bold">
                      6 şəkil
                    </Badge>
                  </div>

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
                        className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-border/60 group"
                      >
                        <img
                          src={`https://images.unsplash.com/${id}?q=80&w=400&auto=format&fit=crop`}
                          alt={`İş nümunəsi ${i + 1}`}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Working Hours / Info */}
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <CalendarClock className="size-5 text-primary" />
                    <h2 className="text-lg font-bold tracking-tight">
                      Əlaqə və Xidmət Məlumatları
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
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
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="size-14 rounded-2xl bg-amber-50 border border-amber-100 grid place-items-center shrink-0">
                        <Star className="size-7 fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold tracking-tight">
                          Müştəri Rəyləri
                        </h2>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {reviewStats.total} rəy · Ortalama {reviewStats.avg} ★
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-muted-foreground text-right">
                      {t.dashboard.customerReviews}
                    </div>
                  </div>

                  {/* Distribution Bars */}
                  {reviewStats.total > 0 && (
                    <div className="space-y-2 pb-6 mb-6 border-b border-border/60">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviewStats.distribution[stars - 1];
                        const pct = (count / reviewStats.total) * 100;
                        return (
                          <div key={stars} className="flex items-center gap-3">
                            <span className="text-xs font-bold w-8 shrink-0 flex items-center gap-1">
                              {stars}{" "}
                              <Star className="size-3 fill-amber-400 text-amber-400" />
                            </span>
                            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground w-8 shrink-0 text-right">
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
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
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-border bg-white p-4 sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                                {review.customer?.first_name?.[0] || "M"}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold text-foreground truncate">
                                  {review.customer
                                    ? `${review.customer.first_name} ${review.customer.last_name}`
                                    : "Anonim Müştəri"}
                                </div>
                                <div className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                                  {new Date(
                                    review.updated_at,
                                  ).toLocaleDateString("az-AZ")}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-xs font-black shrink-0">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              <span>{review.rating.toFixed(1)}</span>
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
            <div className="space-y-6 lg:sticky lg:top-28 self-start">
              {/* Quick Booking Summary */}
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <div className="p-5 bg-gradient-primary text-white">
                  <h3 className="font-bold text-lg tracking-tight">
                    Xidmət Sifarişi
                  </h3>
                  <p className="text-sm text-white/90 mt-1 leading-relaxed">
                    Usta ilə əlaqə qurmaq üçün aşağıdakı variantlardan istifadə
                    edin.
                  </p>
                </div>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-semibold">
                      Saatlıq
                    </span>
                    <span className="font-black text-foreground">
                      {provider.hourly_rate
                        ? `${provider.hourly_rate} ₼`
                        : "Danışıqla"}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-semibold">
                      Məsafə
                    </span>
                    <span className="font-bold text-foreground">
                      {provider.distance} km
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-semibold">
                      Status
                    </span>
                    <span
                      className={cn(
                        "font-bold text-xs px-2 py-0.5 rounded-full",
                        provider.is_online
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {provider.is_online
                        ? t.dashboard.onlineNow
                        : t.dashboard.offlineNow}
                    </span>
                  </div>

                  <div className="pt-2 space-y-2.5">
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
                        router.push(`/chat?recipient=${provider.user_id}`)
                      }
                      variant="premium"
                      className="w-full h-11 rounded-xl font-bold gap-1.5 shadow-glow-primary"
                    >
                      <MessageSquare className="size-4" />
                      Sifariş Üçün Yaz
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Verified Badge */}
              <Card className="border-emerald-200 bg-emerald-50/40 shadow-sm">
                <CardContent className="p-5 flex items-start gap-3">
                  <div className="size-11 rounded-xl bg-emerald-100 border border-emerald-200 grid place-items-center shrink-0 text-emerald-600">
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
                href="/technicians"
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
                  onClick={() => router.push(`/technicians/${rp.user_id}`)}
                  onChat={() => router.push(`/chat?recipient=${rp.user_id}`)}
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
    <Card className="border-border/60 bg-white shadow-sm transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-0.5 hover:border-primary/20">
      <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
        <div
          className={cn(
            "size-11 rounded-2xl grid place-items-center bg-gradient-to-br shrink-0 shadow-sm",
            tone,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {label}
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-foreground mt-0.5">
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
    <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 hover:border-primary/30 transition-colors">
      <div className="size-9 rounded-xl bg-slate-50 grid place-items-center shrink-0 text-primary">
        <Icon className="size-4.5" />
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
                <span>{provider.rating?.toFixed(1) || "5.0"}</span>
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
            <span className="shrink-0">{provider.distance} km</span>
          </div>

          <div className="mt-auto flex items-center justify-between">
            <div>
              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                Qiymət
              </div>
              <div className="text-base font-black text-foreground">
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
