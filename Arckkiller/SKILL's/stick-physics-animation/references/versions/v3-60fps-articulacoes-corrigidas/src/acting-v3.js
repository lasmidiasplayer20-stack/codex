/* Joint animation, not scaling: secondary action, gaze, recoil and readable held poses. */
(() => {
  'use strict';
  const base=CharacterPerformance.apply,{smooth,lerp,clamp}=V;
  function bump(t,a,b,fade=.18){return smooth((t-a)/fade)*(1-smooth((t-b+fade)/fade));}
  const recoil=[
    [6.20,.7,-6,9],[26.28,.8,9,-12],[38.65,.55,-8,10],
    [57.30,.6,3,-5],[58.50,.5,4,-7],[61.40,.6,-7,11],
    [73.10,.8,3,-5],[80.20,.65,-5,8],[81.30,.65,5,-8],
    [92.1,.7,-7,10],[102.20,.8,3,-7],[119.30,.6,2,-4],[121.65,.6,-4,-12]
  ];
  function apply(s,t,p){
    base(s,t,p);
    // In contact shots the existing hand/foot constraints take precedence.
    const free=!s.char.handContact&&!s.char.footContact&&!s.flags.tether&&!s.flags.approachKick;
    if(!free||['push','pull','grab','stretched','kick','protect','back','headLift'].includes(s.char.poseName))return p;
    const resting=!s.char.walk&&!s.char.swimming;
    if(resting){
      const breath=Math.sin(t*1.9),lag=Math.sin(t*1.9-.65);
      p.body+=.7*breath;p.neck+=1.4*lag;
      p.h0[0]+=1.4*lag;p.h0[1]+=.65*breath;
      p.h1[0]-=1.1*Math.sin(t*1.9-.9);p.h1[1]-=.5*breath;
    }
    if(s.char.walk){
      const q=(s.char.walkDistance||0)/110*Math.PI*2;
      p.neck+=2.2*Math.sin(q-.65);p.body+=1.2*Math.sin(q*2-.35);
    }
    // Damped overshoot makes the head settle after the torso; no random jitter.
    for(const [start,duration,body,neck] of recoil){
      const a=t-start;if(a<0||a>duration)continue;
      const env=Math.sin(a/duration*Math.PI)*Math.exp(-a/duration*2);
      p.body+=body*env;p.neck+=neck*env;
    }
    const curious=bump(t,4.1,5.06,.2)+bump(t,7.35,8.85,.28);
    p.neck+=5*curious;p.h1[0]+=4*curious;
    const floating=bump(t,12,14.9,.5);
    p.h0[0]-=4*Math.sin(t*2.5)*floating;p.h1[1]+=6*Math.sin(t*2.5-.6)*floating;
    const concern=bump(t,76.4,79.7,.3);
    p.neck-=4*concern;p.h0[0]-=4*concern;p.h1[0]+=3*concern;
    const resolve=bump(t,103.1,104.9,.3);
    p.body=lerp(p.body,-82,resolve*.5);p.neck=lerp(p.neck,-65,resolve*.5);
    return p;
  }
  CharacterPerformance.apply=apply;
  // A two-link IK chain can change bend side continuously only at extension.
  // Author a brief open/close gesture at the real direction changes, before contact IK.
  CharacterPerformance.turnTargets=function(s,t,root,targets,length){
    if(s.char.handContact||s.char.footContact||s.flags.tether)return targets;
    let w=0;
    for(const turn of [65,66.75,68.3,72.5]){
      const u=(t-turn+.16)/.32;
      if(u>0&&u<1)w=Math.max(w,Math.sin(Math.PI*u)**4);
    }
    if(!w)return targets;
    return targets.map((p,i)=>{
      const d=V.sub(p,root),n=Math.hypot(...d);if(n<1e-6)return p;
      const spread=length<60?.55:.24;
      const neutral=V.rot([(i?1:-1)*spread,Math.sqrt(1-spread*spread)],s.char.angle);
      const unit=V.add(V.mul(d,(1-w)/n),V.mul(neutral,w));
      const norm=Math.hypot(...unit);
      return V.add(root,V.mul(unit,V.lerp(n,length-1e-7,w)/Math.max(1e-8,norm)));
    });
  };
  window.ActingV3={apply,recoil,secondaryAction:'fixed-length joint offsets'};
})();
