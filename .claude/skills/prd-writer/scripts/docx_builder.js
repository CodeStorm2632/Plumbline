/*
 * docx_builder.js — reusable PRD / 需求文档 builder
 * ------------------------------------------------------------------
 * A thin, opinionated layer over the `docx` npm package that produces
 * polished, Chinese-friendly Word documents (A4, cover page, auto TOC,
 * running header/footer, zebra-striped tables, navy/blue headings).
 *
 * Quick start (in an assemble script):
 *
 *   const B = require("./docx_builder.js");
 *   const body = [];
 *   body.push(B.H1("1  背景与目标"));
 *   body.push(B.P("一段正文……"));
 *   body.push(B.BUL("要点一"), B.BUL("要点二"));
 *   body.push(...B.numList(["第一步", "第二步"]));
 *   body.push(B.TBL([3000, 6026],
 *     [B.TH("列A", 3000), B.TH("列B", 6026)],
 *     [["a1","b1"], ["a2","b2"]]));
 *
 *   B.buildAndSave({
 *     title: "产品需求说明书（PRD）",
 *     subtitle: "示例系统",
 *     note: "（副标题/范围说明）",
 *     headerText: "示例系统 · 产品需求说明书",
 *     infoRows: [["文档版本","V1.0"],["编制日期","2026-06"]],
 *   }, body, "/mnt/user-data/outputs/PRD.docx").then(p => console.log("saved", p));
 *
 * Notes:
 *  - Content width (A4, 1" margins) is exported as B.CW = 9026. Table
 *    columnWidths MUST sum to the table width you pass (use B.CW for
 *    full-width tables).
 *  - Each numList() / numbered list gets its own counter and restarts
 *    at 1 (40 ordered references are pre-registered; raise LIMIT if you
 *    need more lists in one document).
 */

const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, Header, Footer,
  TableOfContents,
} = require("docx");

// ---------- palette ----------
const NAVY = "1F3864", BLUE = "2E5496", LIGHT = "DCE6F1", LIGHTER = "EDF2F9";
const RULE = "BBBBBB", HEADFILL = "1F3864", ZEBRA = "EDF2F9";

// ---------- fonts (Latin + East-Asian) ----------
const EA = "DengXian", LAT = "Calibri";
const FONT = { ascii: LAT, eastAsia: EA, hAnsi: LAT, cs: LAT };

// ---------- page geometry ----------
const PAGE = { width: 11906, height: 16838 };      // A4
const MARGIN = 1440;                               // 1 inch
const CW = PAGE.width - 2 * MARGIN;                // 9026 content width

// ---------- numbering (pre-register ordered refs so each list restarts) ----------
const LIMIT = 40;
const numConfigs = [{
  reference: "bul",
  levels: [
    { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 460, hanging: 260 } } } },
    { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 920, hanging: 260 } } } },
  ],
}];
for (let i = 1; i <= LIMIT; i++) {
  numConfigs.push({ reference: "n" + i, levels: [{ level: 0, format: LevelFormat.DECIMAL,
    text: "%1.", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 460, hanging: 320 } } } }] });
}
let _nref = 0;
function _nextRef() { _nref += 1; if (_nref > LIMIT) _nref = ((_nref - 1) % LIMIT) + 1; return "n" + _nref; }
function resetLists() { _nref = 0; }   // call once per document if reusing the module

// ---------- inline runs ----------
function run(text, o = {}) {
  return new TextRun({ text, font: FONT, size: o.size || 21,
    bold: !!o.bold, italics: !!o.italics, color: o.color || "222222" });
}
// allow B.P([B.run("普通"), B.run("加粗", {bold:true})]) for mixed runs
function P(content, o = {}) {
  const kids = Array.isArray(content) ? content : [run(content, o)];
  return new Paragraph({ children: kids,
    spacing: { before: o.before ?? 40, after: o.after ?? 120, line: o.line || 300 },
    alignment: o.align || AlignmentType.JUSTIFIED, indent: o.indent });
}

// ---------- headings ----------
function H1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1,
    children: [run(text, { size: 30, bold: true, color: NAVY })],
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 6 } } });
}
function H2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2,
    children: [run(text, { size: 25, bold: true, color: BLUE })],
    spacing: { before: 240, after: 120 } });
}
function H3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3,
    children: [run(text, { size: 22, bold: true, color: "333333" })],
    spacing: { before: 180, after: 90 } });
}

// ---------- lists ----------
function BUL(content, o = {}) {
  const kids = Array.isArray(content) ? content : [run(content, o)];
  return new Paragraph({ numbering: { reference: "bul", level: o.level || 0 },
    children: kids, spacing: { before: 20, after: 60, line: 290 },
    alignment: AlignmentType.JUSTIFIED });
}
// returns an ARRAY of paragraphs (spread it: body.push(...B.numList([...])))
function numList(items) {
  const r = _nextRef();
  return items.map(it => new Paragraph({ numbering: { reference: r, level: 0 },
    children: Array.isArray(it) ? it : [run(it)],
    spacing: { before: 20, after: 60, line: 290 }, alignment: AlignmentType.JUSTIFIED }));
}
function spacer(after = 60) { return new Paragraph({ children: [run("")], spacing: { after } }); }
function pageBreak() { return new Paragraph({ children: [new PageBreak()] }); }
// monospace-ish code/quote block line
function code(text) {
  return new Paragraph({ shading: { type: ShadingType.CLEAR, fill: "F2F4F7" },
    spacing: { before: 0, after: 0, line: 280 },
    children: [run(text, { size: 18, color: "1A1A1A" })] });
}

// ---------- tables ----------
const _b = { style: BorderStyle.SINGLE, size: 1, color: RULE };
const _borders = { top: _b, bottom: _b, left: _b, right: _b };
function _cellParas(content, o = {}) {
  if (typeof content === "string") {
    return [new Paragraph({ children: [run(content, o)],
      alignment: o.align || AlignmentType.LEFT, spacing: { before: 18, after: 18, line: 268 } })];
  }
  if (content.length && content[0] instanceof Paragraph) return content;
  return content.map(t => new Paragraph({ children: [run(t, o)],
    alignment: o.align || AlignmentType.LEFT, spacing: { before: 16, after: 16, line: 264 } }));
}
function TH(text, w, o = {}) {
  return new TableCell({ borders: _borders, width: { size: w, type: WidthType.DXA },
    shading: { fill: o.fill || HEADFILL, type: ShadingType.CLEAR },
    verticalAlign: VerticalAlign.CENTER, margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: _cellParas(text, { bold: true, color: o.color || "FFFFFF", size: o.size || 20,
      align: o.align || AlignmentType.CENTER }) });
}
function TD(content, w, o = {}) {
  return new TableCell({ borders: _borders, width: { size: w, type: WidthType.DXA },
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER, margins: { top: 60, bottom: 60, left: 110, right: 110 },
    children: _cellParas(content, { size: o.size || 20, bold: !!o.bold, color: o.color, align: o.align }) });
}
/*
 * TBL(widths, headerCells, rows, opts)
 *  - widths: array summing to table width (use parts of B.CW)
 *  - headerCells: array of TH(...) cells
 *  - rows: array of rows; each row is an array of strings|string[]|{__cell,cell}
 *  - opts.cellOpts[col] = { bold, align, fill } applied to that column
 *  - zebra striping auto-applied on odd rows unless a fill is given
 */
function TBL(widths, headerCells, rows, opts = {}) {
  const trs = [new TableRow({ tableHeader: true, children: headerCells })];
  rows.forEach((r, i) => {
    const zeb = (i % 2 === 1) ? ZEBRA : undefined;
    const cells = r.map((c, j) => {
      if (c && c.__cell) return c.cell;
      const co = (opts.cellOpts && opts.cellOpts[j]) || {};
      return TD(c, widths[j], { ...co, fill: co.fill || zeb });
    });
    trs.push(new TableRow({ children: cells }));
  });
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths, rows: trs });
}

// ---------- cover + TOC ----------
function cover(meta = {}) {
  const out = [];
  out.push(new Paragraph({ spacing: { before: 1600, after: 0 }, alignment: AlignmentType.CENTER,
    children: [run(meta.title || "产品需求说明书（PRD）", { size: 52, bold: true, color: NAVY })] }));
  if (meta.subtitle) out.push(new Paragraph({ spacing: { before: 200, after: 80 }, alignment: AlignmentType.CENTER,
    children: [run(meta.subtitle, { size: 36, bold: true, color: BLUE })] }));
  out.push(new Paragraph({ spacing: { before: 0, after: 1000 }, alignment: AlignmentType.CENTER,
    children: [run(meta.note || "", { size: 24, color: "555555" })] }));
  if (meta.infoRows && meta.infoRows.length) {
    out.push(TBL([2400, CW - 2400],
      [TH("项目", 2400), TH("内容", CW - 2400, { align: AlignmentType.LEFT })],
      meta.infoRows.map(r => [r[0], r[1]]),
      { cellOpts: [{ bold: true, fill: LIGHT, align: AlignmentType.CENTER }, {}] }));
  }
  out.push(pageBreak());
  return out;
}
function toc(heading = "目  录") {
  return [
    new Paragraph({ spacing: { after: 160 }, children: [run(heading, { size: 30, bold: true, color: NAVY })] }),
    new TableOfContents("目录", { hyperlink: true, headingStyleRange: "1-2" }),
    pageBreak(),
  ];
}

// ---------- assemble ----------
function buildDoc(meta, body) {
  const headerText = meta.headerText || meta.subtitle || "产品需求说明书";
  return new Document({
    creator: meta.creator || "PRD Writer Skill",
    title: meta.title || "PRD",
    features: { updateFields: true },     // makes Word refresh the TOC on open
    styles: {
      default: { document: { run: { font: FONT, size: 21, color: "222222" } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: FONT, color: NAVY },
          paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 25, bold: true, font: FONT, color: BLUE },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 22, bold: true, font: FONT, color: "333333" },
          paragraph: { spacing: { before: 180, after: 90 }, outlineLevel: 2 } },
      ],
    },
    numbering: { config: numConfigs },
    sections: [{
      properties: { page: { size: PAGE, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
      headers: { default: new Header({ children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
        children: [run(headerText, { size: 16, color: "888888" })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          run("第 ", { size: 16, color: "888888" }),
          new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: "888888" }),
          run(" 页 / 共 ", { size: 16, color: "888888" }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 16, color: "888888" }),
          run(" 页", { size: 16, color: "888888" }),
        ] })] }) },
      children: body,
    }],
  });
}

async function buildAndSave(meta, body, outPath) {
  const buf = await Packer.toBuffer(buildDoc(meta, body));
  fs.writeFileSync(outPath, buf);
  return outPath;
}

module.exports = {
  // primitives
  run, P, H1, H2, H3, BUL, numList, spacer, pageBreak, code,
  TH, TD, TBL,
  // sections
  cover, toc,
  // assembly
  buildDoc, buildAndSave, resetLists,
  // constants
  CW, NAVY, BLUE, LIGHT, LIGHTER, RULE, FONT, AlignmentType,
};
