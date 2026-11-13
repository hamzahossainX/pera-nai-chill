# DESIGN.md — Design Law (v1, written 2026-11-13)

> Binding for every UI, HUD, and in-world art ticket. Replaces the auto-created template. Changes need a DECISIONS.md entry.
> Rationale for each rule is in `docs/GAME_AUDIT.md` (IDs in brackets).

## §1 — Direction
- **Direction:** *Dhaka rickshaw-art comic* — thick outlines, saturated enamel colours on deep night-navy, a printed-poster feel.
- **Signature element:** the **chunky comic frame** — every panel/button has a 3 px near-black outline with a hard offset shadow (no blur), and one amber→red "enamel" gradient reserved for the primary action. Screens that lack it don't belong to this game.
- **Tone:** *formal craft, funny content.* Layout, spacing, type and motion are strictly consistent; the jokes live in copy, props and slapstick, never in misalignment or clutter.

## §2 — Tokens (semantic only; raw hex / magic px in components are bugs)
Implement as CSS variables in `globals.css` + a typed `tokens.ts` mirror for Phaser. Components reference **roles**, never colours.

| Role token | Value | Use |
|---|---|---|
| `--surface-0` | `#070b16` | app background |
| `--surface-1` | `#0f172a` | panels |
| `--surface-2` | `#18233d` | raised cards |
| `--ink` | `#f8fafc` | primary text |
| `--ink-dim` | `#a5b4cf` | secondary text (≥ 4.5:1 on surface-1) |
| `--outline` | `#02040a` | the comic frame |
| `--brand` | `#fbbf24` | headings, highlights |
| `--action` | gradient `#ff9500 → #ff1f57` | **primary CTA only** (one per screen) |
| `--ok` / `--warn` / `--danger` | `#22c55e` / `#f59e0b` / `#f43f5e` | status via a `Tone` type |
| `--hp` / `--patience` / `--rage` | `#ef4444` / `#38bdf8` / `#fb923c` | meters (fixed semantic colours) |
| spacing | 4 · 8 · 12 · 16 · 24 · 32 · 48 | the only allowed gaps |
| radius | 10 · 16 · 999 | card · panel · pill |
| elevation | `0 4px 0 var(--outline)` | hard offset shadow, no blur |
| touch-target | min 48 × 48 px | all interactive controls |
| z-layers | canvas 0 · hud 20 · controls 30 · modal 50 · toast 60 | no ad-hoc z-index |

In-world (Phaser) colours come from `map.palette` + `tokens.ts`; no hex literals inside scene/system classes except in map/art definition files.

## §3 — Type & numerals
- Display: **Luckiest Guy** (comic) — headings, buttons, comic words only; max 2 sizes per screen.
- Body: **Hind Siliguri** (Bangla + Latin). Bangla line-height ≥ 1.5; never clip ascenders/matras (test with "ফ্র", "ক্ষ", "র‍্যা").
- **Bangla is primary, English secondary** (≈ 60 % size, `--ink-dim`). Never show both at full size.
- Money/score/HP/timers use tabular numerals; prefix `৳`.
- Scale (px): 12 · 14 · 16 · 20 · 28 · 40 · 56. Nothing below 14 on interactive UI; in-world signs ≥ 18 logical px [M-06].

## §4 — Motion
- Durations: `fast 120ms` (press) · `base 220ms` (panel) · `slow 420ms` (screen/step). Easing: `Back.Out` for pops, `Quad.Out` for slides.
- Slapstick motion (squash/stretch, shake, slow-mo) belongs **in the canvas only**. UI chrome moves purposefully and quietly.
- `prefers-reduced-motion`: disable parallax *speed-ups*, screen shake, flashes and looping UI wiggle; keep state changes instant.

## §5 — Breakpoints & reference viewports (for `/design-review`)
| Name | Size | Purpose |
|---|---|---|
| desktop | **1280×720** (+ 1920×1080 smoke) | primary |
| tablet | **1024×768** | 4:3 letterbox check |
| phone-landscape | **844×390** | the hard case — UI ≤ 22 % of area [U-01] |
| phone-portrait | 390×844 | Orientation guard only; setup/home screens must still be usable |

Canvas: logical 1280×720, Phaser `FIT`, zones defined in `src/config/layout.ts` (see GAME_PLAN_V2 §3). UI uses `dvh`/`env(safe-area-inset-*)`.

## §6 — A11y floor
WCAG AA contrast · visible focus ring (`outline: 3px solid var(--brand)`) · real `<button>`/`<a>` (no clickable `div`s) · keyboard path for every screen · `aria-live="polite"` for toasts/events · all colour-coded meters also carry an icon or label · mobile usable at the smallest breakpoint in §5.

## §7 — Layout law
1. **No scroll traps.** Any region taller than the viewport sits in a bounded scroller (`h-dvh overflow-y-auto overscroll-contain`). `body` may stay `overflow:hidden` only if every screen root is `h-dvh` [M-01].
2. **HUD never covers lanes.** Lane feet stay ≥ 28 px above any UI at all reference viewports [U-01].
3. **One primary action per screen** (`--action`).
4. **Max 2 simultaneous overlay layers** over the canvas (HUD + one prompt).
5. Touch controls live in bottom-corner thumb clusters, not a centred strip.

## §8 — Banned defaults (enforced; "it looks fine" is not a counter-argument)
- Pure `#000` text/backgrounds; default Tailwind slate/blue as brand colour; unstyled focus rings.
- Emoji as primary iconography for core controls (use SVG icons; emoji only as flavour in copy).
- Clickable `div`s; text smaller than §3 minimums; English and Bangla at equal size.
- Vertical lobby/menu columns with > 7 interactive groups per screen.
- Dead bands (> 80 px of flat colour) inside the playfield art; repeated-sign "wallpaper" as a whole map background.
- Any map that fails the 64 px greyscale thumbnail distinctness test (GAME_PLAN_V2 §5.3).
- Entities or UI positioned by raw magic numbers instead of `layout.ts`.
