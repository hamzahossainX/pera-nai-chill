# OVERNIGHT_RUN.md — Let Antigravity build for hours while you sleep (and what you will find in the morning)

**Written:** 2026-11-13 · **For:** the owner (to launch) and the builder AI (to obey) · **Run length:** as long as it takes, soft budget **10 h** · **Repo branch to start from:** `refs/heads/docs/v2-audit-and-plan` (the plan docs are not on `master` yet).

## 1. Before you go to sleep (5 minutes, owner)

1. **Keep the laptop awake and plugged in.** Fedora/GNOME: Settings → Power → *Automatic suspend: Off* and *Screen blank: Never*; or in a terminal start `systemd-inhibit --what=idle:sleep:handle-lid-switch sleep 13h &` (leave the lid open). Do **not** let it sleep — a suspended laptop stops the run silently.
2. **Let the builder run without stopping at permission prompts.** In Antigravity, set the agent's terminal/file permissions so it can run commands inside this project folder without asking each time (the mode that auto-approves workspace commands). If it still asks, it will stall until you wake up. *(I cannot verify Antigravity's exact settings from here — use whatever its "auto-approve / turbo / always proceed" option is called, scoped to this workspace only.)*
3. Open a **new Antigravity session** in `/home/hamza/Documents/UniverSity/Pera-nai-chill`, paste the short starter from §2, press Enter, and leave it.
4. Do **not** edit files in the repo while it runs.

## 2. How to start — paste ONLY this short message

The long protocol lives in **`docs/overnight/BUILDER_PROMPT.md`** (single source of truth; the builder re-reads it during the run). Paste this into a new Antigravity session:

```text
Read /home/hamza/Documents/UniverSity/Pera-nai-chill/docs/overnight/BUILDER_PROMPT.md in full and execute it exactly, starting now. I am asleep: never ask me questions or stop to confirm. Follow its no-questions, failure and finish rules until its section F is complete.
```

## 3. What you will find in the morning
| File | What |
|---|---|
| `docs/overnight/MORNING_REPORT.md` | **Read this first.** Ticket table, evidence links, gates, balance-bot results, parked items, questions, decisions taken |
| `docs/overnight/PROGRESS.md` | timestamped heartbeat log of the whole night |
| `docs/overnight/evidence/V2-NN.md` | proof per ticket |
| `docs/overnight/PATTERN_AUDIT_*.md` | design-pattern re-checks |
| `docs/overnight/QUESTIONS.md` | decisions the builder needs from you |
| git branch `v2/build` + tags `v2-NN-done` | the code, one tag per finished ticket (revert any single ticket with `git revert`) |

## 4. Your morning checklist (10 minutes)
1. `git log --oneline v2/build -30` and open `docs/overnight/MORNING_REPORT.md`.
2. Try it: `git checkout v2/build && npm run dev` → open `http://localhost:3000/?debug=1` — check: the lobby scrolls and the map picker is reachable; the villain never leaves the screen when you slap him for a minute; you can change lanes/dash/jump; you can *lose* (patience/escape).
3. Nothing else is live: no push, no deploy happened.
4. Come back to the **Claude (judge) session** and say **"re-audit wave 0/1"** — it re-runs the checks, re-scores, and updates `GAME_AUDIT.md`. Only after that merge `v2/build` into your main branch (or tell me to prepare the merge).
5. Answer the items in `QUESTIONS.md`; if any ticket is `⚠ default-assumed`, glance at it first.

## 5. Honest expectations
- A single unattended run can realistically complete **Queue A** (W0 + W1 + bot/balance). It **cannot** judge fun, art, humour or Bangla quality, and it cannot run human playtests — which is why it stops at M1.
- If the machine is on software GL, gameplay timing/fps will be reported as *not measurable*; deterministic fixed-step tests are the substitute. A GPU browser pass remains for you/the judge.
- If Antigravity stops early (context/quota/permission prompt), `PROGRESS.md` + the git tags let a fresh session resume exactly (the prompt's step A.1 handles `v2/build` already existing).
- More hours do not mean more tickets past Queue B on purpose: later waves need your decisions (maps list, art direction, native dialect leads) and the judge's contract approvals.
