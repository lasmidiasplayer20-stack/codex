/* Fixed-step free parcels collide with the actual curved actor silhouettes, slabs and each other. */
(()=>{'use strict';const S=Story,P=PerformanceData,HZ=120,h=1/HZ,frames=[],active=[],events=[],slabs=[{x:650,y:414,w:1080,h:14},{x:450,y:610,w:1390,h:14},{x:210,y:806,w:1860,h:18}];let next=0,lastImpact=-10,maxBodies=0;
const jobs=[...S.jobs].sort((a,b)=>a.start-b.start),point=(n,t)=>{const a=S.actorAt(n,t),p=P.poseAt(n,t),job=S.holdAt(n,t);return{x:p.nodes[0][0]+(job?.f??a.f)*72,y:p.nodes[0][1]-25};};
function closest(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1)));return[a[0]+dx*u,a[1]+dy*u];}
function push(p,nx,ny,d,vx=0,vy=0){p.x+=nx*d;p.y+=ny*d;const vn=(p.vx-vx)*nx+(p.vy-vy)*ny;if(vn<0){const e=p.big?.48:.28;p.vx-=(1+e)*vn*nx;p.vy-=(1+e)*vn*ny;p.omega+=(nx*p.vy-ny*p.vx)*.002;if(-vn>140&&p.t-lastImpact>.16){events.push({t:p.t,type:p.big?'crash':'parcel',x:p.x,y:p.y,power:Math.min(1,-vn/350)});lastImpact=p.t;}}}
for(let fi=0;fi<=210*HZ;fi++){const t=fi/HZ,shapes=S.names.map(n=>({n,segs:P.silhouette(P.poses[n][fi]),prev:fi?P.poses[n][fi-1].nodes[0]:P.poses[n][fi].nodes[0],root:P.poses[n][fi].nodes[0]}));
 while(next<jobs.length&&jobs[next].start<=t+1e-7){const j=jobs[next++],pos=point(j.n,j.start),b=Physics.body([pos.x,pos.y],1.8);Object.assign(b,{id:j.id,r:27,a:0,omega:0,j,owner:j.n,held:true,color:j.id%5,big:false,t});active.push(b);events.push({t,type:'printer',x:b.x,y:b.y,power:.4});}
 if(fi===183*HZ){const b=Physics.body([1940,115],12);Object.assign(b,{id:999,r:55,a:.08,omega:-1.1,vx:-125,vy:0,j:null,owner:null,held:false,color:2,big:true,t});active.push(b);events.push({t,type:'clatter',x:b.x,y:b.y,power:1});}
 for(const b of active){b.t=t;if(b.held&&t<b.j.end){const pos=point(b.owner,t);b.vx=(pos.x-b.x)*HZ;b.vy=(pos.y-b.y)*HZ;b.x=pos.x;b.y=pos.y;b.a=0;}else{if(b.held){b.held=false;b.owner=null;b.vx=b.j.f*(230+(Math.floor(t/30)%3)*30);b.vy=-150;b.omega=b.j.f*1.7;events.push({t,type:'whoosh',x:b.x,y:b.y,power:.5});}b.drag=.025;Physics.advanceBody(b,h,[0,900]);b.a+=b.omega*h;}}
 // Eight sequential passes prioritize solid supports, then moving silhouettes, then parcel separation.
 for(let pass=0;pass<8;pass++){for(const b of active){if(b.held)continue;
 for(const slab of slabs){const extent=(b.big?31:12)*(Math.abs(Math.cos(b.a))+Math.abs(Math.sin(b.a)))+6;if(b.x+extent>slab.x&&b.x-extent<slab.x+slab.w&&b.y+extent>slab.y&&b.y-extent<slab.y+slab.h){const ds=[b.x+extent-slab.x,slab.x+slab.w-b.x+extent,b.y+extent-slab.y,slab.y+slab.h-b.y+extent],k=ds.indexOf(Math.min(...ds)),nx=k===0?-1:k===1?1:0,ny=k===2?-1:k===3?1:0;push(b,nx,ny,ds[k]+.02);if(ny<-.5){const goal=b.big?-120:(b.j?.f||1)*190*S.power(t);b.vx+=Math.max(-450*h,Math.min(450*h,goal-b.vx));b.omega=b.vx/b.r*.4;}}}
 for(const actor of shapes){const vx=(actor.root[0]-actor.prev[0])*HZ,vy=(actor.root[1]-actor.prev[1])*HZ;for(const co of actor.segs){const p=closest(b.x,b.y,co.a,co.b),dx=b.x-p[0],dy=b.y-p[1],d=Math.hypot(dx,dy),R=b.r+co.r;if(d<R){const nx=d>.0001?dx/d:1,ny=d>.0001?dy/d:0;push(b,nx,ny,R-d+.03,vx,vy);}}}
 if(b.y<105+b.r)push(b,0,1,105+b.r-b.y);
 }
 for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const a=active[i],b=active[j];if(a.held&&b.held)continue;const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),R=a.r+b.r;if(d<R&&d>.001){const nx=dx/d,ny=dy/d,wa=a.held?0:1/a.mass,wb=b.held?0:1/b.mass,sum=wa+wb,depth=R-d+.03;a.x-=nx*depth*wa/sum;a.y-=ny*depth*wa/sum;b.x+=nx*depth*wb/sum;b.y+=ny*depth*wb/sum;const vn=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(vn<0){const impulse=-(1.25)*vn/sum;a.vx-=impulse*wa*nx;a.vy-=impulse*wa*ny;b.vx+=impulse*wb*nx;b.vy+=impulse*wb*ny;}}}}
 for(let i=active.length-1;i>=0;i--)if(!active[i].held&&(active[i].x<250||active[i].x>2025||active[i].y>1040))active.splice(i,1);
 maxBodies=Math.max(maxBodies,active.length);frames.push(active.map(b=>({id:b.id,x:b.x,y:b.y,a:b.a,r:b.r,color:b.color,big:b.big,held:b.held,owner:b.owner,job:b.j?.id,scale:b.held?S.ease((t-b.j.start)/.16):1})));
}
window.Parcels={frames,events,slabs,maxBodies,at:t=>frames[Math.max(0,Math.min(frames.length-1,Math.round(t*HZ)))],closest};S.events.push(...events);S.events.sort((a,b)=>a.t-b.t);
})();
