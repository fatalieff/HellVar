"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { TiltCard } from "@/components/home/tilt-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  containerVariants,
  fadeUpVariants,
  slideInRightVariants,
} from "@/components/about/variants";

const Hero3DScene = dynamic(
  () => import("@/components/home/hero-3d-scene").then((m) => m.Hero3DScene),
  { ssr: false, loading: () => null }
);

const HighlightsSection = dynamic(
  () => import("@/components/about/highlights-section").then((m) => m.HighlightsSection),
  { ssr: false }
);

const MissionSection = dynamic(
  () => import("@/components/about/mission-section").then((m) => m.MissionSection),
  { ssr: false }
);

const FaqSection = dynamic(
  () => import("@/components/about/faq-section").then((m) => m.FaqSection),
  { ssr: false }
);

const ContactSection = dynamic(
  () => import("@/components/about/contact-section").then((m) => m.ContactSection),
  { ssr: false }
);

function SkeletonSection({ className }: { className?: string }) {
  return (
    <section className={className}>
      <Container size="xl" className="py-16 sm:py-20">
        <div className="space-y-6">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-9 w-2/3 rounded-lg" />
          <Skeleton className="h-5 w-full rounded-md" />
          <div className="grid gap-6 pt-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="space-y-3 rounded-3xl border border-border/60 bg-card p-6"
              >
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function AboutPage() {
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section */}
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

        <Container size="xl" className="relative py-18 sm:py-24 lg:py-28">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
          >
            {/* Left Content (Hero text & actions) */}
            <div className="space-y-6">
              <motion.div
                variants={fadeUpVariants}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-3.5 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white"
              >
                <Sparkles className="size-4 animate-pulse" />
                {t.aboutPage.badge}
              </motion.div>

              <div className="space-y-4">
                <motion.h1
                  variants={fadeUpVariants}
                  className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl [text-wrap:balance]"
                >
                  {t.aboutPage.heroTitle}
                </motion.h1>

                <motion.p
                  variants={fadeUpVariants}
                  className="max-w-2xl text-lg leading-8 text-foreground/75"
                >
                  {t.aboutPage.heroSubtitle}
                </motion.p>
              </div>

              <motion.div
                variants={fadeUpVariants}
                className="flex flex-wrap gap-3"
              >
                <Button asChild variant="premium" size="lg" className="rounded-2xl px-5 hover:scale-102 transition-transform duration-200">
                  <Link href={loc("/signup")}>
                    {t.aboutPage.ctaStart}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl px-5 hover:scale-102 transition-transform duration-200">
                  <Link href={loc("/dashboard")}>
                    {t.aboutPage.ctaViewProviders}
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Right Card (Stats card) */}
            <motion.div variants={slideInRightVariants}>
              <TiltCard className="h-full" maxTilt={6} scale={1.02}>
                <Card className="h-full border border-border/60 bg-card/95 shadow-[0_24px_70px_-30px_oklch(0.2_0.02_250_/_0.35)] backdrop-blur transition-all duration-500 hover:shadow-[0_30px_90px_-32px_oklch(0.2_0.02_250_/_0.45)]">
                  <CardContent className="space-y-5 p-6 sm:p-8">
                    <div className="rounded-2xl bg-gradient-primary p-5 text-white shadow-glow-primary transition-transform duration-500 hover:scale-[1.02]">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-white/20 p-2.5">
                          <ShieldCheck className="size-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{t.aboutPage.trustTitle}</p>
                          <p className="text-xl font-semibold">{t.aboutPage.trustSubtitle}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:bg-slate-100/80">
                        <div className="flex items-center gap-2 text-primary">
                          <Users className="size-4" />
                          <span className="text-sm font-semibold">{t.aboutPage.statProviders}</span>
                        </div>
                        <p className="mt-2 text-sm text-foreground/70">{t.aboutPage.statProvidersText}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:bg-slate-100/80">
                        <div className="flex items-center gap-2 text-primary">
                          <Clock3 className="size-4" />
                          <span className="text-sm font-semibold">{t.aboutPage.statSpeed}</span>
                        </div>
                        <p className="mt-2 text-sm text-foreground/70">{t.aboutPage.statSpeedText}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TiltCard>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Highlights (lazy) */}
      <React.Suspense fallback={<SkeletonSection className="border-b border-border/60 bg-white/70" />}>
        <HighlightsSection />
      </React.Suspense>

      {/* Mission (lazy) */}
      <React.Suspense fallback={<SkeletonSection className="bg-background" />}>
        <MissionSection />
      </React.Suspense>

      {/* FAQ (lazy) */}
      <React.Suspense fallback={<SkeletonSection className="border-t border-border/60 bg-slate-50/70" />}>
        <FaqSection />
      </React.Suspense>

      {/* Contact (lazy) */}
      <React.Suspense fallback={<SkeletonSection className="bg-background" />}>
        <ContactSection />
      </React.Suspense>
    </div>
  );
}
