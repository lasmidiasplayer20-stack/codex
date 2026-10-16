from pathlib import Path
import cv2,json,numpy as np
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent;movie=R.parents[1]/'Vídeos/The-Wrong-Door-R2/The-Wrong-Door-R2-1080p60.mp4';cap=cv2.VideoCapture(str(movie));assert cap.isOpened()
times=[.5,2,6,10,12,13.5,20,22,26.5,28,30,34,38,40,41,48,52,54,56,60,62,68,70,74,78,80,84,86,90,94,96,99,102,104,108,110,114,118];sheet=Image.new('RGB',(1600,((len(times)+3)//4)*245),'#152a3d');d=ImageDraw.Draw(sheet);rows=[]
for i,t in enumerate(times):
 cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,f=cap.read();assert ok,(t,'decode failed');assert f.shape[:2]==(1080,1920);assert np.std(f)>5,(t,'blank frame')
 im=Image.fromarray(cv2.cvtColor(f,cv2.COLOR_BGR2RGB));im.thumbnail((400,225));sheet.paste(im,((i%4)*400,(i//4)*245));d.text(((i%4)*400+6,(i//4)*245+228),f'{t:.3f}s decoded',fill='white');rows.append({'time':t,'decoded':True,'width':1920,'height':1080})
sheet.save(R/'qa/decoded-overview.jpg',quality=93);(R/'qa/decoded-review.json').write_text(json.dumps({'file':movie.name,'samples':rows,'framesReviewed':len(rows)},indent=2));print('Decoded review frames:',len(rows))
