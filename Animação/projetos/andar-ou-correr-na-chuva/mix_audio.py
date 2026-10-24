"""R2 sound design: original narration, contact-driven wet steps and procedural tension."""
from pathlib import Path
import json,subprocess,wave
import numpy as np
ROOT=Path(__file__).resolve().parent;SR=48000
voice=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(ROOT/'references/input-3'),'-ar',str(SR),'-ac','1','-f','f32le','pipe:1']),dtype='<f4').copy()
n=len(voice);rng=np.random.default_rng(20261025);mix=np.column_stack((voice,voice)).astype(np.float32);events=[]
shots=json.loads((ROOT/'storyboard.json').read_text());contacts=json.loads((ROOT/'audio/contatos-v2.json').read_text())
# Short-window speech energy ducks atmosphere, preserving the original voice timing.
block=2400;levels=np.array([np.sqrt(np.mean(voice[i:i+block]**2)) for i in range(0,n,block)],np.float32)
duck=np.repeat(np.clip(1/(1+levels*9),.45,1),block)[:n]
noise=rng.normal(0,1,n).astype(np.float32);rain=np.convolve(noise,np.array([.12,.22,.32,.22,.12],np.float32),'same')
envelope=np.full(n,.20,np.float32)
for s in shots:
 if s['scene'] in ['street','arrival','wind','puddle']:
  a,b=round(s['start']*SR),min(n,round(s['end']*SR));envelope[a:b]=1
for s in shots[1:]:
 k=round(s['start']*SR);w=min(SR//5,k,n-k)
 if w>0:envelope[k-w:k+w]=np.linspace(envelope[k-w],envelope[min(n-1,k+w)],2*w)
t=np.arange(n,dtype=np.float32)/SR;amb=rain*.015*duck*envelope*np.minimum(1,t)*np.minimum(1,(n/SR-t)/1.2)
mix[:,0]+=amb;mix[:,1]+=np.roll(amb,137)
def put(time,signal,gain=1,pan=0,kind='effect'):
 a=round(time*SR);b=min(n,a+len(signal))
 if a<0 or a>=n:return
 data=np.asarray(signal[:b-a],np.float32)*gain
 fade=min(240,len(data)//4)
 if fade:data[:fade]*=np.linspace(0,1,fade);data[-fade:]*=np.linspace(1,0,fade)
 mix[a:b,0]+=data*min(1,1-pan);mix[a:b,1]+=data*min(1,1+pan)
 events.append({'time':round(time,4),'kind':kind,'gain':gain,'pan':pan})
def asset(name,time,gain,pan=0):
 with wave.open(str(ROOT/'audio'/f'{name}.wav')) as f:data=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).astype(np.float32).mean(axis=1)/32768
 put(time,data,gain,pan,name)
for c in contacts:
 d=.15;tt=np.arange(round(d*SR))/SR
 signal=(.8*np.sin(2*np.pi*(92*tt+18*tt*tt))*np.exp(-tt*48)+rng.normal(0,.42,len(tt))*np.exp(-tt*32))
 put(c['time'],signal,.048 if c['gait']=='run' else .032,c['pan'],'wet_step')
 if c['gait']=='run':put(c['time']+.012,rng.normal(0,1,round(.17*SR))*np.exp(-np.arange(round(.17*SR))/SR*26),.017,c['pan'],'foot_spray')
for s in shots:
 if s['start'] and s['start']<474:asset('whoosh',s['start'],.06)
 if s['scene'] in ['conditions','block','summary','fabric','measure']:asset('pop',s['start']+.24,.12)
 urgent=s['scene'] in ['street','arrival'] and (s.get('action')=='run' or s.get('two'))
 if s['scene'] in ['street','arrival']:
  cadence=2.2 if urgent else 2.9
  for cut in np.arange(s['start']+cadence,s['end']-.2,cadence):asset('whoosh',float(cut),.035)
 if urgent or s['scene']=='caution':
  for at in np.arange(s['start']+.4,s['end']-.3,.92):
   tt=np.arange(round(.32*SR))/SR;sig=np.sin(2*np.pi*(49*tt+8*tt*tt))*np.exp(-tt*16)
   put(float(at),sig,.015,0,'tension_pulse')
  asset('riser',max(0,s['start']-.65),.055)
 if s['scene']=='answer':asset('chime',s['start']+.35,.10)
for flash in [6.8,258.3,433]:
 tt=np.arange(round(.9*SR))/SR;low=np.convolve(rng.normal(0,1,len(tt)),np.ones(75)/75,'same');sig=(low+.18*np.sin(2*np.pi*43*tt))*np.exp(-tt*5)
 put(flash+.22,sig,.10,0,'storm_rumble')
# Peak safety includes the original voice and every effect, with no timing changes.
peak=float(np.max(np.abs(mix)));scale=min(1,.89/max(peak,1e-8));mix*=scale
with wave.open(str(ROOT/'audio/mix.wav'),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((mix*32767).astype('<i2').tobytes())
report={'revision':2,'duration':n/SR,'sample_rate':SR,'peak_before_scaling':peak,'global_scale':scale,'contact_events':len(contacts),'sound_events':len(events),'source':'Original narration; NumPy rain, wet steps, spray, tension and synthesized effects','human_listening_performed':False,'events':events}
(ROOT/'audio/mix-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print({k:v for k,v in report.items() if k!='events'})
