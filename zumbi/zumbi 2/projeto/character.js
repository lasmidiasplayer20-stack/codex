(function(root){
'use strict';
const W=1920,H=1080,SW=1280,SH=720,FPS=30;
const Score={beat:.5,walks:{}};
// Camera sees his near side; he faces right. Index 0 stays far, index 1 near.
const rig={facing:1,far:0,near:1,shoulders:[[-6,-201],[8,-198]],hips:[[-5,-133],[7,-133]],
 farSleeve:'#315a59',nearSleeve:'#619a93',farTrouser:'#737e78',farSkin:'#aaa995',farShoe:'#7c8780'};
const cuts=[0,4,9,13.5,19.5,25.5,33,39.5,45.5,52,57,60];
const colors={ink:'#111821',wall:'#18212c',floor:'#10171f',cream:'#eee6d1',teal:'#548d88',amber:'#ecb467',red:'#cc6c60',steel:'#748897',blue:'#2e4359'};
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const mix=(a,b,p)=>a+(b-a)*p;
const smooth=p=>{p=clamp(p);return p*p*(3-2*p);};
const ease=p=>1-Math.pow(1-clamp(p),3);
const hash=n=>{const v=Math.sin(n*61.17+3.14)*17267.8;return v-Math.floor(v);};
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const hit=(t,start,decay=.30)=>t<start?0:smooth((t-start)/.035)*Math.exp(-(t-start)/decay);
function walkAt(t,name){
 const w=Score.walks[name],q=clamp((t-w.start)/Score.beat,0,w.beats),k=Math.min(Math.floor(q),w.beats-1),f=q-k;
 // Hermite easing only at the ends; each contact still falls on a music beat.
 const m0=k===0?0:1,m1=k===w.beats-1?0:1;
 const progress=k+(-2*f*f*f+3*f*f)+(f*f*f-2*f*f+f)*m0+(f*f*f-f*f)*m1;
 const velocity=(-6*f*f+6*f)+(3*f*f-4*f+1)*m0+(3*f*f-2*f)*m1;
 const x=mix(w.from,w.to,progress/w.beats);
 return {x,travel:(x-w.from)/w.scale,cycle:2*(w.to-w.from)/(w.scale*w.beats),gaitWeight:clamp(velocity),active:t>w.start&&t<w.start+w.beats*Score.beat};
}
let C;
function rr(x,y,w,h,r,fill,stroke=null,lw=2){C.beginPath();C.roundRect(x,y,w,h,r);if(fill){C.fillStyle=fill;C.fill();}if(stroke){C.strokeStyle=stroke;C.lineWidth=lw;C.stroke();}}
function ellipse(x,y,rx,ry,fill,stroke=null,lw=2){C.beginPath();C.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){C.fillStyle=fill;C.fill();}if(stroke){C.strokeStyle=stroke;C.lineWidth=lw;C.stroke();}}
function line(points,col,width=2){C.beginPath();points.forEach((p,i)=>i?C.lineTo(...p):C.moveTo(...p));C.strokeStyle=col;C.lineWidth=width;C.lineCap='round';C.lineJoin='round';C.stroke();}
function polygon(points,fill,stroke=null,lw=2){C.beginPath();points.forEach((p,i)=>i?C.lineTo(...p):C.moveTo(...p));C.closePath();if(fill){C.fillStyle=fill;C.fill();}if(stroke){C.strokeStyle=stroke;C.lineWidth=lw;C.stroke();}}
function txt(s,x,y,size=24,color=colors.cream,align='center',bold=false){C.font=`${bold?700:400} ${size}px Film,Arial,sans-serif`;C.fillStyle=color;C.textAlign=align;C.textBaseline='middle';C.fillText(s,x,y);}
function glow(x,y,r,color,alpha=.2){C.save();C.globalAlpha=alpha;const g=C.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color+'00');C.fillStyle=g;C.fillRect(x-r,y-r,r*2,r*2);C.restore();}
function capsule(a,b,w,fill){line([a,b],colors.ink,w+3);line([a,b],fill,w);}
// One continuous sleeve/trouser shape, without overlapping caps at the joint.
function member(a,q,b,w,fill){
 const d1=dist(a,q),d2=dist(q,b),r=Math.min(8,d1*.24,d2*.24);
 const before=[mix(q[0],a[0],r/d1),mix(q[1],a[1],r/d1)],after=[mix(q[0],b[0],r/d2),mix(q[1],b[1],r/d2)];
 C.beginPath();C.moveTo(...a);C.lineTo(...before);C.quadraticCurveTo(...q,...after);C.lineTo(...b);
 C.lineCap='round';C.lineJoin='round';C.strokeStyle=fill;C.lineWidth=w;C.stroke();
}
function shadow(x,y,r=70,a=.45){C.save();C.globalAlpha=a;ellipse(x,y,r,r*.11,'#060a0f');C.restore();}
function transform(p,lean=0,bob=0,sit=0){const y=p[1]+126;return [p[0]*Math.cos(lean)-y*Math.sin(lean),p[0]*Math.sin(lean)+y*Math.cos(lean)-126+bob+sit];}
function limb(a,target,l1,l2,side=1){
 const dx=target[0]-a[0],dy=target[1]-a[1],d=clamp(Math.hypot(dx,dy),Math.abs(l1-l2)+.5,l1+l2-.5),base=Math.atan2(dy,dx);
 const end=[a[0]+Math.cos(base)*d,a[1]+Math.sin(base)*d];
 const q=base+side*Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));
 return {joint:[a[0]+Math.cos(q)*l1,a[1]+Math.sin(q)*l1],end};
}
function pose(t,mode,opts={}){
 const floorSitting=mode==='floorSit',defaultSit=floorSitting?95:(mode==='sit'||mode==='radio'?45:0),sit=opts.sit===undefined?defaultSit:clamp(opts.sit,0,95),sitting=sit>.001;
 const fear=clamp(opts.fear||0),recoil=clamp(opts.recoil||0);
 let lean=(opts.lean??(mode==='push'?.20:mode==='listen'?-.045:mode==='reach'?.04:0))-recoil*.11;
 let bob=Math.sin(t*2.1)*.55+fear*3+recoil*10;
 const stepping=mode==='walk'||mode==='run'||mode==='push';
 const travel=opts.travel||0,cycle=opts.cycle||92,phase=((travel/cycle)%1+1)%1,weight=clamp(opts.gaitWeight??1);
 if(stepping)bob+=weight*(mode==='run'?8+Math.cos(phase*Math.PI*4)*7:2+Math.cos(phase*Math.PI*4)*1.3);
 let T=q=>transform(q,lean,bob,sit);
 let leftFoot=[-12,-8],rightFoot=[18,-8];
 if(stepping){
  // During stance, root travel and foot offset cancel exactly in world space.
  // The gait is driven by distance, including acceleration and braking.
  const step=(x,off)=>{const ph=(phase+off)%1,stance=mode==='run'?.39:.64,sw=clamp((ph-stance)/(1-stance)),a=cycle*stance/2;
   return [x+(ph<(mode==='run'?.39:.64)?a-cycle*ph:mix(-a,a,smooth(sw))),-8-Math.sin(sw*Math.PI)*(mode==='run'?46:22)*weight];};
  leftFoot=step(rig.hips[0][0],0);rightFoot=step(rig.hips[1][0],.5);
 }
 if(sitting){const seat=clamp(sit/45);leftFoot=floorSitting?[62,-8]:[mix(-12,39,seat),-8];rightFoot=floorSitting?[81,-8]:[mix(18,61,seat),-8];}
 // Explicit foot targets let a seated actor rise and plant each foot before walking.
 if(opts.feet){leftFoot=opts.feet[0].slice();rightFoot=opts.feet[1].slice();}
 // Lower the pelvis when necessary; the solver must never lift a planted foot.
 for(const [hip,foot] of [[rig.hips[0],leftFoot],[rig.hips[1],rightFoot]]){
  const h=T(hip),maxY=Math.sqrt(Math.max(1,125.25**2-(foot[0]-h[0])**2));
  bob+=Math.max(0,foot[1]-h[1]-maxY);T=q=>transform(q,lean,bob,sit);
 }
 const p={head:T([7,-250]),pelvis:T([0,-126]),ls:T(rig.shoulders[0]),rs:T(rig.shoulders[1]),lh:T(rig.hips[0]),rh:T(rig.hips[1]),lean,bob,sit,phase,facing:opts.facing||rig.facing};
 p.legs=[limb(p.lh,leftFoot,63,63,-1),limb(p.rh,rightFoot,63,63,-1)];
 let l=T([-14,-113]),r=T([17,-110]);
 if(stepping&&mode!=='push'){
  const swing=Math.sin(phase*Math.PI*2)*(mode==='run'?43:25)*weight;
  l=T([-6-swing,-113+Math.abs(swing)*.15]);r=T([8+swing,-110+Math.abs(swing)*.15]);
 }
 if(mode==='pack'){l=T([45,-155]);r=T([78,-183]);}
 if(mode==='push'){l=T([62,-173]);r=T([83,-159]);}
 if(mode==='listen'){r=T([40,-224]);l=T([-14,-115]);}
 if(mode==='sit'||floorSitting){l=T([-18,-121]);r=T([68,-160]);}
 if(mode==='radio'){l=T([-16,-125]);r=[91,-167+Math.sin(t*3)*1.2];}
 if(mode==='reach'){r=[82,-199];}
 if(mode==='hope'){r=T([52,-191]);}
 const listening=clamp(opts.listen||0);
 if(listening){const a=T([-14,-115]),b=T([37,-222]);l=[mix(l[0],a[0],listening),mix(l[1],a[1],listening)];r=[mix(r[0],b[0],listening),mix(r[1],b[1],listening)];}
 if(recoil){const a=T([5,-175]),b=T([48,-202]);l=[mix(l[0],a[0],recoil),mix(l[1],a[1],recoil)];r=[mix(r[0],b[0],recoil),mix(r[1],b[1],recoil)];}
 if(opts.reach)r=opts.reach;
 if(opts.farReach)l=opts.farReach;
 // One elbow branch for the whole shot. No branch blending or limb swapping.
 p.arms=[limb(p.ls,l,47,48,1),limb(p.rs,r,47,48,1)];
 p.far={shoulder:p.ls,hip:p.lh,arm:p.arms[0],leg:p.legs[0]};
 p.near={shoulder:p.rs,hip:p.rh,arm:p.arms[1],leg:p.legs[1]};
 return p;
}
function shoe(p,far=false){C.save();C.translate(...p);rr(-11,-2,29,10,5,far?rig.farShoe:'#c9c7b9',colors.ink,1.3);line([[9,1],[15,1]],far?'#997f50':colors.amber,2.5);C.restore();}
function hand(p,rot=0,far=false){C.save();C.translate(...p);C.rotate(rot);ellipse(0,0,7,8,far?rig.farSkin:colors.cream);line([[3,0],[7,4]],far?'#7b8477':'#a09b8d',.9);C.restore();}
function face(x,y,t,mood='worried',lean=0,opts={}){
 const scared=mood==='scared',fear=clamp(opts.fear||0),look=clamp(opts.look??1,-1,1),lookY=clamp(opts.lookY??0,-1,1)*2.7;
 C.save();C.translate(x,y);C.rotate(lean*.32+(opts.headTilt||0));
 C.beginPath();C.moveTo(-27,-23);C.bezierCurveTo(-40,-3,-31,31,-13,39);C.bezierCurveTo(10,46,30,33,29,18);C.quadraticCurveTo(40,17,36,10);C.lineTo(29,2);C.bezierCurveTo(33,-15,26,-33,9,-40);C.bezierCurveTo(-8,-46,-20,-40,-27,-23);C.closePath();C.fillStyle=colors.cream;C.fill();C.strokeStyle=colors.ink;C.lineWidth=2.3;C.stroke();
 ellipse(-28,8,4,6,'#c5bba1');line([[-29,6],[-27,9]],'#a89c81',1);
 // Character variants share the approved face and rig; hair changes the silhouette.
 const variant=opts.variant||'hero';
 if(variant==='elder'){
  C.beginPath();C.moveTo(-33,-18);C.bezierCurveTo(-42,-47,-18,-58,0,-43);C.bezierCurveTo(29,-57,42,-31,29,-10);C.lineTo(22,-19);C.quadraticCurveTo(8,-27,-5,-37);C.quadraticCurveTo(-20,-19,-33,-18);C.closePath();C.fillStyle='#c4c5b6';C.fill();C.strokeStyle=colors.ink;C.lineWidth=1.3;C.stroke();ellipse(-31,-34,12,12,'#c4c5b6',colors.ink,1.2);line([[-12,-8],[-2,-10]],colors.ink,1);
 }else if(variant==='civilian'){C.beginPath();C.moveTo(-33,-20);C.quadraticCurveTo(-38,-53,6,-47);C.quadraticCurveTo(30,-47,33,-15);C.lineTo(22,-28);C.quadraticCurveTo(7,-17,-3,-30);C.lineTo(-25,-15);C.closePath();C.fillStyle=opts.hairColor||'#383e42';C.fill();}else if(variant==='woman'){
  C.beginPath();C.moveTo(-33,18);C.bezierCurveTo(-54,-50,18,-70,36,-21);C.lineTo(41,44);C.lineTo(29,48);C.lineTo(24,-9);C.quadraticCurveTo(10,-27,-20,-20);C.lineTo(-24,41);C.lineTo(-43,45);C.closePath();C.fillStyle='#242b30';C.fill();
 }else if(variant==='police'){
  rr(-36,-34,71,20,5,'#243d54',colors.ink,2);polygon([[-33,-34],[-21,-49],[20,-49],[33,-34]],'#324d67',colors.ink,2);rr(3,-27,40,6,3,'#172a3b');ellipse(0,-28,5,6,'#c3a66b');
 }else if(variant==='worker'){
  C.beginPath();C.moveTo(-35,-21);C.quadraticCurveTo(-30,-49,17,-44);C.lineTo(32,-20);C.closePath();C.fillStyle='#516b69';C.fill();rr(-35,-25,80,9,4,'#769791',colors.ink,2);
 }else if(variant==='infected'){
  polygon([[-31,-20],[-25,-44],[-10,-31],[-4,-49],[15,-35],[29,-31],[35,-13]],'#203232');
 }else{
  C.beginPath();C.moveTo(-34,-20);C.bezierCurveTo(-32,-53,26,-55,34,-20);C.closePath();C.fillStyle=opts.hatShade||'#bb8c50';C.fill();C.strokeStyle=colors.ink;C.lineWidth=2;C.stroke();rr(-35,-26,70,13,5,colors.amber,colors.ink,2);
  for(let k=-2;k<=2;k++)line([[k*10,-40],[k*10,-29]],opts.hatShade||'#d09d5c',1);
 }
 const blink=(opts.closed||0)>.75||(!scared&&Math.pow(Math.max(0,Math.sin(t*1.95)),45)>.54);
 const hopeful=mood==='hope',alert=mood==='alert',tired=mood==='tired';
 const ey=(alert?2:5)+lookY;
 if(blink){line([[-5,ey],[2,ey+1]],colors.ink,2);line([[13,ey],[21,ey+1]],colors.ink,2);}
 else if(tired){line([[-5,ey],[2,ey+1]],colors.ink,2.4);line([[13,ey],[22,ey+1]],colors.ink,2.4);ellipse(0,ey+3,1.8,2.4,colors.ink);ellipse(18,ey+3,2.1,2.5,colors.ink);}
 else if(scared){for(const [ex,size] of [[-1,.78],[18,1]]){ellipse(ex,2,7*size,10*size,'#fcf8e9');ellipse(ex+look*2.3,2,2.6*size,5.6*size,colors.ink);}line([[-7,14],[-1,16]],'#bdac92',1);}
 else {ellipse(-1+look,ey,alert?3:2.3,alert?5:4.0,colors.ink);ellipse(18+look,ey,alert?3.8:3,alert?6:4.7,colors.ink);}
 if(hopeful){line([[-7,-6],[2,-9]],colors.ink,1.8);line([[12,-9],[23,-6]],colors.ink,1.8);}
 else if(alert||scared){line([[-8,-10-fear*2],[2,-15-fear]],colors.ink,1.8);line([[11,-15-fear],[23,-10-fear*2]],colors.ink,1.8);}
 else {line([[-8,-4],[2,-9]],colors.ink,1.8);line([[11,-9],[23,-4]],colors.ink,1.8);}
 C.beginPath();if(opts.mouthOpen>.05){C.ellipse(23,25,5,2+opts.mouthOpen*3,0,0,Math.PI*2);C.fillStyle=colors.ink;C.fill();}else if(opts.chew>.01){C.moveTo(5,25);C.quadraticCurveTo(15,25+Math.sin(t*9)*1.6*opts.chew,24,25);}else if(hopeful){C.moveTo(3,24);C.quadraticCurveTo(14,28,24,22);}else if(scared){C.moveTo(7,25);C.quadraticCurveTo(15,21+Math.sin(t*24)*fear,23,26);}else if(alert){C.ellipse(15,25,4,5,0,0,Math.PI*2);}else{C.moveTo(3,26);C.quadraticCurveTo(14,20,24,26);}C.strokeStyle=colors.ink;C.lineWidth=1.9;C.stroke();
 if(scared&&fear>.4){const sy=mix(-1,21,(t*.23)%1);ellipse(-27,sy,1.8,3.5,'#9dbabd');}
 C.restore();
}
function actor(x,y,s,t,mode='idle',opts={}){
 const oldColors={...colors},oldRig={...rig};
 if(opts.palette){Object.assign(colors,opts.palette.colors||{});Object.assign(rig,opts.palette.rig||{});}

 const p=pose(t,mode,{...opts,scale:s});C.save();C.translate(x,y);C.scale(s*p.facing,s);
 if(opts.bag){rr(-48+p.head[0]*.3,-188+p.sit+p.bob,33,70,9,'#9b7854',colors.ink,3);line([[-35,-180+p.sit],[-21,-190+p.sit]],'#ceb58f',4);}
 // Entire far limbs, including hands/feet, stay behind the body in every pose.
 member(p.far.hip,p.far.leg.joint,p.far.leg.end,14,rig.farTrouser);shoe(p.far.leg.end,true);
 member(p.far.shoulder,p.far.arm.joint,p.far.arm.end,15,rig.farSleeve);hand(p.far.arm.end,-.3,true);
 member(p.near.hip,p.near.leg.joint,p.near.leg.end,14,colors.nearTrouser||'#b2b4a9');shoe(p.near.leg.end);
 const T=q=>transform(q,p.lean,p.bob,p.sit);
 C.beginPath();C.moveTo(...T([-24,-206]));C.bezierCurveTo(...T([-34,-186]),...T([-25,-149]),...T([-27,-126]));C.quadraticCurveTo(...T([0,-117]),...T([28,-126]));C.bezierCurveTo(...T([24,-152]),...T([35,-186]),...T([24,-206]));C.quadraticCurveTo(...T([0,-217]),...T([-24,-206]));C.closePath();C.fillStyle=colors.teal;C.fill();
 polygon([T([-24,-200]),T([-12,-205]),T([-11,-124]),T([-25,-127])],colors.sideTorso||'#447c77');
 line([T([-19,-132]),T([21,-132])],'#35615e',3);line([T([6,-198]),T([6,-176])],'#94b5a5',1.4);line([T([15,-198]),T([15,-179])],'#94b5a5',1.4);
 member(T([7,-198]),p.near.arm.joint,p.near.arm.end,15,rig.nearSleeve);
 face(...p.head,t,opts.mood||(mode==='sit'?'tired':'worried'),p.lean,opts);
 hand(p.near.arm.end,opts.handAngle??.3);
 if(opts.bottle){const q=p.arms[1].end;bottle(q[0]+5,q[1]+18,.48);}
 C.restore();Object.assign(colors,oldColors);Object.assign(rig,oldRig);return geometry(p,x,y,s,opts);
}
function geometry(p,x,y,s,opts={}){
 const world=q=>[x+q[0]*s*p.facing,y+q[1]*s];
 const angle=p.lean*.32+(opts.headTilt||0),mouth=[p.head[0]+24*Math.cos(angle)-25*Math.sin(angle),p.head[1]+24*Math.sin(angle)+25*Math.cos(angle)];
 return {right:world(p.near.arm.end),left:world(p.far.arm.end),head:world(p.head),mouth:world(mouth),
  shoulders:[world(p.far.shoulder),world(p.near.shoulder)],pelvis:world(p.pelvis),
  feet:[world(p.far.leg.end),world(p.near.leg.end)],soles:[world([p.far.leg.end[0],p.far.leg.end[1]+8]),world([p.near.leg.end[0],p.near.leg.end[1]+8])],
  phase:p.phase,pose:p,root:[x,y],scale:s,facing:p.facing};
}

function renderActor(ctx,x,y,s,t,mode='idle',opts={}){C=ctx;return actor(x,y,s,t,mode,opts);}
const Rig={renderActor,pose,geometry,rig};
if(typeof module!=='undefined'&&module.exports)module.exports=Rig;else root.CharacterRig=Rig;
})(typeof globalThis!=='undefined'?globalThis:this);
