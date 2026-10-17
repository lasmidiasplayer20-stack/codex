import {createRequire} from 'node:module';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas');
const {makeFilm}=require('../src/film.js'),root=resolve(import.meta.dirname,'..');
const mode=process.argv[2]??'qa',planPath=resolve(root,process.env.FILM_PLAN??'timeline.json'),plan=JSON.parse(readFileSync(planPath));
const width=mode==='qa'?960:Number(process.env.FILM_WIDTH??1920),height=width*9/16;
const canvas=createCanvas(width,height),film=makeFilm(canvas.getContext('2d'),plan);
mkdirSync(resolve(root,'qa'),{recursive:true});
const frames=Math.ceil(plan.duration*60-1e-5);
if(mode==='qa'){
 for(const s of plan.scenes){for(const [name,u] of [['start',.12],['middle',.5],['end',.88]]){film.frame(s.start+(s.end-s.start)*u);writeFileSync(resolve(root,`qa/scene-${String(s.id).padStart(2,'0')}-${name}.png`),canvas.toBuffer('image/png'));}}
 // Audit geometry at every output-frame time without encoding a video.
 for(let i=0;i<frames;i++)film.frame(i/60);
 const report={...film.stats,expectedFrames:frames,passed:film.stats.finite&&film.stats.maxBoneError<1e-6&&film.stats.maxLegContactError<.01,scope:'Rig geometry and finite rendering; not a claim of reference pixel equivalence.'};
 writeFileSync(resolve(root,'qa/rig.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
}else{
 const output=resolve(root,process.env.FILM_OUTPUT??'../vídeo/video-1080p60.mp4');mkdirSync(resolve(output,'..'),{recursive:true});
 const audio=resolve(root,plan.audio??'audio/narracao.wav'),silent=process.env.FILM_SILENT==='1';
 const args=['-hide_banner','-loglevel','error','-f','image2pipe','-vcodec','mjpeg','-framerate','60','-i','pipe:0'];
 if(!silent)args.push('-i',audio);
 args.push('-map','0:v:0');if(!silent)args.push('-map','1:a:0');
 args.push('-c:v','libx264','-threads','2','-preset','fast','-crf','19','-pix_fmt','yuv420p');if(!silent)args.push('-c:a','aac','-b:a','192k');
 args.push('-t',String(frames/60),'-movflags','+faststart','-y',output);
 const ff=spawn('ffmpeg',args,{stdio:['pipe','ignore','pipe']});
 let err='',pipeError;ff.stderr.on('data',d=>err+=d);ff.stdin.on('error',e=>pipeError=e);const complete=new Promise(r=>ff.on('close',r));
 const begin=Date.now();for(let i=0;i<frames;i++){
  if(pipeError)throw pipeError;film.frame(i/60);const data=canvas.toBuffer('image/jpeg',92);if(!ff.stdin.write(data))await once(ff.stdin,'drain');
  if(i%600===0)console.log(JSON.stringify({frame:i,frames,seconds:(Date.now()-begin)/1000}));
 }
 ff.stdin.end();const exit=await complete;if(exit!==0)throw Error(err);
 writeFileSync(resolve(root,'qa/render.json'),JSON.stringify({width,height,fps:60,frames,duration:frames/60,audioDuration:plan.duration,output,stats:film.stats},null,2));console.log(JSON.stringify({complete:output,frames}));
}
