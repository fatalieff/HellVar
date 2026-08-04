"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  Check
} from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/i18n-context";

export function LoginForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email.trim() || !email.includes("@")) {
      setError(t.auth.signIn.invalidEmail);
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError(t.auth.signIn.passwordLength);
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate with Supabase Auth (Email + Password)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          throw new Error(t.auth.signIn.invalidCredentials);
        } else if (authError.message.includes("Email not confirmed")) {
          throw new Error(t.auth.signIn.emailNotConfirmed);
        } else {
          throw authError;
        }
      }

      const user = data.user;
      if (!user) {
        throw new Error(t.auth.signIn.userMissing);
      }

      // 2. Fetch profile to determine role and redirect destination
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.warn("Profil rolu oxunarkən xəta baş verdi:", profileError.message);
      }

      setSuccess(true);

      // 3. Role-based redirect
      const role = profile?.role;
      setTimeout(() => {
        if (role === "CUSTOMER") {
          router.push("/dashboard");
        } else if (role === "PROVIDER") {
          router.push("/provider/dashboard");
        } else {
          router.push("/");
        }
        router.refresh();
      }, 1000);

    } catch (err: any) {
      console.error("Giriş xətası:", err);
      setError(err.message || t.auth.signIn.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border shadow-premium rounded-2xl overflow-hidden p-6 md:p-8 backdrop-blur-md bg-white/95">
      <div className="text-left mb-6">
        <h2 className="text-xl font-bold text-foreground">{t.auth.signIn.title}</h2>
        <p className="text-sm text-muted-foreground">{t.auth.signIn.subtitle}</p>
      </div>

      {success ? (
        <div className="text-center py-6 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <Check className="w-6 h-6" />
          </div>
          <p className="font-semibold text-foreground">{t.auth.signIn.successTitle}</p>
          <p className="text-xs text-muted-foreground">{t.auth.signIn.successSubtitle}</p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.signIn.emailLabel}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder={t.auth.signIn.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white border-border focus-visible:ring-primary"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">{t.auth.signIn.passwordLabel}</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-primary hover:underline font-medium"
              >
                {t.auth.signIn.forgotPassword}
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder={t.auth.signIn.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-white border-border focus-visible:ring-primary"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start space-x-2 border border-red-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/95 text-white shadow-glow-primary flex items-center justify-center font-semibold mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t.auth.signIn.loading}
              </>
            ) : (
              <>
                {t.auth.signIn.submit}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <div className="text-center mt-6 text-xs text-muted-foreground">
            {t.auth.signIn.noAccount}{" "}
            <Link 
              href="/signup" 
              className="text-primary font-semibold hover:underline"
            >
              {t.auth.signIn.createAccount}
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
