"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types/database";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { getDistrictCoordinates } from "@/lib/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Trash2,
  Upload,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import {
  getAvatarPublicUrl,
  uploadAvatar,
  removeAvatars,
  isAvatarFile,
  MAX_AVATAR_SIZE,
  getPendingAvatar,
  clearPendingAvatar,
} from "@/lib/supabase/avatar";

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("994") && digits.length === 12) return `+${digits}`;
  return `+994${digits}`;
}

async function dataUrlToFile(dataUrl: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const type = blob.type || "image/jpeg";
  const ext = type.split("/")[1] || "jpg";
  return new File([blob], `avatar.${ext}`, { type });
}

function formatMemberDate(dateStr?: string, locale?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(locale === "en" ? "en-GB" : locale === "tr" ? "tr-TR" : "az-Latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const p = t.profile;

  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<{ id: string; email?: string | null } | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);

  // Form state
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [priceMin, setPriceMin] = React.useState("");
  const [priceMax, setPriceMax] = React.useState("");

  // Avatar state
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);

  // Feedback state
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);
  const [applyingPending, setApplyingPending] = React.useState(false);

  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  const displayedAvatar = preview ?? avatarUrl;

  const load = React.useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authUser = session?.user ?? null;
      setUser(authUser ? { id: authUser.id, email: authUser.email } : null);

      if (!authUser) {
        setLoading(false);
        return;
      }

      const { data: row, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error) {
        setMessage({ type: "error", text: p.loadError });
        setLoading(false);
        return;
      }

      const prof = row as Profile;
      setProfile(prof);
      setFirstName(prof.first_name ?? "");
      setLastName(prof.last_name ?? "");
      setPhone(prof.phone ?? "");
      setAddress(prof.address ?? "");
      setAvatarUrl(getAvatarPublicUrl(prof.avatar_url));

      if (prof.role === "PROVIDER") {
        const { data: details } = await supabase
          .from("provider_details")
          .select("bio, price_min, price_max")
          .eq("user_id", prof.id)
          .maybeSingle();
        setBio(details?.bio ?? "");
        setPriceMin(details?.price_min != null ? String(details.price_min) : "");
        setPriceMax(details?.price_max != null ? String(details.price_max) : "");
      }

      // Email təsdiqlənmədən əvvəl qeydiyyatda seçilən gözləyən avatarı tətbiq et
      const pending = getPendingAvatar();
      if (pending && pending.userId === prof.id) {
        if (!prof.avatar_url) {
          setApplyingPending(true);
          try {
            const file = await dataUrlToFile(pending.dataUrl);
            const url = await uploadAvatar(prof.id, file);
            setAvatarUrl(url);
            await supabase
              .from("profiles")
              .update({ avatar_url: url })
              .eq("id", prof.id);
            clearPendingAvatar();
            setMessage({ type: "success", text: p.pendingAvatarApplied });
          } catch {
            setMessage({ type: "error", text: p.saveError });
          } finally {
            setApplyingPending(false);
          }
        } else {
          clearPendingAvatar();
        }
      }
    } catch {
      setMessage({ type: "error", text: p.loadError });
    } finally {
      setLoading(false);
    }
  }, [p]);

  React.useEffect(() => {
    (async () => {
      await load();
    })();
  }, [load]);

  if (loading) {
    return (
      <main className="flex-1 relative overflow-hidden bg-slate-50/50">
        <Container size="lg" className="py-12 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </Container>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 relative overflow-hidden bg-slate-50/50">
        <Container size="sm" className="py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mx-auto max-w-md rounded-2xl border border-border/80 bg-card p-10 text-center shadow-premium"
          >
            <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
              <UserIcon className="size-8" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-foreground">{p.title}</h1>
            <p className="mb-6 text-sm text-muted-foreground">{p.notSignedIn}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="premium" onClick={() => router.push(loc("/login"))}>
                {p.signIn}
              </Button>
              <Button variant="ghost" asChild>
                <Link href={loc("/")}>
                  <ArrowLeft className="size-4" />
                  {p.backHome}
                </Link>
              </Button>
            </div>
          </motion.div>
        </Container>
      </main>
    );
  }

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      // Ünvandan rayonu çıxarıb koordinatı yenilə
      const location = getDistrictCoordinates(address.trim());
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: normalizePhone(phone),
          address: address.trim() || null,
          latitude: location?.lat ?? null,
          longitude: location?.lng ?? null,
        })
        .eq("id", user.id);
      if (error) throw error;

      if (profile?.role === "PROVIDER") {
        const parsedMin = priceMin.trim() !== "" ? Number(priceMin.trim()) : null;
        const parsedMax = priceMax.trim() !== "" ? Number(priceMax.trim()) : null;
        const { error: detailsError } = await supabase
          .from("provider_details")
          .update({
            bio: bio.trim() || null,
            price_min: parsedMin,
            price_max: parsedMax,
          })
          .eq("user_id", user.id);
        if (detailsError) throw detailsError;
      }

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              phone: normalizePhone(phone),
              address: address.trim() || null,
              latitude: location?.lat ?? null,
              longitude: location?.lng ?? null,
            }
          : prev,
      );
      setMessage({ type: "success", text: p.savedSuccess });
    } catch {
      setMessage({ type: "error", text: p.saveError });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!isAvatarFile(file)) {
      setMessage({ type: "error", text: p.invalidFileType });
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setMessage({ type: "error", text: p.fileTooLarge });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    setMessage(null);
    try {
      const url = await uploadAvatar(user.id, file);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", user.id);
      if (error) throw error;
      setAvatarUrl(url);
      setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev));
      setMessage({ type: "success", text: p.avatarSaved });
    } catch {
      setMessage({ type: "error", text: p.saveError });
      setPreview(null);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (removing) return;
    setRemoving(true);
    setMessage(null);
    try {
      await removeAvatars(user.id);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (error) throw error;
      setAvatarUrl(null);
      setPreview(null);
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : prev));
      setMessage({ type: "success", text: p.avatarSaved });
    } catch {
      setMessage({ type: "error", text: p.saveError });
    } finally {
      setRemoving(false);
    }
  };

  const isProvider = profile?.role === "PROVIDER";

  return (
    <main className="relative flex-1 overflow-hidden bg-slate-50/50">
      {/* Decorative background */}
      <div className="pointer-events-none absolute -top-16 -left-16 h-[420px] w-[420px] rounded-full bg-[oklch(0.6231_0.1880_41.11)]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-[420px] w-[420px] rounded-full bg-[oklch(0.7900_0.1400_70.00)]/5 blur-[120px]" />

      <Container size="lg" className="relative py-10 md:py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <Link
              href={loc("/")}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              {p.backHome}
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {p.title}
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{p.subtitle}</p>
          </div>

          {isProvider && (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <BadgeCheck className="size-3.5" />
              {p.roleProvider}
            </span>
          )}
        </motion.div>

        {/* Toast message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "mb-6 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm",
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              {message.type === "success" ? (
                <Check className="mt-0.5 size-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending avatar applying */}
        <AnimatePresence>
          {applyingPending && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-sm font-medium text-primary"
            >
              <Loader2 className="size-4 animate-spin" />
              {p.pendingAvatarApplying}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* ── Identity / Avatar card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="lg:sticky lg:top-24 h-fit"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-premium">
              {/* Gradient header band */}
              <div className="relative h-28 bg-gradient-primary">
                <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_30%_30%,white_0%,transparent_50%)]" />
              </div>

              <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="group relative -mt-14 mb-4 w-fit">
                  <div className="relative">
                    <Avatar className="size-28 border-4 border-card shadow-premium-lg transition-transform duration-300 group-hover:scale-[1.03]">
                      {displayedAvatar ? (
                        <AvatarImage src={displayedAvatar} alt={fullName} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-primary text-2xl font-bold text-white">
                        {initials || <UserIcon className="size-8" />}
                      </AvatarFallback>
                    </Avatar>

                    {/* Hover camera overlay */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 grid place-items-center rounded-full bg-black/0 text-transparent transition-all duration-200 hover:bg-black/45 hover:text-white disabled:opacity-50"
                      aria-label={p.changePhoto}
                    >
                      {uploading ? (
                        <Loader2 className="size-6 animate-spin" />
                      ) : (
                        <Camera className="size-6" />
                      )}
                    </button>
                  </div>

                  <span className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full border-[3px] border-card bg-emerald-500" />
                </div>

                <div className="mb-5">
                  <h2 className="text-lg font-bold text-foreground">
                    {fullName || (user.email?.split("@")[0] ?? "—")}
                  </h2>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-1 text-[10px] font-semibold text-foreground/80">
                    {isProvider ? p.roleProvider : p.roleCustomer}
                  </span>
                </div>

                {/* Quick info */}
                <div className="space-y-2.5 text-sm">
                  {profile?.phone && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <span className="grid size-7 place-items-center rounded-lg bg-accent/50 text-muted-foreground">
                        <Phone className="size-3.5" />
                      </span>
                      <span className="truncate">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.address && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/50 text-muted-foreground">
                        <MapPin className="size-3.5" />
                      </span>
                      <span className="line-clamp-2">{profile.address}</span>
                    </div>
                  )}
                  {profile?.created_at && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent/50 text-muted-foreground">
                        <Mail className="size-3.5" />
                      </span>
                      <span className="truncate">
                        {p.memberSince}: {formatMemberDate(profile.created_at, locale)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Avatar actions */}
                <div className="mt-6 border-t border-border/60 pt-5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    type="button"
                    variant="premium"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Upload className="size-4" />
                    )}
                    {p.changePhoto}
                  </Button>
                  {displayedAvatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="mt-2 w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                      onClick={handleRemoveAvatar}
                      disabled={removing}
                    >
                      {removing ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      {p.removePhoto}
                    </Button>
                  )}
                  <p className="mt-3 text-center text-[11px] leading-snug text-muted-foreground">
                    {p.avatarSectionHint}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Personal info form ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-premium md:p-8">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-foreground">{p.personalInfoTitle}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.personalInfoHint}</p>
              </div>

              <form onSubmit={handleSaveInfo} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-first-name">{p.firstNameLabel}</Label>
                    <Input
                      id="profile-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={p.firstNamePlaceholder}
                      className="bg-white border-border focus-visible:ring-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-last-name">{p.lastNameLabel}</Label>
                    <Input
                      id="profile-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={p.lastNamePlaceholder}
                      className="bg-white border-border focus-visible:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">{p.phoneLabel}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profile-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={p.phonePlaceholder}
                        className="bg-white pl-10 border-border focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">{p.emailLabel}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="profile-email"
                        type="email"
                        value={user.email ?? ""}
                        readOnly
                        disabled
                        className="bg-muted/50 pl-10 border-border text-muted-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-address">{p.addressLabel}</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="profile-address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={p.addressPlaceholder}
                      className="bg-white pl-10 border-border focus-visible:ring-primary"
                    />
                  </div>
                </div>

                {isProvider && (
                  <>
                    <div className="space-y-3 rounded-xl border border-border/60 bg-slate-50/60 p-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.priceLabel}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.priceHint}</p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="profile-price-min">{p.priceMinLabel}</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                              ₼
                            </span>
                            <Input
                              id="profile-price-min"
                              type="number"
                              inputMode="decimal"
                              min={0}
                              value={priceMin}
                              onChange={(e) => setPriceMin(e.target.value)}
                              placeholder="20"
                              className="bg-white pl-9 border-border focus-visible:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-price-max">{p.priceMaxLabel}</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                              ₼
                            </span>
                            <Input
                              id="profile-price-max"
                              type="number"
                              inputMode="decimal"
                              min={0}
                              value={priceMax}
                              onChange={(e) => setPriceMax(e.target.value)}
                              placeholder="50"
                              className="bg-white pl-9 border-border focus-visible:ring-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profile-bio">{p.bioLabel}</Label>
                      <Textarea
                        id="profile-bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder={p.bioPlaceholder}
                        rows={4}
                        maxLength={500}
                        className="resize-none bg-white border-border focus-visible:ring-primary"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-5">
                  <span className="hidden text-xs text-muted-foreground sm:inline">
                    {p.roleLabel}: {isProvider ? p.roleProvider : p.roleCustomer}
                  </span>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-white shadow-glow-primary hover:bg-primary/95"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        {p.saving}
                      </>
                    ) : (
                      <>
                        <Check className="size-4" />
                        {p.saveChanges}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </Container>
    </main>
  );
}
