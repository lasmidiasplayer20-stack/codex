"""Render native 1080p60 parts, then mux the complete film atomically."""
import argparse,concurrent.futures,json,subprocess
from pathlib import Path
P=Path(__file__).resolve().parent
def main(args):
 s=json.loads((P/'story.json').read_text());total=round(s['duration']*s['fps']);tmp=P.parent/'rendered';tmp.mkdir(exist_ok=True)
 dest=P.parent/'Vídeos/day-three-someone-was-listening-1080p60.mp4';dest.parent.mkdir(exist_ok=True)
 ranges=[(round(i*total/12),round((i+1)*total/12)) for i in range(12)]
 def job(item):
  i,(a,b)=item;part=tmp/f'part-{i:02}.mp4'
  if args.resume and part.exists():
   try:
    v=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','stream=nb_frames','-of','json',str(part)],text=True))
    if int(v['streams'][0]['nb_frames'])==b-a:print('Reusing part',i,flush=True);return part
   except Exception:pass
  subprocess.run(['node',str(P/'render.cjs'),str(a),str(b),str(part)],cwd=P,check=True);print('Completed part',i,flush=True);return part
 with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as pool:parts=list(pool.map(job,enumerate(ranges)))
 concat=tmp/'concat.txt';concat.write_text(''.join("file '"+x.name+"'\n" for x in parts))
 master=tmp/'audio/final-master.wav';audio=master if master.exists() else P/'assets/mix-final.mp3';target=tmp/'complete.mp4'
 # Global two-pass allocation preserves extra bits for the chaotic crossing while
 # keeping the complete H.264 file below GitHub's ordinary 100 MiB blob limit.
 common=['ffmpeg','-y','-v','error','-f','concat','-safe','0','-i',str(concat)]
 encoding=['-c:v','libx264','-threads','3','-preset','medium','-tune','animation','-b:v','1000k','-pix_fmt','yuv420p','-passlogfile',str(tmp/'delivery-2pass')]
 print('Encoding delivery, pass 1/2',flush=True)
 subprocess.run(common+['-map','0:v:0',*encoding,'-pass','1','-an','-t',str(s['duration']),'-f','null','-'],check=True)
 print('Encoding delivery, pass 2/2',flush=True)
 subprocess.run(common+['-i',str(audio),'-map','0:v:0','-map','1:a:0',*encoding,'-pass','2','-c:a','aac','-b:a','160k','-ar','48000','-ac','2','-t',str(s['duration']),'-movflags','+faststart',str(target)],check=True)
 assert target.stat().st_size<100*1024*1024,'Delivery exceeds GitHub file limit'
 target.replace(dest);print('Final export:',dest,flush=True)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--workers',type=int,default=2,choices=[1,2,3]);ap.add_argument('--resume',action='store_true');main(ap.parse_args())
