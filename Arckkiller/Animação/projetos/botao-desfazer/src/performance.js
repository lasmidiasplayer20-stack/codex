/* New acting layer; original FK, model profile and drawing functions are retained. */
(()=>{'use strict';const S=Story,{clamp,mix,ease,TAU}=S,parents=[-1,0,1,1,3,1,5,0,7,0,9],r=Model.radius*MODEL_UNIT,L=[0,Model.torso,Model.neck,...Model.arm,...Model.arm,...Model.leg,...Model.leg].map(v=>v*MODEL_UNIT),HZ=120;
const styles={idle:[-90,[-15,43],[15,43]],look:[-88,[-18,40],[25,30]],watch:[-90,[-20,40],[25,35]],inspect:[-63,[30,25],[40,12]],point:[-85,[-10,43],[47,-8]],idea:[-93,[-14,42],[20,-35]],alarm:[-100,[-36,-28],[38,-20]],reach:[-77,[33,8],[47,0]],catch:[-85,[35,-3],[40,15]],carry:[-83,[26,20],[35,16]],place:[-55,[25,32],[40,32]],grab:[-48,[20,42],[38,38]],push:[-65,[40,18],[45,5]],pull:[-110,[37,15],[43,4]],brace:[-82,[35,8],[43,-8]],press:[-70,[38,3],[43,20]],brake:[-52,[25,33],[39,27]],run:[-76,[-24,25],[24,25]],hop:[-80,[-30,-25],[33,-24]],float:[-94,[-38,2],[38,-10]],protect:[-93,[-20,-34],[20,-34]],land:[-55,[-30,25],[35,25]],shrug:[-90,[-42,0],[42,0]],remote:[-84,[-15,44],[35,15]],kick:[-115,[-35,-15],[38,-20]],prepare:[-48,[-25,24],[25,24]],offer:[-78,[30,12],[45,8]],nod:[-77,[-13,40],[24,36]],clap:[-90,[13,-10],[15,-10]],dance:[-90,[-40,-22],[40,-22]],laugh:[-68,[20,20],[25,27]],wave:[-90,[-15,45],[24,-40]]};
function ik(root,target,l1,l2,pole){const dx=target[0]-root[0],dy=target[1]-root[1],raw=Math.hypot(dx,dy),d=clamp(raw,.05,l1+l2-.001),ang=Math.atan2(dy,dx),a=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1));return{joint:[root[0]+Math.cos(ang+pole*a)*l1,root[1]+Math.sin(ang+pole*a)*l1],end:[root[0]+Math.cos(ang)*d,root[1]+Math.sin(ang)*d],error:Math.max(0,raw-d)};}
const tracks=FILM_DATA.tracks,contactChecks=[],steps=[];let maxReachError=0;
for(const [ni,name]of S.names.entries()){const out=[];let prevRoot=null,prevFeet=null,dist=0,cycle=[null,null],plant=[0,0],swing=[0,0],movingBefore=false,previousAngles=null,velocity=0;
 for(let frame=0;frame<=210*HZ;frame++){const t=frame/HZ,s=S.snapshot(t),a=s.actors[name],q=s.q,idx=a.u>.5?1:0,pose=styles[a.pose]||styles.idle,from=styles[a.a[3]]||styles.idle,to=styles[a.b[3]]||styles.idle,blend=ease(clamp((a.u-.25)/.5)),style=from.map((v,i)=>i===0?mix(v,to[i],blend):v.map((x,j)=>mix(x,to[i][j],blend))),f=a.f;
 const dx=prevRoot?a.x-prevRoot[0]:0,v=dx*HZ;velocity=mix(velocity,v,.12);const speed=Math.abs(velocity),ground=a.y>712,walk=ground&&speed>12,turn=Math.min(1,Math.abs(v)/180);dist+=Math.abs(dx);const phase=dist/103,breath=Math.sin(t*3.2+ni)*.7;
 let hipY=a.y+12*ease((a.y-690)/42)+breath+(walk?Math.sin(phase*TAU*2)*1.8:0);if(a.pose==='dance')hipY-=Math.abs(Math.sin(t*6+ni))*9;if(a.pose==='laugh')hipY+=Math.sin(t*12+ni)*2;
 const root=[a.x,hipY],rot=a.rotation,body=(-90+(style[0]+90)*f+clamp(velocity*.04,-9,9))*Math.PI/180+rot,shoulder=[root[0]+Math.cos(body)*L[1],root[1]+Math.sin(body)*L[1]],gaze=clamp((s.cake.x-root[0])*.0009,-.2,.2),neck=-Math.PI/2+gaze+rot*.3,head=[shoulder[0]+Math.cos(neck)*L[2],shoulder[1]+Math.sin(neck)*L[2]];
 const feet=[];for(let i=0;i<2;i++){const u=(phase+i*.5)%1,cy=Math.floor(phase+i*.5),dir=Math.abs(velocity)>2?Math.sign(velocity):f;if(!ground){feet[i]=[root[0]+(i?24:-24)+Math.sin(t*5+ni+i)*7,root[1]+50+Math.sin(t*5+ni+i)*13];cycle[i]=null;}
 else if(walk){if(cycle[i]===null||!movingBefore){plant[i]=prevFeet?prevFeet[i][0]:root[0]+(i?16:-16);swing[i]=plant[i];cycle[i]=cy;}if(cycle[i]!==cy){cycle[i]=cy;plant[i]=root[0]+dir*24;steps.push({t,name,x:plant[i],y:814,type:'step',power:.25});}if(u<.56){feet[i]=[plant[i],814];swing[i]=plant[i];}else{const w=(u-.56)/.44;feet[i]=[mix(swing[i],root[0]+dir*27,ease(w)),814-Math.sin(w*Math.PI)*19];}}
 else{const desired=root[0]+(i?17:-17);feet[i]=[prevFeet?mix(prevFeet[i][0],desired,.045):desired,814];cycle[i]=null;}
 const maxX=Math.sqrt(Math.max(0,(L[7]+L[8]-.12)**2-(feet[i][1]-root[1])**2));feet[i][0]=clamp(feet[i][0],root[0]-maxX,root[0]+maxX);
 }
 const kickW=(a.a[3]==='kick'?1-blend:0)+(a.b[3]==='kick'?blend:0);if(kickW>0){const k=kickW;feet[1]=[root[0]+f*58*k,root[1]+72-48*k];}
 const hands=style.slice(1).map((p,i)=>{let x=p[0]*f,y=p[1];if(walk){x+=Math.sin(phase*TAU+i*Math.PI)*22*Math.min(1,speed/100);y-=Math.abs(Math.sin(phase*TAU))*6;}if(a.pose==='clap'){x=(i?1:-1)*(10+8*(1+Math.sin(t*12)));y=-3;}if(a.pose==='wave'&&i===1){x+=Math.sin(t*11)*10;y-=Math.sin(t*11)*4;}if(a.pose==='dance'){x+=Math.sin(t*6+ni+i*Math.PI)*16;y+=Math.cos(t*6+ni)*12;}return[shoulder[0]+x*Math.cos(rot)-y*Math.sin(rot),shoulder[1]+x*Math.sin(rot)+y*Math.cos(rot)];});
 const remoteW=name==='amber'?((['remote','offer'].includes(a.a[3])?1-blend:0)+(['remote','offer'].includes(a.b[3])?blend:0)):0;if(remoteW)hands[1]=hands[1].map((v,j)=>mix(v,[shoulder[0]+f*33,shoulder[1]+18][j],remoteW));
 // Explicit reachable two-handed cake grips during the three handoffs.
 let holding=(name==='ink'&&((q>=14&&q<=18)||(q>=129&&q<=140)))||(name==='cyan'&&q>=162&&q<=168)||(name==='amber'&&q>=171&&q<=174);
 if(holding){const side=root[0]<s.cake.x?-1:1,targets=[[side*45,18],[side*36,20]].map(p=>[s.cake.x+p[0],s.cake.y+p[1]]);const max=L[3]+L[4]-.2;
 for(let i=0;i<2;i++){const target=targets[i],d=Math.hypot(target[0]-shoulder[0],target[1]-shoulder[1]);if(d<max)hands[i]=target;}
 }
 const arms=hands.map((p,i)=>ik(shoulder,p,L[3],L[4],i?-1:1)),legs=feet.map((p,i)=>ik(root,p,L[7],L[8],f<0?1:-1)),nodes=[root,shoulder,head,arms[0].joint,arms[0].end,arms[1].joint,arms[1].end,legs[0].joint,legs[0].end,legs[1].joint,legs[1].end];
 maxReachError=Math.max(maxReachError,...arms.map(a=>a.error));
 const angles=Array(11).fill(0),absolute=Array(11).fill(0);for(let j=1;j<11;j++){const p=parents[j];absolute[j]=Math.atan2(nodes[j][1]-nodes[p][1],nodes[j][0]-nodes[p][0]);angles[j]=j===1?absolute[j]:absolute[j]-(p===0?absolute[1]:absolute[p]);if(previousAngles){while(angles[j]-previousAngles[j]>Math.PI)angles[j]-=TAU;while(angles[j]-previousAngles[j]<-Math.PI)angles[j]+=TAU;}}
 // Bounded angular velocity softens reaches, landings and changes of elbow side.
 if(previousAngles)for(let j=1;j<11;j++)angles[j]=previousAngles[j]+clamp((angles[j]-previousAngles[j])*.22,-.045,.045);
 const reconstructed=[[...root]],absoluteSmooth=[0];for(let j=1;j<11;j++){const p=parents[j];absoluteSmooth[j]=j===1?angles[j]:(p===0?angles[1]:absoluteSmooth[p])+angles[j];reconstructed[j]=[reconstructed[p][0]+Math.cos(absoluteSmooth[j])*L[j],reconstructed[p][1]+Math.sin(absoluteSmooth[j])*L[j]];}
 out.push({t,head:reconstructed[2],r,angles,lengths:L.map(v=>v/r),shape:[r,r,0],segment:0,quality:1});previousAngles=angles;prevRoot=root;prevFeet=legs.map(l=>l.end);movingBefore=walk;
 }
 tracks[name]=out;
}
window.PerformanceData={lengths:L,parents,steps,maxReachError,hz:HZ,preservedFK:true};
})();
