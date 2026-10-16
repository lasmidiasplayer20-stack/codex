/* Additive IK/pose adapter. Final FK and actor drawing use the unmodified legacy code. */
(()=>{'use strict';const{add,sub,mul,rot,polar,rad,lerp,smooth,clamp}=V,S=MODEL_UNIT,M=Model;
const length=[0,M.torso,M.neck,M.arm[0],M.arm[1],M.arm[0],M.arm[1],M.leg[0],M.leg[1],M.leg[0],M.leg[1]].map(x=>x*S),radius=M.radius*S,parents=[-1,0,1,1,3,1,5,0,7,0,9];
const STYLES={
 stand:{body:-90,neck:-90,h0:[-10,47],h1:[12,47],f0:[-16,80.5],f1:[16,80.5]},
 lookBack:{body:-90,neck:-120,h0:[-10,47],h1:[12,47],f0:[-16,80.5],f1:[16,80.5]},
 notice:{body:-90,neck:-74,h0:[-10,47],h1:[12,47],f0:[-16,80.5],f1:[16,80.5]},
 alarm:{body:-111,neck:-100,h0:[-35,-28],h1:[35,-27],f0:[-22,77],f1:[22,77]},
 crouch:{body:-15,neck:-90,h0:[27,27],h1:[30,25],f0:[-25,30],f1:[25,30]},
 float:{body:-90,neck:-90,h0:[-30,32],h1:[30,32],f0:[-18,76],f1:[18,76]},
 back:{body:-90,neck:-90,h0:[-30,20],h1:[30,35],f0:[-22,65],f1:[30,65]},
 headLift:{body:-80,neck:-30,h0:[-30,20],h1:[30,35],f0:[-22,65],f1:[30,65]},
 slip:{body:-110,neck:-80,h0:[-40,-8],h1:[40,-8],f0:[-30,55],f1:[55,55]},
 brace:{body:-70,neck:-90,h0:[44,-12],h1:[44,8],f0:[-20,70],f1:[20,76]},
 panic:{body:-90,neck:-90,h0:[-40,-20],h1:[40,-20],f0:[-24,70],f1:[24,70]},
 push:{body:-40,neck:-110,h0:[8,20],h1:[-20,30],f0:[-20,34.65],f1:[20,34.65]},
 pull:{body:-140,neck:-70,h0:[-20,25],h1:[-20,36],f0:[-20,34.65],f1:[20,34.65]},
 idea:{body:-90,neck:-80,h0:[-15,45],h1:[29,-26],f0:[-16,80.5],f1:[16,80.5]},
 grab:{body:-55,neck:-140,h0:[-2,10],h1:[-15,20],f0:[-18,66],f1:[18,66]},
 stretched:{body:-90,neck:-90,h0:[-8,-49],h1:[8,-49],f0:[-8,79],f1:[8,79]},
 kick:{body:-90,neck:-90,h0:[-35,15],h1:[35,15],f0:[-8,79],f1:[8,79]},
 point:{body:-85,neck:-70,h0:[-15,45],h1:[40,-13],f0:[-18,76],f1:[18,76]},
 protect:{body:-50,neck:-90,h0:[-14,-14],h1:[14,-14],f0:[-22,39],f1:[22,39]}
};
function blend(a,b,u){const p={};for(const k of Object.keys(a))p[k]=Array.isArray(a[k])?a[k].map((v,i)=>lerp(v,b[k][i],u)):lerp(a[k],b[k],u);return p;}
function style(s,t){return blend(s.char.poseFrom||STYLES.stand,s.char.poseTo||STYLES.stand,smooth((t-s.char.poseStart)/Math.max(.00001,s.char.poseDuration)));}
function setPose(s,name,t,duration=.35){s.char.poseFrom=style(s,t);s.char.poseTo=V.copy(STYLES[name]);s.char.poseStart=t;s.char.poseDuration=duration;s.char.poseName=name;}
function ik(root,target,a,b,side){const d=sub(target,root),raw=Math.hypot(...d),l=clamp(raw,Math.abs(a-b)+1e-7,a+b-1e-7),base=Math.atan2(d[1],d[0]),alpha=Math.acos(clamp((a*a+l*l-b*b)/(2*a*l),-1,1));return{joint:add(root,polar(base+side*alpha,a)),end:add(root,polar(base,l)),error:Math.max(0,raw-l)};}
function pose(s,t){const c=s.char,style0=style(s,t),p=V.copy(style0),origin=[c.x,c.y],angle=c.angle,nodes=[origin],stage=s.stage;
 if(c.swimming){const q=t-15;p.h0=[Math.cos(q*5)*43,Math.sin(q*5)*24+8];p.h1=[Math.cos(q*5+Math.PI)*43,Math.sin(q*5+Math.PI)*24+8];p.f0=[Math.sin(q*8)*27,58+Math.cos(q*8)*15];p.f1=[-Math.sin(q*8)*27,58-Math.cos(q*8)*15];}
 if(s.flags.compressAt!==undefined){const dt=t-s.flags.compressAt;if(dt>=0&&dt<.3){const w=Math.sin(Math.PI*dt/.3);p.f0=p.f0.map((v,j)=>lerp(v,[-28,25][j],w));p.f1=p.f1.map((v,j)=>lerp(v,[30,25][j],w));}}
 if(s.flags.effortStart!==undefined&&t<s.flags.effortEnd){const e=smooth((t-s.flags.effortStart)/.15)*(1-smooth((t-s.flags.effortEnd+.15)/.15));p.body+=4*Math.sin((t-s.flags.effortStart)*18)*e;}
 const shoulder=add(origin,polar(rad(p.body)+angle,length[1])),head=add(shoulder,polar(rad(p.neck)+angle,length[2]));nodes.push(shoulder,head);
 let hands=[add(shoulder,rot(p.h0,angle)),add(shoulder,rot(p.h1,angle))],feet=[add(origin,rot(p.f0,angle)),add(origin,rot(p.f1,angle))];
 let walk=null;
 if(c.walk){const u=(c.walkDistance||0)/110,direction=c.walkDirection||1,originU=c.walkOrigin,here=stage.local(origin),fade=clamp((t-c.walkStart)/.25),targets=[0,.5].map(offset=>{const ph=u+offset,cy=Math.floor(ph),v=ph-cy,plant=originU+direction*((cy+.7-offset)*110),old=plant-direction*110,sw=clamp(v/.42);return{p:stage.world([v<.42?lerp(old,plant,smooth(sw)):plant,810-radius*.195-(v<.42?Math.sin(Math.PI*sw)*20:0)]),stance:v>=.42,phase:v};});
 feet=feet.map((p,i)=>p.map((v,j)=>lerp(v,targets[i].p[j],fade)));const a=Math.sin(u*Math.PI*2)*27;if(!c.walkLegsOnly)hands=[add(shoulder,rot([-a,44],angle)),add(shoulder,rot([a,44],angle))];walk={targets,fade};}
 if(c.reachFloor)hands[0]=add(shoulder,stage.vector([-8,50]));
 let contact=null;
 if(c.handContact==='orb'){hands[1]=[s.orb.x-(s.orb.r+9)*.6,s.orb.y-(s.orb.r+9)*.8];contact={kind:'finger-orb',indices:[6],targets:[hands[1]]};}
 if(c.handContact==='cubeLeft'||c.handContact==='cubeRight'){const sign=c.handContact==='cubeLeft'?-1:1,center=stage.local([s.cube.x,s.cube.y]),x=center[0]+sign*s.cube.size/2;const targets=[stage.world([x,center[1]-12]),stage.world([x,center[1]+10])],u=c.handBlend?smooth((t-c.handBlend.start)/c.handBlend.duration):1;hands=hands.map((p,i)=>p.map((v,j)=>lerp(v,targets[i][j],u)));if(u>.9999)contact={kind:'hands-cube',indices:[4,6],targets};}
 if(c.handContact==='protect'){hands=[add(head,rot([-radius*.8,-radius*.15],angle)),add(head,rot([radius*.8,-radius*.15],angle))];contact={kind:'hands-head',indices:[4,6],targets:hands};}
 if(c.handContact==='particle'&&s.particles[0]){const target=[s.particles[0].x,s.particles[0].y],u=c.particleBlendStart===undefined?1:smooth((t-c.particleBlendStart)/.15);hands[1]=hands[1].map((v,j)=>lerp(v,target[j],u));if(u>.9999)contact={kind:'hand-particle',indices:[6],targets:[target]};}
 if(c.footContact==='orb'){const d=sub([s.orb.x,s.orb.y],origin),v=Math.hypot(...d),target=add([s.orb.x,s.orb.y],mul(d,-s.orb.r/v));const w=smooth((t-(c.footContactStart||t))/.35);feet[1]=feet[1].map((v,j)=>lerp(v,target[j],w));if(w>.9999)contact={kind:'foot-orb',indices:[10],targets:[target]};}
 if(c.releasedFoot){const w=smooth((t-c.releasedFoot.t)/.3);feet[1]=feet[1].map((v,j)=>lerp(c.releasedFoot.p[j],v,w));}
 if(c.footContact==='doubleOrb'){const center=stage.local([s.orb.x,s.orb.y]),off=7,x=center[0]-Math.sqrt(s.orb.r*s.orb.r-off*off);feet=[stage.world([x,center[1]-off]),stage.world([x,center[1]+off])];contact={kind:'double-kick',indices:[8,10],targets:feet};}
 const arms=hands.map((p,i)=>ik(shoulder,p,length[3],length[4],(c.handContact==='cubeLeft'||c.poseName==='grab')?1:c.handContact==='cubeRight'?-1:(i?-1:1))),legs=feet.map((p,i)=>ik(origin,p,length[7],length[8],c.poseName==='crouch'?(i?-1:1):-1));
 nodes.push(arms[0].joint,arms[0].end,arms[1].joint,arms[1].end,legs[0].joint,legs[0].end,legs[1].joint,legs[1].end);
 return{nodes,head,root:origin,r:radius,errors:[...arms,...legs].map(v=>v.error),contact,walk,style:p};}
function record(p,t,previous){const angles=Array(11).fill(0),absolute=Array(11).fill(0);for(let j=1;j<11;j++){const d=sub(p.nodes[j],p.nodes[parents[j]]);absolute[j]=Math.atan2(d[1],d[0]);angles[j]=j===1?absolute[j]:absolute[j]-(parents[j]===0?absolute[1]:absolute[parents[j]]);if(previous){while(angles[j]-previous.angles[j]>Math.PI)angles[j]-=Math.PI*2;while(angles[j]-previous.angles[j]<-Math.PI)angles[j]+=Math.PI*2;}}
 return{t,head:p.head.slice(),r:radius,angles,lengths:length.map(v=>v/radius),shape:[radius,radius,0],segment:0,quality:1};}
window.RigAdapter={pose,record,setPose,style,STYLES,length,radius,parents};
})();
