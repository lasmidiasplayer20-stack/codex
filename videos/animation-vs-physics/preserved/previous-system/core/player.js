(()=>{'use strict';
const P=PART,A=Art;
const draw=t=>Director.draw(P.start+t),frame=t=>Director.frame(P.start+t),actors=t=>Director.actors(P.start+t),weapon=t=>Director.weapon(P.start+t);
const play=document.querySelector('#play'),seek=document.querySelector('#seek'),label=document.querySelector('#time'),audio=document.querySelector('#audio');let playing=false,current=0,base=0,raf;
const fmt=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
function ui(){seek.value=current;label.textContent=`${fmt(current)} / ${fmt(P.duration)}`;}
function tick(now){if(!playing)return;current=Math.min(P.duration,(now-base)/1000);draw(current);ui();if(current===P.duration){playing=false;play.textContent='Reproduzir';audio.pause();return;}raf=requestAnimationFrame(tick);}
play.addEventListener('click',async()=>{if(playing){playing=false;cancelAnimationFrame(raf);audio.pause();play.textContent='Reproduzir';}else{if(current>=P.duration)current=0;audio.currentTime=current;try{await audio.play();}catch{}playing=true;base=performance.now()-current*1000;play.textContent='Pausar';raf=requestAnimationFrame(tick);}});
seek.max=P.duration;seek.addEventListener('input',()=>{current=+seek.value;audio.currentTime=current;base=performance.now()-current*1000;draw(current);ui();});
window.film={draw,frame,actors,weapon,sourceFrame:Director.frame,sourceStart:P.start,canvas:A.canvas,duration:P.duration,metrics:{finite:true,sourceVideoPixelsUsed:0,method:'Authored 2D rigs, fixed proportions, explicit contacts and independent camera'},stages:P.beats};draw(0);ui();
})();
