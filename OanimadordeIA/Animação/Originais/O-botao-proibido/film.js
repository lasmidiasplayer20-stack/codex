/* O botão proibido. Canvas animation, all original scenery and acting.
   The existing project's fixed-length IK solver is reused, not its choreography. */
(()=>{'use strict';
const canvas=document.querySelector('#film'),ctx=canvas.getContext('2d',{alpha:false}),W=1280,H=720,TAU=Math.PI*2;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,u)=>a+(b-a)*u,smooth=u=>{u=clamp(u);return u*u*(3-2*u)},rand=i=>{let x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x)},ease=Motion.cubicBezier(.33,0,.67,1);
const BG={},C={ink:'#14223c',white:'#e8fff9',gold:'#ffdb75',pink:'#ff658c',cyan:'#70fce5'};
let g=ctx,debug=[];
function rect(x,y,w,h,c,r=0){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill()}
function line(p,c,w=3){g.beginPath();for(let i=0;i<p.length;i++)g[i?'lineTo':'moveTo'](...p[i]);g.strokeStyle=c;g.lineWidth=w;g.lineJoin=g.lineCap='round';g.stroke()}
function circ(x,y,r,c,stroke,w=2){if(r<=0)return;g.beginPath();g.arc(x,y,r,0,TAU);if(c){g.fillStyle=c;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.stroke()}}
function ellipse(x,y,rx,ry,c){g.beginPath();g.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);g.fillStyle=c;g.fill()}
function txt(s,x,y,size=20,color=C.white,align='center',weight=700){g.textAlign=align;g.textBaseline='middle';g.font=`${weight} ${size}px sans-serif`;g.fillStyle=color;g.fillText(s,x,y)}
function glow(x,y,r,c){const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,c);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2)}
function gradient(a,b){const q=g.createLinearGradient(0,0,0,H);q.addColorStop(0,a);q.addColorStop(1,b);return q}
function bolt(x,y,k=1,color=C.cyan){line([[x-5*k,y-15*k],[x+5*k,y-4*k],[x-3*k,y+5*k],[x+6*k,y+17*k]],color,2*k)}
function scenery(set){if(BG[set])return BG[set];const c=document.createElement('canvas');c.width=W;c.height=H;g=c.getContext('2d');rect(0,0,W,H,gradient('#101d38','#26365c'));
 if(set==='lab'){
  // Sunset beyond an art-deco observatory window.
  rect(50,95,515,370,'#0b142c',28);g.save();g.beginPath();g.roundRect(62,107,491,346,20);g.clip();rect(62,107,491,346,gradient('#5f4a9a','#ffb378'));circ(380,258,75,'#ffd28d');
  for(let i=0;i<21;i++){const x=45+i*28,h=45+rand(i*11)*150;rect(x,453-h,27,h,['#263554','#374066','#485077'][i%3]);for(let j=0;j<5;j++)if(rand(i*31+j)>.5)rect(x+8,453-h+13+j*22,5,7,'#ffcc8d',1)}
  line([[65,360],[550,360]],'#162443',13);line([[225,109],[225,454]],'#162443',15);line([[390,109],[390,454]],'#162443',15);g.restore();line([[50,470],[570,470]],'#566287',9);
  rect(640,111,435,220,'#131e38',18);rect(655,126,405,190,'#1c394a',12);txt('LABORATÓRIO DE GRAVIDADE',857,154,18,'#81e7d5');
  for(let i=0;i<4;i++){line(Array.from({length:45},(_,j)=>[680+j*8,205+i*24+Math.sin(j*.45+i)*9]),['#50decc','#ffca76','#fe819d','#719ff5'][i],2)}
  line([[1160,60],[1160,175],[1210,175]],'#647299',14);line([[1160,60],[1160,175],[1210,175]],'#354665',8);
  rect(75,500,265,115,'#2c4162',12);rect(60,487,295,18,'#90a8af',5);rect(100,520,93,65,'#192c49',5);rect(210,520,100,25,'#192c49',5);circ(285,532,4,C.gold);rect(210,560,100,25,'#192c49',5);circ(285,572,4,C.cyan);
  rect(640,485,100,130,'#22324f',10);rect(626,475,128,16,'#66899b',4);line([[670,475],[670,420],[725,420]],'#5e8597',6);circ(725,415,18,'#71dfcf','#1a2d45',5);
  for(let i=0;i<4;i++)rect(1170,480-i*50,46,46,['#b1577b','#457c9f','#c29962','#7b6eb0'][i],7);
  line([[0,74],[1280,74]],'#40547a',10);for(let i=0;i<4;i++){rect(120+i*310,70,160,9,'#8dd9e0',4);glow(200+i*310,81,120,'rgba(81,241,225,.05)')}
 }else if(set==='tunnel'){
  // A long transport gallery with converging geometry and practical lights.
  const grad=g.createLinearGradient(0,0,W,0);grad.addColorStop(0,'#143749');grad.addColorStop(.5,'#342c60');grad.addColorStop(1,'#123c4c');rect(0,0,W,H,grad);
  for(let i=0;i<7;i++){const x=i*220-90;line([[x,80],[x+70,200],[x+70,470],[x,615]],'#4a6382',16);line([[x+10,80],[x+78,200],[x+78,470],[x+10,615]],'#243650',8);rect(x+48,210,6,205,'#66dacd',3);glow(x+50,300,70,'rgba(52,230,200,.07)')}
  rect(0,548,W,75,'#203b52');for(let i=0;i<16;i++)rect(i*90,567,58,8,i%2?'#c7984d':'#8da2a6',2);
  rect(470,155,340,265,'#14253d',25);txt('NÚCLEO',640,210,36,C.gold);line([[560,300],[730,300],[690,265]],C.cyan,12);line([[730,300],[690,335]],C.cyan,12);txt('ACESSO TÉCNICO',640,377,17,'#89aab9');
 }else if(set==='reactor'){
  rect(0,0,W,H,gradient('#17152f','#2b2047'));
  for(let i=0;i<8;i++){const x=60+i*180;line([[x,-20],[x,125],[x+60,185],[x+60,540]],'#4e3f6f',12);line([[x,-20],[x,125],[x+60,185],[x+60,540]],'#2b2c4a',6)}
  rect(20,140,135,260,'#111f36',14);rect(1125,140,135,260,'#111f36',14);for(let i=0;i<6;i++){rect(43,174+i*32,90,12,['#618caf','#4eac9b','#bd865f'][i%3],4);rect(1145,174+i*32,90,12,['#618caf','#4eac9b','#bd865f'][i%3],4)}
  circ(680,330,218,'#111a32','#4d517a',22);circ(680,330,191,'#162940','#72668a',7);circ(680,330,158,'#12253d','#355a71',14);for(let i=0;i<12;i++){const a=i*TAU/12;circ(680+208*Math.cos(a),330+208*Math.sin(a),8,'#bb9b85','#1e2441',3)}
  rect(210,486,210,130,'#302b4b',10);rect(228,505,175,70,'#131c36',8);txt('RESTAURAR',315,535,18,C.gold);txt('SINCRONIA NECESSÁRIA',315,558,9,'#97acc4');
 }else if(set==='rescue'){
  rect(0,0,W,H,gradient('#121a36','#26182f'));for(let i=0;i<16;i++){const x=i*87;rect(x,0,12,720,i%2?'#2e344e':'#24304a');for(let j=0;j<6;j++)rect(x+20,j*140+40,35,3,'#3b5270')}
  line([[200,240],[560,240],[590,260]],'#7792a4',20);line([[200,247],[560,247],[590,267]],'#344d64',11);line([[200,240],[200,400]],'#5f7190',20);rect(0,640,W,80,'#131629');
 }
 // Floor and etched perspective grid.
 if(set!=='rescue'){rect(0,618,W,102,gradient('#263651','#141e34'));line([[0,619],[1280,619]],'#6b8196',6);for(let i=-4;i<17;i++)line([[640+(i-6)*80,620],[640+(i-6)*160,720]],'rgba(119,156,181,.14)',1);line([[0,668],[1280,668]],'rgba(119,156,181,.13)',1)}
 BG[set]=c;g=ctx;return c;
}
function shotAt(t){return STORY.shots.find(s=>t>=s.start&&t<s.end)||STORY.shots.at(-1)}
function sample(keys,t){let i=0;while(i+1<keys.length&&keys[i+1].t<=t)i++;const a=keys[i],b=keys[Math.min(i+1,keys.length-1)],u=b.t===a.t?0:clamp((t-a.t)/(b.t-a.t)),e=smooth(u);return {x:Rig.value(keys,t,'x'),y:Rig.value(keys,t,'y'),r:Rig.value(keys,t,'r'),poseA:a.pose,poseB:b.pose,u:e,face:u<.45?a.face:b.face,dir:Math.sign(b.x-a.x)||1,local:t}}
function cam(s,u){const arr=s.camera||[0,640,350,1,s.end-s.start,640,350,1];let i=0;while(i+8<arr.length&&arr[i+4]<=u)i+=4;const k=Math.min(i+4,arr.length-4),v=smooth((u-arr[i])/Math.max(.001,arr[k]-arr[i]));return {x:mix(arr[i+1],arr[k+1],v),y:mix(arr[i+2],arr[k+2],v),z:mix(arr[i+3],arr[k+3],v)}}
function pose(name,t,x,id,dir=1){let q={lean:0,neck:0,feet:[[-23,89],[24,89]],hands:[[-35,-8],[35,-8]],bend:0};
 const osc=Math.sin(t*3+id),wave=Math.sin(t*7),run=name==='run',walk=['walk','run','sneak'].includes(name);
 if(walk){const stride=run?106:82,progress=(x/stride)*dir,amp=run?40:24;for(let j=0;j<2;j++){const phase=((progress+j*.5)%1+1)%1,stance=phase<.62;if(stance)q.feet[j]=[dir*mix(30,-30,phase/.62),90];else{const u=(phase-.62)/.38;q.feet[j]=[dir*mix(-30,30,ease(u)),90-Math.sin(Math.PI*u)*(run?43:25)]}q.hands[j]=[dir*Math.sin(progress*TAU+j*Math.PI)*amp,-20+Math.cos(progress*TAU+j*Math.PI)*15]};q.lean=dir*(run?.18:.07);if(name==='sneak'){q.lean=.16;q.hands=[[20,-63],[52,-50]];q.feet.forEach(p=>p[1]-=9)}}
 else if(['float','fall','fly'].includes(name)){q.lean=.13*osc;q.feet=[[-32+9*osc,69],[35,61+7*Math.sin(t*4)]];q.hands=[[-58,-80+8*osc],[57,-66+12*Math.cos(t*3)]];if(name==='fly'){q.hands=[[-62,-65],[59,-80]];q.feet=[[-44,62],[20,82]]}}
 else if(name==='tuck'){q.lean=.15;q.feet=[[-35,43],[40,39]];q.hands=[[-40,-12],[40,-10]]}
 else if(name==='jump'){q.lean=.15*dir;q.feet=[[-43,56],[35,70]];q.hands=[[-45,-99],[46,-108]]}
 else if(['land','crouch','duck','brace'].includes(name)){q.lean=name==='duck'?.5:.18;q.feet=[[-40,70],[42,68]];q.hands=[[-51,-25],[55,-30]];if(name==='brace')q.hands=[[-55,-91],[54,-92]];if(name==='duck')q.hands=[[-36,-25],[55,-30]]}
 else if(name==='slide'){q.lean=-.7;q.feet=[[-45,50],[69,35]];q.hands=[[-49,-3],[29,-34]]}
 else if(name==='reach'){q.hands=[[-38,-14],[59,-89+osc*2]];q.lean=.1}
 else if(name==='push'){q.hands=[[-28,-5],[60,-70]];q.lean=.17;if(id&&t>=166&&t<173){q.hands=[[-60,-70],[28,-5]];q.lean=-.17}}
 else if(name==='point'){q.hands=[[-29,-5],[65,-83]];q.lean=.07}
 else if(name==='no'){q.hands=[[-30,-15],[49,-118]];q.neck=.09*wave}
 else if(name==='behind'){q.hands=[[-8,5],[10,6]];q.lean=-.08;q.neck=-.07}
 else if(name==='work'){q.hands=[[45,-72],[62,-60]];q.lean=.13}
 else if(name==='turn'){q.hands=[[-40,-47],[26,-20]];q.neck=-.2}
 else if(name==='look'){q.hands=[[-35,-10],[32,-15]];q.neck=-.15}
 else if(name==='shock'){q.hands=[[-52,-108],[52,-108]];q.feet=[[-26,88],[31,88]]}
 else if(['rope','pull'].includes(name)){q.lean=-.3;q.hands=[[42,-76],[51,-65]];q.feet=[[-44,82],[37,84]]}
 else if(name==='throw'){q.lean=.23;q.hands=[[-26,-19],[22,-132]]}
 else if(name==='hang'){q.lean=.12;q.hands=[[-20,-132],[23,-132]];q.feet=[[-20,78],[35,68]]}
 else if(name==='sit'){q.lean=-.2;q.feet=[[-48,30],[61,30]];q.hands=[[-49,-12],[53,-6]]}
 else if(name==='sorry'){q.lean=.16;q.hands=[[-17,-18],[16,-20]];q.neck=.22}
 else if(name==='fist'){const reach=t>180?35:50;q.hands=id?[[-34,-5],[reach,-77]]:[[-reach,-77],[34,-5]];q.lean=id?.09:-.09}
 else if(name==='wave'){q.hands=[[-32,-4],[42+wave*10,-121]]}
 else if(name==='laugh'){q.lean=.06*osc;q.hands=[[-22,-18],[25,-20]];q.neck=.08*wave}
 return q;
}
const world=(v,p)=>[p.x+v[0]*Math.cos(p.r)-v[1]*Math.sin(p.r),p.y+v[0]*Math.sin(p.r)+v[1]*Math.cos(p.r)];
function geometry(p,t,id){const drop=n=>['land','crouch','duck'].includes(n)?20:n==='brace'?7:n==='sneak'?9:0;p.y+=mix(drop(p.poseA),drop(p.poseB),p.u);const a=pose(p.poseA,t,p.x,id,p.dir),b=pose(p.poseB,t,p.x,id,p.dir),q={lean:mix(a.lean,b.lean,p.u),neck:mix(a.neck,b.neck,p.u),feet:a.feet.map((v,i)=>v.map((x,j)=>mix(x,b.feet[i][j],p.u))),hands:a.hands.map((v,i)=>v.map((x,j)=>mix(x,b.hands[i][j],p.u)))};
 const breathe=Math.sin(t*2.7+id)*.7,shoulder=[Math.sin(q.lean)*62,-Math.cos(q.lean)*62+breathe],head=[shoulder[0]+Math.sin(q.lean+q.neck)*22,shoulder[1]-Math.cos(q.lean+q.neck)*22];
 const arms=q.hands.map((v,i)=>Rig.ik(shoulder,v,37,37,i?1:-1));const legs=q.feet.map((v,i)=>Rig.ik([0,0],v,48,48,i?1:-1));const nodes=[[0,0],shoulder,head,arms[0].joint,arms[0].end,arms[1].joint,arms[1].end,legs[0].joint,legs[0].end,legs[1].joint,legs[1].end];
 const result={local:nodes,nodes:nodes.map(v=>world(v,p)),head:world(head,p),p};debug.push({id,nodes:result.nodes,arms:arms.map(v=>v.error),legs:legs.map(v=>v.error)});return result;
}
function limb(a,b,c,col,width=14){line([a,b,c],C.ink,width+5);g.beginPath();g.moveTo(...a);g.quadraticCurveTo(b[0]+(a[0]-c[0])*.08,b[1]+(a[1]-c[1])*.08,...b);g.quadraticCurveTo(b[0]+(c[0]-a[0])*.17,b[1]+(c[1]-a[1])*.17,...c);g.strokeStyle=col;g.lineWidth=width;g.lineCap='round';g.stroke();line([[a[0]-1,a[1]-1],[mix(a[0],b[0],.7)-1,mix(a[1],b[1],.7)-1]],'rgba(255,255,255,.16)',3)}
function face(x,y,p,t,id){const data=STORY.characters[id?'teal':'orange'],f=p.face,blink=((t*1.13+id*1.8)%5.8)<.12,look=clamp((p.dir||1)*3,-3,3);let eyeY=-4,open=f==='shock'||f==='scared'?8:5;
 g.save();g.translate(x,y);g.rotate(p.neck||0);ellipse(-8,-13,10,5,'rgba(255,255,255,.22)');
 if(id){rect(-25,-13,50,20,'#174b64',9);rect(-22,-11,19,15,'#a7f8ed',5);rect(3,-11,19,15,'#a7f8ed',5);line([[-3,-4],[3,-4]],'#f7d47a',4);}
 if(blink||f==='relief'||f==='smile'&&((t*1.7)%4)<.4){line([[-16,eyeY],[-9,eyeY-2],[-3,eyeY]],C.ink,3);line([[5,eyeY],[11,eyeY-2],[17,eyeY]],C.ink,3)}else{ellipse(-10+look*.5,eyeY,3.4,open,C.ink);ellipse(10+look*.5,eyeY,3.4,open,C.ink);circ(-9+look*.5,eyeY-2,1.2,'#fff');circ(11+look*.5,eyeY-2,1.2,'#fff')}
 if(['shock','scared','sad'].includes(f)){ellipse(1,14,f==='sad'?5:7,f==='sad'?2:8,C.ink);if(f==='scared'){line([[-21,-20],[-5,-24]],C.ink,3);line([[6,-24],[21,-20]],C.ink,3)}}
 else if(['smile','relief','hope','innocent'].includes(f)){g.beginPath();g.arc(0,6,12,.2,Math.PI-.2);g.strokeStyle=C.ink;g.lineWidth=3;g.stroke();if(f==='smile'){ellipse(-18,9,5,3,'rgba(222,88,105,.4)');ellipse(18,9,5,3,'rgba(222,88,105,.4)')}}
 else if(f==='angry'){line([[-18,-18],[-5,-13]],C.ink,3);line([[6,-13],[19,-18]],C.ink,3);line([[-7,15],[8,15]],C.ink,3)}
 else if(f==='dizzy'){for(let s of [-1,1]){line([[s*11-4,-7],[s*11+4,1]],C.ink,3);line([[s*11+4,-7],[s*11-4,1]],C.ink,3)}line([[-7,13],[-2,10],[3,14],[8,11]],C.ink,2)}
 else {line([[-6,13],[4,13],[9,10]],C.ink,2.5);if(f==='suspicious')line([[-19,-10],[-3,-8]],C.ink,3)}
 g.restore();
}
function actor(p,t,id){const c=STORY.characters[id?'teal':'orange'],geo=geometry(p,t,id),n=geo.local;g.save();g.translate(p.x,p.y);g.rotate(p.r);
 // Scarf follows motion and never crosses the face.
 const wind=(['run','fly','float'].includes(p.poseA)?19:7),neck=n[1];g.beginPath();g.moveTo(neck[0]-8,neck[1]+2);g.bezierCurveTo(neck[0]-35,neck[1]+10,neck[0]-43-wind,neck[1]-10+Math.sin(t*8)*7,neck[0]-57-wind,neck[1]+6);g.lineTo(neck[0]-46-wind,neck[1]+15);g.bezierCurveTo(neck[0]-32,neck[1]+3,neck[0]-26,neck[1]+20,neck[0]-6,neck[1]+10);g.fillStyle=c.scarf;g.fill();
 limb(n[0],n[7],n[8],c.dark,14);limb(n[1],n[3],n[4],c.dark,12);
 limb(n[0],n[9],n[10],c.color,14);
 for(const i of [8,10]){g.save();g.translate(...n[i]);g.rotate(-.05);rect(-13,-4,28,12,C.ink,6);rect(-12,-5,26,8,c.dark,5);rect(-12,3,28,4,c.light,2);g.restore()}
 // Jacket body and neck, with a small contrasting zipper.
 limb(n[0],[(n[0][0]+n[1][0])*.5,-31],n[1],c.color,23);line([[n[0][0]+4,-8],[n[1][0]+4,n[1][1]+10]],c.light,3);circ(n[1][0]+11,n[1][1]+18,3,C.gold);line([n[1],n[2]],c.color,14);rect(n[1][0]-14,n[1][1]+1,28,9,c.scarf,4);
 limb(n[1],n[5],n[6],c.color,12);for(const i of [4,6]){circ(...n[i],8,C.ink);circ(n[i][0],n[i][1]-1,6.1,c.light);line([[n[i][0]-2,n[i][1]-1],[n[i][0]+2,n[i][1]-1]],c.dark,1)}
 circ(...n[2],28,C.ink);circ(n[2][0],n[2][1]-1,25,c.color);g.save();g.translate(...n[2]);g.rotate(-.3);ellipse(-7,-15,13,6,c.light);g.restore();
 face(n[2][0],n[2][1],p,t,id);
 if(!id){line([[n[2][0]-17,n[2][1]-21],[n[2][0]-4,n[2][1]-29],[n[2][0]+7,n[2][1]-24]],c.dark,5)}
 g.restore();return geo;
}
function button(x=945,y=455,t=0,pressed=false,color='#ff5778',label='NÃO APERTE'){g.save();g.translate(x,y);rect(-58,14,116,144,'#15283f',12);rect(-52,22,104,122,'#3c5972',8);rect(-43,40,86,28,'#14263d',5);txt(pressed?'GRAVIDADE ↑':'GRAVIDADE ↓',0,54,10,C.cyan);for(let i=0;i<3;i++){circ(-24+i*24,91,4,i===Math.floor(t)%3?C.gold:'#13243d')}
 for(let i=0;i<4;i++)rect(-33+i*19,113,8,17,'#182e47',2);ellipse(0,14,66,16,'#0c192c');ellipse(0,9,59,16,'#7f93a5');rect(-39,-12+(pressed?6:0),78,23,color,9);ellipse(0,-9+(pressed?6:0),39,12,color);ellipse(-10,-13+(pressed?6:0),20,4,'rgba(255,255,255,.45)');
 if(label){rect(-70,-79,140,42,'#ffda79',6);txt(label,0,-58,16,'#402c36');line([[-55,-38],[-55,-27]],'#708599',3);line([[55,-38],[55,-27]],'#708599',3)}g.restore()}
function mug(x,y,r,t){g.save();g.translate(x,y);g.rotate(r);ellipse(4,27,25,5,'rgba(2,10,25,.12)');g.beginPath();g.arc(22,4,11,-Math.PI*.5,Math.PI*.5);g.strokeStyle='#ffdb88';g.lineWidth=7;g.stroke();rect(-19,-17,37,44,'#e56f83',7);rect(-17,-17,7,38,'#ff9b9b',3);ellipse(0,-17,18,5,'#ffdfa7');ellipse(0,-17,14,3,'#623b46');txt('G',0,7,19,'#ffe6a7');g.restore()}
function drone(x,y,t,hero=false){g.save();g.translate(x,y+Math.sin(t*5)*3);glow(0,15,50,hero?'rgba(255,219,112,.17)':'rgba(80,245,219,.12)');const a=Math.sin(t*80)*13;ellipse(-26,-22,21,3,'#93b6c4');ellipse(26,-22,21,3,'#93b6c4');line([[-26,-22],[-17,-6],[17,-6],[26,-22]],'#273952',5);line([[-46,-22],[-8,-22]],'#def5e6',2);line([[8,-22],[46,-22]],'#def5e6',2);rect(-27,-9,54,35,'#15283f',15);rect(-25,-10,50,30,hero?'#ffd566':'#e9aa58',13);rect(-17,-5,34,16,'#193e54',7);circ(-8,2,3,C.cyan);circ(8,2,3,C.cyan);line([[-11,27],[-14,34]],'#9ab6be',3);line([[11,27],[14,34]],'#9ab6be',3);circ(0,-12,3,C.pink);g.restore()}
function ropeBetween(a,b,t,tense=true){const mid=[(a[0]+b[0])*.5+Math.sin(t*3)*3,(a[1]+b[1])*.5+(tense?6:55)];g.beginPath();g.moveTo(...a);g.quadraticCurveTo(...mid,...b);g.lineWidth=6;g.strokeStyle=C.ink;g.stroke();g.lineWidth=3;g.strokeStyle='#ffce79';g.stroke()}
function ring(t,s){const power=s.warning?1:0,x=680,y=330,r=150;glow(x,y,240,power?'rgba(243,80,137,.16)':'rgba(87,241,223,.16)');g.save();g.translate(x,y);g.rotate(t*(power?1.6:.4));for(let i=0;i<8;i++){g.beginPath();g.arc(0,0,r,i*TAU/8,i*TAU/8+.47);g.strokeStyle=i%2?'#80ecd5':power?'#ff668b':'#aa8ef7';g.lineWidth=11;g.stroke();circ(Math.cos(i*TAU/8)*r,Math.sin(i*TAU/8)*r,6,C.gold)}g.rotate(-t*.3);for(let i=0;i<3;i++){g.beginPath();g.ellipse(0,0,130,40+i*15,i*Math.PI/3,0,TAU);g.strokeStyle=power?'rgba(255,124,152,.5)':'rgba(128,240,222,.35)';g.lineWidth=3;g.stroke()}circ(0,0,38+Math.sin(t*4)*3,power?'#ffafba':'#9af9e5');circ(-9,-9,16,'rgba(255,255,255,.55)');g.restore();
 if(s.warning){rect(490,75,380,54,'#402744',10);txt(t>=169?'ESTABILIZANDO':'INSTABILIDADE',680,95,19,'#ffda80');let n=Math.max(0,Math.ceil(186-t));txt(`ESTABILIZAR EM ${String(n).padStart(2,'0')}`,680,117,14,'#ff9baf')}
}
function objects(t,s,u){if(s.set==='lab'){
 const lift=s.gravity?clamp((t-25)/6):0;const reset=t>187&&t<203;
 if(t<42||t>187)mug(reset?170:170+lift*110,reset?460:460-lift*290,reset?0:lift*Math.sin(t)*1.5,t);
 for(let i=0;i<5;i++){const d=s.gravity?40+Math.sin(t*1.4+i)*20:0,xx=350+i*40+(s.gravity?Math.sin(t*.7+i)*50:0),yy=s.gravity?350+i*25+d:595;g.save();g.translate(xx,yy);g.rotate(s.gravity?t*.7+i:0);rect(-5,-12,10,24,['#b0a8f5','#ffcf6e','#5de5cd'][i%3],3);g.restore()}
 if(!s.epilogue||t<203)button(945,455,t,t>=24&&t<187);
 if(s.mug){const x=mix(930,450,clamp(u/5)),y=180+Math.sin(u)*18;mug(x,y,u*3,t);if(u>4.3&&u<5.3)burst(505,128,t-(s.start+4.3),'#ffdd7b',14)}
 if(s.cover){g.save();g.globalAlpha=.3;rect(891,421,108,45,'#9fe8f2',12);g.restore();line([[894,423],[997,423],[997,465]],'#c2f2ec',3);txt('AGORA SIM.',945,398,13,C.gold)}
 if(s.door){rect(1170,180,110,438,'#081c33',8);line([[1170,180],[1170,615]],C.cyan,6);txt('NÚCLEO →',1155,158,18,C.cyan)}
 if(s.epilogue&&t>=203){button(945,455,t,true);g.save();g.globalAlpha=.3;rect(899,422,98,40,'#bbf2eb',10);g.restore()}
 }
 if(s.set==='reactor'){ring(t,s);if(s.console)button(945,455,t,t>107,'#aa85fa','REINICIAR?');
 if(s.platforms){for(const [x,y] of [[90,433],[1000,433]]){rect(x,y,185,24,'#64738c',7);rect(x+4,y+4,177,5,'#a3d9d4',2);line([[x+30,y+24],[x+30,610]],'#3a4265',16)}}
 if(s.twoButtons){button(100,250,t,t>=169&&t<173,'#5de6d0','TECA');button(1180,250,t,t>=169&&t<173,'#ffc369','MIMO')}
 if(s.count&&u>2){const n=3-Math.floor((u-2)/1.3);if(n>0){glow(680,330,120,'rgba(255,227,147,.13)');txt(String(n),680,330,96,C.gold)}}
 if(s.pit){g.beginPath();g.moveTo(550,610);g.lineTo(590,596);g.lineTo(645,623);g.lineTo(690,601);g.lineTo(755,620);g.lineTo(850,720);g.lineTo(470,720);g.closePath();g.fillStyle='#070c1e';g.fill();line([[551,610],[590,596],[645,623],[690,601],[755,620]],'#ff93a3',4);glow(660,700,100,'rgba(234,84,150,.25)')}
 }
 if(s.set==='tunnel'){
 if(s.platforms){for(let i=0;i<5;i++){const x=80+i*260,y=550+Math.sin(t+i)*13;rect(x,y,175,22,'#76849f',5);rect(x+5,y+3,165,4,C.cyan,2)}}
 if(s.shutter){const close=clamp((u-1.5)/4);rect(130,80,130,300+close*135,'#657084',5);for(let i=0;i<8;i++)rect(133,100+i*45,124,9,'#394b65',2);rect(130,375+close*135,130,14,C.gold,3)}
 }
 if(s.set==='rescue'){glow(650,720,330,'rgba(245,81,151,.15)');for(let i=0;i<20;i++){const x=rand(i*13)*1280,y=720-((t*40+i*83)%700);circ(x,y,1+rand(i)*2,'rgba(255,154,130,.4)')}if(s.warning)bolt(1050,130,3,'#f775a2')}
}
function burst(x,y,age,color=C.gold,count=24){if(age<0||age>1.2)return;for(let i=0;i<count;i++){const a=rand(i*31)*TAU,v=45+rand(i*17)*130,k=age/(1.2);g.save();g.globalAlpha=(1-k)**2;const px=x+Math.cos(a)*v*age,py=y+Math.sin(a)*v*age+age*age*60;line([[px,py],[px+Math.cos(a)*8,py+Math.sin(a)*8]],color,2+rand(i)*3);g.restore()}}
function fx(t,s,u){
 const flips=[24.2,58,107.3,169.3,185.5,203.2];for(const event of flips){const age=t-event;if(age>=0&&age<1.8){g.save();g.globalAlpha=(1-age/1.8)*.6;g.beginPath();g.ellipse(680,350,80+age*900,40+age*500,.2,0,TAU);g.strokeStyle=event===185.5?C.gold:C.cyan;g.lineWidth=8*(1-age/1.8);g.stroke();g.restore();burst(680,350,age,event===185.5?C.gold:C.cyan,40)}}
 if(s.gravity){for(let i=0;i<23;i++){const x=rand(i*31)*1280,y=680-((t*(20+rand(i)*30)+i*53)%650);circ(x,y,1.5+rand(i)*1.7,i%3?'rgba(105,236,225,.35)':'rgba(255,175,209,.4)')}for(let i=0;i<3;i++){const x=1170,y=180+i*90;line([[x-6,y+10],[x,y],[x+6,y+10]],'rgba(90,244,220,.5)',2)}}
 if(s.speed){for(let i=0;i<18;i++){const x=((rand(i)*1280-t*700)%1400+1400)%1400-60,y=100+rand(i*17)*500;line([[x,y],[x+40+rand(i)*90,y]],'rgba(158,218,234,.14)',2)}}
 if(s.overload){for(let i=0;i<4;i++){const x=350+i*190;bolt(x,130+Math.sin(t*9+i)*25,2+Math.sin(t*8+i),i%2?C.pink:C.cyan)}}
 if(s.impact)burst(920,87,t-s.impact,C.gold,30);
 if(s.restore)burst(680,330,t-s.restore,C.gold,50);
}
function overlays(t,s,u){
 // Hand-set typography belongs to the story: only opening and end titles.
 if(t<7){const alpha=clamp(t/.7)*clamp((7-t)/1.2);g.save();g.globalAlpha=alpha;txt('O BOTÃO',645,160,64,'#ffe2a2');txt('PROIBIDO',645,222,71,'#ff838f');txt('uma pequena curiosidade. um grande problema.',645,273,18,'#e3e7ff', 'center',400);g.restore()}
 if(s.ending){const a=smooth(u/1.2);g.save();g.globalAlpha=a;rect(390,290,500,124,'rgba(9,22,41,.9)',20);txt('FIM… POR ENQUANTO.',640,337,31,C.gold);txt('MIMO • TECA • PIP',640,380,16,C.cyan);g.restore()}
 // Gentle vignette and a cinematic, fixed safe frame.
 const v=g.createRadialGradient(640,340,270,640,340,790);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(3,9,26,.4)');g.fillStyle=v;g.fillRect(0,0,W,H);rect(0,0,W,30,'#07101f');rect(0,690,W,30,'#07101f');
 if(t<.7||t>209){const a=t<.7?1-t/.7:clamp(t-209);rect(0,0,W,H,`rgba(7,16,31,${a})`)}
}
function draw(t){t=clamp(t,0,210-1e-6);debug=[];const s=shotAt(t),u=t-s.start,c=cam(s,u);g=ctx;ctx.resetTransform();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);rect(0,0,W,H,'#111c32');
 let shake=0;for(const e of STORY.events)if(['gravity','land','crack','bonk'].includes(e.type)){const a=t-e.t;if(a>=0&&a<.5)shake+=(1-a/.5)*(e.type==='gravity'?3:1.8)}
 ctx.save();ctx.translate(640+Math.sin(t*73)*shake,350+Math.cos(t*67)*shake*.7);ctx.scale(c.z,c.z);ctx.translate(-c.x,-c.y);
 ctx.drawImage(scenery(s.set),0,0);objects(t,s,u);
 const a=sample(s.orange,u),b=sample(s.teal,u);
 if(!s.gravity&&s.set!=='rescue'){for(const p of [a,b]){g.save();g.globalAlpha=.25;ellipse(p.x,Math.min(620,p.y+95),44,7,'#050d20');g.restore()}}
 const teal=actor(b,t,1),orange=actor(a,t,0);
 if(s.rope){if(s.set==='rescue'){ropeBetween(teal.nodes[6],orange.nodes[4],t,true);line([[teal.nodes[4][0],teal.nodes[4][1]],[555,255]],'#ffcf79',3)}else ropeBetween(teal.nodes[6],orange.nodes[10],t,s.set!=='lab'||t>52)}
 if(s.drone||s.heroDrone){let x=600+Math.sin(t*.8)*65,y=200+Math.sin(t*1.1)*35;if(s.set==='tunnel'){x=600+Math.sin(u*1.2)*270;y=340+Math.sin(u)*80}if(s.heroDrone){x=mix(1040,650,smooth(u/4));y=160+Math.sin(t*2)*20}if(s.epilogue){x=t<203?mix(1150,945,smooth((t-201)/2)):945;y=t<203?mix(230,420,smooth((t-201)/2)):mix(420,180,clamp((t-203)/4))}drone(x,y,t,!!s.heroDrone);if(s.set==='rescue'&&u>1&&t>134)ropeBetween([x,y+30],orange.nodes[6],t,true)}
 fx(t,s,u);ctx.restore();
 if(s.flash){const age=t-s.flash;if(age>=0&&age<.15)rect(0,0,W,H,`rgba(231,255,238,${.6*(1-age/.15)})`)}
 overlays(t,s,u);return {shot:s.title,actors:debug,camera:c};
}
window.film={canvas,draw,duration:210,shotAt,shots:STORY.shots,metrics:{originalStory:true,fixedBoneIK:true,sourceVideoPixelsUsed:0,characters:['Mimo','Teca','Pip'],sets:['lab','tunnel','reactor','rescue']}};
})();
