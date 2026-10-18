#!/usr/bin/env python3
"""Validate native MP4 metadata, complete decode, and optional audio alignment."""
import argparse
from array import array
from fractions import Fraction
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys


def run(command):
    return subprocess.check_output(command)


def pcm(path, time, duration):
    data = run(['ffmpeg', '-v', 'error', '-ss', str(time), '-i', str(path),
                '-t', str(duration), '-vn', '-ac', '1', '-ar', '16000',
                '-f', 's16le', 'pipe:1'])
    samples = array('h', data)
    if sys.byteorder != 'little':
        samples.byteswap()
    return samples


def correlation(a, b):
    count = min(len(a), len(b))
    if count < 1600:
        raise ValueError('Too few decoded audio samples')
    a, b = a[:count], b[:count]
    ma, mb = sum(a) / count, sum(b) / count
    va = sum((x - ma) ** 2 for x in a)
    vb = sum((x - mb) ** 2 for x in b)
    if min(va, vb) < count:
        return None  # Silence is not evidence of alignment.
    return sum((x - ma) * (y - mb) for x, y in zip(a, b)) / math.sqrt(va * vb)


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('video', type=Path)
parser.add_argument('--duration', required=True, type=float)
parser.add_argument('--fps', default='30', help='Fraction such as 30 or 30000/1001')
parser.add_argument('--width', default=1920, type=int)
parser.add_argument('--height', default=1080, type=int)
parser.add_argument('--audio-reference', type=Path)
parser.add_argument('--report', type=Path)
args = parser.parse_args()
if args.duration <= 0 or min(args.width, args.height) <= 0:
    parser.error('Duration and dimensions must be positive')
expected_fps = Fraction(args.fps)
if expected_fps <= 0:
    parser.error('FPS must be positive')
video = args.video.resolve(strict=True)
probe = json.loads(run(['ffprobe', '-v', 'error', '-count_frames',
    '-show_streams', '-show_format', '-of', 'json', str(video)]))
streams = probe['streams']
visual = next(s for s in streams if s['codec_type'] == 'video')
checks = {}
checks['dimensions'] = (visual['width'], visual['height']) == (args.width, args.height)
checks['fps'] = Fraction(visual['avg_frame_rate']) == expected_fps
# Nonintegral requests use the nearest representable frame count.
expected_frames = round(args.duration * float(expected_fps))
checks['frames'] = int(visual['nb_read_frames']) == expected_frames
video_duration = float(visual.get('duration', probe['format']['duration']))
checks['duration'] = abs(video_duration - expected_frames / float(expected_fps)) <= .02
subprocess.run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(video),
                '-map', '0:v:0', '-map', '0:a?', '-f', 'null', '-'], check=True)
checks['complete_decode'] = True
samples = []
if args.audio_reference:
    checks['audio_stream'] = any(s['codec_type'] == 'audio' for s in streams)
    if checks['audio_stream']:
        for fraction in [0, .2, .5, .8, .95]:
            start = max(0, min(args.duration * fraction, args.duration - 2))
            value = correlation(pcm(video, start, min(2, args.duration)),
                                pcm(args.audio_reference, start, min(2, args.duration)))
            samples.append({'time': start, 'correlation': value})
        measured = [s['correlation'] for s in samples if s['correlation'] is not None]
        checks['audio_alignment'] = bool(measured) and all(x >= .98 for x in measured)
with video.open('rb') as handle:
    checksum = hashlib.file_digest(handle, 'sha256').hexdigest()
report = {'file': video.name, 'bytes': video.stat().st_size, 'sha256': checksum,
          'expected_frames': expected_frames, 'checks': checks,
          'audio_samples': samples, 'probe': probe,
          'passed': all(checks.values()),
          'limits': 'Does not establish visual fidelity or collision-free animation.'}
result = json.dumps(report, indent=2) + '\n'
if args.report:
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(result)
print(result, end='')
raise SystemExit(0 if report['passed'] else 1)
