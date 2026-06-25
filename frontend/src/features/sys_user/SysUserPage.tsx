import { useState } from "react";

import { type CreateUserInput, useCreateUser, useDeleteUser, useUsers } from "./api";

// 用户管理屏（SC-2）。覆盖七态：加载/错误/空/无权限/缺失/越权/成功。
// 敏感字段经 envelope.ts 信封加密上送；列表展示脱敏值。
export function SysUserPage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员");          // sys:user:read（演示按角色判定）
  const canWrite = roles.includes("管理员");          // sys:user:write
  const [q, setQ] = useState("");
  const users = useUsers(q);
  const create = useCreateUser();
  const del = useDeleteUser();
  const [form, setForm] = useState<CreateUserInput>({ username: "", password: "" });

  if (!canRead) {
    return <p className="p-6 text-amber-700" role="alert">无访问用户管理的权限。</p>;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">用户管理</h1>
        <input className="border p-1" placeholder="搜索用户名"
          value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {canWrite && (
        <div className="flex flex-wrap items-end gap-2 rounded border p-3">
          <input className="border p-1" placeholder="用户名"
            value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="border p-1" type="password" placeholder="口令"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input className="border p-1" placeholder="手机"
            value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
            disabled={create.isPending || !form.username || !form.password}
            onClick={() => create.mutate(form, { onSuccess: () => setForm({ username: "", password: "" }) })}>
            {create.isPending ? "提交中…" : "新建用户"}
          </button>
          {create.isError && (
            <span className="text-sm text-red-600">{String((create.error as Error).message)}</span>
          )}
        </div>
      )}

      {users.isLoading && <p>加载中…</p>}
      {users.isError && (
        <div role="alert" className="text-red-600">
          加载失败。<button className="underline" onClick={() => users.refetch()}>重试</button>
        </div>
      )}
      {users.data && users.data.length === 0 && <p className="text-gray-500">暂无用户。</p>}

      {users.data && users.data.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">用户名</th><th className="p-2">手机</th><th className="p-2">邮箱</th>
              <th className="p-2">角色</th><th className="p-2">状态</th>
              {canWrite && <th className="p-2">操作</th>}
            </tr>
          </thead>
          <tbody>
            {users.data.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.phone ?? "—"}</td>
                <td className="p-2">{u.email ?? "—"}</td>
                <td className="p-2">{u.roles.join("、") || "—"}</td>
                <td className="p-2">{u.status}</td>
                {canWrite && (
                  <td className="p-2">
                    <button className="text-red-600 hover:underline"
                      onClick={() => del.mutate(u.id)}>删除</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
