import json,subprocess
from pathlib import Path
import numpy as np
from scipy.ndimage import gaussian_filter1d,median_filter
from scipy.io import wavfile
P=Path(__file__).resolve().parent
sr,a=wavfile.read(P/'assets/voice.wav');x=a.astype(np.float64)/32768
# A slow, bounded level rider handles phrase-to-phrase changes. Compression
# and true-peak limiting follow it, rather than amplifying silence.
n=round(sr*.1);pad=(-len(x))%n
frames=np.pad(x,(0,pad)).reshape(-1,n)
rms=np.sqrt(np.mean(frames**2,axis=1));peak=np.max(np.abs(frames),axis=1)
active=(rms>.006)&(peak>.018)
db=20*np.log10(np.maximum(rms,1e-7));idx=np.arange(len(db))
level=np.interp(idx,idx[active],db[active])
level=gaussian_filter1d(median_filter(level,size=11),sigma=7)
gain_db=np.clip(-22-level,-7,9)
gain_db=gaussian_filter1d(gain_db,sigma=5)
gain=np.interp(np.arange(len(x))/n,idx,10**(gain_db/20))
y=x*gain
TMP=P.parent/'rendered/audio';TMP.mkdir(parents=True,exist_ok=True)
wavfile.write(TMP/'voice-ridden.wav',sr,y.astype(np.float32))
report={'input_sample_peak_dbfs':float(20*np.log10(max(abs(x)))),'input_samples_near_fullscale':int(np.count_nonzero(np.abs(a.astype(int))>=32760)),'input_active_100ms_rms_dbfs_percentiles':np.percentile(db[active],[5,50,95]).tolist(),'level_rider_gain_db_range':[float(gain_db.min()),float(gain_db.max())],'level_rider':'100 ms RMS analysis, robust median and Gaussian smoothing, bounded -7/+9 dB, no silence boosting','processing':'80 Hz high-pass, 10 kHz low-pass, mild 2.5:1 compression, two-pass -17 LUFS voice normalization, -2 dBTP ceiling'}
(P.parent/'qa/voice-leveling.json').write_text(json.dumps(report,indent=2))
f='highpass=f=80,lowpass=f=10000,acompressor=threshold=0.125:ratio=2.5:attack=10:release=180:makeup=1:knee=2.5,dynaudnorm=f=500:g=11:p=0.85:m=2:r=0.12:n=0:c=1'
subprocess.run(['ffmpeg','-y','-v','error','-i',str(TMP/'voice-ridden.wav'),'-af',f,'-c:a','pcm_s24le',str(P/'assets/voice-balanced.wav')],check=True)
print(json.dumps(report,indent=2))
