import{createServer}from'node:http';import{resolve}from'node:path';import{serveFile}from'./http-files.mjs';
const root=resolve(import.meta.dirname,'..'),port=Number(process.argv[2]||4173);
createServer((req,res)=>serveFile(req,res,root)).listen(port,'0.0.0.0',()=>console.log('Preview server listening on port '+port));
