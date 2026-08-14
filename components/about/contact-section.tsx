"use client";

import Link from "next/link";
import { ArrowRight, MessageCircleQuestion } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { localizedPath } from "@/lib/i18n/url";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function ContactSection() {
  const { t, locale } = useI18n();
  const loc = (p: string) => localizedPath(p, locale);

  return (
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
                    <Link href={loc("/signup")}>{t.aboutPage.signupButton}</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </section>
  );
}
