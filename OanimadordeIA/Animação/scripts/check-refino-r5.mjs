import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {once} from 'node:events';
const root=resolve(import.meta.dirname,'..');
const server=createServer(async(req,res)=>{try{
 const path=resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':new URL(req.url,'http://localhost').pathname));
 if(!path.startsWith(root+'/'))throw Error('path');
 res.setHeader('Content-Type',({'.js':'text/javascript','.json':'application/json','.html':'text/html'})[extname(path)]||'application/octet-stream');
 res.end(await readFile(path));
}catch{res.writeHead(404);res.end();}});
server.listen(0,'127.0.0.1');await once(server,'listening');
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=await browser.newPage();
try{
 await page.goto(`http://127.0.0.1:${server.address().port}/?part=05`);
 await page.waitForFunction(()=>typeof window.film?.sourceFrame==='function');
 const checks=await page.evaluate(()=>{
  const dist=(a,b)=>Math.hypot(...Rig.sub(a,b)),start=film.sourceFrame(90.5),r=start.pair.red;
  let supportDrift=0,shoulderDrift=0,pelvisDrift=0,gripDrift=0,maxKneeBend=0;
  const lateral=[];
  for(let i=0;i<=65;i++){
   const f=film.sourceFrame(90.5+i/60),p=f.pair.red;
   lateral.push(p.head[0]-p.shoulder[0]);
   supportDrift=Math.max(supportDrift,dist(p.nodes[8],r.nodes[8]),dist(p.nodes[10],r.nodes[10]));
   shoulderDrift=Math.max(shoulderDrift,dist(p.shoulder,r.shoulder));
   pelvisDrift=Math.max(pelvisDrift,dist(p.root,r.root));
   gripDrift=Math.max(gripDrift,dist(f.weapon.grip,start.weapon.grip));
   for(const [k,foot] of [[7,8],[9,10]]){
    const a=Rig.sub(p.nodes[k],p.root),b=Rig.sub(p.nodes[foot],p.nodes[k]);
    maxKneeBend=Math.max(maxKneeBend,Math.acos(Rig.clamp((a[0]*b[0]+a[1]*b[1])/(Math.hypot(...a)*Math.hypot(...b)),-1,1))*180/Math.PI);
   }
  }
  let sign=0,alternations=0;for(const x of lateral){const next=x>3?1:x< -3?-1:0;if(next&&next!==sign){if(sign)alternations++;sign=next;}}
  const arrival=film.sourceFrame(83.25).pair,raised=film.sourceFrame(84).pair.cyan,rest=film.sourceFrame(93.1).pair.red;
  const checks={leftExcursion:Math.min(...lateral),rightExcursion:Math.max(...lateral),alternations,supportDrift,shoulderDrift,pelvisDrift,gripDrift,maxKneeBend,
   cyanApproaches:dist(arrival.red.head,arrival.cyan.head)<85,
   cyanHandsAtHead:[4,6].every(i=>dist(raised.nodes[i],raised.head)<25),
   weaponHeldBeforeRelease:!!film.sourceFrame(92.6).weapon,
   weaponReleasedAfterGesture:film.sourceFrame(92.65).weapon===null,
   armsLowered:[4,6].every(i=>rest.nodes[i][1]>rest.shoulder[1]+55),
   originalHeadDamagePreserved:film.sourceFrame(91).pair.orange.headDent.amount===.4,
   endCardStart:PART.cardStart};
  return checks;
 });
 const c=checks,passed=c.leftExcursion< -6&&c.rightExcursion>6&&c.alternations>=3&&c.supportDrift<1e-6&&c.shoulderDrift<1e-6&&c.pelvisDrift<1e-6&&c.gripDrift<1e-6&&c.cyanApproaches&&c.cyanHandsAtHead&&c.weaponHeldBeforeRelease&&c.weaponReleasedAfterGesture&&c.armsLowered&&c.originalHeadDamagePreserved;
 const report={passed,checks,scope:'Manually reviewed ending: approach, hands behind head, repeated refusal, weapon release and lowered arms. Geometry and gesture checks do not establish pixel equivalence.'};
 await mkdir(resolve(root,'.qa'),{recursive:true});await writeFile(resolve(root,'.qa/refino-r5.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report));if(!passed)process.exitCode=1;
}finally{await browser.close();await new Promise(r=>server.close(r));}
