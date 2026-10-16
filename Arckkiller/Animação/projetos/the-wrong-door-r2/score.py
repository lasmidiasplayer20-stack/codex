"""Compose a quiet original comic chamber score in Python and preserve reference audio timing."""
from pathlib import Path
import numpy as np,subprocess,json,wave,hashlib
R=Path(__file__).resolve().parent;SR=48000;DUR=118.75;N=round(DUR*SR);rng=np.random.default_rng(7186);out=np.zeros((N,2),np.float32);BPM=112;beat=60/BPM
# Original A-minor/Dorian pizzicato motif and variations, lightly under the actual sound cues.
chords=[[45,52,57,60],[50,57,62,65],[43,50,55,59],[40,47,52,56]];melody=[69,None,72,76,74,72,None,71,69,64,67,71,72,None,76,74]
def add(start,midi,duration,gain,kind='pluck',pan=0):
 i=round(start*SR)
 if i>=N:return
 n=min(round(duration*SR),N-i);t=np.arange(n)/SR;hz=440*2**((midi-69)/12);phase=2*np.pi*hz*t
 if kind=='pluck':s=(np.sin(phase)+.25*np.sin(phase*2)+.12*np.sin(phase*3))*np.exp(-t*9)*np.minimum(1,t*500)
 elif kind=='reed':s=(np.sin(phase)+.16*np.sin(phase*3))*np.minimum(1,t*30)*np.minimum(1,(duration-t)*20)*np.exp(-t*1.1)
 else:s=np.sin(phase)*np.exp(-t*5)*np.minimum(1,t*200)
 env=np.clip(t/.015,0,1)*np.clip((duration-t)/.04,0,1);s=s*env*gain
 out[i:i+n,0]+=s*np.sqrt((1-pan)/2);out[i:i+n,1]+=s*np.sqrt((1+pan)/2)
for k in range(int(DUR/beat)+1):
 t=k*beat;bar=k//4;ch=chords[bar%4];section=min(5,int(t//20));quiet=0.65 if 14<t<27 or 41<t<53 else 1
 add(t,ch[0],.48,.026*quiet,'bass',-.08)
 if k%2==1:add(t,ch[1+(k//2)%3]+12,.35,.020*quiet,'pluck',.4)
 m=melody[k%16]
 if m is not None:add(t+beat*.09,m+(0 if section<3 else 12 if section==5 else 0),beat*.7,.016*quiet,'pluck',-.3)
 if k%8==7:add(t+beat*.55,ch[2]+24,.18,.012,'pluck',.65)
# Timed harmonic responses support the gags without replacing the source Foley.
for t,root in [(11.65,76),(26.65,45),(33.25,48),(39.45,76),(51.25,52),(59.35,43),(73.05,79),(79.05,81),(85.05,55),(95.6,84),(100.8,72),(111.5,76)]:
 for j,n in enumerate([0,4,7]):add(t+j*.06,root+n,.7,.020,'reed',j*.3-.3)
fade=np.minimum(1,np.arange(N)/(SR*.2))*np.minimum(1,(N-1-np.arange(N))/(SR*.5));out*=fade[:,None]
peak=float(abs(out).max());music=R/'audio/original-music.wav'
with wave.open(str(music),'wb')as f:f.setparams((2,2,SR,N,'NONE',''));f.writeframes((np.clip(out,-1,1)*32767).astype('<i2').tobytes())
# The reference AAC is retained intact; a separate original score is added quietly.
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(R/'audio/reference-track.m4a'),'-i',str(music),'-filter_complex','[0:a]aresample=48000,apad,atrim=duration=118.75[src];[1:a]volume=0.55[music];[src][music]amix=inputs=2:normalize=0:duration=first,volume=0.78,alimiter=limit=0.90:level=false:latency=true[a]','-map','[a]','-c:a','aac','-b:a','176k','-ar','48000','-t',str(DUR),'-y',str(R/'audio/master.m4a')],check=True)
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(music),'-c:a','aac','-b:a','192k','-y',str(R/'audio/original-music.m4a')],check=True)
(R/'qa/audio-production.json').write_text(json.dumps({'duration':DUR,'sampleRate':SR,'sourceTrack':'audio/reference-track.m4a','sourceAudioOffsetSeconds':0,'sourceAudioSpeed':1,'music':'Original Python/NumPy score','musicBpm':BPM,'seed':7186,'musicPeakBeforeMix':peak,'musicMixGain':.55,'masterGain':.78,'limiterCeiling':.90,'originalAudioSeparatedIntoStems':False,'note':'The complete supplied reference soundtrack, including any existing music, is preserved. New quiet music is mixed underneath. No claim of human listening.'},indent=2));print('Mixed reference track and original music:',DUR,'seconds')
