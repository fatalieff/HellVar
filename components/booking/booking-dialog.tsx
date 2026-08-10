"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n/i18n-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  Clock3,
  Loader2,
  CalendarCheck2,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Wrench,
  MapPin,
  Banknote,
  Timer,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string | null;
  providerCategory: string;
  priceMin?: number | null;
  priceMax?: number | null;
  hourlyRate?: number | null;
  onSuccess?: () => void;
};

const DURATIONS = [30, 60, 90, 120, 180, 240];

function buildTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 21; h++) {
    for (const m of [0, 30]) {
      if (h === 21 && m === 30) continue;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

function buildDates(tomorrow: string, days: string[], months: string[]): { value: string; label: string; sub: string }[] {
  const out: { value: string; label: string; sub: string }[] = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const label = i === 1 ? tomorrow : days[d.getDay()];
    out.push({ value: iso, label, sub: `${d.getDate()} ${months[d.getMonth()]}` });
  }
  return out;
}

export function BookingDialog({
  open,
  onOpenChange,
  providerId,
  providerName,
  providerCategory,
  priceMin,
  priceMax,
  hourlyRate,
  onSuccess,
}: Props) {
  const { t } = useI18n();
  const [service, setService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [authState, setAuthState] = useState<{ uid: string | null; role: string | null }>({
    uid: null,
    role: null,
  });

  const dates = useMemo(() => buildDates(t.bookings.tomorrow, t.bookings.days, t.bookings.months), [t]);
  const timeSlots = useMemo(() => buildTimeSlots(), []);

  const resetForm = () => {
    setError(null);
    setSuccess(false);
    setService("");
    setSelectedDate(dates[0]?.value ?? "");
    setTime("");
    setDuration(60);
    const defaultPrice =
      priceMin != null && priceMax != null
        ? Math.round(((priceMin + priceMax) / 2) * 100) / 100
        : hourlyRate ?? priceMin ?? priceMax ?? "";
    setPrice(defaultPrice === "" ? "" : String(defaultPrice));
    setAddress("");
    setNote("");
  };

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthState({ uid: null, role: null });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      setAuthState({ uid: user.id, role: profile?.role ?? null });
    })();
  }, [open, providerId]);

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const isCustomer = authState.role === "CUSTOMER";
  const canSubmit =
    Boolean(authState.uid) &&
    isCustomer &&
    service.trim().length >= 2 &&
    Boolean(selectedDate) &&
    Boolean(time) &&
    Number(price) >= 0 &&
    !loading;

  const handleSubmit = async () => {
    if (!authState.uid) return;
    if (!isCustomer) {
      setError(t.bookings.errorRole);
      return;
    }
    if (service.trim().length < 2) {
      setError(t.bookings.errorService);
      return;
    }
    if (!selectedDate || !time) {
      setError(t.bookings.errorDateTime);
      return;
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError(t.bookings.errorPrice);
      return;
    }
    const scheduledAt = new Date(`${selectedDate}T${time}:00`).toISOString();

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("bookings").insert({
      customer_id: authState.uid,
      provider_id: providerId,
      service: service.trim(),
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      price_offer: priceNum,
      address: address.trim() || null,
      customer_note: note.trim() || null,
    });

    setLoading(false);

    if (insertError) {
      const msg = insertError.message;
      if (msg && /Could not find the table/i.test(msg)) {
        setError(t.bookings.errorMissingTable);
      } else if (msg && /self/i.test(msg)) {
        setError(t.bookings.errorSelf);
      } else {
        setError(t.bookings.errorGeneric);
      }
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onSuccess?.();
      handleOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-border/70 shadow-premium-xl">
        <div className="relative px-6 pt-6 pb-5 bg-gradient-primary text-white overflow-hidden">
          <div aria-hidden className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-3xl" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-white/20 text-white border-white/20 rounded-full text-[10px] font-bold backdrop-blur-sm">
                <CalendarCheck2 className="size-3 mr-1" />
                {t.bookings.badge}
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {t.bookings.titleForProvider.replace("{name}", providerName || t.bookings.providerGeneric)}
            </DialogTitle>
            <DialogDescription className="text-white/85 text-sm mt-1.5 leading-relaxed">
              {t.bookings.subtitleTemplate.replace("{category}", providerCategory)}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-6 py-5 space-y-5">
          {!authState.uid ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-amber-800">{t.bookings.authRequiredTitle}</div>
                <div className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                  {t.bookings.authRequiredDesc}
                </div>
              </div>
            </div>
          ) : !isCustomer ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 flex items-start gap-3">
              <ShieldCheck className="size-5 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-sky-800">{t.bookings.roleRequiredTitle}</div>
                <div className="text-xs text-sky-700/90 mt-1 leading-relaxed">
                  {t.bookings.roleRequiredDesc}
                </div>
              </div>
            </div>
          ) : null}

          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3 animate-fade-up">
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-emerald-800">{t.bookings.successTitle}</div>
                <div className="text-xs text-emerald-700/90 mt-1">
                  {t.bookings.successDesc}
                </div>
              </div>
            </div>
          )}

          {/* Service */}
          <div>
            <Label htmlFor="booking-service" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              <Wrench className="size-3.5 inline mr-1" /> {t.bookings.serviceLabel}
            </Label>
            <Input
              id="booking-service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              disabled={!isCustomer || loading || success}
              placeholder={t.bookings.servicePlaceholder}
              maxLength={200}
              className="rounded-xl border-border focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>

          {/* Date */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              <CalendarDays className="size-3.5 inline mr-1" /> {t.bookings.dateLabel}
            </Label>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {dates.map((d) => {
                const active = selectedDate === d.value;
                return (
                  <button
                    key={d.value}
                    type="button"
                    disabled={!isCustomer || loading || success}
                    onClick={() => setSelectedDate(d.value)}
                    className={`shrink-0 rounded-2xl border px-4 py-3 text-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      active
                        ? "border-primary bg-primary text-primary-foreground ring-2 ring-primary/20 shadow-glow-primary"
                        : "border-border bg-slate-50 hover:border-primary/40 hover:bg-white"
                    }`}
                  >
                    <span className={`block text-xs font-bold ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{d.label}</span>
                    <span className="block text-sm font-black mt-0.5">{d.sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time */}
          <div>
            <Label htmlFor="booking-time" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              <Clock3 className="size-3.5 inline mr-1" /> {t.bookings.timeLabel}
            </Label>
            <select
              id="booking-time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!isCustomer || loading || success}
              className="w-full rounded-xl border border-border bg-white pl-3 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{t.bookings.timePlaceholder}</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          {/* Duration + Price */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
                <Timer className="size-3.5 inline mr-1" /> {t.bookings.durationLabel}
              </Label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={!isCustomer || loading || success}
                className="w-full rounded-xl border border-border bg-white pl-3 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{t.bookings.durationMinutes.replace("{count}", String(d))}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="booking-price" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
                <Banknote className="size-3.5 inline mr-1" /> {t.bookings.priceLabel}
              </Label>
              <Input
                id="booking-price"
                type="number"
                min={0}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!isCustomer || loading || success}
                placeholder="0"
                className="rounded-xl border-border focus-visible:ring-4 focus-visible:ring-primary/15"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="booking-address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              <MapPin className="size-3.5 inline mr-1" /> {t.bookings.addressLabel} <span className="font-normal lowercase tracking-normal ml-1 text-[10px]">{t.bookings.optional}</span>
            </Label>
            <Input
              id="booking-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!isCustomer || loading || success}
              placeholder={t.bookings.addressPlaceholder}
              maxLength={300}
              className="rounded-xl border-border focus-visible:ring-4 focus-visible:ring-primary/15"
            />
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="booking-note" className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              {t.bookings.noteLabel} <span className="font-normal lowercase tracking-normal ml-1 text-[10px]">{t.bookings.optional}</span>
            </Label>
            <Textarea
              id="booking-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={!isCustomer || loading || success}
              placeholder={t.bookings.notePlaceholder}
              maxLength={500}
              className="min-h-24 rounded-xl border-border focus-visible:ring-4 focus-visible:ring-primary/15 resize-none"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-6 gap-2 sm:gap-2.5">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="h-11 rounded-xl font-bold border-border hover:bg-slate-50 flex-1 sm:flex-none"
              disabled={loading}
            >
              {t.bookings.cancel}
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || success}
            variant="premium"
            className="h-11 rounded-xl font-bold gap-1.5 shadow-glow-primary flex-1"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : success ? (
              <CheckCircle2 className="size-4" />
            ) : (
              <CalendarCheck2 className="size-4" />
            )}
            {loading ? t.bookings.submitting : success ? t.bookings.submitted : t.bookings.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
