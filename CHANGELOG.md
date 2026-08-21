# Changelog

All notable changes to the AgriFlow Client project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Pure calculation services: `lib/calculations/wallet.ts` (wallet balances/limits) and `lib/calculations/checkout.ts` (gross/net sell earnings math).
- Unit test suites for pure calculation logic (`__tests__/lib/wallet-calculations.test.ts` & `__tests__/lib/sell-calculations.test.ts`).
- Component integration test suites for `FarmerAnalytics` (`__tests__/app/farmer-analytics.test.tsx`) and `WarehouseWallet` (`__tests__/app/wallet-warehouse.test.tsx`).
- Component unit test suites for `FarmerWallet` (`__tests__/app/wallet-farmer.test.tsx`) and `WarehouseSettings` (`__tests__/app/warehouse-settings.test.tsx`).
- Global client Error Boundary (`app/error.tsx`) logging rendering exceptions via structured telemetry.

### Changed
- Refactored `lib/logger.ts` to output structured JSON format (`timestamp`, `level`, `module`, `message`, `error`, `metadata`).
- Enforced top-level 60% Jest coverage threshold in `jest.config.js`.
- Current CI coverage metrics: **91.22% Statements**, **72.36% Branches**, **63.30% Functions**, **91.22% Lines** across 21 passed test suites (90 unit tests).
- Modularized `.github/workflows/ci.yml` into parallel `lint-and-typecheck` and `test-with-coverage` jobs with Next.js build cache (`.next/cache`).

## [0.1.0] - 2026-08-21

### Added
- Testing infrastructure with Jest and React Testing Library.
- Centralized API client module (`lib/api.ts` & `lib/api-client.ts`) with Zod input validation (`lib/schemas.ts`).
- GitHub Actions CI quality gate workflow (`.github/workflows/ci.yml`).
- Initial `.env.example` setup.
