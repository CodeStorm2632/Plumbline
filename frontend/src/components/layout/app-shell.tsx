import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { NavGroup, NavTab } from "./nav-config";

interface AppShellProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  username: string;
  onLogout: () => void;
  groups: NavGroup[];
  navLoading?: boolean;
  navError?: boolean;
  onRetryNav?: () => void;
  children: React.ReactNode;
}

export function AppShell({
  activeTab,
  onNavigate,
  username,
  onLogout,
  groups,
  navLoading,
  navError,
  onRetryNav,
  children,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--background)",
        fontFamily: "var(--font-sans)",
        color: "var(--foreground)",
      }}
    >
      <Sidebar
        activeTab={activeTab}
        onNavigate={onNavigate}
        username={username}
        groups={groups}
        loading={navLoading}
        error={navError}
        onRetry={onRetryNav}
        collapsed={sidebarCollapsed}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar
          activeTab={activeTab}
          onLogout={onLogout}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        />
        <main
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
