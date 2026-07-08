import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SysMenuPage } from "./SysMenuPage";

vi.mock("./api", () => ({
  useMenus: vi.fn(() => ({ data: undefined, isLoading: true, isError: false })),
  useCreateMenu: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useUpdateMenu: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
  useDeleteMenu: () => ({ mutate: vi.fn() }),
}));

import { useMenus } from "./api";

describe("SysMenuPage 七态", () => {
  it("无权限：提示且隐藏写操作", () => {
    render(<SysMenuPage roles={["审计员"]} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByText("新建节点")).toBeNull();
  });

  it("空态", () => {
    (useMenus as ReturnType<typeof vi.fn>).mockReturnValue({ data: [], isLoading: false, isError: false });
    render(<SysMenuPage roles={["管理员"]} />);
    expect(screen.getByText("暂无菜单。")).toBeInTheDocument();
  });

  it("错误态可重试", () => {
    (useMenus as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined, isLoading: false, isError: true, refetch: vi.fn(),
    });
    render(<SysMenuPage roles={["管理员"]} />);
    expect(screen.getByRole("alert")).toHaveTextContent("加载失败");
  });

  it("树表渲染缺失权限码提示", () => {
    (useMenus as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [{ id: "m1", code: "btn", name: "按钮", type: "button", order_no: 0, children: [] }],
      isLoading: false, isError: false,
    });
    render(<SysMenuPage roles={["管理员"]} />);
    expect(screen.getByText("权限码缺失")).toBeInTheDocument();
    expect(screen.getByTitle("编辑")).toBeInTheDocument();
    expect(screen.getByText("新建节点")).toBeInTheDocument();
  });

  it("树可折叠：收起父节点后隐藏子节点", () => {
    (useMenus as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        {
          id: "p1", code: "access", name: "权限管理", type: "dir", order_no: 0,
          children: [
            { id: "c1", code: "users", name: "用户管理", type: "menu", path: "users", order_no: 1, children: [] },
          ],
        },
      ],
      isLoading: false, isError: false,
    });
    render(<SysMenuPage roles={["管理员"]} />);
    // 默认展开：子节点可见
    expect(screen.getByText("用户管理")).toBeInTheDocument();
    // 点击父节点的折叠开关后，子节点隐藏
    fireEvent.click(screen.getByRole("button", { name: "折叠" }));
    expect(screen.queryByText("用户管理")).toBeNull();
  });

  it("新建节点：父节点按类型约束（菜单选目录、按钮选菜单）", () => {
    (useMenus as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [
        {
          id: "d1", code: "access", name: "权限管理", type: "dir", order_no: 0,
          children: [
            {
              id: "m1", code: "users", name: "用户管理", type: "menu", path: "users", order_no: 1,
              children: [
                { id: "b1", code: "u-read", name: "用户查看", type: "button", perm_code: "sys:user:read", order_no: 2, children: [] },
              ],
            },
          ],
        },
      ],
      isLoading: false, isError: false,
    });
    render(<SysMenuPage roles={["管理员"]} />);
    fireEvent.click(screen.getByText("新建节点"));

    // 默认 type=菜单：父节点只能选目录，排除菜单/按钮，且无「顶级节点」
    let opts = screen.getAllByRole("option").map((o) => o.textContent ?? "");
    expect(opts.some((t) => t.includes("权限管理（目录）"))).toBe(true);
    expect(opts.some((t) => t.includes("用户管理"))).toBe(false);
    expect(opts.some((t) => t.includes("用户查看"))).toBe(false);
    expect(opts.some((t) => t.includes("顶级节点"))).toBe(false);

    // 切换 type=按钮：父节点只能选菜单
    fireEvent.change(screen.getByDisplayValue("菜单"), { target: { value: "button" } });
    opts = screen.getAllByRole("option").map((o) => o.textContent ?? "");
    expect(opts.some((t) => t.includes("用户管理（菜单）"))).toBe(true);
    expect(opts.some((t) => t.includes("权限管理"))).toBe(false);
  });
});
