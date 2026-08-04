"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase/client";
import { ChatMessage, Profile } from "@/lib/types/database";

export function ChatClient() {
  const router = useRouter();
  const params = useSearchParams();
  const recipientId = params.get("recipient");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<Pick<Profile, "first_name" | "last_name"> | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!recipientId) { setError("Çat üçün usta seçilməyib."); setLoading(false); return; }
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const initialize = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) { router.replace(`/login?redirectTo=${encodeURIComponent(`/chat?recipient=${recipientId}`)}`); return; }
      if (user.id === recipientId) { if (mounted) { setError("Özünüzlə çat yarada bilməzsiniz."); setLoading(false); } return; }

      const [low, high] = [user.id, recipientId].sort();
      const { data: existing, error: existingError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("participant_low", low)
        .eq("participant_high", high)
        .maybeSingle();
      if (existingError) { if (mounted) { setError(existingError.message); setLoading(false); } return; }

      let resolvedConversationId = existing?.id;
      if (!resolvedConversationId) {
        const { data: created, error: createError } = await supabase
          .from("chat_conversations")
          .insert({ participant_low: low, participant_high: high })
          .select("id")
          .single();
        if (createError) {
          const { data: racedConversation } = await supabase.from("chat_conversations").select("id").eq("participant_low", low).eq("participant_high", high).maybeSingle();
          resolvedConversationId = racedConversation?.id;
          if (!resolvedConversationId) { if (mounted) { setError(createError.message); setLoading(false); } return; }
        } else {
          resolvedConversationId = created.id;
        }
      }

      const [{ data: initialMessages, error: messagesError }, { data: recipientProfile }] = await Promise.all([
        supabase.from("chat_messages").select("*").eq("conversation_id", resolvedConversationId).order("created_at", { ascending: true }),
        supabase.from("profiles").select("first_name, last_name").eq("id", recipientId).maybeSingle(),
      ]);
      if (!mounted) return;
      if (messagesError) { setError(messagesError.message); setLoading(false); return; }
      setCurrentUserId(user.id);
      setConversationId(resolvedConversationId);
      setRecipient(recipientProfile ?? null);
      setMessages((initialMessages ?? []) as ChatMessage[]);
      setLoading(false);

      channel = supabase.channel(`chat-${resolvedConversationId}`).on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages", filter: `conversation_id=eq.${resolvedConversationId}` },
        (payload) => setMessages((current) => current.some((message) => message.id === payload.new.id) ? current : [...current, payload.new as ChatMessage])
      ).subscribe();
    };
    void initialize();
    return () => { mounted = false; if (channel) void supabase.removeChannel(channel); };
  }, [recipientId, router]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !conversationId || !currentUserId) return;
    setSending(true); setError(null);
    const { data, error: sendError } = await supabase.from("chat_messages").insert({ conversation_id: conversationId, sender_id: currentUserId, body: text }).select("*").single();
    if (sendError) setError(sendError.message); else if (data) { setMessages((current) => current.some((message) => message.id === data.id) ? current : [...current, data as ChatMessage]); setBody(""); }
    setSending(false);
  };

  const title = recipient ? `${recipient.first_name} ${recipient.last_name}` : "Çat";
  return <main className="min-h-[calc(100vh-64px)] bg-slate-50/70 px-4 py-7"><div className="mx-auto flex min-h-[min(680px,calc(100vh-120px))] max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm"><header className="flex items-center gap-3 border-b border-border px-5 py-4"><Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Geri qayıt"><ArrowLeft /></Button><div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound className="size-5" /></div><div><h1 className="font-bold">{title}</h1><p className="text-xs text-emerald-600">Canlı çat</p></div></header><div className="flex-1 space-y-3 overflow-y-auto p-5">{loading ? <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" /></div> : error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : messages.length === 0 ? <p className="pt-24 text-center text-sm text-muted-foreground">Söhbətə başlayın — mesajınız qarşı tərəfə dərhal çatacaq.</p> : messages.map((message) => <div key={message.id} className={`w-fit max-w-[80%] rounded-2xl px-4 py-2 text-sm ${message.sender_id === currentUserId ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-slate-100 text-foreground"}`}><p>{message.body}</p><p className={`mt-1 text-[10px] ${message.sender_id === currentUserId ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{new Date(message.created_at).toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" })}</p></div>)}<div ref={bottomRef} /></div><form onSubmit={send} className="flex gap-2 border-t border-border p-4"><Input value={body} maxLength={2000} disabled={loading || Boolean(error)} onChange={(event) => setBody(event.target.value)} placeholder="Mesaj yazın..." /><Button type="submit" disabled={sending || loading || !body.trim()}>{sending ? <Loader2 className="animate-spin" /> : <Send />} Göndər</Button></form></div></main>;
}
