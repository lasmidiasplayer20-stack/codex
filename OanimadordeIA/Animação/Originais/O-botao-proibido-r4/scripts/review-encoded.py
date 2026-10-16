from pathlib import Path
import cv2,json,numpy as np
root=Path('/workspace/codex/OanimadordeIA/Animação/Originais/O-botao-proibido-r4');out=root/'qa';movie=root/'../../Vídeos/The-Forbidden-Button-R4-1080p60.mp4';cap=cv2.VideoCapture(str(movie));assert cap.isOpened()
starts=[8.0,20.7,25.8,39.9,44.1,49.4,67.6,89.7,92.8,105.3,114.0,143.0];records=[]
for page in range(3):
 sheet=np.full((4*180,6*320,3),240,np.uint8)
 for row,start in enumerate(starts[page*4:page*4+4]):
  for col in range(6):
   index=round((start+col*.2)*60);cap.set(cv2.CAP_PROP_POS_FRAMES,index);ok,a=cap.read();assert ok,index;a=cv2.resize(a,(320,180));cv2.rectangle(a,(0,157),(90,180),(247,237,223),-1);cv2.putText(a,f'{index/60:.2f}s',(7,174),cv2.FONT_HERSHEY_SIMPLEX,.44,(40,30,40),1);sheet[row*180:(row+1)*180,col*320:(col+1)*320]=a;records.append({'frame':index,'t':index/60})
 cv2.imwrite(str(out/f'encoded-motion-{page+1:02}.jpg'),sheet)
bounds=[]
for t in [25,50,75,100,125]:
 images=[]
 for index in [t*60-1,t*60]:
  cap.set(cv2.CAP_PROP_POS_FRAMES,index);ok,a=cap.read();assert ok;images.append(cv2.resize(a,(640,360)))
 cv2.imwrite(str(out/f'boundary-{t}s.jpg'),np.concatenate(images,axis=1));bounds.append(t)
cap.release();(out/'encoded-review.json').write_text(json.dumps({'file':movie.name,'temporalSequences':12,'framesPerSequence':6,'intervalSeconds':.2,'decodedSamples':len(records)+10,'chapterBoundaryPairs':bounds,'frames':records,'scope':'Decoded temporal image samples; no claim of complete real-time playback or human listening.'},indent=2)+'\n');print('Decoded 82 samples: twelve motion sequences and five chapter-boundary pairs.')
