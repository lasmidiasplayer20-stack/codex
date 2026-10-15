/* Authored injury shapes, impact specks and ground stains; no source imagery. */
(()=>{'use strict';const{ctx,rect,line,circle,rand}=Art;
function draw(t,f){const p=f.pair.orange;if(!p||t<67.5)return;const h=p.head,r=p.r,level=t<72.583333?.38:1;ctx.save();ctx.translate(...h);
 // A split at the upper rim, followed by fine cracks across the remaining ring.
 ctx.beginPath();ctx.moveTo(-r*.74,-r*.69);for(let i=0;i<12;i++)ctx.lineTo(-r*.74+i*r*.12,-r*(.7+rand(i+3)*.23));ctx.lineTo(r*.57,-r*.28);ctx.lineTo(r*.16,-r*.35);ctx.lineTo(0,-r*.1);ctx.lineTo(-r*.18,-r*.41);ctx.lineTo(-r*.62,-r*.32);ctx.closePath();ctx.fillStyle=p.color;ctx.fill();
 for(let i=0;i<6;i++){const x=(-.65+i*.25)*r;line([[x,-r*.91],[x+r*.06,-r*.6],[x-r*.05,-r*.27]],'#771421',r*.025*level);}
 line([[r*.5,-r*.82],[r*.73,-r*.56],[r*.95,-r*.23],[r*.84,r*.17]],'#731322',r*.045*level);line([[-r*.76,r*.34],[-r*.63,r*.69],[-r*.46,r*.78]],'#771421',r*.045*level);
 ctx.restore();const intensity=Rig.clamp((t-67.5)/.3,0,1);ctx.save();ctx.globalAlpha=intensity;for(let i=0;i<30;i++){const x=h[0]+r*.6+rand(i*17)*115,y=h[1]+rand(i*23)*24;rect(x,y,1+rand(i*7)*3,.7+rand(i*31)*1.5,'#71091b');}line([[h[0]+r*.3,h[1]+r*.72],[h[0]+r*1.5,h[1]+r*.55],[h[0]+r*2.2,h[1]+r*.9],[h[0]+r*3.1,h[1]+r*.8]],'#720a1c',1.2);
 for(const hit of[72.583333,73.583333]){const dt=t-hit;if(dt>=0&&dt<.22){ctx.globalAlpha=1-dt/.22;for(let i=0;i<12;i++){const a=-Math.PI+rand(i*9)*Math.PI,v=40+rand(i*3)*85;circle(h[0]+Math.cos(a)*v*dt,h[1]-r*.7+Math.sin(a)*v*dt+100*dt*dt,.6+rand(i)*1.1,'#bd132f');}}}ctx.restore();}
window.Damage={draw};
})();
