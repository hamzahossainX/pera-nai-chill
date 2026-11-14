# Frontend, UI/UX, and visualization work log

Last updated: 2026-11-14 (Asia/Dhaka)

**Active checkout:** `pera-nai-chill-frontend/`, branch `feat/frontend-ui-ux`, based on `29086b7`. The original `pera-nai-chill-master/` is a preserved extracted backup. Earlier findings describe that older copy; current GitHub gameplay already includes newer W0/W1 changes. Historical screenshot paths below are in the backup unless otherwise stated.

## Project and ownership

Pera Nai Chill (Dhaka Rage Runner) is a browser-based 2D action game for desktop and mobile. The course team has one project manager and three developers. The user is one developer and owns frontend UI/UX and visualization.

User's requested sequence: analyze the project, improve the frontend, then improve maps. Initial analysis and runtime baseline are complete; the focused lobby scrolling fix is implemented.

The updated SRS in the parent workspace describes this game. The POINTFEX Round 02 submission describes ProLink, a different marketplace project. Keep the documents separate when preparing course deliverables.

## Read before implementation

- `../AGENTS.md`: working instructions at the parent workspace root.
- `CONTRIBUTING.md` and `docs/spec/README.md`.
- `docs/DESIGN.md`: existing Dhaka rickshaw-art comic direction and UI rules.
- `docs/ROADMAP.md`: existing ticket IDs and dependencies.
- Relevant sections of `docs/GAME_PLAN_V2.md`, `docs/GAME_AUDIT.md`, and `docs/spec/MAP_SCENARIOS.md`.

Paths above are relative to the application root except where stated. Historical audits are context, not proof of the current runtime state. The current user scope takes precedence over older expansion plans.

## Architecture snapshot

| Layer | Implementation |
| --- | --- |
| Application and UI | Next.js, React, TypeScript, Tailwind CSS |
| Gameplay and environment | Phaser |
| Shared state | Zustand, `src/store/useGameStore.ts` |
| UI/game messages | Mitt, `src/game/bus.ts` |
| Face customization | MediaPipe and React Easy Crop |
| Persistence | Browser localStorage |
| Tests | Vitest and Playwright |

The current SRS excludes accounts, backend databases, online leaderboards, and multiplayer from Phase 1.

## Initial findings

These findings come from source inspection and existing screenshots, not a new browser run.

| Priority | Finding | Evidence / starting point |
| --- | --- | --- |
| Critical | Lobby scrolling is unbounded inside a body with hidden overflow; lower options can become unreachable. | `src/components/shell/AppShell.tsx`, `src/app/layout.tsx`; existing audit M-01 |
| High | Portrait rotation prompt is global and also interrupts setup. | `src/components/shell/OrientationGuard.tsx`, `src/app/layout.tsx` |
| High | Setup exposes many decisions before the first run. | Lobby, villain preview, map and weapon selectors |
| High | Interactive labels include 9–12px text and inconsistent Bangla/English hierarchy. | `VillainPreview.tsx`, `MapSelector.tsx`, `WeaponDock.tsx` |
| High | HUD, weapon dock, and ticker compete with gameplay space. | Existing screenshots in `docs/audit/screens/`; verify at reference viewports |
| Medium | Design rules are only partially reflected in shared styles and components. | `docs/DESIGN.md`, `src/app/globals.css` |
| Medium | Map selection is mostly text, without illustrated route previews. | `src/components/lobby/MapSelector.tsx` |
| Medium | Maps share road, distant skyline, and metro elements; rendering includes hardcoded map branches. | `src/config/maps.ts`, `src/game/systems/ParallaxSystem.ts`, `SpawnSystem.ts` |
| Gameplay dependency | Chaser automatically follows the villain's lane, while the SRS requires player lane changes. | `src/game/scenes/RunScene.ts`, `chaser.followLane(...)` |

## Frontend-first work plan

- [x] Review project structure, SRS, relevant source, design direction, and saved screenshots.
- [x] Save analysis and persistent working instructions.
- [x] Establish a running baseline and capture current desktop/mobile screenshots (2026-11-14).
- [x] Implement bounded lobby scrolling (V2-00); wheel/keyboard verified, physical touch acceptance remains pending.
- [x] Allow portrait setup and scope rotation guidance to gameplay (browser verified 2026-11-14).
- [x] Simplify lobby hierarchy: character preview, villain/map choice, optional customization, clear Start action (2026-11-14; see scoped verification below).
- [ ] Establish shared styling, readable typography, focus states, and touch targets using existing design rules.
- [ ] Improve HUD and controls without covering playable lanes; coordinate shared layout changes with gameplay work.
- [ ] Polish pause/results screens, modals, upload errors, and settings behavior.
- [ ] Verify desktop, tablet, phone landscape, and portrait setup.
- [ ] Improve the three existing maps after the frontend foundation is stable.

This checklist focuses the user's contribution. It does not mark existing roadmap tickets complete or authorize implementing the entire older V2/V3 backlog.

## Map direction for the later phase

Polish existing maps before expanding their count.

| Map | Proposed distinguishing elements |
| --- | --- |
| Mirpur | Metro pillars, construction barriers, dust, broken road surfaces |
| Farmgate | Footbridge silhouette, buses, busy transport junction |
| New Market | Entrance landmark, market awnings, stalls, shopping crowds |

The user's visual contribution can cover previews, palettes, landmark assets, scenery composition, and visual QA. Coordinate map schema, spawning, collisions, and event integration with the relevant developer. Confirm ownership with the team; the split below is a proposal.

## Suggested team responsibilities

| Member | Suggested scope |
| --- | --- |
| PM | Requirements, backlog, acceptance criteria, documentation, presentation |
| User | UI/UX, responsive screens, HUD, map previews, environment art direction, visual QA |
| Developer 2 | Player controls, combat, collisions, difficulty, win/lose behavior |
| Developer 3 | Map integration, events/weather, storage, loading, performance |

## Validation and course evidence

- No fresh game run, build, or tests were performed during initial analysis. This copy had no installed `node_modules` at inspection time.
- Saved screenshots were reviewed as historical evidence only.
- Verify at 1280×720 desktop, 1024×768 tablet, 844×390 landscape phone, and 390×844 portrait setup; also smoke-check 1920×1080.
- For UI changes, capture before/after screenshots and record acceptance checks, accessibility checks, and relevant test results.
- Use the contribution guide's required checks when preparing a PR. Do not claim FPS targets without measuring on suitable devices.
- Keep short design rationales and requirement references to demonstrate the user's individual course contribution.

## Session history

### 2026-11-14 — Initial analysis and documentation

- Reviewed code structure, updated SRS, existing design rules, audit reports, and selected historical screenshots.
- Identified frontend usability priorities and map rendering limitations.
- Flagged player movement as a gameplay dependency and the separate ProLink document as a documentation mismatch.
- Created workspace `AGENTS.md` and this work log at the user's request.
- No application code changed. Documentation-only update; no runtime tests required for these additions.

### 2026-11-14 — Fresh runtime UI baseline

- Installed the locked dependencies with `npm ci --no-audit --no-fund`. The initial sandboxed install failed on DNS and its cleanup interfered with the first successful install; repeated installation after it exited, moved stale `.next` to `/private/tmp/pera-next-stale-20261114`, and restarted successfully.
- Running `npm run dev -- --hostname 127.0.0.1` at http://127.0.0.1:3000. Startup and lobby loaded; Start Run rendered the Mirpur scene. Pause and Resume showed the expected state changes.
- Fresh browser evidence: `docs/screens/baseline-2026-11-14/` contains lobby captures at 1280×720, 1024×768, 844×390, 1920×1080; portrait rotation prompt at 390×844; gameplay at 1280×720 and 844×390. These are live captures, not historical audit screenshots or deterministic animation tests.
- Confirmed desktop scroll trap: after a three-page downward scroll, the map heading still had top=1320 at viewport height=720. Lower setup options remain off screen. Landscape phone initially shows essentially the header, daily challenge and fixed launch bar.
- Confirmed portrait setup is covered by the global rotation overlay (dismissal option exists).
- Gameplay visual findings: large flat background band, tangled character limb silhouettes, and crowded lower HUD/dock/ticker. At 844×390 the ticker overlaps the stamina region and controls occupy substantial space; no precise area or FPS claim was measured.
- Clicking Lobby in the pause menu left the pause overlay visible in subsequent observations; reloading restored the lobby. Follow-up needed before claiming reliable pause-to-lobby navigation.
- No application source edits. Next dev generated application-root `AGENTS.md`; dependency/cache/generated development files and screenshots were created. This extracted copy has no Git repository.
- Production build, lint, typecheck, unit/e2e suites, camera/upload, all modals, complete gameplay outcomes, keyboard/touch reachability and real-device performance were not tested: this session was a runtime UI inspection, not an implementation/PR validation pass. Existing roadmap tickets remain unchecked.

### 2026-11-14 — Focused lobby scrolling fix

- Changed only the lobby wrapper in `src/components/shell/AppShell.tsx`: `min-h-screen` → `h-dvh`, added `overscroll-contain` and `scroll-pb-28`. Existing `pb-28` keeps end-of-page content clear of the fixed launch bar; scroll padding also reserves room when keyboard focus brings controls into view.
- Fresh browser verification: scrolling now reaches map/loadout and the final disclaimer; keyboard Tab between map buttons and Shift+Tab between projectile choices brings controls above the launch bar. Map-heading bounds checks through the browser Playwright API passed: top=190/720 at 1280×720, 17/390 at 844×390, 214/768 at 1024×768, 370/1080 at 1920×1080 (top/viewport-height).
- Screenshots: `docs/screens/v2/00/final/{1280x720,844x390,1024x768,1920x1080}.jpg`, plus `844x390-loadout.jpg`. Earlier baseline captures provide before evidence. Initial desktop wheel review was followed by keyboard and responsive review; no visual redesign or gameplay changes.
- `npx tsc --noEmit` and `npx eslint src/components/shell/AppShell.tsx` passed (exit 0).
- Additional checks: all 37 Vitest tests passed; pattern check passed with no new violations. `npm run spec:verify` failed on two existing missing `docs/v2-audit-and-plan` references in `docs/OVERNIGHT_RUN.md:3` and `docs/overnight/BUILDER_PROMPT.md:10`; neither file was changed by this fix.
- Physical touch gestures are not verified; V2-00 remains unchecked in the roadmap until that acceptance step is complete. Portrait's existing rotation prompt remains a separate follow-up. No new automated test was added for this one-line CSS fix; browser bounds checks and screenshots exercise the actual result.
- No branch/commit: this workspace is an extracted copy without `.git`. No production build or full lint run for this focused CSS change.

### 2026-11-14 — Portrait setup

- Moved `OrientationGuard` from the global `src/app/layout.tsx` into the PLAYING/PAUSED branch of `src/components/shell/AppShell.tsx`. Boot, lobby, and results no longer mount the overlay. A new run mounts a fresh guard, preserving its existing portrait override and resize behavior.
- Fresh browser checks at 390×844: boot and lobby accessible without dismissal; map controls reachable by keyboard; Start Run shows rotation guidance; portrait override permits gameplay and pause. At 844×390 the prompt is absent. Reloading into portrait setup again left the lobby unobstructed.
- Screenshots: `docs/screens/portrait-setup-2026-11-14/{lobby,maps,gameplay-prompt}.jpg`. This was a focused behavior fix; existing dense copy and typography remain for lobby polish.
- TypeScript, lint on both changed files, and all 37 unit tests passed. No new dependencies or tests. Full build, full lint, real-device touch, and a complete run through results were not tested. Results exclusion is verified by source placement, not a runtime result-screen capture. Existing spec-reference failures from the prior session remain outside this change.

### Standing documentation requirement — 2026-11-14

- User requested a Markdown record every time changes are made. Updated workspace `AGENTS.md` to require this log for every change, including small code, configuration, and documentation edits, before handback.
- Each entry records changes, affected files, decisions, validation, and remaining issues. The scrolling and portrait-setup changes are already recorded above.
- Validation: documentation-only update; no application tests needed.

## Next action

### 2026-11-14 — GitHub frontend branch

- Confirmed through GitHub API that the authenticated collaborator has push permission and the default branch is `master`.
- Created remote branch `feat/frontend-ui-ux` from `master` at `29086b70b9a700ac9c1e2c0a4638a023817f117f`; GitHub returned the matching ref and commit as creation evidence.
- Updated this work log only locally. Existing application folder remains an extracted copy without `.git`; its frontend changes have not been committed or pushed. No application tests run because this task only created a remote ref and recorded it.

### 2026-11-14 — Frontend checkout and lobby hierarchy

- Cloned `hamzahossainX/pera-nai-chill` branch `feat/frontend-ui-ux` at `29086b7` into `pera-nai-chill-frontend/`. Comparing it with the extracted folder revealed substantial newer gameplay; retained the complete remote source and transferred only orientation/scroller behavior. Original folder preserved. A temporary copied `.git` used for comparison was moved out of the backup. No commits, pushes, or PR created.
- Changed `src/components/shell/AppShell.tsx`, new `Lobby.css`, `src/app/layout.tsx`, `src/components/lobby/{VillainPreview,MapSelector,FaceUploader,WeaponSelector}.tsx`, and `src/components/game/DailyChallengeCard.tsx`. Villain/routes now lead; face/loadout and name/time/weather/crime are optional disclosures. Added semantic selection buttons, pressed state, visible focus, 48px targets, readable labels, reduced-motion preview, and current villain/route summary. Preserved remote TouchControls and shared GameHost lifecycle.
- Compact daily banner retains its existing action/reward behavior. No changes to gameplay, storage, map data, or unlock prices. Character art and optional panels are reused; this is not the full V2-23 Home/stepper.
- Updated root `AGENTS.md` checkout path, `docs/DECISIONS.md` (DEC-013), `docs/ROADMAP.md`, and this log. Regenerated `docs/spec/API_FACTS.md`: only date and UI file inventory/line counts changed. Next regenerated `next-env.d.ts` during development/build. Added repeatable browser check `scripts/audit/lobby-polish.mjs`.
- Fresh runtime evidence: `docs/screens/lobby-polish-2026-11-14/{round-1,round-2,final}/`. Browser checks at 1280×720, 1024×768, 844×390, 390×844, 1920×1080 cover no horizontal page overflow, visible main controls at least 48×48, route selection and footer summary, keyboard villain selection, optional name/weather/face/loadout reachability, focused projectile above launch bar, actual Phaser launch, and portrait guidance only after launch. Isolated headless Brave; no FPS claim or deterministic gameplay timing claim.
- Review fixes: overlapping puppet badges, narrow optional loadout columns, cramped navigation icons, and excess initial spacing. Scoped UI review notes in `docs/reviews/lobby-polish-2026-11-14.md`.
- Validation: TypeScript, full lint, 98 unit tests, pattern ratchet, and production build passed. Spec verification retains two pre-existing missing `docs/v2-audit-and-plan` references in `docs/OVERNIGHT_RUN.md:3` and `docs/overnight/BUILDER_PROMPT.md:10`. Existing full gameplay e2e suite not run: this change used focused frontend browser checks and unit tests.
- Not verified: physical-device touch, camera/file upload processing, all modal interactions, completed gameplay outcomes, measured contrast across legacy optional panels, performance/FPS, and independent design approval. Reduced-motion verified by implementation and browser capture mode. Full project a11y and V2-23 remain open.

## Next action (active checkout)

Review the simplified lobby on a physical phone (portrait setup and landscape touch/scroll), then prepare the frontend PR after addressing the existing spec-reference check failures. Continue HUD cleanup after that review.


### 2026-11-14 — Face selection first (user follow-up)
- Moved FaceUploader out of the lower disclosure and into the first visible setup section, above villain and route selection, in `src/components/shell/AppShell.tsx`. Updated intro and disclosure copy; loadout stays optional below. No upload/camera logic changed.
- Updated `docs/DECISIONS.md`, `docs/ROADMAP.md`, and `scripts/audit/lobby-polish.mjs` for the new order. The browser check asserts that মুখের ছবি is the first setup heading.
- Validation: TypeScript and lint on changed source/check script passed. Fresh browser checks passed at all five reference sizes, covering ordering, selection, keyboard reachability, 48px controls, no horizontal overflow, and launch. Screenshots/checks: `docs/screens/lobby-polish-2026-11-14/face-first/`; portrait screenshot visually inspected.
- Full build and unit suite not repeated for this component reorder; prior full results remain historical. Actual camera/upload processing and physical touch remain unverified. No commit/push.
- Next action: review face-first setup on a physical phone, then prepare the frontend PR after resolving the existing spec-reference failures.

### 2026-11-14 — Compact face-first section
- User requested a shorter, space-efficient face section. Updated `src/components/lobby/FaceUploader.tsx`, `src/components/shell/AppShell.tsx`, and `src/components/shell/Lobby.css`: 64px avatar, compact horizontal desktop row, two-column action grid on phones, short Bangla action labels, and crop control beside the other actions. Full crop-editor area remains available; processing logic unchanged.
- Fresh visual review of desktop and portrait captures confirms a much shorter panel with villain content appearing sooner. Browser checks passed at all five reference sizes (ordering, no page overflow, 48px controls, keyboard selection/reachability, and launch). Evidence: `docs/screens/lobby-polish-2026-11-14/face-compact/`. TypeScript and lint on changed TSX passed; `git diff --check` passed.
- Full build/unit suite not repeated for this presentation-only update. Camera/upload processing and physical-device touch remain unverified. Updated DEC-013 with compact layout decision; no commit/push.
- Next action: review compact face-first setup on a physical phone, then prepare the frontend PR after resolving existing spec-reference failures.

### 2026-11-14 — Gameplay villain face visibility
- User screenshots show the uploaded photo in lobby/HUD but almost fully covered on the gameplay Phone Snatcher. Source inspection confirmed full-size mask accessories layered over a 58px face; procedural fallback masks were 74×34 and 74×44 at y=-14/+14.
- Added optional per-outfit face-accessory dimensions in `src/config/outfits.ts`, configured only for Phone Snatcher: upper 64×20 at y=-28, lower 64×24 at y=28. `src/game/entities/CharacterRig.ts` applies those display dimensions/positions, independent of raster resolution. Lower-mask slip now moves 12px down from its configured resting position, retaining the previous target for outfits without overrides. Hood, uploaded texture, collisions and gameplay rules unchanged.
- Followed bundled Phaser sprites-and-images guidance. Added `scripts/audit/face-visibility.mjs`; fresh full-health screenshots at 1280×720 and 844×390 in `docs/screens/face-visibility-2026-11-14/` visually confirm visible eyes/nose/mouth with default face texture. User's actual cat photo was not copied or re-uploaded; source uses the same target-face path.
- Validation: TypeScript, lint on changed files/script, 98 unit tests, pattern check, and diff whitespace check passed. Full build/full gameplay e2e not repeated for the narrow visual fix. Mask-slip/fall animation preserved by source inspection, not runtime verified: existing setHealth debug command resets maximum HP too, so attempted lower-health captures did not exercise those stages and were discarded. Physical device and actual uploaded-photo run remain unverified.
- Updated DEC-014 and roadmap V2-07 note; broader character rig/limb issues remain separate. No commit/push.
- Next action: reload and start a fresh run using the user's uploaded face to confirm visual acceptance, then continue pending HUD/character readability work.

### 2026-11-14 — Commit/push/PR preparation
- User explicitly requested commit, push, and PR. Reviewed complete frontend diff on `feat/frontend-ui-ux`; remote branch and master remain at `29086b7`, with no existing PR.
- Clarified two historical branch references in `docs/OVERNIGHT_RUN.md` and `docs/overnight/BUILDER_PROMPT.md` as `refs/heads/docs/v2-audit-and-plan`. These are Git refs, not filesystem paths; spec verification now passes without weakening its checker. Regenerated `docs/spec/API_FACTS.md` and removed an extra blank line in FaceUploader.
- Final checks passed: TypeScript, full lint, all 98 unit tests, pattern check, spec verification (429 references), production build, and diff whitespace check. Earlier browser screenshots/checks remain the evidence for final compact layout and face visibility; no new browser run needed for branch-reference documentation and whitespace changes.
- PR scope: compact face-first lobby, optional setup, responsive/keyboard/readability improvements, portrait setup, villain face framing, documentation and browser evidence. Full gameplay e2e, real-device touch, actual photo upload and mask-slip runtime remain unverified as described above.
- Next action: push the reviewed commit and open a PR against master; leave merging to a separate request.
