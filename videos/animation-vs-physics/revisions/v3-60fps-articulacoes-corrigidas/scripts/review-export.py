"""Compatibility entrypoint for the V3 encoded-video review."""
import sys,runpy
from pathlib import Path
if '--out' not in sys.argv:sys.argv.extend(['--out',str(Path(__file__).resolve().parents[1]/'.qa/review-final')])
runpy.run_path(str(Path(__file__).with_name('review-v3.py')),run_name='__main__')
