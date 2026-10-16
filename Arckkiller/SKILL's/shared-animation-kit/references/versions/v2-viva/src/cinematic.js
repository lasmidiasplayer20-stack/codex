/* A continuous, authored lens track. World gravity and the rig never depend on the camera. */
(() => {
  'use strict';
  const {rot,add,sub,lerp,smooth,clamp}=V,originalAt=Camera.at;
  const lens=[
    [0,1.65],[1.2,2.35],[3.7,2.85],[4.6,3.15],
    [5.35,1.45],[6.45,2.55],[8.65,3],[10.8,3.65],
    [12.1,2.7],[14.6,2.75],[18.5,3],[20.65,3.1],[21.3,2.35],[23.8,2.9],
    [25.15,1.55],[26.4,1.8],[27.3,3.15],[29.6,3.5],[31.25,2.7],
    [32.7,2.35],[36.8,2],[38.5,2.45],[39.3,1.55],[41.5,1.35],[44.4,1.05],
    [45.6,1.75],[48.8,1.3],[50.5,1.65],[52,2.35],[54.5,2.8],[55.7,1.35],
    [56.8,3.1],[58.5,3.5],[60.8,2.7],[63.7,2.8],[65.4,2.05],[67.1,1.85],
    [69.6,2.7],[71.3,3.25],[73.2,3.35],[75.7,2.2],[78.7,1.8],[80.7,1.5],
    [83,1.45],[85.6,2.4],[87.2,2.45],[89.4,2.1],[91.25,2.7],[92.1,1.7],
    [94.5,2.45],[96.7,3.6],[99.5,4],[102.2,4.1],[104.4,3.55],[105.8,2.3],
    [107.4,2.15],[109.1,3.15],[110.3,2.7],[111.2,1.35],[113.8,2],
    [115,2.9],[117.5,3.15],[119.2,3],[121.2,3.15],[123.3,3.5],[125,3.5]
  ];
  // Motivated editorial cuts; the physical world continues without resetting.
  const inserts=[
    [4.15,5.05,'upper',5.2,'curiosidade'],
    [10.7,11.5,'finger',6.6,'toque'],
    [20.55,21.12,'body-orb',3.9,'chute'],
    [27.8,29.3,'upper',5,'cansaco'],
    [33.1,33.75,'feet',5.3,'escorregao'],
    [38.45,38.88,'upper',4.8,'parede'],
    [57.2,58.95,'hands-cube',4.8,'esforco'],
    [61.4,61.95,'hands-cube',4.5,'inversao'],
    [73,74.3,'upper',5.8,'ideia'],
    [78.5,79.65,'orb',4,'ameaca'],
    [85.55,86.1,'hands-cube',4.8,'agarre'],
    [90.7,91.55,'body-orb',3.7,'chute-duplo'],
    [101.75,102.6,'particle',6.8,'descoberta'],
    [109.2,109.78,'hands-cube',4.8,'lancamento'],
    [110.33,110.72,'collision',4.4,'colisao'],
    [113.3,114.3,'upper',4.8,'reacao-final'],
    [114.3,115,'orb',4.2,'colapso'],
    [121.65,122.2,'upper',5.3,'desconfianca'],
    [123.45,125,'upper-apple',4.8,'ultima-surpresa']
  ].map(([start,end,scope,zoom,name])=>({start:Math.round(start*24)/24,end:Math.round(end*24)/24,scope,zoom,name}));
  const cuts=[...new Set(inserts.flatMap(q=>[q.start,q.end]))].sort((a,b)=>a-b);
  const shot=t=>inserts.find(q=>t>=q.start-1e-8&&t<q.end-1e-8)||null;
  function insertTarget(s,t,rotation,info){
    const scope=info.scope,ids=scope==='feet'||scope==='feet-orb'?[8,10]:scope==='particle'?[5,6]:scope==='finger'?[5,6]:scope==='orb'||scope==='collision'?[]:scope==='body-orb'?[0,1,2,3,4,5,6,7,8,9,10]:[1,2,3,4,5,6];
    let a={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
    for(const j of ids){const q=rot(s.poseNodes[j],-rotation),r=j===2?RigAdapter.radius:8;a.left=Math.min(a.left,q[0]-r);a.right=Math.max(a.right,q[0]+r);a.top=Math.min(a.top,q[1]-r);a.bottom=Math.max(a.bottom,q[1]+r);}
    if(!ids.length){const q=rot([s.orb.x,s.orb.y],-rotation),r=Math.max(35,s.orb.r+18);a={left:q[0]-r,right:q[0]+r,top:q[1]-r,bottom:q[1]+r};}
    if(['finger','feet-orb','body-orb'].includes(scope))include(a,[s.orb.x,s.orb.y],s.orb.r+12,rotation,1);
    if(['hands-cube','collision'].includes(scope))include(a,[s.cube.x,s.cube.y],s.cube.size*.77,rotation,1);
    if(scope==='particle'&&s.particles[0])include(a,[s.particles[0].x,s.particles[0].y],15,rotation,1);
    if(scope==='upper-apple'&&s.apple.visible)include(a,[s.apple.x,s.apple.y],18,rotation,1);
    const zoom=Math.min(info.zoom,1480/Math.max(100,a.right-a.left),800/Math.max(90,a.bottom-a.top));
    return{focus:rot([(a.left+a.right)/2,(a.top+a.bottom)/2],rotation),zoom,rotation};
  }
  function interpolate(keys,t){let i=1;while(i<keys.length-1&&keys[i][0]<t)i++;const a=keys[i-1],b=keys[i];return lerp(a[1],b[1],smooth((t-a[0])/(b[0]-a[0])));}
  function fade(t,a,b){return smooth((t-a)/(b-a));}
  function bounds(s,rotation){
    const points=s.poseNodes.map((p,j)=>({p:rot(p,-rotation),r:j===2?RigAdapter.radius:7}));
    const a={left:Infinity,right:-Infinity,top:Infinity,bottom:-Infinity};
    for(const q of points){a.left=Math.min(a.left,q.p[0]-q.r);a.right=Math.max(a.right,q.p[0]+q.r);a.top=Math.min(a.top,q.p[1]-q.r);a.bottom=Math.max(a.bottom,q.p[1]+q.r);}
    return a;
  }
  function include(a,p,r,rotation,w){if(w<=0)return;const q=rot(p,-rotation);a.left=lerp(a.left,Math.min(a.left,q[0]-r),w);a.right=lerp(a.right,Math.max(a.right,q[0]+r),w);a.top=lerp(a.top,Math.min(a.top,q[1]-r),w);a.bottom=lerp(a.bottom,Math.max(a.bottom,q[1]+r),w);}
  function importance(t){
    let orb=0,cube=0;
    if(t>=5.5&&t<21.2)orb=fade(t,5.5,6.3)*(1-fade(t,20.9,21.2));
    if(t>=25&&t<26.8)orb=fade(t,25.2,25.9)*(1-fade(t,26.35,26.8));
    if(t>=30.7&&t<32.3)orb=fade(t,30.7,31.5)*(1-fade(t,31.9,32.3));
    if(t>=55.5&&t<71.9)cube=fade(t,55.5,56.6)*(1-fade(t,71.4,71.9));
    if(t>=60.5&&t<64.8)orb=fade(t,60.5,61.5)*(1-fade(t,64,64.8));
    if(t>=75&&t<85)orb=1;
    if(t>=85&&t<90)cube=1;
    if(t>=87.5&&t<94.5)orb=fade(t,87.5,89)*(1-fade(t,92.4,94.5));
    if(t>=107.1&&t<111.5)cube=fade(t,107.1,108.5)*(1-fade(t,110.7,111.5));
    if(t>=109.7&&t<115)orb=fade(t,109.7,110.5);
    if(t>=115)orb=.6;
    return{orb,cube};
  }
  function target(s,t){
    const rotation=originalAt(s,t).rotation,insert=shot(t);if(insert)return insertTarget(s,t,rotation,insert);const a=bounds(s,rotation),w=importance(t);
    if(s.orb.visible&&s.orb.y>-1000)include(a,[s.orb.x,s.orb.y],s.orb.r+12,rotation,w.orb);
    if(s.cube.visible)include(a,[s.cube.x,s.cube.y],s.cube.size*.8,rotation,w.cube);
    if(t>=99&&t<103&&s.particles[0])include(a,[s.particles[0].x,s.particles[0].y],15,rotation,.7);
    const zoom=Math.min(interpolate(lens,t),1450/Math.max(180,a.right-a.left),790/Math.max(170,a.bottom-a.top));
    let q=[(a.left+a.right)/2,(a.top+a.bottom)/2];
    if(t<.8)q[0]+=lerp(625,110,smooth(t/.8));
    else if(t<4.1)q[0]+=65;
    // Lead a fast subject slightly, while leaving space for the direction of action.
    const v=rot([s.char.vx,s.char.vy],-rotation);
    if(w.orb<.2&&w.cube<.2&&t>=30&&t<55)q[0]+=clamp(v[0]*.09,-110,110);
    return{focus:rot(q,rotation),zoom:clamp(zoom,.75,4.1),rotation};
  }
  function build(sim){
    const track=[];let focus,zoom;
    for(let i=0;i<sim.states.length;i++){
      const s=sim.states[i],t=s.t,q=target(s,t),reset=i===0||Math.abs(t-115)<1e-7||cuts.some(c=>Math.abs(t-c)<1e-7);
      if(reset){focus=q.focus.slice();zoom=q.zoom;}
      else{const alpha=1-Math.exp(-1/120/.105),az=1-Math.exp(-1/120/.19);focus=focus.map((v,j)=>lerp(v,q.focus[j],alpha));zoom=lerp(zoom,q.zoom,az);}
      track.push({focus:focus.slice(),zoom,rotation:q.rotation});
    }
    return track;
  }
  const track=build(SIM);
  const jolts=SIM.events.filter(e=>['orb-impact','character-impact','cube-impact','kick','double-kick','chaos-wave','decisive-collision','apple-hit','spring-wall'].includes(e.type));
  function at(s,t){
    const index=clamp(t*120,0,track.length-1),i=Math.floor(index),u=index-i,a=track[i],b=track[Math.min(i+1,track.length-1)];
    const c={focus:a.focus.map((v,j)=>lerp(v,b.focus[j],u)),zoom:lerp(a.zoom,b.zoom,u),rotation:lerp(a.rotation,b.rotation,u)};
    let dx=0,dy=0,roll=0;
    for(const e of jolts){const age=t-e.t;if(age<0||age>.6)continue;let amp=e.type==='decisive-collision'?21:e.type==='apple-hit'?8:e.type==='double-kick'?14:e.type==='chaos-wave'?7:clamp((e.incoming||200)/80,2,12);const env=(1-Math.exp(-age*100))*Math.exp(-age*10);dx+=Math.sin(age*47)*amp*.55*env;dy+=Math.sin(age*58+.3)*amp*env;roll+=Math.sin(age*42)*.00045*amp*env;}
    c.focus=sub(c.focus,rot([dx/c.zoom,dy/c.zoom],c.rotation));c.rotation+=roll;
    return c;
  }
  window.Cinematic={at,track,lens,importance,inserts,cuts,shot,originalAt};Camera.at=at;
})();
