import { useState, useEffect, useCallback } from "react"
import { useSession } from "@/lib/hooks/useSession"
import { clientApiGet, clientApiPost, clientApiDelete } from "@/lib/api-client"
import { loadWithFallback } from "@/lib/storageFallback"
import { logger } from "@/lib/logger"

interface Identifiable {
  id: string
}

export function useResourceWithFallback<T extends Identifiable>(
  apiEndpoint: string,
  storageKeyPrefix: string,
  initialFallbackItems: T[] = []
) {
  const { session } = useSession()
  const [items, setItems] = useState<T[]>(initialFallbackItems)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const getStorageKey = useCallback(() => {
    const userId = session?.user?.id || "guest"
    return `${storageKeyPrefix}_${userId}`
  }, [session, storageKeyPrefix])

  const loadResources = useCallback(async () => {
    setLoading(true)
    setError("")
    const key = getStorageKey()
    try {
      const data = await loadWithFallback<T[]>(
        key,
        () => clientApiGet<T[]>(apiEndpoint),
        initialFallbackItems,
        `useResourceWithFallback[${apiEndpoint}]`
      )
      setItems(data || [])
    } catch (err: unknown) {
      logger.error("useResourceWithFallback", `Failed loading resources for ${apiEndpoint}`, err)
      setError("Unable to sync resources. Using offline cache.")
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint, getStorageKey, initialFallbackItems])

  useEffect(() => {
    if (session !== undefined) {
      loadResources()
    }
  }, [session, loadResources])

  const saveItems = (newItems: T[]) => {
    setItems(newItems)
    try {
      const key = getStorageKey()
      localStorage.setItem(key, JSON.stringify(newItems))
    } catch (err) {
      logger.warn("useResourceWithFallback", "Failed to persist to localStorage", err)
    }
  }

  const addResource = async (payload: Omit<T, "id">, fallbackIdPrefix: string = "item") => {
    setLoading(true)
    setError("")
    setSuccess("")
    let createdItem: T
    try {
      try {
        createdItem = await clientApiPost<T>(apiEndpoint, payload)
      } catch (apiErr) {
        logger.warn("useResourceWithFallback", `API post failed for ${apiEndpoint}, using offline fallback`, apiErr)
        createdItem = {
          id: `${fallbackIdPrefix}-${Date.now()}`,
          ...payload,
        } as unknown as T
      }

      const updated = [createdItem, ...items]
      saveItems(updated)
      setSuccess("Resource registered successfully!")
      setTimeout(() => setSuccess(""), 4000)
      return createdItem
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while creating resource"
      logger.error("useResourceWithFallback", `Error adding resource for ${apiEndpoint}`, err)
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteResource = async (id: string) => {
    setError("")
    setSuccess("")
    try {
      try {
        await clientApiDelete(`${apiEndpoint}/${id}`)
      } catch (apiErr) {
        logger.warn("useResourceWithFallback", `API delete failed for ${apiEndpoint}/${id}, updating local store`, apiErr)
      }

      const updated = items.filter((item) => item.id !== id)
      saveItems(updated)
      setSuccess("Resource removed successfully.")
      setTimeout(() => setSuccess(""), 4000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete resource"
      logger.error("useResourceWithFallback", `Error deleting resource ${id} at ${apiEndpoint}`, err)
      setError(msg)
    }
  }

  return {
    items,
    setItems: saveItems,
    loading,
    error,
    setError,
    success,
    setSuccess,
    addResource,
    deleteResource,
    reload: loadResources,
  }
}
