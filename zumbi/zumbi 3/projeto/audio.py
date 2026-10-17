"""Original deterministic score/Foley. Mix from supplied narration, with ducking."""
from pathlib import Path
import json,re,subprocess,argparse
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter,sosfilt
P=Path(__file__).resolve().parent;S=json.loads((P/'story.json').read_text());D=S['duration'];SR=32000;N=round(D*SR);R=np.random.default_rng(317)
TMP=P.parent/'rendered/audio';TMP.mkdir(parents=True,exist_ok=True);Q=P.parent/'qa'
def ff(args):return subprocess.run(['ffmpeg','-y','-hide_banner',*map(str,args)],check=True,capture_output=True,text=True)
def add(buf,w,start,gain=1,pan=0):
 a=round(start*SR);b=min(N,a+len(w))
 if b<=a:return
 sig=w[:b-a]*gain;buf[a:b,0]+=sig*np.sqrt((1-pan)/2);buf[a:b,1]+=sig*np.sqrt((1+pan)/2)
def note(f,d=5,plucked=False):
 t=np.arange(round(d*SR))/SR;y=np.zeros_like(t)
 for h in range(1,7):y+=np.sin(2*np.pi*f*h*t+.08*h)*(1/h**1.8)*np.exp(-t*(.25+.21*h) if plucked else -t*.06)
 y*= (1-np.exp(-t*(250 if plucked else 2)))*np.minimum(1,np.maximum(0,(d-t)/1.4))
 return y.astype(np.float32)
def export(buf,name,peak=.5,bitrate='64k'):
 # Short cross-channel echoes give depth without smearing speech.
 for delay,g in [(.093,.12),(.171,.08),(.317,.055)]:
  k=round(delay*SR);buf[k:,0]+=buf[:-k,1]*g;buf[k:,1]+=buf[:-k,0]*g
 buf*=peak/max(1e-7,float(abs(buf).max()));buf[:SR]*=np.linspace(0,1,SR)[:,None];buf[-SR*3:]*=np.linspace(1,0,SR*3)[:,None]
 wavfile.write(TMP/(name+'.wav'),SR,buf)
 ff(['-v','error','-i',TMP/(name+'.wav'),'-c:a','libmp3lame','-b:a',bitrate,P/'assets'/f'{name}.mp3'])
 print('Created',name,flush=True)
def music():
 b=np.zeros((N,2),np.float32);chords=[[146.832,174.614,220],[130.813,164.814,195.998],[110,146.832,174.614],[116.541,146.832,184.997]]
 for bar,at in enumerate(np.arange(0,D,8)):
  s=next((s for s in S['scenes'] if s['start']<=at<s['end']),S['scenes'][0]);action=s['kind'] in ['cross','gate','chain','escape'];warm=s['kind'] in ['reunion','shelter','care'];energy=.75 if action else .24 if warm else .4;chord=chords[(bar//2)%4]
  for i,f in enumerate(chord):add(b,note(f,10),at,.04*energy,[-.65,.1,.65][i])
  add(b,note(chord[0]/2,10),at,.055*energy)
  for k in range(4 if not action else 12):
   pos=at+k*(2 if not action else .667);add(b,note(chord[(k+bar)%3]*(2 if warm else 1),3.2,True),pos,.052*energy,.4*np.sin(k+bar))
  if action:
   for k in range(8):
    t=np.arange(round(SR*.45))/SR;kick=np.sin(2*np.pi*(45*t+4*(1-np.exp(-t*20))))*np.exp(-t*12)*(1-np.exp(-t*250));add(b,kick,at+k,.08,0)
    noise=R.normal(0,1,len(t));tick=sosfilt(butter(2,[1600,6000],btype='bandpass',fs=SR,output='sos'),noise)*np.exp(-t*55);add(b,tick,at+k+.5,.022,.2*(-1)**k)
 export(b,'music',.42)
def effects():
 b=np.zeros((N,2),np.float32);events=[]
 def event(kind,at,dur,gain=.08,pan=0):
  dur=min(dur,D-at)
  if dur<=0:return
  t=np.arange(round(dur*SR))/SR;n=R.normal(0,1,len(t));env=np.minimum(1,t*12)*np.minimum(1,(dur-t)*6)
  if kind=='step':w=(sosfilt(butter(2,650,fs=SR,output='sos'),n)*.8+np.sin(2*np.pi*105*t))*np.exp(-t*34)
  elif kind in ['metal','chain']:
   w=sum(np.sin(2*np.pi*f*t)*np.exp(-t*(2+f/1100)) for f in ([191,369,727,1483,2411] if kind=='metal' else [619,989,1903,3119]))*.15+sosfilt(butter(2,[700,5200],btype='bandpass',fs=SR,output='sos'),n)*np.exp(-t*17)*.15
  elif kind=='water':w=sosfilt(butter(2,[120,4200],btype='bandpass',fs=SR,output='sos'),n)*.3*(.85+.15*np.sin(t*3.3))
  elif kind=='radio':w=sosfilt(butter(2,[950,4900],btype='bandpass',fs=SR,output='sos'),n)*.20*(.5+.5*np.sin(t*19)**2)
  elif kind=='siren':w=np.sin(2*np.pi*(590*t-100/(2*np.pi*.6)*np.cos(2*np.pi*.6*t)))*.18
  elif kind=='growl':w=(np.sin(2*np.pi*61*t+1.2*np.sin(t*7))+.3*np.sin(2*np.pi*121*t)+sosfilt(butter(2,700,fs=SR,output='sos'),n))*.15
  elif kind=='squeal':w=sum(np.sin(2*np.pi*f*t+.4*np.sin(t*23)) for f in [1319,1993,2681])*.09*np.exp(-t*1.3)
  elif kind=='impact':w=sosfilt(butter(2,1800,fs=SR,output='sos'),n)*np.exp(-t*3)*.5+np.sin(2*np.pi*49*t)*np.exp(-t*2)*.25
  else:w=sosfilt(butter(2,230,fs=SR,output='sos'),n)*.24
  w*=env;add(b,w,at,gain,pan);events.append(dict(kind=kind,start=round(at,3),duration=round(dur,3),gain=gain,pan=pan))
 for s in S['scenes']:
  a=s['start'];d=s['end']-a;k=s['kind'];event('rumble',a,d,.055)
  if k in ['bank','approach','flood','bridge','cross','gate','chain','escape','drain']:
   event('siren',a+.5,min(13,d-.5),.055,-.6);event('water',a,d,.15 if k in ['drain','cross','gate','chain','escape'] else .045,.4)
  if k in ['approach','cross','escape']:
   gap=.28 if k=='escape' else .52
   for st in np.arange(a+.25,s['end']-.3,gap):event('step',st,.18,.11 if k=='escape' else .075,.05)
  if k in ['gate','chain']:event('growl',a+1,min(d-1,7),.16,-.6)
  if s['key']=='squeal':event('squeal',a+2,2.3,.62,-.65)
  if s['key']=='hold':
   for st in [a+1,a+4,a+8]:event('metal',st,1.6,.30,-.65)
  if s['key']=='chain':
   for st in [a+1,a+3,a+5]:event('chain',st,1,.35,-.65)
  if s['key']=='escape':event('metal',a+4.5,1.4,.42,.1)
  if s['key']=='reunion':event('metal',a+8,2,.24,-.55)
  if k in ['bank','broadcast','warning','interrupt']:event('radio',a+.2,.6,.12,.2)
  if s['key']=='interrupted':event('impact',a+.1,2.5,.25,0);event('radio',a+.4,1.8,.22,.1)
 (P/'sound-events.json').write_text(json.dumps(events,indent=2));export(b,'sfx',.61)
def normalize(src,dst,I,TP,LRA,codec):
 target=f'loudnorm=I={I}:TP={TP}:LRA={LRA}'
 r=ff(['-i',src,'-af',target+':print_format=json','-f','null','-']);m=json.loads(re.findall(r'\{[^{}]+\}',r.stderr)[-1])
 filt=target+f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true:print_format=json"
 r=ff(['-i',src,'-af',filt,'-ar','48000',*codec,dst]);z=json.loads(re.findall(r'\{[^{}]+\}',r.stderr)[-1]);return dict(analysis=m,normalization=z)
def finish():
 voice=normalize(P/'assets/voice-balanced.wav',TMP/'voice-normalized.wav',-17,-2,6,['-c:a','pcm_s24le']);(Q/'voice-normalization.json').write_text(json.dumps(voice,indent=2))
 ff(['-v','error','-i',TMP/'voice-normalized.wav','-c:a','aac','-b:a','96k',P/'assets/narration.m4a'])
 graph='[0:a]asplit=2[v][sc];[1:a]volume=0.17[m];[2:a]volume=0.25[s];[m][s]amix=inputs=2:normalize=0[bed];[bed][sc]sidechaincompress=threshold=0.025:ratio=6:attack=15:release=350[duck];[v][duck]amix=inputs=2:normalize=0,alimiter=limit=0.87:level=0[mix]'
 ff(['-v','error','-i',TMP/'voice-normalized.wav','-i',TMP/'music.wav','-i',TMP/'sfx.wav','-filter_complex',graph,'-map','[mix]','-t',D,'-ar','48000','-ac','2','-c:a','pcm_s24le',TMP/'mix-premaster.wav'])
 report=normalize(TMP/'mix-premaster.wav',TMP/'final-master.wav',-16,-1.5,7,['-c:a','pcm_s24le','-ac','2']);(Q/'mix-normalization.json').write_text(json.dumps(report,indent=2))
 ff(['-v','error','-i',TMP/'final-master.wav','-c:a','libmp3lame','-b:a','128k','-ac','2',P/'assets/mix-final.mp3']);print('Final balanced master complete',flush=True)
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--mix-only',action='store_true');args=ap.parse_args()
 if not args.mix_only:music();effects()
 finish()
