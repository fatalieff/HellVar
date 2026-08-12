"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n-context";
import { Locale } from "@/lib/i18n/dictionaries";
import { Booking, BookingStatus } from "@/lib/types/database";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CalendarDays,
  Clock3,
  Banknote,
  Timer,
  MapPin,
  MessageSquare,
  Check,
  X,
  CheckCheck,
  CalendarCheck2,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

type BookingWithCustomer = Booking & { customerName: string; customerAvatar: string | null };

type Props = {
  userId: string;
};

const INTL_LOCALE: Record<Locale, string> = { az: "az-AZ", en: "en-GB", tr: "tr-TR", ru: "ru-RU" };

const STATUS_CLASSES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED: "bg-sky-50 text-sky-700 border-sky-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  EXPIRED: "bg-slate-100 text-slate-600 border-slate-200",
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

export function ProviderBookings({ userId }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const [bookings, setBookings] = useState<BookingWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("bookings")
      .select("*")
      .eq("provider_id", userId)
      .order("scheduled_at", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    const rows = (data ?? []) as Booking[];
    const customerIds = Array.from(new Set(rows.map((b) => b.customer_id)));
    let customerMap: Record<string, { first_name: string; last_name: string; avatar_url: string | null | undefined }> = {};

    if (customerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .in("id", customerIds);
      customerMap = Object.fromEntries(
        (profiles ?? []).map((p) => [
          p.id,
          { first_name: p.first_name, last_name: p.last_name, avatar_url: p.avatar_url },
        ])
      );
    }

    setBookings(
      rows.map((b) => {
        const c = customerMap[b.customer_id];
        return {
          ...b,
          customerName: c ? `${c.first_name} ${c.last_name}`.trim() : t.bookings.customerGeneric,
          customerAvatar: c?.avatar_url ?? null,
        };
      })
    );
    setLoading(false);
  }, [t, userId]);

  useEffect(() => {
    void (async () => {
      await loadBookings();
    })();
    const channel = supabase
      .channel(`provider-bookings-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `provider_id=eq.${userId}` },
        () => void loadBookings()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, loadBookings]);

  const updateStatus = async (booking: BookingWithCustomer, status: BookingStatus) => {
    setBusyId(booking.id);
    setError(null);
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", booking.id);
    if (updateError) setError(updateError.message);
    setBusyId(null);
  };

  const groups = useMemo(() => {
    const pending = bookings.filter((b) => b.status === "PENDING");
    const active = bookings.filter((b) => b.status === "ACCEPTED");
    const past = bookings.filter((b) => ["COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"].includes(b.status));
    return { pending, active, past };
  }, [bookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-white px-6 py-14 text-center">
          <Inbox className="size-10 text-muted-foreground/40" />
          <p className="font-bold text-foreground">{t.bookings.emptyTitle}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {t.bookings.emptyDesc}
          </p>
        </div>
      ) : (
        <>
          <BookingSection
            title={t.bookings.incomingTitle}
            icon={<Inbox className="size-4" />}
            bookings={groups.pending}
            renderActions={(b) => (
              <>
                <Button
                  size="sm"
                  className="rounded-xl"
                  disabled={busyId === b.id}
                  onClick={() => void updateStatus(b, "ACCEPTED")}
                >
                  {busyId === b.id ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  {t.bookings.accept}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                  disabled={busyId === b.id}
                  onClick={() => void updateStatus(b, "REJECTED")}
                >
                  <X className="size-3.5" />
                  {t.bookings.reject}
                </Button>
              </>
            )}
            emptyText={t.bookings.incomingEmpty}
          />

          <BookingSection
            title={t.bookings.activeTitle}
            icon={<CalendarCheck2 className="size-4" />}
            bookings={groups.active}
            renderActions={(b) => (
              <>
                <Button
                  size="sm"
                  className="rounded-xl"
                  disabled={busyId === b.id}
                  onClick={() => void updateStatus(b, "COMPLETED")}
                >
                  {busyId === b.id ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
                  {t.bookings.complete}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => router.push(`/chat?recipient=${b.customer_id}`)}
                >
                  <MessageSquare className="size-3.5" />
                  {t.bookings.chat}
                </Button>
              </>
            )}
            emptyText={t.bookings.activeEmpty}
          />

          {groups.past.length > 0 && (
            <BookingSection
              title={t.bookings.pastTitle}
              icon={<Clock3 className="size-4" />}
              bookings={groups.past}
              renderActions={(b) =>
                b.status === "ACCEPTED" || b.status === "COMPLETED" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => router.push(`/chat?recipient=${b.customer_id}`)}
                  >
                    <MessageSquare className="size-3.5" />
                    {t.bookings.chat}
                  </Button>
                ) : null
              }
            />
          )}
        </>
      )}
    </div>
  );
}

function BookingSection({
  title,
  icon,
  bookings,
  renderActions,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  bookings: BookingWithCustomer[];
  renderActions: (booking: BookingWithCustomer) => React.ReactNode;
  emptyText?: string;
}) {
  const { t, locale } = useI18n();
  if (bookings.length === 0 && !emptyText) return null;

  return (
    <section className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h2 className="font-bold text-foreground">{title}</h2>
        </div>
        {bookings.length > 0 && (
          <Badge variant="accent" className="rounded-full">{bookings.length}</Badge>
        )}
      </div>

      {bookings.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="divide-y divide-border">
          <AnimatePresence initial={false}>
            {bookings.map((booking) => {
              const className = STATUS_CLASSES[booking.status];
              return (
                <motion.article
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  className="p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <UserAvatar
                        avatarUrl={booking.customerAvatar}
                        name={booking.customerName}
                        className="size-14 border border-border"
                        fallbackClassName="bg-slate-100 text-muted-foreground"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-foreground">{booking.customerName}</p>
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
                      {renderActions(booking)}
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
