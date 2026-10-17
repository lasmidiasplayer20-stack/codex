(function(r,f){if(typeof module==='object')module.exports=f(require('./character'),require('./chaos'),require('./story.json'));else r.DayThreeFilm=f(r.CharacterRig,r.DayZeroChaos,r.DayThreeStory)})(globalThis,function(Rig,Chaos,S){
'use strict';
const W=1280,H=720,FPS=60,DURATION=S.duration;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n)),mix=(a,b,p)=>a+(b-a)*p,ease=p=>{p=clamp(p);return p*p*(3-2*p)},hash=n=>{let v=Math.sin(n*61.17+3.14)*17267.8;return v-Math.floor(v)};
function box(c,x,y,w,h,col,r=0){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill()}
function line(c,p,col='#718c90',w=2){c.beginPath();p.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke()}
function poly(c,p,col){c.beginPath();p.forEach((q,i)=>i?c.lineTo(...q):c.moveTo(...q));c.closePath();c.fillStyle=col;c.fill()}
function text(c,s,x,y,size=20,col='#eee2c7',align='left'){c.font=`${size>=28?'700':'400'} ${size}px Film,Arial`;c.fillStyle=col;c.textAlign=align;c.fillText(s,x,y)}
function oval(c,x,y,rx,ry,col){c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fillStyle=col;c.fill()}
const palettes={hero:{colors:{teal:'#548d88'}},elder:{colors:{teal:'#9488a4'},rig:{nearSleeve:'#ab98b2',farSleeve:'#645d78'}},worker:{colors:{teal:'#b09058'},rig:{nearSleeve:'#b89e69',farSleeve:'#73613f'}},police:{colors:{teal:'#54667d'},rig:{nearSleeve:'#627995',farSleeve:'#354d63'}},rosa:{colors:{teal:'#b46d60',sideTorso:'#7c514d'},rig:{nearSleeve:'#c78470',farSleeve:'#714d4b'}},infected:{colors:{teal:'#637d6d',cream:'#b2b9a0'},rig:{nearSleeve:'#7d9180',farSleeve:'#3a5b51'}}};
let currentActors=[];
function actor(c,who,x,y,s,t,mode='idle',o={}){
 c.save();c.globalAlpha=.26;oval(c,x,y+3,31*s,5*s,'#071c24');c.restore();
 const base=palettes[who]||{},custom=o.palette||{},sides={hero:'#447c77',elder:'#6a627d',worker:'#7c6b49',police:'#3c5268',rosa:'#7c514d',infected:'#3e6258'};
 // Supply all optional color keys on every draw: the preserved rig's palette
 // restoration does not delete keys first introduced by a different actor.
 o={...o,palette:{colors:{sideTorso:sides[who]||'#506b68',nearTrouser:'#b2b4a9',...base.colors,...custom.colors},rig:{...base.rig,...custom.rig}}};
 if(o.supportSlope!==undefined){const p=Rig.pose(t,mode,{cycle:mode==='run'?122:88,...o});o={...o,feet:p.legs.map(l=>[l.end[0],l.end[1]+o.supportSlope*l.end[0]*(o.facing||1)])}}
 const g=Rig.renderActor(c,x,y,s,t,mode,{variant:who==='rosa'?'woman':who,palette:palettes[who],bag:who==='hero',fear:who==='infected'?.35:.55,mood:who==='rosa'?'hope':'scared',mouthOpen:.12,cycle:mode==='run'?122:88,lean:mode==='run'?.22:0,...o});
 currentActors.push({who,mode,...g});
 if(who==='elder'&&t>=at('prepare')+8){const h=g.right;box(c,h[0]-8*s,h[1]-5*s,17*s,12*s,'#b8b19a',4*s);oval(c,h[0]+2*s,h[1]+8*s,6*s,4*s,'#8d8c74')}
 if(who==='hero'&&S.scenes.find(q=>t>=q.start&&t<q.end)?.id<22){const q=g.right;c.save();c.translate(q[0],q[1]);c.rotate(.35);box(c,-8*s,-7*s,13*s,9*s,'#c9bba3',2*s);line(c,[[-6*s,-6*s],[4*s,-1*s]],'#996f62',1.5*s);c.restore()}
 return g;
}
function radio(c,x,y,s,t,on=true){c.save();c.translate(x,y);c.scale(s,s);box(c,-65,-35,130,73,'#6d8c7c',7);box(c,-53,-24,61,22,on?'#efc88b':'#314b49',2);if(on)text(c,'87.0',-45,-8,15,'#493f2e');for(let i=0;i<6;i++)line(c,[[20,-23+i*8],[52,-23+i*8]],'#2f4947',3);oval(c,-29,20,11,11,'#c2a47a');line(c,[[-29,20],[-22,12]],'#47584c',2);line(c,[[-43,-33],[-62,-104]],'#a8b7ad',3);c.restore()}
function lamp(c,x,y,t,red=false){box(c,x-22,y-8,44,13,red?'#b45a4e':'#c7b68a',3);c.save();c.globalAlpha=red?.07+.04*Math.sin(t*5):.055;poly(c,[[x-17,y+5],[x+17,y+5],[x+220,y+410],[x-220,y+410]],red?'#ff5b40':'#f2d5a0');c.restore()}
function buildings(c,t,night=false){
 const g=c.createLinearGradient(0,-200,0,500);g.addColorStop(0,night?'#081621':'#172d3b');g.addColorStop(1,night?'#30444a':'#a79275');c.fillStyle=g;c.fillRect(-700,-400,2700,1400);
 for(let i=0;i<9;i++){let x=i*176-180,top=50+hash(i+4)*130;box(c,x,top,168,450,'#273f4b');for(let j=0;j<4;j++)for(let k=0;k<5;k++)box(c,x+16+j*40,top+25+k*52,18,29,(i+j+k)%9===0?'#b58f57':'#3c5660');}
 for(let i=0;i<4;i++){Chaos.smoke(c,150+i*350,280,1.1,t,80+i);Chaos.fire(c,150+i*350,337,.32,t,80+i)}
}
function road(c,t,night=false,evac=false){buildings(c,t,night);box(c,-500,388,2300,350,'#3e5356');line(c,[[-500,389],[1800,389]],'#8a9283',6);for(let i=0;i<10;i++)box(c,i*160-80,474,75,4,'#a3a08b');
 Chaos.vehicle(c,197,485,.36,t,{type:'bus',damage:1,burning:true,seed:5});Chaos.vehicle(c,1085,480,.3,t,{type:'ambulance',damage:1,seed:9});
 for(let i=0;i<9;i++){const dir=i%3===0?-1:1,sp=evac?22:59;let x=((i*191+t*sp*dir+4000)%1700)-200;actor(c,i%4===0?'infected':'civilian',x,436+(i%2)*30,.37+(i%2)*.055,t+i,i%4===0?'walk':'run',{variant:i%4===0?'infected':i%3===0?'woman':'civilian',facing:dir,travel:t*sp/.4,cycle:110,palette:i%4===0?palettes.infected:{colors:{teal:['#8e7966','#82947b','#78899a'][i%3]}}})}
}
function water(c,t,y=581,force=0){const g=c.createLinearGradient(0,y,0,900);g.addColorStop(0,'#42676d');g.addColorStop(1,'#102b39');c.fillStyle=g;c.fillRect(-600,y,2500,700);for(let i=0;i<27;i++){const x=((i*137+t*(13+force*45))%1800)-200,yy=y+12+hash(i+3)*190;line(c,[[x,yy],[x+30+hash(i)*70,yy-2]],i%4?'#567b7d':'#a3a38a',i%4?1.4:2.2)}
 if(force>0)for(let i=0;i<26;i++){let p=(t*1.6+hash(i))%1,x=110+hash(i+4)*180+p*60,y2=y-14+110*p;oval(c,x,y2,3+force*3,1.5,'#9eaea0')}
}
function farShelter(c,t,blink=false){box(c,870,184,348,285,'#4e6768');box(c,892,208,305,30,'#72847c');text(c,'CANAL RELAY',902,228,16,'#d2c8a9');for(let i=0;i<3;i++)box(c,892+i*101,260,76,101,'#1c3641');box(c,922,380,130,88,'#233f44');if(blink){box(c,1094,272,62,74,'#d2b37a');actor(c,'rosa',1122,345,.23,t,'hope',{facing:-1,reach:[50,-225]});if(Math.sin(t*3)>0){c.save();c.globalAlpha=.11;poly(c,[[1126,308],[640,420],[713,495]],'#ffe0a1');c.restore()}}line(c,[[856,469],[1247,469]],'#9b9f88',6)}
function bridge(c,t,evac=false){
 road(c,t,false,evac);poly(c,[[-100,470],[373,470],[468,513],[598,516],[740,469],[1410,469],[1410,523],[751,523],[644,567],[486,564],[354,519],[-100,519]],'#586d6c');line(c,[[-100,465],[377,465],[422,495]],'#a0a48f',5);line(c,[[766,465],[1410,465]],'#a0a48f',5);for(let i=0;i<9;i++){let x=i*160;line(c,[[x,443],[x,469]],'#788c84',4)}box(c,441,489,297,57,'#172d36');Chaos.vehicle(c,180,470,.32,t,{type:'bus',damage:1,seed:5});
 if(evac){for(let i=0;i<7;i++){const x=170+i*68+Math.min(16,t%50)*3;actor(c,'civilian',x,469,.30,t+i,'walk',{variant:i%3?'civilian':'woman',facing:1,travel:t*24/.3,palette:{colors:{teal:['#bd9270','#758e8c','#8d7b92'][i%3]}}})}Chaos.vehicle(c,442,475,.27,t,{damage:1,seed:41});const lift=span(t,at('crowds')+.2,at('crowds')+3.5);actor(c,'civilian',550,479,.46,t,'reach',{variant:'civilian',reach:[64,-226],mood:'scared',palette:{colors:{teal:'#ae8c65'}}});actor(c,'civilian',mix(578,605,lift),mix(479,435,lift),.25,t,'hope',{variant:'civilian',reach:[48,-199],mood:'scared',palette:{colors:{teal:'#9b9d78'}}})}
}
function canal(c,t,opts={}){
 const night=opts.night;buildings(c,t,night);box(c,-500,367,2300,75,'#344c55');line(c,[[-500,361],[1800,361]],'#768884',5);for(let i=0;i<5;i++){let x=((i*297-t*33)%1600+1600)%1600-140;actor(c,'infected',x,370,.32,t+i,'walk',{travel:t*33/.32,facing:-1,lean:.16})}for(let i=0;i<3;i++){let x=(i*493+t*85)%1800-250;actor(c,'civilian',x,400,.36,t+i,'run',{travel:t*85/.36,variant:i%2?'woman':'civilian',facing:1,palette:{colors:{teal:['#b18b68','#86968a','#91829a'][i]}}});if(i===1)actor(c,'infected',x-94,401,.36,t+.4,'run',{travel:t*86/.36,lean:.23})}farShelter(c,t,opts.blink);
 box(c,-100,442,360,253,'#31474e');for(let i=0;i<7;i++)line(c,[[-100,475+i*36],[260,475+i*36]],'#4b6263',2);box(c,0,450,186,180,'#172d35');text(c,'PUMP 04',15,477,17,'#afb29d');
 const level=mix(582,645,opts.drain||0);water(c,t,level,opts.drain||0);
 poly(c,[[130,634],[1045,540],[1114,562],[191,661]],'#6f8581');line(c,[[130,633],[1045,540]],'#b1b49e',4);for(let i=0;i<13;i++){const x=155+i*73,y=643-(x-155)*.103;line(c,[[x,y-96],[x,y]],'#526f73',4);line(c,[[x-20,y-94],[x+60,y-103]],'#a2b0a2',3);line(c,[[x-15,y+5],[x+50,y-2]],'#374e54',1)}
 if((opts.drain||0)<.5){c.save();c.globalAlpha=.67;water(c,t,level);c.restore()}
 if(opts.gate){const shake=opts.threat?Math.sin(t*19)*2:0,gw=opts.open?12:93;box(c,163+shake,385,13,253,'#96a59a');for(let i=0;i<5;i++)line(c,[[176+shake+i*gw/5,402],[176+shake+i*gw/5,632]],'#7e958c',5);line(c,[[176+shake,405],[176+gw+shake,405],[176+gw+shake,631],[176+shake,631]],'#82988e',7)}
}
function rain(c,t,amount=.55){c.save();c.globalAlpha=amount;for(let i=0;i<55;i++){let x=(hash(i)*1600+t*38)%1550-150,y=(hash(i+45)*1000+t*(240+hash(i)*140))%1000-150;line(c,[[x,y],[x-6,y+22]],'#adc4c1',.75)}c.restore()}
function pump(c,t,night=false){box(c,-500,-300,2300,1400,'#253e46');box(c,-500,581,2300,600,'#3c5356');for(let i=0;i<8;i++){line(c,[[i*180,581],[i*200-70,900]],'#4b6667',1);line(c,[[i*180,-100],[i*180,581]],'#3e5960',3)}box(c,810,92,400,309,'#101f2c');c.save();c.beginPath();c.rect(820,101,378,286);c.clip();c.translate(791,90);c.scale(.37,.51);canal(c,t,{night,blink:true});c.restore();line(c,[[1005,94],[1005,403]],'#708a88',6);line(c,[[810,259],[1206,259]],'#708a88',6);
 box(c,35,138,230,442,'#526a69');box(c,55,165,190,383,'#223b42');box(c,196,354,27,8,'#b6ab83');text(c,'INSPECTION ACCESS',44,123,14);box(c,308,443,202,138,'#647c75',4);for(let i=0;i<3;i++){box(c,325+i*55,460,40,41,'#243d43');oval(c,344+i*55,481,14,14,'#aeb29b');line(c,[[344+i*55,481],[349+i*55,469]],'#3b5557',2)}
 box(c,302,205,299,171,'#b9b59a',4);text(c,'LOCK / SERVICE ROUTE',321,232,14,'#394f50');line(c,[[328,264],[413,264],[413,337],[565,337]],'#6b8277',12);line(c,[[328,264],[413,264],[413,337],[565,337]],'#315d63',3);text(c,'WEST',321,292,11,'#56695e');text(c,'EAST',522,321,11,'#56695e');lamp(c,650,83,t,night);box(c,510,548,215,33,'#8a8266',3);
}
function relay(c,t,shelter=false){box(c,-500,-300,2300,1300,'#4a6262');box(c,-500,593,2300,500,'#637a70');for(let i=0;i<7;i++)line(c,[[i*215,593],[i*245-120,900]],'#7e8b7a',1);box(c,58,120,230,473,'#233b42');text(c,'ENTRANCE',87,151,18);line(c,[[69,410],[272,410]],'#8e9a87',10);box(c,870,105,334,264,'#18323d');c.save();c.beginPath();c.rect(881,117,312,241);c.clip();c.translate(882,112);c.scale(.30,.43);bridge(c,t,shelter);c.restore();line(c,[[1037,107],[1037,369]],'#9ba596',7);
 box(c,631,459,560,22,'#b09c7a',4);line(c,[[666,481],[652,601]],'#7e745c',10);line(c,[[1168,481],[1177,601]],'#7e745c',10);box(c,817,343,242,115,'#36534f',8);box(c,837,361,151,34,'#dbbc7d',3);text(c,'CANAL / RELAY',848,383,14,'#354f4a');for(let i=0;i<6;i++)line(c,[[846,414+i*5],[1014,414+i*5]],'#77917f',2);box(c,1093,404,56,53,'#778e7b',3);box(c,1106,412,28,15,Math.sin(t*4)>.2?'#bdd899':'#799575',1);line(c,[[1084,295],[1084,442]],'#283e41',6);oval(c,1084,296,13,22,'#a0aaa0');
 if(shelter){box(c,322,552,223,40,'#89937d',12);box(c,332,537,60,19,'#b9b99e',7);box(c,332,416,66,122,'#7b9c90',7);box(c,347,397,32,21,'#a5b3a1',3);for(let i=0;i<4;i++)line(c,[[355+i*8,441],[355+i*8,478]],'#405f5b',2)}lamp(c,591,82,t);
}
function mapDetail(c,t,kind){box(c,-50,-50,1400,850,'#203a44');box(c,189,100,901,530,'#bdb599',8);text(c,kind==='log'?'TRANSMISSION / CALL LOG':'CANAL / MAINTENANCE ROUTE',230,153,27,'#344c4c');
 if(kind==='log'){text(c,'FOUR DAYS EARLIER',230,210,24,'#8b5149');for(let i=0;i<6;i++){line(c,[[226,252+i*49],[1045,252+i*49]],'#949d84',1);text(c,['RELAY TEST / ROSA','AMBULANCE / REQUESTING ASSISTANCE','VIOLENT PATIENT / ADDITIONAL INJURIES','LOCATION: WEST HOSPITAL ANNEX','REPEATED REQUEST / NO RESPONSE','CHANNEL: 87.0'][i],235,280+i*49,i===2?18:20,'#415b56')}line(c,[[497,436],[1009,436]],'#92554a',3)}
 else{for(let i=0;i<6;i++)box(c,240+i*128,260+(i%2)*90,82,65,'#8c9c89');line(c,[[232,469],[999,469]],'#48767b',31);line(c,[[232,469],[999,469]],'#87a8a0',3);line(c,[[326,578],[326,482],[931,412],[931,311]],'#9b5c49',5);text(c,'MAIN BRIDGE / CLOSED',481,230,24,'#8b5149');line(c,[[651,261],[651,516]],'#757f6e',18);line(c,[[630,397],[672,439]],'#b95742',8);line(c,[[672,397],[630,439]],'#b95742',8);text(c,'SERVICE WALKWAY',486,550,20,'#385753');}
}
function consoleDetail(c,t,interrupt=false){box(c,-50,-50,1400,850,'#203841');box(c,170,164,924,403,'#56796d',14);box(c,225,221,560,97,interrupt?'#db8b67':'#d3bd84',7);text(c,'87.0',255,294,67,'#304c49');text(c,interrupt?'INCOMING TRANSMISSION':'CANAL RELAY / TRANSMIT',230,357,24,'#e8dac0');for(let i=0;i<8;i++){let h=12+Math.abs(Math.sin(t*7+i*1.8))*65;box(c,830+i*22,319-h,12,h,'#dbb674',2)}for(let j=0;j<7;j++)line(c,[[231,402+j*14],[787,402+j*14]],'#2c4d49',5);oval(c,929,469,47,47,'#bfaf85');line(c,[[929,469],[953,444]],'#364f48',7);line(c,[[1020,140],[1020,405]],'#172b32',10);oval(c,1020,140,29,42,'#aab4a4');}
function at(key,fallback=0){return S.scenes.find(s=>s.key===key)?.start??fallback}
function span(t,a,b){return ease((t-a)/Math.max(.01,b-a))}
function castLine(c,t,x=450,y=625,mode='idle',travel=0){actor(c,'police',x-245,y,.87,t,mode,{travel:travel/.87});actor(c,'elder',x-139,y,.81,t+.3,mode,{travel:travel/.81});actor(c,'worker',x-26,y,.88,t+.6,mode,{travel:travel/.88,lean:mode==='walk'?.09:0});return actor(c,'hero',x+101,y,.96,t,mode,{travel:travel/.96})}
function stage(c,s,u,t){const p=clamp(u/(s.end-s.start));
 switch(s.kind){
 case 'bank':{canal(c,t,{night:true,blink:s.key==='search'});if(s.key==='name'){actor(c,'elder',352,632,.88,t,'idle',{look:1});actor(c,'worker',480,632,.93,t,'sit',{mood:'tired'});const g=actor(c,'hero',684,637,1.15,t,'pack',{reach:[69,-188],farReach:[20,-183],look:-1});radio(c,g.right[0]+13,g.right[1],.35,t);actor(c,'police',822,632,1.04,t,'reach',{facing:-1,reach:[67,-191]})}else castLine(c,t,480,632,'idle');rain(c,t,.22);break}
 case 'approach':{canal(c,t,{night:true});let x=mix(791,350,ease(p));castLine(c,t,x,633,'walk',Math.abs(x-791));rain(c,t,.25);break}
 case 'flood':{canal(c,t,{night:true});actor(c,'hero',341,638,.93,t,'pack',{lookY:1});actor(c,'worker',236,630,.87,t,'sit',{lookY:.9});rain(c,t,.24);break}
 case 'night':{pump(c,t,true);actor(c,'worker',442,592,.94,t,'floorSit',{closed:.9,mood:'tired'});actor(c,'elder',566,592,.90,t,'floorSit',{mood:'tired'});actor(c,'police',214,592,.98,t,'idle',{facing:-1,look:-1});const g=actor(c,'hero',722,592,1.02,t,'floorSit',{closed:Math.sin(t*.6)>.7?1:0,mood:'tired',reach:[58,-150]});radio(c,g.right[0]+15,g.right[1]+5,.35,t);box(c,532,559,20,31,'#b4c1a3',3);break}
 case 'blink':{pump(c,t,true);actor(c,'hero',864,596,1.19,t,'hope',{reach:p>.3?[32,-269]:[45,-193],facing:1,mood:'hope'});actor(c,'police',611,596,.97,t,'listen',{mood:'alert'});break}
 case 'bridge':{bridge(c,t,s.key==='crowds');water(c,t,555,.15);if(s.key!=='crowds'){actor(c,'hero',799,827,1.58,t,'idle',{look:-1,facing:-1});actor(c,'police',1132,817,1.46,t,'idle',{look:-1,facing:-1})}rain(c,t,.17);break}
 case 'plan':{pump(c,t);actor(c,'worker',647,591,1.01,t,'reach',{facing:-1,reach:[75,-211],mood:'alert'});actor(c,'hero',778,591,1.03,t,'idle',{facing:-1,listen:.4});actor(c,'elder',1057,593,.9,t,'sit',{mood:'tired'});break}
 case 'wound':{pump(c,t);actor(c,'police',478,595,1.13,t,'idle',{look:1,mood:'worried'});actor(c,'hero',676,595,1.14,t,'pack',{facing:-1,reach:[54,-165],farReach:[29,-172],lookY:.6});actor(c,'elder',1062,596,.82,t,'sit',{mood:'tired'});break}
 case 'drain':{const q=span(t,at('drain'),at('prepare'));canal(c,t,{drain:q,blink:true});for(let i=0;i<5;i++){let x=mix(900+i*104,250+i*85,q);actor(c,'infected',x,370,.32,t+i,'walk',{facing:-1,travel:Math.abs(x-(900+i*104))/.32,lean:.19})}rain(c,t,.18);break}
 case 'prepare':{pump(c,t);actor(c,'elder',484,594,1.02,t,'pack',{reach:[63,-170],farReach:[31,-170],mood:'worried'});actor(c,'worker',615,593,1.04,t,'sit',{facing:-1,reach:[57,-159],mood:'tired'});actor(c,'police',919,596,1.03,t,'idle',{facing:-1});actor(c,'hero',778,596,1.06,t,'pack',{reach:[60,-179]});break}
 case 'cross':case 'gate':case 'chain':case 'escape':{
 canal(c,t,{drain:1,gate:true,open:t<at('hold'),threat:s.kind==='gate'||s.kind==='chain'});
 const a=at('firstcross'),b=at('follow'),d=at('squeal'),e=at('hold'),f=at('chain'),g=at('return'),h=at('escape'),end=at('reunion');
 const y=x=>648-(x-170)*.103;
 const op=span(t,a,b+8),ep=span(t,a+3,b+12),wp=span(t,b,end-7),hp=t<e?span(t,b,e)*.15:t<h?.15:mix(.15,1,span(t,h,end));
 let ox=mix(280,1240,op),ex=mix(160,1130,ep),wx=mix(190,1040,wp),hx=t<h?mix(80,350,span(t,b,e)):mix(350,1054,span(t,h,end));
 if(t>=g&&t<h)ox=mix(1240,450,span(t,g,h));else if(t>=h)ox=hx+100;
 actor(c,'police',ox,y(ox),.83,t,t>=g?'run':op<1?'walk':'idle',{travel:Math.abs(ox-280)/.83,facing:t>=g&&t<h?-1:1,lean:t>=g?.20:.10,farReach:t>=h?[-65,-186]:undefined,supportSlope:-.103});actor(c,'elder',ex,y(ex),.77,t,ep<1?'walk':'idle',{travel:(ex-160)/.77,gaitWeight:ep<1?1:0,lean:.04,supportSlope:-.103});if(t>=b)actor(c,'worker',wx,y(wx),.84,t,wp<1?'walk':'idle',{travel:(wx-190)/.84,lean:.13,reach:[45,-140],mood:'tired',supportSlope:-.103});
 if(s.kind==='gate'||s.kind==='chain'){hx=350;const gg=actor(c,'hero',hx,y(hx),.98,t,'push',{facing:-1,reach:[83,-182],farReach:[77,-158],recoil:.2*Math.max(0,Math.sin(t*9)),lean:.21});if(s.kind==='chain'){const q=span(t,f,f+Math.min(5,s.end-s.start));line(c,[[269,464],[mix(gg.right[0],270,q),mix(gg.right[1],503,q)],[269,535]],'#bdac80',4);for(let i=0;i<8;i++)oval(c,268+i*2,479+i*7,5,3,'#a5a18a')} }
 else if(t>=b){const stumble=s.kind==='escape'?Math.sin(clamp((u-4)/1.2)*Math.PI):0;actor(c,'hero',hx,y(hx)-stumble*4,.97,t,s.kind==='escape'?'run':s.key==='return'?'hope':'walk',{travel:(hx-80)/.97,lean:s.kind==='escape'?.22+stumble*.15:.13,reach:s.kind==='escape'?[57,-190]:s.key==='follow'?[82,-177]:undefined,supportSlope:-.103});if(stumble>0){box(c,hx-35,y(hx)+3,72,7,'#0a242e');c.save();c.translate(hx-35,y(hx)+2);c.rotate(stumble*.17);box(c,0,0,72,5,'#a4aca0');c.restore()}}
 if(t>=f+5&&s.kind!=='chain'){line(c,[[176,486],[269,511],[176,535]],'#bdac80',4);for(let i=0;i<9;i++)oval(c,182+i*10,489+i*2.5,5,3,'#a5a18a')}
 if(t>d){const z=span(t,d,e+5);for(let i=0;i<3;i++)actor(c,'infected',mix(90-i*36,160-i*60,z),mix(490-i*49,636-i*10,z),.85-i*.06,t+i,z<1?'walk':'push',{facing:1,travel:z*146/(.85-i*.06),reach:z>.7?[83,-186]:undefined,lean:.21})}
 // The rail is in front of the cast; the walkway supports the actual foot plane.
 for(let i=0;i<13;i++){const x=155+i*73,yy=y(x);line(c,[[x,yy-74],[x,yy+3]],'#879e94',3);if(i<12)line(c,[[x,yy-74],[x+73,yy-81.5]],'#a7b1a0',3)}rain(c,t,.2);break}
 case 'reunion':{relay(c,t);const q=ease((t-413.95)/1.7);actor(c,'police',330,594,.96,t,t>404&&t<409?'push':'idle',{facing:-1,reach:t>404&&t<409?[76,-182]:undefined});actor(c,'worker',456,594,.91,t,'sit',{mood:'tired'});actor(c,'elder',569,595,.85,t,'idle',{mood:'hope'});actor(c,'rosa',mix(854,785,q),595,1.04,t,'hope',{facing:-1,reach:[mix(40,83,q),mix(-185,-196,q)],farReach:[mix(-14,80,q),-185],mood:'hope'});actor(c,'hero',mix(665,691,q),595,1.05,t,'hope',{reach:[mix(28,83,q),mix(-184,-196,q)],farReach:[mix(-10,80,q),-185],mood:'hope'});break}
 case 'shelter':{relay(c,t,true);actor(c,'worker',450,592,.92,t,'floorSit',{closed:.9,mood:'tired'});actor(c,'elder',606,592,.86,t,'sit',{mood:'hope'});actor(c,'hero',310,594,1.01,t,'sit',{look:1,mood:'tired'});actor(c,'rosa',785,594,1.02,t,'idle',{facing:-1,mood:'hope'});actor(c,'police',184,592,.94,t,'idle',{facing:-1,look:-1});break}
 case 'care':{relay(c,t,true);actor(c,'hero',390,592,1.09,t,'sit',{reach:[71,-156],farReach:[26,-162],mood:'tired',lookY:.5});actor(c,'rosa',579,593,1.05,t,'pack',{facing:-1,reach:[67,-163],farReach:[42,-169],mood:'worried'});actor(c,'police',201,593,1.01,t,'idle',{mood:'worried'});oval(c,490,545,36,9,'#b5bcaa');box(c,477,523,25,12,'#dfd2b3',3);break}
 case 'records':{relay(c,t,true);actor(c,'hero',667,595,1.05,t,'idle',{reach:[72,-163],lookY:.5,mood:'worried'});actor(c,'rosa',832,595,1.06,t,'pack',{facing:-1,reach:[68,-164],farReach:[41,-164],mood:'worried'});actor(c,'police',475,594,1.02,t,'idle',{look:1,mood:'alert'});box(c,683,445,124,9,'#d8c7a0',2);break}
 case 'broadcast':case 'warning':case 'interrupt':{relay(c,t,true);const transmit=s.kind==='warning'||s.key==='last';actor(c,'hero',612,595,1.05,t,'sit',{look:1,mood:'alert'});actor(c,'rosa',965,595,1.08,t,transmit?'reach':'listen',{facing:-1,reach:transmit?[89,-219]:undefined,mood:s.kind==='interrupt'?'scared':'alert',mouthOpen:transmit?.5:.12});actor(c,'police',750,595,1.03,t,'idle',{look:1,mood:'alert'});if(transmit)box(c,852,402,10,7,'#eeb97c',2);break}
 default:relay(c,t,true);
 }
}
function closeup(c,s,u,t){
 if(['plan'].includes(s.kind)){mapDetail(c,t,'route');return}
 if(s.kind==='records'){mapDetail(c,t,'log');return}
 if(['broadcast','warning','interrupt'].includes(s.kind)){consoleDetail(c,t,s.kind==='interrupt');return}
 if(s.kind==='bank'){box(c,-50,-50,1400,850,'#17313e');radio(c,753,420,3.2,t);actor(c,'hero',264,1047,2.55,t,'pack',{reach:[60,-185],fear:.8,look:1,bag:false});return}
 if(s.kind==='wound'||s.kind==='care'){box(c,-50,-50,1400,850,'#2c464c');actor(c,'hero',496,1033,2.6,t,'pack',{reach:[57,-168],farReach:[27,-169],lookY:.8,bag:false});box(c,605,563,51,19,'#cabda3',5);line(c,[[616,567],[635,577]],'#986a59',4);return}
 // Tight reaction inserts preserve the environment and actor path under a lens transform.
 c.save();let fx=['gate','chain'].includes(s.kind)?350:s.key==='follow'||s.key==='squeal'?315:s.kind==='blink'?878:s.kind==='escape'?mix(350,1054,span(t,at('escape'),at('reunion')))+45:690,fy=['cross','escape'].includes(s.kind)?492:420;c.translate(640,360);c.scale(1.57,1.57);c.translate(-fx,-fy);stage(c,s,u,t);c.restore();
}
function subtitles(c,t){const q=(S.captions||[]).find(x=>t>=x.start&&t<x.end);if(!q)return;const lines=[],words=q.text.split(/\s+/);let row='';c.font='400 21px Film,Arial';for(let w of words){let next=(row+' '+w).trim();if(c.measureText(next).width>1030&&row){lines.push(row);row=w}else row=next}if(row)lines.push(row);let h=lines.length*27+18;box(c,76,694-h,1128,h,'#0a1823e8',6);lines.forEach((l,i)=>text(c,l,640,694-h+26+i*27,21,'#f3e9d3','center'))}
function render(c,t,o={}){t=clamp(t,0,DURATION-1/FPS);currentActors=[];c.save();c.beginPath();c.rect(0,0,W,H);c.clip();
 if(t<S.intro_duration){canal(c,t,{night:true,blink:true});box(c,0,0,W,H,'#07182299');text(c,'DAY THREE',75,300,75);text(c,'THE OTHER SIDE',80,354,32,'#d6a471');text(c,'ZOMBIE OUTBREAK / PART 3',81,399,17,'#b8c5ae');c.restore();return{scene:0,actors:currentActors}}
 const s=S.scenes.find(q=>t>=q.start&&t<q.end)||S.scenes.at(-1),u=t-s.start,d=s.end-s.start;
 const shot=(s.shots||[]).find(q=>u>=q.start&&u<q.end)||{type:'wide'};
 const danger=['cross','gate','chain','escape','drain','bridge'].includes(s.kind),shake=danger?(s.kind==='gate'||s.kind==='chain'?1.4:.7):.15;
 c.translate(Math.sin(t*19)*shake,Math.sin(t*27)*shake*.62);
 if(shot.type==='detail')closeup(c,s,u,t);else{
  const z=(shot.type==='medium'?1.16:1.005)*(1+.022*ease((u-shot.start)/(shot.end-shot.start||d)));const fx=shot.focusX??(shot.type==='medium'&&['gate','chain'].includes(s.kind)?500:640),fy=shot.focusY??365;
  c.translate(640,360);c.scale(z,z);c.rotate(danger?.003*Math.sin(u*.8):0);c.translate(-fx,-fy);stage(c,s,u,t);
 }
 c.restore();c.save();const vignette=c.createRadialGradient(640,350,240,640,350,760);vignette.addColorStop(0,'#06192300');vignette.addColorStop(1,'#06192370');c.fillStyle=vignette;c.fillRect(0,0,W,H);box(c,0,0,W,22,'#0a1720');box(c,0,703,W,17,'#0a1720');
 // Brief location slates only at establishing cuts, never a constant technical title bar.
 if(u<2.6&&s.location){c.save();c.globalAlpha=Math.min(1,u/.35,(2.6-u)/.5);box(c,31,43,Math.min(560,s.location.length*9+26),32,'#10252bc9',3);text(c,s.location,44,65,15,'#d0c6aa');c.restore()}
 if(o.subtitles!==false)subtitles(c,t);
 const endStart=DURATION-S.outro_duration;if(t>endStart){const a=clamp((t-endStart)/1.4);box(c,0,0,W,H,`rgba(5,15,23,${a*.90})`);if(a>.4){text(c,'SOMEONE WAS LISTENING',640,326,37,'#ead9bc','center');text(c,'TO BE CONTINUED',640,371,18,'#c08a69','center')}}
 c.restore();return{scene:s.id,actors:currentActors};}
return{render,W,H,FPS,DURATION,Story:S};
});
