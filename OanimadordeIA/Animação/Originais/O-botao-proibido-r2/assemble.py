"""Join seven internally reviewed renders, apply one continuous score and validate."""
import argparse,hashlib,json,subprocess
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--parts',type=Path,default=Path('/workspace/animation-production-r2/parts'));args=p.parse_args()
root=Path(__file__).parent;dest=root.parent.parent/'Vídeos';dest.mkdir(exist_ok=True);sound=json.loads((root/'audio/generation.json').read_text());pending=sound['effectsFromElevenLabs']==0;output=dest/('The-Forbidden-Button-R2-1080p60-preview.mp4' if pending else 'The-Forbidden-Button-R2-1080p60.mp4')
def probe(path):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)]))
stamp=hashlib.sha256((root/'src/world.js').read_bytes()+(root/'src/story.js').read_bytes()+(root/'src/performance.js').read_bytes()).hexdigest();reports=[];files=[]
for i in range(7):
 video=args.parts/f'parte-{i+1:02}.mp4';meta=json.loads(Path(str(video)+'.json').read_text());assert (meta['sourceHash']==stamp or meta.get('reuseValidation',{}).get('validatedAgainstSourceHash')==stamp) and meta['frames']==1800 and not meta['errors']
 info=probe(video);v=next(s for s in info['streams'] if s['codec_type']=='video');assert (int(v['nb_frames']),v['avg_frame_rate'],v['width'],v['height'])==(1800,'60/1',1920,1080)
 files.append(video);reports.append(meta)
concat=args.parts/'montagem.txt';concat.write_text(''.join("file '"+str(v.resolve()).replace("'","'\\''")+"'\n" for v in files))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(concat),'-i',str(root/'audio/trilha-original.m4a'),'-map','0:v:0','-map','1:a:0','-c','copy','-t','210','-movflags','+faststart',str(output)],check=True)
info=probe(output);v=next(s for s in info['streams'] if s['codec_type']=='video');a=next(s for s in info['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'],v['avg_frame_rate'],int(v['nb_frames']))==(1920,1080,'60/1',12600)
assert abs(float(info['format']['duration'])-210)<.03
assert a['codec_name']=='aac' and a['channels']==2
subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(output),'-map','0:v:0','-map','0:a:0','-f','null','-'],check=True)
cue=sound;qa=json.loads((root/'qa/qa.json').read_text())
report={'file':output.name,'bytes':output.stat().st_size,'sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'duration':float(info['format']['duration']),'width':1920,'height':1080,'fps':60,'frames':12600,'audio':{'codec':'aac','channels':2,'sample_rate':a['sample_rate'],'originalScore':True,'referenceAudioUsed':False,'effectsFromElevenLabs':cue['effectsFromElevenLabs']},'fullDecodePassed':True,'soundStatus':'ElevenLabs pending; provisional procedural mix' if pending else 'ElevenLabs effects integrated','referenceComponents':json.loads((root/'qa/preserved-components.json').read_text()),'sourceHash':stamp,'parts':reports,'animationQA':qa}
output.with_suffix('.validacao.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps({k:v for k,v in report.items() if k not in ('parts','animationQA')},ensure_ascii=False,indent=2))
