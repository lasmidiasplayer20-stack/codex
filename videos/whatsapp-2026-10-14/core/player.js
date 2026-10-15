(()=>{'use strict';
const P=PART,A=Art,R=Rig;
function actors(t){const orange=R.at(P.tracks.orange,t),red=R.at(P.tracks.red,t);
 if(orange&&P.transfer<=t&&t<P.transfer+.05){const redAt=R.at(P.tracks.red,P.transfer),angle=R.radians(R.value(P.blade,P.transfer,'angle')),anchor=redAt.nodes[4].map((v,j)=>v+[Math.cos(angle),Math.sin(angle)][j]*P.bladeLength),u=(t-P.transfer)/.05,e=u*u*(3-2*u),target=orange.nodes[6].map((v,j)=>anchor[j]+(v-anchor[j])*e);R.attachArm(orange,1,target,-1);}
 if(orange&&red&&P.punch[0]<=t&&t<=P.punch[1]){const target=[red.head[0]+red.r*.58,red.head[1]+red.r*.70];R.attachArm(orange,0,target,1);}
 return {orange,red};}
function heldSword(t,pair=actors(t)){
 const angle=R.radians(R.value(P.blade,t,'angle')),dir=[Math.cos(angle),Math.sin(angle)],length=P.bladeLength;
 if(t>=P.transfer){const actor=pair.orange;if(!actor)return null;const a=actor.nodes[6].slice(),b=a.map((v,j)=>v-dir[j]*length);return {a,b};}
 if(!pair.red)return null;const b=pair.red.nodes[4].slice(),a=b.map((v,j)=>v+dir[j]*length);return {a,b};
}
let releaseState;
function weapon(t,pair){if(t<P.release)return heldSword(t,pair);if(!releaseState){const o=heldSword(P.release-1e-7);const half=Math.hypot(o.a[0]-o.b[0],o.a[1]-o.b[1])/2;releaseState={center:o.a.map((x,j)=>(x+o.b[j])/2),angle:Math.atan2(o.a[1]-o.b[1],o.a[0]-o.b[0]),half};}
 const {center,angle,half}=releaseState,u=t-P.release,flight=.64,landingAngle=angle+11.8*flight,g=1650,ground=477,targetY=ground-Math.abs(Math.sin(landingAngle)*half),vy=(targetY-center[1]-.5*g*flight**2)/flight,air=u<flight,rest=Math.max(0,u-flight),rotation=air?angle+11.8*u:landingAngle+11.8*(1-Math.exp(-12*rest))/12;
 const x=238+(center[0]-238)*Math.exp(-13*u),y=air?center[1]+vy*u+.5*g*u*u:ground-Math.abs(Math.sin(rotation)*half),v=R.polar(rotation,half);return {a:[x+v[0],y+v[1]],b:[x-v[0],y-v[1]],released:true};
}
function frame(t){const pair=actors(t),o=weapon(t,pair);
 if(pair.orange&&pair.red&&P.grabStart<=t&&t<P.grabEnd&&o){R.attachArm(pair.orange,1,o.a,-1);}
 return {pair,weapon:o,camera:P.camera(t)};
}
function draw(t){t=R.clamp(t,0,P.duration-1e-6);const {ctx,canvas,W,H}=A;ctx.reset();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);if(t<2){A.warning(t);return;}
 const f=frame(t),c=f.camera;A.background(c);ctx.save();ctx.translate(c.x,c.y);ctx.scale(c.scale,c.scale);A.rect(-2000,443,6000,1000,'#0d0e0f');A.bed();A.viscera();A.swordTrail(t,weapon);A.actor(f.pair.orange);A.actor(f.pair.red);if(f.weapon)A.sword(f.weapon);A.star(f.pair.orange,t);ctx.restore();}
const play=document.querySelector('#play'),seek=document.querySelector('#seek'),label=document.querySelector('#time'),audio=document.querySelector('#audio');let playing=false,current=0,base=0,raf;
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function ui(){seek.value=current;label.textContent=`${fmt(current)} / ${fmt(P.duration)}`;}
function tick(now){if(!playing)return;current=Math.min(P.duration,(now-base)/1000);draw(current);ui();if(current===P.duration){playing=false;play.textContent='Reproduzir';audio.pause();return;}raf=requestAnimationFrame(tick);}
play.addEventListener('click',async()=>{if(playing){playing=false;cancelAnimationFrame(raf);audio.pause();play.textContent='Reproduzir';}else{if(current>=P.duration)current=0;audio.currentTime=current;try{await audio.play();}catch{}playing=true;base=performance.now()-current*1000;play.textContent='Pausar';raf=requestAnimationFrame(tick);}});
seek.max=P.duration;seek.addEventListener('input',()=>{current=+seek.value;audio.currentTime=current;base=performance.now()-current*1000;draw(current);ui();});
window.film={draw,frame,actors,weapon,canvas:A.canvas,duration:P.duration,metrics:{finite:true,sourceVideoPixelsUsed:0,method:'Authored 2D rigs, fixed proportions, explicit contacts and independent camera'},stages:P.beats};draw(0);ui();
})();
