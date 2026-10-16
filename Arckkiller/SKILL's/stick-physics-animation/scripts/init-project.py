"""Create an independent working copy of the validated production example."""
import argparse,json,shutil
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('destination',type=Path);p.add_argument('--name',default='My Animation');a=p.parse_args()
root=Path(__file__).resolve().parents[1];dest=a.destination.resolve()
if dest.exists():raise SystemExit('Destination already exists; choose a new directory.')
src=root/'project-archive/projetos/dont-press-play'
shutil.copytree(src,dest,ignore=shutil.ignore_patterns('qa','SOURCE-INSTRUCTIONS.md','node_modules','production','master.m4a'))
(dest/'qa').mkdir();(dest/'production/parts').mkdir(parents=True)
f=dest/'tools.mjs';s=f.read_text();s=s.replace("executablePath:'/usr/bin/chromium',","...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),");f.write_text(s)
f=dest/'assemble.py';s=f.read_text().replace('import subprocess,json,hashlib','import subprocess,json,hashlib,os').replace("DEST=ROOT.parents[1]/'Vídeos/Dont-Press-Play'","DEST=Path(os.environ.get('ANIMATION_VIDEO_DIR',str(ROOT/'Vídeos')))");f.write_text(s)
f=dest/'review-decoded.py';s=f.read_text().replace('import cv2,json','import cv2,json,os').replace("film=root.parents[1]/'Vídeos/Dont-Press-Play/Dont-Press-Play-1080p60.mp4'","film=Path(os.environ.get('ANIMATION_VIDEO_DIR',str(root/'Vídeos')))/'Dont-Press-Play-1080p60.mp4'");f.write_text(s)
(dest/'PROJECT.md').write_text('# '+a.name+'\n\nRunnable factory example initialized from the animation skill. Author a new story, setting, choreography and sound arrangement before delivery. Runtime is currently fixed at 210 seconds. Read the skill production and validation guides.\n')
(dest/'.gitignore').write_text('node_modules/\n.venv/\n__pycache__/\nproduction/\nqa/frames/\nqa/*.h264\naudio/*.wav\n')
print(json.dumps({'created':str(dest),'title':a.name,'template':'dont-press-play','new_story_authored':False}))
