"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "./container";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/lib/i18n/i18n-context";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-border/60 bg-secondary/30">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-primary opacity-60" aria-hidden />
      <Container size="xl" className="py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <span className="grid size-9 place-items-center rounded-xl overflow-hidden shadow-glow-primary">
                <Image src="/logo.jpg" alt="HəllVar" width={36} height={36} className="rounded-xl object-cover" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[17px] font-semibold tracking-tight">{t.brand.name}</span>
                <span className="text-[11px] text-muted-foreground -mt-0.5">{t.brand.tagline}</span>
              </div>
            </Link>
            <p className="text-sm leading-6 text-muted-foreground max-w-sm">
              {t.footer.description}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">{t.footer.sections.company}</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.footer.links.aboutUs}
              </Link>
              <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.footer.links.howItWorks}
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.footer.links.contact}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">{t.footer.sections.support}</h4>
            <div className="flex flex-col gap-2">
              <Link href="/help" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.footer.links.helpCenter}
              </Link>
              <Link href="/become-technician" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.nav.becomeTechnician}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-foreground">{t.footer.sections.legal}</h4>
            <div className="flex flex-col gap-2">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.footer.links.terms}
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.footer.links.privacy}
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t.footer.links.cookies}
              </Link>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {year} {t.brand.name}. {t.footer.rights}</p>
          <p className="flex items-center gap-1.5">
            <span>🇦🇿</span>
            {t.footer.madeIn}
          </p>
        </div>
      </Container>
    </footer>
  );
}
