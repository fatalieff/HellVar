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
    customerPanel: string;
    providerPanel: string;
    logout: string;
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
    nanny: string;
    nanny_desc: string;
    boiler: string;
    boiler_desc: string;
    it_tech: string;
    it_tech_desc: string;
    repair: string;
    repair_desc: string;
    moving: string;
    moving_desc: string;
  };
  categoriesPage: {
    heroSubtitle: string;
    viewButton: string;
    requestButton: string;
    technicianCount: string;
    detail: {
      searchPlaceholder: string;
      titleTemplate: string;
      filtersTitle: string;
      clearFilters: string;
      sortingLabel: string;
      sortOptions: {
        ratingDesc: string;
        priceAsc: string;
        priceDesc: string;
        experience: string;
        completedJobs: string;
      };
      searchRadiusLabel: string;
      hourlyRateLabel: string;
      minPricePlaceholder: string;
      maxPricePlaceholder: string;
      minExperienceLabel: string;
      minRatingLabel: string;
      radiusLabel?: string;
      verificationLabel?: string;
      activeStatus?: string;
      allLabel: string;
      onlineOnlyLabel: string;
      loading: string;
      emptyTitle: string;
      emptyDescription: string;
    };
  };
  techniciansPage: {
    heroBadge: string;
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    stats: {
      activeProviders: string;
      verified: string;
      averageRating: string;
      onlineNow: string;
    };
    podiumTitle: string;
    podium: {
      rankLabel: string;
    };
    card: {
      ratingLabel: string;
      jobsLabel: string;
      distanceLabel: string;
      radiusLabel: string;
      hourlyLabel: string;
      priceLabel: string;
      negotiable: string;
      addressNotProvided: string;
      profileButton: string;
      reviewButton: string;
      writeButton: string;
      favoriteButtonTitle: string;
    };
    loading: string;
    emptyFavoritesTitle: string;
    emptyNoMatchTitle: string;
    emptyFavoritesDescription: string;
    emptyNoMatchDescription: string;
    resetFilters: string;
    discoverProviders: string;
    cta: {
      badge: string;
      title: string;
      subtitle: string;
      verifiedProfile: string;
      urgentJobs: string;
      stats: string;
      button: string;
    };
    searchPlaceholder: string;
    categoryAllLabel: string;
    tabs: {
      top: string;
      nearby: string;
      new: string;
      favorites: string;
    };
  };
  auth: {
    signIn: {
      title: string;
      subtitle: string;
      emailLabel: string;
      emailPlaceholder: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      forgotPassword: string;
      submit: string;
      loading: string;
      successTitle: string;
      successSubtitle: string;
      noAccount: string;
      createAccount: string;
      invalidEmail: string;
      passwordLength: string;
      invalidCredentials: string;
      emailNotConfirmed: string;
      genericError: string;
      userMissing: string;
    };
    signUp: {
      title: string;
      subtitle: string;
      next: string;
      back: string;
      submit: string;
      customer: string;
      provider: string;
      firstNameRequired: string;
      lastNameRequired: string;
      phoneRequired: string;
      emailRequired: string;
      passwordLength: string;
      roleRequired: string;
      addressRequired: string;
      categoryRequired: string;
      documentsRequired: string;
      duplicateEmail: string;
      userIdMissing: string;
      genericError: string;
    };
  };
  dashboard: {
    searchPlaceholder: string;
    loading: string;
    providersFound: string;
    radius: string;
    mapView: string;
    listView: string;
    yourLocation: string;
    noProviders: string;
    noProvidersHint: string;
    verified: string;
    distance: string;
    call: string;
    chat: string;
    all: string;
    emergency: string;
    plumbing: string;
    electric: string;
    nanny: string;
    cleaning: string;
    boiler: string;
    viewProfile: string;
    profileSubtitle: string;
    phoneLabel: string;
    addressLabel: string;
    categoryLabel: string;
    priceLabel: string;
    aboutLabel: string;
    experienceLabel: string;
    completedJobsLabel: string;
    availabilityLabel: string;
    onlineNow: string;
    offlineNow: string;
    noBio: string;
    customerReviews: string;
    noReviewsYet: string;
    yourReview: string;
    reviewPlaceholder: string;
    submitReview: string;
    updateReview: string;
    reviewAuthHint: string;
    reviewMinLength: string;
    reviewRequiredRole: string;
    reviewSaveError: string;
    unknownAddress: string;
  };
  aboutPage: {
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaStart: string;
    ctaViewProviders: string;
    trustTitle: string;
    trustSubtitle: string;
    statProviders: string;
    statProvidersText: string;
    statSpeed: string;
    statSpeedText: string;
    benefitsEyebrow: string;
    benefitsTitle: string;
    benefitsText: string;
    missionEyebrow: string;
    missionTitle: string;
    missionText: string;
    missionPoints: {
      customer: { title: string; text: string };
      provider: { title: string; text: string };
      experience: { title: string; text: string };
    };
    highlights: {
      trustedChoice: { title: string; text: string };
      fastContact: { title: string; text: string };
      everythingInOne: { title: string; text: string };
    };
    faqEyebrow: string;
    faqTitle: string;
    faqText: string;
    faqs: {
      why: { question: string; answer: string };
      becomeProvider: { question: string; answer: string };
      verification: { question: string; answer: string };
      payments: { question: string; answer: string };
    };
    contactEyebrow: string;
    contactTitle: string;
    contactText: string;
    contactEmail: string;
    contactButton: string;
    signupButton: string;
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
    error?: string;
    active?: string;
    search: string;
    viewAll: string;
    bookNow: string;
    viewProfile: string;
    from: string;
    rating: string;
    reviews: string;
    completedJobs: string;
  };
  notifications: {
    title: string;
    markAllRead: string;
    empty: string;
    emptyHint: string;
    newMessage: string;
    newReview: string;
    justNow: string;
    minutesAgo: string;
    hoursAgo: string;
    daysAgo: string;
    unreadMessages: string;
    openChat: string;
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
    customerPanel: "Müştəri Paneli",
    providerPanel: "Usta Rejiminə Keç",
    logout: "Çıxış et",
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
  auth: {
    signIn: {
      title: "Hesabınıza daxil olun",
      subtitle: "Xidmətlərdən yararlanmaq üçün məlumatlarınızı daxil edin.",
      emailLabel: "E-poçt ünvanı",
      emailPlaceholder: "example@domain.com",
      passwordLabel: "Şifrə",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Şifrəni unutmusunuz?",
      submit: "Daxil ol",
      loading: "Giriş edilir...",
      successTitle: "Uğurla daxil oldunuz!",
      successSubtitle: "Yönləndirilirsiniz...",
      noAccount: "Hesabınız yoxdur?",
      createAccount: "Qeydiyyatdan keçin",
      invalidEmail: "Düzgün e-poçt ünvanı daxil edin.",
      passwordLength: "Şifrə ən azı 6 simvoldan ibarət olmalıdır.",
      invalidCredentials: "E-poçt ünvanı və ya şifrə yanlışdır.",
      emailNotConfirmed: "E-poçt ünvanınız təsdiqlənməyib. Zəhmət olmasa e-poçtunuza göndərilən təsdiq linkinə daxil olun.",
      genericError: "Sistemə daxil olarkən gözlənilməz xəta baş verdi.",
      userMissing: "Giriş zamanı istifadəçi məlumatları tapılmadı.",
    },
    signUp: {
      title: "Hesab yaradın",
      subtitle: "Müştəri və ya usta kimi bir neçə sadə addımda qeydiyyatdan keçin.",
      next: "Davam et",
      back: "Geri dön",
      submit: "Qeydiyyatdan keç",
      customer: "Müştəri",
      provider: "Usta",
      firstNameRequired: "Adınızı daxil edin.",
      lastNameRequired: "Soyadınızı daxil edin.",
      phoneRequired: "Düzgün 9 rəqəmli telefon nömrəsi daxil edin.",
      emailRequired: "Düzgün e-poçt ünvanı daxil edin.",
      passwordLength: "Şifrə ən azı 6 simvoldan ibarət olmalıdır.",
      roleRequired: "Zəhmət olmasa bir rol seçin.",
      addressRequired: "Zəhmət olmasa ünvanınızı seçin və ya daxil edin.",
      categoryRequired: "Zəhmət olmasa kateqoriyanızı seçin.",
      documentsRequired: "Zəhmət olmasa ən azı 1 təsdiqləyici sənəd yükləyin.",
      duplicateEmail: "Bu e-poçt (email) ünvanı ilə artıq qeydiyyatdan keçilib. Zəhmət olmasa daxil olma bölməsinə keçin.",
      userIdMissing: "Qeydiyyat zamanı istifadəçi ID-si tapılmadı.",
      genericError: "Qeydiyyat zamanı gözlənilməz xəta baş verdi.",
    },
  },
  dashboard: {
    searchPlaceholder: "Usta və ya xidmət...",
    loading: "Məhəllənizdəki ustalar axtarılır...",
    providersFound: "Tapılan ustalar",
    radius: "Radius",
    mapView: "Xəritə",
    listView: "Siyahı",
    yourLocation: "Siz buradasınız",
    noProviders: "Bu məsafədə usta tapılmadı.",
    noProvidersHint: "Radius slideri çəkərək süzgəci genişləndirin.",
    verified: "ŞV Təsdiqlənib",
    distance: "{distance} km uzaqlıqda",
    call: "Zəng Et",
    chat: "Çatda Yaz",
    all: "Hamısı",
    emergency: "Təcili",
    plumbing: "Santexnik",
    electric: "Elektrik",
    nanny: "Dayə",
    cleaning: "Təmizlik",
    boiler: "Kombi Ustası",
    viewProfile: "Profilə bax",
    profileSubtitle: "Ustanın əlaqə və rəy məlumatları",
    phoneLabel: "Telefon",
    addressLabel: "Ünvan",
    categoryLabel: "Kateqoriya",
    priceLabel: "Qiymət",
    aboutLabel: "Haqqında",
    experienceLabel: "Təcrübə",
    completedJobsLabel: "Tamamlanmış işlər",
    availabilityLabel: "Status",
    onlineNow: "İndi online",
    offlineNow: "Hazırda offline",
    noBio: "Bu usta hələ bio əlavə etməyib.",
    customerReviews: "Müştəri rəyləri",
    noReviewsYet: "Bu usta üçün hələ rəy yoxdur.",
    yourReview: "Sizin rəyiniz",
    reviewPlaceholder: "Usta haqqında qısa rəyinizi yazın...",
    submitReview: "Rəy göndər",
    updateReview: "Rəyi yenilə",
    reviewAuthHint: "Rəy yazmaq üçün müştəri kimi daxil olun.",
    reviewMinLength: "Rəy mətni minimum 3 simvol olmalıdır.",
    reviewRequiredRole: "Rəy yazmaq üçün müştəri kimi daxil olmalısınız.",
    reviewSaveError: "Rəyi yadda saxlamaq olmadı. Yenidən cəhd edin.",
    unknownAddress: "Ünvan qeyd edilməyib",
  },
  aboutPage: {
    badge: "UstaTap haqqında",
    heroTitle: "Ev işlərini daha sürətli, daha etibarlı və daha rahat etmək üçün yaradıq.",
    heroSubtitle: "UstaTap müştərilərə uyğun ustaları tapmağa, ustalara isə iş tapmağa kömək edən modern bir xidmət platformasıdır. Bizim məqsədimiz hər iki tərəfi də rahat və etibarlı bir prosesə çıxarmaqdır.",
    ctaStart: "İndi başla",
    ctaViewProviders: "Ustaları gör",
    trustTitle: "Etibarlılıq",
    trustSubtitle: "Təsdiqlənmiş xidmət təcrübəsi",
    statProviders: "500+ usta",
    statProvidersText: "Müxtəlif xidmət sahələrində aktiv təkliflər.",
    statSpeed: "15 dəq ərzində",
    statSpeedText: "Sürətli müraciət və ilkin əlaqə imkanı.",
    benefitsEyebrow: "Bizim missiyamız",
    benefitsTitle: "Ev xidmətlərini daha asan, daha təhlükəsiz və daha insanı bir yerdə toplamaq.",
    benefitsText: "UstaTap yalnız bir xidmət siyahısı deyil. Bu, müştəri ilə usta arasında etibar, sürət və rahatlıq yaradan bir məkan olaraq düşünülür.",
    missionEyebrow: "Bizim missiyamız",
    missionTitle: "Ev xidmətlərini daha asan, daha təhlükəsiz və daha insanı bir yerdə toplamaq.",
    missionText: "UstaTap yalnız bir xidmət siyahısı deyil. Bu, müştəri ilə usta arasında etibar, sürət və rahatlıq yaradan bir məkan olaraq düşünülür.",
    missionPoints: {
      customer: { title: "Müştəri məmnuniyyəti", text: "Dəqiq məlumat, rahat seçim və asan əlaqə ilə hər addım daha aydın olur." },
      provider: { title: "Usta inkişafı", text: "İş tapma, profil görünürlüğü və təkliflərin artırılması üçün daha rahat mexanizm yaradırıq." },
      experience: { title: "Davamlı təcrübə", text: "Gələcəkdə daha çox avtomatlaşdırma, reytinq və təklif sistemləri ilə inkişaf edəcəyik." },
    },
    highlights: {
      trustedChoice: { title: "Etibarlı seçim", text: "Təsdiqlənmiş ustalar və müştəri rəyləri ilə daha yaxşı seçim etmək mümkündür." },
      fastContact: { title: "Sürətli əlaqə", text: "Problem yazıldıqdan sonra uyğun usta ilə münasibət çox daha tez qurulur." },
      everythingInOne: { title: "Hər şey bir yerdə", text: "Kateqoriya, reytinq, yaxınlıq və əlaqə imkanları bir platformada birləşdirilir." },
    },
    faqEyebrow: "Tez-tez verilən suallar",
    faqTitle: "Aydınlıq üçün ən çox sorulan sualları bir yerdə topladıq.",
    faqText: "Hələ də bir sualınız qalırsa, aşağıdakı əlaqə bölməsindən yazın. Təsdiq edildikdən sonra davam edəcəyik.",
    faqs: {
      why: { question: "UstaTap nə üçün lazımlıdır?", answer: "UstaTap ev və iş sahəsi üçün etibarlı ustaları tez tapmağa kömək edir. Müştəri problemini yazır, sistem uyğun ustaları göstərir və əlaqə qurma prosesini asanlaşdırır." },
      becomeProvider: { question: "Usta olmaq mümkün müdür?", answer: "Bəli. Qeydiyyatdan keçib profil yaradaraq usta kimi qeydiyyatdan keçə bilərsiniz. Təsdiqləmə sonrası profiliniz görünür və xidmət təklif edə bilirsiniz." },
      verification: { question: "Ustalar necə təsdiqlənir?", answer: "Profil, xidmət sahəsi və məlumatlar yoxlanılır. Təsdiqlənmiş ustalar daha çox etibar qazandığı üçün müştərilər üçün daha əlçatan olur." },
      payments: { question: "Ödəniş və ya rezervasiya necə gedir?", answer: "Hazırda platforma əsasən xidmətə uyğun əlaqə və təşəbbüs prosesi yönləndirilir. Daha sonra rezervasiya və ödəniş addımları daha da genişləndirilə bilər." },
    },
    contactEyebrow: "Sualınız var?",
    contactTitle: "Bizimlə əlaqə saxlamaq üçün rahat bir yol var.",
    contactText: "İstədiyiniz məlumatı yazın, təklif və ya sualınızı bizə göndərin. Təsdiqləndikdən sonra davam edəcəyik.",
    contactEmail: "Suallarınız üçün support@ustatap.az ünvanına yazın.",
    contactButton: "Əlaqə saxla",
    signupButton: "Qeydiyyatdan keç",
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
    nanny: "Dayə",
    nanny_desc: "Peşəkar dayə xidməti və uşaq baxımı",
    boiler: "Kombi Ustası",
    boiler_desc: "Kombi və isitmə sistemlərinin quraşdırılması və təmiri",
    it_tech: "İT / Texniki yardım",
    it_tech_desc: "Kompüter, proqram, internet şəbəkəsi və texniki kömək",
    repair: "Ev təmiri",
    repair_desc: "Dəmir, ağac, şüşə, divar, qapı, qarderob, rəngsaz və alçipan işləri",
    moving: "Daşınma Xidmətləri",
    moving_desc: "Ev, ofis, bağ evi və yük daşınması, mebel sökülməsi və yüklənməsi",
  },
  categoriesPage: {
    heroSubtitle: "UstaTap-da təklif olunan bütün xidmət kateqoriyaları. Sizə uyğun olan sahəni seçin və peşəkar ustaları kəşf edin.",
    viewButton: "Bax",
    requestButton: "İstəmək",
    technicianCount: "usta",
    detail: {
      titleTemplate: "{category} ustaları",
      searchPlaceholder: "Usta adı və ya ünvanı ilə axtar...",
      filtersTitle: "Filtr və sıralama",
      clearFilters: "Təmizlə",
      sortingLabel: "Sıralama",
      sortOptions: {
        ratingDesc: "Reytinq: Yüksəkdən Aşağıya",
        priceAsc: "Qiymət: Artan sıra",
        priceDesc: "Qiymət: Azalan sıra",
        experience: "Təcrübə: Ən çox",
        completedJobs: "Görülən iş sayı: Ən çox",
      },
      searchRadiusLabel: "Axtarış radiusu",
      hourlyRateLabel: "Saatlıq ödəniş (AZN)",
      minPricePlaceholder: "Min",
      maxPricePlaceholder: "Max",
      minExperienceLabel: "Minimum Təcrübə",
      minRatingLabel: "Minimum Reytinq",
      allLabel: "Hamısı",
      onlineOnlyLabel: "İndi Online",
      loading: "Ustalar yüklənir, zəhmət olmasa gözləyin...",
      emptyTitle: "Uyğun usta tapılmadı",
      emptyDescription:
        "Seçdiyiniz süzgəc parametrlərinə uyğun usta yoxdur. Süzgəcləri təmizləyərək və ya axtarış məsafəsini genişləndirərək yenidən yoxlayın.",
    },
  },
  techniciansPage: {
    heroBadge: "Peşəkar ustalar siyahısı",
    heroTitle: "Ustalar",
    heroHighlight: "Ən etibarlı, ən yaxın, ən yeni",
    heroSubtitle:
      "UstaTap-da təqdim olunan bütün peşəkar ustaları bir yerdə kəşf edin. Reytinq, məsafə və təcrübəyə uyğun seçim edin.",
    stats: {
      activeProviders: "Aktiv Usta",
      verified: "Təsdiqlənmiş",
      averageRating: "Orta Reytinq",
      onlineNow: "İndi Online",
    },
    podiumTitle: "Aylıq Liderlər",
    podium: {
      rankLabel: "Sıra",
    },
    card: {
      ratingLabel: "Reytinq",
      jobsLabel: "İşlər",
      distanceLabel: "Uzaqlıq",
      radiusLabel: "Axtarış radiusu",
      hourlyLabel: "Saatlıq",
      priceLabel: "Qiymət",
      negotiable: "Danışıqla",
      addressNotProvided: "Ünvan qeyd edilməyib",
      profileButton: "Profil",
      reviewButton: "Rəy",
      writeButton: "Yaz",
      favoriteButtonTitle: "Favoritlərə əlavə et",
    },
    loading: "Ustalar yüklənir, zəhmət olmasa gözləyin...",
    emptyFavoritesTitle: "Hələ favorit usta yoxdur",
    emptyNoMatchTitle: "Uyğun usta tapılmadı",
    emptyFavoritesDescription:
      "Ustaların yanındakı ❤️ düyməsini basaraq onları favoritlərə əlavə edə bilərsiniz.",
    emptyNoMatchDescription:
      "Seçdiyiniz parametrlərə uyğun usta yoxdur. Süzgəcləri dəyişdirməyi yoxlayın.",
    resetFilters: "Süzgəcləri sıfırla",
    discoverProviders: "Ustaları kəşf et",
    cta: {
      badge: "Sən də peşəkarsan?",
      title: "Xidmətlərini UstaTap-da göstər",
      subtitle:
        "Müştərilərlə birbaşa əlaqə qur, sifarişlər qəbul et və qazancını artır. Qeydiyyat tamamilə pulsuzdur!",
      verifiedProfile: "Təsdiqlənmiş profil",
      urgentJobs: "Təcili sifarişlər",
      stats: "Statistikalar",
      button: "Usta Ol",
    },
    searchPlaceholder: "Usta adı, kateqoriya və ya ünvan... ",
    categoryAllLabel: "Hamısı",
    tabs: {
      top: "Ən Yaxşılar",
      nearby: "Ən Yaxın",
      new: "Yeni Qoşulanlar",
      favorites: "Favoritlərim",
    },
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
    error: "Xəta baş verdi",
    active: "Aktiv",
    search: "Axtarış",
    viewAll: "Hamısını gör",
    bookNow: "İndi rezerv et",
    viewProfile: "Profili gör",
    from: "dan",
    rating: "Reytinq",
    reviews: "rəy",
    completedJobs: "tamamlanmış iş",
  },
  notifications: {
    title: "Bildirişlər",
    markAllRead: "Hamısını oxunmuş et",
    empty: "Bildiriş yoxdur",
    emptyHint: "Yeni bildirişlər burada görsənəcək",
    newMessage: "Yeni mesaj",
    newReview: "Yeni rəy",
    justNow: "Indicə",
    minutesAgo: "dəq. əvvəl",
    hoursAgo: "saat əvvəl",
    daysAgo: "gün əvvəl",
    unreadMessages: "oxunmamış mesaj",
    openChat: "Çatı aç",
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
    customerPanel: "Customer Dashboard",
    providerPanel: "Switch to Provider Mode",
    logout: "Sign out",
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
  auth: {
    signIn: {
      title: "Sign in to your account",
      subtitle: "Enter your details to access our services.",
      emailLabel: "Email address",
      emailPlaceholder: "example@domain.com",
      passwordLabel: "Password",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Forgot password?",
      submit: "Sign in",
      loading: "Signing in...",
      successTitle: "Signed in successfully!",
      successSubtitle: "Redirecting...",
      noAccount: "Don't have an account?",
      createAccount: "Create one",
      invalidEmail: "Please enter a valid email address.",
      passwordLength: "Password must be at least 6 characters long.",
      invalidCredentials: "Email or password is incorrect.",
      emailNotConfirmed: "Your email address hasn't been confirmed yet. Please follow the confirmation link in your email.",
      genericError: "An unexpected error occurred while signing in.",
      userMissing: "User information could not be found during sign-in.",
    },
    signUp: {
      title: "Create an account",
      subtitle: "Join as a customer or provider in a few simple steps.",
      next: "Continue",
      back: "Go back",
      submit: "Create account",
      customer: "Customer",
      provider: "Provider",
      firstNameRequired: "Please enter your first name.",
      lastNameRequired: "Please enter your last name.",
      phoneRequired: "Please enter a valid 9-digit phone number.",
      emailRequired: "Please enter a valid email address.",
      passwordLength: "Password must be at least 6 characters long.",
      roleRequired: "Please select a role.",
      addressRequired: "Please select or enter your address.",
      categoryRequired: "Please select your category.",
      documentsRequired: "Please upload at least one supporting document.",
      duplicateEmail: "An account already exists with this email. Please sign in instead.",
      userIdMissing: "The user ID could not be found during sign-up.",
      genericError: "An unexpected error occurred during sign-up.",
    },
  },
  dashboard: {
    searchPlaceholder: "Provider or service...",
    loading: "Searching providers in your area...",
    providersFound: "Providers found",
    radius: "Radius",
    mapView: "Map",
    listView: "List",
    yourLocation: "You are here",
    noProviders: "No providers were found in this range.",
    noProvidersHint: "Increase the radius to broaden your search.",
    verified: "Verified",
    distance: "{distance} km away",
    call: "Call",
    chat: "Message",
    all: "All",
    emergency: "Urgent",
    plumbing: "Plumbing",
    electric: "Electrical",
    nanny: "Nanny",
    cleaning: "Cleaning",
    boiler: "Boiler technician",
    viewProfile: "View profile",
    profileSubtitle: "Provider contact and review details",
    phoneLabel: "Phone",
    addressLabel: "Address",
    categoryLabel: "Category",
    priceLabel: "Price",
    aboutLabel: "About",
    experienceLabel: "Experience",
    completedJobsLabel: "Completed jobs",
    availabilityLabel: "Status",
    onlineNow: "Online now",
    offlineNow: "Offline now",
    noBio: "This provider has not added a bio yet.",
    customerReviews: "Customer reviews",
    noReviewsYet: "No reviews for this provider yet.",
    yourReview: "Your review",
    reviewPlaceholder: "Write a short review about this provider...",
    submitReview: "Submit review",
    updateReview: "Update review",
    reviewAuthHint: "Sign in as a customer to leave a review.",
    reviewMinLength: "Review text must be at least 3 characters long.",
    reviewRequiredRole: "You must be signed in as a customer to leave a review.",
    reviewSaveError: "The review could not be saved. Please try again.",
    unknownAddress: "Address not provided",
  },
  aboutPage: {
    badge: "About UstaTap",
    heroTitle: "We built this platform to make home services faster, more reliable, and easier to access.",
    heroSubtitle: "UstaTap helps customers find trusted professionals and helps providers discover new opportunities. Our goal is to make both sides of the experience smoother and more dependable.",
    ctaStart: "Get started",
    ctaViewProviders: "View providers",
    trustTitle: "Trust",
    trustSubtitle: "Verified service experience",
    statProviders: "500+ pros",
    statProvidersText: "Active offers across multiple home service categories.",
    statSpeed: "In 15 min",
    statSpeedText: "Fast first contact and quick initial connection.",
    benefitsEyebrow: "Our mission",
    benefitsTitle: "Making home services simpler, safer, and more human-centered.",
    benefitsText: "UstaTap is more than a directory. It is a space designed to build trust, speed, and comfort between customers and providers.",
    missionEyebrow: "Our mission",
    missionTitle: "Making home services simpler, safer, and more human-centered.",
    missionText: "UstaTap is more than a directory. It is a space designed to build trust, speed, and comfort between customers and providers.",
    missionPoints: {
      customer: { title: "Customer satisfaction", text: "Every step becomes clearer with accurate information, easy choices, and simple communication." },
      provider: { title: "Provider growth", text: "We create a smoother experience for finding work, increasing visibility, and improving opportunities." },
      experience: { title: "A lasting experience", text: "We will keep expanding with more automation, reviews, and intelligent matching features." },
    },
    highlights: {
      trustedChoice: { title: "Trusted choice", text: "Verified providers and customer reviews make it easier to choose with confidence." },
      fastContact: { title: "Fast contact", text: "Once a request is submitted, connecting with the right provider becomes much faster." },
      everythingInOne: { title: "Everything in one place", text: "Category, ratings, proximity, and contact options are brought together in one platform." },
    },
    faqEyebrow: "Frequently asked questions",
    faqTitle: "We gathered the most common questions in one place for clarity.",
    faqText: "If you still have a question, feel free to reach out through the contact section below. We will continue from there.",
    faqs: {
      why: { question: "Why is UstaTap useful?", answer: "UstaTap helps people quickly find trusted professionals for home and business needs. Customers describe the problem, the system suggests suitable providers, and the connection process becomes simpler." },
      becomeProvider: { question: "Can I become a provider?", answer: "Yes. After signing up and creating a profile, you can join as a provider. Once verified, your profile becomes visible and you can offer services." },
      verification: { question: "How are providers verified?", answer: "Profiles, service areas, and information are reviewed. Verified providers are easier for customers to trust and contact." },
      payments: { question: "How do payments or bookings work?", answer: "At the moment the platform focuses on connection and onboarding. Future updates will expand booking and payment flows." },
    },
    contactEyebrow: "Have a question?",
    contactTitle: "There is a simple way to get in touch with us.",
    contactText: "Write us with any information, offer, or question you have. We will continue from there after confirmation.",
    contactEmail: "Send your questions to support@ustatap.az.",
    contactButton: "Contact us",
    signupButton: "Sign up",
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
    nanny: "Nanny",
    nanny_desc: "Professional child care and nanny services",
    boiler: "Boiler Service",
    boiler_desc: "Boiler and heating systems installation and repair",
    it_tech: "IT / Technical Support",
    it_tech_desc: "Computer, software, network setup and tech help",
    repair: "Home Renovation",
    repair_desc: "Handyman, painting, drywall, door, window and home repairs",
    moving: "Relocation & Cargo",
    moving_desc: "Home, office, villa & cargo moving, furniture disassembly and loading",
  },
  categoriesPage: {
    heroSubtitle: "All service categories offered on UstaTap. Pick the area that fits you and discover expert pros.",
    viewButton: "View",
    requestButton: "Request",
    technicianCount: "pro",
    detail: {
      titleTemplate: "{category} technicians",
      searchPlaceholder: "Search by technician name or address...",
      filtersTitle: "Filters & sorting",
      clearFilters: "Clear",
      sortingLabel: "Sort by",
      sortOptions: {
        ratingDesc: "Rating: High to low",
        priceAsc: "Price: Low to high",
        priceDesc: "Price: High to low",
        experience: "Experience: Most",
        completedJobs: "Completed jobs: Most",
      },
      searchRadiusLabel: "Search radius",
      hourlyRateLabel: "Hourly rate (AZN)",
      minPricePlaceholder: "Min",
      maxPricePlaceholder: "Max",
      minExperienceLabel: "Minimum experience",
      minRatingLabel: "Minimum rating",
      radiusLabel: "Distance",
      verificationLabel: "Verification",
      activeStatus: "Active",
      allLabel: "All",
      onlineOnlyLabel: "Online now",
      loading: "Loading providers, please wait...",
      emptyTitle: "No matching provider found",
      emptyDescription:
        "There are no providers matching your filter settings. Try clearing filters or widening your search radius.",
    },
  },
  techniciansPage: {
    heroBadge: "Professional technicians list",
    heroTitle: "Technicians",
    heroHighlight: "Most reliable, closest, newest",
    heroSubtitle:
      "Discover all professional technicians available on UstaTap in one place. Choose based on rating, distance and experience.",
    stats: {
      activeProviders: "Active pros",
      verified: "Verified",
      averageRating: "Average rating",
      onlineNow: "Online now",
    },
    podiumTitle: "Monthly leaders",
    podium: {
      rankLabel: "Rank",
    },
    card: {
      ratingLabel: "Rating",
      jobsLabel: "Jobs",
      distanceLabel: "Distance",
      radiusLabel: "Radius",
      hourlyLabel: "Hourly",
      priceLabel: "Price",
      negotiable: "Negotiable",
      addressNotProvided: "Address not provided",
      profileButton: "Profile",
      reviewButton: "Review",
      writeButton: "Write",
      favoriteButtonTitle: "Add to favorites",
    },
    loading: "Loading technicians, please wait...",
    emptyFavoritesTitle: "No favorite technicians yet",
    emptyNoMatchTitle: "No matching technicians found",
    emptyFavoritesDescription:
      "Tap the ❤️ button next to technicians to add them to favorites.",
    emptyNoMatchDescription:
      "No technicians match your selected filters. Try adjusting the filters.",
    resetFilters: "Reset filters",
    discoverProviders: "Discover technicians",
    cta: {
      badge: "Are you also a pro?",
      title: "Show your services on UstaTap",
      subtitle:
        "Connect directly with customers, accept jobs and increase your earnings. Registration is completely free!",
      verifiedProfile: "Verified profile",
      urgentJobs: "Urgent requests",
      stats: "Statistics",
      button: "Become a pro",
    },
    searchPlaceholder: "Technician name, category or address...",
    categoryAllLabel: "All",
    tabs: {
      top: "Top",
      nearby: "Nearby",
      new: "New",
      favorites: "Favorites",
    },
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
    error: "An error occurred",
    active: "Active",
    search: "Search",
    viewAll: "View all",
    bookNow: "Book now",
    viewProfile: "View profile",
    from: "from",
    rating: "Rating",
    reviews: "reviews",
    completedJobs: "completed jobs",
  },
  notifications: {
    title: "Notifications",
    markAllRead: "Mark all as read",
    empty: "No notifications",
    emptyHint: "New notifications will appear here",
    newMessage: "New message",
    newReview: "New review",
    justNow: "Just now",
    minutesAgo: "min ago",
    hoursAgo: "hr ago",
    daysAgo: "d ago",
    unreadMessages: "unread message(s)",
    openChat: "Open chat",
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
    customerPanel: "Müşteri Paneli",
    providerPanel: "Usta Moduna Geç",
    logout: "Çıkış yap",
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
  auth: {
    signIn: {
      title: "Hesabınıza giriş yapın",
      subtitle: "Hizmetlere erişmek için bilgilerinizi girin.",
      emailLabel: "E-posta adresi",
      emailPlaceholder: "example@domain.com",
      passwordLabel: "Şifre",
      passwordPlaceholder: "••••••••",
      forgotPassword: "Şifrenizi mi unuttunuz?",
      submit: "Giriş yap",
      loading: "Giriş yapılıyor...",
      successTitle: "Başarıyla giriş yaptınız!",
      successSubtitle: "Yönlendiriliyorsunuz...",
      noAccount: "Hesabınız yok mu?",
      createAccount: "Kayıt olun",
      invalidEmail: "Lütfen geçerli bir e-posta adresi girin.",
      passwordLength: "Şifre en az 6 karakter olmalıdır.",
      invalidCredentials: "E-posta veya şifre yanlış.",
      emailNotConfirmed: "E-posta adresiniz henüz doğrulanmadı. Lütfen e-postanızdaki doğrulama bağlantısına gidin.",
      genericError: "Giriş sırasında beklenmeyen bir hata oluştu.",
      userMissing: "Giriş sırasında kullanıcı bilgisi bulunamadı.",
    },
    signUp: {
      title: "Bir hesap oluşturun",
      subtitle: "Müşteri veya usta olarak birkaç basit adımda kayıt olun.",
      next: "Devam et",
      back: "Geri dön",
      submit: "Kayıt ol",
      customer: "Müşteri",
      provider: "Usta",
      firstNameRequired: "Lütfen adınızı girin.",
      lastNameRequired: "Lütfen soyadınızı girin.",
      phoneRequired: "Lütfen geçerli 9 haneli telefon numarası girin.",
      emailRequired: "Lütfen geçerli bir e-posta adresi girin.",
      passwordLength: "Şifre en az 6 karakter olmalıdır.",
      roleRequired: "Lütfen bir rol seçin.",
      addressRequired: "Lütfen adresinizi seçin veya girin.",
      categoryRequired: "Lütfen kategorinizi seçin.",
      documentsRequired: "Lütfen en az bir destekleyici belge yükleyin.",
      duplicateEmail: "Bu e-posta adresiyle zaten kayıtlısınız. Lütfen giriş yapın.",
      userIdMissing: "Kayıt sırasında kullanıcı kimliği bulunamadı.",
      genericError: "Kayıt sırasında beklenmeyen bir hata oluştu.",
    },
  },
  dashboard: {
    searchPlaceholder: "Usta veya hizmet...",
    loading: "Bölgenizdeki ustalar aranıyor...",
    providersFound: "Bulunan ustalar",
    radius: "Yarıçap",
    mapView: "Harita",
    listView: "Liste",
    yourLocation: "Buradasınız",
    noProviders: "Bu mesafede usta bulunamadı.",
    noProvidersHint: "Aramayı genişletmek için yarıçapı artırın.",
    verified: "SV Onaylı",
    distance: "{distance} km uzakta",
    call: "Ara",
    chat: "Mesaj Gönder",
    all: "Hepsi",
    emergency: "Acil",
    plumbing: "Tesisatçı",
    electric: "Elektrikçi",
    nanny: "Bebek Bakıcısı",
    cleaning: "Temizlik",
    boiler: "Kombi Teknisyeni",
    viewProfile: "Profili gör",
    profileSubtitle: "Ustanın iletişim ve yorum bilgileri",
    phoneLabel: "Telefon",
    addressLabel: "Adres",
    categoryLabel: "Kategori",
    priceLabel: "Fiyat",
    aboutLabel: "Hakkında",
    experienceLabel: "Tecrübe",
    completedJobsLabel: "Tamamlanan işler",
    availabilityLabel: "Durum",
    onlineNow: "Şu anda çevrimiçi",
    offlineNow: "Şu anda çevrimdışı",
    noBio: "Bu usta henüz bir bio eklemedi.",
    customerReviews: "Müşteri yorumları",
    noReviewsYet: "Bu usta için henüz yorum yok.",
    yourReview: "Yorumunuz",
    reviewPlaceholder: "Usta hakkında kısa bir yorum yazın...",
    submitReview: "Yorum gönder",
    updateReview: "Yorumu güncelle",
    reviewAuthHint: "Yorum yazmak için müşteri olarak giriş yapın.",
    reviewMinLength: "Yorum metni en az 3 karakter olmalıdır.",
    reviewRequiredRole: "Yorum yazmak için müşteri olarak giriş yapmalısınız.",
    reviewSaveError: "Yorum kaydedilemedi. Lütfen tekrar deneyin.",
    unknownAddress: "Adres belirtilmemiş",
  },
  aboutPage: {
    badge: "UstaTap Hakkında",
    heroTitle: "Ev işlerini daha hızlı, daha güvenilir ve daha erişilebilir hale getirmek için bu platformu kurduk.",
    heroSubtitle: "UstaTap, müşterilerin güvenilir uzmanlara ulaşmasına ve ustaların yeni fırsatları keşfetmesine yardımcı olur. Amacımız her iki tarafın deneyimini de daha akıcı ve güvenilir hale getirmektir.",
    ctaStart: "Başla",
    ctaViewProviders: "Ustaları gör",
    trustTitle: "Güven",
    trustSubtitle: "Doğrulanmış hizmet deneyimi",
    statProviders: "500+ usta",
    statProvidersText: "Birçok hizmet kategorisinde aktif teklifler.",
    statSpeed: "15 dakikada",
    statSpeedText: "Hızlı ilk temas ve hızlı bağlantı imkanı.",
    benefitsEyebrow: "Misyonumuz",
    benefitsTitle: "Ev hizmetlerini daha basit, daha güvenli ve daha insana yakın hale getiriyoruz.",
    benefitsText: "UstaTap sadece bir rehber değil; müşteriler ile ustalar arasında güven, hız ve rahatlık kurmayı amaçlayan bir alan.",
    missionEyebrow: "Misyonumuz",
    missionTitle: "Ev hizmetlerini daha basit, daha güvenli ve daha insana yakın hale getiriyoruz.",
    missionText: "UstaTap sadece bir rehber değil; müşteriler ile ustalar arasında güven, hız ve rahatlık kurmayı amaçlayan bir alan.",
    missionPoints: {
      customer: { title: "Müşteri memnuniyeti", text: "Doğru bilgi, kolay seçim ve basit iletişim ile her adım daha anlaşılır hale gelir." },
      provider: { title: "Usta büyümesi", text: "İş bulma, görünürlük artırma ve fırsatların daha kolay açılması için daha akıcı bir deneyim sunuyoruz." },
      experience: { title: "Kalıcı bir deneyim", text: "Daha fazla otomasyon, yorum ve akıllı eşleştirme ile hizmeti genişletmeye devam edeceğiz." },
    },
    highlights: {
      trustedChoice: { title: "Güvenilir seçim", text: "Doğrulanmış ustalar ve müşteri yorumlarıyla daha emin seçim yapmak kolaylaşır." },
      fastContact: { title: "Hızlı iletişim", text: "Talep gönderildikten sonra doğru usta ile bağlantı çok daha hızlı kurulur." },
      everythingInOne: { title: "Her şey bir yerde", text: "Kategori, puan, yakınlık ve iletişim seçenekleri tek bir platformda bir araya gelir." },
    },
    faqEyebrow: "Sık sorulan sorular",
    faqTitle: "Açıklık için en sık sorulan soruları bir araya topladık.",
    faqText: "Hâlâ bir sorunuz varsa, aşağıdaki iletişim bölümünden yazabilirsiniz. Oradan devam edeceğiz.",
    faqs: {
      why: { question: "UstaTap neden işe yarar?", answer: "UstaTap, ev ve iş yerleri için güvenilir uzmanları hızlıca bulmaya yardımcı olur. Müşteriler sorunu açıklar, sistem uygun ustaları önerir ve bağlanma süreci daha basit hale gelir." },
      becomeProvider: { question: "Usta olabilir miyim?", answer: "Evet. Kayıt olup profil oluşturarak usta olarak katılabilirsiniz. Onaylandıktan sonra profiliniz görünür hale gelir ve hizmet sunabilirsiniz." },
      verification: { question: "Ustalar nasıl doğrulanır?", answer: "Profil, hizmet alanı ve bilgiler kontrol edilir. Doğrulanmış ustalar müşteriler için daha güvenilir ve ulaşılabilir olur." },
      payments: { question: "Ödeme veya rezervasyon nasıl işler?", answer: "Şu anda platform temel olarak bağlantı ve giriş sürecine odaklanır. Gelecekte rezervasyon ve ödeme akışları genişletilecektir." },
    },
    contactEyebrow: "Sorunuz mu var?",
    contactTitle: "Bizimle iletişime geçmenin kolay bir yolu var.",
    contactText: "İster bilgi, ister teklif ya da soru paylaşın. Onaylandıktan sonra devam edeceğiz.",
    contactEmail: "Sorularınızı support@ustatap.az adresine gönderin.",
    contactButton: "İletişime geç",
    signupButton: "Kayıt ol",
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
    nanny: "Bebek Bakıcısı",
    nanny_desc: "Profesyonel bebek bakımı ve eğitmen hizmetleri",
    boiler: "Kombi Ustası",
    boiler_desc: "Kombi ve ısıtma sistemleri tamir, bakım ve montajı",
    it_tech: "IT / Teknik Destek",
    it_tech_desc: "Bilgisayar, yazılım, internet kurulumu ve teknik yardım",
    repair: "Ev Tadilatı",
    repair_desc: "Boya, alçıpan, kapı, mobilya montajı ve ev onarım işleri",
    moving: "Nakliye & Taşıma",
    moving_desc: "Ev, ofis, yazlık ve yük taşıma, mobilya söküm ve yükleme",
  },
  categoriesPage: {
    heroSubtitle: "UstaTap'ta sunulan tüm hizmet kategorileri. Size uygun alanı seçin ve profesyonel ustaları keşfedin.",
    viewButton: "Görüntüle",
    requestButton: "Talep et",
    technicianCount: "usta",
    detail: {
      titleTemplate: "{category} ustalar",
      searchPlaceholder: "Usta adı veya adres ile ara...",
      filtersTitle: "Filtreler ve sıralama",
      clearFilters: "Temizle",
      sortingLabel: "Sırala",
      sortOptions: {
        ratingDesc: "Puan: Yüksekten Düşüğe",
        priceAsc: "Fiyat: Artan sıra",
        priceDesc: "Fiyat: Azalan sıra",
        experience: "Deneyim: En çok",
        completedJobs: "Tamamlanan işler: En çok",
      },
      searchRadiusLabel: "Arama yarıçapı",
      hourlyRateLabel: "Saatlik ücret (AZN)",
      minPricePlaceholder: "Min",
      maxPricePlaceholder: "Max",
      minExperienceLabel: "Minimum Deneyim",
      minRatingLabel: "Minimum Puan",
      radiusLabel: "Mesafe",
      verificationLabel: "Doğrulama",
      activeStatus: "Aktif",
      allLabel: "Hepsi",
      onlineOnlyLabel: "Şu anda Çevrimiçi",
      loading: "Ustalar yükleniyor, lütfen bekleyin...",
      emptyTitle: "Eşleşen usta bulunamadı",
      emptyDescription:
        "Filtre ayarlarınıza uyan usta yok. Filtreleri temizlemeyi veya arama yarıçapını genişletmeyi deneyin.",
    },
  },
  techniciansPage: {
    heroBadge: "Profesyonel ustalar listesi",
    heroTitle: "Ustalar",
    heroHighlight: "En güvenilir, en yakın, en yeni",
    heroSubtitle:
      "UstaTap'ta sunulan tüm profesyonel ustaları tek bir yerde keşfedin. Puan, mesafe ve deneyime göre seçin.",
    stats: {
      activeProviders: "Aktif Usta",
      verified: "Doğrulandı",
      averageRating: "Ortalama Puan",
      onlineNow: "Şu anda Çevrimiçi",
    },
    podiumTitle: "Aylık liderler",
    podium: {
      rankLabel: "Sıra",
    },
    card: {
      ratingLabel: "Puan",
      jobsLabel: "İşler",
      distanceLabel: "Mesafe",
      radiusLabel: "Arama yarıçapı",
      hourlyLabel: "Saatlik",
      priceLabel: "Fiyat",
      negotiable: "Pazarlığa açık",
      addressNotProvided: "Adres belirtilmemiş",
      profileButton: "Profil",
      reviewButton: "Yorum",
      writeButton: "Yaz",
      favoriteButtonTitle: "Favorilere ekle",
    },
    loading: "Ustalar yükleniyor, lütfen bekleyin...",
    emptyFavoritesTitle: "Henüz favori usta yok",
    emptyNoMatchTitle: "Eşleşen usta bulunamadı",
    emptyFavoritesDescription:
      "Ustaların yanındaki ❤️ düğmesine basarak onları favorilere ekleyebilirsiniz.",
    emptyNoMatchDescription:
      "Seçtiğiniz filtrelere uygun usta yok. Filtreleri ayarlamayı deneyin.",
    resetFilters: "Filtreleri sıfırla",
    discoverProviders: "Ustaları keşfet",
    cta: {
      badge: "Sen de profesyonel misin?",
      title: "Hizmetlerini UstaTap'ta göster",
      subtitle:
        "Müşterilerle doğrudan iletişime geç, işler kabul et ve kazancını artır. Kayıt tamamen ücretsiz!",
      verifiedProfile: "Doğrulanmış profil",
      urgentJobs: "Acil talepler",
      stats: "İstatistikler",
      button: "Usta Ol",
    },
    searchPlaceholder: "Usta adı, kategori veya adres...",
    categoryAllLabel: "Hepsi",
    tabs: {
      top: "En İyi",
      nearby: "Yakın",
      new: "Yeni",
      favorites: "Favoriler",
    },
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
    error: "Bir hata oluştu",
    active: "Aktif",
    search: "Arama",
    viewAll: "Tümünü gör",
    bookNow: "Şimdi ayır",
    viewProfile: "Profili gör",
    from: "dan",
    rating: "Puan",
    reviews: "yorum",
    completedJobs: "tamamlanan iş",
  },
  notifications: {
    title: "Bildirimler",
    markAllRead: "Tümünü okundu say",
    empty: "Bildirim yok",
    emptyHint: "Yeni bildirimler burada görünecek",
    newMessage: "Yeni mesaj",
    newReview: "Yeni yorum",
    justNow: "Şimdi",
    minutesAgo: "dk önce",
    hoursAgo: "sa önce",
    daysAgo: "gün önce",
    unreadMessages: "okunmamış mesaj",
    openChat: "Sohbetı aç",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { az, en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
