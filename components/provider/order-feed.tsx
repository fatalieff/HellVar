"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Check, ImageIcon, MapPin, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RequestWithCustomer } from "./types";
import { ChatInbox } from "./chat-inbox";
import { supabase } from "@/lib/supabase/client";

type Props = { requests: RequestWithCustomer[]; canManage: boolean; busyRequestId?: string | null; onAccept: (request: RequestWithCustomer) => void; onReject: (request: RequestWithCustomer) => void; onOpenChat: (request: RequestWithCustomer) => void };

export function OrderFeed({ requests, canManage, busyRequestId, onAccept, onReject, onOpenChat }: Props) {
  const visible = requests.filter((request) => request.status === "PENDING" || request.status === "ACCEPTED");
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => { void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);
  return <div className="space-y-6"><section className="rounded-2xl border border-border bg-white dark:bg-card shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4"><div><h2 className="font-bold text-foreground">Canlı iş təklifləri</h2><p className="text-sm text-muted-foreground">İş radiusunuzdan gələn son sifarişlər</p></div><Badge variant="accent" className="rounded-full">{visible.length} aktiv</Badge></div><div className="divide-y divide-border"><AnimatePresence initial={false}>{visible.map((request) => { const accepted = request.status === "ACCEPTED"; const busy = busyRequestId === request.id; return <motion.article key={request.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} className="p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><div className="flex min-w-0 flex-1 gap-3">{request.photo_url ? <img src={request.photo_url} alt="Sifariş fotosu" className="size-16 rounded-xl object-cover" /> : <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-secondary text-slate-400"><ImageIcon className="size-6" /></div>}<div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-foreground">{request.customerName}</p>{request.distance_km != null && <span className="inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{Number(request.distance_km).toFixed(1)} km uzaqlıqda</span>}</div><p className="mt-1 text-sm text-muted-foreground">{request.description}</p><Badge variant="secondary" className="mt-2 rounded-full">{request.category}</Badge></div></div><div className="flex flex-wrap items-center gap-2 lg:justify-end"><span className="mr-2 text-lg font-bold text-foreground">{Number(request.budget).toFixed(0)} AZN</span>{accepted ? <Button size="sm" onClick={() => onOpenChat(request)}><MessageCircle /> Çata keç</Button> : <><Button size="sm" variant="outline" disabled={!canManage || busy} onClick={() => onReject(request)}><X /> Rədd et</Button><Button size="sm" disabled={!canManage || busy} onClick={() => onAccept(request)}><Check /> Qəbul et</Button></>}</div></div></motion.article>; })}</AnimatePresence>{visible.length === 0 && <div className="px-5 py-14 text-center text-sm text-muted-foreground">Hazırda radiusunuzda yeni iş təklifi yoxdur.</div>}</div></section>{userId && <ChatInbox userId={userId} />}</div>;
}
