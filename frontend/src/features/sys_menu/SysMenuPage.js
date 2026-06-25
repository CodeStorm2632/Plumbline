import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCreateMenu, useDeleteMenu, useMenus, useUpdateMenu, } from "./api";
function flattenMenus(items, depth = 0) {
    return items.flatMap((item) => [{ ...item, depth }, ...flattenMenus(item.children ?? [], depth + 1)]);
}
const emptyForm = { code: "", name: "", type: "menu", order_no: 0 };
// 菜单管理屏（SC-5）。七态：加载/错误/空/无权限/缺失/越权/成功。
export function SysMenuPage({ roles }) {
    const canRead = roles.includes("管理员");
    const canWrite = roles.includes("管理员");
    const menus = useMenus();
    const create = useCreateMenu();
    const update = useUpdateMenu();
    const del = useDeleteMenu();
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    if (!canRead) {
        return _jsx("p", { className: "p-6 text-amber-700", role: "alert", children: "\u65E0\u8BBF\u95EE\u83DC\u5355\u7BA1\u7406\u7684\u6743\u9650\u3002" });
    }
    const rows = menus.data ? flattenMenus(menus.data) : [];
    const reset = () => { setEditingId(null); setForm(emptyForm); };
    const submit = () => {
        if (editingId) {
            update.mutate({ id: editingId, data: form }, { onSuccess: reset });
        }
        else {
            create.mutate(form, { onSuccess: reset });
        }
    };
    return (_jsxs("div", { className: "space-y-4 p-6", children: [_jsx("h1", { className: "text-xl font-semibold", children: "\u83DC\u5355\u7BA1\u7406" }), canWrite && (_jsxs("div", { className: "flex flex-wrap items-end gap-2 rounded border p-3", children: [_jsx("input", { className: "border p-1 disabled:bg-gray-100", placeholder: "\u83DC\u5355\u7801", disabled: !!editingId, value: form.code, onChange: (e) => setForm({ ...form, code: e.target.value }) }), _jsx("input", { className: "border p-1", placeholder: "\u540D\u79F0", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }) }), _jsxs("select", { className: "border p-1", value: form.type, onChange: (e) => setForm({ ...form, type: e.target.value, perm_code: e.target.value === "button" ? form.perm_code : null }), children: [_jsx("option", { value: "dir", children: "\u76EE\u5F55" }), _jsx("option", { value: "menu", children: "\u83DC\u5355" }), _jsx("option", { value: "button", children: "\u6309\u94AE" })] }), _jsx("input", { className: "border p-1", placeholder: "\u7236\u8282\u70B9 ID", value: form.parent_id ?? "", onChange: (e) => setForm({ ...form, parent_id: e.target.value || null }) }), _jsx("input", { className: "border p-1", placeholder: "\u8DEF\u5F84", value: form.path ?? "", onChange: (e) => setForm({ ...form, path: e.target.value || null }) }), _jsx("input", { className: "border p-1", placeholder: "\u6743\u9650\u7801", value: form.perm_code ?? "", onChange: (e) => setForm({ ...form, perm_code: e.target.value || null }) }), _jsx("button", { className: "rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50", disabled: create.isPending || update.isPending || !form.code || !form.name, onClick: submit, children: create.isPending || update.isPending ? "提交中…" : editingId ? "保存菜单" : "新建节点" }), editingId && _jsx("button", { className: "rounded border px-3 py-1", onClick: reset, children: "\u53D6\u6D88\u7F16\u8F91" }), (create.isError || update.isError) && (_jsx("span", { className: "text-sm text-red-600", children: String((create.error || update.error).message) }))] })), menus.isLoading && _jsx("p", { children: "\u52A0\u8F7D\u4E2D\u2026" }), menus.isError && (_jsxs("div", { role: "alert", className: "text-red-600", children: ["\u52A0\u8F7D\u5931\u8D25\u3002", _jsx("button", { className: "underline", onClick: () => menus.refetch(), children: "\u91CD\u8BD5" })] })), menus.data && rows.length === 0 && _jsx("p", { className: "text-gray-500", children: "\u6682\u65E0\u83DC\u5355\u3002" }), rows.length > 0 && (_jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-left", children: [_jsx("th", { className: "p-2", children: "\u540D\u79F0/\u5C42\u7EA7" }), _jsx("th", { className: "p-2", children: "\u7C7B\u578B" }), _jsx("th", { className: "p-2", children: "\u8DEF\u5F84" }), _jsx("th", { className: "p-2", children: "\u6743\u9650\u7801" }), canWrite && _jsx("th", { className: "p-2", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { children: rows.map((m) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", style: { paddingLeft: `${m.depth * 20 + 8}px` }, children: m.name }), _jsx("td", { className: "p-2", children: m.type }), _jsx("td", { className: "p-2", children: m.path || "—" }), _jsx("td", { className: "p-2", children: m.perm_code || (m.type === "button" ? "权限码缺失" : "—") }), canWrite && (_jsxs("td", { className: "space-x-2 p-2", children: [_jsx("button", { className: "text-blue-600 hover:underline", onClick: () => {
                                                setEditingId(m.id);
                                                setForm({ code: m.code, name: m.name, type: m.type, parent_id: m.parent_id, path: m.path, perm_code: m.perm_code, icon: m.icon, order_no: m.order_no });
                                            }, children: "\u7F16\u8F91" }), _jsx("button", { className: "text-red-600 hover:underline", onClick: () => del.mutate(m.id), children: "\u5220\u9664" })] }))] }, m.id))) })] }))] }));
}
