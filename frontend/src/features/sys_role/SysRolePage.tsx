import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Settings2, Trash2 } from "lucide-react";

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
import { PermissionTree, type TreeNodeType } from "../../components/ui/permission-tree";
import { Sheet, SheetContent, SheetBody, SheetFooter } from "../../components/ui/sheet";
import { Skeleton } from "../../components/ui/skeleton";
import { useMenus, type SysMenu } from "../sys_menu/api";
import { useAssignMenus, useCreateRole, useDeleteRole, useRoles, type SysRole } from "./api";

function menuToNode(m: SysMenu): TreeNodeType {
  return {
    key: m.id,
    label: m.name,
    code: m.perm_code ?? undefined,
    type: m.type,
    children: (m.children ?? []).map(menuToNode),
  };
}

/** 权限分配抽屉 — 仅在 permRole 非空时挂载，测试中不触发 useMenus */
function PermAssignSheet({
  role,
  onClose,
}: {
  role: SysRole;
  onClose: () => void;
}) {
  const menus = useMenus();
  const assign = useAssignMenus();
  const [checkedKeys, setCheckedKeys] = useState<string[]>(role.menu_ids);

  const nodes = menus.data ? menus.data.map(menuToNode) : [];

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent title={`配置权限 — ${role.name}`} description="勾选菜单与按钮权限">
        <SheetBody>
          {menus.isLoading && <Skeleton />}
          {menus.isError && (
            <p role="alert" style={{ color: "var(--destructive)", fontSize: "var(--text-sm)" }}>
              加载菜单失败。
            </p>
          )}
          {nodes.length > 0 && (
            <PermissionTree
              nodes={nodes}
              checkedKeys={checkedKeys}
              onChange={setCheckedKeys}
            />
          )}
          {menus.data && nodes.length === 0 && (
            <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-sm)" }}>
              暂无菜单节点。
            </p>
          )}
        </SheetBody>
        <SheetFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button
            size="sm"
            disabled={assign.isPending}
            onClick={() =>
              assign.mutate(
                { roleId: role.id, menuIds: checkedKeys },
                { onSuccess: onClose }
              )
            }
          >
            {assign.isPending ? "保存中…" : "保存权限"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// 角色管理屏（SC-3）。七态：加载/错误/空/无权限/缺失/越权(409)/成功。
export function SysRolePage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员");
  const canWrite = roles.includes("管理员");
  const list = useRoles();
  const create = useCreateRole();
  const del = useDeleteRole();
  const [form, setForm] = useState({ code: "", name: "", remark: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permRole, setPermRole] = useState<SysRole | null>(null);

  if (!canRead) {
    return (
      <p className="p-6" role="alert" style={{ color: "var(--warning-foreground)", background: "var(--warning-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
        无访问角色管理的权限。
      </p>
    );
  }

  const columns: ColumnDef<SysRole>[] = [
    {
      accessorKey: "code",
      header: "角色码",
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)" }}>
          {row.original.code}
        </span>
      ),
    },
    {
      accessorKey: "name",
      header: "名称",
      cell: ({ row }) => (
        <span style={{ fontWeight: "var(--font-medium)" }}>{row.original.name}</span>
      ),
    },
    {
      id: "perm_count",
      header: "权限数",
      cell: ({ row }) => (
        <Badge tone="neutral">{row.original.menu_ids.length} 项</Badge>
      ),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "操作",
            cell: ({ row }: { row: { original: SysRole } }) => (
              <span style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPermRole(row.original)}
                  title="配置权限"
                >
                  <Settings2 size={13} />
                  配置权限
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
          } as ColumnDef<SysRole>,
        ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1
        style={{
          margin: 0,
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--font-bold)",
          letterSpacing: "var(--tracking-tight)",
        }}
      >
        角色管理
      </h1>

      <Card>
        <CardHeader>
          <span />
          {canWrite && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle size={14} />
                  新建角色
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建角色</DialogTitle>
                  <DialogDescription>请填写角色码和名称。</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        角色码 <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <Input
                        placeholder="如 admin / auditor"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        名称 <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <Input
                        placeholder="如 系统管理员"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    {create.isError && (
                      <p role="alert" style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
                        {String((create.error as Error).message)}
                      </p>
                    )}
                  </div>
                </DialogBody>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" size="sm">取消</Button>
                  </DialogClose>
                  <Button
                    size="sm"
                    disabled={create.isPending || !form.code || !form.name}
                    onClick={() =>
                      create.mutate(
                        { code: form.code, name: form.name, remark: form.remark },
                        {
                          onSuccess: () => {
                            setForm({ code: "", name: "", remark: "" });
                            setDialogOpen(false);
                          },
                        }
                      )
                    }
                  >
                    {create.isPending ? "提交中…" : "新建角色"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>

        <CardContent>
          {list.isLoading && <Skeleton />}
          {list.isError && (
            <div role="alert" style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
              加载失败。
              <button
                onClick={() => list.refetch()}
                style={{ marginLeft: "4px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
              >
                重试
              </button>
            </div>
          )}
          {list.data && list.data.length === 0 && (
            <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>
              暂无角色。
            </p>
          )}
          {list.data && list.data.length > 0 && (
            <DataTable columns={columns} data={list.data} zebra />
          )}
        </CardContent>
      </Card>

      {/* 权限分配抽屉 — 仅在选中角色时挂载 */}
      {permRole && (
        <PermAssignSheet role={permRole} onClose={() => setPermRole(null)} />
      )}
    </div>
  );
}

