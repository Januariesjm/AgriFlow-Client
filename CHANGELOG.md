# Changelog

All notable changes to the AgriFlow Client project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-08-22

### Added
- Zod form boundary schemas (`FacilityFormSchema`, `ProductFormSchema`, `WarehouseFormSchema`) plus a `formatZodIssues` helper in `lib/schemas.ts`, with valid/invalid case coverage in `__tests__/lib/schemas.test.ts`.
- Dedicated unit suites for `useResourceWithFallback` (`__tests__/lib/useResourceWithFallback.test.ts`) and the new `useFarmerLogistics` hook (`__tests__/lib/useFarmerLogistics.test.ts`) covering load, create, delete, and error paths.
- Shared `StatusBanner` component (`components/ui/StatusBanner.tsx`) replacing hand-rolled success/error alert markup across dashboard pages.
- Offline test guard and placeholder credentials in `jest.setup.ts`, so a fresh clone runs the suite with zero live accounts or network access.
- `.dockerignore` and a CI container build verification job proving the production image builds on every push.

### Changed
- Farmer product listings (`app/dashboard/farmer/products/page.tsx`) now load and mutate through the shared `useResourceWithFallback` hook with `ProductFormSchema` validation instead of page-level fetch plumbing.
- Farmer logistics data loading and transport booking extracted into `lib/hooks/useFarmerLogistics.ts`, leaving the page as pure rendering.
- Warehouse facility and buyer warehouse forms validate through shared Zod schemas instead of ad-hoc `isNaN`/`trim` checks.
- All remaining caret-ranged dependencies (`next`, `@supabase/supabase-js`, `eslint`, `eslint-config-next`) pinned to exact versions.

### Fixed
- `useResourceWithFallback` no longer refetches in a loop when callers pass inline array literals as fallback seed data.

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
