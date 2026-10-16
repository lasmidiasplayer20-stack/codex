/* World-space camera orientation. View is inverse; rotating the camera never rotates gravity. */
(()=>{const{smooth,lerp,rot,add,sub}=V;function at(s,t){let zoom=1,focus=[960,540],rotation=0;const st=s.stage,local=p=>V.rot(V.sub(p,st.origin),-st.angle),world=p=>add(st.origin,rot(p,st.angle));
 if(t<4.1)focus[0]=1360-400*smooth(t/4.1);
 if(t>=9.4&&t<14.5){const u=t<11.2?smooth((t-9.4)/1.8):1-smooth((t-12.4)/2.1);zoom=1+u*.6;focus=[lerp(960,1040,u),lerp(540,670,u)];}
 if(t>=32.35&&t<45)focus[0]=960+smooth((t-32.35)/.75)*60*Math.log1p(Math.exp(Math.min(80,(s.char.x-1310)/60)));
 if(t>=48.5&&t<50){const u=smooth((t-48.5)/1.5);focus=[lerp(960,s.char.x,u),lerp(540,s.char.y-190,u)];}
 if(t>=50&&t<55){rotation=-Math.PI/2*smooth((t-51.5)/3);const tracking=sub([s.char.x,s.char.y],rot([0,190],rotation)),target=[6500-270,s.char.y],u=smooth((t-54.2)/.8);focus=tracking.map((x,i)=>lerp(x,target[i],u));}
 if(t>=55){rotation=st.angle;focus=world([960,540]);if(t>=56.4&&t<65){const u=t<57.3?smooth((t-56.4)/.9):1-smooth((t-62.5)/2.5);zoom=1+u*.55;focus=world([lerp(960,1090,u),lerp(540,670,u)]);}}
 if(t>=75&&t<85){const u=smooth((t-79.5)/5.5);focus=world([lerp(960,470,u),540]);zoom=1;}
 if(t>=85&&t<90){const q=local([s.char.x,s.char.y]),u=smooth((t-85)/1.5);focus=world([lerp(470,q[0]+230,u),lerp(540,570,u)]);zoom=1;}
 if(t>=90&&t<95){const q=local([s.char.x,s.char.y]);focus=world([q[0]+230,570]);}
 if(t>=95&&t<105){const q=local([s.char.x,s.char.y]),u=smooth((t-95)/3);focus=world([q[0]+lerp(230,100,u),lerp(570,q[1]-35,u)]);zoom=1+u*.8;}
 if(t>=105&&t<108.55){const q=local([s.char.x,s.char.y]),u=smooth((t-105)/2.5);focus=world([lerp(q[0]+100,960,u),lerp(q[1]-35,570,u)]);zoom=1.8-.8*u;}
 if(t>=108.55&&t<115){focus=world([960,570]);zoom=1;}
 if(t>=115){rotation=0;focus=[960,540];zoom=1;}
 return{zoom,focus,rotation};}window.Camera={at};})();
