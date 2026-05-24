import {
  buildDigitalTwinSystemPrompt,
  OPENROUTER_MODEL,
} from "@/lib/digital-twin-prompt";

export const runtime = "nodejs";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "OpenRouter API key is not configured." },
      { status: 500 },
    );
  }

  let body: { messages?: ChatMessage[] };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "Messages array is required." },
      { status: 400 },
    );
  }

  const sanitized = messages
    .filter(
      (m): m is ChatMessage =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-20);

  if (sanitized.length === 0) {
    return Response.json({ error: "No valid messages." }, { status: 400 });
  }

  const openRouterMessages = [
    { role: "system" as const, content: buildDigitalTwinSystemPrompt() },
    ...sanitized.map((m) => ({
      role: m.role,
      content: m.content.trim(),
    })),
  ];

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          "X-Title": "Kimhun Malai Digital Twin",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: openRouterMessages,
          stream: true,
          max_tokens: 1024,
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter error:", response.status, errText);
      return Response.json(
        { error: "The AI service returned an error. Please try again." },
        { status: response.status >= 500 ? 502 : response.status },
      );
    }

    if (!response.body) {
      return Response.json(
        { error: "Empty response from AI service." },
        { status: 502 },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Failed to reach the AI service." },
      { status: 502 },
    );
  }
}
