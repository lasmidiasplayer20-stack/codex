"""Original deterministic stereo score and spatial foley, composed for seven continuous chapters."""
import json,subprocess,wave
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=210
rng=np.random.default_rng(2026101506);mix=np.zeros((SR*DURATION,2),np.float32)
eleven_count=0
meta=json.loads((ROOT/'qa/story.json').read_text())
def put(t,signal,x=800,gain=1):
 start=round(t*SR)
 if start<0:signal=signal[-start:];start=0
 end=min(len(mix),start+len(signal))
 if end<=start:return
 pan=np.clip((x-800)/950,-.85,.85);g=np.array([np.cos((pan+1)*np.pi/4),np.sin((pan+1)*np.pi/4)],np.float32)
 mix[start:end]+=signal[:end-start,None]*g*gain

def tone(freq,d=.5,kind='pluck'):
 t=np.arange(round(d*SR),dtype=np.float32)/SR
 if kind=='bell':sig=np.sin(2*np.pi*freq*t)*np.exp(-t*4)+.3*np.sin(2*np.pi*freq*2.76*t)*np.exp(-t*8)
 elif kind=='bass':sig=np.sin(2*np.pi*freq*t)+.16*np.sin(2*np.pi*freq*2*t)
 elif kind=='pad':sig=np.sin(2*np.pi*freq*t)+.2*np.sin(2*np.pi*freq*1.002*t)+.14*np.sin(2*np.pi*freq*2*t)
 else:sig=np.sin(2*np.pi*freq*t)+.25*np.sin(2*np.pi*freq*2*t)*np.exp(-t*15)
 env=(1-np.exp(-t*(12 if kind=='pad' else 250)))*np.exp(-t*(1.1 if kind=='pad' else 5 if kind=='pluck' else 2))
 env*=np.minimum(1,(d-t)*30)
 return (sig*env).astype(np.float32)
# Distinct rhythm/orchestration for each mechanical challenge. Quiet pockets preserve gags.
roots=[146.832,164.814,130.813,174.614,146.832,164.814,195.998];bpms=[110,118,124,126,88,124,108];scale=[0,3,7,10,12,10,7,3]
for ch in range(7):
 beat=60/bpms[ch];start=ch*30
 for i,t in enumerate(np.arange(0,29.85,beat/2)):
  absolute=start+float(t)
  if ch==6 and 21.5<t<23:continue
  freq=roots[ch]*2**(scale[(i//2+ch)%len(scale)]/12)
  put(absolute,tone(freq*(2 if i%4 else 1),.46,'bell' if ch==4 else 'pluck'),450+(i%7)*120,.026 if ch!=4 else .035)
  if i%4==0:
   put(absolute,tone(roots[ch]/2,.75,'bass'),800,.055)
   if ch!=4:
    n=round(.18*SR);tt=np.arange(n)/SR;phase=2*np.pi*(47*tt+35*.035*(1-np.exp(-tt/.035)));put(absolute,(np.sin(phase)*np.exp(-tt*27)).astype(np.float32),800,.07)
  if i%4==2 and ch not in [0,4]:
   tt=np.arange(round(.11*SR))/SR;noise=rng.normal(0,1,len(tt));noise=np.r_[0,np.diff(noise)];put(absolute,(noise*np.exp(-tt*45)).astype(np.float32),980,.009)
 for bar in np.arange(0,30,beat*4):
  for semitone in [0,7,12]:put(start+bar,tone(roots[ch]*2**(semitone/12),min(beat*4,30-bar),'pad'),300+semitone*75,.012)
# Low laboratory room tone, slowly animated in stereo.
t=np.arange(len(mix),dtype=np.float32)/SR
for side in range(2):mix[:,side]+=.002*(np.sin(t*2*np.pi*52+side*.2)+.22*np.sin(t*2*np.pi*104))*(.7+.3*np.sin(t*.18+side))
# Event sound design. Pans follow the object; pitched motifs distinguish actions.
for e in meta['events']:
 typ=e['type'];external={'switch':'button','gravity':'gravity','bounce':'bonk','whoosh':'whoosh','rope':'rope','metal':'crack','resolve':'chime','chime':'chime'}.get(typ);asset=ROOT.parent/'O-botao-proibido/audio'/str(external or '')
 if external and asset.with_suffix('.mp3').exists():
  eleven_count+=1;raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(asset.with_suffix('.mp3')),'-ac','1','-ar',str(SR),'-f','f32le','pipe:1']);sig=np.frombuffer(raw,dtype='<f4').copy();sig/=max(.2,float(np.max(np.abs(sig))));put(e['t'],sig,e['x'],.18*e.get('power',1));continue
 dur={'step':.09,'bounce':.32,'land':.28,'pulse':1.2,'gravity':1.5,'spring':.8,'charge':1.4,'resolve':2.2,'bridge':1.5}.get(typ,.5)
 tt=np.arange(round(dur*SR),dtype=np.float32)/SR;noise=rng.normal(0,1,len(tt)).astype(np.float32);x=e['x'];sig=np.zeros(len(tt),np.float32);gain=.13
 if typ=='step':
  sig=noise*np.exp(-tt*80)*.3+np.sin(2*np.pi*(95+30*e['power'])*tt)*np.exp(-tt*70);gain=.035*e['power']
 elif typ in ['land','heavy','bonk','punch']:
  sig=.65*np.sin(2*np.pi*(85*tt+2*(1-np.exp(-tt*20))))*np.exp(-tt*19)+noise*.2*np.exp(-tt*45);gain=.2 if typ=='heavy' else .15
 elif typ in ['bounce','spring']:
  phase=2*np.pi*(160*tt+90*(1-np.exp(-tt*12))/12);sig=np.sin(phase)*np.exp(-tt*(8 if typ=='bounce' else 4))+.25*np.sin(phase*2.07)*np.exp(-tt*16)
 elif typ in ['pulse','gravity','charge']:
  phase=2*np.pi*(65*tt+180*tt*tt);sig=(np.sin(phase)+.25*np.sin(phase*1.5))*np.exp(-tt*3)*(1-np.exp(-tt*30));sig+=noise*.08*np.exp(-tt*4);gain=.12
 elif typ in ['switch','mechanism','bridge','roll','motor','ratchet']:
  sig=noise*.11*np.exp(-tt*4)*(np.sin(tt*2*np.pi*37)**8)+np.sin(tt*2*np.pi*130)*np.exp(-tt*9)*.35
  for f in [380,690,1060]:sig+=.12*np.sin(tt*2*np.pi*f)*np.exp(-tt*18)
  gain=.12
 elif typ=='unused-quack':
  phase=2*np.pi*(260*tt-160*tt*tt);sig=np.sin(phase)+.55*np.sin(phase*3)+.28*np.sin(phase*5);sig*=np.exp(-tt*12)*(1-np.exp(-tt*180));gain=.09
 elif typ=='sneeze':sig=noise*np.exp(-tt*12)*(1-np.exp(-tt*100))+.18*np.sin(tt*2*np.pi*240)*np.exp(-tt*18);gain=.19
 elif typ=='squeak':sig=np.sin(2*np.pi*(700*tt+260*tt*tt))*np.exp(-tt*9);gain=.065
 elif typ=='multiball':
  for f in [660,880,1100]:sig+=.25*np.sin(2*np.pi*f*tt)*np.exp(-tt*8)
  gain=.14
 elif typ=='whoosh':sig=noise*.3*(np.sin(np.pi*tt/dur)**2);gain=.08
 else:
  for f in [523.25,659.25,783.99] if typ=='resolve' else [784,1174.66]:sig+=np.sin(2*np.pi*f*tt)*np.exp(-tt*4)*.32
  gain=.1
 sig*=np.minimum(1,(dur-tt)*60);put(e['t'],sig,x,gain)
# Persistent mechanisms follow their activation windows, rather than chapter cuts.
for lo,hi,base,gain in [(25,71,110,.009),(108,181,143,.012)]:
 tt=np.arange(round((hi-lo)*SR),dtype=np.float32)/SR
 env=np.minimum(1,tt/.4)*np.minimum(1,(hi-lo-tt)/.7)
 sig=(np.sin(tt*2*np.pi*base)+.3*np.sin(tt*2*np.pi*base*2.01))*(.8+.2*np.sin(tt*8))*env
 put(lo,sig.astype(np.float32),1000,gain)
# Reverberation is short enough to retain precision of contact transients.
for delay,gain in [(.047,.1),(.093,.065),(.151,.035)]:
 n=round(delay*SR);mix[n:]+=mix[:-n,::-1]*gain
# Comic silence before the last bonk; preserve attack at 146.4 s.
for a,b in [(201.5,202.7)]:
 lo,hi=round(a*SR),round(b*SR);mix[lo:hi]*=.08
mix*=np.minimum(1,t/.12)[:,None];mix*=np.minimum(1,(DURATION-t)/.65)[:,None]
peak=float(np.max(np.abs(mix)));mix*=min(1,.87/max(peak,1e-8));out=Path('/workspace/animation-production-r2/audio-master.wav');out.parent.mkdir(parents=True,exist_ok=True);(ROOT/'audio').mkdir(exist_ok=True)
with wave.open(str(out),'wb') as f:f.setparams((2,2,SR,0,'NONE','not compressed'));f.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',str(out),'-af','loudnorm=I=-17:TP=-1.8:LRA=9','-ar','48000','-c:a','aac','-b:a','256k',str(ROOT/'audio/trilha-original.m4a')],check=True)
# Render uses exactly the mastered continuous AAC as the source, decoded once to PCM.
subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/'audio/trilha-original.m4a'),'-t','210','-c:a','pcm_s16le',str(Path('/workspace/animation-production-r2/audio-master-decoded.wav'))],check=True)
print(json.dumps({'duration':210,'sample_rate':SR,'channels':2,'events':len(meta['events']),'seed':2026101506,'raw_peak':peak,'score':'seven original instrumental chapters plus spatial event foley'}))

(ROOT/'audio/generation.json').write_text(json.dumps({'duration':210,'events':len(meta['events']),'effectsFromElevenLabs':eleven_count,'networkBlocker':None if eleven_count else 'HTTPS proxy returned 403 before authentication','source':'Score and event synthesis adapted from Animation vs. Physics V6; new 210s cues and section pacing.'},indent=2))
