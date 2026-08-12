"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { Profile, Notification } from "@/lib/types/database";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarPublicUrl } from "@/lib/supabase/avatar";
import {
  Menu,
  Wrench,
  ArrowRight,
  Sparkles,
  LogOut,
  User as UserIcon,
  MessageSquare,
  Bell,
  X,
  Check,
  CheckCheck,
  Star,
  Mail,
  Phone,
  MapPin,
  UserCog,
  CalendarCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "./language-switcher";
import { Container } from "./container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";

const NAV_LINKS: (keyof ReturnType<typeof useI18n>["t"]["nav"])[] = [
  "home",
  "categories",
  "technicians",
  "about",
];

const CHAT_READ_KEY = "hellvar.chatReadAt";

function getChatReadAt(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(CHAT_READ_KEY)) || 0;
  } catch {
    return 0;
  }
}

function persistChatReadAt(timestamp: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_READ_KEY, String(timestamp));
  } catch {
    /* ignore storage errors */
  }
}

// ─── Time formatting helper ──────────────────────────────────────────────────
function formatTimeAgo(dateStr: string, n: Record<string, string>): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return n.justNow;
  if (diff < 3600) return `${Math.floor(diff / 60)} ${n.minutesAgo}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ${n.hoursAgo}`;
  return `${Math.floor(diff / 86400)} ${n.daysAgo}`;
}

// ─── Notification icon per type ──────────────────────────────────────────────
function NotifIcon({ type }: { type: Notification["type"] }) {
  if (type === "new_review")
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <Star className="size-3.5" fill="currentColor" />
      </span>
    );
  if (type === "new_booking" || type === "booking_accepted" || type === "booking_rejected" || type === "booking_completed" || type === "booking_cancelled")
    return (
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
        <CalendarCheck2 className="size-3.5" />
      </span>
    );
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      <MessageSquare className="size-3.5" />
    </span>
  );
}

// ─── Notification dropdown panel ─────────────────────────────────────────────
function NotificationsPanel({
  notifications,
  onMarkAllRead,
  onMarkRead,
  onOpen,
  n,
}: {
  notifications: Notification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onOpen: (notif: Notification) => void;
  n: ReturnType<typeof useI18n>["t"]["notifications"];
}) {
  const unread = notifications.filter((x) => !x.is_read);

  return (
    <div className="w-80 max-w-[92vw] rounded-2xl border border-border/80 bg-popover shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <span className="font-semibold text-sm">{n.title}</span>
        {unread.length > 0 && (
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <CheckCheck className="size-3.5" />
            {n.markAllRead}
          </button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-[340px] divide-y divide-border/40">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-2">
            <Bell className="size-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">{n.empty}</p>
            <p className="text-xs text-muted-foreground/70">{n.emptyHint}</p>
          </div>
        ) : (
          notifications.slice(0, 15).map((notif) => (
            <button
              key={notif.id}
              onClick={() => {
                onMarkRead(notif.id);
                onOpen(notif);
              }}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
                !notif.is_read && "bg-primary/[0.04]"
              )}
            >
              <NotifIcon type={notif.type} />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs leading-snug line-clamp-2",
                    !notif.is_read ? "font-semibold text-foreground" : "text-muted-foreground"
                  )}
                >
                  {notif.title}
                </p>
                {notif.body && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-1 mt-0.5">
                    {notif.body}
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {formatTimeAgo(notif.created_at, n)}
                </p>
              </div>
              {!notif.is_read && (
                <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Profile menu row ───────────────────────────────────────────────────────
function ProfileInfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-1.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/60 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
          {label}
        </p>
        <p className="truncate text-sm text-foreground/85">{value}</p>
      </div>
    </div>
  );
}

// ─── Profile dropdown panel ──────────────────────────────────────────────────
function ProfileMenu({
  user,
  profile,
  onSignOut,
  onViewProfile,
}: {
  user: { email?: string | null };
  profile: Profile | null;
  onSignOut: () => void;
  onViewProfile: () => void;
}) {
  const { t } = useI18n();
  const pm = t.profileMenu;
  const fullName =
    profile?.first_name || profile?.last_name
      ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
      : (user.email?.split("@")[0] ?? "");
  const isProvider = profile?.role === "PROVIDER";
  const roleLabel = isProvider ? pm.roleProvider : pm.roleCustomer;
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const avatarUrl = getAvatarPublicUrl(profile?.avatar_url);

  return (
    <div className="w-80 max-w-[92vw] rounded-2xl border border-border/80 bg-popover shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="relative shrink-0">
          <Avatar className="size-11 border-2 border-background shadow-sm">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName} /> : null}
            <AvatarFallback className="bg-gradient-primary text-white font-bold text-base">
              {initials || <UserIcon className="size-5" />}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-background bg-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{fullName}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border/70 bg-accent/50 px-2.5 py-1 text-[10px] font-semibold text-foreground/80">
          {roleLabel}
        </span>
      </div>

      {/* Contact info */}
      <div className="border-t border-border/60 py-2">
        <ProfileInfoRow icon={<Mail className="size-3.5" />} label={pm.emailLabel} value={user.email} />
        <ProfileInfoRow
          icon={<Phone className="size-3.5" />}
          label={pm.phoneLabel}
          value={profile?.phone || pm.notProvided}
        />
        <ProfileInfoRow
          icon={<MapPin className="size-3.5" />}
          label={pm.addressLabel}
          value={profile?.address || pm.notProvided}
        />
      </div>

      {/* Actions */}
      <div className="border-t border-border/60 p-2 space-y-1">
        <button
          onClick={onViewProfile}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/50"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-accent/60 text-muted-foreground">
            <UserCog className="size-3.5" />
          </span>
          {pm.viewProfile}
        </button>
        <button
          onClick={onSignOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
        >
          <span className="flex size-7 items-center justify-center rounded-lg bg-red-50 text-red-500">
            <LogOut className="size-3.5" />
          </span>
          {t.nav.logout}
        </button>
      </div>
    </div>
  );
}

// ─── Main Navbar component ───────────────────────────────────────────────────
export function Navbar() {
  const { t } = useI18n();
  const n = t.notifications;
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadMessages, setUnreadMessages] = React.useState(0);
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const notifsRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);
  const seenUnreadMessageIds = React.useRef<Set<string>>(new Set());
  const userAvatarUrl = getAvatarPublicUrl(profile?.avatar_url);

  // Scroll effect
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auth + profile
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
        fetchUnreadMessages(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchNotifications(session.user.id);
        fetchUnreadMessages(session.user.id);
      } else {
        setProfile(null);
        setNotifications([]);
        setUnreadMessages(0);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Realtime: notifications
  React.useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  // Realtime: unread chat messages
  React.useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`chat-unread-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const msg = payload.new as {
            sender_id: string;
            id?: string;
            created_at?: string;
          };
          if (msg.sender_id === user.id) return;
          // Ignore messages that were already read (e.g. redelivered on reconnect)
          if (
            msg.created_at &&
            new Date(msg.created_at).getTime() <= getChatReadAt()
          ) {
            return;
          }
          // Dedupe: realtime can redeliver the same INSERT after a reconnect
          if (msg.id) {
            if (seenUnreadMessageIds.current.has(msg.id)) return;
            seenUnreadMessageIds.current.add(msg.id);
          }
          setUnreadMessages((prev) => prev + 1);
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) setProfile(data);
    } catch (err) {
      console.warn("Navbardakı profil oxunarkən xəta:", err);
    }
  };

  const fetchNotifications = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setNotifications(data as Notification[]);
    } catch (err) {
      console.warn("Bildirişlər oxunarkən xəta:", err);
    }
  };

  const fetchUnreadMessages = async (userId: string) => {
    try {
      // Count messages in conversations where user participates and sender != user.
      // Only messages newer than the last time the chat was opened count as unread;
      // the last-read timestamp is persisted so a page reload / tab re-focus does
      // not resurrect the red dot for already-seen messages.
      const { data: convs } = await supabase
        .from("chat_conversations")
        .select("id")
        .or(`participant_low.eq.${userId},participant_high.eq.${userId}`);

      if (!convs || convs.length === 0) return;

      const convIds = convs.map((c) => c.id);
      const lastReadAt = getChatReadAt();
      const cutoff = Math.max(Date.now() - 86400_000, lastReadAt);
      const { count } = await supabase
        .from("chat_messages")
        .select("id", { count: "exact", head: true })
        .in("conversation_id", convIds)
        .neq("sender_id", userId)
        .gt("created_at", new Date(cutoff).toISOString());

      setUnreadMessages(count ?? 0);
    } catch (err) {
      console.warn("Oxunmamış mesajlar yoxlanarkən xəta:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleMarkRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleChatClick = () => {
    setUnreadMessages(0);
    persistChatReadAt(Date.now());
    router.push("/chat");
  };

  const unreadNotifs = notifications.filter((n) => !n.is_read).length;

  return (
    <header
      className={[
        "sticky top-0 z-45 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/80 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-background/50 backdrop-blur",
      ].join(" ")}
    >
      <Container size="xl" className="h-16 flex items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 group"
          aria-label={t.brand.name}
        >
          <span className="relative grid size-9 place-items-center rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-105">
            <Image src="/logo.jpg" alt="HəllVar" width={36} height={36} className="rounded-xl object-cover" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="text-[17px] font-semibold tracking-tight">
              {t.brand.name}
            </span>
            <span className="text-[11px] text-muted-foreground -mt-0.5">
              {t.brand.tagline}
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          {NAV_LINKS.map((k) => {
            const href =
              k === "home"
                ? "/"
                : `/${String(k).replace(/^./, (c) => c.toLowerCase())}`;
            return (
              <Link
                key={k}
                href={href}
                className="relative px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground rounded-md hover:bg-accent/40"
              >
                {t.nav[k]}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />

          {/* DYNAMIC AUTHENTICATED OR UNAUTHENTICATED ACTION LINKS */}
          {user ? (
            <div className="flex items-center gap-1.5 md:gap-2">
              {/* Role-based dashboard button */}
              {profile?.role === "PROVIDER" ? (
                <Button
                  onClick={() => router.push("/provider/dashboard")}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex border-primary/30 text-primary hover:bg-primary/5 font-semibold text-xs h-9 rounded-lg space-x-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.nav.providerPanel}</span>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => router.push("/bookings")}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex border-border text-foreground hover:bg-accent font-semibold text-xs h-9 rounded-lg space-x-1"
                  >
                    <CalendarCheck2 className="w-3.5 h-3.5" />
                    <span>{t.nav.myBookings}</span>
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    size="sm"
                    className="hidden sm:flex border-border text-foreground hover:bg-accent font-semibold text-xs h-9 rounded-lg space-x-1"
                  >
                    <span>{t.nav.customerPanel}</span>
                  </Button>
                </>
              )}

              {/* ── Chat icon with unread badge ── */}
              <button
                onClick={handleChatClick}
                className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-accent/60 transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Çat"
                id="navbar-chat-btn"
              >
                <MessageSquare className="size-[18px]" />
                {unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 flex size-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
                  </span>
                )}
              </button>

              {/* ── Notifications bell with dropdown ── */}
              <div className="relative" ref={notifsRef}>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowNotifs((v) => !v);
                  }}
                  className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-accent/60 transition-colors text-muted-foreground hover:text-foreground"
                  aria-label={n.title}
                  id="navbar-notif-btn"
                >
                  <Bell className="size-[18px]" />
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                      {unreadNotifs > 9 ? "9+" : unreadNotifs}
                    </span>
                  )}
                </button>

                {/* Dropdown panel */}
                {showNotifs && (
                  <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <NotificationsPanel
                      notifications={notifications}
                      onMarkAllRead={handleMarkAllRead}
                      onMarkRead={handleMarkRead}
                      onOpen={(notif) => {
                        const isBooking = notif.type === "new_booking" || notif.type === "booking_accepted" || notif.type === "booking_rejected" || notif.type === "booking_completed" || notif.type === "booking_cancelled";
                        if (isBooking) {
                          setShowNotifs(false);
                          router.push("/bookings");
                        }
                      }}
                      n={n}
                    />
                  </div>
                )}
              </div>

              {/* User Avatar + Profile Menu */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setShowNotifs(false);
                    setShowProfileMenu((v) => !v);
                  }}
                  className="relative flex size-9 items-center justify-center rounded-full bg-gradient-primary text-white font-bold text-sm shadow-sm ring-2 ring-background transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                  aria-label={t.profileMenu.menuLabel}
                  aria-expanded={showProfileMenu}
                  id="navbar-profile-btn"
                >
                  <Avatar className="size-9">
                    {userAvatarUrl ? (
                      <AvatarImage src={userAvatarUrl} alt={t.profileMenu.menuLabel} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-primary text-sm font-bold text-white">
                      {profile?.first_name ? (
                        profile.first_name[0].toUpperCase()
                      ) : (
                        <UserIcon className="size-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className="absolute right-0 top-full mt-2 z-50 origin-top-right"
                    >
                      <ProfileMenu
                        user={user}
                        profile={profile}
                        onViewProfile={() => {
                          setShowProfileMenu(false);
                          router.push("/profile");
                        }}
                        onSignOut={() => {
                          setShowProfileMenu(false);
                          handleSignOut();
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            // Unauthenticated view
            <div className="hidden sm:flex items-center gap-1.5">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">{t.nav.login}</Link>
              </Button>
              <Button variant="premium" size="sm" asChild>
                <Link href="/signup" className="gap-1.5">
                  {t.nav.signup}
                  <ArrowRight className="size-3.5" data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden shrink-0" aria-label="Menu">
                <Menu className="size-4.5" data-icon="inline" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <div className="flex flex-col gap-6 h-full">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-xl overflow-hidden">
                    <Image src="/logo.jpg" alt="HəllVar" width={36} height={36} className="rounded-xl object-cover" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[17px] font-semibold">{t.brand.name}</span>
                    <span className="text-[11px] text-muted-foreground">{t.brand.tagline}</span>
                  </div>
                </div>
                <Separator />
                
                {/* Navigation Links - Always visible on mobile */}
                <nav className="flex flex-col gap-1">
                  {NAV_LINKS.map((k) => {
                    const href =
                      k === "home"
                        ? "/"
                        : `/${String(k).replace(/^./, (c) => c.toLowerCase())}`;
                    return (
                      <Link
                        key={k}
                        href={href}
                        className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent/50 transition-colors"
                      >
                        {t.nav[k]}
                      </Link>
                    );
                  })}
                </nav>

                <Separator />
                
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border">
                        {userAvatarUrl ? (
                          <AvatarImage src={userAvatarUrl} alt="Avatar" />
                        ) : null}
                        <AvatarFallback className="bg-slate-100 font-bold text-muted-foreground">
                          {profile?.first_name ? profile.first_name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">
                          {profile?.first_name} {profile?.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {profile?.role === "PROVIDER" ? "Usta / Mütəxəssis" : "Müştəri"}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Mobile: quick-access chat + notif buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={handleChatClick}
                        className="relative flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium hover:bg-accent/50 transition-colors"
                      >
                        <MessageSquare className="size-4" />
                        Çat
                        {unreadMessages > 0 && (
                          <span className="absolute top-1.5 right-2 size-2 rounded-full bg-red-500" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowNotifs(false);
                          // Mobile: navigate to a simple notifications view inline
                        }}
                        className="relative flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-border text-sm font-medium hover:bg-accent/50 transition-colors"
                      >
                        <Bell className="size-4" />
                        {n.title}
                        {unreadNotifs > 0 && (
                          <span className="absolute top-1.5 right-2 min-w-[15px] h-[15px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                            {unreadNotifs > 9 ? "9+" : unreadNotifs}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Mobile: show unread notifications inline */}
                    {unreadNotifs > 0 && (
                      <div className="rounded-xl border border-border/60 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-2 bg-muted/30">
                          <span className="text-xs font-semibold">{n.title}</span>
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[10px] text-primary"
                          >
                            {n.markAllRead}
                          </button>
                        </div>
                        {notifications
                          .filter((x) => !x.is_read)
                          .slice(0, 3)
                          .map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleMarkRead(notif.id)}
                              className="flex w-full items-start gap-2.5 px-3 py-2.5 border-t border-border/40 text-left hover:bg-accent/30 transition-colors"
                            >
                              <NotifIcon type={notif.type} />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold line-clamp-1">{notif.title}</p>
                                {notif.body && (
                                  <p className="text-[10px] text-muted-foreground line-clamp-1">{notif.body}</p>
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    )}

                    <nav className="flex flex-col gap-1">
                      <Button
                        onClick={() => router.push("/profile")}
                        className="w-full justify-start text-xs font-semibold"
                        variant="outline"
                      >
                        <UserCog className="w-4 h-4 mr-2" />
                        {t.profileMenu.viewProfile}
                      </Button>
                      {profile?.role === "PROVIDER" ? (
                        <Button onClick={() => router.push("/provider/dashboard")} className="w-full justify-start text-xs font-semibold" variant="premium">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t.nav.providerPanel}
                        </Button>
                      ) : (
                        <>
                          <Button onClick={() => router.push("/bookings")} className="w-full justify-start text-xs font-semibold" variant="outline">
                            <CalendarCheck2 className="w-4 h-4 mr-2" />
                            {t.nav.myBookings}
                          </Button>
                          <Button onClick={() => router.push("/dashboard")} className="w-full justify-start text-xs font-semibold" variant="outline">
                            {t.nav.customerPanel}
                          </Button>
                        </>
                      )}
                      
                      <Button onClick={handleSignOut} className="w-full justify-start text-red-500 hover:text-red-600 mt-2 text-xs font-semibold" variant="ghost">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t.nav.logout}
                      </Button>
                    </nav>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/become-technician">{t.nav.becomeTechnician}</Link>
                      </Button>
                    </div>
                    <div className="mt-auto flex flex-col gap-2">
                      <Button asChild variant="ghost" className="w-full">
                        <Link href="/login">{t.nav.login}</Link>
                      </Button>
                      <Button asChild variant="premium" className="w-full">
                        <Link href="/signup">{t.nav.signup}</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
