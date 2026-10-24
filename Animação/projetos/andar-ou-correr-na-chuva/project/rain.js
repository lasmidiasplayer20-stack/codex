/* Original procedural illustrations and articulated actors; no reference-video frames. */
const PALETTE={gold:'#efc75c',cyan:'#74cbd7',cream:'#eee8da',ink:'#111c2b',muted:'#9fb7c7'};
function arrow(x1,y1,x2,y2,color=PALETTE.gold,width=4){line([[x1,y1],[x2,y2]],color,width);let a=Math.atan2(y2-y1,x2-x1);poly([[x2,y2],[x2-Math.cos(a-.5)*15,y2-Math.sin(a-.5)*15],[x2-Math.cos(a+.5)*15,y2-Math.sin(a+.5)*15]],color)}
function ik(a,b,l1,l2,bend=1){let dx=b[0]-a[0],dy=b[1]-a[1],dist=Math.max(.01,Math.hypot(dx,dy)),d=Math.min(dist,l1+l2-.001),ang=Math.atan2(dy,dx),c=clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1),th=ang+bend*Math.acos(c);return[a[0]+Math.cos(th)*l1,a[1]+Math.sin(th)*l1]}
function actor(x,y,scale,t,mode='breath',color=PALETTE.gold,opts={}){
 const M=window.MotionV2,base=opts.state||{path:window.idlePathV2||(window.idlePathV2=M.path([[0,0,0],[1,0,0]])),position:[0,0,0],yaw:Math.PI/2,distance:0,speed:0,gait:'walk',ground:0,time:t,mode:mode==='walk'||mode==='run'?'protect':mode};
 const p=M.pose(base),project=v=>[v[2]*110+v[0]*20,-v[1]*110];
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);if(opts.flip)ctx.scale(-1,1);ellipse(0,3,48,7,'#060e1d55');
 for(let i=0;i<2;i++){let l=p.legs[i],f=p.feet[i],a=project(l.hip),k=project(l.knee),b=project(l.ankle);line([a,k,b],i?'#26394b':'#18293b',13);rr(b[0]-10,b[1]+0,30,10,4,i?'#afc2c3':'#879ca3');}
 let hip=project(p.hip),sh=project(p.shoulder),head=project(p.head);poly([[sh[0]-25,sh[1]],[sh[0]+25,sh[1]],[hip[0]+20,hip[1]+5],[hip[0]-21,hip[1]+5]],color);line([[sh[0]-2,sh[1]+12],[hip[0],hip[1]-8]],'#ffffff22',2);
 for(let i=0;i<2;i++){let a=p.arms[i];line([project(a.shoulder),project(a.elbow),project(a.hand)],color,i?15:13);ellipse(...project(a.hand),7,7,PALETTE.ink)}
 line([sh,[head[0],head[1]+20]],PALETTE.ink,11);ellipse(...head,28,33,PALETTE.ink);ellipse(head[0]-6,head[1]-13,17,11,'#ffffff05');let blink=t%4.3<.09;ellipse(head[0]+3,head[1]-2,3.5,blink?1:5.5,'#edf1e6');ellipse(head[0]+17,head[1]-2,3.5,blink?1:5.5,'#edf1e6');
 if(base.gait==='run'&&base.speed>.1)ellipse(head[0]+10,head[1]+14,4,4,'#aabdc4');else line([[head[0]+6,head[1]+14],[head[0]+15,head[1]+14]],'#aabdc4',2);
 if(opts.wet)for(let i=0;i<5;i++)line([[head[0]-14+i*8,head[1]-28],[head[0]-17+i*8,head[1]-20]],'#89cde288',1);
 ctx.restore();window.lastDiagramPose=p;return p;
}
function rain(t,wind=0,amount=150,area=[0,0,1280,620],alpha=.45){
 ctx.save();ctx.beginPath();ctx.rect(...area);ctx.clip();let [x,y,w,h]=area;ctx.globalAlpha=alpha;
 for(let i=0;i<amount;i++){let z=.55+(i%7)*.11,speed=350*z,px=x+(((i*97.713+t*wind*z)%(w+100))+(w+100))%(w+100)-50,py=y+((i*67.391+t*speed)%(h+70))-35;line([[px,py],[px+wind*.025*z,py+17*z]],i%3?'#a2c9dd':'#ddedf4',1.1*z)}ctx.restore();
}
function street(t,s,u){
 let g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,'#233349');g.addColorStop(.55,'#64838c');g.addColorStop(1,'#253d50');ctx.fillStyle=g;ctx.fillRect(-100,-100,1480,920);
 for(let layer=0;layer<2;layer++)for(let i=0;i<12;i++){let x=i*145-layer*60,hh=125+(i*53%100),yy=385-hh;rr(x,yy,125,hh,0,layer?'#3e5667':'#31475b');for(let row=0;row<4;row++)for(let col=0;col<4;col++)rr(x+12+col*28,yy+20+row*35,8,14,1,(i+row+col)%5===0?'#ddc79c88':'#9db2b72a')}
 // foreground pavement, wet road and reflected windows
 poly([[0,400],[1280,400],[1280,720],[0,720]],'#304858');poly([[0,490],[1280,490],[1280,720],[0,720]],'#1c3447');line([[0,494],[1280,494]],'#9fb9ba',6);
 for(let i=0;i<24;i++){let xx=(i*73)%1280,yy=510+(i*43)%190;ellipse(xx,yy,22+(i%4)*17,2.5,'#8bb3be15');}for(let i=0;i<8;i++)line([[i*180+30,652],[i*180+110,652]],'#bdc5bb66',3);
 // shopfront and warm shelter, persistent location for all street shots
 rr(950,160,330,330,2,'#374c5d');rr(1000,245,165,240,3,'#b79664');rr(1025,263,115,222,2,'#ead6a0');rr(1050,275,65,210,0,'#a38e6c');line([[1110,370],[1122,370]],'#594e3f',4);glow(1080,390,210,'#edc77e25');poly([[910,235],[1250,235],[1280,267],[890,267]],'#526f78');line([[902,267],[1270,267]],'#a4bcc0',5);text('ABRIGO',1082,217,19,'#e4e8d6','center');
 // nearer lamppost and street furniture
 line([[130,135],[130,480]],'#233544',8);line([[130,135],[230,135]],'#233544',7);rr(208,133,47,12,5,'#d9e0ca');glow(231,178,150,'#e8d1a31b');ellipse(130,485,22,5,'#0f273a');
 let wind=s.wind||0;
 let mode=s.action||'walk',pos=s.x===undefined?mix(390,790,ease(u)):s.x;
 if(s.scene==='arrival')pos=mix(500,1060,ease(u));
 if(s.two){actor(mix(300,800,ease(u)),470,.83,t,'walk',PALETTE.cyan,{wet:true,phase:2});actor(mix(300,1040,ease(clamp(u*1.8))),570,1.08,t,u>.6?'relief':'run',PALETTE.gold,{wet:u<.7})}
 else actor(pos,525,s.scale||1.18,t,mode,PALETTE.gold,{wet:mode!=='umbrella'&&s.scene!=='arrival'});
 if(s.friend)actor(540,515,1.1,t,'point',PALETTE.cyan,{flip:true});
 rain(t,wind,s.rain===undefined?160:s.rain,[0,0,1280,625],.35);
 if(wind){for(let i=0;i<4;i++){let yy=150+i*70;arrow(wind>0?130:850,yy,wind>0?350:630,yy,PALETTE.cyan+'aa',2)}}
 if(s.note){rr(40,415,330,105,12,'#12263be8','#658c9c');wrap(s.note,60,450,285,22,'#e5ebdf',31)}
}
function diagramBase(s){let g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,'#12253b');g.addColorStop(1,'#243f54');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);grid(0,0,W,H,45,'#b1d4df09');glow(850,270,450,'#5c98aa16');text(s.board||'',640,110,35,PALETTE.cream,'center');}
function block(x,y,t,front=false){
 poly([[x-85,y-195],[x+35,y-225],[x+105,y-195],[x-15,y-165]],'#e8cc70');poly([[x-85,y-195],[x-15,y-165],[x-15,y+60],[x-85,y+25]],'#658d9d');poly([[x-15,y-165],[x+105,y-195],[x+105,y+25],[x-15,y+60]],front?'#edc65b':'#365b78');line([[x-85,y-195],[x-15,y-165],[x+105,y-195]],'#f6e2a0',2);ellipse(x+10,y+78,140,12,'#08192d44')
}
function infoCard(x,y,w,h,title,value,accent=PALETTE.gold){rr(x,y,w,h,16,'#11263d','#3f6479');text(title,x+25,y+40,18,PALETTE.muted);wrap(value,x+25,y+88,w-50,30,accent,40)}
function comparison(t,s,u){
 diagramBase(s);line([[640,145],[640,590]],'#96bdce44',2);text(s.leftTitle||'ANDAR',320,170,24,PALETTE.cyan,'center');text(s.rightTitle||'CORRER',960,170,24,PALETTE.gold,'center');
 if(s.scene==='timing'){
  const walk=MotionV2.diagramTrack(t,s,'walk'),run=MotionV2.diagramTrack(t,s,'run');actor(walk.canvasX,490,walk.canvasScale,t,walk.mode,PALETTE.cyan,{state:walk});actor(run.canvasX,490,run.canvasScale,t,run.mode,PALETTE.gold,{state:run});rain(t,0,70,[90,200,460,300],.4);rain(t,0,70,[730,200,460,300],.4);rr(135,510,370,66,10,'#0b1c2d');rr(775,510,370,66,10,'#0b1c2d');text(s.left||'100 m / 1,25 m/s = 80 s',320,550,24,PALETTE.cyan,'center');text(s.right||'100 m / 4 m/s = 25 s',960,550,24,PALETTE.gold,'center');
 }else if(s.scene==='compare'){
  let growth=MotionV2.smooth((t-s.start)/.9),a=(s.topLeft||.85)*growth,b=(s.topRight||.3)*growth;for(let [cx,p,c]of [[320,a,PALETTE.cyan],[960,b,PALETTE.gold]]){rr(cx-65,235,130,235,14,'#0b1c2d','#60859a');ctx.save();ctx.beginPath();ctx.roundRect(cx-61,239,122,227,10);ctx.clip();rr(cx-61,466-227*p,122,227*p,0,c+'99');for(let j=0;j<4;j++)line([[cx-61,466-227*p+j*4],[cx+61,466-227*p+j*4]],'#ffffff11',1);ctx.restore();text(cx<640?(s.left||'MAIS TEMPO'):(s.right||'MENOS TEMPO'),cx,527,23,c,'center');}
 }else if(s.scene==='summary'){
  infoCard(110,210,500,295,s.leftHeading||'ÁGUA POR CIMA',s.left||'Depende do tempo exposto',PALETTE.cyan);infoCard(670,210,500,295,s.rightHeading||'ÁGUA PELA FRENTE',s.right||'Depende do trajeto percorrido',PALETTE.gold);text('MESMO DESTINO. MENOS TEMPO EXPOSTO.',640,567,23,PALETTE.cream,'center');
 }
}
function physics(t,s,u){
 diagramBase(s);
 if(['block','top','front','corridor'].includes(s.scene)){
  if(s.scene==='corridor'){
   poly([[230,220],[1040,220],[1150,500],[110,500]],'#6fbbc018');for(let j=0;j<9;j++)line([[230+j*100,220],[110+j*130,500]],'#76c9d540',1);arrow(200,550,1080,550,PALETTE.cream,2);text('A MESMA DISTÂNCIA',640,589,20,PALETTE.cream,'center');block(mix(300,920,ease(u)),400,t,true);rain(t,0,100,[160,170,940,340],.45);
  }else{
   let xx=s.scene==='block'?640:590;block(xx,405,t,s.scene==='front');
   if(s.scene!=='front'){rain(t,0,80,[xx-110,145,250,270],.55);arrow(xx-25,160,xx-25,220,PALETTE.cyan,4);infoCard(865,245,315,180,'SUPERFÍCIE SUPERIOR','Depende do tempo',PALETTE.cyan)}
   if(s.scene!=='top'){for(let i=0;i<7;i++){let yy=280+i*30;arrow(120+(t*70+i*21)%80,yy,330+(t*70+i*21)%80,yy,PALETTE.gold+'88',2)}infoCard(80,170,310,185,'SUPERFÍCIE FRONTAL','Depende do trajeto',PALETTE.gold)}
   if(s.scene==='top')text('Menos tempo → menos água por cima',640,572,26,PALETTE.cream,'center');
   if(s.scene==='front')text('Mais gotas por segundo × menos segundos',640,572,25,PALETTE.cream,'center');
  }
 }else if(s.scene==='wind'){
  actor(590,550,1.3,t,'protect',PALETTE.gold,{wet:true});rain(t,s.wind||-350,130,[100,170,1070,400],.55);arrow(180,250,(s.wind||-350)>0?420:80,250,PALETTE.cyan,5);text(s.note||'O vento muda a direção das gotas',640,590,23,PALETTE.cream,'center');
 }else if(s.scene==='graph'){
  let gx=210,gy=500,gw=850,gh=300;grid(gx,180,gw,gh,50);arrow(gx,gy,gx,175,PALETTE.muted,2);arrow(gx,gy,gx+gw+20,gy,PALETTE.muted,2);let pts=[];for(let i=0;i<100;i++){let xx=i/99,yy=.22+.7/(1+xx*6);pts.push([gx+xx*gw,gy-yy*gh]);}line(pts.slice(0,Math.max(2,Math.floor(ease(u)*100))),PALETTE.gold,5);line([[gx,gy-.22*gh],[gx+gw,gy-.22*gh]],PALETTE.cyan+'99',2);text('VELOCIDADE →',1060,550,18,PALETTE.muted,'right');text('ÁGUA',180,168,18,PALETTE.muted);text('Parcela frontal permanece',790,gy-.22*gh-16,18,PALETTE.cyan,'center');text('Ganhos cada vez menores',750,270,24,PALETTE.gold,'center');
 }else if(s.scene==='puddle'){
  rr(0,500,1280,220,0,'#193244');ellipse(650,510,370,39,'#6598ae66');for(let k=0;k<5;k++){ctx.save();ctx.translate(650,510);ctx.scale(1,.17);ctx.beginPath();ctx.arc(0,0,55+((t*70+k*65)%300),0,tau);ctx.strokeStyle='#a2ced755';ctx.lineWidth=4;ctx.stroke();ctx.restore();}const ps=MotionV2.puddleTrack(t,s),posed=actor(ps.position[0]*110,510,1,t,ps.mode,PALETTE.gold,{wet:true,state:ps});for(let f of posed.feet){let age=f.phase*posed.stride/Math.max(.1,ps.speed),fx=f.world[0]*110;if(ps.speed>.5&&f.supported&&age<.4&&fx>470&&fx<870)for(let j=0;j<16;j++){let a=j*2.399,xx=fx+Math.cos(a)*age*150,yy=510-(70+j%3*20)*age+180*age*age;ellipse(xx,yy,2,4,'#97d9e5');}}text('Um passo na poça pode molhar a roupa por baixo.',640,582,24,PALETTE.cream,'center');
 }else if(s.scene==='fabric'){
  const names=['IMPERMEÁVEL','ALGODÃO','JÁ ENCHARCADO'],colors=['#e6c461','#7bc8ce','#658baf'];for(let i=0;i<3;i++){let x=255+i*385;rr(x-157,170,314,370,16,'#132c42','#50788d');text(names[i],x,210,19,colors[i],'center');poly([[x-70,280],[x-32,260],[x-20,280],[x+20,280],[x+32,260],[x+70,280],[x+104,346],[x+70,360],[x+45,315],[x+45,445],[x-45,445],[x-45,315],[x-70,360],[x-104,346]],colors[i]);for(let j=0;j<12;j++){let xx=x-57+(j*17)%115,yy=240+((t*95+j*31)%240);if(i===0&&yy>280)xx=x+(j%2?1:-1)*(65+(yy-280)*.25);ellipse(xx,yy,2,5,'#a9dfed');}text(['ESCORRE','ABSORVE','PODE ATRAVESSAR'][i],x,500,17,PALETTE.cream,'center');}text('Ilustração qualitativa: o comportamento depende do tecido.',640,585,19,PALETTE.muted,'center');
 }else if(s.scene==='measure'){
  infoCard(90,190,350,260,'01 / O QUE ATINGE','Água recebida pelo corpo',PALETTE.cyan);infoCard(465,190,350,260,'02 / O QUE FICA','Aumento de massa da roupa',PALETTE.gold);infoCard(840,190,350,260,'03 / A SENSAÇÃO','Percepção de estar molhado',PALETTE.cream);for(let i=0;i<5;i++){ellipse(420+i*110,515,12,12,i<Math.floor((t-s.start)%6)?PALETTE.gold:'#486d82');}text('Repita. Controle as condições. Compare.',640,580,24,PALETTE.cream,'center');
 }else if(s.scene==='conditions'){
  const labels=s.items||['MESMA DISTÂNCIA','MESMO CORPO','CHUVA CONSTANTE','SEM VENTO'];for(let i=0;i<4;i++){let appear=ease((t-s.start-i*.12)/.35);ctx.save();ctx.globalAlpha=appear;ctx.translate(0,(1-appear)*18);let xx=100+(i%2)*565,yy=185+Math.floor(i/2)*170;rr(xx,yy,515,135,15,'#142d44','#52788a');ellipse(xx+53,yy+65,23,23,'#5b9d9d');text('✓',xx+53,yy+74,27,'#e8e8ca','center');wrap(labels[i],xx+100,yy+61,385,24,PALETTE.cream,34);ctx.restore()}
 }else if(s.scene==='question'||s.scene==='answer'){
  actor(280,560,1.4,t,s.scene==='answer'?'relief':'think',PALETTE.gold);wrap(s.note||'Andar ou correr?',805,265,660,52,PALETTE.cream,70,'center');rr(560,465,500,4,1,PALETTE.gold);text(s.sub||'A física por trás de uma decisão cotidiana',805,520,19,PALETTE.muted,'center');
 }else if(s.scene==='caution'){
  poly([[240,200],[100,445],[380,445]],PALETTE.gold);text('!',240,402,105,PALETTE.ink,'center');wrap(s.note||'Chegar com segurança vem primeiro.',800,280,660,43,PALETTE.cream,58,'center');text(s.sub||'PISO MOLHADO · VISIBILIDADE · EQUILÍBRIO',800,510,18,PALETTE.muted,'center');
 }
}
function renderRain(t){
 ctx.resetTransform();ctx.scale(canvas.width/W,canvas.height/H);ctx.clearRect(0,0,W,H);let s=window.SHOTS.find(s=>t>=s.start&&t<s.end)||window.SHOTS.at(-1),u=clamp((t-s.start)/(s.end-s.start));
 ctx.save();let isStreet=['street','arrival','umbrella'].includes(s.scene),zoom=isStreet?1:Math.min(1.025,(s.zoom||1)+.01*ease(u)),focus=640;ctx.translate(640,340);ctx.scale(zoom,zoom);ctx.translate(-focus,-340);
 if(['street','arrival','umbrella'].includes(s.scene))(window.street3d?window.street3d(t,s,u):street(t,s,u));
 else if(['timing','compare','summary'].includes(s.scene))comparison(t,s,u);
 else physics(t,s,u);
 ctx.restore();cinematicFX(t,s);let vignette=ctx.createRadialGradient(640,340,290,640,340,800);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'#07112199');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
 ctx.font='600 16px sans-serif';rr(25,23,Math.min(1100,ctx.measureText(s.label||'').width+85),37,8,'#0a1b2be6');text(s.label||'A FÍSICA DA CHUVA',43,48,16,PALETTE.cream);
 // Rain is a visual illustration; quantitative values are explicitly labeled where used.
 if(s.caption)text(s.caption,1245,48,13,PALETTE.muted,'right');
 let fade=clamp((t-s.start)/.18);if(fade<1){ctx.fillStyle=`rgba(7,17,33,${(1-fade)*.8})`;ctx.fillRect(0,0,W,H)}
 if(window.CAPTIONS!==false)subtitles(t);
 rr(0,716,W,4,0,'#152c42');rr(0,716,W*clamp(t/480),4,0,PALETTE.gold);
}
draw=renderRain;window.draw=renderRain;
function cinematicFX(t,s){
 const local=t-s.start,street=['street','arrival'].includes(s.scene),urgent=street&&window.lastMotion?.plan.urgent;
 if(street||s.scene==='wind'){
  ctx.save();ctx.globalAlpha=.16;
  for(let i=0;i<14;i++){let x=i%2?1240-i*3:18+i*4,y=90+((t*90+i*47)%470);line([[x,y],[x-3,y+35+i%3*8]],'#acd7e5',1.5)}
  if(urgent&&window.lastMotion.tracks[0].speed>.7){for(let i=0;i<9;i++){let x=((900-t*410+i*153)%1400+1400)%1400-80,y=140+(i*53)%400;line([[x,y],[x+40+i%3*20,y-3]],'#c3e8ee',2)}}ctx.restore();
 }
 let flash=0;for(let at of [6.8,258.3,433])flash=Math.max(flash,.09*Math.exp(-Math.pow((t-at)/.085,2)));if(flash>.001){ctx.fillStyle=`rgba(191,224,247,${flash})`;ctx.fillRect(0,0,W,H)}
 if(street&&window.lastMotion?.plan.cutPhase<.10&&local>.2){let a=.045*(1-window.lastMotion.plan.cutPhase/.10);ctx.fillStyle=`rgba(117,169,200,${a})`;ctx.fillRect(0,0,W,H)}
 if(s.scene==='caution'){ctx.strokeStyle=`rgba(239,199,92,${.3+.12*Math.sin(t*5)})`;ctx.lineWidth=3;ctx.strokeRect(55,135,1170,455);}
}
