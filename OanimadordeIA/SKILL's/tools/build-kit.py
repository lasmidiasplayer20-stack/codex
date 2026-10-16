"""Rebuild the bundle from pinned repository commits plus the skill's editable docs/tools."""
from pathlib import Path
import hashlib,io,json,re,subprocess,tarfile,tempfile,zipfile
ROOT=Path(__file__).resolve().parents[1];REPO=ROOT.parents[1];R4='0590992d69661f0e42ad9d86320b229f96f776f4';V6='1c6dce3d232179e41629414db70513dc69205853';PREFIX='animacao-personagens-fisica';NAME='animacao-personagens-fisica-v1.zip'
files={};origins={}
def add(name,data,origin):
 assert name not in files,name;files[name]=data;origins[name]=origin
def subtree(commit,path,destination,filter_file=lambda n:True):
 raw=subprocess.check_output(['git','archive',commit,path],cwd=REPO)
 with tarfile.open(fileobj=io.BytesIO(raw)) as tar:
  for m in tar:
   if m.isfile():
    rel=m.name[len(path)+1:]
    if filter_file(rel):add(destination+'/'+rel,tar.extractfile(m).read(),{'commit':commit,'path':m.name})
for p in sorted(ROOT.rglob('*')):
 if p.is_file() and p.suffix not in ['.zip','.part','.pyc'] and '__pycache__' not in p.parts and p.name not in ['MANIFEST.json','MANIFEST-LEVE.json','SHA256SUMS.txt']:
  add(p.relative_to(ROOT).as_posix(),p.read_bytes(),{'type':'reusable-skill-instructions-or-tool'})
subtree(R4,'OanimadordeIA/Animação/Originais/O-botao-proibido-r4','assets/button-r4')
subtree(V6,'videos/animation-vs-physics/revisions/v6-historia-continua-150s-1080p60','assets/reference-v6',lambda n:Path(n).suffix.lower() not in ['.mp4','.wav','.zip'])
subtree(V6,'.agents/skills/recriar-animacao-por-codigo','assets/legacy-reference-skill')
subtree(V6,'videos/animation-vs-physics/docs','assets/legacy-reference-docs',lambda n:Path(n).suffix.lower() not in ['.mp4','.wav','.zip'])
for commit,path,name in [(R4,'OanimadordeIA/Animação/Vídeos/The-Forbidden-Button-R4-1080p60.mp4','media/the-forbidden-button-r4-1080p60.mp4'),(V6,'videos/animation-vs-physics/revisions/v6-historia-continua-150s-1080p60/exports/animation-vs-physics-v6-continuous-1080p60.mp4','media/animation-vs-physics-v6-1080p60.mp4')]:
 add(name,subprocess.check_output(['git','show',commit+':'+path],cwd=REPO),{'commit':commit,'path':path,'role':'complete-example-reference-film'})
credential=Path('/workspace/attachments/2033e2aa-87db-4e98-9942-fca95b969d18/variavel.txt');keys=re.findall(rb'sk_[A-Za-z0-9_-]+',credential.read_bytes()) if credential.exists() else []
for name,data in files.items():
 assert not any(k in data for k in keys),'Credential detected in '+name
 assert not any(part in ['node_modules','.git','.aws','.codex'] for part in Path(name).parts),name
manifest={'formatVersion':1,'skill':PREFIX,'sourceCommits':{'buttonR4':R4,'referenceV6':V6},'scope':'Complete R4 project, original V6 source/review/configuration, original character and audio assets, both full reference films, reusable workflow and portable project tools. Regenerable WAVs, duplicate old ZIPs and individual reference MP4 parts are omitted.','files':[{'path':name,'bytes':len(files[name]),'sha256':hashlib.sha256(files[name]).hexdigest(),'origin':origins[name]} for name in sorted(files)]}
external_media=[{'path':f['path'],'bytes':f['bytes'],'sha256':f['sha256'],'commit':f['origin']['commit'],'repositoryPath':f['origin']['path'],'url':'https://github.com/lasmidiasplayer20-stack/codex/blob/'+f['origin']['commit']+'/'+f['origin']['path']} for f in manifest['files'] if f['path'].startswith('media/')]
checksums=[];published=[]
for light in [False,True]:
 selected={name:data for name,data in files.items() if not(light and name.startswith('media/'))}
 info=dict(manifest);info['edition']='lightweight' if light else 'complete';info['files']=[f for f in manifest['files'] if f['path'] in selected]
 if light:info['externalMedia']=external_media
 manifest_data=(json.dumps(info,indent=2,ensure_ascii=False)+'\n').encode();selected['MANIFEST.json']=manifest_data
 name=NAME.replace('.zip','-leve.zip') if light else NAME;out=ROOT/name;temp=ROOT/(name+'.part')
 with zipfile.ZipFile(temp,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for path,data in sorted(selected.items()):
   entry=zipfile.ZipInfo(PREFIX+'/'+path,date_time=(2026,10,16,0,0,0));entry.compress_type=zipfile.ZIP_DEFLATED;entry.external_attr=0o100644<<16;z.writestr(entry,data)
 assert temp.stat().st_size<100*1024*1024,'Archive exceeds ordinary GitHub file limit'
 if light:assert temp.stat().st_size<32*1024*1024,'Light archive exceeds attachment tool limit'
 temp.replace(out);(ROOT/('MANIFEST-LEVE.json' if light else 'MANIFEST.json')).write_bytes(manifest_data)
 checksums.append(hashlib.sha256(out.read_bytes()).hexdigest()+'  '+name);published.append({'zip':name,'files':len(selected),'bytes':out.stat().st_size,'credentialMatches':0})
(ROOT/'SHA256SUMS.txt').write_text('\n'.join(checksums)+'\n');print(json.dumps(published))
