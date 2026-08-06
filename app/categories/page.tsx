"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bolt,
  Droplets,
  Sparkles as CleaningIcon,
  Heart,
  Flame,
  Laptop,
  Wrench,
  ArrowRight,
  Loader2,
  Users,
  Grid,
} from "lucide-react";
import { cn } from "@/lib/utils";

type CategoryKey =
  | "electric"
  | "plumbing"
  | "cleaning"
  | "nanny"
  | "boiler"
  | "it_tech"
  | "repair";

const CATEGORY_META: Record<
  CategoryKey,
  {
    Icon: React.ComponentType<{ className?: string }>;
    tone: string;
    image: string;
  }
> = {
  electric: {
    Icon: Bolt,
    tone: "from-amber-400/20 to-yellow-500/10 text-amber-600",
    image:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
  },
  plumbing: {
    Icon: Droplets,
    tone: "from-sky-400/20 to-blue-500/10 text-sky-600",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop",
  },
  cleaning: {
    Icon: CleaningIcon,
    tone: "from-emerald-400/20 to-green-500/10 text-emerald-600",
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=400&auto=format&fit=crop",
  },
  nanny: {
    Icon: Heart,
    tone: "from-pink-400/20 to-rose-500/10 text-pink-600",
    image:
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=400&auto=format&fit=crop",
  },
  boiler: {
    Icon: Flame,
    tone: "from-orange-400/20 to-red-500/10 text-orange-600",
    image:
      "https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=400&auto=format&fit=crop",
  },
  it_tech: {
    Icon: Laptop,
    tone: "from-indigo-400/20 to-violet-500/10 text-indigo-600",
    image:
      "https://images.unsplash.com/photo-1588508065123-287b28e013da?q=80&w=400&auto=format&fit=crop",
  },
  repair: {
    Icon: Wrench,
    tone: "from-amber-500/20 to-orange-500/10 text-orange-600",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
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
];

const getDatabaseCategoriesForCategory = (categoryKey: string): string[] => {
  switch (categoryKey) {
    case "electric":
      return ["Elektrik"];
    case "plumbing":
      return ["Santexnik"];
    case "cleaning":
      return ["Təmizlik xidməti", "Təmizlik"];
    case "nanny":
      return ["Dayə"];
    case "boiler":
      return ["Kombi Ustası"];
    case "it_tech":
      return ["İT / Texniki yardım", "Digər"];
    case "repair":
      return [
        "Ev təmiri",
        "Mebel Ustası",
        "Rəngsaz",
        "Alçipan Ustası",
        "Kafel-Metlax Ustası",
      ];
    default:
      return [];
  }
};

export default function CategoriesPage() {
  const { t } = useI18n();
  const cats = t.categories;
  const [counts, setCounts] = useState<Record<CategoryKey, number>>({
    electric: 0,
    plumbing: 0,
    cleaning: 0,
    nanny: 0,
    boiler: 0,
    it_tech: 0,
    repair: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCounts() {
      try {
        const { data, error } = await supabase
          .from("provider_details")
          .select("category");
        if (error) throw error;

        const countMap: Record<CategoryKey, number> = {
          electric: 0,
          plumbing: 0,
          cleaning: 0,
          nanny: 0,
          boiler: 0,
          it_tech: 0,
          repair: 0,
        };

        if (data) {
          data.forEach((row) => {
            const cat = row.category;
            CATEGORIES.forEach((key) => {
              const matchedDbCats = getDatabaseCategoriesForCategory(key);
              if (matchedDbCats.includes(cat)) {
                countMap[key]++;
              }
            });
          });
        }
        setCounts(countMap);
      } catch (err) {
        console.error("Usta sayları yüklənərkən xəta:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadCounts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% -10%, oklch(0.7900 0.1400 70.00 / 0.08), transparent 50%), radial-gradient(circle at 10% 40%, oklch(0.6231 0.1880 41.11 / 0.05), transparent 40%)",
        }}
      />

      <section className="py-12 sm:py-16">
        <Container size="xl">
          <div className="max-w-3xl mx-auto text-center flex flex-col gap-4 mb-12 sm:mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground flex items-center justify-center gap-2">
              <Grid className="size-8 text-primary" />
              {t.nav.categories}
            </h1>
            <p className="text-base sm:text-lg text-foreground/70 max-w-xl mx-auto leading-relaxed">
              {t.categoriesPage.heroSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {CATEGORIES.map((k, i) => {
              const { Icon, tone, image } = CATEGORY_META[k];
              const count = counts[k];

              return (
                <Card
                  key={k}
                  className="group flex flex-col h-full overflow-hidden border border-border/60 bg-card shadow-sm transition-all duration-300 hover:shadow-premium-lg hover:-translate-y-1.5 hover:border-primary/30 animate-lift"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Card Image Cover */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100/50">
                    <img
                      src={image}
                      alt={cats[k as keyof typeof cats] as string}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    {/* Floating Tone Icon Badge */}
                    <div
                      className={cn(
                        "absolute top-4 right-4 size-11 rounded-xl grid place-items-center bg-white/95 shadow-sm transition-transform duration-300 group-hover:rotate-6",
                        tone.split(" ").pop(),
                      )}
                    >
                      <Icon className="size-5.5" />
                    </div>

                    {/* Count overlay */}
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
                      <Users className="size-3.5" />
                      {loading ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        `${count} ${t.categoriesPage.technicianCount}`
                      )}
                    </div>

                    {/* Title */}
                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h3 className="text-lg font-bold tracking-tight">
                        {cats[k as keyof typeof cats] as string}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <CardContent className="p-5 flex-1 flex flex-col justify-between gap-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {(cats as Record<string, string>)[`${k}_desc`]}
                    </p>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <Button
                        asChild
                        variant="outline"
                        className="h-10 rounded-xl text-xs font-bold border-border hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Link href={`/categories/${k}`}>
                          {t.categoriesPage.viewButton}
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="premium"
                        className="h-10 rounded-xl text-xs font-bold transition-transform duration-200 hover:scale-[1.02] cursor-pointer"
                      >
                        <Link href={`/categories/${k}?action=request`}>
                          {t.categoriesPage.requestButton}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>
    </div>
  );
}
