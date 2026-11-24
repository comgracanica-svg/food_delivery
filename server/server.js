// GymFlow backend: nalozi + sinhronizacija. Bez zavisnosti, Node >= 22.13 (node:sqlite).
const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const {DatabaseSync}=require("node:sqlite");
const PORT=+process.env.PORT||8080,DATA_DIR=process.env.DATA_DIR||path.join(__dirname,"data"),ORIGIN=process.env.ALLOWED_ORIGIN||"*";
const STATIC=process.env.STATIC_DIR||path.join(__dirname,"..","gym");
fs.mkdirSync(DATA_DIR,{recursive:true});
const db=new DatabaseSync(path.join(DATA_DIR,"gym.db"));
db.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT UNIQUE NOT NULL,salt TEXT NOT NULL,hash TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS data(user_id INTEGER PRIMARY KEY,json TEXT NOT NULL,updated INTEGER NOT NULL)`);
let SECRET=process.env.SECRET;
if(!SECRET){const f=path.join(DATA_DIR,"secret");try{SECRET=fs.readFileSync(f,"utf8")}catch{SECRET=crypto.randomBytes(32).toString("hex");fs.writeFileSync(f,SECRET,{mode:0o600})}}
const b64=b=>Buffer.from(b).toString("base64url");
const sign=s=>crypto.createHmac("sha256",SECRET).update(s).digest("base64url");
const token=uid=>{const p=b64(JSON.stringify({u:uid,e:Date.now()+30*864e5}));return p+"."+sign(p)};
function auth(req){const t=(req.headers.authorization||"").replace(/^Bearer /,""),[p,s]=t.split(".");
 if(!p||!s)return null;const a=Buffer.from(sign(p)),b=Buffer.from(s);if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return null;
 try{const o=JSON.parse(Buffer.from(p,"base64url"));return o.e>Date.now()?o.u:null}catch{return null}}
const hash=(pw,salt)=>crypto.scryptSync(pw,salt,64).toString("hex");
const fails=new Map();
function limited(ip){const n=fails.get(ip)||{c:0,t:Date.now()};if(Date.now()-n.t>9e5){n.c=0;n.t=Date.now()}fails.set(ip,n);return n.c>=10}
const bump=ip=>{const n=fails.get(ip);if(n)n.c++};
const send=(res,code,obj)=>{res.writeHead(code,{"content-type":"application/json","access-control-allow-origin":ORIGIN,"access-control-allow-headers":"content-type,authorization","access-control-allow-methods":"GET,PUT,POST,OPTIONS"});res.end(JSON.stringify(obj))};
const body=req=>new Promise((ok,no)=>{let d="";req.on("data",c=>{d+=c;if(d.length>5e6){no(new Error("big"));req.destroy()}});req.on("end",()=>{try{ok(JSON.parse(d||"{}"))}catch(e){no(e)}})});
const MIME={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png"};
function serveStatic(req,res){let p=decodeURIComponent(req.url.split("?")[0]);if(p.endsWith("/"))p+="index.html";
 const f=path.normalize(path.join(STATIC,p));if(!f.startsWith(STATIC)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end("Not found")}
 res.writeHead(200,{"content-type":MIME[path.extname(f)]||"application/octet-stream"});fs.createReadStream(f).pipe(res)}
http.createServer(async(req,res)=>{
 try{
  if(req.method==="OPTIONS")return send(res,204,{});
  if(!req.url.startsWith("/api/"))return serveStatic(req,res);
  const ip=req.socket.remoteAddress,url=req.url.split("?")[0];
  if(url==="/api/health")return send(res,200,{ok:true});
  if(url==="/api/register"&&req.method==="POST"){
   const {email,password}=await body(req),e=String(email||"").trim().toLowerCase();
   if(!/^\S+@\S+\.\S+$/.test(e)||String(password||"").length<8)return send(res,400,{error:"Email ili lozinka (min 8 znakova) nisu ispravni"});
   const salt=crypto.randomBytes(16).toString("hex");
   try{const r=db.prepare("INSERT INTO users(email,salt,hash) VALUES(?,?,?)").run(e,salt,hash(password,salt));return send(res,200,{token:token(Number(r.lastInsertRowid))})}
   catch{return send(res,409,{error:"Nalog već postoji"})}}
  if(url==="/api/login"&&req.method==="POST"){
   if(limited(ip))return send(res,429,{error:"Previše pokušaja, probaj kasnije"});
   const {email,password}=await body(req),u=db.prepare("SELECT * FROM users WHERE email=?").get(String(email||"").trim().toLowerCase());
   if(!u||!crypto.timingSafeEqual(Buffer.from(hash(String(password||""),u.salt)),Buffer.from(u.hash))){bump(ip);return send(res,401,{error:"Pogrešan email ili lozinka"})}
   return send(res,200,{token:token(u.id)})}
  if(url==="/api/data"){
   const uid=auth(req);if(!uid)return send(res,401,{error:"Prijavi se"});
   if(req.method==="GET"){const r=db.prepare("SELECT json,updated FROM data WHERE user_id=?").get(uid);return send(res,200,r?{data:JSON.parse(r.json),updated:r.updated}:{data:null,updated:0})}
   if(req.method==="PUT"){const {data,updated}=await body(req);if(!data||typeof data!=="object"||!Number.isFinite(updated))return send(res,400,{error:"Neispravni podaci"});
    const cur=db.prepare("SELECT updated FROM data WHERE user_id=?").get(uid);
    if(cur&&cur.updated>updated)return send(res,409,{error:"Server ima noviju verziju",updated:cur.updated});
    db.prepare("INSERT INTO data(user_id,json,updated) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET json=excluded.json,updated=excluded.updated").run(uid,JSON.stringify(data),updated);
    return send(res,200,{ok:true,updated})}}
  send(res,404,{error:"Nepoznato"});
 }catch(e){send(res,500,{error:"Greška servera"})}
}).listen(PORT,()=>console.log("GymFlow server na portu "+PORT));
