import {createServer} from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {resolve,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
export function mediaServer(root,options={}){
 root=resolve(root);
 return createServer(async(req,res)=>{try{
  let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(name==='/')name='/index.html';if(name==='/timeline.json'&&options.plan)name='/'+options.plan;
  const p=resolve(root,'.'+name);if(!p.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  const info=await stat(p);if(!info.isFile())throw Error('not file');
  const type=({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.wav':'audio/wav','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg'})[extname(p)]??'application/octet-stream';
  res.setHeader('Content-Type',type);res.setHeader('Accept-Ranges','bytes');
  const range=req.headers.range;let start=0,end=info.size-1;
  if(range){const match=/^bytes=(\d+)-(\d*)$/.exec(range);if(!match){res.writeHead(416);res.end();return;}start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),end):end;if(start>end||start>=info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}res.statusCode=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${info.size}`);}
  res.setHeader('Content-Length',end-start+1);if(req.method==='HEAD'){res.end();return;}createReadStream(p,{start,end}).pipe(res);
 }catch{res.writeHead(404);res.end();}});
}
if(import.meta.url===pathToFileURL(process.argv[1]).href){const root=resolve(import.meta.dirname,'..'),port=Number(process.env.PORT??8080);mediaServer(root).listen(port,'127.0.0.1',()=>console.log(`Player: http://127.0.0.1:${port}`));}
