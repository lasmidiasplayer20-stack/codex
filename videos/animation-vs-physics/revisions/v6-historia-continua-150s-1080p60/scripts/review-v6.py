"""Decoded frame review sheets and exact video-only assembly verification."""
from pathlib import Path
import subprocess,json
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];E=ROOT/'exports';Q=ROOT/'.qa';full=E/'animation-vs-physics-v6-continuous-1080p60.mp4'
def run(args):return subprocess.check_output(args)
def hashes(p):
 s=run(['ffmpeg','-v','error','-i',str(p),'-map','0:v:0','-f','framemd5','-']).decode()
 return [line.split(',')[-1].strip() for line in s.splitlines() if line and not line.startswith('#')]
parts=sorted(E.glob('part-0*-1080p60.mp4'));hf=hashes(full);hp=[]
for p in parts:hp+=hashes(p)
assert len(hf)==9000 and hf==hp
reviewed=0
for idx,(start,duration,label) in enumerate([(9.6,2.8,'Recover and slip'),(30.4,4.2,'Launch and rebound'),(37.2,2.6,'Do not release the brake'),(61.8,3.2,'Brake and inertia'),(85.8,3.4,'Release and catch'),(114.6,4.2,'Controlled launch'),(124.8,3.0,'A familiar mistake'),(126.3,4.2,'Bridge rescue'),(143.8,3.6,'Leave it alone')],1):
 d=Q/f'seq-{idx:02}';d.mkdir(exist_ok=True)
 subprocess.run(['ffmpeg','-v','error','-y','-ss',str(start),'-i',str(full),'-t',str(duration),'-vf','fps=5,scale=480:270',str(d/'%03d.jpg')],check=True)
 files=sorted(d.glob('*.jpg'));sheet=Image.new('RGB',(1920,((len(files)+3)//4)*300+40),'#152833');draw=ImageDraw.Draw(sheet);draw.text((16,12),label,fill='white')
 for i,p in enumerate(files):
  x=i%4*480;y=i//4*300+40;sheet.paste(Image.open(p),(x,y));draw.text((x+8,y+275),f'{start+i/5:.2f}s',fill='white')
 sheet.save(E/f'motion-review-{idx:02}.jpg',quality=88);reviewed+=len(files)
times=sorted(set([0,4.8,7.65,10.8,18,24.983333,25,28.8,31.8,34.3,38.5,43,49.983333,50,54,63,69,74.983333,75,79,84,87.4,88.4,94.5,99.983333,100,108,110.5,116,118.6,124.983333,125,125.8,127.5,129,133,138,145,149.983333]))
sheet=Image.new('RGB',(1920,((len(times)+3)//4)*300),'#152833');draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 f=Q/f'encoded-{t:.3f}.jpg';subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(full),'-frames:v','1','-vf','scale=480:270',str(f)],check=True)
 x=i%4*480;y=i//4*300;sheet.paste(Image.open(f),(x,y));draw.text((x+8,y+275),f'{t:.3f}s',fill='white')
sheet.save(E/'storyboard-v6.jpg',quality=90)
report={'all_frames_identical_to_parts':True,'full_frames':len(hf),'part_frames':len(hp),'encoded_frames_sampled':reviewed+len(times),'sequences':9,'chapter_boundaries_sampled':[25,50,75,100,125],'visual_review':'Sheets generated for assistant inspection; see separate visual-review-v6.json for observations.'}
(E/'encoded-review-v6.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
