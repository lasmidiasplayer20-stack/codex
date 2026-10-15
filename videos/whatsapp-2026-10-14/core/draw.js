/* All shapes and textures are generated here. No reference visual assets. */
(()=>{'use strict';
const canvas=document.querySelector('#film'),ctx=canvas.getContext('2d',{alpha:false}),W=960,H=540,TAU=Math.PI*2;
const rand=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
function line(p,color,width){ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(...q):ctx.moveTo(...q));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap=ctx.lineJoin='round';ctx.stroke();}
function circle(x,y,r,color,stroke,width=1){ctx.beginPath();ctx.arc(x,y,r,0,TAU);if(color){ctx.fillStyle=color;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}
function soft(a,b,c,color,width){const u=Rig.sub(b,a),v=Rig.sub(c,b),l1=Math.hypot(...u),l2=Math.hypot(...v),t=[u[0]/Math.max(l1,.001)+v[0]/Math.max(l2,.001),u[1]/Math.max(l1,.001)+v[1]/Math.max(l2,.001)],length=Math.hypot(...t),handle=Math.min(l1,l2)*.20;
 const h=t.map(x=>x/Math.max(.001,length)*handle);
 ctx.beginPath();ctx.moveTo(...a);ctx.bezierCurveTo(a[0]+u[0]/3,a[1]+u[1]/3,b[0]-h[0],b[1]-h[1],...b);ctx.bezierCurveTo(b[0]+h[0],b[1]+h[1],c[0]-v[0]/3,c[1]-v[1]/3,...c);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap=ctx.lineJoin='round';ctx.stroke();
}
const texture=document.createElement('canvas');texture.width=480;texture.height=270;const tx=texture.getContext('2d'),pixels=tx.createImageData(480,270);
for(let y=0;y<270;y++)for(let x=0;x<480;x++){const i=y*480+x,j=i*4,grain=(rand(i)-.5)*9,cloud=Math.sin(x*.035)*Math.cos(y*.053)*3+Math.sin((x+y)*.017)*3;pixels.data[j]=6+grain*.3+cloud*.2;pixels.data[j+1]=49+grain+cloud;pixels.data[j+2]=73+grain+cloud*1.3;pixels.data[j+3]=255;}tx.putImageData(pixels,0,0);
function background(camera){ctx.save();const parallax=camera.x*.045;ctx.drawImage(texture,parallax-1200,-200,3360,1080);const gr=ctx.createLinearGradient(0,0,960,540);gr.addColorStop(0,'rgba(0,47,82,.2)');gr.addColorStop(1,'rgba(1,32,51,.22)');ctx.fillStyle=gr;ctx.fillRect(0,0,W,H);ctx.restore();}
function bed(){const x=-76,y=376,w=266,h=30;rect(x,y,w,h,'#632514');rect(x,y+4,w,10,'#9a0724');rect(x,y+21,w,6,'#600920');rect(x,y+h,w,13,'#917149');rect(x,y+h+12,w,5,'#55462e');rect(x+w-13,y+28,13,40,'#91876a');rect(x+17,y+29,12,42,'#867957');for(let i=0;i<35;i++){const xx=x+rand(i)*w;rect(xx,y+rand(i+100)*h,3+rand(i+30)*8,2+rand(i+60)*7,i%4?'#850920':'#ce213c');}
 // Patient and IV are independent procedural objects.
 circle(4,359,14,'#f2d521');soft([16,364],[42,360],[78,368],'#ecd51c',12);line([[76,368],[90,368]],'#f3d92f',8);
 line([[-21,371],[-21,249],[58,249],[58,262]],'#242d2e',3);rect(54,258,9,29,'#651326');rect(56,259,5,8,'#9b2636');soft([60,283],[76,307],[81,377],'#b00568',2.5);
}
function viscera(){line([[0,443],[129,444],[226,445],[282,443],[348,445]],'#590916',4);line([[280,444],[307,443],[355,445]],'#b90b30',2);
 soft([364,444],[368,435],[494,438],'#edd226',11);soft([499,439],[504,444],[559,448],'#900561',2);line([[501,442],[540,443]],'#c70986',1);
 for(let i=0;i<28;i++){const x=585+rand(i*7)*60,y=425+rand(i*11)*26;rect(x,y,4+rand(i*9)*10,4+rand(i*17)*8,['#c43132','#e78164','#793c20','#a14e36'][i%4]);}
 for(let i=0;i<4;i++){ctx.save();ctx.translate(588+i*14,436+(i%2)*2);ctx.rotate(.12*(i-1));ctx.beginPath();ctx.ellipse(0,0,11,9,0,0,TAU);ctx.fillStyle='#99071c';ctx.fill();ctx.strokeStyle='#f53a45';ctx.lineWidth=2;ctx.stroke();line([[-6,-4],[0,-5],[5,-1]],'#ff7880',1);ctx.restore();}
 const colors=['#382e0c','#5c450e','#746019','#433809','#805b15'];for(let i=0;i<65;i++){const x=665+rand(i*13)*64,y=419+rand(i*19)*31;rect(x,y,8+rand(i*23)*9,7+rand(i*29)*8,colors[i%5]);}for(let i=0;i<8;i++){rect(686+rand(i*31)*16,425+rand(i*43)*19,4,5,i%2?'#299b13':'#40b929');rect(670+rand(i*41)*11,432+rand(i*37)*8,3,3,i%2?'#f0780a':'#d5a634');}
}
function actor(p){if(!p)return;const n=p.nodes,col=p.color,w=p.profile.width;
 // Far limbs are drawn before the trunk; shared node positions keep joints closed.
 soft(n[0],n[7],n[8],col,w);ctx.save();if(p.hollow){ctx.beginPath();ctx.rect(-2000,-2000,6000,6000);ctx.arc(...p.head,p.r-p.r*.17,0,TAU);ctx.clip('evenodd');}soft(n[1],n[3],n[4],col,w);ctx.restore();soft(n[0],n[9],n[10],col,w);
 ctx.save();if(p.hollow){ctx.beginPath();ctx.rect(-2000,-2000,6000,6000);ctx.arc(...p.head,p.r-p.r*.17,0,TAU);ctx.clip('evenodd');}if(p.spinePoint){soft(n[0],p.spinePoint,n[1],col,w*1.05);line([n[1],n[2]],col,w*1.05);}else soft(n[0],n[1],n[2],col,w*1.05);ctx.restore();soft(n[1],n[5],n[6],col,w);
 if(p.hollow){ctx.save();ctx.beginPath();ctx.arc(...p.head,p.r,0,TAU);ctx.strokeStyle=col;ctx.lineWidth=p.r*.33;ctx.stroke();ctx.restore();}
 else circle(...p.head,p.r,col);
 if(p.damage?.faceCut){const d=p.damage.faceCut;ctx.save();ctx.translate(...p.head);ctx.rotate(d.roll||0);ctx.beginPath();ctx.arc(0,0,p.r*.99,-.46,.83);ctx.strokeStyle='#76121c';ctx.lineWidth=p.r*.17;ctx.lineCap='round';ctx.stroke();ctx.beginPath();ctx.arc(0,0,p.r*1.02,-.37,.62);ctx.strokeStyle='#b41b28';ctx.lineWidth=p.r*.055;ctx.stroke();line([[p.r*.95,-p.r*.18],[p.r*.84,-p.r*.03],[p.r*.92,p.r*.10]],'#541417',p.r*.07);ctx.restore();}
}
function star(p,t){if(!p||t>=9.80)return;const [x,y]=p.head,r=p.r;ctx.save();ctx.translate(x+r*.79,y+r*.24);ctx.rotate(-.12);ctx.shadowColor='#d4ffb4';ctx.shadowBlur=r*.32;ctx.beginPath();for(let i=0;i<8;i++){const a=i*TAU/8,d=i%2?r*.065:r*.35;ctx[i?'lineTo':'moveTo'](Math.cos(a)*d,Math.sin(a)*d);}ctx.closePath();ctx.fillStyle='#edffdd';ctx.fill();ctx.restore();}
function sword(o){ctx.save();ctx.translate(...o.b);ctx.rotate(Math.atan2(o.a[1]-o.b[1],o.a[0]-o.b[0]));const l=Math.hypot(o.a[0]-o.b[0],o.a[1]-o.b[1]);
 rect(0,-3,19,6,'#443718');for(let i=0;i<4;i++)rect(i*4,-3,2,6,'#76542b');rect(18,-12,6,24,'#124d32');rect(21,-9,5,18,'#2c6943');
 const unit=5;for(let i=0;i<Math.ceil((l-26)/unit);i++){const x=26+i*unit,dy=i%2?0:-2;rect(x,-4+dy,Math.min(unit,l-x),8,'#30d1ad');rect(x,-4+dy,Math.min(unit,l-x),3,i%2?'#b1ffe1':'#68fcd5');rect(x,3+dy,Math.min(unit,l-x),2,'#16907c');}ctx.restore();}
function swordTrail(t,get){if(!(10.0<t&&t<10.68))return;const now=get(t);if(!now)return;ctx.save();const recent=[];for(let i=0;i<7;i++){const o=get(t-.045*i);if(o)recent.push(o);}if(recent.length>2){ctx.beginPath();ctx.moveTo(...recent[0].b);recent.forEach(o=>ctx.lineTo(...o.a));ctx.lineTo(...recent.at(-1).b);ctx.closePath();const gradient=ctx.createLinearGradient(...now.b,...now.a);gradient.addColorStop(0,'rgba(41,213,215,.02)');gradient.addColorStop(1,'rgba(48,217,214,.16)');ctx.fillStyle=gradient;ctx.fill();}ctx.restore();}
function warning(t){rect(0,0,W,H,'#000');const s=.06+.94*Motion.cubicBezier(.2,0,.2,1)(Rig.clamp(t/.34,0,1));ctx.save();ctx.translate(480,156);ctx.scale(s,s);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 111px sans-serif';ctx.fillStyle='#ed1922';ctx.fillText('WARNING',0,-65);ctx.font='24px sans-serif';ctx.fillStyle='#fff';['THE FOLLOWING VIDEO CONTAINS SCENES OF','VIOLENCE AND BRUTAL FIGHTS WITH EXPLICIT BLOOD CONTENT.','VIEWER DISCRETION IS ADVISED'].forEach((v,i)=>ctx.fillText(v,0,22+i*28));ctx.restore();}
window.Art={canvas,ctx,W,H,background,bed,viscera,actor,star,sword,swordTrail,warning,rect,line,circle,soft,rand};
})();
