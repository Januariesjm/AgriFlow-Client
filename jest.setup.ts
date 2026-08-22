import "@testing-library/jest-dom"

// Deterministic placeholder credentials so a fresh clone can run the suite
// with zero external accounts (no Supabase project, backend API, or Google
// Maps key required).
process.env.NEXT_PUBLIC_SUPABASE_URL ||= "https://placeholder.supabase.co"
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||= "placeholder-anon-key"
process.env.NEXT_PUBLIC_API_BASE_URL ||= "http://localhost:4000/api"
process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||= "placeholder-maps-key"

if (typeof globalThis.Request === "undefined") {
  globalThis.Request = class Request {} as unknown as typeof globalThis.Request
}

if (typeof globalThis.Response === "undefined") {
  globalThis.Response = class Response {} as unknown as typeof globalThis.Response
}

// Offline guard: any fetch a test does not explicitly mock rejects
// immediately instead of attempting a real network call, keeping the suite
// deterministic and proving no spec depends on live services.
globalThis.fetch = jest.fn((input: RequestInfo | URL) =>
  Promise.reject(new Error(`Blocked unmocked network request during tests: ${String(input)}`))
) as unknown as typeof fetch
