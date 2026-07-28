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

# Design doctrine

Read DESIGN.md before touching the engine or writing chapter data. The two
laws: typography is ARCHITECTURE (every rotation/mirror/fork is diegetic —
text turns because the story's space turns, never for style), and it's a
BOOK, not an app (justified serif, room labels, thoughts as centered
italics, whitespace as fear, wrong answers get atmosphere not error copy).

# Puzzle mechanics palette for Broadcasts Two–Six (Simon, 2026-07-27)

Beyond codes: later broadcasts should draw on MATH, other puzzle logic, and
the PHONE'S PHYSICAL ABILITIES. The device is a haunted instrument.

- Math/logic: frequency and date arithmetic, modular/clock math (very
  numbers-station), logic-grid deduction, sequences; answers computed, never
  found. Rule COMPOSITION (B1's tin box / MARGARET pattern) stays the model.
- Sensors (expo-sensors, all fail-open with an accessibility fallback path):
  gyroscope/accelerometer — physically ROTATE the phone to turn a dial or
  level a bubble; face the phone DOWN to read something on the "back" of a
  page; tilt to pour/align; shake. Magnetometer — face the aerial north.
- Display: brightness (expo-brightness) — a message visible only with the
  lamp "turned down" (screen dimmed) or full bright; contrast/afterimage
  tricks in the art.
- Haptic-only Morse: codes you FEEL, not see or hear; count the knocks.
- Time-of-day: the station keeps schedule — something is only true at 23:14.
- Rotation typography (already in engine): extend to content that changes
  when the device is physically inverted.
- Constraints: no permission-hungry mechanics (mic/camera only with a strong
  reason), every hardware puzzle needs a fallback for motor/vision
  accessibility, and everything stays fail-open + offline.

# Puzzle doctrine (Simon's bar: DEVICE 6 took him DAYS on some puzzles)

- ONE code-entry puzzle per broadcast, maximum, from Broadcast Two onward
  (Simon, 2026-07-28). "Code-entry" = anything where the answer is typed on
  a keypad/letter pad (keypad, safe, cipher). Every other gate must be a
  different act: hardware/sensor, ear/touch echo, observation, analog
  manipulation, deduction expressed through a widget that is not typing.
  B1 predates the rule and keeps its ten gates.
- Difficulty ramps PER BROADCAST (Simon, 2026-07-28): each broadcast must be
  measurably harder than the one before — more rules composed, clues
  scattered further (including into EARLIER broadcasts and the daily
  signal), less prompting. B1 ends at two composed rules; B2's finale
  composes three; B6 should demand a full notepad and cross-chapter
  archaeology. Never make a later broadcast's opening gate easier than the
  previous broadcast's finale.

- A gate's answer never appears within three blocks of the gate (tested in
  test-models.ts). Clues live far away, ideally in a different chapter region.
- Every gate needs >= 2 scattered clues, at least one cross-modal (a logbook
  artifact, an audio detail, a visual property of the text like mirroring).
- Never explain the trick in prose. The reader gets nudges, not instructions.
  Wrong answers get atmosphere (static, a dead line), never an error message.
- Difficulty ramps: Broadcast One gates are minutes; later Broadcasts should
  demand a notepad and real cross-referencing (days-energy, not minutes).

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
