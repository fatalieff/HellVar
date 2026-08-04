import type { Metadata } from "next";
import { ProviderDashboardClient } from "@/components/provider/provider-dashboard-client";

export const metadata: Metadata = { title: "Usta İdarəetmə Paneli", description: "Sifarişlərinizi, qazancınızı və xəritədə görünürlüğünüzü idarə edin." };

export default function ProviderDashboardPage() { return <ProviderDashboardClient />; }
