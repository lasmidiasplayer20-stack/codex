(()=>{'use strict';
const P=PART,A=Art,R=Rig;
function actors(t){return Object.fromEntries(Object.entries(P.tracks).map(([name,track])=>[name,R.at(track,t)]));}
function weapon(t,pair=actors(t)){const p=pair.green;if(!p)return null;const angle=R.radians(R.value(P.phone,t,'angle')),b=p.nodes[4],a=R.add(b,R.polar(angle,P.phoneLength));return {a,b:b.slice(),kind:'inspection-device'};}
function frame(t){const pair=actors(t);return {pair,weapon:weapon(t,pair),camera:P.camera(t,pair)};}
function draw(t){t=R.clamp(t,P.start,P.end-1e-6);const {ctx,canvas,W,H}=A;ctx.reset();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);const f=frame(t),c=f.camera;A.background(c);ctx.save();ctx.translate(c.x,c.y);ctx.scale(c.scale,c.scale);A.rect(-3000,420,7000,2000,'#0d0e0f');Clinic.hospital(P.hospital);ctx.save();ctx.translate(763,-24);A.viscera();ctx.restore();A.sword({a:[1097,480],b:[1050,428]});Clinic.blood(t);
 if(f.pair.green){Clinic.skin(f.pair.green,t);if(t>=P.skeletonStart)Clinic.skeleton(f.pair.green);else A.actor(f.pair.green);}A.actor(f.pair.orange);if(f.weapon){Clinic.cone(f.weapon,t);Clinic.phone(f.weapon);}Clinic.faceStar(f.pair.orange,t);Clinic.beam(f.pair.orange,t);ctx.restore();}
window.Director={draw,frame,actors,weapon};
})();
