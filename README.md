# AgriFlow Client

AgriFlow Client is a modern Next.js agricultural supply chain platform connecting farmers, buyers, transporters, vendors, and warehouse owners across regional markets.

---

## 🛠 Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router)
- **State & Data Fetching:** TanStack Query (React Query) & Supabase Client
- **Authentication:** Supabase Auth with JWT bearer token verification
- **Validation & Schemas:** Zod schema validation
- **Styling:** Tailwind CSS & Lucide Icons
- **Testing:** Jest, React Testing Library, and jsdom

---

## 🚀 Getting Started

### 1. Environment Configuration

Copy the sample environment file and configure your credentials:

```bash
cp .env.example .env.local
```

Ensure the following keys are populated in your `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key
- `NEXT_PUBLIC_API_BASE_URL`: AgriFlow Backend API URL (default: `http://localhost:4000/api`)

### 2. Development Server

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Quality Assurance

AgriFlow Client enforces strict quality gates covering type safety, linting, and automated unit/component tests.

### Run Unit & Component Tests

```bash
npm test
```

Runs the Jest test suite with coverage report generation. All custom utilities (`lib/api.ts`, `lib/api-client.ts`, `lib/checkout.ts`, `lib/admin.ts`), schemas, and critical pages are covered.

### Run TypeScript Type Check

```bash
npx tsc --noEmit
```

Ensures strict type compliance across all components and pages without generating build output.

### Run Linter

```bash
npm run lint
```

Runs ESLint to verify code quality and style compliance.

---

## ⚙️ CI/CD Quality Pipeline

This repository includes a GitHub Actions workflow located at `.github/workflows/ci.yml`. On every push and pull request to `main`, `master`, or `develop`, the pipeline executes:

1. **Dependency Installation:** `npm ci`
2. **Type Check:** `npx tsc --noEmit`
3. **Lint Check:** `npm run lint`
4. **Test Suite:** `npm test`

---

## 📦 Production Build

To build the project for production deployment:

```bash
npm run build
npm start
```
