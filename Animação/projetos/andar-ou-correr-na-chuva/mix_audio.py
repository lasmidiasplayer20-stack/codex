"""Mix the supplied narration with original Python-generated rain and foley."""
from pathlib import Path
import json,subprocess,wave
import numpy as np
ROOT=Path(__file__).resolve().parent;SR=48000;DUR=480.024
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(ROOT/'references/input-3'),'-ar',str(SR),'-ac','1','-f','f32le','pipe:1'])
voice=np.frombuffer(raw,dtype='<f4').copy();n=len(voice);mix=np.column_stack((voice,voice)).astype(np.float32);events=[]
rng=np.random.default_rng(20261024)
# Soft rain ambience: fresh, deterministic colored noise, smoothly ducked below speech.
noise=rng.normal(0,1,n).astype(np.float32)
# Simple finite impulse response filter, no external audio samples.
colored=np.convolve(noise,np.array([.1,.2,.4,.2,.1],np.float32),mode='same')
t=np.arange(n,dtype=np.float32)/SR
amb=(.0035+.001*np.sin(t*.31))*colored
shots=json.loads((ROOT/'storyboard.json').read_text())
env=np.full(n,.15,np.float32)
for s in shots:
 if s['scene'] in ['street','arrival','wind','puddle']:
  a,b=int(s['start']*SR),min(n,int(s['end']*SR));env[a:b]=1
# Half-second crossfades at all scene boundaries prevent ambience clicks.
for s in shots[1:]:
 k=int(s['start']*SR);w=min(SR//2,k,n-k)
 if w>0:env[k-w:k+w]=np.linspace(env[k-w],env[min(n-1,k+w)],2*w)
amb*=env*np.minimum(1,t/2)*np.minimum(1,(n/SR-t)/2)
mix[:,0]+=amb;mix[:,1]+=np.roll(amb,113)

def add(name,time,gain=.09,pan=0):
 with wave.open(str(ROOT/'audio'/f'{name}.wav')) as f:
  data=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).astype(np.float32)/32768
 a=round(time*SR);b=min(n,a+len(data))
 if a<0 or a>=n:return
 data=data[:b-a]*gain;data[:,0]*=min(1,1-pan);data[:,1]*=min(1,1+pan);mix[a:b]+=data
 events.append({'time':time,'effect':name,'gain':gain,'pan':pan})
for i,s in enumerate(shots):
 if i and s['start']<474:add('whoosh',s['start'],.065,(-1 if i%2 else 1)*.2)
 if s['scene'] in ['conditions','block','summary','fabric','measure']:
  add('pop',s['start']+.4,.13)
 if s['scene']=='puddle':add('impact',s['start']+1,.05)
 if s['scene']=='answer':add('chime',s['start']+.5,.11)
 if s['scene'] in ['street','arrival'] and (s.get('action') in ['walk','run'] or s.get('two')):
  # Match audible contacts to the authored gait phase, rather than free-running taps.
  running=s.get('action')=='run' or s.get('two')
  cycle_hz=2.5 if running else 1.25
  contact_period=1/(2*cycle_hz)
  first=np.ceil((s['start']+.2)/contact_period)*contact_period
  stop=s['start']+.83*(s['end']-s['start']) if s['scene']=='arrival' else s['end']-.2
  for j,tt in enumerate(np.arange(first,stop,contact_period)):
   if running and j%2:continue
   add('click',float(tt),.04)
# Prevent clipping, preserve original timing and speech.
peak=float(np.max(np.abs(mix)));scale=min(1,.88/max(peak,1e-9));mix*=scale
with wave.open(str(ROOT/'audio/mix.wav'),'wb') as f:
 f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((mix*32767).astype('<i2').tobytes())
report={'duration':n/SR,'sample_rate':SR,'source':'Supplied narration, original NumPy effects and colored-noise rain','peak_before_scaling':peak,'global_scale':scale,'events':events,'human_listening_performed':False}
(ROOT/'audio/mix-report.json').write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='events'}));print('Sound cues:',len(events))
