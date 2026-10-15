/* Render each act directly at 60 fps, then concatenate video with one continuous audio encode. */
import {spawn} from 'node:child_process';
import {writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const parts=[
  {start:0,duration:30,name:'parte-01-descoberta-1080p60.mp4'},
  {start:30,duration:45,name:'parte-02-leis-enlouquecem-1080p60.mp4'},
  {start:75,duration:50,name:'parte-03-confronto-final-1080p60.mp4'}
];
async function run(cmd,args){
  await new Promise((resolve,reject)=>{
    const p=spawn(cmd,args,{cwd:root,stdio:'inherit'});
    p.on('error',reject);p.on('close',code=>code===0?resolve():reject(Error(cmd+' exited '+code)));
  });
}
await run(process.execPath,['scripts/direction-export.mjs']);
await run('python3',['scripts/score-v2.py','--events','exports/camera-cuts-v3.json','--duration','125','--output','exports/score-base-v3.wav']);
await run('python3',['scripts/foley-v3.py']);
for(const p of parts){
  await run(process.execPath,['render.mjs','--start',String(p.start),'--duration',String(p.duration),'--fps','60','--width','1920','--audio','exports/audio-v3.wav','--output','exports/'+p.name]);
  await run('python3',['scripts/validate-export.py','exports/'+p.name,'--duration',String(p.duration),'--fps','60']);
}
await run(process.execPath,['scripts/assemble-v3.mjs']);
console.log('Complete: 7500 native frames, 125 seconds, 60 fps.');
