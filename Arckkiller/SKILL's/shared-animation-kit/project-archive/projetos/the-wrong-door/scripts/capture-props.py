from pathlib import Path
import cv2,numpy as np,json,math
from context import ROOT,SOURCE,WORK
R=ROOT;cap=cv2.VideoCapture(str(SOURCE));rows=[];cv2.setNumThreads(2)
for i in range(2850):
 ok,f=cap.read()
 if not ok:break
 t=i/24;hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV);dark=cv2.inRange(hsv,np.array([0,0,0]),np.array([180,125,130]));cs,_=cv2.findContours(dark,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE);doors=[]
 for c in cs:
  x,y,w,h=cv2.boundingRect(c)
  if 7.6<t<98.8 and h>150 and 48<w<340 and h>w*1.25 and y>40 and x>8:
   rect=cv2.minAreaRect(c);a,b=rect[1]
   if max(a,b)>max(1,min(a,b))*4:continue
   doors.append([int(x),int(y),int(w),int(h)])
 row={'t':t}
 if doors:row['door']=max(doors,key=lambda p:p[2]*p[3])
 # Fountain/river envelope, used for a freshly drawn procedural water feature.
 water=cv2.inRange(hsv,np.array([73,90,130]),np.array([98,255,255]));n,l,st,ce=cv2.connectedComponentsWithStats(water);waterparts=[k for k in range(1,n)if st[k,4]>400]
 if waterparts and 72<t<85:
  xx=min(st[k,0]for k in waterparts);yy=min(st[k,1]for k in waterparts);right=max(st[k,0]+st[k,2]for k in waterparts);bottom=max(st[k,1]+st[k,3]for k in waterparts);row['water']=[int(xx),int(yy),int(right-xx),int(bottom-yy)]
 extras=[]
 ranges=[]
 if 18.8<t<23:ranges.append(('violet',[140,130,60],[170,255,255]))
 if 68.5<t<73:ranges.append(('amber',[3,160,80],[24,255,255]))
 if 50.8<t<54.5:ranges.append(('gold',[23,145,120],[38,255,255]))
 for name,lo,hi in ranges:
  m=cv2.inRange(hsv,np.array(lo),np.array(hi));cs,h=cv2.findContours(m,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE);heads=[]
  if h is not None:
   for k,c in enumerate(cs):
    if h[0,k,3]<0 or len(c)<5 or cv2.contourArea(c)<150:continue
    (x,y),(w,hh),a=cv2.fitEllipse(c);r=(w+hh)/4
    if 9<r<110 and min(w,hh)/max(w,hh)>.17:heads.append([x,y,r])
  heads=sorted(heads,key=lambda p:p[2],reverse=True);unique=[]
  for p in heads:
   if all(math.hypot(p[0]-q[0],p[1]-q[1])>max(p[2],q[2])for q in unique):unique.append(p)
  for j,p in enumerate(unique[:4 if name=='gold'else 1]):extras.append({'name':name+str(j),'head':p[:2],'r':p[2]})
 if extras:row['extras']=extras
 rows.append(row)
 if i%800==0:print('props',i,flush=True)
(R/'reference/props.json').write_text(json.dumps(rows,separators=(',',':')))
print('props measured',len(rows))
