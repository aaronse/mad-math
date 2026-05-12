# Public Mirror Manifest

This public repository is mirrored from an internal development repository.

The public repo contains the source and public-facing materials intended for users, builders, and contributors. Internal planning notes, AI-agent task batches, release automation, roadmap details, and half-baked experiments are maintained separately so the public repo stays clear, useful, and safe to consume.

## Mirror Summary

- Public repo: `mad-math`
- Internal source repo: `mad-math-int`
- Source branch: `main`
- Source commit: `b694b72050bd`
- Source commit full: `b694b72050bdde96851f436070e87a80e99cf116`
- Public branch: `main`
- Generated at UTC: `2026-05-12T07:58:27Z`
- Mirror script version: `1.1.0`
- Mirror mode used for generation: `apply`
- Allowlist path: `scripts/public-allowlist.txt`
- Allowlist SHA256: `8f5b1e82cb5400b2e95dc63e7b46815ca25af846dfca9adcc835e1482ce87c51`

## Configured Mirror Rules

- `README.md`
- `LICENSE.md`
- `SECURITY.md`
- `web/eslint.config.js`
- `web/index.html`
- `web/package-lock.json`
- `web/package.json`
- `web/playwright.config.ts`
- `web/public/**`
- `web/src/**`
- `web/tests/**`
- `web/tsconfig.app.json`
- `web/tsconfig.json`
- `web/tsconfig.node.json`
- `web/vite.config.ts`
- `~**/*.suo`
- `~**/*.user`
- `~**/Bin/**`
- `~**/obj/**`
- `~**/desktop.ini`

## Missing Include Rules

- None

## Excluded Categories

The mirror process is allowlist-based. Rules are processed top-to-bottom, and `~` rules remove files matched by earlier include rules. Anything not explicitly included remains excluded by default, including:

- internal docs
- private docs
- `AGENT*.md`
- task batches
- AI-agent prompts/process artifacts
- deployment workflows
- release/signing automation
- roadmap details
- half-baked prototypes
- generated/build artifacts unless explicitly allowlisted
- secrets, credentials, signing keys, PII, and customer/partner data

## Copied File Preview

Total copied files before manifest: 33

- `LICENSE.md`
- `README.md`
- `SECURITY.md`
- `web/eslint.config.js`
- `web/index.html`
- `web/package.json`
- `web/package-lock.json`
- `web/playwright.config.ts`
- `web/public/audio/complete.mp3`
- `web/public/audio/correct.mp3`
- `web/public/audio/tap.mp3`
- `web/public/audio/wrong.mp3`
- `web/public/staticwebapp.config.json`
- `web/src/App.tsx`
- `web/src/audio/soundPlayer.ts`
- `web/src/components/GameScreen.tsx`
- `web/src/components/ResultsScreen.tsx`
- `web/src/components/SetupScreen.tsx`
- `web/src/domain/questions.ts`
- `web/src/domain/round.ts`
- `web/src/domain/types.ts`
- `web/src/main.tsx`
- `web/src/storage/appStorage.ts`
- `web/src/styles.css`
- `web/src/test/setup.ts`
- `web/src/vite-env.d.ts`
- `web/tests/domain.test.ts`
- `web/tests/e2e/game.spec.ts`
- `web/tests/storage.test.ts`
- `web/tsconfig.app.json`
- `web/tsconfig.json`
- `web/tsconfig.node.json`
- `web/vite.config.ts`

## Verification Expectations

Before pushing this public mirror, run or verify:

- mirror script check mode passed
- public diff reviewed
- secret/marker scan passed
- generated/build artifacts excluded unless explicitly allowlisted
- questionable third-party assets reviewed or noted
- public changelog/release notes scrubbed of `[INT]` / `[PRI]` material

