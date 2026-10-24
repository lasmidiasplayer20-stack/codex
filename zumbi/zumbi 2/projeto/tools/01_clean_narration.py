from pathlib import Path
import json,math,hashlib,wave
import numpy as np
from scipy.io import wavfile
P=Path(__file__).resolve().parents[1]
WORK=P.parent/'rendered'/'audio-work';WORK.mkdir(parents=True,exist_ok=True)
import argparse
parser=argparse.ArgumentParser();parser.add_argument('input_wav');args=parser.parse_args()
src=Path(args.input_wav)
expected=json.loads((P/'story.json').read_text()).get('narration_source_sha256')
if hashlib.sha256(src.read_bytes()).hexdigest()!=expected:raise SystemExit('This cut list is specific to the original supplied WAV; the SHA-256 does not match.')
with wave.open(str(src),'rb') as w:
 sr=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').copy()
cuts=[
 (330.219729,332.571958,'Spoken scene heading: The power fades'),
 (354.294104,356.643896,'Spoken scene heading: The noise returns'),
 (380.242375,383.059542,'Spoken scene heading: Not leaving anyone behind'),
 (405.501125,407.429667,'Spoken scene heading: On the rooftop'),
]
def mapped(t):return t-sum(max(0,min(t,b)-a) for a,b,_ in cuts)+3
pieces=[];last=0
for st,en,label in cuts:
 b=a[round(last*sr):round(st*sr)].copy()
 n=round(.008*sr)
 if pieces:b[:n]=(b[:n]*np.linspace(0,1,n)).astype(np.int16)
 b[-n:]=(b[-n:]*np.linspace(1,0,n)).astype(np.int16)
 pieces.append(b);last=en
b=a[round(last*sr):].copy();n=round(.008*sr);b[:n]=(b[:n]*np.linspace(0,1,n)).astype(np.int16);pieces.append(b)
voice=np.concatenate([np.zeros(3*sr,dtype=np.int16),*pieces,np.zeros(2*sr,dtype=np.int16)])
D=math.ceil(len(voice)/sr*60)/60
voice=np.pad(voice,(0,round(D*sr)-len(voice)))
wavfile.write(P/'assets/voice.wav',sr,voice)
raw=[0,23.254521,39.148562,58.022458,75.805729,99.736396,121.215417,141.774542,164.951438,184.773917,205.964375,226.136854,246.961875,267.3355,287.149771,307.614354,332.571958,356.643896,383.059542,407.429667,438.250021,456.106229,475.241,490.593687,515.24]
s=json.loads((P/'story.json').read_text())
for i,scene in enumerate(s['scenes']):scene.update(start=round(mapped(raw[i]),6),end=round(mapped(raw[i+1]),6))
s.update(duration=D,fps=60,intro_duration=3,language='en-US',narration_status='user_supplied_cleaned',narration_source_sha256=hashlib.sha256(src.read_bytes()).hexdigest())
(P/'story.json').write_text(json.dumps(s,ensure_ascii=False,indent=2))
(P/'story.js').write_text('(function(r){const S='+json.dumps(s,ensure_ascii=False)+';if(typeof module!=="undefined")module.exports=S;else r.DayTwoStory=S;})(globalThis);')
report={'source_duration':len(a)/sr,'source_sha256':s['narration_source_sha256'],'removed_intervals':[{'source_start':x,'source_end':y,'reason':z} for x,y,z in cuts],'removed_seconds':sum(y-x for x,y,_ in cuts),'intro_seconds':3,'outro_seconds':2,'final_duration':D,'method':'Local Whisper base.en transcription; silence-boundary cuts; 8 ms edge fades. No remote transcription upload.'}
(P.parent/'qa/audio-edit-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
