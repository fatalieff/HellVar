"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Bolt,
  Search,
  Zap,
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Refrigerator,
  Sofa,
  Sparkles as CleaningIcon,
  Wrench,
  Truck,
  Scissors,
  ChevronRight,
  Star,
  Loader2,
  AlertTriangle,
  Heart,
  Laptop,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/home/tilt-card";
import { TypewriterText } from "@/components/home/typewriter-text";

const Hero3DScene = dynamic(
  () => import("@/components/home/hero-3d-scene").then((m) => m.Hero3DScene),
  { ssr: false, loading: () => null }
);

type CategoryKey =
  | "electric"
  | "plumbing"
  | "cleaning"
  | "nanny"
  | "boiler"
  | "it_tech"
  | "repair"
  | "moving"
  | "barber";

const CATEGORY_META: Record<
  CategoryKey,
  { Icon: React.ComponentType<{ className?: string }>; tone: string; image: string }
> = {
  electric: {
    Icon: Bolt,
    tone: "from-amber-400/20 to-yellow-500/10 text-amber-600",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
  },
  plumbing: {
    Icon: Droplets,
    tone: "from-sky-400/20 to-blue-500/10 text-sky-600",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop",
  },
  cleaning: {
    Icon: CleaningIcon,
    tone: "from-emerald-400/20 to-green-500/10 text-emerald-600",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop",
  },
  nanny: {
    Icon: Heart,
    tone: "from-pink-400/20 to-rose-500/10 text-pink-600",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
  },
  boiler: {
    Icon: Flame,
    tone: "from-orange-400/20 to-red-500/10 text-orange-600",
    image: "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=400&auto=format&fit=crop",
  },
  it_tech: {
    Icon: Laptop,
    tone: "from-indigo-400/20 to-violet-500/10 text-indigo-600",
    image: "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=400&auto=format&fit=crop",
  },
  repair: {
    Icon: Wrench,
    tone: "from-amber-500/20 to-orange-500/10 text-orange-600",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
  },
  moving: {
    Icon: Truck,
    tone: "from-purple-400/20 to-indigo-500/10 text-indigo-600",
    image: "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=400&auto=format&fit=crop",
  },
  barber: {
    Icon: Scissors,
    tone: "from-slate-400/20 to-zinc-500/10 text-slate-600",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=400&auto=format&fit=crop",
  },
};

const CATEGORIES: CategoryKey[] = [
  "electric",
  "plumbing",
  "cleaning",
  "nanny",
  "boiler",
  "it_tech",
  "repair",
  "moving",
  "barber",
];

export default function Home() {
  const { t } = useI18n();
  const cats = t.categories;
  const [query, setQuery] = React.useState("");
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [advice, setAdvice] = React.useState<{ category: string; advice: string; urgent: boolean } | null>(null);
  const [adviceError, setAdviceError] = React.useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = React.useState(false);

  const getAdvice = async () => {
    if (query.trim().length < 3) { setAdviceError(t.homePage.queryTooShort); return; }
    setAdviceLoading(true); setAdvice(null); setAdviceError(null);
    try {
      const response = await fetch("/api/ai-advice", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ problem: query }) });
      const result = await response.json() as { category?: string; advice?: string; urgent?: boolean; error?: string };
      if (!response.ok || !result.category || !result.advice) throw new Error(result.error ?? t.homePage.adviceError);
      setAdvice({ category: result.category, advice: result.advice, urgent: Boolean(result.urgent) });
    } catch (error) { setAdviceError(error instanceof Error ? error.message : t.homePage.adviceError); }
    finally { setAdviceLoading(false); }
  };

  return (
    <div className="flex flex-col">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-background">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% -10%, oklch(0.7900 0.1400 70.00 / 0.10), transparent 45%), radial-gradient(circle at 92% 0%, oklch(0.6231 0.1880 41.11 / 0.10), transparent 42%), linear-gradient(180deg, oklch(0.9880 0.0030 90.00) 0%, oklch(0.9850 0.0020 90.00) 100%)",
          }}
        />
        <Hero3DScene />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
        />

        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-6 animate-fade-up">
            <h1
              aria-label={t.hero.title}
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-[1.1] text-foreground animate-lift [animation-delay:120ms]"
            >
              <TypewriterText aria-hidden text={t.hero.title} />
            </h1>

            <p className="text-base sm:text-lg text-foreground/70 max-w-xl mx-auto leading-7 animate-lift [animation-delay:180ms]">
              {t.hero.subtitle}
            </p>

            {/* Search bar */}
            <form
              role="search"
              onSubmit={(e) => { e.preventDefault(); void getAdvice(); }}
              className="mt-3 w-full max-w-2xl mx-auto animate-lift [animation-delay:240ms]"
            >
              <motion.div
                className="relative"
                animate={{ rotateY: searchFocused ? [0, -8, 0] : 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{ transformPerspective: 900, transformStyle: "preserve-3d" }}
              >
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-primary/35 via-accent/30 to-primary/25 blur-xl"
                  initial={false}
                  animate={{ opacity: searchFocused ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                <div className="group relative flex items-center overflow-hidden rounded-2xl border border-border/80 bg-card shadow-premium-lg p-1.5 transition-all duration-300 hover:shadow-[0_20px_60px_-20px_oklch(0.6231_0.1880_41.11_/_0.35)] focus-within:shadow-[0_0_0_4px_oklch(0.6231_0.1880_41.11_/_0.12)] focus-within:border-primary/40">
                  <div className="flex items-center gap-2 pl-3 pr-2 text-muted-foreground">
                    <Search className="size-5" />
                  </div>
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    type="search"
                    placeholder={t.hero.searchPlaceholder}
                    className="h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-base px-1 placeholder:text-muted-foreground/80"
                  />
                  <Button
                    type="submit"
                    variant="premium"
                    size="lg"
                    className="h-12 shrink-0 rounded-xl px-5 gap-1.5"
                  >
                    <Zap className="size-4" data-icon="inline-start" />
                    {adviceLoading ? <Loader2 className="size-4 animate-spin" /> : t.hero.searchButton}
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Button>
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    style={{ transformPerspective: 600, rotateX: -22, rotateZ: 6 }}
                    animate={searchFocused ? { x: ["-220%", "420%"] } : { x: "-220%" }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            </form>
            {(advice || adviceError) && (
              <div
                className={cn(
                  "mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border text-left shadow-[0_24px_80px_-32px_oklch(0.15_0.02_260_/_0.25)] backdrop-blur-sm animate-lift",
                  advice
                    ? advice.urgent
                      ? "border-red-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(254,242,242,0.96))]"
                      : "border-primary/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,247,237,0.92))]"
                    : "border-amber-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,251,235,0.96))]"
                )}
              >
                <div
                  className={cn(
                    "h-1.5 w-full",
                    advice
                      ? advice.urgent
                        ? "bg-gradient-to-r from-red-500 via-orange-400 to-amber-300"
                        : "bg-gradient-to-r from-primary via-orange-400 to-amber-300"
                      : "bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200"
                  )}
                />
                <div className="p-5 sm:p-6">
                  {advice ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border shadow-sm",
                            advice.urgent
                              ? "border-red-200 bg-red-50 text-red-600"
                              : "border-primary/15 bg-primary/10 text-primary"
                          )}
                        >
                          {advice.urgent ? (
                            <AlertTriangle className="size-5" />
                          ) : (
                            <Sparkles className="size-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={advice.urgent ? "destructive" : "accent"}
                              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                            >
                              {advice.urgent ? t.homePage.aiUrgentBadge : t.homePage.aiSuggestionBadge}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="rounded-full border-border/70 bg-white/70 px-3 py-1 text-[11px] font-medium text-foreground/70"
                            >
                              {advice.category}
                            </Badge>
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                              {advice.urgent
                                ? t.homePage.aiUrgentTitle
                                : t.homePage.aiSuggestionTitle}
                            </p>
                            <p className="text-sm leading-7 text-foreground/75 sm:text-[15px]">
                              {advice.advice}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            {t.homePage.nextStepLabel}
                          </p>
                          <p className="text-sm text-foreground/75">
                            {t.homePage.nextStepDesc}
                          </p>
                        </div>

                        <Button
                          asChild
                          variant="premium"
                          className="h-11 rounded-2xl px-5 shadow-premium"
                        >
                          <Link href="/dashboard">
                            {t.homePage.showMatchingProviders}
                            <ArrowRight className="size-4" data-icon="inline-end" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 shadow-sm">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Badge
                          variant="warning"
                          className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em]"
                        >
                        {t.homePage.aiErrorBadge}
                        </Badge>
                        <p className="mt-3 text-sm leading-7 text-foreground/80 sm:text-[15px]">
                          {adviceError}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ===== CATEGORIES ===== */}
          <div className="mt-16 sm:mt-20 animate-fade-up [animation-delay:360ms]">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  {t.hero.popularCategories}
                </h2>
              </div>
              <Link
                href="/categories"
                className="group hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.common.viewAll}
                <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {CATEGORIES.map((k, i) => {
                const { Icon, tone, image } = CATEGORY_META[k];
                return (
                  <TiltCard key={k} className="h-full" maxTilt={11} scale={1.03}>
                    <Card
                      className="group flex flex-col h-full overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-premium-lg hover:border-primary/20 animate-lift"
                      style={{ animationDelay: `${420 + i * 50}ms` }}
                    >
                    {/* Image Header */}
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100/50">
                      <img
                        src={image}
                        alt={cats[k as keyof typeof cats] as string}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Icon Badge */}
                      <div
                        className={cn(
                          "absolute top-3 right-3 size-10 rounded-xl grid place-items-center bg-white/95 shadow-sm transition-transform duration-300 group-hover:rotate-6",
                          tone.split(" ").pop()
                        )}
                      >
                        <Icon className="size-5" />
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-[17px] font-bold tracking-tight">
                          {cats[k as keyof typeof cats] as string}
                        </h3>
                      </div>
                    </div>

                    {/* Content */}
                    <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                      <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
                        {cats[`${k}_desc` as keyof Dictionary["categories"]] as string}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-lg text-xs font-semibold border-border hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <Link href={`/categories/${k}`}>
                            {t.homePage.viewButtonLabel}
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="premium"
                          size="sm"
                          className="h-9 rounded-lg text-xs font-semibold transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                        >
                          <Link href={`/categories/${k}?action=request`}>
                            {t.homePage.requestButtonLabel}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  </TiltCard>
                );
              })}

              {/* View All Categories Card */}
              <TiltCard className="h-full" maxTilt={11} scale={1.03}>
                <Card
                  className="group flex flex-col h-full overflow-hidden border border-dashed border-primary/40 bg-gradient-to-b from-primary/5 to-transparent transition-all duration-300 hover:shadow-premium-lg hover:border-primary/60 animate-lift"
                  style={{ animationDelay: `${420 + CATEGORIES.length * 50}ms` }}
                >
                <div className="relative h-44 w-full overflow-hidden bg-primary/5 flex items-center justify-center">
                  <div className="size-16 rounded-2xl bg-gradient-primary text-white flex items-center justify-center shadow-glow-primary transition-transform duration-300 group-hover:scale-110">
                    <LayoutGrid className="size-7" />
                  </div>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-[17px] font-bold tracking-tight text-foreground">
                      {t.homePage.allCategoriesTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-snug">
                    {t.categoriesPage.heroSubtitle}
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="premium"
                    size="sm"
                    className="w-full h-9 rounded-lg text-xs font-semibold mt-auto gap-1.5 cursor-pointer"
                  >
                    <Link href="/categories">
                      {t.common.viewAll}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              </TiltCard>
            </div>
          </div>
        </Container>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-16 sm:py-20">
        <Container size="xl">
          <div className="grid gap-10 lg:grid-cols-3">
            <StepCard
              step="01"
              Icon={Search}
              title={t.nav.categories}
              desc={t.hero.searchPlaceholder}
              delay={0}
            />
            <StepCard
              step="02"
              Icon={Star}
              title={t.common.rating}
              desc={t.homePage.stepTwoDesc}
              delay={120}
            />
            <StepCard
              step="03"
              Icon={Flame}
              title={t.common.bookNow}
              desc={t.homePage.stepThreeDesc}
              delay={240}
            />
          </div>
        </Container>
      </section>

      {/* ===== CTA ===== */}
      <section className="pb-16 sm:pb-20">
        <Container size="xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary px-6 py-10 sm:px-10 sm:py-14 text-white shadow-premium-lg animate-lift">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-white/15 blur-3xl"
            />
            <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] items-center">
              <div className="flex flex-col gap-3 max-w-xl">
                <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {t.homePage.ctaTitle}
                </h3>
                <p className="text-white/90 leading-7">
                  {t.homePage.ctaDesc}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-foreground hover:bg-white/90 shadow-none"
                >
                  <Link href="/become-technician">
                    {t.nav.becomeTechnician}
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function StepCard({
  step,
  Icon,
  title,
  desc,
  delay,
}: {
  step: string;
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <TiltCard className="h-full" maxTilt={8} scale={1.02} glare={false}>
      <Card
        className="relative border-border/60 animate-lift overflow-hidden h-full"
        style={{ animationDelay: `${delay}ms` }}
      >
        <CardContent className="p-6 sm:p-7 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="size-11 rounded-xl grid place-items-center bg-gradient-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
            <span className="text-3xl font-bold tracking-tighter text-muted-foreground/25">
              {step}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground leading-6 line-clamp-3">
              {desc}
            </p>
          </div>
        </CardContent>
      </Card>
    </TiltCard>
  );
}
