/**
 * Central translation dictionary.
 * All UI strings live here — pages import and index by lang.
 *
 * Exports are sorted alphabetically.
 * Keys within each dict are sorted alphabetically.
 */
import type { Language } from "@/lib/supabase/types";

// ─── Admin ───────────────────────────────────────────────────────────────────

export const i18nAdmin = {
  en: {
    // layout nav
    navQuestions: "Questions",
    navUsers: "Users",
    navTopics: "Topics",
    // questions page
    pendingTitle: "Pending submissions",
    pendingCount: (n: number) => `${n} question${n === 1 ? "" : "s"} awaiting review.`,
    noPending: "No submissions awaiting review.",
    allCaughtUp: "All caught up — no pending submissions.",
    browseQuestions: "Browse questions →",
    approved: "✓ Question approved and published.",
    rejected: "✗ Question rejected and hidden.",
    deleted: "🗑 Question permanently deleted.",
    level: (n: number, label: string) => `Level ${n} — ${label}`,
    by: "by",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    // users page
    usersTitle: "Users",
    usersCount: (n: number) => `${n} registered ${n === 1 ? "user" : "users"}. Assign or revoke the admin role below.`,
    noUsers: "No users yet.",
    roleUpdated: "✓ Role updated successfully.",
    revokeAdmin: "Revoke admin",
    makeAdmin: "Make admin",
    superAdmins: "Super Admins",
    superAdminsSub: "Full system access. Role changes require a database migration.",
    // topics page
    topicsTitle: "Topics",
    topicsSub: "Manage system topics and bulk-import questions via JSON.",
    allTopics: (n: number) => `All topics (${n})`,
    myTopics: (n: number) => `My Topics (private · ${n})`,
    myTopicsSub: "Your personal topics — visible only to you, not shared with other users.",
    questions: "questions",
    builtin: "builtin",
    // topic form
    addNewTopic: "Add new topic",
    displayName: "Display name",
    slugLabel: "Slug (URL-safe)",
    namePlaceholder: "e.g. Vue.js",
    slugPlaceholder: "e.g. vuejs",
    creating: "Creating…",
    createTopic: "Create topic",
    // json import
    importJson: "Import JSON",
    pastePlaceholder: "Paste JSON array here…",
    showSkipped: "Show skipped",
    importing: "Importing…",
    import: (n: number) => `Import ${n} question${n !== 1 ? "s" : ""}`,
    importFailed: "Import failed",
  },
  tr: {
    // layout nav
    navQuestions: "Sorular",
    navUsers: "Kullanıcılar",
    navTopics: "Konular",
    // questions page
    pendingTitle: "Bekleyen göndericiler",
    pendingCount: (n: number) => `${n} soru inceleme bekliyor.`,
    noPending: "İnceleme bekleyen gönderi yok.",
    allCaughtUp: "Hepsi tamam — bekleyen gönderi yok.",
    browseQuestions: "Sorulara göz at →",
    approved: "✓ Soru onaylandı ve yayınlandı.",
    rejected: "✗ Soru reddedildi ve gizlendi.",
    deleted: "🗑 Soru kalıcı olarak silindi.",
    level: (n: number, label: string) => `Seviye ${n} — ${label}`,
    by: "tarafından",
    approve: "Onayla",
    reject: "Reddet",
    delete: "Sil",
    // users page
    usersTitle: "Kullanıcılar",
    usersCount: (n: number) => `${n} kayıtlı kullanıcı. Admin rolü atayın veya kaldırın.`,
    noUsers: "Henüz kullanıcı yok.",
    roleUpdated: "✓ Rol başarıyla güncellendi.",
    revokeAdmin: "Admin'i kaldır",
    makeAdmin: "Admin yap",
    superAdmins: "Süper Adminler",
    superAdminsSub: "Tam sistem erişimi. Rol değişiklikleri veritabanı migrasyonu gerektirir.",
    // topics page
    topicsTitle: "Konular",
    topicsSub: "Sistem konularını yönetin ve JSON ile toplu soru içe aktarın.",
    allTopics: (n: number) => `Tüm konular (${n})`,
    myTopics: (n: number) => `Konularım (özel · ${n})`,
    myTopicsSub: "Kişisel konularınız — yalnızca size görünür, diğer kullanıcılarla paylaşılmaz.",
    questions: "soru",
    builtin: "yerleşik",
    // topic form
    addNewTopic: "Yeni konu ekle",
    displayName: "Görünen ad",
    slugLabel: "Slug (URL-güvenli)",
    namePlaceholder: "örn. Vue.js",
    slugPlaceholder: "örn. vuejs",
    creating: "Oluşturuluyor…",
    createTopic: "Konu oluştur",
    // json import
    importJson: "JSON İçe Aktar",
    pastePlaceholder: "JSON dizisini buraya yapıştırın…",
    showSkipped: "Atlananlari göster",
    importing: "İçe aktarılıyor…",
    import: (n: number) => `${n} soru içe aktar`,
    importFailed: "İçe aktarma başarısız",
  },
} as const;

// ─── Common ───────────────────────────────────────────────────────────────────
// Strings shared across multiple pages. Use these instead of repeating in
// individual dicts.

export const i18nCommon = {
  en: {
    decent: "Decent",
    needsWork: "Needs work",
    newSession: "New session",
    perfect: "Perfect",
    quit: "Quit",
    strong: "Strong",
  },
  tr: {
    decent: "İyi",
    needsWork: "Geliştirilmeli",
    newSession: "Yeni oturum",
    perfect: "Mükemmel",
    quit: "Çık",
    strong: "Güçlü",
  },
} as const;

// ─── Course (learning map / lesson player) ────────────────────────────────────

export const i18nCourse = {
  en: {
    backToDashboard: "Back to dashboard",
    blankN: (n: number) => `Blank ${n}`,
    challengeBadge: "Interview question",
    challengesDone: "Interview questions",
    check: "Check",
    continueBtn: "Continue",
    correct: "Correct!",
    correctAnswer: "Correct answer:",
    exitConfirm: "Leave the lesson? Progress in this lesson will be lost.",
    exitLesson: "Exit lesson",
    falseLabel: "False",
    firstTryAccuracy: "First-try accuracy",
    lessonComplete: "Lesson complete!",
    lessonProgress: "Lesson progress",
    nextLesson: "Next lesson",
    notQuite: "Not quite",
    pool: "Tap to add in order",
    trueLabel: "True",
    wordBank: "Word bank",
    yourOrder: "Your order",
  },
  tr: {
    backToDashboard: "Panele dön",
    blankN: (n: number) => `Boşluk ${n}`,
    challengeBadge: "Mülakat sorusu",
    challengesDone: "Mülakat sorusu",
    check: "Kontrol et",
    continueBtn: "Devam",
    correct: "Doğru!",
    correctAnswer: "Doğru cevap:",
    exitConfirm: "Dersten çıkılsın mı? Bu dersteki ilerlemen kaybolur.",
    exitLesson: "Dersten çık",
    falseLabel: "Yanlış",
    firstTryAccuracy: "İlk denemede doğruluk",
    lessonComplete: "Ders tamamlandı!",
    lessonProgress: "Ders ilerlemesi",
    nextLesson: "Sonraki ders",
    notQuite: "Tam değil",
    pool: "Sırayla eklemek için dokun",
    trueLabel: "Doğru",
    wordBank: "Kelime bankası",
    yourOrder: "Senin sıralaman",
  },
} as const;

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const i18nDashboard = {
  en: {
    admin: "Admin",
    adminQueue: "Review queue →",
    bookmarkCount: (n: number) => `${n} bookmarked question${n === 1 ? "" : "s"}`,
    bookmarks: "Bookmarks",
    browseQuestions: "Browse questions",
    browseQuestionsCta: "Browse questions",
    correct: "correct",
    mastered: (n: number) => `${n} mastered`,
    mySubmissions: "My submissions",
    myTopics: "My topics",
    noProgress: "No questions answered yet.",
    noSessions: "No mock sessions yet. Start one from the Mock page.",
    noSubmissions: "No questions submitted yet.",
    noTopicActivity: "No activity yet. Start a mock session or browse questions to see your progress.",
    pendingReview: "Pending review",
    private: "Private",
    progressHeading: "Your progress",
    published: "Published",
    questionsAnswered: "Questions answered",
    questionsCount: (n: number) => `${n} question${n === 1 ? "" : "s"}`,
    reviewAllCaughtUp: "All caught up — nothing due for review.",
    scoreTrend: (n: number) => `Score trend — last ${n} sessions`,
    reviewDueCount: (n: number) =>
      `${n} question${n === 1 ? "" : "s"} due for review`,
    reviewStart: "Start review →",
    reviewTitle: "Spaced repetition",
    rejected: "Rejected",
    score: "Score",
    sessionHistory: "Session history",
    sessions: "Sessions",
    startMock: "Start a session →",
    startMockCta: "Start mock interview",
    submitQuestion: "Submit a question →",
    submitQuestionBtn: "+ Submit question",
    title: "Dashboard",
    topicProgress: "Topic progress",
    topics: "Topics",
    viewBookmarks: "View bookmarks →",
  },
  tr: {
    admin: "Admin",
    adminQueue: "İnceleme kuyruğu →",
    bookmarkCount: (n: number) => `${n} yer imli soru`,
    bookmarks: "Yer imleri",
    browseQuestions: "Sorulara git",
    browseQuestionsCta: "Sorulara göz at",
    correct: "doğru",
    mastered: (n: number) => `${n} öğrenildi`,
    mySubmissions: "Gönderilerim",
    myTopics: "Konularım",
    noProgress: "Henüz hiç soru cevaplanmadı.",
    noSessions: "Henüz mock oturumu yok. Mock sayfasından bir tane başlat.",
    noSubmissions: "Henüz soru gönderilmedi.",
    noTopicActivity: "Henüz aktivite yok. İlerlemenizi görmek için mock oturumu başlatın veya sorulara göz atın.",
    pendingReview: "İncelemede",
    private: "Özel",
    progressHeading: "İlerlemeniz",
    published: "Yayında",
    questionsAnswered: "Cevaplanan soru",
    questionsCount: (n: number) => `${n} soru`,
    rejected: "Reddedildi",
    reviewAllCaughtUp: "Hepsi tamam — tekrarı gelen soru yok.",
    scoreTrend: (n: number) => `Skor eğilimi — son ${n} oturum`,
    reviewDueCount: (n: number) => `${n} soru tekrar için hazır`,
    reviewStart: "Tekrara başla →",
    reviewTitle: "Aralıklı tekrar",
    score: "Skor",
    sessionHistory: "Oturum geçmişi",
    sessions: "Oturum",
    startMock: "Oturum başlat →",
    startMockCta: "Mock mülakat başlat",
    submitQuestion: "Soru gönder →",
    submitQuestionBtn: "+ Soru gönder",
    title: "Dashboard",
    topicProgress: "Konu ilerlemesi",
    topics: "Konular",
    viewBookmarks: "Yer imlerine git →",
  },
} as const;

// ─── Flashcard session ────────────────────────────────────────────────────────
// Note: perfect/strong/decent/needsWork/quit/newSession → use i18nCommon

export const i18nFlashcard = {
  en: {
    answer: "Answer",
    backToMock: "Back to mock",
    cardOf: (i: number, total: number) => `Card ${i} of ${total}`,
    cards: (n: number) => `${n} ${n === 1 ? "card" : "cards"}`,
    complete: "All done!",
    didntKnow: "Didn't know",
    gotIt: "Got it",
    includesPrivate: " · includes private topics",
    knewIt: "I knew it",
    known: "known",
    masteredCount: (n: number) => `${n} mastered this session`,
    noAnswer: "No answer provided.",
    pageTitle: "Flashcard session",
    personalNote: "Personal note",
    restart: "Restart",
    reviewMissed: (n: number) => `Review missed (${n})`,
    showAnswer: "Show answer",
    skip: "Skip",
    topics: (n: number) => `${n} ${n === 1 ? "topic" : "topics"}`,
  },
  tr: {
    answer: "Cevap",
    backToMock: "Mock'a dön",
    cardOf: (i: number, total: number) => `Kart ${i} / ${total}`,
    cards: (n: number) => `${n} kart`,
    complete: "Hepsi tamam!",
    didntKnow: "Bilmiyordum",
    gotIt: "Anladım",
    includesPrivate: " · özel topicler dahil",
    knewIt: "Biliyordum",
    known: "bilindi",
    masteredCount: (n: number) => `Bu oturumda ${n} öğrenildi`,
    noAnswer: "Cevap yok.",
    pageTitle: "Kart oturumu",
    personalNote: "Kişisel not",
    restart: "Yeniden başla",
    reviewMissed: (n: number) => `Kaçırılanları gözden geçir (${n})`,
    showAnswer: "Cevabı göster",
    skip: "Geç",
    topics: (n: number) => `${n} topic`,
  },
} as const;

// ─── Glossary ─────────────────────────────────────────────────────────────────

export const i18nGlossary = {
  en: {
    allTopics: "All",
    backToGlossary: "← Back to glossary",
    clearFilters: "Clear filters",
    definition: "Definition",
    general: "General",
    noResults: "No terms match your search.",
    notFound: "Term not found.",
    relatedQuestions: "Related questions",
    searchPlaceholder: "Search terms…",
    sub: "Frontend terms auto-linked in answers as you read.",
    termCount: (n: number) => `${n} term${n === 1 ? "" : "s"}`,
    title: "Glossary",
    tooltipDemo: "Hover any highlighted term to see a tooltip definition.",
    tooltipDemoLabel: "Tooltip demo · hover or focus the underlined words",
  },
  tr: {
    allTopics: "Hepsi",
    backToGlossary: "← Sözlüğe dön",
    clearFilters: "Filtreleri temizle",
    definition: "Tanım",
    general: "Genel",
    noResults: "Aramanıza uygun terim bulunamadı.",
    notFound: "Terim bulunamadı.",
    relatedQuestions: "İlgili sorular",
    searchPlaceholder: "Terim ara…",
    sub: "Frontend terimleri okurken cevaplarda otomatik olarak bağlantılanır.",
    termCount: (n: number) => `${n} terim`,
    title: "Sözlük",
    tooltipDemo: "Tooltip tanımını görmek için üstüne gel.",
    tooltipDemoLabel: "Tooltip demosu · altı çizili kelimelerin üstüne gel veya tıkla",
  },
} as const;

// ─── Homepage ────────────────────────────────────────────────────────────────

export const i18nHome = {
  en: {
    browseQuestions: "Browse questions",
    features: [
      {
        cta: "Browse questions",
        description: "Questions across 15 topics with general and personal answers. Filter by topic and seniority level.",
        href: "/questions",
        title: "Q&A bank",
      },
      {
        cta: "Start a session",
        description: "Pick a topic, answer multiple-choice questions under simulated interview conditions, and review your score.",
        href: "/mock",
        title: "Mock interviews",
      },
      {
        cta: "Explore terms",
        description: "129 frontend terms with concise definitions — auto-linked inline as you read through answers.",
        href: "/glossary",
        title: "Glossary",
      },
    ] as const,
    footer: "Interview Prep — built for Senior Frontend Engineers",
    glossary: "Glossary",
    headline: "React · TypeScript · Next.js",
    heroDesc: (count: number, topicCount: number) =>
      `${count > 0 ? `${count}+` : "Hundreds of"} questions across ${topicCount} topics. Structured Q&A, a term glossary, and timed mock interview sessions.`,
    questions: (n: number) => (n > 0 ? `${n} questions` : "Coming soon"),
    signInCta: "Sign in to get started",
    startMock: "Start mock interview",
    tagline: "Frontend Interview Prep",
    topics: "Topics",
    trackProgress: "Track your progress",
    trackProgressSub: "Sign in to save mock session results, bookmark questions, and monitor your improvement over time.",
    viewDashboard: "View dashboard →",
    welcomeBack: "Welcome back",
    welcomeSub: "Track your sessions, bookmarks, and topic progress on your dashboard.",
    whatsInside: "What's inside",
  },
  tr: {
    browseQuestions: "Sorulara göz at",
    features: [
      {
        cta: "Sorulara göz at",
        description: "15 topic'te genel ve kişisel cevaplarla sorular. Topic ve seviyeye göre filtrele.",
        href: "/questions",
        title: "Soru bankası",
      },
      {
        cta: "Oturum başlat",
        description: "Bir topic seç, simüle edilmiş mülakat koşullarında çoktan seçmeli soruları cevapla ve skorunu incele.",
        href: "/mock",
        title: "Mock mülakatlar",
      },
      {
        cta: "Terimleri keşfet",
        description: "129 frontend terimi — cevapları okurken otomatik olarak satır içinde bağlantılı.",
        href: "/glossary",
        title: "Sözlük",
      },
    ] as const,
    footer: "Interview Prep — Senior Frontend Engineer'lar için",
    glossary: "Sözlük",
    headline: "React · TypeScript · Next.js",
    heroDesc: (count: number, topicCount: number) =>
      `${topicCount} topic'te ${count > 0 ? `${count}+` : "yüzlerce"} soru. Yapılandırılmış S&C, terim sözlüğü ve zamanlı mock mülakat oturumları.`,
    questions: (n: number) => (n > 0 ? `${n} soru` : "Yakında"),
    signInCta: "Başlamak için giriş yap",
    startMock: "Mock mülakat başlat",
    tagline: "Frontend Mülakat Hazırlık",
    topics: "Konular",
    trackProgress: "İlerlemeyi takip et",
    trackProgressSub: "Mock oturum sonuçlarını kaydetmek, soruları yer imlerine eklemek ve gelişimini izlemek için giriş yap.",
    viewDashboard: "Dashboard'a git →",
    welcomeBack: "Tekrar hoş geldin",
    welcomeSub: "Oturumlarını, yer imlerini ve konu ilerlemeni dashboard'dan takip et.",
    whatsInside: "İçerikler",
  },
} as const;

// ─── Levels ───────────────────────────────────────────────────────────────────

export const i18nLevels = {
  en: { 1: "Entry", 2: "Junior", 3: "Mid", 4: "Senior", 5: "Expert" },
  tr: { 1: "Başlangıç", 2: "Junior", 3: "Mid", 4: "Senior", 5: "Uzman" },
} as const satisfies Record<string, Record<number, string>>;

/** @deprecated Use i18nLevels[lang][value] */
export const LEVEL_LABELS_TR = i18nLevels.tr;

// ─── Mock config ──────────────────────────────────────────────────────────────

export const i18nMock = {
  en: {
    available: (n: number, len: number) =>
      n < len
        ? `Only ${n} question${n === 1 ? "" : "s"} available — this session will use all ${n}.`
        : `${len} questions ready for this session.`,
    cardLimit: "Card limit",
    deselectAll: "Deselect all",
    difficultyRange: "Difficulty range",
    flashSelected: (n: number, len: number) => `${n} topic${n === 1 ? "" : "s"} selected — up to ${len} cards.`,
    from: "From",
    masteredOf: (mastered: number, total: number) => `${mastered}/${total} mastered`,
    noMatch: "No questions match this selection.",
    noMockReady: "No mock-ready questions yet. Add 4 options to questions to enable mock mode.",
    noTopics: "No topics available yet.",
    pageTitle: "Mock interview",
    practice: "Practice",
    privateTopic: "Private",
    rangeArrow: "→",
    selectAll: "Select all",
    selectAtLeastOne: "Select at least one topic.",
    timerOff: "Off",
    timerPerQuestion: "Timer per question",
    sessionLength: "Session length",
    startFlashcard: "Start flashcard session",
    startMock: "Start mock interview",
    starting: "Starting…",
    subtitle: "Pick a mode, choose your topics and difficulty, then start.",
    tabFlashcard: "Flashcard",
    tabMock: "Mock interview",
    to: "To",
    topics: "Topics",
  },
  tr: {
    available: (n: number, len: number) =>
      n < len
        ? `Yalnızca ${n} soru mevcut — bu oturum tümünü kullanacak.`
        : `${len} soru bu oturum için hazır.`,
    cardLimit: "Kart limiti",
    deselectAll: "Seçimi kaldır",
    difficultyRange: "Zorluk aralığı",
    flashSelected: (n: number, len: number) => `${n} topic seçildi — en fazla ${len} kart.`,
    from: "Başlangıç",
    masteredOf: (mastered: number, total: number) => `${mastered}/${total} öğrenildi`,
    noMatch: "Bu seçime uyan soru yok.",
    noMockReady: "Henüz mock'a hazır soru yok. Mock modunu etkinleştirmek için sorulara 4 seçenek ekleyin.",
    noTopics: "Henüz topic yok.",
    pageTitle: "Mock mülakat",
    practice: "Pratik",
    privateTopic: "Özel",
    rangeArrow: "→",
    selectAll: "Hepsini seç",
    selectAtLeastOne: "En az bir topic seç.",
    timerOff: "Kapalı",
    timerPerQuestion: "Soru başına süre",
    sessionLength: "Oturum uzunluğu",
    startFlashcard: "Kart oturumu başlat",
    startMock: "Mock mülakatı başlat",
    starting: "Başlatılıyor…",
    subtitle: "Bir mod seç, konularını ve zorluğunu belirle, sonra başla.",
    tabFlashcard: "Flashcard",
    tabMock: "Mock mülakat",
    to: "Bitiş",
    topics: "Konular",
  },
} as const;

// ─── Mock session ─────────────────────────────────────────────────────────────
// Note: perfect/strong/decent/needsWork/newSession/quit → use i18nCommon

export const i18nMockSession = {
  en: {
    backToBank: "Back to question bank",
    backToConfig: "Back to config",
    byTopic: "By topic",
    cleanSweep: "Clean sweep — every answer correct.",
    correct: "Correct",
    correctAnswer: "Correct answer:",
    finish: "Finish",
    next: "Next",
    noMatch: "No questions matched this session. Try a wider topic or difficulty range.",
    noQuestions: "No questions matched this session",
    notAnswered: "Not answered",
    notQuite: "Not quite",
    questionOf: (i: number, total: number) => `Question ${i} of ${total}`,
    restart: "Restart with same settings",
    retryMissed: (n: number) => `Retry missed (${n})`,
    timeLeft: "Time left",
    timeUp: "Time's up!",
    reviewAnswers: "Review answers",
    score: (score: number, total: number) => `${score} / ${total} correct`,
    sessionComplete: "Session complete",
    yourAnswer: "Your answer:",
  },
  tr: {
    backToBank: "Soru bankasına dön",
    backToConfig: "Ayarlara dön",
    byTopic: "Konuya göre",
    cleanSweep: "Tam isabet — tüm cevaplar doğru.",
    correct: "Doğru",
    correctAnswer: "Doğru cevap:",
    finish: "Bitir",
    next: "Sonraki",
    noMatch: "Bu oturuma uyan soru bulunamadı. Daha geniş topic veya zorluk aralığı dene.",
    retryMissed: (n: number) => `Yanlışları tekrar çöz (${n})`,
    timeLeft: "Kalan süre",
    timeUp: "Süre doldu!",
    noQuestions: "Bu oturuma uyan soru bulunamadı",
    notAnswered: "Cevaplanmadı",
    notQuite: "Yanlış",
    questionOf: (i: number, total: number) => `Soru ${i} / ${total}`,
    restart: "Aynı ayarlarla yeniden başla",
    reviewAnswers: "Cevapları incele",
    score: (score: number, total: number) => `${score} / ${total} doğru`,
    sessionComplete: "Oturum tamamlandı",
    yourAnswer: "Senin cevabın:",
  },
} as const;

// ─── My Topics (dashboard) ────────────────────────────────────────────────────

export const i18nMyTopics = {
  en: {
    add: "Add",
    addOne: "Add one",
    addQuestion: "+ Add question",
    answerLabel: "Answer",
    answerPlaceholder: "General answer / explanation…",
    cancel: "Cancel",
    create: "Create",
    createFirst: "Create your first topic →",
    creating: "Creating…",
    delete: "Delete",
    deleteQuestion: "Delete this question?",
    deleteTopic: "Delete topic",
    deleteTopicConfirm: (name: string) => `Delete "${name}" and all its questions?`,
    edit: "Edit",
    explanationPlaceholder: "Explanation (optional)…",
    heading: "My Topics",
    hideMockOptions: "Hide mock options",
    importJson: "Import JSON",
    levelLabel: "Level",
    markCorrect: "Mark as correct",
    mockOptionPlaceholder: (letter: string) => `Option ${letter}…`,
    mockOptionsHint: "(4 options, exactly 1 correct → enables standard mock)",
    mockOptionsLabel: "Mock options",
    mockOptionsWarning: "Fill all 4 options and mark exactly 1 as correct to enable standard mock.",
    newTopic: "+ New topic",
    noAnswer: "No answer yet.",
    noTopics: "No personal topics yet.",
    personalNoteHeading: "Personal note",
    personalNoteLabel: "Personal note",
    personalNoteOptional: "(optional)",
    personalNotePlaceholder: "Your personal experience or example…",
    questionCount: (n: number) => `${n} ${n === 1 ? "q" : "qs"}`,
    questionLabel: "Question",
    questionPlaceholder: "e.g. What is the difference between useMemo and useCallback?",
    save: "Save",
    showMockOptions: "+ Add mock options (A/B/C/D)",
    topicNamePlaceholder: "Topic name…",
  },
  tr: {
    add: "Ekle",
    addOne: "Ekle",
    addQuestion: "+ Soru ekle",
    answerLabel: "Cevap",
    answerPlaceholder: "Genel cevap / açıklama…",
    cancel: "İptal",
    create: "Oluştur",
    createFirst: "İlk konunu oluştur →",
    creating: "Oluşturuluyor…",
    delete: "Sil",
    deleteQuestion: "Bu soru silinsin mi?",
    deleteTopic: "Konuyu sil",
    deleteTopicConfirm: (name: string) => `"${name}" ve tüm soruları silinsin mi?`,
    edit: "Düzenle",
    explanationPlaceholder: "Açıklama (opsiyonel)…",
    heading: "Konularım",
    hideMockOptions: "Mock seçeneklerini gizle",
    importJson: "JSON İçe Aktar",
    levelLabel: "Seviye",
    markCorrect: "Doğru olarak işaretle",
    mockOptionPlaceholder: (letter: string) => `Seçenek ${letter}…`,
    mockOptionsHint: "(4 seçenek, tam 1 doğru → standart mock'u etkinleştirir)",
    mockOptionsLabel: "Mock seçenekleri",
    mockOptionsWarning: "Standart mock'u etkinleştirmek için 4 seçeneği doldur ve tam 1 tanesini doğru olarak işaretle.",
    newTopic: "+ Yeni konu",
    noAnswer: "Henüz cevap yok.",
    noTopics: "Henüz kişisel konu yok.",
    personalNoteHeading: "Kişisel not",
    personalNoteLabel: "Kişisel not",
    personalNoteOptional: "(opsiyonel)",
    personalNotePlaceholder: "Kişisel deneyimin veya örneğin…",
    questionCount: (n: number) => `${n} ${n === 1 ? "s" : "s"}`,
    questionLabel: "Soru",
    questionPlaceholder: "örn. useMemo ile useCallback arasındaki fark nedir?",
    save: "Kaydet",
    showMockOptions: "+ Mock seçenekleri ekle (A/B/C/D)",
    topicNamePlaceholder: "Konu adı…",
  },
} as const;

// ─── Nav ─────────────────────────────────────────────────────────────────────

export const i18nNav = {
  en: {
    admin: "Admin",
    dashboard: "Dashboard",
    glossary: "Glossary",
    mock: "Mock",
    questions: "Questions",
    signIn: "Sign in",
    signOut: "Sign out",
  },
  tr: {
    admin: "Admin",
    dashboard: "Dashboard",
    glossary: "Sözlük",
    mock: "Mock",
    questions: "Sorular",
    signIn: "Giriş yap",
    signOut: "Çıkış yap",
  },
} as const;

// ─── Question card ────────────────────────────────────────────────────────────

export const i18nQuestionCard = {
  en: {
    customNoAnswerAfter: ".",
    customNoAnswerBefore: "No answer added yet. Edit this question from your",
    detailPage: "Detail page →",
    personalExample: "Personal example",
    signInForDetails: "Sign in for full details →",
  },
  tr: {
    customNoAnswerAfter: " üzerinden düzenleyin.",
    customNoAnswerBefore: "Henüz cevap eklenmedi. Bu soruyu",
    detailPage: "Detaylı sayfa →",
    personalExample: "Kişisel örnek",
    signInForDetails: "Detaylar için giriş yap →",
  },
} as const;

// ─── Question detail page ─────────────────────────────────────────────────────

export const i18nQuestionDetail = {
  en: {
    back: "← All questions",
    deepDive: "Deep dive",
    noAnswer: "No answer authored yet.",
    noDetail: "Deep-dive content coming soon.",
    personalExample: "Personal example",
    summary: "Summary",
  },
  tr: {
    back: "← Tüm sorular",
    deepDive: "Detaylı anlatım",
    noAnswer: "Henüz cevap yazılmadı.",
    noDetail: "Detaylı anlatım yakında eklenecek.",
    personalExample: "Kişisel örnek",
    summary: "Özet",
  },
} as const;

// ─── Questions page ───────────────────────────────────────────────────────────

export const i18nQuestions = {
  en: {
    allTopics: "All topics",
    bank: "Question bank",
    clear: "Clear filters",
    countSuffix: (n: number, active: boolean) =>
      `${n} ${n === 1 ? "question" : "questions"}${active ? " match" : " total"}`,
    dashboardBtn: "Go to Dashboard →",
    empty: "No questions match these filters yet.",
    emptyCustom: "No questions in this topic yet. Add some from your dashboard.",
    filterByTopic: "Filter by topic",
    guestBanner: (total: number) =>
      `You're viewing ${total} junior & entry-level questions. Sign in to unlock all levels, mock interviews, and the glossary.`,
    keywordPlaceholder: "Keyword in question…",
    loginForBookmarks: "Sign in to save bookmarks.",
    pageOf: (page: number, total: number) => `Page ${page} of ${total}`,
    perPage: "Per page",
    paginationNext: "Next →",
    paginationPrev: "← Previous",
    privateTopic: "Private topic",
    signIn: "Sign in",
    submitQuestion: "+ Submit question",
    tabAll: "All",
    tabBookmarked: "★ Bookmarked",
    title: "All questions",
  },
  tr: {
    allTopics: "Tüm konular",
    bank: "Soru bankası",
    clear: "Filtreleri temizle",
    countSuffix: (n: number, active: boolean) =>
      `${n} soru${active ? " eşleşiyor" : " toplam"}`,
    dashboardBtn: "Dashboard'a git →",
    empty: "Bu filtrelere uyan soru yok.",
    emptyCustom: "Bu topic'te henüz soru yok. Dashboard'dan ekleyebilirsin.",
    filterByTopic: "Konuya göre filtrele",
    guestBanner: (total: number) =>
      `${total} junior ve başlangıç seviyesi soru görüntülüyorsunuz. Tüm seviyeleri, mock mülakatları ve sözlüğü açmak için giriş yapın.`,
    keywordPlaceholder: "Soruda anahtar kelime…",
    loginForBookmarks: "Yer imlerini görmek için giriş yap.",
    pageOf: (page: number, total: number) => `Sayfa ${page} / ${total}`,
    perPage: "Sayfa başına",
    paginationNext: "Sonraki →",
    paginationPrev: "← Önceki",
    privateTopic: "Özel topic",
    signIn: "Giriş yap",
    submitQuestion: "+ Soru gönder",
    tabAll: "Hepsi",
    tabBookmarked: "★ Yer imleri",
    title: "Tüm sorular",
  },
} as const;

// ─── Sign in ─────────────────────────────────────────────────────────────────

export const i18nSignIn = {
  en: {
    github: "Continue with GitHub",
    google: "Continue with Google",
    sub: "Use Google or GitHub. No password.",
    title: "Sign in",
  },
  tr: {
    github: "GitHub ile devam et",
    google: "Google ile devam et",
    sub: "Google veya GitHub ile. Şifre yok.",
    title: "Giriş yap",
  },
} as const;

/** Pick the right translation object for a given page. */
export function t<T extends Record<Language, unknown>>(dict: T, lang: Language): T[Language] {
  return dict[lang];
}
