"""Validate the full procedural export and preserved AAC payloads with FFmpeg."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess


def probe(path):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(path)
    ]))


def audio_hashes(path):
    data = json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_packets',
        '-show_entries', 'packet=data_hash', '-show_data_hash', 'sha256', '-of', 'json', str(path)
    ]))
    return [p['data_hash'] for p in data['packets']]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('video', type=Path)
    parser.add_argument('--audio', type=Path, default=Path(__file__).parent / 'soundtrack.m4a')
    args = parser.parse_args()
    info = probe(args.video)
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    a = next(s for s in info['streams'] if s['codec_type'] == 'audio')
    assert (v['width'], v['height']) == (1920, 1080)
    assert v['avg_frame_rate'] == '60/1'
    # FFprobe reports full-range 8-bit 4:2:0 as yuvj420p for the JPEG-fed renderer.
    assert v['codec_name'] == 'h264' and v['pix_fmt'] in ('yuv420p', 'yuvj420p')
    if v['pix_fmt'] == 'yuvj420p':
        assert v.get('color_range') == 'pc'
    expected=float(probe(args.audio)['format']['duration'])
    assert abs(float(info['format']['duration']) - expected) < 1 / 60 + .002
    assert abs(int(v['nb_frames'])-round(expected*60))<=1
    source_hashes, output_hashes = audio_hashes(args.audio), audio_hashes(args.video)
    assert source_hashes == output_hashes, 'AAC audio packet payloads differ'
    assert a['codec_name'] == 'aac' and a['channels'] == 2
    subprocess.run(['ffmpeg', '-hide_banner', '-v', 'error', '-xerror', '-i', str(args.video),
                    '-map', '0:v:0', '-map', '0:a:0', '-f', 'null', '-'], check=True)
    with args.video.open('rb') as f:
        sha = hashlib.file_digest(f, 'sha256').hexdigest()
    result = {'file': args.video.name, 'bytes': args.video.stat().st_size, 'sha256': sha,
              'video': {'width': v['width'], 'height': v['height'], 'fps': v['avg_frame_rate'],
                        'frames': int(v['nb_frames']), 'duration': info['format']['duration'],
                        'pixel_format': v['pix_fmt'], 'color_range': v.get('color_range')},
              'audio_payloads_identical': True, 'audio_packets': len(output_hashes), 'full_decode_passed': True}
    args.video.with_suffix('.validation.json').write_text(json.dumps(result, indent=2))
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
