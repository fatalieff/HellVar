import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HəllVar — Müştəri Ana Səhifəsi",
  description:
    "Yasamal rayonunda və ətrafınızdakı ən yaxşı usta və peşəkarları interaktiv xəritə və filtr vasitəsilə tapın.",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-slate-50/50 dark:bg-background">
      <DashboardClient />
    </div>
  );
}
