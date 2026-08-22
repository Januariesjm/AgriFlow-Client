# AgriFlow Client

AgriFlow Client is a modern Next.js 16 agricultural supply chain platform connecting farmers, buyers, transporters, vendors, and warehouse owners across regional markets.

---

## 🛠 Tech Stack & Architecture

- **Framework:** Next.js 16 (App Router) with standalone production build
- **State & Data Fetching:** Centralized API client layer (`lib/api.ts`, `lib/api-client.ts`) with custom React hooks
- **Resource Pattern:** Dashboard pages consume shared hooks (`lib/hooks/useResourceWithFallback.ts` for CRUD resources with offline localStorage fallback, plus feature hooks like `useFarmerLogistics`) so fetch, persistence, and mutation logic stay out of page components
- **Authentication:** Supabase Auth with JWT bearer token verification
- **Validation & Schemas:** Zod schema validation (`lib/schemas.ts`) — API payload schemas plus form boundary schemas (`*FormSchema`) that every dashboard form submits through
- **Styling:** Tailwind CSS & Lucide Icons
- **Testing:** Jest, React Testing Library, and jsdom
- **Containerization:** Docker & Docker Compose

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
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API Key
- `ENABLE_ERROR_TRACKING`: Flag to toggle production Sentry error telemetry (`true` / `false`)
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN endpoint URL for error reporting
- `NODE_ENV`: Application runtime mode (`development`, `test`, `production`)

### 2. Development Server

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🐳 Docker Deployment

Start the entire application in an isolated container environment:

```bash
docker compose up --build
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testing & Quality Assurance

AgriFlow Client enforces strict quality gates covering type safety, linting, and automated unit/component tests with coverage enforcement.

### Run Unit & Component Tests

```bash
npm test
```

Runs the Jest test suite with coverage report generation and threshold verification (60% global coverage, enforced via `coverageThreshold` in `jest.config.js` — the run exits non-zero below the bar).

The suite is fully self-contained: placeholder credentials are injected in `jest.setup.ts` and an offline guard rejects any unmocked network request, so a fresh clone runs `npm ci && npm test` green with no Supabase project, backend API, or Google Maps key.

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

1. **Lint Check:** `npm run lint`
2. **Security Audit:** `npm audit --audit-level=high`
3. **Type Check:** `npx tsc --noEmit`
4. **Test Suite & Coverage:** `npm test -- --coverage --ci` (fails below the 60% global coverage threshold)
5. **Production Build:** `npm run build` (gated on all previous jobs)
6. **Container Build Verification:** `docker build` of the production image (gated on the build job)

---

## 📦 Production Build

To build the project locally for production deployment:

```bash
npm run build
npm start
```
