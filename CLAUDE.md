# Party Pics

Photo and video sharing app for events. Users create albums, share a link, and guests upload photos/videos from their devices. Built with React + TypeScript + AWS Amplify Gen2.

## Golden Rules

- **NEVER push directly to main.** Always create a PR.
- **All checks must pass locally before pushing:** formatting, lint, unit tests with coverage, CRAP score, build, AND E2E tests.
- **Complexity is the enemy.** Keep files under ~100 lines. Refactor aggressively to make code simpler and more testable. Three small files beat one big file.
- **Quality gates exist for a reason.** Never bypass pre-commit hooks, skip tests, or lower coverage thresholds to make something pass faster.
- **Every user-facing feature needs a Gherkin `.feature` file** in `e2e/features/`. No exceptions.

## Verification Checklist (run before pushing)

```bash
npx prettier --check "src/**/*.{ts,tsx}"   # Formatting
npm run lint                                # ESLint + cspell
npm run test:coverage                       # Unit tests + 80% coverage thresholds
npm run check-crap                          # CRAP score ≤ 15 per function
npm run build                               # TypeScript + Vite build
npm run e2e                                 # Playwright-BDD E2E tests
```

## Architecture

### Backend (AWS Amplify Gen2)

- **Auth:** Guest access (no login required)
- **Data:** AppSync GraphQL — `Albums`, `AlbumImageKey` models + custom queries (`getPartyPicsImages`, `getPartyPicsZipFile`, `deletePartyPic`)
- **Storage:** S3 bucket (`partypics`) with Transfer Acceleration enabled. Paths: `public/{albumName}/...` for uploads, `generated/...` for zip files
- **Functions:** Lambda functions for listing images, generating zip downloads, deleting photos, and transcoding video
- **Config:** `amplify/backend.ts` is the CDK entrypoint. Functions defined in `amplify/function/resource.ts`

Generate local config: `npm run prod-config` (requires `--profile personal` AWS credentials)

### Frontend (React + TypeScript + Vite)

- **State:** `@tanstack/react-query` for all server state. No Redux/Context for remote data.
- **UI:** `@aws-amplify/ui-react` components + some MUI icons
- **Routing:** Path-based (`/{albumName}`, `/{albumName}/kiosk`, `/{albumName}/camera`)
- **Structure:**
  - `src/hooks/` — custom hooks (data fetching, business logic)
  - `src/helpers/` — pure utility functions
  - `src/components/` — React components (render only, logic in hooks)

### E2E Tests (Playwright-BDD)

- **Features:** `e2e/features/*.feature` (Gherkin syntax)
- **Step definitions:** `e2e/steps/*.steps.ts`
- **Config:** `playwright.config.ts`
- Tests run against the real production backend (not mocked). Use `npm run prod-config` to generate `amplify_outputs.json` before running.
- Run with: `npm run e2e`

## Key Patterns

- **Videos:** Uploaded as `.mp4` when possible (iOS), `.webm` on Chrome. A Lambda transcoder auto-converts non-mp4 to mp4 on upload. Frontend shows a download fallback for formats the browser can't play.
- **Images:** Compressed client-side via `browser-image-compression` before upload (max 1.5MB, 1920px).
- **S3 Accelerate:** All storage URLs use Transfer Acceleration endpoint for faster global uploads/downloads.

## File Size Discipline

- Components should render JSX only — extract logic to hooks
- Hooks should be single-purpose — split if doing too many things
- Helpers should be pure functions — easy to test in isolation
- If a file is getting long, that's a signal to refactor, not to keep going
