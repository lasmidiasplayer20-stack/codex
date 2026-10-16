"""Verify that original rigs, draw functions and previous source files remain untouched."""
from pathlib import Path
import json,hashlib
ROOT=Path(__file__).resolve().parents[1]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
b=json.loads((ROOT/'preserved/compatibility-baseline.json').read_text());old=ROOT/'preserved/base-original/reference-animation/template';assert sha(ROOT/'vendor/rig-controller.js')==b['original_controller_sha256']==sha(old/'rig-controller.js')
for name,digest in b['original_template_files'].items():assert sha(ROOT/'preserved'/name)==digest,name
src=(old/'film.js').read_text();derived=(ROOT/'src/legacy-renderer.js').read_text()
for name,digest in b['actor_functions_sha256'].items():
 start=src.index('function '+name+'(');j=src.index('{',start)+1;depth=1
 while depth:
  if src[j]=='{':depth+=1
  elif src[j]=='}':depth-=1
  j+=1
 block=src[start:j];assert hashlib.sha256(block.encode()).hexdigest()==digest and block in derived,name
previous=ROOT.parent/'whatsapp-2026-10-14';files=json.loads((ROOT/'preserved/previous-system-sha256.json').read_text())
for n,digest in files.items():
 assert sha(ROOT/'preserved/previous-system'/n)==digest,n
 if previous.exists():assert sha(previous/n)==digest,'Live previous source changed: '+n
report={'passed':True,'controller_byte_identical':True,'actor_functions_byte_identical':list(b['actor_functions_sha256']),'preserved_template_files':len(b['original_template_files']),'previous_source_files':len(files),'live_previous_checked':previous.exists(),'originals_modified':False};(ROOT/'exports/preservation-validation.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report))
