const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
pres.author = "Azam Azri";
pres.title = "Order-2 Co-occurrence for Interaction-Free Perfume Recommendation";

// ---- palette ----
const NAVY = "1B2A4A", NAVY_CARD = "24365E";
const INK = "1B2A4A", BODY = "374151", MUTED = "6B7280";
const AMBER = "C0801A", AMBER_HI = "E6B450";
const CARD = "F3F6FB", LINE = "E2E8F0", WHITE = "FFFFFF";
const F = "Poppins";
const W = 10, H = 5.625, M = 0.6;
const sh = () => ({ type: "outer", color: "000000", blur: 7, offset: 3, angle: 90, opacity: 0.10 });

function footer(slide, n, label) {
  slide.addText(label, { x: M, y: H - 0.42, w: 6, h: 0.3, fontFace: F, fontSize: 9, color: MUTED, align: "left", margin: 0 });
  slide.addText(String(n) + " / 12", { x: W - 1.5, y: H - 0.42, w: 0.9, h: 0.3, fontFace: F, fontSize: 9, color: MUTED, align: "right", margin: 0 });
}
function kicker(slide, txt, color, x, y) {
  slide.addText(txt.toUpperCase(), { x: x, y: y, w: 8, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: color, charSpacing: 2, margin: 0 });
}
function title(slide, txt) {
  slide.addText(txt, { x: M, y: 0.55, w: W - 2 * M, h: 0.9, fontFace: F, fontSize: 27, bold: true, color: INK, margin: 0, valign: "top" });
}
function dot(slide, cx, cy, r, color, opacity) {
  slide.addShape(pres.shapes.OVAL, { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r, fill: { color: color, transparency: opacity ? (1 - opacity) * 100 : 0 }, line: { type: "none" } });
}
function seg(slide, x1, y1, x2, y2, color, width) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  const flipV = (x2 - x1) * (y2 - y1) < 0;
  slide.addShape(pres.shapes.LINE, { x, y, w, h, flipV, line: { color: color, width: width } });
}
function node(slide, cx, cy, label, shaded) {
  const w = 0.86, h = 0.5;
  slide.addShape(pres.shapes.OVAL, { x: cx - w / 2, y: cy - h / 2, w, h,
    fill: { color: shaded ? "FBEFD6" : WHITE }, line: { color: shaded ? AMBER : "94A3B8", width: shaded ? 1.5 : 1 } });
  slide.addText(label, { x: cx - w / 2 - 0.1, y: cy - h / 2, w: w + 0.2, h, fontFace: F, fontSize: 8.5, color: INK, align: "center", valign: "middle", margin: 0 });
}

// ============================== SLIDE 1 — TITLE ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: NAVY };
  // motif: cluster of amber accord dots, top-right
  dot(s, 8.9, 1.0, 0.55, AMBER, 0.20); dot(s, 9.4, 1.7, 0.32, AMBER, 0.35);
  dot(s, 8.5, 1.9, 0.22, AMBER_HI, 0.5); dot(s, 9.15, 1.15, 0.13, AMBER_HI, 0.9);
  kicker(s, "Joint Research Presentation", AMBER_HI, M, 1.25);
  s.addText("Order-2 Co-occurrence for\nInteraction-Free Perfume Recommendation", {
    x: M, y: 1.75, w: 8.4, h: 1.7, fontFace: F, fontSize: 33, bold: true, color: WHITE, lineSpacingMultiple: 1.04, margin: 0 });
  s.addText("A non-circular study of what actually helps content-based fragrance retrieval", {
    x: M, y: 3.45, w: 8.2, h: 0.5, fontFace: F, fontSize: 15, italic: true, color: "C7D2E4", margin: 0 });
  s.addText([
    { text: "Azam Azri", options: { bold: true, color: WHITE } },
    { text: "   •   Master's Program in Informatics, UGM   •   Yogyakarta, Indonesia", options: { color: "AEBBD2" } },
  ], { x: M, y: 4.55, w: 8.8, h: 0.4, fontFace: F, fontSize: 12.5, margin: 0 });
  s.addText("June 2026", { x: M, y: 4.95, w: 6, h: 0.3, fontFace: F, fontSize: 11, color: "8FA0BE", margin: 0 });
})();

// ============================== SLIDE 2 — SETTING ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "The task: recommending a similar perfume");
  s.addText([
    { text: "A shopper who likes an expensive branded scent wants an affordable local product that smells the same.", options: { breakLine: true, bold: true, color: INK } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "Each perfume is described by a small set of olfactory ", options: {} },
    { text: "accords", options: { bold: true, color: AMBER } },
    { text: " (e.g. amber, woody, warm spicy). Given a reference perfume, the system ranks the catalog by scent similarity — a content-based recommendation, evaluated as retrieval.", options: { breakLine: true } },
  ], { x: M, y: 1.7, w: 5.2, h: 2.8, fontFace: F, fontSize: 14.5, color: BODY, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
  // stat cards
  const stats = [["340", "local products"], ["209", "reference perfumes"], ["56", "shared accords"]];
  let y = 1.65;
  stats.forEach(([n, l]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 6.2, y, w: 3.2, h: 0.92, rectRadius: 0.08, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
    s.addText(n, { x: 6.35, y: y + 0.05, w: 1.2, h: 0.82, fontFace: F, fontSize: 30, bold: true, color: AMBER, align: "center", valign: "middle", margin: 0 });
    s.addText(l, { x: 7.5, y, w: 1.8, h: 0.92, fontFace: F, fontSize: 13, color: INK, valign: "middle", margin: 0 });
    y += 1.08;
  });
  footer(s, 2, "The setting");
})();

// ============================== SLIDE 3 — THREE PROBLEMS ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Three open problems in this setting");
  const items = [
    ["1", "Stuck at order-1", "Perfume recommenders compare single accords only, treating each as independent — ignoring how accords combine."],
    ["2", "No interactions", "Catalogs record no ratings or clicks. Collaborative filtering and knowledge-graph recommenders (KGAT, LightGCN) cannot be used."],
    ["3", "Small, sparse data", "With few examples per query, flexible models tend to overfit. Does adding structure actually help — or hurt?"],
  ];
  const cw = 2.9, gap = 0.2, x0 = M, y = 1.75;
  items.forEach(([num, head, body], i) => {
    const x = x0 + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 3.05, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
    dot(s, x + 0.55, y + 0.62, 0.32, AMBER);
    s.addText(num, { x: x + 0.23, y: y + 0.3, w: 0.64, h: 0.64, fontFace: F, fontSize: 20, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
    s.addText(head, { x: x + 0.25, y: y + 1.05, w: cw - 0.5, h: 0.5, fontFace: F, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(body, { x: x + 0.25, y: y + 1.55, w: cw - 0.5, h: 1.4, fontFace: F, fontSize: 12.5, color: BODY, lineSpacingMultiple: 1.1, valign: "top", margin: 0 });
  });
  footer(s, 3, "Problem statement");
})();

// ============================== SLIDE 4 — RESEARCH QUESTIONS ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Two research questions");
  const qs = [
    ["RQ1", "Does modeling accord co-occurrence (order-2) beat single-accord similarity?"],
    ["RQ2", "Do perceptual, neural, and learned structures actually help — or just overfit?"],
  ];
  let y = 1.8;
  qs.forEach(([tag, q]) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 1.5, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
    s.addText(tag, { x: M + 0.35, y: y + 0.1, w: 1.7, h: 1.3, fontFace: F, fontSize: 36, bold: true, color: AMBER, valign: "middle", margin: 0 });
    s.addText(q, { x: M + 2.1, y: y, w: W - 2 * M - 2.5, h: 1.5, fontFace: F, fontSize: 17, color: INK, valign: "middle", lineSpacingMultiple: 1.1, margin: 0 });
    y += 1.75;
  });
  footer(s, 4, "Research questions");
})();

// ============================== SLIDE 5 — CORE IDEA ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "The idea: pairs, not single notes");
  s.addText([
    { text: "Represent a perfume by which accords ", options: {} },
    { text: "co-occur", options: { bold: true, color: AMBER } },
    { text: " in it, not just which accords it has.", options: { breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "Rare, distinctive pairs get high weight; common ones are down-weighted automatically.", options: { breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 6 } },
    { text: "The matcher is ", options: {} },
    { text: "parameter-free", options: { bold: true, color: INK } },
    { text: " — no training, so it cannot overfit.", options: {} },
  ], { x: M, y: 1.7, w: 4.2, h: 3.2, fontFace: F, fontSize: 14, color: BODY, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });
  // concept diagram (right)
  s.addText("Reference", { x: 5.45, y: 1.35, w: 1.4, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: MUTED, align: "center", margin: 0 });
  s.addText("Product", { x: 7.85, y: 1.35, w: 1.4, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: MUTED, align: "center", margin: 0 });
  // reference triangle
  const R = { amb: [6.15, 2.05], cin: [5.6, 3.15], wdy: [6.7, 3.15] };
  const P = { amb: [8.55, 2.05], cin: [8.0, 3.15], lea: [9.1, 3.15] };
  seg(s, R.amb[0], R.amb[1], R.wdy[0], R.wdy[1], "B6C2D4", 1.25);
  seg(s, R.cin[0], R.cin[1], R.wdy[0], R.wdy[1], "B6C2D4", 1.25);
  seg(s, R.amb[0], R.amb[1], R.cin[0], R.cin[1], AMBER, 3);
  seg(s, P.amb[0], P.amb[1], P.lea[0], P.lea[1], "B6C2D4", 1.25);
  seg(s, P.cin[0], P.cin[1], P.lea[0], P.lea[1], "B6C2D4", 1.25);
  seg(s, P.amb[0], P.amb[1], P.cin[0], P.cin[1], AMBER, 3);
  node(s, R.amb[0], R.amb[1], "amber", true); node(s, R.cin[0], R.cin[1], "cinnamon", true); node(s, R.wdy[0], R.wdy[1], "woody", false);
  node(s, P.amb[0], P.amb[1], "amber", true); node(s, P.cin[0], P.cin[1], "cinnamon", true); node(s, P.lea[0], P.lea[1], "leather", false);
  s.addText("shared rare pair → order-2 match", { x: 5.4, y: 4.05, w: 4.1, h: 0.4, fontFace: F, fontSize: 11.5, bold: true, italic: true, color: AMBER, align: "center", margin: 0 });
  footer(s, 5, "Core idea");
})();

// ============================== SLIDE 6 — NON-CIRCULAR PROTOCOL ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Making the test trustworthy");
  s.addText([
    { text: "The main risk: features secretly leak the answer, so a method looks good for the wrong reason. ", options: {} },
    { text: "A three-source firewall", options: { bold: true, color: AMBER } },
    { text: " keeps each part independent; query accords are verified externally from Fragrantica.", options: {} },
  ], { x: M, y: 1.6, w: W - 2 * M, h: 0.85, fontFace: F, fontSize: 14, color: BODY, lineSpacingMultiple: 1.1, valign: "top", margin: 0 });
  const cols = [
    ["Item features", "Local catalog accords", "independent of the label"],
    ["Query features", "Fragrantica (external)", "independent of catalog & label"],
    ["Ground-truth label", "Held-out “imitates” edge", "independent of accord similarity"],
  ];
  const cw = 2.9, gap = 0.2, y = 2.7;
  cols.forEach(([h, src, ind], i) => {
    const x = M + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 1.9, rectRadius: 0.09, fill: { color: i === 1 ? "FBEFD6" : CARD }, line: { type: "none" }, shadow: sh() });
    s.addText(h, { x: x + 0.22, y: y + 0.2, w: cw - 0.44, h: 0.4, fontFace: F, fontSize: 14.5, bold: true, color: INK, margin: 0 });
    s.addText(src, { x: x + 0.22, y: y + 0.68, w: cw - 0.44, h: 0.55, fontFace: F, fontSize: 12.5, color: BODY, margin: 0, valign: "top" });
    s.addText(ind, { x: x + 0.22, y: y + 1.28, w: cw - 0.44, h: 0.5, fontFace: F, fontSize: 11, italic: true, color: AMBER, margin: 0, valign: "top" });
  });
  footer(s, 6, "Non-circular protocol");
})();

// ============================== SLIDE 7 — BENCHMARK DESIGN ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "A fair 15-method benchmark");
  s.addText("All methods are compared under identical leave-one-out evaluation, with paired significance tests and bootstrap confidence intervals.", {
    x: M, y: 1.55, w: W - 2 * M, h: 0.6, fontFace: F, fontSize: 13.5, color: BODY, lineSpacingMultiple: 1.08, valign: "top", margin: 0 });
  const par = [
    ["Marginal", "Jaccard, TF-IDF, BM25"],
    ["Neural", "Sentence-BERT, Word2Vec, node2vec"],
    ["Perceptual", "Fragrance-wheel transport"],
    ["Learned", "PPMI-SVD, GBM, bilinear, …"],
  ];
  const cw = 2.18, gap = 0.17, y = 2.35;
  par.forEach(([h, ex], i) => {
    const x = M + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 1.55, rectRadius: 0.08, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
    s.addText(h, { x: x + 0.18, y: y + 0.18, w: cw - 0.36, h: 0.4, fontFace: F, fontSize: 14, bold: true, color: INK, margin: 0 });
    s.addText(ex, { x: x + 0.18, y: y + 0.62, w: cw - 0.36, h: 0.85, fontFace: F, fontSize: 11, color: BODY, lineSpacingMultiple: 1.05, margin: 0, valign: "top" });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 4.18, w: W - 2 * M, h: 0.7, rectRadius: 0.08, fill: { color: NAVY }, line: { type: "none" } });
  s.addText([
    { text: "Proposed: ", options: { bold: true, color: AMBER_HI } },
    { text: "order-2 co-occurrence matcher — the simplest of all, with no trained parameters.", options: { color: WHITE } },
  ], { x: M + 0.3, y: 4.18, w: W - 2 * M - 0.6, h: 0.7, fontFace: F, fontSize: 13.5, valign: "middle", margin: 0 });
  footer(s, 7, "Experimental design");
})();

// ============================== SLIDE 8 — RESULTS CHART ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Result: the simplest idea ranks first");
  s.addChart(pres.charts.BAR, [{
    name: "MRR",
    labels: ["Proposed", "Learned", "Baseline", "Neural", "Perceptual", "High-dim"],
    values: [0.496, 0.457, 0.454, 0.340, 0.284, 0.139],
  }], {
    x: 0.5, y: 1.5, w: 6.2, h: 3.6, barDir: "col",
    chartColors: [AMBER, NAVY, NAVY, NAVY, NAVY, NAVY],
    chartArea: { fill: { color: "FFFFFF" } },
    catAxisLabelColor: BODY, catAxisLabelFontFace: F, catAxisLabelFontSize: 11,
    valAxisLabelColor: MUTED, valAxisLabelFontFace: F, valAxisLabelFontSize: 10,
    valAxisMinVal: 0, valAxisMaxVal: 0.6, valAxisMajorUnit: 0.2,
    valGridLine: { color: "EAEFF6", size: 0.5 }, catGridLine: { style: "none" },
    showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK,
    dataLabelFontFace: F, dataLabelFontSize: 10, dataLabelFormatCode: "0.000",
    showLegend: false, showTitle: false,
  });
  s.addText([
    { text: "MRR", options: { bold: true, color: INK, breakLine: true } },
    { text: "= how high the correct product sits in the ranking (higher is better).", options: { color: BODY, breakLine: true } },
    { text: "", options: { breakLine: true, fontSize: 8 } },
    { text: "Best score among all 15 methods. ", options: { bold: true, color: AMBER, breakLine: true } },
    { text: "Neural, perceptual and high-dimensional learned methods all fall below the simple baseline.", options: { color: BODY } },
  ], { x: 6.95, y: 1.7, w: 2.65, h: 3.2, fontFace: F, fontSize: 12.5, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
  footer(s, 8, "Results");
})();

// ============================== SLIDE 9 — KEY FINDING ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Finding: simple beats complex");
  const cols = [
    ["What fell below the baseline", "Neural embeddings, perceptual-taxonomy transport, and high-dimensional learned models overfit the sparse data and lost decisively.", "EFE7DC"],
    ["What only tied the baseline", "Moderate learned models (PPMI-SVD, gradient boosting) matched the simple TF-IDF baseline — but never surpassed the order-2 matcher.", CARD],
  ];
  const cw = 4.3, gap = 0.3, y = 1.8;
  cols.forEach(([h, b, bg], i) => {
    const x = M + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.1, rectRadius: 0.09, fill: { color: bg }, line: { type: "none" }, shadow: sh() });
    s.addText(h, { x: x + 0.3, y: y + 0.25, w: cw - 0.6, h: 0.5, fontFace: F, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addText(b, { x: x + 0.3, y: y + 0.85, w: cw - 0.6, h: 1.1, fontFace: F, fontSize: 13, color: BODY, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
  });
  s.addText([
    { text: "Takeaway:  ", options: { bold: true, color: AMBER_HI } },
    { text: "on small, interaction-free data, added model capacity does not help — it hurts.", options: { color: WHITE } },
  ], { x: M, y: 4.15, w: W - 2 * M, h: 0.7, fontFace: F, fontSize: 14, valign: "middle", align: "center", fill: { color: NAVY }, margin: 0 });
  // wrap the takeaway in a navy rounded box behind text
  footer(s, 9, "Key finding");
})();

// ============================== SLIDE 10 — HONEST NUMBERS ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "Honest about the size of the win");
  const stats = [
    ["+9%", "over the standard\nTF-IDF baseline", "modest"],
    ["p = 8.7e-8", "paired significance\ntest", "robust"],
    ["81%", "of the signal from\naccord pairs", "real effect"],
  ];
  const cw = 2.9, gap = 0.2, y = 1.85;
  stats.forEach(([n, l, tag], i) => {
    const x = M + i * (cw + gap);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 2.3, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
    s.addText(n, { x: x + 0.15, y: y + 0.35, w: cw - 0.3, h: 0.8, fontFace: F, fontSize: 30, bold: true, color: AMBER, align: "center", margin: 0 });
    s.addText(l, { x: x + 0.2, y: y + 1.2, w: cw - 0.4, h: 0.7, fontFace: F, fontSize: 12.5, color: BODY, align: "center", lineSpacingMultiple: 1.05, margin: 0 });
    s.addText(tag, { x: x + 0.2, y: y + 1.9, w: cw - 0.4, h: 0.3, fontFace: F, fontSize: 11, bold: true, italic: true, color: INK, align: "center", margin: 0 });
  });
  s.addText("The gain is modest but statistically solid — bounded by the ~86% accord overlap that is intrinsic to imitation perfumes.", {
    x: M, y: 4.5, w: W - 2 * M, h: 0.5, fontFace: F, fontSize: 12.5, italic: true, color: MUTED, align: "center", margin: 0 });
  footer(s, 10, "Reading the numbers");
})();

// ============================== SLIDE 11 — CONTRIBUTION + LIMITS ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: WHITE };
  title(s, "What this contributes");
  // left: contributions
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: 1.8, w: 4.3, h: 3.1, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
  s.addText("Contribution", { x: M + 0.3, y: 2.0, w: 3.7, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: AMBER, margin: 0 });
  s.addText([
    { text: "A finding + a non-circular protocol", options: { bullet: true, breakLine: true, bold: true, color: INK } },
    { text: "not a new model", options: { bullet: true, breakLine: true, indentLevel: 1, color: BODY } },
    { text: "Explainable recommendations", options: { bullet: true, breakLine: true, bold: true, color: INK } },
    { text: "auditable accord-pair paths", options: { bullet: true, breakLine: true, indentLevel: 1, color: BODY } },
    { text: "A reproducible 15-method benchmark", options: { bullet: true, bold: true, color: INK } },
  ], { x: M + 0.3, y: 2.5, w: 3.75, h: 2.3, fontFace: F, fontSize: 13, color: BODY, lineSpacingMultiple: 1.1, paraSpaceAfter: 4, valign: "top", margin: 0 });
  // right: limitations
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 5.1, y: 1.8, w: 4.3, h: 3.1, rectRadius: 0.09, fill: { color: CARD }, line: { type: "none" }, shadow: sh() });
  s.addText("Limitations (honestly)", { x: 5.4, y: 2.0, w: 3.7, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: INK, margin: 0 });
  s.addText([
    { text: "Modest effect size", options: { bullet: true, breakLine: true } },
    { text: "Single proprietary catalog", options: { bullet: true, breakLine: true } },
    { text: "Binary accords (no intensity)", options: { bullet: true, breakLine: true } },
    { text: "Perceptual proxy, not user satisfaction", options: { bullet: true } },
  ], { x: 5.4, y: 2.55, w: 3.75, h: 2.2, fontFace: F, fontSize: 13, color: BODY, lineSpacingMultiple: 1.15, paraSpaceAfter: 7, valign: "top", margin: 0 });
  footer(s, 11, "Contribution & limitations");
})();

// ============================== SLIDE 12 — COLLABORATION ==============================
(() => {
  const s = pres.addSlide(); s.background = { color: NAVY };
  dot(s, 9.2, 0.9, 0.5, AMBER, 0.22); dot(s, 8.7, 1.5, 0.26, AMBER_HI, 0.5);
  kicker(s, "Where we can go together", AMBER_HI, M, 0.7);
  s.addText("Directions for collaboration", { x: M, y: 1.05, w: 8.5, h: 0.7, fontFace: F, fontSize: 27, bold: true, color: WHITE, margin: 0 });
  const dirs = [
    ["Validate explanations", "Counterfactual study of faithfulness for the XAI layer."],
    ["Test across domains", "Replicate on other catalogs, markets, and larger vocabularies."],
    ["Asymmetric similarity", "Exploit that imitations are accord-subsets of the reference."],
  ];
  let y = 2.1;
  dirs.forEach(([h, b], i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y, w: W - 2 * M, h: 0.82, rectRadius: 0.07, fill: { color: NAVY_CARD }, line: { type: "none" } });
    dot(s, M + 0.45, y + 0.41, 0.16, AMBER_HI);
    s.addText(String(i + 1), { x: M + 0.29, y: y + 0.13, w: 0.32, h: 0.55, fontFace: F, fontSize: 13, bold: true, color: NAVY, align: "center", valign: "middle", margin: 0 });
    s.addText([
      { text: h + "   ", options: { bold: true, color: WHITE } },
      { text: b, options: { color: "BFCBE0" } },
    ], { x: M + 0.85, y, w: W - 2 * M - 1.1, h: 0.82, fontFace: F, fontSize: 13.5, valign: "middle", margin: 0 });
    y += 0.95;
  });
  s.addText([
    { text: "Thank you", options: { bold: true, color: WHITE } },
    { text: "    azamazriahmad@mail.ugm.ac.id", options: { color: "8FA0BE" } },
  ], { x: M, y: 5.0, w: 8.8, h: 0.4, fontFace: F, fontSize: 13, margin: 0 });
})();

// ---- speaker notes ----
const notes = [
  "Open with the real-world hook: finding an affordable local perfume that smells like an expensive one. Frame it as a recommendation problem. Keep it 20 seconds.",
  "Define one term only: accord = a unit of scent character. Give the three data numbers so the scale is clear. Stress it is content-based: no users, just item features.",
  "This is the core of the story. Walk through the three problems slowly: (1) existing perfume recsys only look at single accords; (2) no interactions, so the strongest modern recommenders are off the table; (3) small data means complex models risk overfitting.",
  "State the two questions plainly. RQ1 is about the idea; RQ2 is the honest test of whether fancy structure helps. The whole paper answers these two.",
  "Explain order-2 with the diagram, not the math: two perfumes can share single accords, but what really discriminates is a shared rare PAIR (amber-cinnamon). Parameter-free is a deliberate choice, not laziness.",
  "This is the methodological selling point for the professor. The danger is leakage: features quietly carrying the answer. Three-source firewall keeps them separate; query accords verified independently from Fragrantica.",
  "We did not just propose one method; we ran a fair tournament of 15 methods across four families, under one identical, rigorous evaluation. The proposed one is the simplest.",
  "Read the chart simply: MRR = how high the correct product sits. Proposed is highest. Point out that the neural, perceptual and high-dimensional learned methods are all BELOW the simple baseline.",
  "The most interesting finding. Two failure levels: high-capacity methods overfit and lose; moderate learned ones only tie the baseline. Land the takeaway: more capacity does not help here.",
  "Be honest. The win is modest (~9%) but statistically very solid, and 81% of it comes from the pairs. Explain the ceiling: imitations already share ~86% of accords, so there is little room.",
  "Frame the contribution as a finding plus an honest protocol, not a new model. Mention explainability as a bridge to XAI collaboration. State limitations openly to build trust.",
  "Close on collaboration. Offer three concrete directions and invite discussion. End warmly and give contact.",
];
pres.slides.forEach((sl, i) => sl.addNotes(notes[i] || ""));

pres.writeFile({ fileName: "D:/Azam/MTI/TESIS/new/IEEE-Conf-2026/presentation/Perfume_Recsys_Presentation.pptx" })
  .then(f => console.log("WROTE", f));
