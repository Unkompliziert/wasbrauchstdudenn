// First-response logic for "Was brauchst du denn?" (EP0, turn one).
//
// This is a faithful, DETERMINISTIC implementation of the CEO-approved dialogue
// logic spec (WAS-3 "Dialogue Logic Spec — Ego-State, Mode, Routing Fork").
// The spec itself states turn one is fully table-driven and should ship as a
// lookup, NOT a generative call (§4.4, §6). So there is intentionally no LLM
// call here: turn one costs €0, returns in microseconds, and the sacred lines
// stay byte-stable. The Anthropic prompt-caching directive applies to the M3
// generative flows (Clarity / Concierge turns 2+), not to this turn.
//
// All three detectors run on the same input and return tags the user NEVER sees.
// No state name, mode name, flow name, or score is ever rendered.
//
// The 10 worked examples in WAS-3 §5 are the acceptance oracle for this file;
// see scripts/verify-conversation.ts — every one must reproduce verbatim.

export type EgoState = "exhausted" | "shame" | "protecting" | "observing" | "neutral";
export type Mode = "stoic" | "intuitive" | "active" | "neutral";
export type Route = "clarity" | "concierge" | "unclear";

export interface Detection {
  ego: EgoState;
  mode: Mode;
  route: Route;
}

export interface FirstResponse {
  reply: string;
  // Invisible diagnostics — for the CTO's own logs only, never sent to the user
  // in a way that is rendered. Exposed so server-side logging (a later milestone)
  // can record them; EP0 ignores them.
  tags: Detection;
}

// Normalize: lower-case, collapse whitespace. German umlauts kept as-is.
export function norm(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// §1 Ego-State detection (precedence: exhausted > shame > protecting > observing)
// ---------------------------------------------------------------------------

const RE_DEPLETION =
  /(kann|komm|geht)\b[^.!?]{0,14}\bnicht mehr|nicht mehr klar|keine kraft|erschöpft|am ende|\bleer\b|\bmüde\b|schaffe? es nicht|funktioniere nur( noch)?/;
const RE_TOTALIZING = /\balles\b|\bnichts\b|\bimmer\b|\bnie\b|\bständig\b/;
const RE_OVERWHELM = /\bzu viel\b|\bschwer\b/;

const RE_SHAME =
  /sollte[^.!?]{0,20}(eigentlich|allein|selbst|nicht so)|müsste[^.!?]{0,12}können|andere schaffen|blamier|dumme frage|blöde frage|tut mir leid|anstellen|nicht so schlimm/;

const RE_PROTECTING =
  /eigentlich[^.!?]{0,12}okay|es geht schon|geht schon|brauch(e|st)?[^.!?]{0,12}eigentlich nichts|schau[^.!?]{0,12}nur[^.!?]{0,12}um|ich frag(e)? (ja )?nur|nur mal (um|schauen|gucken)|im grunde/;

const RE_OBSERVING =
  /ich merke|mir fällt auf|ich frage mich|in letzter zeit|ich beobachte/;

function detectEgo(t: string): EgoState {
  const depletion = RE_DEPLETION.test(t);
  const totalizing = RE_TOTALIZING.test(t);
  const overwhelm = RE_OVERWHELM.test(t);

  // §1.5(1): depletion + totalizing → exhausted, regardless of other signals.
  if (depletion && totalizing) return "exhausted";
  // §1.5(2): self-judgment present and depletion not dominant → shame.
  if (RE_SHAME.test(t)) return "shame";
  // §1.5(1) cont. / general exhausted: depletion word, or totalizing weight.
  if (depletion || (totalizing && overwhelm)) return "exhausted";
  // §1.5(3): minimizing/deflection dominates → protecting.
  if (RE_PROTECTING.test(t)) return "protecting";
  // §1.5(4): calm meta-language → observing.
  if (RE_OBSERVING.test(t)) return "observing";
  // §1.5(5): default — exhausted-leaning neutral. Tagged "neutral"; landing copy
  // for an undetected ego is handled in NEUTRAL_LANDING (derived from the §5
  // worked-example oracle, examples #2/#3/#8).
  return "neutral";
}

// ---------------------------------------------------------------------------
// §2 Mode detection (stoic / intuitive / active / neutral)
// ---------------------------------------------------------------------------

const RE_ACTIVE =
  /wer kann|brauch(e|st)?[^.!?]{0,20}jemand|jemand(en)? der|\bdringend\b|\bsofort\b|\bschnell\b/;

// Concrete, task-shaped nouns → stoic register.
const RE_TASK_NOUN =
  /\bsteuer|\bhaushalt|\bbrief|\btermin|\bpapierkram|\bumzug|\bbehörde|\banwalt|\beinkauf|\bhandwerker|\bkinderbetreuung|\brechnung/;

// Feeling-led / vague-overwhelm → intuitive register.
const RE_FEELING =
  /irgendwie|fühlt sich|\bf[üu]hl|komisch|weiß (auch )?nicht|\bzu viel\b|\bschwer\b|gereizt|funktioniere nur|kann (einfach )?nicht mehr/;

const RE_OBLIGATION = /\bmuss\b|\bsollte\b|\bmüsste\b/;

function detectMode(t: string): Mode {
  // 1. explicit action / help request
  if (RE_ACTIVE.test(t)) return "active";
  // 2. concrete task noun, controlled framing
  if (RE_TASK_NOUN.test(t)) return "stoic";
  // 3. feeling-led / vague overwhelm
  if (RE_FEELING.test(t)) return "intuitive";
  // 4. obligation framing without feeling
  if (RE_OBLIGATION.test(t)) return "stoic";
  // §2.4 fallback
  return "neutral";
}

// ---------------------------------------------------------------------------
// §3 Routing fork (clarity / concierge / unclear)
// ---------------------------------------------------------------------------

const RE_DELEGABLE = RE_TASK_NOUN; // a named, externally-solvable object
const RE_HANDOVER_FRAME =
  /wer kann mir helfen|brauch(e|st)?[^.!?]{0,20}jemand|jemand(en)? der|gibt es jemand|abnehmen|abnimmt|organisier|erledig/;

export function detectRoute(t: string): Route {
  const hasHaushalt = /\bhaushalt/.test(t);
  const handover = RE_HANDOVER_FRAME.test(t);

  // §3.3 the classic ambiguous domestic case: "Haushalt" with no clear
  // delegation verb could mean "send help" or "I'm drowning" → ask the fork.
  if (hasHaushalt && !handover) return "unclear";
  // §3.1 / §3.4(1): a delegable object or an outward "someone who" frame.
  if (RE_DELEGABLE.test(t) || handover) return "concierge";
  // §3.4(2,4): inward-only / pure overwhelm → Clarity (the safe default).
  return "clarity";
}

// ---------------------------------------------------------------------------
// §4.2 Landing bank  [ego-state] × [mode column]
// ---------------------------------------------------------------------------

const LANDING: Record<Exclude<EgoState, "neutral">, Record<Mode, string>> = {
  exhausted: {
    neutral: "Okay. Das ist gerade eine Menge.",
    stoic: "Verstanden. Das ist viel auf einmal.",
    intuitive: "Das klingt gerade ganz schön schwer.",
    active: "Okay — fangen wir mit einem an.",
  },
  shame: {
    neutral: "Gut, dass du das hier hinschreibst.",
    stoic: "Alles gut, dafür ist das hier da.",
    intuitive: "Das darf hier ganz unaufgeregt sein.",
    active: "Kein Thema — sag einfach, was ansteht.",
  },
  protecting: {
    neutral: "Alles gut, du musst hier nichts erklären.",
    stoic: "Klar. Fragen ist völlig in Ordnung.",
    intuitive: "Du musst gar nichts aufmachen, was nicht soll.",
    active: "Passt. Sag einfach, woran ich ran soll.",
  },
  observing: {
    // §4.2: Observing/neutral = "Verstehe." + short mirror. No worked example
    // exercises it (observing pairs with reflective modes); kept minimal and
    // route-agnostic. Flagged to the Conversation Agent for confirmation.
    neutral: "Verstehe.",
    stoic: "Verstehe. Du merkst es selbst schon.",
    intuitive: "Schön, dass du das so klar bei dir merkst.",
    active: "Klar — du weißt eigentlich schon, wohin.",
  },
};

// Landing for an undetected (neutral) ego-state. The §4.2 bank only defines the
// four named states; the §5 worked-example oracle shows the landing used when no
// ego-state is detected (examples #2 Stoic, #3/#8 Active). Derived from there and
// flagged to the Conversation Agent for confirmation.
const NEUTRAL_LANDING: Record<Mode, string> = {
  neutral: "Alles gut, dafür ist das hier da.",
  stoic: "Alles gut, dafür ist das hier da.", // example #2
  intuitive: "Das darf hier ganz unaufgeregt sein.",
  active: "Okay — fangen wir mit einem an.", // examples #3, #8
};

// ---------------------------------------------------------------------------
// §4.3 Bridge bank + §3.3 fork questions
// ---------------------------------------------------------------------------

const BRIDGE_CLARITY =
  "Lass uns das hier kurz sortieren. Was davon drückt heute am meisten?";
const BRIDGE_CONCIERGE =
  "Das nehm ich gern in die Hand. Sag mir nur kurz, bis wann es ungefähr soll.";
const FORK_STANDARD =
  "Wenn dir jemand davon eine Sache abnehmen könnte — was wäre das?";
// Softened fork for exhausted/shame ego-states (§3.3).
const FORK_SOFTENED =
  "Soll ich dir was von der Liste abnehmen, oder erstmal sortieren, was überhaupt drauf ist?";

function landingFor(ego: EgoState, mode: Mode): string {
  if (ego === "neutral") return NEUTRAL_LANDING[mode];
  return LANDING[ego][mode];
}

// §4.4 Assembly: Landing + (Bridge | Fork). At most two sentences of intent,
// joined with a single space.
export function firstResponse(input: string): FirstResponse {
  const t = norm(input);
  const ego = detectEgo(t);
  const mode = detectMode(t);
  const route = detectRoute(t);

  const landing = landingFor(ego, mode);

  let second: string;
  if (route === "concierge") {
    second = BRIDGE_CONCIERGE;
  } else if (route === "clarity") {
    second = BRIDGE_CLARITY;
  } else {
    // unclear → fork; soften for exhausted/shame
    second = ego === "exhausted" || ego === "shame" ? FORK_SOFTENED : FORK_STANDARD;
  }

  return { reply: `${landing} ${second}`, tags: { ego, mode, route } };
}
