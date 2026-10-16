"""Original adaptive synth score, authored foley and optional ElevenLabs effects.
No audio from the older reference animation is used. Requires NumPy + FFmpeg.
"""
import argparse,json,math,subprocess,wave
from pathlib import Path
import numpy as np
p=argparse.ArgumentParser();p.add_argument('--work',type=Path,default=Path('/workspace/animation-production'));args=p.parse_args();args.work.mkdir(parents=True,exist_ok=True)
ROOT=Path(__file__).parent;SR=44100;D=210;rng=np.random.default_rng(20261016)
score=np.zeros((SR*D,2),np.float32);foley=np.zeros_like(score);ledger=[]
def add(arr,a,start,gain=1,pan=0):
 i=round(start*SR);a=np.asarray(a,dtype=np.float32);left=math.sqrt((1-pan)/2);right=math.sqrt((1+pan)/2)
 if i<0:a=a[-i:];i=0
 n=min(len(a),len(arr)-i)
 if n<=0:return
 arr[i:i+n,0]+=a[:n]*gain*left;arr[i:i+n,1]+=a[:n]*gain*right

def hz(m):return 440*2**((m-69)/12)
def tone(m,d,kind='bell'):
 t=np.arange(round(SR*d),dtype=np.float32)/SR;f=hz(m);attack=np.minimum(t/.009,1);release=np.minimum((d-t)/.06,1)
 if kind=='bell': y=(np.sin(2*np.pi*f*t+1.3*np.sin(2*np.pi*f*2.01*t)*np.exp(-t*7))+.16*np.sin(2*np.pi*f*3*t))*np.exp(-t*4.4)
 elif kind=='bass': y=(np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2*t)+.1*np.sin(2*np.pi*f*3*t))*np.exp(-t*2.4)
 elif kind=='pad': y=(np.sin(2*np.pi*f*t+.035*np.sin(t*6))+.36*np.sin(2*np.pi*f*2*t)+.15*np.sin(2*np.pi*f*3*t))*np.minimum(t/.7,1)*np.minimum((d-t)/.8,1)
 elif kind=='lead': y=(np.sin(2*np.pi*f*t+.2*np.sin(2*np.pi*f*2*t))+.15*np.sin(2*np.pi*f*3*t))*np.exp(-t*2)
 else:y=np.sin(2*np.pi*f*t)*np.exp(-t*3)
 return (y*attack*release).astype(np.float32)
def kick():
 t=np.arange(int(SR*.45))/SR;return np.sin(2*np.pi*(42*t+85*.04*(1-np.exp(-t/.04))))*np.exp(-t*12)+rng.normal(0,.12,len(t))*np.exp(-t*120)
def snare():
 t=np.arange(int(SR*.2))/SR;n=rng.normal(0,1,len(t));n=np.concatenate(([0],np.diff(n)));return (n*.22+np.sin(2*np.pi*180*t)*.18)*np.exp(-t*23)
def hat():
 t=np.arange(int(SR*.075))/SR;return rng.normal(0,.2,len(t))*np.exp(-t*70)
K,S,H=kick(),snare(),hat()
sections=[(0,24,112,'play'),(24,63,132,'chase'),(63,89,144,'chase'),(89,117,126,'danger'),(117,146,76,'drama'),(146,169,132,'hope'),(169,187,144,'climax'),(187,203,112,'play'),(203,210,132,'final')]
chords_minor=[[50,57,62,65],[46,53,58,62],[53,60,65,69],[48,55,60,64]];chords_major=[[50,57,62,66],[47,54,59,62],[43,55,59,62],[45,57,61,64]]
for start,end,bpm,style in sections:
 beat=60/bpm;bars=math.ceil((end-start)/(beat*4));chords=chords_major if style in ('hope','climax','final') else chords_minor
 for bar in range(bars):
  at=start+bar*beat*4;chord=chords[bar%4];dur=min(beat*4+.15,end-at)
  if dur<=0:continue
  for j,m in enumerate(chord):add(score,tone(m+12,dur,'pad'),at,.025 if style=='drama' else .018,(-.65+j*.4))
  for k in range(4):
   tm=at+k*beat
   if tm>=end:continue
   if style!='drama':
    add(score,K,tm,.13 if k%2==0 else .06,0);add(score,H,tm+beat*.5,.055,(-1)**k*.5)
    if k%2:add(score,S,tm,.105,.1)
    add(score,tone(chord[0]-(12 if chord[0]>48 else 0),beat*.8,'bass'),tm,.105)
   else:
    if k==0:add(score,K,tm,.07);add(score,K,tm+.22,.04)
    if k%2==0:add(score,tone(chord[k]+12,1.8,'bell'),tm,.045,(-1)**k*.3)
   if style in ('chase','hope','climax','final'):
    for half in range(2):
     n=chord[(k+half+bar)%4]+24;add(score,tone(n,beat*.8,'bell'),tm+half*beat*.5,.045,math.sin((k+half)*2)*.6)
   if style=='play':
    motif=[12,19,15,14,17,15,19,12];note=62+motif[(bar*4+k)%8]-12;add(score,tone(note+12,beat*.8,'bell'),tm+(.08 if k%2 else 0),.075,math.sin(k)*.35)
   elif style=='danger':
    add(score,tone(chord[0],beat*.6,'bass'),tm+beat*.5,.06);add(score,tone(74+(k%2),beat*.5,'lead'),tm,.025,-.3)
  if style in ('hope','climax') and bar%2==0:
   for k,m in enumerate([74,78,81,85,83,81,78,76]):
    tm=at+k*beat*.5
    if tm<end:add(score,tone(m,beat*.8,'lead'),tm,.04,.15)
 ledger.append({'layer':'original_score','start':start,'end':end,'bpm':bpm,'style':style})
# Controlled drama: a short low-level gap before Pip arrives, then rebuilding hope.
for a,b,gain in [(124,132,.55),(132,139,.8),(139,146,1.2),(185.2,186.2,.5),(201,203,.6)]:
 i,j=int(a*SR),int(b*SR);score[i:j]*=gain
# Newly synthesized foley supplements generated cinematic effects.
def synth(kind,d=1):
 t=np.arange(round(d*SR),dtype=np.float32)/SR;n=rng.normal(0,1,len(t));env=np.minimum(t/.01,1)*np.minimum((d-t)/.05,1)
 if kind in ('button','beep','chime'):
  if kind=='button':y=n*.18*np.exp(-t*70)+np.sin(2*np.pi*(420*t+180*t*t))*np.exp(-t*13)
  elif kind=='beep':y=np.sin(2*np.pi*880*t)*np.exp(-t*13)
  else:y=sum(np.sin(2*np.pi*f*t)*np.exp(-t*(1+i*.3)) for i,f in enumerate([523.25,659.25,783.99,1046.5]))*.23
 elif kind=='gravity':y=(np.sin(2*np.pi*(50*t+95*t*t))+n*.1)*np.sin(np.pi*np.minimum(t/d,1))**2*.4
 elif kind in ('whoosh','jump'):y=n*.25*np.sin(np.pi*t/d)**3+np.sin(2*np.pi*(250*t+220*t*t))*np.sin(np.pi*t/d)*.18
 elif kind in ('land','bonk','crack'):y=(n*.28+np.sin(2*np.pi*(110*t-27*t*t))*.7)*np.exp(-t*14)
 elif kind in ('rope','creak'):y=np.sin(2*np.pi*(210*t+35*np.sin(t*8)))**3*.24*np.exp(-t*2)+n*.03
 elif kind=='alarm':y=(np.sin(2*np.pi*(480*t+20*np.sin(t*7)))+.3*np.sin(2*np.pi*960*t))*.2*(np.sin(t*12)>0)
 elif kind=='drone':y=(np.sin(2*np.pi*120*t)+.3*np.sin(2*np.pi*245*t))*.14
 else:y=n*.1*np.exp(-t*20)
 return y*env
story=json.loads((ROOT/'storyboard.json').read_text());durations={'button':.45,'gravity':3.8,'bonk':.8,'whoosh':1.3,'jump':.6,'rope':1.8,'alarm':3,'crack':1,'drone':3,'chime':3,'land':.4,'beep':.25,'creak':2}
for event in story['events']:
 kind=event['type'];path=ROOT/'audio'/(kind+'.mp3');d=durations.get(kind,1)
 if path.exists():
  raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-ac','1','-ar',str(SR),'-f','f32le','pipe:1']);sound=np.frombuffer(raw,dtype='<f4').copy();sound/=max(.2,float(np.max(np.abs(sound))));source='ElevenLabs Text to Sound v2'
 else:sound=synth(kind,d);source='original procedural foley'
 pan=.3 if event['t'] in (24,107,203) else math.sin(event['t'])*.22
 add(foley,sound,event['t'],event['gain']*.22,pan);ledger.append({**event,'source':source})
# Footfalls are timed from authored walk/run paths and alternation, not a continuous loop.
for shot in story['shots']:
 for ci,name in enumerate(['orange','teal']):
  keys=shot[name]
  for a,b in zip(keys,keys[1:]):
   if a['pose'] not in ('run','walk','sneak'):continue
   length=b['t']-a['t'];distance=abs(b['x']-a['x']);steps=max(0,round(distance/(53 if a['pose']=='run' else 41)))
   for k in range(steps):
    at=shot['start']+a['t']+(k+.5)/steps*length
    add(foley,synth('land',.15),at,.055 if a['pose']=='run' else .035,(-.3 if ci else .3));ledger.append({'t':at,'type':'footstep','source':'original procedural foley'})
# Quiet room tone, stereo mechanical air, and deliberate scene transitions.
t=np.arange(SR*D,dtype=np.float32)/SR
amb=.002*np.sin(2*np.pi*48*t)+.0015*np.sin(2*np.pi*72*t)
score[:,0]+=amb;score[:,1]+=amb
mix=score+foley
fade=np.minimum(t/.6,1)*np.minimum((D-t)/1,1);mix*=fade[:,None]
peak=float(np.max(np.abs(mix)));mix*=.86/max(peak,.86)
raw=args.work/'mix-premaster.wav'
with wave.open(str(raw),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(mix,-1,1)*32767).astype('<i2').tobytes())
# FFmpeg loudness normalization + a true peak ceiling, stereo AAC delivery.
subprocess.run(['ffmpeg','-v','error','-y','-i',str(raw),'-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ar','48000','-c:a','aac','-b:a','256k',str(ROOT/'audio/trilha-original.m4a')],check=True)
(ROOT/'audio/cue-sheet.json').write_text(json.dumps({'duration':D,'originalScore':True,'referenceAudioUsed':False,'effectsFromElevenLabs':sum(x.get('source','').startswith('Eleven') for x in ledger),'events':ledger},ensure_ascii=False,indent=2))
print(json.dumps({'audio':str(ROOT/'audio/trilha-original.m4a'),'duration':D,'peakBeforeMaster':peak,'effectsFromElevenLabs':sum(x.get('source','').startswith('Eleven') for x in ledger),'events':len(ledger)}))
