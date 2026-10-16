/* Additive acting direction. Every original pose and every bone length remain intact. */
(() => {
  'use strict';
  const { smooth, lerp, rad, rot, add, sub } = V;
  const cues = [
    // start, end, fade, expressive upper-body pose; feet remain the original contacts.
    [4.15, 5.05, .22, 'curious', { body:-77, neck:-52, h0:[-18,38], h1:[30,16] }],
    [5.15, 6.12, .18, 'watching', { body:-97, neck:-116, h0:[-18,43], h1:[20,32] }],
    [6.23, 7.16, .16, 'startled', { body:-116, neck:-99, h0:[-42,-19], h1:[39,-26] }],
    [7.35, 8.8, .3, 'hesitant', { body:-75, neck:-56, h0:[-12,-25], h1:[31,18] }],
    [12.1, 14.5, .5, 'disbelief', { body:-103, neck:-58, h0:[-32,17], h1:[32,20] }],
    [19.8, 20.45, .18, 'idea', { body:-88, neck:-72, h0:[-24,34], h1:[29,-22] }],
    [22.0, 24.4, .45, 'balancing', { body:-92, neck:-81, h0:[-43,9], h1:[43,12] }],
    [28.6, 29.8, .3, 'groggy', { body:-82, neck:-21, h0:[-24,34], h1:[35,20] }],
    [31.45, 32.25, .2, 'careful', { body:-99, neck:-71, h0:[-28,10], h1:[31,5] }],
    [32.5, 37.35, .35, 'slipping', { body:-113, neck:-81, h0:[-39,-19], h1:[40,-11] }],
    [44.0, 44.9, .18, 'panic', { body:-95, neck:-108, h0:[-42,-24], h1:[40,-23] }],
    [52.0, 54.4, .4, 'confused', { body:-91, neck:-75, h0:[-33,16], h1:[33,14] }],
    [55.55, 56.35, .2, 'watching', { body:-99, neck:-106, h0:[-25,-6], h1:[29,3] }],
    [62.2, 64.6, .3, 'startled', { body:-112, neck:-99, h0:[-39,-24], h1:[38,-25] }],
    [66.95, 67.8, .2, 'determined', { body:-87, neck:-67, h0:[-31,15], h1:[33,-9] }],
    [73.1, 74.75, .3, 'confident', { body:-84, neck:-79, h0:[-24,21], h1:[39,-26] }],
    [76.6, 79.7, .4, 'afraid', { body:-113, neck:-101, h0:[-37,-24], h1:[38,-25] }],
    [80.5, 84.5, .22, 'panic', { body:-96, neck:-107, h0:[-40,-26], h1:[40,-25] }],
    [92.3, 94.6, .35, 'stunned', { body:-98, neck:-105, h0:[-38,-12], h1:[38,-14] }],
    [95.7, 98.2, .55, 'reflecting', { body:-92, neck:-38, h0:[-24,32], h1:[34,14] }],
    [98.45, 101.5, .5, 'studying', { body:-84, neck:-62, h0:[-24,30], h1:[40,-12] }],
    [103.2, 104.8, .32, 'determined', { body:-84, neck:-65, h0:[-29,12], h1:[34,-24] }],
    [113.3, 114.65, .35, 'aftermath', { neck:-32 }],
    [116.1, 116.75, .2, 'groggy', { neck:-65, h0:[-10,-18], h1:[28,20] }],
    [117.8, 118.4, .18, 'checking', { body:-97, neck:-67, h0:[-29,25], h1:[31,24] }],
    [119.3, 119.92, .18, 'relieved', { body:-86, neck:-76, h0:[-34,-13], h1:[34,-15] }],
    [121.82, 122.3, .12, 'suspicious', { body:-95, neck:-126, h0:[-27,12], h1:[28,18] }]
  ];
  function weight(t,a,b,fade) {
    return smooth((t-a)/fade)*(1-smooth((t-b+fade)/fade));
  }
  function current(t) { return cues.find(c => t>=c[0] && t<c[1]); }
  function safe(s,t) {
    const c=s.char;
    if (c.handContact || c.footContact || s.flags.tether || s.flags.approachKick ||
        ['push','pull','grab','stretched','kick','protect'].includes(c.poseName)) return 0;
    if (s.cube.visible) {
      const d=Math.hypot(s.cube.x-c.x,s.cube.y-c.y);
      return smooth((d-130)/90);
    }
    return 1;
  }
  function apply(s,t,p) {
    const freedom=safe(s,t),cue=current(t);
    if (cue && freedom) {
      const w=weight(t,...cue.slice(0,3))*freedom;
      for (const [k,value] of Object.entries(cue[4])) {
        p[k]=Array.isArray(value)?p[k].map((v,i)=>lerp(v,value[i],w)):lerp(p[k],value,w);
      }
    }
    if (!freedom) return p;
    // Neck and shoulder settle with a delay; this is joint acting, never body scaling.
    const rest = !s.char.walk && !s.char.swimming;
    if (rest && !['back','headLift','crouch'].includes(s.char.poseName)) {
      p.neck += Math.sin(t*2.3-.6)*1.7*freedom;
      p.body += Math.sin(t*2.3)*1.1*freedom;
    }
    if (s.char.walk) {
      const phase=(s.char.walkDistance||0)/110*Math.PI*2;
      const dir=s.char.walkDirection||1;
      p.body += (dir*4.5 + Math.sin(phase*2)*1.8)*freedom;
      p.neck += Math.sin(phase-.4)*3*freedom;
    }
    if (s.char.swimming) {
      const q=(t-15)*4.6;
      p.h0=[-34*Math.cos(q),8+27*Math.sin(q)];
      p.h1=[34*Math.cos(q-.35),8-27*Math.sin(q-.35)];
      p.body+=Math.sin(q*.5)*5;
      p.neck+=Math.sin(q*.5-.5)*10;
    }
    if (cue && ['slipping','panic','balancing','afraid'].includes(cue[3])) {
      const w=weight(t,...cue.slice(0,3))*freedom;
      p.h0[0]+=Math.sin(t*9)*3*w;p.h0[1]+=Math.sin(t*9+.8)*5*w;
      p.h1[0]-=Math.sin(t*9+.6)*3*w;p.h1[1]-=Math.sin(t*9+.4)*5*w;
      p.neck+=Math.sin(t*7)*4*w;
    }
    return p;
  }
  function targets(s,t,shoulder,hands,feet) {
    if (!s.char.walk || !safe(s,t)) return hands;
    const phase=(s.char.walkDistance||0)/110*Math.PI*2,dir=s.char.walkDirection||1;
    let h=feet?feet.map(p=>[-V.clamp(V.rot(V.sub(p,[s.char.x,s.char.y]),-s.stage.angle)[0]*1.05,-36,36),38]):[[-34*dir*Math.sin(phase-.15),39],[34*dir*Math.sin(phase-.15),39]];
    if(t>=31.4&&t<32.35)h=[[-27,12],[30,10]];
    if(t>=75&&t<76.3)h=[[-33,-12],[34,-14]];
    if(t>=120&&t<121.65)h=h.map(p=>[p[0],36]);
    return h.map(p=>add(shoulder,rot(p,s.char.angle)));
  }
  function emotion(t) {
    const c=current(t);return c?{name:c[3],weight:weight(t,...c.slice(0,3))}:{name:'neutral',weight:0};
  }
  function noteWalk(s,on,dir) {
    const c=s.char;
    if(on){c.walkRelease=null;if(!(c.poseName==='alarm'&&dir<0))c.performanceFacing=dir;}
    else if(c.walk){const p=RigAdapter.pose(s,s.t);c.walkRelease={start:s.t,offsets:[sub(p.nodes[8],[c.x,c.y]),sub(p.nodes[10],[c.x,c.y])]};}
  }
  function feet(s,t,targets) {
    const q=s.char.walkRelease;
    if(s.char.walk||!q||t-q.start>=.2)return targets;
    const u=smooth((t-q.start)/.2),root=[s.char.x,s.char.y];
    return targets.map((p,i)=>p.map((v,j)=>lerp(root[j]+q.offsets[i][j],v,u)));
  }
  function facing(s,t) {
    if(s.char.handContact==='cubeLeft')return 1;
    if(s.char.handContact==='cubeRight')return -1;
    if(t<65||t>=72.5)return 1;
    if(t<66.75)return -1;
    if(t<68.3)return 1;
    return s.char.performanceFacing||-1;
  }
  function kneeSide(s,t) { return -facing(s,t); }
  function elbowSide(s,t,i) { return s.char.handContact==='protect'?(i?-1:1):facing(s,t); }
  window.CharacterPerformance={apply,targets,emotion,cues,noteWalk,feet,kneeSide,elbowSide,facing};
})();
