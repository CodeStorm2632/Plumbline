---
name: atlas-admin-design
description: Use this skill to generate well-branded interfaces and assets for Atlas Admin — a professional enterprise admin/中后台 management-system scaffold — either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components (tables, forms, permission trees, sidebars, dialogs/drawers) for prototyping data-dense admin panels.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Where things are
- `readme.md` — full design guide: sources, content fundamentals, visual foundations, iconography, and a component/UI-kit manifest. **Start here.**
- `styles.css` — global entry point; link it (it `@import`s everything). Tokens live in `tokens/*.css` (colors light+dark, typography, spacing/radii/elevation, base reset).
- `components/**` — reusable React primitives (forms, data-display, feedback, navigation, overlays, admin). Each has a `.prompt.md` with a usage snippet.
- `ui_kits/admin/**` — a full click-through admin console (login → sidebar shell → users/roles/permissions/menus/logs) that composes the primitives. The best reference for assembling a screen.
- `assets/` — logo mark + wordmark (theme-adaptive SVG).
- `guidelines/**` — foundation specimen cards.

## Non-negotiables
- Indigo/blue primary, slate neutrals, **no** candy colors, gradients (except the login brand panel), or emoji.
- Small radii (4–6px), compact density, hairline borders, soft low-spread shadows.
- Inter for UI, JetBrains Mono for codes/logs/permission keys/IPs/IDs.
- Simplified-Chinese UI copy; verb-first buttons; consistent status tone mapping (启用/成功=success, 停用=neutral, 失败/删除=danger, 待处理=warning).
- Lucide line icons only. Support light + dark via the `.dark` class on `<html>`.
