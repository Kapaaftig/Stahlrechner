const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
let checks = 0;
const server = http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(req.url.split("?")[0]));
  if (req.url === "/") file = path.join(root, "index.html");
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403);
    return res.end();
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end();
    }
    res.setHeader(
      "Content-Type",
      file.endsWith(".js")
        ? "application/javascript"
        : file.endsWith(".css")
          ? "text/css"
          : file.endsWith(".webmanifest")
            ? "application/manifest+json"
            : file.endsWith(".svg")
              ? "image/svg+xml"
              : file.endsWith(".png")
                ? "image/png"
                : "text/html",
    );
    res.end(data);
  });
});
(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(url);
    // Branding: theme-specific weight symbol and correctly sized launcher assets.
    for(const dark of [false,true]){
      const style=await page.evaluate(d=>{prefs.dark=d;applyPrefs();const b=document.querySelector('.weight-body'),t=document.querySelector('.weight-label');return {fill:getComputedStyle(b).fill,stroke:getComputedStyle(b).stroke,text:getComputedStyle(t).fill}},dark);
      assert.equal(style.fill==='none',dark);assert.equal(style.stroke==='none',!dark);assert.notEqual(style.text,'none');checks+=3;
    }
    for(const [file,size] of [['icon-192.png',192],['icon-512.png',512],['apple-touch-icon.png',180]]){
      const dimensions=await page.evaluate(async file=>{const image=new Image();image.src=file;await image.decode();return [image.naturalWidth,image.naturalHeight]},file);
      assert.deepEqual(dimensions,[size,size]);checks++;
    }
    assert.equal(await page.locator('link[rel="icon"]').getAttribute('href'),'icon.svg');checks++;
    await page.evaluate(()=>{prefs.dark=false;applyPrefs()});
    const select = async (id, value) =>
      page.locator(id).evaluate((e, v) => {
        e.value = v;
        e.dispatchEvent(new Event("change", { bubbles: true }));
        e.dispatchEvent(new Event("input", { bubbles: true }));
      }, value);
    const calc = () => page.evaluate(() => calculate());
    const near = (a, b) => {
      assert.ok(Math.abs(a - b) <= Math.abs(b) * 1e-10 + 1e-12, `${a} ≠ ${b}`);
      checks++;
    };
    const fill = async (id, v) => page.locator("#" + id).fill(String(v));
    // Reference formula, all materials and weight/length units.
    near((await calc()).L, 500 / 9.42);
    for (const density of ["7.85", "7.9", "2.7"]) {
      await select("#material", density);
      await fill("mass", "1000");
      await fill("thick", "10");
      await fill("width", "100");
      near((await calc()).L, 1000 / Number(density));
    }
    await select("#material", "7.85");
    for (const unit of ["mg", "kg", "t", "g"]) {
      const before = await calc();
      await select("#u_mass", unit);
      near((await calc()).kg, before.kg);
    }
    for (const field of ["thick", "width", "weldLength", "weldSize"])
      for (const unit of ["m", "cm", "mm"]) {
        const before = await calc();
        await select("#u_" + field, unit);
        near((await calc()).L, before.L);
      }
    for (const unit of ["m", "cm", "mm"]) {
      await select("#u_length", unit);
      assert.equal(await page.textContent("#primaryUnitCompact"), unit);
      checks++;
    }
    for (const value of ["7,85", "7.85", " 7,85 ", ".785e1"]) {
      await fill("mass", value);
      near((await calc()).kg, 0.00785);
    }
    for (const value of [
      "0",
      "-1",
      "",
      "abc",
      "1,2.3",
      "1 2",
      "Infinity",
      "1e309",
      "1e-999",
    ]) {
      await fill("mass", value);
      assert.equal((await calc()).good, false, value);
      checks++;
    }
    await fill("mass", "1000");
    for (const id of ["thick", "width"]) {
      for (const value of ["0", "-2", "", "1e-300", "1e300"]) {
        await fill(id, value);
        if (["1e-300", "1e300"].includes(value)) {
          await fill(id === "width" ? "thick" : "width", value);
        }
        assert.equal((await calc()).good, false, id + value);
        checks++;
      }
      await fill("thick", "10");
      await fill("width", "100");
    }
    await page.check("#weld");await page.uncheck("#weldAuto");
    await fill("weldLength", "100");
    await fill("weldSize", "4");
    near((await calc()).weldKg, 0.00628);
    near((await calc()).L, ((1 - 0.00628) * 1e6) / (10 * 100 * 7.85));
    await select("#weldType", "rectangle");
    near((await calc()).weldKg, 0.01256);
    await fill("mass", "1");
    assert.equal((await calc()).good, false);
    checks++;
    await page.uncheck("#weld");
    assert.equal((await calc()).good, true);
    checks++;
    await fill("mass", "500");
    await page.check("#weld");await page.uncheck("#weldAuto");
    for (const [id, value] of [
      ["weldLength", "-1"],
      ["weldLength", ""],
      ["weldSize", "0"],
      ["weldSize", "-1"],
      ["weldSize", ""],
    ]) {
      await fill("weldLength", "100");
      await fill("weldSize", "4");
      await fill(id, value);
      assert.equal((await calc()).good, false);
      checks++;
    }
    await fill("weldLength", "100");await fill("weldSize", "1e300");
    assert.equal((await calc()).good,false);assert.equal(await page.textContent('#weldMass'),'—');checks+=2;
    await fill("weldLength", "0");
    await fill("weldSize", "4");
    assert.equal((await calc()).good, true);
    near((await calc()).weldKg, 0);
    checks++;
    await fill("weldLength", "100");
    await page.uncheck("#weld");
    await fill("mass", "0.000001");
    assert.ok(!(await page.textContent("#primaryCompact")).includes("0,00"));
    checks++;
    await fill("mass", "500");
    // Standard electrode changes persist; theme must not reset session electrode.
    await select("#defaultElectrode", "gruen");
    await select("#defaultDiameter", "2.5");
    await select("#defaultRodLength", "450");
    await select("#electrode", "blau");
    await page.click("#theme");
    assert.equal(await page.inputValue("#electrode"), "blau");
    checks++;
    await page.reload();
    assert.equal(await page.inputValue("#electrode"), "gruen");
    assert.equal(await page.inputValue("#diameter"), "2.5");
    assert.equal(await page.inputValue("#rodLength"), "450");
    assert.equal(await page.inputValue("#material"), "7.85");
    assert.ok(
      await page.locator("body").evaluate((e) => e.classList.contains("dark")),
    );
    checks += 5;
    await page.click("#expand");
    assert.ok(await page.locator("#detail").isVisible());
    await page.click("#collapse");
    assert.ok(await page.locator("#compact").isVisible());
    checks += 2;
    // Geometry bounds and centered mini for thin, long, wide and thick blocks.
    for (const dims of [
      [60, 60, 20],
      [1e6, 1, 1],
      [1, 1e6, 1],
      [1, 1, 1e6],
    ]) {
      const box = await page.evaluate((d) => {
        draw("miniSvg", ...d, false);
        const b = document.querySelector("#miniSvg .shape").getBBox();
        return { x: b.x, y: b.y, w: b.width, h: b.height };
      }, dims);
      assert.ok(Math.abs(box.x + box.w / 2 - 110) < 0.02);
      assert.ok(Math.abs(box.y + box.h / 2 - 71) < 0.02);
      checks += 2;
      assert.ok(
        box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.w <= 220 &&
          box.y + box.h <= 145,
      );
      checks++;
    }
    await page.evaluate(() => calculate());
    for (const width of [320, 375, 390, 1280])
      for (const dark of [false, true]) {
        await page.setViewportSize({ width, height: width < 500 ? 844 : 900 });
        await page.evaluate((d) => {
          prefs.dark = d;
          applyPrefs();
        }, dark);
        await page.click("#expand");
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        );
        checks++;
        await page.screenshot({
          path: path.join(
            root,
            `screenshots/${width}-${dark ? "dark" : "light"}.png`,
          ),
          fullPage: true,
        });
        await page.click("#collapse");
      }
    // Real settings controls, reset, reload of units/material, clipboard and custom text safety.
    await page.click("#settingsBtn");
    assert.ok(await page.locator("#settings").isVisible());
    checks++;
    await page.selectOption("#u_mass", "kg");
    await page.selectOption("#u_thick", "cm");
    await page.selectOption("#u_secondary", "m");
    await page.click("#settingsClose");
    await page.selectOption("#material", "2.7");
    await page.reload();
    assert.equal(await page.inputValue("#material"), "2.7");
    assert.equal(await page.inputValue("#mass"), "0,5");
    assert.equal(await page.inputValue("#thick"), "2");
    checks += 3;
    await page.click("#settingsBtn");
    await page.click("#reset");
    assert.equal(await page.inputValue("#defaultDiameter"), "2.0");
    assert.equal(await page.inputValue("#u_mass"), "g");
    checks += 2;
    await page.click("#settingsClose");
    assert.equal(await page.inputValue("#mass"), "500");
    checks++;
    await page.check("#weld");await page.uncheck("#weldAuto");
    await page.click("#electrodeToggle");
    assert.ok(await page.locator("#electrodeFields").isVisible());
    checks++;
    await page.selectOption("#electrode", "custom");
    await fill("customElectrode", "<img src=x onerror=alert(1)>");
    assert.equal(await page.locator("#electrodeSummary img").count(), 0);
    await fill("customElectrode", "Eigene Elektrode (Beispiel)");
    checks++;
    await page.click("#electrodeToggle");
    await page.uncheck("#weld");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.click("#copy");
    assert.ok(
      (await page.evaluate(() => navigator.clipboard.readText())).includes(
        "Wuchtgewicht Rechner v0.7.0",
      ),
    );
    checks++;
    // All dimension text stays within the viewBox, even for extreme dimensions.
    await page.click("#expand");
    for (const dims of [
      [60, 60, 20],
      [1e10, 1, 1],
      [1, 1e10, 1],
      [1, 1, 1e10],
    ]) {
      const fits = await page.evaluate((d) => {
        draw("detailSvg", ...d, true);
        const svg = document.querySelector("#detailSvg"),
          b = svg.getBBox(),
          v = svg.viewBox.baseVal;
        return (
          b.x >= v.x &&
          b.y >= v.y &&
          b.x + b.width <= v.x + v.width &&
          b.y + b.height <= v.y + v.height
        );
      }, dims);
      assert.ok(fits);
      checks++;
    }
    await page.click("#collapse");
    // Additional review artifacts for compact, weld, settings and extreme geometry.
    await page.setViewportSize({ width: 320, height: 844 });
    await page.screenshot({
      path: path.join(root, "screenshots/320-compact.png"),
      fullPage: true,
    });
    await page.check("#weld");await page.uncheck("#weldAuto");
    await page.click("#electrodeToggle");
    await page.screenshot({
      path: path.join(root, "screenshots/320-weld.png"),
      fullPage: true,
    });
    await page.click("#settingsBtn");
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    checks++;
    await page.screenshot({
      path: path.join(root, "screenshots/320-settings.png"),
      fullPage: true,
    });
    await page.click("#settingsClose");
    await page.uncheck("#weld");
    await fill("mass", "1000000");
    await fill("thick", "1");
    await fill("width", "1");
    await page.click("#expand");
    await page.screenshot({
      path: path.join(root, "screenshots/320-extreme.png"),
      fullPage: true,
    });
    await page.click("#collapse");
    // Storage schema corruption and denied storage must not stop app.
    for (const data of [
      "null",
      "{bad",
      '{"units":{"mass":"bad"},"diameter":"bad","material":"bad","dark":"yes"}',
    ]) {
      await page.evaluate(
        (v) => localStorage.setItem("stahlgewicht-prefs", v),
        data,
      );
      await page.reload();
      assert.ok((await calc()).good);
      checks++;
    }
    const denied = await browser.newContext();
    await denied.addInitScript(() => {
      Object.defineProperty(window, "localStorage", {
        get() {
          throw new Error("denied");
        },
      });
    });
    const deniedPage = await denied.newPage();
    await deniedPage.goto(url);
    await deniedPage.click("#theme");
    assert.ok(await deniedPage.textContent("#storageNotice"));
    checks++;
    await denied.close();
    // Offline shell with service worker, scoped cache cleanup.
    await page.evaluate(async () => {
      await caches.open("other-app");
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    assert.ok(
      await page.evaluate(async () =>
        (await caches.keys()).includes("other-app"),
      ),
    );
    checks++;
    await context.setOffline(true);
    await page.reload();
    assert.ok((await calc()).good);
    checks++;
    assert.ok(await page.evaluate(async()=>{const response=await fetch('apple-touch-icon.png');return response.ok}));checks++;
    await context.setOffline(false);
    assert.deepEqual(errors, []);
    checks++;
    console.log(
      `PASS: ${checks} assertions; 12 screenshots; no browser errors.`,
    );
  } finally {
    await browser.close();
    server.close();
  }
})().catch((e) => {
  console.error(e);
  server.close();
  process.exitCode = 1;
});
