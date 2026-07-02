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
