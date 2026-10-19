const { test } = require("node:test");
const assert = require("node:assert/strict");
const { workpiece, consumption } = require("../model.js");
const base = {
  massKg: 1,
  thickness: 10,
  width: 40,
  density: 7.85,
  weld: true,
  auto: true,
  weldLength: 100,
  weldSize: 4,
  model: "fillet",
};
const near = (a, b) =>
  assert.ok(
    Math.abs(a - b) < Math.max(1e-10, Math.abs(b) * 1e-11),
    `${a} != ${b}`,
  );
test("automatic mass balance on length and width, exact transition", () => {
  for (const density of [7.85, 7.9, 2.7])
    for (const thickness of [2, 10, 20])
      for (const model of ["fillet", "rectangle"])
        for (const L of [15, 40, 100, 1000]) {
          const area = (model === "fillet" ? 0.5 : 1) * 16,
            massKg =
              ((L * 40 * thickness + 2 * Math.max(L, 40) * area) * density) /
              1e6;
          const r = workpiece({ ...base, density, thickness, model, massKg });
          assert.ok(r.good);
          near(r.L, L);
          near(r.wl, 2 * Math.max(L, 40));
          near(r.weldKg + (L * 40 * thickness * density) / 1e6, massKg);
          assert.equal(r.axis, L >= 40 ? "length" : "width");
        }
});
test("manual reference, zero, and too long", () => {
  const r = workpiece({ ...base, auto: false, weldLength: 100 });
  assert.ok(r.good);
  near(r.weldKg, 0.00628);
  near(r.L, ((1 - 0.00628) * 1e6) / (10 * 40 * 7.85));
  assert.ok(workpiece({ ...base, auto: false, weldLength: 0 }).good);
  assert.equal(
    workpiece({ ...base, auto: false, weldLength: 100000 }).good,
    false,
  );
});
test("disabled weld ignores invalid weld inputs", () => {
  const r = workpiece({ ...base, weld: false, weldLength: NaN, weldSize: NaN });
  assert.ok(r.good);
  near(r.L, 1e6 / (10 * 40 * 7.85));
  near(r.weldKg, 0);
});
test("invalid parameters and impossible automatic body", () => {
  for (const key of ["massKg", "thickness", "width", "density", "weldSize"])
    for (const v of [NaN, Infinity, 0, -1])
      assert.equal(workpiece({ ...base, [key]: v }).good, false);
  assert.equal(workpiece({ ...base, massKg: 0.000001 }).good, false);
  assert.equal(
    workpiece({ ...base, width: 1e300, thickness: 1e300 }).good,
    false,
  );
});
const electrode = {
  weldKg: 0.02512,
  diameter: 2,
  rodLength: 350,
  stub: 50,
  recovery: 120,
  coreDensity: 7.85,
};
test("consumption uses consumed core mass and excludes stub", () => {
  const r = consumption(electrode);
  assert.ok(r.good);
  const gramsPerRod = (Math.PI * 300 * 7.85) / 1000;
  near(r.rods, 25.12 / (1.2 * gramsPerRod));
  near(r.burnedMM, r.rods * 300);
  assert.equal(r.prepare, 3);
});
test("diameter, length, recovery effects and zero", () => {
  const r = consumption(electrode);
  near(consumption({ ...electrode, diameter: 4 }).rods, r.rods / 4);
  near(consumption({ ...electrode, recovery: 240 }).rods, r.rods / 2);
  near(consumption({ ...electrode, rodLength: 650 }).rods, r.rods / 2);
  const z = consumption({ ...electrode, weldKg: 0 });
  assert.ok(z.good);
  assert.equal(z.prepare, 0);
});
test("bad assumptions do not produce a fake count", () => {
  for (const key of ["diameter", "rodLength", "recovery", "coreDensity"])
    for (const v of [0, -1, NaN, Infinity])
      assert.equal(consumption({ ...electrode, [key]: v }).good, false);
  for (const stub of [-1, 350, 400, NaN])
    assert.equal(consumption({ ...electrode, stub }).good, false);
  assert.equal(consumption({ ...electrode, coreDensity: 1e308 }).good, false);
});
