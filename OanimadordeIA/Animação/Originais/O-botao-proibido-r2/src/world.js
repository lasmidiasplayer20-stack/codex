(()=>{'use strict';const{ctx:c,canvas}=LegacyActor,S=StoryV6,{clamp,lerp,smooth}=V,TAU=Math.PI*2;
function line(p,col='#738e98',w=2){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.strokeStyle=col;c.lineWidth=w;c.lineCap=c.lineJoin='round';c.stroke();}
function box(x,y,w,h,col,r=0,stroke=null){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function circle(x,y,r,col,stroke=null,w=2){c.beginPath();c.arc(x,y,Math.max(.01,r),0,TAU);if(col){c.fillStyle=col;c.fill();}if(stroke){c.lineWidth=w;c.strokeStyle=stroke;c.stroke();}}
function text(str,x,y,size=14,col='#667f88',align='left'){c.fillStyle=col;c.font=`600 ${size}px system-ui`;c.textAlign=align;c.fillText(str,x,y);}
const cameraKeys=[{t:0,x:840,y:625,z:1.62},{t:12,x:900,y:620,z:1.7},{t:22,x:1040,y:660,z:2.05},{t:29,x:1020,y:585,z:1.65},{t:39,x:990,y:540,z:1.5},{t:48,x:850,y:540,z:1.45},{t:60,x:920,y:540,z:1.5},{t:72,x:940,y:605,z:1.6},{t:88,x:990,y:620,z:1.7},{t:104,x:1020,y:635,z:1.8},{t:118,x:1130,y:665,z:1.8},{t:129,x:1170,y:725,z:2.2},{t:138,x:1150,y:670,z:1.95},{t:148,x:960,y:625,z:1.75},{t:159,x:840,y:635,z:1.6},{t:173,x:850,y:595,z:1.5},{t:185,x:870,y:625,z:1.7},{t:193,x:870,y:625,z:1.95},{t:203,x:1040,y:655,z:2.1},{t:210,x:1080,y:625,z:1.8}];
function camera(t){return Object.fromEntries(['x','y','z'].map(k=>[k,S.value(cameraKeys,t,k).v]));}
function background(s){const t=s.t;c.fillStyle='#eaf1f3';c.fillRect(-1000,-1000,5000,3000);const grad=c.createLinearGradient(0,250,0,850);grad.addColorStop(0,'#f7faf9');grad.addColorStop(1,'#e0eaed');c.fillStyle=grad;c.fillRect(180,250,1430,560);for(let x=210;x<1600;x+=100)line([[x,270],[x,808]],'#d6e2e5',1);for(let y=310;y<810;y+=100)line([[190,y],[1600,y]],'#d6e2e5',1);
 box(180,260,1430,550,'#ffffff00',16,'#bccfd5');line([[200,800],[1600,800]],'#b2c5cb',2);
 // The same delivery route and power circuit stay visible throughout the film.
 line([[580,850],[1100,850],[1100,878],[1370,878],[1370,664]],s.docked?'#65be9e':'#b6ccd2',4);line([[1100,850],[1100,805]],s.plate?'#e5aa45':'#b6ccd2',4);if(s.docked){const p=(t*70)%790;circle(580+Math.min(p,520),850,3,'#55b492');}
 box(275,450,210,130,'#d4e1e5',12,'#b2c9d0');box(294,468,172,91,'#f3f9fa',7);for(let i=0;i<3;i++){circle(315,488+i*25,4,['#67b699','#ebbc68','#7cc4d4'][i]);line([[333,488+i*25],[447,488+i*25]],'#c0d3d8',2);}text('DELIVERY BAY',294,440,11);
 // Locked exit beyond the same physical gap, never a new scene.
 box(1450,590,105,220,'#b6cbd2',12);box(1460,600,85,210,s.docked?'#cce8dc':'#cad8de',8);line([[1503,607],[1503,807]],'#a6bbc4',2);circle(1531,711,4,'#7c9aa7');text(s.docked?'EXIT OPEN':'EXIT LOCKED',1503,578,11,s.docked?'#3f9174':'#7c939c','center');
 line([[770,350],[1170,350]],'#91acb6',8);line([[795,350],[795,280]],'#bdcfd5',4);line([[1160,350],[1160,280]],'#bdcfd5',4);
 // Upper rail is the visible obstacle responsible for the first failed shot.
 line([[1020,580],[1160,580]],'#9db2bb',10);line([[1110,580],[1110,330],[1240,330]],'#b9cbd0',5);
 // Receiver points to the goal before anybody moves.
 box(1340,605,60,58,'#a9bec8',9);circle(1370,630,24,'#e9f5f7','#88a8b5',4);circle(1370,630,17,s.docked?'#72dacd':'#cfdee4');if(!s.docked){line([[1362,630],[1378,630]],'#93aeb8',2);line([[1370,622],[1370,638]],'#93aeb8',2);}text('POWER',1370,591,11,'#71929d','center');
 // Magnetic ring and control are fixed; only their operating state changes.
 const pulse=s.coreTrapped?1:0;circle(1090,540,43,null,pulse?'#76bcc9':'#c0d2d8',8);circle(1090,540,33,null,'#e6f0f3',2);line([[1090,497],[1090,440],[1190,440],[1190,748],[1115,748]],pulse?'#7ebec9':'#bdcfd4',4);text('FIELD',1090,475,11,'#87a1aa','center');
 box(1070,706,56,75,'#b5c9cf',7);circle(1100,725,12,t>=62.8?'#77b69c':'#d7927b',null);circle(1080,748,9,s.belt?'#61a8bd':'#9fb3bc');text('BRAKE',1100,701,10,'#73909c','center');
 // Safety line spool.
 circle(600,690,22,'#c3d5da','#97b4bf',3);circle(600,690,13,'#e4eef0','#9fbac3',2);line([[600,712],[600,790]],'#b4cbd3',4);
 // Two floor slabs and the actual gap.
 box(0,812,1160,500,'#dae5e8');box(1360,812,1000,500,'#dae5e8');box(1160,811,200,500,'#263d4a');for(let i=0;i<5;i++)line([[1165+i*40,830],[1200+i*40,895]],'#314e5c',2);line([[180,810],[1160,810]],'#6e8e9a',4);line([[1360,810],[1620,810]],'#6e8e9a',4);
 for(let side of[1154,1360]){for(let i=0;i<3;i++)box(side,815+i*11,6,5,'#e1ba66');}
 // Eight hinged segments visibly deploy from the near bank.
 for(let i=0;i<8;i++){const u=clamp(s.bridge*8-i),x=1160+i*25;c.save();c.translate(x,810);c.rotate((1-u)*Math.PI/2+(s.t>124?(1-s.bridge)*.7:0));box(0,-4,25,8,u>.9?'#7ba7ad':'#b98f65',2);line([[3,-5],[20,-5]],'#e7f4ef',1);c.restore();}
 box(1068,804,64,6,s.plate?'#d4ac54':'#b9c9cd',3);text('HOLD',1100,837,10,s.plate?'#9b7a31':'#9db2b9','center');
 // Conveyor is a physical strip, with motion tied to its own drive.
 box(600,790,445,20,'#96b3bd',8);for(let i=0;i<26;i++){let x=600+((i*18-s.beltTravel)%450+450)%450;if(x<1041)line([[x,795],[x+6,802]],'#d5e5e9',2);}circle(612,800,6,'#d8e4e8');circle(1034,800,6,'#d8e4e8');
 // Safety buffer which rebounds the cart.
 line([[1053,761],[1053,799]],'#92adb8',6);for(let i=0;i<4;i++)line([[1046,766+i*8],[1058,771+i*8]],'#d2b06c',3);
 // Seesaw and pan.
 c.beginPath();c.moveTo(795,804);c.lineTo(820,762);c.lineTo(845,804);c.closePath();c.fillStyle='#9db8c2';c.fill();c.save();c.translate(820,775);c.rotate(s.lever);box(-125,-7,250,14,'#6a909f',6);box(-125,-12,34,5,'#bdd3dc',2);box(91,-12,34,5,'#bdd3dc',2);c.restore();circle(820,775,6,'#d5e6e9');if(t>=148){const h=36*smooth((t-148)/4);line([[860,790],[860,775-h]],'#7d9faa',5);line([[850,775-h],[870,775-h]],'#7397a4',5);circle(860,787,5,'#c5d9df');for(let i=0;i<4;i++)line([[855,778-i*h/6],[865,775-i*h/6]],'#adc6ce',2);}
 if(s.field>.01){c.save();c.globalAlpha=s.field*.28;for(let i=0;i<4;i++){const r=70+((t*35+i*65)%260);circle(1090,540,r,null,'#87c8d2',1.5);}c.globalAlpha=s.field*.65;for(let i=0;i<19;i++){const x=650+rand(i+44)*510,y=780-((t*22+i*29)%360);line([[x,y+5],[x,y-4]],'#7fb9c4',1.5);}c.restore();}
}
function cart(s){const{x,y}=s.cart;line([[x-48,y-12],[x-70,y-12],[x-70,y-42]],'#6b8f9d',5);box(x-48,y-33,96,52,'#acc7d1',7,'#789aa9');box(x-40,y-27,80,10,'#d5e8ee',3);for(let side of[-30,30]){circle(x+side,y+27,13,'#657e8b');circle(x+side,y+27,8,'#d2e2e7');const a=(x-580)/13;line([[x+side-Math.cos(a)*7,y+27-Math.sin(a)*7],[x+side+Math.cos(a)*7,y+27+Math.sin(a)*7]],'#819faa',2);}line([[x+35,y+25],[x+48,y+25],[x+48,y+10]],s.brakeLocked?'#408e73':'#b58562',4);if(s.brakeLocked)circle(x+48,y+24,4,'#55be96');}
function effects(s){for(const e of S.events){const dt=s.t-e.t;if(dt<0||dt>.7)continue;const u=dt/.7,heavy=['heavy','land','metal','bounce','switch','catch','tap'].includes(e.type);if(heavy){c.save();c.globalAlpha=(1-u)*.8;for(let i=0;i<6;i++){const a=i*TAU/6,d=10+u*25;line([[e.x+Math.cos(a)*d,e.y+Math.sin(a)*d],[e.x+Math.cos(a)*(d+7),e.y+Math.sin(a)*(d+7)]],e.type==='catch'?'#66bdca':'#9b8170',2);}c.restore();}}
 for(const[n,lo,hi,kind]of[['cyan',18,19.2,'!'],['amber',26,27.2,'!'],['amber',38.2,39.2,'…'],['hero',108,109.2,'!'],['amber',120,121,'!'],['cyan',141,142,'…'],['amber',206,207,'…']])if(s.t>=lo&&s.t<=hi){const p=ElasticRig.at(n,s.t);text(kind,p.nodes[2][0]+25,p.nodes[2][1]-22,20,S.colors[n]);}
}
function draw(t){t=clamp(t,0,210);const s=S.snapshot(t),cam=camera(t);c.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);c.fillStyle='#eaf1f3';c.fillRect(0,0,1920,1080);c.save();c.translate(960,540);c.scale(cam.z,cam.z);c.translate(-cam.x,-cam.y);background(s);
 for(const n of S.names){const p=ElasticRig.at(n,t),r=p.nodes[0],height=Math.max(0,728-r[1]);c.save();c.globalAlpha=.14*Math.max(.2,1-height/400);c.beginPath();c.ellipse(r[0],812,Math.max(10,28-height*.035),4,0,0,TAU);c.fillStyle=S.colors[n];c.fill();c.restore();}
 cart(s);const cup=s.cup;c.save();c.translate(cup.x,cup.y);c.rotate(s.field>.1?Math.sin(t*1.7)*.5:0);circle(12,-9,7,null,'#d6ac65',3);box(-11,-24,23,25,'#e7ba6a',4);box(-8,-22,6,18,'#f7d99c',2);c.restore();for(const n of S.names)LegacyActor.draw(n,t);
 if(t>=47&&t<74){const p=ElasticRig.at('hero',t).nodes[4],q=ElasticRig.at('amber',t).nodes[8],alpha=smooth((t-47)/2)*(1-smooth((t-71)/3));c.save();c.globalAlpha=alpha;for(const[a,b]of[[[600,690],p],[p,q]]){c.beginPath();c.moveTo(...a);c.quadraticCurveTo((a[0]+b[0])/2,(a[1]+b[1])/2+20,...b);c.strokeStyle='#bd996b';c.lineWidth=3;c.stroke()}c.restore()}
 // Visible controls and explicit operating state of the gravity machine.
 function control(x,y,label,pressed){box(x-18,y-20,36,45,'#a9c7cf',5);circle(x,y,11,pressed?'#6abca9':'#de936a');text(label,x,y-32,10,'#698792','center')}
 control(640,748,'SYNC A',t>=159&&t<=171);control(1080,748,t<148?'DO NOT PRESS':'SYNC B',s.pressed);
 if(s.warning){text(s.stabilizing?'STABILIZING':'GRAVITY OVERLOAD',1090,390,15,s.stabilizing?'#248e8b':'#ba6858','center');text('DUAL HOLD REQUIRED',1090,411,10,'#8b7a74','center');if(t>=159&&t<170){box(1000,426,180,6,'#c7d9dd',3);box(1000,426,180*smooth((t-160)/10),6,'#51a99d',3);text('HOLD BOTH',1090,453,11,'#668e91','center')}}
 if(t>195){box(1062,715,36,13,'#8eafb9',4);text('NO.',1080,695,14,'#718a94','center')}
 const o=s.orb;c.save();c.shadowColor='#55bfcc';c.shadowBlur=s.coreTrapped?17:7;circle(o.x,o.y,15,'#67d3db','#2a8fa7',2);circle(o.x-4,o.y-5,4,'#d4ffff');c.restore();
 // Short trails only while the actual object is travelling.
 if(['bad-launch','rail-rebound','brake-launch','controlled-launch','handoff'].includes(o.phase)){c.save();for(let i=1;i<5;i++){const old=S.snapshot(Math.max(0,t-i*.025)).orb;c.globalAlpha=.16*(1-i/5);circle(old.x,old.y,13,'#67c7d2');}c.restore();}
 effects(s);c.restore();
 // English editorial text occupies the margin, never interrupts the action.
 const ch=S.chapters[s.scene];text('THE FORBIDDEN BUTTON',58,57,17,'#668491');text(`${String(s.scene+1).padStart(2,'0')}  ${ch.title}`,58,87,19,'#304f5e');text('ONE BUTTON · THREE FRIENDS',1862,57,12,'#7e9aa5','right');line([[58,1019],[1862,1019]],'#c5d6dd',2);line([[58,1019],[58+1804*t/210,1019]],'#699cae',3);
 return s;}
window.film={canvas,draw,duration:210,stages:S.chapters,metrics:{finite:true,sourceVideoPixelsUsed:0,simulationHz:120,storyDuration:210,globalTimeRemapping:false,actors:3,persistentRoom:true}};
})();
