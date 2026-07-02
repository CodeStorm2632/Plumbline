import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, PlusCircle, Search, Trash2 } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { DataTable } from "../../components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogBody,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { NativeSelect } from "../../components/ui/native-select";
import { Skeleton } from "../../components/ui/skeleton";
import {
  type CreateDictInput,
  type CreateDictItemInput,
  type SysDict,
  type SysDictItem,
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
  const [dictDialogOpen, setDictDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  if (!canRead) {
    return (
      <p className="p-6" role="alert" style={{ color: "var(--warning-foreground)", background: "var(--warning-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
        无访问字典管理的权限。
      </p>
    );
  }

  const selectType = (code: string) => {
    setSelectedCode(code);
    setItemForm({ ...emptyItem, type_code: code });
    setEditingItemId(null);
  };

  const resetDict = () => { setEditingDictId(null); setDictForm(emptyDict); setDictDialogOpen(false); };
  const resetItem = () => { setEditingItemId(null); setItemForm({ ...emptyItem, type_code: selectedCode }); setItemDialogOpen(false); };

  const submitDict = () => {
    if (editingDictId) updateDict.mutate({ id: editingDictId, data: dictForm }, { onSuccess: resetDict });
    else createDict.mutate(dictForm, { onSuccess: (d) => { resetDict(); selectType(d.code); } });
  };

  const submitItem = () => {
    const data = { ...itemForm, type_code: selectedCode };
    if (editingItemId) updateItem.mutate({ id: editingItemId, data }, { onSuccess: resetItem });
    else createItem.mutate(data, { onSuccess: resetItem });
  };

  const dictColumns: ColumnDef<SysDict>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <button
          onClick={() => selectType(row.original.code)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--primary)",
            textDecoration: selectedCode === row.original.code ? "underline" : "none",
            fontWeight: selectedCode === row.original.code ? "var(--font-semibold)" : "inherit",
            padding: 0,
          }}
        >
          {row.original.code}
        </button>
      ),
    },
    { accessorKey: "name", header: "名称" },
    {
      accessorKey: "remark",
      header: "备注",
      cell: ({ row }) => (
        <span style={{ color: "var(--muted-foreground)" }}>{row.original.remark || "—"}</span>
      ),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "操作",
            cell: ({ row }: { row: { original: SysDict } }) => (
              <span style={{ display: "flex", gap: "4px" }}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="编辑"
                  onClick={() => {
                    setEditingDictId(row.original.id);
                    setDictForm({ code: row.original.code, name: row.original.name, remark: row.original.remark });
                    setDictDialogOpen(true);
                  }}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="删除"
                  style={{ color: "var(--destructive)" }}
                  onClick={() => deleteDict.mutate(row.original.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </span>
            ),
          } as ColumnDef<SysDict>,
        ]
      : []),
  ];

  const itemColumns: ColumnDef<SysDictItem>[] = [
    { accessorKey: "label", header: "标签" },
    {
      accessorKey: "value",
      header: "值",
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>
          {row.original.value}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Badge tone={row.original.status === "active" ? "success" : "neutral"} dot>
          {row.original.status === "active" ? "启用" : "停用"}
        </Badge>
      ),
    },
    ...(canWrite
      ? [
          {
            id: "item_actions",
            header: "操作",
            cell: ({ row }: { row: { original: SysDictItem } }) => (
              <span style={{ display: "flex", gap: "4px" }}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="编辑"
                  onClick={() => {
                    setEditingItemId(row.original.id);
                    setItemForm({ type_code: row.original.type_code, label: row.original.label, value: row.original.value, order_no: row.original.order_no, status: row.original.status });
                    setItemDialogOpen(true);
                  }}
                >
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="删除"
                  style={{ color: "var(--destructive)" }}
                  onClick={() => deleteItem.mutate(row.original.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </span>
            ),
          } as ColumnDef<SysDictItem>,
        ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", letterSpacing: "var(--tracking-tight)" }}>
        字典管理
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* 字典类型 */}
        <Card>
          <CardHeader>
            <CardTitle>字典类型</CardTitle>
            <div style={{ display: "flex", gap: "8px" }}>
              <Input leading={<Search size={13} />} placeholder="搜索" style={{ width: "160px" }} value={q} onChange={(e) => setQ(e.target.value)} />
              {canWrite && (
                <Dialog open={dictDialogOpen} onOpenChange={(o) => { if (!o) resetDict(); else setDictDialogOpen(true); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => { setEditingDictId(null); setDictForm(emptyDict); setDictDialogOpen(true); }}>
                      <PlusCircle size={13} />
                      新建
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingDictId ? "编辑字典类型" : "新建字典类型"}</DialogTitle>
                      <DialogDescription>填写类型编码和名称。</DialogDescription>
                    </DialogHeader>
                    <DialogBody>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>类型 Code <span style={{ color: "var(--destructive)" }}>*</span></label>
                          <Input placeholder="唯一标识" disabled={!!editingDictId} value={dictForm.code} onChange={(e) => setDictForm({ ...dictForm, code: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>名称 <span style={{ color: "var(--destructive)" }}>*</span></label>
                          <Input placeholder="显示名称" value={dictForm.name} onChange={(e) => setDictForm({ ...dictForm, name: e.target.value })} />
                        </div>
                        {(createDict.isError || updateDict.isError) && (
                          <p role="alert" style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
                            {String(((createDict.error ?? updateDict.error) as Error | null)?.message)}
                          </p>
                        )}
                      </div>
                    </DialogBody>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline" size="sm" onClick={resetDict}>取消</Button></DialogClose>
                      <Button size="sm" disabled={createDict.isPending || updateDict.isPending || !dictForm.code || !dictForm.name} onClick={submitDict}>
                        {editingDictId ? "保存" : "新建字典类型"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {dicts.isLoading && <Skeleton />}
            {dicts.isError && (
              <div role="alert" style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
                加载失败。<button onClick={() => dicts.refetch()} style={{ marginLeft: "4px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>重试</button>
              </div>
            )}
            {dicts.data && dicts.data.length === 0 && <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>暂无字典类型。</p>}
            {dicts.data && dicts.data.length > 0 && (
              <div>
                {/* Highlight selected row via inline row style override */}
                <DataTable
                  columns={dictColumns}
                  data={dicts.data.map((d) => ({ ...d, _selected: d.code === selectedCode }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* 字典项 */}
        <Card>
          <CardHeader>
            <CardTitle>字典项 {selectedCode ? `— ${selectedCode}` : ""}</CardTitle>
            {canWrite && selectedCode && (
              <Dialog open={itemDialogOpen} onOpenChange={(o) => { if (!o) resetItem(); else setItemDialogOpen(true); }}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => { setEditingItemId(null); setItemForm({ ...emptyItem, type_code: selectedCode }); setItemDialogOpen(true); }}>
                    <PlusCircle size={13} />
                    新建
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingItemId ? "编辑字典项" : "新建字典项"}</DialogTitle>
                    <DialogDescription>为字典类型 {selectedCode} 添加项目。</DialogDescription>
                  </DialogHeader>
                  <DialogBody>
                    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>标签 <span style={{ color: "var(--destructive)" }}>*</span></label>
                        <Input placeholder="显示文本" value={itemForm.label} onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>值 <span style={{ color: "var(--destructive)" }}>*</span></label>
                        <Input placeholder="存储值" value={itemForm.value} onChange={(e) => setItemForm({ ...itemForm, value: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>状态</label>
                        <NativeSelect value={itemForm.status ?? "active"} onChange={(e) => setItemForm({ ...itemForm, status: e.target.value })}>
                          <option value="active">启用</option>
                          <option value="disabled">停用</option>
                        </NativeSelect>
                      </div>
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <DialogClose asChild><Button variant="outline" size="sm" onClick={resetItem}>取消</Button></DialogClose>
                    <Button size="sm" disabled={createItem.isPending || updateItem.isPending || !itemForm.label || !itemForm.value} onClick={submitItem}>
                      {editingItemId ? "保存字典项" : "新建字典项"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            {!selectedCode && <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>请选择字典类型。</p>}
            {selectedCode && items.isLoading && <Skeleton />}
            {selectedCode && items.isError && (
              <div role="alert" style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
                加载失败。<button onClick={() => items.refetch()} style={{ marginLeft: "4px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>重试</button>
              </div>
            )}
            {selectedCode && items.data && items.data.length === 0 && <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>暂无字典项。</p>}
            {selectedCode && items.data && items.data.length > 0 && (
              <DataTable columns={itemColumns} data={items.data} zebra />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

