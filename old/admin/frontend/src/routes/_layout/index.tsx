import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { BarChart3, LogIn, Shield, Users } from "lucide-react"

import { apiGet } from "@/lib/api"
import type { DashboardSummary, OperationLogPublic } from "@/types"

export const Route = createFileRoute("/_layout/")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "仪表盘 - MatrixAdmin" }] }),
})

function DashboardPage() {
  const { data: summary } = useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: () => apiGet<DashboardSummary>("/dashboard/summary"),
  })

  const { data: recentLogs } = useQuery<OperationLogPublic[]>({
    queryKey: ["dashboard", "recentLogs"],
    queryFn: () => apiGet<OperationLogPublic[]>("/dashboard/recent-logs"),
  })

  const stats = [
    { label: "用户总数", value: summary?.user_count ?? "-", icon: Users, color: "text-blue-500" },
    { label: "角色总数", value: summary?.role_count ?? "-", icon: Shield, color: "text-green-500" },
    { label: "今日登录", value: summary?.today_login_count ?? "-", icon: LogIn, color: "text-orange-500" },
    { label: "今日操作", value: summary?.today_operation_count ?? "-", icon: BarChart3, color: "text-purple-500" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">仪表盘</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">最近操作</h2>
        </div>
        <div className="divide-y">
          {recentLogs?.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">暂无操作记录</p>
          )}
          {recentLogs?.map((log) => (
            <div key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="font-medium">{log.username}</span>
                <span className="text-muted-foreground">
                  {log.module} / {log.action}
                </span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span>{log.method} {log.url}</span>
                {log.cost_time_ms != null && <span>{log.cost_time_ms}ms</span>}
                {log.created_at && (
                  <span>{new Date(log.created_at).toLocaleString("zh-CN")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
