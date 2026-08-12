"use client";

import { BadgeCheck, CircleCheckBig, Sparkles } from "lucide-react";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { TiltCard } from "@/components/home/tilt-card";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { containerVariants, fadeUpVariants } from "./variants";

export function HighlightsSection() {
  const { t } = useI18n();

  return (
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
  );
}
