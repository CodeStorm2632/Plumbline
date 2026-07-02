# Admin Console — UI Kit

A high-fidelity, click-through recreation of the Atlas Admin management console. It composes the design-system primitives (it does **not** re-implement them) into the scaffold's real screens.

## Run it

Open `index.html` (via the design system's preview). Flow:

1. **Login** — split brand panel + form; account/password/graphic captcha, remember-me, forgot-password. Toggle the demo link to preview the **account-lock** alert. Click **登录** to enter.
2. **App shell** — collapsible multi-level sidebar (logo, grouped nav, user footer), sticky header with breadcrumb + global search + **dark-mode toggle** + notifications + profile. The sidebar `PanelLeft` button collapses to an icon rail.
3. **用户管理 (Users)** — filter toolbar, sortable + selectable zebra table (avatar/role tag/status switch + badge/masked phone), row actions, **bulk-action bar** on selection, create/edit **Drawer**, delete **Dialog**, pagination.
4. **角色管理 (Roles)** — role table with role tags & permission counts; the **分配权限** action opens a Drawer containing the **PermissionTree** (cascade + indeterminate, mono permission codes, 按钮 tags).
5. **菜单管理 (Menus)** — expandable menu tree table with 目录/菜单 type badges, permission codes, routes, status switches.
6. **字典管理 (Dict)** — dictionary list (type code, item count, values, status).
7. **日志管理 (Logs)** — Tabs for 登录日志 / 操作日志; login logs flag 境外 IPs and fail reasons; operation logs show HTTP method badges, permission codes, and latency.

## Files

- `index.html` — mounts everything; loads the DS bundle + React/Babel, then the screen scripts.
- `icons.jsx` — Lucide icon set (wrapper + ~28 glyphs), exported to `window`.
- `data.jsx` — mock users, roles, login/operation logs, menu tree, permission tree, dictionaries.
- `LoginScreen.jsx`, `AppShell.jsx`, `UsersScreen.jsx`, `RolesScreen.jsx`, `LogsScreen.jsx`, `MiscScreens.jsx` (Menus + Dict).

These are cosmetic recreations for prototyping — real data flow, validation, and auth are stubbed.
