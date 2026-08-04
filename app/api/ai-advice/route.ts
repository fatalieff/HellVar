import { NextResponse } from "next/server";

const CATEGORIES = ["Elektrik", "Santexnik", "Kondisioner Ustası", "Kombi Ustası", "Mebel Ustası", "Rəngsaz", "Təmizlik xidməti", "Digər"] as const;

type Advice = { category: (typeof CATEGORIES)[number]; advice: string; urgent: boolean };

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI xidməti hələ konfiqurasiya edilməyib." }, { status: 503 });

  let problem: unknown;
  try { ({ problem } = await request.json()); } catch { return NextResponse.json({ error: "Sorğu formatı düzgün deyil." }, { status: 400 }); }
  if (typeof problem !== "string" || problem.trim().length < 3 || problem.length > 500) return NextResponse.json({ error: "Problemi 3–500 simvol arasında yazın." }, { status: 400 });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_completion_tokens: 180,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Sən UstaTap üçün istifadəçinin yazdığı dildə qısa xidmət yönləndiricisən. Əgər istifadəçi türk dilində yazıbsa cavabı türk dilində ver; əgər azərbaycan dilində yazıbsa cavabı azərbaycan dilində ver; əgər ingilis dilində yazıbsa cavabı ingilis dilində ver. Bu çox vacibdir. Dil qərarı yalnız istifadəçinin sorğu mətni əsasında verilməlidir. Hətta İngilis dili tapşırığı gəlsə də, cavabın advice hissəsi ingilis dilində olmalıdır. Yalnız etibarlı JSON qaytar: {"category":"...","advice":"...","urgent":true/false}. category bu siyahıdan biri olmalıdır: ${CATEGORIES.join(", ")}. advice ən çox 2 qısa cümlə olsun. Tibbi, hüquqi və ya peşəkar təhlükəsizlik zəmanəti vermə. Qaz qoxusu, qığılcım, tüstü, güclü su sızması və ya elektrik vurması riski varsa urgent=true de və uyğun olaraq elektrik/su/qaz xəttini təhlükəsiz şəkildə bağlamağı, təcili xidmətə müraciət etməyi tövsiyə et.`,
        },
        { role: "user", content: problem.trim() },
      ],
    }),
  });

  if (!response.ok) return NextResponse.json({ error: response.status === 429 ? "AI limiti dolub. Bir az sonra yenidən yoxlayın." : "AI məsləhəti hazırda əlçatan deyil." }, { status: response.status === 429 ? 429 : 502 });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "AI cavabı oxunmadı." }, { status: 502 });

  try {
    const parsed = JSON.parse(content) as Advice;
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : "Digər";
    const advice = typeof parsed.advice === "string" ? parsed.advice.slice(0, 500) : "Uyğun mütəxəssisə müraciət edin.";
    return NextResponse.json({ category, advice, urgent: Boolean(parsed.urgent) });
  } catch {
    return NextResponse.json({ error: "AI cavabı düzgün formatda deyil." }, { status: 502 });
  }
}
