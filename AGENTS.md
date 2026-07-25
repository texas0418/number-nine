# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# What this app is

Number Nine: a DEVICE 6-style typographic horror novella (six "Broadcasts",
chapter one free, one IAP unlocks the rest) plus a free daily numbers-station
cryptogram ("Tonight's Signal") that serializes a prequel. Dark-only by
design. Portrait-locked by design — rotated/mirrored TEXT makes the reader
turn the phone; the OS orientation never changes. Audio is atmosphere, never
load-bearing: everything must stay playable with sound failed open.

- Story chapters are data (`src/chapters/*.ts`) rendered by the engine
  (`src/engine/`). Gates (radio, fork) stop the scroll until solved.
- The nightly cipher is pure math in `src/daily/` — a FRESH substitution key
  per calendar day, deterministic from the day key so all players share the
  puzzle. Never let a fixed key ship: that kills the game after day one.
- Pure modules (models, dbCore, daily/*) take no expo imports so Node can
  test them (`npm test`).

# Git workflow (PR-based CI)

`main` is what ships; `dev` is the integration branch. Never commit directly to either.

1. Start every session by branching off `dev`: `git fetch origin && git checkout -b <topic> origin/dev`. Prefer an isolated worktree (`git worktree add`) when other sessions may be active.
2. When the work is done and `npm run typecheck`, `npm run lint`, and `npm test` pass locally, push and open a PR into `dev` with `gh pr create --base dev`. CI runs typecheck, lint (with cyclomatic-complexity and function-length limits), the pure-module tests, a banned-phrase slop check (`scripts/ci/slop-check.sh`), and gitleaks secret scanning.
3. Do not merge your own PR unless Simon says to; report the PR URL and CI status at the end of the session.
4. Batches of work on `dev` get promoted by a PR into `main` (ask Simon first). That runs the deeper promotion checks, including `expo-doctor`.

# Cross-session memory (GitHub Issues)

To-dos, bugs, and session handoffs live in GitHub Issues, not in README checklists or scratch files.

- Check open issues at session start: `gh issue list --state open`.
- File bugs you find but don't fix as issues; close issues you resolve, referencing the PR (`Closes #N` in the PR body).
- For handoffs, write a dense, self-contained issue comment optimized for LLM ingestion: current state, exact file paths, what was tried and rejected (and why), and the next concrete step. Assume the reader has zero conversation context.
- Pre-ship checklist items carry the `pre-ship` label.
