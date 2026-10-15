"""Original dramatic/comic score: acoustic-like synthesis, rhythm, space and event-driven SFX."""
import argparse,json,wave,subprocess,tempfile
from pathlib import Path
import numpy as np

p=argparse.ArgumentParser();p.add_argument('--events',required=True,type=Path);p.add_argument('--duration',type=float,default=125);p.add_argument('--output',type=Path,default=Path('exports/audio-v2.wav'));a=p.parse_args()
SR=48000;N=round(a.duration*SR);music=np.zeros((N,2),np.float32);fx=np.zeros_like(music);rng=np.random.default_rng(20261015)
data=json.loads(a.events.read_text());events=data.get('events',data)

def put(bus,start,signal,gain=1,pan=0):
    i=round(start*SR);j=max(0,i);k=min(N,i+len(signal))
    if j>=k:return
    sig=np.asarray(signal[j-i:k-i],np.float32)*gain
    bus[j:k,0]+=sig*np.sqrt((1-pan)/2);bus[j:k,1]+=sig*np.sqrt((1+pan)/2)

def tone(bus,start,dur,freq,end=None,gain=.1,decay=5,pan=0,partials=(1,.25,.08)):
    t=np.arange(round(dur*SR))/SR;end=freq if end is None else end
    phase=2*np.pi*(freq*t+(end-freq)*t*t/(2*dur));env=(1-np.exp(-t*180))*np.exp(-decay*t/dur)*np.minimum(1,(dur-t)*100)
    sig=sum(v*np.sin((i+1)*phase) for i,v in enumerate(partials))*env
    put(bus,start,sig,gain,pan)

def pluck(start,freq,gain=.08,pan=0,dur=.65):
    t=np.arange(round(dur*SR))/SR;sig=np.zeros_like(t)
    for h,w in [(1,1),(2,.32),(3,.15),(5,.07)]:sig+=w*np.sin(2*np.pi*freq*h*t)*np.exp(-t*(4+h*1.1))
    sig*=np.minimum(1,t*450)*np.minimum(1,(dur-t)*100)
    put(music,start,sig,gain,pan)

def chord(start,dur,notes,gain=.035):
    t=np.arange(round(dur*SR))/SR;env=np.minimum(1,t/.45)*np.minimum(1,(dur-t)/.65)
    for i,f in enumerate(notes):
        sig=(np.sin(2*np.pi*f*t)+.23*np.sin(2*np.pi*f*2.002*t)+.08*np.sin(2*np.pi*f*3*t))*env*(.88+.12*np.sin(2*np.pi*.7*t+i))
        put(music,start,sig,gain,(-.35,.35,0)[i%3])

def kick(start,gain=.22):
    t=np.arange(round(.28*SR))/SR;phase=2*np.pi*(42*t+68*.025*(1-np.exp(-t/.025)))
    sig=np.sin(phase)*np.exp(-t*18)+rng.standard_normal(len(t))*.09*np.exp(-t*250)
    put(music,start,sig,gain)

def snare(start,gain=.07):
    t=np.arange(round(.15*SR))/SR;noise=rng.standard_normal(len(t));noise-=np.convolve(noise,np.ones(13)/13,'same');sig=noise*np.exp(-t*38)+.18*np.sin(2*np.pi*185*t)*np.exp(-t*32);put(music,start,sig,gain,.08)

def hat(start,gain=.023,pan=.15):
    t=np.arange(round(.055*SR))/SR;noise=rng.standard_normal(len(t));noise=np.diff(noise,prepend=0);put(music,start,noise*np.exp(-t*100),gain,pan)

def thud(start,gain=.28):
    t=np.arange(round(.18*SR))/SR;noise=np.convolve(rng.standard_normal(len(t)),np.ones(15)/15,'same')*np.exp(-t*36);put(fx,start,noise,gain);tone(fx,start,.28,105,35,gain*.65,5,partials=(1,.08))

def boing(start,freq=260,gain=.23,dur=.5,pan=0):
    t=np.arange(round(dur*SR))/SR;phase=2*np.pi*(freq*t-35*t*t+7*np.sin(2*np.pi*9*t)*np.exp(-t*8));sig=(np.sin(phase)+.12*np.sin(phase*2.03))*np.exp(-t*6/dur)*np.minimum(1,t*350);put(fx,start,sig,gain,pan)

def sweep(start,dur,gain=.09,pan=0,up=True):
    t=np.arange(round(dur*SR))/SR;noise=np.convolve(rng.standard_normal(len(t)),np.ones(9)/9,'same');env=np.sin(np.pi*t/dur)**1.2;put(fx,start,noise*env,gain,pan);tone(fx,start,dur,100 if up else 900,900 if up else 100,gain*.22,1.5,pan,partials=(1,.04))

def crystal(start,gain=.24):
    for f,g in [(1320,1),(1980,.45),(2640,.2),(3311,.12)]:tone(fx,start,.9,f,gain=gain*g,decay=7,partials=(1,),pan=.15)

def pulse(start,color='blue',gain=.2):
    base=90 if color=='blue' else 68 if color=='purple' else 220
    tone(fx,start,.7,base,base*4,gain,5,partials=(1,.2,.1));tone(fx,start,.45,base*6,base*3,gain*.4,5,pan=.22,partials=(1,));sweep(start,.35,gain*.4)

# A tiny curiosity motif grows into the action theme, then resolves in major.
for i,t in enumerate(np.arange(7.65,min(a.duration,11.1),.375)):
    pluck(t,[293.665,349.228,440,391.995,329.628,293.665,220,261.626][i%8],.075,(-.22,.22)[i%2])
for i,t in enumerate(np.arange(11.55,min(a.duration,25.6),.45)):
    pluck(t,[293.665,440,523.251,440,349.228,391.995,329.628,220][i%8],.055,.3*np.sin(i),.85)
for t in [11.5,16,20.5]:chord(t,4.4,[146.832,220,349.228],.019)

# Stop/start rhythm supports the comic physical encounters, rather than filling every pause.
segments=[(30.4,38.65,112,.85),(40.4,50.7,124,1),(55.5,64.8,108,.72),(65,74.8,128,1),(75,94.8,136,1.22),(105,110.4,144,1.35)]
roots=[73.416,58.2705,87.307,65.4064]
for begin,end,bpm,strength in segments:
    step=60/bpm
    for i,t in enumerate(np.arange(begin,min(a.duration,end),step/2)):
        root=roots[(i//16)%4];pluck(t,root*(2 if i%8==6 else 1),.105*strength,0,.4)
        hat(t,.015*strength,(-.25,.25)[i%2])
        if i%4==0:kick(t,.17*strength)
        if i%4==2:snare(t,.047*strength)
        if i%2==0:
            f=[293.665,349.228,440,391.995,329.628,293.665,261.626,220][(i//2)%8]
            pluck(t,f*(2 if begin>=75 and i%8==4 else 1),.05*strength,.25*np.sin(i*.7),.6)
    for j,t in enumerate(np.arange(begin,min(a.duration,end),step*8)):
        r=roots[j%4]*2;chord(t,min(step*8,end-t),[r,r*1.5,r*2.3784],.015*strength)

# Rising energy and the final accelerando are composed to the action, not sampled assets.
for t,dur,gain in [(37.7,.9,.10),(44,1.2,.12),(75,5,.16),(85.7,3.9,.10),(108.65,1,.15)]:
    sweep(t,dur,gain,up=True)
    tone(music,t,dur,45,110,gain*.4,1.1,partials=(1,.18))
for t in [95,97.5,100,102.5]:tone(music,t,2.2,55,46,.1,2.5,partials=(1,.1))
for t in [115.5,118.7]:chord(t,2.9,[146.832,184.997,220],.025)
for i,t in enumerate(np.arange(116,min(a.duration,121.5),.6)):pluck(t,[293.665,369.994,440,587.33][i%4],.06,(-.2,.2)[i%2],.6)

for i,e in enumerate(events):
    t=e['t'];typ=e['type']
    if typ=='footstep':
        thud(t,.105);tone(fx,t,.075,740,370,.026,6,pan=(-.12,.12)[e.get('leg',0)])
    elif typ=='orb-drop':sweep(t,1.25,.16,.22,False);tone(fx,t,1.25,1600,250,.055,1,pan=.22,partials=(1,))
    elif typ=='orb-impact':
        incoming=e.get('incoming',300);boing(t,np.clip(520-incoming*.22,180,440),.17*np.clip(np.sqrt(incoming/900),.4,1.3),.25+.3*min(1,incoming/1200),.18);thud(t,.1)
    elif typ=='blue-pulse':pulse(t,'blue',.26)
    elif typ=='purple-pulse':pulse(t,'purple',.27)
    elif typ=='green-pulse':crystal(t,.15)
    elif typ=='red-flash':pulse(t,'purple',.21);tone(fx,t,.25,900,90,.16,4)
    elif typ=='kick':thud(t,.38);sweep(t,.34,.2,-.3,False)
    elif typ=='double-kick':
        thud(t,.62);sweep(t,.45,.32,-.12,False)
        for f,g in [(340,.17),(691,.09),(1353,.04)]:tone(fx,t,.8,f,gain=g,decay=6,partials=(1,))
    elif typ=='superelastic-bounce':boing(t,165+e['index']*95,.34,.65);thud(t,.17)
    elif typ=='character-impact':
        thud(t,.22 if t>115 else .36)
        if e.get('plane')=='iceWall':boing(t,145,.4,.8);sweep(t,.5,.18,0,False)
    elif typ=='cube-impact':thud(t,.38);tone(fx,t,.35,73,48,.25,6,partials=(1,.35))
    elif typ=='heavy-push':
        tone(fx,t,.7,110,83,.14,1.6,partials=(1,.25,.12));tone(fx,t+.15,.35,180,125,.07,3,partials=(1,.2))
    elif typ in ['inverted-push','inverted-pull','inverted-cube-launch']:
        pulse(t,'purple',.2);sweep(t,.45,.18,-.1,True)
    elif typ=='jump-over-cube':sweep(t,.4,.17,-.15,True)
    elif typ in ['discovery','particle-touch']:crystal(t,.23)
    elif typ=='chaos-wave':
        pulse(t,'purple' if e.get('rule')=='leftward-impulse' else 'blue',.34);thud(t,.35)
    elif typ=='inverted-tether':sweep(t,1.2,.2,.1,True)
    elif typ=='inertia-release':sweep(t,.45,.16,.2,True)
    elif typ=='plan-ricochet':boing(t,185,.35,.5);sweep(t,.4,.2,.18,True)
    elif typ=='decisive-collision':
        thud(t,.85);tone(fx,t,1.9,58,23,.65,3,partials=(1,.15));sweep(t,.5,.42,0,False)
        for f,g in [(330,.12),(673,.075),(1080,.04)]:tone(fx,t,1.5,f,gain=g,decay=6,partials=(1,))
    elif typ=='test-jump':sweep(t,.2,.07,0,True)
    elif typ=='apple-drop':sweep(t,1.1,.075,.05,False)
    elif typ=='apple-hit':
        thud(t,.46);boing(t,360,.23,.52);tone(fx,t,.12,790,240,.12,4,partials=(1,.2))
    elif typ=='apple-impact':thud(t,.08)

# Light stereo room; delays are generated from the signal, with no library recordings.
for bus,delays in [(music,[(.17,.13),(.34,.07)]),(fx,[(.055,.13),(.113,.08),(.227,.04)])]:
    dry=bus.copy()
    for seconds,gain in delays:
        n=round(seconds*SR)
        if n<N:bus[n:]+=dry[:-n,::-1]*gain
# Slow motion becomes low and soft, while the crystalline touch remains intelligible.
lo,hi=round(95*SR),min(N,round(105*SR))
if hi>lo:
    for bus,width in [(music,161),(fx,61)]:
        x=bus[lo:hi];pad=np.pad(x,((width//2,width//2),(0,0)),mode='edge');cs=np.vstack([np.zeros((1,2)),np.cumsum(pad,axis=0,dtype=np.float64)]);bus[lo:hi]=(cs[width:]-cs[:-width])/width
# Duck the score around important physical beats and leave comic pauses.
duck=np.ones(N,np.float32)
for e in events:
    if e['type'] not in ['character-impact','double-kick','chaos-wave','decisive-collision','apple-hit','particle-touch','heavy-push']:continue
    i=max(0,round((e['t']-.025)*SR));j=min(N,round((e['t']+.42)*SR))
    if j>i:
        tt=np.arange(j-i)/SR;duck[i:j]*=1-.55*np.exp(-((tt-.025)/.13)**2)
music*=duck[:,None]
music[round(121.65*SR):]=0
mix=music+fx
# Fade into intended silences, then make the interior exactly zero.
decisive=next((e['t'] for e in events if e['type']=='decisive-collision'),110.5)
windows=[(4.2,5),(26.48,26.63),(59.08,59.3),(102.45,103.1),(decisive+1.9,115.45),(124.85,125)]
for begin,end in windows:
    lo,hi=max(0,round(begin*SR)),min(N,round(end*SR));ramp=round(.008*SR)
    if hi>lo:
        if lo>=ramp:mix[lo-ramp:lo]*=np.linspace(1,0,ramp)[:,None]
        if hi+ramp<N:mix[hi:hi+ramp]*=np.linspace(0,1,ramp)[:,None]
        mix[lo:hi]=0
rms=float(np.sqrt(np.mean(mix.astype(np.float64)**2)));gain=min(2.5,.12/max(rms,1e-8));mix=np.tanh(mix*gain*1.12);mix*=.94/max(.94,float(np.max(np.abs(mix))));peak=float(np.max(np.abs(mix)));pcm=(mix*32767).astype('<i2')
a.output.parent.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory(prefix='physics-score-',dir=a.output.parent)as work:
    raw=Path(work)/'raw.wav'
    with wave.open(str(raw),'wb')as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())
    mastered=Path(work)/'master.wav'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(raw),'-af','aresample=192000,alimiter=limit=0.82:level=false:latency=true,aresample=48000','-t',str(a.duration),'-c:a','pcm_s16le','-y',str(mastered)],check=True)
    with wave.open(str(mastered),'rb')as f:pcm=np.frombuffer(f.readframes(f.getnframes()),dtype='<i2').reshape(-1,2).copy()
    assert len(pcm)==N
    # Atomic replacement keeps a concurrent encoder reading its existing input safely.
    import os
    os.replace(mastered,a.output)
mix=pcm.astype(np.float32)/32768;peak=float(np.max(np.abs(mix)))
levels={}
for begin,end in [(0,30),(30,75),(75,95),(95,105),(105,125)]:
    seg=mix[round(begin*SR):min(N,round(end*SR))]
    if len(seg):levels[f'{begin}-{end}']=round(20*np.log10(float(np.sqrt(np.mean(seg**2)))+1e-9),2)
report={'duration':a.duration,'sample_rate':SR,'channels':2,'samples_per_channel':len(pcm),'voices':False,'recorded_assets':False,'seed':20261015,'score':'Original synthesized dramatic/comic motif with bass, plucked strings, pads, percussion, risers, event SFX and room delays','peak':peak,'mastering':'4x oversampling, lookahead limiter at 0.82, compensated latency','rms_dbfs_by_act':levels,'silence_windows':windows};a.output.with_suffix('.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
