"use strict";
const $ = (id) => document.getElementById(id);
const defaults = {
  units: {
    mass: "g",
    thick: "mm",
    width: "mm",
    length: "mm",
    secondary: "cm",
    weldLength: "mm",
    weldSize: "mm",
  },
  electrode: "120k",
  diameter: "2.0",
  rodLength: "350",
  dark: false,
  material: "7.85",
  weldSize: 4,
  stub: 50,
  coreDensity: 7.85,
  recoveries: {},
};
let prefs;
try {
  const stored = JSON.parse(localStorage.getItem("stahlgewicht-prefs") || "{}");
  prefs = {
    ...defaults,
    ...stored,
    units: { ...defaults.units, ...stored?.units },
  };
} catch {
  prefs = structuredClone(defaults);
}
// Treat browser storage as untrusted input, including old schema values.
for (const key of Object.keys(defaults.units)) {
  const allowed = key === "mass" ? ["mg", "g", "kg", "t"] : ["mm", "cm", "m"];
  if (!allowed.includes(prefs.units[key]))
    prefs.units[key] = defaults.units[key];
}
for (const [key, values] of Object.entries({
  material: ["7.85", "7.9", "2.7"],
  electrode: [
    "120k",
    "blau",
    "gruen",
    "spezial",
    "therm19",
    "therm25",
    "custom",
    "none",
  ],
  diameter: ["1.6", "2.0", "2.5", "3.2", "4.0", "5.0", "6.0"],
  rodLength: ["250", "300", "350", "400", "450"],
})) {
  if (!values.includes(prefs[key])) prefs[key] = defaults[key];
}
if (typeof prefs.dark !== "boolean") prefs.dark = false;
for (const key of ["weldSize", "coreDensity"])
  if (!Number.isFinite(prefs[key]) || prefs[key] <= 0)
    prefs[key] = defaults[key];
if (!Number.isFinite(prefs.stub) || prefs.stub < 0 || prefs.stub >= 450)
  prefs.stub = 50;
if (
  !prefs.recoveries ||
  typeof prefs.recoveries !== "object" ||
  Array.isArray(prefs.recoveries)
)
  prefs.recoveries = {};
for (const key of Object.keys(prefs.recoveries))
  if (
    ![
      "120k",
      "blau",
      "gruen",
      "spezial",
      "therm19",
      "therm25",
      "custom",
      "none",
    ].includes(key) ||
    !Number.isFinite(prefs.recoveries[key]) ||
    prefs.recoveries[key] <= 0
  )
    delete prefs.recoveries[key];
prefs.recoveries = { ...prefs.recoveries };
const mf = { mg: 0.000001, g: 0.001, kg: 1, t: 1000 },
  lf = { mm: 1, cm: 10, m: 1000 };
const electrodeNames = {
  "120k": "PHOENIX 120 K",
  blau: "PHOENIX Blau",
  gruen: "PHOENIX Grün T",
  spezial: "PHOENIX Spezial D",
  therm19: "Thermanit 19/15 H",
  therm25: "Thermanit 25/22 H",
  custom: "Eigene Sorte",
  none: "Keine Sorte",
};
const fmt = (x) =>
  (x > 0 && x < 0.005) || Math.abs(x) >= 1e12
    ? Number(x).toExponential(2).replace(".", ",")
    : Number(x).toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
const parse = (s) => {
  const t = String(s).trim().replace(",", ".");
  return /^(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(t) ? Number(t) : NaN;
};
const save = () => {
  try {
    localStorage.setItem("stahlgewicht-prefs", JSON.stringify(prefs));
    $("storageNotice").textContent = "";
  } catch {
    $("storageNotice").textContent =
      "Einstellungen können in diesem Browser nicht dauerhaft gespeichert werden.";
  }
};
const options = (id, arr) => {
  $(id).innerHTML = arr
    .map(([v, t]) => `<option value="${v}">${t}</option>`)
    .join("");
};
const sizeUnits = ["mm", "cm", "m"].map((v) => [v, v]);
const weightUnits = ["mg", "g", "kg", "t"].map((v) => [v, v]);
const unitRows = [
  ["mass", "Gewicht", weightUnits],
  ["thick", "Materialdicke", sizeUnits],
  ["width", "Materialbreite", sizeUnits],
  ["length", "Ergebnis – Haupteinheit", sizeUnits],
  ["secondary", "Ergebnis – zweite Einheit", sizeUnits],
  ["weldLength", "Schweißnahtlänge", sizeUnits],
  ["weldSize", "Schweißnahtmaß", sizeUnits],
];
$("unitSettings").innerHTML = unitRows
  .map(
    ([key, label, opts]) =>
      `<div class="settingrow"><label for="u_${key}">${label}</label><select id="u_${key}">${opts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></div>`,
  )
  .join("");
const elOpts = Object.entries(electrodeNames);
for (const id of ["electrode", "defaultElectrode"]) options(id, elOpts);
for (const id of ["diameter", "defaultDiameter"])
  options(
    id,
    ["1.6", "2.0", "2.5", "3.2", "4.0", "5.0", "6.0"].map((v) => [
      v,
      v.replace(".", ","),
    ]),
  );
for (const id of ["rodLength", "defaultRodLength"])
  options(
    id,
    ["250", "300", "350", "400", "450"].map((v) => [v, v]),
  );
function applyPrefs() {
  $("material").value = prefs.material;
  $("defaultWeldSize").value = String(prefs.weldSize).replace(".", ",");
  unitRows.forEach(([k]) => ($("u_" + k).value = prefs.units[k]));
  $("defaultElectrode").value = prefs.electrode;
  $("defaultDiameter").value = prefs.diameter;
  $("defaultRodLength").value = prefs.rodLength;
  document.body.classList.toggle("dark", prefs.dark);
  $("theme").textContent = prefs.dark ? "☾" : "☼";
  $("massLabel").textContent =
    `Gewünschtes Gesamtgewicht (${prefs.units.mass})`;
  $("thickLabel").textContent = `Dicke (${prefs.units.thick})`;
  $("widthLabel").textContent = `Breite (${prefs.units.width})`;
  $("weldLengthLabel").textContent =
    `Gesamtnahtlänge (${prefs.units.weldLength})`;
  $("weldSizeLabel").textContent =
    `${$("weldType").value === "fillet" ? "Schenkellänge z" : "Quadratseite s"} (${prefs.units.weldSize})`;
  calculate();
}
// One shared isometric geometry function, with a visual minimum for very thin dimensions.
function geometry(L, B, D, rect) {
  const max = Math.max(L, B, D, 0.001);
  const l = L / max,
    b = B / max,
    d = D / max;
  const scale = Math.min(
    rect.w / (l + 0.72 * b),
    rect.h / (0.36 * (l + b) + d),
  );
  const u = Math.max(18, scale * l),
    v = Math.max(14, scale * b),
    h = Math.max(7, scale * d);
  const vx = -v * 0.72,
    vy = -v * 0.36,
    ux = u,
    uy = -u * 0.36;
  const corners = [
    [0, 0],
    [ux, uy],
    [ux + vx, uy + vy],
    [vx, vy],
  ];
  let xs = corners.map((p) => p[0]),
    ys = corners.map((p) => p[1]);
  let x = rect.x + rect.w / 2 - (Math.min(...xs) + Math.max(...xs)) / 2,
    y = rect.y + rect.h / 2 - (Math.min(...ys) + Math.max(...ys) + h) / 2;
  return {
    A: [x, y],
    B: [x + ux, y + uy],
    C: [x + ux + vx, y + uy + vy],
    D: [x + vx, y + vy],
    h,
  };
}
const point = (p) => p.map((x) => x.toFixed(2)).join(",");
const poly = (pts) => pts.map(point).join(" ");
const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
const line = (a, b) => `M${point(a)} L${point(b)}`;
const normal = (a, b, side, offset) => {
  let dx = b[0] - a[0],
    dy = b[1] - a[1],
    l = Math.hypot(dx, dy) || 1;
  return [((side * -dy) / l) * offset, ((side * dx) / l) * offset];
};
// Identical offset dimension generator for all three dimensions: same L-shaped end connectors.
function dimension(a, b, side, offset, color, label, textShift = 0) {
  const n = normal(a, b, side, offset),
    s = add(a, n),
    e = add(b, n),
    mid = [(s[0] + e[0]) / 2, (s[1] + e[1]) / 2],
    unit = normal(a, b, side, 1),
    text = add(mid, [unit[0] * (15 + textShift), unit[1] * (15 + textShift)]);
  return `<path class="measure" stroke="${color}" d="${line(s, e)} ${line(s, add(s, [-unit[0] * 10, -unit[1] * 10]))} ${line(e, add(e, [-unit[0] * 10, -unit[1] * 10]))}"/><text class="measuretext" x="${text[0]}" y="${text[1]}" fill="${color}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${(Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI},${text[0]},${text[1]})">${label}</text>`;
}
// Visual fillet on the visible lower longitudinal edge. Both sides remain in the mass model.
function weldDrawing(g, L, B, D, weld) {
  if (!weld || !(weld.length > 0) || !(weld.size > 0)) return "";
  if (weld.axis === "width") {
    g = { A: g.D, B: g.A, D: g.C, h: g.h };
    [L, B] = [B, L];
  }
  const fraction = Math.min(1, weld.length / (2 * L));
  const start = (1 - fraction) / 2,
    end = 1 - start;
  const z = Math.min(weld.size, D);
  const height = (g.h * z) / D;
  // Use the same projected axes as the workpiece; do not invent a larger minimum bead.
  const out = [((g.A[0] - g.D[0]) * z) / B, ((g.A[1] - g.D[1]) * z) / B];
  const edge = (t) => [
    g.A[0] + (g.B[0] - g.A[0]) * t,
    g.A[1] + (g.B[1] - g.A[1]) * t + g.h,
  ];
  const footS = edge(start),
    footE = edge(end);
  const topS = add(footS, [0, -height]),
    topE = add(footE, [0, -height]);
  const toeS = add(footS, out),
    toeE = add(footE, out);
  // Convex cross-section, extruded along the edge. This is a visual surface only.
  const cS = add(topS, [out[0] * 0.65, out[1] * 0.65]);
  const cE = add(topE, [out[0] * 0.65, out[1] * 0.65]);
  const floor = [
    add(g.A, [0, g.h]),
    add(g.B, [0, g.h]),
    add(toeE, [5, 4]),
    add(toeS, [5, 4]),
  ];
  const surface = `${line(topS, topE)} Q${point(cE)} ${point(toeE)} L${point(toeS)} Q${point(cS)} ${point(topS)} Z`;
  const cap = `${line(footS, topS)} Q${point(cS)} ${point(toeS)} Z`;
  return {
    floor: `<polygon class="weld-ground" points="${poly(floor)}"/>`,
    seam: `<g class="weld-seam" data-fraction="${fraction}" data-height="${height}" data-size="${z}"><path class="weld-surface" d="${surface}"/><path class="weld-end" d="${cap}"/><path class="weld-highlight" d="${line(topS, topE)}"/></g>`,
  };
}
function draw(svgId, L, B, D, detail, weld = null) {
  const box = detail
      ? { x: 88, y: 72, w: 170, h: 112 }
      : { x: 16, y: 16, w: 188, h: 110 },
    g = geometry(L, B, D, box),
    { A, B: Q, C, D: S, h } = g;
  const shape = `<g class="shape"><polygon points="${poly([A, S, add(S, [0, h]), add(A, [0, h])])}" fill="#72859a"/><polygon points="${poly([A, Q, add(Q, [0, h]), add(A, [0, h])])}" fill="#94a9bd"/><polygon points="${poly([A, Q, C, S])}" fill="#c5d1de"/></g>`;
  const bead = weldDrawing(g, L, B, D, weld);
  const assembly = `<g class="assembly">${bead ? bead.floor : ""}${shape}${bead ? bead.seam : ""}</g>`;
  if (!detail) {
    $(svgId).innerHTML = assembly;
    if (bead) {
      const group = $(svgId).querySelector(".assembly"),
        bounds = group.getBBox();
      const scale = Math.min(1, 204 / bounds.width, 129 / bounds.height);
      group.setAttribute(
        "transform",
        `translate(110 71) scale(${scale}) translate(${-bounds.x - bounds.width / 2} ${-bounds.y - bounds.height / 2})`,
      );
    }
    return;
  }
  const measureFmt = (v) =>
    Math.abs(v) >= 1e7 || (v > 0 && v < 0.005)
      ? v.toExponential(2).replace(".", ",")
      : fmt(v);
  const lenLabel = "L " + measureFmt(L) + " mm",
    widthLabel = "B " + measureFmt(B) + " mm",
    thickLabel = "D " + measureFmt(D) + " mm"; // Width is offset from the visible left edge, close to the body; thickness uses the same dimension function.
  $(svgId).innerHTML =
    assembly +
    dimension(S, C, -1, 18, "var(--measure-length)", lenLabel) +
    dimension(
      add(S, [0, h]),
      add(A, [0, h]),
      1,
      22,
      "var(--measure-width)",
      widthLabel,
    ) +
    dimension(Q, add(Q, [0, h]), -1, 22, "var(--measure-thick)", thickLabel, 4);
  const bounds = $(svgId).getBBox(),
    padding = 18;
  $(svgId).setAttribute(
    "viewBox",
    `${Math.min(0, bounds.x - padding)} ${Math.min(0, bounds.y - padding)} ${Math.max(360, bounds.x + bounds.width + padding) - Math.min(0, bounds.x - padding)} ${Math.max(270, bounds.y + bounds.height + padding) - Math.min(0, bounds.y - padding)}`,
  );
}
function calculate() {
  const kg = parse($("mass").value) * mf[prefs.units.mass],
    d = parse($("thick").value) * lf[prefs.units.thick],
    b = parse($("width").value) * lf[prefs.units.width],
    manualLength = parse($("weldLength").value) * lf[prefs.units.weldLength],
    ws = parse($("weldSize").value) * lf[prefs.units.weldSize],
    density = Number($("material").value),
    weld = $("weld").checked,
    auto = $("weldAuto").checked;
  const result = WeldModel.workpiece({
    massKg: kg,
    thickness: d,
    width: b,
    density,
    weld,
    auto,
    weldLength: manualLength,
    weldSize: ws,
    model: $("weldType").value,
  });
  const { good, L, weldKg, wl, axis } = result;
  $("weldLength").readOnly = auto;
  if (auto)
    $("weldLength").value =
      good && weld
        ? (wl / lf[prefs.units.weldLength]).toLocaleString("de-DE", {
            useGrouping: false,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "";
  $("weldAutoInfo").textContent = auto
    ? good && weld
      ? `2 × ${fmt(wl / 2)} mm · entlang der ${axis === "width" ? "Breite (längere Kante)" : "Länge"}`
      : "Zwei durchgehende Nähte an den längeren Kanten."
    : "Gesamtlänge beider Nähte eingeben; je eine Hälfte wird mittig angeordnet.";
  updateWeldSymbol(ws);
  $("primaryCompact").textContent = $("primaryDetail").textContent = good
    ? fmt(L / lf[prefs.units.length])
    : "—";
  $("primaryUnitCompact").textContent = $("primaryUnitDetail").textContent =
    prefs.units.length;
  $("secondaryValue").textContent = good
    ? fmt(L / lf[prefs.units.secondary]) + " " + prefs.units.secondary
    : "—";
  $("weldMass").textContent = good ? fmt(weldKg * 1000) + " g" : "—";
  $("weldMassRow").classList.toggle("hidden", !weld);
  $("validIcon").textContent = good ? "✓" : "!";
  $("validIcon").style.color = good ? "#168044" : "#c44040";
  $("status").textContent = good
    ? "✓ Berechnung erfolgreich"
    : result.error === "tooLong"
      ? "Die Gesamtnahtlänge passt nicht auf beide längeren Kanten."
      : weld && result.error === "range"
        ? "Für diese Naht ist kein positives Werkstück mit dem Zielgewicht möglich."
        : "Bitte positive, endliche Maße und Gewicht eingeben; manuelle Nahtlänge darf null sein.";
  for (const [id, ok] of [
    ["mass", kg > 0 && Number.isFinite(kg)],
    ["thick", d > 0 && Number.isFinite(d)],
    ["width", b > 0 && Number.isFinite(b)],
    [
      "weldLength",
      !weld ||
        auto ||
        (Number.isFinite(manualLength) &&
          manualLength >= 0 &&
          result.error !== "tooLong"),
    ],
    ["weldSize", !weld || (Number.isFinite(ws) && ws > 0)],
  ])
    $(id).setAttribute("aria-invalid", String(!ok));
  $("status").className = good ? "status" : "status error";
  $("copy").disabled = !good;
  $("electrodeSummary").textContent =
    `Ø ${$("diameter").value.replace(".", ",")} mm · ${$("electrode").value === "custom" ? $("customElectrode").value || "Eigene Sorte" : electrodeNames[$("electrode").value]}`;
  $("customWrap").classList.toggle("hidden", $("electrode").value !== "custom");
  const bead = good && weld ? { length: wl, size: ws, axis } : null;
  const notes = [];
  if (bead && ws > d)
    notes.push(
      "Nahthöhe nur in der Zeichnung auf die Werkstückdicke begrenzt; Gewicht unverändert.",
    );

  $("weldDrawingNote").textContent = notes.join(" ");
  $("weldDrawingNote").classList.toggle("hidden", !notes.length);
  draw("miniSvg", good ? L : 60, good ? b : 60, good ? d : 20, false, bead);
  draw("detailSvg", good ? L : 60, good ? b : 60, good ? d : 20, true, bead);
  const estimate = updateConsumption(good, weld, weldKg);
  return { good, L, b, d, kg, weldKg, wl, axis, estimate };
}
for (const id of [
  "mass",
  "thick",
  "width",
  "material",
  "weld",
  "weldLength",
  "weldSize",
  "weldType",
  "weldAuto",
  "electrode",
  "diameter",
  "rodLength",
  "customElectrode",
])
  $(id).addEventListener("input", () => {
    if (id === "material") {
      prefs.material = $("material").value;
      save();
    }
    if (id === "weld")
      $("weldFields").classList.toggle("hidden", !$("weld").checked);
    if (id === "electrode") syncRecovery();
    calculate();
  });
$("electrodeToggle").onclick = () => {
  $("electrodeFields").classList.toggle("hidden");
  $("electrodeToggle").setAttribute(
    "aria-expanded",
    String(!$("electrodeFields").classList.contains("hidden")),
  );
  $("electrodeToggle").textContent = $("electrodeFields").classList.contains(
    "hidden",
  )
    ? "Anpassen ▾"
    : "Schließen ▴";
};
$("expand").onclick = () => {
  $("expand").setAttribute("aria-expanded", "true");
  $("compact").classList.add("hidden");
  $("detail").classList.remove("hidden");
  calculate();
  $("collapse").focus();
};
$("collapse").onclick = () => {
  $("expand").setAttribute("aria-expanded", "false");
  $("detail").classList.add("hidden");
  $("compact").classList.remove("hidden");
  $("expand").focus();
};
function toggleSettings(open) {
  $("settingsBtn").setAttribute("aria-expanded", String(open));
  $("settings").classList.toggle("hidden", !open);
  $("app").classList.toggle("hidden", open);
  (open ? $("settingsClose") : $("settingsBtn")).focus();
}
$("settingsBtn").onclick = () =>
  toggleSettings($("settings").classList.contains("hidden"));
$("settingsClose").onclick = () => toggleSettings(false);
$("theme").onclick = () => {
  prefs.dark = !prefs.dark;
  save();
  applyPrefs();
};
unitRows.forEach(([key]) =>
  $("u_" + key).addEventListener("change", (e) => {
    const old = prefs.units[key],
      next = e.target.value;
    if (["mass", "thick", "width", "weldLength", "weldSize"].includes(key)) {
      const value = parse($(key).value);
      if (Number.isFinite(value)) {
        const factors = key === "mass" ? mf : lf;
        $(key).value = String((value * factors[old]) / factors[next]).replace(
          ".",
          ",",
        );
      }
    }
    prefs.units[key] = next;
    save();
    applyPrefs();
  }),
);
for (const [id, key] of [
  ["defaultElectrode", "electrode"],
  ["defaultDiameter", "diameter"],
  ["defaultRodLength", "rodLength"],
])
  $(id).addEventListener("change", (e) => {
    prefs[key] = e.target.value;
    $(key).value = prefs[key];
    if (key === "electrode") syncRecovery();
    save();
    applyPrefs();
  });
$("reset").onclick = () => {
  for (const key of ["mass", "thick", "width", "weldLength", "weldSize"]) {
    const value = parse($(key).value),
      factors = key === "mass" ? mf : lf;
    if (Number.isFinite(value))
      $(key).value = String(
        (value * factors[prefs.units[key]]) / factors[defaults.units[key]],
      ).replace(".", ",");
  }
  prefs = structuredClone(defaults);
  for (const key of ["electrode", "diameter", "rodLength"])
    $(key).value = prefs[key];
  $("stub").value = prefs.stub;
  $("coreDensity").value = prefs.coreDensity;
  syncRecovery();
  save();
  applyPrefs();
};
$("copy").onclick = async () => {
  const r = calculate();
  if (!r.good) return;
  const text = `Stahlgewicht Rechner v0.6.0\nMaterial: ${$("material").selectedOptions[0].textContent}\nGewicht: ${$("mass").value} ${prefs.units.mass}\nDicke: ${$("thick").value} ${prefs.units.thick}\nBreite: ${$("width").value} ${prefs.units.width}\nLänge: ${fmt(r.L / lf[prefs.units.length])} ${prefs.units.length}\nUmgerechnet: ${fmt(r.L / lf[prefs.units.secondary])} ${prefs.units.secondary}${$("weld").checked ? `\nNahtmodus: ${$("weldAuto").checked ? "Automatisch" : "Manuell"}\nGesamtnahtlänge: ${fmt(r.wl)} mm\nNahtmaß: ${$("weldSize").value} ${prefs.units.weldSize}\nNahtgewicht: ${fmt(r.weldKg * 1000)} g\nElektrode: ${$("electrodeSummary").textContent}\nVerbrauch: ${$("rodEstimate").textContent}\nAnnahmen: ${$("rodEstimateInfo").textContent}` : ""}`;
  try {
    await navigator.clipboard.writeText(text);
    $("copy").textContent = "✓ Kopiert";
    setTimeout(() => ($("copy").textContent = "▢  Ergebnis kopieren"), 1300);
  } catch {
    window.prompt("Ergebnis kopieren:", text);
  }
};
for (const key of ["electrode", "diameter", "rodLength"])
  $(key).value = prefs[key];
for (const key of ["mass", "thick", "width", "weldLength", "weldSize"]) {
  const f = key === "mass" ? mf : lf;
  $(key).value = String(
    (parse($(key).value) * f[defaults.units[key]]) / f[prefs.units[key]],
  ).replace(".", ",");
}
$("weldSize").value = String(prefs.weldSize / lf[prefs.units.weldSize]).replace(
  ".",
  ",",
);
$("stub").value = prefs.stub;
$("coreDensity").value = String(prefs.coreDensity).replace(".", ",");
syncRecovery();
applyPrefs();
if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
  navigator.serviceWorker.register("./sw.js").catch(() => {});

function updateWeldSymbol(size) {
  const fillet = $("weldType").value === "fillet";
  $("weldSizeLabel").textContent =
    `${fillet ? "Schenkellänge z" : "Quadratseite s"} (${prefs.units.weldSize})`;
  $("weldSizeInfo").textContent = fillet
    ? `z ist die Schenkellänge, nicht das a-Maß.${Number.isFinite(size) && size > 0 ? " Bei z = " + fmt(size) + " mm gilt a ≈ " + fmt(size / Math.SQRT2) + " mm." : ""}`
    : "Vereinfachter Quadratquerschnitt s × s; keine genormte Nahtform.";
  $("weldSymbol").setAttribute(
    "aria-label",
    fillet
      ? "Kehlnaht im Querschnitt: zwei Werkstücke, dreieckige Naht und geneigte Elektrode"
      : "Vereinfachtes Quadratmodell: zwei Werkstücke, quadratische Naht und geneigte Elektrode",
  );
  $("weldSymbol").innerHTML =
    `<rect class="symbol-part" x="12" y="66" width="154" height="16" rx="1"/><rect class="symbol-part" x="31" y="12" width="28" height="54" rx="1"/><path class="symbol-weld" d="${fillet ? "M59 66V42L83 66Z" : "M59 66V42H83V66Z"}"/><path class="symbol-electrode" d="M122 12L83 49"/><path class="symbol-core" d="M118 16L79 53"/><path class="symbol-arc" d="M77 56L73 60"/><text x="103" y="78">${fillet ? "z" : "s"}</text><text x="106" y="96">${fillet ? "Kehlnaht" : "Modell"}</text>`;
}
function recoveryDefault() {
  return $("electrode").value === "120k" ? 120 : 100;
}
function syncRecovery() {
  const key = $("electrode").value;
  $("recovery").value = String(
    prefs.recoveries[key] ?? recoveryDefault(),
  ).replace(".", ",");
}
function updateConsumption(good, weld, weldKg) {
  $("consumption").classList.toggle("hidden", !weld);
  const key = $("electrode").value,
    overridden = Object.hasOwn(prefs.recoveries, key);
  const source =
    "https://www.voestalpine.com/division_stahl/content/download/51677/647045/file/voestalpine_Bohler_Welding_Welding_Consumables_Pipeline_Folder.pdf";
  $("recoverySource").replaceChildren();
  if (overridden)
    $("recoverySource").textContent =
      "Ausbringung: eigene Angabe, keine geprüfte Herstellerfreigabe.";
  else if (key === "120k") {
    $("recoverySource").append(
      "PHOENIX 120 K: 120 % laut älterem Herstellerkatalog, Seite 28. Aktuelles Produktdatenblatt prüfen. ",
    );
    const link = document.createElement("a");
    link.href = source;
    link.textContent = "Quelle";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    $("recoverySource").append(link);
  } else
    $("recoverySource").textContent =
      "Ausbringung: 100 % als unbestätigte Rechenannahme. Für diese Sorte ist kein Kennwert hinterlegt.";
  const recovery = parse($("recovery").value),
    stub = parse($("stub").value),
    coreDensity = parse($("coreDensity").value);
  const estimate = WeldModel.consumption({
    weldKg,
    diameter: Number($("diameter").value),
    rodLength: Number($("rodLength").value),
    stub,
    recovery,
    coreDensity,
  });
  for (const [id, ok] of [
    ["recovery", Number.isFinite(recovery) && recovery > 0],
    [
      "stub",
      Number.isFinite(stub) && stub >= 0 && stub < Number($("rodLength").value),
    ],
    ["coreDensity", Number.isFinite(coreDensity) && coreDensity > 0],
  ])
    $(id).setAttribute("aria-invalid", String(!ok));
  if (!good || !estimate.good) {
    $("rodEstimate").textContent = "—";
    $("rodEstimateInfo").textContent = good
      ? "Verbrauch nicht berechenbar: Ausbringung und Dichte müssen positiv sein; Reststück muss kürzer als der Stab sein."
      : "Verbrauch erst bei gültiger Nahtberechnung.";
    return { good: false };
  }
  $("rodEstimate").textContent =
    `ca. ${fmt(estimate.rods)} Stäbe · ${estimate.prepare.toLocaleString("de-DE")} bereithalten`;
  $("rodEstimateInfo").textContent =
    `${$("diameter").value.replace(".", ",")} × ${$("rodLength").value} mm · insgesamt ca. ${fmt(estimate.burnedMM)} mm Kernstab abschmelzen. Annahmen: ${fmt(recovery)} % Ausbringung, ${fmt(stub)} mm Rest je Stab, Dichte ${fmt(coreDensity)} g/cm³. ${overridden ? "Eigene Ausbringungsangabe." : key === "120k" ? "Ausbringung aus älterem Katalog." : "Ausbringung unbestätigt."} Kein Nachweis der erreichten Nahtgröße.`;
  return estimate;
}
for (const [id, key] of [
  ["stub", "stub"],
  ["coreDensity", "coreDensity"],
])
  $(id).addEventListener("input", () => {
    const n = parse($(id).value);
    if (
      Number.isFinite(n) &&
      (key === "stub" ? n >= 0 && n < Number($("rodLength").value) : n > 0)
    ) {
      prefs[key] = n;
      save();
    }
    calculate();
  });
$("recovery").addEventListener("input", () => {
  const n = parse($("recovery").value);
  if (Number.isFinite(n) && n > 0) {
    prefs.recoveries[$("electrode").value] = n;
    save();
  }
  calculate();
});
$("recoveryReset").onclick = () => {
  delete prefs.recoveries[$("electrode").value];
  syncRecovery();
  save();
  calculate();
};
$("defaultWeldSize").addEventListener("input", () => {
  const n = parse($("defaultWeldSize").value),
    ok = Number.isFinite(n) && n > 0;
  $("defaultWeldSize").setAttribute("aria-invalid", String(!ok));
  if (ok) {
    prefs.weldSize = n;
    $("weldSize").value = String(n / lf[prefs.units.weldSize]).replace(
      ".",
      ",",
    );
    save();
    calculate();
  }
});
let manualWeldLength = { text: "100", unit: "mm" };
$("weldAuto").addEventListener("change", () => {
  if (!$("weldAuto").checked) {
    const n = parse(manualWeldLength.text);
    $("weldLength").value = Number.isFinite(n)
      ? String(
          (n * lf[manualWeldLength.unit]) / lf[prefs.units.weldLength],
        ).replace(".", ",")
      : manualWeldLength.text;
    calculate();
  }
});
$("weldLength").addEventListener("input", () => {
  if (!$("weldAuto").checked)
    manualWeldLength = {
      text: $("weldLength").value,
      unit: prefs.units.weldLength,
    };
});
