"""Validate all six native-rate sections and atomically deliver the complete movie."""
from pathlib import Path
import subprocess,json,hashlib,os
ROOT=Path(__file__).resolve().parent;QA=ROOT/'qa';DEST=Path(os.environ.get('ANIMATION_VIDEO_DIR',str(ROOT.parents[1]/'Vídeos/The-Wrong-Door-R2')));DEST.mkdir(parents=True,exist_ok=True)
DUR=118.75;TITLES=['An urgent request','The wrong door','Going up','Not helping','One last chance','A captive audience'];durations=[20,20,20,20,20,18.75]
def run(a):subprocess.run(a,check=True)
def probe(p):return json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
def validate(p,seconds,frames,audio):
 d=probe(p);v=next(x for x in d['streams']if x['codec_type']=='video');a=next((x for x in d['streams']if x['codec_type']=='audio'),None)
 assert(v['width'],v['height'],v['avg_frame_rate'],int(v['nb_frames']),v['codec_name'])==(1920,1080,'60/1',frames,'h264')
 assert abs(float(d['format']['duration'])-seconds)<.04
 if audio:assert a and a['codec_name']=='aac'and a['channels']==2 and a['sample_rate']=='48000'and abs(float(a.get('start_time',0)))<.001
 run(['ffmpeg','-hide_banner','-v','error','-xerror','-i',str(p),'-map','0:v:0','-map','0:a:0?','-f','null','-'])
 with p.open('rb')as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
 return{'file':p.name,'duration':float(d['format']['duration']),'frames':int(v['nb_frames']),'fps':60,'width':1920,'height':1080,'audio':bool(a),'bytes':p.stat().st_size,'sha256':digest,'fullDecode':True}
parts=[ROOT/'production/parts'/f'parte-{i+1:02d}.mp4'for i in range(6)];reports=[validate(p,sec,round(sec*60),False)for p,sec in zip(parts,durations)]
raw=ROOT/'production/assembly.h264'
with raw.open('wb')as stream:
 for p in parts:subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(p),'-map','0:v:0','-c:v','copy','-bsf:v','h264_mp4toannexb','-f','h264','-'],stdout=stream,check=True)
meta=QA/'chapters.ffmeta';meta.write_text(';FFMETADATA1\ntitle=THE WRONG DOOR\nartist=Arckkiller\n'+''.join(f'[CHAPTER]\nTIMEBASE=1/1000\nSTART={i*20000}\nEND={round((i*20+durations[i])*1000)}\ntitle={title}\n'for i,title in enumerate(TITLES)))
final=ROOT/'production/The-Wrong-Door-R2-1080p60.mp4'
run(['ffmpeg','-hide_banner','-loglevel','error','-fflags','+genpts','-r','60','-i',str(raw),'-i',str(ROOT/'audio/master.m4a'),'-i',str(meta),'-map','0:v:0','-map','1:a:0','-map_metadata','2','-map_chapters','2','-c','copy','-video_track_timescale','60000','-t',str(DUR),'-movflags','+faststart','-y',str(final)])
complete=validate(final,DUR,7125,True);(QA/'export-validation.json').write_text(json.dumps({'complete':complete,'internalSections':reports,'sourceAudioOffset':0,'playbackSpeed':1},indent=2));final.replace(DEST/final.name);print(json.dumps(complete,indent=2))
