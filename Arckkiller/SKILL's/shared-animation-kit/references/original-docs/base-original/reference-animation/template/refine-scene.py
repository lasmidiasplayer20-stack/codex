"""Correct typed scenery/weapon classification and partial camera crops."""
import argparse,json,importlib.util,math
from pathlib import Path
import cv2
import numpy as np
spec=importlib.util.spec_from_file_location('capture',Path(__file__).with_name('capture-scene.py'));m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def partial_green(f,t):
 mask=m.mask_for(f,m.CAST['green']);yy,xx=np.where(mask>0)
 if len(xx)<300 or xx.min()>3:return None
 edges=cv2.Canny(mask,80,160);ey,ex=np.where(edges>0);keep=(ex>60)&(ey>5)&(ey<90);head_circle=None
 if keep.sum()>20:
  x=ex[keep].astype(float);y=ey[keep].astype(float);cx,cy,k=np.linalg.lstsq(np.column_stack([2*x,2*y,np.ones(len(x))]),x*x+y*y,rcond=None)[0];radius=math.sqrt(max(1,k+cx*cx+cy*cy));error=np.median(abs(np.hypot(x-cx,y-cy)-radius))
  if 0<cx<300 and -300<cy<80 and 70<radius<400 and error<8:head_circle=[cx,cy,radius]
 if head_circle:mask[:max(0,int(head_circle[1]+head_circle[2]+12))]=0
 yy,xx=np.where(mask>0)
 if len(xx)<100:return None
 xright=float(np.percentile(xx,99));middle=mask[:,int(xright*.35):int(xright*.65)];my,_=np.where(middle>0);ry,_=np.where(mask[:,max(0,int(xright-14)):int(xright+2)]>0);ly,_=np.where(mask[:,:14]>0)
 if min(len(my),len(ry),len(ly))<5:return None
 sk=m.bones.thin(mask);dist=cv2.distanceTransform(mask,cv2.DIST_L2,5);values=dist[sk>0];stroke=max(4,float(np.percentile(values,60))*2.2);r=stroke/.39;shoulder=[-r*.15,float(np.percentile(ly,15))];head=[shoulder[0]-r,shoulder[1]-r*1.6]
 if head_circle:head=head_circle[:2]
 hip=[shoulder[0]-r*2,shoulder[1]+r*2]
 arms=[[[xright*.48,float(np.percentile(my,25))],[xright,float(np.percentile(ry,30))]],[[xright*.48,float(np.percentile(my,75))],[xright-4,float(np.percentile(ry,70))]]]
 return {'t':round(t,6),'head':head,'r':r,'headShape':[r,r,0],'hip':hip,'shoulder':shoulder,'arms':arms,'legs':[[[hip[0]-r,hip[1]+r],[hip[0]-r,hip[1]+r*3]],[[hip[0]-r*2,hip[1]+r],[hip[0]-r*2,hip[1]+r*3]]],'angle':0,'quality':.6,'partial':True,'partialHead':head_circle[2]if head_circle else 0}

def main():
 ap=argparse.ArgumentParser();ap.add_argument('video');ap.add_argument('--capture',required=True);ap.add_argument('--output',required=True);a=ap.parse_args();d=json.loads(Path(a.capture).read_text());scenes={round(p['t']*d['fps']):p for p in d['scenes']};weapons={round(p['t']*d['fps']):p for p in d['weapons']};green={round(p['t']*d['fps']):p for p in d['tracks']['green']};red={round(p['t']*d['fps']):p for p in d['tracks']['red']};cap=cv2.VideoCapture(a.video);i=0;partials=0
 while True:
  ok,f=cap.read()
  if not ok:break
  f=cv2.resize(f,(960,540),interpolation=cv2.INTER_AREA);t=i/d['fps']
  if i in scenes:scenes[i]['props']=m.scene_props(f,t)if t>2.6 else[]
  if i in weapons:
   row=weapons[i];row['objects']=[]
   if 2.6<t<17 or 39<t<94:
    sword=m.weapon(f,'sword')
    if sword:row['objects'].append(sword)
   for kind,actor,lo,hi in [('knife',green,17,43),('mace',red,37.7,87)]:
    if lo<t<hi:
     p=actor.get(i);v=m.weapon(f,kind,p['head']if p else None,p['r']if p else 14)
     if v:row['objects'].append(v)
  if 21.4<t<24.8 and (i not in green or green[i].get('partial')):
   p=partial_green(f,t)
   if p:green[i]=p;partials+=1
  i+=1
 cap.release();d['tracks']['green']=[p for p in green.values()if p['t']<41.95];d['tracks']['green'].sort(key=lambda p:p['t']);Path(a.output).write_text(json.dumps(d,separators=(',',':')));print({'partialArmFrames':partials})
if __name__=='__main__':main()
