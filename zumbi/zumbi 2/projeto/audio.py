"""Trilha original e efeitos: síntese modal, piano amortecido, cordas suaves e reverb estéreo."""
from pathlib import Path
import json,subprocess
import numpy as np
from scipy.signal import lfilter, butter, sosfilt
from scipy.io.wavfile import write
ROOT=Path(__file__).resolve().parent
SR=48000; D=json.loads((ROOT/'story.json').read_text(encoding='utf-8'))['duration']; rng=np.random.default_rng(172); N=round(SR*D)

def add(buf,wave,start,gain=1,pan=0):
 a=int(start*SR);b=min(N,a+len(wave));
 if b<=a:return
 sig=wave[:b-a]*gain
 buf[a:b,0]+=sig*np.sqrt((1-pan)/2);buf[a:b,1]+=sig*np.sqrt((1+pan)/2)

def modal(freq,dur,kind='piano'):
 t=np.arange(int(dur*SR))/SR;out=np.zeros_like(t)
 if kind=='piano':
  for h in range(1,9):
   f=freq*h*np.sqrt(1+.00011*h*h);out+=np.sin(2*np.pi*f*t+.17*h)*(1/h**1.6)*np.exp(-t*(.6+h*.29))
  out*=1-np.exp(-t*800)
 else:
  for h in range(1,8):out+=np.sin(2*np.pi*freq*h*t+.007*np.sin(2*np.pi*.21*t)*h)/(h**2.1)
  out*=np.sin(np.pi*np.minimum(t/dur,1))**.7*(1+.017*np.sin(2*np.pi*4.2*t))
 return out.astype(np.float32)

def reverb(buf):
 dry=buf.copy()
 for delay,gain in [(.073,.22),(.127,.18),(.211,.14),(.379,.12),(.557,.085),(.829,.06)]:
  k=int(delay*SR);buf[k:,0]+=dry[:-k,1]*gain;buf[k:,1]+=dry[:-k,0]*gain
 return buf

def export(buf,name,gain=1):
 buf=reverb(buf);peak=float(np.max(np.abs(buf)));buf*=gain/max(peak,1e-9);buf[:SR]*=np.linspace(0,1,SR)[:,None];buf[-SR*3:]*=np.linspace(1,0,SR*3)[:,None]
 tmp=ROOT/(name+'.wav');write(tmp,SR,buf.astype(np.float32));subprocess.run(['ffmpeg','-y','-v','error','-i',str(tmp),'-c:a','libmp3lame','-b:a','192k',str(ROOT/'assets'/f'{name}.mp3')],check=True);tmp.unlink();print(name,'peak',peak,flush=True)

def music():
 buf=np.zeros((N,2),np.float32);chords=[[146.832,174.614,220],[130.813,164.814,195.998],[116.541,146.832,174.614],[110,130.813,164.814]]
 for bar,start in enumerate(np.arange(0,D,12)):
  chord=chords[bar%4];energy=.55 if start<100 else .83 if start<190 else .48 if start<340 else .95 if start<421 else .67
  for j,f in enumerate(chord):add(buf,modal(f,15,'strings'),start,.06*energy,[-.65,0,.65][j])
  add(buf,modal(chord[0]/2,12,'strings'),start,.08*energy,0)
  for k in range(6):add(buf,modal(chord[(k+bar)%3]*2,5),start+k*2,.045*energy,.44*np.sin(k*2+bar))
  if energy>.75:
   for k in range(4):
    tt=np.arange(int(.85*SR))/SR;pulse=np.sin(2*np.pi*(46*tt+12*(1-np.exp(-tt*9))))*np.exp(-tt*6)*(1-np.exp(-tt*200));add(buf,pulse,start+k*3,.065)
 export(buf,'music',.46)

def effects():
 buf=np.zeros((N,2),np.float32);scenes=json.loads((ROOT/'story.json').read_text(encoding='utf-8'))['scenes'];events=[]
 def event(kind,start,dur,gain,pan=0):
  t=np.arange(int(dur*SR))/SR;noise=rng.normal(0,1,len(t)).astype(np.float32)
  if kind=='step':w=sosfilt(butter(2,900,fs=SR,output='sos'),noise)*np.exp(-t*35)+np.sin(2*np.pi*95*t)*np.exp(-t*29)
  elif kind=='crash':
   w=sosfilt(butter(2,1400,fs=SR,output='sos'),noise)*np.exp(-t*3)
   for f in [83,137,317,553,1171]:w+=np.sin(2*np.pi*f*t)*np.exp(-t*(1+f/1200))*.22
  elif kind=='siren':w=np.sin(2*np.pi*(570*t-100/(2*np.pi*.64)*np.cos(2*np.pi*.64*t)))*np.sin(np.pi*t/dur)**.7
  elif kind=='radio':w=sosfilt(butter(2,[900,4700],btype='bandpass',fs=SR,output='sos'),noise)*.22*np.sin(np.pi*t/dur)**.6
  elif kind=='growl':w=(np.sin(2*np.pi*69*t)+.4*np.sin(2*np.pi*138*t)+sosfilt(butter(2,650,fs=SR,output='sos'),noise)*.8)*np.sin(np.pi*t/dur)**.6
  elif kind=='crowd':
   w=np.zeros_like(t)
   for i in range(9):
    f=240+i*39;w+=np.sin(2*np.pi*f*t+1.2*np.sin(2*np.pi*(.47+i*.071)*t))*np.maximum(0,np.sin(t*(1.3+i*.14)+i))**5*.06
   w+=sosfilt(butter(2,[500,2800],btype='bandpass',fs=SR,output='sos'),noise)*.07;w*=np.sin(np.pi*t/dur)**.5
  else:w=sosfilt(butter(2,180,fs=SR,output='sos'),noise)*np.sin(np.pi*t/dur)**.5
  add(buf,w,start,gain,pan);events.append(dict(kind=kind,start=round(start,3),duration=dur,gain=gain,pan=pan))
 for s in scenes:
  a=s['start'];d=s['end']-a;e=s['environment'];action=s['action']
  event('rumble',a,max(1,d),.07)
  if e in ['street','school','roof','bridge']:
   event('siren',a+1,min(d-1,16),.07,-.5);event('crowd',a+1,min(d-1,18),.16,.4)
  if e in ['street','bridge']:event('growl',a+4,4,.11,-.4)
  if action in ['walk','run','chase','climb','end','return','door']:
   spacing=.29 if action in ['run','chase','end'] else .52
   for at in np.arange(a+1,a+d-2,spacing):event('step',at,.18,.07,.07)
  if action in ['radio','signal']:event('radio',a+2,1.5,.08)
  if s['id']==7:event('crash',a+2,5,.6,.35)
  if s['id']==18:event('growl',a+8,5,.21,.6);event('crash',a+4.5,2,.17,.65)
  if s['id']==24:event('crash',a+5.8,6,.46,-.6)
 (ROOT/'sound-events.json').write_text(json.dumps(events,indent=2))
 export(buf,'sfx',.63)
if __name__=='__main__':music();effects()
