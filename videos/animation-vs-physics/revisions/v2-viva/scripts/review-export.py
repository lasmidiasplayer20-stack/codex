"""Inspect the encoded deliverable, not just the browser simulation."""
import argparse,json,subprocess,tempfile,wave
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
p=argparse.ArgumentParser();p.add_argument('video',type=Path);p.add_argument('--out',type=Path,default=Path('/workspace/scratch/animation-vs-physics/encoded-review'));a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True)
cuts=json.loads(Path('exports/camera-cuts-v2.json').read_text())['cuts']
cut_frames=sorted(set(n for t in cuts for n in [round(t*24)-1,round(t*24)] if 0<=n<3000))
frames=sorted(set([0,119,120,719,720,1799,1800,2757,2999]+[i*120+60 for i in range(25)]+[i*120-1 for i in range(1,25)]+[i*120 for i in range(25)]+cut_frames))
def balanced_sum(items):
 if len(items)==1:return items[0]
 half=len(items)//2
 return '('+balanced_sum(items[:half])+'+'+balanced_sum(items[half:])+')'
# FFmpeg limits expression-parser recursion; balance the 150+ frame terms.
expr=balanced_sum(['eq(n,%d)'%n for n in frames])
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(a.video),'-vf',f'select={expr.replace(",",chr(92)+",")},scale=480:270','-fps_mode','vfr','-y',str(a.out/'frame-%03d.png')],check=True)
files={n:a.out/('frame-%03d.png'%(i+1)) for i,n in enumerate(frames)}
labels=Path('src/takes.js').read_text().split('=',1)[1].strip().removesuffix(';');takes=json.loads(labels)
sheet=Image.new('RGB',(1440,9*294),'#dedede');d=ImageDraw.Draw(sheet)
for i in range(25):
 n=i*120+60;x=i%3*480;y=i//3*294;sheet.paste(Image.open(files[n]).convert('RGB'),(x,y));d.text((x+8,y+274),f'Take {i+1:02d} | {n/24:.2f}s',fill='#111')
sheet.save('exports/contact-sheet-final-takes.jpg',quality=92)
trans=Image.new('RGB',(1440,16*294),'#dedede');d=ImageDraw.Draw(trans)
for j,i in enumerate(range(1,25)):
 for k,n in enumerate([i*120-1,i*120]):
  pos=j*2+k;x=pos%3*480;y=pos//3*294;trans.paste(Image.open(files[n]).convert('RGB'),(x,y));d.text((x+8,y+274),f'Frame {n} | {n/24:.4f}s',fill='#111')
trans.save('exports/contact-sheet-final-transitions.jpg',quality=90)
last=np.asarray(Image.open(files[2999]).convert('RGB'));flash=np.asarray(Image.open(files[2757]).convert('RGB'));assert last.max()<=3;assert flash.min()>=250
cut_sheet=Image.new('RGB',(1440,((len(cut_frames)+2)//3)*294),'#dedede');d=ImageDraw.Draw(cut_sheet)
for i,n in enumerate(cut_frames):
 x=i%3*480;y=i//3*294;cut_sheet.paste(Image.open(files[n]).convert('RGB'),(x,y));d.text((x+8,y+274),f'Camera cut | frame {n} | {n/24:.4f}s',fill='#111')
cut_sheet.save('exports/contact-sheet-camera-cuts.jpg',quality=91)
with wave.open('exports/audio-v2.wav','rb')as f:rate=f.getframerate();audio=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2)
assert len(audio)==125*48000
silences={}
for begin,end in [(4.25,4.95),(102.5,103.05),(113,115.4),(124.9,125)]:
 peak=int(np.max(np.abs(audio[round(begin*rate):round(end*rate)])));assert peak==0;silences[f'{begin}-{end}']=peak
r={'passed':True,'reviewed_source':'Encoded final MP4, decoded frames; PCM soundtrack','frame_indices':frames,'takes':len(takes),'explicit_camera_cuts':len(cuts),'cut_boundary_frames':cut_frames,'black_final_frame_max_rgb':int(last.max()),'flash_frame_min_rgb':int(flash.min()),'audio_samples_per_channel':len(audio),'audio_silence_peak_pcm':silences,'contact_sheets':['contact-sheet-final-takes.jpg','contact-sheet-final-transitions.jpg','contact-sheet-camera-cuts.jpg']};Path('exports/encoded-review.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r))
