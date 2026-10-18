#!/usr/bin/env python3
"""Decode the complete export and compare audio alignment to the supplied track."""
import array
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
MOVIE = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT.parent.parent / 'vídeos/clone-3d-completo.mp4'

def run(*args):
    return subprocess.check_output(args, stderr=subprocess.PIPE)

def probe(path):
    return json.loads(run('ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(path)))

def samples(path, at):
    raw = run('ffmpeg', '-v', 'error', '-ss', str(at), '-i', str(path), '-t', '2', '-vn', '-ac', '1', '-ar', '16000', '-f', 's16le', '-')
    result = array.array('h')
    result.frombytes(raw)
    if sys.byteorder != 'little':
        result.byteswap()
    return result

metadata = probe(MOVIE)
video = next(x for x in metadata['streams'] if x['codec_type'] == 'video')
audio = next(x for x in metadata['streams'] if x['codec_type'] == 'audio')
assert video['width'] == 640 and video['height'] == 360, video
assert video['r_frame_rate'] == '30/1', video
assert int(video['nb_frames']) == 15762, video
assert abs(float(metadata['format']['duration']) - 525.4) < .08, metadata['format']
assert audio['codec_name'] == 'aac', audio
assert abs(float(audio.get('start_time', 0))) < .05, audio
# -xerror makes any decoder error fail the verification.
subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(MOVIE), '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-'], check=True)
checks = []
for at in [0, 60, 180, 300, 420, 510]:
    original, rendered = samples(ROOT / 'audio/reference.m4a', at), samples(MOVIE, at)
    n = min(len(original), len(rendered))
    a, b = original[:n], rendered[:n]
    assert n > 30000
    norm = math.sqrt(sum(x*x for x in a) * sum(x*x for x in b))
    correlation = sum(x*y for x, y in zip(a, b)) / norm
    assert correlation > .98, (at, correlation)
    checks.append({'at_seconds': at, 'aligned_audio_correlation': correlation})
report = {
    'status': 'passed',
    'movie': str(MOVIE.relative_to(ROOT.parent.parent)),
    'sha256': hashlib.sha256(MOVIE.read_bytes()).hexdigest(),
    'size_bytes': MOVIE.stat().st_size,
    'duration_seconds': float(metadata['format']['duration']),
    'width': video['width'], 'height': video['height'], 'fps': video['r_frame_rate'],
    'video_frames': int(video['nb_frames']), 'full_video_and_audio_decode': 'passed',
    'audio_alignment': checks,
    'fidelity': 'Authored 3D approximation; technical validation is not a frame-for-frame visual match.'
}
(ROOT / 'analysis/export-validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))
