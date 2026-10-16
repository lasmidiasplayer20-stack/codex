"""Generate reusable sound effects. Credentials remain outside this repository."""
import argparse,json,re,urllib.request,urllib.error
from pathlib import Path
SOUNDS={
 'rewind':('A playful cinematic time rewind: a tiny mechanical button click followed by a rising reversed tape swoosh, little clock gears rushing backwards, ending with a crisp magical pop. No music, no speech.',2.0),
 'spring':('Single cartoon spring catapult launch, a short wooden clack and elastic resonant boing, bright whimsical family animation sound design. Isolated sound effect, no music, no speech.',1.5),
 'catch':('Gentle hands catching a cake on a metal tray, soft cloth contact and a tiny ceramic rattle. Whimsical detailed Foley. Isolated, no music or speech.',1.0),
 'clatter':('Brief funny clatter of lightweight baking utensils and a rolling metal tray, harmless kitchen slapstick. Isolated sound, no music or speech.',2.0),
 'whoosh':('One quick airy cartoon swish as a character leaps through the air, soft and detailed, short clean tail. Isolated, no music, no speech.',1.0),
 'break':('A tiny futuristic remote control runs out of power: electrical sputter, three descending digital blips, one little spring snapping and a sad final click. No music or voice.',2.0),
 'splat':('Small comical whipped cream splat followed by a soft wet plop. Friendly light cartoon Foley, not gross. No music, no speech.',1.0),
 'rope':('Hands pulling a coarse rope through a small wooden pulley, subtle creaks and tension, cartoon adventure Foley. No music, no speech.',2.0),
 'celebrate':('One party popper bursting with a crisp pop followed by light paper confetti fluttering down. Cheerful isolated Foley, no crowd, no speech, no music.',2.0),
 'bounce':('One soft elastic trampoline bounce, fabric stretch, spring squeak and a short rubbery boing. Whimsical detailed Foley, no music or voice.',1.3)
}
SOUNDS.update({
 'step':('One single light rubber shoe footstep on a wooden bakery floor, crisp friendly cartoon Foley, isolated. No voice or music.',1.0),
 'click':('One tiny tactile plastic remote button click with a short clean electronic confirmation tick. Isolated, no music, no voice.',1.0),
 'tap':('One gentle metal cake tray being set on a wooden table, soft contact with a brief bright rattle. Isolated Foley, no voice or music.',1.0),
 'land':('One cartoon character landing on a wooden floor, soft low thump and shoe scuff, harmless and light, no music, no voice.',1.0),
 'crash':('Short harmless cartoon kitchen collision: metal tray wobble, light wooden knock and a little rattling tail. No breaking glass, no voice or music.',1.5),
 'electric':('A short magical clockwork device sputter, playful bright electric crackles and rising zaps, whimsical family animation, no music or voice.',1.5),
 'deadclick':('Two tiny plastic button clicks on an unpowered remote control. Dry intimate Foley, no confirmation beep, no voice or music.',1.0),
 'roll':('Small trolley wheels rolling briskly over wood with a little friendly mechanical rattle. Short isolated Foley, no music or voice.',2.0),
 'motor':('A small old kitchen fan motor starts with a switch and spins up, gentle mechanical whirr, no music, no voice.',2.0),
 'cloth':('A fabric curtain being whisked upwards, a soft airy cloth swish with one small pulley click. Isolated, no music or voice.',1.5),
 'clap':('Two cheerful light hand claps, one person, clean close Foley without a crowd or room noise, no voice or music.',1.0),
 'chime':('One delicate magical success chime, three soft ascending bell tones, short and warm rather than piercing, isolated sound effect, no background music or voice.',1.5),
 'boing':('One funny soft rubber wobble and a short descending boing, playful harmless cartoon reaction, no voice or music.',1.0),
 'laugh':('A brief happy cartoon rubber squeak and a playful bubbling pop, a light nonverbal comic reaction sound, no human voice, no speech or music.',1.0)
})
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
 (root/'manifest.json').write_text(json.dumps(manifest,indent=2));return 0
if __name__=='__main__':raise SystemExit(main())
