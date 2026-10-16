import {serveFile} from './http-files.mjs';
import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {once} from 'node:events';
export const root=import.meta.dirname;
export async function open(){const server=createServer((req,res)=>serveFile(req,res,root));server.listen(0,'127.0.0.1');await once(server,'listening');const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.waitForFunction(()=>typeof window.film?.draw==='function',null,{timeout:120000});return{browser,page,errors,close:async()=>{await browser.close();await new Promise(r=>server.close(r));}};}
