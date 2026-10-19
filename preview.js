"use strict";
function applyExample(frame, expanded) {
  const w = frame.contentWindow;
  if (!w || typeof w.calculate !== "function") return;
  const preset = document.querySelector("#preset").value;
  const thin = preset.startsWith("thin"),
    partial = preset.includes("partial");
  const L = 200,
    B = 60,
    D = thin ? 2 : 12,
    size = 4,
    totalLength = partial ? 160 : 400;
  const mass = (7.85 * (L * B * D + (totalLength * size * size) / 2)) / 1000;
  w.eval("prefs = structuredClone(defaults)");
  w.eval(`prefs.dark = ${document.querySelector("#scheme").value === "dark"}`);
  w.applyPrefs();
  w.document.getElementById("weldAuto").checked = false;
  const set = (id, value) => {
    const el = w.document.getElementById(id);
    el.value = String(value);
    el.dispatchEvent(new w.Event("input", { bubbles: true }));
  };
  set("mass", mass);
  set("thick", D);
  set("width", B);
  set("weldType", "fillet");
  set("weldLength", totalLength);
  set("weldSize", size);
  const checkbox = w.document.getElementById("weld");
  checkbox.checked = true;
  checkbox.dispatchEvent(new w.Event("input", { bubbles: true }));
  if (expanded) w.document.getElementById("expand").click();
  else w.document.getElementById("collapse").click();
  w.calculate();
}
const frames = [
  document.querySelector("#miniFrame"),
  document.querySelector("#detailFrame"),
];
frames.forEach((frame, index) =>
  frame.addEventListener("load", () => applyExample(frame, index === 1)),
);
for (const id of ["preset", "scheme"])
  document
    .querySelector("#" + id)
    .addEventListener("change", () =>
      frames.forEach((frame, index) => applyExample(frame, index === 1)),
    );
