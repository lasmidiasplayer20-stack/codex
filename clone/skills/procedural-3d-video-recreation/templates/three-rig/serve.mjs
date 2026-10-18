import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.js':'text/javascript','.html':'text/html','.json':'application/json'};
const server=http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.stat(file,(error,info)=>{
    if(error||!info.isFile()){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    const stream=fs.createReadStream(file);
    stream.on('error',()=>res.destroy());stream.pipe(res);
  });
});
server.listen(Number(process.env.PORT||3000),'127.0.0.1',()=>console.log(`Local server listening on port ${server.address().port}`));
