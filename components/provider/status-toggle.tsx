"use client";

import { Loader2, MapPin, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { checked: boolean; disabled?: boolean; isSaving?: boolean; onCheckedChange: (checked: boolean) => void };

export function StatusToggle({ checked, disabled, isSaving, onCheckedChange }: Props) {
  return <div className="flex items-center gap-3 rounded-2xl border border-border bg-white dark:bg-card px-3 py-2 shadow-sm"><span className={`size-2.5 rounded-full ${checked ? "bg-emerald-500 shadow-[0_0_0_4px_rgb(16_185_129_/_0.15)]" : "bg-slate-300 dark:bg-slate-600"}`} /><div className="hidden text-left sm:block"><p className="text-xs font-medium text-muted-foreground">Xəritədə görünürlük</p><p className={`text-sm font-bold ${checked ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-muted-foreground"}`}>{checked ? "Onlayn" : "Oflayn"}</p></div><Button type="button" size="icon" variant={checked ? "default" : "outline"} disabled={disabled || isSaving} aria-label={checked ? "Xəritədə görünməyi söndür" : "Xəritədə görün"} onClick={() => onCheckedChange(!checked)} className="rounded-xl">{isSaving ? <Loader2 className="animate-spin" /> : checked ? <Radio /> : <MapPin />}</Button></div>;
}
