import * as THREE from 'three';
import {toonMaterial,ball,link,V} from './rig.js';
export const ink=0x241d35;
const mats=new Map();
export function mat(c){if(!mats.has(c))mats.set(c,toonMaterial(c));return mats.get(c);}
const boxGeo=new THREE.BoxGeometry(1,1,1);
export function box(g,x,y,z,w,h,d,c){const m=new THREE.Mesh(boxGeo,mat(c));m.position.set(x,y,z);m.scale.set(w,h,d);g.add(m);return m;}
export function sphere(g,x,y,z,r,c){return ball(g,V(x,y,z),V(r,r,r),mat(c),false);}
export function rod(g,a,b,r,c){const l=link(g,mat(c),r);l.userData.set(V(...a),V(...b));return l;}
export function label(g,text,x,y,z,w,h,{color='#eef4f4',bg=null,size=48,align='center',font='sans-serif'}={}){
  const density=2,c=document.createElement('canvas');c.width=1024*density;c.height=Math.max(96,Math.round(1024*h/w))*density;const ctx=c.getContext('2d');
  if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);}ctx.fillStyle=color;ctx.font=`${size*density}px ${font}`;ctx.textAlign=align;ctx.textBaseline='middle';
  const lines=String(text).split('\n');lines.forEach((l,i)=>ctx.fillText(l,align==='left'?32*density:c.width/2,c.height/2+(i-(lines.length-1)/2)*size*1.45*density,c.width-45*density));
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));m.position.set(x,y,z);g.add(m);return m;
}
export function ring(g,x,y,z,r,c){const m=new THREE.Mesh(new THREE.TorusGeometry(r,.025,6,64),new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);m.rotation.x=-Math.PI/2;g.add(m);return m;}
function window(g,x,y,w=2.2,h=2.5,night=false){
  box(g,x,y,-1.8,w+.12,h+.12,.10,0xdedee5);box(g,x,y,-1.73,w,h,.05,night?0x202c58:0xa9d4ea);
  box(g,x,y,-1.64,.035,h,.035,0xe6e8ed);box(g,x,y,-1.64,w,.035,.035,0xe6e8ed);
  if(!night){sphere(g,x-.4,y-.3,-1.69,.62,0x7fac68);sphere(g,x+.4,y-.4,-1.69,.7,0x82ae73);}
  else for(let i=0;i<16;i++)box(g,x-w*.45+(i%8)*w*.12,y-h*.35+Math.floor(i/8)*.25,-1.68,.035,.045,.015,0xc6a88a);
}
export function chair(g,x,z=.2,c=0x71544a,facing=0){const seat=new THREE.Group();seat.position.set(x,0,z);seat.rotation.y=facing;g.add(seat);box(seat,0,.61,0,.65,.08,.63,c);box(seat,0,.99,-.28,.65,.7,.065,c);for(const a of [-.26,.26])for(const b of [-.24,.24])box(seat,a,.30,b,.045,.60,.045,0x35313e);}
export function desk(g,x,y=1.12,z=.38,w=2,c=0xb58b5f){box(g,x,y,z,w,.10,.85,c);for(const a of [-w*.43,w*.43])for(const b of [-.32,.32])box(g,x+a,y/2,z+b,.055,y,.055,0x4a414c);}
export function book(g,x,y,z,c=0x4f8796,w=.35){box(g,x,y,z,w,.07,.23,c);box(g,x,y+.007,z+.003,w*.93,.04,.235,0xeee7d6);}
function shelf(g,x){for(let j=0;j<5;j++){box(g,x,.35+j*.66,-1.35,1.05,.07,.4,0x8f6852);for(let i=0;i<6;i++)box(g,x-.4+i*.15,.59+j*.66,-1.35,.105,.40+Math.sin(i+j)*.07,.22,[0xc78b58,0x5d839b,0x8d738d,0x91a66b,0xc6b381][(i+j)%5]);}box(g,x-.53,1.7,-1.35,.06,3.4,.4,0x7d5d48);box(g,x+.53,1.7,-1.35,.06,3.4,.4,0x7d5d48);}
function lamp(g,x,y,z){rod(g,[x,y,z],[x,y+.46,z],.018,0x666177);const shade=new THREE.Mesh(new THREE.ConeGeometry(.20,.28,16,1,true),mat(0xf6d59b));shade.position.set(x,y+.5,z);g.add(shade);}
function clock(g,x=0,y=3.25){sphere(g,x,y,-1.70,.22,0xeee9d8);rod(g,[x,y,-1.45],[x+.02,y+.13,-1.45],.008,ink);rod(g,[x,y,-1.44],[x+.13,y-.02,-1.44],.008,ink);}
function board(g,kind='quadratic'){
  box(g,1.4,2.30,-1.65,4.8,2.1,.09,0x8c775e);box(g,1.4,2.30,-1.59,4.66,1.96,.04,0x244e44);
  let text={hard:'∫₀∞ e⁻ˣ² dx = √π / 2\n∇ × B = μ₀J + μ₀ε₀ ∂E/∂t\ndet(A − λI) = 0',quadratic:'Quadratic Equations\n2x² − 8x + 6 = 0\nx² − 4x + 3 = 0\n(x − 1)(x − 3) = 0\nx = 1     or     x = 3',exam:'FINAL EXAM\nNO TALKING · 90 MIN',calculus:'Find the extrema of f(x) = x³ − 3x\nf′(x) = 3x² − 3\nx = ±1',results:'Exam results\nsee me after class'}[kind]||kind;
  label(g,text,1.4,2.28,-1.55,4.3,1.8,{size:kind==='quadratic'?58:64,font:'serif'});
}
function monitor(g,x,y,z,w=1.1,text='COGNITIVE PERFORMANCE'){
  box(g,x,y,z,w,.72,.09,0x1a2536);box(g,x,y,z+.055,w*.9,.62,.02,0x103244);label(g,text,x,y+.12,z+.073,w*.82,.33,{size:42,color:'#91d9ed'});
  rod(g,[x,y-.35,z],[x,y-.60,z],.03,0x343b4c);box(g,x,y-.61,z+.08,w*.5,.035,.25,0x343b4c);
  return box(g,x-.1,y-.15,z+.075,w*.60,.018,.01,0x5ecbb6);
}
function plant(g,x,z=-1.1){box(g,x,.24,z,.30,.48,.30,0xd3b39c);for(let i=0;i<5;i++)rod(g,[x,.4,z],[x+Math.sin(i*2)*.26,.9+Math.cos(i)*.15,z+Math.cos(i)*.2],.035,0x6b9d70);}
function bedroom(g,night){window(g,-2,2.1,2.4,2.5,night);box(g,-1.5,.31,-1.3,3,.45,.9,0x635168);box(g,-1.5,.59,-1.3,3,.18,.9,0xd1c3d9);box(g,-2.35,.77,-1.3,.65,.20,.8,0xe2dbe8);box(g,-.95,.74,-1.3,1.8,.16,.85,0x777393);box(g,-3.0,.9,-1.3,.09,1.5,1,0x69536d);desk(g,1.8,1.14,-.7,2);lamp(g,2.5,1.2,-.8);book(g,1.4,1.24,-.6);monitor(g,1.9,1.73,-.9,.70,'');label(g,'✦',.8,2.75,-1.6,.7,.6,{bg:'#3d4968',size:180});}
function campus(g,graduation=false){
  box(g,0,1.8,-3,12,3.6,.65,0xc49876);box(g,0,2,-2.55,2.1,4,.18,0xd2aa85);box(g,0,3.5,-2.4,2.4,.17,.4,0xe0b78d);
  for(let j=0;j<2;j++)for(let i=0;i<10;i++)box(g,-5.1+i*1.12,1.35+j*1.22,-2.63,.43,.85,.04,0x444956);
  box(g,0,.6,-2.25,1.1,1.25,.2,0x5c4a48);clock(g,0,3.45);
  for(const x of [-4,3.8]){rod(g,[x,0,-1.6],[x,1.5,-1.6],.07,0x735d44);sphere(g,x,1.9,-1.6,.70,0x7da86d);sphere(g,x+.4,1.7,-1.6,.45,0x91b778);}
  box(g,0,-.04,.8,15,.05,2,0xcfc5ad);box(g,0,-.07,-.9,15,.07,1,0x8da96c);
  if(graduation){box(g,0,.15,.4,8,.3,2.5,0x976b5e);label(g,'COMMENCEMENT',0,2.35,-2.27,3.0,.35,{bg:'#5d3f63',size:85});}
}
function platform(g,x,z=.25){const p=new THREE.Mesh(new THREE.CylinderGeometry(.90,.94,.13,48),mat(0x657a92));p.position.set(x,.08,z);g.add(p);for(const r of [.69,.83])ring(g,x,.16,z,r,0x6ec8e5);return p;}
function lab(g){
  bedroom(g,true);desk(g,.45,1.05,-.9,3.6,0x8b6654);shelf(g,4.0);shelf(g,-4.1);
  monitor(g,.4,1.72,-1.14,1.2,'QUANTUM TRANSFER');monitor(g,-.9,1.65,-1.2,.8,'STABILITY: 99.9%');
  box(g,1.2,1.45,-.75,1.0,.6,.7,0x9ca7ad);box(g,1.2,1.45,-.36,.72,.44,.025,0x192837);sphere(g,1.18,1.42,-.28,.13,0x80bfd2);
  for(let i=0;i<7;i++)book(g,-2.4,.15+i*.075,-.6,[0x769284,0xb7a595,0x6c7b98][i%3],.38);
  for(let i=0;i<5;i++)box(g,3+.30*(i%2),.17+Math.floor(i/2)*.35,.2,.5,.32,.4,0xa38b72);
  platform(g,-1.65,.55);platform(g,1.65,.55);
  box(g,0,.56,.3,.4,1.1,.4,0x456178);sphere(g,0,.94,.53,.11,0x66ccef);
  for(let i=0;i<3;i++)rod(g,[-.2+i*.18,.5,.3],[-1.15+i*.7,.05,-.4],.018,[0xbd5f66,0x6f9cb1,0xcbb97b][i]);
  label(g,'PAIRED-PLATFORM TRANSFER\n∫ ψ(x) dx      ∞\nΨA → ΨB',-.4,2.87,-1.63,2.5,1.0,{bg:'#d5d4c7',color:'#3b4052',size:70});
  label(g,'∞',2,2.9,-1.6,.72,.8,{bg:'#526c92',size:190});label(g,'★',2.85,2.9,-1.6,.72,.8,{bg:'#a45759',size:170});
  clock(g,1.25,3.35);
}
function office(g){window(g,0,2.15,2.6,2.8,false);shelf(g,-3.6);desk(g,.1,1.14,-.15,2.6);monitor(g,.55,1.75,-.5,1.1);chair(g,-1.48,.4,0x71544a,1.0);chair(g,2,.2);plant(g,3.4);
  label(g,'THE HUMAN BRAIN\nTemporal       Cerebellum',2.75,2.75,-1.55,1.25,1.2,{bg:'#eee7dd',color:'#52435c',size:60});ball(g,V(2.75,2.9,-1.43),V(.44,.28,.035),mat(0xd5a0b8),false);}
function hospital(g,scanner=false){
  window(g,-3.7,2.4,1.2,2.2,false);box(g,-.6,.54,0,3.5,.15,1.2,0xe2e9ee);box(g,-.6,.7,0,3.5,.18,1.15,0xf0f3f6);box(g,-2.05,.87,0,.75,.18,1.0,0xdee9ef);
  for(const x of [-2.15,.95]){box(g,x,.4,0,.06,.7,1.15,0xc7d8e5);for(const z of [-.45,.45])sphere(g,x,.075,z,.07,0x586577);}
  box(g,.2,1.01,0,1.9,.18,1.16,0xbdd1df);monitor(g,-1.4,2.5,-1.55,1.2,'♥ 72   ─╱╲──');plant(g,3.6);
  box(g,-.7,2.12,-1.45,3.8,.13,.15,0xe0e8ed);rod(g,[-2.5,.1,-.3],[-2.5,2.3,-.3],.025,0xbdd0dc);box(g,-2.5,2.1,-.3,.22,.35,.10,0xc3dce5);
  if(scanner){const tor=new THREE.Mesh(new THREE.TorusGeometry(1.0,.22,12,48),mat(0xf4f4f8));tor.rotation.y=Math.PI/2;tor.position.set(-.1,1.17,0);g.add(tor);label(g,'MRI · SCANNING',0,3,-1.5,2,.4,{size:70,color:'#b6d8f6'});}
}
function street(g,night=false,traffic=false){
  box(g,0,-.10,0,15,.18,7,0x535967);box(g,0,-.005,-1,15,.06,1.0,0xa4a6a0);
  for(let i=0;i<12;i++){const x=-6+i*1.1;const h=2.8+(i%3)*.7;box(g,x,h/2,-3.3,1.06,h,.8,[0xaaa8ac,0xa2a2a8,0x958a95][i%3]);for(let j=0;j<3;j++)for(let k=0;k<2;k++)box(g,x-.26+k*.5,.6+j*.8,-2.86,.23,.35,.02,night?0xddc598:0x4f5a6b);}
  for(let i=0;i<15;i++)box(g,-7+i,.007,1.6,.6,.012,.065,0xe2d9a3);
  for(let i=0;i<3;i++){rod(g,[-4+i*4,0,-1.1],[-4+i*4,2.8,-1.1],.035,0x4b5360);box(g,-3.8+i*4,2.8,-1.1,.5,.06,.1,0xd0cba8);}
}
export function car(g,x=0,z=1,suv=false,color=0x687e89){
  const c=new THREE.Group();g.add(c);c.position.set(x,-.02,z);c.userData.wheels=[];box(c,0,.45,0,2.2,.45,.85,color);box(c,-.05,.85,0,suv?1.75:1.2,.45,.76,color);box(c,-.05,.88,.39,suv?1.6:1.1,.30,.025,0x263848);
  for(const x of [-.72,.72])for(const z of [-.44,.44]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.08,20),mat(0x242634));w.rotation.x=Math.PI/2;w.position.set(x,.25,z);c.add(w);w.userData.baseQuaternion=w.quaternion.clone();c.userData.wheels.push(w);for(const a of [0,Math.PI/2])rod(w,[-Math.cos(a)*.16,.051,-Math.sin(a)*.16],[Math.cos(a)*.16,.051,Math.sin(a)*.16],.012,0x91a0ab);sphere(c,x,.25,z*1.09,.105,0x8a98a5);}
  for(const x of [-.86,.86])box(c,x,.49,.44,.23,.12,.02,0xe9e7c8);return c;
}
function sky(g,night=false){const canvas=document.createElement('canvas');canvas.width=16;canvas.height=256;const ctx=canvas.getContext('2d'),gr=ctx.createLinearGradient(0,0,0,256);gr.addColorStop(0,night?'#10162d':'#5c719d');gr.addColorStop(.6,night?'#282749':'#c8b7bd');gr.addColorStop(1,night?'#5b4c6c':'#f5d4aa');ctx.fillStyle=gr;ctx.fillRect(0,0,16,256);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(40,20),new THREE.MeshBasicMaterial({map:tex}));m.position.set(0,5,-8);g.add(m);}
function room(g,c=0x776b81){box(g,0,1.9,-2.0,14,4.4,.1,c);box(g,0,-.08,0,20,.15,8,0x6d606b);box(g,0,.10,-1.89,14,.17,.05,0x4c475a);}
function makeDocument(g,type){
  let bg='#eeebdf',color='#303541',text='';
  const content={physics:'Ch. 1 Motion — summary           Ch. 2 Energy\nF = ma                               E = ½ mv²\nv = v₀ + at                         W = F · d\ns = v₀t + ½at²                     P = W/t\n\n\n\nAll 12 problems — COMPLETE',search:'Why am I suddenly getting smarter?\n\n7 Surprising Reasons You Feel Smarter Today\n\nCognitive performance · memory · concentration',memory:'MEMORY SEQUENCE\nRepeat the pattern\n\n■   ■   ■   ■\n■   ■   ■   ■\n\nLEVEL 12',exam:'MIDTERM EXAM\n\n\nF\n\n\nBefore the change',budget:'TELEPORTATION RIG · REV 9\nIndustrial power converter          $480,000\nLaser emitter assembly              $1,250,000\nShielded control electronics        $760,000\nSuperconducting cable               $340,000\nCryogenic cooling unit              $1,180,000\n\nTOTAL     $3,605,550',offers:'NEW OFFER RECEIVED\n\nARCLINE DYNAMICS      HELIO SYSTEMS\n$10,000,000             $25,000,000\n\nREVIEW & SIGN          REVIEW & SIGN',records:'COLLEGE RECORDS · ARCHIVE\nStudent 2039-0      Economics\nStudent 2040-3      Design\nStudent 2041-6      GPA 1.2\nStudent 2042-0      History\n\nBEFORE: IQ 80',badge:'ADVANCED SCIENCE\nRESEARCH DIRECTORATE\nOFFICIAL IDENTIFICATION\n\nSenior Field Liaison\nASRD-7731-K\nCLEARANCE LEVEL 4',classified:'CONFIDENTIAL\n\nADVANCED SCIENCE\nRESEARCH DIRECTORATE',contract:'RESEARCH AGREEMENT\n\nTerms of access and confidentiality\n\n__________________\nSIGNATURE',phone:'INCOMING CALL\n+1 (555) 014-2207\n\n?\n\nDECLINE          ACCEPT',photo:'MEMORIES\n\nFRIENDS · CAMPUS · HOME'};
  if(['budget','offers','badge','phone','classified','records'].includes(type)){bg='#14263b';color='#d7e9f0';}
  const w=type==='phone'?2.5:6.0,h=type==='phone'?3.5:3.3;
  box(g,0,1.85,.1,w+.10,h+.10,.10,0x2b2939);label(g,content[type]||content.physics,0,1.85,.17,w,h,{bg,color,size:type==='exam'?95:60});
  if(type==='photo'){for(let i=-1;i<=1;i++){ball(g,V(i*.8,1.7,.23),V(.32,.32,.02),mat(0x292a30),false);box(g,i*.8,1.05,.22,.56,.8,.03,[0x6ba3bd,0xe5b82c,0x74a576][i+1]);for(const dx of [-.08,.08])sphere(g,i*.8+dx,1.72,.28,.035,0xffffff);}}
}
export function buildSet(name,shot){
  const group=new THREE.Group();group.name=name;let dark=!!shot.night||name==='lab';
  const outdoor=['campus','graduation','street','house','rooftop','traffic'].includes(name);
  sky(group,dark||['brain','network','neuron','lab','money','world','news'].includes(name));
  if(!outdoor&&!['brain','network','neuron','black','world','news','equations'].includes(name))room(group,['hospital','scanner','research'].includes(name)?0x8d9eae:name==='office'?0x9297a5:dark?0x373348:0x8b7682);
  switch(name){
    case 'classroom':window(group,-3,2.1,1.65,2.5,false);board(group,shot.board);clock(group,-.7,3.5);for(const [x,z] of [[-3.45,-.75],[-1.25,.18],[2.2,-.65]]){desk(group,x+1.1,1.14,z,1.6);chair(group,x,z,0x71544a,1.1);}break;
    case 'campus':case 'graduation':campus(group,name==='graduation');break;
    case 'lab':lab(group);break;
    case 'science':for(let i=0;i<3;i++)monitor(group,-2.8+i*2.1,2.6,-1.5,1.8,['DNA · GENETICS','NEURAL CONNECTIVITY','PERFORMANCE'][i]);desk(group,0,1,-1.2,9);for(let i=0;i<8;i++)box(group,2.3+i*.22,1.25,-1.1,.10,.45,.10,[0x78a8b6,0xb17b9d,0x8cba98][i%3]);break;
    case 'bedroom':bedroom(group,dark);chair(group,.45,-.4,0x71544a,1.1);break;
    case 'hospital':case 'scanner':hospital(group,name==='scanner');break;
    case 'office':office(group);break;
    case 'street':case 'traffic':street(group,dark,name==='traffic');break;
    case 'house':campus(group);box(group,0,1.5,-1.7,6,3,.3,0xb39883);for(const x of [-1.7,1.7])window(group,x,2.1,1.5,1.1,dark);label(group,'214',0,1.7,-1.45,1,.4,{size:100});break;
    case 'vending':window(group,-2.7,2,2,2.5,true);box(group,1,.0+1.55,-.7,1.45,3.0,.75,0x5b6b81);box(group,1,1.88,-.29,1.15,1.8,.025,0x192f43);label(group,'CAMPUS CREDIT UNION\n\n$0.00',1,2.2,-.25,1.0,.9,{size:70});for(let j=0;j<3;j++)for(let i=0;i<3;i++)box(group,.7+i*.25,1.3-j*.16,-.23,.15,.08,.02,0xa1b5ba);break;
    case 'document':makeDocument(group,shot.paper);break;
    case 'screens':for(let i=0;i<4;i++){monitor(group,-2.2+(i%2)*4.4,1.25+Math.floor(i/2)*1.8,-1,3.6,['PIPELINE EFFICIENCY','SUPERCOMPUTING','ADVANCED MANUFACTURING','LARGE-SCALE LABORATORIES'][i]);}break;
    case 'meeting':window(group,0,2.2,8,2.6,true);desk(group,0,1.1,.0,5,0x6d5862);for(const x of [-2,0,2])chair(group,x,-.25);break;
    case 'rooftop':for(let i=0;i<15;i++){const h=1+(i%4)*.5;box(group,-7+i,h/2,-4,1,h,.6,0x494362);for(let k=0;k<7;k++)box(group,-7+i-.25+(k%2)*.45,.25+Math.floor(k/2)*.42,-3.66,.08,.10,.02,0xbaabb7);}box(group,0,-.1,0,14,.20,7,0x8a8394);platform(group,0,.3);break;
    case 'living':window(group,2,2.2,3,2.4,true);box(group,0,.37,-.7,4.0,.45,1.0,0x6d7f99);box(group,0,.96,-1,4,1.0,.25,0x74869f);for(const x of [-2,2])box(group,x,.73,-.7,.25,.68,1.05,0x65758e);monitor(group,3.8,2,-1,2.2,'EXCLUSIVE INTERVIEW');break;
    case 'greenscreen':box(group,0,2,-1.5,12,4,.1,0x37c65a);box(group,0,-.02,0,15,.03,7,0x46ce63);break;
    case 'research':window(group,2.5,2.2,4,2.7,false);desk(group,-2,1.0,-.3,1.4);monitor(group,-2,1.65,-.6,1.1,'QUANTUM STABILITY');platform(group,0,.3);for(const x of [-.65,.65])rod(group,[x,.2,.4],[x,2.2,.4],.04,0x607b99);{const ringMesh=new THREE.Mesh(new THREE.TorusGeometry(.75,.045,8,48),mat(0x7694b2));ringMesh.rotation.x=1.0;ringMesh.position.set(0,1.7,.4);group.add(ringMesh);}sphere(group,0,1.7,.4,.20,0x8fb8ee);break;
    case 'cafe':window(group,-1.5,2.6,3,1.7,false);window(group,2.2,2.6,3,1.7,false);desk(group,0,1.14,.25,1.6);for(const x of [-1.4,1.4])chair(group,x,.5,0x71544a,x<0?1.1:-1.1);label(group,'MENU · CAFÉ\nEspresso     Latte     Cold brew     Tea',0,2.7,-1.65,3.0,.7,{bg:'#342c2e',size:70});for(const x of [-.5,.5]){box(group,x,1.33,.4,.17,.25,.17,0xf2eee2);ring(group,x+.12,1.34,.4,.08,0xe8e7dc);}break;
    case 'mirror':box(group,0,1.65,-.8,3.7,2.4,.06,0xcddbe7);box(group,0,1.65,-.74,3.5,2.2,.02,0x4e647a);box(group,0,.35,-.55,4,.7,.9,0xe3e9ed);box(group,0,.75,-.4,4.3,.10,1.1,0xf1f3f6);break;
    case 'money':window(group,0,2.3,8,3.2,true);for(let i=0;i<20;i++){const h=.1+(i%5)*.15;box(group,-3+i*.3,h/2,0,.22,h,.30,0x5ea886);}break;
    case 'cables':for(let i=0;i<8;i++){const l=link(group,mat([0x5ca0b2,0xc96b70,0xd8c47b,0x7ba87f][i%4]),.025);l.userData.set(V(-4,.8+i*.13,.2),V(4,1.1+Math.sin(i)*.25,.2));}box(group,0,.6,.4,1.7,.14,.6,0xe9e5dc);break;
    case 'equations':label(group,'2x² − 8x + 6 = 0\nx² − 4x + 3 = 0\n(x − 1)(x − 3) = 0\nx = 1   or   x = 3',0,1.9,0,6.4,3.0,{color:'#a7dcef',size:100,font:'serif'});break;
    case 'network':if(shot.action==='accept'){box(group,1.5,2.0,0,4.0,2.7,.08,0x1b3151);label(group,'BRAIN UPDATE COMPLETE\nTERMS & CONDITIONS\n\nEnhanced processing. Expanded memory.\nNew connections. Unknown consequences.\n\nACCEPT              DECLINE',1.5,2.0,.06,3.8,2.5,{color:'#d8e7ef',size:65});}break;
    case 'brain':if(shot.progress){box(group,2.0,1.9,0,3.0,1.6,.08,0x243557);label(group,'BRAIN UPDATE\nDOWNLOADING...\n\n████████████  100%',2.0,1.9,.06,2.8,1.4,{color:'#d2e3f8',size:90});}break;
    case 'world':label(group,'WORLDWIDE\nTELEPORTATION CHANGES EVERYTHING',0,2.7,0,7,1,{color:'#c0e2ed',size:80});break;
    case 'news':for(let i=0;i<12;i++){const x=-4+(i%4)*2.5,y=.6+Math.floor(i/4)*1.2;label(group,'BREAKING NEWS\nFROM IQ 80\nTO GENIUS?',x,y,-.1,2,1,{bg:i%2?'#e4e5de':'#172a44',color:i%2?'#33334b':'#e4eaf5',size:100});}break;
  }
  return group;
}
