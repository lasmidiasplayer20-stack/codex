"""Review actual decoded sequences and chapter boundaries from the configured full film."""
import argparse,cv2,json,math,numpy as np
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--times',help='Optional comma-separated absolute start times');a=p.parse_args();root=Path(__file__).resolve().parents[1];cfg=json.loads((root/'project-config.json').read_text());story=json.loads((root/'qa/story.json').read_text());out=root/'qa';movie=root/cfg['output']['directory']/cfg['output']['filename'];cap=cv2.VideoCapture(str(movie));assert cap.isOpened();fps=cfg['fps'];duration=story['duration'];span=min(1,max(0,duration-1/fps))
if a.times:starts=[float(t) for t in a.times.split(',')]
else:
 candidates=[max(0,e['t']-.3) for e in story['events'] if e['type'] not in ['step']]+[(c['start']+c['end'])/2 for c in story['chapters']]
 candidates=sorted(set(candidates));starts=candidates if len(candidates)<=12 else [candidates[round(i*(len(candidates)-1)/11)] for i in range(12)]
starts=[max(0,min(t,duration-1/fps-span)) for t in starts];records=[]
for page in range(math.ceil(len(starts)/4)):
 sheet=np.full((720,1920,3),240,np.uint8)
 for row,start in enumerate(starts[page*4:page*4+4]):
  for col in range(6):
   index=round((start+col*span/5)*fps);cap.set(cv2.CAP_PROP_POS_FRAMES,index);ok,frame=cap.read();assert ok,index;frame=cv2.resize(frame,(320,180));cv2.rectangle(frame,(0,157),(90,180),(247,237,223),-1);cv2.putText(frame,f'{index/fps:.2f}s',(7,174),cv2.FONT_HERSHEY_SIMPLEX,.44,(40,30,40),1);sheet[row*180:(row+1)*180,col*320:(col+1)*320]=frame;records.append({'frame':index,'t':index/fps})
 cv2.imwrite(str(out/f'encoded-motion-{page+1:02}.jpg'),sheet)
boundaries=[]
for c in story['chapters'][1:]:
 t=c['start'];images=[]
 for index in [round(t*fps)-1,round(t*fps)]:
  cap.set(cv2.CAP_PROP_POS_FRAMES,index);ok,frame=cap.read();assert ok;images.append(cv2.resize(frame,(640,360)))
 cv2.imwrite(str(out/f'boundary-{t:g}s.jpg'),np.concatenate(images,axis=1));boundaries.append(t)
cap.release();report={'movie':movie.name,'sequences':len(starts),'decodedSamples':len(records)+2*len(boundaries),'fps':fps,'boundaries':boundaries,'frames':records,'scope':'Decoded image sampling, not full real-time playback or human listening.'};(out/'encoded-review.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:report[k] for k in ['sequences','decodedSamples','fps','boundaries']}))
