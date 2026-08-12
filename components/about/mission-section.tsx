"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { TiltCard } from "@/components/home/tilt-card";
import { motion } from "framer-motion";
import { containerVariants, fadeUpVariants } from "./variants";

export function MissionSection() {
  const { t } = useI18n();

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

  return (
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
  );
}
