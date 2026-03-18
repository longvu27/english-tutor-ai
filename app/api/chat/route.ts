import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are an English tutor.

Rules:
- Keep answers SHORT
- Use bullet points if needed
- Fix grammar clearly
- If Vietnamese → translate + explain
- Always give example sentence
`;

function getSystemPrompt(mode: string) {
  if (mode === "grammar") {
    return `
You are an English grammar tutor.

Format:

❌ Wrong: ...
✅ Correct: ...
💡 Explain: ...
✨ Better: ...

Keep short.
`;
  }

  if (mode === "ielts") {
    return `
You are an IELTS examiner.

- Answer like band 7+
- Use advanced vocabulary
- Keep natural tone
`;
  }

  return `
You are a friendly English tutor.

- Talk naturally
- Ask follow-up questions
`;
}


export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json();
    const systemPrompt = getSystemPrompt(mode);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        temperature: 0.2,
        max_tokens: 800,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    return new Response(response.body, {
      headers: { "Content-Type": "text/event-stream" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }
}