/* V5: original multi-character choreography. All times are absolute and seekable. */
(()=>{'use strict';
const {lerp,smooth,clamp,polar,rot,add}=V;
const names=['hero','cyan','amber'],colors={hero:'#18232b',cyan:'#048fa7',amber:'#e87524'};
const titles=["Don't touch that!",'Wrong way up','No brakes!','Zero gravity, big sneeze','Multiball trouble','Perfectly normal.'];
const chapters=titles.map((title,i)=>({start:i*13,end:(i+1)*13,mode:'directed',title}));
// [time, root x, root y, pose, facing, rotation]. Grounded hip is y=732.
const k=(t,x,y=732,p='idle',f=1,r=0)=>({t,x,y,p,f,r});
const score=[
 {hero:[k(0,350),k(3,530,732,'walk'),k(5,570,732,'notice'),k(6.5,550,742,'alarm'),k(8.5,750,732,'walk'),k(9.5,770,768,'crouch'),k(10.1,770,768,'touch'),k(11,760,732,'alarm'),k(13,720,732,'point'),k(16,730,732,'watch'),k(19,810,732,'walk'),k(21,810,732,'point'),k(24.5,810)],
 cyan:[k(0,1100,732,'idle',-1),k(6,1100,732,'notice',-1),k(12,1020,732,'walk',-1),k(14,1010,748,'catch',-1),k(15,1010,732,'idea',-1),k(18,1000,732,'point',-1),k(22,1000,732,'watch',-1),k(24.5,1000,732,'idle',-1)],
 amber:[k(0,1330,732,'idle',-1),k(8,1330,732,'notice',-1),k(15,1270,732,'walk',-1),k(17,1180,732,'run',-1),k(18,1110,680,'jump',-1),k(19,1080,752,'crouch',-1),k(20,1090,732,'alarm',-1),k(22,1180,732,'walk',1),k(24.5,1180,732,'cheer',-1)]},
 {hero:[k(0,530),k(2,610,732,'walk'),k(3,620,751,'crouch'),k(5,620,732,'point'),k(7,580,732,'watch'),k(9,540,732,'brace'),k(10,490,712,'jump'),k(10.5,470,755,'crouch'),k(12,500,732,'alarm'),k(15,560,732,'walk'),k(17,590,742,'push'),k(20,590,732,'cheer'),k(24.5,650,732,'watch')],
 cyan:[k(0,1010,732,'idle',-1),k(3,940,732,'walk',-1),k(5,900,732,'idea',-1),k(7,850,732,'point',-1),k(9,820,742,'brace',-1),k(12,820,742,'brace',-1),k(14,820,732,'point',-1),k(17,830,748,'brace',-1),k(20,850,732,'cheer',-1),k(24.5,930,732,'watch',-1)],
 amber:[k(0,1150,732,'idle',-1),k(3,1010,732,'run',-1),k(6,910,680,'jump',-1),k(7.6,870,720,'crouch',-1),k(8.2,840,620,'fly',-1,-.2),k(10,710,400,'fly',-1,-2),k(11.8,630,620,'fly',-1,-5.8),k(12.5,620,750,'crouch',-1,-6.283185307),k(13.6,620,732,'alarm',-1,-6.283185307),k(15,680,732,'walk',1),k(17,740,672,'jump',1),k(18,780,690,'reach',1),k(20,920,732,'walk',1),k(24.5,1070,732,'cheer',-1)]},
 {hero:[k(0,440),k(3,560,732,'walk'),k(4,610,753,'push'),k(7,610,753,'push'),k(8,560,732,'alarm'),k(10,610,753,'push'),k(15,870,753,'push'),k(17,870,732,'watch'),k(19,850,700,'jump'),k(20,820,732,'alarm'),k(23,850,732,'idea'),k(24.5,850)],
 cyan:[k(0,1040,732,'idle',-1),k(3,1000,732,'point',-1),k(6,930,732,'walk',-1),k(8,900,753,'pull',-1),k(10,770,753,'pull',-1),k(15,1030,753,'pull',-1),k(16,1060,732,'alarm',-1),k(19,1080,732,'point',-1),k(22,1040,732,'cheer',-1),k(24.5,1040,732,'idle',-1)],
 amber:[k(0,1240,732,'idle',-1),k(3,1170,732,'run',-1),k(5,1060,700,'jump',-1),k(6,1010,747,'press',-1),k(8,1010,747,'press',-1),k(10,1090,732,'alarm',-1),k(12,1180,732,'run',1),k(15,1250,690,'jump',1),k(16,1250,750,'crouch',-1),k(19,1200,732,'point',-1),k(21,1150,732,'walk',-1),k(24.5,1150,732,'watch',-1)]},
 {hero:[k(0,620),k(2,620,732,'notice'),k(4,650,650,'float'),k(7,710,520,'swim',1,.3),k(10,800,470,'reach',1,.45),k(13,860,490,'float',1,.2),k(16,900,560,'reach',1,0),k(18,880,640,'float'),k(20,860,750,'crouch'),k(21.5,860,732,'idle'),k(24.5,860,732,'point')],
 cyan:[k(0,950,732,'idle',-1),k(3,950,700,'float',-1),k(6,990,600,'swim',-1,-.15),k(9,1030,510,'reach',-1,-.3),k(12,1010,500,'float',-1,-.2),k(15,970,550,'reach',-1,-.1),k(18,1000,650,'float',-1),k(20.5,1000,750,'crouch',-1),k(22,1000,732,'cheer',-1),k(24.5,1000,732,'idle',-1)],
 amber:[k(0,1190,732,'idle',-1),k(3,1180,680,'alarm',-1),k(6,1120,510,'swim',-1,.5),k(9,1000,360,'fly',-1,2),k(11,880,380,'fly',-1,3.7),k(13,760,470,'reach',-1,6.1),k(15,710,550,'float',-1,6.283185307),k(18,720,650,'float',1,6.283185307),k(20.3,720,754,'crouch',1,6.283185307),k(22,720,732,'alarm',1,6.283185307),k(24.5,720,732,'cheer',1,6.283185307)]},
 {hero:[k(0,430),k(3,540,732,'run'),k(4,580,760,'crouch'),k(5,640,640,'jump'),k(6.5,720,570,'fly',1,.3),k(8,820,730,'crouch'),k(9,840,732,'point'),k(12,900,732,'walk'),k(14,900,732,'alarm'),k(15,850,690,'jump',-1),k(16,800,750,'crouch',-1),k(18,850,732,'idea'),k(20,860,732,'cheer'),k(24.5,860,732,'watch')],
 cyan:[k(0,1000,732,'idle',-1),k(3,1020,732,'point',-1),k(7,1050,732,'walk',1),k(10,1090,741,'press',1),k(13,1090,741,'press',1),k(14,1090,732,'alarm',-1),k(17,1050,732,'watch',-1),k(20,1040,732,'cheer',-1),k(24.5,1040,732,'point',-1)],
 amber:[k(0,1250,732,'idle',-1),k(3,1240,732,'point',-1),k(6,1200,732,'run',-1),k(8,1150,755,'crouch',-1),k(9,1100,590,'fly',-1,-.3),k(11,990,430,'fly',-1,-1.9),k(13,900,520,'fly',-1,-4.4),k(14.5,840,750,'crouch',-1,-6.283185307),k(16,850,732,'alarm',-1,-6.283185307),k(18,800,732,'walk',-1),k(20,760,732,'cheer',1),k(24.5,760,732,'idle',1)]},
 {hero:[k(0,540),k(3,610,732,'walk'),k(5,650,741,'push'),k(8,650,741,'push'),k(10,710,732,'walk'),k(12,800,732,'run'),k(14,920,732,'run'),k(16,1020,732,'point'),k(19,1020,732,'cheer'),k(21,1020,732,'idle',-1),k(22.2,1020,754,'protect',-1),k(23.5,1020,732,'point',-1),k(24.95,1020,732,'cheer',-1)],
 cyan:[k(0,830,732,'idle',-1),k(3,800,732,'idea',-1),k(5,760,741,'push',-1),k(8,760,741,'push',-1),k(10,820,732,'walk'),k(12,900,732,'run'),k(14,1030,732,'run'),k(16,1150,732,'cheer',-1),k(21,1150,732,'notice',-1),k(22.4,1150,744,'crouch',-1),k(24.95,1150,732,'cheer',-1)],
 amber:[k(0,410,732,'idle'),k(3,460,732,'point'),k(5,480,745,'press'),k(8,480,745,'press'),k(9,550,732,'run'),k(11,700,732,'run'),k(13,850,670,'jump'),k(14.5,930,750,'crouch'),k(16,950,732,'cheer'),k(19,950,732,'idea'),k(21,950,732,'point'),k(22.4,950,732,'alarm'),k(24.95,950,732,'cheer')]}
];
for(const sc of [1,4]){let spin=false;for(const key of score[sc].amber){if(key.r < -6)spin=true;if(spin&&key.r===0)key.r=-Math.PI*2;}}
function sample(keys,t){let i=0;while(i<keys.length-2&&keys[i+1].t<=t)i++;const a=keys[i],b=keys[Math.min(i+1,keys.length-1)],u=smooth((t-a.t)/Math.max(.001,b.t-a.t));return {x:lerp(a.x,b.x,u),y:lerp(a.y,b.y,u),r:lerp(a.r,b.r,u),p:a.p,q:b.p,u,f:t<(a.t+b.t)/2?a.f:b.f,a,b};}
// Explicit pose vocabulary: mirrored body, fixed joint identity, antiphase hands and feet.
const poses={idle:[-90,-90,-12,44,14,44,-16,78,16,78],notice:[-96,-67,-18,36,23,27,-17,78,17,78],watch:[-98,-70,-16,36,23,22,-20,78,20,78],point:[-94,-80,-14,44,48,-12,-17,78,17,78],idea:[-90,-75,-14,44,27,-33,-17,78,17,78],alarm:[-105,-92,-36,-8,35,-17,-27,73,27,73],cheer:[-92,-90,-30,-38,30,-38,-21,78,21,78],crouch:[-52,-95,22,29,39,18,-27,39,27,39],touch:[-42,-70,28,27,42,26,-27,39,27,39],push:[-62,-90,42,17,46,2,-28,57,28,57],pull:[-68,-80,43,12,46,-1,-35,57,-5,57],press:[-61,-90,37,28,42,16,-28,65,28,65],brace:[-108,-90,-35,24,34,18,-29,65,29,65],reach:[-88,-80,-30,-26,45,-21,-23,67,23,67],catch:[-76,-90,42,19,44,2,-22,65,22,65],jump:[-77,-90,-33,-15,33,-24,-24,56,32,49],fly:[-90,-90,-39,-15,38,10,-30,60,32,53],float:[-90,-88,-33,24,33,24,-25,66,25,66],swim:[-90,-90,-40,2,40,2,-28,62,28,62],protect:[-80,-90,-15,-35,16,-35,-25,56,25,56],walk:[-86,-88,-14,43,14,43,-16,78,16,78],run:[-72,-87,-25,24,25,24,-24,72,24,72]};
function path(points,t){if(t<=points[0][0])return points[0].slice(1);let i=0;while(i<points.length-2&&points[i+1][0]<=t)i++;const a=points[i],b=points[i+1],u=clamp((t-a[0])/(b[0]-a[0]));return a.slice(1).map((v,j)=>lerp(v,b[j+1],u));}
function orb(scene,q){const P=[
 [[0,820,370],[4,820,370],[5.3,820,794],[5.9,820,700],[6.5,820,794],[6.85,820,760],[7.2,820,794],[10,820,794],[12.8,980,720],[14,970,735],[16,970,735],[18,1100,790],[20,1040,794],[25,1040,794]],
 [[0,1020,794],[6,1020,794],[8,1020,740],[10,1100,590],[13,1160,480],[16,1170,540],[18,1130,690],[19,1110,794],[25,1110,794]],
 [[0,1210,794],[5,1210,794],[9,1260,700],[14,1280,640],[18,1170,620],[21,1130,794],[25,1130,794]],
 [[0,1090,794],[2,1090,794],[5,1100,620],[8,1100,450],[11,970,400],[13,820,440],[15,770,550],[18,850,700],[20,850,794],[25,850,794]],
 [[0,620,794],[3,620,794],[4.5,670,680],[6,780,500],[7.8,950,370],[9,1120,470],[10.5,1190,600],[12,1080,650],[13.5,930,510],[15,760,540],[16,660,680],[17,750,750],[18,960,650],[19,1190,660],[20,1190,660],[25,1190,660]],
 [[0,1150,600],[4,1150,600],[7,1150,620],[9,1140,640],[13,1170,600],[17,1220,590],[19,1220,590],[20.5,1018,475],[21.4,1018,645],[22,1040,690],[23,1120,780],[25,1140,794]]
 ];const p=path(P[scene],q);return{x:p[0],y:p[1],r:16};}
function cube(scene,q){let p=[710,775];if(scene===2)p=path([[0,690,775],[10,690,775],[15,950,775],[17,1030,775],[18,1010,755],[20,970,775],[25,970,775]],q);if(scene===2&&q>=10&&q<15)p[0]=lerp(690,950,smooth((q-10)/5));return {x:p[0],y:p[1],size:70};}
function snapshot(t){t=clamp(t,0,77.99999);const scene=Math.floor(t/13),local=t-scene*13,q=TempoV5.oldAt(local);return TempoV5.state({t,scene,q,local,gag:false,actors:Object.fromEntries(names.map(n=>[n,sample(score[scene][n],q)])),orb:orb(scene,q),cube:cube(scene,q),leverAngle:scene===1?path([[0,-.05],[7,-.05],[7.8,.25],[8.2,-.35],[11,0],[16,0],[17,.17],[20,0],[25,0]],q)[0]:0,bridge:scene===5?smooth((q-5)/4):0,charge:scene===4?smooth((q-17)/2):scene===5?1:0},sample,path);}
const events=[];function event(scene,q,type,x,y=810,power=1){events.push({t:scene*25+q,type,x,y,power});}
[[5.3,820],[6.5,820],[7.2,820]].forEach(([q,x])=>event(0,q,'bounce',x,794));event(0,10,'pulse',820,794);event(0,14,'catch',970,735);event(0,19,'land',1080);
[7.8,12.5,17,19].forEach(q=>event(1,q,q===7.8?'spring':q===12.5?'land':'mechanism',q===7.8?870:620));event(1,20,'chime',1130,650);
event(2,4,'heavy',690);event(2,6,'switch',1050,770);event(2,10,'roll',760);event(2,17,'heavy',1030);event(2,20,'chime',970);
event(3,2,'gravity',1090,794);event(3,10,'whoosh',950,450);event(3,13,'catch',800,440);[20,20.3,20.5].forEach((q,i)=>event(3,q,'land',860+i*70));
[4.5,7.8,10.5,13.5,16,17,19].forEach((q,i)=>event(4,q,i===6?'charge':'bounce',[670,950,1190,930,660,750,1190][i],i===6?660:600));event(4,14.5,'land',840);
event(5,5,'switch',480);event(5,9,'bridge',850);event(5,14.5,'land',930);event(5,17,'resolve',1220,590);event(5,21.4,'bonk',1018,645);event(5,23.6,'chime',1050,650);
for(let sc=0;sc<6;sc++)for(const n of names){const keys=score[sc][n];for(let i=0;i<keys.length-1;i++){let a=keys[i],b=keys[i+1];if(Math.abs(b.x-a.x)<45||Math.min(a.y,b.y)<720)continue;for(let t=a.t+.3;t<b.t;t+=.43){const p=sample(keys,t);event(sc,t,'step',p.x,810,n==='amber'?.8:n==='cyan'?.65:1);}}}
for(const e of events){const sc=Math.floor(e.t/25),q=e.t-sc*25;e.t=sc*13+TempoV5.forward(q);}
events.push(...TempoV5.extraEvents);
for(let sc=0;sc<6;sc++)for(const name of names){const keys=TempoV5.gags[sc][name];for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(Math.abs(b.x-a.x)<40||Math.min(a.y,b.y)<725)continue;for(let q=a.t+.12;q<b.t;q+=.17){const p=sample(keys,q);events.push({t:sc*13+q,type:'step',x:p.x,y:810,power:.8,gag:true});}}}
events.sort((a,b)=>a.t-b.t);
// New adapter feeds the unchanged V3 record function and original FK renderer.
function poseActor(name,t){const s=snapshot(t),a=s.actors[name],clock=s.gag?s.local:s.q,p=poses[a.p].map((v,i)=>lerp(v,poses[a.q][i],a.u)),mid=(a.a.t+a.b.t)/2,turnHalf=Math.min(.3,(a.b.t-a.a.t)/2),dir=a.a.f===a.b.f?a.f:lerp(a.a.f,a.b.f,smooth((clock-mid+turnHalf)/(2*turnHalf))),pole=a.f;
 // Blend limb targets on polar arcs around each joint; never pass a hand through its shoulder.
 for(const i of [2,4,6,8]){const from=poses[a.p],to=poses[a.q],r0=Math.hypot(from[i],from[i+1]),r1=Math.hypot(to[i],to[i+1]),ang0=Math.atan2(from[i+1],from[i]);let delta=Math.atan2(to[i+1],to[i])-ang0;while(delta>Math.PI)delta-=Math.PI*2;while(delta<-Math.PI)delta+=Math.PI*2;const radius=lerp(r0,r1,a.u),ang=ang0+delta*a.u;p[i]=Math.cos(ang)*radius;p[i+1]=Math.sin(ang)*radius;}
 const walkWeight=(a.p==='walk'||a.p==='run'?1-a.u:0)+(a.q==='walk'||a.q==='run'?a.u:0),cycle=a.x/18,runWeight=(a.p==='run'?1-a.u:0)+(a.q==='run'?a.u:0);
 const gait=Math.sin(cycle)*walkWeight,raise=Math.abs(Math.cos(cycle))*walkWeight;
 // Toe lift remains above the floor; body bob travels with the supporting foot.
 const bob=walkWeight*1.6*Math.cos(cycle*2)+1.1*Math.sin(t*2.3+names.indexOf(name));
 function axis(deg,len){const x=Math.cos(deg*Math.PI/180)*dir,y=Math.sin(deg*Math.PI/180),n=Math.hypot(x,y);return rot([x/n*len,y/n*len],a.r);}
 let turn=0;const keys=s.gag?TempoV5.gags[s.scene][name]:score[s.scene][name];for(let i=0;i<keys.length-1;i++)if(keys[i].f!==keys[i+1].f){const mid=(keys[i].t+keys[i+1].t)/2;turn=Math.max(turn,1-smooth(Math.abs(clock-mid)/Math.min(.28,(keys[i+1].t-keys[i].t)/2)));}
 const origin=[a.x,a.y-bob-(a.y>720?Math.max(0,a.y-bob-724)*turn:0)],shoulder=add(origin,axis(p[0],RigAdapter.length[1]));
 const head=add(shoulder,axis(p[1],RigAdapter.length[2]));
 function mirror(x,y,index){if(a.a.f===a.b.f)return[x*dir,y];const r=Math.hypot(x,y),base=poses[a.p],ref=Math.atan2(base[index+1],base[index]);let alpha=Math.atan2(y,x);while(alpha-ref>Math.PI)alpha-=Math.PI*2;while(alpha-ref<-Math.PI)alpha+=Math.PI*2;
 const angle=(v,f)=>f===1?v:Math.PI-v,start=angle(alpha,a.a.f),end=angle(alpha,a.b.f),referenceDelta=angle(ref,a.b.f)-angle(ref,a.a.f);let shortest=referenceDelta;while(shortest>Math.PI)shortest-=Math.PI*2;while(shortest<-Math.PI)shortest+=Math.PI*2;
 const delta=end-start+(shortest-referenceDelta),u=smooth((clock-mid+turnHalf)/(2*turnHalf)),ang=start+delta*u;return[Math.cos(ang)*r,Math.sin(ang)*r];}
 let hands=[mirror(p[2],p[3],2),mirror(p[4],p[5],4)],feet=[mirror(p[6],p[7],6),mirror(p[8],p[9],8)];
 for(let i=0;i<2;i++){const sign=i?1:-1;hands[i][0]+=sign*gait*(22+6*runWeight)*dir;hands[i][1]-=Math.abs(gait)*(2+6*runWeight);feet[i][0]-=sign*gait*(18+4*runWeight)*dir;feet[i][1]-=Math.max(0,sign*Math.cos(cycle))*(14+8*runWeight)*walkWeight;}
 if(a.p==='swim'||a.q==='swim'){const w=(a.p==='swim'?1-a.u:0)+(a.q==='swim'?a.u:0);for(let i=0;i<2;i++){hands[i][1]+=Math.sin(t*6+i*Math.PI)*20*w;feet[i][0]+=Math.sin(t*7+i*Math.PI)*14*w;}}
 hands=hands.map(v=>add(shoulder,rot(v,a.r)));feet=feet.map(v=>add(origin,rot(v,a.r)));
 const plantWeight=walkWeight*(1-smooth(Math.abs(a.r)/.2))*(1-smooth(Math.abs(a.y-732)/12));if(plantWeight>0){for(let i=0;i<2;i++){const off=i*.5,phase=a.x/80+off,cy=Math.floor(phase),v=phase-cy,plant=(cy+.25-off)*80,sw=clamp((v-.6)/.4),target=[v<.6?plant:lerp(plant,plant+80,smooth(sw)),807-(v<.6?0:Math.sin(Math.PI*sw)*(16+8*runWeight))];feet[i]=feet[i].map((value,k)=>lerp(value,target[k],plantWeight));}}
 for(let i=0;i<2;i++){feet[i][1]=Math.min(807,feet[i][1]);let suppression=1;for(let j=0;j<keys.length-1;j++)if(keys[j].f!==keys[j+1].f){const center=(keys[j].t+keys[j+1].t)/2,half=Math.min(.3,(keys[j+1].t-keys[j].t)/2);suppression=Math.min(suppression,smooth((Math.abs(clock-center)-half-.1)/.15));}const armWeight=plantWeight*suppression;if(armWeight>0){const target=[shoulder[0]-(feet[i][0]-origin[0])*.85,shoulder[1]+(43-10*runWeight)];hands[i]=hands[i].map((v,k)=>lerp(v,target[k],armWeight));}}
 const contact=[];
 function bind(i,target,weight=1){const root=i<2?shoulder:origin,limit=i<2?RigAdapter.length[3]*2:RigAdapter.length[7]*2;const d=Math.hypot(target[0]-root[0],target[1]-root[1]);let arr=i<2?hands:feet,j=i%2;arr[j]=arr[j].map((v,k)=>lerp(v,target[k],weight));if(weight>.999&&d<limit-.2)contact.push({node:[4,6,8,10][i],target});}
 function windowWeight(from,to){if(s.gag)return 0;return smooth((s.q-from)/.3)*(1-smooth((s.q-to)/.3));}
 // Deliberate hand-to-object moments, all targets within the arm's fixed reach.
 if(s.scene===0&&name==='hero'){const w=windowWeight(9.5,10.1);if(w)bind(1,[s.orb.x-12,s.orb.y-12],w);}
 if(s.scene===1&&(name==='hero'||name==='cyan')){const w=windowWeight(16.8,17.6),x=name==='hero'?620:810,dx=x-780;const target=[780+Math.cos(s.leverAngle)*dx,750+Math.sin(s.leverAngle)*dx-8];if(w){bind(0,target,w);bind(1,[target[0]+8,target[1]],w);}}
 if(s.scene===2&&name==='hero'){const w=windowWeight(4,6.8)+windowWeight(10,14.7);if(w){bind(0,[s.cube.x-35,s.cube.y-18],Math.min(1,w));bind(1,[s.cube.x-35,s.cube.y-29],Math.min(1,w));}}
 if(s.scene===2&&name==='cyan'){const w=windowWeight(10,14.7);if(w){bind(0,[s.cube.x+35,s.cube.y-34],w);bind(1,[s.cube.x+35,s.cube.y-25],w);}}
 if(s.scene===5&&(name==='hero'||name==='cyan')){const w=windowWeight(5,7.7),handle=name==='hero'?[700,705]:[710,705];if(w)bind(1,handle,w);}
 const nodes=[origin,shoulder,head];
 function ik(root,target,len,side,extension=0,exact=false){const dx=target[0]-root[0],dy=target[1]-root[1],raw=Math.hypot(dx,dy),limit=len*2-.001,soft=raw>limit-6?(limit-6)+6*(1-Math.exp(-(raw-limit+6)/6)):raw,dist=clamp(exact?raw:lerp(soft,raw,extension),.001,limit),base=Math.atan2(dy,dx),bend=Math.acos(dist/(2*len));return [[root[0]+Math.cos(base+side*bend)*len,root[1]+Math.sin(base+side*bend)*len],[root[0]+Math.cos(base)*dist,root[1]+Math.sin(base)*dist]];}
 // Blend through full extension when facing changes, so the elbow/knee pole never snaps.

 for(let i=0;i<4;i++){const root=i<2?shoulder:origin,len=i<2?RigAdapter.length[3]:RigAdapter.length[7],arr=i<2?hands:feet,j=i%2;if(turn){const d=[arr[j][0]-root[0],arr[j][1]-root[1]],norm=Math.hypot(...d),spread=rot(d.map(v=>v/norm*(2*len-.001)),(i%2?1:-1)*(i<2?.25:.13)*turn),target=add(root,spread);arr[j]=arr[j].map((v,k)=>lerp(v,target[k],turn));}const z=ik(root,arr[j],len,i<2?pole:-pole,turn,contact.some(ct=>ct.node===[4,6,8,10][i]));nodes.push(...z);}
 return{nodes,head,r:RigAdapter.radius,contacts:contact};
}
const data={width:1920,height:1080,duration:78,cast:Object.fromEntries(names.map(n=>[n,{rgb:colors[n],hollow:false}])),tracks:{},scenes:[],weapons:[],effects:[]};
for(const n of names){const track=[];for(let f=0;f<=9360;f++){const t=Math.min(77.99999,f/120),p=poseActor(n,t),rec=RigAdapter.record(p,t,track.at(-1));rec.segment=Math.min(5,Math.floor(t/13));rec.contactLocked=p.contacts.length>0;track.push(rec);}// A 33ms angular follow-through removes one-frame wrist jolts in accelerated turns.
 const raw=track.map(p=>p.angles.slice()),weights=[1,2,3,2,1];for(let f=2;f<track.length-2;f++){if(track.slice(f-2,f+3).some(p=>p.contactLocked||p.segment!==track[f].segment))continue;for(let j=3;j<=6;j++)track[f].angles[j]=weights.reduce((sum,w,i)=>sum+w*raw[f+i-2][j],0)/9;}data.tracks[n]=track;}
window.rand=n=>{const v=Math.sin(n*78.233)*43758.5453;return v-Math.floor(v);};
window.TrioStory={names,colors,chapters,score,events,snapshot,poseActor,path,duration:78};window.FILM_DATA=data;
})();
