"""Preserved V2 composition + spatial procedural Foley; absolute timing is unchanged."""
import json,subprocess,wave
from pathlib import Path
import numpy as np
SR=48000
out=Path(__file__).resolve().parents[1]/'exports'
raw=subprocess.check_output(['ffmpeg','-v','error','-i',str((out/'score-base-v3.wav' if (out/'score-base-v3.wav').exists() else out/'soundtrack-v2.m4a')),'-f','f32le','-ac','2','-ar',str(SR),'-'])
x=np.frombuffer(raw,dtype='<f4').reshape(-1,2)[:125*SR].copy()
assert x.shape==(125*SR,2)
rng=np.random.default_rng(20261015)
def add(start,duration,gain,mode='air',pan=0):
    n=round(duration*SR);t=np.arange(n)/SR
    noise=np.convolve(rng.standard_normal(n),np.ones(11)/11,'same')
    if mode=='glass':
        y=sum(np.sin(2*np.pi*f*t+np.sin(t*2)*.14)*g for f,g in [(523.25,.35),(783.99,.22),(1174.66,.1)])
        y*=.7+.3*np.sin(t*3.2)
    elif mode=='field':
        y=np.sin(2*np.pi*(42*t+.9*t*t))*.5+np.sin(2*np.pi*84.13*t)*.2+noise*.1
        y*=.7+.3*np.sin(t*2.5)
    else:y=noise*(.7+.3*np.sin(t*6.3))
    y*=np.sin(np.pi*np.clip(t/duration,0,1))**.8
    p=np.clip(pan+.2*np.sin(t*.45),-1,1)
    stereo=np.column_stack((y*np.sqrt((1-p)/2),y*np.sqrt((1+p)/2)))*gain
    i=round(start*SR);end=min(len(x),i+n);x[i:end]+=stereo[:end-i]
for args in [(11.45,13.7,.008,'glass',.15),(32.35,6.1,.028,'air',-.15),(45.1,5.5,.019,'air',.1),(57.3,.65,.017,'air',.2),(58.5,.45,.019,'air',.2),(61.4,.5,.014,'field',.1),(75,5,.016,'field',0),(85.65,4.1,.017,'air',-.15),(95,7.2,.005,'glass',.1),(109.65,.8,.022,'air',.3)]:add(*args)
silences=[(4.2,5),(26.48,26.63),(59.08,59.3),(102.45,103.1),(112.8,115.45),(124.85,125)]
for begin,end in silences:
    a,b=round(begin*SR),round(end*SR);r=round(.012*SR)
    x[max(0,a-r):a]*=np.linspace(1,0,min(r,a))[:,None]
    if b+r<=len(x):x[b:b+r]*=np.linspace(0,1,r)[:,None]
    x[a:b]=0
premaster=out/'audio-v3-premaster.wav'
with wave.open(str(premaster),'wb')as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(x,-1,1)*32767).astype('<i2').tobytes())
final=out/'audio-v3.wav'
subprocess.run(['ffmpeg','-v','error','-y','-i',str(premaster),'-af','aresample=192000,alimiter=limit=0.84:level=false:latency=true,aresample=48000','-t','125','-c:a','pcm_s16le',str(final)],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(final),'-c:a','aac','-b:a','256k','-movflags','+faststart',str(out/'soundtrack-v3.m4a')],check=True)
with wave.open(str(final),'rb')as f:pcm=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2)
assert len(pcm)==125*SR
assert np.max(np.abs(pcm[round(113*SR):round(115.4*SR)]))==0
assert np.max(np.abs(pcm[round(124.9*SR):]))==0
report={'duration':125,'sample_rate':SR,'channels':2,'samples_per_channel':len(pcm),'seed':20261015,'voices':False,'recorded_assets':False,'source':'Original composition retimed to V3 physical events + procedural spatial textures','added_layers':['zero-gravity shimmer','ice scrape','lateral air rush','cube friction','field energy','inertial air rush'],'silence_windows':silences,'mastering':'192kHz oversampled limiter, latency compensated','pcm_peak_dbfs':float(20*np.log10(max(1,int(np.max(np.abs(pcm.astype(np.int32)))))/32768))}
(out/'audio-v3.json').write_text(json.dumps(report,indent=2)+'\n');premaster.unlink();print(json.dumps(report))
