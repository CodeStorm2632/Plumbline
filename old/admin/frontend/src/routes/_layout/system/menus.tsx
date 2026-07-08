import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

import { AuthButton } from "@/components/Common/AuthButton"
import { apiDelete, apiGet, apiPost, apiPut, extractErrorMessage } from "@/lib/api"
import type { MenuCreate, MenuNode } from "@/types"

export const Route = createFileRoute("/_layout/system/menus")({
  component: MenusPage,
  head: () => ({ meta: [{ title: "菜单管理 - MatrixAdmin" }] }),
})

const TYPE_BADGE: Record<string, { label: string; cls: string; icon: string }> = {
  DIR:  { label: "目录", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",   icon: "📁" },
  MENU: { label: "菜单", cls: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", icon: "📄" },
  BTN:  { label: "按钮", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300", icon: "🔘" },
}

const inputCls = "flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
const selectCls = `${inputCls} cursor-pointer`

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}

function flattenTree(nodes: MenuNode[]): MenuNode[] {
  return nodes.flatMap((n) => [n, ...(n.children ? flattenTree(n.children) : [])])
}

// Collect rows in order from tree, returns flat array of [node, depth]
function collectRows(nodes: MenuNode[], depth = 0): Array<{ node: MenuNode; depth: number }> {
  return nodes.flatMap((n) => [
    { node: n, depth },
    ...(n.children && n.children.length > 0 ? collectRows(n.children, depth + 1) : []),
  ])
}

function MenusPage() {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuNode | null>(null)

  const { data: menuTree } = useQuery<MenuNode[]>({
    queryKey: ["system", "menus", "tree"],
    queryFn: () => apiGet<MenuNode[]>("/system/menus"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/system/menus/${id}`),
    onSuccess: () => {
      toast.success("删除成功")
      queryClient.invalidateQueries({ queryKey: ["system", "menus"] })
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  const allMenus = menuTree ? flattenTree(menuTree) : []
  const rows = menuTree ? collectRows(menuTree) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">菜单管理</h1>
        <AuthButton permission="sys:menu:add">
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            新增菜单
          </button>
        </AuthButton>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-48">菜单名称</th>
              <th className="px-4 py-3 text-left font-medium w-20">类型</th>
              <th className="px-4 py-3 text-left font-medium w-40">权限标识</th>
              <th className="px-4 py-3 text-left font-medium w-40">路由路径</th>
              <th className="px-4 py-3 text-left font-medium w-28">图标</th>
              <th className="px-4 py-3 text-left font-medium w-12 text-center">排序</th>
              <th className="px-4 py-3 text-left font-medium w-16 text-center">可见</th>
              <th className="px-4 py-3 text-left font-medium w-24">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map(({ node, depth }) => {
              const badge = TYPE_BADGE[node.menu_type] ?? TYPE_BADGE.BTN
              return (
                <tr key={node.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 20}px` }}>
                      {depth > 0 && (
                        <span className="text-muted-foreground/40 select-none mr-1">
                          {"└"}
                        </span>
                      )}
                      <span className="mr-1">{badge.icon}</span>
                      <span className="font-medium">{node.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-muted-foreground">{node.permission || "-"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs">{node.path || "-"}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">{node.icon || "-"}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center text-xs text-muted-foreground">{node.sort_order}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        node.visible
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {node.visible ? "显示" : "隐藏"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-3">
                      <AuthButton permission="sys:menu:edit">
                        <button
                          type="button"
                          onClick={() => setEditingMenu(node)}
                          className="text-xs text-primary hover:underline"
                        >
                          编辑
                        </button>
                      </AuthButton>
                      <AuthButton permission="sys:menu:del">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm("确定删除该菜单？子菜单也会被删除。")) {
                              deleteMutation.mutate(node.id)
                            }
                          }}
                          className="text-xs text-destructive hover:underline"
                        >
                          删除
                        </button>
                      </AuthButton>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <MenuFormDialog
          allMenus={allMenus}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false)
            queryClient.invalidateQueries({ queryKey: ["system", "menus"] })
          }}
        />
      )}

      {editingMenu && (
        <MenuEditDialog
          menu={editingMenu}
          allMenus={allMenus}
          onClose={() => setEditingMenu(null)}
          onSuccess={() => {
            setEditingMenu(null)
            queryClient.invalidateQueries({ queryKey: ["system", "menus"] })
          }}
        />
      )}
    </div>
  )
}

function MenuFormDialog({
  allMenus,
  onClose,
  onSuccess,
}: {
  allMenus: MenuNode[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<MenuCreate>({
    parent_id: null,
    name: "",
    menu_type: "MENU",
    permission: "",
    path: "",
    component: "",
    icon: "",
    sort_order: 0,
    visible: true,
    status: 1,
  })

  const mutation = useMutation({
    mutationFn: () => apiPost("/system/menus", form),
    onSuccess: () => {
      toast.success("创建成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold">新增菜单</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="上级菜单">
            <select
              value={form.parent_id || ""}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
              className={selectCls}
            >
              <option value="">顶级菜单</option>
              {allMenus.filter((m) => m.menu_type !== "BTN").map((m) => (
                <option key={m.id} value={m.id}>
                  {m.menu_type === "DIR" ? "📁 " : "📄 "}{m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="菜单类型">
            <select
              value={form.menu_type}
              onChange={(e) => setForm({ ...form, menu_type: e.target.value as "DIR" | "MENU" | "BTN" })}
              className={selectCls}
            >
              <option value="DIR">📁 目录</option>
              <option value="MENU">📄 菜单</option>
              <option value="BTN">🔘 按钮</option>
            </select>
          </Field>
          <Field label="菜单名称 *">
            <input
              placeholder="请输入菜单名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="权限标识">
            <input
              placeholder="如 sys:user:list"
              value={form.permission}
              onChange={(e) => setForm({ ...form, permission: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="路由路径">
            <input
              placeholder="如 /system/users"
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="图标">
            <input
              placeholder="如 Users、Shield"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="排序">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number.parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </Field>
          <Field label="是否显示">
            <div className="flex h-9 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                {form.visible ? "显示" : "隐藏"}
              </label>
            </div>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            取消
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.name}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "创建中..." : "创建"}
          </button>
        </div>
      </div>
    </div>
  )
}

function MenuEditDialog({
  menu,
  allMenus,
  onClose,
  onSuccess,
}: {
  menu: MenuNode
  allMenus: MenuNode[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState({
    parent_id: menu.parent_id,
    name: menu.name,
    menu_type: menu.menu_type,
    permission: menu.permission || "",
    path: menu.path || "",
    component: menu.component || "",
    icon: menu.icon || "",
    sort_order: menu.sort_order,
    visible: menu.visible,
    status: menu.status,
  })

  const mutation = useMutation({
    mutationFn: () => apiPut(`/system/menus/${menu.id}`, form),
    onSuccess: () => {
      toast.success("更新成功")
      onSuccess()
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl">
        <h2 className="mb-5 text-lg font-semibold">编辑菜单：{menu.name}</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="上级菜单">
            <select
              value={form.parent_id || ""}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
              className={selectCls}
            >
              <option value="">顶级菜单</option>
              {allMenus.filter((m) => m.id !== menu.id && m.menu_type !== "BTN").map((m) => (
                <option key={m.id} value={m.id}>
                  {m.menu_type === "DIR" ? "📁 " : "📄 "}{m.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="菜单类型">
            <select
              value={form.menu_type}
              onChange={(e) => setForm({ ...form, menu_type: e.target.value as "DIR" | "MENU" | "BTN" })}
              className={selectCls}
            >
              <option value="DIR">📁 目录</option>
              <option value="MENU">📄 菜单</option>
              <option value="BTN">🔘 按钮</option>
            </select>
          </Field>
          <Field label="菜单名称 *">
            <input
              placeholder="请输入菜单名称"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="权限标识">
            <input
              placeholder="如 sys:user:list"
              value={form.permission}
              onChange={(e) => setForm({ ...form, permission: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="路由路径">
            <input
              placeholder="如 /system/users"
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="图标">
            <input
              placeholder="如 Users、Shield"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="排序">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number.parseInt(e.target.value) || 0 })}
              className={inputCls}
            />
          </Field>
          <Field label="是否显示">
            <div className="flex h-9 items-center">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  className="h-4 w-4 rounded"
                />
                {form.visible ? "显示" : "隐藏"}
              </label>
            </div>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">
            取消
          </button>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.name}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {mutation.isPending ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  )
}
