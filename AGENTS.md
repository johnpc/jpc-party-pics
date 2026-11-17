# AGENTS.md — operating rules for agents and humans working in this repo

Read `CLAUDE.md` first (what the app is, how it is wired, the quality gates).
This file carries the rules on top of it.

## 1. There is no such thing as a flaky test

An intermittent failure is a **race in the harness or the app**. The response
is to find the race and remove it — never to re-run until green, add a sleep,
raise a timeout, add retries, or skip the test.

- Playwright runs with `retries: 0`. Keep it that way.
- Steps wait on **real conditions** (an element, an attribute, a URL, a popup,
  a backend event), never on `waitForTimeout`. The camera step, for example,
  polls the `data-recorded-bytes` attribute the app exposes until the
  recorder has produced enough data for the upload to be accepted.
- If a condition is not observable, make the app expose it (a state, an
  attribute, a test hook) rather than guessing with time.
- When a test fails on CI and passes locally, the bug is real: reproduce it
  under the same constraints (fresh profile, slow CPU) and fix the root cause.

## 2. One mode, one owner (explicit state machines)

Every mode/phase/status is a discriminated union written in exactly one place
and catalogued in [`docs/state-machines.md`](docs/state-machines.md). Readers
derive; nobody keeps a parallel boolean. Mark the owner with
`// @state-machine <id>` and add a catalogue row with its tests;
`npm run check-state-machines` fails the build when the two drift or when a
new status-shaped type/boolean `useState` appears without a row.

Timers that flip state (success flashes, "copied" badges) live in effects keyed
on the state so a newer transition or an unmount cancels them.

## 3. The backend is a seam, and CI uses the fake

All network access goes through `src/backend/types.ts` (`Backend`).
`src/backend/index.ts` picks the implementation:

| `VITE_BACKEND` | implementation                                                                      | when                                                |
| -------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------- |
| unset          | `src/backend/amplify/` — AppSync + S3 + zip Function URL                            | production build, `npm run dev`, `npm run e2e:real` |
| `fake`         | `src/backend/fake/` — in-memory + `localStorage`, media from `vite/fakeS3Plugin.ts` | `npm run dev:fake`, `npm run e2e` (default), CI     |

The fake seeds `Demo` (30 photos → pagination), `wedding` (a real JPEG, a
WebM clip, generated photos), `my-event`, and the empty `e2e-test` /
`empty-test-album`. Uploads become object URLs; create/delete fire the same
listeners the components subscribe to, so real-time updates are exercised.
Tests can act as "another guest" via `window.__partypicsFake.injectImage()`.

CI has **no AWS credentials**: the build resolves `$amplify-outputs` to the
committed `src/backend/amplify/outputs.fallback.json` when the generated
`amplify_outputs.json` is absent. Keep every Amplify import inside
`src/backend/amplify/`.

## 4. Verification is done on real devices, not by reading code

UI changes are verified on the Mac mini with Playwright screenshots and
`recordVideo` recordings at desktop and mobile viewports before a PR is
opened; the PR links the evidence. Read the screenshots and judge them.

## 5. Gates are fixed; code moves

`npm run quality` runs every gate (format, lint, unit + coverage, CRAP,
file length, state-machine catalogue, build, e2e). Never raise a threshold,
add an exclusion, or skip a gate to get green. Restructure the code.
