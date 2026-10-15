"""Retarget measured poses with stable limb identities and local jitter cleanup.
True unwrapped rotations remain continuous; camera cuts form separate segments.
"""
import argparse,json,copy,math
from pathlib import Path
import numpy as np
PARENTS=[-1,0,1,1,3,1,5,0,7,0,9]

def segment(p,q):return p.get('partial',False)!=q.get('partial',False)or q['t']-p['t']>.20 or max(q['r']/p['r'],p['r']/q['r'])>1.6 or np.linalg.norm(np.array(q['head'])-p['head'])>max(p['r'],q['r'])*10

def stable_sides(poses,name):
 if len(poses)<2:return 0
 # Compare in a torso coordinate frame, so real whole-body rotations are kept.
 values=[]
 for p in poses:
  origin=np.array(p['hip']if name=='legs'else p['shoulder']);axis=np.array(p['head'])-p['hip'];angle=math.atan2(axis[1],axis[0]);basis=np.array([[math.cos(angle),math.sin(angle)],[-math.sin(angle),math.cos(angle)]])
  values.append(np.array([[(basis@(np.array(j)-origin))/p['r']for j in limb]for limb in p[name]]))
 costs=np.zeros((len(poses),2));back=np.zeros((len(poses),2),int)
 for i in range(1,len(poses)):
  for state in [0,1]:
   current=values[i][::1 if state==0 else -1];options=[]
   for prev in[0,1]:
    old=values[i-1][::1 if prev==0 else -1];motion=np.minimum((current-old)**2,9).sum();options.append(costs[i-1,prev]+motion+(.16 if state!=prev else 0))
   back[i,state]=int(np.argmin(options));costs[i,state]=min(options)
 state=int(np.argmin(costs[-1]));swaps=0
 for i in range(len(poses)-1,-1,-1):
  if state:poses[i][name].reverse();swaps+=1
  state=back[i,state]
 return swaps

def pack_segment(poses):
 swaps=stable_sides(poses,'arms')+stable_sides(poses,'legs');angles=[];lengths=[]
 for p in poses:
  n=np.array([p['hip'],p['shoulder'],p['head'],*p['arms'][0],*p['arms'][1],*p['legs'][0],*p['legs'][1]],float);absolute=np.zeros(11);rel=np.zeros(11);norm=np.zeros(11)
  for j in range(1,11):d=n[j]-n[PARENTS[j]];absolute[j]=math.atan2(d[1],d[0]);norm[j]=np.linalg.norm(d)/p['r']
  rel[1]=absolute[1]
  for j in range(2,11):v=absolute[j]-(absolute[1]if PARENTS[j]==0 else absolute[PARENTS[j]]);rel[j]=math.atan2(math.sin(v),math.cos(v))
  angles.append(rel);lengths.append(norm)
 angles=np.unwrap(np.array(angles),axis=0);lengths=np.array(lengths);clean=angles.copy();lens=lengths.copy();repaired=0
 for i,p in enumerate(poses):
  lo=max(0,i-2);hi=min(len(poses),i+3);window=lengths[lo:hi];median=np.median(window,axis=0)
  for j in range(1,11):
   value=lengths[i,j];bad=value<.25 or value>max(4.5,median[j]*2.1)
   if bad:lens[i,j]=max(.35,median[j]);repaired+=1
   else:lens[i,j]=value*.70+median[j]*.30
   if hi-lo>=4:
    ts=np.array([q['t']-p['t']for q in poses[lo:hi]]);fit=np.polyfit(ts,angles[lo:hi,j],2);estimate=float(fit[-1]);residual=abs(estimate-angles[i,j])
    amount=.12 if j==1 else .24
    if (bad or p['quality']<.5)and residual>.9:amount=.70
    # Keep forceful swings and somersaults rather than limiting angular speed.
    clean[i,j]=angles[i,j]+np.clip(estimate-angles[i,j],-1.3,1.3)*amount
 controls=[]
 for i,p in enumerate(poses):
  c={'t':p['t'],'head':p['head'],'r':p['r'],'shape':p['headShape'],'root':p['hip'],'angles':np.round(clean[i],5).tolist(),'lengths':np.round(lens[i],4).tolist(),'quality':p['quality'],'partial':p.get('partial',False)}
  if c['partial']:
   c['partialNodes']=[p['hip'],p['shoulder'],p['head'],*p['arms'][0],*p['arms'][1],*p['legs'][0],*p['legs'][1]]
   c['partialHead']=p.get('partialHead',0)
  controls.append(c)
 return controls,{'sideAssignments':swaps,'degenerateBonesRepaired':repaired}

def main():
 a=argparse.ArgumentParser();a.add_argument('capture');a.add_argument('--output',default='motion-data.js');a.add_argument('--duration',type=float);args=a.parse_args();d=json.loads(Path(args.capture).read_text());report={};packed={}
 for name,original in d['tracks'].items():
  poses=copy.deepcopy(original);segments=[]
  for p in poses:
   if not segments or segment(segments[-1][-1],p):segments.append([])
   segments[-1].append(p)
  out=[];stats={'segments':len(segments),'sideAssignments':0,'degenerateBonesRepaired':0}
  for k,group in enumerate(segments):
   controls,r=pack_segment(group)
   for p in controls:p['segment']=k
   out+=controls
   for key,value in r.items():stats[key]+=value
  packed[name]=out;report[name]=stats
 d['tracks']=packed;d['duration']=args.duration or d.get('mediaDuration',d['duration']);d['refinement']=report
 Path(args.output).write_text('window.FILM_DATA='+json.dumps(d,separators=(',',':'))+';\n');Path(args.output).with_suffix('.report.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if __name__=='__main__':main()
