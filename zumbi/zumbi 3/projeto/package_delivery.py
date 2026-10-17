"""Create the portable episode package, verify CRC and publish checksums."""
from pathlib import Path
import hashlib,json,zipfile
ROOT=Path(__file__).resolve().parent.parent;dest=ROOT/'day-three-editavel.zip'
excluded={'node_modules','__pycache__','rendered','Vídeos'}
files=[p for p in sorted(ROOT.rglob('*')) if p.is_file() and not p.is_symlink() and not any(x in excluded for x in p.relative_to(ROOT).parts) and p.suffix.lower() not in {'.wav','.zip','.sha256'} and p.name!='SHA256SUMS.txt']
def build(items):
 with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for p in items:z.write(p,'day-three/'+p.relative_to(ROOT).as_posix())
build(files)
if dest.stat().st_size>=32*1024*1024:
 files=[p for p in files if not (p.parent.name=='qa' and p.suffix.lower() in {'.jpg','.png'})];build(files)
assert dest.stat().st_size<32*1024*1024,'Portable package exceeds 32 MiB'
with zipfile.ZipFile(dest) as z:
 assert z.testzip() is None
 names=set(z.namelist())
 for required in ['projeto/index.html','projeto/story.json','projeto/assets/mix-final.mp3','projeto/assets/narration.m4a','day-three-en.srt','capa/day-three-thumbnail.jpg','youtube-metadata.md']:
  assert 'day-three/'+required in names,required
 assert not any('/node_modules/' in x or x.endswith('.wav') or 'variavel' in x.lower() for x in names)
targets=[ROOT/'Vídeos/day-three-someone-was-listening-1080p60.mp4',dest,ROOT/'day-three-en.srt',ROOT/'capa/day-three-thumbnail.jpg',ROOT/'youtube-metadata.md'];checks=[]
for p in targets:
 digest=hashlib.sha256(p.read_bytes()).hexdigest();checks.append(digest+'  '+p.relative_to(ROOT).as_posix())
 if p==dest:(ROOT/(p.name+'.sha256')).write_text(digest+'  '+p.name+'\n')
(ROOT/'SHA256SUMS.txt').write_text('\n'.join(checks)+'\n')
print(json.dumps({'zip':dest.name,'bytes':dest.stat().st_size,'mib':round(dest.stat().st_size/1024/1024,2),'files':len(files),'crc_passed':True},indent=2))
