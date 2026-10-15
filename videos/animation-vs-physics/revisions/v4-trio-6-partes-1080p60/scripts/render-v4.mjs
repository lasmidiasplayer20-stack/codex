import{spawn}from'node:child_process';import{mkdir,writeFile,readFile}from'node:fs/promises';import{resolve}from'node:path';
const root=resolve(import.meta.dirname,'..');const slugs=['descoberta','alavanca','carga-em-movimento','sem-gravidade','reacao-em-cadeia','juntos-na-passagem'];
async function run(cmd,args){await new Promise((ok,no)=>{const p=spawn(cmd,args,{cwd:root,stdio:'inherit'});p.on('error',no);p.on('close',code=>code===0?ok():no(Error(cmd+' exited '+code)));});}
await mkdir(root+'/.qa/assembly',{recursive:true});
for(let i=0;i<6;i++){const name=`exports/parte-0${i+1}-${slugs[i]}-1080p60.mp4`;await run('node',['render.mjs','--start',String(i*25),'--duration','25','--fps','60','--width','1920','--crf','20','--threads','2','--audio','exports/master-v4.wav','--output',name]);await run('python3',['scripts/validate-export.py',name,'--duration','25','--fps','60']);await run('ffmpeg',['-v','error','-y','-i',name,'-map','0:v:0','-an','-c:v','copy',`.qa/assembly/part0${i+1}.mp4`]);}
await import('./assemble-v4.mjs');
