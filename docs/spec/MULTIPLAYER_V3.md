# MULTIPLAYER_V3.md — "Hunt Mode": 2 hunters vs 1 human target, with a countdown (PARKED · next scope)

**Status:** **PARKED — NOT part of V2.** Recorded 2026-11-13 from the owner's request so the idea is not lost and V2 does not block it. **Do not build any of this until V2 reaches M6 (release) and the owner re-opens it.** The only things allowed *now* are the three cheap forward-compat constraints in §8.
**Owner's words (paraphrased from Bangla):** two players connect and chase/beat **one target player**; the target has a life bar; the hunters share a life or a **timer the user can choose** (2, 3, 5 … 10 … up to 50 minutes); if the hunters can't beat the target within the time, **the hunters lose**; the target keeps **moving and dodging in many ways**.

---

## 1. Concept

| Role | Count | Controls | Goal | Loses when |
|---|---|---|---|---|
| **Hunters** (chasers) | 2, co-operative | the existing chaser kit (lanes, dash, jump, slap/punch/kick/chappal) | bring the target's HP to 0 (or trigger the pile-on finisher) before time runs out | **timer reaches 0** *or* the hunters' shared life pool (§3) hits 0 |
| **Target** (the "thief") | 1 human | an *evasion kit* (§4) instead of an AI | survive until the timer ends *or* drain the hunters' life pool | target HP reaches 0 |

Variants (ship in this order):
1. **V3-a Local shared-screen** (no network): 2 hunters on one device (split keys / split touch halves) vs AI target **with the timer** — cheapest, proves the mode, needs only the `ControlSource` abstraction.
2. **V3-b Online co-op vs AI target:** 2 friends online, AI target + timer.
3. **V3-c Online 2 hunters vs 1 human target** (asymmetric, the owner's full idea).
4. (Later) human target vs AI hunters; 1v1; party sizes — only if V3-c is fun.

## 2. The timer (owner requirement)
- Presets: **2 · 3 · 5 · 10 min**, plus a **custom** slider (1–50 min, step 1; hard cap 60). Default 5.
- The timer is a **run rule**, not a hard-coded mode: `RunRules.timeLimitSec: number | null` (also usable single-player as "Time Attack").
- Countdown HUD top-centre (distance bar is replaced by a clock in this mode); last 30 s: red pulse + ticking SFX (respect Calm mode: no pulse, steady tone).
- **Longer timers need pacing** or 50 minutes will be boring/unfair: with timers ≥ 10 min the target's HP scales (`hpScale × (1 + 0.15 × (min−5)/5)` capped ×2.5) and **escalation waves** begin every 2 minutes (more hazards, crowd mood events, a boss-NPC appearance). Numbers to be tuned by the balance bot (V2-40a) — placeholders only.
- Timer expiry = hunters lose ("সময় শেষ! চোর পালাইছে!"); target-HP-zero = hunters win → pile-on finale + police stamp (existing).

## 3. Lives
- Hunters share **one life pool** = their combined Patience (V2 system): each hunter has own Patience; the shared pool = sum/2 displayed as one bar; a hunter at 0 is "winded" for 8 s (revive by the partner standing close for 2 s) — cooperative mechanic; both winded = lose.
- Target has **HP** (scaled by hunter count and timer) and **stamina** for evasion moves.

## 4. The target's evasion kit ("বিভিন্নভাবে মুভ টুপ দিতে থাকবে")
| Move | Effect | Cost / counter |
|---|---|---|
| Lane switch | instant (tween 140 ms, 120 ms i-frames) | stamina 5 |
| Sprint burst | +45 % speed for 0.8 s | stamina 25, CD 4 s |
| Vault/dive behind a vehicle | unhittable 0.6 s, shortens hitbox after | CD 6 s, telegraphed shadow |
| Drop banana/hazard behind | hazard in hunters' lane (telegraphed for fairness) | CD 8 s, 2 charges |
| "Crowd distraction" | triggers a reaction scenario (`S6` rickshaw block / `S1` pointers to the *wrong* lane) | CD 20 s; hunters can see through it after 1 s |
| Fake-out dodge | dodge roll (existing `dodgeRate`, now button-driven) negates one hit | CD 5 s |
| Taunt | drains hunters' Patience slightly if they react wrongly (comedic bubble) | CD 12 s |
All use the existing `EntityMotion` channels (no direct position writes). Every move has a **telegraph** and a **counter** (same design law as hazards).

## 5. Networking architecture — **LAW-level decision (needs owner OK before V3)**

| Option | Gameplay server? | Pros | Cons | Verdict |
|---|---|---|---|---|
| **A. WebRTC data channels, host-authoritative, tiny signalling** (room code; signalling via Vercel function or Supabase Realtime) | no (signalling only, stateless) | cheapest, low latency, photos/faces never touch a server | NAT traversal edge-cases (needs TURN for ~10–15 % of pairs), host can cheat (fine for friends) | **recommended** |
| B. Authoritative WebSocket game server | yes | cheat-proof, simple clients | hosting cost, ops, latency, conflicts with DEC-003 spirit | no |
| C. Lockstep deterministic | no | tiny bandwidth | Phaser sim not bit-deterministic across devices/browsers; desync risk | no |
| D. Local shared-screen only | no | zero infra | no remote play | do first (V3-a) |

**Model for A:** the *host* runs the simulation; clients send **input commands** (`{tick, laneDelta, dash, jump, attack, ...}`) at 30 Hz; host broadcasts **snapshots** (positions, hp, patience, timers, NPC seeds+events not NPC positions) at 15–20 Hz; clients interpolate ~100 ms behind; crowd/NPC cosmetics are *derived locally* from the shared seed + event log (no per-NPC sync). Reconnect: 10 s grace, then AI takes over the disconnected role. Max latency target: playable ≤ 150 ms RTT.
**Cost note:** a free STUN set is fine; **TURN relay has a running cost** → decision for the owner (budget, or accept "some pairs can't connect, show a friendly message").

## 6. Privacy, safety & trust (non-negotiable)
- **The target's face is the target player's own, chosen by them** — consent by construction. Hunters cannot choose someone else's face in multiplayer.
- Faces cross the wire **only peer-to-peer**, only after both sides tap "share my cartoon face" for *this match*, as a small cartoonified texture (never the original photo); default = generic cartoon avatars. Nothing is stored server-side; signalling carries only SDP + room code.
- **No free-text chat and no voice chat.** Communication = preset funny emotes/shouts from the existing voice catalogue (pool-based, PG). No strangers' matchmaking in V3 — **friends only via room code** (no moderation burden, child-safety by design).
- The pile-on finisher rules (CROWD §9.3) apply unchanged; in multiplayer the target is a **cartoon** avatar and the finale must never single out a real person's photo (Friendly mode for exports stays default ON).
- Room codes: 6 chars, expire after 10 min idle; rate-limited signalling endpoint.

## 7. UX sketch
Home → "Hunt Mode" → choose **role** (Hunter / Target) → **Local | Online (room code / invite link)** → **timer** (presets + slider) → map & dialect (host picks, shared) → Ready check → countdown 3-2-1 → play → Result (who won, time left, MVP emote, rematch). Lobby shows each player's cartoon avatar, role, ping.

## 8. Forward-compat constraints the **V2 builder must honour now** (cheap, already ticketed)
1. **`ControlSource` abstraction (V2-03):** player input is produced by a `ControlSource` (`KeyboardTouchSource`, `BotSource`, later `RemoteSource`/`AiTargetSource`) that emits typed **input commands**; gameplay never reads the keyboard/touch directly. (The V2-40a bot already needs this.)
2. **`RunRules` data (V2-06):** `{ mode: "stage" | "timeAttack" | "hunt", timeLimitSec: number | null, lives: …, winCondition: … }` — stage mode uses `timeLimitSec: null`. V3 only adds new rule values.
3. **Determinism & state exposure (V2-01/02 already):** seeded `rng`, fixed-step `step(ms)`, serializable `getState()`, `EntityMotion` channels, no gameplay in React.
Anything beyond these three is **forbidden in V2** (no networking code, no room-code UI, no dependencies).

## 9. Ticket sketch (after M6; sizes rough)
V3-00 `RunRules` timer + Time-Attack single-player (S) · V3-01 local 2-hunter shared-screen (M) · V3-02 target evasion kit + `AiTargetSource` upgrade (M) · V3-03 signalling + WebRTC transport + host-authoritative sync (L) · V3-04 lobby/room-code UI + ready check (M) · V3-05 human-target mode & role balance via bots (L) · V3-06 reconnect/AI takeover (M) · V3-07 emotes/voices wiring (S) · V3-08 privacy flows (face share opt-in) (S) · V3-09 playtests & balance (M). **Estimate ≈ 25–30 builder-days**; needs a signalling endpoint (Vercel function) and a TURN decision.

## 10. Open questions for the owner
1. Asymmetric 2-v-1 first (your idea) or co-op vs AI first? *(Recommended: local shared-screen → co-op vs AI → human target.)*
2. Is **friends-only via room code** acceptable (no random matchmaking)?
3. Timer cap: 50 minutes is allowed — fine, with escalation waves (§2)?
4. Budget/OK for a small signalling function and possibly a TURN relay, or accept "some connections fail"?
5. Should the **target** also be able to win by outlasting the timer *without* ever fighting (pure evasion)? *(Default: yes.)*
