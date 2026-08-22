import "@testing-library/jest-dom"

if (typeof globalThis.Request === "undefined") {
  globalThis.Request = class Request {} as unknown as typeof globalThis.Request
}

if (typeof globalThis.Response === "undefined") {
  globalThis.Response = class Response {} as unknown as typeof globalThis.Response
}
