/* Deterministic short photographic exposure, enabled only for rapid screen motion. */
(()=>{'use strict';const raw=SceneView.draw,buffer=document.createElement('canvas'),acc=buffer.getContext('2d'),samples=[[-.5,.25],[0,.5],[.5,.25]],exposure=1/180;
function screen(p,c){return V.mul(V.rot(V.sub(p,c.focus),-c.rotation),c.zoom);}
function speed(t){const h=1/120,a=SceneView.snapshot(Math.max(0,t-h)),b=SceneView.snapshot(Math.min(125,t+h)),ca=Camera.at(a,a.t),cb=Camera.at(b,b.t);return Math.max(...[0,2,4,6,8,10].map(j=>Math.hypot(...V.sub(screen(b.poseNodes[j],cb),screen(a.poseNodes[j],ca)))/(2*h)));}
function draw(t){const canvas=SceneView.canvas,ctx=SceneView.ctx;if(speed(t)<1200||[114.84,115,124.85,...(window.Cinematic?.cuts||[])].some(c=>Math.abs(t-c)<.04)){raw(t);return;}if(buffer.width!==canvas.width||buffer.height!==canvas.height){buffer.width=canvas.width;buffer.height=canvas.height;}acc.reset();acc.clearRect(0,0,buffer.width,buffer.height);acc.globalCompositeOperation='source-over';let total=0;for(const[dt,w]of samples){raw(V.clamp(t+dt*exposure,0,124.99999));total+=w;acc.globalAlpha=w/total;acc.drawImage(canvas,0,0);}ctx.reset();ctx.drawImage(buffer,0,0);}
window.FilmExposure={draw,exposure,samples:3,threshold:1200,nativeFps:60};
})();
