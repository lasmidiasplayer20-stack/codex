"""Join the reviewed video streams and mux the original audio exactly once."""
from pathlib import Path
import argparse,subprocess,json,hashlib,tempfile,math
ROOT=Path(__file__).resolve().parents[1]
def run(args):return subprocess.run(args,check=True,capture_output=True,text=True).stdout
def probe(path,*args):return json.loads(run(['ffprobe','-v','error',*args,'-of','json',str(path)]))
def audio_packets(path):return probe(path,'-select_streams','a','-show_packets','-show_data_hash','sha256','-show_entries','packet=data_hash,pts_time')['packets']
parser=argparse.ArgumentParser();parser.add_argument('reference',type=Path);args=parser.parse_args();reference=args.reference.resolve();manifest=json.loads((ROOT/'parts/manifest.json').read_text())
assert hashlib.sha256(reference.read_bytes()).hexdigest()==manifest['reference_sha256'],'Reference checksum differs'
source_audio=audio_packets(reference);reports=[];frame_counts=[]
(ROOT/'.qa').mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='assemble-',dir=ROOT/'.qa') as temp:
 for size in [1080,720]:
  entries=[];frames=0
  for part in manifest['parts']:
   video=ROOT/'exports'/f"parte-{part['id']}-previa-{part['revision']}-{size}p60.mp4";v=probe(video,'-select_streams','v','-show_streams')['streams'][0];n=int(v['nb_frames']);expected=math.ceil(part['end']*60-1e-4)-round(part['start']*60);assert n==expected,(part['id'],n,expected)
   entries.extend(["file '"+str(video).replace("'","'\\''")+"'",f'duration {n/60:.9f}']);frames+=n
  assert frames==math.ceil(manifest['duration']*60-1e-4)
  concat=Path(temp)/f'parts-{size}.txt';concat.write_text('ffconcat version 1.0\n'+'\n'.join(entries)+'\n');out=ROOT/'exports'/f'video-completo-previa-r1-{size}p60.mp4'
  run(['ffmpeg','-hide_banner','-loglevel','error','-f','concat','-safe','0','-i',str(concat),'-i',str(reference),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-t',str(frames/60),'-movflags','+faststart','-y',str(out)])
  d=probe(out,'-show_streams','-show_format');v=next(x for x in d['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==frames and v['avg_frame_rate']=='60/1';assert abs(float(v['duration'])-frames/60)<.001
  a=audio_packets(out);assert [x['data_hash'] for x in a]==[x['data_hash'] for x in source_audio],'Audio was not preserved exactly';assert all(abs(float(x['pts_time'])-float(y['pts_time']))<.001 for x,y in zip(a,source_audio))
  run(['ffmpeg','-hide_banner','-loglevel','error','-xerror','-i',str(out),'-f','null','-'])
  reports.append({'file':out.name,'frames':frames,'fps':60,'video_duration':float(v['duration']),'format_duration':float(d['format']['duration']),'audio_packets_identical':len(a),'full_decode':'passed','bytes':out.stat().st_size,'sha256':hashlib.sha256(out.read_bytes()).hexdigest()})
report={'passed':True,'method':'Video streams concatenated with explicit frame durations; original AAC muxed once, unchanged.','exports':reports};(ROOT/'exports/full-export-validation-r1.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
