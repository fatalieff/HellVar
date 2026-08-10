import { Metadata } from "next";
import { BookingList } from "@/components/booking/booking-list";

export const metadata: Metadata = {
  title: "HəllVar — Sifarişlərim",
  description: "Sifarişlərinizi izləyin, ləğv edin və ustalarla əlaqə saxlayın.",
};

export default function BookingsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)] bg-slate-50/50">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
        <BookingList />
      </main>
    </div>
  );
}
