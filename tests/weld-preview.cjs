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
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/preview.html`);
  await page.waitForFunction(()=>Array.from(document.querySelectorAll('iframe')).every(f=>typeof f.contentWindow.calculate==='function'&&f.contentDocument.querySelector('.weld-seam')));
  fs.mkdirSync(path.join(root,'screenshots/weld-preview'),{recursive:true});
  for(const width of [375,1280])for(const scheme of ['light','dark'])for(const preset of ['full','partial','thin','thin-partial']){
   await page.setViewportSize({width,height:900});await page.selectOption('#scheme',scheme);await page.selectOption('#preset',preset);
   for(const id of ['miniFrame','detailFrame']){
    const frame=await page.locator('#'+id).elementHandle();const app=await frame.contentFrame();
    const expected=preset.includes('partial')?.4:1;
    const data=await app.evaluate(()=>{const r=calculate(),seam=document.querySelector('#miniSvg .weld-seam'),g=geometry(r.L,r.b,r.d,{x:16,y:16,w:188,h:110});const a=document.querySelector('#miniSvg .assembly').getBoundingClientRect(),s=document.querySelector('#miniSvg').getBoundingClientRect();return {length:r.L,mass:r.kg,weld:r.weldKg,fraction:Number(seam.dataset.fraction),height:Number(seam.dataset.height),size:Number(seam.dataset.size),bodyHeight:g.h,miniInside:a.left>=s.left-.1&&a.right<=s.right+.1&&a.top>=s.top-.1&&a.bottom<=s.bottom+.1,centered:Math.abs((a.left+a.right-s.left-s.right)/2)<.2,detailCount:document.querySelectorAll('#detailSvg .weld-seam').length,overflow:document.documentElement.scrollWidth>innerWidth}});
    assert.ok(Math.abs(data.length-200)<1e-9);assert.ok(Math.abs(data.fraction-expected)<1e-9);assert.ok(data.height<=data.bodyHeight+1e-9);assert.equal(data.size,preset.startsWith('thin')?2:4);assert.ok(data.miniInside);assert.ok(data.centered);assert.equal(data.detailCount,1);assert.equal(data.overflow,false);checks+=8;
    const expectedWeld=(preset.includes('partial')?160:400)*8*7.85/1e6;assert.ok(Math.abs(data.weld-expectedWeld)<1e-12);checks++;
    // Screenshots are actual application result cards, not generated illustrations.
    await app.locator('.result').screenshot({path:path.join(root,`screenshots/weld-preview/${width}-${scheme}-${preset}-${id==='miniFrame'?'mini':'detail'}.png`)});
   }
  }
  const app=page.frames().find(f=>f!==page.mainFrame());
  await app.evaluate(()=>{document.querySelector('#weld').checked=false;calculate()});assert.equal(await app.locator('.weld-seam').count(),0);checks++;
  await app.evaluate(()=>{document.querySelector('#weld').checked=true;document.querySelector('#weldLength').value='0';calculate()});assert.equal(await app.locator('.weld-seam').count(),0);checks++;
  assert.deepEqual(errors,[]);checks++;
  console.log(`PASS: ${checks} weld-preview assertions; 32 application screenshots; no browser errors.`);
 }finally{await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
