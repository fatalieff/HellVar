"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase/client";
import { ProfileRole } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/i18n-context";
import { 
  User, 
  Briefcase, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload, 
  MapPin, 
  Sliders, 
  AlertCircle, 
  Lock, 
  Mail, 
  FileText,
  Loader2
} from "lucide-react";

// Baku districts for address selection
const BAKU_DISTRICTS = [
  "Yasamal",
  "Nərimanov",
  "Nəsimi",
  "Xətai",
  "Səbail",
  "Binəqədi",
  "Sabunçu",
  "Suraxanı",
  "Qaradağ",
  "Xəzər",
  "Pirallahı"
];

// Provider categories
const PROVIDER_CATEGORIES = [
  "Elektrik",
  "Santexnik",
  "Təmizlik xidməti",
  "Dayə",
  "Kombi Ustası",
  "İT / Texniki yardım",
  "Ev təmiri",
  "Kondisioner Ustası",
  "Mebel Ustası",
  "Rəngsaz",
  "Alçipan Ustası",
  "Kafel-Metlax Ustası",
  "Digər"
];

export function RegisterForm() {
  const { t } = useI18n();
  const [stage, setStage] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<ProfileRole | null>(null);
  
  // Customer specific
  const [address, setAddress] = useState("");
  
  // Provider specific
  const [category, setCategory] = useState("");
  const [workingRadius, setWorkingRadius] = useState(15); // in km
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Validation States for active steps
  const [validationError, setValidationError] = useState<string | null>(null);

  // Stage transition wrapper
  const goToNextStage = () => {
    if (validateCurrentStage()) {
      setValidationError(null);
      setDirection(1);
      setStage((prev) => prev + 1);
    }
  };

  const goToPrevStage = () => {
    setValidationError(null);
    setDirection(-1);
    setStage((prev) => prev - 1);
  };

  // Basic step validation
  const validateCurrentStage = (): boolean => {
    if (stage === 1) {
      if (!firstName.trim()) {
        setValidationError(t.auth.signUp.firstNameRequired);
        return false;
      }
      if (!lastName.trim()) {
        setValidationError(t.auth.signUp.lastNameRequired);
        return false;
      }
      const sanitizedPhone = phone.replace(/\D/g, "");
      if (!sanitizedPhone || sanitizedPhone.length < 9) {
        setValidationError(t.auth.signUp.phoneRequired);
        return false;
      }
      if (!email.trim() || !email.includes("@")) {
        setValidationError(t.auth.signUp.emailRequired);
        return false;
      }
      if (password.length < 6) {
        setValidationError(t.auth.signUp.passwordLength);
        return false;
      }
    } else if (stage === 2) {
      if (!role) {
        setValidationError(t.auth.signUp.roleRequired);
        return false;
      }
    }
    return true;
  };

  // Handle files selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit flow
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Final checks
    if (role === "CUSTOMER" && !address) {
      setError(t.auth.signUp.addressRequired);
      setLoading(false);
      return;
    }
    if (role === "PROVIDER") {
      if (!category) {
        setError(t.auth.signUp.categoryRequired);
        setLoading(false);
        return;
      }
      if (selectedFiles.length === 0) {
        setError(t.auth.signUp.documentsRequired);
        setLoading(false);
        return;
      }
    }

    const sanitizedPhone = phone.replace(/\D/g, "");
    const formattedPhone = `+994${sanitizedPhone}`;

    try {
      // 1. Supabase Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: formattedPhone,
            role,
            address: role === "CUSTOMER" ? address : null,
            category: role === "PROVIDER" ? category : null,
            working_radius_km: role === "PROVIDER" ? workingRadius : null,
            documents_uploaded: role === "PROVIDER" && selectedFiles.length > 0
          }
        }
      });

      if (authError) throw authError;

      // Check if user already exists (identities will be empty in Supabase if duplicate email)
      const userIdentities = authData.user?.identities || [];
      if (authData.user && userIdentities.length === 0) {
        throw new Error(t.auth.signUp.duplicateEmail);
      }

      const userId = authData.user?.id;
      if (!userId) {
        throw new Error(t.auth.signUp.userIdMissing);
      }

      // Profile records are created by the database trigger. This works even
      // when email confirmation is enabled and no browser session exists yet.

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Qeydiyyat zamanı xəta baş verdi:", err);
      setError(err instanceof Error ? err.message : t.auth.signUp.genericError);
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 120 : -120,
      opacity: 0
    })
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-card border border-border shadow-premium rounded-2xl overflow-hidden p-6 md:p-8 backdrop-blur-md bg-white/95">
      {/* Stepper UI */}
      {!success && (
        <div className="relative mb-8 flex justify-between items-center w-full">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0" />
          
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300 ease-out" 
            style={{ width: `${((stage - 1) / 2) * 100}%` }}
          />

          {[1, 2, 3].map((step) => {
            const isCompleted = stage > step;
            const isActive = stage === step;

            return (
              <div key={step} className="flex flex-col items-center relative z-10">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isCompleted || isActive ? "var(--color-primary)" : "var(--color-card)",
                    borderColor: isCompleted || isActive ? "var(--color-primary)" : "var(--color-border)",
                    color: isCompleted || isActive ? "#fff" : "var(--color-muted-foreground)",
                    scale: isActive ? 1.15 : 1
                  }}
                  transition={{ duration: 0.2 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-semibold text-sm shadow-sm`}
                >
                  {isCompleted ? <Check className="w-5 h-5 text-white" /> : step}
                </motion.div>
                <span className={`text-xs mt-2 font-medium hidden sm:inline ${isActive ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                  {step === 1 ? "Əsas Məlumatlar" : step === 2 ? "Rol Seçimi" : "Qeydiyyatın Tamamlanması"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Container with AnimatePresence */}
      <div className="relative overflow-hidden min-h-[420px] flex flex-col justify-between">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10 flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Təbriklər! Qeydiyyat Tamamlandı</h2>
              <p className="text-muted-foreground max-w-sm mb-6 text-sm">
                Hesabınız uğurla yaradıldı. Zəhmət olmasa e-poçt (email) ünvanınıza göndərilən təsdiq linkinə daxil olaraq hesabı təsdiqləyin.
                {role === "PROVIDER" && " Sənədləriniz administrator tərəfindən yoxlanıldıqdan sonra profiliniz aktivləşdiriləcəkdir."}
              </p>
              <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white shadow-glow-primary">
                <a href="/login">Daxil ol</a>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key={stage}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full flex-1 flex flex-col justify-between"
            >
              {/* STAGE 1: Basic Info */}
              {stage === 1 && (
                <div className="space-y-4">
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-foreground">Əsas məlumatlarınızı daxil edin</h2>
                    <p className="text-sm text-muted-foreground">UstaTap-da qeydiyyatdan keçmək üçün zəruri məlumatlar.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">Ad</Label>
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="Məsələn, Murad"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-white border-border focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Soyad</Label>
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="Məsələn, Fataliyev"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-white border-border focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon nömrəsi</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium border-r border-border pr-2">
                        +994
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder=" (50) 123-45-67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-[72px] bg-white border-border focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-poçt ünvanı (Email)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-white border-border focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Şifrə</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 bg-white border-border focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 2: Role Selection */}
              {stage === 2 && (
                <div className="space-y-5">
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-foreground">Hesabınızın növünü seçin</h2>
                    <p className="text-sm text-muted-foreground">Platformadan necə istifadə edəcəyinizi müəyyənləşdirin.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {/* CUSTOMER CARD */}
                    <button
                      type="button"
                      onClick={() => {
                        setRole("CUSTOMER");
                        setValidationError(null);
                      }}
                      className={`relative flex flex-col items-center justify-center p-6 text-center rounded-xl border-2 transition-all duration-300 bg-white hover:border-primary/50 hover:shadow-premium group ${
                        role === "CUSTOMER"
                          ? "border-primary ring-2 ring-primary/20 shadow-glow-primary"
                          : "border-border"
                      }`}
                    >
                      {role === "CUSTOMER" && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
                        role === "CUSTOMER" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <User className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Müştəri</h3>
                      <p className="text-xs text-muted-foreground text-balance">
                        Etibarlı ustalar axtarmaq və ev/ofis xidmətləri sifariş etmək üçün.
                      </p>
                    </button>

                    {/* PROVIDER CARD */}
                    <button
                      type="button"
                      onClick={() => {
                        setRole("PROVIDER");
                        setValidationError(null);
                      }}
                      className={`relative flex flex-col items-center justify-center p-6 text-center rounded-xl border-2 transition-all duration-300 bg-white hover:border-primary/50 hover:shadow-premium group ${
                        role === "PROVIDER"
                          ? "border-primary ring-2 ring-primary/20 shadow-glow-primary"
                          : "border-border"
                      }`}
                    >
                      {role === "PROVIDER" && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-300 ${
                        role === "PROVIDER" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">Usta / Mütəxəssis</h3>
                      <p className="text-xs text-muted-foreground text-balance">
                        Müştərilərə peşəkar xidmət göstərmək və gəlir əldə etmək üçün.
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: Conditional Completion */}
              {stage === 3 && (
                <div className="space-y-4">
                  {role === "CUSTOMER" ? (
                    <div className="space-y-4">
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-foreground">Ünvan məlumatlarını daxil edin</h2>
                        <p className="text-sm text-muted-foreground">Ustaların sizə daha tez çata bilməsi üçün ərazini seçin.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address-select">Bakı rayonları</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <select
                            id="address-select"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full rounded-md border border-border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                          >
                            <option value="">Rayon seçin...</option>
                            {BAKU_DISTRICTS.map((district) => (
                              <option key={district} value={district}>
                                {district} rayonu
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address-detail">Tam ünvan (isteğe bağlı)</Label>
                        <Input
                          id="address-detail"
                          type="text"
                          placeholder="Məsələn: Mətbuat pr. 24, bina 3, m. 45"
                          className="bg-white border-border focus-visible:ring-primary"
                          value={address.includes("rayonu") ? (address.split("rayonu, ")[1] || "") : address}
                          onChange={(e) => {
                            const baseDistrict = address.includes("rayonu") ? address.split("rayonu")[0] + "rayonu" : "";
                            const detail = e.target.value;
                            setAddress(baseDistrict ? `${baseDistrict}, ${detail}` : detail);
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-left">
                        <h2 className="text-xl font-bold text-foreground">Peşəkar fəaliyyət məlumatları</h2>
                        <p className="text-sm text-muted-foreground">Müştərilərin sizi tapa bilməsi üçün xidmət təfərrüatları.</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category-select">Xidmət Kateqoriyası</Label>
                        <div className="relative">
                          <Sliders className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <select
                            id="category-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-md border border-border bg-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
                          >
                            <option value="">Kateqoriya seçin...</option>
                            {PROVIDER_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                          <Label htmlFor="radius-slider">İş Radiusunuz (Xidmət məsafəsi)</Label>
                          <span className="text-sm font-semibold text-primary">{workingRadius} km</span>
                        </div>
                        <input
                          id="radius-slider"
                          type="range"
                          min="1"
                          max="50"
                          value={workingRadius}
                          onChange={(e) => setWorkingRadius(Number(e.target.value))}
                          className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Təsdiqləyici Sənədlər (Şəxsiyyət vəsiqəsi / Sertifikatlar)</Label>
                        <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer relative bg-muted/30">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium text-foreground">Faylları seçin və ya bura dartın</p>
                          <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, PDF (maks. 5MB)</p>
                        </div>

                        {selectedFiles.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Seçilən sənədlər ({selectedFiles.length})
                            </p>
                            <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                              {selectedFiles.map((file, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-border text-xs">
                                  <div className="flex items-center space-x-2 truncate">
                                    <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span className="truncate text-foreground font-medium">{file.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeFile(idx)}
                                    className="text-red-500 hover:text-red-600 font-semibold ml-2"
                                  >
                                    Sil
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Validation & Error Alerts */}
              {(validationError || error) && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start space-x-2 border border-red-200">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span className="font-medium">{validationError || error}</span>
                </div>
              )}

              {/* Navigation Action Buttons */}
              <div className="flex justify-between items-center mt-8 gap-4">
                {stage > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goToPrevStage}
                    disabled={loading}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Geri
                  </Button>
                ) : (
                  <div />
                )}

                {stage < 3 ? (
                  <Button
                    type="button"
                    onClick={goToNextStage}
                    className="bg-primary hover:bg-primary/95 text-white shadow-sm flex items-center ml-auto font-medium"
                  >
                    Davam et
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/95 text-white shadow-glow-primary flex items-center ml-auto font-semibold px-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Qeydiyyat tamamlanır...
                      </>
                    ) : (
                      <>
                        Qeydiyyatı Tamamla
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
