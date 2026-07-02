import * as React from "react";

export interface TreeNodeType {
  key: string;
  label: string;
  children?: TreeNodeType[];
  code?: string;
  type?: string;
}

function collectKeys(node: TreeNodeType): string[] {
  const acc: string[] = [node.key];
  (node.children ?? []).forEach((c) => acc.push(...collectKeys(c)));
  return acc;
}

function CheckBox({
  state,
  onClick,
}: {
  state: "checked" | "unchecked" | "indeterminate";
  onClick: () => void;
}) {
  const on = state === "checked" || state === "indeterminate";
  return (
    <span
      role="checkbox"
      aria-checked={state === "indeterminate" ? "mixed" : state === "checked"}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        flexShrink: 0,
        borderRadius: "var(--radius-sm)",
        border: `1.5px solid ${on ? "var(--primary)" : "var(--border-strong)"}`,
        background: on ? "var(--primary)" : "var(--card)",
        color: "var(--primary-foreground)",
        cursor: "pointer",
        transition: "background var(--dur-fast), border-color var(--dur-fast)",
      }}
    >
      {state === "indeterminate" ? (
        <svg width="10" height="10" viewBox="0 0 10 10">
          <rect x="1.5" y="4.25" width="7" height="1.5" rx="0.75" fill="currentColor" />
        </svg>
      ) : state === "checked" ? (
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2 5 8.5 9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

function TreeNode({
  node,
  depth,
  checkedSet,
  expandedSet,
  onToggleCheck,
  onToggleExpand,
}: {
  node: TreeNodeType;
  depth: number;
  checkedSet: Set<string>;
  expandedSet: Set<string>;
  onToggleCheck: (node: TreeNodeType) => void;
  onToggleExpand: (key: string) => void;
}) {
  const children = node.children ?? [];
  const hasChildren = children.length > 0;
  const expanded = expandedSet.has(node.key);

  // Derive tri-state
  let state: "checked" | "unchecked" | "indeterminate" = "unchecked";
  if (hasChildren) {
    const allKeys = collectKeys(node).filter((k) => k !== node.key);
    const checkedCount = allKeys.filter((k) => checkedSet.has(k)).length;
    if (checkedCount === 0 && !checkedSet.has(node.key)) state = "unchecked";
    else if (checkedCount === allKeys.length && checkedSet.has(node.key)) state = "checked";
    else if (checkedCount === allKeys.length && !checkedSet.has(node.key))
      state = "checked"; // all descendants
    else state = "indeterminate";
  } else {
    state = checkedSet.has(node.key) ? "checked" : "unchecked";
  }

  const [hovered, setHovered] = React.useState(false);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          height: "32px",
          paddingLeft: 6 + depth * 20 + "px",
          paddingRight: "6px",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-sm)",
          color: "var(--foreground)",
          background: hovered ? "var(--accent)" : "transparent",
          cursor: "default",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span
          onClick={() => hasChildren && onToggleExpand(node.key)}
          style={{
            display: "inline-flex",
            width: "14px",
            height: "14px",
            alignItems: "center",
            justifyContent: "center",
            cursor: hasChildren ? "pointer" : "default",
            color: "var(--muted-foreground)",
            flexShrink: 0,
          }}
        >
          {hasChildren && (
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              style={{
                transform: expanded ? "rotate(90deg)" : "none",
                transition: "transform var(--dur-fast)",
              }}
            >
              <path
                d="M6 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
        <CheckBox state={state} onClick={() => onToggleCheck(node)} />
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            flex: 1,
            overflow: "hidden",
          }}
          onClick={() => hasChildren && onToggleExpand(node.key)}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {node.label}
          </span>
          {node.code && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-2xs)",
                color: "var(--muted-foreground)",
                background: "var(--muted)",
                padding: "1px 5px",
                borderRadius: "var(--radius-xs)",
                flexShrink: 0,
              }}
            >
              {node.code}
            </span>
          )}
          {node.type === "button" && (
            <span
              style={{
                fontSize: "var(--text-2xs)",
                color: "var(--info-subtle-foreground)",
                background: "var(--info-subtle)",
                padding: "0 5px",
                borderRadius: "var(--radius-xs)",
                flexShrink: 0,
              }}
            >
              按钮
            </span>
          )}
        </span>
      </div>
      {hasChildren && expanded && (
        <div>
          {children.map((c) => (
            <TreeNode
              key={c.key}
              node={c}
              depth={depth + 1}
              checkedSet={checkedSet}
              expandedSet={expandedSet}
              onToggleCheck={onToggleCheck}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface PermissionTreeProps {
  nodes: TreeNodeType[];
  checkedKeys: string[];
  onChange: (keys: string[]) => void;
  defaultExpandAll?: boolean;
  style?: React.CSSProperties;
}

export function PermissionTree({
  nodes,
  checkedKeys,
  onChange,
  defaultExpandAll = true,
  style,
}: PermissionTreeProps) {
  const checkedSet = React.useMemo(() => new Set(checkedKeys), [checkedKeys]);

  const [expandedSet, setExpanded] = React.useState<Set<string>>(() => {
    const s = new Set<string>();
    if (defaultExpandAll) {
      const walk = (n: TreeNodeType) => {
        if (n.children?.length) {
          s.add(n.key);
          n.children.forEach(walk);
        }
      };
      nodes.forEach(walk);
    }
    return s;
  });

  const onToggleExpand = (key: string) =>
    setExpanded((prev) => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });

  const onToggleCheck = (node: TreeNodeType) => {
    const keys = collectKeys(node);
    const isFullyChecked = keys.every((k) => checkedSet.has(k));
    const next = new Set(checkedSet);
    if (isFullyChecked) keys.forEach((k) => next.delete(k));
    else keys.forEach((k) => next.add(k));
    onChange([...next]);
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", ...style }}>
      {nodes.map((n) => (
        <TreeNode
          key={n.key}
          node={n}
          depth={0}
          checkedSet={checkedSet}
          expandedSet={expandedSet}
          onToggleCheck={onToggleCheck}
          onToggleExpand={onToggleExpand}
        />
      ))}
    </div>
  );
}
