# Friction — Design Brief

*Find what's getting in the way.*

A guided diagnosis, not an assessment. The user should never feel scored.
They should feel understood, then see something they couldn't quite see before.

---

## 1. Creative direction

### The concept: Low Tide

Friction is what you see when the tide goes out. The water leaves and the
rocks, the ropes, the things caught between them are suddenly visible. Nothing
new appeared. It was there the whole time, under the surface everyone had
learned to look at.

Every visual decision serves that idea:

- **The ground is sand and foam**, not white. Warm, sun-bleached, quiet.
- **The water is blue-green and moves slowly.** A tide that never hurries.
- **The sun is orange** and it only appears where attention should go: the
  friction point, the primary CTA, the one thing to do next.
- **The reveal is a low tide.** The Friction Map draws itself in as if water is
  pulling back from a triangle drawn in wet sand.

### Art direction

| Element | Direction |
|---|---|
| Ground | `#F7F3EA` foam, with two tide pools of aqua and one warm sun glow drifting behind the page on 40–70 second loops. Never a flat white. |
| Materials | Paper and water. Cards are foam-white with a hairline sand border and a soft, low shadow, like something set on wet sand. No glass, no gradients on cards, no neon. |
| Lighting | Late-afternoon summer. Warm highlight from the top-right (the sun glow), cool fill from the bottom-left (the tide pool). |
| Depth | Three planes: the drifting tide (back), the paper (middle), the sun accents (front). Motion speed decreases toward the back. |
| Atmosphere | Calm, unhurried, honest. The tone of someone who has seen this problem before and is not going to rush you. |

### Palette

| Token | Hex | Role |
|---|---|---|
| foam | `#F7F3EA` | page ground |
| sand | `#E9DCC4` | hairlines, quiet surfaces |
| sand-deep | `#B8996A` | muted labels, rules |
| shallow | `#BFE3E6` | aqua tide pool |
| tide | `#2C8C9E` | **System** lens, links, progress |
| deep | `#123F5A` | primary ink, deep water |
| sun | `#F08A3E` | **Business** lens, friction point, primary CTA |
| kelp | `#3E8A6A` | **People** lens, success |

Lens colours are deliberate: Business is the sun (value, energy), System is
the tide (mechanism, leverage, repetition), People is kelp (living, growing,
anchored). The friction point is always the sun, because it is the one thing
that wants your attention.

### Typography

- **Manrope** (display, interface and body, weights 400–800). Rounder and
  warmer than Archivo; this is a conversation, not a résumé. Fraunces was
  retired site-wide in favour of one legible sans face — headlines get there
  on weight (700–800) rather than a second, harder-to-read typeface.
- **IBM Plex Mono** (stage codes: `01 — SIGNAL`). The quiet instrument-panel
  voice that says "this is a method, not a mood."

Scale is fluid (`clamp`), display copy sits at 2.2–4.4rem, body at 1.05rem
with 1.65 line height. Measure never exceeds ~62 characters.

### Motion language

Slow water, quick hands.

- **Background tide**: continuous, 40–70s, translate + scale only (GPU cheap),
  disabled under `prefers-reduced-motion`.
- **Screen transitions**: exiting content sinks 8px and fades in 220ms; the
  next rises 12px and fades in over 420ms with a 60ms stagger per block.
- **Choices**: 120ms press, a ripple of the lens colour fills from the left edge
  on select. Selected state is a sun-coloured ring, never a filled block, so
  text contrast holds.
- **The Friction Map**: edges draw in with `stroke-dashoffset` over 1.2s; the
  lens pools bloom to their size; the friction point arrives last with two
  slow rings, like a drop landing.
- **Progress**: a tide line across the top with six marks. It fills like water,
  not like a loading bar.

### Emotional arc

Recognition → Curiosity → Honesty → Clarity → Resolve → Return.

The user should arrive tense ("something isn't working"), relax into being
heard (the symptoms are in their words), be gently unsettled (the blind spot
question), feel the framework earn its place (the lenses), participate in the
diagnosis ("which feels closest?"), and leave with one map, one blind spot, one
question and one move. Then be invited back.

---

## 2. Experience architecture (v3, adaptive)

### Principles

1. Start with the signal, not the assessment.
2. Ask nothing about the person. No name, title, company, email.
3. Form hypotheses silently. Ask the question most likely to separate them.
4. Say what supports the read, what cuts against it, and what is still unknown.
5. One experiment, three things to watch. The result updates the read.
6. Be willing to change your mind, and say so.

### The loop

```
Signal → Hypothesis → Question → Evidence → Decision → Act → Learn
```

The user experiences a conversation of about ten questions. The engine holds
eleven hypotheses with confidence, chooses each question by how much it would
separate the live ones, and stops when one is clearly ahead or when nothing is
rising.

### Screens

**Arrival.** Unchanged. If an experiment is open, the return card asks what
happened.

**Signal.** One opener: what's getting in the way most right now. It seeds the
hypotheses.

**Questions.** Chosen one at a time. The header shows which lens the current
question belongs to. Follow-up questions appear only while the hypotheses they
test are live. Minimum eight, maximum twelve, then the inversion question.

**Optional.** Management time consumed (managers × hours, optional rate) and
revenue and profitability ranges with "prefer not to say".

**Diagnosis.** Leads with the current read: the constraint, a confidence label
(Early signal, Emerging pattern, Strong pattern, High confidence), what supports
it with strength, what cuts against it, what we're still trying to understand
and the question that would tell us, and a note if the read changed during the
conversation. Then where it sits on the map, the cost with an operating-profile
read, the blind spot, what not to do, one experiment with three things to
watch, one question, and the learning loop.

**Learning.** Each watched metric: improved, no change, worse. The outcome rules
update the hypotheses; the page says what was learned and whether the read
changed. Then run it again.

### Responsiveness, accessibility, performance

Unchanged from v1: mobile first, sticky progress and continue bar, native
buttons with `aria-pressed`, live region, reduced-motion path, one typeface
family, nothing fetched after load.
