import cv2,numpy as np,json,math
from pathlib import Path
cv2.setNumThreads(2)
from context import ROOT,SOURCE,WORK
SRC=str(SOURCE);out=WORK;cap=cv2.VideoCapture(SRC);rows=[];last=None
for i in range(2850):
 ok,f=cap.read()
 if not ok:break
 hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV);blue=cv2.inRange(hsv,np.array([110,160,35]),np.array([140,255,255]));bright=cv2.inRange(hsv,np.array([110,220,210]),np.array([140,255,255]));n,lab,stats,centers=cv2.connectedComponentsWithStats(bright);choices=[k for k in range(1,n)if stats[k,4]>50]
 row={'t':i/24,'visible':False}
 if choices:
  k=max(choices,key=lambda k:stats[k,4]);body=centers[k];x,y,w,h,area=stats[k];pts=cv2.findNonZero((lab==k).astype('uint8'))
  if len(pts)>=5:
   ell=cv2.fitEllipse(pts);bw,bh=ell[1];ang=ell[2]*math.pi/180
  else:bw,bh,ang=w,h,0
  bR=math.sqrt(area/math.pi);x0=max(0,x-int(bR*6));x1=min(852,x+w+int(bR*6));y0=max(0,y-int(bR*12));y1=min(480,y+h+int(bR*5));crop=blue[y0:y1,x0:x1]
  cs,hh=cv2.findContours(crop,cv2.RETR_TREE,cv2.CHAIN_APPROX_SIMPLE);cand=[]
  if hh is not None:
   for j,c in enumerate(cs):
    if hh[0,j,3]<0 or len(c)<5 or cv2.contourArea(c)<bR*bR*.5:continue
    (hx,hy),(ew,eh),ea=cv2.fitEllipse(c);hx+=x0;hy+=y0;r=(ew+eh)/4
    d=np.linalg.norm(np.array([hx,hy])-body)
    if .7*bR<r<8*bR and bR*.5<d<bR*10 and min(ew,eh)/max(ew,eh)>.45:
     score=cv2.contourArea(c)-max(0,d-bR*6)**2
     if last and i-last['i']<6:score-=np.linalg.norm(np.array([hx,hy])-last['head'])*bR*.5
     cand.append((score,hx,hy,r,ew/2,eh/2,ea))
  if not cand:
   red=cv2.inRange(hsv,np.array([0,170,100]),np.array([8,255,255]))
   rcs,_=cv2.findContours(red,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
   for c in rcs:
    if cv2.contourArea(c)>300 and len(c)>5:
     (hx,hy),(ew,eh),ea=cv2.fitEllipse(c);rr=(ew+eh)/4
     if abs(hx-body[0])<180 and 0<body[1]-hy<160:cand.append((cv2.contourArea(c),hx,hy,rr,ew/2,eh/2,ea))
  if not cand:
   hc=cv2.HoughCircles(cv2.resize(crop,None,fx=.5,fy=.5),cv2.HOUGH_GRADIENT,1,18,param1=60,param2=18,minRadius=10,maxRadius=65)
   if hc is not None:
    for hx,hy,rr in hc[0]*2:
     hx+=x0;hy+=y0;dd=np.linalg.norm(np.array([hx,hy])-body)
     if rr>20 and rr*.7<dd<rr*2.4:cand.append((rr**2,hx,hy,rr,rr,rr,0))
  if cand:
   _,hx,hy,r,rx,ry,rot=max(cand);head=np.array([hx,hy]);vec=body-head;d=np.linalg.norm(vec);axis=vec/max(.1,d)
   # Isolate limb ink beyond the head and filled torso for measured endpoints.
   masked=blue.copy();cv2.ellipse(masked,(round(hx),round(hy)),(round(rx+3),round(ry+3)),rot,0,360,0,-1);cv2.ellipse(masked,ell,0,-1)
   row.update(visible=True,head=[hx,hy],r=r,shape=[rx,ry,rot],body=body.tolist(),bodyEllipse=[bw,bh,ell[2]],axis=axis.tolist(),bounds=[int(x0),int(y0),int(x1),int(y1)])
   last={'i':i,'head':head}
 # Mechanical stylus source geometry, measured as transforms only.
 dark=cv2.inRange(hsv,np.array([0,0,0]),np.array([180,145,105]));cs,_=cv2.findContours(dark,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);pencils=[]
 for c in cs:
  area=cv2.contourArea(c)
  if area<120:continue
  rect=cv2.minAreaRect(c);long,short=max(rect[1]),min(rect[1])
  fill=np.zeros_like(dark);cv2.drawContours(fill,[c],-1,255,-1);solidity=np.count_nonzero((fill>0)&(dark>0))/max(1,np.count_nonzero(fill))
  if long>90 and long>short*3 and short>3 and solidity>.55:
   p=c[:,0,:].astype(float);mean=p.mean(0);_,vecs=np.linalg.eigh(np.cov(p.T));ax=vecs[:,-1];proj=(p-mean)@ax;p0=mean+ax*proj.min();p1=mean+ax*proj.max()
   if np.linalg.norm(p0-[426,240])>np.linalg.norm(p1-[426,240]):p0,p1=p1,p0
   pencils.append((area,{'tip':p0.tolist(),'end':p1.tolist(),'width':float(short)}))
 if pencils:row['stylus']=max(pencils,key=lambda q:q[0])[1]
 rows.append(row)
 if i%500==0:print(i,'tracked',sum(r['visible']for r in rows),flush=True)
(out/'measurements.json').write_text(json.dumps({'fps':24,'duration':118.75,'frames':rows},separators=(',',':'),default=lambda o:float(o)));print('Done',len(rows),sum(r['visible']for r in rows))
