import { beforeEach, describe, expect, it, vi } from "vitest";
import { http } from "./http";
describe("http mutator", () => {
    beforeEach(() => localStorage.clear());
    it("注入 Bearer 认证头", async () => {
        localStorage.setItem("token", "abc");
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: 1 }), { status: 200 }));
        vi.stubGlobal("fetch", fetchMock);
        await http({ url: "/api/x", method: "GET" });
        const headers = fetchMock.mock.calls[0][1].headers;
        expect(headers.Authorization).toBe("Bearer abc");
    });
    it("非 2xx 抛错", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("boom", { status: 500 })));
        await expect(http({ url: "/api/x", method: "GET" })).rejects.toThrow(/500/);
    });
    it("401 清除本地 token", async () => {
        localStorage.setItem("token", "stale");
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 401 })));
        await expect(http({ url: "/api/x", method: "GET" })).rejects.toThrow();
        expect(localStorage.getItem("token")).toBeNull();
    });
});
