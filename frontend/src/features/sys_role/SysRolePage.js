import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCreateRole, useDeleteRole, useRoles } from "./api";
// 角色管理屏（SC-3）。七态：加载/错误/空/无权限/缺失/越权(409)/成功。
export function SysRolePage({ roles }) {
    const canRead = roles.includes("管理员");
    const canWrite = roles.includes("管理员");
    const list = useRoles();
    const create = useCreateRole();
    const del = useDeleteRole();
    const [form, setForm] = useState({ code: "", name: "" });
    if (!canRead) {
        return _jsx("p", { className: "p-6 text-amber-700", role: "alert", children: "\u65E0\u8BBF\u95EE\u89D2\u8272\u7BA1\u7406\u7684\u6743\u9650\u3002" });
    }
    return (_jsxs("div", { className: "space-y-4 p-6", children: [_jsx("h1", { className: "text-xl font-semibold", children: "\u89D2\u8272\u7BA1\u7406" }), canWrite && (_jsxs("div", { className: "flex flex-wrap items-end gap-2 rounded border p-3", children: [_jsx("input", { className: "border p-1", placeholder: "\u89D2\u8272\u7801", value: form.code, onChange: (e) => setForm({ ...form, code: e.target.value }) }), _jsx("input", { className: "border p-1", placeholder: "\u540D\u79F0", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }), _jsx("button", { className: "rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50", disabled: create.isPending || !form.code || !form.name, onClick: () => create.mutate(form, { onSuccess: () => setForm({ code: "", name: "" }) }), children: create.isPending ? "提交中…" : "新建角色" }), create.isError && (_jsx("span", { className: "text-sm text-red-600", children: String(create.error.message) }))] })), list.isLoading && _jsx("p", { children: "\u52A0\u8F7D\u4E2D\u2026" }), list.isError && (_jsxs("div", { role: "alert", className: "text-red-600", children: ["\u52A0\u8F7D\u5931\u8D25\u3002", _jsx("button", { className: "underline", onClick: () => list.refetch(), children: "\u91CD\u8BD5" })] })), list.data && list.data.length === 0 && _jsx("p", { className: "text-gray-500", children: "\u6682\u65E0\u89D2\u8272\u3002" }), list.data && list.data.length > 0 && (_jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-left", children: [_jsx("th", { className: "p-2", children: "\u89D2\u8272\u7801" }), _jsx("th", { className: "p-2", children: "\u540D\u79F0" }), _jsx("th", { className: "p-2", children: "\u6743\u9650\u6570" }), canWrite && _jsx("th", { className: "p-2", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { children: list.data.map((r) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: r.code }), _jsx("td", { className: "p-2", children: r.name }), _jsx("td", { className: "p-2", children: r.menu_ids.length }), canWrite && (_jsxs("td", { className: "p-2", children: [_jsx("button", { className: "text-red-600 hover:underline", onClick: () => del.mutate(r.id), children: "\u5220\u9664" }), del.isError && (_jsx("span", { className: "ml-2 text-xs text-red-600", children: String(del.error.message) }))] }))] }, r.id))) })] }))] }));
}
