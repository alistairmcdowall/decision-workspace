type ClaudeCallResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

  export async function callClaude(
    systemPrompt: string,
    userPrompt: string,
    attempt: number = 1
  ): Promise<ClaudeCallResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
  
    if (!apiKey) {
      return { ok: false, error: "ANTHROPIC_API_KEY is not set." };
    }
  
    try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return callClaude(systemPrompt, userPrompt, attempt + 1);
      }
      console.error(`[callClaude] Failed after ${attempt} attempts: HTTP ${response.status}: ${errorBody}`);
      return { ok: false, error: `Claude API error ${response.status}: ${errorBody}` };
    }

    const data = await response.json();
    const textBlock = (data.content as Array<{ type: string; text?: string }>)?.find(
      (block) => block.type === "text"
    );

    if (!textBlock || typeof textBlock.text !== "string") {
      return { ok: false, error: "Claude response contained no text block." };
    }

    return { ok: true, text: textBlock.text };
  } catch (err) {
    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return callClaude(systemPrompt, userPrompt, attempt + 1);
    }
    const message = err instanceof Error ? err.message : "Unknown error calling Claude.";
    console.error(`[callClaude] Failed after ${attempt} attempts: ${message}`);
    return { ok: false, error: message };
  }
}

export async function callClaudeForJSON<T>(
  systemPrompt: string,
  userPrompt: string
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  const result = await callClaude(systemPrompt, userPrompt);

  if (!result.ok) {
    console.error(`[callClaudeForJSON] Upstream call failed: ${result.error}`);
    return result;
  }

  const cleaned = result.text.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as T;
    return { ok: true, data: parsed };
  } catch (parseErr) {
    console.error(
      `[callClaudeForJSON] JSON parse failed. Raw response length: ${result.text.length} chars. Raw response:\n${result.text}`
    );
    return { ok: false, error: `Could not parse JSON from Claude response: ${result.text}` };
  }
}