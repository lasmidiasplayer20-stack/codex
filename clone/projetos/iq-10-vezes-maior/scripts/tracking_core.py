import cv2 as cv
import numpy as np
import math
w,h=640,360
kernel=cv.getStructuringElement(cv.MORPH_ELLIPSE,(5,5))
small_kernel=cv.getStructuringElement(cv.MORPH_ELLIPSE,(3,3))
def heads_in(im,gray):
 dark=((im.max(axis=2)<85)&((im.max(axis=2).astype(int)-im.min(axis=2))<20)).astype('uint8')*255;opened=cv.morphologyEx(dark,cv.MORPH_OPEN,kernel);cs,_=cv.findContours(opened,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE);found=[]
 for c in cs:
  x,y,bw,bh=cv.boundingRect(c);area=cv.contourArea(c)
  if not(7<=bw<=110 and 8<=bh<=120 and .47<bw/bh<1.8 and 30<area<6500 and area/(bw*bh)>.42):continue
  roi=im[y:y+bh,x:x+bw];white=(roi.min(axis=2)>165)&((roi.max(axis=2).astype(int)-roi.min(axis=2))<85)
  white[:int(bh*.1)]=False;white[int(bh*.79):]=False
  count,labels,st,cent=cv.connectedComponentsWithStats(white.astype('uint8'))
  eyes=[(cx,cy)for (xx,yy,ww,hh,n),(cx,cy)in zip(st[1:],cent[1:]) if 1<=n<=max(3,area*.1) and hh>=1 and ww<=bw*.4]
  pairs=[(u,v)for i,u in enumerate(eyes)for v in eyes[i+1:] if .09*bw<abs(u[0]-v[0])<.6*bw and abs(u[1]-v[1])<bh*.24]
  if not pairs:continue
  circ=4*math.pi*area/max(1,cv.arcLength(c,True)**2);confidence=min(.99,.57+.2*min(1,circ)+.05*len(pairs))
  found.append({'box':[x,y,bw,bh],'center':[round(x+bw/2,2),round(y+bh/2,2)],'confidence':round(confidence,3)})
 # Find paired vertical eye highlights when a head merges into a dark wall.
 if gray.mean()<60:
  neutral=(im.max(axis=2).astype(int)-im.min(axis=2))<65
  white=((gray>180)&neutral).astype('uint8');num,labs,st,cent=cv.connectedComponentsWithStats(white)
  dots=[(list(map(int,q)),c)for q,c in zip(st[1:],cent[1:])if 2<=q[4]<=90 and 2<=q[3]<=22 and .18<q[2]/q[3]<1.25]
  dots.sort(key=lambda d:d[1][0])
  for i,(aa,ca)in enumerate(dots):
   for bb,cb in dots[i+1:]:
    sep=abs(ca[0]-cb[0]);eh=(aa[3]+bb[3])/2
    if sep>38:break
    if not(2<sep<38 and abs(ca[1]-cb[1])<eh*.4 and .35<aa[3]/bb[3]<2.8 and .35<sep/eh<2.8):continue
    cx=(ca[0]+cb[0])/2;cy=(ca[1]+cb[1])/2+eh*.5;bw=int(max(sep*5.2,eh*4.2));bh=int(max(eh*4.1,bw*.88));cx+=sep*.45;x=int(cx-bw/2);y=int(cy-bh/2)
    if x<0 or y<0 or x+bw>=w or y+bh>=h or bw>110 or bh>120:continue
    yy,xx=np.ogrid[:bh,:bw];rr=((xx-bw/2)/(bw/2))**2+((yy-bh/2)/(bh/2))**2;patch=gray[y:y+bh,x:x+bw]
    interior=patch[(rr<.6)&(patch<130)];annulus=patch[(rr>.8)&(rr<1.1)];crop=im[y:y+bh,x:x+bw];blackness=((crop.max(axis=2)[rr<.6]<85)&((crop.max(axis=2).astype(int)-crop.min(axis=2))[rr<.6]<20)).mean()
    if blackness<.65 or len(interior)<15 or np.mean(interior)>72 or np.mean(annulus)-np.mean(interior)<4:continue
    if any(np.linalg.norm(np.array(q['center'])-[cx,cy])<min(bw,q['box'][2])*.55 for q in found):continue
    found.append({'box':[x,y,bw,bh],'center':[round(cx,2),round(cy,2)],'confidence':.68,'method':'paired_eye_observation'})
 return found,dark

def hero_in(im,heads,dark):
 hsv=cv.cvtColor(im,cv.COLOR_BGR2HSV);yellow=cv.inRange(hsv,np.array([22,130,145]),np.array([38,255,255]));n,labels,stats,cent=cv.connectedComponentsWithStats(yellow)
 components=[(list(map(int,st[:4])),int(st[4]),list(map(float,c))) for st,c in zip(stats[1:],cent[1:]) if 20<=st[4]<=16000]
 options=[]
 for head in heads:
  x,y,bw,bh=head['box'];hx,hy=head['center']
  for box,area,(cx,cy) in components:
   tx,ty,tw,th=box
   if area<bw*bh*.3 or tw<bw*.5 or th<bh*.55 or th>bh*5 or tw>bw*5 or ty<hy+bh*.16 or ty>hy+bh*2.2 or abs(cx-hx)>max(bw*1.3,tw*.7):continue
   proximity=math.exp(-((cx-hx)/max(1,bw*1.1))**2)*math.exp(-abs(ty-(y+bh)) / max(1,bh))
   options.append((proximity*math.sqrt(area),head,box,area))
 if not options:return None
 score,head,box,area=max(options,key=lambda q:q[0]);hx,hy=head['center'];x,y,bw,bh=head['box'];tx,ty,tw,th=box
 # Yellow shoes are separate components below the selected torso.
 boots=[(b,ar,c)for b,ar,c in components if ar>=8 and 1<b[2]/max(1,b[3])<5 and b[3]<bh*.8 and ar<max(150,area*.23) and b[1]>ty+th*.75 and b[1]<ty+th+bh*4 and abs(c[0]-hx)<max(bw*3,tw)]
 feet=sorted([{'center':[round(c[0],2),round(c[1],2)],'box':b,'confidence':.65}for b,ar,c in boots],key=lambda q:q['center'][1],reverse=True)[:2]
 # Wrist candidates are dark round components touching a yellow sleeve.
 mask=cv.morphologyEx((cv.cvtColor(im,cv.COLOR_BGR2GRAY)<105).astype('uint8')*255,cv.MORPH_OPEN,small_kernel);cs,_=cv.findContours(mask,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE);near_yellow=cv.dilate(yellow,np.ones((7,7),'uint8'));wrists=[]
 for c in cs:
  bx,by,ww,hh=cv.boundingRect(c);ar=cv.contourArea(c);cx=bx+ww/2;cy=by+hh/2
  if cv.contourArea(c)/max(1,cv.arcLength(c,True)**2)<.022:continue
  if not(2<=ww<=max(12,bw*.65) and 2<=hh<=max(12,bh*.65) and ar>=2 and .4<ww/hh<2 and hy+bh*.35<cy<ty+th+bh*.8 and abs(cx-hx)<max(bw*3.2,tw*1.3)):continue
  if near_yellow[min(h-1,int(cy)),min(w-1,int(cx))]==0:continue
  wrists.append({'center':[round(cx,2),round(cy,2)],'confidence':.55,'box':[bx,by,ww,hh]})
 return {'head':head,'torso':box,'confidence':round(min(.95,head['confidence']*(.7+.3*min(1,score/12))),3),'wristCandidates':wrists,'footCandidates':feet,'anatomicalLabelsVerified':False}
