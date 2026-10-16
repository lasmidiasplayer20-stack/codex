"""Verify the manifest of an extracted kit or its ZIP; never executes bundled code."""
import argparse,hashlib,json,zipfile
from pathlib import Path,PurePosixPath
p=argparse.ArgumentParser();p.add_argument('package',type=Path);a=p.parse_args();package=a.package
if package.is_dir():
 manifest=json.loads((package/'MANIFEST.json').read_text());read=lambda name:(package/name).read_bytes();actual={x.relative_to(package).as_posix() for x in package.rglob('*') if x.is_file()}
else:
 archive=zipfile.ZipFile(package);bad=archive.testzip();assert bad is None,bad;roots={n.split('/')[0] for n in archive.namelist() if '/' in n};assert len(roots)==1;prefix=next(iter(roots))+'/';manifest=json.loads(archive.read(prefix+'MANIFEST.json'));read=lambda name:archive.read(prefix+name);actual={n[len(prefix):] for n in archive.namelist() if not n.endswith('/')}
expected={f['path'] for f in manifest['files']}|{'MANIFEST.json'};assert actual==expected,{'missing':sorted(expected-actual),'unexpected':sorted(actual-expected)}
for f in manifest['files']:
 path=PurePosixPath(f['path']);assert not path.is_absolute() and '..' not in path.parts;data=read(f['path']);assert len(data)==f['bytes'],f['path'];assert hashlib.sha256(data).hexdigest()==f['sha256'],f['path']
print(json.dumps({'passed':True,'filesVerified':len(manifest['files']),'bytesVerified':sum(f['bytes'] for f in manifest['files']),'sourceCommits':manifest['sourceCommits']}))
