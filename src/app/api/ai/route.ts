import { NextRequest, NextResponse } from "next/server";

interface GenerateReasonsRequest {
  action: "generate_reasons" | "generate_single_reason" | "generate_letter";
  recipient_name: string;
  sender_name?: string;
  occasion?: string;
  relationship?: string;
  tone?: string;
  custom_cues?: string;
  count?: number;
  existing_reasons?: { title: string }[];
}

const TONE_DESCRIPTIONS: Record<string, string> = {
  heartfelt: "Deeply emotional, warm, sincere, touching, highlighting genuine appreciation and connection.",
  funny: "Playful, lighthearted, witty, full of gentle inside roasts and comedic banter, funny observations.",
  wholesome: "Cute, sweet, uplifting, sunshine vibes, pure joy, encouraging and charming.",
  romantic: "Deeply romantic, affectionate, poetic, expressive, swoon-worthy and sweet.",
  punchy: "Short, punchy, energetic, hype-person enthusiasm, high impact sentences."
};

const OCCASION_NAMES: Record<string, string> = {
  birthday: "Birthday celebration",
  anniversary: "Anniversary / Relationship milestone",
  love: "Romance & Love appreciation",
  friendship: "Best friend appreciation",
  custom: "Special milestone / celebration"
};

async function callGemini(prompt: string, apiKey: string) {
  const models = ["gemini-2.5-flash", "gemini-1.5-flash"];
  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ],
            generationConfig: {
              response_mime_type: "application/json",
              temperature: 0.85,
            }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("Empty response from Gemini API");
        }
        return JSON.parse(rawText);
      } else {
        const errJson = await response.json().catch(() => ({}));
        lastError = new Error(errJson?.error?.message || `Gemini API HTTP ${response.status}`);
      }
    } catch (e: any) {
      lastError = e;
    }
  }

  throw lastError || new Error("Failed to communicate with Gemini API");
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_STUDIO_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API key is not configured. Please add GEMINI_API_KEY to your frontend-next/.env.local file.",
          code: "MISSING_API_KEY"
        },
        { status: 400 }
      );
    }

    const body: GenerateReasonsRequest = await req.json();
    const {
      action = "generate_reasons",
      recipient_name = "Friend",
      sender_name = "A Friend",
      occasion = "birthday",
      relationship = "Best Friend",
      tone = "wholesome",
      custom_cues = "",
      count = 3,
      existing_reasons = []
    } = body;

    const toneDesc = TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.wholesome;
    const occasionName = OCCASION_NAMES[occasion] || occasion;

    if (action === "generate_reasons") {
      const prompt = `You are a creative, emotionally perceptive AI scrapbook copywriter.
Generate ${count} uniquely tailored, delightfully creative "Reasons / Memory Cards" for a handmade digital scrapbook gift.

Context:
- Recipient Name: ${recipient_name}
- Sender Name: ${sender_name}
- Occasion: ${occasionName}
- Relationship: ${relationship}
- Vibe / Tone: ${tone} (${toneDesc})
- Inside Jokes / Quirks / Memories / Personal Details: ${custom_cues || "None provided, make it universally creative and tailored to the relationship and occasion"}

Requirements:
- Return a strict JSON array of exactly ${count} objects.
- Each object MUST have:
  - "badge": A catchy uppercase badge (e.g., "REASON #1", "REASON #2", "GOLDEN MEMORY", "LITTLE QUIRK", "FAVORITE THING")
  - "emoji": A single vibrant, fitting emoji (e.g. "🌟", "🍕", "📸", "💖", "😂", "☕", "🎉")
  - "title": A punchy, catchy headline (5-8 words max)
  - "body_text": 2-3 engaging, warm sentences written directly to ${recipient_name}. Mention specific funny or sweet dynamics that fit the vibe!
- Make every single reason distinct, fresh, and not generic.

JSON Schema format:
[
  {
    "badge": "REASON #1",
    "emoji": "🌟",
    "title": "...",
    "body_text": "..."
  }
]`;

      const result = await callGemini(prompt, apiKey);
      return NextResponse.json({ success: true, data: Array.isArray(result) ? result : [result] });
    }

    if (action === "generate_single_reason") {
      const existingList = existing_reasons.map((r, i) => `${i + 1}. ${r.title}`).join("\n");
      const prompt = `You are an AI scrapbook copywriter. Generate 1 new, fresh "Reason / Memory Card" for a digital scrapbook.
It MUST be completely different from these already existing reasons:
${existingList || "None yet"}

Context:
- Recipient Name: ${recipient_name}
- Sender Name: ${sender_name}
- Occasion: ${occasionName}
- Relationship: ${relationship}
- Vibe / Tone: ${tone} (${toneDesc})
- Inside Jokes / Quirks / Memories: ${custom_cues || "Universal creative vibe"}

Requirements:
- Return a strict JSON object:
  - "badge": A catchy badge (e.g., "BONUS REASON", "REASON #${existing_reasons.length + 1}", "FAVORITE MEMORY")
  - "emoji": A single fitting emoji
  - "title": Punchy title (5-8 words)
  - "body_text": 2-3 warm, funny, or touching sentences written to ${recipient_name}

JSON Schema:
{
  "badge": "...",
  "emoji": "...",
  "title": "...",
  "body_text": "..."
}`;

      const result = await callGemini(prompt, apiKey);
      return NextResponse.json({ success: true, data: result });
    }

    if (action === "generate_letter") {
      const prompt = `You are an AI writer creating a heartfelt, handwritten-style notebook letter for a digital scrapbook.

Context:
- Recipient Name: ${recipient_name}
- Sender Name: ${sender_name}
- Occasion: ${occasionName}
- Relationship: ${relationship}
- Desired Tone: ${tone} (${toneDesc})
- Specific memories or things to mention: ${custom_cues || "None provided, make it heartwarming, authentic, and fitting the relationship"}

Requirements:
- Return a strict JSON object with:
  - "greeting": e.g. "Dear ${recipient_name}," or "To my favorite human ${recipient_name},"
  - "paragraphs": An array of 2 to 3 natural, beautifully worded paragraphs (2-3 sentences each). It will animate line-by-line on a lined notebook page, so keep the flow smooth and emotionally resonant.
  - "signoff": e.g. "With all my love and hugs,", "Forever your partner in crime,", "Cheers to many more adventures,"
  - "signature": "${sender_name}"

JSON Schema:
{
  "greeting": "...",
  "paragraphs": ["...", "..."],
  "signoff": "...",
  "signature": "..."
}`;

      const result = await callGemini(prompt, apiKey);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI content" },
      { status: 500 }
    );
  }
}
