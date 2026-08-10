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
  homePage: {
    queryTooShort: string;
    adviceError: string;
    aiUrgentBadge: string;
    aiSuggestionBadge: string;
    aiUrgentTitle: string;
    aiSuggestionTitle: string;
    nextStepLabel: string;
    nextStepDesc: string;
    showMatchingProviders: string;
    aiErrorBadge: string;
    viewButtonLabel: string;
    requestButtonLabel: string;
    allCategoriesTitle: string;
    stepTwoDesc: string;
    stepThreeDesc: string;
    ctaTitle: string;
    ctaDesc: string;
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
    barber: string;
    barber_desc: string;
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
      stepBasic: string;
      stepRole: string;
      stepComplete: string;
      successTitle: string;
      successDesc: string;
      successProviderNote: string;
      successSignIn: string;
      basicTitle: string;
      basicSubtitle: string;
      firstNameLabel: string;
      firstNamePlaceholder: string;
      lastNameLabel: string;
      lastNamePlaceholder: string;
      phoneLabel: string;
      phonePlaceholder: string;
      emailLabel: string;
      passwordLabel: string;
      roleTitle: string;
      roleSubtitle: string;
      customerDesc: string;
      providerDesc: string;
      addressTitle: string;
      addressSubtitle: string;
      districtLabel: string;
      districtPlaceholder: string;
      districtSuffix: string;
      fullAddressLabel: string;
      fullAddressPlaceholder: string;
      providerTitle: string;
      providerSubtitle: string;
      categoryLabel: string;
      categoryPlaceholder: string;
      radiusLabel: string;
      documentsLabel: string;
      documentsDropText: string;
      documentsFileTypes: string;
      selectedDocsLabel: string;
      removeFileLabel: string;
      submitLoading: string;
      submitComplete: string;
      providerCategories: Record<string, string>;
      avatarLabel: string;
      avatarHint: string;
      avatarPickText: string;
      avatarRemove: string;
      avatarPendingNote: string;
    };
  };
  profile: {
    title: string;
    subtitle: string;
    personalInfoTitle: string;
    personalInfoHint: string;
    firstNameLabel: string;
    firstNamePlaceholder: string;
    lastNameLabel: string;
    lastNamePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    addressLabel: string;
    addressPlaceholder: string;
    bioLabel: string;
    bioPlaceholder: string;
    priceLabel: string;
    priceMinLabel: string;
    priceMaxLabel: string;
    priceHint: string;
    roleLabel: string;
    roleCustomer: string;
    roleProvider: string;
    memberSince: string;
    avatarSectionTitle: string;
    avatarSectionHint: string;
    changePhoto: string;
    removePhoto: string;
    uploadLoading: string;
    saveChanges: string;
    saving: string;
    savedSuccess: string;
    saveError: string;
    loadError: string;
    notSignedIn: string;
    signIn: string;
    avatarSaved: string;
    fileTooLarge: string;
    invalidFileType: string;
    pendingAvatarApplying: string;
    pendingAvatarApplied: string;
    backHome: string;
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
  chatPage: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyDescription: string;
    startConversation: string;
    youPrefix: string;
    defaultUser: string;
    backAriaLabel: string;
    chatTitle: string;
    liveChat: string;
    emptyState: string;
    inputPlaceholder: string;
    sendButton: string;
    selfChatError: string;
    timeAgo: {
      now: string;
      minutesAgo: string;
      hoursAgo: string;
      daysAgo: string;
    };
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
  profileMenu: {
    menuLabel: string;
    roleCustomer: string;
    roleProvider: string;
    emailLabel: string;
    phoneLabel: string;
    addressLabel: string;
    notProvided: string;
    viewProfile: string;
  };
  providerDashboard: {
    weeklyEarnings: string;
    completedJobs: string;
    averageRating: string;
    waitingOrders: string;
    jobUnit: string;
    waitingUnit: string;
    currencyUnit: string;
    ratingUnit: string;
  };
  bookings: {
    badge: string;
    titleForProvider: string;
    subtitleTemplate: string;
    authRequiredTitle: string;
    authRequiredDesc: string;
    roleRequiredTitle: string;
    roleRequiredDesc: string;
    successTitle: string;
    successDesc: string;
    serviceLabel: string;
    servicePlaceholder: string;
    dateLabel: string;
    timeLabel: string;
    timePlaceholder: string;
    durationLabel: string;
    durationMinutes: string;
    priceLabel: string;
    addressLabel: string;
    addressPlaceholder: string;
    noteLabel: string;
    notePlaceholder: string;
    optional: string;
    cancel: string;
    submit: string;
    submitting: string;
    submitted: string;
    errorService: string;
    errorDateTime: string;
    errorPrice: string;
    errorRole: string;
    errorMissingTable: string;
    errorSelf: string;
    errorGeneric: string;
    tomorrow: string;
    days: string[];
    months: string[];
    providerGeneric: string;
    customerGeneric: string;
    tabActiveTemplate: string;
    tabCompleted: string;
    tabCancelled: string;
    listEmptyTitle: string;
    listEmptyDesc: string;
    minutesShort: string;
    currencySymbol: string;
    incomingTitle: string;
    activeTitle: string;
    pastTitle: string;
    emptyTitle: string;
    emptyDesc: string;
    incomingEmpty: string;
    activeEmpty: string;
    accept: string;
    reject: string;
    complete: string;
    chat: string;
    cancelBooking: string;
    openChat: string;
    book: string;
    status: {
      PENDING: string;
      ACCEPTED: string;
      REJECTED: string;
      CANCELLED: string;
      COMPLETED: string;
      EXPIRED: string;
    };
    pageTitle: string;
    pageSubtitle: string;
  };
};

const az: Dictionary = {
  brand: {
    name: "HəllVar",
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
    title: "Ev probleminə uyğun ustanı tap",
    subtitle:
      "Sadəcə problemini yaz, biz sənə uyğun ustaları göstərək. 5 dəqiqədə rezervasiya et.",
    searchPlaceholder: "Məsələn: kondisioner işləmir, su kəsilir, rozetka yandirilmir...",
    searchButton: "HəllVar",
    popularCategories: "Məşhur kateqoriyalar",
  },
  homePage: {
    queryTooShort: "Problemi bir az daha ətraflı yazın.",
    adviceError: "Məsləhət alınmadı.",
    aiUrgentBadge: "Təcili AI Analizi",
    aiSuggestionBadge: "AI Tövsiyəsi",
    aiUrgentTitle: "Bu problem üçün sürətli müdaxilə tövsiyə olunur",
    aiSuggestionTitle: "AI probleminiz üçün uyğun istiqaməti təyin etdi",
    nextStepLabel: "Növbəti addım",
    nextStepDesc: "AI analizinə uyğun ustaları birbaşa siyahıda göstər.",
    showMatchingProviders: "Uyğun ustaları göstər",
    aiErrorBadge: "AI Yanıtı Alınamadı",
    viewButtonLabel: "Bax",
    requestButtonLabel: "İstəmək",
    allCategoriesTitle: "Bütün Kateqoriyalar",
    stepTwoDesc: "Reytinq, rəylər və tamamlanmış işlər",
    stepThreeDesc: "5 dəqiqədə rezervasiya · Həmişə dəstək",
    ctaTitle: "Sən də ustasan? 🛠️",
    ctaDesc: "Öz xidmətlərini HəllVar-da göstər, müştərilərlə birbaşa əlaqə qur və qazancını artır.",
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
      stepBasic: "Əsas məlumatlar",
      stepRole: "Rol Seçimi",
      stepComplete: "Qeydiyyatın Tamamlanması",
      successTitle: "Təbriklər! Qeydiyyat Tamamlandı",
      successDesc:
        "Hesabınız uğurla yaradıldı. Zəhmət olmasa e-poşt (email) ünvanınıza göndərilən təsdiq linkinə daxil olaraq hesabı təsdiqləyin.",
      successProviderNote:
        "Sənədləriniz administrator tərəfindən yoxlanıldıqdan sonra profiliniz aktivləşdiriləcəkdir.",
      successSignIn: "Daxil ol",
      basicTitle: "Əsas məlumatlarınızı daxil edin",
      basicSubtitle: "HəllVar-da qeydiyyatdan keçmək üçün zəruri məlumatlar.",
      firstNameLabel: "Ad",
      firstNamePlaceholder: "Məsələn, Murad",
      lastNameLabel: "Soyad",
      lastNamePlaceholder: "Məsələn, Fataliyev",
      phoneLabel: "Telefon nömrəsi",
      phonePlaceholder: " (50) 123-45-67",
      emailLabel: "E-poçt (Email)",
      passwordLabel: "Şifrə",
      roleTitle: "Hesabınızın növünü seçin",
      roleSubtitle: "Platformadan necə istifadə edəcəyinizi müəyyənləşdirin.",
      customerDesc: "Etibarlı ustalar axtarmaq və ev/ofis xidmətləri sifariş etmək üçün.",
      providerDesc: "Müştərilərə peşəkar xidmət göstərmək və gəlir əldə etmək üçün.",
      addressTitle: "Ünvan məlumatlarını daxil edin",
      addressSubtitle: "Ustaların sizə daha tez çata bilməsi üçün ərazini seçin.",
      districtLabel: "Bakı rayonları",
      districtPlaceholder: "Rayon seçin...",
      districtSuffix: "rayonu",
      fullAddressLabel: "Tam Ünvan (İstəyə Bağlı)",
      fullAddressPlaceholder: "Məsələn: Mətbuat pr. 24, bina 3, m. 45",
      providerTitle: "Peşəkar fəaliyyət məlumatları",
      providerSubtitle: "Müştərilərin sizi tapa bilməsi üçün xidmət təfərrüatları.",
      categoryLabel: "Xidmət Kateqoriyası",
      categoryPlaceholder: "Kateqoriya seçin...",
      radiusLabel: "İş Radiusunuz (Xidmət məsafəsi)",
      documentsLabel: "Təsdiqləyici Sənədlər (Şəxsiyyət vəsiqəsi / Sertifikatlar)",
      documentsDropText: "Faylları seçin və ya bura dartın",
      documentsFileTypes: "PNG, JPG, PDF (maks. 5MB)",
      selectedDocsLabel: "Seçilən sənədlər",
      removeFileLabel: "Sil",
      submitLoading: "Qeydiyyat tamamlanır...",
      submitComplete: "Qeydiyyatı tamamla",
      providerCategories: {
        "Elektrik": "Elektrik",
        "Santexnik": "Santexnik",
        "Təmizlik xidməti": "Təmizlik xidməti",
        "Dayə": "Dayə",
        "Kombi Ustası": "Kombi Ustası",
        "İT / Texniki yardım": "İT / Texniki yardım",
        "Ev təmiri": "Ev təmiri",
        "Kondisioner Ustası": "Kondisioner Ustası",
        "Mebel Ustası": "Mebel Ustası",
        "Daşınma xidməti": "Daşınma xidməti",
        "Rəngsaz": "Rəngsaz",
        "Alçipan Ustası": "Alçipan Ustası",
        "Kafel-Metlax Ustası": "Kafel-Metlax Ustası",
        "Bərbər": "Bərbər",
        "Digər": "Digər",
      },
      avatarLabel: "Profil şəkli (istəyə bağlı)",
      avatarHint: "PNG, JPG, WEBP və ya GIF (maks. 2MB)",
      avatarPickText: "Şəkil seç və ya bura dart",
      avatarRemove: "Sil",
      avatarPendingNote:
        "Seçdiyiniz şəkil hesabınızı təsdiqlədikdən sonra profil səhifəsində avtomatik tətbiq olunacaq.",
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
  chatPage: {
    title: "Mesajlar",
    subtitle: "Bütün söhbətləriniz burada",
    emptyTitle: "Hələ heç bir söhbətiniz yoxdur",
    emptyDescription: "Usta profil səhifəsindən \"Çatda Yaz\" düyməsini basaraq söhbətə başlaya bilərsiniz.",
    startConversation: "Söhbətə başlayın…",
    youPrefix: "Siz:",
    defaultUser: "İstifadəçi",
    backAriaLabel: "Geri qayıt",
    chatTitle: "Çat",
    liveChat: "Canlı çat",
    emptyState: "Söhbətə başlayın — mesajınız qarşı tərəfə dərhal çatacaq.",
    inputPlaceholder: "Mesaj yazın...",
    sendButton: "Göndər",
    selfChatError: "Özünüzlə çat yarada bilməzsiniz.",
    timeAgo: {
      now: "İndicə",
      minutesAgo: "dəq. əvvəl",
      hoursAgo: "saat əvvəl",
      daysAgo: "gün əvvəl",
    },
  },
  aboutPage: {
    badge: "HəllVar haqqında",
    heroTitle: "Ev işlərini daha sürətli, daha etibarlı və daha rahat etmək üçün yaradıq.",
    heroSubtitle: "HəllVar müştərilərə uyğun ustaları tapmağa, ustalara isə iş tapmağa kömək edən modern bir xidmət platformasıdır. Bizim məqsədimiz hər iki tərəfi də rahat və etibarlı bir prosesə çıxarmaqdır.",
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
    benefitsText: "HəllVar yalnız bir xidmət siyahısı deyil. Bu, müştəri ilə usta arasında etibar, sürət və rahatlıq yaradan bir məkan olaraq düşünülür.",
    missionEyebrow: "Bizim missiyamız",
    missionTitle: "Ev xidmətlərini daha asan, daha təhlükəsiz və daha insanı bir yerdə toplamaq.",
    missionText: "HəllVar yalnız bir xidmət siyahısı deyil. Bu, müştəri ilə usta arasında etibar, sürət və rahatlıq yaradan bir məkan olaraq düşünülür.",
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
      why: { question: "HəllVar nə üçün lazımlıdır?", answer: "HəllVar ev və iş sahəsi üçün etibarlı ustaları tez tapmağa kömək edir. Müştəri problemini yazır, sistem uyğun ustaları göstərir və əlaqə qurma prosesini asanlaşdırır." },
      becomeProvider: { question: "Usta olmaq mümkün müdür?", answer: "Bəli. Qeydiyyatdan keçib profil yaradaraq usta kimi qeydiyyatdan keçə bilərsiniz. Təsdiqləmə sonrası profiliniz görünür və xidmət təklif edə bilirsiniz." },
      verification: { question: "Ustalar necə təsdiqlənir?", answer: "Profil, xidmət sahəsi və məlumatlar yoxlanılır. Təsdiqlənmiş ustalar daha çox etibar qazandığı üçün müştərilər üçün daha əlçatan olur." },
      payments: { question: "Ödəniş və ya rezervasiya necə gedir?", answer: "Hazırda platforma əsasən xidmətə uyğun əlaqə və təşəbbüs prosesi yönləndirilir. Daha sonra rezervasiya və ödəniş addımları daha da genişləndirilə bilər." },
    },
    contactEyebrow: "Sualınız var?",
    contactTitle: "Bizimlə əlaqə saxlamaq üçün rahat bir yol var.",
    contactText: "İstədiyiniz məlumatı yazın, təklif və ya sualınızı bizə göndərin. Təsdiqləndikdən sonra davam edəcəyik.",
    contactEmail: "Suallarınız üçün support@HəllVar.az ünvanına yazın.",
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
    barber: "Bərbər",
    barber_desc: "Saç kəsimi, saqqal baxımı, üz və kişi baxım xidmətləri",
  },
  categoriesPage: {
    heroSubtitle: "HəllVar-da təklif olunan bütün xidmət kateqoriyaları. Sizə uyğun olan sahəni seçin və peşəkar ustaları kəşf edin.",
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
      "HəllVar-da təqdim olunan bütün peşəkar ustaları bir yerdə kəşf edin. Reytinq, məsafə və təcrübəyə uyğun seçim edin.",
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
      title: "Xidmətlərini HəllVar-da göstər",
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
  profile: {
    title: "Profil",
    subtitle: "Şəxsi məlumatlarınızı və profil şəklinizi idarə edin.",
    backHome: "Ana səhifəyə qayıt",
    personalInfoTitle: "Şəxsi məlumatlar",
    personalInfoHint: "Məlumatlarınız digər istifadəçilərə göstərilə bilər.",
    firstNameLabel: "Ad",
    firstNamePlaceholder: "Məsələn, Murad",
    lastNameLabel: "Soyad",
    lastNamePlaceholder: "Məsələn, Fataliyev",
    phoneLabel: "Telefon nömrəsi",
    phonePlaceholder: " (50) 123-45-67",
    emailLabel: "E-poçt (Email)",
    addressLabel: "Ünvan",
    addressPlaceholder: "Məsələn: Mətbuat pr. 24, bina 3, m. 45",
    bioLabel: "Bio / Haqqımda",
    bioPlaceholder: "Xidmətləriniz, təcrübəniz və iş sahəniz haqqında qısa məlumat yazın.",
    priceLabel: "Qiymət aralığı (₼)",
    priceMinLabel: "Minimum qiymət",
    priceMaxLabel: "Maksimum qiymət",
    priceHint: "Xidmətinizin qiymət aralığını göstərin. Müştərilər profilində bu aralığı görəcək.",
    roleLabel: "Rol",
    roleCustomer: "Müştəri",
    roleProvider: "Usta / Mütəxəssis",
    memberSince: "Qeydiyyat tarixi",
    avatarSectionTitle: "Profil şəkli",
    avatarSectionHint: "PNG, JPG, WEBP və ya GIF, maks. 2MB.",
    changePhoto: "Şəkli dəyiş",
    removePhoto: "Şəkli sil",
    uploadLoading: "Şəkil yüklənir...",
    saveChanges: "Dəyişiklikləri yadda saxla",
    saving: "Yadda saxlanılır...",
    savedSuccess: "Məlumatlarınız uğurla yeniləndi.",
    saveError: "Dəyişikliklər yadda saxlanılmadı. Yenidən cəhd edin.",
    loadError: "Profil yüklənərkən xəta baş verdi.",
    notSignedIn: "Bu səhifəyə daxil olmaq üçün hesabınıza giriş edin.",
    signIn: "Daxil ol",
    avatarSaved: "Profil şəkliniz yeniləndi.",
    fileTooLarge: "Şəkil ölçüsü 2MB-dan böyükdür.",
    invalidFileType: "Yalnız PNG, JPG, WEBP və ya GIF formatları dəstəklənir.",
    pendingAvatarApplying: "Gözləyən profil şəkliniz tətbiq olunur...",
    pendingAvatarApplied: "Profil şəkliniz uğurla tətbiq olundu.",
  },
  profileMenu: {
    menuLabel: "Profil menyusu",
    roleCustomer: "Müştəri",
    roleProvider: "Usta / Mütəxəssis",
    emailLabel: "E-poçt",
    phoneLabel: "Telefon",
    addressLabel: "Ünvan",
    notProvided: "Göstərilməyib",
    viewProfile: "Profilimi gör",
  },
  providerDashboard: {
    weeklyEarnings: "Bu həftəlik qazanc",
    completedJobs: "Tamamlanmış işlər",
    averageRating: "Ortalama reytinq",
    waitingOrders: "Gözləyən sifarişlər",
    jobUnit: "{count} iş",
    waitingUnit: "{count} gözləmədə",
    currencyUnit: "AZN",
    ratingUnit: "/ 5.0",
  },
  bookings: {
    badge: "Sifariş / Rezervasiya",
    titleForProvider: "{name} üçün sifariş",
    subtitleTemplate: "{category} · Tarix və saat seçin, usta sifarişi təsdiqləyəcək",
    authRequiredTitle: "Sifariş vermək üçün daxil olun",
    authRequiredDesc: "Sifariş verə bilmək üçün hesabınıza daxil olun.",
    roleRequiredTitle: "Yalnız müştərilər sifariş verə bilər",
    roleRequiredDesc: "Sizin hesab usta/mütəxəssis kimi qeydiyyatdan keçib.",
    successTitle: "Sifariş göndərildi!",
    successDesc: "Usta sifarişi qəbul edən kimi bildiriş alacaqsınız.",
    serviceLabel: "Xidmət",
    servicePlaceholder: "Məsələn: Kran dəyişimi, Saç kəsimi...",
    dateLabel: "Tarix seçin",
    timeLabel: "Saat seçin",
    timePlaceholder: "Saat seçin...",
    durationLabel: "Müddət",
    durationMinutes: "{count} dəqiqə",
    priceLabel: "Qiymət təklifi (₼)",
    addressLabel: "Ünvan",
    addressPlaceholder: "İşin görüləcəyi ünvan",
    noteLabel: "Əlavə qeyd",
    notePlaceholder: "Problemi ətraflı təsvir edin",
    optional: "(isteğe bağlı)",
    cancel: "Ləğv Et",
    submit: "Sifarişi Göndər",
    submitting: "Göndərilir...",
    submitted: "Göndərildi",
    errorService: "Xidmət adını daxil edin (ən azı 2 simvol).",
    errorDateTime: "Tarix və saat seçin.",
    errorPrice: "Qiymət düzgün deyil.",
    errorRole: "Sifariş yalnız müştərilər tərəfindən verilə bilər.",
    errorMissingTable: "Sifariş yadda saxlanmadı — serverdə `bookings` cədvəli mövcud deyil. Migration-ı işə salın.",
    errorSelf: "Özünüzə sifariş verə bilməzsiniz.",
    errorGeneric: "Sifariş göndərilərkən xəta baş verdi. Yenidən cəhd edin.",
    tomorrow: "Sabah",
    days: ["Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə", "Cümə axşamı", "Cümə", "Şənbə"],
    months: ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"],
    providerGeneric: "Usta",
    customerGeneric: "Müştəri",
    tabActiveTemplate: "Aktiv ({count})",
    tabCompleted: "Bitmiş",
    tabCancelled: "Ləğv edilmiş",
    listEmptyTitle: "Sifarişiniz yoxdur",
    listEmptyDesc: "Usta profillərindəki «Sifariş ver» düyməsi ilə ilk sifarişinizi yarada bilərsiniz.",
    minutesShort: "dəq",
    currencySymbol: "₼",
    incomingTitle: "Gələn sifarişlər",
    activeTitle: "Aktiv sifarişlər",
    pastTitle: "Keçmiş sifarişlər",
    emptyTitle: "Sifariş yoxdur",
    emptyDesc: "Müştərilər sifariş verəndə sifarişlər burada görünəcək.",
    incomingEmpty: "Yeni sifariş yoxdur.",
    activeEmpty: "Qəbul edilmiş aktiv sifariş yoxdur.",
    accept: "Qəbul et",
    reject: "Redd et",
    complete: "Tamamla",
    chat: "Çat",
    cancelBooking: "Ləğv et",
    openChat: "Çata keç",
    book: "Sifariş ver",
    status: {
      PENDING: "Gözləyir",
      ACCEPTED: "Qəbul edildi",
      REJECTED: "Redd edildi",
      CANCELLED: "Ləğv edildi",
      COMPLETED: "Tamamlandı",
      EXPIRED: "Vaxtı keçdi",
    },
    pageTitle: "Sifarişlərim",
    pageSubtitle: "Bütün sifarişlərinizi burada izləyə bilərsiniz",
  },
};

const en: Dictionary = {
  brand: {
    name: "HəllVar",
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
    searchButton: "HəllVar",
    popularCategories: "Popular categories",
  },
  homePage: {
    queryTooShort: "Please describe your problem in a bit more detail.",
    adviceError: "Could not get advice.",
    aiUrgentBadge: "Urgent AI Analysis",
    aiSuggestionBadge: "AI Suggestion",
    aiUrgentTitle: "Swift action is recommended for this issue",
    aiSuggestionTitle: "AI identified the right direction for your problem",
    nextStepLabel: "Next step",
    nextStepDesc: "Show providers matching the AI analysis directly in the list.",
    showMatchingProviders: "Show matching providers",
    aiErrorBadge: "AI Response Failed",
    viewButtonLabel: "View",
    requestButtonLabel: "Request",
    allCategoriesTitle: "All Categories",
    stepTwoDesc: "Ratings, reviews and completed jobs",
    stepThreeDesc: "Book in 5 minutes · Always supported",
    ctaTitle: "Are you a pro? 🛠️",
    ctaDesc: "List your services on HəllVar, connect directly with customers and grow your income.",
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
      stepBasic: "Basic information",
      stepRole: "Choose role",
      stepComplete: "Complete sign-up",
      successTitle: "Congratulations! Registration complete",
      successDesc:
        "Your account has been created successfully. Please confirm your account by clicking the verification link sent to your email.",
      successProviderNote:
        "Your profile will be activated after your documents have been reviewed by an administrator.",
      successSignIn: "Sign in",
      basicTitle: "Enter your basic information",
      basicSubtitle: "Required information to register on HəllVar.",
      firstNameLabel: "First name",
      firstNamePlaceholder: "e.g. Murad",
      lastNameLabel: "Last name",
      lastNamePlaceholder: "e.g. Fataliyev",
      phoneLabel: "Phone number",
      phonePlaceholder: " (50) 123-45-67",
      emailLabel: "Email",
      passwordLabel: "Password",
      roleTitle: "Choose your account type",
      roleSubtitle: "Define how you want to use the platform.",
      customerDesc: "To find trusted specialists and order home/office services.",
      providerDesc: "To provide professional services to customers and earn income.",
      addressTitle: "Enter your address details",
      addressSubtitle: "Select your area so specialists can reach you faster.",
      districtLabel: "Baku districts",
      districtPlaceholder: "Select district...",
      districtSuffix: "district",
      fullAddressLabel: "Full Address (Optional)",
      fullAddressPlaceholder: "e.g. Matbuat Ave. 24, bldg 3, apt 45",
      providerTitle: "Professional details",
      providerSubtitle: "Service details so customers can find you.",
      categoryLabel: "Service category",
      categoryPlaceholder: "Select category...",
      radiusLabel: "Working radius (service distance)",
      documentsLabel: "Supporting documents (ID / Certificates)",
      documentsDropText: "Select files or drag and drop here",
      documentsFileTypes: "PNG, JPG, PDF (max 5MB)",
      selectedDocsLabel: "Selected documents",
      removeFileLabel: "Remove",
      submitLoading: "Completing registration...",
      submitComplete: "Complete registration",
      providerCategories: {
        "Elektrik": "Electrician",
        "Santexnik": "Plumber",
        "Təmizlik xidməti": "Cleaning service",
        "Dayə": "Nanny",
        "Kombi Ustası": "Boiler technician",
        "İT / Texniki yardım": "IT / Technical support",
        "Ev təmiri": "Home repair",
        "Kondisioner Ustası": "AC technician",
        "Mebel Ustası": "Furniture craftsman",
        "Daşınma xidməti": "Moving service",
        "Rəngsaz": "Painter",
        "Alçipan Ustası": "Drywall installer",
        "Kafel-Metlax Ustası": "Tile installer",
        "Bərbər": "Barber",
        "Digər": "Other",
      },
      avatarLabel: "Profile photo (optional)",
      avatarHint: "PNG, JPG, WEBP or GIF (max 2MB)",
      avatarPickText: "Select a photo or drag & drop here",
      avatarRemove: "Remove",
      avatarPendingNote:
        "Your selected photo will be applied automatically on the profile page after your account is confirmed.",
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
  chatPage: {
    title: "Messages",
    subtitle: "All of your conversations are here",
    emptyTitle: "You do not have any conversations yet",
    emptyDescription: "You can start a chat from a technician profile by pressing the \"Message\" button.",
    startConversation: "Start a conversation…",
    youPrefix: "You:",
    defaultUser: "User",
    backAriaLabel: "Go back",
    chatTitle: "Chat",
    liveChat: "Live chat",
    emptyState: "Start the conversation — your message will reach the other person instantly.",
    inputPlaceholder: "Write a message...",
    sendButton: "Send",
    selfChatError: "You cannot start a chat with yourself.",
    timeAgo: {
      now: "Just now",
      minutesAgo: "min ago",
      hoursAgo: "hr ago",
      daysAgo: "d ago",
    },
  },
  aboutPage: {
    badge: "About HəllVar",
    heroTitle: "We built this platform to make home services faster, more reliable, and easier to access.",
    heroSubtitle: "HəllVar helps customers find trusted professionals and helps providers discover new opportunities. Our goal is to make both sides of the experience smoother and more dependable.",
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
    benefitsText: "HəllVar is more than a directory. It is a space designed to build trust, speed, and comfort between customers and providers.",
    missionEyebrow: "Our mission",
    missionTitle: "Making home services simpler, safer, and more human-centered.",
    missionText: "HəllVar is more than a directory. It is a space designed to build trust, speed, and comfort between customers and providers.",
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
      why: { question: "Why is HəllVar useful?", answer: "HəllVar helps people quickly find trusted professionals for home and business needs. Customers describe the problem, the system suggests suitable providers, and the connection process becomes simpler." },
      becomeProvider: { question: "Can I become a provider?", answer: "Yes. After signing up and creating a profile, you can join as a provider. Once verified, your profile becomes visible and you can offer services." },
      verification: { question: "How are providers verified?", answer: "Profiles, service areas, and information are reviewed. Verified providers are easier for customers to trust and contact." },
      payments: { question: "How do payments or bookings work?", answer: "At the moment the platform focuses on connection and onboarding. Future updates will expand booking and payment flows." },
    },
    contactEyebrow: "Have a question?",
    contactTitle: "There is a simple way to get in touch with us.",
    contactText: "Write us with any information, offer, or question you have. We will continue from there after confirmation.",
    contactEmail: "Send your questions to support@HəllVar.az.",
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
    barber: "Barber",
    barber_desc: "Haircuts, beard grooming and men's care services",
  },
  categoriesPage: {
    heroSubtitle: "All service categories offered on HəllVar. Pick the area that fits you and discover expert pros.",
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
      "Discover all professional technicians available on HəllVar in one place. Choose based on rating, distance and experience.",
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
      title: "Show your services on HəllVar",
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
  profile: {
    title: "Profile",
    subtitle: "Manage your personal information and profile photo.",
    backHome: "Back to home",
    personalInfoTitle: "Personal information",
    personalInfoHint: "Your details may be visible to other users.",
    firstNameLabel: "First name",
    firstNamePlaceholder: "e.g. Murad",
    lastNameLabel: "Last name",
    lastNamePlaceholder: "e.g. Fataliyev",
    phoneLabel: "Phone number",
    phonePlaceholder: " (50) 123-45-67",
    emailLabel: "Email",
    addressLabel: "Address",
    addressPlaceholder: "e.g. Matbuat Ave. 24, bldg 3, apt 45",
    bioLabel: "Bio / About me",
    bioPlaceholder: "Write a short description about your services and experience.",
    priceLabel: "Price range (₼)",
    priceMinLabel: "Minimum price",
    priceMaxLabel: "Maximum price",
    priceHint: "Set the price range for your service. Customers will see it on your profile.",
    roleLabel: "Role",
    roleCustomer: "Customer",
    roleProvider: "Professional / Specialist",
    memberSince: "Member since",
    avatarSectionTitle: "Profile photo",
    avatarSectionHint: "PNG, JPG, WEBP or GIF, max 2MB.",
    changePhoto: "Change photo",
    removePhoto: "Remove photo",
    uploadLoading: "Uploading photo...",
    saveChanges: "Save changes",
    saving: "Saving...",
    savedSuccess: "Your details were updated successfully.",
    saveError: "Could not save changes. Please try again.",
    loadError: "An error occurred while loading your profile.",
    notSignedIn: "Please sign in to access this page.",
    signIn: "Sign in",
    avatarSaved: "Your profile photo was updated.",
    fileTooLarge: "The photo is larger than 2MB.",
    invalidFileType: "Only PNG, JPG, WEBP or GIF formats are supported.",
    pendingAvatarApplying: "Applying your pending profile photo...",
    pendingAvatarApplied: "Your profile photo was applied successfully.",
  },
  profileMenu: {
    menuLabel: "Profile menu",
    roleCustomer: "Customer",
    roleProvider: "Professional / Specialist",
    emailLabel: "Email",
    phoneLabel: "Phone",
    addressLabel: "Address",
    notProvided: "Not provided",
    viewProfile: "View my profile",
  },
  providerDashboard: {
    weeklyEarnings: "Weekly earnings",
    completedJobs: "Completed jobs",
    averageRating: "Average rating",
    waitingOrders: "Pending orders",
    jobUnit: "{count} jobs",
    waitingUnit: "{count} waiting",
    currencyUnit: "AZN",
    ratingUnit: "/ 5.0",
  },
  bookings: {
    badge: "Booking / Reservation",
    titleForProvider: "Booking for {name}",
    subtitleTemplate: "{category} · Choose a date and time, the provider will confirm the booking",
    authRequiredTitle: "Sign in to book",
    authRequiredDesc: "Please sign in to your account to place a booking.",
    roleRequiredTitle: "Only customers can place bookings",
    roleRequiredDesc: "Your account is registered as a provider/specialist.",
    successTitle: "Booking sent!",
    successDesc: "You will be notified as soon as the provider accepts your booking.",
    serviceLabel: "Service",
    servicePlaceholder: "e.g. Faucet replacement, Haircut...",
    dateLabel: "Select date",
    timeLabel: "Select time",
    timePlaceholder: "Select time...",
    durationLabel: "Duration",
    durationMinutes: "{count} minutes",
    priceLabel: "Price offer (₼)",
    addressLabel: "Address",
    addressPlaceholder: "Address where the work will be done",
    noteLabel: "Additional note",
    notePlaceholder: "Describe the problem in detail",
    optional: "(optional)",
    cancel: "Cancel",
    submit: "Send Booking",
    submitting: "Sending...",
    submitted: "Sent",
    errorService: "Enter a service name (at least 2 characters).",
    errorDateTime: "Choose a date and time.",
    errorPrice: "The price is not valid.",
    errorRole: "Bookings can only be placed by customers.",
    errorMissingTable: "Booking was not saved — the `bookings` table does not exist on the server. Run the migration.",
    errorSelf: "You cannot book yourself.",
    errorGeneric: "Something went wrong while sending the booking. Please try again.",
    tomorrow: "Tomorrow",
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    providerGeneric: "Professional",
    customerGeneric: "Customer",
    tabActiveTemplate: "Active ({count})",
    tabCompleted: "Completed",
    tabCancelled: "Cancelled",
    listEmptyTitle: "You have no bookings",
    listEmptyDesc: "Create your first booking with the «Book» button on provider profiles.",
    minutesShort: "min",
    currencySymbol: "₼",
    incomingTitle: "Incoming bookings",
    activeTitle: "Active bookings",
    pastTitle: "Past bookings",
    emptyTitle: "No bookings",
    emptyDesc: "Bookings will appear here when customers place them.",
    incomingEmpty: "No new bookings.",
    activeEmpty: "No accepted active bookings.",
    accept: "Accept",
    reject: "Reject",
    complete: "Complete",
    chat: "Chat",
    cancelBooking: "Cancel",
    openChat: "Open chat",
    book: "Book now",
    status: {
      PENDING: "Pending",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled",
      COMPLETED: "Completed",
      EXPIRED: "Expired",
    },
    pageTitle: "My bookings",
    pageSubtitle: "Track all your bookings here",
  },
};

const tr: Dictionary = {
  brand: {
    name: "HəllVar",
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
    searchButton: "HəllVar",
    popularCategories: "Popüler kategoriler",
  },
  homePage: {
    queryTooShort: "Lütfen sorununuzu biraz daha ayrıntılı açıklayın.",
    adviceError: "Öneri alınamadı.",
    aiUrgentBadge: "Acil AI Analizi",
    aiSuggestionBadge: "AI Önerisi",
    aiUrgentTitle: "Bu sorun için hızlı müdahale önerilir",
    aiSuggestionTitle: "AI sorununuz için doğru yönü belirledi",
    nextStepLabel: "Sonraki adım",
    nextStepDesc: "AI analizine uygun ustaları doğrudan listede göster.",
    showMatchingProviders: "Uygun ustaları göster",
    aiErrorBadge: "AI Yanıtı Alınamadı",
    viewButtonLabel: "Görüntüle",
    requestButtonLabel: "Talep et",
    allCategoriesTitle: "Tüm Kategoriler",
    stepTwoDesc: "Puanlar, yorumlar ve tamamlanan işler",
    stepThreeDesc: "5 dakikada rezervasyon · Her zaman destek",
    ctaTitle: "Sen de usta mısın? 🛠️",
    ctaDesc: "Hizmetlerini HəllVar'da göster, müşterilerle doğrudan iletişime geç ve kazancını artır.",
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
      stepBasic: "Temel bilgiler",
      stepRole: "Rol seçimi",
      stepComplete: "Kaydın tamamlanması",
      successTitle: "Tebrikler! Kayıt tamamlandı",
      successDesc:
        "Hesabınız başarıyla oluşturuldu. Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabı doğrulayın.",
      successProviderNote:
        "Belgeleriniz yönetici tarafından incelendikten sonra profiliniz etkinleştirilecektir.",
      successSignIn: "Giriş yap",
      basicTitle: "Temel bilgilerinizi girin",
      basicSubtitle: "HəllVar'da kayıt olmak için gerekli bilgiler.",
      firstNameLabel: "Ad",
      firstNamePlaceholder: "örn. Murad",
      lastNameLabel: "Soyad",
      lastNamePlaceholder: "örn. Fataliyev",
      phoneLabel: "Telefon numarası",
      phonePlaceholder: " (50) 123-45-67",
      emailLabel: "E-posta",
      passwordLabel: "Şifre",
      roleTitle: "Hesap türünüzü seçin",
      roleSubtitle: "Platformayı nasıl kullanacağınızı belirleyin.",
      customerDesc: "Güvenilir ustalar bulmak ve ev/ofis hizmetleri sipariş etmek için.",
      providerDesc: "Müşterilere profesyonel hizmet sunmak ve gelir elde etmek için.",
      addressTitle: "Adres bilgilerinizi girin",
      addressSubtitle: "Ustaların size daha hızlı ulaşabilmesi için bölgenizi seçin.",
      districtLabel: "Bakü ilçeleri",
      districtPlaceholder: "İlçe seçin...",
      districtSuffix: "ilçesi",
      fullAddressLabel: "Tam Adres (Opsiyonel)",
      fullAddressPlaceholder: "örn. Mətbuat cad. 24, bina 3, daire 45",
      providerTitle: "Profesyonel faaliyet bilgileri",
      providerSubtitle: "Müşterilerin sizi bulabilmesi için hizmet ayrıntıları.",
      categoryLabel: "Hizmet kategorisi",
      categoryPlaceholder: "Kategori seçin...",
      radiusLabel: "Çalışma yarıçapınız (hizmet mesafesi)",
      documentsLabel: "Destekleyici belgeler (Kimlik / Sertifikalar)",
      documentsDropText: "Dosyaları seçin veya buraya sürükleyin",
      documentsFileTypes: "PNG, JPG, PDF (maks. 5MB)",
      selectedDocsLabel: "Seçilen belgeler",
      removeFileLabel: "Sil",
      submitLoading: "Kayıt tamamlanıyor...",
      submitComplete: "Kaydı tamamla",
      providerCategories: {
        "Elektrik": "Elektrikçi",
        "Santexnik": "Tesisatçı",
        "Təmizlik xidməti": "Temizlik hizmeti",
        "Dayə": "Bakıcı",
        "Kombi Ustası": "Kombi ustası",
        "İT / Texniki yardım": "BT / Teknik destek",
        "Ev təmiri": "Ev tamiri",
        "Kondisioner Ustası": "Klima ustası",
        "Mebel Ustası": "Mobilya ustası",
        "Daşınma xidməti": "Taşıma hizmeti",
        "Rəngsaz": "Boyacı",
        "Alçipan Ustası": "Alçıpan ustası",
        "Kafel-Metlax Ustası": "Fayans ustası",
        "Bərbər": "Berber",
        "Digər": "Diğer",
      },
      avatarLabel: "Profil fotoğrafı (isteğe bağlı)",
      avatarHint: "PNG, JPG, WEBP veya GIF (maks. 2MB)",
      avatarPickText: "Fotoğraf seçin veya buraya sürükleyin",
      avatarRemove: "Sil",
      avatarPendingNote:
        "Seçtiğiniz fotoğraf, hesabınız doğrulandıktan sonra profil sayfasında otomatik olarak uygulanacaktır.",
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
  chatPage: {
    title: "Mesajlar",
    subtitle: "Tüm sohbetleriniz burada",
    emptyTitle: "Henüz herhangi bir sohbetiniz yok",
    emptyDescription: "Usta profilinden \"Mesaj Gönder\" düğmesine basarak sohbet başlatabilirsiniz.",
    startConversation: "Sohbete başlayın…",
    youPrefix: "Siz:",
    defaultUser: "Kullanıcı",
    backAriaLabel: "Geri dön",
    chatTitle: "Sohbet",
    liveChat: "Canlı sohbet",
    emptyState: "Sohbete başlayın — mesajınız karşı tarafa anında ulaşacaktır.",
    inputPlaceholder: "Mesaj yazın...",
    sendButton: "Gönder",
    selfChatError: "Kendinizle sohbet başlatamazsınız.",
    timeAgo: {
      now: "Az önce",
      minutesAgo: "dk önce",
      hoursAgo: "sa önce",
      daysAgo: "g önce",
    },
  },
  aboutPage: {
    badge: "HəllVar Hakkında",
    heroTitle: "Ev işlerini daha hızlı, daha güvenilir ve daha erişilebilir hale getirmek için bu platformu kurduk.",
    heroSubtitle: "HəllVar, müşterilerin güvenilir uzmanlara ulaşmasına ve ustaların yeni fırsatları keşfetmesine yardımcı olur. Amacımız her iki tarafın deneyimini de daha akıcı ve güvenilir hale getirmektir.",
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
    benefitsText: "HəllVar sadece bir rehber değil; müşteriler ile ustalar arasında güven, hız ve rahatlık kurmayı amaçlayan bir alan.",
    missionEyebrow: "Misyonumuz",
    missionTitle: "Ev hizmetlerini daha basit, daha güvenli ve daha insana yakın hale getiriyoruz.",
    missionText: "HəllVar sadece bir rehber değil; müşteriler ile ustalar arasında güven, hız ve rahatlık kurmayı amaçlayan bir alan.",
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
      why: { question: "HəllVar neden işe yarar?", answer: "HəllVar, ev ve iş yerleri için güvenilir uzmanları hızlıca bulmaya yardımcı olur. Müşteriler sorunu açıklar, sistem uygun ustaları önerir ve bağlanma süreci daha basit hale gelir." },
      becomeProvider: { question: "Usta olabilir miyim?", answer: "Evet. Kayıt olup profil oluşturarak usta olarak katılabilirsiniz. Onaylandıktan sonra profiliniz görünür hale gelir ve hizmet sunabilirsiniz." },
      verification: { question: "Ustalar nasıl doğrulanır?", answer: "Profil, hizmet alanı ve bilgiler kontrol edilir. Doğrulanmış ustalar müşteriler için daha güvenilir ve ulaşılabilir olur." },
      payments: { question: "Ödeme veya rezervasyon nasıl işler?", answer: "Şu anda platform temel olarak bağlantı ve giriş sürecine odaklanır. Gelecekte rezervasyon ve ödeme akışları genişletilecektir." },
    },
    contactEyebrow: "Sorunuz mu var?",
    contactTitle: "Bizimle iletişime geçmenin kolay bir yolu var.",
    contactText: "İster bilgi, ister teklif ya da soru paylaşın. Onaylandıktan sonra devam edeceğiz.",
    contactEmail: "Sorularınızı support@HəllVar.az adresine gönderin.",
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
    barber: "Berber",
    barber_desc: "Saç kesimi, sakal bakımı ve erkek bakım hizmetleri",
  },
  categoriesPage: {
    heroSubtitle: "HəllVar'ta sunulan tüm hizmet kategorileri. Size uygun alanı seçin ve profesyonel ustaları keşfedin.",
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
      "HəllVar'ta sunulan tüm profesyonel ustaları tek bir yerde keşfedin. Puan, mesafe ve deneyime göre seçin.",
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
      title: "Hizmetlerini HəllVar'ta göster",
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
  profile: {
    title: "Profil",
    subtitle: "Kişisel bilgilerinizi ve profil fotoğrafınızı yönetin.",
    backHome: "Anasayfaya dön",
    personalInfoTitle: "Kişisel bilgiler",
    personalInfoHint: "Bilgileriniz diğer kullanıcılara görünebilir.",
    firstNameLabel: "Ad",
    firstNamePlaceholder: "örn. Murad",
    lastNameLabel: "Soyad",
    lastNamePlaceholder: "örn. Fataliyev",
    phoneLabel: "Telefon numarası",
    phonePlaceholder: " (50) 123-45-67",
    emailLabel: "E-posta",
    addressLabel: "Adres",
    addressPlaceholder: "örn. Mətbuat cad. 24, bina 3, daire 45",
    bioLabel: "Bio / Hakkımda",
    bioPlaceholder: "Hizmetleriniz, deneyiminiz ve çalışma alanınız hakkında kısa bilgi yazın.",
    priceLabel: "Fiyat aralığı (₼)",
    priceMinLabel: "Minimum fiyat",
    priceMaxLabel: "Maksimum fiyat",
    priceHint: "Hizmetinizin fiyat aralığını belirtin. Müşteriler profilinizde bu aralığı görecek.",
    roleLabel: "Rol",
    roleCustomer: "Müşteri",
    roleProvider: "Usta / Uzman",
    memberSince: "Üyelik tarihi",
    avatarSectionTitle: "Profil fotoğrafı",
    avatarSectionHint: "PNG, JPG, WEBP veya GIF, maks. 2MB.",
    changePhoto: "Fotoğrafı değiştir",
    removePhoto: "Fotoğrafı kaldır",
    uploadLoading: "Fotoğraf yükleniyor...",
    saveChanges: "Değişiklikleri kaydet",
    saving: "Kaydediliyor...",
    savedSuccess: "Bilgileriniz başarıyla güncellendi.",
    saveError: "Değişiklikler kaydedilemedi. Lütfen tekrar deneyin.",
    loadError: "Profil yüklenirken bir hata oluştu.",
    notSignedIn: "Bu sayfaya erişmek için giriş yapın.",
    signIn: "Giriş yap",
    avatarSaved: "Profil fotoğrafınız güncellendi.",
    fileTooLarge: "Fotoğraf 2MB'tan büyük.",
    invalidFileType: "Yalnızca PNG, JPG, WEBP veya GIF formatları desteklenir.",
    pendingAvatarApplying: "Bekleyen profil fotoğrafınız uygulanıyor...",
    pendingAvatarApplied: "Profil fotoğrafınız başarıyla uygulandı.",
  },
  profileMenu: {
    menuLabel: "Profil menüsü",
    roleCustomer: "Müşteri",
    roleProvider: "Usta / Uzman",
    emailLabel: "E-posta",
    phoneLabel: "Telefon",
    addressLabel: "Adres",
    notProvided: "Belirtilmedi",
    viewProfile: "Profilimi gör",
  },
  providerDashboard: {
    weeklyEarnings: "Haftalık kazanç",
    completedJobs: "Tamamlanan işler",
    averageRating: "Ortalama puan",
    waitingOrders: "Bekleyen siparişler",
    jobUnit: "{count} iş",
    waitingUnit: "{count} bekliyor",
    currencyUnit: "AZN",
    ratingUnit: "/ 5.0",
  },
  bookings: {
    badge: "Rezervasyon / Sipariş",
    titleForProvider: "{name} için sipariş",
    subtitleTemplate: "{category} · Tarih ve saat seçin, usta siparişi onaylayacak",
    authRequiredTitle: "Sipariş vermek için giriş yapın",
    authRequiredDesc: "Sipariş verebilmek için hesabınıza giriş yapın.",
    roleRequiredTitle: "Yalnızca müşteriler sipariş verebilir",
    roleRequiredDesc: "Hesabınız usta/uzman olarak kayıtlı.",
    successTitle: "Sipariş gönderildi!",
    successDesc: "Usta siparişi onayladığında bildirim alacaksınız.",
    serviceLabel: "Hizmet",
    servicePlaceholder: "Örn: Musluk değişimi, Saç kesimi...",
    dateLabel: "Tarih seçin",
    timeLabel: "Saat seçin",
    timePlaceholder: "Saat seçin...",
    durationLabel: "Süre",
    durationMinutes: "{count} dakika",
    priceLabel: "Fiyat teklifi (₼)",
    addressLabel: "Adres",
    addressPlaceholder: "İşin yapılacağı adres",
    noteLabel: "Ek not",
    notePlaceholder: "Sorunu ayrıntılı olarak açıklayın",
    optional: "(opsiyonel)",
    cancel: "İptal Et",
    submit: "Siparişi Gönder",
    submitting: "Gönderiliyor...",
    submitted: "Gönderildi",
    errorService: "Hizmet adını girin (en az 2 karakter).",
    errorDateTime: "Tarih ve saat seçin.",
    errorPrice: "Fiyat geçersiz.",
    errorRole: "Sipariş yalnızca müşteriler tarafından verilebilir.",
    errorMissingTable: "Sipariş kaydedilemedi — sunucuda `bookings` tablosu bulunmuyor. Migration'ı çalıştırın.",
    errorSelf: "Kendinize sipariş veremezsiniz.",
    errorGeneric: "Sipariş gönderilirken bir hata oluştu. Lütfen tekrar deneyin.",
    tomorrow: "Yarın",
    days: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
    months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
    providerGeneric: "Usta",
    customerGeneric: "Müşteri",
    tabActiveTemplate: "Aktif ({count})",
    tabCompleted: "Tamamlanan",
    tabCancelled: "İptal edilen",
    listEmptyTitle: "Siparişiniz yok",
    listEmptyDesc: "Usta profillerindeki «Sipariş ver» butonuyla ilk siparişinizi oluşturabilirsiniz.",
    minutesShort: "dk",
    currencySymbol: "₼",
    incomingTitle: "Gelen siparişler",
    activeTitle: "Aktif siparişler",
    pastTitle: "Geçmiş siparişler",
    emptyTitle: "Sipariş yok",
    emptyDesc: "Müşteriler sipariş verdiğinde siparişler burada görünecek.",
    incomingEmpty: "Yeni sipariş yok.",
    activeEmpty: "Onaylanmış aktif sipariş yok.",
    accept: "Kabul et",
    reject: "Reddet",
    complete: "Tamamla",
    chat: "Sohbet",
    cancelBooking: "İptal et",
    openChat: "Sohbete git",
    book: "Sipariş ver",
    status: {
      PENDING: "Bekliyor",
      ACCEPTED: "Kabul edildi",
      REJECTED: "Reddedildi",
      CANCELLED: "İptal edildi",
      COMPLETED: "Tamamlandı",
      EXPIRED: "Süresi doldu",
    },
    pageTitle: "Rezervasyonlarım",
    pageSubtitle: "Tüm siparişlerinizi burada takip edebilirsiniz",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { az, en, tr };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries[defaultLocale];
}
