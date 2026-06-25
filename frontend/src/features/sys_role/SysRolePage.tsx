import { useState } from "react";

import { useCreateRole, useDeleteRole, useRoles } from "./api";

// 角色管理屏（SC-3）。七态：加载/错误/空/无权限/缺失/越权(409)/成功。
export function SysRolePage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员");
  const canWrite = roles.includes("管理员");
  const list = useRoles();
  const create = useCreateRole();
  const del = useDeleteRole();
  const [form, setForm] = useState({ code: "", name: "" });

  if (!canRead) {
    return <p className="p-6 text-amber-700" role="alert">无访问角色管理的权限。</p>;
  }

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">角色管理</h1>

      {canWrite && (
        <div className="flex flex-wrap items-end gap-2 rounded border p-3">
          <input className="border p-1" placeholder="角色码"
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="border p-1" placeholder="名称"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
            disabled={create.isPending || !form.code || !form.name}
            onClick={() => create.mutate(form, { onSuccess: () => setForm({ code: "", name: "" }) })}>
            {create.isPending ? "提交中…" : "新建角色"}
          </button>
          {create.isError && (
            <span className="text-sm text-red-600">{String((create.error as Error).message)}</span>
          )}
        </div>
      )}

      {list.isLoading && <p>加载中…</p>}
      {list.isError && (
        <div role="alert" className="text-red-600">
          加载失败。<button className="underline" onClick={() => list.refetch()}>重试</button>
        </div>
      )}
      {list.data && list.data.length === 0 && <p className="text-gray-500">暂无角色。</p>}

      {list.data && list.data.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">角色码</th><th className="p-2">名称</th>
              <th className="p-2">权限数</th>{canWrite && <th className="p-2">操作</th>}
            </tr>
          </thead>
          <tbody>
            {list.data.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{r.code}</td>
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.menu_ids.length}</td>
                {canWrite && (
                  <td className="p-2">
                    <button className="text-red-600 hover:underline"
                      onClick={() => del.mutate(r.id)}>删除</button>
                    {del.isError && (
                      <span className="ml-2 text-xs text-red-600">
                        {String((del.error as Error).message)}
                      </span>
                    )}
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
