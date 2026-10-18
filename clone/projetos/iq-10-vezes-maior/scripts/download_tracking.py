#!/usr/bin/env python3
"""Download only public tracking archives; SHA-256 comes from the local index."""
import argparse,json,hashlib,urllib.request,os
from pathlib import Path
root=Path(__file__).resolve().parents[1];base=root/'tracking';p=argparse.ArgumentParser();p.add_argument('--base-url',default='https://raw.githubusercontent.com/lasmidiasplayer20-stack/codex/entrega-animacao-20261014-caf07810/clone/projetos/iq-10-vezes-maior/tracking/');a=p.parse_args();index=json.loads((base/'full-index.json').read_text())
for part in index['parts']:
 dest=(base/part['path']).resolve();assert dest.is_relative_to(base.resolve());dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists()and hashlib.sha256(dest.read_bytes()).hexdigest()==part['sha256']:print('OK',part['path']);continue
 temp=dest.with_suffix('.download');h=hashlib.sha256();size=0
 with urllib.request.urlopen(a.base_url.rstrip('/')+'/'+part['path'])as src,temp.open('wb')as out:
  while data:=src.read(1024*1024):out.write(data);h.update(data);size+=len(data)
 if size!=part['bytes']or h.hexdigest()!=part['sha256']:temp.unlink(missing_ok=True);raise RuntimeError('Integridade inválida: '+part['path'])
 os.replace(temp,dest);print('OK',part['path'])
