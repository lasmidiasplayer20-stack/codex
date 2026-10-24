"""Re-render only the two comparison shots after the sidewalk-lane correction."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,json,hashlib
ROOT=Path(__file__).resolve().parents[1]
ranges=[(50,60),(432,440)]
def job(pair):
 start,end=pair;out=ROOT/'render'/f'replacement-{start}.mp4'
 with out.with_suffix('.log').open('w') as log:subprocess.run(['node',str(ROOT/'project/render.mjs'),'--start',str(start),'--duration',str(end-start),'--fps','24','--output',str(out)],stdout=log,stderr=subprocess.STDOUT,check=True)
 return {'start':start,'end':end,'file':str(out),'sha256':hashlib.sha256(out.read_bytes()).hexdigest()}
with ThreadPoolExecutor(max_workers=2) as pool:patches=list(pool.map(job,ranges))
current={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'project').iterdir() if p.suffix in ['.js','.mjs','.html']}
base=json.loads((ROOT/'render/base-hashes.json').read_text())
manifest={'base_source_hashes':base,'current_source_hashes':current,'patches':patches,'proof':json.loads((ROOT/'qa/reuso-cache-v2.json').read_text())}
(ROOT/'render/replacements.json').write_text(json.dumps(manifest,indent=2));print('Replacement shots completed.',flush=True)
