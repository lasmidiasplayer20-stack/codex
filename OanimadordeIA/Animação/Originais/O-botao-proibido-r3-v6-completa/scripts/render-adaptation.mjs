// Complete V6 renderer, unchanged, invoked in six native 25-second sections.
import {spawn} from 'node:child_process';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const scratch=process.env.ANIMATION_SCRATCH||'/workspace/animation-production-r3';
const output=resolve(root,'../../Vídeos'),parts=resolve(output,'R3-V6-parts');
export async function run(cmd,args){await new Promise((ok,no)=>{const p=spawn(cmd,args,{cwd:root,stdio:'inherit'});p.on('error',no);p.on('close',c=>c===0?ok():no(Error(cmd+' exited '+c)));});}
await mkdir(scratch+'/parts',{recursive:true});await mkdir(parts,{recursive:true});
if(!process.argv.includes('--assemble-only')){
 let next=0;async function worker(){while(next<6){const i=next++;await run('node',['render.mjs','--start',String(i*25),'--duration','25','--fps','60','--width','1920','--crf','19','--threads','2','--silent','true','--output',`${scratch}/parts/part-${i+1}.mp4`]);}}
 await Promise.all([worker(),worker()]);
}
for(let i=0;i<6;i++){
 const file=resolve(parts,`The-Forbidden-Button-R3-part-0${i+1}-1080p60.mp4`);
 await run('ffmpeg',['-v','error','-y','-i',`${scratch}/parts/part-${i+1}.mp4`,'-ss',String(i*25),'-i','audio/trilha-original.m4a','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-ar','48000','-t','25','-movflags','+faststart',file]);
 await run('python3',['scripts/validate-export.py',file,'--duration','25','--fps','60']);
}
await writeFile(scratch+'/parts/list.txt',Array.from({length:6},(_,i)=>`file 'part-${i+1}.mp4'`).join('\n')+'\n');
const full=resolve(output,'The-Forbidden-Button-R3-V6-1080p60.mp4');
await run('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',scratch+'/parts/list.txt','-i','audio/trilha-original.m4a','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t','150','-movflags','+faststart',full]);
await run('python3',['scripts/validate-export.py',full,'--duration','150','--fps','60']);
for(const file of[full,...Array.from({length:6},(_,i)=>resolve(parts,`The-Forbidden-Button-R3-part-0${i+1}-1080p60.mp4`))]){
 const report=file.replace(/\.mp4$/,'.validation.json'),data=JSON.parse(await readFile(report,'utf8'));
 data.audio='AAC stereo 48kHz; reused authentic ElevenLabs event effects plus procedural score and supplementary tones';
 await writeFile(report,JSON.stringify(data,null,2)+'\n');
}
console.log('Delivered seven validated MP4 files into Vídeos.');
