#!/usr/bin/env python3
"""Verify and unpack all original observations from the seekable archives."""
import json,hashlib,gzip,argparse
from pathlib import Path
root=Path(__file__).resolve().parents[1];p=argparse.ArgumentParser();p.add_argument('--out',type=Path,default=root/'tracking'/'unpacked');a=p.parse_args();a.out.mkdir(parents=True,exist_ok=True);base=root/'tracking';index=json.loads((base/'full-index.json').read_text());parts={};expected=0
for item in index['parts']:
 data=(base/item['path']).read_bytes();assert len(data)==item['bytes'];assert hashlib.sha256(data).hexdigest()==item['sha256'];parts[item['path']]=data
for take in index['takes']:
 data=parts[take['archive']][take['offset']:take['offset']+take['length']];assert hashlib.sha256(data).hexdigest()==take['sha256'];rows=json.loads(gzip.decompress(data))
 for row in rows:assert row['f']==expected;expected+=1
 (a.out/take['data']).write_bytes(data)
assert expected==index['frames'];print(json.dumps({'passed':True,'frames':expected,'takes':len(index['takes']),'output':str(a.out)},ensure_ascii=False))
