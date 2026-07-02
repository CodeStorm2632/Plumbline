import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { AppShell } from "./components/layout/app-shell";
import type { NavTab } from "./components/layout/nav-config";
import { LoginPage } from "./features/auth/LoginPage";
import { SysDictPage } from "./features/sys_dict/SysDictPage";
import { SysLogPage } from "./features/sys_log/SysLogPage";
import { SysMenuPage } from "./features/sys_menu/SysMenuPage";
import { SysRolePage } from "./features/sys_role/SysRolePage";
import { SysUserPage } from "./features/sys_user/SysUserPage";
import "./index.css";

const qc = new QueryClient();

function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const [tab, setTab] = useState<NavTab>("users");

  if (!authed) return <LoginPage onLoggedIn={() => setAuthed(true)} />;

  const roles: string[] = JSON.parse(localStorage.getItem("roles") ?? "[]");
  const username = localStorage.getItem("username") ?? "管理员";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    setAuthed(false);
  };

  return (
    <AppShell
      activeTab={tab}
      onNavigate={setTab}
      username={username}
      onLogout={logout}
    >
      {tab === "users" && <SysUserPage roles={roles} />}
      {tab === "roles" && <SysRolePage roles={roles} />}
      {tab === "menus" && <SysMenuPage roles={roles} />}
      {tab === "dicts" && <SysDictPage roles={roles} />}
      {tab === "logs" && <SysLogPage roles={roles} />}
    </AppShell>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <App />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  </StrictMode>
);

