# Contributing to AgriFlow Client

Thank you for your interest in contributing to **AgriFlow Client**! We welcome contributions that maintain high engineering quality, test coverage, and security standards.

---

## 🚀 Getting Started

1. **Fork and Clone** the repository.
2. **Setup Local Environment**:
   ```bash
   cp .env.example .env.local
   npm install
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 📐 Engineering Guidelines

### 1. Code Quality & Standards
- Keep components modular and reusable.
- Use explicit TypeScript interfaces; do **not** use `any`.
- Fetch data using centralized clients (`lib/api.ts` or `lib/api-client.ts`) rather than hardcoding backend URLs.

### 2. Testing Requirements
- Every new feature or bug fix must include corresponding tests in `__tests__/`.
- Maintain test coverage above the enforced threshold (60% global coverage).
- Verify all tests pass locally before submitting a PR:
  ```bash
  npm test
  ```

### 3. Commit Convention & Atomic Changes
Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:
- `feat:` New feature paired with unit/integration tests
- `fix:` Bug fix paired with regression test
- `test:` Adding or updating test suites
- `refactor:` Code change that neither fixes a bug nor adds a feature
- `docs:` Documentation updates
- `ci:` CI/CD workflow updates

#### Atomic Commit Guidelines:
- Keep each feature or fix in its own small commit including the tests pinning the new behavior.
- Avoid large bulk commits that mix formatting, refactoring, and features together.

---

## 🧪 Pre-Submission Checklist

Before creating a Pull Request, run the complete quality gate locally:

```bash
# 1. Typecheck
npx tsc --noEmit

# 2. Lint
npm run lint

# 3. Test Suite & Coverage
npm test
```
