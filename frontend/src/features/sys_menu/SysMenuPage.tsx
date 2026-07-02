import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Edit2, PlusCircle, Trash2 } from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
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
  type CreateMenuInput,
  type SysMenu,
  useCreateMenu,
  useDeleteMenu,
  useMenus,
  useUpdateMenu,
} from "./api";

function flattenMenus(items: SysMenu[], depth = 0): Array<SysMenu & { depth: number }> {
  return items.flatMap((item) => [
    { ...item, depth },
    ...flattenMenus(item.children ?? [], depth + 1),
  ]);
}

const emptyForm: CreateMenuInput = { code: "", name: "", type: "menu", order_no: 0 };

type FlatMenu = SysMenu & { depth: number };

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
  const [dialogOpen, setDialogOpen] = useState(false);

  if (!canRead) {
    return (
      <p className="p-6" role="alert" style={{ color: "var(--warning-foreground)", background: "var(--warning-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
        无访问菜单管理的权限。
      </p>
    );
  }

  const rows = menus.data ? flattenMenus(menus.data) : [];

  const reset = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(false);
  };

  const submit = () => {
    if (editingId) {
      update.mutate({ id: editingId, data: form }, { onSuccess: reset });
    } else {
      create.mutate(form, { onSuccess: reset });
    }
  };

  const openEdit = (m: FlatMenu) => {
    setEditingId(m.id);
    setForm({
      code: m.code,
      name: m.name,
      type: m.type,
      parent_id: m.parent_id,
      path: m.path,
      perm_code: m.perm_code,
      icon: m.icon,
      order_no: m.order_no,
    });
    setDialogOpen(true);
  };

  const TYPE_LABELS: Record<string, string> = { dir: "目录", menu: "菜单", button: "按钮" };
  const TYPE_TONES: Record<string, "neutral" | "info" | "warning"> = {
    dir: "neutral",
    menu: "info",
    button: "warning",
  };

  const columns: ColumnDef<FlatMenu>[] = [
    {
      id: "name",
      header: "名称 / 层级",
      cell: ({ row }) => (
        <span
          style={{
            paddingLeft: `${row.original.depth * 20}px`,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {row.original.depth > 0 && (
            <span style={{ width: "12px", height: "1px", background: "var(--border-strong)", display: "inline-block", flexShrink: 0 }} />
          )}
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "类型",
      cell: ({ row }) => (
        <Badge tone={TYPE_TONES[row.original.type] ?? "neutral"}>
          {TYPE_LABELS[row.original.type] ?? row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "path",
      header: "路径",
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          {row.original.path || "—"}
        </span>
      ),
    },
    {
      accessorKey: "perm_code",
      header: "权限码",
      cell: ({ row }) => {
        const missing = !row.original.perm_code && row.original.type === "button";
        return missing ? (
          <Badge tone="danger">权限码缺失</Badge>
        ) : (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
            {row.original.perm_code || "—"}
          </span>
        );
      },
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "操作",
            cell: ({ row }: { row: { original: FlatMenu } }) => (
              <span style={{ display: "flex", gap: "4px" }}>
                <Button variant="ghost" size="icon-sm" onClick={() => openEdit(row.original)} title="编辑">
                  <Edit2 size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => del.mutate(row.original.id)}
                  title="删除"
                  style={{ color: "var(--destructive)" }}
                >
                  <Trash2 size={14} />
                </Button>
              </span>
            ),
          } as ColumnDef<FlatMenu>,
        ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", letterSpacing: "var(--tracking-tight)" }}>
        菜单管理
      </h1>

      <Card>
        <CardHeader>
          <span />
          {canWrite && (
            <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) reset(); else setDialogOpen(true); }}>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); }}>
                  <PlusCircle size={14} />
                  新建节点
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "编辑菜单节点" : "新建菜单节点"}</DialogTitle>
                  <DialogDescription>填写菜单节点信息。</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        菜单码 <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <Input
                        placeholder="唯一标识码"
                        disabled={!!editingId}
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        名称 <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <Input
                        placeholder="显示名称"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        类型
                      </label>
                      <NativeSelect
                        value={form.type}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            type: e.target.value,
                            perm_code: e.target.value !== "button" ? null : form.perm_code,
                          })
                        }
                      >
                        <option value="dir">目录</option>
                        <option value="menu">菜单</option>
                        <option value="button">按钮</option>
                      </NativeSelect>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        父节点 ID
                      </label>
                      <Input
                        placeholder="留空为顶级节点"
                        value={form.parent_id ?? ""}
                        onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        路径
                      </label>
                      <Input
                        placeholder="/sys/users"
                        value={form.path ?? ""}
                        onChange={(e) => setForm({ ...form, path: e.target.value || null })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        权限码
                      </label>
                      <Input
                        placeholder="system:user:add"
                        value={form.perm_code ?? ""}
                        onChange={(e) => setForm({ ...form, perm_code: e.target.value || null })}
                      />
                    </div>
                    {(create.isError || update.isError) && (
                      <p role="alert" style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
                        {String(((create.error ?? update.error) as Error | null)?.message)}
                      </p>
                    )}
                  </div>
                </DialogBody>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm" onClick={reset}>取消</Button>
                  </DialogClose>
                  <Button
                    size="sm"
                    disabled={create.isPending || update.isPending || !form.code || !form.name}
                    onClick={submit}
                  >
                    {create.isPending || update.isPending ? "提交中…" : editingId ? "保存菜单" : "新建节点"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>

        <CardContent>
          {menus.isLoading && <Skeleton />}
          {menus.isError && (
            <div role="alert" style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
              加载失败。
              <button onClick={() => menus.refetch()} style={{ marginLeft: "4px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>重试</button>
            </div>
          )}
          {menus.data && rows.length === 0 && (
            <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>暂无菜单。</p>
          )}
          {rows.length > 0 && <DataTable columns={columns} data={rows} />}
        </CardContent>
      </Card>
    </div>
  );
}

