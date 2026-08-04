export type Locale = "az" | "en" | "tr";

export const locales: Locale[] = ["az", "en", "tr"];
export const defaultLocale: Locale = "az";

export const localeLabels: Record<Locale, { native: string; flag: string; short: string }> = {
  az: { native: "Azərbaycan", flag: "🇦🇿", short: "AZ" },
  en: { native: "English", flag: "🇬🇧", short: "EN" },
  tr: { native: "Türkçe", flag: "🇹🇷", short: "TR" },
};

export type Dictionary = {
  brand: {
    name: string;
    tagline: string;
  };
  nav: {
    home: string;
    categories: string;
    technicians: string;
    about: string;
    becomeTechnician: string;
    login: string;
    signup: string;
    myBookings: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    searchButton: string;
    popularCategories: string;
  };
  categories: {
    electric: string;
    electric_desc: string;
    plumbing: string;
    plumbing_desc: string;
    ac: string;
    ac_desc: string;
    appliance: string;
    appliance_desc: string;
    furniture: string;
    furniture_desc: string;
    cleaning: string;
    cleaning_desc: string;
    repair: string;
    repair_desc: string;
    moving: string;
    moving_desc: string;
  };
  footer: {
    description: string;
    sections: {
      company: string;
      support: string;
      legal: string;
      follow: string;
    };
    links: {
      aboutUs: string;
      howItWorks: string;
      contact: string;
      helpCenter: string;
      terms: string;
      privacy: string;
      cookies: string;
    };
    rights: string;
    madeIn: string;
  };
  common: {
    loading: string;
    search: string;
    viewAll: string;
    bookNow: string;
    viewProfile: string;
    from: string;
    rating: string;
    reviews: string;
    completedJobs: string;
  };
};

const az: Dictionary = {
  brand: {
    name: "UstaTap",
    tagline: "Etibarlı usta, bir toxunuşda",
  },
  nav: {
    home: "Ana səhifə",
    categories: "Kateqoriyalar",
    technicians: "Ustalar",
    about: "Haqqımızda",
    becomeTechnician: "Usta ol",
    login: "Daxil ol",
    signup: "Qeydiyyat",
    myBookings: "Sifarişlərim",
  },
  hero: {
    eyebrow: "Sürətli · Etibarlı · Professional",
    title: "Ev probleminə uyğun ustani tap",
    subtitle:
      "Sadəcə problemini yaz, biz sənə uyğun ustaları göstərək. 5 dəqiqədə rezervasiya et.",
    searchPlaceholder: "Məsələn: kondisioner işləmir, su kəsilir, rozetka yandirilmir...",
    searchButton: "Usta tap",
    popularCategories: "Məşhur kateqoriyalar",
  },
  categories: {
    electric: "Elektrik",
    electric_desc: "Kabel, rozetkə, lampa, avtomat, alarm quraşdırma & bərpa",
    plumbing: "Santexnika",
    plumbing_desc: "Su kəsilməsi, sızdırma, kostyol, tıxac,",
    ac: "Kondisioner",
    ac_desc: "Daxili/çöldə quraşdırma, freon doldurma, yuma",
    appliance: "Məişət avadanlığı",
    appliance_desc: "Paltaryuyan, qabyuyan, soyuducu, plitə, çaydanlıq təmiri",
    furniture: "Mebel",
    furniture_desc: "Şkaf, masa, stul yığılması, qapı bərpası",
    cleaning: "Təmizlik",
    cleaning_desc: "Ev/ofis, pərdə, mətbəx təmizliyi",
    repair: "Bərpa",
    repair_desc: "Dəmir, ağac, şüşə, divar, qapı, qarderob, süs işləri",
    moving: "Daşınma",
    moving_desc: "Ev/ofis daşınması, yük kəmər, mebel sökülməsi, yükləmə",
  },
  footer: {
    description:
      "Azərbaycanda ev xidmətləri üçün etibarlı usta tapma platforması. Sürət, etibar və keyfiyyət.",
    sections: {
      company: "Şirkət",
      support: "Dəstək",
      legal: "Qanuni",
      follow: "Bizi izlə",
    },
    links: {
      aboutUs: "Haqqımızda",
      howItWorks: "Necə işləyir",
      contact: "Əlaqə",
      helpCenter: "Yardım mərkəzi",
      terms: "İstifadə şərtləri",
      privacy: "Məxfilik siyasəti",
      cookies: "Cookie siyasəti",
    },
    rights: "Bütün hüquqlar qorunur.",
    madeIn: "Azərbaycan ilə hazırlanmışdır.",
  },
  common: {
    loading: "Yüklənir...",
    search: "Axtarış",
    viewAll: "Hamısını gör",
    bookNow: "İndi rezerv et",
    viewProfile: "Profili gör",
    from: "dan",
    rating: "Reytinq",
    reviews: "rəy",
    completedJobs: "tamamlanmış iş",
  },
};

const en: Dictionary = {
  brand: {
    name: "UstaTap",
    tagline: "Trusted experts, one tap away",
  },
  nav: {
    home: "Home",
    categories: "Categories",
    technicians: "Technicians",
    about: "About",
    becomeTechnician: "Become a Pro",
    login: "Sign in",
    signup: "Sign up",
    myBookings: "My bookings",
  },
  hero: {
    eyebrow: "Fast · Trusted · Professional",
    title: "Find the right pro for your home",
    subtitle:
      "Just describe your problem and we'll match you with verified technicians. Book in 5 minutes.",
    searchPlaceholder: "e.g. AC not cooling, leaky faucet, broken socket...",
    searchButton: "Find a Pro",
    popularCategories: "Popular categories",
  },
  categories: {
    electric: "Electrical",
    electric_desc: "Wiring, sockets, lighting",
    plumbing: "Plumbing",
    plumbing_desc: "Pipes, leaks, faucets",
    ac: "Air Conditioning",
    ac_desc: "Installation, cleaning, recharge",
    appliance: "Appliances",
    appliance_desc: "Washer, fridge, stove",
    furniture: "Furniture",
    furniture_desc: "Assembly, repair, moving",
    cleaning: "Cleaning",
    cleaning_desc: "Home, office, deep clean",
    repair: "Handyman",
    repair_desc: "All types of repairs",
    moving: "Moving",
    moving_desc: "Home, office, cargo",
  },
  footer: {
    description:
      "Azerbaijan's trusted marketplace for home services. Speed, trust and quality.",
    sections: {
      company: "Company",
      support: "Support",
      legal: "Legal",
      follow: "Follow us",
    },
    links: {
      aboutUs: "About us",
      howItWorks: "How it works",
      contact: "Contact",
      helpCenter: "Help center",
      terms: "Terms of service",
      privacy: "Privacy policy",
      cookies: "Cookie policy",
    },
    rights: "All rights reserved.",
    madeIn: "Made with in Azerbaijan.",
  },
  common: {
    loading: "Loading...",
    search: "Search",
    viewAll: "View all",
    bookNow: "Book now",
    viewProfile: "View profile",
    from: "from",
    rating: "Rating",
    reviews: "reviews",
    completedJobs: "completed jobs",
  },
};

const tr: Dictionary = {
  brand: {
    name: "UstaTap",
    tagline: "Güvenilir usta, tek dokunuşta",
  },
  nav: {
    home: "Anasayfa",
    categories: "Kategoriler",
    technicians: "Ustalar",
    about: "Hakkımızda",
    becomeTechnician: "Usta ol",
    login: "Giriş",
    signup: "Kayıt",
    myBookings: "Rezervasyonlarım",
  },
  hero: {
    eyebrow: "Hızlı · Güvenilir · Profesyonel",
    title: "Ev sorununa uygun ustayı bul",
    subtitle:
      "Sorununu yaz, sana uygun ustaları gösterelim. 5 dakikada rezervasyon yap.",
    searchPlaceholder: "Örn: klima çalışmıyor, musluk damlıyor, priz çalışmıyor...",
    searchButton: "Usta bul",
    popularCategories: "Popüler kategoriler",
  },
  categories: {
    electric: "Elektrik",
    electric_desc: "Tesisat, priz, aydınlatma",
    plumbing: "Tesisat",
    plumbing_desc: "Su, tesisat, musluk",
    ac: "Klima",
    ac_desc: "Kurulum, temizlik, dolum",
    appliance: "Beyaz eşya",
    appliance_desc: "Çamaşır, buzdolabı, ocak",
    furniture: "Mobilya",
    furniture_desc: "Montaj, onarım, taşıma",
    cleaning: "Temizlik",
    cleaning_desc: "Ev, ofis, derinlemesine",
    repair: "Onarım",
    repair_desc: "Her türlü onarım",
    moving: "Nakliye",
    moving_desc: "Ev, ofis, yük",
  },
  footer: {
    description:
      "Azerbaycan'da ev hizmetleri için güvenilir usta bulma platforması. Hız, güven ve kalite.",
    sections: {
      company: "Şirket",
      support: "Destek",
      legal: "Yasal",
      follow: "Bizi takip et",
    },
    links: {
      aboutUs: "Hakkımızda",
      howItWorks: "Nasıl çalışır",
      contact: "İletişim",
      helpCenter: "Yardım merkezi",
      terms: "Kullanım şartları",
      privacy: "Gizlilik politikası",
      cookies: "Çerez politikası",
    },
    rights: "Tüm hakları saklıdır.",
    madeIn: "Azerbaycan ile yapılmıştır.",
  },
  common: {
    loading: "Yükleniyor...",
    search: "Arama",
    viewAll: "Tümünü gör",
    bookNow: "Şimdi ayır",
    viewProfile: "Profili gör",
    from: "dan",
    rating: "Puan",
    reviews: "yorum",
    completedJobs: "tamamlanan iş",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { az, en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
