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
 for(const part of ['04','05']){
  const page=await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}/?part=${part}`);
  await page.waitForFunction(()=>typeof window.film?.sourceFrame==='function');
  reports.push(await page.evaluate(()=>{
   let maxTrunkShortening=0,maxBoneError=0,finite=true,gripError=0;
   const count=Math.ceil(film.duration*60-1e-4),hits=[];
   let firstSweep=null;
   const contact=f=>{
    const o=f.weapon,h=f.pair.orange,axis=Rig.sub(o.a,o.b),length=Math.hypot(...axis),d=Rig.sub(h.head,o.b);
    const x=(d[0]*axis[0]+d[1]*axis[1])/length,y=(-d[0]*axis[1]+d[1]*axis[0])/length;
    const distance=Math.hypot(Math.max(length-47-x,0,x-(length-8)),Math.max(Math.abs(y)-23,0));
    return {metalReachesHead:distance<=h.r,distance};
   };
   for(let i=0;i<count;i++){
    const t=PART.start+i/60,f=film.sourceFrame(t),p=f.pair.red;
    const trunk=Math.hypot(...Rig.sub(p.nodes[1],p.nodes[0]));
    maxTrunkShortening=Math.max(maxTrunkShortening,1-trunk/p.profile.torso);
    for(const actor of Object.values(f.pair))if(actor){
     finite&&=actor.nodes.every(n=>n.every(Number.isFinite));
     for(const [a,b,length]of [[0,1,actor.profile.torso],[1,2,actor.profile.neck],[1,3,actor.profile.arm[0]],[3,4,actor.profile.arm[1]],[1,5,actor.profile.arm[0]],[5,6,actor.profile.arm[1]],[0,7,actor.profile.leg[0]],[7,8,actor.profile.leg[1]],[0,9,actor.profile.leg[0]],[9,10,actor.profile.leg[1]]]){
      maxBoneError=Math.max(maxBoneError,Math.abs(Math.hypot(...Rig.sub(actor.nodes[a],actor.nodes[b]))-length));
     }
    }
    if(f.weapon)gripError=Math.max(gripError,Math.hypot(...Rig.sub(f.weapon.grip,p.nodes[4])));
    if(PART.id==='04'&&t>=65.7&&t<67.5){const c=contact(f);if(!firstSweep||c.distance<firstSweep.distance)firstSweep={t,...c};}
   }
   if(PART.id==='04')for(const t of [72.583333,73.583333]){
    hits.push({t,...contact(film.sourceFrame(t))});
   }
   // An injury may mark the rim, but must not fill the hollow centre.
   const f=film.sourceFrame(PART.id==='04'?75:86),p=f.pair.orange,{canvas,ctx}=Art;
   canvas.width=256;canvas.height=256;ctx.reset();ctx.fillStyle='#062031';ctx.fillRect(0,0,256,256);
   ctx.translate(128-p.head[0]*2,128-p.head[1]*2);ctx.scale(2,2);
   const before=ctx.getImageData(0,0,256,256);Damage.draw(PART.id==='04'?75:86,f);
   const after=ctx.getImageData(0,0,256,256);let innerPixelsChanged=0;
   for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(Math.hypot(x+.5-128,y+.5-128)<p.r*2*.6){
    const i=(y*256+x)*4;if([0,1,2].some(j=>before.data[i+j]!==after.data[i+j]))innerPixelsChanged++;
   }
   return {part:PART.id,frames:count,maxTrunkShortening,maxBoneError,finite,gripError,hits,firstSweep,innerPixelsChanged};
  }));
  await page.close();
 }
 const passed=reports.every(r=>r.finite&&r.maxTrunkShortening<1e-8&&r.maxBoneError<1e-6&&r.gripError<1e-6&&r.innerPixelsChanged===0&&r.hits.every(h=>h.metalReachesHead));
 const result={passed,scope:'Head silhouette, straight red trunk, limb lengths, grips and the two existing late impacts; not reference fidelity.',reports,referenceComparison:'Pending original MP4; missing fight beats and first-sweep intent are not certified.'};
 await mkdir(resolve(root,'.qa'),{recursive:true});await writeFile(resolve(root,'.qa/refino-r2.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify(result));if(!passed)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
