from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
for name,expected in json.loads((root/'preserved/hashes.json').read_text()).items():
 p=root/'preserved'/name
 assert hashlib.sha256(p.read_bytes()).hexdigest()==expected,name
for name in ['vendor/rig-controller.js','src/model.js','src/legacy-renderer.js','src/rig-adapter.js']:
 assert (root/name).read_bytes()==(root/'preserved/v3'/name).read_bytes(),name
print('PASS: original FK, model, drawing functions and V3 adapter are byte-identical; preservation hashes match.')
