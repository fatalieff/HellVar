"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Profile, ProviderDetails, ProviderReview } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import {
  Star,
  Phone,
  MessageSquare,
  User as UserIcon,
  Loader2,
  ShieldCheck,
  Activity,
  BriefcaseBusiness,
  Clock3,
  CalendarCheck2,
} from "lucide-react";
import { BookingDialog } from "@/components/booking/booking-dialog";

// Types
export type ProviderProfile = ProviderDetails & {
  profiles: Profile | null;
  distance?: number;
};

type ReviewAuthor = Pick<Profile, "id" | "first_name" | "last_name">;

type ProviderReviewWithCustomer = ProviderReview & {
  customer: ReviewAuthor | null;
};

function formatPrice(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

interface ProviderProfileDialogProps {
  open: boolean;
  provider: ProviderProfile | null;
  currentUserId: string | null;
  currentUserRole: Profile["role"] | null;
  onClose: () => void;
}

export function ProviderProfileDialog({
  open,
  provider,
  currentUserId,
  currentUserRole,
  onClose,
}: ProviderProfileDialogProps) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const [reviews, setReviews] = useState<ProviderReviewWithCustomer[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const providerId = provider?.user_id ?? null;
  const canReview = Boolean(currentUserId && currentUserRole === "CUSTOMER");

  const loadProviderReviews = useCallback(async (providerId: string) => {
    setReviewLoading(true);
    setReviewError(null);

    try {
      const { data, error } = await supabase
        .from("provider_reviews")
        .select(`
          id,
          provider_id,
          customer_id,
          rating,
          comment,
          created_at,
          updated_at
        `)
        .eq("provider_id", providerId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const customerIds = Array.from(new Set((data || []).map((review) => review.customer_id).filter(Boolean))) as string[];
      let customerProfiles: Record<string, ReviewAuthor> = {};

      if (customerIds.length > 0) {
        const { data: profileRows, error: profileError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", customerIds);

        if (!profileError) {
          customerProfiles = Object.fromEntries(
            (profileRows || []).map((profile) => [profile.id, {
              id: profile.id,
              first_name: profile.first_name,
              last_name: profile.last_name,
            }])
          );
        }
      }

      const fetchedReviews = ((data || []) as Array<ProviderReview & { customer_id: string }>).map((review) => ({
        ...review,
        customer: customerProfiles[review.customer_id] ?? null,
      }));

      setReviews(fetchedReviews as ProviderReviewWithCustomer[]);
      return fetchedReviews as ProviderReviewWithCustomer[];
    } catch (error) {
      console.error("Usta rəyləri yüklənmədi:", error);
      setReviewError("Rəylər hazırda yüklənmir. Bir az sonra yenidən yoxlayın.");
      setReviews([]);
      return [];
    } finally {
      setReviewLoading(false);
    }
  }, []);

  // Load reviews & prefill the reviewer's own review when the dialog opens
  useEffect(() => {
    if (!open || !providerId) return;

    let active = true;
    void (async () => {
      const fetchedReviews = await loadProviderReviews(providerId);
      if (!active) return;
      const ownReview = fetchedReviews.find((review) => review.customer_id === currentUserId) || null;
      setReviewRating(ownReview?.rating ?? 5);
      setReviewComment(ownReview?.comment || "");
    })();

    const channel = supabase
      .channel(`provider-profile-${providerId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "provider_reviews", filter: `provider_id=eq.${providerId}` },
        () => void loadProviderReviews(providerId),
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [open, providerId, currentUserId, loadProviderReviews]);

  const currentUserReview = reviews.find((review) => review.customer_id === currentUserId) || null;
  const fullName = provider
    ? `${provider.profiles?.first_name || ""} ${provider.profiles?.last_name || ""}`.trim()
    : "";

  const priceRangeDisplay = useMemo(() => {
    if (!provider) return "-";
    if (provider.price_min != null || provider.price_max != null) {
      const min = provider.price_min != null ? `${formatPrice(provider.price_min)} ₼` : "";
      const max = provider.price_max != null ? `${formatPrice(provider.price_max)} ₼` : "";
      if (min && max) return `${min} – ${max}`;
      return min || max;
    }
    return provider.hourly_rate != null ? `${formatPrice(provider.hourly_rate)} ₼/saat` : "-";
  }, [provider]);

  const handleClose = () => {
    setReviews([]);
    setReviewComment("");
    setReviewRating(5);
    setReviewError(null);
    onClose();
  };

  const handleReviewSubmit = async () => {
    if (!provider || !currentUserId || currentUserRole !== "CUSTOMER") {
      setReviewError(t.dashboard.reviewRequiredRole);
      return;
    }

    const trimmedComment = reviewComment.trim();
    if (trimmedComment.length < 3) {
      setReviewError(t.dashboard.reviewMinLength);
      return;
    }

    setSavingReview(true);
    setReviewError(null);

    try {
      if (currentUserReview) {
        const { error } = await supabase
          .from("provider_reviews")
          .update({
            rating: reviewRating,
            comment: trimmedComment,
          })
          .eq("id", currentUserReview.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("provider_reviews")
          .insert({
            provider_id: provider.user_id,
            customer_id: currentUserId,
            rating: reviewRating,
            comment: trimmedComment,
          });

        if (error) throw error;
      }

      const refreshedReviews = await loadProviderReviews(provider.user_id);
      const ownReview = refreshedReviews.find((review) => review.customer_id === currentUserId) || null;
      setReviewRating(ownReview?.rating ?? reviewRating);
      setReviewComment(ownReview?.comment || trimmedComment);
    } catch (error) {
      console.error("Rəy göndərilərkən xəta baş verdi:", error);
      setReviewError(t.dashboard.reviewSaveError);
    } finally {
      setSavingReview(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && handleClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        {provider ? (
          <div className="max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-border bg-slate-50/80 dark:bg-muted/30 px-6 py-5 pr-14">
              <DialogTitle className="text-xl font-bold">
                {fullName || t.dashboard.viewProfile}
              </DialogTitle>
              <DialogDescription>{t.dashboard.profileSubtitle}</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 shadow-sm">
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      avatarUrl={provider.profiles?.avatar_url}
                      name={fullName}
                      className="size-16 border border-border"
                      fallbackClassName="bg-slate-100 dark:bg-secondary text-muted-foreground"
                    />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">
                          {fullName}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground">
                          {provider.category}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-700 dark:text-amber-400">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {(provider.rating || 0).toFixed(1)}
                        </span>
                        <span className="rounded-full bg-slate-100 dark:bg-secondary px-2.5 py-1 font-medium text-slate-700 dark:text-muted-foreground">
                          {reviews.length} {t.common.reviews}
                        </span>
                        {provider.distance !== undefined ? (
                          <span className="rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-700 dark:text-emerald-400">
                            {t.dashboard.distance.replace("{distance}", String(provider.distance ?? 0))}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-xl border border-border bg-slate-50 dark:bg-secondary px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.dashboard.phoneLabel}
                      </p>
                      <a
                        href={`tel:${provider.profiles?.phone}`}
                        className="mt-1 inline-flex items-center gap-2 font-semibold text-foreground hover:text-primary"
                      >
                        <Phone className="h-4 w-4 text-emerald-500" />
                        <span>{provider.profiles?.phone}</span>
                      </a>
                    </div>

                    <div className="rounded-xl border border-border bg-slate-50 dark:bg-secondary px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.dashboard.priceLabel}
                      </p>
                      <p className="mt-1 font-semibold text-foreground">
                        {priceRangeDisplay}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-slate-50 dark:bg-secondary px-4 py-3 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.dashboard.categoryLabel}
                      </p>
                      <p className="mt-1 font-medium text-foreground">{provider.category}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl border border-border bg-slate-50 dark:bg-secondary p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {t.dashboard.aboutLabel}
                      </p>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${provider.is_online ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-slate-100 text-slate-700 dark:bg-secondary dark:text-muted-foreground"}`}>
                        <Activity className="h-3.5 w-3.5" />
                        {provider.is_online ? t.dashboard.onlineNow : t.dashboard.offlineNow}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-foreground/85">
                      {provider.bio || t.dashboard.noBio}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border bg-white dark:bg-card px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Clock3 className="h-4 w-4 text-primary" />
                        <span>{t.dashboard.experienceLabel}</span>
                      </div>
                      <p className="mt-2 font-semibold text-foreground">
                        {provider.years_experience ? `${provider.years_experience} il` : "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-white dark:bg-card px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <BriefcaseBusiness className="h-4 w-4 text-primary" />
                        <span>{t.dashboard.completedJobsLabel}</span>
                      </div>
                      <p className="mt-2 font-semibold text-foreground">
                        {provider.completed_jobs ? `${provider.completed_jobs}` : "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-white dark:bg-card px-4 py-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span>{t.dashboard.availabilityLabel}</span>
                      </div>
                      <p className="mt-2 font-semibold text-foreground">
                        {provider.is_online ? t.dashboard.onlineNow : t.dashboard.offlineNow}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <Button asChild variant="outline" className="h-10">
                      <a href={`tel:${provider.profiles?.phone}`}>
                        <Phone className="mr-2 h-4 w-4 text-emerald-500" />
                        {t.dashboard.call}
                      </a>
                    </Button>
                    <Button
                      variant="premium"
                      className="h-10"
                      onClick={() => router.push(loc(`/chat?recipient=${provider.user_id}`))}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {t.dashboard.chat}
                    </Button>
                  </div>

                  <div className="mt-3">
                    <Button
                      variant="premium"
                      className="h-11 w-full text-base font-bold shadow-glow-primary"
                      onClick={() => setBookingOpen(true)}
                    >
                      <CalendarCheck2 className="mr-2 h-5 w-5" />
                      {t.bookings.book}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-foreground">{t.dashboard.customerReviews}</h3>
                    <span className="text-sm font-medium text-muted-foreground">
                      {reviews.length} {t.common.reviews}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    {reviewLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t.common.loading}</span>
                      </div>
                    ) : reviews.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border bg-slate-50 dark:bg-secondary px-4 py-5 text-sm text-muted-foreground">
                        {t.dashboard.noReviewsYet}
                      </p>
                    ) : (
                      reviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-border bg-slate-50 dark:bg-secondary px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-foreground">
                                {review.customer
                                  ? `${review.customer.first_name} ${review.customer.last_name}`.trim()
                                  : "Anonim"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(review.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-card px-2 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {review.rating}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-foreground/85">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white dark:bg-card p-5 shadow-sm">
                  <h3 className="text-base font-bold text-foreground">{t.dashboard.yourReview}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setReviewRating(value)}
                        disabled={!canReview || savingReview}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                          value <= reviewRating
                            ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400"
                            : "border-border bg-white dark:bg-card text-muted-foreground"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <Star className={`h-4 w-4 ${value <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                        {value}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    placeholder={t.dashboard.reviewPlaceholder}
                    disabled={!canReview || savingReview}
                    className="mt-4 min-h-28 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  {reviewError ? (
                    <p className="mt-3 text-sm font-medium text-red-600">{reviewError}</p>
                  ) : !canReview ? (
                    <p className="mt-3 text-sm text-muted-foreground">{t.dashboard.reviewAuthHint}</p>
                  ) : null}

                  <Button
                    type="button"
                    className="mt-4 w-full"
                    variant="premium"
                    onClick={handleReviewSubmit}
                    disabled={!canReview || savingReview}
                  >
                    {savingReview ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t.common.loading}
                      </>
                    ) : currentUserReview ? (
                      t.dashboard.updateReview
                    ) : (
                      t.dashboard.submitReview
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <UserIcon className="h-4 w-4" />
          </div>
        )}
      </DialogContent>

      {provider && (
        <BookingDialog
          key={provider.user_id}
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          providerId={provider.user_id}
          providerName={fullName}
          providerCategory={provider.category}
          priceMin={provider.price_min}
          priceMax={provider.price_max}
          hourlyRate={provider.hourly_rate}
        />
      )}
    </Dialog>
  );
}
