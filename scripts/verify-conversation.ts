// Acceptance oracle: the 10 worked examples from WAS-3 §5 must reproduce
// VERBATIM. Run: node scripts/verify-conversation.ts  (Node 23+ strips types).
import { firstResponse } from "../lib/conversation.ts";

const CASES: { input: string; expect: string }[] = [
  {
    input: "Ich kann einfach nicht mehr, alles ist zu viel.",
    expect:
      "Das klingt gerade ganz schön schwer. Lass uns das hier kurz sortieren. Was davon drückt heute am meisten?",
  },
  {
    input: "Ich muss meine Steuer machen und finde keine Zeit.",
    expect:
      "Alles gut, dafür ist das hier da. Das nehm ich gern in die Hand. Sag mir nur kurz, bis wann es ungefähr soll.",
  },
  {
    input: "Ich brauch jetzt dringend jemanden, der mir den Papierkram abnimmt.",
    expect:
      "Okay — fangen wir mit einem an. Das nehm ich gern in die Hand. Sag mir nur kurz, bis wann es ungefähr soll.",
  },
  {
    input: "Ich sollte das eigentlich allein hinkriegen, ist bestimmt ne dumme Frage.",
    expect:
      "Alles gut, dafür ist das hier da. Lass uns das hier kurz sortieren. Was davon drückt heute am meisten?",
  },
  {
    input: "Eigentlich ist alles okay, ich schau mich nur mal um.",
    expect:
      "Alles gut, du musst hier nichts erklären. Lass uns das hier kurz sortieren. Was davon drückt heute am meisten?",
  },
  {
    input: "Mir fällt auf, dass ich in letzter Zeit ständig gereizt bin.",
    expect:
      "Schön, dass du das so klar bei dir merkst. Lass uns das hier kurz sortieren. Was davon drückt heute am meisten?",
  },
  {
    input: "Ich komm mit dem Haushalt nicht mehr klar.",
    expect:
      "Verstanden. Das ist viel auf einmal. Soll ich dir was von der Liste abnehmen, oder erstmal sortieren, was überhaupt drauf ist?",
  },
  {
    input: "Wer kann mir helfen, einen Umzug zu organisieren?",
    expect:
      "Okay — fangen wir mit einem an. Das nehm ich gern in die Hand. Sag mir nur kurz, bis wann es ungefähr soll.",
  },
  {
    input: "Irgendwie fühlt sich gerade alles schwer an, ich weiß nicht warum.",
    expect:
      "Das klingt gerade ganz schön schwer. Lass uns das hier kurz sortieren. Was davon drückt heute am meisten?",
  },
  {
    input: "Ich funktioniere nur noch, aber ich sollte mich nicht so anstellen.",
    expect:
      "Das darf hier ganz unaufgeregt sein. Lass uns das hier kurz sortieren. Was davon drückt heute am meisten?",
  },
];

let failed = 0;
CASES.forEach((c, i) => {
  const { reply, tags } = firstResponse(c.input);
  const ok = reply === c.expect;
  if (!ok) {
    failed++;
    console.log(`\n#${i + 1} FAIL  [ego=${tags.ego} mode=${tags.mode} route=${tags.route}]`);
    console.log(`  in:       ${c.input}`);
    console.log(`  expected: ${c.expect}`);
    console.log(`  got:      ${reply}`);
  } else {
    console.log(`#${i + 1} ok    [ego=${tags.ego} mode=${tags.mode} route=${tags.route}]`);
  }
});

console.log(`\n${CASES.length - failed}/${CASES.length} passed`);
if (failed > 0) process.exit(1);
