import {open,root} from '../scripts/browser.mjs';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await open();
try{
 const url=new URL('/assistir.html',b.page.url()).href;
 const range=await b.page.request.get(new URL('/exports/animation-vs-physics-v3-1080p60.mp4',url).href,{headers:{Range:'bytes=0-63'}});
 assert.equal(range.status(),206);assert.equal((await range.body()).length,64);
 await b.page.goto(url);
 await b.page.waitForFunction(()=>document.querySelector('video')?.duration===125);
 const metadata=await b.page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight}));
 assert.equal(metadata.width,1920);assert.equal(metadata.height,1080);
 const seeks=[];
 for(const start of [30,75,0]){
  await b.page.locator(`button[data-start="${start}"]`).click();
  await b.page.locator('video').evaluate(v=>v.pause());
  await b.page.waitForFunction(start=>{const v=document.querySelector('video');return !v.seeking&&Math.abs(v.currentTime-start)<.75;},start);
  seeks.push(await b.page.locator('video').evaluate(v=>v.currentTime));
 }
 assert.equal(b.errors.length,0);
 const report={passed:true,...metadata,actSeeks:seeks,httpRangeStatus:range.status(),rangeBytes:64,errors:b.errors};
 await writeFile(root+'/exports/player-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await b.close();}
