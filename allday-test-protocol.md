# The Allday Test — Protocol

The single gate every sentence in the product must pass before it ships. It runs before any other review. It is not about grammar, tone guidelines, or brand voice documents — it is one honest question, asked out loud.

## The test (per sentence)

1. **Read the sentence aloud** — actually out loud — as if you are speaking to a real, tired person sitting across from you.
2. **Ask yourself:** *Would I naturally say this to someone who is exhausted and carrying too much?*
3. **Decide:**
   - **Yes** → it can stay.
   - **No** → delete it.
   - **Unsure** → delete it. Unsure is a no.

That is the whole test. The bar is "a human would say this to another human who is having a hard day." Not "this is technically true," not "this sounds professional," not "marketing approved it."

## What fails (delete on sight)

- Anything you would never say out loud to a tired friend: "Optimiere dein Wohlbefinden", "Starte deine Journey", "Wir begleiten deinen Prozess."
- Instructions disguised as care: "Nimm dir einen Moment für dich", "Spüre in dich hinein."
- Diagnosis / evaluation / score language: "Deine Situation:", "Dein Stresslevel", "Analyse".
- Cheerleading: "Du schaffst das!", exclamation marks, "Super!".
- Filler that adds no weight: "Willkommen", "Schön, dass du hier bist", "Lass uns gemeinsam…".
- Any forbidden word (see `forbidden-words-gate`) — automatic fail, no judgement call needed.

## What passes

- Short. Present tense. Spoken, not written-at.
- "Was brauchst du denn?" — the "denn" is what a person actually says.
- "Ein Satz reicht." — removes pressure.
- "Das reicht für jetzt." — closes without demanding more.
- "Für heute:" (not "Deine Situation:") — present, not a verdict.

## Running it on a full screen (under 5 minutes)

1. List every sentence and fragment on the screen, including placeholders, button labels, helper text, error messages, and empty states. (~1 min)
2. Read each one aloud, in order. (~2 min)
3. For each: yes / no / unsure → keep or delete. Mark deletions. (~1 min)
4. Run the forbidden-words grep over the whole screen's copy. (~30 sec)
5. Record the result: screen name, date, sentences checked, pass/fail per sentence, what was deleted. (~30 sec)

If a sentence fails, the correction is almost always **deletion**, not rewriting. Reach for a rewrite only when the sentence carries information the user genuinely needs; otherwise cut it. When in doubt, the screen wants fewer words, not better ones.

## For independent use (Conversation Agent)

This protocol is self-contained — run it on any dialogue line without UX in the loop. A line of dialogue passes only if you would say it aloud to an exhausted person across a kitchen table at 11pm. The conversation presents **one** thing at a time, so test each line as it will actually be heard, alone, not as part of a paragraph. If a generated line fails, drop it and let the silence stand rather than padding with a softer-sounding replacement. Escalate to UX only when a line both fails the test and seems load-bearing for the flow.

## Sign-off record (template)

```
Screen: ______________________   Date: __________   Reviewer: __________
Sentences checked: ___
Failed / deleted: ___
Forbidden-words grep: pass / fail
Result: PASS / FAIL
```
