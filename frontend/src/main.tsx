import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";

import { AppShell } from "./components/layout/app-shell";
import { buildNavGroupsFromMenus, collectTabsFromMenus, type NavTab } from "./components/layout/nav-config";
import { LoginPage } from "./features/auth/LoginPage";
import { useMyMenus } from "./features/sys_menu/api";
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
  const myMenus = useMyMenus({ enabled: authed });

  if (!authed) return <LoginPage onLoggedIn={() => setAuthed(true)} />;

  const roles: string[] = JSON.parse(localStorage.getItem("roles") ?? "[]");
  const username = localStorage.getItem("username") ?? "管理员";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roles");
    localStorage.removeItem("username");
    setAuthed(false);
  };

  const navGroups = useMemo(() => buildNavGroupsFromMenus(myMenus.data), [myMenus.data]);
  const allowedTabs = useMemo(() => collectTabsFromMenus(myMenus.data), [myMenus.data]);

  useEffect(() => {
    if (!allowedTabs.length) return;
    if (!allowedTabs.includes(tab)) {
      setTab(allowedTabs[0]);
    }
  }, [allowedTabs, tab]);

  const renderTab = () => {
    if (!allowedTabs.length && !myMenus.isLoading) {
      return (
        <div role="alert">
          当前账号未分配可访问菜单，请联系管理员在角色菜单授权中分配导航菜单。
        </div>
      );
    }
    if (tab === "users") return <SysUserPage roles={roles} />;
    if (tab === "roles") return <SysRolePage roles={roles} />;
    if (tab === "menus") return <SysMenuPage roles={roles} />;
    if (tab === "dicts") return <SysDictPage roles={roles} />;
    return <SysLogPage roles={roles} />;
  };

  return (
    <AppShell
      activeTab={tab}
      onNavigate={setTab}
      username={username}
      onLogout={logout}
      groups={navGroups}
      navLoading={myMenus.isLoading}
      navError={myMenus.isError}
      onRetryNav={() => myMenus.refetch()}
    >
      {renderTab()}
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

