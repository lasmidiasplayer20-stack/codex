"""Sample a local reference by absolute time without tracing or altering its animation."""
import argparse,json,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--input',required=True,type=Path);p.add_argument('--output',required=True,type=Path);p.add_argument('--interval',type=float,default=.5);p.add_argument('--width',type=int,default=960);a=p.parse_args()
if not a.input.is_file():p.error('Reference file not found.')
if a.interval<=0 or a.width<64:p.error('Interval must be positive; width >=64.')
if a.output.exists() and any(a.output.iterdir()):p.error('Output must be empty; existing review files will not be overwritten.')
a.output.mkdir(parents=True,exist_ok=True);info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(a.input)]));(a.output/'probe.json').write_text(json.dumps(info,indent=2)+'\n');duration=float(info['format']['duration']);video=next(s for s in info['streams'] if s['codec_type']=='video');samples=[];i=0
while i*a.interval<duration:
 t=i*a.interval;name=f'frame-{i:05}.jpg';subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(a.input),'-frames:v','1','-vf',f'scale={a.width}:-2','-q:v','2',str(a.output/name)],check=True);samples.append({'file':name,'t':t});i+=1
(a.output/'samples.json').write_text(json.dumps({'source':a.input.name,'duration':duration,'fps':video.get('avg_frame_rate'),'interval':a.interval,'samples':samples,'note':'Review image sequences; frame sampling is not a full playback or automatic pose extraction.'},indent=2)+'\n');print(json.dumps({'frames':len(samples),'output':str(a.output)}))
