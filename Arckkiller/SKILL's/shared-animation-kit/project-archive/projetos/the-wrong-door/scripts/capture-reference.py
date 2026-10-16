"""Rebuild numeric reference measurements and the fixed-proportion animation controls."""
import argparse,subprocess,sys
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('video',type=Path);a=p.parse_args();root=Path(__file__).resolve().parent
for name in ['measure-reference.py','refine-heads.py','capture-performance.py','capture-props.py','refine-endpoints.py','build-motion.py']:
 subprocess.run([sys.executable,str(root/name),str(a.video.resolve())],check=True)
