# Contributing — Pera Nai Chill (Dhaka Rage Runner)

## Setup
```bash
npm ci
npm run dev        # http://localhost:3000  (add ?debug=1 for the debug bar)
```

## Rules of the road
- **`master` takes changes through Pull Requests only** (no direct pushes, no force-push). Work on a branch, open a PR, and — once the checks below pass — you can merge it yourself. No approval is required, but a quick look from a teammate is welcome.
- Branch names: `feat/<short-name>` or, for planned tickets, `t-v2-NN-<slug>` (see `docs/ROADMAP.md`).
- Before opening a PR, run all of these and make them pass:
  ```bash
  npx tsc --noEmit && npm run lint && npm run test && npm run pattern:check && npm run spec:verify
  ```
- Read `docs/spec/README.md` first, then the ticket in `docs/ROADMAP.md`. The specs are read-only — propose changes in the PR description.
- Never commit `.env*` files, keys or tokens. Local tooling folders are git-ignored on purpose.
- Keep PRs small (one ticket / one concern) and include screenshots for UI changes.
