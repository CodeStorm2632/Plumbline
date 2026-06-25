import { useState } from "react";

import { useAuditLogs, useLoginLogs } from "./api";

// 日志管理屏（SC-4，只读）。七态：加载/错误/空/无权限/缺失/只读/成功。
export function SysLogPage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员") || roles.includes("审计员"); // sys:log:read
  const [tab, setTab] = useState<"audit" | "login">("audit");
  const audit = useAuditLogs({});
  const loginLogs = useLoginLogs({});

  if (!canRead) {
    return <p className="p-6 text-amber-700" role="alert">无访问日志的权限。</p>;
  }

  const active = tab === "audit" ? audit : loginLogs;

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">日志管理</h1>
        <button className={tab === "audit" ? "font-semibold underline" : "text-gray-600"}
          onClick={() => setTab("audit")}>操作日志</button>
        <button className={tab === "login" ? "font-semibold underline" : "text-gray-600"}
          onClick={() => setTab("login")}>登录日志</button>
      </div>

      {active.isLoading && <p>加载中…</p>}
      {active.isError && (
        <div role="alert" className="text-red-600">
          加载失败。<button className="underline" onClick={() => active.refetch()}>重试</button>
        </div>
      )}
      {active.data && active.data.length === 0 && <p className="text-gray-500">暂无日志。</p>}

      {tab === "audit" && audit.data && audit.data.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">时间</th><th className="p-2">操作人</th>
              <th className="p-2">动作</th><th className="p-2">实体</th>
            </tr>
          </thead>
          <tbody>
            {audit.data.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.ts}</td><td className="p-2">{r.actor}</td>
                <td className="p-2">{r.action}</td><td className="p-2">{r.entity_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "login" && loginLogs.data && loginLogs.data.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">时间</th><th className="p-2">用户名</th>
              <th className="p-2">结果</th><th className="p-2">详情</th>
            </tr>
          </thead>
          <tbody>
            {loginLogs.data.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.ts}</td><td className="p-2">{r.username}</td>
                <td className="p-2">{r.success ? "成功" : "失败"}</td>
                <td className="p-2">{r.detail || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
