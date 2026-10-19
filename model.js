"use strict";
// Pure models: kg, mm, density in g/cm³. No DOM and no product compatibility claims.
(function (root) {
  function workpiece(p) {
    const {
      massKg: m,
      thickness: d,
      width: b,
      density: rho,
      weld,
      auto,
      weldLength: manual,
      weldSize: z,
      model,
    } = p;
    const fail = (error) => ({
      good: false,
      L: 0,
      weldKg: 0,
      wl: 0,
      axis: "length",
      error,
    });
    if (![m, d, b, rho].every((v) => Number.isFinite(v) && v > 0))
      return fail("input");
    if (
      weld &&
      (!Number.isFinite(z) ||
        z <= 0 ||
        (!auto && (!Number.isFinite(manual) || manual < 0)))
    )
      return fail("weld");
    const area = weld ? (model === "fillet" ? 0.5 : 1) * z * z : 0;
    const volume = (m * 1e6) / rho,
      base = b * d;
    let L,
      wl = 0;
    if (weld && auto) {
      const alongLength = volume / (base + 2 * area);
      L = alongLength >= b ? alongLength : (volume - 2 * area * b) / base;
      wl = 2 * Math.max(L, b);
    } else {
      wl = weld ? manual : 0;
      L = (volume - area * wl) / base;
    }
    const weldKg = (area * wl * rho) / 1e6,
      axis = L >= b - 1e-12 * Math.max(L, b) ? "length" : "width";
    if (
      ![volume, base, area, L, weldKg * 1000, wl].every(Number.isFinite) ||
      L <= 0 ||
      base <= 0 ||
      (weld && z > 0 && area === 0) ||
      (weld && wl > 0 && weldKg === 0)
    )
      return fail("range");
    if (weld && wl > 2 * Math.max(L, b) * (1 + 1e-12)) return fail("tooLong");
    return { good: true, L, weldKg, wl, axis, area, error: null };
  }
  function consumption({
    weldKg,
    diameter,
    rodLength,
    stub,
    recovery,
    coreDensity,
  }) {
    if (
      !Number.isFinite(weldKg) ||
      weldKg < 0 ||
      ![diameter, rodLength, recovery, coreDensity].every(
        (v) => Number.isFinite(v) && v > 0,
      ) ||
      !Number.isFinite(stub) ||
      stub < 0 ||
      stub >= rodLength
    )
      return { good: false };
    const gramsPerMM =
      (((Math.PI * diameter * diameter) / 4) * coreDensity) / 1000;
    const burnedMM = (weldKg * 1000) / ((gramsPerMM * recovery) / 100);
    const rods = burnedMM / (rodLength - stub);
    if (
      !Number.isFinite(gramsPerMM) ||
      gramsPerMM <= 0 ||
      (weldKg > 0 && (burnedMM <= 0 || rods <= 0)) ||
      ![burnedMM, rods].every(Number.isFinite)
    )
      return { good: false };
    return { good: true, burnedMM, rods, prepare: Math.ceil(rods) };
  }
  root.WeldModel = { workpiece, consumption };
  if (typeof module !== "undefined" && module.exports)
    module.exports = root.WeldModel;
})(typeof globalThis !== "undefined" ? globalThis : this);
