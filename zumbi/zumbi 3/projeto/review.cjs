'use strict';
const {createCanvas,GlobalFonts}=require('@napi-rs/canvas'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const P=__dirname,Q=path.join(P,'../qa'),film=require('./film'),cta=require('./cta');
GlobalFonts.registerFromPath(path.join(P,'assets/NimbusSans-Regular.otf'),'Film');GlobalFonts.registerFromPath(path.join(P,'assets/NimbusSans-Bold.otf'),'Film Bold');
const canvas=createCanvas(1920,1080),c=canvas.getContext('2d');
function draw(t){c.resetTransform();c.clearRect(0,0,1920,1080);c.save();c.scale(1.5,1.5);const state=film.render(c,t);cta(c,t,film.DURATION);c.restore();return state}
const sheet=createCanvas(1920,8*294),sc=sheet.getContext('2d');sc.fillStyle='#0b1c26';sc.fillRect(0,0,sheet.width,sheet.height);
film.Story.scenes.forEach((s,i)=>{let t=s.start+Math.min(7,(s.end-s.start)*.4);draw(t);let x=i%4*480,y=Math.floor(i/4)*294;sc.drawImage(canvas,x,y,480,270);sc.font='15px Film';sc.fillStyle='#e9dec4';sc.fillText(`${s.id} ${s.title} / ${t.toFixed(2)}s`,x+9,y+287)});
fs.writeFileSync(path.join(Q,'scene-review.jpg'),sheet.toBuffer('image/jpeg',85));
const risks=['hold','chain','return','escape','reunion'];const strip=createCanvas(1920,risks.length*270),st=strip.getContext('2d');risks.forEach((key,row)=>{let s=film.Story.scenes.find(s=>s.key===key),t=s.start+4.5;[-.15,-.05,.05,.15].forEach((dt,col)=>{draw(t+dt);st.drawImage(canvas,col*480,row*270,480,270)})});fs.writeFileSync(path.join(Q,'motion-review.jpg'),strip.toBuffer('image/jpeg',86));
for(const [name,t] of [['cta-45s',47],['cta-midpoint',film.DURATION*.5+2],['cta-ending',film.DURATION-33],['crossing',385],['reunion',410]]){draw(t);fs.writeFileSync(path.join(Q,name+'.jpg'),canvas.toBuffer('image/jpeg',89))}
const digest=t=>{draw(t);return crypto.createHash('sha256').update(canvas.data()).digest('hex')};const a=digest(347);digest(641);const b=digest(347);if(a!==b)throw Error('Non-deterministic seeking');
let samples=0,poses=0,nonfinite=0,boneError=0,maxSoleBelowRoot=0;
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
for(let t=0;t<film.DURATION;t+=1){const state=draw(t);samples++;for(const g of state.actors){poses++;const p=g.pose;for(const v of [g.head,g.right,g.left,...g.feet])if(v.some(q=>!Number.isFinite(q)))nonfinite++;
 p.arms.forEach((l,i)=>{const s=i?p.rs:p.ls;boneError=Math.max(boneError,Math.abs(distance(s,l.joint)-47),Math.abs(distance(l.joint,l.end)-48))});p.legs.forEach((l,i)=>{const h=i?p.rh:p.lh;boneError=Math.max(boneError,Math.abs(distance(h,l.joint)-63),Math.abs(distance(l.joint,l.end)-63))});maxSoleBelowRoot=Math.max(maxSoleBelowRoot,...g.soles.map(v=>v[1]-g.root[1]));}}
if(nonfinite||boneError>1e-6)throw Error('Invalid actor geometry');
const report={duration:film.DURATION,fps:60,frames:Math.round(film.DURATION*60),scenes:32,captions:film.Story.captions.length,shots:film.Story.scenes.reduce((n,s)=>n+s.shots.length,0),deterministic_seeking:a===b,sampled_frames:samples,actual_director_actor_poses:poses,nonfinite,bone_length_max_error:boneError,max_sole_below_actor_root:maxSoleBelowRoot,cta_starts:[45,film.DURATION*.5,film.DURATION-35],scope:'Actual drawn director poses sampled each second, bone ratios, finite coordinates and repeat seeks; scene contact sheet and adjacent-frame strips at gate/chain/rescue/crossing/reunion. Slope-adapted foot targets. Directed kinematic animation, not a general physical humanoid simulation or exhaustive silhouette collision proof.'};fs.writeFileSync(path.join(Q,'source-review.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
