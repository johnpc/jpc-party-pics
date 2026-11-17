# jpc party pics

Free zero-registration collaborative photo album for hosting a wedding,
birthday bash, corporate event, or anything else!

Join our [demo album](https://partypics.jpc.io/Demo) to see if partypics.jpc.io is right
for you.

Key Features:

- Easy-to-use interface for all ages
- Share access to your party album via link or qr code
- Instant photo and video uploads from all guests with the link
- High-quality image storage
- Download options for individual files or the entire album
- The best part, completely FREE. No registration required.

## Running the app locally

### Without any AWS account (fake backend)

```bash
git clone git@github.com:johnpc/jpc-party-pics.git
cd jpc-party-pics
npm install
npm run dev:fake
```

`npm run dev:fake` serves the app against an in-process fake backend: albums
and photos live in memory + `localStorage`, media comes from the dev server,
uploads and real-time updates work, and nothing touches the network. This is
what the E2E suite and CI use (`npm run e2e`). See `AGENTS.md` for how the
seam works.

### With a sandboxed AWS backend

Execute the following commands to run the app locally, using a sandboxed backend.

As a prerequisite, you must have AWS credentials set up in `~/.aws/credentials`. This can be set up by running `aws configure`. If you do not have the AWS cli installed, see setup instructions for your platform [here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html).

```bash
git clone git@github.com:johnpc/jpc-party-pics.git
cd jpc-party-pics
npm install
npm run sandbox
npm run dev
```

## Deploy a clone of this repo

[![amplifybutton](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/home#/deploy?repo=https://github.com/johnpc/jpc-party-pics)

## Contributing

### No flaky tests

Tests in CI pass reliably. An intermittent failure is a race to find and fix
in the harness or the app — never re-run it, add a sleep, raise a timeout,
add retries, or skip it. Playwright runs with `retries: 0`; steps wait on
real conditions (elements, attributes, URLs, popups, backend events), never
on fixed delays. The full rule set lives in [`AGENTS.md`](AGENTS.md).

### Quality gates

```bash
npm run quality        # everything CI runs: format, lint, unit + coverage,
                       # CRAP, file length, state-machine catalogue, build, e2e
npm run e2e            # Playwright-BDD against the fake backend (default)
npm run e2e:real       # same suite against the live backend (needs amplify_outputs.json)
```

State machines (upload phases, camera capture, lightbox, zoom, ...) are
explicit discriminated unions with one owner each, catalogued in
[`docs/state-machines.md`](docs/state-machines.md) and checked by
`npm run check-state-machines`.
