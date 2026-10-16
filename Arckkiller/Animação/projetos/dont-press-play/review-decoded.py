from pathlib import Path
from PIL import Image,ImageDraw
import cv2,json
root=Path(__file__).resolve().parent;film=root.parents[1]/'Vídeos/Dont-Press-Play/Dont-Press-Play-1080p60.mp4';cap=cv2.VideoCapture(str(film));assert cap.isOpened()
out=Image.new('RGB',(1600,7*245),'#14233b');draw=ImageDraw.Draw(out);checks=[]
for part in range(7):
 for col,delta in enumerate([3,10,19,27]):
  t=part*30+delta;cap.set(cv2.CAP_PROP_POS_MSEC,t*1000);ok,frame=cap.read();assert ok,(t,'decode failed');im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB));assert im.getbbox();im.thumbnail((400,225));out.paste(im,(col*400,part*245));draw.text((col*400+8,part*245+227),f'{t//60}:{t%60:02d} | part {part+1}',fill='white');checks.append({'time':t,'decoded':True,'width':frame.shape[1],'height':frame.shape[0]})
cap.release();out.save(root/'qa/decoded-overview.jpg',quality=92);(root/'qa/decoded-review.json').write_text(json.dumps({'source':film.name,'frames_reviewed':checks,'method':'28 decoded samples across all seven parts; complements temporal source-frame review and full decoding','human_listening':False},indent=2));print('28 final-file frames decoded for visual review')
