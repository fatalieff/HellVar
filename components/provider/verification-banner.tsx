import { ShieldAlert } from "lucide-react";

export function VerificationBanner() {
  return <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950"><div className="mt-0.5 rounded-full bg-amber-200 p-1.5"><ShieldAlert className="size-4" /></div><div><p className="font-semibold">Profiliniz yoxlanışdadır</p><p className="mt-0.5 text-sm text-amber-900/80">Sənədləriniz təsdiqləndikdən sonra xəritədə görünəcək və iş qəbul edə biləcəksiniz.</p></div></div>;
}
