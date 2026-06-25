import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SysRolePage } from "./SysRolePage";
vi.mock("./api", () => ({
    useRoles: vi.fn(() => ({ data: undefined, isLoading: true, isError: false })),
    useCreateRole: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
    useDeleteRole: () => ({ mutate: vi.fn(), isError: false }),
}));
import { useRoles } from "./api";
describe("SysRolePage 七态", () => {
    it("无权限：提示且隐藏写操作", () => {
        render(_jsx(SysRolePage, { roles: ["审计员"] }));
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText("新建角色")).toBeNull();
    });
    it("空态", () => {
        useRoles.mockReturnValue({
            data: [], isLoading: false, isError: false,
        });
        render(_jsx(SysRolePage, { roles: ["管理员"] }));
        expect(screen.getByText("暂无角色。")).toBeInTheDocument();
    });
    it("列表渲染 + 管理员可见新建", () => {
        useRoles.mockReturnValue({
            data: [{ id: "r-1", code: "ops", name: "运维", remark: "", menu_ids: ["m-a"] }],
            isLoading: false, isError: false,
        });
        render(_jsx(SysRolePage, { roles: ["管理员"] }));
        expect(screen.getByText("ops")).toBeInTheDocument();
        expect(screen.getByText("新建角色")).toBeInTheDocument();
    });
});
