import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {SHOTS,DURATION} from '../src/timeline.js';
import {solveIK,V} from '../src/rig.js';
import {serve,ROOT} from './serve.mjs';
let cases=0;
for(let i=0;i<2000;i++){
 const root=V(Math.sin(i),1.2,0),target=V(Math.sin(i*.7)*2,Math.cos(i*.3),Math.sin(i*.11));
 const {joint,end}=solveIK(root,target,.56,.56,V(0,0,1));
 assert.ok(Math.abs(root.distanceTo(joint)-.56)<1e-7);assert.ok(Math.abs(joint.distanceTo(end)-.56)<1e-7);cases++;
}
assert.equal(SHOTS[0].start,0);assert.equal(SHOTS.at(-1).end,DURATION);
for(let i=0;i<SHOTS.length;i++){assert.ok(SHOTS[i].end>SHOTS[i].start);if(i)assert.ok(Math.abs(SHOTS[i-1].end-SHOTS[i].start)<1e-7);}
const server=await serve(0),browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:640,height:360}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const captures=[0,5,10,15,45,55,65,85,105,125,135,155,175,185,205,245,249,261,285,305,315,345,375,425,465,495,525];
const out=path.join(ROOT,'analysis/review');fs.mkdirSync(out,{recursive:true});const rows=[];
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/?render&width=640&height=360`);await page.waitForFunction(()=>window.ready);
 for(let i=0;i<SHOTS.length;i++){
  const s=SHOTS[i];
  for(const t of [s.start+.001,(s.start+s.end)/2,s.end-.001]){
   const r=await page.evaluate(t=>window.renderAt(t),t);assert.equal(r.shot,i);assert.ok(r.triangles>0||s.set==='black',`Empty rendered shot ${i}: ${s.set}`);rows.push(r);
   const rig=await page.evaluate(()=>window.getRig());for(const c of Object.values(rig).filter(x=>x.visible))for(const p of [...c.arms,...c.feet,c.pelvis,c.chest])assert.ok(p.every(Number.isFinite));
  }
  if(i%25===0)console.log(`Validated ${i+1}/${SHOTS.length} shots`);
 }
 for(const t of captures){await page.evaluate(t=>window.renderAt(t),t);await page.screenshot({path:path.join(out,`${String(t).padStart(3,'0')}.png`)});}
 assert.deepEqual(errors,[]);
 const result={status:'passed',ikCases:cases,contiguousShots:SHOTS.length,coverageSeconds:DURATION,browserFrames:rows.length,visualSamples:captures,browserErrors:errors,limitation:'Technical checks do not establish frame-for-frame fidelity to the reference.'};
 fs.writeFileSync(path.join(ROOT,'analysis/validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();await new Promise(r=>server.close(r));}
