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

export function LoginForm() {
  const router = useRouter();
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
      setError("Düzgün e-poçt ünvanı daxil edin.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Şifrə ən azı 6 simvoldan ibarət olmalıdır.");
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
          throw new Error("E-poçt ünvanı və ya şifrə yanlışdır.");
        } else if (authError.message.includes("Email not confirmed")) {
          throw new Error("E-poçt ünvanınız təsdiqlənməyib. Zəhmət olmasa e-poçtunuza göndərilən təsdiq linkinə daxil olun.");
        } else {
          throw authError;
        }
      }

      const user = data.user;
      if (!user) {
        throw new Error("Giriş zamanı istifadəçi məlumatları tapılmadı.");
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
      setError(err.message || "Sistemə daxil olarkən gözlənilməz xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border shadow-premium rounded-2xl overflow-hidden p-6 md:p-8 backdrop-blur-md bg-white/95">
      <div className="text-left mb-6">
        <h2 className="text-xl font-bold text-foreground">Hesabınıza daxil olun</h2>
        <p className="text-sm text-muted-foreground">Xidmətlərdən yararlanmaq üçün məlumatlarınızı daxil edin.</p>
      </div>

      {success ? (
        <div className="text-center py-6 flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
            <Check className="w-6 h-6" />
          </div>
          <p className="font-semibold text-foreground">Uğurla daxil oldunuz!</p>
          <p className="text-xs text-muted-foreground">Yönləndirilirsiniz...</p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-poçt ünvanı</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white border-border focus-visible:ring-primary"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Şifrə</Label>
              <Link 
                href="/forgot-password" 
                className="text-xs text-primary hover:underline font-medium"
              >
                Şifrəni unutmusunuz?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
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
                Giriş edilir...
              </>
            ) : (
              <>
                Daxil ol
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <div className="text-center mt-6 text-xs text-muted-foreground">
            Hesabınız yoxdur?{" "}
            <Link 
              href="/signup" 
              className="text-primary font-semibold hover:underline"
            >
              Qeydiyyatdan keçin
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
