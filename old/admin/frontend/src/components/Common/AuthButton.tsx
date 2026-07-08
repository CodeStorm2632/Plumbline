import { useHasPermission } from "@/hooks/useAuthContext"

interface AuthButtonProps {
  permission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthButton({ permission, children, fallback = null }: AuthButtonProps) {
  const hasPermission = useHasPermission(permission)
  return hasPermission ? <>{children}</> : <>{fallback}</>
}
