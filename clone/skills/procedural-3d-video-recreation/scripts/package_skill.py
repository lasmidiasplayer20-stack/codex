#!/usr/bin/env python3
"""Build a portable skill ZIP, excluding installed dependencies and local outputs."""
import argparse
import hashlib
import json
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', type=Path, default=root.parent / (root.name + '.zip'))
args = parser.parse_args()
output = args.output.resolve()
if output.is_relative_to(root):
    parser.error('Write the archive outside the skill folder')
excluded = {'node_modules', '__pycache__', '.git', '.cache'}
files = [p for p in sorted(root.rglob('*')) if p.is_file() and not p.is_symlink()
         and not excluded.intersection(p.relative_to(root).parts)
         and p.suffix not in {'.pyc', '.mp4', '.log'}
         and p.name != 'checksums.json']
manifest = {p.relative_to(root).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in files}
output.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for p in files:
        info = zipfile.ZipInfo((Path(root.name) / p.relative_to(root)).as_posix())
        info.date_time = (2026, 1, 1, 0, 0, 0)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        archive.writestr(info, p.read_bytes())
    info = zipfile.ZipInfo(root.name + '/checksums.json')
    info.date_time = (2026, 1, 1, 0, 0, 0)
    info.compress_type = zipfile.ZIP_DEFLATED
    info.external_attr = 0o644 << 16
    archive.writestr(info, json.dumps(manifest, indent=2) + '\n')
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None
print(json.dumps({'archive': output.name, 'files': len(files) + 1,
                  'bytes': output.stat().st_size,
                  'sha256': hashlib.sha256(output.read_bytes()).hexdigest()}, indent=2))
