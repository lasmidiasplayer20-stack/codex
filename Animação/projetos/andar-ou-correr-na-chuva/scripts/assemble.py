"""Atomic master export; optional verified shot replacements for an existing render cache."""
from pathlib import Path
import os,json,subprocess,tempfile,hashlib
ROOT=Path(__file__).resolve().parents[1];os.chdir(ROOT)
(ROOT/'delivery').mkdir(exist_ok=True)
output=Path(os.environ.get('OUTPUT_PATH',str(ROOT/'delivery/Andar-ou-correr-na-chuva-1080p.mp4'))).resolve();output.parent.mkdir(parents=True,exist_ok=True)
current={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'project').iterdir() if p.suffix in ['.js','.mjs','.html']}
metas=[json.loads((ROOT/'render'/f'part-{i:02}.mp4.json').read_text()) for i in range(4)]
base=metas[0]['sourceHashes'];assert all(m['sourceHashes']==base and m['frames']==2880 and not m['errors'] for m in metas)
patches=[];proof=None
if base!=current:
 manifest=json.loads((ROOT/'render/replacements.json').read_text());assert manifest['base_source_hashes']==base and manifest['current_source_hashes']==current
 proof=manifest['proof'];assert proof['sameOutsideReplacements'] and proof['checkedSamples']>20000
 assert proof['beforeSHA']==base['locomotion.js'] and proof['afterSHA']==current['locomotion.js']
 assert {k for k in current if current[k]!=base[k]}=={'locomotion.js'}
 patches=manifest['patches'];assert [(p['start'],p['end']) for p in patches]==[(p['start'],p['end']) for p in proof['ranges']]
 for p in patches:
  f=Path(p['file']);m=json.loads(f.with_suffix('.mp4.json').read_text());assert m['sourceHashes']==current and m['start']==p['start'] and m['frames']==round((p['end']-p['start'])*24) and not m['errors'];assert hashlib.sha256(f.read_bytes()).hexdigest()==p['sha256']
(ROOT/'render/concat.txt').write_text(''.join(f"file 'part-{i:02}.mp4'\n" for i in range(4)))
cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-progress',str(ROOT/'render/encoding-progress.txt'),'-f','concat','-safe','0','-i',str(ROOT/'render/concat.txt'),'-i',str(ROOT/'audio/mix.wav')]
filters=[]
if patches:
 for p in patches:cmd+=['-i',p['file']]
 base_spans=[];cursor=0
 for p in patches:
  if p['start']>cursor:base_spans.append((cursor,p['start']))
  cursor=p['end']
 if cursor<480:base_spans.append((cursor,480))
 filters.append('[0:v]split='+str(len(base_spans))+''.join(f'[old{i}]' for i in range(len(base_spans))))
 for i,(a,b) in enumerate(base_spans):filters.append(f'[old{i}]trim=start_frame={round(a*24)}:end_frame={round(b*24)},setpts=PTS-STARTPTS[base{i}]')
 for i,p in enumerate(patches):filters.append(f'[{i+2}:v]setpts=PTS-STARTPTS[patch{i}]')
 timeline=[]
 for i,(a,b) in enumerate(base_spans):timeline.append((a,f'[base{i}]'))
 for i,p in enumerate(patches):timeline.append((p['start'],f'[patch{i}]'))
 timeline.sort();filters.append(''.join(x[1] for x in timeline)+f'concat=n={len(timeline)}:v=1:a=0,setsar=1[vout]')
 cmd+=['-filter_complex',';'.join(filters),'-map','[vout]','-map','1:a:0']
else:cmd+=['-map','0:v:0','-map','1:a:0','-vf','setsar=1']
fd,tmp=tempfile.mkstemp(prefix=output.stem+'.',suffix='.mp4',dir=output.parent);os.close(fd)
cmd+=['-c:v','libx264','-threads','4','-preset','veryfast','-crf','20','-maxrate','1500k','-bufsize','3000k','-pix_fmt','yuv420p','-r','24','-c:a','aac','-b:a','128k','-ar','48000','-af','apad,atrim=duration=480','-t','480','-movflags','+faststart','-metadata','title=Andar ou correr na chuva? — Revisão cinematográfica R2',tmp]
try:subprocess.run(cmd,check=True);os.replace(tmp,output)
finally:
 if Path(tmp).exists():Path(tmp).unlink()
record={'revision':2,'base_source_hashes':base,'current_source_hashes':current,'replacements':patches,'cache_proof':proof,'output_sha256':hashlib.sha256(output.read_bytes()).hexdigest()}
(ROOT/'delivery/assembly-manifest.json').write_text(json.dumps(record,indent=2));print('Master export complete:',output,flush=True)
