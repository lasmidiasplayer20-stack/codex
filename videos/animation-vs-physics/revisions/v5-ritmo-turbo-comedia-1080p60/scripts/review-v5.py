"""Encoded review with dense gag sequences, all cuts and exact assembly comparison."""
from pathlib import Path
import subprocess,json
from PIL import Image,ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parents[1];movie=ROOT/'exports/animation-vs-physics-v5-trio-1080p60.mp4';out=ROOT/'.qa/encoded-review';out.mkdir(parents=True,exist_ok=True)
meta=json.loads((ROOT/'.qa/story.json').read_text());mapping=meta['map']
def forward(q):return float(np.interp(q,[p[0] for p in mapping],[p[1] for p in mapping]))
base_shots=[[0,4,11,17,22],[0,6,12.6,16,21],[0,3,9,16,21],[0,4,9,16,22],[0,3,7,14,18],[0,4,9,16,20]]
shots=[[forward(q) for q in row]+[8.6,11.5] for row in base_shots];times=set()
for sc in range(6):
 for q in [forward(5.3),forward(10),forward(16),forward(20),9.3,9.52,9.9,10.4,10.8,11.15,11.65,12.4,12.8]:times.add(sc*13+q)
 for q in shots[sc]:
  if sc*13+q>0:times.update([sc*13+q-1/60,sc*13+q])
# Dense sequences expose rhythm, anticipation, impulse and recovery rather than isolated poses.
for sc in range(6):
 for i in range(12):times.add(sc*13+9.2+i/12)
times=sorted(set(round(t*60)/60 for t in times if 0<=t<78));records=[]
for t in times:
 p=out/f'frame-{round(t*60):05d}.jpg';subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{t:.9f}','-i',str(movie),'-frames:v','1','-q:v','2',str(p)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 im=Image.open(p).convert('RGB');a=np.asarray(im);records.append({'time':t,'frame':round(t*60),'file':p.name,'std':float(a.std())})
def sheet(rows,dest,cols=4,tw=384):
 th=round(tw*9/16);canvas=Image.new('RGB',(cols*tw,((len(rows)+cols-1)//cols)*(th+24)),'#17323c');d=ImageDraw.Draw(canvas)
 for i,r in enumerate(rows):
  im=Image.open(out/r['file']).resize((tw,th));x=i%cols*tw;y=i//cols*(th+24);canvas.paste(im,(x,y));d.text((x+7,y+th+5),f"{r['time']:.3f}s | frame {r['frame']}",fill='#eaf2df')
 canvas.save(dest,quality=92)
for sc in range(6):
 rows=[r for r in records if sc*13<=r['time']<(sc+1)*13];sheet(rows,ROOT/f'exports/revisao-parte-0{sc+1}.jpg')
 dense=[r for r in records if sc*13+9.19<=r['time']<=sc*13+10.13];sheet(dense,ROOT/f'exports/sequencia-comica-0{sc+1}.jpg',cols=4,tw=480)
overview=[min(records,key=lambda r:abs(r['time']-(sc*13+q))) for sc,q in enumerate([9.52,10.05,9.9,9.9,9.9,11.65])];sheet(overview,ROOT/'exports/seis-piadas-v5.jpg',cols=2,tw=960)
def framehash(p):
 data=subprocess.check_output(['ffmpeg','-v','error','-threads','2','-i',str(p),'-map','0:v:0','-an','-f','framemd5','-']);return[line.split(b',')[-1].strip().decode() for line in data.splitlines() if line and not line.startswith(b'#')]
parts=sorted((ROOT/'exports').glob('parte-0*-1080p60.mp4'));joined=[]
for p in parts:joined.extend(framehash(p))
full=framehash(movie);assert len(full)==4680 and full==joined
assert all(r['std']>3 for r in records if .1<r['time']<77.8)
r={'encoded_frames_reviewed':len(records),'frames':4680,'duration':78,'parts':6,'shots':42,'dense_sequences':6,'all_frames_identical_to_parts':True,'records':records,'review_method':'Encoded frames and six dense temporal gag sequences; automatic checks followed by separate visual inspection.'};(ROOT/'exports/revisao-codificada-v5.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps({k:v for k,v in r.items() if k!='records'}))
