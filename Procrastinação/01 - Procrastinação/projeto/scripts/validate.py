from pathlib import Path
import json, subprocess, hashlib, math, array

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

# Check the actual decoded voice, not just the presence of an audio stream.
# The WAV stays local. AAC is lossy, so compare waveform correlation and gain.
def pcm(path):
    data = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-map', '0:a:0',
                          '-ar', '24000', '-ac', '1', '-f', 'f32le', '-'],
                         check=True, capture_output=True).stdout
    values = array.array('f')
    values.frombytes(data)
    return values

source = pcm(root / plan['audio'])
encoded = pcm(video)
assert len(encoded) >= len(source) - 24
count = min(len(source), len(encoded))

def compare(x, y):
    n = min(len(x), len(y))
    sx = math.fsum(v*v for v in x[:n])
    sy = math.fsum(v*v for v in y[:n])
    dot = math.fsum(u*v for u, v in zip(x[:n], y[:n]))
    return {'correlation': dot / math.sqrt(max(1e-30, sx*sy)),
            'sourceRms': math.sqrt(sx/n), 'outputRms': math.sqrt(sy/n),
            'gainRatio': math.sqrt(sy/max(1e-30,sx))}

voice = compare(source[:count], encoded[:count])
tail = compare(source[max(0,count-48000):count], encoded[max(0,count-48000):count])
assert voice['sourceRms'] > .001 and voice['outputRms'] > .001
assert voice['correlation'] > .98 and .95 < voice['gainRatio'] < 1.05
assert tail['sourceRms'] < 1e-5 or tail['correlation'] > .98
report = {'passed': True, 'file': video.name, 'frames': expected, 'fps': 60,
          'width': v['width'], 'height': v['height'], 'duration': float(v['duration']),
          'audio_duration': float(a['duration']), 'full_decode': 'passed',
          'bytes': video.stat().st_size, 'sha256': hashlib.sha256(video.read_bytes()).hexdigest(),
          'audio_source_sha256': hashlib.sha256((root / plan['audio']).read_bytes()).hexdigest(),
          'voice_waveform_comparison': voice, 'last_two_seconds_comparison': tail,
          'source_audio_samples_24k': len(source), 'output_audio_samples_24k': len(encoded),
          'audio_method': 'Original voice once, original speed and gain, encoded as AAC; no transcription service used.'}
(root / 'qa' / 'validation.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
