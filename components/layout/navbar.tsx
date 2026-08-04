"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/lib/types/database";
import { Menu, Wrench, ArrowRight, Sparkles, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { LanguageSwitcher } from "./language-switcher";
import { Container } from "./container";
import { useI18n } from "@/lib/i18n/i18n-context";

const NAV_LINKS: (keyof ReturnType<typeof useI18n>["t"]["nav"])[] = [
  "home",
  "categories",
  "technicians",
  "about",
];

export function Navbar() {
  const { t } = useI18n();
  const router = useRouter();
  const [scrolled, setScrolled] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check user session and profile role dynamically
  React.useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!error && data) {
        setProfile(data);
      }
    } catch (err) {
      console.warn("Navbardakı profil oxunarkən xəta:", err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
          <span className="relative grid size-9 place-items-center rounded-xl bg-gradient-primary shadow-glow-primary transition-transform duration-300 group-hover:scale-105">
            <Wrench className="size-4.5 text-white" data-icon="inline" />
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

        {/* Desktop nav links - hide if user is logged in to keep a clean admin style, or keep them */}
        {!user && (
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
        )}

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />

          {/* DYNAMIC AUTHENTICATED OR UNAUTHENTICATED ACTION LINKS */}
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
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
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex border-border text-foreground hover:bg-accent font-semibold text-xs h-9 rounded-lg space-x-1"
                >
                  <span>{t.nav.customerPanel}</span>
                </Button>
              )}

              {/* User Avatar Circle */}
              <div className="w-8 h-8 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-background">
                {profile?.first_name ? profile.first_name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
              </div>

              {/* Sign out button */}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-red-500 h-9 w-9"
                title={t.nav.logout}
              >
                <LogOut className="w-4.5 h-4.5" />
              </Button>
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
                  <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary">
                    <Wrench className="size-4.5 text-white" />
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[17px] font-semibold">{t.brand.name}</span>
                    <span className="text-[11px] text-muted-foreground">{t.brand.tagline}</span>
                  </div>
                </div>
                <Separator />
                
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-muted-foreground border">
                        {profile?.first_name ? profile.first_name[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                      </div>
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
                    <nav className="flex flex-col gap-1">
                      {profile?.role === "PROVIDER" ? (
                        <Button onClick={() => router.push("/provider/dashboard")} className="w-full justify-start text-xs font-semibold" variant="premium">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t.nav.providerPanel}
                        </Button>
                      ) : (
                        <Button onClick={() => router.push("/dashboard")} className="w-full justify-start text-xs font-semibold" variant="outline">
                          {t.nav.customerPanel}
                        </Button>
                      )}
                      
                      <Button onClick={handleSignOut} className="w-full justify-start text-red-500 hover:text-red-600 mt-2 text-xs font-semibold" variant="ghost">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t.nav.logout}
                      </Button>
                    </nav>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
