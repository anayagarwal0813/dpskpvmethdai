import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
// 💡 CHANGE THIS URL to your actual free music website
const FREE_MUSIC_WEBSITE_URL = "https://www.chosic.com/free-music/all/?sort=new&attribution=no&duration=180-300&keyword=beats+and+pop ";

export async function POST(req: Request) {
  let diaryEntry = "";

  try {
    const body = await req.json();
    diaryEntry =
      body.diaryEntry || body.entry || body.text || body.content || body.journalEntry || "";

    if (!diaryEntry || typeof diaryEntry !== "string") {
      return NextResponse.json({ error: "Diary entry is required" }, { status: 400 });
    }

    const prompt = `
You are an empathetic AI Mood Coach and Quest Generator for "Mood Quest".
Analyze the daily journal entry to perform mood analysis and emotion segregation.

User Journal Entry: "${diaryEntry}"

Instructions:
1. Identify the overarching mood category.
2. Perform emotion segregation into a primary emotion and secondary emotions.
3. Generate a 3-step actionable quest. STEP 2 OR STEP 3 MUST explicitly instruct the user to listen to a comforting or uplifting track on our integrated music hub.

Return ONLY a valid JSON object matching this structure:
{
  "moodCategory": "Stressed/Overwhelmed",
  "emotionSegregation": {
    "primary": "Anxiety",
    "secondary": ["Exhaustion", "Uncertainty"]
  },
  "moodSummary": "A brief, supportive 1-2 sentence reflection on their current state.",
  "quest": {
    "title": "An inspiring quest title",
    "description": "Short explanation of how this quest helps them process their current mood.",
    "steps": [
      "Step 1: Specific actionable grounding step",
      "Step 2: Listen to a calming song on our embedded Free Music Hub to reset your mind",
      "Step 3: Specific actionable reflection step"
    ],
    "points": 50
  }
}
`;

    let responseText = "";

    if (GROQ_API_KEY) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [
              { role: "system", content: "You output strictly valid JSON." },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            response_format: { type: "json_object" },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          responseText = data.choices[0]?.message?.content || "";
        }
      } catch (e) {
        console.warn("Groq fetch failed, falling back to local engine.");
      }
    }

    if (responseText) {
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json({ ...parsedData, musicUrl: FREE_MUSIC_WEBSITE_URL });
    }

    // Local Fallback Engine if AI provider is unreachable
    const lower = diaryEntry.toLowerCase();
    let primary = "Overwhelm";
    let secondary = ["Anxiety", "Tension"];
    let category = "Stressed/Overwhelmed";

    if (lower.includes("happy") || lower.includes("great") || lower.includes("win")) {
      category = "Excited/Energized";
      primary = "Joy";
      secondary = ["Pride", "Enthusiasm"];
    } else if (lower.includes("tired") || lower.includes("sleep") || lower.includes("exhaust")) {
      category = "Tired/Low Energy";
      primary = "Fatigue";
      secondary = ["Burnout", "Lethargy"];
    }

    return NextResponse.json({
      moodCategory: category,
      emotionSegregation: {
        primary: primary,
        secondary: secondary,
      },
      moodSummary: "It looks like you're navigating some strong emotions today. Let's take it step by step.",
      quest: {
        title: "Mindfulness & Music Quest",
        description: "A gentle mini-quest to help reset your mind and restore emotional balance.",
        steps: [
          "Take 3 slow, deep breaths (inhale for 4s, hold for 4s, exhale for 4s).",
          "Head to the Free Music Hub below and play 1 soothing track while closing your eyes.",
          "Write down 1 small win or thing you are grateful for right now."
        ],
        points: 50
      },
      musicUrl: FREE_MUSIC_WEBSITE_URL
    });

  } catch (error: any) {
    return NextResponse.json({ error: "Failed to process mood analysis." }, { status: 500 });
  }
}