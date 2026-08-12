"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CircleCheckBig,
  Clock3,
  MessageCircleQuestion,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/home/tilt-card";

const Hero3DScene = dynamic(
  () => import("@/components/home/hero-3d-scene").then((m) => m.Hero3DScene),
  { ssr: false, loading: () => null }
);

// Animation Variants for a cohesive premium look
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 90,
      damping: 14,
    },
  },
};

const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {      type: "spring" as const,
      stiffness: 85,
      damping: 14,
    },
  },
};

export default function AboutPage() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = React.useState(0);

  const benefits = React.useMemo(
    () => [
      {
        title: t.aboutPage.missionPoints.customer.title,
        text: t.aboutPage.missionPoints.customer.text,
      },
      {
        title: t.aboutPage.missionPoints.provider.title,
        text: t.aboutPage.missionPoints.provider.text,
      },
      {
        title: t.aboutPage.missionPoints.experience.title,
        text: t.aboutPage.missionPoints.experience.text,
      },
    ],
    [t]
  );

  const faqs = React.useMemo(
    () => [
      {
        question: t.aboutPage.faqs.why.question,
        answer: t.aboutPage.faqs.why.answer,
      },
      {
        question: t.aboutPage.faqs.becomeProvider.question,
        answer: t.aboutPage.faqs.becomeProvider.answer,
      },
      {
        question: t.aboutPage.faqs.verification.question,
        answer: t.aboutPage.faqs.verification.answer,
      },
      {
        question: t.aboutPage.faqs.payments.question,
        answer: t.aboutPage.faqs.payments.answer,
      },
    ],
    [t]
  );

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
                  <Link href="/signup">
                    {t.aboutPage.ctaStart}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-2xl px-5 hover:scale-102 transition-transform duration-200">
                  <Link href="/dashboard">
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

      {/* Highlights Section */}
      <section className="border-b border-border/60 bg-white/70">
        <Container size="xl" className="py-16 sm:py-20">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-4 md:grid-cols-3"
          >
            {[
              {
                title: t.aboutPage.highlights.trustedChoice.title,
                text: t.aboutPage.highlights.trustedChoice.text,
                icon: BadgeCheck,
              },
              {
                title: t.aboutPage.highlights.fastContact.title,
                text: t.aboutPage.highlights.fastContact.text,
                icon: Sparkles,
              },
              {
                title: t.aboutPage.highlights.everythingInOne.title,
                text: t.aboutPage.highlights.everythingInOne.text,
                icon: CircleCheckBig,
              },
            ].map(({ title, text, icon: Icon }) => (
              <motion.div key={title} variants={fadeUpVariants}>
                <TiltCard className="h-full" maxTilt={8} scale={1.02}>
                  <Card className="group h-full border border-border/60 bg-card shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-premium-lg">
                    <CardContent className="p-6">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/15">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-foreground/70">{text}</p>
                    </CardContent>
                  </Card>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="bg-background">
        <Container size="xl" className="py-16 sm:py-20">
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t.aboutPage.missionEyebrow}</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t.aboutPage.missionTitle}
            </h2>
            <p className="mt-4 text-lg leading-8 text-foreground/70">
              {t.aboutPage.missionText}
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-10 grid gap-6 lg:grid-cols-3"
          >
            {benefits.map((item) => (
              <motion.div key={item.title} variants={fadeUpVariants}>
                <TiltCard className="h-full" maxTilt={8} scale={1.02}>
                  <div className="h-full rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-premium-lg">
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-foreground/70">{item.text}</p>
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </motion.div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-border/60 bg-slate-50/70">
        <Container size="xl" className="py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-4"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t.aboutPage.faqEyebrow}</p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t.aboutPage.faqTitle}
              </h2>
              <p className="text-lg leading-8 text-foreground/70">
                {t.aboutPage.faqText}
              </p>
            </motion.div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-3"
            >
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <motion.div 
                    key={faq.question} 
                    variants={fadeUpVariants}
                    className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:shadow-premium"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-foreground hover:bg-slate-50/50 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <span className={cn("text-xl text-muted-foreground transition-transform duration-200", isOpen && "rotate-45 text-primary")}>
                        +
                      </span>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className="border-t border-border/60 px-5 py-4 text-sm leading-7 text-foreground/70 bg-slate-50/20">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA Contact Section */}
      <section className="bg-background">
        <Container size="xl" className="py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            <Card className="overflow-hidden border border-white/80 bg-gradient-to-br from-primary/10 via-white to-amber-50 shadow-[0_20px_60px_-30px_oklch(0.2_0.02_250_/_0.35)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_80px_-28px_oklch(0.2_0.02_250_/_0.4)]">
              <CardContent className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t.aboutPage.contactEyebrow}</p>
                  <h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    {t.aboutPage.contactTitle}
                  </h3>
                  <p className="mt-4 text-lg leading-8 text-foreground/70">
                    {t.aboutPage.contactText}
                  </p>
                </div>
                
                <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-premium">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-foreground/80 hover:bg-slate-100 transition-colors duration-200">
                    <MessageCircleQuestion className="size-5 text-primary" />
                    <span>{t.aboutPage.contactEmail}</span>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button asChild variant="premium" className="rounded-2xl px-5 hover:scale-102 transition-transform duration-200">
                      <a href="mailto:support@hellvar.az">
                        {t.aboutPage.contactButton}
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="rounded-2xl px-5 hover:scale-102 transition-transform duration-200">
                      <Link href="/signup">{t.aboutPage.signupButton}</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}

