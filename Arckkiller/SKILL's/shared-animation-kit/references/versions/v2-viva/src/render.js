(()=>{'use strict';const{canvas,ctx}=LegacyActor,W=1920,H=1080,D=FILM_DATA;
const circle=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.fillStyle=c;ctx.fill();},line=(p,c,w=3)=>{ctx.beginPath();p.forEach((q,i)=>ctx[i?'lineTo':'moveTo'](...q));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap=ctx.lineJoin='round';ctx.stroke();};
function snapshot(t){return SIM.states[Math.min(SIM.states.length-1,Math.max(0,Math.round(t*120)))];}
function view(s,t){const camera=Camera.at(s,t);ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.rotate(-camera.rotation);ctx.translate(-camera.focus[0],-camera.focus[1]);return camera;}
function orb(s,t){const o=s.orb;if(!o.visible)return;const red=o.flashRed!==undefined&&t-o.flashRed<.35;ctx.save();ctx.shadowBlur=o.glow?18:0;ctx.shadowColor=red?'#ff294f':'#18a9ff';const st=SceneEffects.orbStyle(s,t);circle(o.x,o.y,st.r,red?'#ff3953':st.color);ctx.shadowBlur=0;circle(o.x-st.r*.24,o.y-st.r*.27,st.r*.22,'#b5edff');ctx.restore();}
function pulse(center,age,color,maxRadius=2000){if(age<0||age>1.4)return;ctx.save();ctx.globalAlpha=1-age/1.4;ctx.beginPath();ctx.arc(...center,Math.max(.1,age*maxRadius),0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke();ctx.restore();}
function draw(t){t=V.clamp(t,0,D.duration-1e-7);const s=snapshot(t);ctx.reset();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);const camera=Camera.at(s,t);LivingWorld.background(ctx,s,t,W,H,camera);ctx.save();view(s,t);LivingWorld.environment(ctx,s,t,camera);
 if(t>=32.35&&t<45){ctx.save();ctx.globalAlpha=.24;line([[1435,810],[3800,810]],'#32b7ff',8);ctx.restore();}
 if(!SceneEffects.floor(ctx,s,t,line))line([[6500,-20000],[6500,20000]],'#111111',3);
 if(s.flags.wallHit!==undefined&&t-s.flags.wallHit<1.2){ctx.save();ctx.globalAlpha=1-(t-s.flags.wallHit)/1.2;line([[3800,-100],[3800,810]],'#229dff',5);ctx.restore();}
 line([[-2000,810],[5000,810]],s.flags.pulse&&t-s.flags.pulse<.5?'#259dff':'#111111',3);
 if(s.flags.lateral!==undefined){pulse([1495,801],t-s.flags.lateral,'#209fff');const age=t-s.flags.lateral;if(age>=0&&age<1){const x=s.char.x,y=s.char.y-90;line([[x-60,y],[x+70,y]],'#209fff',5);line([[x+45,y-18],[x+70,y],[x+45,y+18]],'#209fff',5);}}
 if(s.flags.purplePulse!==undefined)pulse([s.orb.x,s.orb.y],t-s.flags.purplePulse,'#a45cda');
 if(s.flags.pulse!==undefined)pulse([1100,801],t-s.flags.pulse,'#41aaff');
 LivingWorld.energy(ctx,s,t,camera);SceneEffects.behind(ctx,s,t,{line,circle,pulse});LivingWorld.cube(ctx,s,t);LivingWorld.orb(ctx,s,t);LegacyActor.draw('hero',t);if(s.flags.idea&&t>=73){const hand=ElasticRig.at('hero',t).nodes[6],d=V.rot([0,-9],s.stage.angle);line([hand,V.add(hand,d)],'#111',2);}
 SceneEffects.front(ctx,s,t,{line,circle,pulse});LivingWorld.impacts(ctx,s,t,camera);LivingWorld.actingAccents(ctx,s,t,camera);ctx.restore();LivingWorld.finish(ctx,s,t,W,H);SceneEffects.overlay(ctx,s,t,W,H);}
window.SceneView={draw,snapshot,view,ctx,canvas,circle,line,pulse};
})();
