#!/usr/bin/env python3
"""Offline observations from every decoded frame; confidence is never a 3D solve."""
import sys,os,json,gzip,math,time,hashlib,argparse,subprocess
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'python-deps'))
import cv2 as cv
import numpy as np
from scipy.signal import find_peaks
from scipy.optimize import linear_sum_assignment
cv.setNumThreads(2)
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--output',required=True);p.add_argument('--limit',type=int,default=0);a=p.parse_args()
out=Path(a.output);out.mkdir(parents=True,exist_ok=True);(out/'annotated').mkdir(exist_ok=True)
cap=cv.VideoCapture(a.source);fps=cap.get(cv.CAP_PROP_FPS);expected=int(cap.get(cv.CAP_PROP_FRAME_COUNT));w=int(cap.get(cv.CAP_PROP_FRAME_WIDTH));h=int(cap.get(cv.CAP_PROP_FRAME_HEIGHT));rows=[];prev=None;previous_content=0;points=None;features_ids=None;next_feature=0;tracks={};next_actor=0;cuts=[];started=time.time();effect_candidates=[];last_mean=None;track_frames=0
kernel=cv.getStructuringElement(cv.MORPH_ELLIPSE,(5,5));small_kernel=cv.getStructuringElement(cv.MORPH_ELLIPSE,(3,3));flow_engine=cv.DISOpticalFlow_create(cv.DISOPTICAL_FLOW_PRESET_ULTRAFAST)
def heads_in(im,gray):
 dark=((im.max(axis=2)<85)&((im.max(axis=2).astype(int)-im.min(axis=2))<20)).astype('uint8')*255;opened=cv.morphologyEx(dark,cv.MORPH_OPEN,kernel);cs,_=cv.findContours(opened,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE);found=[]
 for c in cs:
  x,y,bw,bh=cv.boundingRect(c);area=cv.contourArea(c)
  if not(7<=bw<=110 and 8<=bh<=120 and .47<bw/bh<1.8 and 30<area<6500 and area/(bw*bh)>.42):continue
  roi=im[y:y+bh,x:x+bw];white=(roi.min(axis=2)>165)&((roi.max(axis=2).astype(int)-roi.min(axis=2))<85)
  white[:int(bh*.1)]=False;white[int(bh*.79):]=False
  count,labels,st,cent=cv.connectedComponentsWithStats(white.astype('uint8'))
  eyes=[(cx,cy)for (xx,yy,ww,hh,n),(cx,cy)in zip(st[1:],cent[1:]) if 1<=n<=max(3,area*.1) and hh>=1 and ww<=bw*.4]
  pairs=[(u,v)for i,u in enumerate(eyes)for v in eyes[i+1:] if .09*bw<abs(u[0]-v[0])<.6*bw and abs(u[1]-v[1])<bh*.24]
  if not pairs:continue
  circ=4*math.pi*area/max(1,cv.arcLength(c,True)**2);confidence=min(.99,.57+.2*min(1,circ)+.05*len(pairs))
  found.append({'box':[x,y,bw,bh],'center':[round(x+bw/2,2),round(y+bh/2,2)],'confidence':round(confidence,3)})
 # Find paired vertical eye highlights when a head merges into a dark wall.
 if gray.mean()<60:
  neutral=(im.max(axis=2).astype(int)-im.min(axis=2))<65
  white=((gray>180)&neutral).astype('uint8');num,labs,st,cent=cv.connectedComponentsWithStats(white)
  dots=[(list(map(int,q)),c)for q,c in zip(st[1:],cent[1:])if 2<=q[4]<=90 and 2<=q[3]<=22 and .18<q[2]/q[3]<1.25]
  dots.sort(key=lambda d:d[1][0])
  for i,(aa,ca)in enumerate(dots):
   for bb,cb in dots[i+1:]:
    sep=abs(ca[0]-cb[0]);eh=(aa[3]+bb[3])/2
    if sep>38:break
    if not(2<sep<38 and abs(ca[1]-cb[1])<eh*.4 and .35<aa[3]/bb[3]<2.8 and .35<sep/eh<2.8):continue
    cx=(ca[0]+cb[0])/2;cy=(ca[1]+cb[1])/2+eh*.5;bw=int(max(sep*5.2,eh*4.2));bh=int(max(eh*4.1,bw*.88));cx+=sep*.45;x=int(cx-bw/2);y=int(cy-bh/2)
    if x<0 or y<0 or x+bw>=w or y+bh>=h or bw>110 or bh>120:continue
    yy,xx=np.ogrid[:bh,:bw];rr=((xx-bw/2)/(bw/2))**2+((yy-bh/2)/(bh/2))**2;patch=gray[y:y+bh,x:x+bw]
    interior=patch[(rr<.6)&(patch<130)];annulus=patch[(rr>.8)&(rr<1.1)];crop=im[y:y+bh,x:x+bw];blackness=((crop.max(axis=2)[rr<.6]<85)&((crop.max(axis=2).astype(int)-crop.min(axis=2))[rr<.6]<20)).mean()
    if blackness<.65 or len(interior)<15 or np.mean(interior)>72 or np.mean(annulus)-np.mean(interior)<4:continue
    if any(np.linalg.norm(np.array(q['center'])-[cx,cy])<min(bw,q['box'][2])*.55 for q in found):continue
    found.append({'box':[x,y,bw,bh],'center':[round(cx,2),round(cy,2)],'confidence':.68,'method':'paired_eye_observation'})
 return found,dark

def hero_in(im,heads,dark):
 hsv=cv.cvtColor(im,cv.COLOR_BGR2HSV);yellow=cv.inRange(hsv,np.array([22,130,145]),np.array([38,255,255]));n,labels,stats,cent=cv.connectedComponentsWithStats(yellow)
 components=[(list(map(int,st[:4])),int(st[4]),list(map(float,c))) for st,c in zip(stats[1:],cent[1:]) if 20<=st[4]<=16000]
 options=[]
 for head in heads:
  x,y,bw,bh=head['box'];hx,hy=head['center']
  for box,area,(cx,cy) in components:
   tx,ty,tw,th=box
   if area<bw*bh*.3 or tw<bw*.5 or th<bh*.55 or th>bh*5 or tw>bw*5 or ty<hy+bh*.16 or ty>hy+bh*2.2 or abs(cx-hx)>max(bw*1.3,tw*.7):continue
   proximity=math.exp(-((cx-hx)/max(1,bw*1.1))**2)*math.exp(-abs(ty-(y+bh)) / max(1,bh))
   options.append((proximity*math.sqrt(area),head,box,area))
 if not options:return None
 score,head,box,area=max(options,key=lambda q:q[0]);hx,hy=head['center'];x,y,bw,bh=head['box'];tx,ty,tw,th=box
 # Yellow shoes are separate components below the selected torso.
 boots=[(b,ar,c)for b,ar,c in components if ar>=8 and 1<b[2]/max(1,b[3])<5 and b[3]<bh*.8 and ar<max(150,area*.23) and b[1]>ty+th*.75 and b[1]<ty+th+bh*4 and abs(c[0]-hx)<max(bw*3,tw)]
 feet=sorted([{'center':[round(c[0],2),round(c[1],2)],'box':b,'confidence':.65}for b,ar,c in boots],key=lambda q:q['center'][1],reverse=True)[:2]
 # Wrist candidates are dark round components touching a yellow sleeve.
 mask=cv.morphologyEx((cv.cvtColor(im,cv.COLOR_BGR2GRAY)<105).astype('uint8')*255,cv.MORPH_OPEN,small_kernel);cs,_=cv.findContours(mask,cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE);near_yellow=cv.dilate(yellow,np.ones((7,7),'uint8'));wrists=[]
 for c in cs:
  bx,by,ww,hh=cv.boundingRect(c);ar=cv.contourArea(c);cx=bx+ww/2;cy=by+hh/2
  if cv.contourArea(c)/max(1,cv.arcLength(c,True)**2)<.022:continue
  if not(2<=ww<=max(12,bw*.65) and 2<=hh<=max(12,bh*.65) and ar>=2 and .4<ww/hh<2 and hy+bh*.35<cy<ty+th+bh*.8 and abs(cx-hx)<max(bw*3.2,tw*1.3)):continue
  if near_yellow[min(h-1,int(cy)),min(w-1,int(cx))]==0:continue
  wrists.append({'center':[round(cx,2),round(cy,2)],'confidence':.55,'box':[bx,by,ww,hh]})
 return {'head':head,'torso':box,'confidence':round(min(.95,head['confidence']*(.7+.3*min(1,score/12))),3),'wristCandidates':wrists,'footCandidates':feet,'anatomicalLabelsVerified':False}

def assign_ids(dets,cut,frame):
 global next_actor,tracks
 if cut:tracks={}
 live=[(k,v)for k,v in tracks.items()if frame-v['last']<9]
 if live and dets:
  cost=np.array([[np.linalg.norm(np.array(d['center'])-np.array(v['point'])) for d in dets]for _,v in live]);rr,cc=linear_sum_assignment(cost)
  for r,c in zip(rr,cc):
   if cost[r,c]<max(36,dets[c]['box'][2]*1.6):dets[c]['id']=live[r][0]
 for d in dets:
  if 'id'not in d:d['id']=next_actor;next_actor+=1
  tracks[d['id']]={'point':d['center'],'last':frame}
 return dets

raw_path=out/'observations.jsonl.gz';raw_stream=gzip.open(raw_path,'wt',encoding='utf-8',compresslevel=3)
f=0
while True:
 ok,im=cap.read()
 if not ok or (a.limit and f>=a.limit):break
 gray=cv.cvtColor(im,cv.COLOR_BGR2GRAY);tiny=cv.resize(gray,(320,180));hsv=cv.cvtColor(cv.resize(im,(160,90)),cv.COLOR_BGR2HSV).astype('float32');mean=float(gray.mean()/255);dark_fraction=float((gray<9).mean());step=None;reliable=False;good=[];feature_summary=[];content=0;diff=0;inlier_ratio=0;model_error=None
 if prev is not None:
  differences=np.abs(hsv-prev_hsv).mean(axis=(0,1));content=float(differences.mean());diff=float(cv.absdiff(gray,prev).mean())
  if points is not None and len(points)>=8:
   moved,status,error=cv.calcOpticalFlowPyrLK(prev,gray,points,None,winSize=(21,21),maxLevel=3,criteria=(cv.TERM_CRITERIA_EPS|cv.TERM_CRITERIA_COUNT,20,.02));back,status2,err2=cv.calcOpticalFlowPyrLK(gray,prev,moved,None,winSize=(21,21),maxLevel=3)
   fb=np.linalg.norm(back-points,axis=2).ravel();keep=status.ravel().astype(bool)&status2.ravel().astype(bool)&(fb<1.2)&(error.ravel()<35)
   old=points.reshape(-1,2)[keep];new=moved.reshape(-1,2)[keep];ids=features_ids[keep]
   if len(old)>=8:
    M,inliers=cv.estimateAffinePartial2D(old,new,method=cv.RANSAC,ransacReprojThreshold=1.4,maxIters=600,confidence=.98)
    if M is not None:
     inlier_ratio=float(inliers.mean());res=np.linalg.norm((old@M[:,:2].T+M[:,2])-new,axis=1);model_error=float(np.median(res[inliers.ravel().astype(bool)]));reliable=inlier_ratio>.35 and int(inliers.sum())>=10
     if reliable:step=[round(float(x),7)for x in M.ravel()]
     # Feature residuals describe independently moving visible points, not invented object labels.
     residuals=new-(old@M[:,:2].T+M[:,2]);feature_summary=[[int(i),round(float(x),2),round(float(y),2),round(float(rx),3),round(float(ry),3)]for i,(x,y),(rx,ry)in zip(ids,new,residuals)]
   good=new if len(old)>=8 else []
  abrupt=(content>24 and diff>16 and inlier_ratio<.42)or(content>39 and diff>28)
  zoom_jump=step is not None and (math.hypot(step[0],step[3])>1.12 or math.hypot(step[0],step[3])<.89) and diff>10
  candidate=abrupt or zoom_jump or (diff>13 and inlier_ratio<.18 and content>14)
 else:candidate=False
 if candidate:cuts.append({'frame':f,'time':round(f/fps,6),'contentScore':round(content,3),'pixelDifference':round(diff,3),'cameraInliers':round(inlier_ratio,3)})
 head,dark=heads_in(im,gray);head=assign_ids(head,candidate,f);hero=hero_in(im,head,dark)
 if reliable:track_frames+=1
 if last_mean is not None and abs(mean-last_mean)>.1:effect_candidates.append({'frame':f,'time':round(f/fps,6),'kind':'luminance_jump','change':round(mean-last_mean,4)})
 row={'lightGridQ4':(cv.resize(gray,(20,12),interpolation=cv.INTER_AREA)//16).ravel().tolist(),'f':f,'t':round(f/fps,6),'camera':step,'cameraConfidence':round(inlier_ratio,3) if reliable else 0,'cameraMedianErrorPx':round(model_error,3)if model_error is not None else None,'heads':head,'hero':hero,'features':feature_summary,'luminance':round(mean,5),'blackFraction':round(dark_fraction,4),'contentScore':round(content,3)}
 masks=[]
 if dark_fraction>.02:
  cs,_=cv.findContours((gray<6).astype('uint8'),cv.RETR_EXTERNAL,cv.CHAIN_APPROX_SIMPLE)
  for c in cs:
   x,y,bw,bh=cv.boundingRect(c)
   if cv.contourArea(c)>w*h*.015 and (x<2 or y<2 or x+bw>w-2 or y+bh>h-2):
    masks.append(cv.approxPolyDP(c,1.7,True).reshape(-1,2).tolist())
 if masks:row['visibleBlackMattes']=masks
 # Dense optical flow is evaluated for all pixels on the reduced grid. Store a
 # regular field as observations, including visible limb/object residual motion.
 if prev is not None:
  flow=flow_engine.calc(prev_tiny,tiny,None);field=cv.resize(flow,(40,23),interpolation=cv.INTER_AREA)*2;row['flowGridQ8']=np.clip(np.rint(field*8),-32768,32767).astype('int16').ravel().tolist()
 if f%60==0 or candidate:
  debug=im.copy()
  for d in head:
   x,y,bw,bh=d['box'];cv.rectangle(debug,(x,y),(x+bw,y+bh),(215,190,70),1);cv.putText(debug,str(d['id']),(x,y-2),cv.FONT_HERSHEY_SIMPLEX,.3,(215,190,70),1)
  if hero:
   x,y,bw,bh=hero['torso'];cv.rectangle(debug,(x,y),(x+bw,y+bh),(0,255,255),1)
   for d in hero['wristCandidates']:cv.circle(debug,tuple(map(int,d['center'])),4,(255,120,230),1)
   for d in hero['footCandidates']:cv.circle(debug,tuple(map(int,d['center'])),4,(120,240,120),1)
  cv.putText(debug,f'{f/fps:.3f}s | bg-fit {inlier_ratio:.2f}',(7,16),cv.FONT_HERSHEY_SIMPLEX,.4,(255,255,255),1);cv.imwrite(str(out/'annotated'/f'f-{f:05d}.jpg'),debug,[cv.IMWRITE_JPEG_QUALITY,85])
 raw_stream.write(json.dumps(row,separators=(',',':'))+'\n')
 rows.append({k:v for k,v in row.items()if k not in ['features','flowGridQ8']})
 # Retain feature IDs for as long as forward/backward flow is valid.
 if candidate or prev is None or len(good)<8:
  points=cv.goodFeaturesToTrack(gray,maxCorners=320,qualityLevel=.012,minDistance=7,blockSize=5)
  if points is not None:features_ids=np.arange(next_feature,next_feature+len(points));next_feature+=len(points)
 else:
  points=np.array(good,dtype='float32').reshape(-1,1,2);features_ids=ids
  if len(points)<220 or f%20==0:
   mask=np.ones(gray.shape,'uint8')*255
   for q in points.reshape(-1,2):cv.circle(mask,tuple(np.rint(q).astype(int)),7,0,-1)
   extra=cv.goodFeaturesToTrack(gray,maxCorners=max(1,320-len(points)),qualityLevel=.015,minDistance=7,mask=mask,blockSize=5)
   if extra is not None:
    points=np.concatenate([points,extra]);features_ids=np.concatenate([features_ids,np.arange(next_feature,next_feature+len(extra))]);next_feature+=len(extra)
 prev,prev_hsv,prev_tiny,last_mean=gray,hsv,tiny,mean;f+=1
 if f%300==0:print(json.dumps({'frames':f,'expected':expected,'seconds':round(time.time()-started,1),'cutCandidates':len(cuts)}),flush=True)
cap.release();raw_stream.close()
# Collapse adjacent candidates, preserving the strongest frame in each transition.
clusters=[]
for c in cuts:
 if clusters and c['frame']-clusters[-1][-1]['frame']<=5:clusters[-1].append(c)
 else:clusters.append([c])
selected=[max(c,key=lambda q:q['contentScore'])for c in clusters];bounds=[0]+[c['frame']for c in selected if c['frame']>=6 and c['frame']<f-3]+[f]
# Keep short flashes in the effect list rather than label them normal long takes.
bounds=sorted(set(bounds));takes=[];first_minute=[]
for i,(start,end)in enumerate(zip(bounds,bounds[1:])):
 frames=rows[start:end];name=f'take-{i+1:03d}.json.gz'
 takes.append({'id':i+1,'startFrame':start,'endFrame':end,'start':round(start/fps,6),'end':round(end/fps,6),'frames':end-start,'data':name,'cameraReliableFrames':sum(q['camera']is not None for q in frames),'heroDetectedFrames':sum(q['hero']is not None for q in frames),'allBlack':all(q['blackFraction']>.98 for q in frames),'manualReviewRequired':True})
index=-1;stream=None
with gzip.open(raw_path,'rt',encoding='utf-8')as raw:
 for line in raw:
  row=json.loads(line)
  if index<0 or row['f']>=takes[index]['endFrame']:
   if stream is not None:stream.write(']');stream.close()
   index+=1;stream=gzip.open(out/takes[index]['data'],'wt',encoding='utf-8',compresslevel=6);stream.write('[');C=np.eye(3);first=True
  if row['camera']is not None:
   M=np.eye(3);M[:2]=np.array(row['camera']).reshape(2,3);C=M@C
  row['take']=index+1;row['cameraFromTakeStart']=[round(float(x),6)for x in C[:2].ravel()]
  if not first:stream.write(',')
  stream.write(json.dumps(row,separators=(',',':')));first=False
  if row['t']<60:first_minute.append({k:v for k,v in row.items()if k not in ['features','flowGridQ8']})
if stream is not None:stream.write(']');stream.close()
raw_path.unlink()
# Audio onset observations use no transcription/service. Source audio is retained.
audio_path=out/'audio-16k.f32';audio_events=[]
subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',a.source,'-vn','-ac','1','-ar','16000','-f','f32le','-y',str(audio_path)],check=True)
if audio_path.exists():
 audio=np.fromfile(audio_path,dtype='<f4');n=len(audio)//320;v=audio[:n*320].reshape(n,320);rms=np.sqrt(np.mean(v*v,axis=1));flux=np.maximum(0,np.diff(rms,prepend=0));ix,_=find_peaks(flux,distance=5,prominence=max(.005,float(np.percentile(flux,90))));audio_events=[{'t':round(float(i)*.02,3),'rms':round(float(rms[i]),5),'onsetStrength':round(float(flux[i]),5),'label':'unclassified_audio_onset'}for i in ix]
(out/'takes.json').write_text(json.dumps({'fps':fps,'width':w,'height':h,'videoFrames':f,'videoDuration':f/fps,'takes':takes},indent=2)+'\n')
(out/'first-minute.json').write_text(json.dumps(first_minute,separators=(',',':'))+'\n')
(out/'effects.json').write_text(json.dumps({'visualObservations':effect_candidates,'audioOnsets':audio_events,'audioSemantics':'Unclassified onsets; not separated music/voice/effects stems.'},indent=2)+'\n')
report={'allFramesProcessed':f==expected,'frames':f,'expectedFrames':expected,'fps':fps,'duration':f/fps,'takes':len(takes),'cameraReliableFrames':track_frames,'headObservedFrames':sum(bool(r['heads'])for r in rows),'heroObservedFrames':sum(r['hero']is not None for r in rows),'audioOnsets':len(audio_events),'featureTrajectories':next_feature,'denseFlowGrid':{'computedWidth':320,'computedHeight':180,'storedWidth':40,'storedHeight':23,'units':'source pixels / frame, quantized eighth-pixels'},'sourceSha256':hashlib.sha256(Path(a.source).read_bytes()).hexdigest(),'seconds':round(time.time()-started,2),'limits':['Automatic take boundaries and actor labels require manual review.','Camera is a measured 2D background affine fit, not solved 3D camera extrinsics.','Head/torso/wrist/foot candidates do not constitute fully verified anatomical motion capture.','All frames are analysed; gaps and occlusions remain flagged rather than invented.']}
(out/'report.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report),flush=True)
