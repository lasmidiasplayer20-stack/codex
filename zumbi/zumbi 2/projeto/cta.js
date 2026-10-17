'use strict';
(function(root){function drawCTA(c,t,duration){
 const slots=duration<=60?[{at:duration*.47,label:'LIKE  •  SHARE'},{at:duration-9,label:'COMMENT: WOULD YOU TRUST THE SIGNAL?'}]:[{at:45,label:'LIKE  •  SHARE'},{at:duration*.5,label:'COMMENT: WOULD YOU TRUST THE SIGNAL?'},{at:duration-35,label:'LIKE  •  SHARE  •  COMMENT'}];
 for(const {at,label} of slots){
  const age=t-at,hold=5;
  if(age<0||age>hold)continue;
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
  const fade=Math.min(smooth(age/.45),smooth((hold-age)/.45));
  c.save();c.globalAlpha=fade;c.translate(0,10*(1-fade));
  c.font='400 13px Film,Arial';const w=c.measureText(label).width+35,x=1280-w-32,y=568;
  c.fillStyle='#101f2bea';c.beginPath();c.roundRect(x,y,w,32,7);c.fill();
  c.fillStyle='#d78263';c.fillRect(x,y+7,3,18);
  c.fillStyle='#f0e7d4';c.textAlign='left';c.fillText(label,x+17,y+21);c.restore();
 }
};if(typeof module!=='undefined')module.exports=drawCTA;else root.drawCTA=drawCTA;})(globalThis);
