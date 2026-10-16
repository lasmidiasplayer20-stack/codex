/* The Parcelarium: original colorful illustration, one persistent three-level room. */
(()=>{'use strict';const S=Story,{clamp,mix,ease,TAU}=S,{canvas,ctx:c}=LegacyActor,palette=['#ff7779','#43bdb1','#ffc85b','#a889d8','#61a8dc'];
function line(p,col='#47647c',w=3){c.beginPath();p.forEach((a,i)=>i?c.lineTo(...a):c.moveTo(...a));c.lineCap=c.lineJoin='round';c.strokeStyle=col;c.lineWidth=w;c.stroke();}
function box(x,y,w,h,col,r=6,stroke=null){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function circle(x,y,r,col,stroke=null,w=2){c.beginPath();c.arc(x,y,Math.max(.01,r),0,TAU);if(col){c.fillStyle=col;c.fill();}if(stroke){c.lineWidth=w;c.strokeStyle=stroke;c.stroke();}}
function text(s,x,y,size=14,col='#334e68',align='left'){c.font=`800 ${size}px sans-serif`;c.fillStyle=col;c.textAlign=align;c.fillText(s,x,y);}
function local(x,y,a,fn){c.save();c.translate(x,y);c.rotate(a);fn();c.restore();}
const cameras=[];let lastCam={x:1120,y:480,z:1.15};for(let fi=0;fi<=210*120;fi++){const t=fi/120,points=S.names.flatMap(n=>{const p=PerformanceData.poses[n][fi];return[p.nodes[2],p.nodes[8],p.nodes[10]]}),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);if(t>=182&&t<199){xs.push(1930);ys.push(200);}const lo=Math.min(...xs),hi=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys),z=clamp(Math.min(1680/(hi-lo+260),840/(bottom-top+140)),1.02,1.42),target={x:(lo+hi)/2,y:(top+bottom)/2+5,z};lastCam={x:mix(lastCam.x,target.x,.025),y:mix(lastCam.y,target.y,.025),z:mix(lastCam.z,target.z,.018)};cameras.push({...lastCam});}
const cameraAt=t=>cameras[clamp(Math.round(t*120),0,210*120)];
function gear(x,y,r,a,col){local(x,y,a,()=>{for(let i=0;i<12;i++)local(0,0,i*TAU/12,()=>box(-r*.12,-r*1.05,r*.24,r*.25,col,3));circle(0,0,r,col);circle(0,0,r*.72,'#ebeee6');for(let i=0;i<5;i++){const a=i*TAU/5;line([[Math.cos(a)*r*.18,Math.sin(a)*r*.18],[Math.cos(a)*r*.65,Math.sin(a)*r*.65]],col,r*.15);}circle(0,0,r*.18,col);});}
function room(s){const t=s.t,p=s.power;
 const g=c.createLinearGradient(0,80,0,930);g.addColorStop(0,'#e9f4ef');g.addColorStop(1,'#f9e6cb');c.fillStyle=g;c.fillRect(-1000,-1000,5000,3000);
 // Roof trusses, glazed bays and a dark rear machine establish a separate depth plane.
 for(let i=0;i<7;i++){const x=250+i*260;box(x,110,220,640,i%2?'#c5e0df':'#d5e8dc',15,'#aac8ca');line([[x+110,110],[x+110,750]],'#e9f2e6',5);for(let y=180;y<750;y+=160)line([[x,y],[x+220,y]],'#e9f2e6',5);}
 line([[160,110],[1130,-75],[2110,110]],'#6e8fa1',16);for(let i=0;i<8;i++)line([[200+i*260,110],[330+i*220,-5]],'#9ab6be',6);
 box(870,175,455,605,'#abc8c3',36,'#263f55');box(893,198,409,560,'#c9dfd3',24);circle(1100,480,155,'#28465c','#90bbc0',9);circle(1100,480,137,'#19384d','#5e93a4',4);
 const machineTime=t<168?Math.max(0,t-6):162+5*(1-Math.exp(-(t-168)/5));gear(1025,410,68,machineTime*.95,'#e8ac64');gear(1155,530,87,-machineTime*.74,'#8ac8c2');gear(1045,617,40,machineTime*1.5,'#e88c8a');
 for(let i=0;i<18;i++){const a=i*TAU/18;circle(1100+Math.cos(a)*181,480+Math.sin(a)*181,5,i<Math.floor(18*p)?'#ffe0a1':'#628b9d');}
 box(942,229,316,51,'#203f55',12);text(t<6?'READY':t<34?'AUTOMATIC':t<62?'REVERSE':t<94?'EXPRESS':t<124?'RETURN LOOP':t<168?'RIBBON JAM':t<173?'COASTING':'MANUAL ONLY',1100,262,22,t<168?'#ffd17b':'#9be3ca','center');text(`PRINTED: ${S.jobs.filter(j=>j.start<=t).length}`,1100,729,14,'#577b87','center');text('THE PARCELARIUM',1100,151,27,'#345468','center');
 // Physical floor slabs stay fixed. The thinner striped belt is their moving top surface.
 for(const slab of Parcels.slabs){box(slab.x,slab.y,slab.w,slab.h,'#45677b',5);box(slab.x,slab.y+slab.h-5,slab.w,5,'#e7af64',2);for(let x=slab.x+10;x<slab.x+slab.w-20;x+=36){const off=(machineTime*70*s.direction)%36;line([[x-off,slab.y+3],[x+10-off,slab.y+10]],'#9fc9c5',2);}for(const x of[slab.x+20,slab.x+slab.w-25]){line([[x,slab.y+slab.h],[x,845]],'#8ea9ae',8);}}
 box(170,824,1950,140,'#cbad94',0);line([[170,824],[2120,824]],'#a98c7c',4);for(let i=0;i<24;i++)line([[170+i*85,824],[120+i*95,980]],'#ddc2a7',1);
 // Recycling columns are collection ports, not arbitrary object disappearance.
 for(const x of[235,1995]){box(x-27,170,75,647,'#314b66',14,'#6d8ba0');for(let y=205;y<790;y+=90){box(x-17,y,55,55,'#19364b',9);line([[x-5,y+16],[x+6,y+27],[x-5,y+38]],'#8fb8bf',4);}text('RETURN',x+10,155,12,'#52778b','center');}
 // Wall-mounted safety levers remain behind the walking lanes.
 for(const n of S.names){const floor=S.floors[n],cp=S.control(n,t),x=n==='ink'?500:n==='cyan'?1600:1200;box(x-40,floor-150,82,99,'#d7e5dc',13,'#94b7b6');text('HOLD',x+1,floor-126,11,'#47777f','center');circle(x-20,floor-88,10,'#597a89');line([[x-20,floor-88],[cp.x,cp.y]],t>=168?'#65bba3':'#d28b64',7);circle(cp.x,cp.y,8,t>=168?'#84dfbd':'#ee866f');}
 // A moving shutter traps the original PLAY button after the test begins.
 box(1468,250,95,82,'#e3b56e',13,'#ac895d');circle(1515,290,24,t<6?'#77c9ad':t<168?'#ed7881':'#a5aeba','#f7e4bb',4);c.beginPath();c.moveTo(1508,278);c.lineTo(1529,290);c.lineTo(1508,302);c.closePath();c.fillStyle='#fff3d7';c.fill();
 if(t>=12&&t<173){const close=ease((t-12)/.5);for(let i=0;i<5;i++)box(1474,255+i*14,83*close,11,'#59778c',3);}
 // Signal wires show how one wrong switch changes all three tracks.
 for(let i=0;i<3;i++){const y=344+i*196;line([[310,y],[355,y],[355,y+50],[850,y+50]],'#86a9ad',4);for(let j=0;j<5;j++)circle(380+j*90+((machineTime*65)%90),y+50,3,p?'#f7c872':'#a5b7b4');}
 if(s.ribbon>.01){c.save();c.globalAlpha=s.ribbon*.85;for(let i=0;i<3;i++){const y=330+i*190;c.beginPath();c.moveTo(300,y);c.bezierCurveTo(700,y+Math.sin(t*2+i)*30,1450,y-50,1990,y+30);c.strokeStyle=palette[(i+3)%5];c.lineWidth=5;c.stroke();}c.restore();}
 // A return hose wakes up in chapter four, with its pulses travelling toward the chute.
 if(t>=90){const w=ease((t-90)/2);c.save();c.globalAlpha=w;line([[1720,160],[1870,160],[1870,715],[1980,715]],'#ba899b',22);line([[1720,160],[1870,160],[1870,715],[1980,715]],'#e6b2b9',14);for(let i=0;i<12;i++){const y=190+((machineTime*100+i*45)%480);line([[1862,y],[1878,y]],'#c48e9f',3);}c.restore();}
}
function parcel(b,t){const scale=b.scale??1,side=b.big?72:34;local(b.x,b.y,b.a,()=>{c.scale(scale,scale);box(-side/2,-side/2,side,side,palette[b.color],5,'#ffffffaa');box(-4,-side/2,8,side,'#fff0c3',1);box(-side/2,-4,side,8,'#fff0c3',1);c.beginPath();c.ellipse(-7,-side/2+8,9,5,-.35,0,TAU);c.ellipse(7,-side/2+8,9,5,.35,0,TAU);c.strokeStyle='#fff0c3';c.lineWidth=3;c.stroke();if(b.big)text('LAST ONE',0,16,10,'#5e4b72','center');});}
function feedHeads(t){for(const n of S.names){const j=S.jobs.find(j=>j.n===n&&t>=j.start-.4&&t<=j.start+.35);if(!j)continue;const p=PerformanceData.poseAt(n,t),f=j.f,x=p.nodes[0][0]+f*72,y=p.nodes[0][1]-25,amount=ease((t-j.start+.4)/.4)*(1-ease((t-j.start-.1)/.25));c.save();c.globalAlpha=amount;line([[x+f*42,S.floors[n]+8],[x+f*42,y-13],[x+f*29,y-13]],'#8cb3b3',7);box(x+f*29-11,y-26,22,26,'#517e94',5);for(let i=0;i<3;i++)line([[x+f*21,y-13+i*4],[x+f*6,y-13+i*4]],'#fff3b6',1);c.restore();}}
function effects(t){for(const e of S.events){const dt=t-e.t;if(dt<0||dt>.38||!['tap','crash','clatter','spring','catch','break'].includes(e.type))continue;c.save();c.globalAlpha=(1-dt/.38)*.8;for(let i=0;i<6;i++){const a=i*TAU/6,d=10+dt*45;line([[e.x+Math.cos(a)*d,e.y+Math.sin(a)*d],[e.x+Math.cos(a)*(d+6),e.y+Math.sin(a)*(d+6)]],palette[i%5],2);}c.restore();}
 if(t>=200){for(let i=0;i<130;i++){const age=(t-200+rand(i+77)*4)%6,x=400+rand(i+4)*1450+Math.sin(age*2+i)*35,y=100+age*130;local(x,y,age*4+i,()=>box(-3,-2,6,4,palette[i%5],1));}}
}
function draw(t){t=clamp(t,0,210);const s=S.snapshot(t),cam=cameraAt(t);c.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);c.fillStyle='#e9f2e9';c.fillRect(0,0,1920,1080);c.save();c.translate(960,540);c.scale(cam.z,cam.z);c.translate(-cam.x,-cam.y);room(s);feedHeads(t);
 for(const n of S.names){const p=ElasticRig.at(n,t),f=S.floors[n];c.save();c.globalAlpha=.13;c.beginPath();c.ellipse(p.nodes[0][0],f+1,22,3,0,0,TAU);c.fillStyle=S.colors[n];c.fill();c.restore();LegacyActor.draw(n,t);}
 for(const b of Parcels.at(t))parcel(b,t);effects(t);c.restore();
 // Titles live in the margin; no technical overlays interrupt the story.
 text("DON'T PRESS PLAY",54,52,20,'#35536a');text('ONE BUTTON. THREE FRIENDS.',54,75,10,'#648595');
 if(t<4){const a=ease(t/.5)*(1-ease((t-2.8)/1.2));c.save();c.globalAlpha=a;box(570,100,780,110,'#fff2dce8',23);text("DON'T PRESS PLAY",960,155,48,'#375570','center');text('What could possibly go wrong?',960,187,19,'#af7582','center');c.restore();}
 const ch=s.scene,localT=t-ch*30;if(ch&&localT<2.5){c.save();c.globalAlpha=ease(localT/.3)*(1-ease((localT-1.7)/.8));box(54,98,400,49,'#fff2dce8',14);text(S.chapters[ch],75,130,21,'#785d7e');c.restore();}
 if(t>=168&&t<173){box(1530,35,335,59,'#2a4b64e8',14);text('THREE, TWO… HOLD!',1697,73,21,'#ffe1a2','center');}
 if(t>206){const a=ease((t-206)/1.2);c.save();c.globalAlpha=a;box(530,925,860,108,'#24465ded',24);text('Some presents need teamwork.',960,972,33,'#ffe4a4','center');text('PLEASE DON’T PRESS PLAY.',960,1007,17,'#a9e3df','center');c.restore();}
 return s;}
window.film={canvas,draw,cameraAt,duration:210,stages:S.chapters.map((title,i)=>({title,start:i*30,end:(i+1)*30})),metrics:{simulationHz:120,originalScenario:true,actors:3,nativeTimeline:true,packageCollisions:true}};
})();
