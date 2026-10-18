#!/usr/bin/env python3
"""Lossless, seekable storage: original per-take gzip members, with byte ranges."""
import sys,json,gzip,hashlib,csv,io
from pathlib import Path
root=Path(__file__).resolve().parents[1];out=root/'tracking';parts=out/'archives';parts.mkdir(exist_ok=True);plan=json.loads((out/'takes.json').read_text());index={'format':'concatenated-gzip-members-v1','sourceSha256':json.loads((out/'report.json').read_text())['sourceSha256'],'fps':30,'frames':15759,'parts':[],'takes':[]};part=bytearray();pi=1;expected=0;cam=io.StringIO();writer=csv.writer(cam);writer.writerow(['frame','seconds','automatic_take','a','b','tx','c','d','ty','confidence','median_error_px','hero_observed'])
def flush():
 global pi,part
 if not part:return
 name=f'archives/tracks-{pi:02d}.bin';data=bytes(part);(out/name).write_bytes(data);index['parts'].append({'path':name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()});part=bytearray();pi+=1
for take in plan['takes']:
 data=(out/take['data']).read_bytes();rows=json.loads(gzip.decompress(data));assert rows[0]['f']==expected
 for row in rows:
  assert row['f']==expected;expected+=1;writer.writerow([row['f'],row['t'],row['take'],*(row['camera']or['']*6),row['cameraConfidence'],row.get('cameraMedianErrorPx',''),int(row['hero']is not None)])
 if len(part)+len(data)>9*1024*1024:flush()
 entry={**take,'archive':f'archives/tracks-{pi:02d}.bin','offset':len(part),'length':len(data),'sha256':hashlib.sha256(data).hexdigest()};index['takes'].append(entry);part+=data
flush();assert expected==15759
(out/'camera.csv.gz').write_bytes(gzip.compress(cam.getvalue().encode(),compresslevel=9,mtime=0));(out/'full-index.json').write_text(json.dumps(index,ensure_ascii=False,separators=(',',':'))+'\n');(out/'integrity.json').write_text(json.dumps({'passed':True,'frames':expected,'allFramesContiguous':True,'takes':len(index['takes']),'parts':len(index['parts']),'bytes':sum(p['bytes']for p in index['parts']),'lossless':'Original per-take gzip bytes preserved; SHA-256 indexed for each member and archive.'},indent=2)+'\n');print((out/'integrity.json').read_text())
