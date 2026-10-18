#!/usr/bin/env python3
import sys,json,gzip,time
from pathlib import Path
root=Path(__file__).resolve().parents[1];sys.path.insert(0,str(root/'python-deps'))
import cv2 as cv,numpy as np
from scipy.signal import find_peaks
cv.setNumThreads(2);out=Path(sys.argv[2]);plan=json.loads((out/'takes.json').read_text());cam=[]
for take in plan['takes']:
 with gzip.open(out/take['data'],'rt')as f:cam.extend(row['camera']for row in json.load(f))
cap=cv.VideoCapture(sys.argv[1]);scores=[];raw=[];prev=None;started=time.time();i=0
while True:
 ok,im=cap.read()
 if not ok:break
 tiny=cv.resize(im,(192,108),interpolation=cv.INTER_AREA).astype('float32')
 if prev is None:scores.append(0);raw.append(0)
 else:
  M=np.array(cam[i]or[1,0,0,0,1,0],dtype='float32').reshape(2,3);M[:,2]*=.3
  aligned=cv.warpAffine(prev,M,(192,108),flags=cv.INTER_LINEAR,borderMode=cv.BORDER_REPLICATE)
  valid=cv.warpAffine(np.ones((108,192),'uint8'),M,(192,108))>0
  scores.append(float(np.abs(aligned-tiny)[valid].mean()));raw.append(float(np.abs(prev-tiny).mean()))
 prev=tiny;i+=1
cap.release();assert i==plan['videoFrames'];arr=np.array(scores);peaks,props=find_peaks(arr,height=9,prominence=5,distance=6)
candidates=[{'frame':int(f),'time':round(float(f)/30,6),'motionCompensatedDifference':round(float(arr[f]),3),'rawDifference':round(raw[f],3),'confirmed':False}for f in peaks]
report={'frames':i,'allFramesProcessed':True,'candidates':candidates,'source':'Motion-compensated photometric residuals over all frames. Requires visual editorial verification.','seconds':round(time.time()-started,2)}
(out/'cut-review.json').write_text(json.dumps(report,indent=2)+'\n')
with gzip.open(out/'photometric.json.gz','wt')as f:json.dump({'fps':30,'alignedDifference':scores,'rawDifference':raw},f,separators=(',',':'))
print(json.dumps({'frames':i,'candidates':len(candidates),'firstMinute':[p for p in candidates if p['time']<60],'seconds':report['seconds']}),flush=True)
