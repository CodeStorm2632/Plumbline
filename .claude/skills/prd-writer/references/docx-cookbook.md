# docx_builder.js 使用手册（可选 · 高规格 docx 渲染）

> **定位**：本库是**可选**的「premium 渲染路径」，不是 PRD 的真源。PRD 真源永远是 `PRD-<slug>.md`。默认渲染用 `scripts/render_prd.sh`（pandoc，已够用）；只有当用户明确要带封面、自动目录、斑马线表格的高规格 Word 交付件时，才用本库。**用本库时内容仍以 md 为准、保持一致，不要另起一份手写源**，否则会产生 docx/md 双源漂移——这正是 markdown 优先要消除的问题。

`scripts/docx_builder.js` 是对 `docx` npm 包的薄封装，产出中文友好、版式统一的 Word 文档（A4、封面、自动目录、页眉页脚、藏青/蓝标题、斑马线表格）。**先复制到工作目录再用**（如 `/home/claude/`），因为 skill 目录可能只读。

## 最小用法

```js
const B = require("./docx_builder.js");
B.resetLists();                 // 复用同一进程多次构建时，先重置编号计数
const body = [];
const push = (...x) => x.forEach(e => body.push(e));

push(...B.cover({ title: "产品需求说明书（PRD）", subtitle: "XX系统",
  note: "（范围说明）", infoRows: [["文档版本","V1.0"],["编制日期","2026-06"]] }));
push(...B.toc());

push(B.H1("1  背景与目标"));
push(B.P("一段正文。"));
push(B.P([B.run("加粗前缀：", {bold:true}), B.run("普通正文。")]));  // 混合 run
push(B.BUL("无序要点"));
push(...B.numList(["有序步骤一", "有序步骤二"]));                    // 注意 spread (...)

push(B.TBL([3000, B.CW - 3000],
  [B.TH("列A", 3000), B.TH("列B", B.CW - 3000, { align: B.AlignmentType.LEFT })],
  [["a1","b1"], ["a2","b2"]],
  { cellOpts: [{ bold: true }, {}] }));

B.buildAndSave({ title: "产品需求说明书（PRD）", subtitle: "XX系统",
  headerText: "XX系统 · 产品需求说明书" }, body,
  "/mnt/user-data/outputs/XX系统-产品需求说明书-V1.0.docx")
 .then(p => console.log("saved", p));
```

## API 速查

| 函数 | 返回 | 说明 |
|------|------|------|
| `run(text, opts)` | TextRun | `opts`: `size`(半磅,默认21=10.5pt) `bold` `italics` `color`(hex) |
| `P(text\|runs, opts)` | Paragraph | 正文段；传 run 数组可混合格式 |
| `H1/H2/H3(text)` | Paragraph | 三级标题（带大纲级别，供目录识别） |
| `BUL(text\|runs, opts)` | Paragraph | 无序项；`opts.level` 0/1 两级 |
| `numList(items)` | Paragraph[] | 有序列表，**返回数组，需 spread**；每次调用自动重新从 1 计数 |
| `code(text)` | Paragraph | 浅灰底等宽风格块，逐行调用表达规则/伪代码 |
| `spacer(after)` | Paragraph | 纵向间距 |
| `pageBreak()` | Paragraph | 分页 |
| `TH(text, w, opts)` | TableCell | 表头单元格（藏青底白字）；`opts.align/fill/color/size` |
| `TD(content, w, opts)` | TableCell | 普通单元格；`content` 可为字符串、字符串数组（多段）、或 Paragraph 数组 |
| `TBL(widths, headerCells, rows, opts)` | Table | 见下 |
| `cover(meta)` | Paragraph[] | 封面 + 信息表 + 分页；`meta`: `title/subtitle/note/infoRows` |
| `toc(heading?)` | Paragraph[] | 目录占位（Word 打开自动填充） |
| `buildAndSave(meta, body, outPath)` | Promise | 组装并写盘；`meta`: `title/subtitle/note/headerText/creator` |
| `resetLists()` | — | 重置有序列表计数器 |
| 常量 | — | `CW`(=9026 内容宽) `NAVY/BLUE/LIGHT/LIGHTER` `AlignmentType` |

## 表格宽度规则（最易出错）

- `TBL(widths, header, rows, opts)`：
  - `widths` 各列宽度（DXA，1440=1 英寸），**之和 = 表宽**。整页表用 `B.CW`(9026) 拆分。
  - `header` 是 `TH(...)` 单元格数组，长度 = 列数。
  - `rows` 每行是数组，元素为字符串 / 字符串数组（多段落）/ `TH/TD` 单元格。
  - `opts.cellOpts[列号]` = `{ bold, align, fill }`，对该列统一生效。
  - 奇数行自动加斑马底色（未显式给 `fill` 时）。
- 三列示例：`[2100, 3200, B.CW - 2100 - 3200]` 保证精确合计。
- **不要**用 `WidthType.PERCENTAGE`（Google Docs 会坏）——库已固定用 DXA。

## 编号列表的坑

- `numList()` 每次调用领取一个独立编号引用，**自动从 1 重新开始**——这正是我们想要的（各章有序列表互不串号）。
- 预注册了 40 个有序引用；一个文档里有序列表超过 40 个会循环复用（极少见）。需要更多就把 `docx_builder.js` 里的 `LIMIT` 调大。
- 同一进程里构建**多个文档**时，先 `B.resetLists()` 再拼装，避免计数累积。

## 标注「开放问题」的约定

醒目红用于「待明确」：

```js
push(B.P([B.run("待明确：", {bold:true, color:"B00020"}),
          B.run("直通车判定规则需与业务方确认，本期先实现人工校准通道。")]));
```

## 自检（务必做）

```bash
# 1) 结构校验
python /mnt/skills/public/docx/scripts/office/validate.py out.docx        # 期望 All validations PASSED!
# 2) 渲染截图自检
python /mnt/skills/public/docx/scripts/office/soffice.py --headless --convert-to pdf out.docx
pdftoppm -jpeg -r 100 out.pdf pg && ls pg-*.jpg
# 然后 view 封面 / 一页带表格内页 / 附录，检查中文、表格对齐、页眉页脚
```

- 目录页在 LibreOffice 转的 PDF 里**可能为空**：这是字段未刷新的正常现象。库已设 `features.updateFields=true`，Word 打开会自动填充目录与「共 N 页」。**不要**为此把动态目录改成手写静态目录。
- 若 validate 报「Duplicate id」之类，多半来自手动加的 Bookmark——目录靠标题样式即可，通常无需 Bookmark。

## 字体

- 默认 Latin=Calibri、中文(eastAsia)=DengXian。渲染依赖阅读端字体，缺失时 Word 会回退，不影响 .docx 有效性。需要换字体改 `docx_builder.js` 顶部的 `EA/LAT`。
