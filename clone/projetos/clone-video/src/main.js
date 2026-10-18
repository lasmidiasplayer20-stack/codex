import * as THREE from 'three';
import {Character,V,ball,clamp,smooth} from './rig.js';
import {buildSet,box,rod,label,mat,car,ring} from './world.js';
import {SHOTS,DURATION,shotAt} from './timeline.js';
import {mergeGeometries} from '/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js';

const params=new URLSearchParams(location.search),WIDTH=Number(params.get('width')||960),HEIGHT=Number(params.get('height')||540);
const renderer=new THREE.WebGLRenderer({antialias:!params.has('render'),preserveDrawingBuffer:true,alpha:false,powerPreference:'high-performance'});
renderer.setSize(WIDTH,HEIGHT);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;
document.body.append(renderer.domElement);
const scene=new THREE.Scene();scene.background=new THREE.Color(0x15182c);
const camera=new THREE.OrthographicCamera(-5.2,5.2,5.2*HEIGHT/WIDTH,-5.2*HEIGHT/WIDTH,.1,100);
const sets=new Map(),castGroup=new THREE.Group(),fx=new THREE.Group(),overlay=new THREE.Group();scene.add(castGroup,fx,overlay);
function batchStatic(group){
  group.updateMatrixWorld(true);const batches=new Map(),remove=[];
  group.traverse(m=>{if(m.isMesh&&!Array.isArray(m.material)&&!m.material.map){const key=m.material;const g=m.geometry.clone();g.applyMatrix4(m.matrixWorld);if(!batches.has(key))batches.set(key,[]);batches.get(key).push(g);remove.push(m);}});
  for(const m of remove)m.removeFromParent();
  for(const [material,geometries] of batches){const merged=mergeGeometries(geometries,false);if(!merged)throw new Error('Static mesh merge failed');group.add(new THREE.Mesh(merged,material));for(const g of geometries)g.dispose();}
}
const cast={hero:new Character(castGroup),doctor:new Character(castGroup,{role:'doctor',color:0xe2eaf4}),friend:new Character(castGroup,{role:'friend',color:0x59ad9f}),friend2:new Character(castGroup,{role:'friend',color:0xc16d77}),agent:new Character(castGroup,{role:'agent',color:0x4f566d}),agent2:new Character(castGroup,{role:'agent',color:0x242838}),graduate:new Character(castGroup,{role:'graduate',color:0x202237})};
const shadows=Object.values(cast).map(()=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.4,28),new THREE.MeshBasicMaterial({color:0x1d1732,transparent:true,opacity:.17,depthWrite:false}));m.rotation.x=-Math.PI/2;m.scale.set(1,.48,1);m.position.y=.013;scene.add(m);return m;});
const props={};
props.phone=new THREE.Group();box(props.phone,0,.10,0,.14,.28,.027,0x202a38);box(props.phone,0,.10,.019,.115,.23,.012,0x8bb3d0);
props.pencil=new THREE.Group();rod(props.pencil,[0,-.065,0],[.03,.20,.02],.012,0xefca63);
props.paper=new THREE.Group();box(props.paper,0,.12,0,.29,.35,.009,0xf4f0de);for(let i=0;i<4;i++)box(props.paper,0,.03+i*.045,.008,.22,.006,.005,0x687786);
props.cup=new THREE.Group();box(props.cup,0,.08,0,.15,.18,.15,0xe4e4dc);
const apple=new THREE.Group();fx.add(apple);ball(apple,V(),V(.115,.105,.10),mat(0xbf4b52),false);rod(apple,[0,.08,0],[.01,.16,0],.013,0x76633c);ball(apple,V(.05,.13,0),V(.05,.018,.035),mat(0x77a067),false);
const vehicle=car(fx,0,1,false),suv=car(fx,0,1,true,0x373b4a);
for(const v of [vehicle,suv]){v.scale.set(2.4,2.05,2.6);v.rotation.y=-.12;}
const beams=[-1.65,1.65].map(x=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(.84,.86,2.7,40,1,true),new THREE.MeshBasicMaterial({color:0x75c6f5,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}));m.position.set(x,1.5,.55);fx.add(m);return m;});
const halo=new THREE.Mesh(new THREE.TorusGeometry(.40,.017,8,64),new THREE.MeshBasicMaterial({color:0x8ddcff,transparent:true,opacity:.8}));fx.add(halo);
const hologram=new THREE.Group();fx.add(hologram);for(let i=0;i<3;i++){const r=ring(hologram,0,.3+i*.55,0,.60+i*.10,0x79e5d9);r.rotation.x=Math.PI/2+i*.15;}
const pointer=new THREE.Group();fx.add(pointer);rod(pointer,[4,-.6,.5],[2.6,.5,.5],.13,0xf1c333);rod(pointer,[2.6,.5,.5],[1.2,1.65,.5],.11,0xf1c333);ball(pointer,V(1.2,1.65,.5),V(.14,.14,.13),mat(0x252233),false);
let seed=12763;function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const nodes=[];for(let i=0;i<210;i++){const theta=rnd()*Math.PI*2,ph=Math.acos(2*rnd()-1),r=Math.cbrt(rnd());nodes.push(V(Math.sin(ph)*Math.cos(theta)*r*2.1,Math.cos(ph)*r*1.28+2,Math.sin(ph)*Math.sin(theta)*r*.60));}
const pointGeom=new THREE.BufferGeometry().setFromPoints(nodes),points=new THREE.Points(pointGeom,new THREE.PointsMaterial({color:0xbae9ff,size:.052,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false}));
const brainGroup=new THREE.Group();fx.add(brainGroup);brainGroup.add(points);
const lines=[];for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if(nodes[i].distanceTo(nodes[j])<.62&&rnd()<.35)lines.push(nodes[i],nodes[j]);
brainGroup.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lines),new THREE.LineBasicMaterial({color:0x78c7ef,transparent:true,opacity:.22,blending:THREE.AdditiveBlending})));
const shell=ball(brainGroup,V(0,2,0),V(2.18,1.38,.72),new THREE.MeshBasicMaterial({color:0x7e9be9,transparent:true,opacity:.09,wireframe:true}),false);
const neuron=new THREE.Group();fx.add(neuron);const branches=[];
function branch(a,dir,length,depth){const end=a.clone().addScaledVector(dir,length);branches.push(a,end);if(depth>0)for(let i=0;i<3;i++)branch(end,dir.clone().add(V((rnd()-.5)*1.5,(rnd()-.5)*1.5,(rnd()-.5)*.5)).normalize(),length*.64,depth-1);}
for(let i=0;i<14;i++){const a=i*Math.PI*2/14;branch(V(0,2,0),V(Math.cos(a),Math.sin(a),0),.75,3);}
neuron.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(branches),new THREE.LineBasicMaterial({color:0xa4d8ff,transparent:true,opacity:.70,blending:THREE.AdditiveBlending})));ball(neuron,V(0,2,0),V(.22,.22,.22),new THREE.MeshBasicMaterial({color:0xd2efff}),false);
const dustPositions=[];for(let i=0;i<130;i++)dustPositions.push(V((rnd()-.5)*11,rnd()*5,(rnd()-.5)*4));
const dust=new THREE.Points(new THREE.BufferGeometry().setFromPoints(dustPositions),new THREE.PointsMaterial({color:0xa2c4e2,size:.025,transparent:true,opacity:.28,depthWrite:false}));fx.add(dust);
let active=null,activeSet=null,title=null,bubble=null,timer=null;
function setKey(s){return [s.set,s.night,s.board,s.paper,s.sepia].join('|');}
function clearOverlay(){for(const m of [...overlay.children]){overlay.remove(m);m.geometry?.dispose();m.material?.map?.dispose();m.material?.dispose();}}
function activate(s){
  active=s;if(activeSet)activeSet.visible=false;const key=setKey(s);if(!sets.has(key)){const g=buildSet(s.set,s);batchStatic(g);scene.add(g);sets.set(key,g);}activeSet=sets.get(key);activeSet.visible=true;
  clearOverlay();title=bubble=timer=null;
  if(s.title)title=label(overlay,s.title,0,3.82,2,8,.42,{color:'#f5edc7',size:62});
  if(s.bubble)bubble=label(overlay,s.bubble,1.5,3.15,1.0,3.9,.46,{bg:'#f5f2e7',color:'#262434',size:62});
  if(s.timer)timer=label(overlay,s.timer,.35,1.25,.52,.65,.23,{bg:'#1d2633',color:'#8de1b5',size:100});
}
function give(character,prop){character.prop.clear();character.prop.add(prop);character.prop.visible=true;}
function show(c,options){c.group.visible=true;c.pose(options);}
function setupCast(s,t){
  const u=clamp((t-s.start)/(s.end-s.start),0,1),time=t-s.start;
  for(const c of Object.values(cast)){c.group.visible=false;c.prop.visible=false;c.group.position.y=0;}
  let hero=cast.hero,action=s.action,rootX=-1.0,facing=.18,rootZ=.35;
  const patient=['hospital','scanner'].includes(s.set);
  cast.hero.cloth.uniforms.color.value.set(patient?0xb5d4e5:0xf5be13).convertLinearToSRGB();
  cast.hero.pouch.material.uniforms.color.value.set(patient?0xa4c4d6:0xd9a824).convertLinearToSRGB();
  if(['brain','neuron','screens','document','equations','news','world','cables','black'].includes(s.set))return;
  if(s.set==='network'){
    if(s.action==='accept')show(cast.hero,{time,rootX:-2.7,rootZ:.2,action:'present',facing:.6});
    return;
  }
  if(s.set==='classroom'){
    rootX=-1.25;facing=1.1;rootZ=.18;
    if(s.desk)action=['write','exam','think','test','fail'].includes(action)?action==='think'?'study':action==='fail'?'write':action:'write';
    show(cast.friend,{time:t+2,rootX:-3.45,rootZ:-.75,action:'write',facing:1.1});
    show(cast.friend2,{time:t+4,rootX:2.2,rootZ:-.65,action:'write',facing:1.1});
    if(s.doctor)show(cast.doctor,{time:t,rootX:1.6,rootZ:.2,action:['teach','explain','surprise'].includes(s.action)?s.action:'explain',facing:-.5});
  }
  if(s.set==='office'){
    rootX=-1.48;rootZ=.4;facing=1.0;action=s.action==='explain'?'talkSit':'test';
    show(cast.doctor,{time:t,rootX:2,rootZ:.2,action:'explain',facing:-.5});give(cast.doctor,props.paper);
  }
  if(s.set==='hospital'||s.set==='scanner'){
    rootX=-1;rootZ=.22;facing=.03;
    if(s.action==='surprise'){action='wake';}
    if(s.doctor)show(cast.doctor,{time:t,rootX:2.4,rootZ:.05,action:'explain',facing:-.5});
    if(s.action==='walk'){rootX=-.4+u*2;action='walk';}
  }
  if(s.set==='bedroom'){
    if(['write','study','type'].includes(action)){rootX=.45;rootZ=-.4;facing=1.1;}
    else{rootX=-.6;facing=.1;}
  }
  if(s.set==='lab'){
    rootX=['platform','teleport'].includes(action)?-1.65:-.7;rootZ=.55;facing=.25;
    if(action==='platform')action='stand';
    if(action==='build'){rootX=.15;rootZ=-.15;facing=.8;}
    if(action==='pickup'||action==='place'){rootX=-2.13;rootZ=.80;facing=.85;}
    if(action==='study'){rootX=-.7;rootZ=-.2;facing=.7;}
    if(s.doctor)show(cast.doctor,{time:t,rootX:1.8,rootZ:.4,action:'surprise',facing:-.4});
    if(s.agents){rootX=2.4;facing=-.25;show(cast.agent,{time:t+2,rootX:-2.7,rootZ:.3,action:'talk',facing:.5});show(cast.agent2,{time:t+3,rootX:-1.5,rootZ:.1,action:'stand',facing:.3});}
  }
  if(s.set==='campus'||s.set==='graduation'){
    rootX=s.set==='campus'?-2.5+u*4.7:-.7;rootZ=.7;facing=s.set==='campus'?1.0:.3;
    if(s.set==='graduation'){hero=cast.graduate;rootZ=.7;hero.group.position.y=.3;show(cast.doctor,{time:t,rootX:.45,rootZ:.7,action:'handshake',facing:-.8});cast.doctor.group.position.y=.3;}
    if(s.crowd)for(const [i,c] of [cast.friend,cast.friend2,cast.agent].entries())show(c,{time:t+i*2,rootX:-3.3+i*2.9+u*.5,rootZ:.4,action:s.action==='walk'?'walk':'celebrate',facing:.7});
  }
  if(s.set==='street'||s.set==='traffic'){
    rootX=-2.4+u*4.8;rootZ=.9;facing=1.1;
    if(action==='car')return;
  }
  if(s.set==='house'){rootX=-1+u*1.8;rootZ=.8;facing=.8;}
  if(s.set==='rooftop'){rootX=action==='walk'?-2+u*4:0;rootZ=.3;facing=action==='walk'?1.0:.15;}
  if(s.set==='vending'){rootX=-.35;rootZ=.2;facing=1.1;}
  if(s.set==='living'){rootX=0;rootZ=-.5;action='phoneSit';if(s.crowd){show(cast.friend,{time:t,rootX:-1.4,rootZ:.3,action:'celebrate'});show(cast.friend2,{time:t+2,rootX:1.4,rootZ:-.5,action:'talkSit',seatHeight:.60});}}
  if(s.set==='meeting'){rootX=-2.9;rootZ=.8;action='explain';show(cast.agent,{time:t,rootX:0,rootZ:-.9,action:'talkSit'});show(cast.agent2,{time:t+2,rootX:1.7,rootZ:-.9,action:'talkSit'});}
  if(s.set==='research'){rootX=-1.5;rootZ=.7;action='present';show(cast.doctor,{time:t,rootX:1.3,rootZ:.7,action:s.action==='celebrate'?'celebrate':'explain',facing:-.5});show(cast.agent,{time:t+1,rootX:3,rootZ:.5,action:'stand',facing:-.4});}
  if(s.set==='cafe'){rootX=-1.4;rootZ=.5;facing=1.1;action='talkSit';show(cast.friend,{time:t+2,rootX:1.4,rootZ:.5,action:'talkSit',facing:-1});}
  if(s.set==='greenscreen'){rootX=1.2;rootZ=.5;facing=-.4;}
  if(s.set==='science'){show(cast.doctor,{time:t,rootX:0,rootZ:.5,action:'teach',facing:.25});return;}
  if(s.set==='mirror'){rootX=0;rootZ=.65;facing=.0;action='think';}
  if(s.set==='money'){rootX=.5;rootZ=.4;}
  const walkSpeed=s.set==='campus'?4.7/(s.end-s.start):s.set==='street'?4.8/(s.end-s.start):s.set==='house'?1.8/(s.end-s.start):s.set==='rooftop'?4/(s.end-s.start):.65;
  const posePhase=s.set==='hospital'&&action==='wake'?clamp((t-48)/5,0,1):u;
  const itemContact=['pickup','place'].includes(action)?{rightHandWorld:[-1.65,.38,.55],handTargetWeight:1-smooth((u-.5)/.1)}:{};
  show(hero,{time:time,phase:posePhase,rootX,rootZ,facing,action,side:1,walkSpeed,seatHeight:s.set==='living'?.60:.65,...itemContact});
  if(s.set==='graduation')hero.group.position.y=.3;
  if((s.set==='lab'&&['platform','teleport'].includes(s.action))||s.set==='rooftop'&&s.action==='teleport')hero.group.position.y=.16;
  if(s.action==='teleport'&&!s.apple){hero.group.visible=Math.sin(time*20)>-.6;hero.group.position.x+=(s.set==='rooftop'?0:(u>.52?3.3:0));}
  if(['phone','buy','phoneSit'].includes(action))give(hero,props.phone);
  if(['write','exam','test','study'].includes(action))give(hero,props.pencil);
  if(action==='handshake')give(hero,props.paper);
  if(s.set==='cafe')give(hero,props.cup);
}
export function renderAt(t){
  t=clamp(t,0,DURATION-1/60);const s=shotAt(t);if(s!==active)activate(s);
  const u=(t-s.start)/(s.end-s.start);setupCast(s,t);
  const people=Object.values(cast);shadows.forEach((m,i)=>{m.visible=people[i].group.visible;m.position.x=people[i].group.position.x;m.position.z=people[i].group.position.z;});
  const conceptual=['brain','network','neuron'].includes(s.set);
  brainGroup.visible=s.set==='brain'||s.set==='network'&&s.action!=='accept';brainGroup.position.x=s.progress?-1.9:0;brainGroup.scale.setScalar(s.progress?.68:1);brainGroup.rotation.y=Math.sin(t*.2)*.16;brainGroup.rotation.z=Math.sin(t*.17)*.025;points.material.size=.04+.012*Math.sin(t*2);
  pointer.visible=s.set==='document';pointer.rotation.z=Math.sin(t*.8)*.015;
  neuron.visible=s.set==='neuron';neuron.rotation.z=Math.sin(t*.17)*.06;neuron.rotation.y=Math.sin(t*.12)*.15;
  dust.visible=s.set==='lab'||conceptual;dust.rotation.y=t*.013;
  hologram.visible=!!s.hologram;hologram.position.set(s.set==='science'?1.3:-1,1.2,.5);hologram.rotation.y=t;
  halo.visible=!!s.hologram||s.action==='teleport';halo.position.set(cast.hero.group.position.x,2.48,cast.hero.group.position.z+.1);halo.rotation.z=t*.3;
  beams.forEach((m,i)=>{m.visible=s.action==='teleport';m.material.opacity=.08+.12*Math.pow(Math.sin(t*8+i),2);});
  vehicle.visible=(s.set==='street'||s.set==='traffic')&&s.action==='car'&&!s.suv;suv.visible=s.set==='street'&&!!s.suv;
  if(vehicle.visible)vehicle.position.x=4.0-u*8;
  if(suv.visible)suv.position.x=3-u*6;
  for(const v of [vehicle,suv])if(v.visible)for(const w of v.userData.wheels)w.quaternion.copy(w.userData.baseQuaternion).multiply(new THREE.Quaternion().setFromAxisAngle(V(0,1,0),u*(v===vehicle?8:6)/(.24*v.scale.y)));
  apple.visible=['pickup','place'].includes(s.action)||!!s.apple;
  if(apple.visible){
    if(s.action==='pickup'&&u>=.5||s.action==='place'&&u<.5){cast.hero.group.updateMatrixWorld(true);apple.position.copy(cast.hero.arms[1].target).applyMatrix4(cast.hero.group.matrixWorld);apple.position.y-=.06;}
    else apple.position.set(s.action==='teleport'&&u>.5?1.65:-1.65,.31,.55);
    apple.rotation.z=Math.sin(t)*.08;
  }
  let centerX=0,centerY=1.65,zoom=s.close||1;
  if(s.close){centerX=['hospital','classroom'].includes(s.set)?-.6:s.set==='lab'?cast.hero.group.position.x:0;centerY=1.65;}
  if(s.set==='document'){centerY=1.85;zoom=1.12;}
  if(conceptual||s.set==='equations'){centerY=2;zoom=1.08;}
  if(s.set==='black'){activeSet.visible=false;scene.background.set(0x05060c);title&&(title.position.y=1.8);}else scene.background.set(0x15182c);
  // A small deterministic dolly inside each shot, reset on cuts.
  camera.zoom=zoom*(1+.018*smooth(u));camera.updateProjectionMatrix();
  camera.position.set(centerX+Math.sin(u*Math.PI)*.035,centerY+1.25,12);camera.lookAt(centerX,centerY,0);
  if(title){title.position.x=centerX;title.position.y=s.set==='black'?1.8:centerY+2.14/zoom;title.scale.setScalar(1/zoom);}
  renderer.render(scene,camera);
  window.lastFrame={time:t,shot:SHOTS.indexOf(s),set:s.set,action:s.action,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls};
  return window.lastFrame;
}
window.renderAt=renderAt;window.capture=(t)=>{renderAt(t);return renderer.domElement.toDataURL('image/jpeg',.94).split(',')[1];};window.ready=true;
window.getRig=()=>Object.fromEntries(Object.entries(cast).map(([name,c])=>[name,{visible:c.group.visible,pelvis:c.pelvis.toArray(),chest:c.chest.toArray(),arms:c.arms.map(a=>a.target.toArray()),feet:c.legs.map(a=>a.target.toArray())}]));
window.getSceneDiagnostics=()=>({vehicleVisible:vehicle.visible,suvVisible:suv.visible,vehicleSize:[2.2*vehicle.scale.x,1.075*vehicle.scale.y],renderSize:renderer.getSize(new THREE.Vector2()).toArray(),heroSeatBottom:cast.hero.pelvis.y-.13,spineLength:cast.hero.pelvis.distanceTo(cast.hero.chest)});
let playing=!params.has('render'),offset=Number(params.get('time')||0),started=performance.now();
if(params.has('render')){document.querySelector('#hud').remove();renderAt(offset);}else{
  function loop(now){const t=playing?((now-started)/1000+offset)%DURATION:offset;renderAt(t);document.querySelector('#hud').textContent=`${t.toFixed(2)}s / ${DURATION}s · ${active.set} · espaço: pausa · ←/→: 5s`;requestAnimationFrame(loop);}requestAnimationFrame(loop);
  window.addEventListener('keydown',e=>{if(e.code==='Space'){offset=((performance.now()-started)/1000+offset)%DURATION;playing=!playing;started=performance.now();}if(e.code==='ArrowRight'||e.code==='ArrowLeft'){offset=clamp(offset+(e.code==='ArrowRight'?5:-5),0,DURATION);started=performance.now();}});
}
