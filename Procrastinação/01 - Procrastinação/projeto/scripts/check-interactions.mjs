import {createRequire} from 'node:module';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas'),{makeFilm}=require('../src/film.js'),plan=require('../timeline.json');
const root=resolve(import.meta.dirname,'..'),canvas=createCanvas(480,270),film=makeFilm(canvas.getContext('2d'),plan),reports=[];
for(const s of plan.scenes){
 const hands=[];let present=true;
 for(let t=s.start+.15;t<s.end-.05;t+=1/12){film.frame(t);const actors=film.lastActors();present&&=actors.length>=1;if(actors[0])hands.push(actors[0].hands);}
 const ranges=[0,1].map(i=>{const xs=hands.map(h=>h[i][0]),ys=hands.map(h=>h[i][1]);return Math.hypot(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));});
 reports.push({scene:s.id,kind:s.kind,characterPresent:present,handTravelRanges:ranges});
}
const at=(kind,t)=>{const s=plan.scenes.find(s=>s.kind===kind);film.frame(s.start+t);return film.lastActors()[0];};
const contacts={};
contacts.titleButton=Math.hypot(at('title',1.6).hands[0][0]-700,at('title',1.6).hands[0][1]-(292+Math.sin(8)*1.5))<.01;
contacts.choiceButton=(()=>{const h=at('choice',1.7).hands[1];return h[0]>=520&&h[0]<=790&&h[1]>=203&&h[1]<=308;})();
contacts.taskCheckboxes=[.5,1.45,2.4].every(t=>{const h=at('task',t).hands[1];return h[0]>=497&&h[0]<=517&&h[1]>=281&&h[1]<=301;});
contacts.timerButton=(()=>{const t=1.5,h=at('timer',t).hands[1],y=272+Math.sin(t*5)*1.5;return h[0]>=490&&h[0]<=580&&h[1]>=y&&h[1]<=y+35;})();
contacts.phoneTaps=Array.from({length:20},(_,i)=>.2+i*.18).every(t=>{const p=at('phone',t),support=p.hands[0],tap=p.hands[1];return tap[0]>=support[0]-5&&tap[0]<=support[0]+25&&tap[1]>=support[1]-34&&tap[1]<=support[1]+18;});
contacts.monitor=(()=>{const h=at('desk',4).hands[1];return Math.abs(h[0]-559)<1e-6&&h[1]>=257&&h[1]<=332;})();
contacts.bothHandsOnBox=Array.from({length:30},(_,i)=>.1+i*.1).every(t=>{const p=at('push',t);return Math.abs(p.hands[0][0]-p.hands[1][0])<1e-6;});
contacts.progressEnd=(()=>{const h=at('progress',3.5).hands[0];return Math.hypot(h[0]-720,h[1]-324)<1e-6;})();
const passed=reports.every(r=>r.characterPresent&&Math.max(...r.handTravelRanges)>3)&&Object.values(contacts).every(Boolean)&&film.stats.finite&&film.stats.maxReachExcess<.01;
const report={passed,scenes:reports,contacts,stats:film.stats,scope:'Every scene contains an acting character, with changing hand poses and authored object contacts. Separate visual review still required.'};
writeFileSync(resolve(root,`qa/interactions-${plan.revision}.json`),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(!passed)process.exitCode=1;
