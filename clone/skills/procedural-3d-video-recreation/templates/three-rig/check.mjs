import assert from 'node:assert/strict';
import * as THREE from 'three';
import {Character,solveIK,V} from './src/rig.js';
let seed=127;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<2000;i++){
  const root=V(random(),random(),random()),target=V(random()*4-2,random()*4-2,random()*4-2);
  const result=solveIK(root,target,.39,.39,V(0,0,1));
  assert(Math.abs(root.distanceTo(result.joint)-.39)<1e-8);
  assert(Math.abs(result.joint.distanceTo(result.end)-.39)<1e-8);
  assert(result.end.toArray().every(Number.isFinite));
}
const scene=new THREE.Scene(),actor=new Character(scene);
let poses=0;
for(const action of ['stand','walk','write','sleep','wake','pickup','place','talk','think','surprise']){
  for(let i=0;i<=120;i++){
    actor.pose({time:i/30,action,phase:i/120});
    assert(Math.abs(actor.chest.distanceTo(actor.pelvis)-.78)<1e-8);
    for(const limb of [...actor.arms,...actor.legs]){
      const length=actor.arms.includes(limb)?.39:.56;
      assert(Math.abs(limb.root.distanceTo(limb.joint)-length)<1e-8);
      assert(Math.abs(limb.joint.distanceTo(limb.target)-length)<1e-8);
    }
    if(action==='write')assert(Math.abs(actor.pelvis.y-.13-.65-.01)<1e-8);
    poses++;
  }
}
// World-space stance must agree with the root's real translational speed.
const feet=[];
for(const time of [.05,.1,.2,.3]){
  actor.pose({time,action:'walk',rootX:time*.65,walkSpeed:.65,facing:.1});
  actor.group.updateWorldMatrix(true,true);
  feet.push(actor.group.localToWorld(actor.legs[0].target.clone()));
}
assert(Math.max(...feet.map(p=>p.distanceTo(feet[0])))<1e-8);
console.log(JSON.stringify({passed:true,ik_cases:2000,poses,stance_samples:feet.length,
  limits:'No scene-level collision or visual-fidelity claim.'},null,2));
