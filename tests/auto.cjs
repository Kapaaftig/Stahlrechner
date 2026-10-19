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
  const browser = await chromium.launch({
    executablePath:
      process.env.CHROMIUM_PATH ||
      (fs.existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}`);
    assert.ok(await page.isChecked("#weldAuto"));
    checks++;
    await page.check("#weld");
    assert.ok(await page.locator("#weldLength").evaluate((e) => e.readOnly));
    checks++;
    const fill = async (id, v) => page.locator("#" + id).fill(String(v));
    await fill("mass", 1000);
    await fill("thick", 10);
    await fill("width", 40);
    let r = await page.evaluate(() => calculate());
    assert.ok(r.good);
    assert.equal(r.axis, "length");
    assert.ok(Math.abs(r.wl - 2 * r.L) < 1e-9);
    assert.ok(r.estimate.good);
    checks += 4;
    await page.uncheck("#weldAuto");
    await fill("weldLength", "80");
    await page.check("#weldAuto");
    await page.click("#settingsBtn");
    await page.selectOption("#u_weldLength", "cm");
    await page.click("#settingsClose");
    await page.uncheck("#weldAuto");
    assert.equal(await page.inputValue("#weldLength"), "8");
    checks++;
    await page.check("#weldAuto");
    await page.reload();
    assert.ok(await page.isChecked("#weldAuto"));
    await page.check("#weld");
    checks++;
    // Editable assumptions, per-sort recovery, persistence, and error isolation.
    await page.locator("#estimateDetails summary").click();
    assert.equal(await page.inputValue("#recovery"), "120");
    checks++;
    await fill("recovery", "110");
    await page.reload();
    await page.check("#weld");
    await page.locator("#estimateDetails summary").click();
    assert.equal(await page.inputValue("#recovery"), "110");
    checks++;
    await page.click("#electrodeToggle");
    await page.selectOption("#electrode", "gruen");
    assert.equal(await page.inputValue("#recovery"), "100");
    assert.ok(
      (await page.textContent("#recoverySource")).includes("unbestätigte"),
    );
    checks += 2;
    await page.selectOption("#electrode", "120k");
    assert.equal(await page.inputValue("#recovery"), "110");
    await page.click("#recoveryReset");
    assert.equal(await page.inputValue("#recovery"), "120");
    checks += 2;
    await fill("stub", "350");
    r = await page.evaluate(() => calculate());
    assert.ok(r.good);
    assert.equal(r.estimate.good, false);
    checks += 2;
    await fill("stub", "50");
    await page.click("#settingsBtn");
    await fill("defaultWeldSize", "3,5");
    await page.click("#settingsClose");
    await page.reload();
    await page.check("#weld");
    assert.equal(await page.inputValue("#weldSize"), "3,5");
    checks++;
    await fill("weldSize", "4");
    await page.selectOption("#weldType", "rectangle");
    assert.ok(
      (await page.getAttribute("#weldSymbol", "aria-label")).includes(
        "Quadrat",
      ),
    );
    checks++;
    await page.selectOption("#weldType", "fillet");
    assert.ok((await page.textContent("#weldSizeInfo")).includes("2,83"));
    checks++;
    fs.mkdirSync(path.join(root, "screenshots/v0.6.0"), { recursive: true });
    for (const width of [320, 375, 1280])
      for (const dark of [false, true])
        for (const preset of ["auto-length", "auto-width", "manual", "thin"]) {
          await page.setViewportSize({ width, height: 900 });
          await page.evaluate(
            ({ dark, preset }) => {
              prefs.dark = dark;
              applyPrefs();
              const set = (id, v) =>
                (document.getElementById(id).value = String(v));
              document.getElementById("weld").checked = true;
              document.getElementById("weldFields").classList.remove("hidden");
              document.getElementById("weldAuto").checked = preset !== "manual";
              set("weldLength", 8);
              set("weldSize", 4);
              set("thick", preset === "thin" ? 2 : 10);
              set("width", preset === "auto-width" ? 120 : 40);
              set("mass", preset === "auto-width" ? 500 : 1000);
              calculate();
            },
            { dark, preset },
          );
          r = await page.evaluate(() => calculate());
          assert.ok(r.good, preset);
          assert.ok(r.estimate.good);
          assert.equal(r.axis, preset === "auto-width" ? "width" : "length");
          checks += 3;
          if (preset === "manual") {
            const f = await page
              .locator("#miniSvg .weld-seam")
              .getAttribute("data-fraction");
            assert.ok(Math.abs(Number(f) - r.wl / 2 / r.L) < 1e-9);
            checks++;
          }
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
          checks++;
          await page.screenshot({
            path: path.join(
              root,
              `screenshots/v0.6.0/${width}-${dark ? "dark" : "light"}-${preset}.png`,
            ),
            fullPage: true,
          });
        }
    await page.click("#expand");
    assert.ok(await page.locator("#detailSvg .weld-seam").isVisible());
    checks++;
    await page.selectOption("#weldType", "rectangle");
    await page.screenshot({
      path: path.join(root, "screenshots/v0.6.0/desktop-square-detail.png"),
      fullPage: true,
    });
    await page.uncheck("#weldAuto");
    await fill("weldLength", "100000");
    assert.equal((await page.evaluate(() => calculate())).good, false);
    checks++;
    assert.deepEqual(errors, []);
    checks++;
    console.log(
      `PASS: ${checks} auto/consumption UI assertions; 25 screenshots; no browser errors.`,
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
