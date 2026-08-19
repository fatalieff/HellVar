"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Inbox,
  Loader2,
  MessageSquare,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { supabase } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  ChatConversation,
  ChatMessage,
  Profile,
  ProviderDetails,
} from "@/lib/types/database";
import {
  ProviderProfileDialog,
  ProviderProfile,
} from "@/components/provider/provider-profile-dialog";

// ─── Shared "chat read" marker (same key as navbar) ─────────────────────────
const CHAT_READ_KEY = "hellvar.chatReadAt";

function persistChatReadAt(timestamp: number) {
  try {
    window.localStorage.setItem(CHAT_READ_KEY, String(timestamp));
  } catch {
    /* ignore storage errors */
  }
}

// ─── Time formatting helper ──────────────────────────────────────────────────
function formatTimeAgo(
  dateStr: string,
  labels: {
    now: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
  },
): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return labels.now;
  if (diff < 3600) return `${Math.floor(diff / 60)} ${labels.minutesAgo}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${labels.hoursAgo}`;
  return `${Math.floor(diff / 86400)} ${labels.daysAgo}`;
}

// ─── Types ──────────────────────────────────────────────────────────────────
type ConversationPreview = {
  conversation: ChatConversation;
  otherUser: Pick<
    Profile,
    "id" | "first_name" | "last_name" | "avatar_url"
  >;
  lastMessage: { body: string; sender_id: string; created_at: string } | null;
};

// =============================================================================
// INBOX VIEW — shown when there is no ?recipient= param
// =============================================================================
function InboxView({
  onOpenChat,
}: {
  onOpenChat: (recipientId: string) => void;
}) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);

  const loadConversations = useCallback(
    async (userId: string) => {
      // 1. Get all conversations for this user
      const { data: convs } = await supabase
        .from("chat_conversations")
        .select("*")
        .or(`participant_low.eq.${userId},participant_high.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (!convs || convs.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      // 2. For each conversation, get the other user's profile and last message
      const previews: ConversationPreview[] = [];
      for (const conv of convs) {
        const otherUserId =
          conv.participant_low === userId
            ? conv.participant_high
            : conv.participant_low;

        const [{ data: profile }, { data: lastMsgs }] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .eq("id", otherUserId)
            .single(),
          supabase
            .from("chat_messages")
            .select("body, sender_id, created_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1),
        ]);

        previews.push({
          conversation: conv as ChatConversation,
          otherUser: profile ?? {
            id: otherUserId,
            first_name: t.chatPage.defaultUser,
            last_name: "",
            avatar_url: null,
          },
          lastMessage: lastMsgs && lastMsgs.length > 0 ? lastMsgs[0] : null,
        });
      }

      setConversations(previews);
      setLoading(false);
    },
    [t],
  );

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace(loc(`/login?redirectTo=${encodeURIComponent(loc("/chat"))}`));
        return;
      }
      if (mounted) {
        setCurrentUserId(user.id);
        await loadConversations(user.id);
      }
    };
    void init();
    return () => {
      mounted = false;
    };
  }, [router, loadConversations]);

  // Realtime: listen for new messages to update inbox
  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase
      .channel(`inbox-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => {
          // Reload conversations to get updated last message
          void loadConversations(currentUserId);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [currentUserId, loadConversations]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50/70 dark:bg-background px-4 py-7">
      <div className="mx-auto flex min-h-[min(680px,calc(100vh-120px))] max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-white dark:bg-card shadow-sm">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Inbox className="size-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{t.chatPage.title}</h1>
            <p className="text-xs text-muted-foreground">
              {t.chatPage.subtitle}
            </p>
          </div>
        </header>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center py-20">
              <Loader2 className="animate-spin text-primary size-6" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-3">
              <div className="flex size-16 items-center justify-center rounded-full bg-slate-100 dark:bg-secondary">
                <MessageSquare className="size-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-muted-foreground">
                {t.chatPage.emptyTitle}
              </p>
              <p className="text-xs text-muted-foreground/70 max-w-xs">
                {t.chatPage.emptyDescription}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {conversations.map(({ conversation, otherUser, lastMessage }) => {
                const fullName =
                  `${otherUser.first_name} ${otherUser.last_name}`.trim();
                const preview = lastMessage
                  ? lastMessage.body.length > 60
                    ? lastMessage.body.slice(0, 60) + "…"
                    : lastMessage.body
                  : t.chatPage.startConversation;
                const timeStr = lastMessage
                  ? formatTimeAgo(lastMessage.created_at, t.chatPage.timeAgo)
                  : formatTimeAgo(conversation.created_at, t.chatPage.timeAgo);
                const isMyLastMsg = lastMessage?.sender_id === currentUserId;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => onOpenChat(otherUser.id)}
                    className="flex w-full items-center gap-3.5 px-5 py-4 text-left transition-colors hover:bg-accent/40 active:bg-accent/60"
                  >
                    {/* Avatar */}
                    <UserAvatar
                      avatarUrl={otherUser.avatar_url}
                      name={fullName}
                      className="size-11"
                      fallbackClassName="bg-linear-to-br from-primary/80 to-primary text-white text-sm"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-foreground truncate">
                          {fullName}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70 shrink-0 font-medium">
                          {timeStr}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate leading-relaxed">
                        {isMyLastMsg && (
                          <span className="text-muted-foreground/50">
                            {t.chatPage.youPrefix} {""}
                          </span>
                        )}
                        {preview}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// =============================================================================
// ACTIVE CHAT VIEW — shown when ?recipient= param is present
// =============================================================================
function ActiveChatView({ recipientId }: { recipientId: string }) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<Profile["role"] | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<Profile | null>(null);
  const [recipientProvider, setRecipientProvider] = useState<ProviderProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark chat as read while the conversation is on screen. Keeps the navbar
  // red dot consistent when entering the chat via a direct link (e.g. bookings).
  useEffect(() => {
    if (!conversationId) return;
    persistChatReadAt(Date.now());
  }, [conversationId, messages]);

  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const initialize = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) {
        router.replace(
          `/login?redirectTo=${encodeURIComponent(`/chat?recipient=${recipientId}`)}`,
        );
        return;
      }
      if (user.id === recipientId) {
        if (mounted) {
          setError(t.chatPage.selfChatError);
          setLoading(false);
        }
        return;
      }

      const [low, high] = [user.id, recipientId].sort();
      const { data: existing, error: existingError } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("participant_low", low)
        .eq("participant_high", high)
        .maybeSingle();
      if (existingError) {
        if (mounted) {
          setError(existingError.message);
          setLoading(false);
        }
        return;
      }

      let resolvedConversationId = existing?.id;
      if (!resolvedConversationId) {
        const { data: created, error: createError } = await supabase
          .from("chat_conversations")
          .insert({ participant_low: low, participant_high: high })
          .select("id")
          .single();
        if (createError) {
          const { data: racedConversation } = await supabase
            .from("chat_conversations")
            .select("id")
            .eq("participant_low", low)
            .eq("participant_high", high)
            .maybeSingle();
          resolvedConversationId = racedConversation?.id;
          if (!resolvedConversationId) {
            if (mounted) {
              setError(createError.message);
              setLoading(false);
            }
            return;
          }
        } else {
          resolvedConversationId = created.id;
        }
      }

      const [
        { data: initialMessages, error: messagesError },
        { data: recipientProfile },
        { data: currentProfile },
      ] = await Promise.all([
        supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", resolvedConversationId)
          .order("created_at", { ascending: true }),
        supabase
          .from("profiles")
          .select("id, first_name, last_name, avatar_url, phone, address")
          .eq("id", recipientId)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("id, role")
          .eq("id", user.id)
          .maybeSingle(),
      ]);
      if (!mounted) return;
      if (messagesError) {
        setError(messagesError.message);
        setLoading(false);
        return;
      }

      const { data: recipientDetails } = await supabase
        .from("provider_details")
        .select("*")
        .eq("user_id", recipientId)
        .maybeSingle();

      setCurrentUserId(user.id);
      setCurrentUserRole((currentProfile?.role as Profile["role"]) ?? null);
      setConversationId(resolvedConversationId);
      setRecipient(recipientProfile as Profile | null);
      setRecipientProvider(
        recipientDetails
          ? {
              ...(recipientDetails as ProviderDetails),
              profiles: (recipientProfile as Profile) ?? null,
            }
          : null,
      );
      setMessages((initialMessages ?? []) as ChatMessage[]);
      setLoading(false);

      channel = supabase
        .channel(`chat-${resolvedConversationId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `conversation_id=eq.${resolvedConversationId}`,
          },
          (payload) =>
            setMessages((current) =>
              current.some((message) => message.id === payload.new.id)
                ? current
                : [...current, payload.new as ChatMessage],
            ),
        )
        .subscribe();
    };
    void initialize();
    return () => {
      mounted = false;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [recipientId, router]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || !conversationId || !currentUserId) return;
    setSending(true);
    setError(null);
    const { data, error: sendError } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        body: text,
      })
      .select("*")
      .single();
    if (sendError) setError(sendError.message);
    else if (data) {
      setMessages((current) =>
        current.some((message) => message.id === data.id)
          ? current
          : [...current, data as ChatMessage],
      );
      setBody("");
    }
    setSending(false);
  };

  const title = recipient
    ? [recipient.first_name, recipient.last_name]
        .filter(Boolean)
        .join(" ")
        .trim() || t.chatPage.chatTitle
    : t.chatPage.chatTitle;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50/70 dark:bg-background px-4 py-7">
      <div className="mx-auto flex min-h-[min(680px,calc(100vh-120px))] max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-white dark:bg-card shadow-sm">
        <header className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(loc("/chat"))}
            aria-label={t.chatPage.backAriaLabel}
          >
            <ArrowLeft />
          </Button>
          <button
            type="button"
            onClick={() => recipientProvider && setProfileOpen(true)}
            disabled={!recipientProvider}
            title={recipientProvider ? t.dashboard.viewProfile : undefined}
            className={`group flex items-center gap-3 rounded-xl pr-2 text-left ${
              recipientProvider
                ? "cursor-pointer hover:bg-accent/40 transition-colors"
                : "cursor-default"
            }`}
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
              <UserAvatar
                avatarUrl={recipient?.avatar_url}
                name={title}
                className="size-10"
                fallbackClassName="bg-primary/10 text-primary"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold group-hover:text-primary transition-colors truncate">
                {title}
              </h1>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">{t.chatPage.liveChat}</p>
            </div>
          </button>
        </header>

        <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="rounded-xl bg-red-50 dark:bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          ) : messages.length === 0 ? (
            <p className="pt-24 text-center text-sm text-muted-foreground">
              {t.chatPage.emptyState}
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`w-fit max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  message.sender_id === currentUserId
                    ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-slate-100 dark:bg-secondary text-foreground"
                }`}
              >
                <p>{message.body}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    message.sender_id === currentUserId
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString("az-AZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>

        <form onSubmit={send} className="flex gap-2 border-t border-border p-4">
          <Input
            value={body}
            maxLength={2000}
            disabled={loading || Boolean(error)}
            onChange={(event) => setBody(event.target.value)}
            placeholder={t.chatPage.inputPlaceholder}
          />
          <Button type="submit" disabled={sending || loading || !body.trim()}>
            {sending ? <Loader2 className="animate-spin" /> : <Send />}{" "}
            {t.chatPage.sendButton}
          </Button>
        </form>
      </div>

      <ProviderProfileDialog
        open={profileOpen}
        provider={recipientProvider}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        onClose={() => setProfileOpen(false)}
      />
    </main>
  );
}

// =============================================================================
// MAIN EXPORT — decides which view to show
// =============================================================================
export function ChatClient() {
  const params = useSearchParams();
  const recipientId = params.get("recipient");
  const router = useRouter();
  const { locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);

  if (recipientId) {
    return <ActiveChatView recipientId={recipientId} />;
  }

  return (
    <InboxView onOpenChat={(id) => router.push(loc(`/chat?recipient=${id}`))} />
  );
}
