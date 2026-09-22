const TIMEOUT_MS = 20_000;

export async function completeVendor(vendor: "deepseek" | "gemini" | "mimo" | "zhipu", model: string, prompt: string): Promise<string> {
  if (vendor === "gemini") return gemini(model, prompt);
  if (vendor === "deepseek") {
    return chatCompletions(
      `${trimSlash(process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com")}/chat/completions`,
      process.env.DEEPSEEK_API_KEY || "",
      model,
      prompt,
      "bearer",
    );
  }
  if (vendor === "mimo") {
    const base = process.env.MIMO_BASE_URL;
    if (!base) throw new Error("MIMO_BASE_URL is empty");
    return chatCompletions(`${trimSlash(base)}/chat/completions`, process.env.MIMO_API_KEY || "", model, prompt, "api-key");
  }
  return chatCompletions(
    `${trimSlash(process.env.ZHIPU_BASE_URL || "https://open.bigmodel.cn/api/paas/v4")}/chat/completions`,
    process.env.ZHIPU_API_KEY || "",
    model,
    prompt,
    "bearer",
  );
}

async function chatCompletions(
  url: string,
  apiKey: string,
  model: string,
  prompt: string,
  auth: "bearer" | "api-key",
): Promise<string> {
  if (!apiKey) throw new Error("missing api key");
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(auth === "bearer" ? { authorization: `Bearer ${apiKey}` } : { "api-key": apiKey }),
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        { role: "system", content: "You are a Guandan card player. Reply with one JSON object and nothing else." },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`provider ${response.status}: ${body.slice(0, 180)}`);
  const parsed = JSON.parse(body) as { choices?: { message?: { content?: string } }[] };
  const content = parsed.choices?.[0]?.message?.content;
  if (!content) throw new Error("provider returned empty content");
  return content;
}

async function gemini(model: string, prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  if (!apiKey) throw new Error("missing gemini api key");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`gemini ${response.status}: ${body.slice(0, 180)}`);
  const parsed = JSON.parse(body) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = parsed.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("") ?? "";
  if (!text) throw new Error("gemini returned empty content");
  return text;
}

function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
