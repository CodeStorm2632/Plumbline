/*
 * sample_assemble.js — minimal worked example for docx_builder.js
 * Run:  node sample_assemble.js   (expects ../scripts/docx_builder.js)
 * Produces a short 2–3 page demo PRD so the calling pattern is copy-pasteable.
 *
 * In a real run, copy this file next to docx_builder.js, replace the body
 * with your structured PRD content (follow references/prd-template.md),
 * then validate + render with the docx skill.
 */
const path = require("path");
const B = require(path.join(__dirname, "..", "scripts", "docx_builder.js"));
const { run, P, H1, H2, H3, BUL, numList, TBL, TH, code, spacer, pageBreak, CW, AlignmentType } = B;

B.resetLists();
const body = [];
const push = (...x) => x.forEach(e => body.push(e));

// cover + table of contents
push(...B.cover({
  title: "产品需求说明书（PRD）",
  subtitle: "示例系统",
  note: "（用于演示 docx_builder 用法）",
  infoRows: [
    ["文档版本", "V1.0（草案）"],
    ["文档状态", "评审中"],
    ["编制日期", "2026-06"],
    ["密级", "内部"],
  ],
}));
push(...B.toc());

// 1 背景
push(H1("1  背景与目标"));
push(P("一句话说明系统要解决的业务问题、面向的用户与核心价值。"));
push(P([run("产品定位：", { bold: true }), run("用一两句话给出清晰、可记忆的定位。")]));

// 2 范围
push(H1("2  项目范围"));
push(H2("2.1  本期范围（In Scope）"));
push(...numList(["能力一", "能力二", "能力三"]));
push(H2("2.2  暂不在本期范围（Out of Scope）"));
push(BUL("明确划出去的事项一"), BUL("明确划出去的事项二"));

// 3 用户与场景
push(H1("3  目标用户与典型场景"));
push(TBL([2100, 3200, CW - 2100 - 3200],
  [TH("角色", 2100), TH("职责", 3200, { align: AlignmentType.LEFT }), TH("核心诉求", CW - 2100 - 3200, { align: AlignmentType.LEFT })],
  [
    ["角色A", "做什么", "最在意什么"],
    ["角色B", "做什么", "最在意什么"],
  ],
  { cellOpts: [{ bold: true }, {}, {}] }));

// 4 功能需求
push(pageBreak());
push(H1("4  功能需求详述"));
push(H2("4.1  模块一"));
push(P("模块目标一句话。"));
push(H3("4.1.1  规则/字段示例"));
push(P("复杂规则可用代码块表达，便于核对："));
push(code("指标: 示例指标 { 上限: 15 }"));
push(code("  规则[计件累加]  子项A: 3 分/个"));
push(code("  规则[分档定值]  子项B: 一等 10 / 二等 6"));
push(spacer(60));

// 5 验收
push(H1("5  验收标准与度量"));
push(...numList(["可验证的验收点一", "可验证的验收点二"]));
push(TBL([3000, 3200, CW - 3000 - 3200],
  [TH("指标", 3000), TH("定义", 3200, { align: AlignmentType.LEFT }), TH("用途", CW - 3000 - 3200, { align: AlignmentType.LEFT })],
  [["命中率", "AI 结果与基准的重合比例", "整体匹配度"]],
  { cellOpts: [{ bold: true }, {}, {}] }));

// 6 风险与开放问题  (PM discipline: always flag what's unresolved)
push(H1("6  风险与开放问题"));
push(H2("6.1  待明确事项一"));
push(P([run("待明确：", { bold: true, color: "B00020" }), run("写清楚需要谁、在什么时点拍板。")]));

const out = process.argv[2] || "/mnt/user-data/outputs/PRD-sample.docx";
B.buildAndSave({
  title: "产品需求说明书（PRD）",
  subtitle: "示例系统",
  headerText: "示例系统 · 产品需求说明书",
}, body, out).then(p => console.log("saved", p, body.length, "blocks"));
