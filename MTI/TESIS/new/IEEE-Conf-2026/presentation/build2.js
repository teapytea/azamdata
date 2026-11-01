const pptxgen = require("pptxgenjs");
const React = require("react");
const RD = require("react-dom/server");
const sharp = require("sharp");
const FA = require("react-icons/fa");

// ---------- palette ----------
const NAVY = "1B2A4A", NAVY_CARD = "24365E";
const INK = "1B2A4A", BODY = "374151", MUTED = "6B7280";
const AMBER = "C0801A", AMBER_HI = "E6B450";
const CARD = "F3F6FB", TINT = "FBEFD6", WHITE = "FFFFFF";
const F = "Poppins";
const W = 10, H = 5.625, M = 0.6;
const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 90, opacity: 0.10 });

// ---------- icon rasteriser ----------
const ICO = {}; // ICO[name][hex] = dataURI
async function mkIcon(name, hex) {
  const svg = RD.renderToStaticMarkup(React.createElement(FA[name], { color: "#" + hex, size: "256" }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  ICO[name] = ICO[name] || {};
  ICO[name][hex] = "image/png;base64," + png.toString("base64");
}

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Azam Azri";
pres.title = "Order-2 Co-occurrence for Interaction-Free Perfume Recommendation";

// ---------- helpers ----------
function footer(s, n, label) {
  s.addText(label, { x: M, y: H - 0.42, w: 6, h: 0.3, fontFace: F, fontSize: 9, color: MUTED, align: "left", margin: 0 });
  s.addText(n + " / 14", { x: W - 1.5, y: H - 0.42, w: 0.9, h: 0.3, fontFace: F, fontSize: 9, color: MUTED, align: "right", margin: 0 });
}
function kicker(s, t, c, x, y) {
  s.addText(t.toUpperCase(), { x, y, w: 8, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: c, charSpacing: 2, margin: 0 });
}
function titleA(s, t) {
  s.addText(t, { x: M, y: 0.46, w: 7.7, h: 1.0, fontFace: F, fontSize: 19, bold: true, color: INK, lineSpacingMultiple: 1.02, valign: "top", margin: 0 });
}
function dot(s, cx, cy, r, color, op) {
  s.addShape(pres.shapes.OVAL, { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color, transparency: op ? (1 - op) * 100 : 0 }, line: { type: "none" } });
}
// icon inside a filled circle
function iconCircle(s, cx, cy, d, name, circle, icoHex) {
  s.addShape(pres.shapes.OVAL, { x: cx - d / 2, y: cy - d / 2, w: d, h: d, fill: { color: circle }, line: { type: "none" } });
  const id = d * 0.52;
  s.addImage({ data: ICO[name][icoHex || "FFFFFF"], x: cx - id / 2, y: cy - id / 2, w: id, h: id });
}
function motif(s, name) { // top-right recurring icon
  iconCircle(s, 9.0, 0.92, 0.78, name, TINT, AMBER);
}
function seg(s, x1, y1, x2, y2, color, width) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  s.addShape(pres.shapes.LINE, { x, y, w, h, flipV: (x2 - x1) * (y2 - y1) < 0, line: { color, width } });
}
function node(s, cx, cy, label, shaded) {
  const w = 0.86, h = 0.5;
  s.addShape(pres.shapes.OVAL, { x: cx - w / 2, y: cy - h / 2, w, h, fill: { color: shaded ? TINT : WHITE }, line: { color: shaded ? AMBER : "94A3B8", width: shaded ? 1.5 : 1 } });
  s.addText(label, { x: cx - w / 2 - 0.1, y: cy - h / 2, w: w + 0.2, h, fontFace: F, fontSize: 8.5, color: INK, align: "center", valign: "middle", margin: 0 });
}
// horizontal flow step with icon
function step(s, x, y, w, h, name, head, sub, hi) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: hi ? TINT : CARD }, line: { type: "none" }, shadow: sh() });
  iconCircle(s, x + w / 2, y + 0.52, 0.66, name, hi ? AMBER : NAVY);
  s.addText(head, { x: x + 0.05, y: y + 0.92, w: w - 0.1, h: 0.34, fontFace: F, fontSize: 12, bold: true, color: INK, align: "center", margin: 0 });
  s.addText(sub, { x: x + 0.05, y: y + 1.24, w: w - 0.1, h: 0.5, fontFace: F, fontSize: 9.5, color: BODY, align: "center", lineSpacingMultiple: 0.95, margin: 0 });
}
function arrow(s, x, y) {
  s.addText("→", { x, y, w: 0.3, h: 0.4, fontFace: F, fontSize: 20, bold: true, color: AMBER, align: "center", valign: "middle", margin: 0 });
}

async function main() {
  const names = ["FaSprayCan", "FaHandshake", "FaDatabase", "FaUserSlash", "FaStore", "FaRobot",
    "FaSlidersH", "FaListOl", "FaBookOpen", "FaBalanceScale", "FaFileAlt", "FaLayerGroup", "FaPlug",
    "FaBrain", "FaLightbulb", "FaKeyboard", "FaProjectDiagram", "FaTrophy", "FaShieldAlt", "FaGlobe",
    "FaTag", "FaChartBar", "FaArrowDown", "FaEquals", "FaPercent", "FaCheckDouble", "FaCommentDots",
    "FaFlask", "FaUsers", "FaQuoteRight"];
  for (const n of names) { await mkIcon(n, "FFFFFF"); await mkIcon(n, AMBER); }

  // ===== SLIDE 1 — TITLE =====
  {
    const s = pres.addSlide(); s.background = { color: NAVY };
    dot(s, 8.95, 1.05, 0.6, AMBER, 0.18); dot(s, 9.45, 1.8, 0.30, AMBER, 0.32);
    iconCircle(s, 8.85, 1.25, 1.15, "FaSprayCan", AMBER);
    kicker(s, "Joint Research with Aromatique", AMBER_HI, M, 1.3);
    s.addText("Order-2 Co-occurrence for\nInteraction-Free Perfume Recommendation", {
      x: M, y: 1.78, w: 7.6, h: 1.7, fontFace: F, fontSize: 31, bold: true, color: WHITE, lineSpacingMultiple: 1.05, margin: 0 });
    s.addText("A recommender engine inside a customer chatbot for an Indonesian perfume brand", {
      x: M, y: 3.5, w: 8.0, h: 0.5, fontFace: F, fontSize: 14.5, italic: true, color: "C7D2E4", margin: 0 });
    s.addText([{ text: "Azam Azri", options: { bold: true, color: WHITE } },
      { text: "   •   Master's Program in Informatics, UGM   •   June 2026", options: { color: "AEBBD2" } }],
      { x: M, y: 4.7, w: 8.8, h: 0.4, fontFace: F, fontSize: 12.5, margin: 0 });
  }

  // ===== SLIDE 2 — WHAT WE BUILT =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "A content-based recommender for Aromatique, built for small, interaction-free data");
    motif(s, "FaSprayCan");
    s.addText("This work builds the recommendation engine that sits inside a customer-facing chatbot for Aromatique, an Indonesian perfume brand.", {
      x: M, y: 1.75, w: 3.7, h: 2.6, fontFace: F, fontSize: 14.5, color: BODY, lineSpacingMultiple: 1.18, valign: "top", margin: 0 });
    const cards = [["FaSprayCan", "Object", "Perfume"], ["FaHandshake", "Partner", "Aromatique"],
      ["FaDatabase", "Data", "Small"], ["FaUserSlash", "Setting", "Interaction-free"]];
    const cw = 2.35, ch = 1.35, gx = 0.25, gy = 0.25, x0 = 4.55, y0 = 1.7;
    cards.forEach(([ic, h, v], i) => {
      const x = x0 + (i % 2) * (cw + gx), y = y0 + Math.floor(i / 2) * (ch + gy);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: ch, rectRadius: 0.08, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, x + 0.55, y + ch / 2, 0.62, ic, NAVY);
      s.addText(h.toUpperCase(), { x: x + 0.95, y: y + 0.28, w: cw - 1.05, h: 0.3, fontFace: F, fontSize: 9.5, bold: true, color: MUTED, charSpacing: 1, margin: 0 });
      s.addText(v, { x: x + 0.95, y: y + 0.58, w: cw - 1.05, h: 0.5, fontFace: F, fontSize: 14.5, bold: true, color: INK, margin: 0 });
    });
    footer(s, 2, "What we built");
  }

  // ===== SLIDE 3 — MOTIVATION =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "At peak hours few staff can't serve many customers, so the recommender lives in a chatbot");
    motif(s, "FaUsers");
    s.addText([
      { text: "Aromatique runs branches across many Indonesian cities and provinces. ", options: {} },
      { text: "At peak hours a few staff cannot serve the crowd — a bottleneck.", options: { bold: true, color: INK } },
      { text: "  A joint project pairs a colleague's chatbot (HCI) with this recommender: a waiting customer types a preference (e.g. ", options: {} },
      { text: "“a perfume for school”", options: { italic: true, color: AMBER } },
      { text: ") and gets the Top-3 relevant products.", options: {} },
    ], { x: M, y: 1.65, w: W - 2 * M, h: 1.1, fontFace: F, fontSize: 13.5, color: BODY, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
    const sw = 1.95, gap = 0.27, y = 3.05;
    const steps = [["FaStore", "Customer", "waiting at peak hours"], ["FaRobot", "Chatbot", "types a free preference"],
      ["FaSlidersH", "Recommender", "this work"], ["FaListOl", "Top-3 products", "relevant Aromatique picks"]];
    steps.forEach(([ic, h, sub], i) => {
      const x = M + i * (sw + gap);
      step(s, x, y, sw, 1.75, ic, h, sub, i === 2);
      if (i < 3) arrow(s, x + sw + 0.0, y + 0.6);
    });
    footer(s, 3, "Motivation");
  }

  // ===== SLIDE 4 — RELATED WORK =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "Existing perfume recommenders rank by single-accord similarity over note text");
    motif(s, "FaBookOpen");
    const rows = [
      ["FaFileAlt", "TF-IDF content-based filter beats a Word2Vec variant", "Fannisa et al., 2025 (journal)"],
      ["FaBookOpen", "Survey: subjectivity and sparse sensory data are the core obstacles", "Lutan, 2025"],
      ["FaBalanceScale", "Ranking by cosine and Jaccard over note descriptions", "Nurmuthia et al., 2025"],
    ];
    let y = 1.75;
    rows.forEach(([ic, txt, cite]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.92, rectRadius: 0.07, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, M + 0.6, y + 0.46, 0.6, ic, NAVY);
      s.addText(txt, { x: M + 1.15, y: y + 0.12, w: 5.6, h: 0.7, fontFace: F, fontSize: 13.5, color: INK, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
      s.addText(cite, { x: 7.0, y, w: 2.0, h: 0.92, fontFace: F, fontSize: 11, italic: true, color: AMBER, align: "right", valign: "middle", margin: 0 });
      y += 1.06;
    });
    s.addText("All content-based, single-accord similarity, on note-text datasets — and none carry user interactions.", {
      x: M, y: 5.0, w: W - 2 * M, h: 0.35, fontFace: F, fontSize: 11.5, italic: true, color: MUTED, margin: 0 });
    footer(s, 4, "Related work");
  }

  // ===== SLIDE 5 — GAPS (journals) =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "Yet three gaps remain — and the strongest methods can't even run here");
    motif(s, "FaLightbulb");
    const gaps = [
      ["FaLayerGroup", "Order-1 only", "Accords treated independently; co-occurrence helps, but only with interactions.", "Hao, IP&M 2024 (Q1)\nZhang, IEEE TKDE 2023 (Q1)"],
      ["FaPlug", "Needs interactions", "Graph / KG recommenders learn from a user–item signal the data lacks.", "Ma, ACM TOIS 2022 (Q1)\nLyu, IEEE TKDE 2023 (Q1)"],
      ["FaBrain", "Complex overfits", "On small, imbalanced data, flexible and neural models lose to simple baselines.", "Ahlmann-Eltze, Nat. Methods 2025 (Q1)\nRather, AI Review 2024 (Q1)"],
    ];
    const cw = 2.9, gap = 0.2, y = 1.7;
    gaps.forEach(([ic, h, b, cite], i) => {
      const x = M + i * (cw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 3.15, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, x + 0.55, y + 0.6, 0.66, ic, AMBER);
      s.addText(h, { x: x + 1.0, y: y + 0.32, w: cw - 1.15, h: 0.55, fontFace: F, fontSize: 14.5, bold: true, color: INK, valign: "middle", margin: 0 });
      s.addText(b, { x: x + 0.25, y: y + 1.1, w: cw - 0.5, h: 1.15, fontFace: F, fontSize: 12, color: BODY, lineSpacingMultiple: 1.08, valign: "top", margin: 0 });
      s.addText(cite, { x: x + 0.25, y: y + 2.32, w: cw - 0.5, h: 0.72, fontFace: F, fontSize: 9.5, italic: true, color: AMBER, lineSpacingMultiple: 1.0, valign: "top", margin: 0 });
    });
    footer(s, 5, "Research gaps");
  }

  // ===== SLIDE 6 — PROPOSED =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "We propose order-2 co-occurrence — matching accord pairs, not single notes");
    motif(s, "FaProjectDiagram");
    const qa = [
      ["FaLayerGroup", "Why not order-1?", "Single accords overlap too much, so look-alikes are hard to separate."],
      ["FaProjectDiagram", "Why co-occurrence?", "Which accords appear together is a signature; rare pairs separate the right product."],
      ["FaBrain", "Why not embeddings?", "Word2Vec / SBERT / node2vec blur exact rare pairs into latent vectors and overfit small data."],
    ];
    let y = 1.62;
    qa.forEach(([ic, q, a]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.86, rectRadius: 0.07, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, M + 0.58, y + 0.43, 0.58, ic, NAVY);
      s.addText(q, { x: M + 1.15, y, w: 2.55, h: 0.86, fontFace: F, fontSize: 14, bold: true, color: AMBER, valign: "middle", margin: 0 });
      s.addText(a, { x: M + 3.75, y: y + 0.06, w: 4.85, h: 0.74, fontFace: F, fontSize: 12.5, color: BODY, valign: "middle", lineSpacingMultiple: 1.02, margin: 0 });
      y += 0.99;
    });
    s.addText([{ text: "Order-2, not order-3 (too sparse).  ", options: { color: WHITE } },
      { text: "Parameter-free by design — it cannot overfit.", options: { bold: true, color: AMBER_HI } }],
      { x: M, y: 4.6, w: W - 2 * M, h: 0.45, fontFace: F, fontSize: 13, align: "center", valign: "middle", fill: { color: NAVY }, margin: 0 });
  }

  // ===== SLIDE 7 — HOW IT WORKS =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "Each perfume becomes a rarity-weighted set of accords and accord-pairs");
    motif(s, "FaSlidersH");
    const sw = 1.95, gap = 0.27, y = 2.4;
    const steps = [["FaKeyboard", "Preference", "free user text → accords"], ["FaProjectDiagram", "Accords + pairs", "rarity-weighted tokens"],
      ["FaBalanceScale", "Cosine match", "vs 340 products"], ["FaListOl", "Top-3 + reasons", "ranked recommendations"]];
    steps.forEach(([ic, h, sub], i) => {
      const x = M + i * (sw + gap);
      step(s, x, y, sw, 1.75, ic, h, sub, i === 1);
      if (i < 3) arrow(s, x + sw, y + 0.6);
    });
    s.addText("One cosine score splits cleanly into an order-1 (single-accord) part and an order-2 (accord-pair) part — and the pairs become the explanation.", {
      x: M, y: 4.5, w: W - 2 * M, h: 0.55, fontFace: F, fontSize: 12.5, italic: true, color: MUTED, align: "center", lineSpacingMultiple: 1.05, margin: 0 });
    footer(s, 7, "How it works");
  }

  // ===== SLIDE 8 — FIREWALL =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "A three-source firewall makes the evaluation non-circular");
    motif(s, "FaShieldAlt");
    s.addText("The main risk is leakage: features secretly carrying the answer. Keeping the three sources independent prevents it.", {
      x: M, y: 1.6, w: W - 2 * M, h: 0.6, fontFace: F, fontSize: 13.5, color: BODY, lineSpacingMultiple: 1.08, valign: "top", margin: 0 });
    const cols = [["FaTag", "Item features", "Local catalog accords", "independent of the label"],
      ["FaGlobe", "Query features", "Fragrantica (external)", "independent of catalog & label"],
      ["FaShieldAlt", "Ground-truth label", "Held-out “imitates” edge", "independent of accord similarity"]];
    const cw = 2.9, gap = 0.2, y = 2.45;
    cols.forEach(([ic, h, src, ind], i) => {
      const x = M + i * (cw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.15, rectRadius: 0.09, fill: { color: i === 1 ? TINT : CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, x + cw / 2, y + 0.55, 0.66, ic, i === 1 ? AMBER : NAVY);
      s.addText(h, { x: x + 0.2, y: y + 0.95, w: cw - 0.4, h: 0.35, fontFace: F, fontSize: 13.5, bold: true, color: INK, align: "center", margin: 0 });
      s.addText(src, { x: x + 0.2, y: y + 1.3, w: cw - 0.4, h: 0.4, fontFace: F, fontSize: 11.5, color: BODY, align: "center", margin: 0 });
      s.addText(ind, { x: x + 0.2, y: y + 1.68, w: cw - 0.4, h: 0.4, fontFace: F, fontSize: 10, italic: true, color: AMBER, align: "center", margin: 0 });
    });
    footer(s, 8, "Non-circular protocol");
  }

  // ===== SLIDE 9 — SETUP =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "We benchmark 15 methods on 340 Aromatique products and 209 queries");
    motif(s, "FaFlask");
    const stats = [["FaSprayCan", "340", "products"], ["FaUsers", "209", "queries"], ["FaProjectDiagram", "56", "shared accords"]];
    let y = 1.75;
    stats.forEach(([ic, n, l]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: 3.5, h: 0.92, rectRadius: 0.08, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, M + 0.55, y + 0.46, 0.6, ic, NAVY);
      s.addText(n, { x: M + 1.05, y: y + 0.04, w: 1.1, h: 0.82, fontFace: F, fontSize: 26, bold: true, color: AMBER, valign: "middle", margin: 0 });
      s.addText(l, { x: M + 2.1, y, w: 1.3, h: 0.92, fontFace: F, fontSize: 12.5, color: INK, valign: "middle", margin: 0 });
      y += 1.08;
    });
    // right: paradigms
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 4.5, y: 1.75, w: 4.9, h: 3.1, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
    s.addText("15 methods, 4 paradigms", { x: 4.8, y: 1.95, w: 4.3, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: INK, margin: 0 });
    s.addText([
      { text: "Marginal  ", options: { bold: true, color: AMBER } }, { text: "Jaccard, TF-IDF, BM25", options: { breakLine: true, color: BODY } },
      { text: "Neural  ", options: { bold: true, color: AMBER } }, { text: "Sentence-BERT, Word2Vec, node2vec", options: { breakLine: true, color: BODY } },
      { text: "Perceptual  ", options: { bold: true, color: AMBER } }, { text: "fragrance-wheel transport", options: { breakLine: true, color: BODY } },
      { text: "Learned  ", options: { bold: true, color: AMBER } }, { text: "PPMI-SVD, GBM, bilinear", options: { breakLine: true, color: BODY } },
    ], { x: 4.8, y: 2.45, w: 4.3, h: 1.8, fontFace: F, fontSize: 12, lineSpacingMultiple: 1.25, valign: "top", margin: 0 });
    s.addText("Identical leave-one-out evaluation • MRR and Hits@k • paired significance tests", {
      x: 4.8, y: 4.3, w: 4.3, h: 0.4, fontFace: F, fontSize: 10.5, italic: true, color: MUTED, margin: 0 });
    footer(s, 9, "Experimental setup");
  }

  // ===== SLIDE 10 — RESULT CHART =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "Order-2 co-occurrence ranks first among all 15 methods");
    motif(s, "FaTrophy");
    s.addChart(pres.charts.BAR, [{ name: "MRR", labels: ["Proposed", "Learned", "Baseline", "Neural", "Perceptual", "High-dim"], values: [0.496, 0.457, 0.454, 0.340, 0.284, 0.139] }], {
      x: 0.5, y: 1.7, w: 6.1, h: 3.45, barDir: "col",
      chartColors: [AMBER, NAVY, NAVY, NAVY, NAVY, NAVY], chartArea: { fill: { color: "FFFFFF" } },
      catAxisLabelColor: BODY, catAxisLabelFontFace: F, catAxisLabelFontSize: 11,
      valAxisLabelColor: MUTED, valAxisLabelFontFace: F, valAxisLabelFontSize: 10,
      valAxisMinVal: 0, valAxisMaxVal: 0.6, valAxisMajorUnit: 0.2,
      valGridLine: { color: "EAEFF6", size: 0.5 }, catGridLine: { style: "none" },
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFontFace: F, dataLabelFontSize: 10, dataLabelFormatCode: "0.000",
      showLegend: false, showTitle: false,
    });
    s.addText([
      { text: "MRR ", options: { bold: true, color: INK } }, { text: "= how high the correct product sits (higher is better).", options: { color: BODY, breakLine: true } },
      { text: "", options: { breakLine: true, fontSize: 8 } },
      { text: "+9% over the TF-IDF baseline.", options: { bold: true, color: AMBER, breakLine: true } },
      { text: "Neural, perceptual and high-dimensional learned methods all fall below the simple baseline.", options: { color: BODY } },
    ], { x: 6.85, y: 1.85, w: 2.75, h: 3.0, fontFace: F, fontSize: 12.5, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
    footer(s, 10, "Results");
  }

  // ===== SLIDE 11 — SIMPLE BEATS COMPLEX =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "Simple beats complex: neural and learned methods overfit the small data");
    motif(s, "FaBrain");
    const cols = [["FaArrowDown", "Fell below the baseline", "Neural embeddings, perceptual-taxonomy transport and high-dimensional learned models overfit and lost decisively."],
      ["FaEquals", "Only tied the baseline", "Moderate learned models (PPMI-SVD, gradient boosting) matched the simple TF-IDF baseline — but never beat order-2."]];
    const cw = 4.3, gap = 0.3, y = 1.8;
    cols.forEach(([ic, h, b], i) => {
      const x = M + i * (cw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.1, rectRadius: 0.09, fill: { color: i === 0 ? "EFE7DC" : CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, x + 0.5, y + 0.55, 0.6, ic, i === 0 ? AMBER : NAVY);
      s.addText(h, { x: x + 0.95, y: y + 0.28, w: cw - 1.1, h: 0.55, fontFace: F, fontSize: 15, bold: true, color: INK, valign: "middle", margin: 0 });
      s.addText(b, { x: x + 0.3, y: y + 1.0, w: cw - 0.6, h: 0.95, fontFace: F, fontSize: 12.5, color: BODY, lineSpacingMultiple: 1.1, valign: "top", margin: 0 });
    });
    s.addText([{ text: "Takeaway:  ", options: { bold: true, color: AMBER_HI } },
      { text: "on small, interaction-free data, added model capacity does not help — it hurts.", options: { color: WHITE } }],
      { x: M, y: 4.2, w: W - 2 * M, h: 0.65, fontFace: F, fontSize: 14, align: "center", valign: "middle", fill: { color: NAVY }, margin: 0 });
    footer(s, 11, "Key finding");
  }

  // ===== SLIDE 12 — HONEST NUMBERS =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "The win is modest (+9%) but statistically solid and driven by accord pairs");
    motif(s, "FaCheckDouble");
    const stats = [["FaPercent", "+9%", "over the standard\nTF-IDF baseline", "modest"],
      ["FaCheckDouble", "p = 8.7e-8", "paired significance\ntest", "robust"],
      ["FaProjectDiagram", "81%", "of the signal from\naccord pairs", "real effect"]];
    const cw = 2.9, gap = 0.2, y = 1.8;
    stats.forEach(([ic, n, l, tag], i) => {
      const x = M + i * (cw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.45, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
      iconCircle(s, x + cw / 2, y + 0.5, 0.62, ic, NAVY);
      s.addText(n, { x: x + 0.15, y: y + 0.92, w: cw - 0.3, h: 0.65, fontFace: F, fontSize: 26, bold: true, color: AMBER, align: "center", margin: 0 });
      s.addText(l, { x: x + 0.2, y: y + 1.55, w: cw - 0.4, h: 0.6, fontFace: F, fontSize: 12, color: BODY, align: "center", lineSpacingMultiple: 1.0, margin: 0 });
      s.addText(tag, { x: x + 0.2, y: y + 2.12, w: cw - 0.4, h: 0.3, fontFace: F, fontSize: 10.5, bold: true, italic: true, color: INK, align: "center", margin: 0 });
    });
    s.addText("Modest but solid — bounded by the ~86% accord overlap intrinsic to imitation perfumes.", {
      x: M, y: 4.55, w: W - 2 * M, h: 0.4, fontFace: F, fontSize: 12, italic: true, color: MUTED, align: "center", margin: 0 });
    footer(s, 12, "Reading the numbers");
  }

  // ===== SLIDE 13 — EXPLAINABILITY / USE CASE =====
  {
    const s = pres.addSlide(); s.background = { color: WHITE };
    titleA(s, "Every recommendation comes with reasons — ready to drop into the chatbot");
    motif(s, "FaCommentDots");
    // chat query bubble
    iconCircle(s, M + 0.45, 2.0, 0.7, "FaRobot", NAVY);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.95, y: 1.7, w: 3.4, h: 0.62, rectRadius: 0.1, fill: { color: TINT }, line: { type: "none" } });
    s.addText("“a perfume for school”", { x: M + 1.1, y: 1.7, w: 3.1, h: 0.62, fontFace: F, fontSize: 13, italic: true, bold: true, color: INK, valign: "middle", margin: 0 });
    // top-3 result rows
    const recs = [["1", "Fresh • clean", "citrus–green, clean–woody"],
      ["2", "Aquatic • light", "marine–citrus, fresh–musk"],
      ["3", "Powdery • soft", "floral–musk, soft–clean"]];
    let y = 2.55;
    recs.forEach(([r, t, why]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + 0.95, y, w: 4.5, h: 0.78, rectRadius: 0.08, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
      dot(s, M + 1.3, y + 0.39, 0.2, AMBER);
      s.addText(r, { x: M + 1.1, y: y + 0.11, w: 0.4, h: 0.55, fontFace: F, fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
      s.addText([{ text: t + "   ", options: { bold: true, color: INK } }, { text: why, options: { italic: true, color: AMBER } }],
        { x: M + 1.65, y, w: 3.75, h: 0.78, fontFace: F, fontSize: 10.5, color: BODY, valign: "middle", lineSpacingMultiple: 1.0, margin: 0 });
      y += 0.88;
    });
    // right note
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.35, y: 2.0, w: 3.05, h: 2.9, rectRadius: 0.09, fill: { color: NAVY }, line: { type: "none" } });
    iconCircle(s, 6.85, 2.5, 0.6, "FaShieldAlt", NAVY_CARD);
    s.addText("Faithful by construction", { x: 6.6, y: 2.95, w: 2.55, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: AMBER_HI, margin: 0 });
    s.addText("The accord-pairs shown are the exact pieces that produced the score — auditable, not a post-hoc guess. A ready hand-off to the chatbot's XAI layer.", {
      x: 6.6, y: 3.4, w: 2.55, h: 1.4, fontFace: F, fontSize: 11.5, color: "DCE3F0", lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
    s.addText("Illustrative example.", { x: M + 0.95, y: 5.02, w: 4, h: 0.3, fontFace: F, fontSize: 9, italic: true, color: MUTED, margin: 0 });
    footer(s, 13, "Explainability");
  }

  // ===== SLIDE 14 — CONCLUSION / COLLAB =====
  {
    const s = pres.addSlide(); s.background = { color: NAVY };
    dot(s, 9.25, 0.95, 0.5, AMBER, 0.2);
    iconCircle(s, 9.0, 1.15, 1.0, "FaHandshake", AMBER);
    kicker(s, "Where we can go together", AMBER_HI, M, 0.7);
    s.addText("A finding, an honest protocol, and a deployable recommender for Aromatique", {
      x: M, y: 1.05, w: 7.7, h: 1.0, fontFace: F, fontSize: 22, bold: true, color: WHITE, lineSpacingMultiple: 1.03, margin: 0 });
    const dirs = [["FaShieldAlt", "Validate explanations", "Counterfactual study of faithfulness for the XAI layer."],
      ["FaGlobe", "Test across domains", "Replicate on other catalogs, markets and larger vocabularies."],
      ["FaBalanceScale", "Asymmetric similarity", "Exploit that imitations are accord-subsets of the reference."]];
    let y = 2.35;
    dirs.forEach(([ic, h, b]) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.82, rectRadius: 0.07, fill: { color: NAVY_CARD }, line: { type: "none" } });
      iconCircle(s, M + 0.5, y + 0.41, 0.6, ic, NAVY);
      s.addText([{ text: h + "   ", options: { bold: true, color: WHITE } }, { text: b, options: { color: "BFCBE0" } }],
        { x: M + 1.0, y, w: W - 2 * M - 1.2, h: 0.82, fontFace: F, fontSize: 13.5, valign: "middle", margin: 0 });
      y += 0.94;
    });
    s.addText([{ text: "Thank you", options: { bold: true, color: WHITE } }, { text: "    azamazriahmad@mail.ugm.ac.id", options: { color: "8FA0BE" } }],
      { x: M, y: 5.15, w: 8.8, h: 0.35, fontFace: F, fontSize: 12.5, margin: 0 });
  }

  // ---- speaker notes ----
  const notes = [
    "Open with the partnership: this is a joint research project with Aromatique, an Indonesian perfume brand. Your part is the recommender engine.",
    "Position the work in one breath: content-based recommender, perfume domain, small data, no user interactions. The four chips summarise the whole setting.",
    "Tell the origin story: many branches, peak-hour bottleneck, few staff. Colleague builds the chatbot (HCI); you build the recommender inside it. Walk the flow left to right; give the 'perfume for school' example.",
    "These are the existing perfume recommenders. Lead with the journal result (Fannisa). They are all content-based, single-accord, note-text, no interactions.",
    "The gap slide. All three claims are backed by Q1 journals. Stress gap 2: the strongest recommenders need interactions the data does not have, so they cannot even run.",
    "State the proposal as three short answers. Why not order-1, why co-occurrence, why not embeddings. End on parameter-free by design.",
    "Explain the pipeline without math: preference becomes accords and accord-pairs, matched by one cosine, returns Top-3 with reasons.",
    "The methodological selling point: a non-circular firewall stops the answer from leaking. Query accords are verified externally from Fragrantica.",
    "Setup in numbers: 340 products, 209 queries, 15 methods across four families, one identical rigorous evaluation.",
    "Read the chart simply: proposed is highest, +9% over baseline, and the fancy methods all fall below the simple baseline.",
    "The headline finding: simple beats complex. Two failure levels — overfit and lose, or only tie. Land the takeaway.",
    "Be honest about size: modest +9%, but statistically very solid, and 81% of it comes from the pairs. Explain the ceiling.",
    "Close the loop to the use case: each pick comes with the accord-pairs that justify it — auditable, ready for the chatbot. Note the example is illustrative.",
    "Wrap with contribution and three concrete collaboration directions. Invite discussion and thank them.",
  ];
  pres.slides.forEach((sl, i) => sl.addNotes(notes[i] || ""));

  await pres.writeFile({ fileName: "D:/Azam/MTI/TESIS/new/IEEE-Conf-2026/presentation/Aromatique_Recsys_Presentation.pptx" });
  console.log("WROTE Aromatique_Recsys_Presentation.pptx");
}
main().catch(e => { console.error(e); process.exit(1); });
