import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SysDictPage } from "./SysDictPage";
vi.mock("./api", () => ({
    useDicts: vi.fn(() => ({ data: undefined, isLoading: true, isError: false })),
    useDictItems: vi.fn(() => ({ data: undefined, isLoading: false, isError: false })),
    useCreateDict: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
    useUpdateDict: () => ({ mutate: vi.fn(), isPending: false, isError: false }),
    useDeleteDict: () => ({ mutate: vi.fn() }),
    useCreateDictItem: () => ({ mutate: vi.fn(), isPending: false }),
    useUpdateDictItem: () => ({ mutate: vi.fn(), isPending: false }),
    useDeleteDictItem: () => ({ mutate: vi.fn() }),
}));
import { useDictItems, useDicts } from "./api";
describe("SysDictPage 七态", () => {
    it("无权限：提示且隐藏写操作", () => {
        render(_jsx(SysDictPage, { roles: ["审计员"] }));
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.queryByText("新建字典类型")).toBeNull();
    });
    it("空态", () => {
        useDicts.mockReturnValue({ data: [], isLoading: false, isError: false });
        render(_jsx(SysDictPage, { roles: ["管理员"] }));
        expect(screen.getByText("暂无字典类型。")).toBeInTheDocument();
    });
    it("错误态可重试", () => {
        useDicts.mockReturnValue({
            data: undefined, isLoading: false, isError: true, refetch: vi.fn(),
        });
        render(_jsx(SysDictPage, { roles: ["管理员"] }));
        expect(screen.getByRole("alert")).toHaveTextContent("加载失败");
    });
    it("渲染类型并提示选择字典类型", () => {
        useDicts.mockReturnValue({
            data: [{ id: "d1", code: "status", name: "状态", remark: "" }], isLoading: false, isError: false,
        });
        useDictItems.mockReturnValue({ data: undefined, isLoading: false, isError: false });
        render(_jsx(SysDictPage, { roles: ["管理员"] }));
        expect(screen.getByText("status")).toBeInTheDocument();
        expect(screen.getByText("编辑")).toBeInTheDocument();
        expect(screen.getByText("请选择字典类型。")).toBeInTheDocument();
        expect(screen.getByText("新建字典类型")).toBeInTheDocument();
    });
});
