/* Reusable 2D rig. Root is the pelvis; camera never changes anatomy.
   Targets, contacts and timing are authored. No frame outlines or masks. */
(()=>{'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,u)=>a+(b-a)*u;
const add=(a,b)=>a.map((x,i)=>x+b[i]),sub=(a,b)=>a.map((x,i)=>x-b[i]);
const polar=(angle,length)=>[Math.cos(angle)*length,Math.sin(angle)*length];
const radians=x=>x*Math.PI/180;
const travelEase=Motion.cubicBezier(1/3,0,2/3,1);
function interval(keys,t){let i=0;while(i+1<keys.length&&keys[i+1].t<=t)i++;return i;}
function value(keys,t,field){const i=interval(keys,t),a=keys[i],b=keys[Math.min(i+1,keys.length-1)],dt=b.t-a.t;if(!dt)return a[field];
 const u=clamp((t-a.t)/dt,0,1),p=keys[Math.max(0,i-1)],q=keys[Math.min(keys.length-1,i+2)],read=k=>k[field];
 const scalar=(a0,b0,p0,q0)=>{const d=(b0-a0)/dt;
  const bound=v=>d*v<=0?0:Math.sign(d)*Math.min(Math.abs(v),Math.abs(d)*2);
  const m0=bound((b0-p0)/Math.max(1e-6,b.t-p.t)),m1=bound((q0-a0)/Math.max(1e-6,q.t-a.t));
  return (2*u**3-3*u*u+1)*a0+(u**3-2*u*u+u)*dt*m0+(-2*u**3+3*u*u)*b0+(u**3-u*u)*dt*m1;};
 const av=read(a),bv=read(b),pv=read(p),qv=read(q);
 return Array.isArray(av)?av.map((x,j)=>scalar(x,bv[j],pv[j],qv[j])):scalar(av,bv,pv,qv);
}
function foot(keys,t){const i=interval(keys,t),a=keys[i],b=keys[Math.min(i+1,keys.length-1)];if(a.t===b.t)return a.p.slice();
 const u=clamp((t-a.t)/(b.t-a.t),0,1),e=travelEase(u),p=a.p.map((x,j)=>mix(x,b.p[j],e));
 p[1]-=(a.lift||0)*Math.sin(Math.PI*u);return p;
}
function ik(root,target,l1,l2,side){const d=sub(target,root),distance=Math.hypot(...d),length=clamp(distance,Math.abs(l1-l2)+.00001,l1+l2-.00001),angle=Math.atan2(d[1],d[0]),alpha=Math.acos(clamp((l1*l1+length*length-l2*l2)/(2*l1*length),-1,1));
 return {joint:add(root,polar(angle+side*alpha,l1)),end:add(root,polar(angle,length)),error:Math.max(0,distance-length)};
}
function torso(root,body,neck,profile){const shoulder=add(root,polar(radians(body),profile.torso)),head=add(shoulder,polar(radians(neck),profile.neck));return {shoulder,head};}
function walkingFeet(track,walk,root,t){const origin=value(track.keys,walk.start,'root')[0],direction=walk.direction,stride=walk.stride||110,progress=(root[0]-origin)*direction/stride;
 return [0,.5].map(offset=>{const phase=progress+offset,cycle=Math.floor(phase),u=phase-cycle,reach=stride*.3,plant=origin+direction*((cycle+.4-offset)*stride+reach),previous=plant-direction*stride;
  if(u<.4){const swing=u/.4;return [mix(previous,plant,travelEase(swing)),walk.floor-Math.sin(Math.PI*swing)*(walk.lift||24)];}return [plant,walk.floor];});}
function at(track,t){if(t<track.start||t>=track.end)return null;
 const profile=track.profile,root=value(track.keys,t,'root'),body=value(track.keys,t,'body'),neck=value(track.keys,t,'neck');
 const air=track.airborne?.find(([a,b])=>a<=t&&t<b);
 let feet=track.feet.map(keys=>{if(!air)return foot(keys,t);const [a,b]=air,local=keys.filter(k=>a<k.t&&k.t<b).map(k=>({...k,p:sub(k.p,value(track.keys,k.t,'root'))}));
  local.unshift({t:a,p:sub(foot(keys,a),value(track.keys,a,'root')),lift:keys[interval(keys,a)].lift||0});local.push({t:b,p:sub(foot(keys,b),value(track.keys,b,'root'))});return add(root,foot(local,t));});
 const walk=track.walks?.find(w=>w.start<=t&&t<w.end);if(walk&&!air){const targets=walkingFeet(track,walk,root,t),fade=clamp(Math.min((t-walk.start)/.15,(walk.end-t)/.15),0,1),blend=travelEase(fade);feet=feet.map((p,i)=>p.map((x,j)=>mix(x,targets[i][j],blend)));}
 // Move the pelvis inside the reach of both supporting legs, instead of
 // stretching a limb or scaling the character to reach the floor.
 if(!air){
  for(let pass=0;pass<4;pass++)for(const f of feet){const d=sub(f,root),distance=Math.hypot(...d),limit=profile.leg[0]+profile.leg[1]-.1;if(distance>limit){root[0]+=d[0]*(1-limit/distance);root[1]+=d[1]*(1-limit/distance);}}
 }
 const {shoulder,head}=torso(root,body,neck,profile),hands=[value(track.keys,t,'hand0'),value(track.keys,t,'hand1')];
 const sides=track.armSidesAt?track.armSidesAt(t):track.armSides;
 if(track.armSwitch){const {time,duration,index}=track.armSwitch,u=(t-time)/duration;if(Math.abs(u)<1){const d=sub(hands[index],shoulder),len=Math.hypot(...d),reach=profile.arm[0]+profile.arm[1]-.00001,weight=(1-u*u)**2,targetLength=mix(Math.min(len,reach),reach,weight);hands[index]=add(shoulder,d.map(x=>x/Math.max(.001,len)*targetLength));}}
 const arms=hands.map((p,i)=>ik(shoulder,p,...profile.arm,sides[i]));
 const legs=feet.map((p,i)=>ik(root,p,...profile.leg,(track.kneeSides||[track.kneeSide,track.kneeSide])[i]));
 const nodes=[root,shoulder,head,arms[0].joint,arms[0].end,arms[1].joint,arms[1].end,legs[0].joint,legs[0].end,legs[1].joint,legs[1].end];
 const offset=track.stagingOffsets?.find(o=>o.start<=t&&t<o.end);if(offset){for(const p of nodes){p[0]+=offset.x;p[1]+=offset.y;}for(const p of [...feet,...hands]){p[0]+=offset.x;p[1]+=offset.y;}}
 return {nodes,root,shoulder,head,profile,r:profile.radius,color:track.color,hollow:track.hollow,damage:track.damage?.(t),faceRoll:track.faceRoll?.(t)||0,targets:{feet,hands},errors:[...arms,...legs].map(x=>x.error),t};
}
function attachArm(actor,index,target,side){const p=actor.profile,j=index?5:3,result=ik(actor.shoulder,target,...p.arm,side);actor.nodes[j]=result.joint;actor.nodes[j+1]=result.end;actor.errors[index]=result.error;return result;}
window.Rig={at,ik,attachArm,value,foot,interval,torso,radians,polar,add,sub,clamp,walkingFeet};
})();
