# Changelog

All notable changes to the AgriFlow Client project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-08-22

### Added
- Extended structured logging in `lib/logger.ts` to support `LogContext` objects (`module`, `action`, `userId`, `metadata`) and added unit test assertions in `__tests__/lib/logger.test.ts`.
- Introduced production error tracking module `lib/errorTracking.ts` with optional Sentry SDK integration and isolated no-op fallback, backed by unit tests in `__tests__/lib/errorTracking.test.ts`.
- Extracted business logic custom hook `lib/hooks/useProfileSettings.ts` with strict Zod validation, backed by unit test suite `__tests__/lib/useProfileSettings.test.ts`.
- Extracted product page state management into custom hook `lib/hooks/useProductDetail.ts`, backed by unit test suite `__tests__/lib/useProductDetail.test.ts`.
- Added page component integration test suites for `FarmerAnalytics` (`__tests__/pages/farmer-analytics.test.tsx`) and `FarmerLogistics` (`__tests__/pages/farmer-logistics.test.tsx`).
- Restructured GitHub Actions CI workflow (`.github/workflows/ci.yml`) into explicit `lint`, `typecheck`, `test`, and `build` jobs to ensure proper automated merge gating.
- Pinned dependency versions to published stable releases (`Next.js 15.1.8`, `React 19.0.0`, `Zod 3.24.2`, `lucide-react 0.475.0`).

## [0.2.0] - 2026-08-21

### Added
- Testing infrastructure with Jest and React Testing Library.
- Centralized API client module (`lib/api.ts` & `lib/api-client.ts`) with Zod input validation (`lib/schemas.ts`).
- GitHub Actions CI quality gate workflow (`.github/workflows/ci.yml`).
- Initial `.env.example` setup.
