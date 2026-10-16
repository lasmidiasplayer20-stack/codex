/* Original button-story set. Physical surfaces and contacts share the story's world coordinates. */
(()=>{'use strict';const{canvas,ctx:c}=LegacyActor,S=StoryV6,{clamp,lerp,smooth}=V,TAU=Math.PI*2;
const C={paper:'#f7eddf',ink:'#28384d',grid:'#c4d7dc',teal:'#308c97',coral:'#e66b57',gold:'#e8b45c',purple:'#857aa5'};
function line(points,col=C.ink,w=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.strokeStyle=col;c.lineWidth=w;c.lineCap=c.lineJoin='round';c.stroke();}
function box(x,y,w,h,fill,r=0,stroke=null){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function circle(x,y,r,fill,stroke=null,w=2){c.beginPath();c.arc(x,y,Math.max(.01,r),0,TAU);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function text(str,x,y,size=12,color=C.ink,align='left'){c.font=`600 ${size}px system-ui`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);}
const cameraKeys=[[0,850,650,1.55],[8,920,665,1.7],[16,970,670,2.05],[20,970,660,2.05],[23,970,585,1.65],[28,930,560,1.6],[40,900,560,1.6],[48,910,560,1.55],[58,960,570,1.55],[67,980,615,1.65],[74,950,670,1.85],[83,1030,670,1.75],[88,1110,670,1.7],[93,1190,740,1.8],[100,1190,740,1.8],[107,1135,700,1.8],[115,835,660,1.55],[123,835,625,1.7],[130,835,650,1.7],[137,930,665,1.8],[143,970,665,2.25],[147,970,665,2.25],[150,1030,665,1.75]].map(([t,x,y,z])=>({t,x,y,z}));
function camera(t){return Object.fromEntries(['x','y','z'].map(k=>[k,S.value(cameraKeys,t,k).v]));}
function arrow(x,y,dir,color,size=23){line([[x,y+dir*size],[x,y-dir*size]],color,4);line([[x-9,y-dir*(size-10)],[x,y-dir*size],[x+9,y-dir*(size-10)]],color,4);}
function control(x,label,color,pressed,covered=false){
 box(x-17,714,34,92,'#a8c6c9',5,C.teal);box(x-25,689,50,28,'#e8eff0',7,'#809fa8');
 circle(x,704,16,'#fff5e4',color,2);circle(x,704,pressed?10:12,pressed?'#65b99d':color,'#ffffffaa',1);
 text(label,x,642,10,color,'center');line([[x,649],[x,673]],'#9eb4bc',1);
 if(covered){box(x-24,683,48,31,'#b5ccd5',7,C.teal);line([[x-16,694],[x+16,694]],'#edf4f5',2);}
}
function background(s){
 c.fillStyle=C.paper;c.fillRect(-2000,-1500,6000,4000);
 const grad=c.createLinearGradient(0,250,0,810);grad.addColorStop(0,'#e2eaf2');grad.addColorStop(1,'#f3eadf');c.fillStyle=grad;c.fillRect(360,250,1270,560);
 for(let x=380;x<=1610;x+=80)line([[x,270],[x,806]],'#ccd9df',.8);
 box(390,365,250,223,'#f1c9ae',20,'#b9a8bb');box(402,377,226,199,'#f8dfbf',14);
 circle(565,421,29,'#fff2cf');c.beginPath();c.moveTo(402,545);c.lineTo(454,482);c.lineTo(496,532);c.lineTo(553,470);c.lineTo(628,548);c.lineTo(628,576);c.lineTo(402,576);c.closePath();c.fillStyle='#abc4bb';c.fill();text('GRAVITY TEST CHAMBER',405,350,13,'#6e8298');
 // Real ceiling used by the inverted character and integrated props.
 box(510,302,660,19,'#7b8ba6',5);box(510,321,660,4,'#c9a168',1);for(let x=520;x<1170;x+=28)line([[x,305],[x+11,317]],'#b8c7dc',3);
 line([[1139,325],[1139,704]],'#82a2b2',5);for(let y=550;y<704;y+=22)line([[1132,y],[1147,y]],'#c5b78a',4);text('BRAKE',1140,530,11,C.teal,'center');
 // A display of the actual field state rather than a transported core objective.
 box(907,377,203,137,'#a6bfd0',13,'#728caa');box(919,389,179,109,'#edf4ec',8);
 const status=s.stabilized?'STABLE':s.t>=83.4?'OVERLOAD':s.field>.9?'INVERTED':'NORMAL';text('GRAVITY',1008,409,12,'#6d8699','center');text(status,1008,431,14,s.stabilized?'#338d75':s.field?C.coral:C.teal,'center');
 const dir=s.gravity[1]<0?1:-1;arrow(975,465,dir,s.field?C.coral:C.teal,17);text(s.stabilized?'LOCKED':s.field?'ACTIVE':'1.0 G',1034,468,11,s.field?C.coral:C.teal,'center');
 if(s.t>=110&&s.t<127.4){text('HOLD BOTH TO RESET',1008,548,13,C.teal,'center');box(923,564,170,7,'#c3d3d6',4);box(923,564,170*clamp((s.t-116)/11.4),7,'#51b49a',4);}
 // Near and far banks; the empty pit remains physically visible throughout.
 box(-1000,810,2180,1100,'#ceb096');box(1380,810,1800,1100,'#ceb096');box(1180,810,200,1200,'#303b59');
 for(let x=1195;x<1380;x+=33)line([[x,830],[x-13,1100]],'#485271',2);
 line([[-200,810],[1180,810]],'#687987',4);line([[1380,810],[1900,810]],'#687987',4);
 for(let side of[1167,1380])for(let i=0;i<5;i++)box(side,815+i*14,10,6,'#edbd68',1);
 // Hinged bridge: no new floor is invented under the falling character.
 c.save();c.translate(1180,806);c.rotate((1-s.bridge)*1.45);box(0,-4,200,8,'#6c9e9f',3);for(let i=0;i<8;i++){line([[i*25+2,-5],[i*25+20,-5]],'#c6e8d8',2);circle(i*25+23,0,2,'#8c6f68');}c.restore();
 box(1450,570,108,240,'#91abb6',13);box(1461,581,86,229,s.stabilized?'#a5d5bf':'#c3d5de',8);line([[1505,587],[1505,805]],'#91acb6',3);circle(1535,705,4,C.teal);text(s.stabilized?'EXIT OPEN':'EXIT LOCKED',1504,554,11,C.teal,'center');
 // Cable winch; its released pawl explains the unsuccessful first rescue.
 line([[600,750],[600,804]],'#9bb4bd',7);circle(600,740,25,'#c2d6d8','#7d9ba7',3);circle(600,740,17,'#e4e8dc','#a28b73',2);c.save();c.translate(600,740);c.rotate(s.t<49.8?s.t*.05:s.t*1.2);line([[-13,0],[13,0]],'#b29872',3);c.restore();
 line([[614,719],[629,s.t>=49.8&&s.t<73?709:732]],C.gold,4);
 if(s.t>=49.8&&s.t<55)text('ANCHOR RELEASED',600,685,10,C.coral,'center');
 control(690,s.t<110?'SYNC A · LOCKED':'SYNC A',C.teal,s.leftPressed,s.t<110);
 control(875,'RESET?',C.gold,s.resetPressed);
 control(1000,'DO NOT PRESS',C.coral,s.rightPressed||s.buttonPressed,s.t>=146.6);
 control(1140,'EMERGENCY',C.teal,s.brakePressed);
 if(s.field){c.save();c.globalAlpha=.24*s.field;for(let i=0;i<20;i++){const x=550+(i*71)%560,y=345+((i*37+(s.gravity[1]<0?-s.t:s.t)*27)%420+420)%420;line([[x,y+6],[x,y-6]],i%2?C.coral:C.teal,1.5);}c.restore();}
}
function props(t){for(const p of S.propsAt(t)){c.save();c.translate(p.x,p.y);c.rotate(p.angle);if(p.id==='mug'){circle(14,-1,7,null,C.coral,3);box(-12,-15,24,29,'#ecad70',4);box(-9,-13,7,23,'#f9d39d',2);}else if(p.id==='crate'){box(-22,-22,44,44,'#a6bfb0',5,C.teal);line([[-17,-17],[17,17]],'#d7e1cb',4);line([[-17,17],[17,-17]],'#d7e1cb',4);}else{circle(0,0,10,'#a3b1c8','#75839e',2);circle(0,0,4,'#e0e6ee');}c.restore();}}
function rope(s){if(s.t<43.6||s.t>73)return;const hero=ElasticRig.at('hero',s.t),amber=ElasticRig.at('amber',s.t),cyan=ElasticRig.at('cyan',s.t),a=hero.nodes[6],b=amber.nodes[0],u=smooth((s.t-43.6)/1.6),end=[lerp(a[0],b[0],u),lerp(a[1],b[1],u)-Math.sin(Math.PI*u)*135];
 c.save();c.globalAlpha=1-smooth((s.t-70)/3);
 const helper=smooth((s.t-43.6)/.4)*(1-smooth((s.t-48)/.6)),mid=[lerp((a[0]+end[0])/2,cyan.nodes[6][0],helper),lerp((a[1]+end[1])/2+12,cyan.nodes[6][1],helper)];
 if(s.t<50.5){c.save();c.globalAlpha*=1-smooth((s.t-49.8)/.7);line([[600,740],a],'#b38b61',3);c.restore();}
 c.beginPath();c.moveTo(...a);if(helper>.01){c.lineTo(...mid);c.lineTo(...end);}else c.quadraticCurveTo(mid[0],mid[1],...end);c.strokeStyle='#b38b61';c.lineWidth=3;c.stroke();
 if(u>.999){circle(b[0],b[1],5,null,'#b38b61',2);}else circle(end[0],end[1],6,null,'#c59a60',2);c.restore();}
function effects(s){for(const e of [...S.events,...S.propImpacts]){const dt=s.t-e.t;if(dt<0||dt>.45||!['land','catch','click','tap','bounce','crack'].includes(e.type))continue;const u=dt/.45;c.save();c.globalAlpha=(1-u)*.75;for(let i=0;i<5;i++){const a=i*TAU/5,d=10+u*17;line([[e.x+Math.cos(a)*d,e.y+Math.sin(a)*d],[e.x+Math.cos(a)*(d+6),e.y+Math.sin(a)*(d+6)]],e.type==='catch'?C.teal:C.gold,1.7);}c.restore();}
 for(const[n,lo,hi,symbol]of[['hero',22.2,23.3,'!'],['amber',27.2,28.2,'?'],['cyan',49.8,50.8,'!'],['hero',84,85,'!'],['amber',91,92,'!'],['amber',147,148,'…']])if(s.t>=lo&&s.t<=hi){const p=ElasticRig.at(n,s.t);text(symbol,p.nodes[2][0]+27,p.nodes[2][1]-23,19,S.colors[n]);}}
function draw(t){t=clamp(t,0,S.duration);const s=S.snapshot(t),cam=camera(t);c.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);c.fillStyle=C.paper;c.fillRect(0,0,1920,1080);c.save();c.beginPath();c.rect(0,115,1920,890);c.clip();c.translate(960,540);c.scale(cam.z,cam.z);c.translate(-cam.x,-cam.y);background(s);
 for(const n of S.names){const p=ElasticRig.at(n,t),a=s.actors[n];c.save();c.globalAlpha=.12*Math.max(.15,a.g);c.beginPath();c.ellipse(p.nodes[0][0],810,27,4,0,0,TAU);c.fillStyle=S.colors[n];c.fill();c.restore();}
 props(t);rope(s);for(const n of S.names)LegacyActor.draw(n,t);effects(s);c.restore();
 text('THE FORBIDDEN BUTTON',58,57,18,'#647a91');text(`${String(s.scene+1).padStart(2,'0')}  ${S.chapters[s.scene].title}`,58,88,20,C.ink);text('THREE FRIENDS · ONE TERRIBLE IDEA',1862,57,12,'#8a8399','right');line([[58,1019],[1862,1019]],'#d0c3bc',2);line([[58,1019],[58+1804*t/S.duration,1019]],C.teal,3);return s;}
window.film={canvas,draw,duration:S.duration,stages:S.chapters,camera,metrics:{finite:true,sourceVideoPixelsUsed:0,simulationHz:120,storyDuration:S.duration,globalTimeRemapping:false,actors:3,persistentRoom:true,explicitSupports:true,story:'The Forbidden Button: gravity, rope, failed reset, rescue chain, coordinated controls'}};
})();
