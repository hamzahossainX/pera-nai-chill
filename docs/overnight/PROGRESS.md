# PROGRESS — overnight heartbeat (builder appends; newest at bottom)

| time (`date -Is`) | elapsed | ticket | state | last gates | next action / notes |
|---|---|---|---|---|---|
| 2026-11-13T14:24:21+06:00 | 0h | — | bootstrap | — | Start overnight run on branch `v2/build` |
| 2026-11-13T15:00:11+06:00 | 0.6h | — | baseline | tsc ✅ · lint ✅ · test ✅ (37/37) · pattern:check ✅ (P01=63, P02=5, P03=18) · spec:verify ✅ (410 refs) | Headless GL measured at rAF fps=15 (Software GL detected). Playwright chromium installed. Ready for V2-00. |

### V2-00 → started 2026-11-13T15:12:46+06:00
Plan:
1. Fix lobby container in `src/components/shell/AppShell.tsx`: change `min-h-screen` to `h-dvh max-h-dvh overflow-y-auto` with `tabIndex={0}` to constrain height to viewport and allow scrolling via wheel, touch, and keyboard.
2. Fix `e2e/smoke.spec.ts` tap-to-start locator wait.
3. Add `e2e/lobby-scroll.spec.ts` to test at 1280x720, 1920x1080, and 844x390 that scrolling (wheel, touch, keyboard) reduces `map.getBoundingClientRect().top` to < viewport height.
4. Capture screenshots for evidence under `docs/screens/v2/00/`.
5. Run all gates: tsc, lint, test, pattern:check, spec:verify, playwright test.
TOUCH:
- `src/components/shell/AppShell.tsx`
- `e2e/smoke.spec.ts`
- `e2e/lobby-scroll.spec.ts`
- `docs/screens/v2/00/*`
- `docs/overnight/evidence/V2-00.md`
DON'T TOUCH:
- `src/game/**`, `src/store/**`, `src/config/**` (other than standard doc updates)

| 2026-11-13T16:08:00+06:00 | 1.7h | V2-00 | done | tsc ✅ · lint ✅ · test ✅ (37/37) · build ✅ · playwright ✅ (8/8) · pattern:check ✅ · spec:verify ✅ | Completed V2-00. Tagged v2-00-done. Next: V2-01.
