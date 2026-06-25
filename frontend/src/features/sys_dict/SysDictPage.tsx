import { useState } from "react";

import {
  type CreateDictInput,
  type CreateDictItemInput,
  useCreateDict,
  useCreateDictItem,
  useDeleteDict,
  useDeleteDictItem,
  useDictItems,
  useDicts,
  useUpdateDict,
  useUpdateDictItem,
} from "./api";

const emptyDict: CreateDictInput = { code: "", name: "" };
const emptyItem: CreateDictItemInput = { type_code: "", label: "", value: "", order_no: 0 };

// 字典管理屏（SC-6）。七态：加载/错误/空/无权限/缺失/越权/成功。
export function SysDictPage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员");
  const canWrite = roles.includes("管理员");
  const [q, setQ] = useState("");
  const dicts = useDicts(q);
  const [selectedCode, setSelectedCode] = useState<string>("");
  const items = useDictItems(selectedCode);
  const createDict = useCreateDict();
  const updateDict = useUpdateDict();
  const deleteDict = useDeleteDict();
  const createItem = useCreateDictItem();
  const updateItem = useUpdateDictItem();
  const deleteItem = useDeleteDictItem();
  const [editingDictId, setEditingDictId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [dictForm, setDictForm] = useState<CreateDictInput>(emptyDict);
  const [itemForm, setItemForm] = useState<CreateDictItemInput & { status?: string }>(emptyItem);

  if (!canRead) {
    return <p className="p-6 text-amber-700" role="alert">无访问字典管理的权限。</p>;
  }

  const selectType = (code: string) => {
    setSelectedCode(code);
    setItemForm({ ...emptyItem, type_code: code });
    setEditingItemId(null);
  };
  const resetDict = () => { setEditingDictId(null); setDictForm(emptyDict); };
  const resetItem = () => { setEditingItemId(null); setItemForm({ ...emptyItem, type_code: selectedCode }); };
  const submitDict = () => {
    if (editingDictId) updateDict.mutate({ id: editingDictId, data: dictForm }, { onSuccess: resetDict });
    else createDict.mutate(dictForm, { onSuccess: (d) => { resetDict(); selectType(d.code); } });
  };
  const submitItem = () => {
    const data = { ...itemForm, type_code: selectedCode };
    if (editingItemId) updateItem.mutate({ id: editingItemId, data }, { onSuccess: resetItem });
    else createItem.mutate(data, { onSuccess: resetItem });
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">字典管理</h1>
        <input className="border p-1" placeholder="搜索类型" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {canWrite && (
        <div className="flex flex-wrap items-end gap-2 rounded border p-3">
          <input className="border p-1 disabled:bg-gray-100" placeholder="类型 code" disabled={!!editingDictId}
            value={dictForm.code} onChange={(e) => setDictForm({ ...dictForm, code: e.target.value })} />
          <input className="border p-1" placeholder="类型名称"
            value={dictForm.name} onChange={(e) => setDictForm({ ...dictForm, name: e.target.value })} />
          <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50"
            disabled={createDict.isPending || updateDict.isPending || !dictForm.code || !dictForm.name}
            onClick={submitDict}>
            {createDict.isPending || updateDict.isPending ? "提交中…" : editingDictId ? "保存字典类型" : "新建字典类型"}
          </button>
          {editingDictId && <button className="rounded border px-3 py-1" onClick={resetDict}>取消编辑</button>}
          {(createDict.isError || updateDict.isError) && <span className="text-sm text-red-600">{String(((createDict.error || updateDict.error) as Error).message)}</span>}
        </div>
      )}

      {dicts.isLoading && <p>加载中…</p>}
      {dicts.isError && <div role="alert" className="text-red-600">加载失败。<button className="underline" onClick={() => dicts.refetch()}>重试</button></div>}
      {dicts.data && dicts.data.length === 0 && <p className="text-gray-500">暂无字典类型。</p>}

      {dicts.data && dicts.data.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <table className="w-full border-collapse text-sm">
            <thead><tr className="border-b text-left"><th className="p-2">code</th><th className="p-2">名称</th><th className="p-2">备注</th>{canWrite && <th className="p-2">操作</th>}</tr></thead>
            <tbody>{dicts.data.map((d) => (
              <tr key={d.id} className={selectedCode === d.code ? "border-b bg-blue-50" : "border-b"}>
                <td className="p-2"><button className="underline" onClick={() => selectType(d.code)}>{d.code}</button></td>
                <td className="p-2">{d.name}</td>
                <td className="p-2">{d.remark || "—"}</td>
                {canWrite && <td className="space-x-2 p-2"><button className="text-blue-600 hover:underline" onClick={() => { setEditingDictId(d.id); setDictForm({ code: d.code, name: d.name, remark: d.remark }); }}>编辑</button><button className="text-red-600 hover:underline" onClick={() => deleteDict.mutate(d.id)}>删除</button></td>}
              </tr>
            ))}</tbody>
          </table>

          <section className="space-y-3 rounded border p-3">
            <h2 className="font-medium">字典项 {selectedCode || "（请选择字典类型）"}</h2>
            {!selectedCode && <p className="text-gray-500">请选择字典类型。</p>}
            {selectedCode && canWrite && (
              <div className="flex flex-wrap items-end gap-2">
                <input className="border p-1" placeholder="label" value={itemForm.label} onChange={(e) => setItemForm({ ...itemForm, label: e.target.value, type_code: selectedCode })} />
                <input className="border p-1" placeholder="value" value={itemForm.value} onChange={(e) => setItemForm({ ...itemForm, value: e.target.value, type_code: selectedCode })} />
                <select className="border p-1" value={itemForm.status ?? "active"} onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}>
                  <option value="active">active</option><option value="disabled">disabled</option>
                </select>
                <button className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50" disabled={createItem.isPending || updateItem.isPending || !itemForm.label || !itemForm.value} onClick={submitItem}>
                  {editingItemId ? "保存字典项" : "新建字典项"}
                </button>
                {editingItemId && <button className="rounded border px-3 py-1" onClick={resetItem}>取消编辑</button>}
              </div>
            )}
            {items.isLoading && <p>加载中…</p>}
            {items.isError && <div role="alert" className="text-red-600">加载失败。<button className="underline" onClick={() => items.refetch()}>重试</button></div>}
            {selectedCode && items.data && items.data.length === 0 && <p className="text-gray-500">暂无字典项。</p>}
            {items.data && items.data.length > 0 && (
              <table className="w-full border-collapse text-sm">
                <thead><tr className="border-b text-left"><th className="p-2">label</th><th className="p-2">value</th><th className="p-2">状态</th>{canWrite && <th className="p-2">操作</th>}</tr></thead>
                <tbody>{items.data.map((i) => (
                  <tr key={i.id} className="border-b"><td className="p-2">{i.label}</td><td className="p-2">{i.value}</td><td className="p-2">{i.status}</td>{canWrite && <td className="space-x-2 p-2"><button className="text-blue-600 hover:underline" onClick={() => { setEditingItemId(i.id); setItemForm({ type_code: i.type_code, label: i.label, value: i.value, order_no: i.order_no, status: i.status }); }}>编辑</button><button className="text-red-600 hover:underline" onClick={() => deleteItem.mutate(i.id)}>删除</button></td>}</tr>
                ))}</tbody>
              </table>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
