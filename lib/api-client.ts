import { api } from "./api"
import { supabase } from "./supabase"

async function getAuthToken(): Promise<string | undefined> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token
}

export async function clientApiGet<T>(path: string): Promise<T> {
  const token = await getAuthToken()
  return api.get<T>(path, token)
}

export async function clientApiPost<T>(path: string, body?: unknown): Promise<T> {
  const token = await getAuthToken()
  return api.post<T>(path, body, token)
}

export async function clientApiPut<T>(path: string, body?: unknown): Promise<T> {
  const token = await getAuthToken()
  return api.put<T>(path, body, token)
}

export async function clientApiPatch<T>(path: string, body?: unknown): Promise<T> {
  const token = await getAuthToken()
  return api.patch<T>(path, body, token)
}

export async function clientApiDelete<T>(path: string): Promise<T> {
  const token = await getAuthToken()
  return api.delete<T>(path, token)
}
