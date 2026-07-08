import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Edit2, PlusCircle, Trash2 } from "lucide-react";

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

type FlatMenu = SysMenu & { depth: number; hasChildren: boolean; open: boolean };

// 仅展开的节点才向下展平（收起的父节点隐藏其子树），并标注层级/是否有子/是否展开。
function flattenVisible(items: SysMenu[], collapsed: Set<string>, depth = 0): FlatMenu[] {
  return items.flatMap((item) => {
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const open = hasChildren && !collapsed.has(item.id);
    const node: FlatMenu = { ...item, depth, hasChildren, open };
    return open ? [node, ...flattenVisible(children, collapsed, depth + 1)] : [node];
  });
}

// 收集所有可展开（含子节点）的节点 id，用于「展开/折叠全部」。
function collectParentIds(items: SysMenu[]): string[] {
  return items.flatMap((item) => {
    const children = item.children ?? [];
    return children.length ? [item.id, ...collectParentIds(children)] : [];
  });
}

// 展平全部节点（忽略折叠），用于父节点下拉：按层级缩进展示，供选择而非手填编码。
type ParentOption = { id: string; name: string; type: string; depth: number };
function flattenForParent(items: SysMenu[], depth = 0): ParentOption[] {
  return items.flatMap((item) => [
    { id: item.id, name: item.name, type: item.type, depth },
    ...flattenForParent(item.children ?? [], depth + 1),
  ]);
}

// 收集某节点及其所有子孙 id：编辑时排除自身与子树，避免选成自己的父节点（成环）。
function collectSubtreeIds(items: SysMenu[], rootId: string): Set<string> {
  const ids = new Set<string>();
  const walk = (nodes: SysMenu[], inside: boolean) => {
    for (const n of nodes) {
      const within = inside || n.id === rootId;
      if (within) ids.add(n.id);
      walk(n.children ?? [], within);
    }
  };
  walk(items, false);
  return ids;
}

// 各类型允许的父节点类型（体现 目录 > 菜单 > 按钮 的层级约束）：
// 目录可作顶级或放在目录下；菜单只能放目录下；按钮只能放菜单下。
const PARENT_TYPES: Record<string, string[]> = {
  dir: ["dir"],
  menu: ["dir"],
  button: ["menu"],
};

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());

  if (!canRead) {
    return (
      <p className="p-6" role="alert" style={{ color: "var(--warning-foreground)", background: "var(--warning-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
        无访问菜单管理的权限。
      </p>
    );
  }

  const rows = menus.data ? flattenVisible(menus.data, collapsed) : [];
  const parentIds = menus.data ? collectParentIds(menus.data) : [];
  const allExpanded = collapsed.size === 0;
  const toggleNode = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setCollapsed(allExpanded ? new Set(parentIds) : new Set());

  // 父节点候选：按类型约束（目录>菜单>按钮），编辑时排除自身及子树防成环。
  const allNodesFlat = menus.data ? flattenForParent(menus.data) : [];
  const excludedIds = editingId ? collectSubtreeIds(menus.data ?? [], editingId) : null;
  const parentOptions = allNodesFlat.filter(
    (n) => (PARENT_TYPES[form.type] ?? []).includes(n.type) && !excludedIds?.has(n.id),
  );
  const allowTopLevel = form.type === "dir"; // 仅目录可作为顶级节点
  // 切换类型时，若原父节点在新类型下不再合法，则重置（顶级或强制重选）。
  const onTypeChange = (nextType: string) => {
    const allowed = PARENT_TYPES[nextType] ?? [];
    const keepParent = form.parent_id
      ? allNodesFlat.some(
          (n) => n.id === form.parent_id && allowed.includes(n.type) && !excludedIds?.has(n.id),
        )
      : false;
    setForm({
      ...form,
      type: nextType,
      parent_id: keepParent ? form.parent_id : null,
      perm_code: nextType !== "button" ? null : form.perm_code,
    });
  };

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
      enableSorting: false,
      cell: ({ row }) => {
        const m = row.original;
        return (
          <span
            style={{
              paddingLeft: `${m.depth * 20}px`,
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            {m.hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(m.id)}
                aria-label={m.open ? "折叠" : "展开"}
                aria-expanded={m.open}
                title={m.open ? "折叠" : "展开"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "18px",
                  height: "18px",
                  padding: 0,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--muted-foreground)",
                  flexShrink: 0,
                }}
              >
                <ChevronRight
                  size={14}
                  style={{
                    transform: m.open ? "rotate(90deg)" : "none",
                    transition: "transform var(--dur-fast)",
                  }}
                />
              </button>
            ) : (
              <span style={{ width: "18px", flexShrink: 0, display: "inline-block" }} />
            )}
            {m.name}
          </span>
        );
      },
    },
    {
      accessorKey: "type",
      header: "类型",
      enableSorting: false,
      cell: ({ row }) => (
        <Badge tone={TYPE_TONES[row.original.type] ?? "neutral"}>
          {TYPE_LABELS[row.original.type] ?? row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "path",
      header: "路径",
      enableSorting: false,
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          {row.original.path || "—"}
        </span>
      ),
    },
    {
      accessorKey: "perm_code",
      header: "权限码",
      enableSorting: false,
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
          {rows.length > 0 && parentIds.length > 0 ? (
            <Button variant="outline" size="sm" onClick={toggleAll}>
              {allExpanded ? "折叠全部" : "展开全部"}
            </Button>
          ) : (
            <span />
          )}
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
                        onChange={(e) => onTypeChange(e.target.value)}
                      >
                        <option value="dir">目录</option>
                        <option value="menu">菜单</option>
                        <option value="button">按钮</option>
                      </NativeSelect>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        父节点
                      </label>
                      <NativeSelect
                        value={form.parent_id ?? ""}
                        onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
                      >
                        {allowTopLevel ? (
                          <option value="">（顶级节点）</option>
                        ) : (
                          <option value="" disabled>
                            {form.type === "button" ? "请选择所属菜单" : "请选择所属目录"}
                          </option>
                        )}
                        {parentOptions.map((n) => (
                          <option key={n.id} value={n.id}>
                            {"　".repeat(n.depth) + n.name + (n.type === "dir" ? "（目录）" : "（菜单）")}
                          </option>
                        ))}
                      </NativeSelect>
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
                    disabled={
                      create.isPending ||
                      update.isPending ||
                      !form.code ||
                      !form.name ||
                      (!allowTopLevel && !form.parent_id)
                    }
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

