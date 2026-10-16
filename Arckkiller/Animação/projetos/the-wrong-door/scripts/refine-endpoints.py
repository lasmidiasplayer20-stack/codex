from pathlib import Path
import json,numpy as np
from context import ROOT
P=ROOT/'reference/capture.json';d=json.loads(P.read_text());frames=d['frames'];repairs=0
# Centered source-time filtering removes fit noise without a playback delay.
raw=[p.copy()if p else None for p in frames]
for i in range(1,len(frames)-1):
 if not all(raw[k]for k in[i-1,i,i+1]):continue
 p=frames[i];h=np.array(raw[i]['head']);a=np.array(raw[i-1]['head']);z=np.array(raw[i+1]['head']);p['head']=(h*.70+(a+z)*.15).tolist();v=np.array(p['body'])-p['head'];p['axis']=(v/np.linalg.norm(v)).tolist()
# Identity is assigned in the body frame, then isolated endpoint glitches are repaired.
segments=[]
for i,p in enumerate(frames):
 if p is None:continue
 if not segments or i-segments[-1][-1]>2:segments.append([])
 segments[-1].append(i)
for ids in segments:
 for key in ['hands','feet']:
  values=[]
  for i in ids:
   p=frames[i];axis=np.array(p['axis']);side=np.array([axis[1],-axis[0]]);basis=np.array([side,axis]);q=(np.array(p[key])-p['body'])/p['r'];values.append(q@basis.T)
  values=np.array(values);cost=np.zeros((len(ids),2));back=np.zeros((len(ids),2),int)
  for k in range(1,len(ids)):
   for state in range(2):
    cur=values[k,::1 if state==0 else -1];options=[]
    for prev in range(2):
     old=values[k-1,::1 if prev==0 else -1];options.append(cost[k-1,prev]+np.minimum((cur-old)**2,4).sum()+(.08 if state!=prev else 0))
    back[k,state]=np.argmin(options);cost[k,state]=min(options)
  state=int(np.argmin(cost[-1]));order=[]
  for k in range(len(ids)-1,-1,-1):order.append(state);state=back[k,state]
  order=order[::-1]
  for k,i in enumerate(ids):
   if order[k]:frames[i][key]=frames[i][key][::-1];values[k]=values[k][::-1]
  clean=values.copy()
  for k in range(1,len(ids)-1):
   for j in range(2):
    med=np.median(values[max(0,k-2):min(len(ids),k+3),j],axis=0);res=np.linalg.norm(values[k,j]-med)
    if res>.7 and np.linalg.norm(values[k-1,j]-values[k+1,j])<.8:clean[k,j]=med;repairs+=1
    else:clean[k,j]=values[k,j]*.85+med*.15
  for k,i in enumerate(ids):
   p=frames[i];axis=np.array(p['axis']);side=np.array([axis[1],-axis[0]]);basis=np.array([side,axis]);p[key]=np.round(clean[k]@basis*p['r']+p['body'],4).tolist()
d['endpointRefinement']={'isolatedRepairs':repairs,'stableBodySpaceIdentities':True,'medianBlend':.15};P.write_text(json.dumps(d,separators=(',',':')));print('Endpoint repairs',repairs)
