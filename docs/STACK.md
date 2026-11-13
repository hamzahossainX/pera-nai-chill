# STACK.md — The Architecture Memory Map

> **This is the single most-read file in the framework.** It is the *map* every role loads instead of scanning the repo — the answer to "what is this project made of and how do I run its gates."

## §1 — Identity
- **Project:** Pernaichill (Pera Nai Chill — Dhaka Rage Runner)
- **Domain:** Satirical 2D comic action-runner web arcade game
- **Status:** Phase 1+2 shipped; **V2 overhaul in planning/execution** (see `docs/GAME_AUDIT.md`, `docs/GAME_PLAN_V2.md`, ROADMAP §V2)
- **One-line what-it-is:** A client-side 2D ragdoll action-runner web game where players caricature a villain, navigate 3 lanes of Dhaka traffic, unleash slap/chappal combos, and survive real-life Dhaka events (loadshedding, smog, strikes).

## §2 — Stack
| Layer | Choice | Source of truth |
|---|---|---|
| Language | TypeScript 5 (strict) | `tsconfig.json` |
| Package manager | npm | `package-lock.json` |
| Repo shape | single-package Next.js App Router | `package.json` |
| Web Framework | Next.js 16 (App Router) | `src/app/` |
| 2D Game Engine | Phaser 4.2.1 | `src/game/` |
| UI & State | React 19 + Tailwind CSS + Zustand 5 + Framer Motion 14 | `src/components/`, `src/store/` |
| Computer Vision | Google MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) | `src/services/faceService.ts` |
| Audio | Handcrafted WebAudio Synthesizers | `src/services/audio.ts` |
| Database | None (Phase 1 client-only; Phase 2 Supabase blueprint ready) | `peranaichill.md §16` |
| Deploy target | Vercel / Static web | `next.config.ts` |

## §3 — Gates
1. **lint:** `npm run lint`
2. **typecheck:** `npx tsc --noEmit`
3. **test:** `npm run test`
4. **build:** `npm run build`
5. **e2e:** `npx playwright test`

## §4 — The Reuse Surface
| Unit | Path | Purpose |
|---|---|---|
| Game Engine | `src/game/` | Phaser scenes, jointed rigs, parallax, spawners, combat, FX |
| State & Events | `src/store/`, `src/game/bus.ts` | Throttled Zustand store and mitt event bus |
| Services | `src/services/` | Audio synthesis, MediaPipe face processing, event engine |
| UI Components | `src/components/` | React HUD overlay, weapon dock, lobby, dialogs, PWA shell |
| Configuration | `src/config/` | Weapons, balance numbers, villains, events JSON |

## §5 — Security & Data Boundary
- **100% Client-Side Privacy**: Zero remote photo upload. Face processing, circular cropping, and caricaturization run strictly in-memory inside the client browser.
- **Offline First**: All game SFX are procedurally synthesized via WebAudio oscillators and noise generators; zero asset downloads required.
