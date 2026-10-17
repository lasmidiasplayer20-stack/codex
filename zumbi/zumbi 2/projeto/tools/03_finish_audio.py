import json,subprocess,re
from pathlib import Path
P=Path(__file__).resolve().parents[1]
WORK=P.parent/'rendered'/'audio-work';WORK.mkdir(parents=True,exist_ok=True)
D=json.loads((P/'story.json').read_text())['duration']
Q=P.parent/'qa'
def run(a):return subprocess.run(['ffmpeg','-y','-hide_banner',*a],capture_output=True,text=True,check=True)
def normalize(src,dest,I,TP,LRA,extra=None,codec=None):
 target=f'loudnorm=I={I}:TP={TP}:LRA={LRA}'
 r=run(['-i',str(src),'-af',target+':print_format=json','-f','null','-'])
 m=json.loads(re.findall(r'\{[^{}]+\}',r.stderr)[-1]);
 filt=target+f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
 r=run(['-i',str(src),'-af',filt,'-ar','48000',*(codec or ['-c:a','pcm_s24le']),str(dest)])
 result=json.loads(re.findall(r'\{[^{}]+\}',r.stderr)[-1])
 return {'analysis':m,'normalization':result}
voice=normalize(P/'assets/voice-balanced.wav',str(WORK/'voice-normalized.wav'),-17,-2,6)
(Q/'voice-normalization.json').write_text(json.dumps(voice,indent=2))
run(['-i',str(WORK/'voice-normalized.wav'),'-c:a','aac','-b:a','128k',str(P/'assets/narration.m4a')])
# Narration is dominant. Sidechain ducking reduces the bed during speech.
graph='[0:a]asplit=2[v][sc];[1:a]volume=0.16[m];[2:a]volume=0.23[s];[m][s]amix=inputs=2:normalize=0[bed];[bed][sc]sidechaincompress=threshold=0.025:ratio=6:attack=15:release=350:makeup=1[duck];[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.87:level=0[mix]'
run(['-i',str(WORK/'voice-normalized.wav'),'-i',str(P/'assets/music.mp3'),'-i',str(P/'assets/sfx.mp3'),'-filter_complex',graph,'-map','[mix]','-t',str(D),'-ar','48000','-ac','2','-c:a','pcm_s24le',str(WORK/'mix-premaster.wav')])
mix=normalize(str(WORK/'mix-premaster.wav'),P/'assets/mix-final.mp3',-16,-1.5,7,codec=['-c:a','libmp3lame','-b:a','160k','-ac','2'])
(Q/'mix-normalization.json').write_text(json.dumps(mix,indent=2))
for name in ['music','sfx']:
 src=P/'assets'/f'{name}.mp3';tmp=WORK/f'{name}-compact.mp3'
 run(['-i',str(src),'-c:a','libmp3lame','-b:a','96k',str(tmp)]);tmp.replace(src)
print('Balanced voice and final stereo mix complete',flush=True)
