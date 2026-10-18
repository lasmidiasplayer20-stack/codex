import sys,json
from pathlib import Path
import cv2 as cv,numpy as np
from scipy.ndimage import gaussian_filter1d
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parent;cap=cv.VideoCapture(sys.argv[1]);rows=json.load(open(sys.argv[2]))[:122];out=[];mont=Image.new('RGB',(1600,190*7),'#151a28');dr=ImageDraw.Draw(mont)
for f in range(122):
 ok,im=cap.read();hsv=cv.cvtColor(im,cv.COLOR_BGR2HSV);mask=(((hsv[:,:,0]<40)|(hsv[:,:,1]<35))&(hsv[:,:,2]<125)).astype('uint8')*255
 gray=cv.cvtColor(im,cv.COLOR_BGR2GRAY);cs=cv.HoughCircles(cv.GaussianBlur(gray,(5,5),1),cv.HOUGH_GRADIENT,1,24,param1=70,param2=20,minRadius=16,maxRadius=52);cand=[]
 if cs is not None:
  for cx,cy,r in cs[0]:
   if not(220<cx<390 and 70<cy<240):continue
   yy,xx=np.ogrid[:360,:640];inside=(xx-cx)**2+(yy-cy)**2<(r*.72)**2
   darkness=float((gray[inside]<95).mean());mean=float(gray[inside].mean())
   brown=float((((im[:,:,0].astype(float)-im[:,:,2])<12)&(im.max(axis=2)<135))[inside].mean())
   if darkness>.72 and mean<100 and brown>.64:
    dist=np.linalg.norm(np.array([cx,cy])-(np.array(out[-1]['head'][:2])if out else np.array([327,125.5])))
    if dist<22 and (not out or abs(r-out[-1]['head'][2])<7):cand.append((brown+darkness-dist*.012-(abs(r-out[-1]['head'][2])*.03 if out else 0),[float(cx),float(cy),float(r)]))
 head=max(cand,key=lambda q:q[0])[1]if cand else(out[-1]['head']if out else[327,125.5,19.5])
 row={'f':f,'t':f/30,'head':head,'background':rows[f]['cameraFromTakeStart']};out.append(row)
 if f%4==0:
  cv.circle(im,tuple(round(q)for q in head[:2]),round(head[2]),(100,255,100),1);j=f//4;x=j%5*320;y=j//5*190;mont.paste(Image.fromarray(cv.cvtColor(im,cv.COLOR_BGR2RGB)).resize((320,180)),(x,y));dr.text((x+2,y+180),str(f),fill='white')
for j in range(3):
 values=gaussian_filter1d(np.array([r['head'][j]for r in out]),1.1)
 for r,v in zip(out,values):r['head'][j]=round(float(v),4)
(root/'observations.json').write_text(json.dumps(out));mont.save(root/'qa/head-fit.jpg',quality=93)
for f in [0,24,40,56,88,112]:print(f,out[f]['head'])
