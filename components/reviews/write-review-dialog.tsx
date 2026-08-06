"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ProviderReview } from "@/lib/types/database";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import {
  Star,
  MessageSquarePlus,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  providerName: string | null;
  providerCategory: string;
  providerInitialRating?: number;
  onSuccess?: (review: ProviderReview) => void;
};

export function WriteReviewDialog({
  open,
  onOpenChange,
  providerId,
  providerName,
  providerCategory,
  providerInitialRating,
  onSuccess,
}: Props) {
  const { t } = useI18n();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<{ uid: string | null; role: string | null }>({
    uid: null,
    role: null,
  });
  const [existingReview, setExistingReview] = useState<ProviderReview | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSuccess(false);
    setRating(providerInitialRating && providerInitialRating > 0 ? Math.round(providerInitialRating) : 5);
    setComment("");
    setExistingReview(null);

    const init = async () => {
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

      // Mevcut rey yoxlanir
      try {
        const { data, error: dbErr } = await supabase
          .from("provider_reviews")
          .select("*")
          .eq("provider_id", providerId)
          .eq("customer_id", user.id)
          .maybeSingle();
        if (!dbErr && data) {
          setExistingReview(data as ProviderReview);
          setRating(data.rating);
          setComment(data.comment || "");
        }
      } catch (e) {
        const code = (e as any)?.code;
        if (code === "PGRST205" || (e as any)?.message?.includes?.("Could not find the table")) {
          console.warn("provider_reviews table missing when checking existing review, ignoring");
        }
      }
    };

    void init();
  }, [open, providerId, providerInitialRating]);

  const isCustomer = authState.role === "CUSTOMER";
  const canSubmit =
    Boolean(authState.uid) &&
    isCustomer &&
    (comment.trim().length === 0 || comment.trim().length >= 2) &&
    !loading;

  const handleSubmit = async () => {
    if (!canSubmit || !authState.uid) {
      if (!isCustomer) setError(t.dashboard.reviewRequiredRole);
      else if (comment.trim().length > 0 && comment.trim().length < 2)
        setError(t.dashboard.reviewMinLength);
      return;
    }

    const trimmed = comment.trim();
    if (trimmed.length > 1000) {
      setError("Rəy maksimum 1000 simvol ola bilər.");
      return;
    }
    if (trimmed.length > 0 && trimmed.length < 2) {
      setError(t.dashboard.reviewMinLength);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: { provider_id: string; customer_id: string; rating: number; comment: string | null } = {
        provider_id: providerId,
        customer_id: authState.uid,
        rating,
        comment: trimmed.length === 0 ? null : trimmed,
      };

      let result;
      if (existingReview) {
        result = await supabase
          .from("provider_reviews")
          .update({ rating, comment: payload.comment })
          .eq("id", existingReview.id)
          .select("*")
          .single();
      } else {
        result = await supabase
          .from("provider_reviews")
          .insert(payload)
          .select("*")
          .single();
      }

      if (result.error) throw result.error;

      setSuccess(true);
      const saved = result.data as ProviderReview;
      setExistingReview(saved);

      // Client-side notification fallback (only for new reviews, not updates).
      // The DB trigger should also fire, but if the migration hasn't been
      // applied yet this guarantees the provider still gets notified.
      if (!existingReview) {
        try {
          const { data: myProfile } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", authState.uid!)
            .single();

          const customerName = myProfile
            ? `${myProfile.first_name} ${myProfile.last_name}`
            : "Müştəri";

          // Check if the trigger already created a notification for this review
          const { data: existingNotif } = await supabase
            .from("notifications")
            .select("id")
            .eq("related_id", saved.id)
            .eq("type", "new_review")
            .maybeSingle();

          if (!existingNotif) {
            await supabase.from("notifications").insert({
              user_id: providerId,
              type: "new_review" as const,
              title: `${customerName} sizə rəy yazdı`,
              body: trimmed.length > 0 ? trimmed : `Yeni rəy: ${rating} ulduz`,
              related_id: saved.id,
            });
          }
        } catch (notifErr) {
          // Non-critical — don't block the success flow
          console.warn("Bildiriş yaradılarkən xəta (kritik deyil):", notifErr);
        }
      }

      setTimeout(() => {
        onSuccess?.(saved);
        onOpenChange(false);
      }, 900);
    } catch (err) {
      console.error("Rəy göndərilərkən xəta:", err);
      const ae = err as any;
      const msg = ae?.message as string | undefined;
      if (ae?.code === "PGRST205" || (msg && msg.includes("Could not find the table"))) {
        setError("Rəy yadda saxlanmadı — serverdə `provider_reviews` cədvəli mövcud deyil.");
      } else if (msg && /self_review/i.test(msg)) {
        setError("Özünüzə rəy verə bilməzsiniz.");
      } else if (msg && /unique/i.test(msg)) {
        setError("Siz bu ustaya artıq rəy yazmısınız.");
      } else {
        setError(t.dashboard.reviewSaveError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border-border/70 shadow-premium-xl">
        <div className="relative px-6 pt-6 pb-5 bg-gradient-primary text-white overflow-hidden">
          <div
            aria-hidden
            className="absolute -top-10 -right-10 size-40 rounded-full bg-white/10 blur-3xl"
          />
          <DialogHeader className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-white/20 text-white border-white/20 rounded-full text-[10px] font-bold backdrop-blur-sm">
                <MessageSquarePlus className="size-3 mr-1" />
                {existingReview ? "Rəyinizi Yeniləyin" : "Yeni Rəy Yazın"}
              </Badge>
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {providerName || "Usta"} üçün rəy
            </DialogTitle>
            <DialogDescription className="text-white/85 text-sm mt-1.5 leading-relaxed">
              {providerCategory} · Deneyimlərini paylaşaraq digər müştərilərə kömək olun
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Auth warnings */}
          {!authState.uid ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-amber-800">
                  Rəy yazmaq üçün daxil olun
                </div>
                <div className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                  {t.dashboard.reviewAuthHint}
                </div>
              </div>
            </div>
          ) : !isCustomer ? (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 flex items-start gap-3">
              <ShieldCheck className="size-5 text-sky-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-sky-800">
                  Yalnız müştərilər rəy yazə bilər
                </div>
                <div className="text-xs text-sky-700/90 mt-1 leading-relaxed">
                  {t.dashboard.reviewRequiredRole}
                </div>
              </div>
            </div>
          ) : null}

          {/* Success */}
          {success && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3 animate-fade-up">
              <CheckCircle2 className="size-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold text-emerald-800">
                  Rəyiniz qəbul edildi! ✨
                </div>
                <div className="text-xs text-emerald-700/90 mt-1">
                  Ustanın reytinqi yeniləndi.
                </div>
              </div>
            </div>
          )}

          {/* Rating Picker - BIG interactive stars */}
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5 block">
              Qiymətləndirin
            </Label>
            <div className="flex items-center gap-2.5">
              {[1, 2, 3, 4, 5].map((val) => {
                const active = val <= (hoverRating || rating);
                return (
                  <button
                    key={val}
                    type="button"
                    disabled={!isCustomer || loading}
                    onMouseEnter={() => isCustomer && setHoverRating(val)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => isCustomer && setRating(val)}
                    className={cn(
                      "group relative flex items-center justify-center size-14 rounded-2xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed",
                      active
                        ? "bg-gradient-to-br from-amber-100 to-amber-50 ring-2 ring-amber-200 shadow-md scale-105"
                        : "bg-slate-50 border border-border hover:bg-amber-50 hover:border-amber-200"
                    )}
                    aria-label={`${val} ulduz`}
                  >
                    <Star
                      className={cn(
                        "size-7 transition-transform duration-200 group-hover:scale-110",
                        active
                          ? "fill-amber-400 text-amber-500 drop-shadow-sm"
                          : "text-slate-300"
                      )}
                    />
                    <span
                      className={cn(
                        "absolute -top-1.5 -right-1.5 size-4 rounded-full text-[9px] font-black flex items-center justify-center",
                        active
                          ? "bg-amber-400 text-white"
                          : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {val}
                    </span>
                  </button>
                );
              })}

              <div className="ml-auto pr-1 text-right">
                <div className="text-3xl font-black text-foreground leading-none">
                  {(hoverRating || rating).toFixed(1)}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                  {rating === 1
                    ? "Pis"
                    : rating === 2
                    ? "Kafi"
                    : rating === 3
                    ? "Orta"
                    : rating === 4
                    ? "Yaxşı"
                    : "Əla!"}
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="review-comment" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rəyiniz
                <span className="font-normal lowercase tracking-normal ml-1.5 text-[10px]">(isteğe bağlı)</span>
              </Label>
              <span className="text-[10px] font-bold text-muted-foreground">
                {comment.length} / 1000
              </span>
            </div>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={!isCustomer || loading || success}
              placeholder="Xidmətin keyfiyyəti, vətəndaşlıq, təmizlik, vaxtında gəlmə... hansı təəsəüratlar qazandınız?"
              className="min-h-32 rounded-2xl text-sm border-border focus-visible:ring-4 focus-visible:ring-primary/15 resize-none"
              maxLength={1000}
            />
          </div>

          {/* Hints / Badges */}
          <div className="flex flex-wrap gap-1.5">
            {["Məmnun qaldım 😊", "Vaxtında gəldi ⏰", "Peşəkar idi 👷", "Təmizdi 🧼", "Qiymət adaldır 💰"].map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  if (!isCustomer || loading || success) return;
                  const val = comment.length > 0 ? `${comment}\n${h}` : h;
                  if (val.length <= 1000) setComment(val);
                }}
                disabled={!isCustomer || loading || success}
                className="inline-flex items-center rounded-full border border-border bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-muted-foreground hover:bg-primary/5 hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="size-3 mr-1 text-primary" />
                {h}
              </button>
            ))}
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
              Ləğv Et
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
              <MessageSquarePlus className="size-4" />
            )}
            {loading
              ? "Göndərilir..."
              : success
              ? "Göndərildi"
              : existingReview
              ? t.dashboard.updateReview
              : t.dashboard.submitReview}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
