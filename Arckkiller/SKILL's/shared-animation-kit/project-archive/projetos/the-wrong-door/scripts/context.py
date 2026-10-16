from pathlib import Path
import argparse
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('video',nargs='?',type=Path)
args=parser.parse_args();SOURCE=args.video.resolve()if args.video else ROOT/'reference/input.mp4'
WORK=ROOT/'reference/work';WORK.mkdir(parents=True,exist_ok=True)
