/* Responsive, entirely procedural stage, lighting and impact design. */
(() => {
  'use strict';
  const {add,sub,mul,rot,clamp,smooth,lerp}=V,TAU=Math.PI*2;
  const hash=n=>{const q=Math.sin(n*12.9898+78.233)*43758.5453;return q-Math.floor(q);};
  const stateAt=t=>SIM.states[Math.min(SIM.states.length-1,Math.max(0,Math.round(t*120)))];
  function floorBasis(t){return t>=50&&t<115?Physics.stage(-Math.PI/2,[5690,0]):Physics.stage();}
  function path(ctx,points,color,width=1){ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap=ctx.lineJoin='round';ctx.stroke();}
  function disk(ctx,x,y,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,Math.max(.05,r),0,TAU);ctx.fill();}
  function phase(t){return t>=115?'calm':t>=95&&t<105?'slow':t>=75?'chaos':t>=61?'purple':t>=30?'ice':t>=11.25?'blue':'calm';}
  function background(ctx,s,t,W,H,camera){
    const kind=phase(t),intro=smooth(t/1.6),g=ctx.createLinearGradient(0,0,W*.3,H);
    const low={calm:'#f0f5f8',blue:'#e6f4ff',ice:'#e7f4fc',purple:'#eee8f8',chaos:'#e5eafa',slow:'#dcecf8'}[kind];
    ctx.save();ctx.globalAlpha=intro;g.addColorStop(0,'#ffffff');g.addColorStop(.53,'#fbfdff');g.addColorStop(1,low);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // Distant drafting arcs create depth without adding physical props or text.
    ctx.translate(W*.5,H*.5);ctx.rotate(-camera.rotation*.17);
    const parallax=rot(camera.focus,-camera.rotation),offset=[parallax[0]*.09,parallax[1]*.07];
    ctx.strokeStyle=kind==='purple'||kind==='chaos'?'#b6aacb':'#a9c2d4';ctx.lineWidth=1;ctx.globalAlpha=.13*intro;
    for(let i=0;i<7;i++){
      const x=((i*503-offset[0])%2300+2300)%2300-1150,y=((i*347-offset[1])%1400+1400)%1400-700;
      const r=160+(i%3)*80;ctx.beginPath();ctx.arc(x,y,r,.2+i*.6,2.1+i*.6);ctx.stroke();
    }
    for(let i=0;i<26;i++){
      const x=((hash(i+2)*2200-offset[0]*.5+t*(i%2?1:-1)*1.1)%2200+2200)%2200-1100;
      const y=((hash(i+42)*1300-offset[1]*.5+Math.sin(t*.22+i)*13)%1300+1300)%1300-650;
      disk(ctx,x,y,i%5===0?2:1,'#8eaec6');
    }
    ctx.restore();
  }
  function grid(ctx,s,t,camera){
    const z=camera.zoom,extent=1300/z+250,cx=camera.focus[0],cy=camera.focus[1],intro=smooth(t/1.6);
    ctx.save();ctx.lineWidth=.7/z;ctx.strokeStyle='#8fa8bd';ctx.globalAlpha=.16*intro;
    const charge=t>=75&&t<115?smooth((t-75)/4):0;
    function warp(p){if(!charge)return p;const d=sub(p,[s.orb.x,s.orb.y]),r=Math.hypot(...d),amount=charge*10*Math.exp(-r*r/240000)*Math.sin(r*.03-t*5);return r>1?add(p,mul(d,amount/r)):p;}
    const startX=Math.floor((cx-extent)/100)*100,endX=cx+extent,startY=Math.floor((cy-extent)/100)*100,endY=cy+extent;
    for(let x=startX;x<=endX;x+=100){ctx.beginPath();let j=0;for(let y=startY;y<=endY;y+=45){const p=warp([x,y]);ctx[j++?'lineTo':'moveTo'](...p);}ctx.stroke();}
    for(let y=startY;y<=endY;y+=100){ctx.beginPath();let j=0;for(let x=startX;x<=endX;x+=45){const p=warp([x,y]);ctx[j++?'lineTo':'moveTo'](...p);}ctx.stroke();}
    ctx.globalAlpha=.3*intro;
    for(let x=startX;x<=endX;x+=200)for(let y=startY;y<=endY;y+=200){const p=warp([x,y]);disk(ctx,...p,1.15/z,'#89a6bd');}
    ctx.restore();
  }
  function environment(ctx,s,t,camera){
    grid(ctx,s,t,camera);const basis=floorBasis(t),z=camera.zoom,here=basis.local(camera.focus),intro=smooth(t/1.2);
    ctx.save();ctx.translate(...basis.origin);ctx.rotate(basis.angle);
    const g=ctx.createLinearGradient(0,810,0,1070);g.addColorStop(0,phase(t)==='purple'?'rgba(167,146,207,.15)':'rgba(126,166,192,.15)');g.addColorStop(1,'rgba(225,237,244,0)');ctx.fillStyle=g;ctx.globalAlpha=intro;ctx.fillRect(here[0]-2000,810,4000,3000);
    ctx.strokeStyle='#8ca7ba';ctx.lineWidth=.8/z;ctx.globalAlpha=.33*intro;
    for(let x=Math.floor((here[0]-1500)/50)*50;x<here[0]+1500;x+=50){ctx.beginPath();ctx.moveTo(x,816);ctx.lineTo(x,x%250===0?830:822);ctx.stroke();}
    ctx.restore();
    // Contact shadows are projected onto the actual supporting plane.
    const objects=[{p:[s.char.x,s.char.y],nodes:s.poseNodes,r:22},...(s.orb.visible?[{p:[s.orb.x,s.orb.y],r:s.orb.r}]:[]),...(s.cube.visible?[{p:[s.cube.x,s.cube.y],r:32.5}]:[])];
    for(const o of objects){const q=basis.local(o.p);let bottom=q[1]+o.r,span=o.r*2;
      if(o.nodes){const pp=o.nodes.map((p,j)=>{const q=basis.local(p);return{q,r:j===2?RigAdapter.radius:4};});bottom=Math.max(...pp.map(p=>p.q[1]+p.r));span=Math.max(...pp.map(p=>p.q[0]))-Math.min(...pp.map(p=>p.q[0]));}
      const height=Math.max(0,810-bottom),alpha=.18*Math.exp(-height/220)*intro;
      if(alpha<.005)continue;ctx.save();ctx.translate(...basis.world([q[0],811]));ctx.rotate(basis.angle);ctx.scale(Math.min(85,Math.max(9,span*.33+height*.035)),Math.max(2.2,4-height*.003));
      const g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,`rgba(38,61,86,${alpha})`);g.addColorStop(1,'rgba(38,61,86,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();ctx.restore();
    }
  }
  function halo(ctx,p,r,color,alpha){ctx.save();const g=ctx.createRadialGradient(...p,Math.max(.1,r*.08),...p,Math.max(1,r));g.addColorStop(0,color+Math.round(alpha*255).toString(16).padStart(2,'0'));g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(...p,r,0,TAU);ctx.fill();ctx.restore();}
  function energy(ctx,s,t,camera){
    if(!s.orb.visible)return;
    const o=s.orb,style=SceneEffects.orbStyle(s,t),color=style.color,charge=t>=75&&t<115?smooth((t-75)/4):0;
    const active=o.glow!==0,amp=active?.6+.4*Math.sin(t*4.2):0;
    if(active){halo(ctx,[o.x,o.y],Math.max(65,o.r*5.3),color,.13+.08*amp);ctx.save();ctx.strokeStyle=color;ctx.lineWidth=1/camera.zoom;
      for(let i=0;i<3;i++){ctx.globalAlpha=(.2+i*.05)*(.7+amp*.3);const r=o.r+8+i*11+Math.sin(t*2+i)*2;ctx.beginPath();ctx.arc(o.x,o.y,r,t*(i%2?-1:1)*.5+i*.7,t*(i%2?-1:1)*.5+i*.7+Math.PI*(.7+i*.17));ctx.stroke();}
      ctx.restore();}
    if(s.flags.decisive!==undefined&&t<114.84){
      const age=t-s.flags.decisive,u=smooth((age-.8)/3.45);
      ctx.save();ctx.globalAlpha=.7*smooth(age/.5)*(1-smooth((age-4.1)/.25));
      for(let i=0;i<42;i++){
        const a=i*2.399963+t*.09,r=(1-u)*(100+hash(i+44)*340),q=add([o.x,o.y],rot([r,0],a)),tail=add([o.x,o.y],rot([r+8+(1-u)*20,0],a+.018));
        path(ctx,[q,tail],i%2?'#7e60cb':'#56ace5',1.1/camera.zoom);disk(ctx,...q,1.8+(i%3)*.4,i%2?'#bea0ee':'#8cdbfc');
      }
      ctx.restore();halo(ctx,[o.x,o.y],70+u*80,'#70bfff',.15*u);
    }
    if(charge){
      const collision=s.flags.decisive===undefined?1:1-smooth((t-s.flags.decisive)/3.6);ctx.save();ctx.globalAlpha=.18*charge*collision;ctx.strokeStyle=color;ctx.lineWidth=1.3/camera.zoom;
      for(let i=0;i<10;i++){const a=i*TAU/10+t*.1,start=add([o.x,o.y],rot([o.r+25,0],a)),end=add([o.x,o.y],rot([210+i%3*40,0],a+.23*Math.sin(t+i)));ctx.beginPath();ctx.moveTo(...start);ctx.quadraticCurveTo(o.x+Math.cos(a+.65)*130,o.y+Math.sin(a+.65)*130,...end);ctx.stroke();}
      ctx.restore();halo(ctx,[o.x,o.y],350,color,.055*charge*collision);
    }
  }
  function cube(ctx,s,t){
    const c=s.cube;if(!c.visible)return;const purple=c.response==='inverted',half=c.size/2,x=c.x-half,y=c.y-half;
    ctx.save();if(s.flags.decisive!==undefined)ctx.globalAlpha=1-smooth((t-s.flags.decisive-.4)/2);
    if(purple)halo(ctx,[c.x,c.y],68,'#9b64dc',.17);
    const g=ctx.createLinearGradient(x,y,x+c.size,y+c.size);g.addColorStop(0,purple?'#bd9aef':'#ced7e1');g.addColorStop(.55,purple?'#9561d2':'#a3b2c4');g.addColorStop(1,purple?'#6d3da8':'#74869c');ctx.fillStyle=g;ctx.fillRect(x,y,c.size,c.size);
    ctx.strokeStyle=purple?'#5f3a93':'#718398';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,c.size-1,c.size-1);
    path(ctx,[[x+3,y+c.size-4],[x+3,y+3],[x+c.size-4,y+3]],'rgba(255,255,255,.65)',1.3);
    path(ctx,[[x+c.size-5,y+8],[x+c.size-5,y+c.size-5],[x+8,y+c.size-5]],'rgba(42,25,75,.12)',2);
    if(purple){ctx.strokeStyle='rgba(231,212,255,.65)';ctx.lineWidth=.7;const n=6;ctx.beginPath();for(let i=0;i<=n;i++){const u=i/n*c.size;ctx.moveTo(x+u,y);ctx.lineTo(x+u,y+c.size);ctx.moveTo(x,y+u);ctx.lineTo(x+c.size,y+u);}ctx.stroke();}
    ctx.restore();
  }
  function orb(ctx,s,t){
    const o=s.orb;if(!o.visible)return;const style=SceneEffects.orbStyle(s,t),r=style.r,red=o.flashRed!==undefined&&t-o.flashRed<.35,color=red?'#ff3953':style.color;
    ctx.save();const g=ctx.createRadialGradient(o.x-r*.35,o.y-r*.4,r*.08,o.x,o.y,r);g.addColorStop(0,'#e4f6ff');g.addColorStop(.26,color);g.addColorStop(1,color==='\u0023168fff'?'#0765cf':color);ctx.fillStyle=g;ctx.beginPath();ctx.arc(o.x,o.y,r,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=Math.max(.5,r*.055);ctx.beginPath();ctx.arc(o.x,o.y,r*.72,-2.8,-1.5);ctx.stroke();ctx.restore();
  }
  const eventKinds=new Set(['footstep','orb-impact','cube-impact','character-impact','kick','double-kick','chaos-wave','superelastic-bounce','decisive-collision','apple-hit','blue-pulse','purple-pulse','red-flash','particle-touch','inverted-push','inverted-pull']);
  const catalog=SIM.events.filter(e=>eventKinds.has(e.type)).map((e,i)=>{
    const s=stateAt(e.t);let p=[s.char.x,s.char.y],n=floorBasis(e.t).vector([0,-1]),type=e.type;
    if(type==='footstep')p=s.poseNodes[e.leg===0?8:10].slice();
    else if(['orb-impact','kick','double-kick','chaos-wave','decisive-collision','blue-pulse','purple-pulse','red-flash'].includes(type))p=[s.orb.x,s.orb.y];
    else if(type==='cube-impact')p=[s.cube.x,s.cube.y];
    else if(type==='apple-hit')p=s.poseNodes[2].slice();
    else if(type==='particle-touch'&&s.particles[0])p=[s.particles[0].x,s.particles[0].y];
    if(e.plane){const plane=s.planes.find(p=>p.id===e.plane);if(plane){n=plane.n.slice();const candidates=type==='orb-impact'?[[s.orb.x,s.orb.y]]:type==='cube-impact'?[[s.cube.x,s.cube.y]]:s.poseNodes;const q=candidates.reduce((a,b)=>((b[0]-plane.point[0])*n[0]+(b[1]-plane.point[1])*n[1])<((a[0]-plane.point[0])*n[0]+(a[1]-plane.point[1])*n[1])?b:a);const depth=(q[0]-plane.point[0])*n[0]+(q[1]-plane.point[1])*n[1];p=sub(q,mul(n,depth));}}
    return{...e,p,n,seed:i+1};
  });
  function impacts(ctx,s,t,camera){
    for(const e of catalog){const age=t-e.t;if(age<0||age>1)continue;const foot=e.type==='footstep',surface=foot||e.type.endsWith('impact')||e.type==='superelastic-bounce',special=['kick','double-kick','chaos-wave','decisive-collision','apple-hit'].includes(e.type),color=e.type==='apple-hit'?'#e65a50':e.type.includes('purple')||e.type.includes('inverted')?'#9a66d6':'#389fdf';
      if(surface&&age<(foot?.3:.6)){
        const tangent=[-e.n[1],e.n[0]],strength=foot?.4:clamp((e.incoming||450)/600,.45,1.6),count=foot?4:12,fade=Math.exp(-age*(foot?13:7));
        ctx.save();ctx.globalAlpha=fade*(foot?.3:.6);
        for(let i=0;i<count;i++){const rnd=hash(e.seed*113+i),side=i%2?1:-1,speed=(20+rnd*120)*strength,vn=(25+hash(i+e.seed*47)*90)*strength,dx=side*speed*age,dy=Math.max(0,vn*age-180*age*age),p=add(e.p,add(mul(tangent,dx),mul(e.n,dy)));disk(ctx,...p,(foot?1.6:2.2)*(1-age*.7),foot?'#93a8b9':color);}
        const center=e.p;ctx.translate(...center);ctx.rotate(Math.atan2(tangent[1],tangent[0]));ctx.strokeStyle=color;ctx.lineWidth=1.1/camera.zoom;ctx.beginPath();ctx.ellipse(0,0,3+age*(foot?55:160)*strength,1.5+age*11,0,0,TAU);ctx.stroke();ctx.restore();
      }
      if(special&&age<.5){ctx.save();ctx.globalAlpha=Math.exp(-age*8)*.75;const r=5+age*(e.type==='decisive-collision'?700:250);ctx.strokeStyle=color;ctx.lineWidth=(e.type==='decisive-collision'?5:2)/camera.zoom;ctx.beginPath();ctx.arc(...e.p,r,0,TAU);ctx.stroke();for(let i=0;i<12;i++){const a=i*TAU/12+hash(e.seed)*2,start=add(e.p,rot([r*.45,0],a)),end=add(e.p,rot([r*(.75+hash(i+e.seed)*.5),0],a));path(ctx,[start,end],color,1.2/camera.zoom);}ctx.restore();}
      if(['blue-pulse','purple-pulse','red-flash'].includes(e.type)&&age<.65){halo(ctx,e.p,90+age*450,color,.12*Math.exp(-age*6));}
    }
  }
  function actingAccents(ctx,s,t,camera){
    const p=ElasticRig.at('hero',t),head=p.nodes[2],a=s.char.angle,r=p.r;
    const surprise=[6.2,26.28,61.4,80.2,121.65],w=Math.max(0,...surprise.map(start=>{const age=t-start;return age>=0&&age<.5?Math.sin(Math.PI*age/.5):0;}));
    if(w){ctx.save();ctx.globalAlpha=.6*w;for(let i=0;i<3;i++){const ang=-2.3+i*.65,start=add(head,rot([r+8,0],ang+a)),end=add(head,rot([r+16+4*w,0],ang+a));path(ctx,[start,end],'#527a98',1.7/camera.zoom);}ctx.restore();}
    // Small strain marks and a falling bead communicate effort without adding a face.
    if((t>=57.3&&t<58)||(t>=58.5&&t<59)){
      const start=t<58?57.3:58.5,q=t-start,side=rot([r*.7,-r*.55],s.stage.angle),origin=add(head,side),drop=add(origin,rot([q*7,q*q*28],s.stage.angle));
      ctx.save();ctx.globalAlpha=.7*Math.sin(Math.PI*clamp(q/.7));ctx.fillStyle='#69b8e1';ctx.beginPath();ctx.ellipse(...drop,2,3.8,s.stage.angle,0,TAU);ctx.fill();ctx.restore();
      const hand=p.nodes[6];ctx.save();ctx.globalAlpha=.5*(.5+.5*Math.sin(t*26));for(let i=0;i<3;i++)path(ctx,[add(hand,rot([8+i*4,-8],s.stage.angle)),add(hand,rot([12+i*4,-11],s.stage.angle))],'#a4b0be',.9/camera.zoom);ctx.restore();
    }
    if((t>=73.1&&t<74.2)||(t>=102.2&&t<103.2)){
      const age=t-(t<75?73.1:102.2),hand=p.nodes[6],w=Math.sin(Math.PI*clamp(age));ctx.save();ctx.globalAlpha=w*.8;for(let i=0;i<5;i++){const a=i*TAU/5;path(ctx,[add(hand,rot([9,0],a)),add(hand,rot([14,0],a))],'#35a9e6',1.1/camera.zoom);}ctx.restore();
    }
    // Air streaks follow velocity only during the short bursts that call for them.
    if((t>35&&t<38.7)||(s.flags.doubleKick&&t-s.flags.doubleKick<.45)||(t>45.8&&t<50.5)){
      const speed=Math.hypot(s.char.vx,s.char.vy),dir=speed>1?[-s.char.vx/speed,-s.char.vy/speed]:[-1,0],normal=[-dir[1],dir[0]];ctx.save();ctx.globalAlpha=.12*clamp(speed/600);for(let i=0;i<5;i++){const origin=add([s.char.x,s.char.y],add(mul(normal,(i-2)*22),mul(dir,50+hash(i)*30)));path(ctx,[origin,add(origin,mul(dir,25+hash(i+8)*42))],'#5b9fc7',1/camera.zoom);}ctx.restore();
    }
  }
  function finish(ctx,s,t,W,H){
    const g=ctx.createRadialGradient(W*.5,H*.45,H*.2,W*.5,H*.5,W*.7);g.addColorStop(0,'rgba(41,64,90,0)');g.addColorStop(1,'rgba(41,64,90,.045)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  window.LivingWorld={background,environment,energy,cube,orb,impacts,actingAccents,finish,catalog,phase};
})();
