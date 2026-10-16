"""Generate original ElevenLabs foley. Credentials stay outside the repository.
Use ELEVENLABS_API_KEY or --credentials-file with the user's authorized file.
"""
import argparse,json,os,re,sys,urllib.request,urllib.error
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('--credentials-file',type=Path);args=p.parse_args()
key=os.environ.get('ELEVENLABS_API_KEY')
if args.credentials_file:
 lines=[x.strip() for x in args.credentials_file.read_text().splitlines() if x.strip()]
 start=next(i for i,s in enumerate(lines) if 'lasmidiasplayer20' in s)+1
 key=next((m.group() for s in lines[start:] for m in [re.search(r'(?:sk_)?[A-Za-z0-9_-]{30,}',s)] if m),None)
if not key:sys.exit('Missing ELEVENLABS_API_KEY or authorized credential file; never put keys in Git.')
root=Path(__file__).parent/'audio';root.mkdir(exist_ok=True)
items=[
 ('button',2,'One chunky industrial red push button click, springy mechanical clack followed by a tiny happy electronic chirp. Clean cartoon science-fiction foley, no voice, no music.'),
 ('gravity',5,'A playful sci-fi gravity inverter powering up: descending electric hum suddenly turns into an ascending shimmering magnetic whoosh, then a funny elastic wobble. Clean sound effect only, no speech or music.'),
 ('bonk',2,'One soft funny hollow cartoon head bump against a metal ceiling, a wooden clonk with a short springy boing tail. Gentle slapstick, no voice, no music.'),
 ('whoosh',3,'A fast airy cartoon swoosh of a character spinning and sliding across a room, with a light rising whistle. Clean foley, no voice, no music.'),
 ('rope',3,'A nylon rescue rope whips through the air, snaps taut, and creaks under tension. Dramatic but playful sound design, clean foley, no voice or music.'),
 ('alarm',5,'A retro laboratory warning alarm, warm low electronic pulses alternating two tones with ticking machinery underneath. Urgent sci-fi, no voice, no music.'),
 ('crack',3,'A metal laboratory floor panel creaks then buckles with a sharp mechanical crack and tiny falling debris. Cinematic foley, no voice, no music.'),
 ('drone',4,'A tiny friendly flying robot buzzes closer, propellers whirring, then makes two cheerful electronic chirps. Cute expressive sci-fi foley, no speech, no music.'),
 ('chime',4,'A magical technological success sound: bright warm crystalline chimes rising in a sparkling arpeggio with a gentle release of energy. Sound effect only, no voice or background music.')]
results=[]
for name,duration,prompt in items:
 target=root/(name+'.mp3')
 if not target.exists():
  req=urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation',data=json.dumps({'text':prompt,'duration_seconds':duration,'prompt_influence':.45,'model_id':'eleven_text_to_sound_v2'}).encode(),headers={'xi-api-key':key,'Content-Type':'application/json'})
  try:
   with urllib.request.urlopen(req,timeout=100) as r:
    assert r.headers.get('Content-Type','').startswith('audio/'),'Response was not audio'
    target.write_bytes(r.read())
  except urllib.error.HTTPError as e:sys.exit(f'ElevenLabs HTTP {e.code}: '+e.read().decode(errors='replace').replace(key,'[REDACTED]')[:500])
  except urllib.error.URLError as e:sys.exit('ElevenLabs network failure: '+str(e.reason).replace(key,'[REDACTED]'))
 results.append({'file':target.name,'source':'ElevenLabs Text to Sound v2','prompt':prompt,'requestedDuration':duration});print('Gerado:',target.name,flush=True)
(root/'elevenlabs-manifest.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
