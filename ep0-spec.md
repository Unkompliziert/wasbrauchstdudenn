# EP0 — Screen Spec (implementable)

**Status:** Signed off by UX. Render attached to WAS-4. Ready for CTO implementation.

EP0 is the entire product in Phase 1. One page. One question. One field. Nothing else. The whole job of this screen is to feel like relief before the user types a single word.

---

## What it must feel like

An exhausted mother opens this at 11pm. She is carrying too much and is not sure she should even be here. The screen must not greet her, sell to her, explain itself, or ask her to understand anything. It must be quiet, warm, and already waiting. The empty space is the message: *there is nothing here to manage. Just one question, asked gently.*

The peak feeling we are designing for is **permission to exhale.**

---

## Layout

- Single full-viewport screen. No header, no footer, no navigation, no logo, no menu, no links, no cookie banner in view, no buttons.
- One centered column, max-width **560px**, horizontal padding **32px** (so it never touches the edges on mobile).
- Content vertically centered, then lifted **~6vh above true center** (optical center reads as calm; dead-center reads as heavy).
- Two elements only, stacked:
  1. The question
  2. The input field
- Gap between question and field: **40px**. This gap is deliberate. Do not reduce it to fit anything else in — nothing else goes here.

## The question (exact text)

> **Was brauchst du denn?**

- Never abbreviated, never reworded. The **"denn"** is load-bearing — it is what turns a form label into a real human asking. Do not drop it.
- No period (it is a spoken question, not a heading), question mark only.

## The input field

- One single-line text input. Centered text.
- **Placeholder (exact text):** `Ein Satz reicht.`
- No box. No fill. **Underline only** — a 1px bottom rule in a barely-there warm grey. A bordered box reads as "form / application." An underline reads as "a line to write on."
- `autofocus` on load: the cursor is already blinking. She does not have to find where to start.
- **Enter submits.** There is no button. `enterkeyhint="send"` so mobile keyboards show a send affordance.
- No character counter, no validation message on this screen, no helper text.

## Typography

- **One family, serif.** Serif because it reads as *a person wrote this*, not *a system is processing you* — which is the whole brand promise ("genuine listening, not a catalog").
  - Production font: ship a quiet humanist/old-style serif (e.g. **Source Serif 4**, **Lora**, or **Iowan Old Style**). Self-host the weight, do not pull a heavy font CDN that delays first paint — first paint *is* the relief.
  - System fallback stack: `"Iowan Old Style", Palatino, Georgia, ui-serif, serif`.
- **Two weights max — actually one is enough here: Regular (400).** No bold anywhere on EP0.
- Sizes:
  - Question: **34px**, line-height 1.3, letter-spacing 0.2px.
  - Input text + placeholder: **20px**.
- (Mobile: question may drop to ~28px under 380px width; keep the field at 18–20px so it never feels cramped.)

## Color / visual treatment

| Token | Value | Use |
|---|---|---|
| `--paper` | `#F7F4EF` | Background. Warm off-white, **not** `#FFFFFF`. Pure white glares at 11pm; warm paper is kind to tired eyes. |
| `--ink` | `#2D2A26` | Question + typed text. Soft warm near-black, not `#000`. |
| `--hint` | `#A9A199` | Placeholder. Quiet grey — present, never demanding. |
| `--rule` | `#E2DCD3` | Input underline at rest. Barely visible. |
| focus | `#CBBFA8` | Underline on focus. A soft warm shift, **no harsh blue focus ring.** |

- No shadows, no gradients, no illustration, no icon, no animation on load. The only motion permitted is the native cursor blink and a 240ms ease on the underline color when the field gains focus.
- Respect `prefers-reduced-motion` (remove the underline transition).

## Accessibility (non-negotiable, invisible to the user)

- Input has `aria-label="Was brauchst du denn?"` (the visible question doubles as the accessible label; do not add visible label text).
- Contrast: ink on paper passes AA comfortably. Placeholder grey is intentionally soft — it is a hint, not content, so the real label lives in the visible question above.
- Full keyboard path: page loads → cursor in field → type → Enter. No mouse required.

## Copy gates passed on this screen

- **Allday test** (see `allday-test-protocol`):
  - "Was brauchst du denn?" — read aloud: yes, you would say this to a tired person. The "denn" makes it warm, not clinical. **Pass.**
  - "Ein Satz reicht." — read aloud: yes, it removes pressure ("one sentence is enough"). **Pass.**
- **Forbidden words** (see `forbidden-words-gate`): zero occurrences. **Pass.**

## Out of scope for EP0 (do not add)

No tagline, no "Willkommen", no subtext under the question, no example prompts, no "How it works", no trust badges, no "as seen in", no social proof, no progress indicator, no second question. If it is not the question or the field, it does not ship on EP0. Reduction is the correct answer to "should we add…".
