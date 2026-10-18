import * as THREE from 'three';
import {Character,toonMaterial} from './rig.js';

const renderer=new THREE.WebGLRenderer({canvas:document.querySelector('canvas'),antialias:!new URLSearchParams(location.search).has('export')});
renderer.setSize(1920,1080,false);
const scene=new THREE.Scene();scene.background=new THREE.Color(0xb5c9dd);
const camera=new THREE.PerspectiveCamera(36,1920/1080,.1,100);
camera.position.set(4,3.2,7);camera.lookAt(0,1.2,0);
const floor=new THREE.Mesh(new THREE.BoxGeometry(12,.1,8),toonMaterial(0x7a9d9c));
floor.position.y=-.05;scene.add(floor);
const actor=new Character(scene,{color:0x428cbb,role:'student'});
window.setRenderSize=(width,height)=>{
  if(renderer.domElement.width!==width||renderer.domElement.height!==height){renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
};
window.renderAt=t=>{
  // Root translation matches the rig's .65 world-unit/second stance speed.
  actor.pose({time:t,action:'walk',rootX:-2+.65*t,walkSpeed:.65,facing:.1});
  renderer.render(scene,camera);
};
window.renderAt(0);
window.capture=()=>renderer.domElement.toDataURL('image/png');
window.ready=true;
let playing=true;const origin=performance.now();
window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();playing=!playing;}});
function animate(now){requestAnimationFrame(animate);if(playing)window.renderAt(((now-origin)/1000)%6);}
if(!new URLSearchParams(location.search).has('export'))requestAnimationFrame(animate);
