import { defineConfig } from "orval";
// 从后端导出的契约生成类型 + TanStack Query hooks + Zod。运行：pnpm orval
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
  },
  zod: {
    input: { target: "../specs/contract/openapi.json" },
    output: { mode: "tags-split", target: "src/lib/api/generated",
              client: "zod", fileExtension: ".zod.ts" },
  },
});
