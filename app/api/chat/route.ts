import { NextResponse } from "next/server";

const OUT_OF_SCOPE_REPLY = "I cannot respond to this question.";

const SYSTEM_PROMPT = `You are Mood AI, an independent student wellbeing and reflection chatbot.
You can respond naturally and helpfully to general questions about feelings, moods, stress, school pressure, focus, rest, habits, routines, and everyday reflection.

Strict boundaries — if the user asks an out-of-the-box or off-topic question outside student wellbeing, mood reflection, study stress/routines, or general supportive conversation (for example: medical diagnoses or medication advice, financial or legal advice, political/news debates, solving graded homework/test questions, or random unrelated trivia), you MUST reply with this exact sentence and nothing else:
${OUT_OF_SCOPE_REPLY}

Rules for valid questions:
- Answer directly, clearly, and naturally.
- Never repeat or quote the user's message back at them.
- Keep replies concise (2-4 sentences) and varied.`;

const PREFERRED_GROQ_MODELS = [
  "llama-3.1-8b-instant",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "llama3-8b-8192",
  "gemma2-9b-it",
  "meta-llama/llama-4-scout-17b-16e-instruct",
];

async function getAvailableGroqModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return PREFERRED_GROQ_MODELS;

    const data = await res.json();
    const ids: string[] = Array.isArray(data?.data)
      ? data.data
          .map((m: any) => m?.id)
          .filter(
            (id: unknown): id is string =>
              typeof id === "string" &&
              !id.includes("whisper") &&
              !id.includes("guard") &&
              !id.includes("tts")
          )
      : [];

    if (ids.length === 0) return PREFERRED_GROQ_MODELS;

    // Order preferred models first, followed by any other active chat models on the account
    const ordered = [
      ...PREFERRED_GROQ_MODELS.filter((m) => ids.includes(m)),
      ...ids.filter((m) => !PREFERRED_GROQ_MODELS.includes(m)),
    ];
    return ordered;
  } catch {
    return PREFERRED_GROQ_MODELS;
  }
}

async function callGroq(apiKey: string, model: string, messages: { role: string; content: string }[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      temperature: 0.3,
      max_tokens: 250,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq (${model}) ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() || "";
}

async function callGemini(apiKey: string, messages: { role: string; content: string }[]) {
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { temperature: 0.3, maxOutputTokens: 250 },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body?.messages) ? body.messages : [];

    const formattedMessages = messages
      .filter((m: any) => m && typeof m.text === "string" && m.text.trim().length > 0)
      .slice(-12)
      .map((m: any) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text.trim(),
      }));

    if (formattedMessages.length === 0) {
      return NextResponse.json({ reply: OUT_OF_SCOPE_REPLY });
    }

    const groqKey = process.env.GROQ_API_KEY?.trim();
    const geminiKey = process.env.GEMINI_API_KEY?.trim();
    const errors: string[] = [];
    let rawReply = "";

    // 1. Dynamically pick an active model available on your Groq API key
    if (groqKey) {
      const modelsToTry = await getAvailableGroqModels(groqKey);
      for (const model of modelsToTry.slice(0, 3)) {
        try {
          rawReply = await callGroq(groqKey, model, formattedMessages);
          if (rawReply) break;
        } catch (e: any) {
          errors.push(e.message);
        }
      }
    }

    // 2. Fallback to Gemini if Groq failed or wasn't set
    if (!rawReply && geminiKey) {
      try {
        rawReply = await callGemini(geminiKey, formattedMessages);
      } catch (e: any) {
        errors.push(e.message);
      }
    }

    if (!rawReply) {
      console.error("All AI providers failed:", errors);
      return NextResponse.json(
        {
          reply:
            errors.length > 0
              ? `AI service error: ${errors[0]}`
              : "No GROQ_API_KEY or GEMINI_API_KEY found in .env.local.",
        },
        { status: 502 }
      );
    }

    if (rawReply.toLowerCase().includes("cannot respond to this question")) {
      return NextResponse.json({ reply: OUT_OF_SCOPE_REPLY });
    }

    return NextResponse.json({ reply: rawReply });
  } catch (err: any) {
    console.error("Chat route failure:", err);
    return NextResponse.json(
      { reply: `Server error: ${err?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}