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
  $("weldLengthLabel").textContent = `Nahtlänge (${prefs.units.weldLength})`;
  $("weldSizeLabel").textContent = `Nahtmaß (${prefs.units.weldSize})`;
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
function draw(svgId, L, B, D, detail) {
  const box = detail
      ? { x: 88, y: 72, w: 170, h: 112 }
      : { x: 16, y: 16, w: 188, h: 110 },
    g = geometry(L, B, D, box),
    { A, B: Q, C, D: S, h } = g;
  const shape = `<g class="shape"><polygon points="${poly([A, S, add(S, [0, h]), add(A, [0, h])])}" fill="#72859a"/><polygon points="${poly([A, Q, add(Q, [0, h]), add(A, [0, h])])}" fill="#94a9bd"/><polygon points="${poly([A, Q, C, S])}" fill="#c5d1de"/></g>`;
  if (!detail) {
    $(svgId).innerHTML = shape;
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
    shape +
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
    wl = parse($("weldLength").value) * lf[prefs.units.weldLength],
    ws = parse($("weldSize").value) * lf[prefs.units.weldSize],
    density = Number($("material").value),
    weld = $("weld").checked;
  const validWeld =
    !weld || (Number.isFinite(wl) && wl >= 0 && Number.isFinite(ws) && ws > 0);
  const weldKg =
    weld && validWeld
      ? (($("weldType").value === "fillet" ? 0.5 : 1) *
          wl *
          ws *
          ws *
          density) /
        1e6
      : 0;
  let good =
    [kg, d, b].every((v) => Number.isFinite(v) && v > 0) &&
    validWeld &&
    kg > weldKg;
  let L = good ? ((kg - weldKg) * 1e6) / (d * b * density) : 0;
  good =
    good &&
    Number.isFinite(L) &&
    L > 0 &&
    Number.isFinite(weldKg * 1000) &&
    (!weld || wl === 0 || weldKg > 0);
  if (!good) L = 0;
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
    : validWeld && weld && kg <= weldKg
      ? "Das Nahtgewicht muss kleiner als das Gesamtgewicht sein."
      : "Bitte positive, endliche Maße und Gewicht eingeben; Nahtlänge darf null sein.";
  for (const [id, ok] of [
    ["mass", kg > 0 && Number.isFinite(kg)],
    ["thick", d > 0 && Number.isFinite(d)],
    ["width", b > 0 && Number.isFinite(b)],
    ["weldLength", !weld || (Number.isFinite(wl) && wl >= 0)],
    ["weldSize", !weld || (Number.isFinite(ws) && ws > 0)],
  ])
    $(id).setAttribute("aria-invalid", String(!ok));
  $("status").className = good ? "status" : "status error";
  $("copy").disabled = !good;
  $("electrodeSummary").textContent =
    `Ø ${$("diameter").value.replace(".", ",")} mm · ${$("electrode").value === "custom" ? $("customElectrode").value || "Eigene Sorte" : electrodeNames[$("electrode").value]}`;
  $("customWrap").classList.toggle("hidden", $("electrode").value !== "custom");
  draw("miniSvg", good ? L : 60, good ? b : 60, good ? d : 20, false);
  draw("detailSvg", good ? L : 60, good ? b : 60, good ? d : 20, true);
  return { good, L, b, d, kg, weldKg };
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
  save();
  applyPrefs();
};
$("copy").onclick = async () => {
  const r = calculate();
  if (!r.good) return;
  const text = `Stahlgewicht Rechner v0.5.2\nMaterial: ${$("material").selectedOptions[0].textContent}\nGewicht: ${$("mass").value} ${prefs.units.mass}\nDicke: ${$("thick").value} ${prefs.units.thick}\nBreite: ${$("width").value} ${prefs.units.width}\nLänge: ${fmt(r.L / lf[prefs.units.length])} ${prefs.units.length}\nUmgerechnet: ${fmt(r.L / lf[prefs.units.secondary])} ${prefs.units.secondary}${$("weld").checked ? `\nNahtgewicht: ${fmt(r.weldKg * 1000)} g\nElektrode: ${$("electrodeSummary").textContent}` : ""}`;
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
applyPrefs();
if ("serviceWorker" in navigator && location.protocol.startsWith("http"))
  navigator.serviceWorker.register("./sw.js").catch(() => {});
