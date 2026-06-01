import { NextResponse } from "next/server";
import { generateReply, type Turn } from "@/lib/claude";

// POST /api/conversation
//
// Alle Turns laufen durch Claude — keine Lookup-Tabelle mehr.
// Body: { message: string, history: Turn[] }
// Returns: { reply, done? }
//
// Session data minimization: history lebt auf dem Client, nicht server-side.

export const runtime = "nodejs";

const MAX_LEN = 2000;
const MAX_HISTORY = 20;

interface RequestBody {
  message?: unknown;
  history?: unknown;
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, MAX_LEN) : "";

  if (!message) {
    return NextResponse.json({ error: "empty_message" }, { status: 400 });
  }

  const rawHistory = Array.isArray(body.history) ? body.history : [];
  const history: Turn[] = rawHistory
    .slice(-MAX_HISTORY)
    .filter(
      (t): t is Turn =>
        t != null &&
        typeof t === "object" &&
        (t.role === "user" || t.role === "assistant") &&
        typeof t.content === "string"
    );

  // Alle Turns: Claude antwortet direkt auf den Nutzer-Input.
  const fullHistory: Turn[] = [...history, { role: "user", content: message }];

  try {
    const reply = await generateReply(fullHistory);

    // "Das reicht für jetzt." ist der heilige Schlusssatz.
    // Wenn Claude ihn sagt, signal done=true damit das Frontend Screen 4 zeigt.
    const isDone =
      reply.includes("Das reicht für jetzt") ||
      reply.includes("Das reicht fuer jetzt");

    return NextResponse.json({ reply, done: isDone });
  } catch (err) {
    const isApiKeyMissing =
      err instanceof Error && err.message.includes("ANTHROPIC_API_KEY");

    if (isApiKeyMissing) {
      console.error("ANTHROPIC_API_KEY not set");
      return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
    }

    console.error("Claude API error:", err);

    // Sanfter Fallback — nie ein roher Fehler um 23 Uhr.
    return NextResponse.json(
      { reply: "Einen Moment hat es gebraucht. Schreib es gern nochmal." },
      { status: 200 }
    );
  }
}