import { logger } from "@/lib/logger"

/**
 * Executes an async data fetching function with automatic localStorage caching
 * and fallback seed data upon API failure.
 */
export async function loadWithFallback<T>(
  storageKey: string,
  fetchFn: () => Promise<T>,
  seedData: T,
  validator?: (data: T) => boolean,
  context = "StorageFallback"
): Promise<T> {
  try {
    const remoteData = await fetchFn()
    if (remoteData !== undefined && remoteData !== null && (!validator || validator(remoteData))) {
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, JSON.stringify(remoteData))
        }
      } catch (err: unknown) {
        logger.warn(context, `Failed to cache item to localStorage key "${storageKey}"`, err)
      }
      return remoteData
    }
  } catch (err: unknown) {
    logger.warn(context, `API fetch failed for "${storageKey}". Attempting fallback recovery.`, err)
  }

  // Attempt recovery from localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        logger.info(context, `Recovered cached data from localStorage key "${storageKey}"`)
        return JSON.parse(stored) as T
      }
    } catch (err: unknown) {
      logger.warn(context, `Failed to parse stored localStorage item for key "${storageKey}"`, err)
    }

    // Seed local storage with default data if empty
    try {
      localStorage.setItem(storageKey, JSON.stringify(seedData))
    } catch (err: unknown) {
      logger.warn(context, `Failed to seed initial data to localStorage key "${storageKey}"`, err)
    }
  }

  return seedData
}
