#!/usr/bin/env python3
"""Supervised 2D head tracking for reviewed preview shots. Not a 3D pose solve."""
import sys,json,math
from pathlib import Path
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root/'python-deps'))
import cv2 as cv,numpy as np
cv.setNumThreads(2);out=root/'tracking';rows=json.loads((out/'calibration-first-minute.json').read_text());plan=json.loads((out/'reviewed-first-minute.json').read_text());cap=cv.VideoCapture(sys.argv[1]);frames=[]
for i in range(1800):
 ok,im=cap.read();assert ok;frames.append(cv.cvtColor(im,cv.COLOR_BGR2GRAY))
cap.release()
manual={122:(130,[254,111,38,41],'coat'),563:(563,[203,141,78,80],'hero'),1140:(1140,[241,172,39,40],'driver'),1200:(1208,[300,112,66,72],'hero'),1338:(1345,[178,198,37,37],'patient'),1380:(1385,[161,202,37,37],'patient'),1470:(1470,[170,220,56,52],'patient'),1560:(1560,[317,118,72,78],'coat'),1605:(1605,[227,119,78,80],'patient'),1794:(1796,[266,125,57,62],'hero')}
anchors=[]
for shot in plan['shots']:
 start,end=shot['startFrame'],shot['endFrameExclusive'];seed=None;role='hero'
 if start in manual:seed,box,role=manual[start]
 elif shot['kind'] not in ['city','ceiling','pedal','grade']:
  for r in rows[start:min(end,start+20)]:
   if r.get('hero')and r['hero']['confidence']>.65:seed=r['f'];box=r['hero']['head']['box'];break
 if seed is None:continue
 box=np.array(box,float);x,y,w,h=map(int,box);template=frames[seed][y:y+h,x:x+w].copy()
 def follow(seq):
  b=box.copy();temp=template.copy()
  for f in seq:
   if f==seed:score=1.
   else:
    x,y,w,h=b;pad=max(18,w*.55);x0=max(0,int(x-pad));y0=max(0,int(y-pad));x1=min(640,int(x+w+pad));y1=min(360,int(y+h+pad));area=frames[f][y0:y1,x0:x1];best=(-2,None)
    for sc in [.965,.985,1,1.015,1.035]:
     ww=max(8,round(w*sc));hh=max(8,round(h*sc))
     if ww>=area.shape[1]or hh>=area.shape[0]:continue
     t=cv.resize(temp,(ww,hh));res=cv.matchTemplate(area,t,cv.TM_CCOEFF_NORMED);_,q,_,loc=cv.minMaxLoc(res);q-=abs(math.log(sc))*.15
     if q>best[0]:best=(q,(x0+loc[0],y0+loc[1],ww,hh))
    score,found=best
    if found is not None and score>.42:b=np.array(found,float)
   x,y,w,h=b;rows[f]['subject']={'role':role,'box':[round(q,2)for q in b],'center':[round(x+w/2,2),round(y+h/2,2)],'confidence':round(max(0,score),3),'method':'supervised-local-template','anatomicalLabelsVerified':False}
   if f!=seed and score>.8 and f%12==0:
    patch=frames[f][int(y):int(y+h),int(x):int(x+w)]
    if patch.size:temp=cv.addWeighted(temp,.86,cv.resize(patch,(temp.shape[1],temp.shape[0])),.14,0)
 follow(range(seed,end));follow(range(seed-1,start-1,-1));anchors.append(dict(take=shot['id'],seedFrame=seed,box=box.tolist(),role=role))
(out/'calibration-first-minute.json').write_text(json.dumps(rows,separators=(',',':'))+'\n');(out/'subject-seeds.json').write_text(json.dumps({'supervision':'Approximate manually reviewed head boxes, locally tracked in 2D. These do not verify limb anatomy.','anchors':anchors},indent=2)+'\n');print(json.dumps({'trackedShots':len(anchors),'subjectFrames':sum('subject'in r for r in rows)}))
