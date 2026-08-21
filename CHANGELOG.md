# Changelog

All notable changes to the AgriFlow Client project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-08-21

### Added
- Dockerfile multi-stage build and `docker-compose.yml` for isolated container deployment.
- Dependabot configuration (`.github/dependabot.yml`) for automated security dependency updates.
- Centralized TypeScript types for `Session`, `Withdrawal`, `Deposit`, and `PayoutConfig` in `lib/types.ts`.
- Shared custom hooks `useSession` and `useProfileForm` to eliminate code duplication across dashboard settings and wallet pages.
- Component test suites for Farmer Wallet, Buyer Settings, and `useProfileForm` hook.
- Standard Jest coverage threshold enforcement (60% global).
- `CONTRIBUTING.md` engineering guidelines and `CHANGELOG.md`.

### Changed
- Refactored all dashboard and public page fetch calls to use `lib/api-client.ts` instead of hardcoded backend URLs.
- Replaced explicit `useState<any>` declarations across all dashboard components with strict TypeScript types.
- Upgraded CI workflow (`.github/workflows/ci.yml`) to Node 22 runtime with environment variable check and dependency audit steps.
- Updated `README.md` with Docker instructions and expanded architecture overview.

## [0.1.0] - 2026-08-20

### Added
- Testing infrastructure with Jest and React Testing Library.
- Centralized API client module (`lib/api.ts` & `lib/api-client.ts`) with Zod input validation (`lib/schemas.ts`).
- Calculation helpers in `lib/checkout.ts` and `lib/admin.ts`.
- GitHub Actions CI quality gate workflow (`.github/workflows/ci.yml`).
- Initial `.env.example` setup.
