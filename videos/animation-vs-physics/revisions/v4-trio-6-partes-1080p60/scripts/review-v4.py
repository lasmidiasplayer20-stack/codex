"""Review encoded MP4: camera boundaries, action contacts and all six chapters."""
from pathlib import Path
import subprocess,json,hashlib,re
from PIL import Image,ImageDraw
import numpy as np
ROOT=Path(__file__).resolve().parents[1];movie=ROOT/'exports/animation-vs-physics-v4-trio-1080p60.mp4';out=ROOT/'.qa/encoded-review';out.mkdir(parents=True,exist_ok=True)
shots=[[0,4,11,17,22],[0,6,12.6,16,21],[0,3,9,16,21],[0,4,9,16,22],[0,3,7,14,18],[0,4,9,16,20]]
actions=[[1,5.3,6.5,9.9,14,18.2,19,24],[1,7.8,10,12.5,17,18,24],[1,4,6,10,13,15,17,24],[1,6,10,11,13,16,20.5,24],[1,4.5,7.8,10.5,13.5,14.5,19,24],[1,6,9,13,16,21.4,23.7,24.5]]
times=set()
for i,arr in enumerate(actions):times.update(i*25+t for t in arr)
for sc,arr in enumerate(shots):
 for q in arr:
  if sc*25+q>0:times.update([sc*25+q-1/60,sc*25+q])
times=sorted(set(round(t*60)/60 for t in times if 0<=t<150));records=[]
for i,t in enumerate(times):
 p=out/f'frame-{round(t*60):05d}.jpg'
 subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{t:.9f}','-i',str(movie),'-frames:v','1','-q:v','2',str(p)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 im=Image.open(p).convert('RGB');a=np.asarray(im);records.append({'time':t,'frame':round(t*60),'luma_mean':float(a.mean()),'file':p.name,'std':float(a.std())})
# Export a six-panel overview and six detailed encoded contact sheets.
def sheet(rows,dest,cols=4,tw=384):
 th=round(tw*9/16);canvas=Image.new('RGB',(cols*tw,((len(rows)+cols-1)//cols)*(th+26)),'#17323c');d=ImageDraw.Draw(canvas)
 for i,r in enumerate(rows):
  im=Image.open(out/r['file']).resize((tw,th));x=i%cols*tw;y=i//cols*(th+26);canvas.paste(im,(x,y));d.text((x+8,y+th+6),f"{r['time']:.3f}s | frame {r['frame']}",fill='#eaf2df')
 canvas.save(dest,quality=92)
for sc in range(6):sheet([r for r in records if sc*25<=r['time']<(sc+1)*25],ROOT/f'exports/revisao-parte-0{sc+1}.jpg')
overview=[]
for sc,q in enumerate([9.9,10,13,11,10.5,16]):overview.append(min(records,key=lambda r:abs(r['time']-(sc*25+q))))
sheet(overview,ROOT/'exports/seis-capitulos-v4.jpg',cols=2,tw=960)
# Since assembly copies video, every decoded frame must match the six source parts.
def framehash(p):
 data=subprocess.check_output(['ffmpeg','-v','error','-threads','2','-i',str(p),'-map','0:v:0','-an','-f','framemd5','-'])
 return [line.split(b',')[-1].strip().decode() for line in data.splitlines() if line and not line.startswith(b'#')]
parts=sorted((ROOT/'exports').glob('parte-0*-1080p60.mp4'));joined=[]
for p in parts:joined.extend(framehash(p))
full=framehash(movie);assert len(full)==9000;assert full==joined,'Assembly altered, lost or duplicated a video frame'
assert all(r['std']>3 for r in records if .4<r['time']%25<24.6),'Unexpected blank image'
result={'encoded_frames_reviewed':len(records),'selected_frames':records,'full_movie_frames':len(full),'assembly_frames_identical_to_parts':True,'all_9000_frame_hashes_checked':True,'parts':len(parts),'camera_cuts':sum(map(len,shots)),'intentional_scene_transitions':[25,50,75,100,125],'review_method':'Frames decoded from final H264, detailed sheets for each chapter and all-frame assembly hash comparison. Visual inspection of the sheets is a separate delivery check.'}
(ROOT/'exports/revisao-codificada-v4.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({k:v for k,v in result.items() if k!='selected_frames'}))
