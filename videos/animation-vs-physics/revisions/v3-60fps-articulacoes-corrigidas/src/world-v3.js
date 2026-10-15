/* V3: a responsive, procedural physics chamber. Every visual is drawn from code.
 * The scenery is decorative; the existing floor/wall collision planes stay authoritative. */
(() => {
  'use strict';
  const old={...LivingWorld}, {clamp,smooth,lerp,rot,add,sub,mul}=V, TAU=Math.PI*2;
  const hash=n=>{const q=Math.sin(n*127.1+311.7)*43758.5453;return q-Math.floor(q);};
  const line=(ctx,points,color,width=1)=>{ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](...p));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap=ctx.lineJoin='round';ctx.stroke();};
  const disk=(ctx,p,r,color)=>{ctx.beginPath();ctx.arc(...p,Math.max(.01,r),0,TAU);ctx.fillStyle=color;ctx.fill();};
  const rgba=(rgb,a)=>`rgba(${rgb.join(',')},${clamp(a)})`;
  function palette(t){
    const purple=smooth((t-60.5)/1.4)*(1-smooth((t-113.7)/1.3));
    const danger=smooth((t-75)/5)*(1-smooth((t-112)/3));
    return {rgb:[lerp(35,142,purple),lerp(158,96,purple),lerp(211,219,purple)],purple,danger};
  }
  function glow(ctx,p,r,color,alpha=.3){
    if(alpha<=0||r<.1)return;
    const g=ctx.createRadialGradient(...p,0,...p,r);
    g.addColorStop(0,rgba(color,alpha));g.addColorStop(.32,rgba(color,alpha*.35));g.addColorStop(1,rgba(color,0));
    ctx.fillStyle=g;ctx.fillRect(p[0]-r,p[1]-r,r*2,r*2);
  }
  function basis(s,t){return t>=50&&t<115?Physics.stage(-Math.PI/2,[5690,0]):Physics.stage();}
  function background(ctx,s,t,W,H,camera){
    const {rgb,danger}=palette(t), reveal=.8+.2*smooth(t/2), cameraLocal=rot(camera.focus,-camera.rotation);
    ctx.save();
    const bg=ctx.createLinearGradient(0,0,W*.15,H);
    bg.addColorStop(0,'#f9fcff');bg.addColorStop(.48,'#eef5f8');bg.addColorStop(1,'#d8e6ee');
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // Backlit ceiling, layered translucent architectural bays, far behind the action.
    glow(ctx,[W*.42,H*.14],W*.68,[255,255,255],.98);
    glow(ctx,[W*.86,H*.64],600,rgb,.13+danger*.08);
    const drift=cameraLocal[0]*.11;
    ctx.globalAlpha=.72*reveal;
    for(let i=-2;i<8;i++){
      const x=i*390-((drift%390)+390)%390, y=104+(i%3)*27, w=290, h=760;
      const glass=ctx.createLinearGradient(x,0,x+w,0);glass.addColorStop(0,'rgba(255,255,255,.06)');glass.addColorStop(.55,'rgba(255,255,255,.66)');glass.addColorStop(1,'rgba(138,166,187,.08)');
      ctx.fillStyle=glass;ctx.fillRect(x,y,w,h);
      line(ctx,[[x,y+h],[x,y+28],[x+28,y],[x+w,y]],'rgba(105,139,164,.15)',1.1);
      line(ctx,[[x+12,y+h],[x+12,y+30],[x+30,y+12],[x+w,y+12]],'rgba(255,255,255,.9)',1.2);
      for(let j=0;j<3;j++){
        const yy=y+120+j*180;
        line(ctx,[[x+40,yy],[x+76,yy],[x+90,yy-14],[x+185,yy-14]],'rgba(125,155,177,.12)',1);
        const a=.18+.12*(.5+.5*Math.sin(t*.75+i*1.3+j));
        disk(ctx,[x+194,yy-14],2,rgba(rgb,a));
      }
    }
    // Quiet orbital drafting marks give scale and an independently moving far layer.
    const cx=W*.72-cameraLocal[0]*.027,cy=H*.35-cameraLocal[1]*.025;
    ctx.save();ctx.translate(cx,cy);ctx.rotate(-camera.rotation*.08);
    for(let k=0;k<3;k++){
      const r=210+k*66;ctx.beginPath();ctx.arc(0,0,r,-2.7+k*.17,1.5+k*.19);ctx.strokeStyle='rgba(100,141,167,.12)';ctx.lineWidth=1;ctx.stroke();
      for(let j=0;j<28;j++){
        const a=j*.151-2.5, p=[Math.cos(a)*r,Math.sin(a)*r],q=[Math.cos(a)*(r+(j%5===0?9:4)),Math.sin(a)*(r+(j%5===0?9:4))];
        line(ctx,[p,q],'rgba(100,141,167,.15)',1);
      }
      const a=t*(.05+k*.025)+k*1.7;disk(ctx,[Math.cos(a)*r,Math.sin(a)*r],2.6,rgba(rgb,.4));
    }
    ctx.restore();ctx.globalAlpha=1;
    // Dust has independent depth and velocity. No random values depend on draw order.
    for(let i=0;i<48;i++){
      const depth=.3+hash(i+70)*.7;
      const x=((hash(i)*2300-cameraLocal[0]*.035*depth+t*(3+depth*4))%2300+2300)%2300-190;
      const y=80+hash(i+120)*850+Math.sin(t*.3+i)*17;
      disk(ctx,[x,y],.7+depth*1.5,rgba(i%4===0?rgb:[112,148,172],.08+depth*.13));
    }
    // Soft overhead light beams; broad gradients avoid hard opaque stripes.
    for(let i=0;i<3;i++){
      const x=140+i*650-cameraLocal[0]*.018;
      const g=ctx.createLinearGradient(x-100,0,x+180,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.21)');g.addColorStop(1,'rgba(255,255,255,0)');
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-80,0);ctx.lineTo(x+45,0);ctx.lineTo(x+370,H);ctx.lineTo(x+80,H);ctx.closePath();ctx.fill();
    }
    ctx.restore();
  }
  function environment(ctx,s,t,camera){
    const B=basis(s,t),here=B.local(camera.focus),z=camera.zoom,extent=1600/z+450,{rgb,danger}=palette(t);
    ctx.save();ctx.translate(...B.origin);ctx.rotate(B.angle);
    // Perspective floor recedes below the real contact edge; the hero always touches y=810.
    const floor=ctx.createLinearGradient(0,810,0,1180);
    floor.addColorStop(0,'#dce9ef');floor.addColorStop(.16,'#e4edf1');floor.addColorStop(1,'#c5d7e2');
    ctx.fillStyle=floor;ctx.fillRect(here[0]-extent,810,extent*2,3000);
    const vanish=here[0]*.35;
    ctx.save();ctx.beginPath();ctx.rect(here[0]-extent,814,extent*2,2500);ctx.clip();
    for(let i=Math.floor((here[0]-extent)/85);i<=(here[0]+extent)/85;i++){
      const x=i*85;
      line(ctx,[[x,810],[x+(x-vanish)*1.8,2400]],'rgba(100,138,164,.16)',.65/z);
    }
    for(let j=0;j<14;j++){
      const y=810+8*Math.pow(1.6,j);line(ctx,[[here[0]-extent,y],[here[0]+extent,y]],'rgba(100,138,164,.17)',.65/z);
    }
    ctx.restore();
    // Layered edge and recessed illuminated seams react to each physics rule.
    ctx.fillStyle='#a8bdcc';ctx.fillRect(here[0]-extent,812,extent*2,2/z);
    line(ctx,[[here[0]-extent,817],[here[0]+extent,817]],'rgba(255,255,255,.9)',1.2/z);
    for(let x=Math.floor((here[0]-extent)/220)*220;x<here[0]+extent;x+=220){
      line(ctx,[[x+12,823],[x+55,823]],rgba(rgb,.2+danger*.2),1.8/z);
      disk(ctx,[x+65,823],1.1/z,rgba(rgb,.5));
    }
    // Low-amplitude disturbance travels along the floor after each impact.
    for(const e of old.catalog){
      const age=t-e.t;if(age<0||age>1.15||!['character-impact','cube-impact','orb-impact','superelastic-bounce','decisive-collision'].includes(e.type))continue;
      const p=B.local(e.p),r=age*260;
      for(const sign of [-1,1]){
        const x=p[0]+r*sign;ctx.globalAlpha=.4*Math.exp(-age*3);
        line(ctx,[[x-10,818],[x+10,818]],rgba(rgb,.8),2/z);
      }
    }
    ctx.restore();
    // Preserve the original contact shadows and a light world-space measurement grid.
    ctx.save();ctx.globalAlpha=.52;old.environment(ctx,s,t,camera);ctx.restore();
    // A blue contact pool visibly follows the sphere, including during gravity rotation.
    if(s.orb.visible&&s.orb.glow!==0){
      const p=B.local([s.orb.x,s.orb.y]),h=Math.max(0,810-p[1]);
      ctx.save();ctx.translate(...B.world([p[0],810]));ctx.rotate(B.angle);ctx.scale(1,.13);
      glow(ctx,[0,0],55+h*.04,rgb,.23*Math.exp(-h/350));ctx.restore();
    }
  }
  function orb(ctx,s,t){
    if(!s.orb.visible)return;
    const o=s.orb,st=SceneEffects.orbStyle(s,t),r=st.r,p=[o.x,o.y],rgb=st.rgb||[31,167,244];
    if(o.glow!==0){glow(ctx,p,r*5,rgb,.25);glow(ctx,p,r*2,rgb,.24);}
    const g=ctx.createRadialGradient(o.x-r*.35,o.y-r*.4,r*.03,o.x,o.y,r);
    g.addColorStop(0,'#f2ffff');g.addColorStop(.22,'#a9eaff');g.addColorStop(.48,st.color);g.addColorStop(1,rgba(rgb.map(v=>v*.42),1));
    disk(ctx,p,r,g);
    ctx.save();ctx.strokeStyle='rgba(234,255,255,.85)';ctx.lineWidth=r*.075;ctx.beginPath();ctx.arc(...p,r*.79,-2.9,-1.3);ctx.stroke();
    ctx.strokeStyle=rgba(rgb,.65);ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(...p,r+4,(r+4)*.42,t*.65,0,TAU);if(o.glow!==0)ctx.stroke();ctx.restore();
  }
  function cube(ctx,s,t){
    old.cube(ctx,s,t);if(!s.cube.visible)return;
    const c=s.cube,h=c.size/2,inv=c.response==='inverted',a=s.flags.decisive===undefined?1:1-smooth((t-s.flags.decisive-.4)/2);
    ctx.save();ctx.globalAlpha=a;
    const x=c.x-h,y=c.y-h;
    // Beveled inlays stay inside the original collision silhouette.
    line(ctx,[[x+4,y+14],[x+4,y+4],[x+14,y+4]],'rgba(242,253,255,.95)',1.5);
    line(ctx,[[x+c.size-14,y+c.size-4],[x+c.size-4,y+c.size-4],[x+c.size-4,y+c.size-14]],'rgba(39,39,76,.46)',1.5);
    ctx.translate(c.x,c.y);const spin=t*(inv?1.2:.2);ctx.rotate(spin);
    ctx.strokeStyle=inv?'rgba(239,216,255,.75)':'rgba(231,242,249,.8)';ctx.lineWidth=.85;
    ctx.beginPath();ctx.arc(0,0,10,-.7,1.7);ctx.stroke();ctx.beginPath();ctx.arc(0,0,10,2.4,4.8);ctx.stroke();
    disk(ctx,[0,0],2.2,inv?'#eedcff':'#e3effa');ctx.restore();
  }
  function energy(ctx,s,t,camera){
    old.energy(ctx,s,t,camera);if(!s.orb.visible||s.orb.glow===0)return;
    const {rgb,danger}=palette(t),o=s.orb,r=o.r;
    ctx.save();ctx.globalAlpha=.22+danger*.22;
    for(let i=0;i<(danger?5:2);i++){
      const a=t*(.5+i*.08)*(i%2?-1:1)+i*1.9,rr=r+12+i*9;
      ctx.save();ctx.translate(o.x,o.y);ctx.rotate(a);ctx.scale(1,.44+i*.04);
      ctx.beginPath();ctx.arc(0,0,rr,.1,4.9);ctx.strokeStyle=rgba(rgb,.6);ctx.lineWidth=1/camera.zoom;ctx.stroke();disk(ctx,[rr,0],1.7,rgba(rgb,.9));ctx.restore();
    }
    // Field lines and floating fragments accelerate as the chamber destabilizes.
    if(danger){
      for(let i=0;i<28;i++){
        const a=i*2.39996+t*(.18+.06*hash(i)),rad=90+hash(i+18)*160;
        const p=[o.x+Math.cos(a)*rad,o.y+Math.sin(a)*rad*.62];
        const d=4+hash(i+35)*8;ctx.save();ctx.translate(...p);ctx.rotate(a+t*.3);
        line(ctx,[[-d,0],[d,0]],rgba(rgb,.5*danger),.9/camera.zoom);
        if(i%4===0)line(ctx,[[0,-d],[0,d]],rgba(rgb,.3*danger),.8/camera.zoom);ctx.restore();
      }
    }
    ctx.restore();
  }
  function impacts(ctx,s,t,camera){
    old.impacts(ctx,s,t,camera);
    for(const e of old.catalog){
      const age=t-e.t;if(age<0||age>.8)continue;
      const important=['kick','double-kick','character-impact','cube-impact','superelastic-bounce','decisive-collision'].includes(e.type);
      if(!important)continue;
      const {rgb}=palette(t),strength=e.type==='decisive-collision'?2.2:1;
      ctx.save();ctx.globalAlpha=Math.exp(-age*6)*.5;
      for(let i=0;i<18;i++){
        const a=hash(i+e.seed*57)*TAU,speed=(70+hash(i+e.seed*23)*230)*strength;
        const p=add(e.p,[Math.cos(a)*speed*age,Math.sin(a)*speed*age+100*age*age]);
        const tail=add(p,[-Math.cos(a)*Math.min(11,age*speed*.3),-Math.sin(a)*Math.min(11,age*speed*.3)]);
        line(ctx,[tail,p],rgba(i%4===0?[255,190,97]:rgb,.8),1.3/camera.zoom);
      }
      ctx.restore();
    }
  }
  function finish(ctx,s,t,W,H){
    const {rgb}=palette(t),v=ctx.createRadialGradient(W*.48,H*.43,H*.25,W*.5,H*.45,W*.7);
    v.addColorStop(0,'rgba(18,45,69,0)');v.addColorStop(1,'rgba(18,45,69,.12)');ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
    // A soft lighting response follows impacts without covering the silhouettes.
    let flash=0;
    for(const e of old.catalog){const a=t-e.t;if(a>=0&&a<.23&&['blue-pulse','purple-pulse','chaos-wave','double-kick','decisive-collision'].includes(e.type))flash+=Math.exp(-a*22)*.1;}
    if(flash){ctx.fillStyle=rgba(rgb,Math.min(.11,flash));ctx.fillRect(0,0,W,H);}
  }
  Object.assign(LivingWorld,{background,environment,orb,cube,energy,impacts,finish});
  window.WorldV3={palette,basis,hash,source:'procedural geometry',depthLayers:4};
})();
