# Atlas Admin Design System

A reusable, enterprise-grade **中后台管理系统脚手架** (admin scaffold) design system. It supplies the visual foundations, reusable components, and full-screen UI kit needed to spin up the management side of any business system quickly — with a clear information architecture, disciplined forms, capable data tables, and a permission-first visual language.

The tone is **专业、严谨、现代** (professional, rigorous, modern): a steady indigo/blue primary, slate neutrals, small rational corners, compact density, and no marketing flourish.

---

## Sources & references

This system's structure and component vocabulary are adapted from:

- **[satnaing/shadcn-admin](https://github.com/satnaing/shadcn-admin)** — the admin dashboard (Shadcn UI + Vite + TanStack Router) whose token layout, sidebar model, and component set we studied. Explore this repo to go deeper on the underlying Shadcn/Radix component behavior, RTL support, and route structure.
  - Read: `src/styles/theme.css` (token layout), `src/components/ui/*` (primitives), `src/components/layout/*` + `data/sidebar-data.ts` (sidebar model), `src/features/*` (feature screens).

**We intentionally diverged from the source defaults** per the product brief for this scaffold:
- **Primary color** — shadcn-admin ships a near-black slate primary; we use a **steady indigo/blue** primary (`--primary`, `oklch(0.515 0.176 264.5)`), avoiding candy/bright hues.
- **Radii** — source uses `0.625rem` (~10px); we use **small 4–6px** corners for a more rational, restrained feel.
- **Density** — tighter type scale and control heights so wide tables hold more columns comfortably.
- **Status & permission language** — added a full semantic status palette and a dedicated `PermissionTree`, since role/permission configuration and log auditing are the core of this product.

> **Font note (needs your input):** The source uses **Inter** (+ Manrope). We load **Inter** and **JetBrains Mono** from Google Fonts. If you have licensed/self-hosted copies (or want a different pairing), send the files and we'll swap the `@import` in `tokens/fonts.css` for `@font-face`.

---

## Product context

The scaffold's core surfaces are **data-dense**: tables, filters, permission configuration, and log retrieval. Functional modules it targets:

- **登录系统** — account login, token auth, graphic captcha, account-lock messaging
- **用户管理** — create / edit / disable / delete users, role assignment
- **角色管理** — role maintenance, menu + button-level permission assignment
- **菜单管理** — backend menu tree, permission-code configuration
- **字典管理** — dropdown options, status types, shared base data
- **日志管理** — login logs & operation logs, view + search
- **安全能力** — encrypted sensitive fields, masked display, fine-grained permissions, audit trail

---

## CONTENT FUNDAMENTALS

How copy is written across the scaffold.

- **Language:** Primary UI language is **Simplified Chinese (简体中文)**. Technical identifiers — permission codes (`system:user:add`), routes (`/system/user`), HTTP methods, IPs, dict types (`sys_user_status`) — stay in **mono ASCII**. English appears only as short labels in brand/marketing corners.
- **Voice:** Neutral, operational, second-person-implied. Instructions are direct imperatives: 「请输入登录账号」「确认删除」「分配权限」. No first person, no personality, no exclamation marks.
- **Casing:** Chinese has no case; Latin labels are Title Case for brand (`Atlas Admin`) and lowercase for codes. Uppercase is reserved for tiny eyebrow/section labels via letter-spacing (`--tracking-caps`).
- **Buttons:** Verb-first and short — 新增 / 编辑 / 删除 / 查询 / 重置 / 导出 / 保存 / 取消 / 分配权限. The single primary action per view is indigo; everything else is outline/ghost.
- **Status words:** Consistent pairs — 启用/停用, 成功/失败, 已锁定, 待处理, 登录/操作. Each maps to one semantic tone (see below), always.
- **Confirmation copy:** State the object and the consequence: 「确定要删除用户「张伟」吗？该操作将记录到操作日志，且不可撤销。」
- **Counts & meta:** 「共 128 条」「已选择 3 项」「已选 42 项」. Timestamps are `YYYY-MM-DD HH:mm:ss`, mono.
- **Emoji:** **Never.** No emoji, no decorative unicode. Iconography is Lucide line icons only.
- **Vibe:** Reads like a well-run internal tool — precise, quiet, trustworthy.

---

## VISUAL FOUNDATIONS

- **Color** — Indigo/blue primary (`--primary`) for actions, selected rows, active nav, and focus rings. Neutrals are a **slate** ramp (cool, faintly blue-tinted) for surfaces, borders, and text. Surfaces layer as `background` (canvas) → `card` (panels) → `muted` (table headers, zebra stripes). A full **semantic palette** — success (green), warning (amber), danger (red), info (blue), neutral (gray) — each with a `-subtle` tinted background + readable foreground, used for status badges and alerts. Both **light (`:root`) and dark (`.dark`)** themes ship; toggling `.dark` on `<html>` swaps everything.
- **Type** — **Inter** for all UI; **JetBrains Mono** for codes, logs, IPs, IDs, permission keys (with `zero` feature for slashed zero). Compact scale: body 14px, table/label 13px, captions 12px, tiny eyebrows 11px uppercase. Page titles 24px/700, card titles 17px/600. Line-height ~1.55 body, ~1.4 dense.
- **Spacing & density** — 4px base grid. Cell padding 12–14px, card padding 16px, section gaps 20–24px. Control heights are tight: 30px (sm), 34px (md default), 40px (lg); table rows 44px (38px dense).
- **Radii** — Small and rational: 4px (sm), **6px (md — buttons, inputs, cards, popovers)**, 8px (xl — drawers), full for pills/tags. Nothing is very round.
- **Borders** — Hairline `--border` (slate, low-contrast) everywhere; `--border-strong` for interactive edges (input outlines, checkbox borders, page-buttons). Tables use per-row dividers by default, or `zebra` (alternating `muted` rows) for wide read-only tables.
- **Elevation** — Soft, low-spread, blue-tinted shadows. `xs` on controls, `sm` on cards, `md` on hover, `popover`/`lg` on dropdowns/dialogs/drawers. Never floaty or heavy.
- **Backgrounds** — Flat. No gradients in the product chrome (the one exception: the login brand panel uses a deep indigo gradient + faint grid, clearly a marketing surface). No textures, no photography, no illustration in the app itself.
- **Hover / press** — Buttons darken to `--primary-hover` (or `--accent` for quiet variants); rows go to `--accent`; selected rows fill `--primary-muted`. No scale/bounce. Transitions are short (120–180ms) with a standard ease; the drawer slides (300ms, ease-out). Reduced-motion respected implicitly (no infinite loops).
- **Focus** — 3px translucent ring in `--ring` (indigo) plus border color change; consistent across inputs, buttons, checkboxes, selects.
- **Transparency/blur** — Sparingly: the sticky header uses a translucent card fill + `backdrop-filter: blur(8px)`; dialog/drawer overlays are ~45% slate scrim.
- **Cards** — `card` background, 1px `border`, 6px radius, `shadow-sm`. Optional header (title + description + right-aligned actions, bottom border) and muted footer (right-aligned buttons, top border).
- **Permission visual language** — Role tags carry a consistent per-role tone. The permission tree uses tri-state checkboxes (checked / **indeterminate** parents) with mono permission-code chips and a 按钮 tag on button-level leaves. Status uses colored dot-badges; on/off uses the indigo Switch.

---

## ICONOGRAPHY

- **System:** **[Lucide](https://lucide.dev)** line icons — the same set the source shadcn-admin uses (`lucide-react`). Consistent 24×24 viewBox, ~1.75px stroke, round caps/joins, no fill.
- **Implementation:** For the UI kit we ship `ui_kits/admin/icons.jsx` — a small React `Icon` wrapper plus ~28 named glyphs (path data from Lucide, ISC-licensed) used across the shell, tables, and toolbars. This keeps the kit self-contained (no ESM/CDN dependency in Babel). In production, install `lucide-react` and import the same names.
- **Intrinsic control glyphs:** Checkbox ticks, the select chevron, sort arrows, the tree expander, and the captcha are drawn inline within their components (they're part of the control, not decorative icons).
- **Emoji / unicode icons:** **None.** Do not introduce them.
- **Logo:** `assets/logo-mark.svg` (a layered-panel mark in the primary color) and `assets/logo-wordmark.svg` (mark + "Atlas Admin"). Both reference `--primary`/`--foreground` so they adapt to theme. These are original scaffold marks — swap in your own brand mark for a real product.

---

## Index / manifest

Root files:
- `styles.css` — global entry point (consumers link this). `@import`s only.
- `tokens/` — `fonts.css`, `colors.css` (light + dark), `typography.css`, `spacing.css` (spacing, radii, elevation, motion, layout), `base.css` (reset + scrollbars + focus).
- `assets/` — `logo-mark.svg`, `logo-wordmark.svg`.
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.
- `components/` — reusable primitives (see below). Each has `<Name>.jsx`, `<Name>.d.ts`, `<Name>.prompt.md`, and a directory `@dsCard` HTML.
- `ui_kits/admin/` — the full admin console recreation (see its README).
- `SKILL.md` — Agent-Skill-compatible entry for downloading/using this system.

**Components** (`window.AtlasAdminDesignSystem_9d1c70.<Name>`):
- **forms/** — `Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `FormField`
- **data-display/** — `Badge`, `Tag`, `Avatar`, `Card` (+ `CardHeader`/`CardBody`/`CardFooter`), `DataTable`, `Pagination`
- **feedback/** — `Alert`, `Toast`, `Tooltip`, `Skeleton`, `EmptyState`
- **navigation/** — `Breadcrumb`, `Tabs`, `SidebarNav`
- **overlays/** — `Dialog`, `Drawer`
- **admin/** — `PermissionTree`

**UI kit** — `ui_kits/admin/index.html`: login → app shell (collapsible multi-level sidebar, sticky header, breadcrumb, dark-mode toggle) → 用户管理 / 角色管理（含权限分配抽屉）/ 菜单管理 / 字典管理 / 日志管理.
