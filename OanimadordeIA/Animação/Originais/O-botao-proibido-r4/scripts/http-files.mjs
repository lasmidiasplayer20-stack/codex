/* Stream files with byte ranges so the movie and AAC can seek without full downloads. */
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {resolve,extname} from 'node:path';
const types={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.mp4':'video/mp4','.m4a':'audio/mp4','.wav':'audio/wav','.jpg':'image/jpeg','.png':'image/png'};
export async function serveFile(req,res,root){
 try {
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const delivered=name==='/delivery/full.mp4';
  const file=delivered?resolve(root,'../../Vídeos/The-Forbidden-Button-R4-1080p60.mp4'):resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!delivered&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  const info=await stat(file);if(!info.isFile())throw Error('not a file');
  let start=0,end=info.size-1,status=200;
  const headers={'Content-Type':types[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes'};
  if(req.headers.range){
   const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   if(!m||(!m[1]&&!m[2])||!info.size){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   if(!m[1]){const count=Number(m[2]);start=Math.max(0,info.size-count);}
   else {start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
   if(start<0||start>=info.size||end<start){res.writeHead(416,{'Content-Range':`bytes */${info.size}`});res.end();return;}
   status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
  }
  headers['Content-Length']=String(Math.max(0,end-start+1));res.writeHead(status,headers);
  if(req.method==='HEAD'||info.size===0){res.end();return;}
  const stream=createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch{if(!res.headersSent)res.writeHead(404);res.end();}
}
