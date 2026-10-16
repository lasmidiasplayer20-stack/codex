/* Additive performance solver. Final playback uses the preserved FK and drawing code. */
(()=>{'use strict';const S=StoryV6,{clamp,lerp,smooth}=V,L=RigAdapter.length,R=RigAdapter.radius,TAU=Math.PI*2,HZ=120;
const P={
 idle:[-90,[-12,46],[13,46]],look:[-90,[-14,45],[15,44]],watch:[-90,[-14,45],[17,43]],
 point:[-86,[-12,44],[45,-10]],idea:[-90,[-12,45],[24,-35]],inspect:[-70,[35,15],[40,5]],
 alarm:[-101,[-33,-24],[34,-28]],reach:[-78,[32,25],[44,4]],catch:[-86,[35,2],[40,-9]],
 carry:[-90,[25,22],[35,22]],place:[-60,[30,34],[35,29]],crouch:[-46,[22,38],[32,32]],grab:[-50,[25,36],[35,30]],
 push:[-62,[38,20],[43,12]],pull:[-113,[39,20],[43,10]],brace:[-80,[37,5],[43,-4]],press:[-66,[42,5],[40,25]],brake:[-50,[30,35],[35,30]],
 run:[-78,[-25,32],[25,32]],walk:[-87,[-16,43],[16,43]],hop:[-85,[-25,-26],[30,-26]],
 float:[-92,[-38,18],[38,10]],swim:[-80,[-40,-12],[40,10]],fly:[-65,[-35,0],[40,0]],
 slip:[-115,[-42,-15],[42,-10]],land:[-70,[-30,20],[35,20]],balance:[-90,[-44,0],[44,0]],
 prepare:[-45,[-25,24],[25,24]],stop:[-115,[-35,-10],[40,-18]],protect:[-90,[-20,-30],[20,-30]],
 shrug:[-90,[-36,0],[36,0]]};
function poseStyle(a){const x=P[a.p]||P.idle,y=P[a.q]||P.idle;return{body:lerp(x[0],y[0],a.u),hands:[1,2].map(k=>{const angle0=Math.atan2(x[k][1],x[k][0]);let delta=Math.atan2(y[k][1],y[k][0])-angle0;while(delta>Math.PI)delta-=TAU;while(delta< -Math.PI)delta+=TAU;const angle=angle0+delta*a.u,len=lerp(Math.hypot(...x[k]),Math.hypot(...y[k]),a.u);return[Math.cos(angle)*len,Math.sin(angle)*len];})};}
function gripRoot(n,t,a,s){let target=null,weight=0;function bind(lo,hi,dx){if(t<lo-.4||t>hi+.4)return;const w=smooth((t-lo+.4)/.4)*(1-smooth((t-hi)/.4));if(w>weight){target=s.cart.x+dx;weight=w;}}
 if(n==='amber')bind(0,4.8,-100);if(n==='hero'){bind(40,43,-95);bind(55,63,-95);bind(100,108,-95);}if(n==='cyan'){bind(28,35,-90);bind(40,43,80);bind(47,63,80);bind(128,132,-95);}if(target!==null){a.x=lerp(a.x,target,weight);a.y=lerp(a.y,748,weight);a.cartSide=target>s.cart.x?1:-1;a.cartWeight=weight;}return a;}
function solve(root,target,l1,l2,pole){const dx=target[0]-root[0],dy=target[1]-root[1],raw=Math.hypot(dx,dy),d=clamp(raw,.001,l1+l2-.0001),ang=Math.atan2(dy,dx),alpha=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));return{joint:[root[0]+Math.cos(ang+pole*alpha)*l1,root[1]+Math.sin(ang+pole*alpha)*l1],end:[root[0]+Math.cos(ang)*d,root[1]+Math.sin(ang)*d],error:Math.max(0,raw-d)};}
const poses=Object.fromEntries(S.names.map(n=>[n,[]])),records=Object.fromEntries(S.names.map(n=>[n,[]])),steps=[];
for(const name of S.names){let dist=0,lastX=null,lastY=null,lastFeet=null,lastMoving=false,dir=1,cycles=[null,null],plants=[null,null],swings=[null,null],prevRecord=null,perfSpeed=0,armPoles=[S.actor(name,0).f,S.actor(name,0).f];
 for(let frame=0;frame<=150*HZ;frame++){const t=frame/HZ,s=S.snapshot(t),a=gripRoot(name,t,{...s.actors[name]},s),sty=poseStyle(a);if(lastX===null)lastX=a.x;const dx=a.x-lastX,vx=dx*HZ;lastX=a.x;if(Math.abs(vx)>4)dir=Math.sign(vx);
 const beamW=name==='amber'?Math.max(smooth((t-31.2)/.3)*(1-smooth((t-33.1)/.35)),smooth((t-111.4)/.3)*(1-smooth((t-117)/.35))):0,beam=beamW>.001;let ground=a.y>=700, moving=ground&&Math.abs(vx)>9;perfSpeed+=(vx-perfSpeed)*.07;const airBlend=smooth((725-a.y)/25),gaitWeight=smooth((Math.abs(perfSpeed)-3)/22);const mode=a.u>.5?a.q:a.p,turn=a.a.f!==a.b.f?Math.sin(Math.PI*a.turnU):0;
 let hipY=a.y;if(name==='cyan'&&t>=113.1&&t<=116.4)hipY=lerp(hipY,766,smooth((t-113.1)/.4)*(1-smooth((t-116)/.4)));if(beam)hipY=lerp(hipY,Math.max(hipY,775+Math.sin(s.lever)*108-79),beamW);if(ground){if(hipY<737)hipY+=4*gaitWeight*(1-airBlend);hipY=lerp(hipY,806-Math.sqrt((L[7]+L[8]-.0002)**2-15**2),turn**4);hipY+=Math.sin(t*2.5+S.names.indexOf(name))*0.6*(1-(moving?1:0))*(1-turn**4);}
 const root=[a.x,hipY],f=a.f,face=a.a.f===a.b.f?f:lerp(a.a.f,a.b.f,a.turnU),rot=a.r,lean=clamp(perfSpeed*.035,-7,7),body=(lerp(-90+(sty.body+90)*face,a.cartSide===1?-120:-60,a.cartWeight||0)+lean)*Math.PI/180+rot,shoulder=[root[0]+Math.cos(body)*L[1],root[1]+Math.sin(body)*L[1]];
 const gaze=s.orb.holder===name?[s.orb.x+f*90,s.orb.y-30]:[s.orb.x,s.orb.y],look=clamp((gaze[0]-shoulder[0])*.018,-.24,.24),neck=-Math.PI/2+look+rot*.2,head=[shoulder[0]+Math.cos(neck)*L[2],shoulder[1]+Math.sin(neck)*L[2]];
 let feet=[];if(ground){if(moving&&!lastMoving){dist=0;cycles=[null,null];}dist+=Math.abs(dx);for(let i=0;i<2;i++){if(!moving){if(!lastFeet||lastMoving){plants[i]=lastFeet&&lastMoving?lastFeet[i][0]:root[0]+(i?16:-16);}feet[i]=[plants[i],lerp(lastFeet?.[i]?.[1]??806,806,.2)];cycles[i]=null;}
 else{const phase=dist/110+i*.5,cy=Math.floor(phase),u=phase-cy;if(cycles[i]===null){cycles[i]=cy;plants[i]=lastFeet?lastFeet[i][0]:root[0]+dir*(i?-20:20);swings[i]=plants[i];}
 if(cycles[i]!==cy){cycles[i]=cy;plants[i]=root[0]+dir*27;steps.push({id:`step-${name}-${frame}-${i}`,t,type:'step',x:plants[i],y:806,power:.25,name});}
 if(u<.55){feet[i]=[plants[i],806];swings[i]=plants[i];}else{const q=(u-.55)/.45,target=root[0]+dir*27;feet[i]=[lerp(swings[i],target,smooth(q)),806-Math.sin(Math.PI*q)*17];}}
 // A bounded support span keeps both fixed-length legs reachable during stops and crouches.
 const dy=feet[i][1]-root[1],maxX=Math.sqrt(Math.max(0,(L[7]+L[8]-.15)**2-dy*dy));feet[i][0]=clamp(feet[i][0],root[0]-maxX,root[0]+maxX);}}
 else{const pulse=t*4+S.names.indexOf(name),spread=mode==='hop'?28:25;feet=[[-spread,62+Math.sin(pulse)*8],[spread,59-Math.sin(pulse)*9]].map(p=>[root[0]+p[0]*Math.cos(rot)-p[1]*Math.sin(rot),root[1]+p[0]*Math.sin(rot)+p[1]*Math.cos(rot)]);}
 if(ground){const airW=smooth((725-a.y)/25);feet=feet.map((p,i)=>{const pulse=t*4+S.names.indexOf(name),spread=mode==='hop'?28:25,ax=i?spread:-spread,ay=i?59-Math.sin(pulse)*9:62+Math.sin(pulse)*8;const air=[root[0]+ax*Math.cos(rot)-ay*Math.sin(rot),root[1]+ax*Math.sin(rot)+ay*Math.cos(rot)];return p.map((v,j)=>lerp(lerp(v,air[j],airW),j===0?root[0]+(i?15:-15):806,turn**4*(1-airW)));});}
 if(name==='hero'&&t>=126&&t<=133.5){const sag=(1-s.bridge)*21;feet=feet.map(p=>[p[0],p[1]+sag]);}
 if(beamW>0)feet=feet.map((p,i)=>{const v=i?108:75,target=[820+Math.cos(s.lever)*v,775+Math.sin(s.lever)*v-3];return p.map((v,j)=>lerp(v,target[j],beamW));});
 let hands=sty.hands.map((p,i)=>{let x=p[0]*face,y=p[1];const eligible=p=>['idle','watch','look','walk','run','point','alarm'].includes(p)?1:0,ww=lerp(eligible(a.p),eligible(a.q),a.u)*gaitWeight*(1-airBlend);x=lerp(x,clamp((feet[i][0]-root[0])*-1,-28,28),ww);y=lerp(y,39,ww);if(!ground){x+=Math.sin(t*4+i*Math.PI)*5;y+=Math.cos(t*3.4+i)*4;}else{y+=Math.sin(t*3.1+i)*1.4;}if(turn>0){const ang=Math.atan2(y,x)+Math.PI*a.turnU*(i?-.12:.12);x=Math.cos(ang)*Math.hypot(x,y);y=Math.sin(ang)*Math.hypot(x,y);}return[shoulder[0]+x*Math.cos(rot)-y*Math.sin(rot),shoulder[1]+x*Math.sin(rot)+y*Math.cos(rot)];});
 if(!ground&&turn>0)feet=feet.map(p=>{const dx=p[0]-root[0],dy=p[1]-root[1],d=Math.hypot(dx,dy),len=lerp(d,L[7]+L[8]-.0002,turn**4);return[root[0]+dx/d*len,root[1]+dy/d*len];});
 if(turn>0)hands=hands.map((p,i)=>{const w=turn**2;return[lerp(p[0],shoulder[0]+(i?18:-18),w),lerp(p[1],shoulder[1]+42,w)];});
 if(turn>0)hands=hands.map(p=>{const dx=p[0]-shoulder[0],dy=p[1]-shoulder[1],d=Math.hypot(dx,dy),len=lerp(d,L[3]+L[4]-.0002,turn**4);return[shoulder[0]+dx/d*len,shoulder[1]+dy/d*len];});
 const contacts=[];function touch(i,target,kind,weight=1){hands[i]=hands[i].map((v,j)=>lerp(v,target[j],weight));if(weight>.999)contacts.push({index:i?6:4,target,kind});}
 const bind=(lo,hi,fn)=>{if(t>=lo-.25&&t<=hi+.25){const w=smooth((t-lo+.25)/.25)*(1-smooth((t-hi)/.25));fn(w);}};

 const holds={hero:[10.2,28.8,.6,-10],cyan:[88,110.5,.4,10],amber:[86.45,87.4,.25,-10]},hold=holds[name];if(t>=hold[0]&&t<=hold[1]+.3){const w=smooth((t-hold[0])/hold[2])*(1-smooth((t-hold[1])/.3));touch(1,[s.orb.x+hold[3],s.orb.y+3],'core',w);}
 function cartHands(w,right=false){const x=s.cart.x+(right?48:-48);touch(0,[x,s.cart.y-29],'cart',w);touch(1,[x,s.cart.y-18],'cart',w);}
 if(name==='amber'){bind(0,4.8,w=>cartHands(w));bind(60,62.8,w=>touch(1,[1100,725],'control',w));bind(86.7,87.4,w=>touch(1,[s.orb.x-10,s.orb.y+3],'core',w));}
 if(name==='hero'){bind(40,43,w=>cartHands(w));bind(55,63,w=>cartHands(w));bind(100,108,w=>cartHands(w));bind(113,116,w=>touch(1,[860,739],'lever',w));bind(128.5,132.1,w=>touch(1,[1170,710],'rescue',w));bind(144.8,146.5,w=>touch(1,[1405,690],'stop',w));}
 if(name==='cyan'){bind(28,35,w=>cartHands(w));bind(40,43,w=>cartHands(w,true));bind(47,63,w=>cartHands(w,true));bind(128,132,w=>cartHands(w));bind(113.5,116,w=>touch(1,S.beamPoint(t,-110,-8),'lever',w));bind(144.8,146.5,w=>touch(1,[1395,690],'stop',w));}
 if(name==='amber'){bind(143.85,144.1,w=>touch(1,[1382,642],'attempt',w));bind(128.5,132.1,w=>touch(1,[1170,710],'rescue',w));bind(144.8,146.5,w=>touch(1,[1405,690],'stop',w));}
 if(name==='hero'&&t>=76&&t<92){const w=smooth((t-76)/.4)*(1-smooth((t-91.5)/.5));touch(0,[shoulder[0]-35,shoulder[1]+22],'rope',w);}
 if(a.turnU>.48&&a.turnU<.56)for(let i=0;i<2;i++)if(!contacts.some(c=>c.index===(i?6:4)))armPoles[i]=f;

 if(name==='amber')for(const[lo,hi,i]of[[37.8,39,0],[125.5,125.9,1]])if(t>=lo-.2&&t<=hi+.2){const w=smooth((t-lo+.2)/.2)*(1-smooth((t-hi)/.2)),target=[s.cart.x+48,s.cart.y+25];feet[i]=feet[i].map((v,j)=>lerp(v,target[j],w));if(w>.999)contacts.push({index:i?10:8,target,kind:'foot-brake'});}
 const arms=hands.map((p,i)=>solve(shoulder,p,L[3],L[4],armPoles[i])),legs=feet.map(p=>solve(root,p,L[7],L[8],-f));const nodes=[root,shoulder,head,arms[0].joint,arms[0].end,arms[1].joint,arms[1].end,legs[0].joint,legs[0].end,legs[1].joint,legs[1].end];const p={nodes,head,r:R,root,contacts,feet:feet.map(p=>p.slice()),ground,mode,moving,errors:[...arms,...legs].map(q=>q.error)};poses[name].push(p);const record=RigAdapter.record(p,t,prevRecord);records[name].push(record);prevRecord=record;lastFeet=feet;lastMoving=moving;lastY=hipY;
 }
}
window.FILM_DATA={width:1920,height:1080,duration:150,cast:Object.fromEntries(S.names.map(n=>[n,{rgb:S.colors[n],hollow:n==='hero'}])),tracks:records};
S.poseAt=(n,t)=>poses[n][Math.min(poses[n].length-1,Math.max(0,Math.round(t*HZ)))];S.steps=steps;S.hz=HZ;S.poses=poses;
})();
