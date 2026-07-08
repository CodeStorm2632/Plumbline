import { createContext, useContext } from "react"
import type { UserMeResponse } from "@/types"

export interface AuthContextType {
  user: UserMeResponse | null
  permissions: Set<string>
  hasPermission: (code: string) => boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: new Set(),
  hasPermission: () => false,
})

export function useAuthContext() {
  return useContext(AuthContext)
}

export function useHasPermission(code: string): boolean {
  const { hasPermission } = useAuthContext()
  return hasPermission(code)
}
