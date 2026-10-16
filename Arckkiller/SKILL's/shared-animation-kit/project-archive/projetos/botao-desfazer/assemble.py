"""Assemble seven authored shots without altering their speed; validate every MP4."""
from pathlib import Path
import subprocess,json,hashlib
ROOT=Path(__file__).resolve().parent;DEST=ROOT.parents[1]/'Vídeos/O-botão-de-desfazer';QA=ROOT/'qa';QA.mkdir(exist_ok=True)
TITLES=['A little shortcut','Five seconds back','The better plan','Too many second chances','No more batteries','One good take','For you, actually']
def run(args):subprocess.run(args,check=True)
def probe(p):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
def validate(p,seconds,frames,audio=True):
 info=probe(p);v=next(s for s in info['streams'] if s['codec_type']=='video');a=next((s for s in info['streams'] if s['codec_type']=='audio'),None)
 assert (v['width'],v['height'])==(1920,1080);assert v['avg_frame_rate']=='60/1';assert v['codec_name']=='h264';assert int(v['nb_frames'])==frames
 assert abs(float(info['format']['duration'])-seconds)<.06
 if audio:assert a and a['codec_name']=='aac' and a['channels']==2 and a['sample_rate']=='48000'
 run(['ffmpeg','-hide_banner','-v','error','-xerror','-i',str(p),'-map','0:v:0','-map','0:a:0?','-f','null','-'])
 with p.open('rb')as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
 return {'file':p.name,'passed':True,'duration':float(info['format']['duration']),'frames':int(v['nb_frames']),'fps':'60/1','width':1920,'height':1080,'audio':bool(a),'bytes':p.stat().st_size,'sha256':digest,'full_decode':True}
parts=[ROOT/'production/parts'/f'parte-{i+1:02d}.mp4'for i in range(7)]
for p in parts:
 info=probe(p);v=next(s for s in info['streams']if s['codec_type']=='video');assert int(v['nb_frames'])==1800 and v['avg_frame_rate']=='60/1'
# Strip chapter AAC before concatenating: its priming must not shift video timestamps.
raw=QA/'assembly.h264'
with raw.open('wb')as stream:
 for p in parts:subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(p),'-map','0:v:0','-c:v','copy','-bsf:v','h264_mp4toannexb','-f','h264','-'],stdout=stream,check=True)
metadata=QA/'chapters.ffmeta';metadata.write_text(';FFMETADATA1\ntitle=One More Take - The Undo Button\nartist=Arckkiller\n'+''.join(f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={i*30000}\nEND={(i+1)*30000}\ntitle={title}\n'for i,title in enumerate(TITLES)))
final=DEST/'O-botão-de-desfazer-1080p60.mp4'
run(['ffmpeg','-hide_banner','-loglevel','error','-fflags','+genpts','-r','60','-i',str(raw),'-i',str(ROOT/'audio/master.m4a'),'-i',str(metadata),'-map','0:v:0','-map','1:a:0','-map_metadata','2','-map_chapters','2','-c','copy','-video_track_timescale','60000','-t','210','-movflags','+faststart','-y',str(final)])
reports=[validate(final,210,12600)]
for i,p in enumerate(parts):
 temp=p.with_name(p.stem+'.mux.mp4')
 run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(p),'-ss',str(i*30),'-i',str(ROOT/'audio/master.m4a'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-t','30','-movflags','+faststart','-y',str(temp)])
 temp.replace(p);reports.append(validate(p,30,1800))
(QA/'export-validation.json').write_text(json.dumps(reports,indent=2,ensure_ascii=False));print(json.dumps(reports,indent=2,ensure_ascii=False))
