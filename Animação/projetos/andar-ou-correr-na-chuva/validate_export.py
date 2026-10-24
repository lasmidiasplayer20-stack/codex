"""Validate the exported film without altering or replacing failed checks."""
from pathlib import Path
import subprocess,json,hashlib,re,os,math
ROOT=Path(__file__).resolve().parent
movie=Path(os.environ.get('MOVIE_PATH',str(ROOT/'delivery/Andar-ou-correr-na-chuva-1080p.mp4')))
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');a=next(s for s in probe['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'])==(1920,1080)
assert v['codec_name']=='h264' and a['codec_name']=='aac'
assert v['r_frame_rate']=='24/1' and int(v['nb_frames'])==11520
assert abs(float(probe['format']['duration'])-480)<.05
assert a['sample_rate']=='48000' and a['channels']==2
assert movie.stat().st_size<100_000_000
subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(movie),'-map','0:v:0','-an','-vf','fps=1/20,scale=320:-1,tile=4x6','-frames:v','1','-y',str(ROOT/'delivery/visao-geral.jpg'),'-map','0:v:0','-map','0:a:0','-f','null','-'],check=True)
volume=subprocess.run(['ffmpeg','-hide_banner','-i',str(movie),'-vn','-af','volumedetect','-f','null','-'],capture_output=True,text=True,check=True).stderr
peak=float(re.search(r'max_volume:\s*([-\d.]+) dB',volume).group(1));assert peak<0
shots=json.loads((ROOT/'storyboard.json').read_text());assert shots[0]['start']==0 and all(x['end']==y['start'] for x,y in zip(shots,shots[1:]))
current_hashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'project').iterdir() if p.suffix in ['.js','.html','.mjs']}
for i in range(4):
 p=json.loads((ROOT/'render'/f'part-{i:02}.mp4.json').read_text());assert p['frames']==2880 and p['errors']==[] and p['start']==120*i
 assert p['revision']==2
assembly=json.loads((ROOT/'delivery/assembly-manifest.json').read_text())
assert assembly['current_source_hashes']==current_hashes and assembly['output_sha256']==hashlib.sha256(movie.read_bytes()).hexdigest()
assert all(json.loads((ROOT/'render'/f'part-{i:02}.mp4.json').read_text())['sourceHashes']==assembly['base_source_hashes'] for i in range(4))
pure=json.loads((ROOT/'qa/locomocao-v2.json').read_text());meshes=json.loads((ROOT/'qa/meshes-locomocao-v2.json').read_text())
assert pure['maxSlide']<1e-7 and pure['samples']>1000 and meshes['slide']<1e-7 and meshes['pairs']>1000 and meshes['headingDot']>.99999 and meshes['groundError']<1e-7 and meshes['boneError']<1e-7
extra_cuts=sum(math.ceil((s['end']-s['start'])/(2.2 if s.get('two') or s.get('action')=='run' or s['scene']=='arrival' else 2.9))-1 for s in shots if s['scene'] in ['street','arrival'])
report={'revision':2,'verified_replacements':assembly['replacements'],'cache_proof':assembly['cache_proof'],'locomotion_pure':pure,'locomotion_meshes':meshes,'extra_camera_cuts':extra_cuts,'sound_contact_count':len(json.loads((ROOT/'audio/contatos-v2.json').read_text())),'duration':float(probe['format']['duration']),'width':v['width'],'height':v['height'],'fps':v['r_frame_rate'],'frames':int(v['nb_frames']),'audio_codec':a['codec_name'],'audio_sample_rate':int(a['sample_rate']),'bytes':movie.stat().st_size,'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'full_decode_passed':True,'audio_peak_dbfs':peak,'shot_count':len(shots),'original_narration_sha256':hashlib.sha256((ROOT/'references/input-3').read_bytes()).hexdigest(),'source_hashes':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in (ROOT/'project').iterdir() if p.suffix in ['.js','.html','.mjs']},'visuals':'Original Three.js street scenes and Canvas diagrams, not the codex-2 film','webgl_render_size':[1920,1080],'composite_export_size':[1920,1080],'human_listening_performed':False,'summary_labels_contextual':True}
(ROOT/'delivery/validacao.json').write_text(json.dumps(report,ensure_ascii=False,indent=2));print(json.dumps(report,ensure_ascii=False,indent=2))
