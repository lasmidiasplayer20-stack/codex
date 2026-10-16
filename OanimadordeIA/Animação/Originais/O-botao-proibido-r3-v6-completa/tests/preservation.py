from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
for name,expected in json.loads((root/'preserved/hashes.json').read_text()).items():
 assert hashlib.sha256((root/'preserved'/name).read_bytes()).hexdigest()==expected,name
for name in ['vendor/rig-controller.js','src/model.js','src/legacy-renderer.js','src/rig-adapter.js']:
 assert (root/name).read_bytes()==(root/'preserved/v5'/name).read_bytes(),name
print('PASS: original FK, profile, drawing and adapter preserved byte for byte; all backup hashes match.')
