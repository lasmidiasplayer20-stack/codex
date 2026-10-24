"""Validate the finished file, not historical checks from the source project."""
import argparse,hashlib,json,re,subprocess
from pathlib import Path
P=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('video',nargs='?',default=str(P.parent/'Vídeos/day-two-the-signal-1080p60.mp4'));args=p.parse_args();video=Path(args.video)
story=json.loads((P/'story.json').read_text());expected=round(story['duration']*story['fps'])
info=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)],text=True))
v=next(x for x in info['streams'] if x['codec_type']=='video');a=next(x for x in info['streams'] if x['codec_type']=='audio')
assert (v['width'],v['height'],v['codec_name'],v['r_frame_rate'])==(1920,1080,'h264','60/1')
assert int(v['nb_frames'])==expected
assert a['codec_name']=='aac' and a['channels']==2 and int(a['sample_rate'])==48000
assert abs(float(info['format']['duration'])-story['duration'])<.06
assert abs(float(v.get('start_time',0))-float(a.get('start_time',0)))<.025
decoded=subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(video),'-map','0:v:0','-map','0:a:0','-f','null','-'],capture_output=True,text=True,check=True)
assert not decoded.stderr.strip()
r=subprocess.run(['ffmpeg','-hide_banner','-i',str(video),'-vn','-af','loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
m=json.loads(re.findall(r'\{[^{}]+\}',r.stderr)[-1]);I=float(m['input_i']);TP=float(m['input_tp']);LRA=float(m['input_lra'])
assert -17<=I<=-15,(I,'Integrated loudness outside delivery range')
assert TP<=-1.0,(TP,'True peak too high')
report={'file':video.name,'bytes':video.stat().st_size,'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'duration_seconds':float(info['format']['duration']),'width':v['width'],'height':v['height'],'fps':v['r_frame_rate'],'frames':int(v['nb_frames']),'video_codec':v['codec_name'],'audio_codec':a['codec_name'],'audio_channels':a['channels'],'audio_sample_rate':int(a['sample_rate']),'audio_integrated_lufs':I,'audio_true_peak_dbtp':TP,'audio_loudness_range_lu':LRA,'video_start':v.get('start_time'),'audio_start':a.get('start_time'),'complete_decode_passed':True}
(P.parent/'qa/final-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2))
