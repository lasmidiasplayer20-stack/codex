'use strict';
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas');
const {spawn}=require('child_process'),path=require('path');
const film=require('./film.js'),drawCTA=require('./cta.js');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/NimbusSans-Regular.otf'),'Film');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/NimbusSans-Bold.otf'),'Film Bold');
const fps=film.FPS,first=+(process.argv[2]||0),last=+(process.argv[3]||Math.round(film.DURATION*fps)),dest=process.argv[4]||'picture.mp4';
// Split the final range so both workers remain useful at the end of a long export.
if(first===Math.round(film.DURATION*fps*11/12)&&last-first>1000&&!process.argv.includes('--single')){
 const fs=require('fs'),folder=dest+'.pieces';fs.mkdirSync(folder,{recursive:true});
 const mid=Math.round((first+last)/2),pieces=[path.join(folder,'a.mp4'),path.join(folder,'b.mp4')];
 const job=(a,b,file)=>new Promise((resolve,reject)=>{const child=spawn(process.execPath,[__filename,String(a),String(b),file,'--single'],{stdio:['ignore','inherit','inherit']});child.on('error',reject);child.on('close',code=>code?reject(Error('Split render '+code)):resolve());});
 (async()=>{await Promise.all([job(first,mid,pieces[0]),job(mid,last,pieces[1])]);const list=path.join(folder,'concat.txt');fs.writeFileSync(list,"file 'a.mp4'\nfile 'b.mp4'\n");await new Promise((resolve,reject)=>{const child=spawn('ffmpeg',['-y','-v','error','-f','concat','-safe','0','-i',list,'-c','copy',dest],{stdio:['ignore','inherit','inherit']});child.on('error',reject);child.on('close',code=>code?reject(Error('Split assembly '+code)):resolve());});})().catch(e=>{console.error(e.message);process.exitCode=1});
}else{
const canvas=createCanvas(1920,1080),c=canvas.getContext('2d');let error;
const child=spawn('ffmpeg',['-y','-v','error','-f','rawvideo','-pixel_format','rgba','-video_size','1920x1080','-framerate',String(fps),'-i','pipe:0','-an','-c:v','libx264','-threads','1','-preset','ultrafast','-tune','animation','-crf','18','-pix_fmt','yuv420p',dest],{stdio:['pipe','inherit','inherit']});
child.on('error',e=>error=e);child.stdin.on('error',e=>error=e);const done=new Promise(resolve=>child.on('close',resolve));
(async()=>{
 for(let f=first;f<last;f++){
  if(error)throw error;c.resetTransform();c.save();c.scale(1.5,1.5);film.render(c,f/fps);drawCTA(c,f/fps,film.DURATION);c.restore();
  if(!child.stdin.write(canvas.data()))await new Promise((res,rej)=>{const ready=()=>{child.stdin.off('error',failed);res()};const failed=e=>{child.stdin.off('drain',ready);rej(e)};child.stdin.once('drain',ready);child.stdin.once('error',failed)});
  if((f-first)%600===0)console.log('frames',f-first,'/',last-first);
 }
 child.stdin.end();const code=await done;if(code)throw Error('ffmpeg '+code);
})().catch(e=>{console.error(e.message);child.kill();process.exitCode=1});

}
