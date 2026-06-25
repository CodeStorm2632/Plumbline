import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useCreateDict, useCreateDictItem, useDeleteDict, useDeleteDictItem, useDictItems, useDicts, useUpdateDict, useUpdateDictItem, } from "./api";
const emptyDict = { code: "", name: "" };
const emptyItem = { type_code: "", label: "", value: "", order_no: 0 };
// 字典管理屏（SC-6）。七态：加载/错误/空/无权限/缺失/越权/成功。
export function SysDictPage({ roles }) {
    const canRead = roles.includes("管理员");
    const canWrite = roles.includes("管理员");
    const [q, setQ] = useState("");
    const dicts = useDicts(q);
    const [selectedCode, setSelectedCode] = useState("");
    const items = useDictItems(selectedCode);
    const createDict = useCreateDict();
    const updateDict = useUpdateDict();
    const deleteDict = useDeleteDict();
    const createItem = useCreateDictItem();
    const updateItem = useUpdateDictItem();
    const deleteItem = useDeleteDictItem();
    const [editingDictId, setEditingDictId] = useState(null);
    const [editingItemId, setEditingItemId] = useState(null);
    const [dictForm, setDictForm] = useState(emptyDict);
    const [itemForm, setItemForm] = useState(emptyItem);
    if (!canRead) {
        return _jsx("p", { className: "p-6 text-amber-700", role: "alert", children: "\u65E0\u8BBF\u95EE\u5B57\u5178\u7BA1\u7406\u7684\u6743\u9650\u3002" });
    }
    const selectType = (code) => {
        setSelectedCode(code);
        setItemForm({ ...emptyItem, type_code: code });
        setEditingItemId(null);
    };
    const resetDict = () => { setEditingDictId(null); setDictForm(emptyDict); };
    const resetItem = () => { setEditingItemId(null); setItemForm({ ...emptyItem, type_code: selectedCode }); };
    const submitDict = () => {
        if (editingDictId)
            updateDict.mutate({ id: editingDictId, data: dictForm }, { onSuccess: resetDict });
        else
            createDict.mutate(dictForm, { onSuccess: (d) => { resetDict(); selectType(d.code); } });
    };
    const submitItem = () => {
        const data = { ...itemForm, type_code: selectedCode };
        if (editingItemId)
            updateItem.mutate({ id: editingItemId, data }, { onSuccess: resetItem });
        else
            createItem.mutate(data, { onSuccess: resetItem });
    };
    return (_jsxs("div", { className: "space-y-4 p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h1", { className: "text-xl font-semibold", children: "\u5B57\u5178\u7BA1\u7406" }), _jsx("input", { className: "border p-1", placeholder: "\u641C\u7D22\u7C7B\u578B", value: q, onChange: (e) => setQ(e.target.value) })] }), canWrite && (_jsxs("div", { className: "flex flex-wrap items-end gap-2 rounded border p-3", children: [_jsx("input", { className: "border p-1 disabled:bg-gray-100", placeholder: "\u7C7B\u578B code", disabled: !!editingDictId, value: dictForm.code, onChange: (e) => setDictForm({ ...dictForm, code: e.target.value }) }), _jsx("input", { className: "border p-1", placeholder: "\u7C7B\u578B\u540D\u79F0", value: dictForm.name, onChange: (e) => setDictForm({ ...dictForm, name: e.target.value }) }), _jsx("button", { className: "rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50", disabled: createDict.isPending || updateDict.isPending || !dictForm.code || !dictForm.name, onClick: submitDict, children: createDict.isPending || updateDict.isPending ? "提交中…" : editingDictId ? "保存字典类型" : "新建字典类型" }), editingDictId && _jsx("button", { className: "rounded border px-3 py-1", onClick: resetDict, children: "\u53D6\u6D88\u7F16\u8F91" }), (createDict.isError || updateDict.isError) && _jsx("span", { className: "text-sm text-red-600", children: String((createDict.error || updateDict.error).message) })] })), dicts.isLoading && _jsx("p", { children: "\u52A0\u8F7D\u4E2D\u2026" }), dicts.isError && _jsxs("div", { role: "alert", className: "text-red-600", children: ["\u52A0\u8F7D\u5931\u8D25\u3002", _jsx("button", { className: "underline", onClick: () => dicts.refetch(), children: "\u91CD\u8BD5" })] }), dicts.data && dicts.data.length === 0 && _jsx("p", { className: "text-gray-500", children: "\u6682\u65E0\u5B57\u5178\u7C7B\u578B\u3002" }), dicts.data && dicts.data.length > 0 && (_jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [_jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-left", children: [_jsx("th", { className: "p-2", children: "code" }), _jsx("th", { className: "p-2", children: "\u540D\u79F0" }), _jsx("th", { className: "p-2", children: "\u5907\u6CE8" }), canWrite && _jsx("th", { className: "p-2", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { children: dicts.data.map((d) => (_jsxs("tr", { className: selectedCode === d.code ? "border-b bg-blue-50" : "border-b", children: [_jsx("td", { className: "p-2", children: _jsx("button", { className: "underline", onClick: () => selectType(d.code), children: d.code }) }), _jsx("td", { className: "p-2", children: d.name }), _jsx("td", { className: "p-2", children: d.remark || "—" }), canWrite && _jsxs("td", { className: "space-x-2 p-2", children: [_jsx("button", { className: "text-blue-600 hover:underline", onClick: () => { setEditingDictId(d.id); setDictForm({ code: d.code, name: d.name, remark: d.remark }); }, children: "\u7F16\u8F91" }), _jsx("button", { className: "text-red-600 hover:underline", onClick: () => deleteDict.mutate(d.id), children: "\u5220\u9664" })] })] }, d.id))) })] }), _jsxs("section", { className: "space-y-3 rounded border p-3", children: [_jsxs("h2", { className: "font-medium", children: ["\u5B57\u5178\u9879 ", selectedCode || "（请选择字典类型）"] }), !selectedCode && _jsx("p", { className: "text-gray-500", children: "\u8BF7\u9009\u62E9\u5B57\u5178\u7C7B\u578B\u3002" }), selectedCode && canWrite && (_jsxs("div", { className: "flex flex-wrap items-end gap-2", children: [_jsx("input", { className: "border p-1", placeholder: "label", value: itemForm.label, onChange: (e) => setItemForm({ ...itemForm, label: e.target.value, type_code: selectedCode }) }), _jsx("input", { className: "border p-1", placeholder: "value", value: itemForm.value, onChange: (e) => setItemForm({ ...itemForm, value: e.target.value, type_code: selectedCode }) }), _jsxs("select", { className: "border p-1", value: itemForm.status ?? "active", onChange: (e) => setItemForm({ ...itemForm, status: e.target.value }), children: [_jsx("option", { value: "active", children: "active" }), _jsx("option", { value: "disabled", children: "disabled" })] }), _jsx("button", { className: "rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50", disabled: createItem.isPending || updateItem.isPending || !itemForm.label || !itemForm.value, onClick: submitItem, children: editingItemId ? "保存字典项" : "新建字典项" }), editingItemId && _jsx("button", { className: "rounded border px-3 py-1", onClick: resetItem, children: "\u53D6\u6D88\u7F16\u8F91" })] })), items.isLoading && _jsx("p", { children: "\u52A0\u8F7D\u4E2D\u2026" }), items.isError && _jsxs("div", { role: "alert", className: "text-red-600", children: ["\u52A0\u8F7D\u5931\u8D25\u3002", _jsx("button", { className: "underline", onClick: () => items.refetch(), children: "\u91CD\u8BD5" })] }), selectedCode && items.data && items.data.length === 0 && _jsx("p", { className: "text-gray-500", children: "\u6682\u65E0\u5B57\u5178\u9879\u3002" }), items.data && items.data.length > 0 && (_jsxs("table", { className: "w-full border-collapse text-sm", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b text-left", children: [_jsx("th", { className: "p-2", children: "label" }), _jsx("th", { className: "p-2", children: "value" }), _jsx("th", { className: "p-2", children: "\u72B6\u6001" }), canWrite && _jsx("th", { className: "p-2", children: "\u64CD\u4F5C" })] }) }), _jsx("tbody", { children: items.data.map((i) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "p-2", children: i.label }), _jsx("td", { className: "p-2", children: i.value }), _jsx("td", { className: "p-2", children: i.status }), canWrite && _jsxs("td", { className: "space-x-2 p-2", children: [_jsx("button", { className: "text-blue-600 hover:underline", onClick: () => { setEditingItemId(i.id); setItemForm({ type_code: i.type_code, label: i.label, value: i.value, order_no: i.order_no, status: i.status }); }, children: "\u7F16\u8F91" }), _jsx("button", { className: "text-red-600 hover:underline", onClick: () => deleteItem.mutate(i.id), children: "\u5220\u9664" })] })] }, i.id))) })] }))] })] }))] }));
}
