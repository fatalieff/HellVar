"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { motion } from "framer-motion";
import { AlertCircle, BadgeCheck, ChevronLeft, Loader2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { Profile, ProviderDetails, ServiceRequest, ServiceRequestStatus, Booking } from "@/lib/types/database";
import { OrderFeed } from "./order-feed";
import { StatsCards } from "./stats-cards";
import { StatusToggle } from "./status-toggle";
import { ProviderDashboardData, RequestWithCustomer } from "./types";
import { VerificationBanner } from "./verification-banner";
import { ProviderBookings } from "@/components/booking/provider-bookings";

function startOfWeek() { const today = new Date(); const day = today.getDay() || 7; today.setDate(today.getDate() - day + 1); today.setHours(0, 0, 0, 0); return today; }

export function ProviderDashboardClient() {
  const router = useRouter();
  const { locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const [data, setData] = useState<ProviderDashboardData | null>(null);
  const [requests, setRequests] = useState<RequestWithCustomer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [busyRequestId, setBusyRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (currentUserId = userId) => {
    if (!currentUserId) return;
    const { data: rawRequests, error: requestError } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
    if (requestError) { setError(requestError.message); return; }
    const rows = (rawRequests ?? []) as ServiceRequest[];
    const customerIds = [...new Set(rows.map((request) => request.customer_id))];
    const { data: customers } = customerIds.length ? await supabase.from("profiles").select("id, first_name, last_name").in("id", customerIds) : { data: [] as Pick<Profile, "id" | "first_name" | "last_name">[] };
    const names = new Map((customers ?? []).map((customer) => [customer.id, `${customer.first_name} ${customer.last_name.charAt(0)}.`]));
    setRequests(rows.map((request) => ({ ...request, customerName: names.get(request.customer_id) ?? "Müştəri" })));
  }, [userId]);

  const loadBookings = useCallback(async (currentUserId = userId) => {
    if (!currentUserId) return;
    const { data: rawBookings, error: bookingError } = await supabase.from("bookings").select("*").eq("provider_id", currentUserId);
    if (bookingError) { setError(bookingError.message); return; }
    setBookings((rawBookings ?? []) as Booking[]);
  }, [userId]);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData.user;
      if (!user) { router.replace(loc("/login")); return; }
      const [{ data: profile, error: profileError }, { data: details, error: detailsError }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("provider_details").select("*").eq("user_id", user.id).single(),
      ]);
      if (!active) return;
      if (profileError || detailsError || !profile || !details) { setError(profileError?.message ?? detailsError?.message ?? "Usta profili tapılmadı."); setLoading(false); return; }
      setUserId(user.id); setData({ profile: profile as Profile, details: details as ProviderDetails }); setLoading(false); void loadRequests(user.id); void loadBookings(user.id);
    };
    void loadDashboard();
    return () => { active = false; };
  }, [loadRequests, loadBookings, router]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase.channel(`provider-dashboard-${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "service_requests" }, () => void loadRequests())
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `provider_id=eq.${userId}` }, () => void loadBookings())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "provider_details", filter: `user_id=eq.${userId}` }, (payload) => setData((current) => current ? { ...current, details: { ...current.details, ...(payload.new as Partial<ProviderDetails>) } } : current))
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadRequests, loadBookings, userId]);

  const setOnline = async (isOnline: boolean) => {
    if (!userId || !data) return;
    setSavingStatus(true); setError(null);
    const { data: updated, error: updateError } = await supabase.from("provider_details").update({ is_online: isOnline }).eq("user_id", userId).select("*").single();
    if (updateError) setError(updateError.message); else if (updated) setData({ ...data, details: updated as ProviderDetails });
    setSavingStatus(false);
  };

  const updateRequest = async (request: RequestWithCustomer, status: Extract<ServiceRequestStatus, "ACCEPTED" | "REJECTED">) => {
    if (!userId) return;
    setBusyRequestId(request.id); setError(null);
    const { error: updateError } = await supabase.from("service_requests").update({ provider_id: userId, status }).eq("id", request.id);
    if (updateError) setError(updateError.message); else await loadRequests();
    setBusyRequestId(null);
  };

  const stats = useMemo(() => {
    const start = startOfWeek();
    const completedRequests = requests.filter((request) => request.status === "COMPLETED");
    const completedBookings = bookings.filter((booking) => booking.status === "COMPLETED");
    const weeklyRequests = completedRequests.filter((request) => new Date(request.updated_at) >= start).reduce((sum, request) => sum + Number(request.budget), 0);
    const weeklyBookings = completedBookings.filter((booking) => new Date(booking.updated_at) >= start).reduce((sum, booking) => sum + Number(booking.price_offer), 0);
    return {
      weekly: weeklyRequests + weeklyBookings,
      completed: completedRequests.length + completedBookings.length,
      waiting: requests.filter((request) => request.status === "PENDING").length + bookings.filter((booking) => booking.status === "PENDING").length,
    };
  }, [requests, bookings]);

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-7 animate-spin text-primary" /></div>;
  if (!data) return <div className="mx-auto my-10 max-w-lg rounded-2xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 p-5 text-red-700">{error ?? "Panel yüklənmədi."}</div>;
  const pending = data.details.profile_status === "PENDING";

  return <main className="min-h-[calc(100vh-64px)] bg-slate-50/70 dark:bg-background"><div className="mx-auto max-w-7xl space-y-6 px-4 py-7 sm:px-6 lg:px-8"><motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-white dark:bg-card p-5 shadow-sm md:flex-row md:items-center"><div className="flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><UserRound className="size-7" /></div><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold text-foreground">{data.profile.first_name} {data.profile.last_name}</h1>{!pending && <Badge variant="success" className="gap-1 rounded-full"><BadgeCheck className="size-3.5" /> Sənədlər təsdiqlənib</Badge>}</div><p className="mt-1 text-sm text-muted-foreground">{data.details.category}</p></div></div><div className="flex flex-wrap items-center gap-3"><StatusToggle checked={data.details.is_online} disabled={pending} isSaving={savingStatus} onCheckedChange={setOnline} /><Button variant="outline" onClick={() => router.push(loc("/dashboard"))}><ChevronLeft /> Müştəri rejiminə keç</Button></div></motion.header>{pending && <VerificationBanner />}{error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400 px-4 py-3 text-sm text-red-700"><AlertCircle className="size-4" />{error}</div>}<StatsCards weeklyEarnings={stats.weekly} completedCount={stats.completed} rating={Number(data.details.rating ?? 0)} waitingCount={stats.waiting} />{userId && <ProviderBookings userId={userId} />}<OrderFeed requests={requests} canManage={!pending} busyRequestId={busyRequestId} onAccept={(request) => void updateRequest(request, "ACCEPTED")} onReject={(request) => void updateRequest(request, "REJECTED")} onOpenChat={(request) => router.push(loc(`/chat?request=${request.id}&recipient=${request.customer_id}`))} /></div></main>;
}
