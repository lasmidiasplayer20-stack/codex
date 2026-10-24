'use strict';
const canvas=document.getElementById('film'),ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true}),W=1280,H=720;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),mix=(a,b,t)=>a+(b-a)*t,ease=v=>{v=clamp(v);return v*v*(3-2*v)},tau=Math.PI*2;
function rr(x,y,w,h,r=12,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.stroke()}}
function line(points,color,width=3){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke()}
function ellipse(x,y,rx,ry,fill){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,tau);ctx.fillStyle=fill;ctx.fill()}
function text(s,x,y,size=24,color='#e8edf7',align='left',weight=600){ctx.font=`${weight} ${size}px "DejaVu Sans",sans-serif`;ctx.fillStyle=color;ctx.textAlign=align;ctx.fillText(s,x,y)}
function wrap(s,x,y,max,size=24,color='#e8edf7',lineh=34,align='left'){let words=s.split(/\s+/),row='',rows=[];ctx.font=`600 ${size}px "DejaVu Sans",sans-serif`;for(let w of words){if(ctx.measureText(row+' '+w).width>max&&row){rows.push(row);row=w}else row+=(row?' ':'')+w}if(row)rows.push(row);rows.forEach((r,i)=>text(r,x,y+i*lineh,size,color,align));return rows.length}
function poly(points,fill){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
function glow(x,y,r,color){let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,2*r,2*r)}
function grid(x,y,w,h,step=35,color='#ffffff0b'){for(let i=x;i<x+w;i+=step)line([[i,y],[i,y+h]],color,1);for(let j=y;j<y+h;j+=step)line([[x,j],[x+w,j]],color,1)}
function windowPanel(x,y,w,h,night=false){rr(x-12,y-12,w+24,h+24,3,'#212c42');let g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,night?'#17254d':'#8fa8b9');g.addColorStop(1,night?'#8b5d7f':'#e8c3a2');rr(x,y,w,h,0,g);for(let k=0;k<9;k++){let bw=w/7;rr(x+k*w/9,y+h*.58-((k*47)%90),bw,h*.5,0,night?'#18223c':'#657b8d');}line([[x+w/2,y],[x+w/2,y+h]],'#26354c',7);line([[x,y+h*.5],[x+w,y+h*.5]],'#26354c',7)}
function desk(x,y,w=330){poly([[x,y],[x+w,y],[x+w+20,y+22],[x-20,y+22]],'#bc9875');rr(x,y+22,w,12,3,'#634f44');line([[x+20,y+34],[x+15,620]],'#333744',9);line([[x+w-20,y+34],[x+w-15,620]],'#333744',9)}
function monitor(x,y,w=250,label='ANÁLISE',t=0){rr(x-10,y-10,w+20,w*.61+20,12,'#0b1220','#536b84');rr(x,y,w,w*.61,5,'#182b40');grid(x,y,w,w*.61,25);text(label,x+18,y+30,14,'#82ddd1');line([[x+w/2,y+w*.61],[x+w/2,y+w*.61+25]],'#34465c',14);rr(x+w*.3,y+w*.61+20,w*.4,7,3,'#758095');let pts=[];for(let i=0;i<50;i++)pts.push([x+15+i*(w-30)/49,y+w*.4+Math.sin(i*.6+t*3)*8-((i+Math.floor(t*6))%19===0?30:0)]);line(pts,'#71e6cc',3)}
function books(x,y,n=6){const c=['#8f6c68','#4d8192','#bd934d','#53698a','#728c70'];for(let i=0;i<n;i++){rr(x+i*20,y-(i*13%38),16,70+i*13%38,2,c[i%c.length]);line([[x+i*20+4,y+15],[x+i*20+12,y+15]],'#ffffff66',2)}}
function plant(x,y){rr(x-25,y-50,50,55,5,'#a28a79');for(let i=0;i<7;i++){let a=-Math.PI*.92+i*.34;line([[x,y-48],[x+Math.cos(a)*52,y-85+Math.sin(a)*52]],'#446b63',6);ellipse(x+Math.cos(a)*52,y-85+Math.sin(a)*52,13,25,'#507f70')}}
function room(type,t,shot){
 let night=['bedroom','lab','office','isolated'].includes(type),warm=['classroom','cafe','home'].includes(type);
 let bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,night?'#17233c':warm?'#8b7a76':'#475d73');bg.addColorStop(1,night?'#30384d':warm?'#b4a38e':'#82969f');ctx.fillStyle=bg;ctx.fillRect(-100,-100,W+200,H+200);
 rr(0,555,W,165,0,night?'#25273a':'#5a5351');for(let i=0;i<7;i++)line([[0,580+i*24],[W,580+i*24]],'#ffffff06',1);line([[0,555],[W,555]],'#1c263b',9);
 if(type==='classroom'){
  windowPanel(45,85,250,310);glow(200,300,400,'#ffe0ac22');rr(350,105,740,330,8,'#293c3a','#b4a386');rr(365,120,710,300,2,'#263c37');text('LABORATÓRIO DE IDEIAS',400,160,18,'#c8d5bc');text(shot.board||'f(x) = x² + 2x + 1',415,230,38,'#d8e2c9');line([[405,260],[1020,260]],'#c9d3bd55',2);text('PERGUNTAR  ·  TESTAR  ·  APRENDER',415,310,20,'#b8cbb8');for(let i=0;i<3;i++){desk(70+i*410,520,290);}ellipse(1150,104,35,35,'#ddd7c5');line([[1150,104],[1150,79]],'#34414a',3);line([[1150,104],[1170,111]],'#34414a',3);
 }else if(type==='bedroom'){
  windowPanel(690,80,420,290,true);ellipse(1020,130,22,22,'#e7e5d2');rr(65,480,420,110,18,'#847e91');rr(45,445,460,70,24,'#abb2bd');rr(80,452,125,45,15,'#d6d7d1');rr(200,475,285,78,10,'#526b8e');desk(760,510,330);monitor(795,350,245,'23:48',t);books(550,500);plant(1180,558);glow(620,310,190,'#e7b36920');rr(590,330,10,210,1,'#827d79');poly([[560,330],[640,330],[620,275],[580,275]],'#c7ac86');
 }else if(type==='lab'||type==='hospital'){
  rr(0,0,1280,75,0,'#263b52');for(let x=70;x<1200;x+=310){rr(x,40,200,10,5,'#d5efee');glow(x+100,80,200,'#95d4df22')}windowPanel(70,130,300,285,false);rr(900,160,275,260,10,'#365267','#87a1ad');monitor(920,180,235,'ATIVIDADE COGNITIVA',t);rr(110,490,420,85,22,'#c0d0d1');rr(105,475,430,30,15,'#e2e6e0');rr(125,445,105,40,18,'#cbd5d5');line([[140,575],[140,615]],'#8196a1',8);line([[500,575],[500,615]],'#8196a1',8);desk(785,535,375);rr(590,110,200,140,3,'#c1c9c6');brain(690,176,.52,t,'#9c647a');plant(1210,560);
 }else if(type==='cafe'){
  windowPanel(80,70,500,350,false);rr(0,470,1280,90,0,'#414557');desk(380,500,510);for(let x of [470,770]){ellipse(x,485,25,9,'#d9d8d0');rr(x-18,450,36,35,4,'#deded2');ellipse(x,450,18,6,'#706653');}rr(1000,100,180,230,8,'#273347');text('CAFÉ',1090,155,30,'#d4b98c','center');text('IDEIAS & CONVERSAS',1090,190,12,'#b8c4cc','center');plant(1150,560);
 }else if(type==='office'||type==='home'||type==='isolated'){
  windowPanel(60,70,450,350,night);desk(570,520,570);monitor(750,305,280,'PROJETO / 01',t);books(590,510);plant(1195,558);rr(570,90,540,145,4,'#263950','#53677d');text(shot.board||'UMA PERGUNTA MUDA TUDO.',600,145,25,'#d7e2e9');text('OBSERVAR → CONECTAR → CRIAR',600,190,18,'#8bb4c6');
 }else if(type==='city'){
  windowPanel(-30,-40,1350,600,night);rr(0,460,1280,260,0,'#485465');for(let i=0;i<10;i++)rr(i*145-50,600,90,6,0,'#c3c9ca');plant(1110,490);text(shot.board||'UM MUNDO DE POSSIBILIDADES',640,150,33,'#d4e9ec','center');
 }else{
  grid(0,0,W,555,50);glow(640,240,430,'#557dbd35');
 }
}
function brain(x,y,s,t,color='#a9b8ff'){
 ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.lineWidth=3;let nodes=[];for(let i=0;i<38;i++){let a=i*2.399963,r=22+Math.sqrt(i/38)*105;nodes.push([Math.cos(a)*r*1.2,Math.sin(a)*r*.77]);}for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){let a=nodes[i],b=nodes[j];if(Math.hypot(a[0]-b[0],a[1]-b[1])<60)line([a,b],color+'55',1.5)}for(let [i,p]of nodes.entries()){ellipse(p[0],p[1],3+Math.sin(t*2+i)*1.2,3+Math.sin(t*2+i)*1.2,color)}ctx.restore();
}
function character(x,y,scale,color,t,action='talk',seed=0,face=1){
 ctx.save();ctx.translate(x,y);ctx.scale(scale*face,scale);let phase=t*2.2+seed,breathe=Math.sin(t*2+seed)*2,walk=action==='walk'?Math.sin(t*7+seed):0;
 ellipse(0,4,50,9,'#0b14274d');let hip=[0,-93+breathe],shoulder=[Math.sin(phase)*2,-198+breathe],neck=[0,-221+breathe];
 let footL=[-22+walk*28,0-Math.max(0,-walk)*12],footR=[22-walk*28,0-Math.max(0,walk)*12];
 let kneeL=[-25+walk*18,-49],kneeR=[27-walk*18,-49];
 if(action==='sit'){hip=[-12,-65];shoulder=[-8,-166+breathe];neck=[-8,-190+breathe];kneeL=[60,-55];kneeR=[75,-52];footL=[70,0];footR=[92,0];}
 const armL=[shoulder[0]-28,shoulder[1]+8],armR=[shoulder[0]+28,shoulder[1]+8];let elbowL=[-48,-145],elbowR=[48,-148],handL=[-38,-98],handR=[49,-99];
 if(action==='talk'||action==='explain'){elbowR=[65,-177+Math.sin(phase)*8];handR=[85,-213+Math.sin(phase)*12];elbowL=[-52,-150];handL=[-45,-128];}
 if(action==='think'){elbowR=[66,-169];handR=[26,-236+breathe];handL=[-14,-130];elbowL=[-55,-140];}
 if(action==='point'){elbowR=[75,-215];handR=[130,-235+Math.sin(phase)*4];}
 if(action==='celebrate'){elbowL=[-65,-225];handL=[-85,-285+Math.sin(phase)*6];elbowR=[65,-225];handR=[85,-285+Math.sin(phase)*6];}
 if(action==='work'||action==='sit'){elbowR=[65,-130];handR=[99+Math.sin(t*6)*5,-137];elbowL=[-36,-119];handL=[57+Math.sin(t*7)*5,-135];}
 if(action==='worried'){neck[1]+=8;elbowR=[63,-176];handR=[32,-245];elbowL=[-58,-175];handL=[-26,-245];}
 if(action==='walk'){handR=[40+walk*28,-110];handL=[-40-walk*28,-110];}
 // Trouser limbs keep a consistent silhouette, separate knees and planted soles.
 line([hip,kneeL,footL],'#202938',15);line([hip,kneeR,footR],'#263244',16);line([[footL[0]-8,footL[1]],[footL[0]+13,footL[1]]],'#161e2d',12);line([[footR[0]-8,footR[1]],[footR[0]+13,footR[1]]],'#161e2d',12);
 poly([[shoulder[0]-28,shoulder[1]],[shoulder[0]+28,shoulder[1]],[hip[0]+23,hip[1]+8],[hip[0]-24,hip[1]+8]],color);line([armL,elbowL,handL],color,17);line([armR,elbowR,handR],color,17);ellipse(...handL,8,8,'#171e29');ellipse(...handR,8,8,'#171e29');line([[hip[0]-15,hip[1]+2],[hip[0]+16,hip[1]+2]],'#00000030',3);
 line([shoulder,neck],'#171e29',12);let hx=neck[0],hy=neck[1]-28;ellipse(hx,hy,29,34,'#171e29');ellipse(hx-5,hy-13,19,12,'#ffffff05');
 let blink=Math.sin(t*.83+seed)>0.995,eyeY=hy-2;ellipse(hx+1,eyeY,4,blink?1:6,'#edf3e9');ellipse(hx+15,eyeY,4,blink?1:6,'#edf3e9');
 if(action==='worried'){line([[hx-4,hy-15],[hx+5,hy-18]],'#bec6cc',2);line([[hx+12,hy-18],[hx+21,hy-13]],'#bec6cc',2);line([[hx+5,hy+15],[hx+14,hy+12]],'#bbc5c8',2);}else if(action==='celebrate'){ctx.beginPath();ctx.arc(hx+8,hy+7,9,.12,Math.PI-.12);ctx.strokeStyle='#d2ddd7';ctx.lineWidth=2;ctx.stroke();}else{ellipse(hx+8,hy+14,action==='talk'?3+Math.sin(t*14)**2*3:4,action==='talk'?2+Math.sin(t*14)**2*4:1.3,'#9aa9ad')}
 ctx.restore();
}
function chart(t,shot){rr(185,130,910,410,18,'#132438','#4f7186');text(shot.board||'EVOLUÇÃO',225,180,21,'#9bc5cf');grid(230,215,800,260,50);line([[230,215],[230,480],[1040,480]],'#6d899c',2);let pts=[];for(let i=0;i<65;i++){let u=i/64;pts.push([240+u*775,455-190*u*u-15*Math.sin(u*12+t)])}let end=Math.floor(clamp((t-shot.start)/2)*65);line(pts.slice(0,Math.max(2,end)),'#edc85b',6);for(let i=0;i<5;i++)text(String(i*25),230+i*195,510,17,'#90a6b6','center');}
function abstractScene(type,t,s){
 let g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#101c32');g.addColorStop(1,'#283655');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);grid(0,0,W,H,50);glow(640,320,430,'#5085dd26');
 if(type==='brain'){brain(640,300,2.1,t);text(s.board||'NOVAS CONEXÕES',640,570,34,'#e7c85b','center');for(let i=0;i<18;i++){let a=i*2.4+t*.03;ellipse(640+Math.cos(a)*(220+i*5),300+Math.sin(a)*(140+i*2),2,2,'#93c9e6');}}
 else if(type==='chart'){chart(t,s)}
 else if(type==='network'){
  for(let i=0;i<8;i++){let a=i*tau/8,x=640+Math.cos(a)*340,y=330+Math.sin(a)*210;line([[640,330],[x,y]],'#84a8b955',2);rr(x-60,y-32,120,64,12,'#263d58','#587b95');text(['IDEIA','TESTE','CRIAR','DADOS','PESSOAS','TEMPO','ESCOLHA','FUTURO'][i],x,y+7,16,'#b9d9e5','center');}ellipse(640,330,85,85,'#26465e');brain(640,330,.55,t,'#e6ce74');
 }else if(type==='phone'){
  rr(480,75,320,520,36,'#08101d','#60758c');rr(495,95,290,477,25,'#20324a');rr(590,105,100,12,6,'#080f1b');text('MENSAGENS',640,175,21,'#cddde4','center');for(let i=0;i<4;i++){let appear=clamp((t-s.start-i*.7)*3);ctx.globalAlpha=appear;rr(515+(i%2)*35,220+i*75,205,56,12,i%2?'#34685f':'#364c68');text((s.messages||['Uma nova ideia.','E se fosse possível?','Vamos descobrir.','Agora é com você.'])[i],530+(i%2)*35,253+i*75,16,'#d8e7e8');ctx.globalAlpha=1;}
 }else if(type==='title'){
  text(s.label||'UMA NOVA PERSPECTIVA',640,210,18,'#88b7c9','center');wrap(s.board||'E se tudo mudasse?',640,310,1000,62,'#edf1e9',78,'center');line([[535,455],[745,455]],'#e5c25c',5);text(s.sub||'UMA HISTÓRIA SOBRE POSSIBILIDADES',640,505,18,'#9db4c5','center');
 }
}
function subtitles(t){let seg=window.NARRATION.find(s=>s.start<=t&&s.end>t);if(!seg)return;let words=seg.words||[],chunks=[];for(let i=0;i<words.length;i+=8)chunks.push(words.slice(i,i+8));let active=chunks.find(c=>t>=c[0].start&&t<Math.max(c.at(-1).end,c[0].start+.1));if(!active)active=chunks.find(c=>c.at(-1).end>t)||chunks.at(-1);if(!active)return;ctx.font='600 27px "DejaVu Sans",sans-serif';let str=active.map(w=>w.word.trim()).join(' '),width=Math.min(1140,ctx.measureText(str).width+48);rr((W-width)/2,631,width,57,13,'#0a1323e8');let total=ctx.measureText(str).width,x=(W-total)/2;for(let w of active){let token=w.word.trim(),wth=ctx.measureText(token+' ').width;text(token,x,669,27,t>=w.start&&t<=w.end?'#f0d06c':'#e4eaf0');x+=wth;}}
function draw(t){
 ctx.resetTransform();ctx.clearRect(0,0,W,H);let shots=window.SHOTS,s=shots.find(s=>t>=s.start&&t<s.end)||shots.at(-1),u=clamp((t-s.start)/(s.end-s.start));
 ctx.save();let z=s.zoom||1;z+=.045*ease(u);let targetX=s.focus||640,pan=Math.sin(u*Math.PI)*9*(s.pan||1);ctx.translate(640,345);ctx.scale(z,z);ctx.translate(-targetX+pan,-345);
 if(['brain','chart','network','title','phone'].includes(s.scene)){abstractScene(s.scene,t,s)}else{
 room(s.scene,t,s);
 let cast=s.cast||[{x:660,color:'#e0ba48',action:s.action||'talk'}];
 for(let [i,a]of cast.entries()){let x=a.x+(a.action==='walk'?Math.sin(u*Math.PI)*100*(a.dir||1):0);character(x,a.y||600,a.scale||1.15,a.color||'#e0ba48',t,a.action||s.action||'talk',i*1.7,a.face||1);}
 if(s.prop==='paper'){rr(720,450,110,80,2,'#dedcca');for(let i=0;i<4;i++)line([[735,465+i*14],[810,465+i*14]],'#88919c',2)}
 if(s.prop==='idea'){let yy=230+Math.sin(t*2)*4;glow(760,yy,100,'#f2c95c44');ellipse(760,yy,24,30,'#ecd475');rr(748,yy+26,24,12,3,'#8c9ba3');for(let i=0;i<8;i++){let a=i*tau/8;line([[760+Math.cos(a)*40,yy+Math.sin(a)*45],[760+Math.cos(a)*50,yy+Math.sin(a)*56]],'#ecd475',3)}}
 }
 ctx.restore();
 // Cinematic framing, restrained vignette and chapter labels.
 let vig=ctx.createRadialGradient(640,330,250,640,330,790);vig.addColorStop(0,'#00000000');vig.addColorStop(1,'#02081388');ctx.fillStyle=vig;ctx.fillRect(0,0,W,H);
 rr(0,0,W,38,0,'#0a1222cc');text(s.label||'UMA NOVA PERSPECTIVA',38,26,13,'#c7d8e2');text(String(window.SHOTS.indexOf(s)+1).padStart(2,'0')+' / '+window.SHOTS.length,1240,26,13,'#9eb2c4','right');
 let fade=clamp((t-s.start)/.25);if(fade<1){ctx.fillStyle=`rgba(7,14,27,${1-fade})`;ctx.fillRect(0,38,W,H-38)}
 if(window.CAPTIONS!==false)subtitles(t);
 rr(0,716,W,4,0,'#1c2e44');rr(0,716,W*clamp(t/480),4,0,'#e0bf68');
}
window.draw=draw;
