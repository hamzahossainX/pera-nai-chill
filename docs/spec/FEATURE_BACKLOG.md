# FEATURE_BACKLOG.md — Features the architect recommends (beyond the owner's brief)

**Status:** PROPOSAL v1 (2026-11-13). Prioritised with MoSCoW. **Nothing here is built.** "Must" items are already ticketed (V2-31…V2-36, packets in `docs/spec/TICKET_PACKETS.md`; V2-37a/b add the F-01 consent gate + F-12 Calm mode; V2-38/39 add dialects); the rest wait for owner `[CONFIRM]`. Effort: S ≤ 1 day · M ≈ 2–3 days · L ≈ week. Risk = chance it hurts schedule/quality.
**Selection principles:** fits the pillars (chase-not-mash, a place not a backdrop, formal craft + funny content) · works offline/client-only (STACK §5) · no new accounts/servers · respects privacy.

## MUST — part of the V2 scope now (owner asked or required by it)

| ID | Feature | Why | Effort | Ticket |
|---|---|---|---|---|
| F-M1 | **Crowd/NPC system** (ambient stories + reactions) | owner brief; the joke engine | L | V2-31, V2-32 |
| F-M2 | **Pile-on finisher** (cartoon fight cloud → Havildar Mama → "থানায় চালান!") | owner brief, signature moment | M | V2-33 |
| F-M3 | **Voice system** (clips → robot TTS → babble) + 124-line catalogue | owner brief | L | V2-34, V2-35 |
| F-M4 | **Innocent-bystander rule** (hit a wrong person → mood turns on you) | makes crowd a *mechanic*, adds stakes | M | V2-32 |
| F-M5 | **Cricket-commentary announcer** (Bangla parody) | uniquely Bangladeshi, funny, reuses voice system | S | V2-36 |
| F-M6 | **Map living-street scenarios** for all 8 maps | owner brief ("each map a scenario") | L | V2-17…V2-22 |

## SHOULD — recommended next (high delight / low risk)

| ID | Feature | What it is | Why | Effort | Risk |
|---|---|---|---|---|---|
| F-01 | **Face-consent gate & "Friendly mode"** | one-time screen before photo upload: "Use only your own or a friend's face with permission. Photos never leave your device." + default to cartoon caricature; a toggle to replace any uploaded face with a generic cartoon in *shared* images | the mob finisher makes a real face the butt of a joke — responsible-design guard; also protects the project's reputation | S | low |
| F-02 | **Viral meter** *(built inside V2-32)* | neutral NPCs film combos → bonus Taka (CROWD §8) | rewards stylish play, uses crowd | S | low |
| F-03 | **Rickshaw ride-on power-up** | grab an abandoned rickshaw: 4 s of fast auto-run; rickshawala shouts ("মামা সাইড দেন!"), lane-change still works | classic Dhaka image, closes the gap, a "mount" verb | M | med (rig/physics) |
| F-04 | **Alley & footbridge shortcuts** | per-map side lane/stairs that skip hazards but cost patience if crowded | route choice = skill expression | M | med |
| F-05 | **Tea-stall "adda" checkpoint** | stop-in power-up: patience +20 while the crowd cheers (and a scripted joke) | pacing + comedy | S | low |
| F-06 | **Highlight clip / GIF export** | record the last 6 s via `canvas.captureStream()` → local WebM download | shareable, offline, no server | M | med (browser support) |
| F-07 | **Meme-card maker** (extends the existing Wanted-poster PNG export) | stickers/frames (Bangla captions "ধরা খাইছে!") on a screenshot; strictly local | virality without servers | M | low |
| F-08 | **Daily Dhaka challenge v2** | seeded daily map+weather+villain with a fixed modifier (e.g. "no dash today") — use `?seed` RNG | retention, deterministic = testable | M | low |
| F-09 | **Regional dialect packs** | Chattogram (Cox's Bazar), Sylheti (Sreemangal/Haor), Dhakaiya (Old Dhaka) lines — **native speakers only** | cultural richness, differentiation | M (content) | med (quality, respect) |
| F-10 | **Haptics** | `navigator.vibrate` pulses on hit/mob (mobile, behind setting) | feel | S | low |
| F-11 | **Achievements for the crowd** | "এক ধাক্কায় ১৫ জন" (mob), "ভুল মানুষ" (innocent hits), "সিনেমা ডিরেক্টর" (viral ×3) | ties meta to new systems; reuse `AchievementsModal` | S | low |
| F-12 | **Calm mode (a11y)** | reduces crowd density, replaces mob shouts with one "ঠাস!", no flashes/shake, voice off | accessibility & sensory safety | S | low |
| F-13 | **Replay of the finisher** | instant slow-mo replay of the mob + police stamp from a second angle on the Result screen | payoff moment, cheap (re-run recorded timeline) | M | med |

## COULD — nice if time allows

| ID | Feature | Note |
|---|---|---|
| F-14 | **Local 2-player "race to catch"** (shared screen, 2 chasers, one villain) | high fun, but needs input remap + balance; defer |
| F-15 | **Eid / Pohela Boishakh seasonal skins** (limited-time Setup theme: panjabi villain, mangal-shobhajatra masks as NPC props) | date-driven config, no code deploy; respectful tone |
| F-16 | **Weather-reactive crowd** (umbrellas on rain, hand-fans in heat) | cheap extension to `activityWeights` |
| F-17 | **Character "mama" helpers** (call-in: Havildar blocks a lane for the villain once per run) | adds a strategic resource |
| F-18 | **Photo mode** (pause + free pan 1 s + filter frames) | extends F-07 |
| F-19 | **Sticker-pack unlocks per map** (collect map-specific props) | gives maps completion goals |
| F-20 | **Bangla numerals / Bangla-first toggle** | typographic polish for pure-Bangla users |

## NEXT SCOPE (parked, owner-requested 2026-11-13)
| ID | Feature | Where |
|---|---|---|
| F-V3 | **Hunt Mode multiplayer** — 2 hunters vs 1 human target, selectable timer, evasion kit, local then online (friends-only) | `docs/spec/MULTIPLAYER_V3.md`, ROADMAP "Next scope — V3" |

## WON'T (for now) — and why
Online **leaderboards**, random-stranger matchmaking and in-game chat (privacy/moderation; friends-only room codes are the V3 path) · user-uploaded content sharing between players (harassment risk) · real brand/celebrity tie-ins (rights) · gambling/loot-box monetisation · AI-generated NPC chatter at runtime (cost, safety, offline) · voice cloning of real people.

## Cross-cutting safety & trust (applies to all features)
1. **Consent:** any real face → F-01 gate; no face data leaves the device; never put uploaded faces on NPCs.
2. **Tone:** slapstick only; mob always ends with the law punchline (CROWD §9.3); crimes stay petty.
3. **No dark patterns:** no timers pushing spend, no pay-to-win (shop = cosmetics, GAME_PLAN §6).
4. **Respect:** religious/ethnic/political groups are never the joke; Iftar/Eid content reviewed by the owner.

## Recommended build order after the W3b tickets
(F-01 consent gate = V2-37a, F-12 Calm mode = V2-34/37b, F-02 viral meter = V2-32, F-09 dialects = V2-38…V2-41 are already ticketed.) Next: F-10 haptics → F-11 crowd achievements → F-05 tea-stall checkpoint → F-07 meme cards → F-08 daily v2 → F-03 rickshaw ride-on → F-06 highlight clip → F-13 finisher replay → rest.
