const nextJest = require("next/jest")

const createJestConfig = nextJest({
  dir: "./",
})

/** @type {import('jest').Config} */
const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/__tests__/__mocks__/"],
}

module.exports = async () => {
  const jestConfig = await createJestConfig(config)()
  return {
    ...jestConfig,
    coverageThreshold: {
      global: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  }
}
