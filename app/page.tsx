"use client";

import * as React from "react";
import Link from "next/link";
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
  ChevronRight,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

type CategoryKey =
  | "electric"
  | "plumbing"
  | "ac"
  | "appliance"
  | "furniture"
  | "cleaning"
  | "repair"
  | "moving";

const CATEGORY_META: Record<
  CategoryKey,
  { Icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  electric: { Icon: Bolt, tone: "from-amber-400/20 to-yellow-500/10 text-amber-600" },
  plumbing: { Icon: Droplets, tone: "from-sky-400/20 to-blue-500/10 text-sky-600" },
  ac: { Icon: Wind, tone: "from-cyan-400/20 to-teal-500/10 text-cyan-600" },
  appliance: { Icon: Refrigerator, tone: "from-indigo-400/20 to-violet-500/10 text-indigo-600" },
  furniture: { Icon: Sofa, tone: "from-rose-400/20 to-pink-500/10 text-rose-600" },
  cleaning: { Icon: CleaningIcon, tone: "from-emerald-400/20 to-green-500/10 text-emerald-600" },
  repair: { Icon: Wrench, tone: "from-orange-400/20 to-red-500/10 text-orange-600" },
  moving: { Icon: Truck, tone: "from-fuchsia-400/20 to-purple-500/10 text-fuchsia-600" },
};

const CATEGORIES: CategoryKey[] = [
  "electric",
  "plumbing",
  "ac",
  "appliance",
  "furniture",
  "cleaning",
  "repair",
  "moving",
];

export default function Home() {
  const { t } = useI18n();
  const cats = t.categories;
  const [query, setQuery] = React.useState("");

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
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
        />

        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-6 animate-fade-up">
            <Badge
              variant="accent"
              className="mx-auto gap-1.5 px-3 py-1 rounded-full animate-lift [animation-delay:50ms]"
            >
              <Sparkles className="size-3.5" data-icon="inline-start" />
              {t.hero.eyebrow}
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance leading-[1.1] text-foreground animate-lift [animation-delay:120ms]">
              {t.hero.title.split(" ").map((word, idx, arr) =>
                idx === arr.length - 1 ? (
                  <span
                    key={idx}
                    className="bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_0_1px_oklch(0.6231_0.1880_41.11_/_0.15)]"
                  >
                    {word}
                  </span>
                ) : (
                  <React.Fragment key={idx}>{word} </React.Fragment>
                )
              )}
            </h1>

            <p className="text-base sm:text-lg text-foreground/70 max-w-xl mx-auto leading-7 animate-lift [animation-delay:180ms]">
              {t.hero.subtitle}
            </p>

            {/* Search bar */}
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="mt-3 w-full max-w-2xl mx-auto animate-lift [animation-delay:240ms]"
            >
              <div className="group relative flex items-center rounded-2xl border border-border/80 bg-card shadow-premium-lg p-1.5 transition-all duration-300 hover:shadow-[0_20px_60px_-20px_oklch(0.6231_0.1880_41.11_/_0.35)] focus-within:shadow-[0_0_0_4px_oklch(0.6231_0.1880_41.11_/_0.12)] focus-within:border-primary/40">
                <div className="flex items-center gap-2 pl-3 pr-2 text-muted-foreground">
                  <Search className="size-5" />
                </div>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                  {t.hero.searchButton}
                  <ArrowRight className="size-4" data-icon="inline-end" />
                </Button>
              </div>
            </form>
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

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {CATEGORIES.map((k, i) => {
                const { Icon, tone } = CATEGORY_META[k];
                return (
                  <Link
                    key={k}
                    href={`/categories/${k}`}
                    className="group relative"
                  >
                    <Card
                      className={cn(
                        "h-full overflow-hidden border-border/60 p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                      )}
                      style={{ animationDelay: `${420 + i * 60}ms` }}
                    >
                      <CardContent className="p-0 flex flex-col gap-3">
                        <div
                          className={cn(
                            "size-12 rounded-xl grid place-items-center bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
                            tone
                          )}
                        >
                          <Icon className="size-6" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                            {cats[k as keyof typeof cats] as string}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                            {cats[`${k}_desc` as keyof Dictionary["categories"]] as string}
                          </p>
                        </div>
                        <div className="mt-auto pt-1 flex items-center gap-1 text-xs font-medium text-primary/90 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                          {t.common.viewAll}
                          <ArrowRight className="size-3.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
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
              desc={`${t.common.viewAll} · ${t.common.reviews} · ${t.common.completedJobs}`}
              delay={120}
            />
            <StepCard
              step="03"
              Icon={Flame}
              title={t.common.bookNow}
              desc="5 dəqiqədə rezervasiya · Həmişə dəstək"
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
                  Sən də ustasan? 🛠️
                </h3>
                <p className="text-white/90 leading-7">
                  Öz xidmətlərini UstaTap-da göstər, müştərilərlə birbaşa əlaqə qur və qazancını artır.
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
    <Card
      className="relative border-border/60 animate-lift overflow-hidden"
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
  );
}
