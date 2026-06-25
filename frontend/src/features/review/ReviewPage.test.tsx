import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewPage } from "./ReviewPage";

function wrap(ui: ReactNode) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}
const okJson = (data: unknown) => new Response(JSON.stringify(data), { status: 200 });
afterEach(() => vi.restoreAllMocks());

describe("ReviewPage 状态覆盖", () => {
  it("空态：无数据显示占位", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson([])));
    wrap(<ReviewPage roles={["评审专家"]} />);
    await waitFor(() => expect(screen.getByText(/暂无可复核数据/)).toBeInTheDocument());
  });

  it("错误态：失败显示重试", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("x", { status: 500 })));
    wrap(<ReviewPage roles={["评审专家"]} />);
    await waitFor(() => expect(screen.getByText(/加载失败/)).toBeInTheDocument());
  });

  it("否决降级 + 无权限隐藏质检按钮", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(okJson(
      [{ id: "A1", name: "张三", total: 5, qc_confirmed: true, veto: true }])));
    wrap(<ReviewPage roles={["回测分析员"]} />);              // 无 review:qc
    await waitFor(() => expect(screen.getByText(/一票否决/)).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: "质检" })).toBeNull();
  });
});
