import { useState } from "react";

import {
  type CreateMenuInput,
  type SysMenu,
  useCreateMenu,
  useDeleteMenu,
  useMenus,
  useUpdateMenu,
} from "./api";

function flattenMenus(items: SysMenu[], depth = 0): Array<SysMenu & { depth: number }> {
  return items.flatMap((item) => [{ ...item, depth }, ...flattenMenus(item.children ?? [], depth + 1)]);
}

const emptyForm: CreateMenuInput = { code: "", name: "", type: "menu", order_no: 0 };

// 菜单管理屏（SC-5）。七态：加载/错误/空/无权限/缺失/越权/成功。
export function SysMenuPage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员");
  const canWrite = roles.includes("管理员");
  const menus = useMenus();
  const create = useCreateMenu();
  const update = useUpdateMenu();
  const del = useDeleteMenu();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateMenuInput>(emptyForm);

  if (!canRead) {
    return <p className="p-6 text-amber-700" role="alert">无访问菜单管理的权限。</p>;
  }

  const rows = menus.data ? flattenMenus(menus.data) : [];
  const reset = () => { setEditingId(null); setForm(emptyForm); };
  const submit = () => {
    if (editingId) {
      update.mutate({ id: editingId, data: form }, { onSuccess: reset });
    } else {
      create.mutate(form, { onSuccess: reset });
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-xl font-semibold">菜单管理</h1>

      {canWrite && (
        <div className="flex flex-wrap items-end gap-2 rounded border p-3">
          <input className="border p-1 disabled:bg-gray-100" placeholder="菜单码" disabled={!!editingId}
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <input className="border p-1" placeholder="名称"
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="border p-1" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value, perm_code: e.target.value === "button" ? form.perm_code : null })}>
            <option value="dir">目录</option><option value="menu">菜单</option><option value="button">按钮</option>
          </select>
          <input className="border p-1" placeholder="父节点 ID"
            value={form.parent_id ?? ""} onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })} />
          <input className="border p-1" placeholder="路径"
            value={form.path ?? ""} onChange={(e) => setForm({ ...form, path: e.target.value || null })} />
          <input className="border p-1" placeholder="权限码"
            value={form.perm_code ?? ""} onChange={(e) => setForm({ ...form, perm_code: e.target.value || null })} />
          <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
            disabled={create.isPending || update.isPending || !form.code || !form.name}
            onClick={submit}>
            {create.isPending || update.isPending ? "提交中…" : editingId ? "保存菜单" : "新建节点"}
          </button>
          {editingId && <button className="rounded border px-3 py-1" onClick={reset}>取消编辑</button>}
          {(create.isError || update.isError) && (
            <span className="text-sm text-red-600">
              {String(((create.error || update.error) as Error).message)}
            </span>
          )}
        </div>
      )}

      {menus.isLoading && <p>加载中…</p>}
      {menus.isError && (
        <div role="alert" className="text-red-600">
          加载失败。<button className="underline" onClick={() => menus.refetch()}>重试</button>
        </div>
      )}
      {menus.data && rows.length === 0 && <p className="text-gray-500">暂无菜单。</p>}

      {rows.length > 0 && (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">名称/层级</th><th className="p-2">类型</th>
              <th className="p-2">路径</th><th className="p-2">权限码</th>{canWrite && <th className="p-2">操作</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="p-2" style={{ paddingLeft: `${m.depth * 20 + 8}px` }}>{m.name}</td>
                <td className="p-2">{m.type}</td>
                <td className="p-2">{m.path || "—"}</td>
                <td className="p-2">{m.perm_code || (m.type === "button" ? "权限码缺失" : "—")}</td>
                {canWrite && (
                  <td className="space-x-2 p-2">
                    <button className="text-blue-600 hover:underline" onClick={() => {
                      setEditingId(m.id);
                      setForm({ code: m.code, name: m.name, type: m.type, parent_id: m.parent_id, path: m.path, perm_code: m.perm_code, icon: m.icon, order_no: m.order_no });
                    }}>编辑</button>
                    <button className="text-red-600 hover:underline" onClick={() => del.mutate(m.id)}>删除</button>
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
