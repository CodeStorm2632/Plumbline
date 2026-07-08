import { describe, expect, it } from "vitest";
import { FileText, LayoutDashboard } from "lucide-react";

import { buildNavGroupsFromMenus, collectTabsFromMenus } from "./nav-config";

describe("nav-config 动态菜单映射", () => {
  it("将目录映射为可折叠分支，并过滤非页面路径", () => {
    const groups = buildNavGroupsFromMenus([
      {
        id: "m-nav-access",
        name: "权限管理",
        type: "dir",
        children: [
          { id: "m-nav-users", name: "用户管理", type: "menu", path: "users" },
          { id: "m-nav-roles", name: "角色管理", type: "menu", path: "roles" },
          { id: "m-nav-btn", name: "按钮权限", type: "button", path: "sys:user:write" },
        ],
      },
      {
        id: "m-nav-monitor",
        name: "监控",
        type: "dir",
        children: [{ id: "m-nav-logs", name: "日志管理", type: "menu", path: "logs" }],
      },
    ]);

    // 目录不再是分组标题，而是同一分组下的可折叠分支
    expect(groups).toHaveLength(1);
    const branches = groups[0].items;
    expect(branches.map((b) => (b.kind === "branch" ? b.title : ""))).toEqual([
      "权限管理",
      "监控",
    ]);
    const access = branches[0];
    const monitor = branches[1];
    if (access.kind !== "branch" || monitor.kind !== "branch") {
      throw new Error("expect branches");
    }
    expect(access.items.map((i) => i.key)).toEqual(["users", "roles"]);
    expect(monitor.items.map((i) => i.key)).toEqual(["logs"]);
  });

  it("提取当前用户可访问 tab 列表", () => {
    const tabs = collectTabsFromMenus([
      {
        id: "m-nav-access",
        name: "权限管理",
        type: "dir",
        children: [
          { id: "m-nav-users", name: "用户管理", type: "menu", path: "users" },
          { id: "m-nav-roles", name: "角色管理", type: "menu", path: "roles" },
        ],
      },
      {
        id: "m-nav-monitor",
        name: "监控",
        type: "dir",
        children: [{ id: "m-nav-logs", name: "日志管理", type: "menu", path: "logs" }],
      },
    ]);

    expect(tabs).toEqual(["users", "roles", "logs"]);
  });

  it("优先使用菜单 icon 字段映射图标", () => {
    const groups = buildNavGroupsFromMenus([
      {
        id: "m-nav-monitor",
        name: "监控",
        type: "dir",
        children: [
          { id: "m-nav-logs", name: "日志管理", type: "menu", path: "logs", icon: "LayoutDashboard" },
        ],
      },
    ]);

    const branch = groups[0].items[0];
    if (branch.kind !== "branch") throw new Error("expect branch");
    const item = branch.items[0];
    expect(item.icon).toBe(LayoutDashboard);
    expect(item.icon).not.toBe(FileText);
  });
});
