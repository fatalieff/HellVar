import { NextResponse } from "next/server";

const CATEGORIES = [
  "Elektrik",
  "Santexnik",
  "Kondisioner Ustası",
  "Kombi Ustası",
  "Mebel Ustası",
  "Rəngsaz",
  "Təmizlik xidməti",
  "Digər",
] as const;

type Advice = { category: (typeof CATEGORIES)[number]; advice: string; urgent: boolean };

// ─── Language detection ──────────────────────────────────────────────────────
// Decides the reply language purely from the user's input text.
function detectLanguage(text: string): "az" | "tr" | "en" {
  const lower = text.toLowerCase();

  // ə is unique to Azerbaijani
  if (/ə/.test(lower)) return "az";
  // Undotted ı is a strong Turkish signal
  if (/ı/.test(lower)) return "tr";

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
    "not working", "broken", "fix", "repair", "leak", "plumber", "electrician",
    "water", "heating", "please", "help", "issue", "problem", "boiler",
    "conditioner", "nanny", "cleaning", "leaking", "stopped", "doesn't", "no",
  ];

  const count = (words: string[]) =>
    words.reduce((acc, w) => (lower.includes(w) ? acc + 1 : acc), 0);

  const az = count(azWords);
  const tr = count(trWords);
  const en = count(enWords);

  if (az > tr && az >= en) return "az";
  if (tr > az && tr >= en) return "tr";
  if (en > az && en >= tr) return "en";
  if (/[ğşçöü]/.test(lower)) return "tr";
  return "az";
}

const LANGUAGE_HINTS: Record<"az" | "tr" | "en", string> = {
  az: "Bu sorğu azərbaycan dilində yazılıb. Cavabın advice hissəsini yalnız azərbaycan dilində yaz.",
  tr: "Bu sorğu türk dilində yazılıb. Cavabın advice hissəsini yalnız türk dilində yaz.",
  en: "This request is written in English. Write the advice field only in English.",
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
          content: `Sən HəllVar üçün xidmət yönləndiricisən. ƏN VACİB QAYDA: İstifadəçinin sorğusu hansı dildə yazılıbsa, cavabın advice hissəsini mütləq yalnız o dildə yaz. İstifadəçi türkcə yazıbsa → türkcə cavablandır, azərbaycanca yazıbsa → azərbaycanca, ingiliscə yazıbsa → ingiliscə. Bu qayda heç bir halda pozulmamalıdır; advice üçün başqa dil istifadə etmə. Yalnız etibarlı JSON qaytar: {"category":"...","advice":"...","urgent":true/false}. category bu siyahıdan biri olmalıdır: ${CATEGORIES.join(", ")}. advice ən çox 2 qısa cümlə olsun. Tibbi, hüquqi və ya peşəkar təhlükəsizlik zəmanəti vermə. Qaz qoxusu, qığılcım, tüstü, güclü su sızması və ya elektrik vurması riski varsa urgent=true de və uyğun olaraq elektrik/su/qaz xəttini təhlükəsiz şəkildə bağlamağı, təcili xidmətə müraciət etməyi tövsiyə et.`,
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
