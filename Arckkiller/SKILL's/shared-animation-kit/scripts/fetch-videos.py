"""Fetch a selected complete source film and verify the archived checksum."""
import argparse,hashlib,json,urllib.request
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--list',action='store_true');p.add_argument('--id');p.add_argument('--output',type=Path);a=p.parse_args()
root=Path(__file__).resolve().parents[1];videos=json.loads((root/'references/VIDEO-CATALOG.json').read_text())['videos']
if a.list:
 for v in videos:print(v['id'],v['bytes'],v['url'])
 raise SystemExit(0)
if not a.id or not a.output:p.error('--id and --output are required unless --list is used')
v=next((v for v in videos if v['id']==a.id),None)
if not v:raise SystemExit('Unknown movie id')
if 'Vídeos' not in a.output.resolve().parts:raise SystemExit('Choose an output directory inside Vídeos')
a.output.mkdir(parents=True,exist_ok=True);dest=a.output/v['filename'];temp=dest.with_suffix('.download')
if dest.exists():raise SystemExit('Destination exists; preserving it')
try:
 with urllib.request.urlopen(v['download_url'],timeout=120)as response,temp.open('xb')as f:
  while data:=response.read(1024*1024):f.write(data)
 with temp.open('rb')as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
 if temp.stat().st_size!=v['bytes']or digest!=v['sha256']:raise ValueError('Downloaded movie checksum mismatch')
 temp.replace(dest)
finally:
 if temp.exists():temp.unlink()
print('Verified complete film:',dest)
