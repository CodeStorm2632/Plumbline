import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { LoginPage } from "./features/auth/LoginPage";
import { SysDictPage } from "./features/sys_dict/SysDictPage";
import { SysLogPage } from "./features/sys_log/SysLogPage";
import { SysMenuPage } from "./features/sys_menu/SysMenuPage";
import { SysRolePage } from "./features/sys_role/SysRolePage";
import { SysUserPage } from "./features/sys_user/SysUserPage";
import "./index.css";
const qc = new QueryClient();
// 极简壳：真实项目用 TanStack Router 的 createRouter + 文件路由（见 README）。
// 系统管理各屏（用户/角色/菜单/日志/字典）作为后续垂直切片接入此处。
function App() {
    const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
    const [tab, setTab] = useState("users");
    if (!authed)
        return _jsx(LoginPage, { onLoggedIn: () => setAuthed(true) });
    const roles = JSON.parse(localStorage.getItem("roles") ?? "[]");
    const navBtn = (key, label) => (_jsx("button", { className: tab === key ? "font-semibold" : "text-gray-600", onClick: () => setTab(key), children: label }));
    return (_jsxs("div", { children: [_jsxs("nav", { className: "flex items-center gap-4 border-b p-2", children: [navBtn("users", "用户管理"), navBtn("roles", "角色管理"), navBtn("menus", "菜单管理"), navBtn("dicts", "字典管理"), navBtn("logs", "日志管理"), _jsx("button", { className: "ml-auto text-sm text-gray-600 hover:underline", onClick: () => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("roles");
                            setAuthed(false);
                        }, children: "\u9000\u51FA\u767B\u5F55" })] }), tab === "users" && _jsx(SysUserPage, { roles: roles }), tab === "roles" && _jsx(SysRolePage, { roles: roles }), tab === "menus" && _jsx(SysMenuPage, { roles: roles }), tab === "dicts" && _jsx(SysDictPage, { roles: roles }), tab === "logs" && _jsx(SysLogPage, { roles: roles })] }));
}
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsxs(QueryClientProvider, { client: qc, children: [_jsx(App, {}), _jsx(Toaster, { richColors: true })] }) }));
