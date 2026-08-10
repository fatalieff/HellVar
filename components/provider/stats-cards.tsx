"use client";

import { BriefcaseBusiness, CircleDollarSign, Star, Timer } from "lucide-react";
import { useI18n } from "@/lib/i18n/i18n-context";

type Props = { weeklyEarnings: number; completedCount: number; rating: number; waitingCount: number };

export function StatsCards({ weeklyEarnings, completedCount, rating, waitingCount }: Props) {
  const { t } = useI18n();
  const stats = [
    { label: t.providerDashboard.weeklyEarnings, value: `${weeklyEarnings.toFixed(0)} ${t.providerDashboard.currencyUnit}`, icon: CircleDollarSign, tone: "text-emerald-600 bg-emerald-50" },
    { label: t.providerDashboard.completedJobs, value: t.providerDashboard.jobUnit.replace("{count}", String(completedCount)), icon: BriefcaseBusiness, tone: "text-blue-600 bg-blue-50" },
    { label: t.providerDashboard.averageRating, value: `${rating.toFixed(1)} ${t.providerDashboard.ratingUnit}`, icon: Star, tone: "text-amber-500 bg-amber-50" },
    { label: t.providerDashboard.waitingOrders, value: t.providerDashboard.waitingUnit.replace("{count}", String(waitingCount)), icon: Timer, tone: "text-violet-600 bg-violet-50" },
  ];
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p></div><span className={`rounded-xl p-2.5 ${tone}`}><Icon className="size-5" /></span></div></div>)}</section>;
}
