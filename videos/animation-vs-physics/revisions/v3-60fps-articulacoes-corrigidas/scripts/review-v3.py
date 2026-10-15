"""Review encoded 60 fps deliverables, including every take and camera cut boundary."""
import argparse,json,subprocess,math
from pathlib import Path
from PIL import Image,ImageDraw
import numpy as np

p=argparse.ArgumentParser()
p.add_argument('video',type=Path);p.add_argument('--start',type=float,default=0)
p.add_argument('--duration',type=float,default=125);p.add_argument('--out',type=Path,required=True)
a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
FPS=60;count=round(a.duration*FPS)
cut_data=Path('exports/camera-cuts-v3.json')
cuts=json.loads(cut_data.read_text())['cuts'] if cut_data.exists() else []
take_times=[i*5+2.5 for i in range(25) if a.start<=i*5+2.5<a.start+a.duration]
boundary_times=[i*5 for i in range(26) if a.start<i*5<a.start+a.duration]
frames={0,count-1}
for t in take_times:frames.add(round((t-a.start)*FPS))
for t in boundary_times+cuts:
    for offset in [-1,0]:
        n=round((t-a.start)*FPS)+offset
        if 0<=n<count:frames.add(n)
# Dense motion sampling covers slip, propulsion, double-kick and the last gag.
for t in [5.9,6.2,6.4,10.9,11.2,11.4,20.8,21,21.2,26.3,26.5,26.8,32.5,33,38.5,38.7,38.9,43,43.2,43.4,50.5,52.5,54.5,57.3,58.5,61.4,67,67.2,67.4,80.2,81.3,82.1,85.6,85.8,90.8,91,91.3166667,91.4166667,91.6,102,102.2,105.975,109.65,110.5,110.55,110.8,114.9,115.1,123.4,123.5166667,123.7,124.8666667]:
    if a.start<=t<a.start+a.duration:frames.add(round((t-a.start)*FPS))
frames=sorted(n for n in frames if 0<=n<count)
def balanced(items):
    if len(items)==1:return items[0]
    h=len(items)//2;return '('+balanced(items[:h])+'+'+balanced(items[h:])+')'
expression=balanced([f'eq(n,{n})' for n in frames]).replace(',',r'\,')
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-threads','1','-i',str(a.video),'-vf',f'select={expression},scale=480:270','-fps_mode','vfr','-y',str(a.out/'frame-%04d.png')],check=True)
files={n:a.out/f'frame-{i+1:04d}.png' for i,n in enumerate(frames)}
assert all(f.exists() for f in files.values())
def sheet(numbers,name,columns=3):
    result=Image.new('RGB',(columns*480,math.ceil(len(numbers)/columns)*294),'#182d3c');d=ImageDraw.Draw(result)
    for i,n in enumerate(numbers):
        x=i%columns*480;y=i//columns*294;result.paste(Image.open(files[n]).convert('RGB'),(x,y));d.text((x+10,y+275),f'{a.start+n/FPS:.3f}s | frame {n}',fill='#eaf4fa')
    result.save(a.out/name,quality=92)
take_frames=[round((t-a.start)*FPS) for t in take_times]
sheet(take_frames,'takes.jpg')
transitions=sorted({round((t-a.start)*FPS)+offset for t in boundary_times+cuts for offset in [-1,0] if 0<=round((t-a.start)*FPS)+offset<count})
if transitions:sheet(transitions,'transitions.jpg')
sheet(frames,'all-reviewed-frames.jpg')
last=np.asarray(Image.open(files[count-1]).convert('RGB'))
if a.start+a.duration==125:assert last.max()<=3,'Final frame must be black'
flash=None
if a.start<=114.9<a.start+a.duration:
    n=round((114.9-a.start)*FPS);flash=int(np.asarray(Image.open(files[n]).convert('RGB')).min());assert flash>=250
report={'passed':True,'video':a.video.name,'fps':FPS,'start':a.start,'duration':a.duration,'review_source':'Decoded encoded MP4','reviewed_frames':len(frames),'frame_indices':frames,'take_midpoints':take_times,'camera_cut_count_in_part':len([t for t in cuts if a.start<t<a.start+a.duration]),'last_frame_max_rgb':int(last.max()),'white_flash_min_rgb':flash}
(a.out/'review.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:v for k,v in report.items() if k!='frame_indices'}))
