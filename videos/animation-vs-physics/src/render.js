(()=>{'use strict';const{canvas,ctx}=LegacyActor,W=1920,H=1080,D=FILM_DATA;
const circle=(x,y,r,c)=>{ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,Math.PI*2);ctx.fillStyle=c;ctx.fill();},line=(p,c,w=3)=>{ctx.beginPath();p.forEach((q,i)=>ctx[i?'lineTo':'moveTo'](...q));ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap=ctx.lineJoin='round';ctx.stroke();};
function snapshot(t){return SIM.states[Math.min(SIM.states.length-1,Math.max(0,Math.round(t*120)))];}
function view(s,t){const camera=Camera.at(s,t);ctx.translate(W/2,H/2);ctx.scale(camera.zoom,camera.zoom);ctx.rotate(-camera.rotation);ctx.translate(-camera.focus[0],-camera.focus[1]);return camera;}
function orb(s,t){const o=s.orb;if(!o.visible)return;const red=o.flashRed!==undefined&&t-o.flashRed<.35;ctx.save();ctx.shadowBlur=o.glow?18:0;ctx.shadowColor=red?'#ff294f':'#18a9ff';circle(o.x,o.y,o.r,red?'#ff3953':'#168fff');ctx.shadowBlur=0;circle(o.x-o.r*.24,o.y-o.r*.27,o.r*.22,'#b5edff');ctx.restore();}
function pulse(center,age,color,maxRadius=2000){if(age<0||age>1.4)return;ctx.save();ctx.globalAlpha=1-age/1.4;ctx.beginPath();ctx.arc(...center,Math.max(.1,age*maxRadius),0,Math.PI*2);ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke();ctx.restore();}
function draw(t){t=V.clamp(t,0,D.duration-1e-7);const s=snapshot(t);ctx.reset();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.save();view(s,t);
 line([[-2000,810],[5000,810]],s.flags.pulse&&t-s.flags.pulse<.5?'#259dff':'#111111',3);
 if(s.flags.pulse!==undefined)pulse([1100,801],t-s.flags.pulse,'#41aaff');
 if(s.cube.visible){ctx.fillStyle=s.cube.response==='inverted'?'#9958d6':'#a2a8af';ctx.fillRect(s.cube.x-32.5,s.cube.y-32.5,65,65);}
 orb(s,t);LegacyActor.draw('hero',t);ctx.restore();}
window.SceneView={draw,snapshot,view,ctx,canvas,circle,line,pulse};
})();
