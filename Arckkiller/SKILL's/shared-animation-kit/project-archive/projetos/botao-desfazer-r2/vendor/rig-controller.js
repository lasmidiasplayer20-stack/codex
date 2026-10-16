/* Named FK bones, unwrapped rotations, bounded cubic interpolation. */
(()=>{'use strict';
const D=FILM_DATA,parents=[-1,0,1,1,3,1,5,0,7,0,9],clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function indexAt(v,t){let l=0,h=v.length-1;while(l<h){const m=Math.ceil((l+h)/2);if(v[m].t<=t)l=m;else h=m-1;}return l;}
function scalar(v,i,t,get){const a=v[i],b=v[Math.min(i+1,v.length-1)],dt=b.t-a.t;if(dt<=0)return get(a);const u=clamp((t-a.t)/dt,0,1),delta=(get(b)-get(a))/dt;const p=v[Math.max(0,i-1)],q=v[Math.min(v.length-1,i+2)];
 const slope=(x,y)=>(get(y)-get(x))/Math.max(1e-6,y.t-x.t),tangent=s=>s*delta<=0?0:Math.sign(delta)*Math.min(Math.abs(s),3*Math.abs(delta));
 const m0=p.segment===a.segment?tangent((slope(p,a)+delta)/2):delta,m1=q.segment===b.segment?tangent((delta+slope(b,q))/2):delta;
 return (2*u*u*u-3*u*u+1)*get(a)+(u*u*u-2*u*u+u)*dt*m0+(-2*u*u*u+3*u*u)*get(b)+(u*u*u-u*u)*dt*m1;}
function at(name,t){const v=D.tracks[name];if(!v?.length||t<v[0].t-.025||t>v.at(-1).t+.045)return null;const i=indexAt(v,t),a=v[i],b=v[Math.min(i+1,v.length-1)],gap=b.t-a.t;
 if(gap>.20&&t>a.t+.06&&t<b.t-.06)return null;
 const interpolate=get=>a.segment===b.segment?scalar(v,i,t,get):get(t<b.t?a:b);
 const head=[0,1].map(k=>interpolate(p=>p.head[k])),r=Math.max(1,interpolate(p=>p.r));
 if(a.partial&&a.partialNodes){const nodes=a.partialNodes.map((n,j)=>n.map((_,k)=>interpolate(p=>(p.partialNodes||a.partialNodes)[j][k])));return {name,t,nodes,r,shape:a.shape,angle:0,quality:a.quality,partial:true,partialHead:a.partialHead};}
 const angles=a.angles.map((_,j)=>interpolate(p=>p.angles[j])),lengths=a.lengths.map((_,j)=>Math.max(.1,interpolate(p=>p.lengths[j]))*r);
 const nodes=[[0,0]],absolute=[0];for(let j=1;j<11;j++){const p=parents[j];absolute[j]=j===1?angles[1]:(p===0?angles[1]:absolute[p])+angles[j];nodes[j]=[nodes[p][0]+Math.cos(absolute[j])*lengths[j],nodes[p][1]+Math.sin(absolute[j])*lengths[j]];}
 const dx=head[0]-nodes[2][0],dy=head[1]-nodes[2][1];for(const n of nodes){n[0]+=dx;n[1]+=dy;}
 const shape=a.shape.map((_,j)=>interpolate(p=>p.shape[j]));return {name,t,nodes,r,shape,angle:absolute[1]+Math.PI/2,quality:a.quality,partial:a.partial};}
window.ElasticRig={at,indexAt,scalar,parents};})();
