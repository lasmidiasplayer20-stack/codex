"""Generate reusable sound effects. Credentials remain outside this repository."""
import argparse,json,re,urllib.request,urllib.error
from pathlib import Path
SOUNDS={
 'machine':('A playful automated gift factory starting up: conveyor motor whirr, clockwork gears engaging and light rubber rollers spinning. Detailed cartoon industrial Foley, no speech, no music.',3.0),
 'parcel':('One small wrapped cardboard gift box tumbling onto a rubber conveyor: papery rustle, soft hollow cardboard knock and a ribbon flutter. Clean isolated Foley, no voice, no music.',1.0),
 'shutter':('A small industrial safety shutter sliding shut with a quick metal rattle and a firm mechanical latch. Friendly animation Foley, no voice or music.',1.4),
 'printer':('A whimsical pneumatic gift wrapping machine releases one parcel: short air hiss, rapid paper fold and a soft bright pop. Isolated cartoon Foley, no voice or music.',1.0)
}
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--credentials',type=Path,required=True);args=parser.parse_args()
 text=args.credentials.read_text();idx=text.lower().index('lasmidiasplayer20')+len('lasmidiasplayer20');match=re.search(r'sk_[A-Za-z0-9_-]+',text[idx:])
 if not match:raise SystemExit('Requested account key not found')
 key=match.group();root=Path(__file__).resolve().parent/'audio/elevenlabs';root.mkdir(exist_ok=True)
 manifest=[]
 for name,(prompt,duration)in SOUNDS.items():
  target=root/(name+'.mp3')
  if not target.exists():
   data=json.dumps({'text':prompt,'duration_seconds':duration,'prompt_influence':.35,'model_id':'eleven_text_to_sound_v2'}).encode()
   req=urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128',data=data,headers={'xi-api-key':key,'Content-Type':'application/json'},method='POST')
   try:
    with urllib.request.urlopen(req,timeout=120)as response:audio=response.read()
   except (urllib.error.HTTPError,urllib.error.URLError)as e:
    print('ElevenLabs request unavailable:',name,'HTTP',getattr(e,'code','network error'));return 2
   if len(audio)<1000:raise SystemExit('Audio response unexpectedly small')
   target.write_bytes(audio)
  manifest.append({'file':target.name,'prompt':prompt,'requested_seconds':duration,'provider':'ElevenLabs','model':'eleven_text_to_sound_v2'})
  print('Generated:',target.name)
 (root/'factory-manifest.json').write_text(json.dumps(manifest,indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
