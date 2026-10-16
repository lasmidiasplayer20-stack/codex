"""Create an independent original-film or reference-adaptation working example."""
import argparse,json,shutil
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('destination',type=Path);p.add_argument('--name',default='My Animation');p.add_argument('--template',choices=['original','reference'],default='original');a=p.parse_args()
root=Path(__file__).resolve().parents[1];dest=a.destination.resolve()
if dest.exists():raise SystemExit('Destination already exists; choose a new directory.')
project='dont-press-play'if a.template=='original'else'the-wrong-door';src=root/'project-archive/projetos'/project
ignored=['qa','SOURCE-INSTRUCTIONS.md','node_modules','production','__pycache__']
if a.template=='original':ignored.append('master.m4a')
shutil.copytree(src,dest,ignore=shutil.ignore_patterns(*ignored));(dest/'qa').mkdir();(dest/'production/parts').mkdir(parents=True)
f=dest/'tools.mjs';s=f.read_text().replace("executablePath:'/usr/bin/chromium',","...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),");f.write_text(s)
f=dest/'assemble.py';s=f.read_text()
if 'import subprocess,json,hashlib,os'not in s:s=s.replace('import subprocess,json,hashlib','import subprocess,json,hashlib,os')
s=s.replace("DEST=ROOT.parents[1]/'Vídeos/Dont-Press-Play'","DEST=Path(os.environ.get('ANIMATION_VIDEO_DIR',str(ROOT/'Vídeos')))").replace("ROOT.parents[1]/'Vídeos/The-Wrong-Door'","ROOT/'Vídeos'");f.write_text(s)
f=dest/'review-decoded.py';s='import os\n'+f.read_text();s=s.replace("film=root.parents[1]/'Vídeos/Dont-Press-Play/Dont-Press-Play-1080p60.mp4'","film=Path(os.environ.get('ANIMATION_VIDEO_DIR',str(root/'Vídeos')))/'Dont-Press-Play-1080p60.mp4'").replace("movie=R.parents[1]/'Vídeos/The-Wrong-Door/The-Wrong-Door-1080p60.mp4'","movie=Path(os.environ.get('ANIMATION_VIDEO_DIR',str(R/'Vídeos')))/'The-Wrong-Door-1080p60.mp4'");f.write_text(s)
seconds=210 if a.template=='original'else 118.75
(dest/'PROJECT.md').write_text('# '+a.name+'\n\nRunnable '+a.template+' example initialized from the animation library. Author or retarget the new scene before delivery. The current example runs for '+str(seconds)+' seconds; all duration-dependent loops must change together for another runtime. Read the skill production and validation guides. Update the example output filename to the new title.\n')
(dest/'.gitignore').write_text('node_modules/\n.venv/\n__pycache__/\nproduction/\nqa/frames/\nqa/*.h264\naudio/*.wav\nreference/work/\nreference/*.mp4\n')
print(json.dumps({'created':str(dest),'title':a.name,'template':project,'duration':seconds,'new_story_authored':False}))
