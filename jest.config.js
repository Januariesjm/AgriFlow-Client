const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

/** @type {import('jest').Config} */
const customJestConfig = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^lucide-react$": "<rootDir>/node_modules/lucide-react/dist/cjs/lucide-react.js",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/__tests__/__mocks__/"],
  modulePathIgnorePatterns: ["<rootDir>/.next/"],
  transformIgnorePatterns: ["/node_modules/(?!(lucide-react)/)"],
  collectCoverageFrom: [
    "app/page.tsx",
    "app/error.tsx",
    "app/api/health/route.ts",
    "app/api/metrics/route.ts",
    "app/(public)/sell/page.tsx",
    "app/(public)/equipments/page.tsx",
    "app/(public)/plant-next/page.tsx",
    "app/(public)/products/page.tsx",
    "app/(public)/products/[id]/page.tsx",
    "app/dashboard/farmer/analytics/page.tsx",
    "app/dashboard/farmer/logistics/page.tsx",
    "app/dashboard/farmer/wallet/page.tsx",
    "app/dashboard/warehouse_owner/wallet/page.tsx",
    "app/dashboard/warehouse_owner/settings/page.tsx",
    "components/layout/header.tsx",
    "components/layout/footer.tsx",
    "components/calendar/CalendarBoard.tsx",
    "components/calendar/CalendarGrid.tsx",
    "components/sell/SellCalculator.tsx",
    "components/warehouses/WarehouseKpis.tsx",
    "lib/admin.ts",
    "lib/api.ts",
    "lib/api-client.ts",
    "lib/checkout.ts",
    "lib/errorTracking.ts",
    "lib/logger.ts",
    "lib/schemas.ts",
    "lib/storageFallback.ts",
    "lib/supabase.ts",
    "lib/calculations/**/*.{js,jsx,ts,tsx}",
    "lib/data/**/*.{js,jsx,ts,tsx}",
    "lib/hooks/useProductDetail.ts",
    "lib/hooks/useProfileSettings.ts",
    "lib/hooks/useResourceWithFallback.ts",
    "lib/hooks/useSession.ts",
    "lib/hooks/useWallet.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
