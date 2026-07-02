import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { DataTable } from "../../components/ui/data-table";
import { Skeleton } from "../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useAuditLogs, useLoginLogs, type AuditLog, type LoginLog } from "./api";

// 日志管理屏（SC-4，只读）。七态：加载/错误/空/无权限/只读/成功。
export function SysLogPage({ roles }: { roles: string[] }) {
  const canRead = roles.includes("管理员") || roles.includes("审计员");
  const [tab, setTab] = useState<"audit" | "login">("audit");
  const audit = useAuditLogs({});
  const loginLogs = useLoginLogs({});

  if (!canRead) {
    return (
      <p className="p-6" role="alert" style={{ color: "var(--warning-foreground)", background: "var(--warning-subtle)", borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)" }}>
        无访问日志的权限。
      </p>
    );
  }

  const auditColumns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: "ts",
      header: "时间",
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          {row.original.ts}
        </span>
      ),
    },
    { accessorKey: "actor", header: "操作人" },
    {
      accessorKey: "action",
      header: "动作",
      cell: ({ row }) => <Badge tone="info">{row.original.action}</Badge>,
    },
    {
      accessorKey: "entity_id",
      header: "实体 ID",
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          {row.original.entity_id}
        </span>
      ),
    },
  ];

  const loginColumns: ColumnDef<LoginLog>[] = [
    {
      accessorKey: "ts",
      header: "时间",
      cell: ({ row }) => (
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--muted-foreground)" }}>
          {row.original.ts}
        </span>
      ),
    },
    { accessorKey: "username", header: "用户名" },
    {
      accessorKey: "success",
      header: "结果",
      cell: ({ row }) => (
        <Badge tone={row.original.success ? "success" : "danger"} dot>
          {row.original.success ? "成功" : "失败"}
        </Badge>
      ),
    },
    {
      accessorKey: "detail",
      header: "详情",
      cell: ({ row }) => (
        <span style={{ color: "var(--muted-foreground)" }}>{row.original.detail || "—"}</span>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h1 style={{ margin: 0, fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", letterSpacing: "var(--tracking-tight)" }}>
        日志管理
      </h1>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "audit" | "login")}>
        <TabsList style={{ marginBottom: "16px" }}>
          <TabsTrigger value="audit">操作日志</TabsTrigger>
          <TabsTrigger value="login">登录日志</TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>操作日志</CardTitle>
            </CardHeader>
            <CardContent>
              {audit.isLoading && <Skeleton />}
              {audit.isError && (
                <div role="alert" style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
                  加载失败。<button onClick={() => audit.refetch()} style={{ marginLeft: "4px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>重试</button>
                </div>
              )}
              {audit.data && audit.data.length === 0 && (
                <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>暂无日志。</p>
              )}
              {audit.data && audit.data.length > 0 && (
                <DataTable columns={auditColumns} data={audit.data} zebra />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>登录日志</CardTitle>
            </CardHeader>
            <CardContent>
              {loginLogs.isLoading && <Skeleton />}
              {loginLogs.isError && (
                <div role="alert" style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--destructive)" }}>
                  加载失败。<button onClick={() => loginLogs.refetch()} style={{ marginLeft: "4px", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit" }}>重试</button>
                </div>
              )}
              {loginLogs.data && loginLogs.data.length === 0 && (
                <p style={{ padding: "16px", fontSize: "var(--text-sm)", color: "var(--muted-foreground)", margin: 0 }}>暂无日志。</p>
              )}
              {loginLogs.data && loginLogs.data.length > 0 && (
                <DataTable columns={loginColumns} data={loginLogs.data} zebra />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

