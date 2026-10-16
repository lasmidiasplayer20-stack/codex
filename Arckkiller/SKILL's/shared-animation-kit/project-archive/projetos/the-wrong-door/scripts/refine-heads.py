from pathlib import Path
import cv2,numpy as np,json,math
from context import ROOT,SOURCE,WORK
P=WORK/'measurements.json';d=json.loads(P.read_text());cap=cv2.VideoCapture(str(SOURCE));rng=np.random.default_rng(886);count=0;cv2.setNumThreads(2)
for i,row in enumerate(d['frames']):
 ok,f=cap.read()
 if not ok:break
 if not row['visible']:continue
 t=i/24;hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV);m=cv2.inRange(hsv,np.array([110,160,35]),np.array([140,255,255]));body=np.array(row['body']);cs,_=cv2.findContours(m,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_NONE);points=np.concatenate([c[:,0,:]for c in cs if len(c)>20]).astype(float);points=points[np.linalg.norm(points-body,axis=1)<230]
 if len(points)>750:points=points[::2]
 target=65 if t<99 else 52;old=np.array(row['head']);best=None
 for k in range(85):
  if len(points)<3:break
  a,b,c=points[rng.choice(len(points),3,replace=False)];mat=2*np.array([b-a,c-a]);det=np.linalg.det(mat)
  if abs(det)<20:continue
  center=np.linalg.solve(mat,np.array([b@b-a@a,c@c-a@a]));r=np.linalg.norm(center-a);dist=np.linalg.norm(center-body)
  if not target*.65<r<target*1.5 or not target*.55<dist<target*2.3:continue
  if 27.65<t<29.32 and not(center[1]>body[1]+target*1.10 and abs(center[0]-body[0])<target*1.1):continue
  if 29.32<=t<30.58 and not(center[0]<body[0]-target*1.05 and abs(center[1]-body[1])<target*1.1):continue
  # Body lies below the head except for the actual tumble interval.
  if not 26.4<t<31.15 and center[1]>body[1]-target*.45:continue
  residual=abs(np.linalg.norm(points-center,axis=1)-r);ins=residual<3.0;score=ins.sum()-abs(r-target)*.35
  if best is None or score>best[0]:best=(score,center,r,ins)
 if best:
  _,center,r,ins=best
  for _ in range(2):
   q=points[ins]
   if len(q)<10:break
   cx,cy,c0=np.linalg.lstsq(np.column_stack([2*q[:,0],2*q[:,1],np.ones(len(q))]),(q*q).sum(1),rcond=None)[0];center=np.array([cx,cy]);r=math.sqrt(max(1,c0+cx*cx+cy*cy));ins=abs(np.linalg.norm(points-center,axis=1)-r)<3
  if not 33.15<t<38.95:
   row['head']=center.tolist();row['r']=float(r);row['shape']=[float(r),float(r),0];row['axis']=((body-center)/np.linalg.norm(body-center)).tolist();count+=1
 if i%700==0:print('refined',i,flush=True)
# Repair a one-frame bad circle only when its neighboring centers agree.
old=[p.copy()for p in d['frames']]
for i in range(1,len(old)-1):
 a,b,c=old[i-1:i+2]
 if not all(q['visible']for q in [a,b,c]):continue
 pa,pb,pc=[np.array(q['head'])for q in[a,b,c]]
 if np.linalg.norm(pc-pa)<18 and np.linalg.norm(pb-(pa+pc)/2)>18:
  h=(pa+pc)/2;d['frames'][i]['head']=h.tolist();v=np.array(b['body'])-h;d['frames'][i]['axis']=(v/np.linalg.norm(v)).tolist()
P.write_text(json.dumps(d,separators=(',',':')));print('Head boundaries refined',count)
