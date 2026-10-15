/* Camera orientation is independent of world gravity. View uses inverse rotation. */
(()=>{function at(s,t){let zoom=1,focus=[960,540],rotation=0;if(t<4.1)focus[0]=1360-400*V.smooth(t/4.1);if(t>=9.4&&t<14.5){const u=t<11.2?V.smooth((t-9.4)/1.8):1-V.smooth((t-12.4)/2.1);zoom=1+u*.6;focus=[V.lerp(960,1040,u),V.lerp(540,670,u)];}return{zoom,focus,rotation};}window.Camera={at};})();
