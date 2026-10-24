'use strict';
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const film=require('./film'),cta=require('./cta'),Rig=require('./character');
GlobalFonts.registerFromPath(path.join(__dirname,'assets/NimbusSans-Regular.otf'),'Film');GlobalFonts.registerFromPath(path.join(__dirname,'assets/NimbusSans-Bold.otf'),'Film Bold');
const out=path.join(__dirname,'../qa'),canvas=createCanvas(1920,1080),c=canvas.getContext('2d');
function draw(t){c.resetTransform();c.clearRect(0,0,1920,1080);c.save();c.scale(1.5,1.5);film.render(c,t);cta(c,t,film.DURATION);c.restore();return canvas.toBuffer('image/png')}
const sheet=createCanvas(1920,6*294),sc=sheet.getContext('2d');sc.fillStyle='#101e26';sc.fillRect(0,0,sheet.width,sheet.height);
for(let i=0;i<24;i++){const s=film.Story.scenes[i],t=s.start+Math.min(7,(s.end-s.start)*.4);draw(t);const x=i%4*480,y=Math.floor(i/4)*294;sc.drawImage(canvas,x,y,480,270);sc.fillStyle='#eee6d2';sc.font='15px Film';sc.fillText(`${s.id} · ${s.title} · ${t.toFixed(2)}s`,x+10,y+287)}
fs.writeFileSync(path.join(out,'scene-review.jpg'),sheet.toBuffer('image/jpeg',85));
for(const [name,t] of [['cta-45s',47],['cta-midpoint',film.DURATION*.5+2],['cta-ending',film.DURATION-33]]){draw(t);fs.writeFileSync(path.join(out,name+'.jpg'),canvas.toBuffer('image/jpeg',90))}
const risks=[film.Story.scenes[6].start+2,film.Story.scenes[17].start+4.5,film.Story.scenes[18].start+6];
const strip=createCanvas(1920,3*270),ctx=strip.getContext('2d');
risks.forEach((t,row)=>[-.15,-.05,.05,.15].forEach((dt,col)=>{draw(t+dt);ctx.drawImage(canvas,col*480,row*270,480,270)}));
fs.writeFileSync(path.join(out,'motion-review.jpg'),strip.toBuffer('image/jpeg',88));
const hash=t=>crypto.createHash('sha256').update(draw(t)).digest('hex');let a=hash(47);hash(410);let b=hash(47);if(a!==b)throw Error('Non-deterministic seeking');
let poses=0,nonfinite=0;function finite(v){if(typeof v==='number'&&!Number.isFinite(v))nonfinite++;else if(Array.isArray(v))v.forEach(finite);else if(v&&typeof v==='object')Object.values(v).forEach(finite)}
for(let frame=0;frame<Math.round(film.DURATION*film.FPS);frame++){
 const t=frame/film.FPS,s=film.Story.scenes.find(q=>t>=q.start&&t<q.end);if(!s)continue;
 const mode=['walk','run','chase','climb','end','return','door'].includes(s.action)?(['run','chase','end'].includes(s.action)?'run':'walk'):'idle';
 const p=Rig.pose(t,mode,{travel:t*60,scale:.99,bag:true});finite(p);poses++;
}
if(nonfinite)throw Error('Invalid pose coordinates');
fs.writeFileSync(path.join(out,'source-review.json'),JSON.stringify({duration:film.DURATION,fps:film.FPS,frames:Math.round(film.DURATION*film.FPS),scenes:24,captions:film.Story.captions.length,cta_starts:[45,film.DURATION*.5,film.DURATION-35],deterministic_seeking:a===b,primary_pose_samples:poses,nonfinite_values:nonfinite,scope:'Deterministic seeking; primary rig solver sanity samples at each output timestamp (not an exhaustive collision test of every actor); 24 source-canvas scene samples; temporal strips around crash/chase/stairs. No general rigid-body collision claim.'},null,2));console.log('Source review complete',poses,'poses');
