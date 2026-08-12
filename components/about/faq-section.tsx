"use client";

import * as React from "react";
import { Container } from "@/components/layout/container";
import { useI18n } from "@/lib/i18n/i18n-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { containerVariants, fadeUpVariants } from "./variants";

export function FaqSection() {
  const { t } = useI18n();
  const [openFaq, setOpenFaq] = React.useState(0);

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
  );
}
