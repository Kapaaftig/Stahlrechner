const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'screenshots','v0.7.0');
fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf'};
let checks=0;
const errors=[];
function check(ok,message){assert.ok(ok,message);checks++;}
const server=http.createServer((req,res)=>{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end();}else{res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);}});
});
(async()=>{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const url = `http://127.0.0.1:${server.address().port}`;
  const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
    const context=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await context.newPage();
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.goto(url+'/');
    check(await page.locator('#panel-rechner').isVisible(),'Rechner standardmäßig sichtbar');
    check(!(await page.locator('#panel-wuchten').isVisible()),'Erklärung getrennt von Eingaben');
    const initial=await page.locator('#primaryCompact').textContent();
    check(initial.trim()==='53,08','Bekannter 500-g-Referenzwert');
    await page.locator('#mass').fill('750,5');
    const result=await page.locator('#primaryCompact').textContent();
    check(result!==initial,'Dezimalkomma löst Berechnung aus');
    await page.locator('#tab-wuchten').click();
    check(await page.locator('#panel-wuchten').isVisible(),'Reiterwechsel öffnet Erklärung');
    check(!(await page.locator('#settingsBtn').isVisible()),'Rechnereinstellungen im Wissen ausgeblendet');
    await page.locator('#tab-rechner').click();
    check((await page.locator('#mass').inputValue())==='750,5','Eingabe bleibt beim Wechsel erhalten');
    check((await page.locator('#primaryCompact').textContent())===result,'Ergebnis bleibt erhalten');
    await page.locator('#weld').check();
    check(await page.locator('#weldAuto').isChecked(),'Automatische Nahtlänge voreingestellt');
    check(Number((await page.locator('#weldLength').inputValue()).replace(',','.'))>0,'Automatische Nahtlänge aktualisiert');
    await page.locator('#expand').click();
    check(await page.locator('#detailSvg').isVisible(),'Bestehende Maßansicht funktioniert');
    await page.locator('#collapse').click();
    await page.locator('#weld').uncheck();
    await page.locator('#tab-rechner').focus();
    await page.keyboard.press('ArrowRight');
    check((await page.locator('#tab-wuchten').getAttribute('aria-selected'))==='true','Reiter per Tastatur bedienbar');
    for(const id of ['method-b','no-run','method-a']){
      await page.locator(`[data-open="${id}"]`).click();
      check(await page.locator('#'+id).getAttribute('open')!==null,'Auswahlkarte öffnet '+id);
    }
    await page.locator('.setup-figure [data-image]').click();
    check(await page.locator('#image-dialog').isVisible(),'Bildvergrößerung öffnet Dialog');
    await page.keyboard.press('Escape');
    check(!(await page.locator('#image-dialog').isVisible()),'Bildvergrößerung mit Escape schließbar');
    await page.locator('#diagram-comparison summary').click();
    await page.locator('#diagram-comparison [data-image]').click();
    check(await page.locator('#dialog-image').evaluate(img=>img.complete&&img.naturalWidth>0),'Zweites Bild wird geladen');
    await page.locator('#image-close').click();
    check((await context.request.get(url+'/Erklaerungsentwurf.pdf')).status()===200,'PDF erreichbar');
    await page.goto(url+'/#no-run');
    check(await page.locator('#no-run').getAttribute('open')!==null,'Direktlink öffnet passenden Abschnitt');
    await page.goto(url+'/#wuchten');
    for(const width of [320,375,390,1440]){
      await page.setViewportSize({width,height:width>500?1000:844});
      for(const dark of [false,true]){
        const current=await page.locator('body').evaluate(el=>el.classList.contains('dark'));
        if(current!==dark)await page.locator('#theme').click();
        for(const tab of ['wuchten','rechner']){
          await page.locator('#tab-'+tab).click();
          check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Kein Überlauf ${width}px ${dark?'dark':'light'} ${tab}`);
          if(tab==='wuchten'||width===390){
            await page.evaluate(()=>window.scrollTo(0,0));
            await page.screenshot({path:path.join(output,`${tab}-${width}-${dark?'dark':'light'}.png`),fullPage:true});
          }
        }
      }
    }
    await page.locator('#tab-wuchten').click();
    const lastTheme=await page.locator('body').evaluate(el=>el.classList.contains('dark'));
    await page.reload();
    check(await page.locator('#panel-wuchten').isVisible(),'Wissensreiter nach Neuladen per URL wiederhergestellt');
    check((await page.locator('body').evaluate(el=>el.classList.contains('dark')))===lastTheme,'Farbschema bleibt nach Neuladen erhalten');
    check(await page.locator('.setup-figure img').evaluate(img=>img.complete&&img.naturalWidth>0),'Aufbauzeichnung geladen');
    check(errors.length===0,'Keine Laufzeit- oder HTTP-Fehler: '+errors.join('; '));
    await context.close();
    const summary={suite:'guide',checks,errors,screenshots:fs.readdirSync(output).filter(f=>f.endsWith('.png')).length,widths:[320,375,390,1440],themes:['light','dark'],transport:'HTTP/127.0.0.1'};
    console.log(JSON.stringify(summary));
  }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1;}).finally(()=>server.close());
