"""Verify all packaged files against the extracted bundle manifest."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parent
m=json.loads((root/'PACKAGE-MANIFEST.json').read_text())
for name,r in m['files'].items():
 p=root/name
 assert p.is_file()and not p.is_symlink(),name
 assert p.stat().st_size==r['bytes'],name
 assert hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256'],name
print('PASS:',len(m['files']),'bundle files verified')
