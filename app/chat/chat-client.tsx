"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const send = (event: FormEvent) => { event.preventDefault(); const text = message.trim(); if (!text) return; setMessages((current) => [...current, text]); setMessage(""); };
  return <main className="min-h-[calc(100vh-64px)] bg-slate-50/70 px-4 py-7"><div className="mx-auto flex max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm"><header className="flex items-center gap-3 border-b border-border px-5 py-4"><Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Geri qayıt"><ArrowLeft /></Button><div><h1 className="font-bold">Müştəri ilə çat</h1><p className="text-xs text-muted-foreground">Sifariş #{params.get("request")?.slice(0, 8) ?? "—"}</p></div></header><div className="min-h-[360px] space-y-3 p-5">{messages.length === 0 ? <p className="pt-24 text-center text-sm text-muted-foreground">Sifariş qəbul edildi. Müştəriyə ilk mesajınızı göndərin.</p> : messages.map((item, index) => <div key={`${item}-${index}`} className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2 text-sm text-primary-foreground">{item}</div>)}</div><form onSubmit={send} className="flex gap-2 border-t border-border p-4"><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Mesaj yazın..." /><Button type="submit"><Send /> Göndər</Button></form></div></main>;
}
