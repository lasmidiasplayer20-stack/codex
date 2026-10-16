/* Regressions for the user's observed backwards joints and same-side arm/leg swing. */
import {open,root} from '../scripts/browser.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const previewDir=process.env.LIMB_REVIEW_DIR||root+'/.qa/limbs';
const b=await open();
try {
 const r=await b.page.evaluate(()=>{
   const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
   const polarity=(n,a,j,e)=>cross(V.sub(n[e],n[a]),V.sub(n[j],n[a]));
   let backwardsArms=0,backwardsLegs=0,checked=0,maxTurnJointStep=0,turnPeak=null;
   for(let i=0;i<SIM.states.length;i++){
     const s=SIM.states[i],n=s.poseNodes,face=CharacterPerformance.facing(s,s.t);
     for(const [j,e] of [[7,8],[9,10]])if(polarity(n,0,j,e)*face>1e-5)backwardsLegs++;
     if(s.char.handContact!=='protect')for(const[j,e]of [[3,4],[5,6]])if(polarity(n,1,j,e)*face < -1e-5)backwardsArms++;
     checked+=4;
     if(i&&[65,66.75,68.3,72.5].some(t=>Math.abs(s.t-t)<.18)){
       const a=SIM.states[i-1];
       for(const j of [3,5,7,9]){
         const p=V.rot(V.sub(n[j],[s.char.x,s.char.y]),-s.char.angle);
         const q=V.rot(V.sub(a.poseNodes[j],[a.char.x,a.char.y]),-a.char.angle);
         const step=Math.hypot(...V.sub(p,q));if(step>maxTurnJointStep){maxTurnJointStep=step;turnPeak={t:s.t,joint:j,pose:s.char.pose,p,q};}
       }
     }
   }
   function correlation(start,end){
     const data=SIM.states.filter(s=>s.t>start&&s.t<end&&s.char.walk).map(s=>{
       const n=s.poseNodes;
       return [V.rot(V.sub(n[4],n[1]),-s.stage.angle)[0],V.rot(V.sub(n[8],n[0]),-s.stage.angle)[0]];
     });
     const m=[0,1].map(j=>data.reduce((v,p)=>v+p[j],0)/data.length);
     let xy=0,xx=0,yy=0;
     for(const p of data){const x=p[0]-m[0],y=p[1]-m[1];xy+=x*y;xx+=x*x;yy+=y*y;}
     return xy/Math.sqrt(xx*yy);
   }
   const gaitCorrelations={right:correlation(.7,3.9),left:correlation(65.2,66.6),lastSteps:correlation(120.2,121.5)};
   const nativeRoots=[2,2+1/60,2+2/60,2+3/60].map(t=>ElasticRig.at('hero',t).nodes[0]);
   const sizeTimes=[2.5,7.5,12.5,17.5,27.5,32,43.5,48,53,67.3,77.5,82.7,87.5,98,107.5,117.5];
   const sizeSamples=sizeTimes.map(t=>{const s=film.snapshot(t),c=Camera.at(s,t),n=s.poseNodes.map(p=>V.rot(V.sub(p,c.focus),-c.rotation));return {t,zoom:c.zoom,heroHeightPixels:(Math.max(...n.map(p=>p[1]))-Math.min(...n.map(p=>p[1]))+2*RigAdapter.radius)*c.zoom};});
   return {checked,backwardsArms,backwardsLegs,maxTurnJointStep,turnPeak,gaitCorrelations,nativeFps:FilmExposure.nativeFps,consecutiveNativeRoots:nativeRoots,sizeSamples,cutsAlignTo60Hz:Cinematic.cuts.every(t=>Math.abs(t*60-Math.round(t*60))<1e-7)};
 });
 console.log(JSON.stringify(r));
 assert.equal(r.backwardsArms,0);assert.equal(r.backwardsLegs,0);
 assert(r.maxTurnJointStep<18,'An elbow/knee snapped across the body during a turn');
 assert(Object.values(r.gaitCorrelations).every(v=>v<-.45),'Arms must oppose the corresponding legs in both walking directions');
 assert.equal(r.nativeFps,60);assert(r.cutsAlignTo60Hz);
 assert(r.consecutiveNativeRoots.every((p,i,a)=>!i||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>0));
 assert.equal(b.errors.length,0);
 await writeFile(root+'/exports/limb-direction-validation.json',JSON.stringify({passed:true,...r},null,2)+'\n');
 await mkdir(previewDir,{recursive:true});
 for(const t of [1,1.2,1.4,2.5,7.5,11.15,38.8,43.5,48,57.3,65.3,65.5,65.7,66.65,66.75,66.85,67.3,68.2,68.3,68.4,71.4,73.5,82.7,91.3,102.1,120.4,123.8]){
   const png=await b.page.evaluate(t=>{film.canvas.width=960;film.canvas.height=540;film.draw(t);return film.canvas.toDataURL('image/png').split(',')[1];},t);
   await writeFile(`${previewDir}/${t}.png`,Buffer.from(png,'base64'));
 }
} finally {await b.close();}
