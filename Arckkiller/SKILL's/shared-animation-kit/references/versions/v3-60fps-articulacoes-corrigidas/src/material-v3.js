/* Light catches only a narrow edge; the faceless black original remains the actor. */
(() => {
  'use strict';
  const drawOriginal=LegacyActor.draw;
  LegacyActor.draw=function(name,t){
    const p=drawOriginal(name,t);if(!p)return p;
    const ctx=LegacyActor.ctx,s=SceneView.snapshot(t),head=p.nodes[2],r=p.r;
    const distance=Math.hypot(s.orb.x-head[0],s.orb.y-head[1]);
    const light=s.orb.visible&&s.orb.glow!==0?Math.exp(-distance/220)*.35:0;
    const rgb=WorldV3.palette(t).rgb;
    ctx.save();ctx.beginPath();ctx.arc(...head,r*.91,-2.8,-1.4);
    ctx.strokeStyle=`rgba(${rgb.join(',')},${.10+light})`;ctx.lineWidth=r*.08;ctx.lineCap='round';ctx.stroke();ctx.restore();
    return p;
  };
})();
