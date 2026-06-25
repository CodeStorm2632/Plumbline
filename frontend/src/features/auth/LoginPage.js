import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCaptcha, useLogin } from "./api";
// 演示登录页：图形验证码 + 锁定提示 + 错误回显。生产换 Shadcn Form + Zod。
export function LoginPage({ onLoggedIn }) {
    const captcha = useCaptcha();
    const login = useLogin();
    const [form, setForm] = useState({ username: "", password: "", captcha_code: "" });
    const submit = () => {
        if (!captcha.data)
            return;
        login.mutate({ ...form, captcha_id: captcha.data.captcha_id }, { onSuccess: () => onLoggedIn?.(), onError: () => captcha.refetch() });
    };
    return (_jsxs("div", { className: "mx-auto mt-24 w-80 space-y-3", children: [_jsx("h1", { className: "text-xl font-semibold", children: "\u767B\u5F55" }), _jsx("input", { className: "w-full border p-2", placeholder: "\u7528\u6237\u540D", value: form.username, onChange: (e) => setForm({ ...form, username: e.target.value }) }), _jsx("input", { className: "w-full border p-2", type: "password", placeholder: "\u5BC6\u7801", value: form.password, onChange: (e) => setForm({ ...form, password: e.target.value }) }), _jsxs("div", { className: "flex gap-2 items-center", children: [_jsx("input", { className: "flex-1 border p-2", placeholder: "\u9A8C\u8BC1\u7801", value: form.captcha_code, onChange: (e) => setForm({ ...form, captcha_code: e.target.value }) }), captcha.data && (_jsx("img", { src: captcha.data.image, alt: "captcha", className: "h-9 cursor-pointer border", onClick: () => captcha.refetch(), title: "\u70B9\u51FB\u5237\u65B0" }))] }), login.isError && (_jsx("p", { className: "text-sm text-red-600", children: String(login.error.message) })), _jsx("button", { className: "w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50", disabled: login.isPending, onClick: submit, children: login.isPending ? "登录中…" : "登录" })] }));
}
