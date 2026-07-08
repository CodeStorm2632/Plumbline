import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { AuthButton } from "@/components/Common/AuthButton"
import { apiDelete, apiGetPage, extractErrorMessage, type PageResult } from "@/lib/api"
import type { LoginLogPublic, OperationLogPublic } from "@/types"

export const Route = createFileRoute("/_layout/system/logs")({
  component: LogsPage,
  head: () => ({ meta: [{ title: "日志管理 - MatrixAdmin" }] }),
})

function LogsPage() {
  const [tab, setTab] = useState<"operation" | "login">("operation")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">日志管理</h1>

      <div className="flex gap-1 border-b">
        <button
          type="button"
          onClick={() => setTab("operation")}
          className={`px-4 py-2 text-sm font-medium ${tab === "operation" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          操作日志
        </button>
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`px-4 py-2 text-sm font-medium ${tab === "login" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          登录日志
        </button>
      </div>

      {tab === "operation" ? <OperationLogsTab /> : <LoginLogsTab />}
    </div>
  )
}

function OperationLogsTab() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [module, setModule] = useState("")
  const [username, setUsername] = useState("")
  const [detailId, setDetailId] = useState<string | null>(null)

  const { data } = useQuery<PageResult<OperationLogPublic>>({
    queryKey: ["system", "logs", "operation", page, module, username],
    queryFn: () =>
      apiGetPage<OperationLogPublic>("/system/logs/operation", {
        params: {
          page,
          size: 15,
          module: module || undefined,
          username: username || undefined,
        },
      }),
  })

  const clearMutation = useMutation({
    mutationFn: () => apiDelete("/system/logs/operation"),
    onSuccess: () => {
      toast.success("操作日志已清空")
      queryClient.invalidateQueries({ queryKey: ["system", "logs", "operation"] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          placeholder="模块"
          value={module}
          onChange={(e) => setModule(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
        <input
          placeholder="操作人"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
        <button
          type="button"
          onClick={() => setPage(1)}
          className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
        >
          搜索
        </button>
        <div className="flex-1" />
        <AuthButton permission="sys:log:del">
          <button
            type="button"
            onClick={() => {
              if (confirm("确定清空所有操作日志？")) clearMutation.mutate()
            }}
            className="rounded-md border border-destructive px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
          >
            清空
          </button>
        </AuthButton>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">操作人</th>
              <th className="px-4 py-3 text-left font-medium">模块</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
              <th className="px-4 py-3 text-left font-medium">请求方式</th>
              <th className="px-4 py-3 text-left font-medium">IP</th>
              <th className="px-4 py-3 text-left font-medium">耗时</th>
              <th className="px-4 py-3 text-left font-medium">响应码</th>
              <th className="px-4 py-3 text-left font-medium">时间</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.items.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3">{log.username || "-"}</td>
                <td className="px-4 py-3">{log.module}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3 font-mono text-xs">{log.method}</td>
                <td className="px-4 py-3 text-xs">{log.ip || "-"}</td>
                <td className="px-4 py-3 text-xs">{log.cost_time_ms ? `${log.cost_time_ms}ms` : "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${log.response_code && log.response_code < 400 ? "text-green-600" : "text-red-600"}`}
                  >
                    {log.response_code || "-"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {log.created_at ? new Date(log.created_at).toLocaleString("zh-CN") : "-"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setDetailId(log.id)}
                    className="text-xs text-primary hover:underline"
                  >
                    详情
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">共 {data.total} 条</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(data.pages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`rounded px-3 py-1 text-sm ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {detailId && (
        <OperationLogDetail
          logItem={data?.items.find((l) => l.id === detailId) || null}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  )
}

function OperationLogDetail({
  logItem,
  onClose,
}: {
  logItem: OperationLogPublic | null
  onClose: () => void
}) {
  if (!logItem) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">操作日志详情</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">操作人:</span>
            <span>{logItem.username || "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">模块:</span>
            <span>{logItem.module}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">操作:</span>
            <span>{logItem.action}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">URL:</span>
            <span className="break-all font-mono text-xs">{logItem.url}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">请求参数:</span>
            <pre className="max-h-40 flex-1 overflow-auto rounded bg-muted p-2 text-xs">
              {logItem.request_params || "-"}
            </pre>
          </div>
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">响应码:</span>
            <span>{logItem.response_code || "-"}</span>
          </div>
          {logItem.error_msg && (
            <div className="flex gap-2">
              <span className="w-20 font-medium text-muted-foreground">错误:</span>
              <span className="text-destructive">{logItem.error_msg}</span>
            </div>
          )}
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">耗时:</span>
            <span>{logItem.cost_time_ms ? `${logItem.cost_time_ms}ms` : "-"}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-20 font-medium text-muted-foreground">时间:</span>
            <span>{logItem.created_at ? new Date(logItem.created_at).toLocaleString("zh-CN") : "-"}</span>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

function LoginLogsTab() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [username, setUsername] = useState("")

  const { data } = useQuery<PageResult<LoginLogPublic>>({
    queryKey: ["system", "logs", "login", page, username],
    queryFn: () =>
      apiGetPage<LoginLogPublic>("/system/logs/login", {
        params: {
          page,
          size: 15,
          username: username || undefined,
        },
      }),
  })

  const clearMutation = useMutation({
    mutationFn: () => apiDelete("/system/logs/login"),
    onSuccess: () => {
      toast.success("登录日志已清空")
      queryClient.invalidateQueries({ queryKey: ["system", "logs", "login"] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
        <button
          type="button"
          onClick={() => setPage(1)}
          className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
        >
          搜索
        </button>
        <div className="flex-1" />
        <AuthButton permission="sys:log:del">
          <button
            type="button"
            onClick={() => {
              if (confirm("确定清空所有登录日志？")) clearMutation.mutate()
            }}
            className="rounded-md border border-destructive px-3 py-1 text-sm text-destructive hover:bg-destructive/10"
          >
            清空
          </button>
        </AuthButton>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">用户名</th>
              <th className="px-4 py-3 text-left font-medium">IP</th>
              <th className="px-4 py-3 text-left font-medium">浏览器</th>
              <th className="px-4 py-3 text-left font-medium">操作系统</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">失败原因</th>
              <th className="px-4 py-3 text-left font-medium">登录时间</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.items.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3">{log.username}</td>
                <td className="px-4 py-3 text-xs">{log.ip || "-"}</td>
                <td className="px-4 py-3 text-xs">{log.browser || "-"}</td>
                <td className="px-4 py-3 text-xs">{log.os || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${log.status === 1 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                  >
                    {log.status === 1 ? "成功" : "失败"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-destructive">{log.fail_reason || "-"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {log.login_at ? new Date(log.login_at).toLocaleString("zh-CN") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">共 {data.total} 条</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(data.pages, 10) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`rounded px-3 py-1 text-sm ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
