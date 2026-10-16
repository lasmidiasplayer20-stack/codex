/* Original actor and shape functions, copied verbatim; new bindings only. */
(()=>{'use strict';const canvas=document.querySelector('#film'),ctx=canvas.getContext('2d',{alpha:false}),D=FILM_DATA,W=D.width,H=D.height,TAU=Math.PI*2;const drawingRig=(name,t)=>ElasticRig.at(name,t);
function line(points,color,width=2){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.lineCap=ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
function circle(x,y,r,color,stroke=null,width=2){ctx.beginPath();ctx.arc(x,y,Math.max(.1,r),0,TAU);if(color){ctx.fillStyle=color;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function curve(a,b,c,color,width){ctx.beginPath();ctx.moveTo(...a);ctx.quadraticCurveTo(2*b[0]-(a[0]+c[0])/2,2*b[1]-(a[1]+c[1])/2,...c);ctx.lineWidth=width;ctx.strokeStyle=color;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();}
function actor(name,t){const p=drawingRig(name,t);if(!p)return;const n=p.nodes,r=p.r,color=D.cast[name].rgb,width=r*(name==='orange'?.47:.39);
 ctx.save();if(name==='green'&&t>26&&t<41.95){ctx.shadowColor='#bc1936';ctx.shadowBlur=r*.55;}
 for(const joints of [[0,7,8],[0,9,10],[1,3,4],[1,5,6]])if(!p.partial||joints[0]===1)curve(n[joints[0]],n[joints[1]],n[joints[2]],color,width);
 if(p.partial){if(p.partialHead)circle(n[2][0],n[2][1],p.partialHead,color);ctx.restore();return p;}
 ctx.save();if(D.cast[name].hollow){ctx.beginPath();ctx.rect(-W,-H,W*3,H*3);ctx.ellipse(n[2][0],n[2][1],Math.max(r*.65,p.shape[0]),Math.max(r*.65,p.shape[1]),(p.shape[2]||0)*Math.PI/180,0,TAU);ctx.clip('evenodd');}curve(n[0],n[1],n[2],color,r*(name==='orange'?.51:.43));ctx.restore();
 ctx.save();ctx.translate(...n[2]);ctx.rotate((p.shape[2]||0)*Math.PI/180);ctx.beginPath();ctx.ellipse(0,0,Math.max(r*.65,p.shape[0]),Math.max(r*.65,p.shape[1]),0,0,TAU);
 if(D.cast[name].hollow){ctx.strokeStyle=color;ctx.lineWidth=r*.34;ctx.stroke();}else{ctx.fillStyle=color;ctx.fill();}ctx.restore();
 if(name==='orange'&&t>74.4){ctx.globalAlpha=.72;for(let i=0;i<7;i++){const x=n[2][0]+(rand(i+1)-.5)*r*1.4,y=n[2][1]-r*.45;line([[x,y],[x+r*.07,y+r*.30],[x-r*.07,y+r*.44]],'#1a1110',Math.max(.8,r*.045));}ctx.globalAlpha=1;}
 ctx.restore();return p;}
window.LegacyActor={draw:actor,canvas,ctx};})();
