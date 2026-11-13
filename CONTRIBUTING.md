# Contributing — Pera Nai Chill (Dhaka Rage Runner)

## Setup
```bash
npm ci
npm run dev        # http://localhost:3000  (add ?debug=1 for the debug bar)
```

## Rules of the road
- **`master` is protected.** Nobody pushes to it directly. Work on a branch, open a Pull Request; only the repo owner approves and merges.
- Branch names: `feat/<short-name>` or, for planned tickets, `t-v2-NN-<slug>` (see `docs/ROADMAP.md`).
- Before opening a PR, run all of these and make them pass:
  ```bash
  npx tsc --noEmit && npm run lint && npm run test && npm run pattern:check && npm run spec:verify
  ```
- Read `docs/spec/README.md` first, then the ticket in `docs/ROADMAP.md`. The specs are read-only — propose changes in the PR description.
- Never commit `.env*` files, keys or tokens. Local tooling folders are git-ignored on purpose.
- Keep PRs small (one ticket / one concern) and include screenshots for UI changes.
