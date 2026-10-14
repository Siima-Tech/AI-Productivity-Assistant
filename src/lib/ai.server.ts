// Server-only helper: streams a Lovable AI Gateway Responses call and returns the final text.
export class AiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function generateText(instructions: string, input: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiError(500, "AI is not configured yet.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
      "Lovable-API-Key": key,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions,
      input: [{ role: "user", content: input }],
      reasoning: { effort: "low" },
      store: false,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    let msg = "The AI service could not respond. Please try again shortly.";
    if (res.status === 429) msg = "The AI is busy right now. Please wait a moment and try again.";
    if (res.status === 402) msg = "AI credits have run out. The shop owner needs to top up.";
    try {
      const j = (await res.json()) as { error?: { message?: string }; message?: string };
      if (res.status === 402 || res.status === 403) msg = j.message || j.error?.message || msg;
    } catch {
      /* ignore */
    }
    throw new AiError(res.status, msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let out = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const ev = JSON.parse(data) as { type?: string; delta?: string };
        if (ev.type === "response.output_text.delta" && ev.delta) out += ev.delta;
      } catch {
        /* ignore partial */
      }
    }
  }
  return out.trim();
}
