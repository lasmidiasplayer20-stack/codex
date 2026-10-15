import {open,root} from './browser.mjs';
import {writeFile} from 'node:fs/promises';
const b=await open();
try {
  const r=await b.page.evaluate(()=>({fps:60,simulationHz:120,nativeFrameSamples:7500,duration:125,cuts:Cinematic.cuts,inserts:Cinematic.inserts,depthLayers:WorldV3.depthLayers,sourceVideoPixels:0,events:SIM.events}));
  await writeFile(root+'/exports/camera-cuts-v3.json',JSON.stringify(r,null,2)+'\n');
  console.log(JSON.stringify({fps:r.fps,nativeFrameSamples:r.nativeFrameSamples,depthLayers:r.depthLayers,cuts:r.cuts.length}));
} finally {await b.close();}
