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

## How the App Works

### User Flows

**1. Create Album** (`/` — no path)

- Landing page shows marketing copy + "Create a New Album" form
- User types a name (no spaces, must be unique) → creates an `Albums` DynamoDB record → redirects to `/{albumName}`
- Validation: `useCreateAlbumForm` checks against existing album names fetched via `useAlbums`

**2. View & Upload** (`/{albumName}`)

- Main album page. Hero area with "Choose Files" (file picker) and "Camera" button
- **Share panel** (toggled): shows QR code for album URL + copy links for album and kiosk URLs
- **Upload flow**: files selected → queued in IndexedDB (`partypics-uploads`) → files cached in CacheStorage (`partypics-file-cache`) → processed concurrently (max 3 at a time):
  1. `compressing` — images >1.5MB compressed via `browser-image-compression` (max 1920px, quality 0.85). Videos skip this step.
  2. `uploading` — `uploadData()` to S3 via Transfer Acceleration. Progress tracked via `onProgress` callback.
  3. `registering` — creates `AlbumImageKey` record in DynamoDB (so the image appears in the gallery via subscription)
  4. `complete` — removed from queue after 3s
- Failed uploads retry up to 3 times. Progress shown in `UploadProgress` component.
- **Gallery** (`SharedPhotos`): paginated grid (24 items/page) showing thumbnails. Each `SharedImage` fetches a signed S3 URL via `getAccelerateUrl`. Clicking opens `PhotoModal` with full-size view, forward/back navigation (arrow keys), download, and delete.
- **Real-time updates**: AppSync subscriptions on `AlbumImageKey.onCreate`/`onDelete` update the react-query cache instantly — other guests see new photos without refreshing.

**3. Camera Mode** (`/{albumName}/camera`)

- Native camera access via `getUserMedia` (rear-facing preferred)
- Photo mode: captures frame from video stream → JPEG blob → compress → upload to S3 → register in DynamoDB
- Video mode: records via MediaRecorder (prefers `video/mp4`, falls back to `video/webm`) → uploads when stopped
- Status feedback: idle → uploading → success (1.5s)

**4. Kiosk Mode** (`/{albumName}/kiosk`)

- Display-only view (no upload controls). Full-width grid of all album images/videos. Intended for a TV or shared display at an event. Also updates in real-time via subscriptions.

**5. Video Transcoding** (automatic, server-side)

- When a non-mp4 video (`.webm`, `.mkv`, `.avi`, `.wmv`, `.flv`, `.mov`) lands in S3, an S3 event notification triggers the `transcodeVideo` Lambda
- Lambda downloads the file, runs ffmpeg (from a Lambda layer) to convert to h264/aac mp4, uploads the `.mp4` back to the same path (minus original extension), then deletes the original
- The frontend's `canPlayVideoFile` check determines if a video can be played natively; unsupported formats show a `VideoFallback` component with a download link

**6. Download All**

- Button at bottom of gallery. Calls the zip Lambda (via Function URL to avoid AppSync 30s timeout).
- Lambda lists all objects for the album, fetches each, zips with JSZip, uploads to `generated/{hash}.zip`, returns the key.
- Frontend opens a signed URL to download the zip.

**7. Delete Photo**

- From the photo modal, user confirms deletion → calls `deletePartyPic` custom query (Lambda deletes from S3) + deletes `AlbumImageKey` DynamoDB record → real-time subscription removes it from other viewers.

### Data Flow Diagram

```
Guest Browser                    AWS
─────────────                    ───
Choose files → compress → S3 (Transfer Accelerate) → [if video: transcode Lambda → mp4]
                              ↓
                    AlbumImageKey.create (AppSync)
                              ↓
                    DynamoDB subscription → all connected browsers update

View gallery → getPartyPicsImages (Lambda) → list S3 objects
             → getAccelerateUrl per thumbnail → signed S3 URL

Download all → getPartyPicsZipFile (Lambda Function URL) → zip → S3 → signed URL
```

## Architecture

### Backend (AWS Amplify Gen2)

- **Auth:** Cognito with guest access (no login required for album viewing/uploading)
- **Data:** AppSync GraphQL — `Albums`, `AlbumImageKey` models + custom queries (`getPartyPicsImages`, `getPartyPicsZipFile`, `deletePartyPic`)
- **Storage:** S3 bucket (`partypics`) with Transfer Acceleration enabled. Paths: `public/{albumName}/...` for uploads, `generated/...` for zip files
- **Functions:** Lambda functions for listing images, generating zip downloads, deleting photos, and transcoding video
- **Config:** `amplify/backend.ts` is the CDK entrypoint. Functions defined in `amplify/function/resource.ts`

Generate local config: `npm run prod-config` (requires `--profile personal` AWS credentials)

### Frontend (React + TypeScript + Vite)

- **State:** `@tanstack/react-query` for all server state. No Redux/Context for remote data.
- **UI:** `@aws-amplify/ui-react` components + some MUI icons
- **Routing:** Path-based (`/{albumName}`, `/{albumName}/kiosk`, `/{albumName}/camera`). Parsed from `window.location.pathname` in `App.tsx` — no router library.
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

## Source Code Map

### Key Components

| File                                                               | Purpose                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `src/App.tsx`                                                      | Entry point. Parses URL path → renders CreateAlbum, PartyPicsAlbum, Camera, or Kiosk |
| `src/components/CreateAlbum.tsx`                                   | Landing page + album creation form                                                   |
| `src/components/PartyPicsAlbum/PartyPicsAlbum.tsx`                 | Main album view: share panel + upload area + progress + gallery                      |
| `src/components/PartyPicsAlbum/HeroUploadArea.tsx`                 | Purple gradient upload CTA with file picker + camera button + upload status          |
| `src/components/PartyPicsAlbum/UploadProgress.tsx`                 | Per-file progress bars during upload                                                 |
| `src/components/PartyPicsAlbum/SharedPhotos/SharedPhotos.tsx`      | Paginated gallery grid (uses Amplify `Collection`)                                   |
| `src/components/PartyPicsAlbum/SharedPhotos/SharedImage.tsx`       | Single thumbnail: fetches signed URL, renders image/video/fallback                   |
| `src/components/PartyPicsAlbum/SharedPhotos/PhotoModal.tsx`        | Full-size lightbox with nav arrows, download, delete                                 |
| `src/components/PartyPicsAlbum/SharedPhotos/ModalImage.tsx`        | Full-size image/video inside the modal                                               |
| `src/components/PartyPicsAlbum/SharedPhotos/VideoFallback.tsx`     | Download-link placeholder for unsupported video formats                              |
| `src/components/PartyPicsAlbum/SharedPhotos/KioskSharedPhotos.tsx` | CSS grid gallery for kiosk mode (no pagination, no controls)                         |
| `src/components/PartyPicsAlbum/SharedPhotos/KioskImage.tsx`        | Kiosk-mode single image/video (auto-play, no controls)                               |
| `src/components/Camera/Camera.tsx`                                 | Camera view with photo/video mode toggle                                             |
| `src/components/Kiosk.tsx`                                         | Wrapper for kiosk display mode                                                       |

### Key Hooks

| File                              | Purpose                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| `src/hooks/useImages.ts`          | Fetches album images via `getPartyPicsImages` query + real-time subscriptions (onCreate/onDelete) |
| `src/hooks/useAlbums.ts`          | Lists/creates albums via `Albums` model                                                           |
| `src/hooks/useUploadQueue.ts`     | IndexedDB-backed upload queue with concurrency (max 3), retry (max 3), progress tracking          |
| `src/hooks/useUploadProcessor.ts` | Single-file upload pipeline: compress → upload to S3 → register in DynamoDB                       |
| `src/hooks/usePhotoGallery.ts`    | Gallery state: modal open/close, navigation, download, delete, download-all                       |
| `src/hooks/useCamera.ts`          | Camera stream management, photo capture (canvas → JPEG), video recording (MediaRecorder)          |
| `src/hooks/useCreateAlbumForm.ts` | Form state + validation for album creation                                                        |

### Key Helpers

| File                                | Purpose                                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------------------------- |
| `src/helpers/uploadQueue.ts`        | IndexedDB CRUD for the upload queue (persists across page refreshes)                      |
| `src/helpers/fileCache.ts`          | CacheStorage for selected files (survives if user navigates away mid-upload)              |
| `src/helpers/compressMedia.ts`      | Client-side image compression (browser-image-compression). Videos pass through unchanged. |
| `src/helpers/detectFileType.ts`     | Extension-based file type detection → "image" / "video" / "unknown"                       |
| `src/helpers/videoSupport.ts`       | Browser capability check via `canPlayType()` for each video extension                     |
| `src/helpers/getAccelerateUrl.ts`   | Wraps `getUrl()` with Transfer Acceleration + 5-min expiry                                |
| `src/helpers/humanFileSize.ts`      | Bytes → human-readable string (KiB, MiB, etc.)                                            |
| `src/helpers/isMobileScreenSize.ts` | Simple viewport width check for responsive layout decisions                               |

### Backend Functions

| File                                      | Trigger                                   | What it does                                                                         |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------ |
| `amplify/function/getPartyPicsImages.ts`  | AppSync query                             | Lists S3 objects under `public/{albumName}/`, returns key/size/date array            |
| `amplify/function/getPartyPicsZipFile.ts` | AppSync query OR Function URL (POST body) | Lists album objects, fetches all, zips with JSZip, uploads to `generated/{hash}.zip` |
| `amplify/function/deletePartyPic.ts`      | AppSync query                             | Deletes a single S3 object by key                                                    |
| `amplify/function/transcodeVideo.ts`      | S3 event (OBJECT_CREATED)                 | Downloads non-mp4, ffmpeg converts to mp4, uploads mp4, deletes original             |
| `amplify/function/resource.ts`            | —                                         | `defineFunction` definitions for all 4 lambdas (timeouts, memory)                    |

### CDK / Infrastructure

| File                          | Purpose                                                                                                                                |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `amplify/backend.ts`          | Wires auth + data + storage + functions. Adds: S3 Transfer Acceleration, zip Function URL, ffmpeg layer, S3→Lambda event notifications |
| `amplify/data/resource.ts`    | GraphQL schema: models (Albums, AlbumImageKey), custom types (Image, ImageList, ZipFile), custom queries                               |
| `amplify/auth/resource.ts`    | Cognito config with guest (unauthenticated) access enabled                                                                             |
| `amplify/storage/resource.ts` | S3 bucket definition with guest read/write on `public/*` and `generated/*`                                                             |

## AWS Infrastructure

### Account & Region

- **Account:** 566092841021
- **Region:** us-west-2
- **Amplify App ID:** d131sf2ylw1gxp
- **Production URL:** https://partypics.jpc.io (custom domain on Amplify Hosting)

### Deployment

Amplify Hosting CI/CD pipeline, auto-deploys on push to `main`:

1. Backend: `npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID`
2. Frontend: `npm run build` → deploys `dist/`

GitHub Actions CI (`.github/workflows/ci.yml`) runs on PRs: format, lint, test + coverage, CRAP score, build, E2E.

### CloudFormation Stacks

Root stack: `amplify-d131sf2ylw1gxp-main-branch-d7ff50ca0f`

Nested stacks:

- `auth179371D7` — Cognito User Pool, Identity Pool
- `data7552DF31` — AppSync API, DynamoDB tables, resolvers
- `function1351588B` — Lambda functions
- `storage0EC3F24A` — S3 bucket

### S3 Bucket

**Primary bucket:** `amplify-d131sf2ylw1gxp-mai-partypicsbucket5babcdb6-sodvy3mbmtmr`

Access via CLI:

```bash
# List album contents
aws s3 ls s3://amplify-d131sf2ylw1gxp-mai-partypicsbucket5babcdb6-sodvy3mbmtmr/public/wedding/ --profile personal

# Download a file
aws s3 cp s3://amplify-d131sf2ylw1gxp-mai-partypicsbucket5babcdb6-sodvy3mbmtmr/public/wedding/photo.jpg ./photo.jpg --profile personal
```

Path structure:

- `public/{albumName}/...` — user uploads (images + videos)
- `generated/...` — zip files created by the zip Lambda

### Lambda Functions

| Function                                                          | Purpose                                         | Timeout | Memory |
| ----------------------------------------------------------------- | ----------------------------------------------- | ------- | ------ |
| `amplify-d131sf2ylw1gxp-ma-getPartyPicsImageslambda-ClSB3dpdZWSi` | Lists S3 objects for an album                   | 3s      | 512MB  |
| `amplify-d131sf2ylw1gxp-ma-getPartyPicsZipFilelambd-X604INIVUvkr` | Zips all album images → uploads to `generated/` | 600s    | 4096MB |
| `amplify-d131sf2ylw1gxp-ma-deletePartyPiclambda95C8-EIxzDQLGL8mf` | Deletes a single S3 object                      | 3s      | 512MB  |
| `amplify-d131sf2ylw1gxp-ma-transcodeVideolambdaF849-6Uh9UjRkuwd9` | Transcodes non-mp4 video to mp4 (ffmpeg layer)  | 300s    | 2048MB |

The zip function also has a **Function URL** (no auth): `https://7qh3g7at6ys46udsbhc5bv4uza0dyqqh.lambda-url.us-west-2.on.aws/`

### CloudWatch Logs

```bash
# Tail logs for a specific function
aws logs tail /aws/lambda/amplify-d131sf2ylw1gxp-ma-getPartyPicsImageslambda-ClSB3dpdZWSi --follow --profile personal
aws logs tail /aws/lambda/amplify-d131sf2ylw1gxp-ma-getPartyPicsZipFilelambd-X604INIVUvkr --follow --profile personal
aws logs tail /aws/lambda/amplify-d131sf2ylw1gxp-ma-deletePartyPiclambda95C8-EIxzDQLGL8mf --follow --profile personal
aws logs tail /aws/lambda/amplify-d131sf2ylw1gxp-ma-transcodeVideolambdaF849-6Uh9UjRkuwd9 --follow --profile personal

# Search recent errors in transcoder
aws logs filter-log-events \
  --log-group-name /aws/lambda/amplify-d131sf2ylw1gxp-ma-transcodeVideolambdaF849-6Uh9UjRkuwd9 \
  --filter-pattern "ERROR" \
  --start-time $(date -v-1H +%s000) \
  --profile personal
```

### DynamoDB Tables

| Table                                           | Model         | Primary Key           |
| ----------------------------------------------- | ------------- | --------------------- |
| `Albums-xufvkce4hnd5xpodbjkufmcfxa-NONE`        | Albums        | `id` (auto-generated) |
| `AlbumImageKey-xufvkce4hnd5xpodbjkufmcfxa-NONE` | AlbumImageKey | `imageKey`            |

### AppSync GraphQL API

- **API ID:** `xufvkce4hnd5xpodbjkufmcfxa`
- **Endpoint:** `https://iegnqmq63vectpvkfke7y2y3wm.appsync-api.us-west-2.amazonaws.com/graphql`
- **Primary auth:** AWS_IAM (guest/unauthenticated)
- **Secondary auth:** AMAZON_COGNITO_USER_POOLS

### Cognito

- **User Pool:** `us-west-2_LwMs4VbVG`
- **Identity Pool:** `us-west-2:96ab79d4-f443-4a31-832c-7703e9465b2b`
- **Guest (unauthenticated) access:** ENABLED — this is how all users interact with the app

### Custom CDK (beyond stock Amplify)

Defined in `amplify/backend.ts`:

1. **S3 Transfer Acceleration** — faster global uploads
2. **Lambda Function URL** on zip function — direct invocation without AppSync (avoids 30s timeout)
3. **ffmpeg Lambda Layer** (`arn:aws:lambda:us-west-2:566092841021:layer:ffmpeg:1`) — for video transcoding
4. **S3 Event Notifications** — triggers transcodeVideo on `OBJECT_CREATED` under `public/` for suffixes: `.webm`, `.mkv`, `.avi`, `.wmv`, `.flv`, `.mov`
5. **S3 grantReadWrite** to transcodeVideo Lambda

## Key Patterns

- **Videos:** Uploaded as `.mp4` when possible (iOS), `.webm` on Chrome. The transcodeVideo Lambda auto-converts non-mp4 to mp4 on upload via S3 event notification. Frontend shows a download fallback for formats the browser can't play.
- **Images:** Compressed client-side via `browser-image-compression` before upload (max 1.5MB, 1920px).
- **S3 Accelerate:** All storage URLs use Transfer Acceleration endpoint for faster global uploads/downloads.
- **Real-time:** AppSync subscriptions on AlbumImageKey onCreate/onDelete update the react-query cache instantly.
- **Offline-resilient uploads:** Upload queue persists in IndexedDB; files cached in CacheStorage. If the user navigates away or closes the tab, pending uploads can resume on return.
- **No auth required:** Everything uses Cognito guest/unauthenticated identity. Zero registration friction.

## File Size Discipline

- Components should render JSX only — extract logic to hooks
- Hooks should be single-purpose — split if doing too many things
- Helpers should be pure functions — easy to test in isolation
- If a file is getting long, that's a signal to refactor, not to keep going
