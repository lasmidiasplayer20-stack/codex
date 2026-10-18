#!/usr/bin/env python3
"""Join native 1080p parts at exact frame boundaries and copy original audio."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
parts = [Path(p).resolve() for p in sys.argv[1:]]
assert parts, 'Supply native MP4 parts in chronological order.'
rows = []
for path in parts:
    data = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-show_streams', '-of', 'json', str(path)]))
    v = next(s for s in data['streams'] if s['codec_type'] == 'video')
    assert (v['width'], v['height'], v['r_frame_rate']) == (1920, 1080, '30/1'), (path, v)
    frames = int(v['nb_frames'])
    rows.append({'file': str(path), 'frames': frames, 'duration': frames / 30})
assert sum(r['frames'] for r in rows) == 15762, rows
output = ROOT.parent.parent / 'vídeos/clone-3d-completo.mp4'
output.parent.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(prefix='clone-native-') as directory:
    manifest = Path(directory) / 'parts.ffconcat'
    lines = ['ffconcat version 1.0']
    for row in rows:
        escaped = row['file'].replace("'", "'\\''")
        lines.extend([f"file '{escaped}'", f"duration {row['duration']:.12f}"])
    manifest.write_text('\n'.join(lines) + '\n')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(manifest), '-i', str(ROOT / 'audio/reference.m4a'), '-map', '0:v:0', '-map', '1:a:0', '-c', 'copy', '-t', '525.4', '-movflags', '+faststart', str(output)], check=True)
report = {'output': str(output), 'width': 1920, 'height': 1080, 'fps': 30, 'duration': 525.4, 'frames': 15762, 'parts': rows, 'method': 'Native 3D parts joined at exact frame boundaries; original AAC copied once', 'upscaling': False}
(ROOT / 'analysis/render-last.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
