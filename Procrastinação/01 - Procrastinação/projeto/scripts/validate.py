from pathlib import Path
import json, subprocess, hashlib, math

root = Path(__file__).resolve().parents[1]
plan = json.loads((root / 'timeline.json').read_text())
video = root.parent / 'vídeo' / plan.get('output', 'video-1080p60.mp4')

def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout

data = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(video)]))
v = next(s for s in data['streams'] if s['codec_type'] == 'video')
a = next(s for s in data['streams'] if s['codec_type'] == 'audio')
expected = math.ceil(plan['duration'] * 60 - 1e-5)
assert v['avg_frame_rate'] == '60/1'
assert (v['width'], v['height']) == (1920, 1080)
assert v['pix_fmt'] == 'yuv420p' and v['codec_name'] == 'h264'
assert int(v['nb_frames']) == expected
assert abs(float(v['duration']) - expected / 60) < .001
assert float(a['duration']) >= plan['duration'] - .025
assert abs(float(a.get('start_time', 0))) < .025
previous = 0
for s in plan['scenes']:
    assert abs(s['start'] - previous) < 1e-6
    assert s['end'] > s['start']
    previous = s['end']
assert abs(previous - plan['duration']) < 1e-6
run(['ffmpeg', '-v', 'error', '-xerror', '-i', str(video), '-f', 'null', '-'])
report = {'passed': True, 'file': video.name, 'frames': expected, 'fps': 60,
          'width': v['width'], 'height': v['height'], 'duration': float(v['duration']),
          'audio_duration': float(a['duration']), 'full_decode': 'passed',
          'bytes': video.stat().st_size, 'sha256': hashlib.sha256(video.read_bytes()).hexdigest(),
          'audio_source_sha256': hashlib.sha256((root / plan['audio']).read_bytes()).hexdigest()}
(root / 'qa' / 'validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
