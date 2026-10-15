/* Strip each part's AAC priming before concatenation, then encode one continuous soundtrack. */
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const parts=['parte-01-descoberta-1080p60.mp4','parte-02-leis-enlouquecem-1080p60.mp4','parte-03-confronto-final-1080p60.mp4'];
async function run(cmd,args){await new Promise((ok,no)=>{const p=spawn(cmd,args,{cwd:root,stdio:'inherit'});p.on('error',no);p.on('close',code=>code===0?ok():no(Error(cmd+' exited '+code)));});}
await mkdir(root+'/.qa/assembly',{recursive:true});
for(let i=0;i<parts.length;i++)await run('ffmpeg',['-v','error','-y','-i','exports/'+parts[i],'-map','0:v:0','-an','-c:v','copy',`.qa/assembly/act0${i+1}-video.mp4`]);
await writeFile(root+'/.qa/assembly/list.txt',parts.map((p,i)=>`file 'act0${i+1}-video.mp4'`).join('\n')+'\n');
await run('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i','.qa/assembly/list.txt','-i','exports/audio-v3.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','256k','-ar','48000','-t','125','-movflags','+faststart','exports/animation-vs-physics-v3-1080p60.mp4']);
await run('python3',['scripts/validate-export.py','exports/animation-vs-physics-v3-1080p60.mp4','--fps','60']);
