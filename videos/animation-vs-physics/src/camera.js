/* World-space camera orientation. View is inverse; rotating the camera never rotates gravity. */
(()=>{const{smooth,lerp,rot,add,sub}=V;function at(s,t){let zoom=1,focus=[960,540],rotation=0;const st=s.stage,local=p=>V.rot(V.sub(p,st.origin),-st.angle),world=p=>add(st.origin,rot(p,st.angle));
 if(t<4.1)focus[0]=1360-400*smooth(t/4.1);
 if(t>=9.4&&t<14.5){const u=t<11.2?smooth((t-9.4)/1.8):1-smooth((t-12.4)/2.1);zoom=1+u*.6;focus=[lerp(960,1040,u),lerp(540,670,u)];}
 if(t>=33&&t<45)focus[0]=960+60*Math.log1p(Math.exp(Math.min(80,(s.char.x-1310)/60)));
 if(t>=48.5&&t<50){const u=smooth((t-48.5)/1.5);focus=[lerp(960,s.char.x,u),lerp(540,s.char.y-190,u)];}
 if(t>=50&&t<55){rotation=-Math.PI/2*smooth((t-51.5)/3);const tracking=sub([s.char.x,s.char.y],rot([0,190],rotation)),target=[6500-270,s.char.y],u=smooth((t-54.2)/.8);focus=tracking.map((x,i)=>lerp(x,target[i],u));}
 if(t>=55){rotation=st.angle;focus=world([960,540]);if(t>=56.4&&t<65){const u=t<57.3?smooth((t-56.4)/.9):1-smooth((t-62.5)/2.5);zoom=1+u*.55;focus=world([lerp(960,1090,u),lerp(540,670,u)]);}}
 return{zoom,focus,rotation};}window.Camera={at};})();
