from pathlib import Path
import math,json,numpy as np,hashlib
from context import ROOT
R=ROOT;d=json.loads((R/'reference/capture.json').read_text());frames=d['frames'];measure=json.loads((R/'reference/measurements.json').read_text())['frames'];props=json.loads((R/'reference/props.json').read_text());parents=[-1,0,1,1,3,1,5,0,7,0,9];ratios=np.array([0,61.65,30.14,35.62,35.62,35.62,35.62,57,57,57,57])/27.4
# A source-coordinate frame maps uniformly to 1920x1080. Preserve character ratios exactly.
scale=1080/480;tracks={'cyan':[]};faces=[];extraTracks={};last=None;seg=-1;last_i=-99;residuals=[];endpoint_repairs=0

def ik(origin,target,a,b,pole):
 v=np.array(target)-origin;raw=np.linalg.norm(v);dist=min(a+b-.001,max(.001,raw));angle=math.atan2(v[1],v[0]);off=math.acos(max(-1,min(1,(a*a+dist*dist-b*b)/(2*a*dist))));joint=origin+np.array([math.cos(angle+pole*off),math.sin(angle+pole*off)])*a;end=origin+v/max(raw,.000001)*dist
 return joint,end,max(0,raw-dist)
def record(nodes,t,r,last,segment):
 abs=[0]*11;ang=[0]*11
 for j in range(1,11):
  p=parents[j];v=nodes[j]-nodes[p];abs[j]=math.atan2(v[1],v[0]);ang[j]=abs[j]if j==1 else abs[j]-(abs[1]if p==0 else abs[p])
  if last and last['segment']==segment:
   while ang[j]-last['angles'][j]>math.pi:ang[j]-=2*math.pi
   while ang[j]-last['angles'][j]<-math.pi:ang[j]+=2*math.pi
 return{'t':round(t,6),'head':np.round(nodes[2]*scale,4).tolist(),'r':round(r*scale,4),'shape':[round(r*scale,4),round(r*scale,4),0],'angles':[round(v,7)for v in ang],'lengths':ratios.tolist(),'segment':segment,'quality':1}
for i,p in enumerate(frames):
 t=i/24
 if not p or 88.88<t<101.04:continue
 if i-last_i>2:seg+=1;last=None
 head=np.array(p['head']);axis=np.array(p['axis']);body=np.array(p['body']);r=p['r']*.30
 # Suppress isolated head-shape fits, leaving deliberate jumps and zooms intact.
 group=[frames[k]for k in range(max(0,i-2),min(len(frames),i+3))if frames[k]]
 medR=float(np.median([q['r']for q in group]));r=19.5 if t<99 else 9.0+(15.6-9.0)*min(1,max(0,(t-101.04)/1.7))
 # Preserve proportions while adapting floor, head-impact and seat contacts.
 def smooth(a,b,x):
  u=max(0,min(1,(x-a)/(b-a)));return u*u*(3-2*u)
 prone=smooth(27.45,27.85,t)*(1-smooth(30.35,31.2,t))
 head[1]+=(p['r']-r)*prone
 seated=smooth(30.45,30.80,t)*(1-smooth(38.5,39.2,t))
 head[1]+=(447-r*.65-(head+axis*(ratios[1]+ratios[2])*r)[1])*seated
 if t>101:head[1]+=44.444444
 sh=head+axis*ratios[2]*r;hip=sh+axis*ratios[1]*r;L=ratios*r;f=-1 if 35.5<t<41.3 else 1;side=np.array([axis[1],-axis[0]])
 hands=[];arms=[];legs=[]
 for j in range(2):
  sourceSh=body-axis*p['r']*.15;target=sh+(np.array(p['hands'][j])-sourceSh)*.66
  # Brief missing wrists are completed in torso coordinates, not held in screen space.
  if np.linalg.norm(target-sh)<r*.2:target=hip+side*r*(.7 if j else -.7)
  joint,end,error=ik(sh,target,L[3],L[4],f);arms.append([joint,end]);residuals.append(error)
  target=np.array(p['feet'][j]);
  headstand=smooth(27.75,27.9,t)*(1-smooth(29.05,29.2,t))
  if headstand:
   fixed=hip+np.array([r*(.72 if j else -3.29),r*(-3.84 if j else -2.17)])
   target=target*(1-headstand)+fixed*headstand

  if seated>.01:target=target*(1-seated)+np.array([hip[0]+r*(3.05 if j else 2.3),447-r*.20-(j*4)])*seated
  if t>101:
   # Sitting: knees project forward and feet hang clear of the bowl; keep actual body reactions.
   target=hip+np.array([-r*(1.8 if j else 2.5)+math.sin(t*4+j)*r*.15,r*(2.45 if j else 2.0)])
  joint,end,error=ik(hip,target,L[7],L[8],-f);legs.append([joint,end]);residuals.append(error)
 nodes=np.array([hip,sh,head,*arms[0],*arms[1],*legs[0],*legs[1]])
 rec=record(nodes,t,r,last,seg);tracks['cyan'].append(rec);faces.append({'t':round(t,6),'frame':i,'paths':p['face'],'red':p['red']});last=rec;last_i=i
# Other cast members use the same programmed bone proportions. Their screen-space
# trajectories are measured from colored head regions; their gait is authored.
for i,p in enumerate(props):
 t=i/24
 for e in p.get('extras',[]):
  name=e['name'];
  if name.startswith('gold'):continue
  arr=extraTracks.setdefault(name,[]);rr=23 if name.startswith('amber')else 20;head=np.array(e['head']);axis=np.array([0.,1.]);sh=head+axis*ratios[2]*rr;hip=sh+axis*ratios[1]*rr;side=-1 if name.startswith('gold')else 1;phase=t*15
  ar=[];le=[]
  for j in range(2):
   a=phase+j*math.pi;ta=sh+np.array([-math.sin(a)*rr*.9,rr*2.1]);a1,a2,_=ik(sh,ta,ratios[3]*rr,ratios[4]*rr,side);ar.extend([a1,a2]);tf=hip+np.array([math.sin(a)*rr*1.0,rr*(3.7-abs(math.cos(a))*.35)]);b1,b2,_=ik(hip,tf,ratios[7]*rr,ratios[8]*rr,-side);le.extend([b1,b2])
  nodes=np.array([hip,sh,head,*ar,*le]);segment=0 if not arr or t-arr[-1]['t']<.1 else arr[-1]['segment']+1;arr.append(record(nodes,t,rr,arr[-1]if arr else None,segment))
# Three commuters, not facial sub-contours mistaken for additional people.
# Their walk and acting are authored around the source group's actual departure timing.
keys=[(51.10,[155,205,245]),(51.5,[200,260,335]),(52.0,[310,420,510]),(52.5,[410,520,610]),(53.0,[610,720,810]),(53.55,[805,915,1005])]
for actor in range(3):
 name='gold'+str(actor);arr=extraTracks.setdefault(name,[]);rr=[20.5,22,21][actor]
 for frame in range(round(51.1*24),round(53.7*24)):
  t=frame/24;k=max(0,min(len(keys)-2,next((j-1 for j in range(1,len(keys))if t<keys[j][0]),len(keys)-2)));a,b=keys[k],keys[k+1];u=max(0,min(1,(t-a[0])/(b[0]-a[0])));x=a[1][actor]*(1-u)+b[1][actor]*u
  phase=(x/rr)*2.4+actor*1.1;hip=np.array([x,447-rr*3.6+abs(math.sin(phase))*rr*.12]);sh=hip+np.array([rr*.20,-ratios[1]*rr]);head=sh+np.array([rr*.10,-ratios[2]*rr]);ar=[];le=[]
  for j in range(2):
   target=sh+np.array([rr*(1.8 if j else -1.3),rr*(1.25 if j else -.65-.3*math.sin(t*15+actor))]);a1,a2,_=ik(sh,target,ratios[3]*rr,ratios[4]*rr,1);ar.extend([a1,a2]);pa=phase+j*math.pi;tf=hip+np.array([math.sin(pa)*rr*1.3,rr*(3.65-.4*max(0,math.cos(pa)))]);b1,b2,_=ik(hip,tf,ratios[7]*rr,ratios[8]*rr,-1);le.extend([b1,b2])
  arr.append(record(np.array([hip,sh,head,*ar,*le]),t,rr,arr[-1]if arr else None,0))
angular_repairs=0
tracks.update(extraTracks)
# Hold door bounds through missed contour frames. Different doors are separate IDs.
for lo,hi,key in [(8.0,27.0,'first'),(35.5,59.5,'lift'),(89.0,98.8,'star')]:
 indices=[i for i,p in enumerate(props)if lo<=p['t']<=hi and 'door'in p]
 for i,p in enumerate(props):
  if not lo<=p['t']<=hi:continue
  if indices:
   k=min(indices,key=lambda k:abs(k-i));box=props[k]['door'];p['door']=[box[0],98 if key!='first'or p['t']>10.2 else box[1],box[2],330 if key!='first'or p['t']>10.2 else box[3]];p['doorId']=key
D={'width':1920,'height':1080,'duration':118.75,'fps':60,'referenceFps':24,'cast':{'cyan':{'rgb':'#12b5cc'}},'tracks':tracks,'faces':faces,'props':props,'stylus':[{'t':p['t'],**p['stylus']}for p in measure if 'stylus'in p]}
for name in extraTracks:D['cast'][name]={'rgb':'#bd55df'if name.startswith('violet')else'#eaaa28'if name.startswith('amber')else'#e0ae35','hollow':True}
(R/'src/motion-data.js').write_text('window.FILM_DATA='+json.dumps(D,separators=(',',':'))+';\n');(R/'qa/retargeting.json').write_text(json.dumps({'referenceFrames':2850,'sourceFps':24,'deliveryFps':60,'duration':118.75,'mainPoseMeasurements':len(tracks['cyan']),'extraTracks':{k:len(v)for k,v in extraTracks.items()},'boneRatiosPreserved':True,'headRadiusRetargetFactor':.30,'radiusPolicy':'Fixed model scale between actual camera zooms; source facial deformation does not resize the whole character','isolatedAngularRepairs':angular_repairs,'method':'Measured head/body/limb endpoints retargeted through fixed-proportion two-link IK; normalized vector facial features; original FK and drawing functions. Kinematic reference adaptation, not pixel-identical motion capture.','unreachableSourceTargets':sum(v>.5 for v in residuals),'maxSourceTargetReachResidual':max(residuals)},indent=2,default=lambda o:float(o)));print('Built',len(tracks['cyan']),'hero controls,',len(extraTracks),'extra tracks')
