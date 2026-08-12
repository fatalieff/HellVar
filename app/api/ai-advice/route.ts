import { NextResponse } from "next/server";

const CATEGORIES = [
  "Elektrik",
  "Santexnik",
  "Kondisioner Ustası",
  "Kombi Ustası",
  "Mebel Ustası",
  "Rəngsaz",
  "Təmizlik xidməti",
  "Bərbər",
  "Digər",
] as const;

type Advice = { category: (typeof CATEGORIES)[number]; advice: string; urgent: boolean };

// ─── Language detection ──────────────────────────────────────────────────────
// Decides the reply language purely from the user's input text.
function detectLanguage(text: string): "az" | "tr" | "en" | "ru" {
  const lower = text.toLowerCase().trim();

  // ə exists only in Azerbaijani — decisive
  if (/ə/.test(lower)) return "az";
  // Cyrillic script → Russian
  if (/[а-яё]/.test(lower)) return "ru";

  const azWords = [
    "işləmir", "təmir", "elektrik", "santexnik", "sızır", "yoxdur", "olmur",
    "qırılıb", "istilik", "qaz", "kran", "kondisioner", "kombi", "lazımdır",
    "düzəlt", "bax", "gəl", "su", "işləyir", "söndü", "yanmır",
  ];
  const trWords = [
    "nasıl", "çalışmıyor", "bozuk", "tamir", "arıza", "tesisat", "klima",
    "kombi", "yap", "ediyor", "oluyor", "akıyor", "yok", "gerek", "neyi",
    "elektrikçi", "su", "çalış", "gayri", "istiyorum", "çok", "hep",
  ];
  const enWords = [
    "not", "broken", "fix", "repair", "leak", "plumber", "electrician",
    "water", "heating", "please", "help", "issue", "problem", "boiler",
    "conditioner", "nanny", "cleaning", "leaking", "stopped", "doesn't",
    "cooling", "air", "power", "light", "clogged", "drain", "move",
    "washing", "fridge", "error", "temperature", "stuck",
  ];
  const ruWords = [
    "не работает", "сломано", "починить", "ремонт", "сантехник",
    "электрик", "течёт", "протечка", "вода", "отопление", "кран", "помогите",
    "проблема", "не включается", "не греет", "котёл", "кондиционер", "уборка",
    "няня", "холодильник", "стиральная", "плита", "плитк", "нет света", "розетка",
  ];

  // Whole-word match short tokens ("not", "su", "qaz"…) to avoid false positives.
  const count = (words: string[]) =>
    words.reduce((acc, w) => {
      if (w.length <= 3)
        return new RegExp(`\\b${w}\\b`).test(lower) ? acc + 1 : acc;
      return lower.includes(w) ? acc + 1 : acc;
    }, 0);

  const az = count(azWords);
  let tr = count(trWords);
  const en = count(enWords);
  const ru = count(ruWords);

  // Turkish-specific characters
  if (/[ğşçöü]/.test(lower)) tr += 2;

  const scores: Array<{ lang: "az" | "tr" | "en" | "ru"; n: number }> = [
    { lang: "az", n: az },
    { lang: "tr", n: tr },
    { lang: "en", n: en },
    { lang: "ru", n: ru },
  ];
  scores.sort((a, b) => b.n - a.n);

  if (scores[0].n > 0 && scores[0].n > scores[1].n) return scores[0].lang;
  if (az > 0 && az >= tr) return "az";
  if (tr > 0) return "tr";
  if (en > 0) return "en";
  return "az";
}

const LANGUAGE_HINTS: Record<"az" | "tr" | "en" | "ru", string> = {
  az: "Bu sorğu azərbaycan dilində yazılıb. Cavabın advice hissəsini yalnız azərbaycan dilində yaz.",
  tr: "Bu sorğu türk dilində yazılıb. Cavabın advice hissəsini yalnız türk dilində yaz.",
  en: "This request is written in English. Write the advice field only in English.",
  ru: "Этот запрос написан на русском языке. Напишите поле advice только на русском языке.",
};

const LANGUAGE_NAMES: Record<"az" | "tr" | "en" | "ru", string> = {
  az: "Azerbaijani (Azərbaycan dili)",
  tr: "Turkish (Türkçe)",
  en: "English",
  ru: "Russian (Русский)",
};

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "AI xidməti hələ konfiqurasiya edilməyib." },
      { status: 503 }
    );

  let problem: unknown;
  try {
    ({ problem } = await request.json());
  } catch {
    return NextResponse.json({ error: "Sorğu formatı düzgün deyil." }, { status: 400 });
  }

  if (
    typeof problem !== "string" ||
    problem.trim().length < 3 ||
    problem.length > 500
  )
    return NextResponse.json(
      { error: "Problemi 3–500 simvol arasında yazın." },
      { status: 400 }
    );

  const userText = problem.trim();
  const detectedLang = detectLanguage(userText);
  const langHint = LANGUAGE_HINTS[detectedLang];
  const langName = LANGUAGE_NAMES[detectedLang];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_completion_tokens: 180,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are HəllVar's AI service router.
CRITICAL LANGUAGE RULE — this must NEVER be violated: The user's request is written in ${langName}. You MUST write the "advice" field ONLY in ${langName}. English request → English advice, Azerbaijani → Azerbaijani, Turkish → Turkish, Russian → Russian. Never write the advice in a language different from the user's request, no matter what.

Return ONLY valid JSON: {"category":"...","advice":"...","urgent":true/false}. category must be one of these exact values: ${CATEGORIES.join(", ")}. advice: at most 2 short sentences. Do not give medical, legal, or professional safety guarantees. If the problem involves a gas smell, sparks, smoke, a strong water leak, or electric shock risk, set urgent=true and advise safely shutting off the gas/water/power line and contacting emergency services.`,
        },
        {
          role: "user",
          content: `${langHint}\n\n${userText}`,
        },
      ],
    }),
  });

  if (!response.ok)
    return NextResponse.json(
      {
        error:
          response.status === 429
            ? "AI limiti dolub. Bir az sonra yenidən yoxlayın."
            : "AI məsləhəti hazırda əlçatan deyil.",
      },
      { status: response.status === 429 ? 429 : 502 }
    );

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content)
    return NextResponse.json({ error: "AI cavabı oxunmadı." }, { status: 502 });

  try {
    const parsed = JSON.parse(content) as Advice;
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : "Digər";
    const advice =
      typeof parsed.advice === "string"
        ? parsed.advice.slice(0, 500)
        : "Uyğun mütəxəssisə müraciət edin.";
    return NextResponse.json({ category, advice, urgent: Boolean(parsed.urgent) });
  } catch {
    return NextResponse.json(
      { error: "AI cavabı düzgün formatda deyil." },
      { status: 502 }
    );
  }
}
