import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { AuthButton } from "@/components/Common/AuthButton"
import { apiDelete, apiGetPage, apiPost, apiPut, extractErrorMessage, type PageResult } from "@/lib/api"
import type { RolePublic, UserCreate, UserPublic } from "@/types"

export const Route = createFileRoute("/_layout/system/users")({
  component: UsersPage,
  head: () => ({ meta: [{ title: "用户管理 - MatrixAdmin" }] }),
})

function UsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [keyword, setKeyword] = useState("")
  const [showAdd, setShowAdd] = useState(false)
  const [editingUser, setEditingUser] = useState<UserPublic | null>(null)
  const [assignRoleUser, setAssignRoleUser] = useState<UserPublic | null>(null)

  const { data } = useQuery<PageResult<UserPublic>>({
    queryKey: ["system", "users", page, keyword],
    queryFn: () =>
      apiGetPage<UserPublic>("/system/users", {
        params: { page, size: 10, keyword: keyword || undefined },
      }),
  })

  const { data: roles } = useQuery<PageResult<RolePublic>>({
    queryKey: ["system", "roles", "all"],
    queryFn: () => apiGetPage<RolePublic>("/system/roles", { params: { page: 1, size: 100 } }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/system/users/${id}`),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["system", "users"] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: number }) =>
      apiPut(`/system/users/${id}/status`, undefined, { params: { status } }),
    onSuccess: () => {
      toast.success("状态更新成功")
      queryClient.invalidateQueries({ queryKey: ["system", "users"] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const resetPwdMutation = useMutation({
    mutationFn: ({ id, new_password }: { id: string; new_password: string }) =>
      apiPut(`/system/users/${id}/reset-password`, { new_password }),
    onSuccess: () => toast.success("密码重置成功"),
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <AuthButton permission="sys:user:add">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            新增用户
          </button>
        </AuthButton>
      </div>

      <div className="flex gap-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索用户名/姓名"
          className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
        />
        <button
          type="button"
          onClick={() => setPage(1)}
          className="rounded-md border px-3 py-1 text-sm hover:bg-accent"
        >
          搜索
        </button>
      </div>

      <div className="rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">用户名</th>
              <th className="px-4 py-3 text-left font-medium">姓名</th>
              <th className="px-4 py-3 text-left font-medium">邮箱</th>
              <th className="px-4 py-3 text-left font-medium">手机号</th>
              <th className="px-4 py-3 text-left font-medium">角色</th>
              <th className="px-4 py-3 text-left font-medium">状态</th>
              <th className="px-4 py-3 text-left font-medium">创建时间</th>
              <th className="px-4 py-3 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data?.items.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3">{user.username}</td>
                <td className="px-4 py-3">{user.real_name || "-"}</td>
                <td className="px-4 py-3">{user.email || "-"}</td>
                <td className="px-4 py-3">{user.phone || "-"}</td>
                <td className="px-4 py-3">
                  {user.is_superadmin ? (
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      超级管理员
                    </span>
                  ) : user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <span key={r.id} className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {r.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${user.status === 1 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}
                  >
                    {user.status === 1 ? "启用" : "禁用"}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <AuthButton permission="sys:user:edit">
                      <button
                        type="button"
                        onClick={() => setEditingUser(user)}
                        className="text-xs text-primary hover:underline"
                      >
                        编辑
                      </button>
                    </AuthButton>
                    {!user.is_superadmin && (
                      <AuthButton permission="sys:user:edit">
                        <button
                          type="button"
                          onClick={() => setAssignRoleUser(user)}
                          className="text-xs text-green-600 hover:underline dark:text-green-400"
                        >
                          分配角色
                        </button>
                      </AuthButton>
                    )}
                    <AuthButton permission="sys:user:edit">
                      <button
                        type="button"
                        onClick={() =>
                          statusMutation.mutate({
                            id: user.id,
                            status: user.status === 1 ? 0 : 1,
                          })
                        }
                        className="text-xs text-orange-500 hover:underline"
                      >
                        {user.status === 1 ? "禁用" : "启用"}
                      </button>
                    </AuthButton>
                    <AuthButton permission="sys:user:resetPwd">
                      <button
                        type="button"
                        onClick={() => {
                          const pwd = prompt("请输入新密码:")
                          if (pwd) resetPwdMutation.mutate({ id: user.id, new_password: pwd })
                        }}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        重置密码
                      </button>
                    </AuthButton>
                    <AuthButton permission="sys:user:del">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("确定删除该用户？")) deleteMutation.mutate(user.id)
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

      {/* Pagination */}
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

      {/* Add User Dialog */}
      {showAdd && (
        <UserFormDialog
          roles={roles?.items || []}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false)
            queryClient.invalidateQueries({ queryKey: ["system", "users"] })
          }}
        />
      )}

      {/* Edit User Dialog */}
      {editingUser && (
        <UserEditDialog
          user={editingUser}
          roles={roles?.items || []}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null)
            queryClient.invalidateQueries({ queryKey: ["system", "users"] })
          }}
        />
      )}

      {/* Assign Role Dialog */}
      {assignRoleUser && (
        <AssignRoleDialog
          user={assignRoleUser}
          roles={roles?.items || []}
          onClose={() => setAssignRoleUser(null)}
          onSuccess={() => {
            setAssignRoleUser(null)
            queryClient.invalidateQueries({ queryKey: ["system", "users"] })
          }}
        />
      )}
    </div>
  )
}

function UserFormDialog({
  roles,
  onClose,
  onSuccess,
}: {
  roles: RolePublic[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<UserCreate>({
    username: "",
    password: "",
    real_name: "",
    email: "",
    phone: "",
    status: 1,
    role_ids: [],
  })

  const mutation = useMutation({
    mutationFn: () => apiPost("/system/users", form),
    onSuccess: () => {
      toast.success("创建成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">新增用户</h2>
        <div className="space-y-3">
          <input
            placeholder="用户名 *"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            type="password"
            placeholder="密码 *"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="姓名"
            value={form.real_name}
            onChange={(e) => setForm({ ...form, real_name: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="邮箱"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="手机号"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">角色</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={form.role_ids?.includes(role.id)}
                    onChange={(e) => {
                      const ids = form.role_ids || []
                      setForm({
                        ...form,
                        role_ids: e.target.checked
                          ? [...ids, role.id]
                          : ids.filter((id) => id !== role.id),
                      })
                    }}
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
          >
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

function UserEditDialog({
  user,
  roles,
  onClose,
  onSuccess,
}: {
  user: UserPublic
  roles: RolePublic[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    real_name: user.real_name || "",
    email: user.email || "",
    phone: user.phone || "",
    role_ids: user.roles?.map((r) => r.id) || [],
  })

  const mutation = useMutation({
    mutationFn: () => apiPut(`/system/users/${user.id}`, form),
    onSuccess: () => {
      toast.success("更新成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">编辑用户: {user.username}</h2>
        <div className="space-y-3">
          <input
            placeholder="姓名"
            value={form.real_name}
            onChange={(e) => setForm({ ...form, real_name: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="邮箱"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <input
            placeholder="手机号"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">角色</label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <label key={role.id} className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={form.role_ids.includes(role.id)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        role_ids: e.target.checked
                          ? [...form.role_ids, role.id]
                          : form.role_ids.filter((id) => id !== role.id),
                      })
                    }
                  />
                  {role.name}
                </label>
              ))}
            </div>
          </div>
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

function AssignRoleDialog({
  user,
  roles,
  onClose,
  onSuccess,
}: {
  user: UserPublic
  roles: RolePublic[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [roleIds, setRoleIds] = useState<string[]>(user.roles?.map((r) => r.id) || [])

  const mutation = useMutation({
    mutationFn: () => apiPut(`/system/users/${user.id}`, { role_ids: roleIds }),
    onSuccess: () => {
      toast.success("角色分配成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const toggle = (id: string, checked: boolean) =>
    setRoleIds((prev) => (checked ? [...prev, id] : prev.filter((v) => v !== id)))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg bg-card p-6 shadow-lg">
        <h2 className="mb-1 text-lg font-semibold">分配角色</h2>
        <p className="mb-4 text-sm text-muted-foreground">用户：{user.username}</p>
        <div className="space-y-2">
          {roles.length === 0 && (
            <p className="text-sm text-muted-foreground">暂无可用角色</p>
          )}
          {roles.map((role) => (
            <label key={role.id} className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer">
              <input
                type="checkbox"
                checked={roleIds.includes(role.id)}
                onChange={(e) => toggle(role.id, e.target.checked)}
                className="h-4 w-4"
              />
              <div>
                <span className="text-sm font-medium">{role.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">{role.code}</span>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
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
