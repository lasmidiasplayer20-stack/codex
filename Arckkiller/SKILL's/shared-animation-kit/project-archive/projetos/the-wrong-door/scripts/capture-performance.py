import cv2,numpy as np,json,math,importlib.util,heapq
from pathlib import Path
cv2.setNumThreads(2)
from context import ROOT,SOURCE,WORK
R=ROOT;src=SOURCE;measure=json.loads((WORK/'measurements.json').read_text())['frames'];cap=cv2.VideoCapture(str(src))
spec=importlib.util.spec_from_file_location('bones',Path(__file__).with_name('capture-rig.py'));bones=importlib.util.module_from_spec(spec);spec.loader.exec_module(bones)
tracks=[];prev=None
for i,m in enumerate(measure):
 ok,f=cap.read()
 if not ok:break
 if not m['visible']:tracks.append(None);continue
 head=np.array(m['head']);body=np.array(m['body']);rad=m['r'];axis=np.array(m['axis']);side=np.array([axis[1],-axis[0]]);hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV);blue=cv2.inRange(hsv,np.array([110,160,35]),np.array([140,255,255]));rx,ry,rot=m['shape']
 # Remove the face and hair before recovering the limb graph.
 limb=blue.copy();cv2.circle(limb,tuple(np.rint(head).astype(int)),round(max(rad*1.30,max(rx,ry)*1.09)),0,-1)
 bw,bh,ba=m['bodyEllipse'];cv2.ellipse(limb,(tuple(body),(bw+10,bh+10),ba),255,-1)
 x0=max(0,int(min(head[0]-rad*2,body[0]-rad*2)));x1=min(852,int(max(head[0]+rad*2,body[0]+rad*2)));y0=max(0,int(min(head[1]-rad,body[1]-rad*2)));y1=min(480,int(max(head[1]+rad,body[1]+rad*2)))
 small=cv2.resize(limb[y0:y1,x0:x1],None,fx=.5,fy=.5,interpolation=cv2.INTER_NEAREST);sk=bones.thin(small);yy,xx=np.where(sk);coords=np.column_stack([xx*2+x0,yy*2+y0]);index={(x,y):k for k,(x,y)in enumerate(zip(xx,yy))};adj=[[]for _ in xx]
 for k,(x,y)in enumerate(zip(xx,yy)):
  for dx,dy in [(1,0),(-1,0),(0,1),(0,-1),(1,1),(-1,1),(1,-1),(-1,-1)]:
   j=index.get((x+dx,y+dy))
   if j is not None:adj[k].append((j,math.hypot(dx,dy)))
 endpoints=[k for k,ad in enumerate(adj)if len(ad)==1];candidates=[]
 for k in endpoints:
  pt=coords[k].astype(float);delta=pt-body;along=delta@axis;across=delta@side
  if np.linalg.norm(delta)<rad*.37 or np.linalg.norm(delta)>rad*2.3:continue
  if np.linalg.norm(pt-head)<rad*.92:continue
  candidates.append({'p':pt,'along':along,'across':across,'k':k})
 unique=[]
 for a in sorted(candidates,key=lambda a:a['along'],reverse=True):
  if all(np.linalg.norm(a['p']-b['p'])>rad*.35 for b in unique):unique.append(a)
 candidates=unique
 # Feet occupy the downstream half-plane; arms can be lateral or raised.
 feet=sorted([a for a in candidates if a['along']>rad*.3],key=lambda a:a['along'],reverse=True)[:2]
 arms=[a for a in candidates if a not in [] and all(a['k']!=b['k']for b in feet)]
 arms=sorted(arms,key=lambda a:abs(a['across']),reverse=True)[:2]
 def ordered(cands,kind):
  raw=sorted(cands,key=lambda a:a['across']);result=[None,None]
  if len(raw)>=2:result=[raw[0]['p'],raw[-1]['p']]
  elif raw:result[int(raw[0]['across']>0)]=raw[0]['p']
  for j in range(2):
   if result[j] is None:
    if prev and i-prev['frame']<3:
     old=np.array(prev[kind][j]);result[j]=head+(old-prev['head'])*(rad/prev['r'])
    else:result[j]=body+axis*rad*(.7 if kind=='feet'else .1)+side*rad*((.4 if kind=='feet'else .72)*(1 if j else -1))
  return[np.round(p,3).tolist()for p in result]
 foot=ordered(feet,'feet');hand=ordered(arms,'hands')
 # Export face lines as normalized vector paths; no video pixels enter the renderer.
 face=blue.copy();inside=np.zeros_like(face);cv2.ellipse(inside,tuple(np.rint(head).astype(int)),(max(2,round(rx*.86)),max(2,round(ry*.86))),rot,0,360,255,-1);face&=inside
 cs,hi=cv2.findContours(face,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_SIMPLE);paths=[]
 if hi is not None:
  for k,c in enumerate(cs):
   if cv2.contourArea(c)<1.8:continue
   q=cv2.approxPolyDP(c,.8,True)[:,0,:].astype(float);q=(q-head)/rad
   paths.append({'points':np.round(q,4).tolist(),'hole':int(hi[0,k,3]>=0)})
 rec={'frame':i,'t':i/24,'head':head.tolist(),'r':rad,'body':body.tolist(),'axis':axis.tolist(),'hands':hand,'feet':foot,'face':paths,'red':33.15<i/24<38.95}
 tracks.append(rec);prev=rec
 if i%500==0:print('captured',i,flush=True)
(R/'reference/measurements.json').write_text(json.dumps({'fps':24,'duration':118.75,'frames':measure},separators=(',',':')))
(R/'reference/capture.json').write_text(json.dumps({'fps':24,'duration':118.75,'frames':tracks},separators=(',',':')))
print('Measured',sum(t is not None for t in tracks),'poses')
