import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import type { NavTab } from "./nav-config";
import { TAB_LABELS } from "./nav-config";

interface TopbarProps {
  activeTab: NavTab;
  onLogout: () => void;
}

export function Topbar({ activeTab, onLogout }: TopbarProps) {
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
        <span style={{ color: "var(--muted-foreground)" }}>系统管理</span>
        <span style={{ color: "var(--border-strong)" }}>/</span>
        <span style={{ color: "var(--foreground)", fontWeight: "var(--font-medium)" }}>
          {TAB_LABELS[activeTab]}
        </span>
      </nav>

      {/* Actions */}
      <Button variant="ghost" size="icon-sm" onClick={onLogout} title="退出登录">
        <LogOut size={15} />
      </Button>
    </header>
  );
}
