"""Render four contiguous chunks with two workers; preserve failures and logs."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import subprocess,json,time
root=Path(__file__).resolve().parent
(root/'render').mkdir(parents=True,exist_ok=True)

def render(i):
 start=i*120
 output=root/'render'/f'part-{i:02}.mp4'
 cmd=['node',str(root/'project/render.mjs'),'--start',str(start),'--duration','120','--fps','24','--output',str(output)]
 begin=time.time()
 with (root/'render'/f'part-{i:02}.log').open('w') as log:
  subprocess.run(cmd,stdout=log,stderr=subprocess.STDOUT,check=True)
 print(json.dumps({'part':i,'seconds':round(time.time()-begin),'status':'rendered'}),flush=True)
with ThreadPoolExecutor(max_workers=2) as pool:list(pool.map(render,range(4)))
print('All chunks rendered.',flush=True)
