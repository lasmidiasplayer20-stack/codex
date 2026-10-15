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
 for(const part of ['03','04','05']){
  const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/?part=${part}`);
  await page.waitForFunction(()=>typeof window.film?.sourceFrame==='function');
  reports.push(await page.evaluate(()=>{
   const distance=(a,b)=>Math.hypot(...Rig.sub(a,b)),checks={};
   if(PART.id==='03'){
    const before=film.sourceFrame(48.75).pair.orange,hit=film.sourceFrame(48.833333),after=film.sourceFrame(49.1).pair.orange;
    checks.roundBeforeImpact=Math.abs(distance(Art.headPoint(before,-Math.PI/2),before.head)-before.r)<1e-8;
    checks.compressionAtImpact=1-distance(Art.headPoint(hit.pair.orange,-Math.PI/2),hit.pair.orange.head)/hit.pair.orange.r;
    checks.compressionAfterImpact=1-distance(Art.headPoint(after,-Math.PI/2),after.head)/after.r;
    const axis=Rig.sub(hit.weapon.a,hit.weapon.b),l=Math.hypot(...axis),d=Rig.sub(hit.pair.orange.head,hit.weapon.b);
    const x=(d[0]*axis[0]+d[1]*axis[1])/l,y=(-d[0]*axis[1]+d[1]*axis[0])/l;
    checks.metalHitsHead=Math.hypot(Math.max(l-47-x,0,x-(l-8)),Math.max(Math.abs(y)-23,0))<=hit.pair.orange.r;
    let maxContactGap=0,maxSupportDrift=0,maxPelvisY=-Infinity,maxHeadY=-Infinity,maxTrunkLean=0,maxOrangePelvisDrift=0,finite=true;
    const start=film.sourceFrame(55.333333),support=start.pair.red.nodes[10],orangeRoot=start.pair.orange.root;
    for(let i=0;i<=30;i++){
     const t=55.333333+i/60,f=film.sourceFrame(t),red=f.pair.red,orange=f.pair.orange;
     const target=Art.headPoint(orange,-Math.PI/4);
     maxContactGap=Math.max(maxContactGap,distance(red.nodes[8],target));
     maxSupportDrift=Math.max(maxSupportDrift,distance(red.nodes[10],support));
     maxPelvisY=Math.max(maxPelvisY,red.root[1]);maxHeadY=Math.max(maxHeadY,red.head[1]);
     maxTrunkLean=Math.max(maxTrunkLean,Math.abs(red.shoulder[0]-red.root[0]));
     maxOrangePelvisDrift=Math.max(maxOrangePelvisDrift,distance(orange.root,orangeRoot));
     finite&&=[...red.nodes,...orange.nodes,target].every(p=>p.every(Number.isFinite));
    }
    Object.assign(checks,{maxContactGap,maxSupportDrift,maxPelvisY,maxHeadY,maxTrunkLean,maxOrangePelvisDrift,finite});
   }else{
    const f=film.sourceFrame(PART.start),p=f.pair.orange;
    checks.deformationPersists=p.headDent.amount===.4&&Math.abs(p.headDent.roll-Math.PI/2)<1e-8;
    const times=PART.id==='04'?[62.083334,67.5,75,81.5]:[81.75,86,91];
    checks.renderFinite=times.every(t=>{film.draw(t-PART.start);return film.sourceFrame(t).pair.orange.nodes.every(p=>p.every(Number.isFinite));});
   }
   return {part:PART.id,checks};
  }));
  await page.close();
 }
 const c=reports[0].checks;
 const passed=c.roundBeforeImpact&&c.compressionAtImpact>.45&&c.compressionAfterImpact>.35&&c.metalHitsHead&&c.finite&&c.maxContactGap<4&&c.maxSupportDrift<1e-6&&c.maxPelvisY<350&&c.maxHeadY<250&&c.maxTrunkLean<2&&c.maxOrangePelvisDrift<.02&&reports.slice(1).every(r=>r.checks.deformationPersists&&r.checks.renderFinite);
 const report={passed,reports,scope:'Intentional post-impact head deformation and standing foot contact from the manually reviewed reference. No source imagery in the renderer.'};
 await mkdir(resolve(root,'.qa'),{recursive:true});await writeFile(resolve(root,'.qa/refino-r4.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));if(!passed)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
