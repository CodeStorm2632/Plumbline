import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusCircle, Search, Trash2 } from "lucide-react";

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
import { Skeleton } from "../../components/ui/skeleton";
import { type CreateUserInput, useCreateUser, useDeleteUser, useUsers, type SysUser } from "./api";

// 用户管理屏（SC-2）。七态：加载/错误/空/无权限/缺失/越权/成功。
export function SysUserPage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员");
  const canWrite = roles.includes("管理员");
  const [q, setQ] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const users = useUsers(q);
  const create = useCreateUser();
  const del = useDeleteUser();
  const [form, setForm] = useState<CreateUserInput>({ username: "", password: "" });

  // 无权限态
  if (!canRead) {
    return (
      <p className="p-6" role="alert" style={{ color: "var(--warning-foreground)", background: "var(--warning-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
        无访问用户管理的权限。
      </p>
    );
  }

  const columns: ColumnDef<SysUser>[] = [
    {
      accessorKey: "username",
      header: "用户名",
      cell: ({ row }) => (
        <span style={{ fontWeight: "var(--font-medium)" }}>{row.original.username}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "手机",
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          {row.original.phone ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => (
        <span style={{ color: "var(--muted-foreground)" }}>{row.original.email ?? "—"}</span>
      ),
    },
    {
      accessorKey: "roles",
      header: "角色",
      cell: ({ row }) =>
        row.original.roles.length > 0 ? (
          <span style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {row.original.roles.map((r) => (
              <Badge key={r} tone="primary">{r}</Badge>
            ))}
          </span>
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>—</span>
        ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Badge
          tone={row.original.status === "active" ? "success" : "neutral"}
          dot
        >
          {row.original.status === "active" ? "启用" : "停用"}
        </Badge>
      ),
    },
    ...(canWrite
      ? [
          {
            id: "actions",
            header: "操作",
            cell: ({ row }: { row: { original: SysUser } }) => (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => del.mutate(row.original.id)}
                title="删除"
                style={{ color: "var(--destructive)" }}
              >
                <Trash2 size={14} />
              </Button>
            ),
          } as ColumnDef<SysUser>,
        ]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Page header */}
      <h1
        style={{
          margin: 0,
          fontSize: "var(--text-2xl)",
          fontWeight: "var(--font-bold)",
          letterSpacing: "var(--tracking-tight)",
        }}
      >
        用户管理
      </h1>

      <Card>
        <CardHeader>
          {/* Toolbar */}
          <Input
            leading={<Search size={14} />}
            placeholder="搜索用户名"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ width: "220px" }}
          />
          {canWrite && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle size={14} />
                  新建用户
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>新建用户</DialogTitle>
                  <DialogDescription>填写用户信息，手机号等字段传输加密。</DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        用户名 <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <Input
                        placeholder="请输入用户名"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        口令 <span style={{ color: "var(--destructive)" }}>*</span>
                      </label>
                      <Input
                        type="password"
                        placeholder="请输入口令"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)", marginBottom: "6px" }}>
                        手机
                      </label>
                      <Input
                        placeholder="请输入手机号"
                        value={form.phone ?? ""}
                        onChange={(e) => setForm({ ...form, phone: e.target.value || undefined })}
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
                    disabled={create.isPending || !form.username || !form.password}
                    onClick={() =>
                      create.mutate(form, {
                        onSuccess: () => {
                          setForm({ username: "", password: "" });
                          setDialogOpen(false);
                        },
                      })
                    }
                  >
                    {create.isPending ? "提交中…" : "新建用户"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>

        <CardContent>
          {/* 加载态 */}
          {users.isLoading && <Skeleton />}

          {/* 错误态 */}
          {users.isError && (
            <div
              role="alert"
              style={{
                padding: "16px",
                fontSize: "var(--text-sm)",
                color: "var(--destructive)",
              }}
            >
              加载失败。
              <button
                onClick={() => users.refetch()}
                style={{ marginLeft: "4px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
              >
                重试
              </button>
            </div>
          )}

          {/* 空态 */}
          {users.data && users.data.length === 0 && (
            <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>
              暂无用户。
            </p>
          )}

          {/* 成功态 */}
          {users.data && users.data.length > 0 && (
            <DataTable columns={columns} data={users.data} zebra />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

