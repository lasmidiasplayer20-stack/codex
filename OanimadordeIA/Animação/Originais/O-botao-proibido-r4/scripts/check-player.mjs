import assert from 'node:assert/strict';import {open} from './browser.mjs';import {writeFile} from 'node:fs/promises';
const b=await open();try{
 const base=new URL(b.page.url()).origin;
 assert.equal(await b.page.locator('html').getAttribute('lang'),'en');
 await b.page.locator('#seek').evaluate(el=>{el.value='78';el.dispatchEvent(new Event('input',{bubbles:true}));});assert(Math.abs(Number(await b.page.locator('#seek').inputValue())-78)<.02);
 await b.page.locator('#play').click();await b.page.waitForTimeout(250);await b.page.locator('#play').click();assert(Number(await b.page.locator('#seek').inputValue())>78);
 const css=await b.page.request.get(base+'/style.css');assert(css.headers()['content-type'].startsWith('text/css'));
 const range=await b.page.request.get(base+'/delivery/full.mp4',{headers:{Range:'bytes=0-1023'}});assert.equal(range.status(),206);assert.equal((await range.body()).length,1024);
 await b.page.goto(base+'/video.html');await b.page.locator('video').evaluate(v=>new Promise((ok,no)=>{if(v.readyState>=1)return ok();v.onloadedmetadata=ok;v.onerror=()=>no(Error('video load failed'));}));
 const info=await b.page.locator('video').evaluate(v=>({duration:v.duration,width:v.videoWidth,height:v.videoHeight,src:v.getAttribute('src')}));assert.equal(info.duration,150);assert.equal(info.width,1920);assert.equal(info.height,1080);assert.equal(info.src,'delivery/full.mp4');
 const seeks=[];for(const t of [0,25,50,75,100,125]){await b.page.locator('video').evaluate((v,t)=>new Promise(ok=>{if(Math.abs(v.currentTime-t)<.01)return ok();v.onseeked=ok;v.currentTime=t;}),t);seeks.push(t);}
 assert.equal(b.errors.length,0);await writeFile('qa/player.json',JSON.stringify({passed:true,english:true,codePlayerPlayPauseSeek:true,cssMimeCorrect:true,video:info,rangeStatus:206,rangeBytes:1024,chapterSeeks:seeks,pageErrors:b.errors},null,2)+'\n');console.log('PASS: code player, video metadata, six chapter seeks, CSS and HTTP byte ranges.');
}finally{await b.close();}
