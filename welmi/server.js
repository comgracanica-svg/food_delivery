// Welmi server: servira frontend + /api/analyze (AI analiza slike hrane). Node >= 18, bez zavisnosti.
// Env: PORT, ANTHROPIC_API_KEY, MODEL (default claude-sonnet-5-5)
import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const T={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webmanifest':'application/json'};
const PROMPT='Analiziraj hranu na slici. Vrati ISKLJUCIVO JSON: {"name":"naziv jela na srpskom","serving":"opis porcije","kcal":broj,"protein":g,"carbs":g,"fat":g} za celu porciju sa slike. Ako nema hrane: {"error":"nema hrane"}.';
async function analyze(body){
 const key=process.env.ANTHROPIC_API_KEY; if(!key) return [501,{error:'ANTHROPIC_API_KEY nije podešen'}];
 const {image,mime='image/jpeg',text}=JSON.parse(body);
 const content=[]; if(image) content.push({type:'image',source:{type:'base64',media_type:mime,data:image}});
 content.push({type:'text',text:text?PROMPT+' Opis korisnika: '+text:PROMPT});
 const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'},
  body:JSON.stringify({model:process.env.MODEL||'claude-sonnet-5-5',max_tokens:400,messages:[{role:'user',content}]})});
 const j=await r.json(); if(!r.ok) return [502,{error:j.error?.message||'AI greška'}];
 const m=(j.content?.[0]?.text||'').match(/\{[\s\S]*\}/); if(!m) return [502,{error:'Neispravan odgovor'}];
 return [200,JSON.parse(m[0])];
}
http.createServer(async(req,res)=>{
 try{
  if(req.method==='POST'&&req.url==='/api/analyze'){
   let b='';for await(const c of req){b+=c;if(b.length>8e6){res.writeHead(413).end();return}}
   const [s,o]=await analyze(b);res.writeHead(s,{'content-type':'application/json'}).end(JSON.stringify(o));return;
  }
  let p=decodeURIComponent(req.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';
  const f=path.join(dir,path.normalize(p));if(!f.startsWith(dir)||f.endsWith('server.js')){res.writeHead(404).end();return}
  const d=fs.readFileSync(f);res.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream'}).end(d);
 }catch(e){res.writeHead(e.code==='ENOENT'?404:500).end('err')}
}).listen(process.env.PORT||8081,()=>console.log('Welmi na http://localhost:'+(process.env.PORT||8081)));
