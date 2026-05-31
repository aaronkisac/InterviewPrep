/**
 * Central translation dictionary.
 * All UI strings live here — pages import and index by lang.
 */
import type { Language } from "@/lib/supabase/types";

// ─── Shared / Global ─────────────────────────────────────────────────────────

export const i18nNav = {
  en: {
    questions: "Questions",
    mock: "Mock",
    glossary: "Glossary",
    admin: "Admin",
    dashboard: "Dashboard",
    signOut: "Sign out",
    signIn: "Sign in",
  },
  tr: {
    questions: "Sorular",
    mock: "Mock",
    glossary: "Sözlük",
    admin: "Admin",
    dashboard: "Dashboard",
    signOut: "Çıkış yap",
    signIn: "Giriş yap",
  },
} as const;

// ─── Homepage ────────────────────────────────────────────────────────────────

export const i18nHome = {
  en: {
    tagline: "Frontend Interview Prep",
    headline: "React · TypeScript · Next.js",
    heroDesc: (count: number, topicCount: number) =>
      `${count > 0 ? `${count}+` : "Hundreds of"} questions across ${topicCount} topics. Structured Q&A, a term glossary, and timed mock interview sessions.`,
    browseQuestions: "Browse questions",
    startMock: "Start mock interview",
    glossary: "Glossary",
    welcomeBack: "Welcome back",
    welcomeSub: "Track your sessions, bookmarks, and topic progress on your dashboard.",
    viewDashboard: "View dashboard →",
    whatsInside: "What's inside",
    features: [
      {
        title: "Q&A bank",
        description:
          "Questions across 15 topics with general and personal answers. Filter by topic and seniority level.",
        href: "/questions",
        cta: "Browse questions",
      },
      {
        title: "Mock interviews",
        description:
          "Pick a topic, answer multiple-choice questions under simulated interview conditions, and review your score.",
        href: "/mock",
        cta: "Start a session",
      },
      {
        title: "Glossary",
        description:
          "129 frontend terms with concise definitions — auto-linked inline as you read through answers.",
        href: "/glossary",
        cta: "Explore terms",
      },
    ] as const,
    topics: "Topics",
    questions: (n: number) => (n > 0 ? `${n} questions` : "Coming soon"),
    trackProgress: "Track your progress",
    trackProgressSub:
      "Sign in to save mock session results, bookmark questions, and monitor your improvement over time.",
    signInCta: "Sign in to get started",
    footer: "Interview Prep — built for Senior Frontend Engineers",
  },
  tr: {
    tagline: "Frontend Mülakat Hazırlık",
    headline: "React · TypeScript · Next.js",
    heroDesc: (count: number, topicCount: number) =>
      `${topicCount} topic'te ${count > 0 ? `${count}+` : "yüzlerce"} soru. Yapılandırılmış S&C, terim sözlüğü ve zamanlı mock mülakat oturumları.`,
    browseQuestions: "Sorulara göz at",
    startMock: "Mock mülakat başlat",
    glossary: "Sözlük",
    welcomeBack: "Tekrar hoş geldin",
    welcomeSub: "Oturumlarını, yer imlerini ve konu ilerlemeni dashboard'dan takip et.",
    viewDashboard: "Dashboard'a git →",
    whatsInside: "İçerikler",
    features: [
      {
        title: "Soru bankası",
        description:
          "15 topic'te genel ve kişisel cevaplarla sorular. Topic ve seviyeye göre filtrele.",
        href: "/questions",
        cta: "Sorulara göz at",
      },
      {
        title: "Mock mülakatlar",
        description:
          "Bir topic seç, simüle edilmiş mülakat koşullarında çoktan seçmeli soruları cevapla ve skorunu incele.",
        href: "/mock",
        cta: "Oturum başlat",
      },
      {
        title: "Sözlük",
        description:
          "129 frontend terimi — cevapları okurken otomatik olarak satır içinde bağlantılı.",
        href: "/glossary",
        cta: "Terimleri keşfet",
      },
    ] as const,
    topics: "Konular",
    questions: (n: number) => (n > 0 ? `${n} soru` : "Yakında"),
    trackProgress: "İlerlemeyi takip et",
    trackProgressSub:
      "Mock oturum sonuçlarını kaydetmek, soruları yer imlerine eklemek ve gelişimini izlemek için giriş yap.",
    signInCta: "Başlamak için giriş yap",
    footer: "Interview Prep — Senior Frontend Engineer'lar için",
  },
} as const;

// ─── Sign in ─────────────────────────────────────────────────────────────────

export const i18nSignIn = {
  en: {
    title: "Sign in",
    sub: "Use Google or GitHub. No password.",
    google: "Continue with Google",
    github: "Continue with GitHub",
  },
  tr: {
    title: "Giriş yap",
    sub: "Google veya GitHub ile. Şifre yok.",
    google: "Google ile devam et",
    github: "GitHub ile devam et",
  },
} as const;

// ─── Questions page ───────────────────────────────────────────────────────────

export const i18nQuestions = {
  en: {
    bank: "Question bank",
    title: "All questions",
    countSuffix: (n: number, active: boolean) =>
      `${n} ${n === 1 ? "question" : "questions"}${active ? " match" : " total"}`,
    clear: "Clear filters",
    empty: "No questions match these filters yet.",
    emptyCustom: "No questions in this topic yet. Add some from your dashboard.",
    loginForBookmarks: "Sign in to save bookmarks.",
    guestBanner: (total: number) =>
      `You're viewing ${total} junior & entry-level questions. Sign in to unlock all levels, mock interviews, and the glossary.`,
    signIn: "Sign in",
    privateTopic: "Private topic",
    submitQuestion: "+ Submit question",
  },
  tr: {
    bank: "Soru bankası",
    title: "Tüm sorular",
    countSuffix: (n: number, active: boolean) =>
      `${n} soru${active ? " eşleşiyor" : " toplam"}`,
    clear: "Filtreleri temizle",
    empty: "Bu filtrelere uyan soru yok.",
    emptyCustom: "Bu topic'te henüz soru yok. Dashboard'dan ekleyebilirsin.",
    loginForBookmarks: "Yer imlerini görmek için giriş yap.",
    guestBanner: (total: number) =>
      `${total} junior ve başlangıç seviyesi soru görüntülüyorsunuz. Tüm seviyeleri, mock mülakatları ve sözlüğü açmak için giriş yapın.`,
    signIn: "Giriş yap",
    privateTopic: "Özel topic",
    submitQuestion: "+ Soru gönder",
  },
} as const;

// ─── Question detail page ─────────────────────────────────────────────────────

export const i18nQuestionDetail = {
  en: {
    back: "← All questions",
    summary: "Summary",
    deepDive: "Deep dive",
    noDetail: "Deep-dive content coming soon.",
    noAnswer: "No answer authored yet.",
    personalExample: "Personal example",
  },
  tr: {
    back: "← Tüm sorular",
    summary: "Özet",
    deepDive: "Detaylı anlatım",
    noDetail: "Detaylı anlatım yakında eklenecek.",
    noAnswer: "Henüz cevap yazılmadı.",
    personalExample: "Kişisel örnek",
  },
} as const;

// ─── Question card ────────────────────────────────────────────────────────────

export const i18nQuestionCard = {
  en: {
    personalExample: "Personal example",
    detailPage: "Detail page →",
    signInForDetails: "Sign in for full details →",
  },
  tr: {
    personalExample: "Kişisel örnek",
    detailPage: "Detaylı sayfa →",
    signInForDetails: "Detaylar için giriş yap →",
  },
} as const;

// ─── Glossary ─────────────────────────────────────────────────────────────────

export const i18nGlossary = {
  en: {
    title: "Glossary",
    sub: "Frontend terms auto-linked in answers as you read.",
    searchPlaceholder: "Search terms…",
    allTopics: "All",
    noResults: "No terms match your search.",
    termCount: (n: number) => `${n} term${n === 1 ? "" : "s"}`,
    definition: "Definition",
    relatedQuestions: "Related questions",
    notFound: "Term not found.",
    backToGlossary: "← Back to glossary",
    tooltipDemo: "Hover any highlighted term to see a tooltip definition.",
  },
  tr: {
    title: "Sözlük",
    sub: "Frontend terimleri okurken cevaplarda otomatik olarak bağlantılanır.",
    searchPlaceholder: "Terim ara…",
    allTopics: "Hepsi",
    noResults: "Aramanıza uygun terim bulunamadı.",
    termCount: (n: number) => `${n} terim`,
    definition: "Tanım",
    relatedQuestions: "İlgili sorular",
    notFound: "Terim bulunamadı.",
    backToGlossary: "← Sözlüğe dön",
    tooltipDemo: "Tooltip tanımını görmek için üstüne gel.",
  },
} as const;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const i18nDashboard = {
  en: {
    title: "Dashboard",
    sessionHistory: "Session history",
    noSessions: "No mock sessions yet. Start one from the Mock page.",
    startMock: "Start a session →",
    score: "Score",
    topics: "Topics",
    topicProgress: "Topic progress",
    noProgress: "No questions answered yet.",
    bookmarks: "Bookmarks",
    bookmarkCount: (n: number) => `${n} bookmarked question${n === 1 ? "" : "s"}`,
    viewBookmarks: "View bookmarks →",
    mySubmissions: "My submissions",
    noSubmissions: "No questions submitted yet.",
    submitQuestion: "Submit a question →",
    myTopics: "My topics",
    admin: "Admin",
    adminQueue: "Review queue →",
    private: "Private",
    pendingReview: "Pending review",
    published: "Published",
    rejected: "Rejected",
    perfect: "Perfect",
    strong: "Strong",
    decent: "Decent",
    needsWork: "Needs work",
    mastered: (n: number) => `${n} mastered`,
    questionsCount: (n: number) => `${n} question${n === 1 ? "" : "s"}`,
  },
  tr: {
    title: "Dashboard",
    sessionHistory: "Oturum geçmişi",
    noSessions: "Henüz mock oturumu yok. Mock sayfasından bir tane başlat.",
    startMock: "Oturum başlat →",
    score: "Skor",
    topics: "Konular",
    topicProgress: "Konu ilerlemesi",
    noProgress: "Henüz hiç soru cevaplanmadı.",
    bookmarks: "Yer imleri",
    bookmarkCount: (n: number) => `${n} yer imli soru`,
    viewBookmarks: "Yer imlerine git →",
    mySubmissions: "Gönderilerim",
    noSubmissions: "Henüz soru gönderilmedi.",
    submitQuestion: "Soru gönder →",
    myTopics: "Konularım",
    admin: "Admin",
    adminQueue: "İnceleme kuyruğu →",
    private: "Özel",
    pendingReview: "İncelemede",
    published: "Yayında",
    rejected: "Reddedildi",
    perfect: "Mükemmel",
    strong: "Güçlü",
    decent: "İyi",
    needsWork: "Geliştirilmeli",
    mastered: (n: number) => `${n} öğrenildi`,
    questionsCount: (n: number) => `${n} soru`,
  },
} as const;

// ─── Mock config ──────────────────────────────────────────────────────────────

export const i18nMock = {
  en: {
    pageTitle: "Mock interview",
    tabMock: "Mock interview",
    tabFlashcard: "Flashcard",
    topics: "Topics",
    selectAll: "Select all",
    deselectAll: "Deselect all",
    difficultyRange: "Difficulty range",
    from: "From",
    to: "To",
    sessionLength: "Session length",
    noMatch: "No questions match this selection.",
    available: (n: number, len: number) =>
      n < len
        ? `Only ${n} question${n === 1 ? "" : "s"} available — this session will use all ${n}.`
        : `${len} questions ready for this session.`,
    startMock: "Start mock interview",
    startFlashcard: "Start flashcard session",
    starting: "Starting…",
    noTopics: "No topics available yet.",
    privateTopic: "Private",
    masteredOf: (mastered: number, total: number) => `${mastered}/${total} mastered`,
  },
  tr: {
    pageTitle: "Mock mülakat",
    tabMock: "Mock mülakat",
    tabFlashcard: "Kartlar",
    topics: "Konular",
    selectAll: "Hepsini seç",
    deselectAll: "Seçimi kaldır",
    difficultyRange: "Zorluk aralığı",
    from: "Başlangıç",
    to: "Bitiş",
    sessionLength: "Oturum uzunluğu",
    noMatch: "Bu seçime uyan soru yok.",
    available: (n: number, len: number) =>
      n < len
        ? `Yalnızca ${n} soru mevcut — bu oturum tümünü kullanacak.`
        : `${len} soru bu oturum için hazır.`,
    startMock: "Mock mülakatı başlat",
    startFlashcard: "Kart oturumu başlat",
    starting: "Başlatılıyor…",
    noTopics: "Henüz topic yok.",
    privateTopic: "Özel",
    masteredOf: (mastered: number, total: number) => `${mastered}/${total} öğrenildi`,
  },
} as const;

// ─── Mock session ─────────────────────────────────────────────────────────────

export const i18nMockSession = {
  en: {
    questionOf: (i: number, total: number) => `Question ${i} of ${total}`,
    quit: "Quit",
    correct: "Correct",
    notQuite: "Not quite",
    correctAnswer: "Correct answer:",
    next: "Next",
    finish: "Finish",
    sessionComplete: "Session complete",
    score: (score: number, total: number) => `${score} / ${total} correct`,
    reviewAnswers: "Review answers",
    restart: "Restart with same settings",
    newSession: "New session",
    backToBank: "Back to question bank",
    noQuestions: "No questions matched this session",
    backToConfig: "Back to config",
    noMatch: "No questions matched this session. Try a wider topic or difficulty range.",
  },
  tr: {
    questionOf: (i: number, total: number) => `Soru ${i} / ${total}`,
    quit: "Çık",
    correct: "Doğru",
    notQuite: "Yanlış",
    correctAnswer: "Doğru cevap:",
    next: "Sonraki",
    finish: "Bitir",
    sessionComplete: "Oturum tamamlandı",
    score: (score: number, total: number) => `${score} / ${total} doğru`,
    reviewAnswers: "Cevapları incele",
    restart: "Aynı ayarlarla yeniden başla",
    newSession: "Yeni oturum",
    backToBank: "Soru bankasına dön",
    noQuestions: "Bu oturuma uyan soru bulunamadı",
    backToConfig: "Ayarlara dön",
    noMatch: "Bu oturuma uyan soru bulunamadı. Daha geniş topic veya zorluk aralığı dene.",
  },
} as const;

// ─── Flashcard session ────────────────────────────────────────────────────────

export const i18nFlashcard = {
  en: {
    cardOf: (i: number, total: number) => `Card ${i} of ${total}`,
    quit: "Quit",
    showAnswer: "Show answer",
    gotIt: "Got it",
    skip: "Skip",
    complete: "All done!",
    masteredCount: (n: number) => `${n} mastered this session`,
    newSession: "New session",
    backToMock: "Back to mock",
  },
  tr: {
    cardOf: (i: number, total: number) => `Kart ${i} / ${total}`,
    quit: "Çık",
    showAnswer: "Cevabı göster",
    gotIt: "Anladım",
    skip: "Geç",
    complete: "Hepsi tamam!",
    masteredCount: (n: number) => `Bu oturumda ${n} öğrenildi`,
    newSession: "Yeni oturum",
    backToMock: "Mock'a dön",
  },
} as const;

// ─── Submit question ──────────────────────────────────────────────────────────

export const i18nSubmit = {
  en: {
    title: "Submit a question",
    sub: "Share a question you've been asked in an interview.",
    topicLabel: "Topic",
    questionLabel: "Question",
    answerLabel: "Answer (optional)",
    levelLabel: "Difficulty level",
    sharePublic: "Share publicly (pending admin review)",
    submit: "Submit",
    submitting: "Submitting…",
    success: "Question submitted!",
    backToQuestions: "← Back to questions",
  },
  tr: {
    title: "Soru gönder",
    sub: "Bir mülakatda sana sorulan bir soruyu paylaş.",
    topicLabel: "Konu",
    questionLabel: "Soru",
    answerLabel: "Cevap (opsiyonel)",
    levelLabel: "Zorluk seviyesi",
    sharePublic: "Herkese açık paylaş (admin onayı gerekir)",
    submit: "Gönder",
    submitting: "Gönderiliyor…",
    success: "Soru gönderildi!",
    backToQuestions: "← Sorulara dön",
  },
} as const;

// ─── Levels ───────────────────────────────────────────────────────────────────

export const LEVEL_LABELS_TR: Record<number, string> = {
  1: "Başlangıç",
  2: "Junior",
  3: "Mid",
  4: "Senior",
  5: "Uzman",
};

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Pick the right translation object for a given page. */
export function t<T extends Record<Language, unknown>>(dict: T, lang: Language): T[Language] {
  return dict[lang];
}
