/* Native-time direction. Source imagery is never part of the rendered scene. */
(()=>{'use strict';
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,u)=>a+(b-a)*u,ease=x=>{x=clamp(x);return x*x*(3-2*x)},pulse=(t,a,b,r=.2)=>ease((t-a)/r)*(1-ease((t-b)/r));
function curve(keys,t){let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1];if(t<=a[0])return a[1];if(t>=b[0])return b[1];const h=b[0]-a[0],u=(t-a[0])/h,d=(b[1]-a[1])/h,slope=(p,q)=>(q[1]-p[1])/(q[0]-p[0]);let m0=i?(slope(keys[i-1],a)+d)/2:d,m1=i+2<keys.length?(d+slope(b,keys[i+2]))/2:d;const limit=m=>m*d<=0?0:Math.sign(d)*Math.min(Math.abs(m),3*Math.abs(d));m0=limit(m0);m1=limit(m1);return (2*u**3-3*u*u+1)*a[1]+(u**3-2*u*u+u)*h*m0+(-2*u**3+3*u*u)*b[1]+(u**3-u*u)*h*m1;}
const routes={
 cyan:[[.25,-160],[1,80],[4.8,650],[5.5,690],[11.65,690],[12.2,728],[12.55,800],[13.9,1530],[26.4,1460],[27.75,735],[29.2,735],[30.5,735],[31.1,735],[38.7,735],[39.35,765],[39.7,735],[40.2,675],[40.35,670],[40.5,610],[41.17,330],[53.79,430],[54.8,915],[55.5,940],[58.5,940],[59.2,950],[62.8,950],[63.7,850],[66.17,-180],[66.18,2100],[68,1020],[72,780],[84.4,-4320],[87.3,-4320],[88.88,-3160],[101,1030],[118.75,1030]],
 violet:[[19.25,-180],[20.1,330],[21.4,1130],[22.3,1510]],
 gold0:[[51.10,365],[51.4,510],[52.5,1390],[53.5,2160]],
 gold1:[[51.32,365],[51.8,570],[52.8,1370],[53.8,2150]],
 gold2:[[51.55,365],[52.1,610],[53.1,1380],[54.1,2150]],
 amber:[[68.5,1900],[70,1220],[71,940],[73.2,-330]]};
const windows={cyan:[[.25,13.92],[26.4,41.17],[53.79,66.17],[66.18,88.88],[101,118.75]],violet:[[19.25,22.3]],gold0:[[51.1,53.5]],gold1:[[51.32,53.8]],gold2:[[51.55,54.1]],amber:[[68.5,73.2]]};
function xAt(n,t){return curve(routes[n],t)}
function camera(t){return t>=72&&t<89?Math.min(0,xAt('cyan',Math.max(72,Math.min(t-.10,84.4)))-780):0}
function floor(t){return t>=98.4?760:940}
function actorFloor(n,t){return n==='amber'?884:floor(t)}
function active(n,t){return windows[n].some(([a,b])=>t>=a-1e-7&&t<=b+1e-7)}
window.Story={clamp,mix,ease,pulse,curve,xAt,camera,floor,actorFloor,active,routes,windows};
window.FILM_DATA={width:1920,height:1080,duration:118.75,fps:60,cast:{cyan:{rgb:'#079fba'},violet:{rgb:'#9c59be'},gold0:{rgb:'#d89a27'},gold1:{rgb:'#e4af38'},gold2:{rgb:'#bd8522'},amber:{rgb:'#e28342'}},tracks:{}};
})();
