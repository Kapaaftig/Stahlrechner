// An existing v0.6.1 installation upgrades on the same origin, preserving
// settings, removing only its own old cache, and opening the guide offline.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const legacyWorker = fs.readFileSync(path.join(__dirname, 'fixtures', 'sw-v0.6.1.js'));
let generation = 'old';
let checks = 0;
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (generation === 'old' && (pathname === '/' || pathname === '/index.html')) {
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><meta charset="utf-8"><h1>Installation v0.6.1</h1><script>navigator.serviceWorker.register("./sw.js")</script>');
    return;
  }
  if (pathname === '/sw.js') {
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'no-store');
    res.end(generation === 'old' ? legacyWorker : fs.readFileSync(path.join(root, 'sw.js')));
    return;
  }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  const mime = {'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.webmanifest':'application/manifest+json'};
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});
(async () => {
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = `http://127.0.0.1:${server.address().port}`;
    await page.goto(url);
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      await caches.open('other-app');
      localStorage.setItem('stahlgewicht-prefs', JSON.stringify({ units: { mass: 'kg', thick: 'cm' }, material: '2.7', dark: true, electrode: 'gruen', diameter: '2.0', rodLength: '350' }));
    });
    await page.waitForFunction(() => navigator.serviceWorker.controller);
    assert.ok((await page.evaluate(() => caches.keys())).includes('stahlgewicht-v0.6.1')); checks++;
    generation = 'new';
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      const controlledByUpdate = new Promise(resolve =>
        navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }),
      );
      await registration.update();
      await controlledByUpdate;
    });
    await page.waitForFunction(async () => (await caches.keys()).includes('stahlgewicht-v0.7.0') && !(await caches.keys()).includes('stahlgewicht-v0.6.1'));
    await page.reload();
    assert.equal(await page.locator('h1').textContent(), 'Wuchtgewicht Rechner'); checks++;
    assert.equal(await page.locator('#mass').inputValue(), '0,5'); checks++;
    assert.equal(await page.locator('#thick').inputValue(), '2'); checks++;
    assert.equal(await page.locator('#material').inputValue(), '2.7'); checks++;
    assert.equal(await page.locator('body').evaluate(el => el.classList.contains('dark')), true); checks++;
    await page.locator('#settingsBtn').click();
    assert.equal(await page.locator('#defaultElectrode').inputValue(), 'gruen'); checks++;
    await page.locator('#settingsClose').click();
    const keys = await page.evaluate(() => caches.keys());
    assert.ok(keys.includes('other-app')); checks++;
    assert.ok(!keys.includes('stahlgewicht-v0.6.1')); checks++;
    await context.setOffline(true);
    await page.reload();
    await page.locator('#tab-wuchten').click();
    assert.ok(await page.locator('#panel-wuchten').isVisible()); checks++;
    await page.locator('#diagram-comparison summary').click();
    for (const selector of ['.setup-figure img', '#diagram-comparison img']) {
      await page.locator(selector).evaluate(img => img.decode());
      assert.ok(await page.locator(selector).evaluate(img => img.naturalWidth > 0)); checks++;
    }
    const offlinePDF = await page.evaluate(async () => {
      const response = await fetch('./Erklaerungsentwurf.pdf');
      return { status: response.status, bytes: (await response.arrayBuffer()).byteLength };
    });
    assert.equal(offlinePDF.status, 200); checks++;
    assert.ok(offlinePDF.bytes > 1000); checks++;
    await page.locator('[data-calculator]').click();
    await page.locator('#mass').fill('1');
    assert.equal(await page.locator('#primaryCompact').textContent(), '308,64'); checks++;
    assert.deepEqual(errors, []); checks++;
    console.log(JSON.stringify({ suite: 'upgrade-and-offline', checks, errors }));
    await context.close();
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
