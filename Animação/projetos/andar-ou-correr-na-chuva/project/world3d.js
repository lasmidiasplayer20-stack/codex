/* Geometry, rain and camera animation are original. Three.js is MIT licensed. */
(()=>{
const T=THREE,scene=new T.Scene();scene.background=new T.Color('#445e73');scene.fog=new T.Fog('#445e73',35,100);
const renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(1920,1080);renderer.setPixelRatio(1);renderer.outputEncoding=T.sRGBEncoding;renderer.toneMapping=T.NoToneMapping;renderer.toneMappingExposure=.78;
const camera=new T.PerspectiveCamera(43,1280/720,.1,150);
scene.add(new T.HemisphereLight('#b5d6e9','#2c3045',.7));let sun=new T.DirectionalLight('#bfd6e5',.9);sun.position.set(-6,12,10);scene.add(sun);let warm=new T.PointLight('#ffc97a',2.4,14);warm.position.set(8,2.5,-1);scene.add(warm);
const materials={};function mat(color,rough=.8){let key=color+rough;return materials[key]||(materials[key]=new T.MeshLambertMaterial({color:new T.Color(color).convertSRGBToLinear()}))}
function box(x,y,z,w,h,d,color,rough=.8){let m=new T.Mesh(new T.BoxGeometry(w,h,d),mat(color,rough));m.position.set(x,y,z);scene.add(m);return m}
function ball(x,y,z,r,color,parent=scene,sx=1,sy=1,sz=1){let m=new T.Mesh(new T.SphereGeometry(r,16,12),mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m}
function cyl(a,b,r,color,parent=scene){let va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va),m=new T.Mesh(new T.CylinderGeometry(r,r,d.length(),10),mat(color));m.position.copy(va.clone().add(vb).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());parent.add(m);return m}
box(0,-.12,2,65,.22,32,'#344d60',.3);box(0,.03,-.4,65,.2,5,'#728a90',.45);box(0,.17,-2.8,65,.3,.25,'#9ba9a3');
for(let i=0;i<14;i++){let x=-30+i*4.8,h=5+(i*19%8),color=['#496273','#566a75','#6a7a7d','#4a5e70'][i%4];box(x,h/2,-8.5,4.4,h,5,color);box(x,h+.12,-8.5,4.6,.24,5.2,'#344958');for(let j=0;j<3;j++)for(let k=0;k<Math.floor(h/1.5);k++){let pane=box(x-1.3+j*1.3,1+k*1.55,-5.96,.66,.82,.03,(i+j+k)%5===0?'#bba77f':'#90a5ac',.3);if((i+j+k)%5===0)pane.material=new T.MeshLambertMaterial({color:'#bba77f',emissive:'#8c6c38',emissiveIntensity:.23})}}
// Curb, lane markings and stylized wet highlights.
for(let i=-15;i<16;i++){box(i*2,.011,6.5,1,.01,.13,'#b5bab0');let m=box(i*2.1,.012,2+(i%5)*.6,.8,.006,.05,'#56768a',.18);}
for(let i=0;i<16;i++){let p=new T.Mesh(new T.CircleGeometry(.4+(i%4)*.18,32),new T.MeshBasicMaterial({color:'#8eb4c6',transparent:true,opacity:.1,depthWrite:false}));p.rotation.x=-Math.PI/2;p.scale.y=.23;p.position.set(-12+(i*1.8)%29,.018,1+(i*1.3)%6);scene.add(p)}
// A clearly recognizable warm-lit destination with awning and glass doors.
box(8,2.4,-3,5,4.8,1.3,'#3e5261');box(8,1.9,-2.29,2.4,3.8,.1,'#d9bb80');box(8,1.87,-2.21,1.9,3.6,.03,'#8f9b92',.18);box(8,1.87,-2.17,.08,3.6,.05,'#dcdbbd');box(8,2,-2.1,.42,.055,.05,'#34454f');let awning=box(8,4,-1.5,5.5,.25,2.7,'#577e8d');box(8,3.85,-.14,5.5,.18,.12,'#96b1b5');
function sign(txt,w,h){let c=document.createElement('canvas');c.width=512;c.height=128;let x=c.getContext('2d');x.fillStyle='#253e51';x.fillRect(0,0,512,128);x.font='bold 66px sans-serif';x.fillStyle='#f2dfb0';x.textAlign='center';x.fillText(txt,256,88);let tex=new T.CanvasTexture(c),p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tex}));p.position.set(8,4.55,-2.3);scene.add(p)}sign('ABRIGO',3.2,.7);
for(let x of [-8,1,15]){cyl([x,0,0],[x,5.8,0],.07,'#283c4d');cyl([x,5.8,0],[x+.9,5.8,0],.065,'#283c4d');box(x+.9,5.75,0,.7,.12,.3,'#e0d5ae');let l=new T.PointLight('#ffd09a',.5,7);l.position.set(x+.9,5.6,0);scene.add(l)}
for(let x of [-12,19]){cyl([x,.2,-1],[x,2.4,-1],.12,'#5c6158');ball(x,3,-1,1.3,'#3a666b',scene,1,1.3,1);ball(x-.6,3.3,-1,.9,'#477771');box(x,0,-1,2.2,.25,2,'#5e7682')}
// Batch static architecture by material to keep software rendering efficient.
{scene.updateMatrixWorld(true);const groups=new Map();for(const m of [...scene.children]){if(!m.isMesh)continue;let data=groups.get(m.material);if(!data){data={p:[],n:[],uv:[]};groups.set(m.material,data)}let geo=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();geo.applyMatrix4(m.matrixWorld);for(let [key,arr]of [['position',data.p],['normal',data.n],['uv',data.uv]]){let a=geo.getAttribute(key);if(a)for(let v of a.array)arr.push(v)}scene.remove(m);geo.dispose();}for(let [material,data]of groups){let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(data.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(data.n,3));if(data.uv.length)geo.setAttribute('uv',new T.Float32BufferAttribute(data.uv,2));scene.add(new T.Mesh(geo,material));}}
const M=window.MotionV2;
function makeActor(color){
 const g=new T.Group();scene.add(g);
 const body=new T.Mesh(new T.CylinderGeometry(.23,.19,1,12),mat(color));g.add(body);
 const head=ball(0,0,0,.29,'#111b28',g,1,1.1,.94),neck=new T.Mesh(new T.CylinderGeometry(.065,.065,1,10),mat('#172233'));g.add(neck);
 const eyes=[-.095,.095].map(x=>ball(x,0,0,.043,'#edf1de',g,.7,1.3,.6));
 const mouth=ball(0,0,0,.035,'#abbec2',g,1,.2,.2);
 const limbs=Array.from({length:8},(_,i)=>{let m=new T.Mesh(new T.CylinderGeometry(i<4?.068:.065,i<4?.068:.065,1,10),mat(i<4?'#182838':color));g.add(m);return m});
 const hands=[ball(0,0,0,.075,'#172330',g),ball(0,0,0,.075,'#172330',g)],knees=[ball(0,0,0,.07,'#182838',g),ball(0,0,0,.07,'#182838',g)],elbows=[ball(0,0,0,.07,color,g),ball(0,0,0,.07,color,g)];
 const shoes=[0,1].map(()=>{let m=new T.Mesh(new T.BoxGeometry(.19,.09,.33),mat('#a7b8b9'));g.add(m);return m});
 const seam=new T.Mesh(new T.BoxGeometry(.013,.70,.014),mat('#b79c56'));seam.position.z=.21;body.add(seam);
 const shadow=new T.Mesh(new T.CircleGeometry(.47,24),new T.MeshBasicMaterial({color:'#0d1f2e',transparent:true,opacity:.38,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.132;scene.add(shadow);
 return{g,body,head,neck,eyes,mouth,limbs,hands,knees,elbows,shoes,shadow};
}
const hero=makeActor('#efc655'),friend=makeActor('#6cbcc7');
function segment(m,a,b){let va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.sub(va);m.position.copy(va.addScaledVector(d,.5));m.scale.y=d.length();m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize())}
function applyRig(r,state){
 const p=M.pose(state);r.g.position.set(state.position[0],state.ground,state.position[2]);r.g.rotation.y=state.yaw;
 segment(r.body,p.hip,p.shoulder);segment(r.neck,p.shoulder,[p.head[0],p.head[1]-.25,p.head[2]]);r.head.position.set(...p.head);
 const blink=state.time%4.3<.09;
 for(let [i,e]of r.eyes.entries()){e.position.set((i?1:-1)*.095,p.head[1]+.015,p.head[2]+.257);e.scale.y=blink?.18:1.3;}
 r.mouth.position.set(.01,p.head[1]-.11,p.head[2]+.265);r.mouth.scale.y=state.gait==='run'&&state.speed>.2?.65+.12*Math.sin(state.time*8):.20;
 for(let i=0;i<2;i++){
  let l=p.legs[i],a=p.arms[i],f=p.feet[i];segment(r.limbs[i*2],l.hip,l.knee);segment(r.limbs[i*2+1],l.knee,l.ankle);r.knees[i].position.set(...l.knee);
  segment(r.limbs[4+i*2],a.shoulder,a.elbow);segment(r.limbs[5+i*2],a.elbow,a.hand);r.elbows[i].position.set(...a.elbow);r.hands[i].position.set(...a.hand);
  let turn=Math.atan2(Math.sin(f.nextYaw-f.contactYaw),Math.cos(f.nextYaw-f.contactYaw)),shoeYaw=f.contactYaw+(f.supported?0:turn*M.smooth(f.swing))-state.yaw;r.shoes[i].position.set(l.ankle[0]+Math.sin(shoeYaw)*.065,l.ankle[1]-.045,l.ankle[2]+Math.cos(shoeYaw)*.065);r.shoes[i].rotation.set(f.supported?0:.12*Math.sin(f.swing*Math.PI)*p.amount,shoeYaw,0);
 }
 r.shadow.position.x=state.position[0];r.shadow.position.z=state.position[2];r.shadow.scale.setScalar(1-p.bob*.8);r.g.updateMatrixWorld(true);r.pose=p;return p;
}
function place(t,s){const tracks=M.streetTracks(t,s);applyRig(hero,tracks[0]);friend.g.visible=tracks.length>1;friend.shadow.visible=tracks.length>1;if(tracks[1])applyRig(friend,tracks[1]);return tracks;}
function cameraPlan(t,s,tracks){
 const local=t-s.start,dur=s.end-s.start,urgent=tracks.some(a=>a.gait==='run'),cutLength=urgent?2.2:2.9,cut=Math.floor(local/cutLength),u=(local%cutLength)/cutLength;
 const a=tracks[0].position,b=tracks[1]?.position||a,mid=[(a[0]+b[0])/2,1.5,(a[2]+b[2])/2];
 let pos,target,fov=43,name;
 if(tracks.length>1&&cut%3===0){pos=[3.0,5.1,15];target=[1,1.5,1.2];name='comparacao-ampla';fov=45;}
 else if(cut%3===0){pos=[a[0]+2.7,urgent?1.25:2.8,a[2]+(urgent?6.2:7.4)];target=[a[0]+.6,urgent?1.25:1.7,a[2]];name=urgent?'acompanhamento-baixo':'aproximacao';fov=38-2*M.smooth(u);}
 else if(cut%3===1){pos=tracks.length>1?[3,4.6,13.4]:[mid[0]+2.6,4.6,mid[2]+12.2];target=tracks.length>1?[1.5,1.4,1]:mid;name='contexto-e-destino';fov=44;}
 else{pos=[a[0]+3.2-1.2*M.smooth(u),2.65,a[2]+6.3];target=[a[0]+.1,1.85,a[2]];name='reacao-em-movimento';fov=37-3*M.smooth(u);}
 const hit=Math.max(0,1-local%cutLength/.18),shake=urgent?.018*hit:0;
 camera.position.set(pos[0]+Math.sin(t*39)*shake,pos[1]+Math.sin(t*47)*shake,pos[2]);camera.up.set(Math.sin(t*1.1)*(urgent?.006:.002),1,0);camera.fov=fov;camera.lookAt(...target);camera.updateProjectionMatrix();
 return{name,cut,cutPhase:local%cutLength,position:camera.position.toArray(),target,fov,urgent};
}
const count=950,positions=new Float32Array(count*6),rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(positions,3));const drops=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:'#c4dfeb',transparent:true,opacity:.4}));scene.add(drops);
const spray=new T.InstancedMesh(new T.SphereGeometry(1,6,4),new T.MeshBasicMaterial({color:'#b8e3ef',transparent:true,opacity:.65}),48);scene.add(spray);const dummy=new T.Object3D();
function splash(tracks){let k=0;for(let [i,state]of tracks.entries()){let rig=i?friend:hero;for(let f of rig.pose.feet){let age=f.phase*rig.pose.stride/Math.max(.1,state.speed),active=f.supported&&state.speed>.65&&age<.32;for(let j=0;j<12;j++){
 const a=j*2.399,dt=age-.003*(j%3),v=.3+(j%4)*.15;dummy.position.set(f.world[0]+Math.cos(a)*v*dt,f.world[1]-.04+(.6+j%3*.15)*dt-4*dt*dt,f.world[2]+Math.sin(a)*v*dt);dummy.scale.set(.015,.028,.015);if(!active||dt<0||dummy.position.y<state.ground)dummy.scale.setScalar(0);dummy.updateMatrix();spray.setMatrixAt(k++,dummy.matrix);
 }}}
 while(k<48){dummy.scale.setScalar(0);dummy.updateMatrix();spray.setMatrixAt(k++,dummy.matrix)}spray.instanceMatrix.needsUpdate=true;
}
window.street3d=(t,s,u)=>{
 const tracks=place(t,s),plan=cameraPlan(t,s,tracks),wind=(s.wind||0)/220;
 scene.background.set('#304a60');scene.fog.color.copy(scene.background);
 for(let i=0;i<count;i++){let xx=((i*1.391+t*wind)%38+38)%38-18,yy=((i*.237-t*8.5)%14+14)%14,zz=((i*1.773)%22)-8,k=i*6;if(xx>5.3&&xx<10.7&&zz>-2.8&&zz<-.14&&yy<4)yy+=6;positions.set([xx,yy,zz,xx-wind*.03,yy+.20,zz],k)}
 rainGeo.attributes.position.needsUpdate=true;drops.material.opacity=Math.min(.58,(s.rain||160)/380);splash(tracks);renderer.render(scene,camera);ctx.drawImage(renderer.domElement,0,0,1280,720);
 window.lastMotion={tracks,plan};if(s.note){rr(40,455,360,105,12,'#10243de8','#608ba0');wrap(s.note,60,490,320,22,'#e7e6d4',31)}
};
window.inspectWorldMotion=(t,s)=>{let tracks=place(t,s);return tracks.map((state,i)=>{let r=i?friend:hero;return{state,pose:r.pose,forward:new T.Vector3(0,0,1).applyQuaternion(r.g.quaternion).toArray(),boneLengths:r.limbs.map(m=>m.scale.y),shoes:r.shoes.map(m=>m.getWorldPosition(new T.Vector3()).toArray())}})};
window.WORLD3D_READY=true;
})();
