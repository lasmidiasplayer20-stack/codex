import{spawn}from'node:child_process';import{mkdir,readFile,writeFile}from'node:fs/promises';import{resolve}from'node:path';import assert from'node:assert/strict';import{createHash}from'node:crypto';
const root=resolve(import.meta.dirname,'..'),scratch=process.env.ANIMATION_SCRATCH||'/workspace/animation-production-r4',output=resolve(root,'../../Vídeos/The-Forbidden-Button-R4-1080p60.mp4');
const expected=JSON.parse(await readFile(root+'/qa/render-sources.json','utf8'));
for(const[f,h]of Object.entries(expected.files))assert.equal(createHash('sha256').update(await readFile(root+'/'+f)).digest('hex'),h,'Source changed after rendering: '+f);
for(let i=0;i<6;i++){const meta=JSON.parse(await readFile(`${scratch}/parts/part-${i+1}.mp4.json`,'utf8'));assert.deepEqual(meta.sourceHashes,expected.files);assert.equal(meta.inputFrames,1500);assert.equal(meta.start,i*25);assert.equal(meta.fps,60);}
const run=(cmd,args)=>new Promise((ok,no)=>{const p=spawn(cmd,args,{cwd:root,stdio:'inherit'});p.on('error',no);p.on('close',c=>c===0?ok():no(Error(cmd+' exit '+c)));});
await writeFile(scratch+'/parts/list.txt',Array.from({length:6},(_,i)=>`file 'part-${i+1}.mp4'`).join('\n')+'\n');
await run('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',scratch+'/parts/list.txt','-i','audio/trilha-original.m4a','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t','150','-movflags','+faststart',output]);
await run('python3',['scripts/validate-export.py',output,'--duration','150','--fps','60']);
console.log('Complete film exported to Vídeos. Parts and reports remain outside that folder.');
