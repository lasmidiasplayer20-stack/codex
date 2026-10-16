from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1];expected=json.loads((root/'qa/character-provenance.json').read_text())['immutableCharacterFiles']
for name,h in expected.items():assert hashlib.sha256((root/name).read_bytes()).hexdigest()==h,name
print('PASS: original character model, math, adapter, drawing and FK hashes.')
