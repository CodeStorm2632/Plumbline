import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { useAuth, useCurrentUser } from "@/hooks/useAuth"

export const Route = createFileRoute("/_layout/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "个人设置 - MatrixAdmin" }] }),
})

function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "password">("profile")

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">个人设置</h1>

      <div className="flex gap-1 border-b">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`px-4 py-2 text-sm font-medium ${tab === "profile" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          基本信息
        </button>
        <button
          type="button"
          onClick={() => setTab("password")}
          className={`px-4 py-2 text-sm font-medium ${tab === "password" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"}`}
        >
          修改密码
        </button>
      </div>

      {tab === "profile" ? <ProfileTab /> : <PasswordTab />}
    </div>
  )
}

function ProfileTab() {
  const { data: user } = useCurrentUser()
  const { updateMeMutation } = useAuth()

  const [form, setForm] = useState({
    real_name: user?.real_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  })

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">用户名</label>
        <input
          value={user?.username || ""}
          disabled
          className="flex h-9 w-full rounded-md border border-input bg-muted px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">姓名</label>
        <input
          value={form.real_name}
          onChange={(e) => setForm({ ...form, real_name: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">邮箱</label>
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">手机号</label>
        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <button
        type="button"
        onClick={() => updateMeMutation.mutate(form)}
        disabled={updateMeMutation.isPending}
        className="rounded-md bg-primary px-6 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {updateMeMutation.isPending ? "保存中..." : "保存"}
      </button>
    </div>
  )
}

function PasswordTab() {
  const { changePasswordMutation } = useAuth()
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  })
  const [error, setError] = useState("")

  const handleSubmit = () => {
    setError("")
    if (form.new_password !== form.confirm_password) {
      setError("两次输入的密码不一致")
      return
    }
    if (form.new_password.length < 8) {
      setError("密码长度至少8位")
      return
    }
    changePasswordMutation.mutate({
      old_password: form.old_password,
      new_password: form.new_password,
    })
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">当前密码</label>
        <input
          type="password"
          value={form.old_password}
          onChange={(e) => setForm({ ...form, old_password: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">新密码</label>
        <input
          type="password"
          value={form.new_password}
          onChange={(e) => setForm({ ...form, new_password: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">确认新密码</label>
        <input
          type="password"
          value={form.confirm_password}
          onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={changePasswordMutation.isPending}
        className="rounded-md bg-primary px-6 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {changePasswordMutation.isPending ? "提交中..." : "修改密码"}
      </button>
    </div>
  )
}
