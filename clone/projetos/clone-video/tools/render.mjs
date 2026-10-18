import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import fs from 'node:fs';
import path from 'node:path';
import {serve,ROOT} from './serve.mjs';
import {DURATION} from '../src/timeline.js';
const args=Object.fromEntries(process.argv.slice(2).map(x=>x.replace(/^--/,'').split('=')));
const width=Number(args.width||1920),height=Number(args.height||Math.round(width*9/16/2)*2),fps=Number(args.fps||30),start=Number(args.start||0),duration=Number(args.duration||DURATION-start);
const ranges=args.ranges?args.ranges.split(',').map(x=>x.split(':').map(Number)):null;
const sourceFrames=ranges?ranges.flatMap(([a,b])=>Array.from({length:Math.round((b-a)*fps)},(_,i)=>a+i/fps)):null;
const actualDuration=sourceFrames?sourceFrames.length/fps:duration;
const output=path.resolve(args.output||path.join(ROOT,'../../vídeos/clone-3d-completo.mp4'));
fs.mkdirSync(path.dirname(output),{recursive:true});
const server=await serve(0),port=server.address().port;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-gl=angle',`--use-angle=${process.env.CLONE_ANGLE_BACKEND||'swiftshader'}`,'--enable-unsafe-swiftshader','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',e=>errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
let ffmpeg;
try{
 await page.goto(`http://127.0.0.1:${port}/?render&width=${width}&height=${height}&time=${start}`);await page.waitForFunction(()=>window.ready,{timeout:60000});
 if(errors.length)throw new Error(errors.join('\n'));
 if(args.still){await page.evaluate(t=>window.renderAt(t),start);await page.screenshot({path:args.still});console.log(JSON.stringify(await page.evaluate(()=>window.lastFrame)));}
 else{
  const audio=path.join(ROOT,'audio/reference.m4a');
  const command=['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate',String(fps),'-vcodec','mjpeg','-i','pipe:0',...(ranges?['-map','0:v:0','-an']:['-ss',String(start),'-i',audio,'-map','0:v:0','-map','1:a:0']),'-c:v','libx264','-preset','fast','-crf','20','-maxrate','1400k','-bufsize','2800k','-pix_fmt','yuv420p','-c:a','copy','-t',String(actualDuration),'-movflags','+faststart',output];
  ffmpeg=spawn('ffmpeg',command,{stdio:['pipe','ignore','pipe']});const completion=once(ffmpeg,'close');let err='';ffmpeg.stderr.on('data',x=>err+=x);ffmpeg.stdin.on('error',()=>{});
  const count=sourceFrames?sourceFrames.length:Math.round(duration*fps),began=Date.now();
  for(let i=0;i<count;i++){
   const sourceTime=sourceFrames?sourceFrames[i]:start+i/fps;
   const b64=await page.evaluate(t=>window.capture(t),sourceTime);
   if(ffmpeg.exitCode!==null)throw new Error(`Encoder stopped: ${err}`);
   if(!ffmpeg.stdin.write(Buffer.from(b64,'base64')))await Promise.race([once(ffmpeg.stdin,'drain'),completion.then(()=>{throw new Error(`Encoder stopped: ${err}`);})]);
   if(i%300===0)console.log(JSON.stringify({frame:i,total:count,seconds:sourceTime,elapsed:(Date.now()-began)/1000}));
   if(errors.length)throw new Error(errors.join('\n'));
  }
  ffmpeg.stdin.end();const [code]=await completion;if(code!==0)throw new Error(`ffmpeg ${code}: ${err}`);
  const report={output,width,height,fps,start,duration:actualDuration,...(ranges?{ranges}:{}),frames:count,elapsed:(Date.now()-began)/1000,method:'Authored procedural 3D reconstruction; original audio',browserErrors:errors};
  fs.writeFileSync(path.resolve(args.report||path.join(ROOT,'analysis/render-last.json')),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 }
}finally{if(ffmpeg&&!ffmpeg.stdin.destroyed)ffmpeg.stdin.end();await browser.close();await new Promise(r=>server.close(r));}
