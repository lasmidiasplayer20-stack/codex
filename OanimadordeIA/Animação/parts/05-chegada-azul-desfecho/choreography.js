(()=>{'use strict';const R=Rig;
const redProfile={radius:26.6,neck:36.176,torso:69.16,arm:[34.58,34.58],leg:[55.86,55.86],width:11.8};
const orangeProfile={radius:31.8,neck:41.34,torso:63.6,arm:[41.34,41.34],leg:[53,53],width:13.3};
const greenProfile={radius:27.4,neck:30.14,torso:61.65,arm:[35.62,35.62],leg:[57,57],width:12.4};
function key(p,t,head,body,neck,h0,h1,spineFold=0){const v=R.add(R.polar(R.radians(body),p.torso*Math.cos(R.radians(spineFold)/2)),R.polar(R.radians(neck),p.neck));return{t,root:R.sub(head,v),body,neck,spineFold,hand0:R.add(head,h0),hand1:R.add(head,h1)};}
// Red reactions lean through the authored body angle; keep the trunk uncreased.
// Head targets, hand targets, feet and beat times remain authored below.
const r=(t,h,b=-90,n=-90,h0=[66,46],h1=[-20,115])=>key(redProfile,t,h,b,n,h0,h1),o=(t,h,b=-90,n=-90,h0=[-35,90],h1=[30,90],fold=0)=>key(orangeProfile,t,h,b,n,h0,h1,fold),f=(t,x,y,lift=0)=>({t,p:[x,y],lift});
const start=81.75,end=94.598095;
// Keep the pelvis, shoulder and weapon hands planted while the neck turns
// left/right: the original refusal is a head shake, with no torso fold.
function refusal(t,neck){const pose=r(t,[2200,247],-90,-90,[-44,72],[-42,79]);pose.neck=neck;return pose;}
const red={start,end,color:'#f10b14',hollow:false,profile:redProfile,armSides:[-1,1],kneeSide:1,
 keys:[r(start,[2200,245],-90,-94,[-30,90],[-28,97]),r(82.25,[2200,234],-90,-90,[-44,72],[-42,79]),
 refusal(90.083333,-90),refusal(90.5,-90),refusal(90.708333,-113),refusal(90.875,-65),refusal(91.083333,-111),refusal(91.291667,-67),refusal(91.583333,-90),refusal(92.25,-90),
 r(92.416667,[2206,247],-87,-86,[-20,80],[-15,83]),
 r(92.625,[2200,247],-90,-90,[-70,65],[-50,75]),
 r(92.958333,[2200,247],-90,-90,[-20,104],[20,104]),r(end,[2200,247],-90,-90,[-20,104],[20,104])],
 feet:[[f(start,2170,435),f(82.25,2170,435),f(end,2170,435)],[f(start,2240,435),f(82.25,2230,435),f(end,2230,435)]]};
const cyanProfile={radius:27.4,neck:18,torso:72,arm:[50,50],leg:[57,57],width:12.4};
const c=(t,h,h0,h1,fold=0,body=-94,neck=-95)=>key(cyanProfile,t,h,body,neck,h0,h1,fold);
const cyan={start:82.083333,end,color:'#12c1dc',hollow:false,profile:cyanProfile,armSides:[-1,1],kneeSide:1,
 walks:[{start:82.083333,end:83.125,direction:-1,floor:435,stride:105,lift:18}],
 keys:[c(82.083333,[2480,222],[1.6,118],[1.6,118]),c(82.5,[2359,222],[1.6,118],[1.6,118]),
 c(83.25,[2260,237],[-12,92],[35,92],0,-111,-105),
 c(83.5,[2260,237],[20,40],[-20,40],0,-111,-105),
 c(83.833333,[2290,237],[10,0],[-10,0]),c(84.791667,[2290,237],[10,0],[-10,0]),c(end,[2290,237],[10,0],[-10,0])],
 feet:[[f(82.083333,2490,435),f(82.5,2367,435),f(83.25,2265,435),f(end,2265,435)],[f(82.083333,2530,420),f(82.5,2403,418),f(83.25,2327,435),f(end,2327,435)]]};
const orange={headDent:()=>({amount:.4,roll:Math.PI/2}),start,end,color:'#ff8527',hollow:true,profile:orangeProfile,armSides:[-1,1],kneeSide:-1,kneeSides:[1,-1],damage:t=>({faceCut:{roll:R.radians(90)}}),keys:[o(start,[1851,425],0,0,[-10,43],[-15,55]),o(end,[1851,425],0,0,[-10,43],[-15,55])],feet:[[f(start,1640,425),f(end,1640,425)],[f(start,1645,435),f(end,1645,435)]]};
const corpse={start:44,end:94.7,color:'#35f226',hollow:false,profile:greenProfile,armSides:[1,1],kneeSide:-1,keys:[key(greenProfile,44,[1374,430],0,0,[6,-15],[-68,17]),key(greenProfile,94.7,[1374,430],0,0,[6,-15],[-68,17])],feet:[[f(44,1169,428),f(94.7,1169,428)],[f(44,1171,433),f(94.7,1171,433)]]};


const medium={scale:2.07,x:307-2200*2.07,y:-384.4};
const sweep=[{t:84.791667,scale:4.4,x:210-2000*4.4,y:360-379*4.4},{t:85.5,scale:4.4,x:210-2000*4.4,y:360-379*4.4},{t:86.3,scale:3.5,x:465-1851*3.5,y:318-425*3.5},{t:87,scale:3.5,x:465-1851*3.5,y:318-425*3.5},{t:88,scale:1.9,x:420-1374*1.9,y:426-430*1.9},{t:88.9,scale:1.9,x:920-1169*1.9,y:420-428*1.9},{t:89.8,scale:1.9,x:369-754*1.9,y:224-327*1.9},{t:90.083332,scale:1.9,x:369-754*1.9,y:224-327*1.9}];
const finale={scale:2.07,x:300-2200*2.07,y:-384.4};
function camera(t){if(t<84.791667)return medium;if(t>=90.083333)return finale;return{scale:R.value(sweep,t,'scale'),x:R.value(sweep,t,'x'),y:R.value(sweep,t,'y')};}
window.PART={id:'05',start,end,duration:end-start,title:'Parte 05 — Azul e desfecho',tracks:{red,cyan,orange},corpse,camera,mace:[{t:start,angle:-565},{t:92.25,angle:-565},{t:92.416667,angle:-555},{t:92.625,angle:-565},{t:end,angle:-565}],maceGrip:[{t:start,distance:24},{t:end,distance:24}],extraAssets:['core/clinic.js','core/battle.js','core/damage.js'],bloodStart:67.5,weaponEnd:92.625,cardStart:93.708333,hospital:{x:715,y:353,w:238,h:30,patientHead:[754,327],patientRadius:27.4},effects:(t,f)=>Damage.draw(t,f),beats:[start,82.1,82.5,83.25,83.5,83.833333,84.5,85,86,87,88,89,89.8,90.1,90.5,90.708333,90.875,91.083333,91.291667,91.583333,92.25,92.416667,92.625,92.958333,93.6,93.8,94.5].map(t=>({t,label:'Pose dirigida'}))};
})();
