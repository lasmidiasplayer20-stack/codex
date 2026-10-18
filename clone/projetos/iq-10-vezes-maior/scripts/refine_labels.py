#!/usr/bin/env python3
import sys,json,gzip,hashlib,time
from pathlib import Path
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root/'python-deps'))
import cv2 as cv,numpy as np
from tracking_core import hero_in
cv.setNumThreads(2);source=Path(sys.argv[1]);out=Path(sys.argv[2]);plan=json.loads((out/'takes.json').read_text());cap=cv.VideoCapture(str(source));first=[];count=0;observed=0;started=time.time()
for take in plan['takes']:
 p=out/take['data']
 with gzip.open(p,'rt')as f:rows=json.load(f)
 for row in rows:
  ok,im=cap.read()
  if not ok:raise RuntimeError('Unexpected source end')
  dark=((im.max(axis=2)<85)&((im.max(axis=2).astype(int)-im.min(axis=2))<20)).astype('uint8')*255
  row['hero']=hero_in(im,row['heads'],dark);observed+=row['hero']is not None
  if row['t']<3.7:
   gray=cv.cvtColor(im,cv.COLOR_BGR2GRAY);mask=np.zeros_like(gray);cv.ellipse(mask,(320,145),(200,140),0,0,360,255,-1)
   if row['hero']:
    x,y,w,h=row['hero']['head']['box'];cv.rectangle(mask,(x-8,y-8),(x+w+8,y+h+8),0,-1)
   pts=cv.goodFeaturesToTrack(gray,140,.03,7,mask=mask)
   row['neuralLights']=[[round(float(x),2),round(float(y),2),round(float(gray[min(359,int(y)),min(639,int(x))])/255,3)]for x,y in (pts.reshape(-1,2)if pts is not None else[])if gray[min(359,int(y)),min(639,int(x))]>145]
  if row['t']<60:first.append({k:v for k,v in row.items()if k not in ['features','flowGridQ8']})
  count+=1
 tmp=p.with_suffix('.tmp')
 with gzip.open(tmp,'wt',encoding='utf-8',compresslevel=6)as f:json.dump(rows,f,separators=(',',':'))
 tmp.replace(p)
 take['heroDetectedFrames']=sum(row['hero']is not None for row in rows)
 if take['id']%20==0:print(json.dumps({'refinedTakes':take['id'],'frames':count,'seconds':round(time.time()-started,1)}),flush=True)
cap.release();assert count==plan['videoFrames'];(out/'first-minute.json').write_text(json.dumps(first,separators=(',',':'))+'\n');(out/'takes.json').write_text(json.dumps(plan,indent=2)+'\n')
report=json.loads((out/'report.json').read_text());report['heroObservedFramesBeforeRefinement']=report['heroObservedFrames'];report['heroObservedFrames']=observed;report['semanticRefinement']={'allFramesProcessed':True,'frames':count,'method':'Narrow yellow garment hue, sleeve-adjacent wrist candidates, filtered boot shapes. Observations remain unverified anatomical labels.','seconds':round(time.time()-started,2)};(out/'report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'passed':True,'frames':count,'heroObservedFrames':observed,'seconds':round(time.time()-started,2)}),flush=True)
