import { useQuery } from "@tanstack/react-query"
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router"
import {
  BarChart3,
  ChevronDown,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  ScrollText,
  Settings,
  Shield,
  Sun,
  Users,
} from "lucide-react"
import { useState } from "react"

import { AuthContext, type AuthContextType } from "@/hooks/useAuthContext"
import { isLoggedIn, useAuth } from "@/hooks/useAuth"
import { apiGet } from "@/lib/api"
import type { MenuNode, UserMeResponse } from "@/types"
import { useTheme } from "@/components/theme-provider"

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({ to: "/login" })
    }
  },
})

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  Shield: <Shield className="h-4 w-4" />,
  FolderTree: <FolderTree className="h-4 w-4" />,
  ScrollText: <ScrollText className="h-4 w-4" />,
  BarChart3: <BarChart3 className="h-4 w-4" />,
  Settings: <Settings className="h-4 w-4" />,
}

function getIcon(iconName: string | null): React.ReactNode {
  if (!iconName) return <MenuIcon className="h-4 w-4" />
  return iconMap[iconName] || <MenuIcon className="h-4 w-4" />
}

function Layout() {
  const { logoutMutation } = useAuth()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())

  const { data: meData } = useQuery<UserMeResponse>({
    queryKey: ["currentUser"],
    queryFn: () => apiGet<UserMeResponse>("/auth/me"),
    enabled: isLoggedIn(),
    staleTime: 5 * 60 * 1000,
  })

  const authContext: AuthContextType = {
    user: meData || null,
    permissions: new Set(meData?.permissions || []),
    hasPermission: (code: string) => {
      if (meData?.is_superadmin) return true
      return meData?.permissions?.includes(code) || false
    },
  }

  const toggleSubMenu = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderMenuItems = (menus: MenuNode[], depth = 0) => {
    return menus
      .filter((m) => m.visible && m.menu_type !== "BTN")
      .map((menu) => {
        const hasChildren = menu.children && menu.children.length > 0
          && menu.children.some((c) => c.menu_type !== "BTN" && c.visible)
        const isExpanded = expandedMenus.has(menu.id)

        if (hasChildren) {
          return (
            <div key={menu.id}>
              <button
                type="button"
                onClick={() => toggleSubMenu(menu.id)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                style={{ paddingLeft: `${12 + depth * 16}px` }}
              >
                {getIcon(menu.icon)}
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{menu.name}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </>
                )}
              </button>
              {isExpanded && sidebarOpen && (
                <div>{renderMenuItems(menu.children!, depth + 1)}</div>
              )}
            </div>
          )
        }

        return (
          <Link
            key={menu.id}
            to={menu.path || "/"}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent [&.active]:bg-accent [&.active]:font-medium"
            style={{ paddingLeft: `${12 + depth * 16}px` }}
          >
            {getIcon(menu.icon)}
            {sidebarOpen && <span>{menu.name}</span>}
          </Link>
        )
      })
  }

  return (
    <AuthContext.Provider value={authContext}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside
          className={`flex flex-col border-r bg-card transition-all ${sidebarOpen ? "w-60" : "w-16"}`}
        >
          <div className="flex h-14 items-center border-b px-4">
            {sidebarOpen ? (
              <span className="text-lg font-bold">MatrixAdmin</span>
            ) : (
              <span className="text-lg font-bold">M</span>
            )}
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-2">
            {meData?.menus && renderMenuItems(meData.menus)}
          </nav>

          <div className="border-t p-2 space-y-1">
            <button
              type="button"
              onClick={() =>
                setTheme(theme === "dark" ? "light" : "dark")
              }
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {sidebarOpen && <span>切换主题</span>}
            </button>
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive hover:bg-accent"
            >
              <LogOut className="h-4 w-4" />
              {sidebarOpen && <span>退出登录</span>}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-1.5 hover:bg-accent"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="flex-1" />
            <span className="text-sm text-muted-foreground">
              {meData?.real_name || meData?.username || ""}
            </span>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  )
}
