import {chromium} from 'playwright';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const values=Object.fromEntries(process.argv.slice(2).map(arg=>{
  const match=/^--([^=]+)=(.*)$/.exec(arg);
  if(!match)throw Error('Use --name=value arguments');
  return [match[1],match[2]];
}));
const fps=Number(values.fps||30),duration=Number(values.duration||6);
const width=Number(values.width||1920),height=Number(values.height||1080);
const port=Number(values.port||3012),frames=Math.round(fps*duration);
if(![fps,duration,width,height,port].every(x=>Number.isFinite(x)&&x>0)||!Number.isInteger(width)||!Number.isInteger(height)||width%2||height%2||frames<1)throw Error('Invalid timing, dimensions, or port');
const output=path.resolve(values.output||'demo.mp4');
if(fs.existsSync(output)&&values.overwrite!=='true')throw Error('Output exists; use --overwrite=true to replace it');
fs.mkdirSync(path.dirname(output),{recursive:true});
const server=spawn(process.execPath,['serve.mjs'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe']});
let browser,encoder,encodeDone;
try{
  await Promise.race([once(server.stdout,'data'),once(server,'exit').then(()=>{throw Error('Server exited before startup');})]);
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,
    args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width,height}});
  let browserError;page.on('pageerror',error=>{browserError=error;});
  await page.goto(`http://127.0.0.1:${port}/?export=1`,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.ready===true);
  const args=['-v','error','-y','-f','image2pipe','-vcodec','png','-framerate',String(fps),'-i','pipe:0'];
  if(values.audio)args.push('-i',path.resolve(values.audio),'-map','0:v:0','-map','1:a:0');
  args.push('-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p');
  if(values.audio)args.push('-c:a','copy');
  args.push('-t',String(frames/fps),'-movflags','+faststart',output);
  encoder=spawn('ffmpeg',args,{stdio:['pipe','ignore','pipe']});
  let encoderLog='',encoderError;
  encoder.stderr.on('data',chunk=>{encoderLog=(encoderLog+chunk).slice(-4000);});
  encoder.stdin.on('error',error=>{encoderError=error;});
  encodeDone=new Promise(resolve=>{encoder.once('error',error=>resolve({error}));encoder.once('close',code=>resolve({code}));});
  for(let frame=0;frame<frames;frame++){
    if(browserError||encoderError)throw browserError||encoderError;
    const png=await page.evaluate(({time,width,height})=>{
      // The demo's renderer initially uses 1080p. Change its size explicitly.
      window.setRenderSize(width,height);
      window.renderAt(time);return window.capture();
    },{time:frame/fps,width,height});
    if(!encoder.stdin.write(Buffer.from(png.split(',')[1],'base64')))await once(encoder.stdin,'drain');
  }
  encoder.stdin.end();
  const result=await encodeDone;
  if(result.error||result.code!==0)throw Error(`Encoder failed: ${result.error||encoderLog}`);
  console.log(JSON.stringify({output,width,height,fps,frames,duration:frames/fps,native_render:true,audio:values.audio?'Copied from supplied track':'None'},null,2));
}finally{
  if(encoder&&encoder.exitCode===null){encoder.stdin.destroy();encoder.kill('SIGTERM');}
  if(browser)await browser.close();
  server.kill('SIGTERM');
}
