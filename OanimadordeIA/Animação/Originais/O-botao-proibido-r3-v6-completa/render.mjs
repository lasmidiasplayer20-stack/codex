import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { dirname,resolve,extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
const root=dirname(fileURLToPath(import.meta.url));
const args=Object.fromEntries(process.argv.slice(2).reduce((out,v,i,a)=>v.startsWith('--')?[...out,[v.slice(2),a[i+1]]]:out,[]));
const output=resolve(args.output||'exports/animation-vs-physics-v6-continuous-1080p60.mp4');
const silent=args.silent==='true';
let duration=Number(args.duration||0);
const fps=Number(args.fps||60),start=Number(args.start||0),width=Number(args.width||1920),height=Math.round(width*9/16);
if(![24,30,60].includes(fps)||!Number.isFinite(start)||start<0)throw new Error('Invalid fps/start');
await mkdir(dirname(output),{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.m4a':'audio/mp4'};
const server=createServer(async(req,res)=>{
 try{const name=decodeURIComponent(req.url.split('?')[0]);const p=resolve(root,'.'+(name==='/'?'/index.html':name));if(!p.startsWith(root+'/')){res.writeHead(403);res.end();return;}const data=await readFile(p);res.setHeader('Content-Type',types[extname(p)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404);res.end();}
});
server.listen(0,'127.0.0.1');await once(server,'listening');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1280,height:800},deviceScaleFactor:1});const errors=[];
page.on('pageerror',e=>errors.push(String(e)));await page.goto(`http://127.0.0.1:${server.address().port}/`);
await page.waitForFunction(()=>typeof window.film?.draw==='function');
if(!duration)duration=await page.evaluate(()=>film.duration);
await page.evaluate(({width,height})=>{film.canvas.width=width;film.canvas.height=height;},{width,height});
const metrics=await page.evaluate(()=>({metrics:film.metrics,stages:film.stages.map(s=>({start:s.start,end:s.end,mode:s.mode}))}));
if(!metrics.metrics.finite||metrics.metrics.sourceVideoPixelsUsed!==0||errors.length)throw new Error('Simulation failed validation: '+JSON.stringify({metrics,errors}));
console.log(JSON.stringify({simulation:metrics.metrics,width,height,fps,duration,start}));
const ffArgs=['-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-r',String(fps),'-i','pipe:0'];
if(!silent)ffArgs.push('-ss',String(start),'-i',resolve(root,args.audio||'exports/soundtrack-v6.m4a'));
ffArgs.push('-map','0:v:0');if(!silent)ffArgs.push('-map','1:a:0');
ffArgs.push('-c:v','libx264','-threads',String(args.threads||1),'-preset','veryfast','-crf',String(args.crf||20),'-vf','scale=in_range=pc:out_range=tv','-color_range','tv','-pix_fmt','yuv420p','-r',String(fps));
if(!silent)ffArgs.push('-c:a','aac','-b:a','192k','-ar','48000');
ffArgs.push('-t',String(duration),'-movflags','+faststart','-y',output);
const ffmpeg=spawn('ffmpeg',ffArgs,{stdio:['pipe','ignore','pipe']});
let stderr='';ffmpeg.stderr.on('data',d=>stderr+=d);let encoderError=null;ffmpeg.stdin.on('error',e=>encoderError=e);
const completion=new Promise(r=>ffmpeg.on('close',code=>r(code)));
const frames=Math.round(duration*fps),sampleTimes=[];
for(let frame=0;frame<frames;frame++){
 if(encoderError)throw encoderError;
 const t=start+frame/fps;
 const data=await page.evaluate(t=>{film.draw(t);return film.canvas.toDataURL('image/jpeg',.96).split(',')[1];},t);
 if(!ffmpeg.stdin.write(Buffer.from(data,'base64')))await Promise.race([once(ffmpeg.stdin,'drain'),completion.then(code=>{throw new Error('Encoder stopped early '+code+': '+stderr);})]);
 if(frame%120===0)console.log(`Render ${(frame/frames*100).toFixed(1)}% · ${t.toFixed(1)}s`);
 if(sampleTimes.length&&Math.abs(t-sampleTimes[0])<1/fps){
  const sample=sampleTimes.shift();const png=await page.evaluate(()=>film.canvas.toDataURL('image/png').split(',')[1]);await writeFile(resolve(dirname(output),`coded-frame-${sample}.png`),Buffer.from(png,'base64'));
 }
}
ffmpeg.stdin.end();const code=await completion;
await browser.close();await new Promise(r=>server.close(r));
if(code!==0)throw new Error(`ffmpeg exit ${code}: ${stderr}`);
await writeFile(output+'.json',JSON.stringify({width,height,fps,duration,start,silent,inputFrames:frames,...metrics,errors,nativeTimeSampling:true,simulationHz:120,visualSource:'Canvas2D standard objects and an independently drawn FK rig driven by named 2D pose controls; no source images or source video in the renderer'},null,2));
console.log(`Complete: ${output}`);
