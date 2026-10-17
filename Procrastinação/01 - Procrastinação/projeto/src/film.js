/* Original authored animation. The supplied project informs the visual language;
   its frames, narration and soundtrack are not used by this renderer. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./day-three-character.js'));else root.ProcrastinacaoFilm=factory(root.CharacterRig);})(typeof globalThis!=='undefined'?globalThis:this,function(Character){
'use strict';
const W=960,H=540,TAU=Math.PI*2;
const C={bg:'#080c0f',paper:'#f1f0e9',muted:'#7e898b',line:'#243037',red:'#ef4c50',redDim:'#6e252b',panel:'#11191d'};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,u)=>a+(b-a)*u;
const ease=u=>{u=clamp(u);return u*u*(3-2*u);};
const smooth=(t,a,b)=>ease((t-a)/(b-a)),rand=n=>{const x=Math.sin(n*127.1+718.71)*43758.5453;return x-Math.floor(x);};
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
const polar=(a,l)=>[Math.cos(a)*l,Math.sin(a)*l];
function ik(root,target,a,b,side){
 const delta=sub(target,root),raw=Math.hypot(...delta),d=clamp(raw,Math.abs(a-b)+1e-6,a+b-1e-6),angle=Math.atan2(delta[1],delta[0]);
 const alpha=Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));
 return {joint:add(root,polar(angle+alpha*side,a)),end:add(root,polar(angle,d)),excess:Math.max(0,raw-d)};
}
function poseAt(t,opt={}){
 const x=opt.x??360,floor=opt.floor??442,body=opt.body??0,neck=opt.neck??0;
 const rotate=q=>[q[0]*Math.cos(body)-q[1]*Math.sin(body),q[0]*Math.sin(body)+q[1]*Math.cos(body)];
 const hipOffsets=[rotate([-6,-3]),rotate([6,-3])];
 let pelvis=[x,floor-96],feet=[[x-19,floor],[x+19,floor]],phase=0,contacts=[true,true];
 if(opt.walk){
  // Stance feet stay planted in world space; each limb keeps its depth identity.
  const origin=opt.walkOrigin??x-(opt.speed??55)*(opt.gait??t),stride=64,settle=opt.settle??0;
  phase=(x-origin)/stride;
  feet=[0,.5].map((offset,i)=>{
   const p=phase+offset,cycle=Math.floor(p),u=p-cycle,plant=origin+stride*(cycle-offset+.35);
   contacts[i]=u<.62||settle>=1;
   if(u<.62)return [plant,floor];
   const v=(u-.62)/.38;return [plant+stride*ease(v),floor-13*Math.sin(Math.PI*v)*(1-settle)];
  });pelvis[1]=floor-94+.4*Math.sin(phase*TAU*2);
 }
 if(opt.sit){pelvis=[x,floor-52];feet=[[x+28,floor],[x+56,floor]];}
 // Fit each actual hip to its own ankle, never stretch a shared pelvis bone.
 for(let pass=0;pass<8;pass++)for(let i=0;i<2;i++){
  const d=sub(feet[i],add(pelvis,hipOffsets[i])),l=Math.hypot(...d);
  if(l>99.6){pelvis[0]+=d[0]*(1-99.6/l);pelvis[1]+=d[1]*(1-99.6/l);}
 }
 const hips=hipOffsets.map(q=>add(pelvis,q));
 const shoulder=add(pelvis,polar(-Math.PI/2+body,55)),head=add(shoulder,polar(-Math.PI/2+body+neck,26));
 const shoulders=[add(shoulder,rotate([-6,0])),add(shoulder,rotate([9,2]))];
 let h0=[shoulder[0]-20,shoulder[1]+60],h1=[shoulder[0]+22,shoulder[1]+64];
 if(opt.walk){const swing=Math.sin(phase*TAU);h0=[shoulder[0]-13-12*swing,shoulder[1]+61];h1=[shoulder[0]+19+12*swing,shoulder[1]+62];}
 if(opt.gesture==='think'){h0=[shoulder[0]-20,shoulder[1]+60];h1=[head[0]+30,head[1]+9];}
 if(opt.gesture==='point'){h1=[shoulder[0]+59,shoulder[1]-2-4*Math.sin(t*2)];}
 if(opt.gesture==='reach'){const q=opt.amount??1;h1=[shoulder[0]+lerp(22,59,q),shoulder[1]+lerp(64,0,q)];}
 if(opt.gesture==='phone'){h1=[shoulder[0]+36,shoulder[1]+30];h0=[shoulder[0]+36,shoulder[1]+30];}
 if(opt.gesture==='push'){h0=[shoulder[0]+56,shoulder[1]-10];h1=[shoulder[0]+56,shoulder[1]+11];}
 if(opt.gesture==='celebrate'){
  // Lift on shoulder-centred arcs, rather than folding wrists through the torso.
  const q=opt.amount??1,starts=[h0,h1],ends=[[shoulder[0]-39,shoulder[1]-45],[shoulder[0]+39,shoulder[1]-45]];
  [h0,h1]=starts.map((start,i)=>{const a=sub(start,shoulders[i]),b=sub(ends[i],shoulders[i]);let end=Math.atan2(b[1],b[0]);if(i===0&&end<0)end+=TAU;return add(shoulders[i],polar(lerp(Math.atan2(a[1],a[0]),end,q),lerp(Math.hypot(...a),Math.hypot(...b),q)));});
 }
 if(opt.hand0)h0=opt.hand0;if(opt.hand1)h1=opt.hand1;
 const sides=opt.armSides??(opt.gesture==='celebrate'?[-1,1]:[1,1]);
 const arms=[ik(shoulders[0],h0,33,32,sides[0]),ik(shoulders[1],h1,33,32,sides[1])];
 // Both knees flex forward, including relaxed standing poses.
 const legs=hips.map((hip,i)=>ik(hip,feet[i],50,50,-1));
 const nodes=[pelvis,shoulder,head,arms[0].joint,arms[0].end,arms[1].joint,arms[1].end,legs[0].joint,legs[0].end,legs[1].joint,legs[1].end,...shoulders,...hips];
 const bones=[[pelvis,shoulder,55],[shoulder,head,26],...arms.flatMap((a,i)=>[[shoulders[i],a.joint,33],[a.joint,a.end,32]]),...legs.flatMap((l,i)=>[[hips[i],l.joint,50],[l.joint,l.end,50]])];
 return {pelvis,shoulder,shoulders,hips,head,feet,contacts,phase,hands:arms.map(a=>a.end),arms,legs,targets:[h0,h1],nodes,bones,errors:[...arms.map(a=>a.excess),...legs.map(l=>l.excess)]};
}
function locomotion(kind,t){
 const settings={desk:[235,500,2.6,0],steps:[220,560,3.4,0],push:[315,450,1.7,.7]};
 const [a,b,d,start]=settings[kind],u=clamp((t-start)/d),x=lerp(a,b,ease(u));
 return {x,walk:true,walkOrigin:a,settle:smooth(t,start+d,start+d+.4)};
}
function makeFilm(ctx,plan){
 let now=0,vhs=true,lastActors=[];const stats={frames:0,maxBoneError:0,maxLegContactError:0,maxReachExcess:0,finite:true,sourcePixelsUsed:0};
 const line=(points,color=C.paper,width=3)=>{ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();};
 function soft(a,b,c,color,width){
  const u=sub(b,a),v=sub(c,b),l0=Math.hypot(...u),l1=Math.hypot(...v),tangent=add(u.map(x=>x/Math.max(l0,1e-6)),v.map(x=>x/Math.max(l1,1e-6))),n=Math.hypot(...tangent),handle=Math.min(l0,l1)*.17,h=tangent.map(x=>x/Math.max(n,1e-6)*handle);
  ctx.beginPath();ctx.moveTo(...a);ctx.bezierCurveTo(a[0]+u[0]/3,a[1]+u[1]/3,b[0]-h[0],b[1]-h[1],...b);ctx.bezierCurveTo(b[0]+h[0],b[1]+h[1],c[0]-v[0]/3,c[1]-v[1]/3,...c);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap=ctx.lineJoin='round';ctx.stroke();
 }
 function rect(x,y,w,h,fill=C.panel,r=0,stroke=null,lw=1){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
 function circle(x,y,r,fill=C.paper,stroke=null,lw=1){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
 function text(s,x,y,size=20,col=C.paper,align='left',weight=500){ctx.font=`${weight} ${size}px DejaVu Sans`;ctx.fillStyle=col;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(String(s),x,y);}
 function fit(s,x,y,maxWidth,size=42,col=C.paper,align='left',weight=700){ctx.font=`${weight} ${size}px DejaVu Sans`;while(ctx.measureText(String(s)).width>maxWidth&&size>12){size-=1;ctx.font=`${weight} ${size}px DejaVu Sans`;}text(s,x,y,size,col,align,weight);}
 function arrow(a,b,col=C.red,width=2){line([a,b],col,width);const v=Math.atan2(b[1]-a[1],b[0]-a[0]);line([add(b,polar(v-2.5,12)),b,add(b,polar(v+2.5,12))],col,width);}
 function check(x,y,q=1,color=C.paper,size=15){const p=[[x-size*.7,y],[x-size*.12,y+size*.6],[x+size,y-size*.7]],len=[0,.42,1];if(q<=.42)line([p[0],[lerp(p[0][0],p[1][0],q/.42),lerp(p[0][1],p[1][1],q/.42)]],color,3);else line([p[0],p[1],[lerp(p[1][0],p[2][0],(q-.42)/.58),lerp(p[1][1],p[2][1],(q-.42)/.58)]],color,3);}
 function actor(t,opt={}){
  const p=poseAt(t,opt),color=opt.color??C.paper,alpha=opt.alpha??1;
  lastActors.push(p);
  ctx.save();ctx.globalAlpha*=alpha;
  if(opt.ghost){ctx.shadowColor=C.red;ctx.shadowBlur=9;}
  if(plan.character?.style==='day-three-beanie'){
   Character.renderRetargeted(ctx,p,t,{bag:plan.character.bag!==false,width:10.5,mood:opt.mood??(opt.gesture==='celebrate'?'hope':opt.gesture==='phone'?'tired':'worried'),look:opt.look??1,lookY:opt.lookY??0,faceFacing:opt.faceFacing??1,mouthOpen:opt.mouthOpen??0});
  }else{
  const far=opt.ghost?color:'#a6b0b1';
  soft(p.hips[0],p.legs[0].joint,p.legs[0].end,far,9.5);
  soft(p.shoulders[0],p.arms[0].joint,p.arms[0].end,far,9);
  soft(p.hips[1],p.legs[1].joint,p.legs[1].end,color,10.5);
  soft(p.pelvis,p.shoulder,p.head,color,13.5);
  soft(p.shoulders[1],p.arms[1].joint,p.arms[1].end,color,10.5);
  circle(...p.head,20,color);
  if(!opt.ghost){circle(p.head[0]+7,p.head[1]+1,1.7,C.bg);line([[p.head[0]+4,p.head[1]+9],[p.head[0]+8,p.head[1]+9]],C.bg,1.2);}
  p.feet.forEach((f,i)=>line([[f[0]-2,f[1]],[f[0]+7,f[1]]],i?color:far,9.5));
  }
  ctx.restore();
  for(const n of p.nodes)stats.finite&&=n.every(Number.isFinite);
  for(const [a,b,length] of p.bones)stats.maxBoneError=Math.max(stats.maxBoneError,Math.abs(dist(a,b)-length));
  stats.maxLegContactError=Math.max(stats.maxLegContactError,...p.errors.slice(2));stats.maxReachExcess=Math.max(stats.maxReachExcess,...p.errors);return p;
 }
 function phone(x,y,scale=1,t=0,notifications=true){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);rect(-28,-48,56,96,C.panel,8,C.paper,2);rect(-22,-37,44,70,'#172125',3);line([[-8,40],[8,40]],C.muted,2);if(notifications){const cards=3;for(let i=0;i<cards;i++){const q=ease((t-i*.23)/.5);ctx.globalAlpha=q;rect(-17,lerp(-60,-25+i*21,q),34,15,i===0?C.red:'#313c41',2);line([[-12,-20+i*21],[8,-20+i*21]],i===0?C.paper:C.muted,1);}}ctx.restore();}
 function timer(x,y,r,t,seconds=120,label=true){circle(x,y,r,null,C.line,5);const q=clamp(t/seconds);ctx.beginPath();ctx.arc(x,y,r,-Math.PI/2,-Math.PI/2+TAU*q);ctx.strokeStyle=C.red;ctx.lineWidth=5;ctx.stroke();for(let i=0;i<12;i++){const a=i/12*TAU;line([add([x,y],polar(a,r-10)),add([x,y],polar(a,r-5))],C.muted,1);}if(label){const left=Math.max(0,Math.ceil(seconds-t));text(`${String(Math.floor(left/60)).padStart(2,'0')}:${String(left%60).padStart(2,'0')}`,x,y,34,C.paper,'center',700);}}
 function cursor(x,y,click=0){ctx.save();ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,24);ctx.lineTo(6,18);ctx.lineTo(12,29);ctx.lineTo(17,26);ctx.lineTo(11,15);ctx.lineTo(21,14);ctx.closePath();ctx.fillStyle=C.paper;ctx.fill();ctx.strokeStyle=C.bg;ctx.lineWidth=2;ctx.stroke();if(click>0){circle(2,1,8+click*27,null,`rgba(239,76,80,${1-click})`,2);}ctx.restore();}
 function task(x,y,w,h,label,progress=0,selected=false){const cy=h<60?22:29;rect(x,y,w,h,C.panel,7,selected?C.red:C.line,1.4);rect(x+17,y+cy-10,20,20,null,4,progress>.85?C.red:C.muted,1.3);if(progress>.02)check(x+26,y+cy,clamp(progress),C.red,8);fit(label,x+51,y+cy,w-65,18,C.paper,'left',600);if(h>=60){rect(x+18,y+h-15,w-36,3,C.line,1.5);if(progress>0)rect(x+18,y+h-15,(w-36)*progress,3,C.red,1.5);}}
 function desk(t,opt={}){const x=opt.x??570;line([[x-25,351],[x+190,351]],C.paper,3);line([[x-9,351],[x-9,443]],C.muted,3);line([[x+171,351],[x+171,443]],C.muted,3);rect(x+24,257,110,75,C.panel,4,C.paper,2);line([[x+79,332],[x+79,347]],C.muted,3);line([[x+58,347],[x+100,347]],C.muted,2);for(let i=0;i<3;i++)line([[x+36,274+i*15],[x+84+20*Math.sin(t+i),274+i*15]],i===0?C.red:C.muted,2);rect(x+143,326,22,23,null,3,C.muted,1.5);}
 function brain(x,y,t){const radii=[62,48,33];for(let k=0;k<3;k++){ctx.beginPath();for(let i=0;i<=90;i++){const a=i/90*TAU,r=radii[k]+5*Math.sin(a*5+t*(k+1)*.4);const p=[x+Math.cos(a)*r*1.3,y+Math.sin(a)*r];ctx[i?'lineTo':'moveTo'](...p);}ctx.strokeStyle=k===0?C.paper:C.line;ctx.lineWidth=2;ctx.stroke();}for(let i=0;i<7;i++){const a=i/7*TAU+t*.15,p=[x+Math.cos(a)*58,y+Math.sin(a)*40];circle(...p,3,C.red);}}
 function scene(s,t,global){
  const u=clamp(t/(s.end-s.start)),enter=smooth(t,0,.7),kind=s.kind;
  // Camera moves the entire scene. Labels and captions stay in screen space.
  const zoom=lerp(s.zoom?.[0]??1,s.zoom?.[1]??1.04,ease(u));
  ctx.save();ctx.translate(480,270);ctx.scale(zoom,zoom);ctx.translate(-480,-270);
  if(kind==='title'){
   const y=lerp(300,245,enter),q=smooth(t,.3,1.25),base=poseAt(t,{x:755,floor:442});
   text('UM PEQUENO MOVIMENTO',385,165,12,C.muted,'center',600);fit(s.title??plan.title,385,y,625,54,C.paper,'center',800);rect(lerp(385,250,enter),y+52,270*enter,4,C.red,2);text(s.subtitle??'',385,345,19,C.muted,'center');
   const buttonY=292+Math.sin(t*5)*1.5*q;circle(700,buttonY,13,C.red);ctx.beginPath();ctx.moveTo(697,buttonY-5);ctx.lineTo(705,buttonY);ctx.lineTo(697,buttonY+5);ctx.closePath();ctx.fillStyle=C.paper;ctx.fill();
   actor(t,{x:755,floor:442,alpha:enter,armSides:[-1,-1],faceFacing:-1,mood:s.id>1?'hope':'worried',hand0:[lerp(base.hands[0][0],700,q),lerp(base.hands[0][1],buttonY,q)]});
   const pulse=(t*.85)%1;if(t>1.25)circle(700,buttonY,15+pulse*20,null,`rgba(239,76,80,${.35*(1-pulse)})`,1.5);
  }else if(kind==='loop'){
   const phase=t*.8;for(let i=0;i<3;i++){const a=phase+i*TAU/3;circle(480+155*Math.cos(a),300+80*Math.sin(a),7,i===0?C.red:C.muted);}
   ctx.beginPath();ctx.ellipse(480,300,155,80,0,0,TAU);ctx.strokeStyle=C.line;ctx.lineWidth=2;ctx.stroke();
   const b=poseAt(t,{x:480,floor:420,neck:.06*Math.sin(t*1.4)});actor(t,{x:480,floor:420,gesture:'think',neck:.06*Math.sin(t*1.4),hand1:[b.head[0]+30,b.head[1]+9+1.5*Math.sin(t*5)],hand0:[b.shoulder[0]-18-4*Math.sin(t*2),b.shoulder[1]+45]});
   task(115,195,190,70,s.cards?.[0]??'DEPOIS',0);task(665,195,190,70,s.cards?.[1]??'AMANHÃ',0);
   arrow([320,285],[369,300],C.red);arrow([605,315],[650,290],C.red);
  }else if(kind==='phone'){
   const b=poseAt(t,{x:355,floor:442,body:.15,neck:.1}),tap=(.5+.5*Math.sin(t*7));
   const support=[b.shoulder[0]+36,b.shoulder[1]+30+2*Math.sin(t*2)],tapping=[support[0]+lerp(0,9,tap),support[1]-8];
   const p=actor(t,{x:355,floor:442,body:.15,neck:.1,gesture:'phone',hand1:tapping,hand0:support,lookY:.6}),h=p.hands[0];phone(h[0]+10,h[1]-8,.55,t,true);
   if(plan.character?.style==='day-three-beanie')Character.renderPalm(ctx,p.hands[1]);
   for(let i=0;i<4;i++){const q=smooth(t,i*.35,.8+i*.35),x=lerp(470,560+(i%2)*135,q),y=170+i*54+2*Math.sin(t*1.7-i);ctx.save();ctx.globalAlpha=q*.9;task(x,y,172,44,(s.cards??['SÓ MAIS UM','NOVA MENSAGEM','UM MINUTINHO','DEPOIS EU FAÇO'])[i%4],0,i===Math.floor(t*1.2)%4);ctx.restore();}
   line([[220,444],[825,444]],C.line,1);
  }else if(kind==='desk'){
   desk(t,{x:535});const options={...locomotion('desk',t),floor:442,gesture:t>2.65?'reach':undefined,amount:smooth(t,2.65,3.3),mood:t>3.3?'hope':'worried'};
   if(t>3.3){const b=poseAt(t,options);options.hand1=[b.hands[1][0],b.hands[1][1]+2*Math.sin(t*7)];}actor(t,options);
   if(t>3.3){const q=(t*1.3)%1;circle(560,294,5+q*12,null,`rgba(239,76,80,${1-q})`,1.5);}
   circle(615,295,42+4*Math.sin(t*2),null,C.redDim,1);
  }else if(kind==='choice'){
   task(170,203,270,105,s.cards?.[0]??'ADIAR',0,false);task(520,203,270,105,s.cards?.[1]??'COMEÇAR',smooth(t,1.2,2.2),t>1.2);
   const q=smooth(t,.3,1.2);cursor(lerp(374,665,q),lerp(367,265,q),t>1.2&&t<1.8?(t-1.2)/.6:0);
   text('01',190,167,14,C.muted);text('02',540,167,14,C.red);line([[480,190],[480,330]],C.line,1);
   const b=poseAt(t,{x:480,floor:442}),left=smooth(t,.15,.65)*(1-smooth(t,.85,1.3)),right=smooth(t,.8,1.5);
   actor(t,{x:480,floor:442,armSides:[-1,1],look:t<1?-1:1,mood:t>1.5?'hope':'worried',hand0:[lerp(b.hands[0][0],435,left),lerp(b.hands[0][1],278,left)],hand1:[lerp(b.hands[1][0],528,right),lerp(b.hands[1][1],282+2*Math.sin(t*5),right)]});
  }else if(kind==='task'){
   const labels=s.cards??['ABRIR','FAZER O PRIMEIRO','CONTINUAR'];
   const cycle=t/.95,index=Math.floor(cycle),scroll=Math.min(2,index+smooth(cycle-index,.7,1)),focus=Math.min(2,Math.round(scroll));
   for(let i=0;i<3;i++){const y=262+(i-scroll)*74;if(y<130||y>405)continue;ctx.save();ctx.globalAlpha=Math.max(.15,1-Math.abs(i-scroll)*.45);task(480,y,330,64,labels[i%labels.length],smooth(t,.2+i*.95,.55+i*.95),i===focus);ctx.restore();}
   const b=poseAt(t,{x:450,floor:442}),q=smooth(t,0,.3);actor(t,{x:450,floor:442,mood:'hope',gesture:'reach',hand1:[lerp(b.hands[1][0],506,q),lerp(b.hands[1][1],291+2*Math.sin(t*7),q)]});
   text(`${Math.min(3,Math.max(0,Math.floor((t-.55)/.95)+1))} / 3`,810,429,12,C.red,'right',600);
  }else if(kind==='timer'){
   timer(690,285,108,Math.max(0,t-1)*(s.speed??6),s.seconds??120);
   const b=poseAt(t,{x:440,floor:440}),q=smooth(t,.2,1),press=t>1?1.5*Math.sin(t*5):0;
   rect(490,272+press,90,35,C.red,4);fit(t>1?'FOCO':s.button??'COMEÇAR',535,289+press,76,13,C.paper,'center',700);
   actor(t,{x:440,floor:440,gesture:'reach',mood:t>1?'hope':'alert',hand1:[lerp(b.hands[1][0],499,q),lerp(b.hands[1][1],289+press,q)]});
  }else if(kind==='brain'){
   brain(625,270,t);const b=poseAt(t,{x:328,floor:440,neck:.04*Math.sin(t)});actor(t,{x:328,floor:440,gesture:'think',neck:.04*Math.sin(t),hand1:[b.head[0]+30,b.head[1]+9+1.5*Math.sin(t*4)],hand0:[b.shoulder[0]-18-5*Math.sin(t*2),b.shoulder[1]+43],look:Math.sin(t*2)});
   for(let i=0;i<5;i++){const a=i*1.5+t*.45,p=[625+Math.cos(a)*125,270+Math.sin(a)*87];circle(...p,4,i%2?C.muted:C.red);}
   line([[400,290],[485,265]],C.red,2);
  }else if(kind==='steps'){
   const q=smooth(t,0,3.4);actor(t,{...locomotion('steps',t),floor:439});
   for(let i=0;i<5;i++){const xx=265+i*100;rect(xx,457,70,3,i/5<q?C.red:C.line,1.5);text(String(i+1).padStart(2,'0'),xx+35,478,10,i/5<q?C.paper:C.muted,'center');}
   arrow([260,190],[710,190],C.line,1);
  }else if(kind==='push'){
   const options={...locomotion('push',t),floor:442,gesture:'push',body:.15+.012*Math.sin(t*5),mood:'alert'};actor(t,options);
   const p=poseAt(t,options);
   const wall=p.hands[1][0];rect(wall,222,168,218,C.panel,5,C.paper,2);fit(s.object??'TAREFA',wall+84,297,145,23,C.paper,'center',700);for(let i=0;i<3;i++)line([[wall+25,335+i*20],[wall+130,335+i*20]],C.line,2);
   line([[wall-7,232],[wall-18,220]],C.red,2);
  }else if(kind==='progress'){
   const q=smooth(t,.2,3.2);text(`${Math.round(q*100)}%`,480,245,92,C.paper,'center',800);rect(240,324,480,9,C.line,4);rect(240,324,Math.max(2,480*q),9,C.red,4);for(let i=0;i<6;i++){const xx=240+i*96;line([[xx,347],[xx,354]],C.muted,1);}text(s.label??'UM PASSO DE CADA VEZ',480,387,17,C.muted,'center',600);
   const b=poseAt(t,{x:755,floor:442}),reach=smooth(t,0,.7),clap=smooth(t,3.1,3.7);actor(t,{x:755,floor:442,faceFacing:-1,mood:q>.9?'hope':'alert',armSides:[-1,-1],hand0:[lerp(b.hands[0][0],720,reach),lerp(b.hands[0][1],324,reach)],hand1:[lerp(b.hands[1][0],730,clap),lerp(b.hands[1][1],324,clap)]});
  }else if(kind==='finish'){
   actor(t,{x:315,floor:443,gesture:'celebrate',amount:smooth(t,.25,1.2)*(1-.06*Math.max(0,Math.sin(t*5)))});circle(620,270,90,null,C.line,2);check(620,270,smooth(t,.35,1.3),C.red,48);for(let i=0;i<12;i++){const a=i/12*TAU,q=((Math.max(0,t-.8))%1.3)/1.3;circle(620+Math.cos(a)*(95+30*q),270+Math.sin(a)*(95+30*q),2*(1-q),C.paper);}
  }else{
   actor(t,{x:480,floor:442,gesture:s.gesture??'think',neck:.03*Math.sin(t)});
  }
  ctx.restore();
  if(kind!=='title'&&s.title){const q=smooth(t,0,.45);ctx.save();ctx.globalAlpha=q;fit(s.title.toUpperCase(),480,lerp(131,112,q),820,42,C.paper,'center',800);ctx.restore();}
  if(s.kicker)text(s.kicker.toUpperCase(),480,65,11,C.red,'center',600);
 }
 function background(t){
  ctx.fillStyle=C.bg;ctx.fillRect(0,0,W,H);
  const gr=ctx.createRadialGradient(480,240,20,480,270,600);gr.addColorStop(0,'#132026');gr.addColorStop(1,C.bg);ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.globalAlpha=.18;for(let i=0;i<17;i++)line([[i*60-((t*4)%60),70],[i*60-((t*4)%60),485]],C.line,1);for(let i=0;i<9;i++)line([[45,80+i*48],[915,80+i*48]],C.line,1);ctx.restore();
 }
 function hud(t,s){
  text('PROCRASTINAÇÃO',40,27,10,C.muted,'left',700);text(`ARQUIVO 01 / ${String(s.id??1).padStart(2,'0')}`,920,27,10,C.muted,'right',500);
  if(plan.status?.startsWith('visual_study'))text('ESTUDO VISUAL · ROTEIRO PENDENTE',480,27,9,C.muted,'center');
  circle(44,50,2.6,Math.floor(t*1.5)%2===0?C.red:C.redDim);text('REC',54,50,8,C.muted);
  const tc=[Math.floor(t/60),Math.floor(t%60),Math.floor(t*60)%60].map(v=>String(v).padStart(2,'0')).join(':');text(tc,920,50,9,C.muted,'right');
  rect(40,510,880,2,C.line,1);rect(40,510,880*clamp(t/plan.duration),2,C.red,1);
  const n=plan.scenes.length;for(let i=0;i<n;i++){const x=40+i*880/(n-1);circle(x,511,1.8,i<=(s.id??1)-1?C.red:C.line);}
 }
 function caption(t){
  const row=(plan.captions??[]).find(c=>c.start<=t&&t<c.end);if(!row)return;
  const max=810,size=22;ctx.font=`600 ${size}px DejaVu Sans`;const words=row.text.split(' '),lines=[''];
  for(const word of words){const last=lines.at(-1),next=last?last+' '+word:word;if(ctx.measureText(next).width>max&&last)lines.push(word);else lines[lines.length-1]=next;}
  const y=lines.length>1?452:471;rect(480-max/2-12,y-17,max+24,lines.length*29+8,'rgba(8,12,15,.93)',5);
  lines.forEach((l,i)=>text(l,480,y+i*29,size,C.paper,'center',600));
 }
 function tape(t){if(!vhs)return;
  ctx.save();ctx.globalAlpha=.045;for(let y=0;y<H;y+=3)rect(0,y,W,1,'#000');ctx.globalAlpha=.03;
  const frame=Math.floor(t*12);for(let i=0;i<110;i++){const x=rand(i+frame*113)*W,y=rand(i*3+frame*211)*H;rect(x,y,1+rand(i+7)*2,1,C.paper);}
  const events=plan.tapeEvents??[0,12,25,38];for(const at of events){const q=t-at;if(q>=0&&q<.13){ctx.globalAlpha=.08*(1-q/.13);const y=110+rand(at)*300;rect(0,y,W,5,C.paper);rect(0,y+7,W,2,C.red);}}
  ctx.globalAlpha=.08;const band=(t*42)%600-30;rect(0,band,W,20,'#243d42');ctx.restore();
 }
 function frame(t,opt={}){
  lastActors=[];
  now=clamp(t,0,plan.duration-1/6000);const s=plan.scenes.find(s=>s.start<=now&&now<s.end)||plan.scenes.at(-1);if(!s)throw Error('No scenes');
  ctx.save();ctx.resetTransform();ctx.scale(ctx.canvas.width/W,ctx.canvas.height/H);ctx.globalAlpha=1;ctx.lineWidth=1;ctx.shadowBlur=0;
  background(now);scene(s,now-s.start,now);hud(now,s);if(opt.captions!==false)caption(now);tape(now);
  const cut=now-s.start;if(cut<.14&&s.id>1){ctx.globalAlpha=(1-cut/.14)*.12;rect(0,0,W,H,C.paper);}
  ctx.restore();stats.frames++;return s;
 }
 return {frame,stats,poseAt,plan,lastActors:()=>lastActors,setVhs:value=>vhs=!!value};
}
return {makeFilm,poseAt,locomotion,C,W,H};
});
