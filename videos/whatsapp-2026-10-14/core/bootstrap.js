(async()=>{'use strict';
const manifest=await fetch('parts/manifest.json').then(r=>r.json()),id=new URLSearchParams(location.search).get('part')||'01',entry=manifest.parts.find(p=>p.id===id);if(!entry)throw Error('Parte desconhecida');
const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(Error('Não foi possível carregar '+src));document.body.append(s);});
await load('parts/'+entry.folder+'/choreography.js');await load('core/draw.js');for(const asset of PART.extraAssets||[])await load(asset);await load('parts/'+entry.folder+'/director.js');document.querySelector('#audio').src='parts/'+entry.folder+'/soundtrack.m4a';document.querySelector('h1').textContent=PART.title||`Parte ${id} — Abertura e primeira luta`;document.title=`Vídeo 14/10 · Parte ${id}`;await load('core/player.js');
})().catch(e=>{document.querySelector('h1').textContent='Esta parte ainda não está disponível no player.';throw e;});
