import { NextResponse } from "next/server";

const CATEGORIES = ["Elektrik", "Santexnik", "Kondisioner UstasÄ±", "Kombi UstasÄ±", "Mebel UstasÄ±", "RÉ™ngsaz", "TÉ™mizlik xidmÉ™ti", "DigÉ™r"] as const;

type Advice = { category: (typeof CATEGORIES)[number]; advice: string; urgent: boolean };

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI xidmÉ™ti hÉ™lÉ™ konfiqurasiya edilmÉ™yib." }, { status: 503 });

  let problem: unknown;
  try { ({ problem } = await request.json()); } catch { return NextResponse.json({ error: "SorÄŸu formatÄ± dÃ¼zgÃ¼n deyil." }, { status: 400 }); }
  if (typeof problem !== "string" || problem.trim().length < 3 || problem.length > 500) return NextResponse.json({ error: "Problemi 3â€“500 simvol arasÄ±nda yazÄ±n." }, { status: 400 });

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
          content: `SÉ™n HəllVar Ã¼Ã§Ã¼n istifadÉ™Ã§inin yazdÄ±ÄŸÄ± dildÉ™ qÄ±sa xidmÉ™t yÃ¶nlÉ™ndiricisÉ™n. ÆgÉ™r istifadÉ™Ã§i tÃ¼rk dilindÉ™ yazÄ±bsa cavabÄ± tÃ¼rk dilindÉ™ ver; É™gÉ™r azÉ™rbaycan dilindÉ™ yazÄ±bsa cavabÄ± azÉ™rbaycan dilindÉ™ ver; É™gÉ™r ingilis dilindÉ™ yazÄ±bsa cavabÄ± ingilis dilindÉ™ ver. Bu Ã§ox vacibdir. Dil qÉ™rarÄ± yalnÄ±z istifadÉ™Ã§inin sorÄŸu mÉ™tni É™sasÄ±nda verilmÉ™lidir. HÉ™tta Ä°ngilis dili tapÅŸÄ±rÄ±ÄŸÄ± gÉ™lsÉ™ dÉ™, cavabÄ±n advice hissÉ™si ingilis dilindÉ™ olmalÄ±dÄ±r. YalnÄ±z etibarlÄ± JSON qaytar: {"category":"...","advice":"...","urgent":true/false}. category bu siyahÄ±dan biri olmalÄ±dÄ±r: ${CATEGORIES.join(", ")}. advice É™n Ã§ox 2 qÄ±sa cÃ¼mlÉ™ olsun. Tibbi, hÃ¼quqi vÉ™ ya peÅŸÉ™kar tÉ™hlÃ¼kÉ™sizlik zÉ™manÉ™ti vermÉ™. Qaz qoxusu, qÄ±ÄŸÄ±lcÄ±m, tÃ¼stÃ¼, gÃ¼clÃ¼ su sÄ±zmasÄ± vÉ™ ya elektrik vurmasÄ± riski varsa urgent=true de vÉ™ uyÄŸun olaraq elektrik/su/qaz xÉ™ttini tÉ™hlÃ¼kÉ™siz ÅŸÉ™kildÉ™ baÄŸlamaÄŸÄ±, tÉ™cili xidmÉ™tÉ™ mÃ¼raciÉ™t etmÉ™yi tÃ¶vsiyÉ™ et.`,
        },
        { role: "user", content: problem.trim() },
      ],
    }),
  });

  if (!response.ok) return NextResponse.json({ error: response.status === 429 ? "AI limiti dolub. Bir az sonra yenidÉ™n yoxlayÄ±n." : "AI mÉ™slÉ™hÉ™ti hazÄ±rda É™lÃ§atan deyil." }, { status: response.status === 429 ? 429 : 502 });
  const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "AI cavabÄ± oxunmadÄ±." }, { status: 502 });

  try {
    const parsed = JSON.parse(content) as Advice;
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : "DigÉ™r";
    const advice = typeof parsed.advice === "string" ? parsed.advice.slice(0, 500) : "UyÄŸun mÃ¼tÉ™xÉ™ssisÉ™ mÃ¼raciÉ™t edin.";
    return NextResponse.json({ category, advice, urgent: Boolean(parsed.urgent) });
  } catch {
    return NextResponse.json({ error: "AI cavabÄ± dÃ¼zgÃ¼n formatda deyil." }, { status: 502 });
  }
}

