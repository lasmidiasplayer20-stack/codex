"""Sample encoded motion sequences, inspect levels and compare preserved sources."""
from pathlib import Path
import subprocess,json,hashlib,re
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parent;DEST=ROOT.parents[1]/'Vídeos/O-botão-de-desfazer';FINAL=DEST/'O-botão-de-desfazer-1080p60.mp4';QA=ROOT/'qa';FRAMES=QA/'frames/encoded';FRAMES.mkdir(parents=True,exist_ok=True)
TIMES=[
 [1.8,2,2.2,9.8,10,10.2,13.8,14,14.2,23.8,24,24.2],
 [35.5,36,36.5,37.5,38,38.5,39,39.5,40,45.5,47,48.5],
 [65.8,66,66.2,71.8,72,72.2,75.5,76,77,78,83.8,84.2],
 [98,99,100,101,102,103,109.8,110,110.2,115.5,117,118.5],
 [123.8,124,124.2,124.8,125,125.2,128.8,129,129.2,136.8,137,137.2],
 [152.8,153,153.2,158.8,159,159.2,161.8,162,162.2,173.8,174,174.2],
 [182.8,183,183.2,185.8,186,186.2,194.8,195,195.2,202.8,203,208]
]
for part,times in enumerate(TIMES):
 sheet=Image.new('RGB',(1920,1520),'#17283f');draw=ImageDraw.Draw(sheet)
 for i,t in enumerate(times):
  path=FRAMES/f'{t:07.3f}.jpg'
  subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(t),'-i',str(FINAL),'-frames:v','1','-vf','scale=640:360','-y',str(path)],check=True)
  x=(i%3)*640;y=(i//3)*380;sheet.paste(Image.open(path),(x,y));draw.text((x+12,y+362),f'Encoded MP4 · {t:06.2f}s',fill='white')
 sheet.save(QA/f'encoded-motion-{part+1:02d}.jpg',quality=91)
# Decode each side of every chapter boundary, with no substitution from source previews.
boundaries=[]
for t in range(30,210,30):
 a=FRAMES/f'boundary-{t}-before.jpg';b=FRAMES/f'boundary-{t}-after.jpg'
 for time,path in [(t-1/60,a),(t,b)]:subprocess.run(['ffmpeg','-hide_banner','-v','error','-ss',str(time),'-i',str(FINAL),'-frames:v','1','-vf','scale=640:360','-y',str(path)],check=True)
 boundaries.append({'seconds':t,'before':a.name,'after':b.name})
sheet=Image.new('RGB',(1280,2280),'#17283f');draw=ImageDraw.Draw(sheet)
for i,boundary in enumerate(boundaries):
 for j,side in enumerate(['before','after']):
  x=j*640;y=i*380;sheet.paste(Image.open(FRAMES/boundary[side]),(x,y));draw.text((x+12,y+362),f"{boundary['seconds']}s / {side}",fill='white')
sheet.save(QA/'encoded-boundaries.jpg',quality=91)
original=ROOT.parents[1];hashes=[]
for file in ['src/model.js','src/legacy-renderer.js','vendor/rig-controller.js']:
 left=hashlib.sha256((ROOT/file).read_bytes()).hexdigest();right=hashlib.sha256((original/file).read_bytes()).hexdigest();assert left==right
 hashes.append({'file':file,'sha256':left,'identical_to_original':True})
p=subprocess.run(['ffmpeg','-hide_banner','-nostats','-i',str(FINAL),'-af','ebur128=peak=true','-vn','-f','null','-'],capture_output=True,text=True,check=True)
summary=p.stderr.split('Summary:')[-1].strip();(QA/'audio-levels.txt').write_text(summary+'\n')
report={'encoded_frames_sampled':84+12,'sheets':[f'encoded-motion-{i+1:02d}.jpg'for i in range(7)],'chapter_boundaries':boundaries,'preserved_files':hashes,'audio_analysis':'audio-levels.txt','human_listening':False,'manual_viewing_of_all_frames':False}
(QA/'encoded-review.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
