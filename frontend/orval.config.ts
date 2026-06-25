import { defineConfig } from "orval";
// 从后端导出的契约生成类型 + TanStack Query hooks + Zod。运行：pnpm orval
//
// hooks.afterAllFilesWrite：orval 7.21 fetch client 在 generated 函数里把第二参数
// 固定写成 `options?: RequestInit`，但 useQuery 的 queryFn 又把 `AbortSignal` 当作
// `options` 直接透传（已知 type-soundness 缺陷）。补丁脚本把形参类型扩宽到
// `RequestInit | AbortSignal`，让 generated 自身类型自洽；mutator 内部会做归一。
export default defineConfig({
  api: {
    input: { target: "../specs/contract/openapi.json" },
    output: {
      mode: "tags-split",
      target: "src/lib/api/generated",
      schemas: "src/lib/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      clean: true,
      override: {
        mutator: { path: "src/lib/api/http.ts", name: "http" },
        query: { useQuery: true, useMutation: true },
      },
    },
    hooks: {
      afterAllFilesWrite: "node scripts/orval-patch-abortsignal.mjs",
    },
  },
  zod: {
    input: { target: "../specs/contract/openapi.json" },
    output: { mode: "tags-split", target: "src/lib/api/generated",
              client: "zod", fileExtension: ".zod.ts" },
  },
});
