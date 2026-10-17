"""Export the completed English episode from its supplied, balanced narration."""
import argparse,concurrent.futures,json,subprocess,sys
from pathlib import Path
P=Path(__file__).resolve().parent
def run(args):
 story=json.loads((P/'story.json').read_text());fps=story['fps'];duration=story['duration'];total=round(duration*fps)
 if not (P/'assets/mix-final.mp3').is_file():raise SystemExit('assets/mix-final.mp3 is required.')
 dest=Path(args.output).resolve() if args.output else P.parent/'Vídeos/day-two-the-signal-1080p60.mp4';dest.parent.mkdir(parents=True,exist_ok=True)
 tmp=P.parent/'rendered';tmp.mkdir(exist_ok=True)
 ranges=[(round(i*total/12),round((i+1)*total/12)) for i in range(12)]
 def job(item):
  i,(a,b)=item;part=tmp/f'part-{i:02}.mp4'
  if args.resume and part.exists():
   try:
    info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=nb_frames','-of','json',str(part)],text=True))
    if int(info['streams'][0]['nb_frames'])==b-a:print('Reusing part',i,flush=True);return part
   except Exception:pass
  subprocess.run(['node',str(P/'render.cjs'),str(a),str(b),str(part)],cwd=P,check=True);print('Completed part',i,flush=True);return part
 with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:parts=list(pool.map(job,enumerate(ranges)))
 concat=tmp/'concat.txt';concat.write_text(''.join("file '"+x.name+"'\n" for x in parts))
 subprocess.run(['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(concat),'-i',str(P/'assets/mix-final.mp3'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',str(duration),'-movflags','+faststart',str(dest)],check=True)
 print('Final export:',dest,flush=True)
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--workers',type=int,default=2,choices=range(1,4));p.add_argument('--resume',action='store_true');p.add_argument('--output');run(p.parse_args())
