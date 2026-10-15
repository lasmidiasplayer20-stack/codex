import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {once} from 'node:events';
const root=resolve(import.meta.dirname,'..');
const server=createServer(async(req,res)=>{try{
 const path=resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));
 if(!path.startsWith(root+'/'))throw Error('path');
 res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.html':'text/html'})[extname(path)]||'application/octet-stream');
 res.end(await readFile(path));
}catch{res.writeHead(404);res.end();}});
server.listen(0,'127.0.0.1');await once(server,'listening');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const reports=[];
try{
 for(const part of ['03','04']){
  const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/?part=${part}`);
  await page.waitForFunction(()=>typeof window.film?.sourceFrame==='function');
  reports.push(await page.evaluate(()=>{
   const length=p=>Math.hypot(...p),checks={};
   if(PART.id==='03'){
    const f=film.sourceFrame(48.5),axis=Rig.sub(f.weapon.a,f.weapon.b),len=length(axis),target=Rig.sub(f.weapon.a,axis.map(x=>x/len*24));
    checks.blockHandDistance=length(Rig.sub(f.pair.orange.nodes[4],target));
    checks.blockReachError=f.pair.orange.errors[0];
    checks.guardHandHigherThanShoulder=film.sourceFrame(51).pair.orange.nodes[4][1]<film.sourceFrame(51).pair.orange.shoulder[1];
   }else{
    const f=film.sourceFrame(67.5);
    checks.pommelDistance=length(Rig.sub(f.weapon.b,f.pair.orange.head));
    checks.pommelHitsHead=checks.pommelDistance<=f.pair.orange.r;
    checks.metalHeadAbovePommel=f.weapon.a[1]<f.weapon.b[1];
    checks.cameraAt675=film.sourceFrame(67.5).camera.scale;
    checks.cameraAt678=film.sourceFrame(67.8).camera.scale;
    checks.overheadPreparations=[72.5,73.125,73.5].map(t=>{
     const p=film.sourceFrame(t).pair.red;return {t,handsAboveHead:p.nodes[4][1]<p.head[1]&&p.nodes[6][1]<p.head[1]};
    });
   }
   return {part:PART.id,checks};
  }));
  await page.close();
 }
 const a=reports[0].checks,b=reports[1].checks;
 const passed=a.blockHandDistance<.001&&a.blockReachError<.001&&a.guardHandHigherThanShoulder&&b.pommelHitsHead&&b.metalHeadAbovePommel&&Math.abs(b.cameraAt675-1.11)<.001&&Math.abs(b.cameraAt678-1.73)<.001&&b.overheadPreparations.every(p=>p.handsAboveHead);
 const report={passed,reports,scope:'Directed contacts, camera timing and visible preparation poses compared with manually reviewed reference sequences; not pixel equivalence.'};
 await mkdir(resolve(root,'.qa'),{recursive:true});await writeFile(resolve(root,'.qa/refino-r3.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));if(!passed)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
