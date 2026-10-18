#!/usr/bin/env python3
"""Editorial review of the first minute. Frame numbers refer to decoded 30 fps source."""
import json,math
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1];out=root/'tracking'
# Start frame, scene, camera, action. Dissolves are intervals, not extra takes.
spec=[(0,'brain','wide','hologram-intro'),(122,'lab','scientist','molecule'),(160,'lab','teleporter','apple-teleport'),(200,'wealth','wide','wealth-visualisation'),(240,'classroom','wide','lesson'),(380,'campus','wide','walk'),(450,'classroom','wide','write'),(540,'grade','insert','iq-80'),(563,'classroom','medium','show-80'),(600,'classroom','wide','receive-f'),(660,'atm','wide','zero-balance'),(723,'exam','wide','write'),(780,'exam','wide','receive-51'),(840,'friends','wide','walk-talk'),(893,'bedroom','wide','fall-on-bed'),(930,'desk','medium','study'),(1020,'city','driving','windshield'),(1095,'city','roadside-low','car-pass'),(1107,'city','roadside','crossing'),(1140,'car','driver','driving'),(1163,'pedal','insert','brake'),(1181,'city','roadside','approaching-car'),(1200,'street-hero','close','look-at-car'),(1226,'city','front','approaching-camera'),(1245,'city','crosswalk','impact'),(1257,'ceiling','eyelids','wake-up'),(1329,'ceiling','tilt','ceiling-pan'),(1338,'hospital','wide','patient-lying'),(1380,'hospital','wide','doctor-enters'),(1470,'patient','medium','sit-up'),(1560,'doctor','close','explain'),(1605,'patient','medium','lie-back'),(1680,'discharge','wide','conversation'),(1740,'entrance','wide','arrive-home'),(1767,'meal','medium','eat'),(1794,'bedroom','medium','phone-in-bed')]
shots=[]
for i,(f,k,c,a)in enumerate(spec):
 end=spec[i+1][0]if i+1<len(spec)else 1800
 shots.append(dict(id=i+1,startFrame=f,endFrameExclusive=end,start=f/30,end=end/30,kind=k,camera=c,action=a,review='visual editorial review; 3D animation still requires comparison'))
transitions=[dict(startFrame=a,endFrame=b,type=k)for a,b,k in[(155,163,'horizontal-whip-blur'),(236,245,'blur-dissolve'),(376,384,'warm-flash-dissolve'),(446,455,'blur-dissolve'),(719,726,'blur-dissolve'),(888,898,'blur-dissolve'),(1257,1329,'tracked-eyelid-matte')]]
plan=dict(fps=30,frames=1800,sourcePixelDimensions=[640,360],reviewedRangeSeconds=[0,60],shots=shots,transitions=transitions,rejectedCutCandidates=[dict(frame=f,reason=s)for f,s in[(1066,'windshield wiper passing camera'),(1150,'driver gesture within same shot'),(1306,'continuous eyelid opening'),(1319,'continuous eyelid opening'),(1653,'patient lies back within same shot')]],remainingVideo='Automatic candidates only; not manually confirmed.')
(out/'reviewed-first-minute.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
rows=json.loads((out/'first-minute.json').read_text());si=0;C=np.eye(3)
for r in rows:
 while si+1<len(shots)and r['f']>=shots[si+1]['startFrame']:si+=1;C=np.eye(3)
 r['automaticTake']=r['take'];r['take']=si+1
 m=r.get('camera')
 if r['f']!=shots[si]['startFrame'] and m and r.get('cameraConfidence',1)>.3:
  A=np.eye(3);A[:2]=np.array(m).reshape(2,3);C=A@C
 r['cameraFromTakeStart']=[round(float(v),7)for v in C[:2].ravel()]
# Header-free rows are directly usable in JS. Full dense tracks remain unchanged.
(out/'calibration-first-minute.json').write_text(json.dumps(rows,separators=(',',':'))+'\n')
(root/'src/timeline.js').write_text('/* First minute: frame-accurate reviewed editorial boundaries. */\nwindow.CloneTimeline='+json.dumps(plan,separators=(',',':'))+';\n')
print(json.dumps(dict(reviewedShots=len(shots),rows=len(rows),transitions=len(transitions))))
