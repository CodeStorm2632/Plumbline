import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { RefreshCw } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useAuth, useCaptcha, isLoggedIn } from "@/hooks/useAuth"

const loginSchema = z.object({
  username: z.string().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
  captcha_id: z.string(),
  captcha_code: z.string().min(1, "请输入验证码"),
})
type LoginFormData = z.infer<typeof loginSchema>

export const Route = createFileRoute("/login")({
  component: LoginPage,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({ to: "/" })
    }
  },
  head: () => ({
    meta: [{ title: "登录 - MatrixAdmin" }],
  }),
})

function LoginPage() {
  const { loginMutation } = useAuth()
  const { data: captcha, refetch: refreshCaptcha } = useCaptcha()

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      captcha_id: "",
      captcha_code: "",
    },
  })

  const onSubmit = (data: LoginFormData) => {
    if (loginMutation.isPending) return
    loginMutation.mutate({
      ...data,
      captcha_id: captcha?.captcha_id || "",
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold">MatrixAdmin</h1>
          <p className="mt-2 text-muted-foreground">管理系统登录</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              用户名
            </label>
            <input
              id="username"
              {...form.register("username")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="请输入用户名"
            />
            {form.formState.errors.username && (
              <p className="text-xs text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              密码
            </label>
            <input
              id="password"
              type="password"
              {...form.register("password")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="请输入密码"
            />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="captcha_code" className="text-sm font-medium">
              验证码
            </label>
            <div className="flex gap-2">
              <input
                id="captcha_code"
                {...form.register("captcha_code")}
                className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="请输入验证码"
              />
              <button
                type="button"
                onClick={() => refreshCaptcha()}
                className="flex h-10 items-center gap-1 rounded-md border px-3 hover:bg-accent"
                title="刷新验证码"
              >
                {captcha?.captcha_image ? (
                  <img
                    src={captcha.captcha_image}
                    alt="验证码"
                    className="h-8"
                  />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </button>
            </div>
            {form.formState.errors.captcha_code && (
              <p className="text-xs text-destructive">
                {form.formState.errors.captcha_code.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            {loginMutation.isPending ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </div>
  )
}
