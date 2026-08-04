"use client";

import { LoginForm } from "@/components/auth/forms/login-form";
import { useI18n } from "@/lib/i18n/i18n-context";

export default function LoginPage() {
  const { t } = useI18n();

  return (
    <main className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden min-h-[calc(100vh-80px)] bg-slate-50/50">
      {/* Visual background enhancements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[oklch(0.6231_0.1880_41.11)]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-[oklch(0.6231_0.1880_41.11)]/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md text-center mb-8 relative z-10 animate-fade-up">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
          {t.auth.signIn.title}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-muted-foreground text-balance">
          {t.auth.signIn.subtitle}
        </p>
      </div>

      <div className="w-full relative z-10 animate-lift">
        <LoginForm />
      </div>
    </main>
  );
}
