import axios from "axios"
import type { AxiosRequestConfig } from "axios"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Typed API helpers
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.get(url, config)
  return data.data
}

export async function apiPost<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.post(url, body, config)
  return data.data
}

export async function apiPut<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.put(url, body, config)
  return data.data
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const { data } = await api.delete(url, config)
  return data.data
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export async function apiGetPage<T>(url: string, config?: AxiosRequestConfig): Promise<PageResult<T>> {
  const { data } = await api.get(url, config)
  return data.data
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.message
    if (detail) return detail
    return error.message
  }
  if (error instanceof Error) return error.message
  return "操作失败"
}
