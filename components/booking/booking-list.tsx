"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { Locale } from "@/lib/i18n/dictionaries";
import { Booking, BookingStatus } from "@/lib/types/database";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CalendarDays, Banknote, Timer, MapPin, MessageSquare, XCircle, CalendarCheck2 } from "lucide-react";import { cn } from "@/lib/utils";

type BookingWithProvider = Booking & { providerName: string; providerAvatar: string | null };

type Tab = "active" | "completed" | "cancelled";

const INTL_LOCALE: Record<Locale, string> = { az: "az-AZ", en: "en-GB", tr: "tr-TR", ru: "ru-RU" };

const STATUS_CLASSES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
  ACCEPTED: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30",
  REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-secondary dark:text-muted-foreground dark:border-border",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-secondary dark:text-muted-foreground dark:border-border",
};

function formatDateTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleString(INTL_LOCALE[locale], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function BookingList() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const [bookings, setBookings] = useState<BookingWithProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("active");
  const [userId, setUserId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadBookings = useCallback(async (currentUserId: string) => {
    const { data, error: loadError } = await supabase
      .from("bookings")
      .select("*")
      .eq("customer_id", currentUserId)
      .order("scheduled_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    const rows = (data ?? []) as Booking[];
    const providerIds = Array.from(new Set(rows.map((b) => b.provider_id)));
    let providerMap: Record<string, { first_name: string; last_name: string; avatar_url: string | null | undefined }> = {};

    if (providerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", providerIds);
      providerMap = Object.fromEntries(
        (profiles ?? []).map((p) => [
          p.id,
          { first_name: p.first_name, last_name: p.last_name, avatar_url: p.avatar_url },
        ])
      );
    }

    setBookings(
      rows.map((b) => {
        const p = providerMap[b.provider_id];
        return {
          ...b,
          providerName: p ? `${p.first_name} ${p.last_name}`.trim() : t.bookings.providerGeneric,
          providerAvatar: p?.avatar_url ?? null,
        };
      })
    );
  }, [t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace(loc("/login"));
        return;
      }
      setUserId(user.id);
      await loadBookings(user.id);
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [router, loadBookings]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`my-bookings-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `customer_id=eq.${userId}` },
        () => void loadBookings(userId)
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, loadBookings]);

  const cancelBooking = async (booking: BookingWithProvider) => {
    if (booking.status !== "PENDING" && booking.status !== "ACCEPTED") return;
    setCancellingId(booking.id);
    setError(null);
    const { error: cancelError } = await supabase
      .from("bookings")
      .update({ status: "CANCELLED" })
      .eq("id", booking.id);
    if (cancelError) setError(cancelError.message);
    setCancellingId(null);
  };

  const filtered = useMemo(() => {
    if (tab === "active") {
      return bookings.filter((b) => b.status === "PENDING" || b.status === "ACCEPTED");
    }
    if (tab === "completed") {
      return bookings.filter((b) => b.status === "COMPLETED" || b.status === "REJECTED" || b.status === "EXPIRED");
    }
    return bookings.filter((b) => b.status === "CANCELLED");
  }, [bookings, tab]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-1 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-primary text-white shadow-glow-primary">
          <CalendarCheck2 className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">{t.bookings.pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{t.bookings.pageSubtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { key: "active" as Tab, label: t.bookings.tabActiveTemplate.replace("{count}", String(bookings.filter((b) => b.status === "PENDING" || b.status === "ACCEPTED").length)) },
            { key: "completed" as Tab, label: t.bookings.tabCompleted },
            { key: "cancelled" as Tab, label: t.bookings.tabCancelled },
          ]
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200",
              tab === item.key
                ? "border-primary bg-primary text-primary-foreground shadow-glow-primary"
                : "border-border bg-white dark:bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-white dark:bg-card px-6 py-16 text-center">
          <CalendarCheck2 className="size-10 text-muted-foreground/40" />
          <p className="font-bold text-foreground">{t.bookings.listEmptyTitle}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t.bookings.listEmptyDesc}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((booking) => {
              const className = STATUS_CLASSES[booking.status];
              const cancellable = booking.status === "PENDING" || booking.status === "ACCEPTED";
              return (
                <motion.article
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="rounded-2xl border border-border bg-white dark:bg-card p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <UserAvatar
                        avatarUrl={booking.providerAvatar}
                        name={booking.providerName}
                        className="size-14 border border-border"
                        fallbackClassName="bg-slate-100 text-muted-foreground dark:bg-secondary"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-foreground">{booking.providerName}</p>
                          <Badge className={cn("rounded-full border", className)}>{t.bookings.status[booking.status]}</Badge>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground">{booking.service}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3.5" />
                            {formatDateTime(booking.scheduled_at, locale)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Timer className="size-3.5" />
                            {booking.duration_minutes} {t.bookings.minutesShort}
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <Banknote className="size-3.5" />
                            {formatPrice(booking.price_offer)} {t.bookings.currencySymbol}
                          </span>
                        </div>
                        {booking.address && (
                          <p className="mt-1.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="size-3.5" />
                            {booking.address}
                          </p>
                        )}
                        {booking.customer_note && (
                          <p className="mt-1.5 text-xs text-muted-foreground/80">{booking.customer_note}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-stretch">
                      {cancellable && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl text-red-600 border-red-200 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                          disabled={cancellingId === booking.id}
                          onClick={() => void cancelBooking(booking)}
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <XCircle className="size-3.5" />
                          )}
                          {t.bookings.cancelBooking}
                        </Button>
                      )}
                      {booking.status === "ACCEPTED" && (
                        <Button
                          size="sm"
                          className="rounded-xl"
                          onClick={() => router.push(loc(`/chat?recipient=${booking.provider_id}`))}
                        >
                          <MessageSquare className="size-3.5" />
                          {t.bookings.openChat}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
