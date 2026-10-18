#!/usr/bin/env python3
"""Verify media output and compare AAC packets with the local original."""
import subprocess,json,sys,hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1];source=Path(sys.argv[1]);video=Path(sys.argv[2])
def probe(p,*args):return json.loads(subprocess.check_output(['ffprobe','-v','error',*args,'-of','json',str(p)]))
meta=probe(video,'-count_frames','-show_format','-show_streams');vs=next(s for s in meta['streams']if s['codec_type']=='video');au=next(s for s in meta['streams']if s['codec_type']=='audio')
assert vs['codec_name']=='h264'and int(vs['nb_read_frames'])==3600 and vs['r_frame_rate']=='60/1'and vs['width']==1280 and vs['height']==720
assert abs(float(vs['duration'])-60)<1/60 and au['codec_name']=='aac'and au['sample_rate']=='44100'and au['channels']==2
sa=probe(source,'-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=data_hash,pts_time')['packets'];va=probe(video,'-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=data_hash,pts_time')['packets'];assert len(va)>2500;assert [a['data_hash']for a in sa[:len(va)]]==[a['data_hash']for a in va]
pts=max(abs(float(a['pts_time'])-float(b['pts_time']))for a,b in zip(sa,va));assert pts<.001
p=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(video),'-f','null','-'],capture_output=True,text=True);assert p.returncode==0 and not p.stderr.strip(),p.stderr
report={'passed':True,'output':video.name,'sha256':hashlib.sha256(video.read_bytes()).hexdigest(),'bytes':video.stat().st_size,'video':{'codec':vs['codec_name'],'frames':int(vs['nb_read_frames']),'fps':vs['r_frame_rate'],'width':vs['width'],'height':vs['height'],'duration':vs['duration']},'audio':{'codec':au['codec_name'],'sampleRate':au['sample_rate'],'channels':au['channels'],'packetsCompared':len(va),'allPacketPayloadsIdenticalToOriginal':True,'maximumTimestampDifferenceSeconds':pts},'fullDecodePassed':True,'fidelityNote':'Media integrity and original audio are verified. Exact visual/motion fidelity is not certified.'};(root/'qa/media.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
