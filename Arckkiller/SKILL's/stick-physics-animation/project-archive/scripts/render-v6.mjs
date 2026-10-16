import{spawn}from'node:child_process';import{mkdir,writeFile}from'node:fs/promises';import{resolve}from'node:path';
const root=resolve(import.meta.dirname,'..'),slugs=['the-delivery','a-bad-launch','catch-the-cart','hold-on','one-more-try','leave-it-alone'];
export async function run(cmd,args){await new Promise((ok,no)=>{const p=spawn(cmd,args,{cwd:root,stdio:'inherit'});p.on('error',no);p.on('close',c=>c===0?ok():no(Error(cmd+' '+c)));});}
await mkdir(root+'/.qa/assembly',{recursive:true});let next=0;async function worker(){while(next<6){const i=next++,name=`exports/part-0${i+1}-${slugs[i]}-1080p60.mp4`;await run('node',['render.mjs','--start',String(i*25),'--duration','25','--fps','60','--width','1920','--crf','20','--threads','2','--audio','exports/master-v6.wav','--output',name]);await run('python3',['scripts/validate-export.py',name,'--duration','25','--fps','60']);}}
await Promise.all([worker(),worker()]);await import('./assemble-v6.mjs');
