/* Shared distance-driven locomotion. +Z is forward; y=0 is the support plane. */
(()=>{
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,frac=x=>x-Math.floor(x),smooth=x=>{x=clamp(x);return x*x*x*(10+x*(-15+6*x))};
const add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a),norm=a=>mul(a,1/(len(a)||1));
function joint(a,target,l1,l2,pole=[0,0,1]){
 const delta=sub(target,a),raw=len(delta),d=clamp(raw,Math.abs(l1-l2)+1e-7,l1+l2-1e-7),dir=norm(delta),end=add(a,mul(dir,d));
 let bend=sub(pole,mul(dir,dot(pole,dir)));if(len(bend)<1e-8)bend=sub([1,0,0],mul(dir,dir[0]));bend=norm(bend);
 const along=(l1*l1-l2*l2+d*d)/(2*d),height=Math.sqrt(Math.max(0,l1*l1-along*along));
 return{joint:add(add(a,mul(dir,along)),mul(bend,height)),end,error:Math.abs(raw-d)};
}
function path(points){
 const curve=u=>{if(points.length===2)return points[0].map((v,i)=>lerp(v,points[1][i],u));let a=1-u;return points[0].map((v,i)=>a*a*v+2*a*u*points[1][i]+u*u*points[2][i])};
 let table=[{d:0,p:curve(0)}],total=0;for(let i=1;i<=256;i++){let p=curve(i/256);total+=len(sub(p,table.at(-1).p));table.push({d:total,p})}
 function at(d){let i=1;if(d>=total)i=256;else if(d>0){let lo=1,hi=256;while(lo<hi){let m=(lo+hi)>>1;if(table[m].d<d)lo=m+1;else hi=m}i=lo}let a=table[i-1],b=table[i],q=(d-a.d)/(b.d-a.d||1),p=a.p.map((v,k)=>lerp(v,b.p[k],q)),f=norm(sub(b.p,a.p));return{position:p,forward:f,yaw:Math.atan2(f[0],f[2])}}
 return{length:total,at};
}
function travel(p,local,duration,delay=0,finish=duration){let u=clamp((local-delay)/(finish-delay)),distance=p.length*smooth(u),speed=p.length*30*u*u*(1-u)*(1-u)/(finish-delay);return{...p.at(distance),distance,speed,path:p,local,gait:'walk'}}
const cache=new Map();function route(key,points){if(!cache.has(key))cache.set(key,path(points));return cache.get(key)}
function streetTracks(t,s){let local=clamp(t-s.start,0,s.end-s.start),dur=s.end-s.start,tracks=[];
 const make=(key,points,gait,delay,finish,mode)=>{const p=route(key+':'+s.start,points),v=travel(p,local,dur,delay,finish);return{...v,gait,mode:v.speed>.035?gait:(mode||'breath'),time:t,ground:.13}};
 if(s.two){tracks.push(make('hero',[[-4,0,.5],[8,0,.5]],'run',.3,Math.min(6.5,dur-.5),'relief'));tracks.push(make('friend',[[-4,0,1.6],[3.2,0,1.6]],'walk',.4,dur-.2,'breath'));}
 else if(s.scene==='arrival'){tracks.push(make('arrival',[[-4,0,1.2],[8,0,1.2],[8,0,-1.3]],'run',.15,dur-.4,'relief'));}
 else if(s.action==='run'){tracks.push(make('run',[[-4,0,1.2],[7.5,0,1.2]],'run',.35,dur-.35,'breath'));}
 else if(s.action==='walk'){let points=s.start===0?[[-5,0,1.2],[-1.8,0,1.2]]:s.start>450?[[4.8,0,1.2],[7.5,0,1.2]]:[[-3.5,0,1.2],[1.5,0,1.2]];tracks.push(make('walk',points,'walk',.1,dur-.1,'breath'));}
 else{let x=s.start<18?-1.8:-1.2,p=route('still:'+s.start,[[x,0,1.2],[x+.01,0,1.2]]);tracks.push({...p.at(0),path:p,distance:0,speed:0,time:t,ground:.13,gait:'walk',mode:s.action||'think',local})}
 return tracks;
}
function localToWorld(v,state){let c=Math.cos(state.yaw),s=Math.sin(state.yaw);return[state.position[0]+v[0]*c+v[2]*s,v[1]+(state.ground||0),state.position[2]-v[0]*s+v[2]*c]}
function worldToLocal(v,state){let x=v[0]-state.position[0],z=v[2]-state.position[2],c=Math.cos(state.yaw),s=Math.sin(state.yaw);return[x*c-z*s,v[1]-(state.ground||0),x*s+z*c]}
function pose(state){
 const run=state.gait==='run',stride=run?1.8:1.25,stance=run?.42:.64,amount=smooth(clamp(state.speed/.30)),cycle=state.distance/stride,phase=frac(cycle),t=state.time||0;
 const feet=[],arms=[],legs=[];
 for(let side=0;side<2;side++){
  let sign=side?1:-1,off=side*.5,n=Math.floor(cycle+off),p=frac(cycle+off),touch=(n-off)*stride,lead=stride*stance/2;
  const anchor=d=>{let q=state.path.at(d+lead),v=q.position,c=Math.cos(q.yaw),s=Math.sin(q.yaw);return[v[0]+sign*.15*c,(state.ground||0)+.09,v[2]-sign*.15*s]};
  let a=anchor(touch),b=anchor(touch+stride),supported=p<stance,u=clamp((p-stance)/(1-stance)),world=a.map((v,i)=>lerp(v,b[i],smooth(u)));
  if(supported)world=a;else world[1]+=(run?.28:.14)*16*u*u*(1-u)*(1-u)*amount;
  feet.push({world,local:worldToLocal(world,state),contactYaw:state.path.at(touch+lead).yaw,nextYaw:state.path.at(touch+stride+lead).yaw,supported:supported||amount===0,contact:touch,phase:p,side,amount,swing:u});
 }
 // Raise the pelvis during support instead of keeping both knees permanently crouched.
 // Its height is constrained by BOTH reachable feet; bone lengths never compensate.
 const desired=(run?1.135+.025*Math.cos(4*Math.PI*(phase-.45))*amount:1.17)+.003*Math.sin(t*2)*(1-amount);
 let height=desired;
 for(let f of feet){let hx=(f.side?1:-1)*.14,dx=f.local[0]-hx,z=f.local[2],reach=1.12*.995;height=Math.min(height,f.local[1]+Math.sqrt(Math.max(.01,reach*reach-dx*dx-z*z)));}
 const hip=[0,height,0],lean=run?.17*amount:state.mode==='protect'?.12+.012*Math.sin(t*2):.035*amount,shoulder=[0,height+Math.cos(lean)*.83,Math.sin(lean)*.83],head=[0,shoulder[1]+.43,shoulder[2]+.045];
 for(let side=0;side<2;side++){
  let sign=side?1:-1,f=feet[side],h=[sign*.14,height,0],leg=joint(h,f.local,.56,.56,[0,0,1]);legs.push({hip:h,knee:leg.joint,ankle:leg.end,error:leg.error});f.local=leg.end;
  const sh=[sign*.25,shoulder[1]-.035,shoulder[2]],swing=-Math.cos((phase+side*.5)*Math.PI*2)*amount;
  let hand=[sign*.30,lerp(1.23,1.46,run?amount:0)+(height-1.045),shoulder[2]+(run?.13:.03)+swing*(run?.32:.23)],mode=state.mode;
  if(side===0&&['think','protect','point','relief'].includes(mode)){
   let custom=mode==='think'?[sign*.20,head[1]-.06,head[2]+.22]:mode==='protect'?[sign*.14,head[1]+.15,head[2]+.12]:mode==='point'?[sign*.29,shoulder[1]-.05,.60]:[sign*.30,shoulder[1]-.10,.31];
   let strength=1-amount;hand=hand.map((v,i)=>lerp(v,custom[i],strength));
  }
  let arm=joint(sh,hand,.38,.36,[sign*.6,-.2,-1]);arms.push({shoulder:sh,elbow:arm.joint,hand:arm.end,error:arm.error});
 }
 return{hip,shoulder,head,legs,arms,feet,amount,lean,stride,stance,bob:height-1.13,state};
}
function diagramTrack(t,s,kind='walk',start=0,end=1){let local=t-s.start,dur=s.end-s.start,scale=kind==='walk'?.78:.78,from=kind==='walk'?175:815,to=kind==='walk'?470:1110,p=route('diagram:'+s.start+kind,[[from/(110*scale),0,0],[to/(110*scale),0,0]]),v=travel(p,local,dur,.4,kind==='run'?Math.min(dur*.62,2.3):Math.min(dur-.25,5.4));return{...v,time:t,ground:0,gait:kind,mode:v.speed>.035?kind:'breath',canvasX:v.position[0]*110*scale,canvasScale:scale}}
function puddleTrack(t,s){let p=route('puddle',[[350/110,0,0],[920/110,0,0]]),v=travel(p,s.start===332?t-s.start:4,s.end-s.start,.7,3.3);return{...v,time:t,gait:'run',mode:v.speed>.03?'run':'protect',ground:0}}
window.MotionV2={joint,path,travel,pose,streetTracks,diagramTrack,puddleTrack,localToWorld,worldToLocal,smooth,revision:2};
})();
