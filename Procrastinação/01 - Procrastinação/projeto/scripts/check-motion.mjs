import {createRequire} from 'node:module';
import {writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url),{poseAt,locomotion}=require('../src/film.js'),plan=require('../timeline.json');
const root=resolve(import.meta.dirname,'..'),reports=[];
for(const kind of ['desk','steps','push']){
 let previous,maxSupportDrift=0,maxJointStep=0,minPoleProduct=Infinity,maxPushGap=0;
 for(let i=0;i<=270;i++){
  const t=i/60,opt={...locomotion(kind,t),floor:442,...(kind==='push'?{gesture:'push',body:.15}:{})},p=poseAt(t,opt);
  if(previous){for(let j=0;j<2;j++)if(p.contacts[j]&&previous.contacts[j])maxSupportDrift=Math.max(maxSupportDrift,Math.hypot(p.feet[j][0]-previous.feet[j][0],p.feet[j][1]-previous.feet[j][1]));
   for(let j=0;j<p.nodes.length;j++)maxJointStep=Math.max(maxJointStep,Math.hypot(p.nodes[j][0]-previous.nodes[j][0],p.nodes[j][1]-previous.nodes[j][1]));}
  const poles=p.legs.map((l,i)=>(l.end[0]-p.hips[i][0])*(l.joint[1]-p.hips[i][1])-(l.end[1]-p.hips[i][1])*(l.joint[0]-p.hips[i][0]));
  minPoleProduct=Math.min(minPoleProduct,poles[0]*poles[1]);
  if(kind==='push')maxPushGap=Math.max(maxPushGap,Math.abs(p.hands[0][0]-p.hands[1][0]));previous=p;
 }
 reports.push({kind,maxSupportDrift,maxJointStep,minPoleProduct,maxPushGap});
}
const desk=poseAt(4,{...locomotion('desk',4),floor:442,gesture:'reach',amount:1}),palm=desk.hands[1];
const monitorContact=Math.abs(palm[0]-559)<.001&&palm[1]>=257&&palm[1]<=332;
const passed=monitorContact&&reports.every(r=>r.maxSupportDrift<1e-8&&r.maxJointStep<12&&r.minPoleProduct>0&&r.maxPushGap<1e-6);
const report={passed,reports,monitorContact,monitorPalm:palm,scope:'World-space stance, consistent knee bend, joint continuity and authored hand contacts; geometry is separate from visual review.'};
mkdirSync(resolve(root,'qa'),{recursive:true});writeFileSync(resolve(root,`qa/motion-${plan.revision??'r2'}.json`),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!passed)process.exitCode=1;
