#!/usr/bin/env node
// orval 7.21 fetch client 在 generated 函数里把第二参数固定写成 `options?: RequestInit`，
// 但 useQuery 的 queryFn 又把 `AbortSignal` 直接当 `options` 透传，导致 TS2559/TS2345。
// 这里在 orval 生成完成后做一次纯字符串补丁：
//   1) 形参类型扩宽：options?: RequestInit  →  options?: RequestInit | AbortSignal
//   2) headers 透传窄化：options?.headers   →  (options as RequestInit | undefined)?.headers
// 让 generated 自身的类型自洽；运行时为 AbortSignal 时 `.headers` 是 undefined，spread 空，
// mutator 内部会做形态归一。零运行时影响。
//
// 触发：orval.config.ts 的 hooks.afterAllFilesWrite。
import { readFileSync, writeFileSync } from "node:fs";

const PATCHES = [
  { from: /options\?: RequestInit\b/g, to: "options?: RequestInit | AbortSignal" },
  { from: /\.\.\.options\?\.headers\b/g, to: "...(options as RequestInit | undefined)?.headers" },
];

const files = process.argv.slice(2);
let touched = 0;
for (const f of files) {
  if (!f.endsWith(".ts") || f.endsWith(".zod.ts")) continue;
  const src = readFileSync(f, "utf8");
  let next = src;
  for (const { from, to } of PATCHES) next = next.replace(from, to);
  if (next === src) continue;
  writeFileSync(f, next);
  touched += 1;
}
if (touched) console.log(`[orval-patch] widened RequestInit/headers in ${touched} file(s)`);
