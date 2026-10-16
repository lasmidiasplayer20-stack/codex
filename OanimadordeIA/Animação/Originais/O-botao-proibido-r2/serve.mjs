import {createServer} from 'node:http';
import {resolve} from 'node:path';
import {serveFile} from './http-files.mjs';
const root=resolve(import.meta.dirname,'../..'),port=Number(process.argv[2]||8020);
createServer((req,res)=>serveFile(req,res,root)).listen(port,'127.0.0.1',()=>console.log(`Development HTTP server on port ${port}; open /Originais/O-botao-proibido-r2/index.html or /Originais/O-botao-proibido-r2/video.html. Byte-range media seeking is enabled.`));
