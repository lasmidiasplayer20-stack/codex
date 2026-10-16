"""Extract deterministic timed visual samples, a contact sheet and video metadata."""
import argparse,json,subprocess,math
from pathlib import Path
from PIL import Image,ImageDraw
p=argparse.ArgumentParser();p.add_argument('video',type=Path);p.add_argument('output',type=Path);p.add_argument('--interval',type=float,default=5);a=p.parse_args()
if a.interval<=0:raise SystemExit('Interval must be positive')
if a.output.exists():raise SystemExit('Output exists; choose a new directory')
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(a.video)]));duration=float(info['format']['duration'])
times=[i*a.interval for i in range(math.ceil(duration/a.interval))];a.output.mkdir(parents=True)
# Split contact sheets rather than allocating one unbounded image.
frames=[]
for i,t in enumerate(times):
 dest=a.output/f'frame-{i:05d}.jpg'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(t),'-i',str(a.video),'-frames:v','1','-vf','scale=640:-2','-q:v','3',str(dest)],check=True)
 frames.append({'file':dest.name,'time_seconds':t})
for start in range(0,len(frames),40):
 group=frames[start:start+40];sheet=Image.new('RGB',(1280,math.ceil(len(group)/4)*205),'#14233b');d=ImageDraw.Draw(sheet)
 for j,row in enumerate(group):
  with Image.open(a.output/row['file'])as im:im.thumbnail((320,180));sheet.paste(im,((j%4)*320,(j//4)*205))
  d.text(((j%4)*320+6,(j//4)*205+183),f"{row['time_seconds']:.3f} seconds",fill='white')
 sheet.save(a.output/f'contact-sheet-{start//40+1:02d}.jpg',quality=90)
(a.output/'reference.json').write_text(json.dumps({'input':str(a.video.resolve()),'metadata':info,'samples':frames},indent=2));print('Extracted',len(frames),'timed samples')
