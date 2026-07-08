import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { AuthButton } from "@/components/Common/AuthButton"
import {
  apiDelete,
  apiGet,
  apiGetPage,
  apiPost,
  apiPut,
  extractErrorMessage,
  type PageResult,
} from "@/lib/api"
import type { MenuNode, RoleCreate, RoleDetail, RolePublic } from "@/types"

export const Route = createFileRoute("/_layout/system/roles")({
  component: RolesPage,
  head: () => ({ meta: [{ title: "角色管理 - MatrixAdmin" }] }),
})

function RolesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)
  const [editingRole, setEditingRole] = useState<RolePublic | null>(null)
  const [assigningRole, setAssigningRole] = useState<RolePublic | null>(null)

  const { data } = useQuery<PageResult<RolePublic>>({
    queryKey: ["system", "roles", page],
    queryFn: () => apiGetPage<RolePublic>("/system/roles", { params: { page, size: 10 } }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/system/roles/${id}`),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["system", "roles"] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">角色管理</h1>
        <AuthButton permission="sys:role:add">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            新增角色
          </button>
        </AuthButton>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">角色名称</th>
              <th className="px-4 py-3 text-left font-medium">角色编码</th>
              <th className="px-4 py-3 text-left font-medium">数据范围</th>
              <th className="px-4 py-3 text-left font-medium">排序</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">备注</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.items.map((role) => (
              <tr key={role.id}>
                <td className="px-4 py-3">{role.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{role.code}</td>
                <td className="px-4 py-3">{role.data_scope === "ALL" ? "全部" : "本人"}</td>
                <td className="px-4 py-3">{role.sort_order}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${role.status === 1 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                  >
                    {role.status === 1 ? "启用" : "禁用"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{role.remark || "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <AuthButton permission="sys:role:edit">
                      <button
                        type="button"
                        onClick={() => setEditingRole(role)}
                        className="text-xs text-primary hover:underline"
                      >
                        编辑
                      </button>
                    </AuthButton>
                    <AuthButton permission="sys:role:edit">
                      <button
                        type="button"
                        onClick={() => setAssigningRole(role)}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        分配权限
                      </button>
                    </AuthButton>
                    <AuthButton permission="sys:role:del">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("确定删除该角色？")) deleteMutation.mutate(role.id)
                        }}
                        className="text-xs text-destructive hover:underline"
                      >
                        删除
                      </button>
                    </AuthButton>
                  </div>
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
            {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
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

      {showAdd && (
        <RoleFormDialog
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false)
            queryClient.invalidateQueries({ queryKey: ["system", "roles"] })
          }}
        />
      )}

      {editingRole && (
        <RoleEditDialog
          role={editingRole}
          onClose={() => setEditingRole(null)}
          onSuccess={() => {
            setEditingRole(null)
            queryClient.invalidateQueries({ queryKey: ["system", "roles"] })
          }}
        />
      )}

      {assigningRole && (
        <AssignMenuDialog
          roleId={assigningRole.id}
          roleName={assigningRole.name}
          onClose={() => setAssigningRole(null)}
          onSuccess={() => {
            setAssigningRole(null)
            queryClient.invalidateQueries({ queryKey: ["system", "roles"] })
          }}
        />
      )}
    </div>
  )
}

function RoleFormDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<RoleCreate>({
    name: "",
    code: "",
    data_scope: "SELF",
    status: 1,
    sort_order: 0,
    remark: "",
  })

  const mutation = useMutation({
    mutationFn: () => apiPost("/system/roles", form),
    onSuccess: () => {
      toast.success("创建成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">新增角色</h2>
        <div className="space-y-3">
          <input
            placeholder="角色名称 *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="角色编码 *"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <select
            value={form.data_scope}
            onChange={(e) => setForm({ ...form, data_scope: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="SELF">本人数据</option>
            <option value="ALL">全部数据</option>
          </select>
          <input
            type="number"
            placeholder="排序"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number.parseInt(e.target.value) || 0 })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="备注"
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            取消
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "创建中..." : "创建"}
          </button>
        </div>
      </div>
    </div>
  )
}

function RoleEditDialog({
  role,
  onClose,
  onSuccess,
}: {
  role: RolePublic
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    name: role.name,
    code: role.code,
    data_scope: role.data_scope,
    status: role.status,
    sort_order: role.sort_order,
    remark: role.remark || "",
  })

  const mutation = useMutation({
    mutationFn: () => apiPut(`/system/roles/${role.id}`, form),
    onSuccess: () => {
      toast.success("更新成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">编辑角色: {role.name}</h2>
        <div className="space-y-3">
          <input
            placeholder="角色名称"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="角色编码"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <select
            value={form.data_scope}
            onChange={(e) => setForm({ ...form, data_scope: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="SELF">本人数据</option>
            <option value="ALL">全部数据</option>
          </select>
          <input
            type="number"
            placeholder="排序"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: Number.parseInt(e.target.value) || 0 })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="备注"
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            取消
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignMenuDialog({
  roleId,
  roleName,
  onClose,
  onSuccess,
}: {
  roleId: string
  roleName: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [checkedIds, setCheckedIds] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  // Fetch role detail to get current menu_ids
  useQuery<RoleDetail>({
    queryKey: ["system", "roles", roleId],
    queryFn: async () => {
      const detail = await apiGet<RoleDetail>(`/system/roles/${roleId}`)
      if (!loaded) {
        setCheckedIds(detail.menu_ids || [])
        setLoaded(true)
      }
      return detail
    },
  })

  // Fetch all menus as tree
  const { data: menuTree } = useQuery<MenuNode[]>({
    queryKey: ["system", "menus", "tree"],
    queryFn: () => apiGet<MenuNode[]>("/system/menus"),
  })

  const mutation = useMutation({
    mutationFn: () => apiPut(`/system/roles/${roleId}/menus`, { menu_ids: checkedIds }),
    onSuccess: () => {
      toast.success("权限分配成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const toggleMenu = (menuId: string) => {
    setCheckedIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId],
    )
  }

  const renderTree = (nodes: MenuNode[], depth = 0) => (
    <div className="space-y-1">
      {nodes.map((node) => (
        <div key={node.id}>
          <label
            className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent"
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
          >
            <input
              type="checkbox"
              checked={checkedIds.includes(node.id)}
              onChange={() => toggleMenu(node.id)}
            />
            <span className="text-xs text-muted-foreground">
              {node.menu_type === "DIR" ? "📁" : node.menu_type === "MENU" ? "📄" : "🔘"}
            </span>
            {node.name}
            {node.permission && (
              <span className="font-mono text-xs text-muted-foreground">({node.permission})</span>
            )}
          </label>
          {node.children && node.children.length > 0 && renderTree(node.children, depth + 1)}
        </div>
      ))}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">分配权限: {roleName}</h2>
        <div className="max-h-96 overflow-y-auto rounded border p-2">
          {menuTree ? renderTree(menuTree) : <div className="p-4 text-sm text-muted-foreground">加载中...</div>}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            取消
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  )
}
