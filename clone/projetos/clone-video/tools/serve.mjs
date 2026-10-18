import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function serve(port=3000){
 const server=http.createServer((req,res)=>{let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(p==='/favicon.ico'){res.writeHead(204).end();return;}
  const file=path.resolve(ROOT,'.'+(p==='/'?'/index.html':p));if(!file.startsWith(ROOT+path.sep)){res.writeHead(403).end();return;}
  fs.stat(file,(err,st)=>{if(err||!st.isFile()){res.writeHead(404).end();return;}res.setHeader('Content-Type',({'.js':'application/javascript','.html':'text/html','.json':'application/json','.m4a':'audio/mp4'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});});
 return new Promise(resolve=>server.listen(port,'127.0.0.1',()=>resolve(server)));
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const s=await serve(Number(process.env.PORT||3000));console.log(`Servidor local iniciado na porta ${s.address().port}`);}
