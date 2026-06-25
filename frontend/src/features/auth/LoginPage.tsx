import { useState } from "react";
import { useCaptcha, useLogin } from "./api";

// 演示登录页：图形验证码 + 锁定提示 + 错误回显。生产换 Shadcn Form + Zod。
export function LoginPage({ onLoggedIn }: { onLoggedIn?: () => void }) {
  const captcha = useCaptcha();
  const login = useLogin();
  const [form, setForm] = useState({ username: "", password: "", captcha_code: "" });

  const submit = () => {
    if (!captcha.data) return;
    login.mutate(
      { ...form, captcha_id: captcha.data.captcha_id },
      { onSuccess: () => onLoggedIn?.(), onError: () => captcha.refetch() },
    );
  };

  return (
    <div className="mx-auto mt-24 w-80 space-y-3">
      <h1 className="text-xl font-semibold">登录</h1>
      <input className="w-full border p-2" placeholder="用户名"
        value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input className="w-full border p-2" type="password" placeholder="密码"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <div className="flex gap-2 items-center">
        <input className="flex-1 border p-2" placeholder="验证码"
          value={form.captcha_code} onChange={(e) => setForm({ ...form, captcha_code: e.target.value })} />
        {captcha.data && (
          <img src={captcha.data.image} alt="captcha" className="h-9 cursor-pointer border"
            onClick={() => captcha.refetch()} title="点击刷新" />
        )}
      </div>
      {login.isError && (
        <p className="text-sm text-red-600">{String((login.error as Error).message)}</p>
      )}
      <button className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
        disabled={login.isPending} onClick={submit}>
        {login.isPending ? "登录中…" : "登录"}
      </button>
    </div>
  );
}
