import { Users, ShieldCheck, Menu, BookOpen, FileText, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavTab = "users" | "roles" | "menus" | "dicts" | "logs";

export interface NavLeaf {
  kind: "leaf";
  key: NavTab;
  title: string;
  icon?: LucideIcon;
}

export interface NavBranch {
  kind: "branch";
  key: string;
  title: string;
  icon?: LucideIcon;
  defaultOpen?: boolean;
  items: NavLeaf[];
}

export type NavItem = NavLeaf | NavBranch;

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "总览",
    items: [
      { kind: "leaf", key: "logs", title: "仪表盘", icon: LayoutDashboard },
    ],
  },
  {
    title: "系统管理",
    items: [
      {
        kind: "branch",
        key: "access",
        title: "权限管理",
        icon: ShieldCheck,
        defaultOpen: true,
        items: [
          { kind: "leaf", key: "users", title: "用户管理", icon: Users },
          { kind: "leaf", key: "roles", title: "角色管理", icon: ShieldCheck },
          { kind: "leaf", key: "menus", title: "菜单管理", icon: Menu },
        ],
      },
      {
        kind: "branch",
        key: "basic",
        title: "基础数据",
        icon: BookOpen,
        defaultOpen: true,
        items: [
          { kind: "leaf", key: "dicts", title: "字典管理", icon: BookOpen },
        ],
      },
    ],
  },
  {
    title: "监控",
    items: [
      { kind: "leaf", key: "logs", title: "日志管理", icon: FileText },
    ],
  },
];

export const TAB_LABELS: Record<NavTab, string> = {
  users: "用户管理",
  roles: "角色管理",
  menus: "菜单管理",
  dicts: "字典管理",
  logs: "日志管理",
};

export type MenuTreeNode = {
  id: string;
  name: string;
  type: string;
  path?: string | null;
  icon?: string | null;
  children?: MenuTreeNode[];
};

const TAB_SET = new Set<NavTab>(Object.keys(TAB_LABELS) as NavTab[]);

const PATH_ICON_MAP: Partial<Record<NavTab, LucideIcon>> = {
  users: Users,
  roles: ShieldCheck,
  menus: Menu,
  dicts: BookOpen,
  logs: FileText,
};

const MENU_ICON_MAP: Record<string, LucideIcon> = {
  users: Users,
  user: Users,
  shield: ShieldCheck,
  shieldcheck: ShieldCheck,
  menu: Menu,
  book: BookOpen,
  filetext: FileText,
  logs: FileText,
  layoutdashboard: LayoutDashboard,
  dashboard: LayoutDashboard,
};

const normalizePath = (value: string | null | undefined) => (value ?? "").trim().replace(/^\//, "");
const normalizeIcon = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();

function resolveNodeIcon(node: MenuTreeNode, tab: NavTab): LucideIcon | undefined {
  const iconByName = MENU_ICON_MAP[normalizeIcon(node.icon)];
  return iconByName ?? PATH_ICON_MAP[tab];
}

export function isNavTab(path: string | null | undefined): path is NavTab {
  const normalized = normalizePath(path);
  return TAB_SET.has(normalized as NavTab);
}

function leafFromNode(node: MenuTreeNode): NavLeaf | null {
  if (!isNavTab(node.path)) return null;
  const tab = normalizePath(node.path) as NavTab;
  return {
    kind: "leaf",
    key: tab,
    title: node.name,
    icon: resolveNodeIcon(node, tab),
  };
}

// 目录节点 → 可折叠分支（复用侧栏 BranchItem）：大菜单本身即一行可点击/折叠的菜单项，
// 视觉与其下的子菜单项一致，且默认展开、可手动收起。
function branchFromDir(node: MenuTreeNode): NavBranch | null {
  const items = (node.children ?? [])
    .map((child) => leafFromNode(child))
    .filter((item): item is NavLeaf => Boolean(item));
  if (!items.length) return null;
  return {
    kind: "branch",
    key: node.id,
    title: node.name,
    icon: MENU_ICON_MAP[normalizeIcon(node.icon)],
    defaultOpen: true,
    items,
  };
}

export function buildNavGroupsFromMenus(nodes: MenuTreeNode[] | undefined): NavGroup[] {
  if (!nodes || nodes.length === 0) return NAV_GROUPS;

  const branches: NavBranch[] = [];
  const rootLeaves: NavLeaf[] = [];

  for (const node of nodes) {
    if (node.type === "dir") {
      const branch = branchFromDir(node);
      if (branch) branches.push(branch);
      continue;
    }
    const leaf = leafFromNode(node);
    if (leaf) rootLeaves.push(leaf);
  }

  const groups: NavGroup[] = [];
  if (rootLeaves.length) {
    groups.push({ title: "总览", items: rootLeaves });
  }
  if (branches.length) {
    // 目录分支统一置于同一分组（无小标题），呈现为一列可折叠的菜单项。
    groups.push({ title: "", items: branches });
  }
  return groups.length ? groups : NAV_GROUPS;
}

export function collectTabsFromMenus(nodes: MenuTreeNode[] | undefined): NavTab[] {
  if (!nodes || !nodes.length) return [];
  const tabs: NavTab[] = [];
  const visit = (arr: MenuTreeNode[]) => {
    for (const node of arr) {
      if (isNavTab(node.path)) {
        tabs.push(normalizePath(node.path) as NavTab);
      }
      if (node.children?.length) visit(node.children);
    }
  };
  visit(nodes);
  return Array.from(new Set(tabs));
}

export function tabLabel(tab: NavTab): string {
  return TAB_LABELS[tab] ?? tab;
}
