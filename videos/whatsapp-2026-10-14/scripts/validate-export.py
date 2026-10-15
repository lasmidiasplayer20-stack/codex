"""Validate delivered MP4s and AAC copy, with FFprobe and full FFmpeg decode."""
import hashlib,json,subprocess,argparse,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def probe(path,*args):
    result=subprocess.run(['ffprobe','-v','error',*args,'-of','json',str(path)],check=True,capture_output=True,text=True)
    return json.loads(result.stdout)
def packets(path):
    return probe(path,'-select_streams','a','-show_packets','-show_data_hash','sha256','-show_entries','packet=data_hash,pts_time')['packets']
parser=argparse.ArgumentParser();parser.add_argument('--part',default='01');parser.add_argument('--revision',default='r1');args=parser.parse_args()
entry=next(p for p in json.loads((ROOT/'parts/manifest.json').read_text())['parts'] if p['id']==args.part);duration=entry['end']-entry['start'];frames=math.ceil(duration*60)
audio=packets(ROOT/'parts'/entry['folder']/'soundtrack.m4a')
results=[]
for name,width,height in [(f'parte-{args.part}-previa-{args.revision}-1080p60.mp4',1920,1080),(f'parte-{args.part}-previa-{args.revision}-720p60.mp4',1280,720)]:
    p=ROOT/'exports'/name;d=probe(p,'-show_streams','-show_format');v=next(x for x in d['streams'] if x['codec_type']=='video');a=next(x for x in d['streams'] if x['codec_type']=='audio')
    assert (v['width'],v['height'])==(width,height)
    assert v['codec_name']=='h264' and v['avg_frame_rate']=='60/1' and int(v['nb_frames'])==frames
    assert abs(float(v['duration'])-frames/60)<.001 and a['codec_name']=='aac'
    out_audio=packets(p)
    offset=next((i for i,x in enumerate(audio) if x['data_hash']==out_audio[0]['data_hash']),-1)
    assert offset>=0 and [x['data_hash'] for x in out_audio]==[x['data_hash'] for x in audio[offset:]]
    assert all(abs(float(x['pts_time'])-float(y['pts_time']))<.001 for x,y in zip(out_audio,audio[offset:])), 'AAC packet timing changed'
    assert all(float(x['pts_time'])<0 for x in audio[:offset]), 'Only negative-time AAC preroll may be omitted'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-xerror','-i',str(p),'-f','null','-'],check=True,capture_output=True)
    results.append({'file':name,'width':width,'height':height,'fps':60,'frames':frames,'video_duration':float(v['duration']),'format_duration':float(d['format']['duration']),'video_codec':'h264','audio_codec':'aac','audio_packets_identical':len(out_audio),'negative_time_preroll_packets_omitted':offset,'full_decode':'passed','bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
report='export-validation.json' if args.part=='01' and args.revision=='r1' else f'export-validation-{args.part}-{args.revision}.json'
(ROOT/'exports'/report).write_text(json.dumps({'passed':True,'exports':results},indent=2)+'\n')
print(json.dumps({'passed':True,'exports':results}))
