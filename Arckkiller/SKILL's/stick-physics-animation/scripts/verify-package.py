"""Verify the complete extracted skill against its SHA-256 manifest."""
import hashlib,json
from pathlib import Path
root=Path(__file__).resolve().parents[1];manifest=json.loads((root/'MANIFEST.json').read_text());expected=manifest['files'];actual={str(p.relative_to(root))for p in root.rglob('*')if p.is_file() and p.name!='MANIFEST.json'}
assert actual==set(expected),{'missing':sorted(set(expected)-actual),'extra':sorted(actual-set(expected))}
for name,row in expected.items():
 p=root/name;assert not p.is_symlink(),name
 assert p.stat().st_size==row['bytes'],name
 assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],name
print('PASS:',len(expected),'files match the package manifest')
