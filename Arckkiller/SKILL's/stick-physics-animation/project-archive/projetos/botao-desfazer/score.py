"""Original music, spatial Foley and a continuous 210-second stereo master.
Uses ElevenLabs assets when available; explicitly records synthetic fallback.
"""
from pathlib import Path
import json, subprocess, wave
import numpy as np
ROOT=Path(__file__).resolve().parent;SR=48000;DURATION=210;N=SR*DURATION
rng=np.random.default_rng(63806)
music=np.zeros((N,2),np.float32);foley=np.zeros_like(music)
def add(dest,signal,t,gain=1,pan=0):
 start=round(t*SR)
 if start>=N:return
 if start<0:signal=signal[-start:];start=0
 count=min(len(signal),N-start)
 if count<=0:return
 if signal.ndim==1:
  p=(np.clip(pan,-1,1)+1)*np.pi/4
  dest[start:start+count,0]+=signal[:count]*gain*np.cos(p)
  dest[start:start+count,1]+=signal[:count]*gain*np.sin(p)
 else:dest[start:start+count]+=signal[:count]*gain
def note(midi,duration=.3,kind='pluck'):
 t=np.arange(round(duration*SR))/SR;f=440*2**((midi-69)/12)
 if kind=='bass':y=np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*2*t);env=np.minimum(t/.008,1)*np.exp(-t*5)
 elif kind=='pad':y=(np.sin(2*np.pi*f*t)+.2*np.sin(2*np.pi*f*2.003*t));env=np.sin(np.pi*t/duration)**2
 else:y=np.sin(2*np.pi*f*t)+.32*np.sin(2*np.pi*f*2.01*t)+.12*np.sin(2*np.pi*f*3.98*t);env=np.minimum(t/.004,1)*np.exp(-t*(7 if kind=='pluck' else 12))
 return (y*env).astype(np.float32)
# A composed 8-bar motif, varied by chapter and orchestration.
motifs=[[0,4,7,12,9,7,4,2,0,2,4,7,11,9,7,4],[7,9,12,7,4,2,0,4,5,9,12,9,7,5,4,2],[0,7,4,12,2,9,5,14,4,11,7,16,5,12,9,7]]
roots=[48,53,57,55,48,53,50,55]
for beat in np.arange(0,DURATION*2,.5):
 t=beat*.5
 if t>=DURATION:break
 ch=min(6,int(t//30));bar=int(beat//4);pos=int(round(beat*2))%8;root=roots[bar%8]+([0,0,2,2,-3,0,0][ch]);dynamic=.55 if 120<t<140 else 1
 if pos in(0,4):add(music,note(root-12,.4,'bass'),t,.09*dynamic,-.12)
 if pos in(2,6):
  for interval in(0,4,7):add(music,note(root+interval,.16),t,.026*dynamic,.2)
 if pos%2==0:
  tt=np.arange(int(.11*SR))/SR;n=rng.normal(0,1,len(tt));hat=(n-np.roll(n,1))*np.exp(-tt*75)
  add(music,hat,t,.009*dynamic,.45 if pos%4 else -.45)
 if ch!=4 or pos in(0,4):
  motif=motifs[(bar//2+ch)%3];pitch=root+12+motif[(int(beat*2)+ch*3)%16]
  add(music,note(pitch,.33,'bell'),t+(0.035 if pos%2 else 0),.045*dynamic,np.sin(t*.2)*.35)
 if pos==0:
  for interval in(0,4,7):add(music,note(root+12+interval,1.8,'pad'),t,.009*dynamic,-.25)
# Room tone and clock tick are deliberately low under the music.
for t in np.arange(.5,185,1):
 tt=np.arange(int(.025*SR))/SR;tick=rng.normal(0,1,len(tt))*np.exp(-tt*250)
 add(foley,tick,t,.009,-.2)
def noise(duration):
 y=rng.normal(0,1,round(duration*SR)).astype(np.float32);return y/3
def effect(kind,duration=.7):
 if kind=='rewind':
  duration=2;t=np.arange(round(duration*SR))/SR;n=noise(duration);env=np.sin(np.pi*t/duration)**.7
  y=.45*n*env+.18*np.sin(2*np.pi*(700*t+850*t*t))*env
  for d in np.arange(.05,1.95,.11):
   start=round(d*SR);tick=noise(.025)*np.exp(-np.arange(round(.025*SR))/SR*180);y[start:start+len(tick)]+=.25*tick[:min(len(tick),len(y)-start)]
  return y.astype(np.float32)
 t=np.arange(round(duration*SR))/SR;n=noise(duration);attack=np.minimum(t/.004,1)
 if kind in('spring','boing','bounce'):f=150+90*np.exp(-t*5)*np.sin(t*21);return (.5*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*6)*attack+.08*n*np.exp(-t*40)).astype(np.float32)
 if kind in('whoosh','cloth','rope','roll'):return (.5*n*np.sin(np.pi*t/duration)**2+(.12*np.sin(2*np.pi*85*t)*np.exp(-t*7) if kind=='rope' else 0)).astype(np.float32)
 if kind in('electric','break','deadclick'):
  f=1800*np.exp(-t*5)+100;env=np.exp(-t*8)*attack;y=.3*np.sin(2*np.pi*np.cumsum(f)/SR)*env+.22*n*np.exp(-t*35)
  return y.astype(np.float32)
 if kind in('chime','celebrate'):
  return (note(84,duration,'bell')*.3+note(88,duration,'bell')*.22+note(91,duration,'bell')*.18+n*np.exp(-t*30)*.14).astype(np.float32)
 if kind in('splat','laugh'):return (n*np.exp(-t*12)*.7+np.sin(2*np.pi*(140*t-80*t*t))*np.exp(-t*9)*.25).astype(np.float32)
 f={'tap':380,'click':1700,'catch':250,'land':80,'clap':600,'crash':105,'clatter':920,'step':180,'motor':120}.get(kind,220)
 return (np.sin(2*np.pi*f*t)*np.exp(-t*18)*.35+n*np.exp(-t*(50 if kind in('step','click') else 18))*.6).astype(np.float32)
data=json.loads((ROOT/'qa/events.json').read_text());usage=[];decoded={}
for event in data['events']+data['steps']:
 kind=event['type'];t=event['t'];duration=2 if kind=='rewind' else 1.5 if kind in('celebrate','rope') else .4 if kind in('step','click','deadclick') else .75
 path=ROOT/'audio/elevenlabs'/f'{kind}.mp3';provider='procedural-synthesis'
 if path.exists():
  
  if str(path) not in decoded:
   raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-ac','1','-ar',str(SR),'-']);decoded[str(path)]=np.frombuffer(raw,dtype='<f4').copy()
  signal=decoded[str(path)];provider='ElevenLabs'
 else:signal=effect(kind,duration)
 pan=float(np.clip((event.get('x',1100)-1100)/1400,-.7,.7));gain=.12 if kind=='step' else .34 if kind in('rewind','crash','break') else .24
 add(foley,signal,t,gain,pan)
 usage.append({'t':t,'type':kind,'provider':provider})
 # Duck music under important visual actions, particularly the reverse effect.
 if kind in('rewind','break','catch','celebrate'):
  lo=round(t*SR);hi=min(N,lo+len(signal));u=np.linspace(0,1,hi-lo);music[lo:hi]*=(1-.6*np.sin(np.pi*u)**.5)[:,None]
# A motor bed explicitly stops with the balloon failure.
t=np.arange(54*SR)/SR;motor=.008*np.sin(2*np.pi*96*t)*(1+.4*np.sin(2*np.pi*3*t))
add(foley,motor,66,1,.25)
# Roomy, short stereo reflections; keep transients aligned with their animation.
delay=int(.085*SR);foley[delay:,1]+=.12*foley[:-delay,0];delay=int(.127*SR);foley[delay:,0]+=.08*foley[:-delay,1]
mix=music+foley
fade=np.ones(N,np.float32);fade[:SR]=np.linspace(0,1,SR);fade[-2*SR:]=np.linspace(1,0,2*SR);mix*=fade[:,None]
peak=float(np.max(np.abs(mix)));mix*=.87/max(peak,.87)
ROOT.joinpath('audio').mkdir(exist_ok=True)
with wave.open(str(ROOT/'audio/master.wav'),'wb')as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(ROOT/'audio/master.wav'),'-af','loudnorm=I=-17:TP=-1.5:LRA=9','-ar','48000','-c:a','aac','-b:a','192k','-y',str(ROOT/'audio/master.m4a')],check=True)
report={'seconds':210,'sample_rate':SR,'channels':2,'original_music':True,'event_count':len(data['events']),'footsteps':len(data['steps']),'generated_elevenlabs_assets':len(list((ROOT/'audio/elevenlabs').glob('*.mp3'))),'events':usage,'no_human_listening_claimed':True}
(ROOT/'qa/audio-production.json').write_text(json.dumps(report,indent=2));print(json.dumps({k:v for k,v in report.items() if k!='events'}))
