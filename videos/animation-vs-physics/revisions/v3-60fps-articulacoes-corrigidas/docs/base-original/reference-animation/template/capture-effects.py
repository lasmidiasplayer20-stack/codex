"""Source-timed spark/beam controls and the weapon that enters before its owner."""
import argparse,json,importlib.util
from pathlib import Path
import cv2
import numpy as np
spec=importlib.util.spec_from_file_location('capture',Path(__file__).with_name('capture-scene.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def main():
 a=argparse.ArgumentParser();a.add_argument('video');a.add_argument('--capture',required=True);a.add_argument('--output',required=True);p=a.parse_args();d=json.loads(Path(p.capture).read_text());heads={round(q['t']*d['fps']):q for q in d['tracks']['orange']};weapon_frames={round(q['t']*d['fps']):q for q in d['weapons']};effects=[];cap=cv2.VideoCapture(p.video);i=0
 while True:
  ok,f=cap.read()
  if not ok:break
  f=cv2.resize(f,(960,540),interpolation=cv2.INTER_AREA);t=i/d['fps'];objects=[];head=heads.get(i)
  if head:
   hx,hy=head['head'];r=head['r'];x0=max(0,int(hx-r*1.5));x1=min(960,int(hx+r*1.5));y0=max(0,int(hy-r*1.5));y1=min(540,int(hy+r*1.5));crop=f[y0:y1,x0:x1];hsv=cv2.cvtColor(crop,cv2.COLOR_BGR2HSV)
   yellow=cv2.inRange(hsv,np.array([20,0,222]),np.array([87,235,255]));white=cv2.inRange(hsv,np.array([0,0,232]),np.array([180,70,255]));mask=yellow|white;n,lab,stats,centers=cv2.connectedComponentsWithStats(mask)
   candidates=[]
   for k in range(1,n):
    x,y,w,h,area=stats[k];cx,cy=centers[k]+[x0,y0]
    if area>max(3,r*r*.014)and np.linalg.norm([cx-hx,cy-hy])<r*1.45:candidates.append((area,cx,cy,w,h))
   if candidates:
    area,x,y,w,h=max(candidates);objects.append({'kind':'spark','x':round(x,2),'y':round(y,2),'r':round(max(3,min(r*.65,max(w,h)*.55)),2)})
   if 38<t<44:
    hsv=cv2.cvtColor(f,cv2.COLOR_BGR2HSV);mask=cv2.inRange(hsv,np.array([40,0,200]),np.array([90,255,255]))|cv2.inRange(hsv,np.array([0,0,232]),np.array([180,90,255]));n,lab,stats,_=cv2.connectedComponentsWithStats(mask)
    for k in range(1,n):
     x,y,w,h,area=stats[k]
     if h<r*2.5 or h<w*2.2 or abs(x+w/2-hx)>r*5:continue
     points=cv2.findNonZero((lab==k).astype(np.uint8))[:,0,:].astype(float);mean=points.mean(axis=0);_,vec=np.linalg.eigh(np.cov(points.T));axis=vec[:,-1];projection=(points-mean)@axis;a=mean+axis*np.min(projection);b=mean+axis*np.max(projection)
     objects.append({'kind':'beam','a':np.round(a,2).tolist(),'b':np.round(b,2).tolist(),'width':round(max(2,area/h*.6),2)})
  if 37.7<t<44:
   v=m.weapon(f,'mace');row=weapon_frames.get(i)
   if v and row:row['objects']=[o for o in row['objects']if o['kind']!='mace']+[v]
  effects.append({'t':round(t,6),'objects':objects});i+=1
 cap.release();d['effects']=effects;Path(p.output).write_text(json.dumps(d,separators=(',',':')));print({'sparkFrames':sum(any(o['kind']=='spark'for o in q['objects'])for q in effects),'beamFrames':sum(any(o['kind']=='beam'for o in q['objects'])for q in effects)})
if __name__=='__main__':main()
