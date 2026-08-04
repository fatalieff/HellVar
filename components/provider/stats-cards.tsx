import { BriefcaseBusiness, CircleDollarSign, Star, Timer } from "lucide-react";

type Props = { weeklyEarnings: number; completedCount: number; rating: number; activeCount: number };

export function StatsCards({ weeklyEarnings, completedCount, rating, activeCount }: Props) {
  const stats = [{ label: "Bu həftəlik qazanc", value: `${weeklyEarnings.toFixed(0)} AZN`, icon: CircleDollarSign, tone: "text-emerald-600 bg-emerald-50" }, { label: "Tamamlanmış işlər", value: `${completedCount} iş`, icon: BriefcaseBusiness, tone: "text-blue-600 bg-blue-50" }, { label: "Ortalama reytinq", value: `${rating.toFixed(1)} / 5.0`, icon: Star, tone: "text-amber-500 bg-amber-50" }, { label: "Aktiv sifarişlər", value: `${activeCount} gözləmədə`, icon: Timer, tone: "text-violet-600 bg-violet-50" }];
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-2xl border border-border bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p></div><span className={`rounded-xl p-2.5 ${tone}`}><Icon className="size-5" /></span></div></div>)}</section>;
}
