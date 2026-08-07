import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HəllVar â€” MÃ¼ÅŸtÉ™ri Ana SÉ™hifÉ™si",
  description: "Yasamal rayonunda vÉ™ É™trafÄ±nÄ±zdakÄ± É™n yaxÅŸÄ± usta vÉ™ peÅŸÉ™karlarÄ± interaktiv xÉ™ritÉ™ vÉ™ filtr vasitÉ™silÉ™ tapÄ±n.",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-slate-50/50">
      <DashboardClient />
    </div>
  );
}

