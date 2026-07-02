import * as React from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { NAV_GROUPS, type NavTab } from "./nav-config";

interface AppShellProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  username: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export function AppShell({
  activeTab,
  onNavigate,
  username,
  onLogout,
  children,
}: AppShellProps) {
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
        groups={NAV_GROUPS}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar activeTab={activeTab} onLogout={onLogout} />
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
