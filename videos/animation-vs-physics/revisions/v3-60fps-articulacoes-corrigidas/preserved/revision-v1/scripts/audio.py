"""Original deterministic procedural score and synchronized non-vocal sound effects."""
import argparse,json,wave
from pathlib import Path
import numpy as np
p=argparse.ArgumentParser();p.add_argument('--events',required=True,type=Path);p.add_argument('--duration',type=float,default=125);p.add_argument('--output',type=Path,default=Path('exports/audio.wav'));a=p.parse_args();rate=48000;mix=np.zeros((round(a.duration*rate),2),np.float64);rng=np.random.default_rng(20261015)
def put(start,sound,gain=.2,pan=0):
 i=round(start*rate)
 if i>=len(mix):return
 sound=np.asarray(sound);j=max(0,i);k=min(len(mix),i+len(sound));sound=sound[j-i:k-i]*gain;mix[j:k,0]+=sound*np.sqrt((1-pan)/2);mix[j:k,1]+=sound*np.sqrt((1+pan)/2)
def tone(start,dur,f1,f2=None,gain=.2,decay=5,pan=0):
 t=np.arange(round(dur*rate))/rate;f2=f2 or f1;phase=2*np.pi*(f1*t+(f2-f1)*t*t/(2*dur));env=(1-np.exp(-t*150))*np.exp(-decay*t/dur)*np.minimum(1,(dur-t)*100);s=(np.sin(phase)+.2*np.sin(phase*2))*.8*env;put(start,s,gain,pan)
def thump(t,gain=.2):
 q=np.arange(round(.13*rate))/rate;noise=np.convolve(rng.standard_normal(len(q)),np.ones(9)/9,'same')*np.exp(-q*45);put(t,noise,gain);tone(t,.2,105,42,gain*.8,6)
data=json.loads(a.events.read_text());events=data.get('events',data)
for e in events:
 t=e['t'];typ=e['type']
 if typ=='footstep':thump(t,.11)
 elif typ=='orb-drop':tone(t,.95,1500,280,.06,1)
 elif typ=='orb-impact':tone(t,.3,400,130,.17,5);thump(t,.08)
 elif typ in ['blue-pulse','purple-pulse','green-pulse','chaos-wave']:tone(t,.7,110,950,.16,4);tone(t,.9,330,660,.07,3)
 elif typ in ['kick','double-kick']:thump(t,.35);tone(t,.4,240,70,.13,5)
 elif typ=='apple-impact':thump(t,.09)
 elif typ in ['character-impact','cube-impact','apple-hit']:thump(t,.22);tone(t,.35,180,75,.15,5)
 elif typ in ['red-flash','inverted-push','discovery','particle-touch']:tone(t,.4,740,1480,.12,5)
 elif typ=='decisive-collision':thump(t,.65);tone(t,1.8,65,25,.34,4)
# Sparse instrumental motifs; silence is retained where directed by the script.
notes=[146.832,174.614,220,261.626,220,174.614,164.814,220]
decisive=next((e['t'] for e in events if e['type']=='decisive-collision'),112.4)
for i,t in enumerate(np.arange(11.5,min(a.duration,decisive),.6)):
 gain=.022 if t<30 else .035 if t<75 else .048
 tone(float(t),.85,notes[i%len(notes)]*(2 if i%4==3 else 1),gain=gain,decay=5,pan=.2*np.sin(i))
 if i%4==0:tone(float(t),2.2,73.416,gain=gain*.6,decay=2)
# Low-pass and sparse bass beats make the time dilation audible.
for beat in [95,97.5,100,102.5]:tone(beat,1.5,55,42,.06,3)
lo,hi=round(95*rate),min(len(mix),round(105*rate))
if hi>lo:
 segment=mix[lo:hi];n=129;pad=np.pad(segment,((n//2,n//2),(0,0)),mode='edge');acc=np.vstack([np.zeros((1,2)),np.cumsum(pad,axis=0)]);mix[lo:hi]=(acc[n:]-acc[:-n])/n
for begin,end in [(4.2,5),(102.45,103.1),(decisive+1.9,115.45),(124.85,125)]:
 lo,hi=max(0,round(begin*rate)),min(len(mix),round(end*rate));mix[lo:hi]=0
peak=float(np.max(np.abs(mix)));mix*=min(1,.92/max(peak,1e-9));audio=(mix*32767).astype('<i2');a.output.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(a.output),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(rate);f.writeframes(audio.tobytes())
a.output.with_suffix('.json').write_text(json.dumps({'duration':a.duration,'sample_rate':rate,'channels':2,'source':'Original procedural instruments and effects, fixed seed 20261015','voices':False,'peak_before_normalization':peak},indent=2)+'\n');print(json.dumps({'file':str(a.output),'duration':a.duration,'samples':len(audio)}))
