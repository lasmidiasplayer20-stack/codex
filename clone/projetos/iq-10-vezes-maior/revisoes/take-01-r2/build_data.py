import sys,json
from pathlib import Path
import cv2 as cv,numpy as np
from scipy.ndimage import gaussian_filter1d,median_filter
root=Path(__file__).resolve().parent;rows=json.loads((root/'observations.json').read_text());cap=cv.VideoCapture(sys.argv[1]);images=[]
for i in range(122):ok,im=cap.read();images.append(im)
# Smooth measured camera separately from articulated motion; never branch on lost heads.
for j in range(6):
 vals=gaussian_filter1d([r['background'][j]for r in rows],2)
 for r,v in zip(rows,vals):r['background'][j]=float(v)
for j in range(3):
 vals=np.array([r['head'][j]for r in rows]);vals[116:]=vals[115];vals=gaussian_filter1d(median_filter(vals,size=5),2 if j==2 else .7)
 for r,v in zip(rows,vals):r['head'][j]=float(v)
for r,im in zip(rows,images):
 cx,cy,rad=r['head'];gray=cv.cvtColor(im,cv.COLOR_BGR2GRAY);yy,xx=np.ogrid[:360,:640];mask=((xx-cx)**2+(yy-cy)**2<(rad*.82)**2)&(im.min(axis=2)>155);n,labels,st,cent=cv.connectedComponentsWithStats(mask.astype('uint8'));parts=[]
 for (x,y,w,h,area),(px,py)in zip(st[1:],cent[1:]):
  if area>2 and w<rad and h<rad and py<cy+rad*.45:parts.append({'p':[float(px),float(py)],'r':[float(w/2),float(h/2)],'area':int(area)})
 eyes=sorted([p for p in parts if p['p'][1]<cy+rad*.06],key=lambda p:p['area'],reverse=True)[:2];eyes.sort(key=lambda p:p['p'][0]);r['eyes']=eyes
 mouth=[p for p in parts if p['p'][1]>cy+rad*.08];r['mouth']=max(mouth,key=lambda q:q['area'])if mouth else None
 r['flash']=float(np.clip((gray.mean()-50)/130,0,1))if r['f']>=114 else 0
# A static editable brain outline, traced once from the reference, not video pixels.
im=images[88];b,g,rr=cv.split(im);mask=((b>150)&(g>130)&((b.astype(float)-rr)>35)).astype('uint8')*255;mask[:15]=0;mask[310:]=0;mask[:,:85]=0;mask[:,550:]=0;mask=cv.morphologyEx(mask,cv.MORPH_CLOSE,np.ones((5,5),'uint8'));cs,_=cv.findContours(mask,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE);c=max(cs,key=cv.contourArea);pts=cv.approxPolyDP(c,2.5,True).reshape(-1,2)
m=np.array(rows[88]['background']).reshape(2,3);A=np.vstack([m,[0,0,1]]);inverse=np.linalg.inv(A)
def canon(p):return (inverse@np.array([p[0],p[1],1]))[:2].tolist()
outline=[canon(p)for p in [[143,133],[170,90],[218,55],[279,40],[344,42],[401,61],[453,99],[479,142],[483,189],[467,235],[433,260],[387,269],[353,271],[329,294],[314,300],[321,269],[286,260],[240,258],[194,249],[148,221],[137,183]]];start=min(range(len(outline)),key=lambda i:np.linalg.norm(np.array(outline[i])-[210,135]));outline=outline[start:]+outline[:start]
# Source neuron locations and their own measured brightness envelopes.
gray=cv.cvtColor(im,cv.COLOR_BGR2GRAY);interior=np.zeros_like(gray);cv.drawContours(interior,[c],-1,255,-1);cv.circle(interior,(round(rows[88]['head'][0]),round(rows[88]['head'][1])),round(rows[88]['head'][2]*1.3),0,-1);corners=cv.goodFeaturesToTrack(gray,130,.05,7,mask=interior);nodes=[]
for x,y in (corners.reshape(-1,2)if corners is not None else[]):
 if gray[round(y),round(x)]<180:continue
 p=canon([x,y]);values=[]
 for row,image in zip(rows,images):
  a=np.array(row['background']).reshape(2,3);q=a@np.array([*p,1]);qx,qy=map(round,q);patch=image[max(0,qy-2):min(360,qy+3),max(0,qx-2):min(640,qx+3)];values.append(round(float(np.clip(float(patch.max()if patch.size else 0)-115,0,140)/140),3)if row['t']>1.35 else 0)
 nodes.append({'p':p,'light':values})
# Timing is authored in original source frames. Arm endpoints are reviewed screen coordinates.
hand=[[0,330,247],[16,331,258],[24,329,302],[32,319,355],[36,331,355],[40,362,344],[44,380,339],[48,386,335],[56,403,334],[64,411,336],[72,405,340],[80,394,345],[88,375,341],[96,371,338],[104,371,335],[112,362,329],[116,365,329],[121,365,329]]
(root/'data.json').write_text(json.dumps({'fps':30,'sourceFrames':122,'rows':rows,'outline':outline,'nodes':nodes,'nearWristKeys':hand},separators=(',',':')))
cv.imwrite(str(root/'qa/brain-mask.png'),mask);print({'outlinePoints':len(outline),'neurons':len(nodes)})
