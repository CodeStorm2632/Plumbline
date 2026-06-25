import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SysLogPage } from "./SysLogPage";
vi.mock("./api", () => ({
    useAuditLogs: vi.fn(() => ({ data: undefined, isLoading: true, isError: false })),
    useLoginLogs: vi.fn(() => ({ data: undefined, isLoading: true, isError: false })),
}));
import { useAuditLogs } from "./api";
describe("SysLogPage", () => {
    it("无权限：提示", () => {
        render(_jsx(SysLogPage, { roles: [] }));
        expect(screen.getByRole("alert")).toHaveTextContent("无访问日志的权限");
    });
    it("审计员可见、空态", () => {
        useAuditLogs.mockReturnValue({
            data: [], isLoading: false, isError: false,
        });
        render(_jsx(SysLogPage, { roles: ["审计员"] }));
        expect(screen.getByText("暂无日志。")).toBeInTheDocument();
    });
    it("操作日志渲染", () => {
        useAuditLogs.mockReturnValue({
            data: [{ id: 1, entity_id: "u-1", actor: "admin", action: "create_user",
                    reason: "", before: {}, after: {}, ts: "2026-06-25T10:00:00" }],
            isLoading: false, isError: false,
        });
        render(_jsx(SysLogPage, { roles: ["管理员"] }));
        expect(screen.getByText("create_user")).toBeInTheDocument();
    });
});
