import { NextResponse } from "next/server";
import { generateReply, type Turn, type ConversationRoute } from "@/lib/claude";

export const runtime = "nodejs";

const MAX_LEN = 2000;
const MAX_HISTORY = 20;

interface RequestBody {
  message?: unknown;
  history?: unknown;
  session_id?: unknown;
  route?: unknown;
}

async function logToSupabase(
  session_id: string,
  messages: Turn[],
  done: boolean
) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return;

  await fetch(`${url}/rest/v1/Conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ session_id, messages, done }),
  }).catch((e) => console.error("Supabase log error:", e));
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

  const session_id =
    typeof body.session_id === "string" && body.session_id.length > 0
      ? body.session_id
      : crypto.randomUUID();

  const route: ConversationRoute =
    body.route === "concierge" ? "concierge" : "clarity";

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

  const fullHistory: Turn[] = [...history, { role: "user", content: message }];

  try {
    const reply = await generateReply(route, fullHistory);

    const isDone =
      reply.includes("Das reicht für jetzt") ||
      reply.includes("Das reicht fuer jetzt");

    const allMessages: Turn[] = [
      ...fullHistory,
      { role: "assistant", content: reply },
    ];

    await logToSupabase(session_id, allMessages, isDone);

    return NextResponse.json({ reply, done: isDone, session_id });
  } catch (err) {
    const isApiKeyMissing =
      err instanceof Error && err.message.includes("ANTHROPIC_API_KEY");
    if (isApiKeyMissing) {
      console.error("ANTHROPIC_API_KEY not set");
      return NextResponse.json({ error: "service_unavailable" }, { status: 503 });
    }
    console.error("Claude API error:", err);
    return NextResponse.json(
      { reply: "Einen Moment hat es gebraucht. Schreib es gern nochmal." },
      { status: 200 }
    );
  }
}