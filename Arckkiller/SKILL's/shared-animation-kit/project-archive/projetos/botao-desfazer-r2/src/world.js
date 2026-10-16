/* Colorful original bakery courtyard. Deterministic procedural illustration. */
(()=>{'use strict';const S=Story,{mix,ease,clamp,TAU}=S,{canvas,ctx:c}=LegacyActor;
const palette=['#f06483','#ffc54f','#39bbc3','#8975d1','#65ba85'];
function path(p,color,w=3){c.beginPath();p.forEach((v,i)=>i?c.lineTo(...v):c.moveTo(...v));c.strokeStyle=color;c.lineWidth=w;c.lineCap=c.lineJoin='round';c.stroke();}
function box(x,y,w,h,color,r=8,stroke=null){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}}
function circle(x,y,r,color,stroke=null,w=3){c.beginPath();c.arc(x,y,Math.max(.01,r),0,TAU);if(color){c.fillStyle=color;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=w;c.stroke();}}
function ellipse(x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.fillStyle=color;c.fill();}
function text(str,x,y,size,color='#263454',align='left',weight=800){c.font=`${weight} ${size}px sans-serif`;c.fillStyle=color;c.textAlign=align;c.fillText(str,x,y);}
function local(x,y,a,fn){c.save();c.translate(x,y);c.rotate(a);fn();c.restore();}
function camera(t){const st=S.snapshot(t),q=st.q,lag=S.cartAt(Math.max(0,q-.65)),z=S.curve([[0,1.78],[6,1.9],[12,1.82],[28,1.94],[36,1.9],[42,1.78],[50,1.96],[56,1.82],[64,1.94],[70,1.8],[78,1.96],[84,1.82],[92,1.94],[98,2.02],[106,1.8],[116,1.9],[132,1.82],[143,1.92],[148,1.85],[152,1.78],[164,1.94],[175,1.82]],q);return{x:mix(st.cart.x,lag.x,.7)+100,y:600,z};}
function balloon(x,y,color,t,i=0){const dx=Math.sin(t*1.5+i)*8;path([[x,y+130],[x+dx*.5,y+65],[x+dx,y+18]],'#9b718b',1.5);ellipse(x+dx,y,19,24,color);ellipse(x+dx-6,y-8,4,7,'#ffffff66');path([[x+dx-3,y+23],[x+dx,y+19],[x+dx+3,y+23]],color,3);}
function background(s){const t=s.q;
 const sky=c.createLinearGradient(0,-200,0,850);sky.addColorStop(0,'#b6dfea');sky.addColorStop(.6,'#d9edf2');sky.addColorStop(1,'#fff0d7');c.fillStyle=sky;c.fillRect(-1500,-1000,5000,2200);
 circle(1940,180,70,'#ffe5a0');circle(1940,180,92,null,'#fff3c233',19);
 for(let i=0;i<9;i++){const x=-400+i*370+Math.sin(i*13)*100+Math.sin(t*.025)*6;ellipse(x,240+(i%3)*57,62,16,'#ffffffa0');ellipse(x+30,232+(i%3)*57,42,21,'#ffffffa0');}
 // Distant colored town, not a monochrome laboratory.
 for(let i=0;i<18;i++){const x=-150+i*150,h=90+rand(i+5)*150,y=650-h;box(x,y,125,h,['#b6c9d7','#cad8c8','#d2c7db','#d9c9bd'][i%4],4);path([[x-7,y],[x+60,y-50],[x+132,y]],'#a9bacb',8);for(let k=0;k<3;k++)box(x+18+k*32,y+25,14,25,'#eaf3ed',3);}
 box(-100,762,2500,200,'#e1b896');box(-100,772,2500,38,'#f4d6b4',0);for(let x=-200;x<2600;x+=100){path([[x,810],[x+45,1000]],'#d5a783',1);path([[x,845],[x+120,845]],'#e9c9a6',1);}
 // Terracotta and turquoise bakery frontage.
 box(180,315,710,445,'#f7bd8d',16,'#e2a579');box(208,345,654,290,'#ffe3b7',10);box(220,355,630,90,'#fff3d7',9);
 for(let i=0;i<10;i++){box(220+i*63,355,63,90,i%2?'#fff4dc':'#e97277',0);circle(251+i*63,445,31.5,i%2?'#fff4dc':'#e97277');}
 box(310,480,195,250,'#528e9c',12);box(325,493,165,230,'#78b7bc',8);for(let i=0;i<3;i++)path([[338,520+i*63],[477,520+i*63]],'#ace0d9',3);circle(474,630,5,'#ffe09a');
 box(550,490,265,180,'#458793',10);box(562,502,241,154,'#99d9d6',6);for(let i=0;i<4;i++){ellipse(590+i*57,620,22,9,'#f5bf75');path([[580+i*57,610],[594+i*57,602]],'#ffe9bf',3);}path([[681,503],[681,655]],'#458793',8);
 box(360,290,350,63,'#293e60',15);text('SECOND CHANCE BAKERY',535,331,22,'#ffeac8','center');
 // Continuous overhead bunting, lit for the reveal.
 path([[-50,270],[600,355],[1250,270],[1900,345],[2350,260]],'#7e8a95',2);
 for(let i=0;i<38;i++){const x=i*65-50,y=290+Math.sin(x/400)*25;c.beginPath();c.moveTo(x,y);c.lineTo(x+37,y+5);c.lineTo(x+17,y+42+Math.sin(t*2+i)*3);c.closePath();c.fillStyle=palette[i%5];c.fill();if(s.q>=150)circle(x+20,y+7,3,'#fff7bb');}
 // Persistent trolley: the same coordinates drive the rig contacts, cake and wheels.
 const cartX=s.cart.x;
 local(cartX,766,0,()=>{ellipse(0,44,68,7,'#6c55702a');box(-54,-32,108,57,'#4db8ad',9,'#2c8b91');box(-60,-50,120,8,'#b5eee0',5);path([[-54,-32],[-54,-50]],'#337b8b',5);path([[54,-32],[54,-50]],'#337b8b',5);for(let side of[-34,34]){circle(side,27,13,'#3c4b67');circle(side,27,8,'#f4d694');const a=cartX/13;path([[side-Math.cos(a)*7,27-Math.sin(a)*7],[side+Math.cos(a)*7,27+Math.sin(a)*7]],'#fff2c8',2);}text('CAKE',0,1,13,'#eaffee','center');
 const flight=S.flights.find(f=>t>=f.a-.35&&t<=f.b),compression=flight?Math.max(0,1-Math.abs(t-flight.a)/.35):0;
 for(let i=0;i<4;i++)path([[-20,-20-i*(6-compression*2)],[20,-23-i*(6-compression*2)]],'#786c9c',2);box(-40,-50+compression*7,80,6,'#ffcb61',3);
 // The crank connects visible work to the trolley's drive.
 circle(-34,0,13,'#fff0bf','#317e8e',3);const a=t*TAU;path([[-34,0],[-34+Math.cos(a)*12,Math.sin(a)*12]],'#475a75',3);circle(-34+Math.cos(a)*12,Math.sin(a)*12,3,'#ed869b');
 });
 const motor=t>=26&&t<96;
 if(motor){for(let i=0;i<5;i++){const x=cartX-45+i*20,y=740-((t*85+i*23)%135);path([[x,y],[x+6,y-6]],'#eabf6a',1.5);}}
 // The production line keeps working while the delivery goes wrong.
 box(910,590,300,16,'#e4a86a',5);path([[925,606],[925,758]],'#9b7c70',5);path([[1195,606],[1195,758]],'#9b7c70',5);
 for(let i=0;i<18;i++){const x=915+((i*17-t*32)%288+288)%288;path([[x,593],[x+5,601]],'#ffe0ad',2);}
 for(let i=0;i<5;i++){const x=925+((i*59+t*32)%270);ellipse(x,580,15,10,'#eda86d');path([[x-7,576],[x-2,570]],'#fff1c4',2);path([[x+3,576],[x+8,570]],'#fff1c4',2);}
 local(1138,521,0,()=>{circle(0,0,24,'#d5eddf','#618b99',3);local(0,0,t*5,()=>{for(let i=0;i<3;i++)local(0,0,i*TAU/3,()=>ellipse(0,-12,7,12,'#6db4b5'));});circle(0,0,4,'#ffc15b');});
 for(const [i,f]of S.flights.entries()){const dt=t-f.a;if(dt<-.35||dt>1.8)continue;const fade=dt<0?clamp((dt+.35)/.35):Math.exp(-dt*2);c.save();c.globalAlpha=fade*.75;
 if(i%3===0){for(let j=0;j<8;j++)circle(cartX+(j-3.5)*10,716-Math.max(0,dt)*110-j*5,8+Math.max(0,dt)*12,'#fff7db88');}
 else if(i%3===1){for(let j=0;j<7;j++){const y=725-j*23-Math.max(0,dt)*30;path([[cartX-33,y],[cartX,y-12],[cartX+33,y]],'#89e2e3',3);}}
 else{for(let j=0;j<7;j++){const a=j*TAU/7;path([[cartX+Math.cos(a)*15,710+Math.sin(a)*15],[cartX+Math.cos(a+.2)*39,710+Math.sin(a+.2)*39],[cartX+Math.cos(a)*55,710+Math.sin(a)*55]],'#c6a0eb',3);}}
 c.restore();}
 // Brass clock / rewind device at the center of the physical action.
 local(1290,400,0,()=>{path([[0,65],[0,345]],'#7293a3',9);circle(0,0,68,'#e2ac64','#ad7d55',5);circle(0,0,55,'#ffefd0');for(let i=0;i<12;i++){const a=i*TAU/12;path([[Math.sin(a)*43,-Math.cos(a)*43],[Math.sin(a)*48,-Math.cos(a)*48]],'#bb895c',3);}const a=t*.12;path([[0,0],[Math.sin(a)*34,-Math.cos(a)*34]],'#48597a',4);path([[0,0],[Math.sin(a/12)*24,-Math.cos(a/12)*24]],'#e58167',5);circle(0,0,5,'#d98b65');});
 // A foreground service trench is below the unbroken walking surface.
 box(1418,860,164,90,'#554b76',0);for(let i=0;i<5;i++)path([[1420+i*35,875],[1438+i*35,905]],'#7a6794',2);
 const deploy=s.bridge;for(let i=0;i<6;i++)local(1410+i*30,860,(1-clamp(deploy*6-i))*Math.PI/2,()=>{box(0,-5,30,10,'#50b7ad',3);});
 // Team-operated ribbon tensioner stays attached to a single drive.
 if(t>=99&&t<114){const w=ease((t-99)/1)*(1-ease((t-112)/2));c.save();c.globalAlpha=w;const x=cartX;circle(x,480,24,'#c89869','#8c6d65',4);path([[x-150,725],[x-150,480],[x,480],[x+150,480],[x+150,725]],'#b58963',3);for(let i=0;i<5;i++)box(x-35+i*15,520,8,18,'#f9ca65',2);c.restore();}
 // Birthday table and draped surprise, visible in the distance from the start.
 box(1705,703,170,18,'#bd8164',6);box(1720,718,13,44,'#946856',3);box(1846,718,13,44,'#946856',3);box(1698,698,184,15,'#ed7d94',6);for(let i=0;i<8;i++)box(1705+i*22,710,12,20,'#f3a0a7',4);
 if(t<152){c.save();const lift=ease((t-150)/2);c.translate(0,-260*lift);c.globalAlpha=1-lift;c.beginPath();c.moveTo(1660,420);c.lineTo(1910,420);c.lineTo(1930,620);c.quadraticCurveTo(1780,590,1640,620);c.closePath();c.fillStyle='#7969a8';c.fill();for(let i=0;i<9;i++)path([[1665+i*28,425],[1655+i*30,608]],'#9c87bc',2);text('?',1785,540,60,'#e0d4ee','center');c.restore();}
 if(t>=150){const lift=ease((t-150)/2);c.save();c.globalAlpha=lift;box(1640,402,305,86,'#ffe09a',12,'#e4ab66');text('HAPPY BIRTHDAY!',1792,457,25,'#945279','center');for(let i=0;i<6;i++)balloon(1630+i*68,535-Math.sin(i)*18,palette[i%5],t,i);c.restore();}
 // Plants break the horizontal set and add depth.
 for(const [x,y]of[[190,808],[2150,808]]){box(x-21,y-48,42,48,'#c78069',7);for(let i=0;i<5;i++)local(x,y-45,(i-2)*.36,()=>{ellipse(0,-30,9,33,['#4d9e80','#63af83','#7abd8e'][i%3]);});}
}
function cake(s){const p=s.cake,wobble=['cart','held','table','tray'].includes(p.pose)?Math.sin(s.q*5)*.015:0;local(p.x,p.y,p.rotation+wobble,()=>{c.scale(.75,.75);ellipse(0,30,61,8,'#88668a22');ellipse(0,15,59,10,'#c4dce0');box(-49,-32,98,44,'#e7a66c',7);box(-49,-17,98,9,'#ce6e83',3);ellipse(0,-32,49,13,'#ffe9b0');box(-49,-34,98,13,'#fff0c7',6);for(let i=0;i<7;i++)circle(-41+i*14,-23,6,'#fff0c7');ellipse(0,-35,48,10,'#fff5d7');for(let i=0;i<18;i++){const x=(rand(i+14)-.5)*82,y=-36+(rand(i+33)-.5)*10;path([[x,y],[x+3,y+2]],palette[i%5],2);}for(let i=0;i<3;i++){box(-19+i*19,-62,5,28,palette[i],2);if(s.q>=152){ellipse(-16+i*19,-69,3+Math.sin(s.q*12+i),7,'#ffd15d');ellipse(-16+i*19,-69,1.7,4,'#fff4ad');}}circle(0,-40,7,'#e55676');path([[0,-46],[4,-54]],'#5a9877',2);});}
function remote(s){if(s.q<28||s.q>101)return;const p=ElasticRig.at('amber',s.t),a=s.actors.amber,h=p.nodes[6],x=h[0]+a.f*4,y=h[1]-6;local(x,y,-.2*a.f,()=>{box(-13,-24,26,43,'#4c416c',6,'#aea2d3');box(-9,-19,18,9,s.q>=96?'#675879':'#bcebdd',2);circle(0,2,8,s.q>=96?'#746879':'#f182a4','#f4c4dc',1);path([[3,-1],[-2,2],[3,5]],'#fff3fa',1.5);for(let i=0;i<5;i++)box(-8+i*3.5,-16,2.2,4,i<s.charges?'#61bfa5':'#77948f',.5);if(s.q>=96){path([[-8,-22],[0,-7],[-4,0],[8,18]],'#ecc6d3',1.5);}});}
// Keep the original reference silhouettes: one outline head and two solid heads.
function particles(s){for(const f of S.flights){const dt=s.q-f.b;if(dt<0||dt>1.1)continue;for(let i=0;i<13;i++){const v=(i-6)*19,x=S.cartAt(f.b).x+v*dt,y=688-(65+rand(i+13)*70)*dt+450*dt*dt;c.save();c.globalAlpha=1-dt/1.1;circle(x,y,2.5+rand(i+8)*2.5,i%3?'#fff0cb':'#ed7f9f');c.restore();}}
for(const [index,e]of S.events.entries()){const dt=s.t-e.t;if(dt<0||dt>1)continue;const u=dt,impact=['catch','crash','spring','land','bounce','splat','clatter','tap','break'].includes(e.type);if(impact){c.save();c.globalAlpha=(1-u)*.9;for(let i=0;i<8;i++){const a=i*TAU/8+rand(index)*TAU,d=12+u*(e.type==='crash'?75:36),x=e.x+Math.cos(a)*d,y=e.y+Math.sin(a)*d+u*u*25;local(x,y,a,()=>box(-3,-2,7,3,palette[i%5],1));}circle(e.x,e.y,8+u*30,null,'#fff2c5',2*(1-u));c.restore();}
 if(['electric','break'].includes(e.type)){c.save();c.globalAlpha=(1-u)*.8;for(let i=0;i<6;i++){const a=i*TAU/6;path([[e.x+Math.cos(a)*10,e.y+Math.sin(a)*10],[e.x+Math.cos(a+.2)*40,e.y+Math.sin(a+.2)*40],[e.x+Math.cos(a)*65,e.y+Math.sin(a)*65]],'#ffe9a4',3);}c.restore();}}
 if(s.q>=152){const amount=s.t<191?95:s.t<199?35:12;for(let i=0;i<amount;i++){const age=(s.q-152+rand(i+77)*5)%7,x=1660+rand(i+2)*280+Math.sin(age*2+i)*40,y=280+age*90;local(x,y,age*3+i,()=>{box(-3,-2,6,4,palette[i%5],1);});}}
 if(s.q>=164){const u=clamp((s.q-164)/1.2);for(let i=0;i<9;i++){const x=mix(1790,1720+rand(i)*130,u),y=mix(644,680+rand(i+20)*50,u)-Math.sin(u*Math.PI)*55;circle(x,y,3+rand(i+1)*4,'#fff2d2');}}
}
function draw(t){t=clamp(t,0,210);const s=S.snapshot(t),cam=camera(t),shake=S.events.reduce((v,e)=>{const d=t-e.t;return d>=0&&d<.35&&['crash','electric','break'].includes(e.type)?v+Math.sin(d*80)*2*(1-d/.35):v},0);
 c.setTransform(canvas.width/1920,0,0,canvas.height/1080,0,0);c.clearRect(0,0,1920,1080);c.save();c.translate(960+shake,540);c.scale(cam.z,cam.z);c.translate(-cam.x,-cam.y);background(s);
 // Rewind trails follow previous positions, not randomly placed clones.
 if(s.rewind){for(let k=3;k>0;k--){c.save();c.globalAlpha=.09*(4-k);for(const name of S.names)LegacyActor.draw(name,clamp(t-k*.13,0,210));c.restore();}}
 for(const name of S.names){const p=ElasticRig.at(name,t),root=p.nodes[0];ellipse(root[0],815,Math.max(10,24-(732-root[1])*.025),4,'#53445b26');}
 for(const name of S.names){LegacyActor.draw(name,t);}cake(s);remote(s);particles(s);
 if(s.q>=98&&s.q<101){const a=ElasticRig.at('amber',t).nodes[2];const alpha=ease((s.q-98)/.5)*(1-ease((s.q-100)/.7));c.save();c.globalAlpha=alpha;box(a[0]-55,a[1]-83,110,38,'#fff3dd',16);text(s.q<99?'…':'Together?',a[0],a[1]-58,16,'#745877','center');c.restore();}
 c.restore();
 // Restrained editorial overlays: action remains the main focus.
 c.save();c.globalAlpha=.9;text('ONE MORE TAKE',62,66,17,'#31465e');text('THE UNDO BUTTON',62,91,11,'#63768a');
 if(t<5){const alpha=ease(t/.7)*(1-ease((t-3.5)/1.5));c.globalAlpha=alpha;text('ONE MORE TAKE',960,210,77,'#304663','center');text('A very imperfect birthday.',960,260,24,'#9a697d','center',500);}
 const ch=Math.min(6,Math.floor(t/30)),localT=t-ch*30;if(localT<3&&t>29){c.globalAlpha=ease(localT/.4)*(1-ease((localT-2)/1));box(60,115,410,55,'#fff4dcdd',14);text(`${String(ch+1).padStart(2,'0')}  ${S.chapters[ch]}`,82,151,21,'#725979');}
 if(s.q>=28&&s.q<99){c.globalAlpha=.9;box(1600,46,258,65,'#263454dd',14);text('SECOND CHANCES',1620,69,11,'#c1d6ec');for(let i=0;i<5;i++)box(1620+i*43,82,31,10,i<s.charges?'#58d5bc':'#55617c',4);}
 if(s.rewind){const u=(t-s.rewind.start)/2;c.globalAlpha=Math.sin(u*Math.PI)*.15;c.fillStyle='#8b7cdf';c.fillRect(0,0,1920,1080);c.globalAlpha=.75*Math.sin(u*Math.PI);for(let i=0;i<9;i++){const x=((1-u)*2200+i*270)%2200-150;path([[x+40,150],[x-30,200],[x+40,250]],i%2?'#f2a1cc':'#b6f0ef',9);}c.globalAlpha=Math.sin(u*Math.PI);box(815,860,290,78,'#344568dd',24);text('↶  −5 seconds',960,911,30,'#eafefa','center');}
 if(s.q>=96&&s.q<100){c.globalAlpha=ease((s.q-96)/.3)*(1-ease((s.q-98)/2));box(1530,45,325,60,'#443c64ee',15);text('NO CHARGES LEFT',1690,84,21,'#ffb5c4','center');}
 if(t>205){const u=ease((t-205)/2);c.globalAlpha=u;box(485,863,950,125,'#263454eb',24);text('No perfect take. Just friends.',960,914,38,'#ffe6b1','center');text('An original short · Ink, Cyan & Amber',960,955,18,'#bce5e7','center',500);}
 c.restore();return s;
}
window.film={canvas,draw,cameraAt:camera,duration:210,stages:S.chapters.map((title,i)=>({title,start:i*30,end:(i+1)*30})),metrics:{finite:true,sourceVideoPixelsUsed:0,simulationHz:120,actors:3,preservedFK:true,color:true,originalStory:true}};
})();
