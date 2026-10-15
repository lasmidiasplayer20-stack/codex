(()=>{'use strict';const R=Rig;
const redProfile={radius:26.6,neck:36.176,torso:69.16,arm:[34.58,34.58],leg:[55.86,55.86],width:11.8};
const orangeProfile={radius:31.8,neck:41.34,torso:63.6,arm:[41.34,41.34],leg:[53,53],width:13.3};
const greenProfile={radius:27.4,neck:30.14,torso:61.65,arm:[35.62,35.62],leg:[57,57],width:12.4};
function key(p,t,head,body,neck,h0,h1,spineFold=0){const v=R.add(R.polar(R.radians(body),p.torso*Math.cos(R.radians(spineFold)/2)),R.polar(R.radians(neck),p.neck));return{t,root:R.sub(head,v),body,neck,spineFold,hand0:R.add(head,h0),hand1:R.add(head,h1)};}
const r=(t,h,b=-90,n=-90,h0=[66,46],h1=[-20,115],fold=0)=>key(redProfile,t,h,b,n,h0,h1,fold),o=(t,h,b=-90,n=-90,h0=[-35,90],h1=[30,90],fold=0)=>key(orangeProfile,t,h,b,n,h0,h1,fold),f=(t,x,y,lift=0)=>({t,p:[x,y],lift});
const start=81.75,end=94.598095;
const red={start,end,color:'#f10b14',hollow:false,profile:redProfile,armSides:[-1,1],kneeSide:1,
 keys:[r(start,[2200,245],-90,-94,[-30,90],[-28,97],65),r(82.25,[2200,234],-90,-90,[-44,72],[-42,79],80),r(90.083333,[2200,247],-90,-90,[-44,72],[-42,79],80),r(92.3,[2200,247],-90,-90,[-44,72],[-42,79],80),r(92.7,[2200,247],-90,-90,[-75,112],[-20,104],80),r(92.85,[2200,247],-90,-90,[-20,104],[20,104],80),r(end,[2200,247],-90,-90,[-20,104],[20,104],80)],
 feet:[[f(start,2170,435),f(82.25,2170,435),f(end,2170,435)],[f(start,2240,435),f(82.25,2230,435),f(end,2230,435)]]};
const cyanProfile={radius:27.4,neck:18,torso:72,arm:[50,50],leg:[57,57],width:12.4};
const c=(t,h,h0,h1,fold=0)=>key(cyanProfile,t,h,-94,-95,h0,h1,fold);
const cyan={start:82.083333,end,color:'#12c1dc',hollow:false,profile:cyanProfile,armSides:[-1,1],kneeSide:1,
 walks:[{start:82.083333,end:82.65,direction:-1,floor:435,stride:105,lift:18}],
 keys:[c(82.083333,[2480,222],[1.6,118],[1.6,118]),c(82.5,[2359,222],[1.6,118],[1.6,118]),c(83.25,[2359,222],[1.6,118],[1.6,118]),c(83.8,[2359,222],[10,0],[-10,0]),c(84.791667,[2359,222],[10,0],[-10,0]),c(85.3,[2290,237],[10,0],[-10,0],0),c(end,[2290,237],[10,0],[-10,0],0)],
 feet:[[f(82.083333,2490,435),f(82.5,2367,435),f(83.25,2335,435),f(84.791667,2335,435),f(85.3,2265,435),f(end,2265,435)],[f(82.083333,2530,420),f(82.5,2403,418),f(83.25,2397,435),f(84.791667,2397,435),f(85.3,2327,435),f(end,2327,435)]]};
const orange={start,end,color:'#ff8527',hollow:true,profile:orangeProfile,armSides:[-1,1],kneeSide:-1,kneeSides:[1,-1],damage:t=>({faceCut:{roll:R.radians(90)}}),keys:[o(start,[1851,425],0,0,[-10,43],[-15,55]),o(end,[1851,425],0,0,[-10,43],[-15,55])],feet:[[f(start,1640,425),f(end,1640,425)],[f(start,1645,435),f(end,1645,435)]]};
const corpse={start:44,end:94.7,color:'#35f226',hollow:false,profile:greenProfile,armSides:[1,1],kneeSide:-1,keys:[key(greenProfile,44,[1374,430],0,0,[6,-15],[-68,17]),key(greenProfile,94.7,[1374,430],0,0,[6,-15],[-68,17])],feet:[[f(44,1169,428),f(94.7,1169,428)],[f(44,1171,433),f(94.7,1171,433)]]};


const medium={scale:2.07,x:307-2200*2.07,y:-384.4};
const sweep=[{t:84.791667,scale:4.4,x:210-2000*4.4,y:360-379*4.4},{t:85.5,scale:4.4,x:210-2000*4.4,y:360-379*4.4},{t:86.3,scale:3.5,x:465-1851*3.5,y:318-425*3.5},{t:87,scale:3.5,x:465-1851*3.5,y:318-425*3.5},{t:88,scale:1.9,x:420-1374*1.9,y:426-430*1.9},{t:88.9,scale:1.9,x:920-1169*1.9,y:420-428*1.9},{t:89.8,scale:1.9,x:369-754*1.9,y:224-327*1.9},{t:90.083332,scale:1.9,x:369-754*1.9,y:224-327*1.9}];
const finale={scale:2.07,x:300-2200*2.07,y:-384.4};
function camera(t){if(t<84.791667)return medium;if(t>=90.083333)return finale;return{scale:R.value(sweep,t,'scale'),x:R.value(sweep,t,'x'),y:R.value(sweep,t,'y')};}
window.PART={id:'05',start,end,duration:end-start,title:'Parte 05 — Azul e desfecho',tracks:{red,cyan,orange},corpse,camera,mace:[{t:start,angle:-565},{t:92.3,angle:-565},{t:92.7,angle:-570},{t:end,angle:-570}],maceGrip:[{t:start,distance:24},{t:end,distance:24}],extraAssets:['core/clinic.js','core/battle.js','core/damage.js'],bloodStart:67.5,weaponEnd:92.75,cardStart:93.708333,hospital:{x:715,y:353,w:238,h:30,patientHead:[754,327],patientRadius:27.4},effects:(t,f)=>Damage.draw(t,f),beats:[start,82.1,82.5,83,83.8,84.5,85,86,87,88,89,89.8,90.1,91,92.3,92.6,93,93.8,94.5].map(t=>({t,label:'Pose dirigida'}))};
})();
