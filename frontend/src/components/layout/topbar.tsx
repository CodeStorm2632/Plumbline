import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "../ui/button";
import type { NavTab } from "./nav-config";
import { tabLabel } from "./nav-config";

interface TopbarProps {
  activeTab: NavTab;
  onLogout: () => void;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({ activeTab, onLogout, sidebarCollapsed, onToggleSidebar }: TopbarProps) {
  return (
    <header
      style={{
        height: "var(--header-h)",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        padding: "0 20px",
        background: "var(--card)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Breadcrumb */}
      <nav
        aria-label="breadcrumb"
        style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-sm)" }}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? "展开侧栏" : "折叠侧栏"}
        >
          {sidebarCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
        </Button>
        <span style={{ color: "var(--muted-foreground)" }}>系统管理</span>
        <span style={{ color: "var(--border-strong)" }}>/</span>
        <span style={{ color: "var(--foreground)", fontWeight: "var(--font-medium)" }}>
          {tabLabel(activeTab)}
        </span>
      </nav>

      {/* Actions */}
      <Button variant="ghost" size="icon-sm" onClick={onLogout} title="退出登录">
        <LogOut size={15} />
      </Button>
    </header>
  );
}
