(()=>{'use strict';const A=Art,R=Rig;
function frame(t){const f=Battle.frame(t);if(t>=PART.weaponEnd)f.weapon=null;return f;}
function draw(t){if(t<PART.weaponEnd){Battle.draw(t);return;}const{ctx,canvas,W,H}=A;ctx.reset();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);
 if(t>=PART.cardStart){A.rect(0,0,W,H,'#000');ctx.fillStyle='#fff';ctx.font='18px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('To be continued',W/2,H/2);return;}
 const f=frame(t),c=f.camera;A.background(c);ctx.save();ctx.translate(c.x,c.y);ctx.scale(c.scale,c.scale);Battle.stage(t);for(const p of Object.values(f.pair))A.actor(p);Damage.draw(t,f);ctx.restore();}
window.Director={draw,frame,actors:Battle.actors,weapon:t=>frame(t).weapon};
})();
