#!/usr/bin/env python3
"""Replace three classroom intervals with newly rendered native 1080p frames."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
patches = Path(sys.argv[1]).resolve()
base = ROOT / 'analysis/previa-60s-1080p-r2.mp4'
output = ROOT / 'analysis/previa-60s-1080p-r3.mp4'

def video(path):
    data = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(path)]))
    return next(s for s in data['streams'] if s['codec_type'] == 'video')

for path, frames in [(base, 1800), (patches, 336)]:
    v = video(path)
    assert (v['width'], v['height'], int(v['nb_frames']), v['r_frame_rate']) == (1920, 1080, frames, '30/1'), v

intervals = [(0, 0, 249), (1, 0, 156), (0, 405, 540), (1, 156, 276), (0, 660, 780), (1, 276, 336), (0, 840, 1800)]
filters = [f'[{source}:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS[v{i}]' for i, (source, a, b) in enumerate(intervals)]
filters.append(''.join(f'[v{i}]' for i in range(7)) + 'concat=n=7:v=1:a=0[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(base), '-i', str(patches), '-i', str(ROOT / 'audio/reference.m4a'), '-filter_complex', ';'.join(filters), '-map', '[out]', '-map', '2:a:0', '-t', '60', '-r', '30', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-maxrate', '1400k', '-bufsize', '2800k', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', str(output)], check=True)
assert int(video(output)['nb_frames']) == 1800
subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(output), '-f', 'null', '-'], check=True)
report = {'revision': 3, 'output': str(output.relative_to(ROOT)), 'width': 1920, 'height': 1080, 'fps': 30, 'frames': 1800, 'duration': 60, 'rerendered_reference_frame_ranges': [[249, 405], [540, 660], [780, 840]], 'source_frames': 'Native procedural 3D; other intervals retained from R2', 'audio': 'Original AAC copied once', 'full_decode': 'passed', 'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}
(ROOT / 'analysis/preview-1080p-r3.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
