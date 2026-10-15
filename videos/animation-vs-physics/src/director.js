/* Persistent event director. All state changes and deliberately impossible rules are explicit. */
(()=>{'use strict';const{rot,add,sub,mul,smooth,clamp,rad}=V,P=Physics;const FLOOR=810,STAND=725.65,WALK=732.15;
function build(){const events=[];const at=(t,fn,label)=>events.push({t,fn,label});
 const pose=(s,name,d=.35)=>RigAdapter.setPose(s,name,s.t,d),goal=(s,p,d)=>P.drive(s,s.char,s.stage.world(p),d),turn=(s,a,d)=>{s.char.angularDrive={start:s.t,end:s.t+d,from:s.char.angle,to:s.stage.angle+rad(a)};},walk=(s,on=true,dir=1)=>{s.char.walk=on;if(on){s.char.walkDistance=0;s.char.walkOrigin=s.stage.local([s.char.x,s.char.y])[0];s.char.walkStart=s.t;s.char.walkDirection=dir;}},gravity=(s,v)=>{s.gravity=s.stage.vector(v);P.log(s,'gravity',{vector:s.gravity.slice()});};
 at(0,s=>{s.char.x=350;goal(s,[900,WALK],4.1);walk(s);s.orb.visible=false;},'walk-in');
 at(4.1,s=>{walk(s,false);goal(s,[900,STAND],.45);pose(s,'stand');},'stop');
 at(5,s=>{Object.assign(s.orb,{visible:true,x:1100,y:-30,vx:0,vy:0,state:'falling'});P.log(s,'orb-drop');},'orb-enters');
 at(6.20,s=>{goal(s,[855,STAND+3],.3);pose(s,'alarm',.22);P.log(s,'startle');},'startle');
 at(7.4,s=>{pose(s,'stand',.7);goal(s,[915,STAND],1.0);},'inspect');
 at(9,s=>{goal(s,[1020,775.5],1.7);pose(s,'crouch',1.7);},'kneel');
 at(10.7,s=>{goal(s,[1040,775.5],.45);},'reach');
 at(11.1,s=>{s.char.handContact='orb';},'finger-contact');
 at(11.25,s=>{gravity(s,[0,0]);s.char.drive=null;s.char.vx=0;s.char.vy=-135;s.char.drag=.65;s.orb.vy=-120;s.orb.drag=.65;s.orb.restitution=0;s.orb.state='levitating';s.flags.pulse=11.25;P.log(s,'blue-pulse');pose(s,'float',1.2);},'gravity-off');
 at(11.38,s=>{s.char.handContact=null;},'finger-released');
 at(15,s=>{s.char.drag=0;s.orb.drag=0;s.char.swimming=true;s.char.omega=.24;},'swim-no-propulsion');
 at(19.5,s=>{s.char.swimming=false;pose(s,'float',.45);s.char.omega=0;},'notice-orb');
 at(20.55,s=>{s.char.footContact='orb';s.char.footContactStart=s.t;},'kick-contact');
 at(21,s=>{const oldPose=RigAdapter.pose(s,s.t);s.char.releasedFoot={p:oldPose.nodes[10].slice(),t:s.t};s.char.footContact=null;const impulse=800;s.orb.vx-=impulse/s.orb.mass;s.char.vx+=impulse/s.char.mass;s.flags.kickTime=s.t;P.log(s,'kick',{impulse,characterDeltaV:impulse/s.char.mass,orbDeltaV:-impulse/s.orb.mass});s.char.omega=-.55;pose(s,'panic',.3);},'reaction-impulse');
 at(21.12,s=>{s.char.footContact=null;},'kick-release');
 at(25.1,s=>{s.orb.vx=1850;s.orb.vy=230;s.orb.state='returning';s.orb.drag=0;P.log(s,'orb-return');},'orb-return');
 let gravityRestored=false;
 const setup=s=>{s.onOrbImpact=(plane,speed)=>{if(s.orb.state==='returning'&&!gravityRestored){gravityRestored=true;gravity(s,[0,900]);s.orb.vx=0;s.orb.vy=0;s.orb.state='idle';s.orb.flashRed=s.t;s.char.drag=0;s.char.restitution=.22;s.char.omega=0;turn(s,-90,.55);pose(s,'back',.4);P.log(s,'red-flash');}};s.onCharacterImpact=(plane,speed)=>{if(s.t>26&&s.t<30){s.char.restitution=0;P.log(s,'back-landing');}};};
 at(28.5,s=>{pose(s,'headLift',.5);s.flags.headLift=true;},'head-lift');
 return{events:events.sort((a,b)=>a.t-b.t),setup,implementedThrough:30,helpers:{at,pose,goal,turn,walk,gravity}};}
function simulate(maxDuration){const def=build(),duration=maxDuration||def.implementedThrough,s=P.create(),track=[],states=[],collisions=[],contactErrors=[];def.setup(s);let index=0,previous;
 for(let i=0;i<=Math.round(duration/P.STEP);i++){s.t=i*P.STEP;while(index<def.events.length&&def.events[index].t<=s.t+1e-7){const e=def.events[index++];e.fn(s);P.log(s,'beat',{label:e.label});}const pose=P.step(s),r=RigAdapter.record(pose,s.t,previous);track.push(r);previous=r;
 if(pose.contact){const error=Math.max(...pose.contact.indices.map((j,k)=>Math.hypot(...sub(pose.nodes[j],pose.contact.targets[k]))));contactErrors.push({t:s.t,kind:pose.contact.kind,error});}
 states.push({t:s.t,char:{x:s.char.x,y:s.char.y,vx:s.char.vx,vy:s.char.vy,angle:s.char.angle,grounded:s.char.grounded,pose:s.char.poseName,handContact:s.char.handContact,walk:s.char.walk,swimming:s.char.swimming},orb:{x:s.orb.x,y:s.orb.y,vx:s.orb.vx,vy:s.orb.vy,r:s.orb.r,visible:s.orb.visible,glow:s.orb.glow,state:s.orb.state,flashRed:s.orb.flashRed},cube:{x:s.cube.x,y:s.cube.y,visible:s.cube.visible,size:s.cube.size,response:s.cube.response},apple:{x:s.apple.x,y:s.apple.y,visible:s.apple.visible},particles:s.particles.map(p=>({...p})),gravity:s.gravity.slice(),stage:{angle:s.stage.angle,origin:s.stage.origin.slice()},flags:{...s.flags},timeScale:s.timeScale,poseNodes:pose.nodes});
 }
 return{duration,track,states,events:s.events,contactErrors};}
window.Director={simulate,build};
})();
