from pathlib import Path
import json
r=Path(__file__).resolve().parent;s=json.loads((r/'story.json').read_text(encoding='utf-8'))
assert 480<=s['duration']<=540 and len(s['scenes'])==24
(r/'story.js').write_text('(function(r){const S='+json.dumps(s,ensure_ascii=False)+';if(typeof module!=="undefined")module.exports=S;else r.DayTwoStory=S;})(globalThis);',encoding='utf-8')
print('story.js atualizado')
