import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas'),{makeFilm,poseAt}=require('../src/film.js'),Character=require('../src/day-three-character.js'),plan=require('../timeline.json');
const root=resolve(import.meta.dirname,'..'),canvas=createCanvas(480,270),film=makeFilm(canvas.getContext('2d'),plan);
const angle=(a,q,b)=>{const u=[a[0]-q[0],a[1]-q[1]],v=[b[0]-q[0],b[1]-q[1]];return Math.acos(Math.max(-1,Math.min(1,(u[0]*v[0]+u[1]*v[1])/Math.hypot(...u)/Math.hypot(...v))))*180/Math.PI;};
const pole=(a,l)=>(l.end[0]-a[0])*(l.joint[1]-a[1])-(l.end[1]-a[1])*(l.joint[0]-a[0]);
let minElbow=180,minKnee=180,minShoulderSeparation=Infinity,minHipSeparation=Infinity,maxJointStep=0,maxStanceDrift=0,branchFlips=0,previous;
for(let i=0;i<Math.ceil(plan.duration*60-1e-5);i++){
 const s=film.frame(i/60),p=film.lastActors()[0];
 for(let j=0;j<2;j++){minElbow=Math.min(minElbow,angle(p.shoulders[j],p.arms[j].joint,p.arms[j].end));minKnee=Math.min(minKnee,angle(p.hips[j],p.legs[j].joint,p.legs[j].end));}
 minShoulderSeparation=Math.min(minShoulderSeparation,Math.hypot(p.shoulders[1][0]-p.shoulders[0][0],p.shoulders[1][1]-p.shoulders[0][1]));
 minHipSeparation=Math.min(minHipSeparation,Math.hypot(p.hips[1][0]-p.hips[0][0],p.hips[1][1]-p.hips[0][1]));
 if(previous?.scene===s.id){
  const q=previous.pose;
  for(let j=0;j<p.nodes.length;j++)maxJointStep=Math.max(maxJointStep,Math.hypot(p.nodes[j][0]-q.nodes[j][0],p.nodes[j][1]-q.nodes[j][1]));
  for(let j=0;j<2;j++){
   if(p.contacts[j]&&q.contacts[j])maxStanceDrift=Math.max(maxStanceDrift,Math.hypot(p.feet[j][0]-q.feet[j][0],p.feet[j][1]-q.feet[j][1]));
   if(pole(p.shoulders[j],p.arms[j])*pole(q.shoulders[j],q.arms[j])<0)branchFlips++;
  }
 }
 previous={scene:s.id,pose:p};
}
// Force crossings at known raster locations. A coordinate/gait sort or a
// recoloured far hand fails even if the skeleton still has correct lengths.
const fixture=createCanvas(320,370),ctx=fixture.getContext('2d'),p=poseAt(0,{x:700});
p.shoulders=[[100,100],[200,100]];p.arms=[{joint:[120,130],end:[200,180]},{joint:[180,130],end:[100,180]}];
p.hips=[[100,260],[200,260]];p.legs=[{joint:[120,290],end:[200,340]},{joint:[180,290],end:[100,340]}];
p.hands=[[250,145],[250,145]];p.feet=[[250,315],[250,315]];
Character.renderRetargeted(ctx,p,0,{bag:false});
const pixel=(x,y)=>Array.from(ctx.getImageData(x,y,1,1).data).slice(0,3);
const probes=[{part:'sleeves',at:[150,149],expected:[97,154,147]},{part:'trousers',at:[150,309],expected:[178,180,169]},{part:'hands',at:[250,145],expected:[238,230,209]},{part:'shoes',at:[250,313],expected:[201,199,185]}].map(q=>({...q,actual:pixel(...q.at)}));
const depthPassed=probes.every(p=>p.actual.every((v,i)=>v===p.expected[i]));
writeFileSync(resolve(root,`qa/depth-crossings-${plan.revision}.png`),fixture.toBuffer('image/png'));
const passed=depthPassed&&minElbow>30&&minKnee>100&&minShoulderSeparation>14&&minHipSeparation>11&&maxJointStep<12&&maxStanceDrift<1e-6&&branchFlips===0&&film.stats.maxReachExcess<.01;
const report={passed,frames:Math.ceil(plan.duration*60-1e-5),minElbowInteriorDegrees:minElbow,minKneeInteriorDegrees:minKnee,minShoulderSeparation,minHipSeparation,maxJointStep,maxStanceDrift,elbowBranchFlips:branchFlips,depthPassed,probes,stats:film.stats,scope:'Actual film poses at every frame, separate limb roots, fold limits, continuity and support; production renderer pixel tests at forced crossings for light-over-dark sleeves, trousers, hands and shoes. Visual sequence review is still required.'};
writeFileSync(resolve(root,`qa/anatomy-${plan.revision}.json`),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(!passed)process.exitCode=1;
