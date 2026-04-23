import Groq from "groq-sdk";

let client: Groq | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not set");
    client = new Groq({ apiKey });
  }
  return client;
}

const MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
] as const;

async function callWithRetry(
  prompt: string,
  maxRetries: number = 2
): Promise<string> {
  const groq = getClient();

  // Try each model in order; on rate limit, immediately try the next model
  for (const model of MODELS) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 4096,
        });
        return completion.choices[0]?.message?.content || "";
      } catch (err: any) {
        const isRateLimit =
          err?.status === 429 || err?.error?.type === "tokens";
        if (isRateLimit) {
          console.log(
            `Rate limited on ${model}, trying next option (attempt ${attempt + 1}/${maxRetries})...`
          );
          // Short wait before retry on same model, but break to next model on first hit
          if (attempt === 0) break;
          await new Promise((r) => setTimeout(r, 5000));
          continue;
        }
        throw err;
      }
    }
  }
  throw new Error(
    "All models rate limited. The Groq free tier (100k tokens/day) is exhausted. Try again later or upgrade at https://console.groq.com/settings/billing"
  );
}

export async function generateText(prompt: string): Promise<string> {
  return callWithRetry(prompt);
}

export async function generateJSON<T>(prompt: string): Promise<T> {
  const text = await callWithRetry(
    prompt +
      "\n\nIMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation."
  );

  // Strip potential markdown code fences
  const cleaned = text
    .replace(/^```json?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
