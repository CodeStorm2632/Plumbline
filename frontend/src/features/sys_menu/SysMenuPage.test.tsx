import { render, screen } from "@testing-library/react";
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
    expect(screen.getByText("编辑")).toBeInTheDocument();
    expect(screen.getByText("新建节点")).toBeInTheDocument();
  });
});
