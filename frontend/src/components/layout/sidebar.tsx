import * as React from "react";
import type { NavGroup, NavTab, NavLeaf, NavBranch, NavItem } from "./nav-config";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      style={{
        transition: "transform var(--dur-fast)",
        transform: open ? "rotate(90deg)" : "none",
        flexShrink: 0,
      }}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LeafItem({
  item,
  active,
  onNavigate,
  depth = 0,
}: {
  item: NavLeaf;
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
  depth?: number;
}) {
  const isActive = active === item.key;
  const [hovered, setHovered] = React.useState(false);
  const Icon = item.icon;

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onNavigate(item.key);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={item.title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "9px",
        textDecoration: "none",
        height: "34px",
        paddingLeft: depth > 0 ? `${8 + depth * 18}px` : "8px",
        paddingRight: "8px",
        borderRadius: "var(--radius-md)",
        margin: "1px 0",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-sm)",
        fontWeight: isActive ? "var(--font-semibold)" : "var(--font-medium)",
        color: isActive
          ? "var(--sidebar-primary-foreground)"
          : "var(--sidebar-foreground)",
        background: isActive
          ? "var(--sidebar-primary)"
          : hovered
          ? "var(--sidebar-accent)"
          : "transparent",
        transition: "background var(--dur-fast), color var(--dur-fast)",
      }}
    >
      {Icon ? (
        <Icon
          size={16}
          style={{ flexShrink: 0, color: isActive ? "inherit" : "var(--muted-foreground)" }}
        />
      ) : depth > 0 ? (
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "currentColor",
            opacity: 0.4,
            flexShrink: 0,
          }}
        />
      ) : null}
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {item.title}
      </span>
    </a>
  );
}

function BranchItem({
  item,
  active,
  onNavigate,
}: {
  item: NavBranch;
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}) {
  const hasActiveChild = item.items.some((c) => c.key === active);
  const [open, setOpen] = React.useState(item.defaultOpen ?? hasActiveChild);
  const [hovered, setHovered] = React.useState(false);
  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "9px",
          width: "100%",
          height: "34px",
          padding: "0 8px",
          margin: "1px 0",
          border: "none",
          background: hovered ? "var(--sidebar-accent)" : "transparent",
          cursor: "pointer",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-medium)",
          color: hasActiveChild ? "var(--foreground)" : "var(--sidebar-foreground)",
          transition: "background var(--dur-fast)",
        }}
      >
        {Icon && (
          <Icon size={16} style={{ flexShrink: 0, color: "var(--muted-foreground)" }} />
        )}
        <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title}
        </span>
        <span style={{ color: "var(--muted-foreground)" }}>
          <ChevronIcon open={open} />
        </span>
      </button>
      {open && (
        <div>
          {item.items.map((child) => (
            <LeafItem
              key={child.key}
              item={child}
              active={active}
              onNavigate={onNavigate}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NavItems({
  items,
  active,
  onNavigate,
}: {
  items: NavItem[];
  active: NavTab;
  onNavigate: (tab: NavTab) => void;
}) {
  return (
    <>
      {items.map((item) =>
        item.kind === "branch" ? (
          <BranchItem key={item.key} item={item} active={active} onNavigate={onNavigate} />
        ) : (
          <LeafItem key={item.key} item={item} active={active} onNavigate={onNavigate} />
        )
      )}
    </>
  );
}

interface SidebarProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  username: string;
  groups: NavGroup[];
}

export function Sidebar({ activeTab, onNavigate, username, groups }: SidebarProps) {
  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        flexShrink: 0,
        background: "var(--sidebar)",
        borderRight: "1px solid var(--sidebar-border)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: "var(--header-h)",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          padding: "0 16px",
          borderBottom: "1px solid var(--sidebar-border)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "7px",
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--primary-foreground)",
            fontWeight: "var(--font-bold)",
            fontSize: "13px",
            flexShrink: 0,
          }}
        >
          P
        </div>
        <span
          style={{
            fontSize: "var(--text-md)",
            fontWeight: "var(--font-bold)",
            letterSpacing: "var(--tracking-tight)",
            color: "var(--sidebar-foreground)",
          }}
        >
          Plumbline
        </span>
      </div>

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {groups.map((g, gi) => (
          <div key={gi}>
            {g.title && (
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-2xs)",
                  fontWeight: "var(--font-semibold)",
                  letterSpacing: "var(--tracking-caps)",
                  textTransform: "uppercase",
                  color: "var(--muted-foreground)",
                  padding: "4px 8px 2px",
                }}
              >
                {g.title}
              </div>
            )}
            <NavItems items={g.items} active={activeTab} onNavigate={onNavigate} />
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        style={{
          borderTop: "1px solid var(--sidebar-border)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "var(--radius-full)",
            background: "var(--primary-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--text-xs)",
            fontWeight: "var(--font-semibold)",
            color: "var(--primary)",
            flexShrink: 0,
          }}
        >
          {username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
          <div
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-medium)",
              color: "var(--sidebar-foreground)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {username}
          </div>
          <div style={{ fontSize: "var(--text-2xs)", color: "var(--muted-foreground)" }}>
            系统管理员
          </div>
        </div>
      </div>
    </aside>
  );
}
