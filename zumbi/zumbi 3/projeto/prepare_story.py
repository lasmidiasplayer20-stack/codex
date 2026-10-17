"""Align the authored script to a local Whisper transcript. No remote ASR."""
from pathlib import Path
import argparse,json,re,difflib,hashlib
import numpy as np
P=Path(__file__).resolve().parent
def norm(s):return re.sub(r'[^a-z0-9]','',s.lower())
def main(raw_path):
 raw=json.loads(Path(raw_path).read_text());words=(P/'script-en.txt').read_text().split();observed=[]
 for i,r in enumerate(raw):
  for start,duration,txt in zip(r['segment_timestamps'],r['segment_durations'],r['segment_texts']):
   ws=txt.split()
   for j,w in enumerate(ws):
    t=r['offset']+start+duration*(j+.5)/max(1,len(ws))
    if t<r['offset']+(1.5 if i else 0):continue
    if i<len(raw)-1 and t>=r['offset']+27.5:continue
    observed.append((norm(w),t))
 a=[norm(w) for w in words];b=[x[0] for x in observed]
 sm=difflib.SequenceMatcher(None,a,b,autojunk=False);known={}
 for block in sm.get_matching_blocks():
  for i in range(block.size):known[block.a+i]=observed[block.b+i][1]
 assert len(known)/len(words)>.88, 'Transcript differs from script; review before aligning'
 idx=sorted(known);times=np.interp(np.arange(len(words)),idx,[known[i] for i in idx])+3
 times=np.maximum.accumulate(times);duration=round((686.16+6)*60)/60
 def find(phrase):
  q=[norm(w) for w in phrase.split()]
  for i in range(len(a)-len(q)+1):
   if a[i:i+len(q)]==q:return i
  raise ValueError(phrase)
 # Every scene is anchored to an actual spoken narrative beat.
 specs=[
 ('name','Her Voice','bank','Rosa said my name','CANAL / SOUTH BANK'),
 ('search','Across the Dark','bank','The canal separated us',None),
 ('approach','The Pumping Station','approach','The maintenance worker could barely','SOUTH BANK / PUMP 04'),
 ('flood','Below the Water','flood','Its upper office was empty',None),
 ('night','The Second Night','night','By the time we secured','PUMP 04 / SECOND NIGHT'),
 ('blink','The Narrow Window','blink','Just before dawn','BEFORE DAWN'),
 ('bridge','The Broken Bridge','bridge','The third morning arrived','DAY THREE'),
 ('plan','Another Crossing','plan','Rosa told us to stop',None),
 ('wound','The Question','wound','While he traced',None),
 ('drain','Downstream','drain','Across the canal Rosa opened','THE LOCK / DOWNSTREAM GATE'),
 ('turn','They Follow Sound','drain','Shapes moved on the road',None),
 ('prepare','Wrapped Keys','prepare','We prepared without speaking',None),
 ('firstcross','The First Steps','cross','The first section of walkway','SERVICE WALKWAY / EAST'),
 ('follow','The Injured Leg','cross','The worker and I started down',None),
 ('squeal','The Sound','cross','Behind us the access gate',None),
 ('hold','The Latch','gate','I shoved the worker onto',None),
 ('chain','One More Loop','chain','Then he pointed',None),
 ('return','He Came Back','cross','By then the officer',None),
 ('escape','Above the Water','escape','We crossed together',None),
 ('reunion','No Static','reunion','On the far bank','CANAL RELAY / NORTH BANK'),
 ('shelter','Somewhere Safe','shelter','There was a small shelter',None),
 ('care','The Open Door','care','Before Rosa could lead',None),
 ('records','Her Signature','records','Later I told Rosa',None),
 ('log','The Call Log','records','She opened a folder',None),
 ('annex','Four Days Earlier','records','The date matched','WEST HOSPITAL ANNEX / CALL RECORD'),
 ('broadcast','The Announcement','broadcast','Before I could ask another',None),
 ('crowds','The Wrong Direction','bridge','We watched a man lift',None),
 ('choice','The Transmitter','warning','Rosa reached for the transmitter',None),
 ('warn','The Warning','warning','Rosa pressed the button',None),
 ('interrupted','Stop Transmitting','interrupt','A second voice cut',None),
 ('channel','The Same Channel','records','What is it I asked',None),
 ('last','Someone Was Listening','warning','Outside the announcement began',None)]
 scenes=[]
 for i,(key,title,kind,phrase,location) in enumerate(specs):
  wi=find(phrase);start=3 if i==0 else round(float(times[wi]),3)
  scenes.append(dict(id=i+1,key=key,title=title,kind=kind,start=start,word_index=wi,location=location))
 for i,s in enumerate(scenes):
  s['end']=scenes[i+1]['start'] if i+1<len(scenes) else duration
  endwi=scenes[i+1]['word_index'] if i+1<len(scenes) else len(words)
  s['narration']=' '.join(words[s['word_index']:endwi]);s.pop('word_index')
  d=s['end']-s['start'];shots=[];at=0;cycle=['wide','medium','detail','medium','wide']
  if s['kind'] in ['bridge','drain']:cycle=['wide','medium','wide']
  while at<d:
   length=min(5.6+(len(shots)%3)*.7,d-at);shots.append(dict(start=round(at,3),end=round(at+length,3),type=cycle[len(shots)%len(cycle)]));at+=length
  s['shots']=shots
 captions=[];group=[];start_idx=0
 for i,w in enumerate(words):
  if not group:start_idx=i
  group.append(w)
  if len(' '.join(group))>=82 or len(group)>=15 or (len(group)>=5 and re.search(r'[.!?]$',w)) or i==len(words)-1:
   start=max(3,float(times[start_idx])-.13);end=float(times[i+1])-.05 if i+1<len(words) else 689.16
   end=max(start+.35,min(end,start+7.5));captions.append(dict(start=round(start,3),end=round(end,3),text=' '.join(group)));group=[]
 for x,y in zip(captions,captions[1:]):x['end']=min(x['end'],y['start'])
 story=dict(title='Day Three — The Other Side',duration=duration,width=1920,height=1080,fps=60,language='en-US',intro_duration=3,outro_duration=3,scenes=scenes,captions=captions)
 (P/'story.json').write_text(json.dumps(story,indent=2,ensure_ascii=False))
 (P/'story.js').write_text('(function(r){const S='+json.dumps(story,ensure_ascii=False)+';if(typeof module!=="undefined")module.exports=S;else r.DayThreeStory=S;})(globalThis);')
 def stamp(t):
  n=round(t*1000);return f'{n//3600000:02}:{n//60000%60:02}:{n//1000%60:02},{n%1000:03}'
 (P.parent/'day-three-en.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(captions))+'\n')
 (P.parent/'qa/alignment-report.json').write_text(json.dumps(dict(method='Local Whisper base.en segments, canonical-word sequence alignment, interpolation within segments',canonical_words=len(words),matched_words=len(known),match_ratio=round(len(known)/len(words),4),caption_cues=len(captions),scenes=len(scenes),duration=duration,source_audio_duration=686.16,intro_offset=3,scope='Segment-based synchronization, not phoneme-level alignment. No headings or numeric production timestamps found in local transcript; no speech cuts applied.'),indent=2))
 (P.parent/'qa/transcript-local.json').write_text(json.dumps(raw,indent=2))
 print(json.dumps({'words':len(words),'match_ratio':len(known)/len(words),'scenes':len(scenes),'captions':len(captions),'duration':duration},indent=2))
 for s in scenes:print(s['id'],s['key'],s['start'],s['end'])
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('transcript');main(ap.parse_args().transcript)
