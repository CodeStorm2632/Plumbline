import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SysUserPage } from "./SysUserPage";
vi.mock("./api", () => ({
    useUsers: vi.fn(() => ({ data: undefined, isLoading: true, isError: false })),
    useCreateUser: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
    useDeleteUser: () => ({ mutate: vi.fn() }),
}));
import { useUsers } from "./api";
describe("SysUserPage 七态", () => {
    it("无权限：显示提示且隐藏写操作", () => {
        render(_jsx(SysUserPage, { roles: ["审计员"] }));
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText("新建用户")).toBeNull();
    });
    it("空态", () => {
        useUsers.mockReturnValue({
            data: [], isLoading: false, isError: false,
        });
        render(_jsx(SysUserPage, { roles: ["管理员"] }));
        expect(screen.getByText("暂无用户。")).toBeInTheDocument();
    });
    it("错误态可重试", () => {
        useUsers.mockReturnValue({
            data: undefined, isLoading: false, isError: true, refetch: vi.fn(),
        });
        render(_jsx(SysUserPage, { roles: ["管理员"] }));
        expect(screen.getByRole("alert")).toHaveTextContent("加载失败");
    });
    it("列表渲染脱敏值，管理员可见新建", () => {
        useUsers.mockReturnValue({
            data: [{ id: "u1", username: "admin", phone: "138****8000",
                    email: "a***@corp.com", roles: ["管理员"], status: "active" }],
            isLoading: false, isError: false,
        });
        render(_jsx(SysUserPage, { roles: ["管理员"] }));
        expect(screen.getByText("138****8000")).toBeInTheDocument();
        expect(screen.getByText("新建用户")).toBeInTheDocument();
    });
});
