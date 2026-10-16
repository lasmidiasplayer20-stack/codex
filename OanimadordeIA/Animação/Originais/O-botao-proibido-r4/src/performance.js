/* V6 pose vocabulary and angular gesture blending retained; explicit supports and new button-story contacts below. */
(()=>{'use strict';const S=StoryV6,{clamp,lerp,smooth}=V,L=RigAdapter.length,R=RigAdapter.radius,TAU=Math.PI*2,HZ=120;
const P={
 idle:[-90,[-12,46],[13,46]],look:[-90,[-14,45],[15,44]],watch:[-90,[-14,45],[17,43]],
 point:[-86,[-12,44],[45,-10]],idea:[-90,[-12,45],[24,-35]],inspect:[-70,[35,15],[40,5]],
 alarm:[-101,[-33,-24],[34,-28]],reach:[-78,[32,25],[44,4]],catch:[-86,[35,2],[40,-9]],
 carry:[-90,[25,22],[35,22]],place:[-60,[30,34],[35,29]],crouch:[-46,[22,38],[32,32]],grab:[-50,[25,36],[35,30]],
 push:[-62,[38,20],[43,12]],pull:[-113,[39,20],[43,10]],brace:[-80,[37,5],[43,-4]],press:[-66,[42,5],[40,25]],brake:[-50,[30,35],[35,30]],
 run:[-78,[-25,32],[25,32]],walk:[-87,[-16,43],[16,43]],hop:[-85,[-25,-26],[30,-26]],
 float:[-92,[-38,18],[38,10]],swim:[-80,[-40,-12],[40,10]],fly:[-65,[-35,0],[40,0]],
 slip:[-115,[-42,-15],[42,-10]],land:[-70,[-30,20],[35,20]],balance:[-90,[-44,0],[44,0]],
 prepare:[-45,[-25,24],[25,24]],stop:[-115,[-35,-10],[40,-18]],protect:[-90,[-20,-30],[20,-30]],
 shrug:[-90,[-36,0],[36,0]]};
function poseStyle(a){const x=P[a.p]||P.idle,y=P[a.q]||P.idle;return{body:lerp(x[0],y[0],a.u),hands:[1,2].map(k=>{const angle0=Math.atan2(x[k][1],x[k][0]);let delta=Math.atan2(y[k][1],y[k][0])-angle0;while(delta>Math.PI)delta-=TAU;while(delta< -Math.PI)delta+=TAU;const angle=angle0+delta*a.u,len=lerp(Math.hypot(...x[k]),Math.hypot(...y[k]),a.u);return[Math.cos(angle)*len,Math.sin(angle)*len];})};}
// Two-link IK feeds the original FK records. Choose the continuous bend branch instead of flipping on a facing flag.
function solve(root,target,l1,l2,pole,previous){const dx=target[0]-root[0],dy=target[1]-root[1],raw=Math.hypot(dx,dy),d=clamp(raw,.001,l1+l2-.00001),angle=Math.atan2(dy,dx),alpha=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));let sign=pole;const at=q=>[root[0]+Math.cos(angle+q*alpha)*l1,root[1]+Math.sin(angle+q*alpha)*l1];if(previous){const a=at(1),b=at(-1);sign=Math.hypot(a[0]-previous[0],a[1]-previous[1])<=Math.hypot(b[0]-previous[0],b[1]-previous[1])?1:-1;}return{joint:at(sign),end:[root[0]+Math.cos(angle)*d,root[1]+Math.sin(angle)*d],error:Math.max(0,raw-d)};}
const windowWeight=(t,lo,hi,fade=.35)=>smooth((t-lo+fade)/fade)*(1-smooth((t-hi)/fade));
const poses=Object.fromEntries(S.names.map(n=>[n,[]])),records=Object.fromEntries(S.names.map(n=>[n,[]])),steps=[];
for(const name of S.names){let distance=0,lastX=null,speed=0,lastMoving=false,lastG=1,lastSurface=806,lastFeet=null,cycles=[null,null],plants=[null,null],swings=[null,null],previousJoints=[null,null,null,null],prevRecord=null;
 for(let frame=0;frame<=S.duration*HZ;frame++){
  const t=frame/HZ,s=S.snapshot(t),a=s.actors[name],sty=poseStyle(a),g=clamp(a.g),normal=Math.cos(a.r)>=0?1:-1,dx=lastX===null?0:a.x-lastX;lastX=a.x;speed+=(dx*HZ-speed)*.08;
  const moving=Math.abs(speed)>8&&g>.95,face=a.a.f===a.b.f?a.f:lerp(a.a.f,a.b.f,a.turnU),mode=a.u>.5?a.q:a.p;
  let body=lerp(sty.body,-30,lerp(a.p==='crouch'?1:0,a.q==='crouch'?1:0,a.u));const rescueW=windowWeight(t,92.8,105.6,.6),chainW=windowWeight(t,93.7,104,.5),stopW=windowWeight(t,143,145.5,.5);
  if(name==='hero')body=lerp(body,-40,rescueW);
  if(name==='amber')body=lerp(body,-70,chainW);
  if(name==='cyan')body=lerp(body,-80,windowWeight(t,93.2,105.5,.5));
  if(name==='cyan')body=lerp(body,-30,windowWeight(t,105.8,106.5,.2));
  let bodyAngle=(-90+(body+90)*face+clamp(speed*.025,-5,5))*Math.PI/180+a.r;
  if(name==='hero')bodyAngle=lerp(bodyAngle,-115*Math.PI/180,stopW);
  if(name==='cyan')bodyAngle=lerp(bodyAngle,-65*Math.PI/180,stopW);
  if(name==='cyan')bodyAngle=lerp(bodyAngle,-70*Math.PI/180,windowWeight(t,56,65,.45));
  const effort=(['pull','brace','press'].includes(mode)?Math.sin(t*10)*.55:0),breathe=Math.sin(t*2.4+S.names.indexOf(name))*.4;
  const root=[a.x,a.y+(breathe+effort)*g+(moving?Math.sin(distance/92*TAU*2)*1.3*normal:0)];
  const shoulder=[root[0]+Math.cos(bodyAngle)*L[1],root[1]+Math.sin(bodyAngle)*L[1]];
  const focus=t<22?[1000,704]:t<45?[970,450]:t<69?[1140,704]:t<84?[875,704]:t<108?s.rescue:t<128?[820,680]:[1000,704];
  const gaze=clamp((focus[0]-shoulder[0])*.001,-.2,.2),neck=-Math.PI/2+gaze+a.r,head=[shoulder[0]+Math.cos(neck)*L[2],shoulder[1]+Math.sin(neck)*L[2]];
  // The V6 distance-driven gait now operates on an explicit floor or ceiling plane, never a height heuristic.
  if(moving&&!lastMoving){distance=0;cycles=[null,null];}distance+=Math.abs(dx)*g;
  for(let i=0;i<2;i++)if(plants[i]!==null)plants[i]=lerp(plants[i],root[0]+(i?16:-16),(1-g)*.4);
  const supportFeet=[],airFeet=[];
  for(let i=0;i<2;i++){
   if(plants[i]===null)plants[i]=root[0]+(i?16:-16);
   let p;
   if(!moving){if(lastMoving&&lastFeet)plants[i]=lastFeet[i][0];p=[plants[i],lerp(lastFeet?.[i]?.[1]??a.surface,a.surface,.08)];p[1]=normal>0?Math.min(p[1],a.surface):Math.max(p[1],a.surface);cycles[i]=null;}
   else{
    const dir=Math.sign(speed)||1,phase=distance/92+i*.5,cy=Math.floor(phase),u=phase-cy;
    if(cycles[i]===null){cycles[i]=cy;plants[i]=lastFeet?lastFeet[i][0]:root[0]+dir*(i?-20:20);swings[i]=plants[i];}
    if(cycles[i]!==cy){cycles[i]=cy;plants[i]=root[0]+dir*24;steps.push({id:`step-${name}-${frame}-${i}`,t,type:'step',x:plants[i],y:a.surface,power:.32,name});}
    if(u<.52){p=[plants[i],a.surface];swings[i]=plants[i];}else{const q=(u-.52)/.48;p=[lerp(swings[i],root[0]+dir*24,smooth(q)),a.surface-normal*Math.sin(Math.PI*q)*15];}
   }
   // During the pit rescue both of the rescuer's feet must remain on the near bank.
   if(name==='hero'&&rescueW>.001)p[0]=lerp(p[0],i?1164:1141,rescueW*(1-smooth((t-102)/4)));
   const dy=p[1]-root[1],span=Math.sqrt(Math.max(0,(L[7]+L[8]-.02)**2-dy*dy));p[0]=clamp(p[0],root[0]-span,root[0]+span);supportFeet.push(p);
   const pulse=t*2.3+i*Math.PI+S.names.indexOf(name),x=(i?20:-20)+Math.sin(pulse)*5,y=61+Math.cos(pulse)*7;
   airFeet.push([root[0]+x*Math.cos(a.r)-y*Math.sin(a.r),root[1]+x*Math.sin(a.r)+y*Math.cos(a.r)]);
  }
  let feet=supportFeet.map((p,i)=>p.map((v,j)=>lerp(airFeet[i][j],v,g)));
  if(root[0]<1180&&Math.abs(a.r)<.3)feet=feet.map(p=>[p[0],Math.min(p[1],806)]);
  if(name==='cyan'){const w=windowWeight(t,105.8,107.4,.35);if(w>0)feet[1]=feet[1].map((v,j)=>lerp(v,[1172,806][j],w));}
  let hands=sty.hands.map((p,i)=>{
   const gaitWeight=smooth((Math.abs(speed)-4)/24)*g,eligible=lerp(['idle','watch','look','walk','run','point','alarm'].includes(a.p)?1:0,['idle','watch','look','walk','run','point','alarm'].includes(a.q)?1:0,a.u);
   let x=p[0]*face,y=p[1];x=lerp(x,clamp(-(feet[i][0]-root[0]),-27,27),gaitWeight*eligible);y=lerp(y,39,gaitWeight*eligible);
   x+=(1-g)*Math.sin(t*3.1+i*Math.PI)*3;y+=Math.sin(t*2.7+i)*1.2;
   return[shoulder[0]+x*Math.cos(a.r)-y*Math.sin(a.r),shoulder[1]+x*Math.sin(a.r)+y*Math.cos(a.r)];
  });
  const contacts=[];
  function touch(i,target,kind,w){
   const start=hands[i].map((v,j)=>v-shoulder[j]),end=target.map((v,j)=>v-shoulder[j]),a0=Math.atan2(start[1],start[0]);let delta=Math.atan2(end[1],end[0])-a0;while(delta>Math.PI)delta-=TAU;while(delta< -Math.PI)delta+=TAU;
   const angle=a0+delta*w,length=lerp(Math.hypot(...start),Math.hypot(...end),w);hands[i]=[shoulder[0]+Math.cos(angle)*length,shoulder[1]+Math.sin(angle)*length];
   if(w>.999)contacts.push({index:i?6:4,target:target.slice(),kind});
  }
  function bind(lo,hi,fn,fade=.35){const w=windowWeight(t,lo,hi,fade);if(w>.000001)fn(w);}
  if(name==='amber'){
   bind(20.2,21.8,w=>touch(1,[1000,704],'forbidden-button',w));
   bind(82,83.4,w=>touch(1,[875,704],'wrong-reset',w));
   bind(94,104,w=>touch(1,s.chain,'rescue-chain',w),.5);
   bind(114,127.4,w=>touch(1,[1000,704],'sync-right',w),.45);
   bind(143.5,145.5,w=>{touch(1,[980,696],'blocked-right-wrist',w);touch(0,[930,704],'blocked-left-wrist',w);},.5);
  }
  if(name==='hero'){
   bind(39,40,w=>touch(1,[690,729],'rope-spool',w),.4);
   bind(44.4,70,w=>touch(1,[shoulder[0]+35,shoulder[1]-10],'safety-rope',w),.5);
   bind(93.4,105.5,w=>touch(1,s.rescue,'rescue-catch',w),.5);
   bind(94,104,w=>touch(0,s.chain,'rescue-chain',w),.5);
   bind(143.5,145.5,w=>touch(0,[980,696],'stop-right-wrist',w),.5);
  }
  if(name==='cyan'){
   bind(42,48,w=>touch(1,[shoulder[0]-30,shoulder[1]+15],'rope-help',w),.5);
   bind(56,65,w=>{const y=S.value([{t:0,y:570},{t:58,y:570},{t:60,y:590},{t:62,y:615},{t:64,y:650},{t:66,y:694},{t:150,y:694}],t,'y').v;touch(0,[1140,y],'wall-rail',w)},.45);
   bind(66,68.5,w=>touch(1,[1140,704],'emergency-brake',w),.45);
   bind(93.4,105.5,w=>touch(0,s.rescue,'rescue-catch',w),.5);
   bind(105.8,106.5,w=>touch(1,[1174,806],'bank-brace',w),.35);
   bind(116,127.4,w=>touch(1,[690,704],'sync-left',w),.45);
   bind(143.5,145.5,w=>touch(1,[930,704],'stop-left-wrist',w),.5);
  }
  if(name==='cyan'&&windowWeight(t,105.8,107.4,.35)>.999)contacts.push({index:10,target:[1172,806],kind:'bank-step'});
  if(g>.999)for(let i=0;i<2;i++)if(Math.abs(feet[i][1]-a.surface)<.01)contacts.push({index:i?10:8,target:feet[i].slice(),kind:normal===1?'floor-support':'ceiling-support'});
  const arms=hands.map((p,i)=>solve(shoulder,p,L[3],L[4],a.f,previousJoints[i])),legs=feet.map((p,i)=>solve(root,p,L[7],L[8],-a.f,previousJoints[i+2]));
  const nodes=[root,shoulder,head,arms[0].joint,arms[0].end,arms[1].joint,arms[1].end,legs[0].joint,legs[0].end,legs[1].joint,legs[1].end];
  previousJoints=[...arms,...legs].map(p=>p.joint);const pose={nodes,head,r:R,root,contacts,feet:feet.map(p=>p.slice()),ground:g>.999,mode,moving,support:g,rotation:a.r,errors:[...arms,...legs].map(p=>p.error)};
  poses[name].push(pose);const record=RigAdapter.record(pose,t,prevRecord);records[name].push(record);prevRecord=record;lastFeet=feet;lastMoving=moving;lastG=g;lastSurface=a.surface;
 }
}
window.FILM_DATA={width:1920,height:1080,duration:S.duration,cast:Object.fromEntries(S.names.map(n=>[n,{rgb:S.colors[n],hollow:n==='hero'}])),tracks:records};
S.poseAt=(n,t)=>poses[n][Math.min(poses[n].length-1,Math.max(0,Math.round(t*HZ)))];S.steps=steps;S.hz=HZ;S.poses=poses;
})();
