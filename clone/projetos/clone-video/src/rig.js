import * as THREE from 'three';
export const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const UP=V(0,1,0);
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
export function solveIK(root,target,l1,l2,pole=V(0,0,1)) {
  const axis=target.clone().sub(root); let distance=axis.length();
  if(distance<1e-8)axis.set(0,-1,0); else axis.divideScalar(distance);
  distance=clamp(distance,Math.abs(l1-l2)+0.0001,l1+l2-0.0001);
  const along=(l1*l1-l2*l2+distance*distance)/(2*distance);
  const height=Math.sqrt(Math.max(0,l1*l1-along*along));
  const side=pole.clone().addScaledVector(axis,-pole.dot(axis));
  if(side.lengthSq()<1e-8)side.set(1,0,0).addScaledVector(axis,-axis.x);
  side.normalize();
  const joint=root.clone().addScaledVector(axis,along).addScaledVector(side,height);
  return {joint,end:root.clone().addScaledVector(axis,distance),reachable:Math.abs(distance-target.distanceTo(root))<0.001};
}
export function toonMaterial(hex) {
  const c=new THREE.Color(hex);
  return new THREE.ShaderMaterial({uniforms:{color:{value:c}},vertexShader:`
    varying vec3 N; varying vec3 P;
    void main(){N=normalize(normalMatrix*normal);vec4 p=modelViewMatrix*vec4(position,1.);P=p.xyz;gl_Position=projectionMatrix*p;}`,
    fragmentShader:`uniform vec3 color;varying vec3 N;varying vec3 P;
    void main(){vec3 n=normalize(N);float d=dot(n,normalize(vec3(-.45,.8,1.)));
      float band=d>.48?1.:d>-.08?.77:.48;
      vec3 shadow=mix(vec3(.12,.08,.24),color,.64);
      vec3 col=mix(shadow,color,band);
      float rim=pow(1.-max(0.,dot(n,normalize(-P))),4.);
      col+=rim*.12*vec3(.54,.68,1.);
      if(d<.12&&mod(floor(gl_FragCoord.x*.6)+floor(gl_FragCoord.y*.6),4.)<1.)col*=.95;
      gl_FragColor=vec4(col,1.);
      #include <colorspace_fragment>
    }`});
}
const geo={sphere:new THREE.SphereGeometry(1,20,14),capsule:new THREE.CylinderGeometry(1,1,1,12,1),box:new THREE.BoxGeometry(1,1,1)};
const outline=new THREE.MeshBasicMaterial({color:0x1b1329,side:THREE.BackSide});
export function ball(parent,position,scale,mat,ink=true) {
  const mesh=new THREE.Mesh(geo.sphere,mat);mesh.position.copy(position);mesh.scale.copy(scale);parent.add(mesh);
  if(ink){const edge=new THREE.Mesh(geo.sphere,outline);edge.scale.setScalar(1.035);mesh.add(edge);}return mesh;
}
export function link(parent,mat,radius=.07) {
  const group=new THREE.Group();parent.add(group);
  const shaft=new THREE.Mesh(geo.capsule,mat);group.add(shaft);
  const a=ball(group,V(),V(radius,radius,radius),mat,false),b=ball(group,V(),V(radius,radius,radius),mat,false);
  group.userData.set=(p,q)=>{const d=q.clone().sub(p);shaft.position.copy(p).add(q).multiplyScalar(.5);shaft.quaternion.setFromUnitVectors(UP,d.clone().normalize());shaft.scale.set(radius,d.length(),radius);a.position.copy(p);b.position.copy(q);};return group;
}
export class Character {
  constructor(parent,{color=0xf5be13,role='student',scale=1}={}) {
    this.group=new THREE.Group();parent.add(this.group);this.group.scale.setScalar(scale);this.role=role;
    this.black=toonMaterial(0x191827);this.cloth=toonMaterial(color);this.white=toonMaterial(0xf4f5ff);this.shoes=toonMaterial(role==='student'?0xf4c62b:0x3c3a51);
    this.pelvis=V(0,1.18,0);this.chest=V(0,1.95,0);this.headPos=V(0,2.48,0);
    this.torso=ball(this.group,V(),V(.245,.46,.17),this.cloth);
    this.hip=ball(this.group,V(),V(.22,.13,.17),this.cloth);
    this.neck=link(this.group,this.black,.075);
    this.head=new THREE.Group();this.group.add(this.head);
    ball(this.head,V(),V(.325,.34,.285),this.black);
    this.face=new THREE.Group();this.head.add(this.face);
    this.eyes=[-.09,.09].map(x=>ball(this.face,V(x,.04,.269),V(.047,.076,.028),this.white,false));
    this.mouth=ball(this.face,V(0,-.11,.277),V(.065,.015,.01),this.white,false);
    if(role==='doctor'||role==='professor'||role==='agent'){
      const frame=new THREE.MeshBasicMaterial({color:role==='agent'?0x161a25:0xe3d6ba});
      for(const x of [-.09,.09]){const r=new THREE.Mesh(new THREE.TorusGeometry(.086,.012,6,20),frame);r.position.set(x,.04,.299);this.face.add(r);}
      if(role==='agent')for(const x of [-.09,.09])ball(this.face,V(x,.04,.296),V(.08,.048,.018),this.black,false);
    }
    if(role==='doctor'||role==='professor'){
      this.tie=ball(this.group,V(),V(.035,.23,.022),toonMaterial(0xa12e50),false);
      this.coat=this.torso;this.pocket=ball(this.group,V(),V(.07,.08,.015),toonMaterial(0x8bb4d0),false);
    }
    if(role==='student'){
      this.hood=ball(this.group,V(),V(.24,.17,.18),this.cloth);
      this.drawstrings=[-.05,.05].map(x=>link(this.group,this.white,.008));
      this.pouch=ball(this.group,V(),V(.135,.075,.018),toonMaterial(0xd9a824),false);
    }
    if(role==='graduate'){
      const cap=new THREE.Mesh(geo.box,this.black);cap.scale.set(.7,.055,.65);cap.position.y=.32;this.head.add(cap);
      const tassel=link(this.head,toonMaterial(0xe7c64f),.012);tassel.userData.set(V(.3,.33,.25),V(.3,.03,.25));
    }
    if(role==='agent'){
      for(let i=0;i<9;i++){const hair=ball(this.head,V(Math.cos(i)*.23,.27+Math.sin(i*2)*.025,Math.sin(i)*.19),V(.13,.12,.11),toonMaterial(0x33333d),false);}
    }
    this.arms=[-1,1].map(()=>({upper:link(this.group,this.cloth,role==='student'?.065:.08),lower:link(this.group,this.cloth,.055),hand:ball(this.group,V(),V(.065,.07,.06),this.black),target:V()}));
    this.legs=[-1,1].map(()=>({upper:link(this.group,this.black,.045),lower:link(this.group,this.black,.038),foot:ball(this.group,V(),V(.105,.055,.18),this.shoes),target:V()}));
    this.prop=new THREE.Group();this.group.add(this.prop);this.prop.visible=false;
    this.pose({});
  }
  pose({time=0,rootX=0,rootZ=0,facing=.1,action='stand',phase=0,energy=1,side=1,walkSpeed=.65}={}){
    const local=time;const wave=Math.sin(local*2.3);const gait=local*5.7;
    let walk=action==='walk'||action==='stumble'||action==='confused';
    let seated=['write','exam','test','type','study','phoneSit','talkSit','sleep','wake'].includes(action);
    let bend=['pickup','place','build'].includes(action)?smooth(Math.sin(phase*Math.PI)*.9)*.58:0;
    const lying=action==='sleep';const rising=action==='wake'?smooth(phase):0;
    const pelvis=V(0,seated?.64:1.18,0);
    if(walk)pelvis.y=1.12+.025*Math.cos(gait*2);
    if(bend)pelvis.y-=bend*.8;
    let chest=pelvis.clone().add(V(bend*side,.78-bend*.45,0));
    if(action==='tired'||action==='confused')chest.x+=.13;
    if(lying){pelvis.set(0,.72,0);chest.set(-.72,.83,0);}
    if(action==='wake'){pelvis.set(0,.72,0);chest.set(-.72*(1-rising),.83+.57*rising,0);}
    this.group.position.set(rootX,0,rootZ);this.group.rotation.y=facing;
    this.pelvis.copy(pelvis);this.chest.copy(chest);
    const torsoAxis=chest.clone().sub(pelvis);
    this.torso.position.copy(pelvis).add(chest).multiplyScalar(.5);this.torso.quaternion.setFromUnitVectors(UP,torsoAxis.clone().normalize());
    this.torso.scale.set(.23,torsoAxis.length()*.58,.165);this.hip.position.copy(pelvis);
    const neckBase=chest.clone().addScaledVector(torsoAxis.clone().normalize(),.04);
    const head=chest.clone().addScaledVector(torsoAxis.clone().normalize(),.49);
    this.neck.userData.set(neckBase,head.clone().add(V(0,-.24,0)));
    this.head.position.copy(head);this.head.rotation.z=action==='think'?.05*Math.sin(local):action==='tired'?.15:0;
    this.head.rotation.y=Math.sin(local*.7)*.07;
    const blink=Math.pow(Math.max(0,Math.cos(local*1.2)),40);
    this.eyes.forEach(e=>e.scale.y=.076*(1-.9*blink));
    this.mouth.scale.y=(['talk','talkSit','explain','answer','teach','agents'].includes(action)?(.013+.019*Math.max(0,Math.sin(local*12))):.012);
    if(action==='surprise'||action==='confused'){this.mouth.scale.set(.035,.035,.01);this.eyes.forEach(e=>e.scale.y=.08);}
    if(this.tie){this.tie.position.copy(chest).add(V(0,-.18,.175));this.tie.rotation.z=-bend*.7;this.pocket.position.copy(chest).add(V(.13,-.15,.16));}
    if(this.hood){this.hood.position.copy(chest).add(V(0,.06,-.03));this.pouch.position.copy(pelvis).add(V(0,.17,.17));this.drawstrings.forEach((l,i)=>l.userData.set(chest.clone().add(V(i? .055:-.055,.015,.18)),chest.clone().add(V(i?.07:-.065,-.23,.19))));}
    const shoulders=[-1,1].map(s=>chest.clone().add(V(s*.22,-.045,0)));
    let hands=shoulders.map((p,i)=>p.clone().add(V((i?1:-1)*.055,-.75,.02)));
    if(walk){hands=shoulders.map((p,i)=>p.clone().add(V((i?1:-1)*.04,-.64,Math.sin(gait+i*Math.PI)*.27)));}
    if(seated&&!lying){hands=[V(-.10,chest.y-.28,.54),V(.25,chest.y-.28,.55)];}
    if(['talk','talkSit','explain','teach','answer','agents'].includes(action))hands[1]=chest.clone().add(V(.46,.04+wave*.13,.22));
    if(action==='answer'||action==='celebrate'){hands=shoulders.map((p,i)=>p.clone().add(V((i?1:-1)*.28,.63+wave*.035,.07)));}
    if(action==='think'||action==='tired'||action==='confused'){hands[1]=head.clone().add(V(.25,-.08,.11));hands[0]=pelvis.clone().add(V(-.18,.2,.15));}
    if(['phone','phoneSit','buy'].includes(action)){hands[1]=chest.clone().add(V(.40,.03,.24));hands[0]=pelvis.clone().add(V(-.22,.2,.08));}
    if(['write','exam','study','test','type'].includes(action)){hands[1]=chest.clone().add(V(.38,-.24,.45));hands[1].x+=Math.sin(local*6)*.04;hands[0]=chest.clone().add(V(-.18,-.3,.42));}
    if(action==='handshake'){hands[1]=chest.clone().add(V(.47,-.25,.20));}
    if(['pickup','place','build'].includes(action)){hands[1]=chest.clone().add(V(.12,-.73,.15));hands[0]=chest.clone().add(V(-.12,-.62,.18));}
    if(action==='present')hands[1]=chest.clone().add(V(.66,-.06,.02));
    if(action==='surprise'){hands=shoulders.map((p,i)=>p.clone().add(V((i?1:-1)*.34,.3,.1)));}
    if(lying){hands=[V(-.25,.81,.15),V(.2,.82,.15)];}
    this.arms.forEach((a,i)=>{
      const p=shoulders[i];const ik=solveIK(p,hands[i],.39,.39,V(i?1:-1,-.3,-.3));
      a.upper.userData.set(p,ik.joint);a.lower.userData.set(ik.joint,ik.end);a.hand.position.copy(ik.end);a.target.copy(ik.end);
    });
    this.legs.forEach((leg,i)=>{
      const s=i?1:-1;const hip=pelvis.clone().add(V(s*.12,0,0));
      let target=V(s*.13,.075,.04);
      if(walk){
        // During stance the world-space foot stays fixed as the pelvis advances.
        // The opposite foot follows a raised recovery arc; no scaling of bones.
        const cycle=1.10,stance=.62,p=((local/cycle+i*.5)%1+1)%1;
        const stride=walkSpeed*cycle*stance;
        const travel=p<stance?stride*(.5-p/stance):stride*(-.5+smooth((p-stance)/(1-stance)));
        target.x+=Math.cos(facing)*travel;target.z+=Math.sin(facing)*travel;
        target.y+=p<stance?0:Math.sin(Math.PI*(p-stance)/(1-stance))*.18;
      }
      if(seated)target.set(s*.13,.075,.53);
      if(lying)target.set(1.02,.78,s*.12);
      if(action==='wake')target.set(1.02*(1-rising)+s*.13*rising,.78*(1-rising)+.075*rising,s*.12*(1-rising)+.53*rising);
      const ik=solveIK(hip,target,.56,.56,V(0,.1,1));
      leg.upper.userData.set(hip,ik.joint);leg.lower.userData.set(ik.joint,ik.end);leg.foot.position.copy(ik.end).add(V(0,-.025,.055));leg.target.copy(ik.end);
    });
    this.prop.position.copy(this.arms[1].target);this.prop.rotation.set(.05,0,-.15+Math.sin(local)*.02);
  }
}
