/* Positive-mass circle/box contacts in the stage basis; palm anchors remain constraints. */
(()=>{'use strict';const{clamp,rot,add,sub,mul}=V;
function resolveActorCube(s){if(!s.cube.visible)return;for(let iter=0;iter<4;iter++){const p=RigAdapter.pose(s,s.t),center=s.stage.local([s.cube.x,s.cube.y]),half=s.cube.size/2;let corrected=false;
 for(let j=0;j<11;j++){if((j===4||j===6)&&s.char.handContact?.startsWith('cube'))continue;const q=s.stage.local(p.nodes[j]),r=j===2?p.r:p.r*.195,near=[clamp(q[0],center[0]-half,center[0]+half),clamp(q[1],center[1]-half,center[1]+half)],delta=sub(q,near),d=Math.hypot(...delta);let normal,depth;
 if(d>1e-7){depth=r-d;if(depth<=.001)continue;normal=mul(delta,1/d);}else{const gaps=[q[0]-(center[0]-half),center[0]+half-q[0],q[1]-(center[1]-half),center[1]+half-q[1]],i=gaps.indexOf(Math.min(...gaps));normal=[[-1,0],[1,0],[0,-1],[0,1]][i];depth=r+gaps[i];}
 const n=s.stage.vector(normal);s.char.x+=n[0]*(depth+.001);s.char.y+=n[1]*(depth+.001);const relative=(s.char.vx-s.cube.vx)*n[0]+(s.char.vy-s.cube.vy)*n[1];if(relative<0&&!s.char.drive&&!s.char.constraint){const impulse=-(1+.15)*relative/(1/s.char.mass+1/s.cube.mass);s.char.vx+=n[0]*impulse/s.char.mass;s.char.vy+=n[1]*impulse/s.char.mass;s.cube.vx-=n[0]*impulse/s.cube.mass;s.cube.vy-=n[1]*impulse/s.cube.mass;if(-relative>70)Physics.log(s,'character-cube-impact',{speed:-relative});}corrected=true;break;}
 if(!corrected)break;}}
window.Contact2D={resolveActorCube};})();
