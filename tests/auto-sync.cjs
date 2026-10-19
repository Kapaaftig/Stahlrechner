const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = process.env.APP_ROOT || path.resolve(__dirname, "..");
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
    const page = await browser.newPage({
      viewport: { width: 375, height: 844 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const url = `http://127.0.0.1:${server.address().port}`;
    await page.goto(url);
    await page.evaluate(async () => await navigator.serviceWorker.ready);
    const snapshot = () =>
      page.evaluate(() => ({
        auto: document.querySelector("#weldAuto").checked,
        readonly: document.querySelector("#weldLength").readOnly,
        value: document.querySelector("#weldLength").value,
        L: document.querySelector("#primaryCompact").textContent,
        weldMass: document.querySelector("#weldMass").textContent,
        info: document.querySelector("#weldAutoInfo").textContent,
        fieldsHidden: document
          .querySelector("#weldFields")
          .classList.contains("hidden"),
      }));
    const changeOnly = async (id, checked) =>
      page.evaluate(
        ({ id, checked }) => {
          const el = document.getElementById(id);
          el.checked = checked;
          el.dispatchEvent(new Event("change", { bubbles: true }));
        },
        { id, checked },
      );
    // Deliberately never call calculate() from this test: validate only what the user actually sees.
    await page.check("#weld");
    await page.uncheck("#weldAuto");
    let state = await snapshot();
    assert.equal(state.value, "100");
    checks++;
    await changeOnly("weldAuto", true);
    state = await snapshot();
    assert.equal(
      state.value,
      "120,00",
      "Auto must replace the stale manual 100 mm on change alone",
    );
    assert.ok(state.readonly);
    assert.equal(state.L, "52,28");
    assert.equal(state.weldMass, "7,54 g");
    checks += 4;
    await page.evaluate(() => {
      document.querySelector("#weldLength").value = "100";
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
    });
    state = await snapshot();
    assert.equal(state.value, "120,00");
    assert.ok(state.readonly);
    checks += 2;
    await changeOnly("weldAuto", false);
    await page.fill("#weldLength", "80");
    await changeOnly("weldAuto", true);
    assert.equal((await snapshot()).value, "120,00");
    checks++;
    await changeOnly("weldAuto", false);
    state = await snapshot();
    assert.equal(state.value, "80");
    assert.equal(state.readonly, false);
    checks += 2;
    await page.evaluate(() =>
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      ),
    );
    assert.equal((await snapshot()).value, "80");
    checks++;
    await changeOnly("weldAuto", true);
    await changeOnly("weld", false);
    assert.ok((await snapshot()).fieldsHidden);
    assert.equal((await snapshot()).L, "53,08");
    checks += 2;
    await changeOnly("weld", true);
    state = await snapshot();
    assert.equal(state.fieldsHidden, false);
    assert.equal(state.value, "120,00");
    checks += 2;
    await page.click("#settingsBtn");
    await page.selectOption("#u_weldLength", "cm");
    await page.click("#settingsClose");
    assert.equal((await snapshot()).value, "12,00");
    checks++;
    await page.evaluate(() => {
      document.querySelector("#weldLength").value = "100";
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
    });
    assert.equal((await snapshot()).value, "12,00");
    checks++;
    await page.click("#settingsBtn");
    await page.selectOption("#u_weldLength", "mm");
    await page.click("#settingsClose");
    await page.fill("#mass", "2000");
    state = await snapshot();
    assert.notEqual(state.value, "120,00");
    assert.ok(state.info.includes("entlang der Länge"));
    assert.ok(state.readonly);
    checks += 3;
    // Actual Back/Forward navigation; restored fields must agree with the visible result.
    await page.goto(url + "/preview.html");
    await page.goBack();
    await page.waitForFunction(
      () =>
        document.querySelector("#weldAuto") &&
        document.querySelector("#primaryCompact").textContent !== "53,08",
    );
    state = await snapshot();
    assert.ok(state.readonly);
    assert.notEqual(state.value, "100");
    checks += 2;
    fs.mkdirSync(path.join(root, "screenshots/v0.6.1"), { recursive: true });
    await page.fill("#mass", "500");
    await page.screenshot({
      path: path.join(root, "screenshots/v0.6.1/auto-synchronized.png"),
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    checks++;
    console.log(
      `PASS: ${checks} UI synchronization assertions without calling calculate(); no browser errors.`,
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
