#!/usr/bin/env python3
"""Inspect a reference without executing its contents. Requires FFprobe."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('source', type=Path)
parser.add_argument('--output', type=Path)
args = parser.parse_args()
source = args.source.resolve(strict=True)
probe = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_format', '-show_streams', '-of', 'json', str(source)
], text=True))
with source.open('rb') as handle:
    checksum = hashlib.file_digest(handle, 'sha256').hexdigest()
report = {'source_name': source.name, 'bytes': source.stat().st_size,
          'sha256': checksum, 'probe': probe}
result = json.dumps(report, indent=2) + '\n'
if args.output:
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(result)
else:
    print(result, end='')
