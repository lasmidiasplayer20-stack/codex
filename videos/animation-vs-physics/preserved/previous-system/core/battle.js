/* Shared, independently drawn battle props and stage. Geometry is authored. */
(()=>{'use strict';const A=Art,R=Rig,{ctx,rect,line,soft,circle,rand}=A;
function mace(o,bloody=false){if(!o)return;ctx.save();ctx.translate(...o.b);ctx.rotate(Math.atan2(o.a[1]-o.b[1],o.a[0]-o.b[0]));const L=Math.hypot(...R.sub(o.a,o.b));
 rect(0,-4,L,8,'#71324c');rect(0,-2,L,4,'#bf6d91');rect(3,-1,L-6,1.3,'#e0a5ba');
 for(const start of [3,20,L-48,L-31,L-12])for(let i=0;i<3;i++){rect(start+i*3,-5,1.7,10,i%2?'#603048':'#9e5277');}
 rect(L-47,-23,39,46,'#763c57');rect(L-44,-20,33,40,'#ac6c85');rect(L-42,-18,29,36,'#34383e');rect(L-39,-15,24,30,'#55575b');rect(L-37,-13,20,26,'#4c4e52');
 for(let i=0;i<19;i++)rect(L-38+rand(i+11)*20,-13+rand(i+45)*26,1+rand(i+9)*3,1+rand(i+3)*3,i%2?'#525258':'#46474b');
 if(bloody){ctx.beginPath();ctx.moveTo(L-44,4);for(let i=0;i<10;i++)ctx.lineTo(L-44+i*3.6,8+rand(i)*10);ctx.lineTo(L-9,20);ctx.lineTo(L-44,20);ctx.closePath();ctx.fillStyle='#8b0920';ctx.fill();for(let i=0;i<7;i++)line([[L-41+i*4,-5+rand(i)*10],[L-40+i*4,9+rand(i+20)*5]],'#8d1223',1.3);}
 ctx.restore();}
function cloak(o,t){if(t>45.7)return;const fade=R.clamp((45.7-t)/.25,0,1),a=o.a;ctx.save();ctx.globalAlpha=fade;for(let j=0;j<3;j++){const drift=Math.max(0,t-44.1)*65,x=a[0]+10+drift,y=a[1]+j*13-25-drift*.28;ctx.beginPath();for(let i=0;i<18;i++){const px=x-i*7,py=y+Math.sin(i*.7+t*4+j)*5+rand(i+j*11)*7;ctx[i?'lineTo':'moveTo'](px,py);}for(let i=17;i>=0;i--)ctx.lineTo(x-i*7,y+13+Math.sin(i*.7+t*4+j)*5+rand(i+j*17)*7);ctx.closePath();ctx.fillStyle=j%2?'#17191c':'#111315';ctx.fill();}ctx.restore();}
function stage(t){A.rect(-3000,420,10000,2000,'#0d0e0f');Clinic.hospital(PART.hospital);ctx.save();ctx.translate(763,-24);A.viscera();ctx.restore();A.sword({a:[1097,480],b:[1050,428]});Clinic.blood(43);const corpse=PART.corpse&&R.at(PART.corpse,Math.min(t,PART.end-1e-6));if(corpse){Clinic.skeleton(corpse);Clinic.phone({b:[1374,445],a:[1387,396]});}}
function actors(t){return Object.fromEntries(Object.entries(PART.tracks).map(([name,track])=>[name,R.at(track,t)]));}
function weapon(t,pair=actors(t)){const p=pair.red;if(!p)return null;const angle=R.radians(R.value(PART.mace,t,'angle')),axis=R.polar(angle,1),grip=p.nodes[4],hold=PART.maceGrip?R.value(PART.maceGrip,t,'distance'):114,b=R.sub(grip,axis.map(x=>x*hold));return{a:R.add(b,axis.map(x=>x*224)),b,kind:'mace',grip:grip.slice()};}
function frame(t){const pair=actors(t);return{pair,weapon:weapon(t,pair),camera:PART.camera(t,pair)};}
function draw(t){t=R.clamp(t,PART.start,PART.end-1e-6);const{canvas,W,H}=A;ctx.reset();ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);const f=frame(t),c=f.camera;A.background(c);ctx.save();ctx.translate(c.x,c.y);ctx.scale(c.scale,c.scale);stage(t);for(const p of Object.values(f.pair))A.actor(p);if(f.weapon){mace(f.weapon,t>=PART.bloodStart);if(PART.id==='03')cloak(f.weapon,t);}PART.effects?.(t,f);ctx.restore();}
window.Battle={mace,cloak,stage,actors,weapon,frame,draw};
})();
