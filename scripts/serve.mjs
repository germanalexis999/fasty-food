import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../public');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.mp4':'video/mp4','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
    const info=await stat(file);if(!info.isFile())throw new Error('Not a file');
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
    const data=await readFile(file);const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','Accept-Ranges':'bytes'};
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if(!match){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
      const start=match[1]?Number(match[1]):Math.max(0,data.length-Number(match[2]));
      const end=match[1]?(match[2]?Math.min(Number(match[2]),data.length-1):data.length-1):data.length-1;
      if(start> end||start>=data.length){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
      res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${data.length}`,'Content-Length':end-start+1});res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;
    }
    res.writeHead(200,{...headers,'Content-Length':data.length});res.end(req.method==='HEAD'?undefined:data);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('No encontrado');}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
