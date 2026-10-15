/* Procedural lab, camera, physical props and event-driven effects. No image/video assets. */
(()=>{'use strict';const {ctx:c,canvas}=LegacyActor,{lerp,smooth,clamp}=V,TAU=Math.PI*2;
const palette=['#30a9c2','#eea14b','#56a8aa','#9f83cf','#dd9066','#58b7a4'];
function line(p,color='#526b76',w=3){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.strokeStyle=color;c.lineWidth=w;c.lineCap=c.lineJoin='round';c.stroke();}
function circle(x,y,r,color,stroke=null,w=2){c.beginPath();c.arc(x,y,Math.max(.01,r),0,TAU);if(color){c.fillStyle=color;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function rect(x,y,w,h,color,round=0,stroke=null){c.beginPath();c.roundRect(x,y,w,h,round);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function glow(x,y,r,col){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,col.slice(0,7)+'00');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
function gear(x,y,r,t,col='#99b3b8'){c.save();c.translate(x,y);c.rotate(t);circle(0,0,r*.8,null,col,4);for(let i=0;i<10;i++){const a=i*TAU/10;line([[Math.cos(a)*r*.7,Math.sin(a)*r*.7],[Math.cos(a)*r,Math.sin(a)*r]],col,7);}circle(0,0,r*.25,'#eef3ed',col,3);c.restore();}
function coil(a,b,t,col='#7f9ea6'){const points=[a],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len;for(let i=1;i<45;i++){const u=i/45,w=Math.sin(u*Math.PI)*Math.sin(u*TAU*8+t)*8;points.push([lerp(a[0],b[0],u)+nx*w,lerp(a[1],b[1],u)+ny*w]);}points.push(b);line(points,col,2);}
function arrow(a,b,col){line([a,b],col,2.5);const ang=Math.atan2(b[1]-a[1],b[0]-a[0]);line([[b[0]-12*Math.cos(ang-.5),b[1]-12*Math.sin(ang-.5)],b,[b[0]-12*Math.cos(ang+.5),b[1]-12*Math.sin(ang+.5)]],col,2.5);}
const shotLists=[
 [[0,840,610,1320],[4,625,650,710],[11,1010,620,960],[17,1100,620,1000],[22,1000,620,1200]],
 [[0,850,610,1300],[6,860,510,1390],[12.6,650,620,900],[16,970,570,1150],[21,950,620,1250]],
 [[0,850,610,1300],[3,795,640,980],[9,900,625,1160],[16,1050,620,1030],[21,1000,620,1130]],
 [[0,900,610,1260],[4,920,470,1200],[9,910,440,1080],[16,900,600,1190],[22,900,620,1100]],
 [[0,850,610,1300],[3,780,570,1150],[7,960,490,1300],[14,920,620,1050],[18,1050,590,1080]],
 [[0,820,610,1270],[4,650,630,950],[9,940,625,1280],[16,1100,620,1000],[20,1070,630,850]]
];
function camera(s){if(s.gag){const config=[[1060,605,1080],[850,520,1270],[1010,585,1220],[920,510,1430],[1010,555,1190],[1070,620,900]][s.scene],reaction=s.local>11.5&&s.scene!==3,w=config[2]*(reaction?.93:1),x=config[0],y=config[1];return{x:x-w/2,y:y-w*9/32,width:w,height:w*9/16,shot:reaction?6:5};}const shots=shotLists[s.scene];let i=0;while(i<shots.length-1&&s.q>=shots[i+1][0])i++;const [start,x,y,w]=shots[i],u=clamp((s.q-start)/6),width=w*(1-.018*u);return {x:x-width/2,y:y-width*9/32,width,height:width*9/16,shot:i};}
function background(s,cam){const accent=palette[s.scene];let g=c.createLinearGradient(0,100,0,1000);g.addColorStop(0,'#e3eeeb');g.addColorStop(.7,'#f9f7ec');g.addColorStop(1,'#d8e7e4');c.fillStyle=g;c.fillRect(-800,-400,3300,1800);
 // Diffuse daylight and distant architecture at different depths.
 glow(1080,280,600,'#fffde4b0');
 for(let i=-1;i<7;i++){const x=80+i*290;rect(x,160,245,370,'#c9dfdf38',90,'#c4d8d755');line([[x+20,450],[x+220,450]],'#d2dfd9',2);line([[x+120,180],[x+120,510]],'#cfdfdc',2);}
 for(let i=0;i<4;i++){const x=160+i*420;line([[x,130],[x,240]],'#b4c8c3',3);rect(x-60,235,120,8,'#94b1b1',4);glow(x,255,85,'#fff9c960');}
 // Mechanical observatory rings in the back wall.
 c.save();c.globalAlpha=.19;for(let j=0;j<3;j++){let x=300+j*510,y=550;circle(x,y,105,null,'#789aa1',1.3);circle(x,y,85,null,'#8aa9ad',1);for(let i=0;i<24;i++){const a=i*TAU/24+s.t*.025;line([[x+Math.cos(a)*98,y+Math.sin(a)*98],[x+Math.cos(a)*105,y+Math.sin(a)*105]],'#6e969f',2);}}c.restore();
 for(let i=0;i<35;i++){const x=(rand(i+9)*1800+s.t*(3+rand(i)*6))%1800,y=210+rand(i+80)*560+Math.sin(s.t*.45+i)*12;circle(x,y,1+rand(i+30)*1.4,'#aec7bc66');}
 // Floor reflects event color; perspective lines and contact shadows ground the action.
 rect(-800,814,3300,600,'#e1e9e3');let floor=c.createLinearGradient(0,815,0,1080);floor.addColorStop(0,'#c8d9d2');floor.addColorStop(1,'#edf0e8');c.fillStyle=floor;c.fillRect(-800,815,3300,700);
 for(let i=-12;i<20;i++)line([[800+(i*125-800)*.7,815],[i*190,1250]],'#c9d8d0',1);
 for(let i=0;i<6;i++){let y=820+Math.pow(i,2)*14;line([[-800,y],[2400,y]],'#bdcfc544',1);}
 line([[-800,814],[2400,814]],'#304c54',4);line([[-800,819],[2400,819]],accent+'66',2);
 // Small background plant gently moves with air and with nearby shocks.
 for(const x of[225,1430]){rect(x-19,778,38,35,'#97aaa0',6);for(let j=0;j<5;j++){let tip=[x+Math.sin(j*1.9+s.t*.7)*16,751-j*8];line([[x,780],tip],'#729c89',2);c.save();c.translate(...tip);c.rotate(Math.sin(j+s.t*.6)*.3);c.beginPath();c.ellipse(6,-3,12,5,-.3,0,TAU);c.fillStyle='#85ac90';c.fill();c.restore();}}
 // Faint colored bounce light instead of a white-flash transition.
 glow(s.orb.x,810,125,accent+'25');
}
function pedestal(x,y=750,col='#779aa3'){rect(x-42,y,84,64,'#cfdfda',7,col);rect(x-49,y-8,98,12,col,5);circle(x,y+23,9,'#e5f5ee',col,3);}
function cube(s){let o=s.cube;const x=o.x-35,y=o.y-35;c.save();c.translate(x,y);const g=c.createLinearGradient(0,0,70,70);g.addColorStop(0,'#b0c4c7');g.addColorStop(1,'#66838c');rect(0,0,70,70,g,7,'#385866');line([[7,62],[7,7],[62,7]],'#deeeee',3);line([[10,14],[29,14],[29,30],[48,30],[48,50],[62,50]],'#3a6269',3);for(const a of[[10,10],[60,10],[10,60],[60,60]])circle(...a,2,'#e5efeb');c.restore();}
function props(s){const q=s.q,col=palette[s.scene];
 if(s.scene===0){
  // A rolling pulse tips five dominoes, revealing a mechanism.
  for(let i=0;i<5;i++){const x=860+i*26,w=smooth((q-(11+i*.23))/.45);c.save();c.translate(x,812);c.rotate(w*1.15);rect(-5,-39,10,39,i%2?'#8ab7b4':'#adc6b9',3,'#517b80');c.restore();}
  pedestal(1250,748);gear(1250,776,16,q*.5);line([[1210,740],[1210,620],[1285,620],[1285,740]],'#8da8aa',5);circle(1250,650,18,'#e0ece5',q>14?col:'#96b6b6',4);
  for(let i=0;i<3;i++)circle(1228+i*21,720,4,q>12+i?col:'#bdcfcb');
 }
 if(s.scene===1){
  line([[740,814],[780,750],[820,814]],'#9bb3af',8);circle(780,750,10,'#edf4e7','#486e77',3);
  c.save();c.translate(780,750);c.rotate(s.leverAngle);rect(-170,-9,340,18,'#8ba5a3',7,'#385a66');line([[-155,-11],[155,-11]],'#d6ebe2',3);rect(-155,-18,72,9,'#e8b96f',4);rect(90,-18,70,9,'#6aaab2',4);c.restore();
  coil([580,808],[580,770-Math.sin(q*3)*smooth((q-7)/.5)*(1-smooth((q-9)/.5))*18],q,'#9ba9a0');
  line([[1090,814],[1090,564],[1240,564],[1240,814]],'#b2c6be',7);line([[1090,575],[1240,575]],'#6e979b',4);circle(1165,540,28,null,q>17?'#62b5b0':'#b0c3ba',7);circle(1165,540,13,null,'#bdd5ca',3);
 }
 if(s.scene===2){
  rect(595,795,500,16,'#94aca7',6,'#46656d');for(let i=0;i<20;i++){let x=605+i*25;circle(x,803,7,'#d2e1d8','#718f92',2);line([[x-4*Math.cos(q*5),803-4*Math.sin(q*5)],[x+4*Math.cos(q*5),803+4*Math.sin(q*5)]],'#66858a',1);}
  c.save();c.setLineDash([7,8]);c.lineDashOffset=-q*25;line([[605,787],[1090,787]],'#5c9a9d',2);c.restore();
  pedestal(1060,754);rect(1038,744+(q>6&&q<9?6:0),44,10,q>6&&q<9?'#72bba5':'#e3ac62',4);
  line([[1120,814],[1120,560],[1300,560],[1300,814]],'#adc2ba',7);gear(1120,570,23,q*.8);gear(1300,570,23,-q*.8);line([[1120,546],[1300,546]],'#829c98',2);
  cube(s);const cx=s.cube.x;line([[cx+35,s.cube.y-12],[cx+70,s.cube.y-18],[cx+105,s.cube.y-12]],'#a77e56',3);
 }
 if(s.scene===3){
  pedestal(1090);circle(1090,746,22,null,q>2&&q<19?'#9478c8':'#72acb6',4);
  for(let j=0;j<3;j++){const x=420+j*360;line([[x,800],[x,700]],'#b9c7bb',3);circle(x,690,12,'#d0ded4','#7d9da1',3);}
  if(q>3&&q<20){const w=smooth((q-3)/2)*(1-smooth((q-18)/2));c.save();c.globalAlpha=w*.5;for(let i=0;i<14;i++){const x=430+rand(i+50)*800,y=420+rand(i+100)*300+Math.sin(q+i)*35,ang=q*.4+i;c.save();c.translate(x,y);c.rotate(ang);rect(-5,-5,10,10,'#a1bac1',2);c.restore();}c.restore();
    const h=ElasticRig.at('hero',s.t).nodes[4],a=ElasticRig.at('amber',s.t).nodes[6];line([[450,690],h],'#a8a089',2);coil(h,a,q,'#8b9a93');
    c.save();c.globalAlpha=.28*w;for(let i=0;i<3;i++)circle(1090,650,80+i*70+Math.sin(q)*5,null,'#a18cd1',1);c.restore();
  }
 }
 if(s.scene===4){
  // Five physical bumpers route the orb. Their event ripples show the collision order.
  for(const [x,y,r]of[[670,680,25],[950,370,30],[1190,600,25],[930,510,22],[660,680,25]]){line([[x,y+r],[x,814]],'#c5d2c788',3);circle(x,y,r,'#d5e5dc','#729ca7',5);circle(x,y,r*.5,'#99bfc2','#e7f4e8',3);}
  const compression=1-smooth(Math.abs(q-4)/.8);coil([620,811],[620,770+compression*17],0,'#93a49e');rect(580,763+compression*17,80,13,'#97bab1',6,'#466e76');
  pedestal(1140,750);rect(1118,740+(q>10&&q<13?5:0),44,11,'#e8b773',4);
  gear(1190,660,55,q*(1+s.charge*3),'#7faaa5');glow(1190,660,110,'#5fceb9'+(s.charge>.5?'70':'18'));circle(1190,660,25,s.charge>.5?'#69d1bb':'#bad4c6','#e6f6e5',4);
 }
 if(s.scene===5){
  // Fold-out bridge: central supports are visibly powered by a two-person crank.
  rect(680,708,65,106,'#b7cdc0',8,'#638b8b');gear(710,727,24,q>5&&q<9?q*3:0);line([[700,705],[710,705]],'#3d6c76',5);
  pedestal(530,755);rect(505,744+(q>5&&q<8?7:0),50,12,q>5&&q<8?'#79bca5':'#e5b373',5);
  rect(805,815,360,90,'#466b7144');for(let i=0;i<8;i++){const u=clamp(s.bridge*9-i),x=805+i*45;c.save();c.translate(x,810);c.rotate((1-u)*1.45);rect(0,-8,45,10,'#b1cdc1',2,'#5c8689');c.restore();}
  for(let i=0;i<4;i++){const x=845+i*90;line([[x,815],[x,880-s.bridge*32]],'#8aa7a4',5);circle(x,815,4,'#e3efe0','#709593',2);}
  c.save();c.translate(1230,665);const active=smooth((q-8)/4);glow(0,0,130,'#6fe0bc60');c.scale(.65,1);circle(0,0,130,null,'#9dbbb0',14);circle(0,0,112,null,'#6abda8',4);c.save();c.rotate(s.t*.25);for(let i=0;i<12;i++){let a=i*TAU/12;line([[Math.cos(a)*119,Math.sin(a)*119],[Math.cos(a)*133,Math.sin(a)*133]],i%3?'#b5d5b7':'#e4b880',5);}c.restore();c.globalAlpha=active*.4;circle(0,0,106,'#a0dbc3');c.restore();
 }
}
function orb(s){const o=s.orb,col=s.scene===3?'#9f84d9':s.scene===4?'#e2a259':'#32b5cb';glow(o.x,o.y,65,col+'45');const g=c.createRadialGradient(o.x-5,o.y-6,1,o.x,o.y,18);g.addColorStop(0,'#e4ffff');g.addColorStop(.25,'#9ee9ec');g.addColorStop(.65,col);g.addColorStop(1,'#36859e');circle(o.x,o.y,o.r,g,'#447f94',1.5);circle(o.x-5,o.y-6,3,'#f5fff6');
 // Physically diminishing reflection on the floor.
 c.save();c.globalAlpha=Math.max(0,1-(814-o.y)/260)*.13;c.translate(o.x,816);c.scale(1,.16);circle(0,0,18,col);c.restore();}
function shadows(s){for(const n of TrioStory.names){const a=s.actors[n],h=Math.max(0,732-a.y),w=30-h*.025;c.save();c.globalAlpha=clamp(.18-h/1500,.04,.18);c.translate(a.x,813);c.scale(1,.13);circle(0,0,w,'#395b61');c.restore();}}
function effects(s){for(const e of TrioStory.events){const dt=s.t-e.t;if(dt<0||dt>.45||e.type==='step')continue;const u=dt/.45,col=e.type==='land'?'#c2a77e':palette[s.scene];c.save();c.globalAlpha=(1-u)*.65;circle(e.x,e.y,8+dt*(e.type==='pulse'||e.type==='charge'?240:90),null,col,2*(1-u)+.4);
  for(let j=0;j<(e.type==='pulse'?20:8);j++){const a=j*TAU/8+rand(j)*.7,v=35+rand(j+50)*60,x=e.x+Math.cos(a)*v*dt,y=e.y+Math.sin(a)*v*dt+70*dt*dt;line([[x,y],[x-Math.cos(a)*5*(1-u),y-Math.sin(a)*5*(1-u)]],col,2);}c.restore();}
}
function streaks(s){if(s.t<.04)return;for(const name of TrioStory.names){const now=ElasticRig.at(name,s.t),prev=ElasticRig.at(name,Math.max(s.scene*13,s.t-.05));if(!now||!prev)continue;const a=now.nodes[2],b=prev.nodes[2],dx=a[0]-b[0],dy=a[1]-b[1],speed=Math.hypot(dx,dy)/.05;if(speed<240)continue;const scale=Math.min(1,28/Math.hypot(dx,dy));c.save();c.globalAlpha=.32;for(let i=0;i<3;i++){const off=(i-1)*7;line([[b[0]-dx*scale*.4+off,b[1]-dy*scale*.4],[b[0]-dx*scale*(1+i*.25)+off,b[1]-dy*scale*(1+i*.25)]],TrioStory.colors[name],1.8);}c.restore();}}
function gagBack(s){if(!s.gag)return;const q=s.local;
 if(s.scene===0){const reach=TrioStory.path([[8.6,0],[9.3,0],[9.52,95],[9.72,12],[10,0],[11.65,0],[11.9,70],[12.05,0],[13,0]],q)[0];rect(1230,628,42,46,'#a1bab4',6,'#5b8189');coil([1245,650],[1245-reach,650],0,'#a28e66');c.save();c.translate(1238-reach,650);rect(-20,-15,34,30,'#da6b53',12,'#8d4b42');circle(-16,-5,10,'#e78461');line([[-5,-11],[6,-11]],'#f9bd99',2);c.restore();}
 if(s.scene===2&&q>9.1&&q<10.8){for(const off of[-23,23]){circle(s.cube.x+off,s.cube.y+37,9,'#536e77','#d3e8df',2);gear(s.cube.x+off,s.cube.y+37,5,q*18,'#d3e8df');}arrow([s.cube.x-100,780],[s.cube.x-48,780],'#e3a357');}
 if(s.scene===3){const a=ElasticRig.at('hero',s.t).nodes[4],b=ElasticRig.at('amber',s.t).nodes[6];line([[450,690],a],'#a9a08b',2);coil(a,b,q*4,'#8c9a8d');if(q>9&&q<9.45){const h=ElasticRig.at('amber',s.t).nodes[2],u=(q-9)/.45;c.save();c.globalAlpha=1-u;for(let i=0;i<7;i++){circle(h[0]-25-u*(40+i*5),h[1]+Math.sin(i*2)*15,7+u*16,'#e4f4df');}c.restore();}}
 if(s.scene===4&&q>9.7&&q<11.8){const dt=q-9.7;for(let i=0;i<3;i++){const x=1090+Math.cos(dt*7+i*2.1)*130-dt*60,y=590+Math.sin(dt*7+i*2.1)*85;glow(x,y,28,['#e4a75b60','#41b9ce60','#aa81c860'][i]);circle(x,y,11,['#e5aa5f','#48bbcc','#ae88ce'][i],'#fff4d5',1.5);}}}
function gagFront(s){if(!s.gag)return;const q=s.local;
 // Brief impact marks and wobbling stars are visible only after the causal event.
 for(const e of TempoV5.extraEvents){const d=s.t-e.t;if(d<0||d>.42||!['bonk','punch','heavy'].includes(e.type))continue;c.save();c.globalAlpha=1-d/.42;c.translate(e.x,e.y);c.rotate(d*4);const pts=[];for(let i=0;i<12;i++){const a=i*Math.PI/6,r=i%2?8:25*(1+d);pts.push([Math.cos(a)*r,Math.sin(a)*r]);}pts.push(pts[0]);line(pts,'#e6a03c',2.5);c.restore();}
 if((s.scene===0&&q>10.4&&q<11)||(s.scene===1&&q>11.2&&q<12)){const h=ElasticRig.at('amber',s.t).nodes[2];for(let i=0;i<3;i++){const a=q*8+i*2.1,x=h[0]+Math.cos(a)*30,y=h[1]-30+Math.sin(a)*7;line([[x-4,y],[x+4,y],[x,y-4],[x,y+4]],'#dba73e',2);}}
 if(s.scene===5&&q>=9.9){const h=ElasticRig.at('hero',s.t).nodes[2],u=smooth((q-9.9)/.45),x=lerp(1020,h[0],u),y=lerp(530,h[1]-36,u)+Math.sin((q-10.3)*20)*Math.exp(-Math.max(0,q-10.3)*5)*3;c.save();c.translate(x,y);c.rotate(Math.sin(q*14)*.04);c.fillStyle='#edbf43';c.beginPath();c.ellipse(0,2,24,15,0,0,Math.PI*2);c.fill();circle(12,-14,13,'#f5cf52');rect(18,-17,16,7,'#e68b3c',3);circle(15,-18,2.2,'#263540');c.beginPath();c.ellipse(-5,2,11,7,-.25,0,Math.PI*2);c.strokeStyle='#ce9c32';c.lineWidth=2;c.stroke();line([[-23,1],[-30,-8],[-19,-4]],'#edbf43',6);c.restore();for(const hit of[9.9,11.8,12.55]){const d=q-hit;if(d>=0&&d<.28){c.save();c.globalAlpha=1-d/.28;line([[x+40,y-18],[x+55+d*20,y-24]],'#deaa37',2);line([[x+42,y-9],[x+58+d*20,y-9]],'#deaa37',2);c.restore();}}}
}
function draw(t){const s=TrioStory.snapshot(t),cam=camera(s);c.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);c.clearRect(0,0,1920,1080);c.save();const z=1920/cam.width;c.scale(z,z);c.translate(-cam.x,-cam.y);background(s,cam);shadows(s);props(s);gagBack(s);streaks(s);orb(s);
 // Back-to-front order is stable; identity never swaps during turns.
 for(const n of ['cyan','hero','amber']){LegacyActor.draw(n,s.t);const p=ElasticRig.at(n,s.t),h=p.nodes[2];c.save();c.globalAlpha=.23;line([[h[0]-p.r*.6,h[1]-p.r*.5],[h[0]-p.r*.28,h[1]-p.r*.8]],'#fff8dd',1.8);c.restore();}
 effects(s);gagFront(s);c.restore();
 // Chapter slate and progress are quiet, outside the action field.
 c.fillStyle='#3c646c';c.font='600 21px system-ui';c.fillText(String(s.scene+1).padStart(2,'0')+' / 06',65,68);c.font='400 28px system-ui';c.fillStyle='#36545d';c.fillText(TrioStory.chapters[s.scene].title,65,106);
 for(let i=0;i<6;i++){rect(65+i*48,130,35,3,i===s.scene?palette[i]:'#bbcfc5',2);}
 // Fast scene cuts. Only the opening and final comic cut have a very short fade.
 if(t<.08){c.globalAlpha=1-smooth(t/.08);c.fillStyle='#eaf0e8';c.fillRect(0,0,1920,1080);c.globalAlpha=1;}
 if(t>77.85){c.globalAlpha=smooth((t-77.85)/.15);c.fillStyle='#18313b';c.fillRect(0,0,1920,1080);c.globalAlpha=1;}
}
window.TrioWorld={draw,camera,canvas,shotLists};})();
