"""Refine supervised head/face observations, smoothing only within reviewed takes."""
import sys,json
from pathlib import Path
import cv2 as cv,numpy as np
from scipy.ndimage import gaussian_filter1d,median_filter
root=Path(__file__).resolve().parents[1]
rows=json.loads((root/'tracking/calibration-first-minute.json').read_text());cap=cv.VideoCapture(sys.argv[1]);out=[]
for i,row in enumerate(rows):
 ok,im=cap.read();assert ok
 s=row.get('subject');obs=None
 if s:
  x,y=s['center'];w,h=s['box'][2:];rad=(w+h)/4
  x0,y0=max(0,int(x-rad*1.8)),max(0,int(y-rad*1.8));x1,y1=min(640,int(x+rad*1.8)),min(360,int(y+rad*1.8));roi=im[y0:y1,x0:x1];gray=cv.cvtColor(roi,cv.COLOR_BGR2GRAY)
  circles=cv.HoughCircles(cv.GaussianBlur(gray,(5,5),.8),cv.HOUGH_GRADIENT,1,max(6,rad*.5),param1=70,param2=12,minRadius=max(5,int(rad*.6)),maxRadius=int(rad*1.6)+1);cand=[]
  if circles is not None:
   for cx,cy,r in circles[0]:
    px,py=cx+x0,cy+y0;dist=np.hypot(px-x,py-y)
    if dist>rad*.7:continue
    yy,xx=np.ogrid[:roi.shape[0],:roi.shape[1]];inside=(xx-cx)**2+(yy-cy)**2<(r*.70)**2
    if not inside.any():continue
    dark=(gray[inside]<115).mean();neutral=((roi[:,:,0].astype(float)-roi[:,:,2]<20)&(roi.max(axis=2)<145))[inside].mean()
    if dark>.7 and neutral>.65:cand.append((dark+neutral-dist/rad*.8-abs(r/rad-1)*.15,[float(px),float(py),float(r)]))
  p=max(cand,key=lambda a:a[0])[1]if cand else[x,y,rad]
  obs={'role':s['role'],'head':p,'confidence':s['confidence'],'circleMeasured':bool(cand)}
 out.append({'f':i,'take':row['take'],'bg':row['cameraFromTakeStart'],'subject':obs,'hands':row.get('hero',{}).get('wristCandidates',[])if row.get('hero')else[]})
for take in sorted(set(r['take']for r in out)):
 inds=[i for i,r in enumerate(out)if r['take']==take];valid=[i for i in inds if out[i]['subject']]
 if not valid:continue
 # Fill detector gaps from the measured camera, then smooth positions/radius.
 for i in inds:
  if out[i]['subject']is None:
   near=min(valid,key=lambda j:abs(i-j));a=out[near]['subject'];out[i]['subject']={**a,'head':a['head'][:],'confidence':0,'predicted':True}
 for j in range(3):
  a=np.array([out[i]['subject']['head'][j]for i in inds]);a=gaussian_filter1d(median_filter(a,size=5),1.5 if j==2 else .85)
  for i,v in zip(inds,a):out[i]['subject']['head'][j]=round(float(v),4)
 for j in range(6):
  a=gaussian_filter1d([out[i]['bg'][j]for i in inds],1.2)
  for i,v in zip(inds,a):out[i]['bg'][j]=float(v)
cap.set(cv.CAP_PROP_POS_FRAMES,0)
for i,r in enumerate(out):
 ok,im=cap.read();assert ok
 if not r['subject']:continue
 x,y,rad=r['subject']['head'];gray=cv.cvtColor(im,cv.COLOR_BGR2GRAY);yy,xx=np.ogrid[:360,:640];mask=((xx-x)**2+(yy-y)**2<(rad*.8)**2)&(im.min(axis=2)>150);n,_,st,cent=cv.connectedComponentsWithStats(mask.astype('uint8'));parts=[]
 for(x0,y0,w,h,area),(px,py)in zip(st[1:],cent[1:]):
  if area>1 and w<rad and h<rad and py<y+rad*.50:parts.append({'p':[float(px),float(py)],'r':[float(w/2),float(h/2)],'area':int(area)})
 eyes=sorted([p for p in parts if p['p'][1]<y+rad*.1],key=lambda a:a['area'],reverse=True)[:2];eyes.sort(key=lambda a:a['p'][0]);r['eyes']=eyes
 mouth=[p for p in parts if p['p'][1]>y+rad*.13];r['mouth']=max(mouth,key=lambda a:a['area'])if mouth else None
# Reviewed fast-fall keys replace the lost local template; source frames 893–929.
keys=np.array([[893,332,98,18],[899,354,108,18],[905,230,132,18],[911,206,214,18],[917,208,222,18],[923,208,218,18],[929,208,218,18]],float)
for i in range(893,930):
 out[i]['subject']['head']=[float(np.interp(i,keys[:,0],keys[:,j]))for j in[1,2,3]];out[i]['subject']['method']='reviewed fall trajectory';out[i]['eyes']=[];out[i]['mouth']=None
keys=np.array([[1670,168.58,212.13,22.76],[1672,170,216,20],[1674,173,218,19],[1679,178,216,19]],float)
for i in range(1670,1680):
 out[i]['subject']['head']=[float(np.interp(i,keys[:,0],keys[:,j]))for j in[1,2,3]];out[i]['subject']['method']='reviewed zoom-out at bed';out[i]['eyes']=[];out[i]['mouth']=None
seeds={a['take']:a['seedFrame']for a in json.loads((root/'tracking/subject-seeds.json').read_text())['anchors']}
for r in out:
 if r['take']in seeds:r['anchorFrame']=seeds[r['take']]
(root/'tracking/refined-r3.json').write_text(json.dumps(out,separators=(',',':')))
print({'frames':len(out),'circles':sum(bool(r['subject']and r['subject'].get('circleMeasured'))for r in out)})
