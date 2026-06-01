# Forbidden Words — Shipping Gate

A hard gate. Zero tolerance. No copy ships — screen text, placeholders, button labels, errors, empty states, dialogue lines, metadata, alt text — until it passes. This gate is mechanical: it does not require judgement, so it cannot be argued down.

## The list

```
sustainable
holistic
process
sharpen
give space to
feel into yourself
breakthrough
```

These words/phrases are banned because they signal the exact register we refuse: wellness-industry, self-optimization, therapeutic-jargon. They are things no exhausted person says to themselves. Several are English; the German equivalents that carry the same smell are banned by extension and caught by the allday test:

- `process` → `Prozess`, "begleiten wir deinen Prozess"
- `give space to` / `feel into yourself` → "gib dir Raum", "spüre in dich hinein", "fühl in dich rein"
- `holistic` → `ganzheitlich`
- `sustainable` → `nachhaltig` (in the wellness sense)
- `breakthrough` → `Durchbruch`
- `sharpen` → `schärfen` ("Schärfe deinen Fokus")

## How to run it

Grep the screen's copy (case-insensitive, whole copy including placeholders and labels):

```bash
grep -rniE 'sustainable|holistic|process|sharpen|give space to|feel into yourself|breakthrough|prozess|ganzheitlich|nachhaltig|durchbruch|spüre in dich|fühl in dich|gib dir raum|schärfe' <copy-source>
```

Any hit = **fail**. The copy does not ship until the grep returns nothing. A hit is corrected by deletion or by saying the plain thing a person would actually say.

## Relationship to the allday test

This gate runs as step 4 of the allday screen review (`allday-test-protocol`). The two together: the allday test catches everything that *sounds* wrong; the forbidden-words gate guarantees the known offenders can never slip through on a tired reviewer's watch.

## Gate record (template)

```
Screen / copy source: ______________   Date: __________
Grep run: yes / no
Hits: ___    (list each)
Result: PASS / FAIL
```
