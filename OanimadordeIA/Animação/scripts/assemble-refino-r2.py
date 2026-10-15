"""Assemble the local visual refinement; reference fidelity remains pending."""
from pathlib import Path
import subprocess, json, hashlib, math

ROOT = Path(__file__).resolve().parents[1]
EXPORTS = ROOT / 'exports'

def run(args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout

def probe(path, *args):
    return json.loads(run(['ffprobe', '-v', 'error', *args, '-of', 'json', str(path)]))

def packets(path):
    return probe(path, '-select_streams', 'a', '-show_packets', '-show_data_hash', 'sha256',
                 '-show_entries', 'packet=data_hash,pts_time')['packets']

parts = ['parte-01-previa-r2-1080p60.mp4', 'parte-02-previa-r1-1080p60.mp4',
         'parte-03-previa-r2-1080p60.mp4', 'parte-04-previa-r2-1080p60.mp4',
         'parte-05-previa-r2-1080p60.mp4']
expected = [903, 1737, 1085, 1180, 771]
qa = ROOT / '.qa'
qa.mkdir(exist_ok=True)
entries = ['ffconcat version 1.0']
for name, frames in zip(parts, expected):
    path = EXPORTS / name
    v = probe(path, '-select_streams', 'v', '-show_streams')['streams'][0]
    assert int(v['nb_frames']) == frames and v['avg_frame_rate'] == '60/1', name
    entries += ["file '" + str(path).replace("'", "'\\''") + "'", f'duration {frames/60:.9f}']
concat = qa / 'refino-r2.ffconcat'
concat.write_text('\n'.join(entries) + '\n')
audio_source = EXPORTS / 'video-completo-previa-r1-1080p60.mp4'
output = EXPORTS / 'video-completo-previa-r2-1080p60.mp4'
run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
     '-i', str(concat), '-i', str(audio_source), '-map', '0:v:0', '-map', '1:a:0',
     '-c', 'copy', '-t', '94.6', '-movflags', '+faststart', '-y', str(output)])
run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-xerror', '-i', str(output), '-f', 'null', '-'])
d = probe(output, '-show_streams', '-show_format')
v = next(s for s in d['streams'] if s['codec_type'] == 'video')
assert int(v['nb_frames']) == sum(expected) == 5676
assert v['avg_frame_rate'] == '60/1' and abs(float(v['duration']) - 94.6) < .001
a, b = packets(audio_source), packets(output)
assert len(a) == len(b) == 4074
assert [p['data_hash'] for p in a] == [p['data_hash'] for p in b]
assert all(abs(float(x['pts_time']) - float(y['pts_time'])) < .001 for x, y in zip(a, b))

# Compare decoded samples at every join and the complete unchanged first 3 parts.
def hashes(path):
    return [s.split(',')[-1].strip() for s in run(['ffmpeg', '-v', 'error', '-i', str(path),
             '-map', '0:v:0', '-f', 'framemd5', '-']).splitlines() if s and not s.startswith('#')]

assembled = hashes(output)
offset = 0
joins = []
for i, (name, frames) in enumerate(zip(parts, expected)):
    source = hashes(EXPORTS / name)
    assert len(source) == frames
    assert assembled[offset:offset+frames] == source, name
    joins.append({'part': i+1, 'frames': frames, 'all_decoded_frames_identical_to_part': True})
    offset += frames

report = {'passed': True, 'file': output.name, 'fps': 60, 'frames': 5676, 'duration': 94.6,
          'full_decode': 'passed', 'audio_source': audio_source.name,
          'audio_packets_identical_to_previous_preview': 4074, 'audio_timestamps_preserved': True,
          'parts': joins, 'bytes': output.stat().st_size,
          'sha256': hashlib.sha256(output.read_bytes()).hexdigest(),
          'reference_comparison': 'Pending original MP4; fighting choreography not approved by this report.'}
(EXPORTS / 'full-export-validation-r2.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
