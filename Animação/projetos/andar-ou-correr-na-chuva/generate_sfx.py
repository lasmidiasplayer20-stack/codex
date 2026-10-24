"""Generate original procedural effects. Final timing/mixing awaits the visual edit."""
from pathlib import Path
import json
import wave
import numpy as np

ROOT = Path(__file__).resolve().parent / 'audio'
SR = 48000
rng = np.random.default_rng(20261024)

def save(name, signal):
    signal = np.asarray(signal, dtype=np.float64)
    fade = min(480, len(signal)//4)
    signal[:fade] *= np.linspace(0, 1, fade)
    signal[-fade:] *= np.linspace(1, 0, fade)
    signal *= 0.65 / max(1.0, float(np.max(np.abs(signal))))
    stereo = np.column_stack([signal, signal])
    with wave.open(str(ROOT / (name + '.wav')), 'wb') as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((stereo * 32767).astype('<i2').tobytes())
    return {'file': name+'.wav', 'duration': len(signal)/SR, 'peak': float(np.max(np.abs(signal)))}

ROOT.mkdir(parents=True, exist_ok=True)
items=[]
t=np.arange(round(.6*SR))/SR
noise=rng.normal(0,1,len(t))
smooth=np.convolve(noise,np.ones(12)/12,mode='same')
items.append(save('whoosh', smooth*np.sin(np.pi*t/.6)**2))
t=np.arange(round(.45*SR))/SR
items.append(save('impact', .8*np.sin(2*np.pi*(45*t+55*.035*(1-np.exp(-t/.035))))*np.exp(-t*14)+rng.normal(0,.15,len(t))*np.exp(-t*45)))
t=np.arange(round(.12*SR))/SR
items.append(save('pop', np.sin(2*np.pi*(650*t-1800*t*t))*np.exp(-t*45)))
t=np.arange(round(.07*SR))/SR
items.append(save('click', rng.normal(0,.3,len(t))*np.exp(-t*180)+.4*np.sin(2*np.pi*1700*t)*np.exp(-t*130)))
t=np.arange(round(.8*SR))/SR
items.append(save('chime', sum(np.sin(2*np.pi*f*t)*np.exp(-t*d)/3 for f,d in [(660,5),(990,7),(1320,9)])))
t=np.arange(round(1.2*SR))/SR
items.append(save('riser', (np.sin(2*np.pi*(160*t+450*t*t))*.2+rng.normal(0,.08,len(t)))*(t/1.2)**2))
(ROOT/'manifest.json').write_text(json.dumps({'source':'Original NumPy synthesis; no external samples', 'sample_rate':SR,'effects':items},indent=2))
print(json.dumps(items,indent=2))
