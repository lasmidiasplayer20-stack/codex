/* Persistent props use fixed-step integration, explicit gravity, drag, restitution and surface contacts. */
(()=>{'use strict';const S=StoryV6,HZ=120,dt=1/HZ,definitions=[{id:'mug',x:570,y:785,vx:0,vy:0,r:16,angle:0,w:0},{id:'crate',x:715,y:784,vx:0,vy:0,r:22,angle:0,w:0},{id:'bolt',x:800,y:795,vx:0,vy:0,r:10,angle:0,w:0}],states=definitions.map(d=>({...d})),frames=[],impacts=[];
for(let i=0;i<=S.duration*HZ;i++){const t=i/HZ,[gx,gy]=S.gravity(t);
 for(const p of states){
  if(i===Math.round(22*HZ)){p.vx={mug:32,crate:8,bolt:45}[p.id];p.w={mug:1.5,crate:.2,bolt:3}[p.id];}
  p.vx=(p.vx+gx*dt)*Math.exp(-.6*dt);p.vy=(p.vy+gy*dt)*Math.exp(-(gy<0?2.8:.6)*dt);p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle+=p.w*dt;
  let collision=false;
  if(p.y+p.r>806){p.y=806-p.r;if(p.vy>20){p.vy*=-.27;collision=true;}else p.vy=0;p.vx*=.95;p.w*=.94;}
  if(p.y-p.r<325){p.y=325+p.r;if(p.vy< -20){p.vy*=-.24;collision=true;}else p.vy=0;p.w*=.98;}
  if(p.x<510+p.r){p.x=510+p.r;p.vx=Math.abs(p.vx)*.4;}
  if(p.x>1120-p.r){p.x=1120-p.r;p.vx=-Math.abs(p.vx)*.4;}
  if(collision&&t>22)impacts.push({id:`prop-${p.id}-${i}`,t,type:p.id==='mug'?'tap':'bounce',x:p.x,y:p.y,power:p.id==='crate'?.45:.25});
 }
 frames.push(states.map(p=>({...p})));
}
S.propsAt=t=>frames[Math.min(frames.length-1,Math.max(0,Math.round(t*HZ)))];S.propImpacts=impacts;S.physics={hz:HZ,gravity:'explicit normal, inverted and unstable field vectors',integrator:'semi-implicit Euler, drag and restitution',surfaceY:[325,806],frames:frames.length};
})();
