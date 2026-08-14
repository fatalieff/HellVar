"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ChatConversation, ChatMessage, Profile } from "@/lib/types/database";

type Preview = {
  conversation: ChatConversation;
  contactId: string;
  contactName: string;
  contactAvatarUrl: string | null;
  lastMessage?: ChatMessage;
};

export function ChatInbox({ userId }: { userId: string }) {
  const router = useRouter();
  const { locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);
  const [conversations, setConversations] = useState<Preview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInbox = useCallback(async () => {
    const { data: conversationRows, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .or(`participant_low.eq.${userId},participant_high.eq.${userId}`)
      .order("last_message_at", { ascending: false });
    if (error) {
      setLoading(false);
      return;
    }
    const rows = (conversationRows ?? []) as ChatConversation[];
    const contactIds = rows.map((conversation) =>
      conversation.participant_low === userId
        ? conversation.participant_high
        : conversation.participant_low,
    );

    const [
      { data: profileRows },
      { data: messageRows },
    ] = await Promise.all([
      contactIds.length
        ? supabase
            .from("profiles")
            .select("id, first_name, last_name, avatar_url")
            .in("id", contactIds)
        : Promise.resolve({
            data: [] as Pick<
              Profile,
              "id" | "first_name" | "last_name" | "avatar_url"
            >[],
          }),
      rows.length
        ? supabase
            .from("chat_messages")
            .select("*")
            .in(
              "conversation_id",
              rows.map((conversation) => conversation.id),
            )
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as ChatMessage[] }),
    ]);

    const profiles = new Map(
      (profileRows ?? []).map((profile) => [
        profile.id,
        `${profile.first_name} ${profile.last_name}`,
      ]),
    );
    const avatars = new Map(
      (profileRows ?? []).map((profile) => [
        profile.id,
        profile.avatar_url ?? null,
      ]),
    );
    const latest = new Map<string, ChatMessage>();
    for (const message of (messageRows ?? []) as ChatMessage[]) {
      if (!latest.has(message.conversation_id)) {
        latest.set(message.conversation_id, message);
      }
    }

    setConversations(
      rows.map((conversation) => {
        const contactId =
          conversation.participant_low === userId
            ? conversation.participant_high
            : conversation.participant_low;
        return {
          conversation,
          contactId,
          contactName: profiles.get(contactId) ?? "Müştəri",
          contactAvatarUrl: avatars.get(contactId) ?? null,
          lastMessage: latest.get(conversation.id),
        };
      }),
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    const channel = supabase
      .channel(`provider-inbox-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        () => void loadInbox(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadInbox, userId]);

  return (
    <section className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="font-bold text-foreground">Mesajlar</h2>
          <p className="text-sm text-muted-foreground">
            Müştərilər ilə aktiv söhbətlər
          </p>
        </div>
        <MessageCircle className="size-5 text-primary" />
      </div>

      {loading ? (
        <div className="flex h-24 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-muted-foreground">
          Hələ heç bir mesajınız yoxdur.
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map(
            ({ conversation, contactId, contactName, contactAvatarUrl, lastMessage }) => (
              <button
                key={conversation.id}
                onClick={() => router.push(loc(`/chat?recipient=${contactId}`))}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50"
              >
                <UserAvatar
                  avatarUrl={contactAvatarUrl}
                  name={contactName}
                  className="size-10"
                  fallbackClassName="bg-primary/10 text-primary"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {contactName}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {lastMessage?.body ?? "Söhbətə başlayın"}
                  </p>
                </div>
                <div className="text-right">
                  <Send className="ml-auto size-4 text-muted-foreground" />
                  {lastMessage && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(lastMessage.created_at).toLocaleTimeString(
                        "az-AZ",
                        { hour: "2-digit", minute: "2-digit" },
                      )}
                    </p>
                  )}
                </div>
              </button>
            ),
          )}
        </div>
      )}
    </section>
  );
}
