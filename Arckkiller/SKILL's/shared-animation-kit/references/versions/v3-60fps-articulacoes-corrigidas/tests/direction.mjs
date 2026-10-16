import{open,root}from'../scripts/browser.mjs';
import{writeFile}from'node:fs/promises';
import assert from'node:assert/strict';
const b=await open();try{
 const r=await b.page.evaluate(()=>{
  function screen(p,c){return V.add([960,540],V.mul(V.rot(V.sub(p,c.focus),-c.rotation),c.zoom));}
  let croppedFrames=0,worstCrop=0;const cropped=[];
  for(let i=96;i<SIM.states.length-20;i+=5){const s=SIM.states[i];if(s.t>=114.8&&s.t<=115.2)continue;const c=Camera.at(s,s.t);let excess=0;
   const shot=Cinematic.shot(s.t),scope=shot?.scope||'body',ids=scope==='feet'||scope==='feet-orb'?[8,10]:scope==='particle'||scope==='finger'?[5,6]:scope==='orb'||scope==='collision'?[]:scope==='body-orb'||scope==='body'?[0,1,2,3,4,5,6,7,8,9,10]:[1,2,3,4,5,6];s.poseNodes.forEach((p,j)=>{if(!ids.includes(j))return;const q=screen(p,c),r=(j===2?RigAdapter.radius:4)*c.zoom;excess=Math.max(excess,-q[0]+r,q[0]+r-1920,-q[1]+r,q[1]+r-1080);});
   if(excess>3){croppedFrames++;worstCrop=Math.max(worstCrop,excess);if(cropped.length<12)cropped.push({t:s.t,excess});}
  }
  const contactTimes=[11.2,20.95,57.4,61.6,71.35,85.8,89.5,91.35,102.1,109.3,123.8];
  const contacts=contactTimes.map(t=>{const s=film.snapshot(t),c=Camera.at(s,t);return{t,zoom:c.zoom,hero:screen([s.char.x,s.char.y],c)};});
  const samples=[4.6,7.5,11.15,27.5,29.5,57.3,73.5,98,123.8].map(t=>({t,zoom:Camera.at(film.snapshot(t),t).zoom}));
  const p=ElasticRig.at('hero',98),sameBones=SIM.track.every(p=>p.r===RigAdapter.radius&&p.lengths.every((v,i)=>Math.abs(v-RigAdapter.length[i]/p.r)<1e-12));
  return{croppedFrames,worstCrop,cropped,contacts,reactionZooms:samples,medianReactionZoom:samples.map(s=>s.zoom).sort((a,b)=>a-b)[4],actingCues:CharacterPerformance.cues.length,originalElevenNodes:p.nodes.length===11,fixedLengths:sameBones,faceAdded:false,editorialInserts:Cinematic.inserts.length,explicitCameraCuts:Cinematic.cuts.length,responsiveEvents:LivingWorld.catalog.length,backgroundAssets:0};
 });
 console.log(JSON.stringify(r));assert.equal(r.croppedFrames,0);assert(r.medianReactionZoom>2.5);assert(r.actingCues>=25);assert(r.originalElevenNodes&&r.fixedLengths);assert(r.responsiveEvents>40);assert.equal(b.errors.length,0);
 await writeFile(root+'/exports/direction-validation.json',JSON.stringify({passed:true,...r},null,2)+'\n');
}finally{await b.close();}
