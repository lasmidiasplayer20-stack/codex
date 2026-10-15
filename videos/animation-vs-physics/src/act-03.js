/* Takes 16–25. Explicit field rules and constraints extend the existing character. */
(()=>{'use strict';const P=Physics,{add,sub,mul,rot,clamp,smooth,lerp}=V;
window.Act03={extend(H){const{at,pose,goal,turn,walk,gravity}=H,local=(s,b)=>s.stage.local([b.x,b.y]),velocity=(s,b)=>rot([b.vx,b.vy],-s.stage.angle),vel=(s,b,v)=>{const w=s.stage.vector(v);b.vx=w[0];b.vy=w[1];};
 at(75,s=>{s.flags.idea=false;s.flags.charge=75;s.orb.drive=null;s.orb.gravityScale=0;s.orb.vx=s.orb.vy=0;P.drive(s,s.orb,s.stage.world([1160,560]),3);goal(s,[800,732.15],1.3);walk(s,true,-1);pose(s,'stand',.3);P.log(s,'energy-build');},'orb-transformation');
 at(76.3,s=>{walk(s,false);goal(s,[800,725.65],.4);pose(s,'alarm',.5);},'back-away-from-energy');
 at(80.2,s=>{s.flags.wave1=s.t;gravity(s,[0,-900]);s.char.drive=null;s.char.gravityScale=1;vel(s,s.char,[0,-60]);pose(s,'float',.2);P.log(s,'chaos-wave',{rule:'inverted-gravity'});},'first-chaos-wave');
 at(80.85,s=>{gravity(s,[0,900]);},'gravity-wave-passes');
 at(81.3,s=>{s.flags.wave2=s.t;const v=velocity(s,s.char);vel(s,s.char,[-180,v[1]]);pose(s,'panic',.2);P.log(s,'chaos-wave',{rule:'leftward-impulse'});},'second-chaos-wave');
 at(82.1,s=>{s.flags.wave3=s.t;s.flags.chaosBounce=true;s.char.restitution=1.05;P.log(s,'chaos-wave',{rule:'superelastic-floor'});},'third-chaos-wave');
 at(84.6,s=>{gravity(s,[0,0]);s.char.restitution=0;s.char.drag=0;s.flags.ice=true;s.flags.chaosBounce=false;},'neutral-region');
 at(85,s=>{const q=local(s,s.char),v=velocity(s,s.char);s.flags.cubeHover=true;s.cube.drive=null;s.cube.gravityScale=0;s.cube.drag=0;P.drive(s,s.cube,s.stage.world([q[0]+v[0]*.6+64,q[1]-34]),.6);pose(s,'grab',.6);turn(s,0,.6);},'passing-cube');
 at(85.65,s=>{const q=local(s,s.char),b=local(s,s.cube);s.flags.tether={t:s.t,offset:sub(q,b)};s.char.drive=null;s.char.handContact='cubeLeft';s.char.walk=false;s.char.gravityScale=0;s.cube.drive=null;s.cube.drag=2;s.cubeFriction=0;const d=90-s.t,den=d-(1-Math.exp(-2*d))/2;s.flags.tetherForce=2*s.cube.mass*(930-b[0])/den;pose(s,'stretched',.9);turn(s,90,.9);P.log(s,'inverted-tether',{mass:s.cube.mass,actualForce:s.flags.tetherForce});},'grab-and-accelerate');
 at(90,s=>{s.flags.tether=null;s.char.handContact=null;vel(s,s.char,velocity(s,s.cube));s.char.gravityScale=0;s.cube.drag=0;s.flags.cubeHover=false;s.flags.cubeDrop=true;s.cubeFriction=.25;s.flags.approachKick=true;s.flags.inertiaRelease=s.t;P.log(s,'inertia-release',{velocity:velocity(s,s.char)});},'release-cube-inertia');
 at(90.1,s=>{pose(s,'kick',.8);turn(s,-90,.8);},'feet-forward');
 at(95,s=>{s.timeScale=.15;s.flags.slowStart=s.t;pose(s,'point',.9);turn(s,0,.9);P.log(s,'time-scale',{value:.15});},'slow-motion');
 at(100,s=>{s.flags.watchParticles=true;},'study-fragments');
 at(102,s=>{s.char.handContact='particle';P.log(s,'particle-touch');},'touch-particle');
 at(102.2,s=>{s.char.handContact=null;const p=s.particles[0];if(p){p.vx+=145;p.vy-=95;p.deflected=true;}s.flags.palmVector=s.t;P.log(s,'particle-deflected',{deltaVelocity:[145,-95]});},'deflect-particle');
 at(105,s=>{s.timeScale=1;s.flags.slowEnd=s.t;gravity(s,[0,900]);s.char.gravityScale=1;s.char.restitution=0;s.flags.ice=true;s.flags.palmVector=null;s.flags.plan=true;pose(s,'slip',.4);const n=s.stage.vector([1,0]),point=s.stage.world([-260,0]);s.planes.push({id:'planWall',n,point});P.log(s,'time-scale',{value:1});},'normal-speed-plan');
 at(107.1,s=>{const c=local(s,s.cube);goal(s,[c[0]-80,732.15],1.45);walk(s,true,1);pose(s,'stand',.25);},'aim-for-cube');
 at(108.55,s=>{walk(s,false);const c=local(s,s.cube);goal(s,[c[0]-80,770.914],.4);pose(s,'push',.4);turn(s,0,.35);},'brace-launch');
 at(109.12,s=>{s.char.handContact='cubeLeft';},'grip-launch-edge');
 at(109.65,s=>{s.char.handContact=null;s.flags.cubeDrop=false;s.cube.gravityScale=0;s.cube.drag=0;s.cubeFriction=0;s.cube.drive=null;const a=local(s,s.cube),b=local(s,s.orb),v=mul(sub(b,a),1/1.2);vel(s,s.cube,v);s.flags.launched=true;P.log(s,'inverted-cube-launch',{appliedImpulse:mul(v,-s.cube.mass),actualImpulse:mul(v,s.cube.mass),mass:s.cube.mass});pose(s,'brace',.3);},'launch-at-orb');
 at(114.84,s=>{s.flags.whiteFlash=s.t;P.log(s,'white-flash');},'brief-white-flash');
 at(115,s=>{s.stage=P.stage();s.gravity=[0,900];s.timeScale=1;s.planes=[{id:'floor',n:[0,-1],point:[0,810],minX:-10000,maxX:5000}];Object.assign(s.char,{x:900,y:775,vx:0,vy:0,angle:-Math.PI/2,omega:0,drive:null,angularDrive:null,walk:false,handContact:null,footContact:null,gravityScale:1,restitution:0,drag:0});pose(s,'back',0);Object.assign(s.orb,{x:1050,y:801,vx:0,vy:0,r:9,glow:0,drive:null,gravityScale:1});s.cube.visible=false;s.particles=[];s.flags={reset:115,whiteFlash:114.84};P.log(s,'explicit-reset-cut',{gravity:[0,900]});},'normal-world-revealed');
 at(116,s=>{goal(s,[900,775.5],.8);turn(s,-25,.8);pose(s,'crouch',.8);},'sit-up');
 at(117,s=>{goal(s,[900,725.65],.7);turn(s,0,.7);pose(s,'stand',.7);},'stand-calmly');
 at(118.5,s=>{s.char.drive=null;s.char.vy=-230;pose(s,'float',.15);P.log(s,'test-jump');},'normal-test-jump');
 at(119.15,s=>{pose(s,'stand',.3);},'relief');
 at(120,s=>{goal(s,[1080,732.15],1.65);walk(s,true,1);},'three-last-steps');
 at(121.65,s=>{walk(s,false);goal(s,[1080,725.65],.3);pose(s,'idea',.3);s.flags.greenPulse=s.t;P.log(s,'green-pulse');},'green-flash-stop');
 at(122.35,s=>{const p=RigAdapter.pose(s,s.t).head;Object.assign(s.apple,{x:p[0],y:p[1]-650,vx:0,vy:0,visible:true,r:12});P.log(s,'apple-drop');},'apple-falls');
 at(124.85,s=>{s.flags.blackCut=true;P.log(s,'black-cut');},'instant-black-ending');
 return{duration:125,setup(s){const before=s.beforePhysics,after=s.afterPhysics,impact=s.onCharacterImpact;s.onCharacterImpact=(plane,speed)=>{impact?.(plane,speed);if(s.flags.chaosBounce&&(plane.id==='right'||plane.id==='floor')){const v=velocity(s,s.char);vel(s,s.char,[v[0],-615]);s.flags.chaosBounce=false;s.char.restitution=0;s.flags.compressAt=s.t;P.log(s,'chaos-floor-bounce',{launchSpeed:615});}if(s.flags.plan&&plane.id==='planWall'&&!s.flags.planRicochet){const v=velocity(s,s.char);vel(s,s.char,[420,v[1]]);s.flags.planRicochet=s.t;s.char.restitution=0;pose(s,'float',.3);P.log(s,'plan-ricochet',{incoming:speed,outgoing:420});}};
 s.beforePhysics=()=>{before?.();if(s.flags.charge!==undefined&&s.t<115){s.orb.r=lerp(9,27,smooth((s.t-75)/4));}if(s.flags.tether){const b=local(s,s.cube),v=velocity(s,s.cube),f=s.stage.vector([s.flags.tetherForce,s.cube.mass*clamp((560-b[1])*18-v[1]*8,-700,700)]);s.cube.fx=f[0];s.cube.fy=f[1];}else if(s.flags.cubeDrop){const f=s.stage.vector([0,s.cube.mass*900]);s.cube.fx+=f[0];s.cube.fy+=f[1];}};
 s.afterPhysics=()=>{after?.();if(s.flags.tether){const old=[s.char.x,s.char.y],q=local(s,s.cube),u=smooth((s.t-s.flags.tether.t)/.9),off=s.flags.tether.offset.map((v,i)=>lerp(v,[-125,0][i],u));off[0]-=10*Math.sin(Math.PI*u);const a=s.stage.world(add(q,off));s.char.x=a[0];s.char.y=a[1];s.char.vx=(a[0]-old[0])/P.STEP;s.char.vy=(a[1]-old[1])/P.STEP;}
 if(s.flags.approachKick&&!s.flags.kickLatch){const a=local(s,s.char),b=local(s,s.orb);if(a[0]>=b[0]-s.orb.r-78){s.char.footContact='doubleOrb';s.flags.kickLatch=s.t;P.log(s,'double-kick-contact');}}
 if(s.flags.kickLatch&&!s.flags.doubleKick&&s.t-s.flags.kickLatch>=.09){s.char.footContact=null;s.flags.approachKick=false;s.flags.doubleKick=s.t;vel(s,s.char,[-210,-30]);const q=local(s,s.orb);P.drive(s,s.orb,s.stage.world([q[0]+16,q[1]]),.3);s.flags.shock=s.t;pose(s,'panic',.3);P.log(s,'double-kick');for(let i=0;i<22;i++){const angle=i*2.399963,p=i===0?add(local(s,s.char),[25,-50]):add(local(s,s.orb),[Math.cos(angle)*20,Math.sin(angle)*20]),w=s.stage.world(p),v=s.stage.vector(i===0?[-208,-28]:[-100+Math.cos(angle)*90,Math.sin(angle)*90]);s.particles.push({x:w[0],y:w[1],vx:v[0],vy:v[1],r:i===0?4:2+i%3,seed:i});}}
 if(s.flags.launched&&!s.flags.decisive){const a=local(s,s.cube),b=local(s,s.orb),half=s.cube.size/2,near=[clamp(b[0],a[0]-half,a[0]+half),clamp(b[1],a[1]-half,a[1]+half)];if(Math.hypot(...sub(b,near))<=s.orb.r){s.flags.decisive=s.t;s.cube.vx=s.cube.vy=0;s.orb.drive=null;vel(s,s.char,[-80,-100]);turn(s,-90,.55);pose(s,'back',.4);P.log(s,'decisive-collision',{cube:a,orb:b,centerlineError:Math.abs((b[0]-a[0])*(s.flags.launchDY||0))});}}
 if(s.apple.visible&&!s.flags.appleHit){const p=RigAdapter.pose(s,s.t),d=sub([s.apple.x,s.apple.y],p.head);if(s.apple.vy>0&&Math.hypot(...d)<=s.apple.r+p.r){s.apple.y=p.head[1]-p.r-s.apple.r;s.apple.vy=-80;s.apple.vx=-45;s.flags.appleHit=s.t;s.char.handContact='protect';pose(s,'protect',.3);goal(s,[1080,760],.3);turn(s,0,.3);P.log(s,'apple-hit');}}
 };
 }};
}};
})();
