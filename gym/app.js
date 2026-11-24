"use strict";
const KEY="gymflow.v1",AKEY="gymflow.active";
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso=d=>{const t=new Date(d);t.setMinutes(t.getMinutes()-t.getTimezoneOffset());return t.toISOString().slice(0,10)};
const today=()=>iso(new Date());
const addDays=(s,n)=>{const d=new Date(s+"T12:00:00");d.setDate(d.getDate()+n);return iso(d)};
const wd=s=>(new Date(s+"T12:00:00").getDay()+6)%7; // 0=Pon
const exById=id=>EX.find(e=>e[0]===id)||[id,id,"",""];
const exName=id=>exById(id)[1];
const num=v=>{const n=parseFloat(String(v).replace(",","."));return isFinite(n)?n:0};
const r1=n=>Math.round(n*10)/10;
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s)return s}catch(e){}
 return {goals:{kcal:2500,p:150,c:280,f:75,water:8},routines:structuredClone(DEFAULT_ROUTINES),
  schedule:{0:"r_push",1:"r_pull",2:"r_legs",3:null,4:"r_db",5:"r_arms",6:null},logs:[],meals:{},water:{},body:[]}}
let S=load();
const save=()=>{S._u=Date.now();localStorage.setItem(KEY,JSON.stringify(S));schedSync()};
/* ---------- sync (backend) ---------- */
let SY={};try{SY=JSON.parse(localStorage.getItem("gymflow.sync"))||{}}catch(e){}
const saveSY=()=>localStorage.setItem("gymflow.sync",JSON.stringify(SY));
let syncT=null,syncMsg="";
const apiBase=()=>(SY.url||(location.protocol.startsWith("http")?location.origin:"")).replace(/\/$/,"");
async function api(p,o={}){const r=await fetch(apiBase()+p,{...o,headers:{"content-type":"application/json",...(SY.token?{authorization:"Bearer "+SY.token}:{})}});
 const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||"Greška "+r.status);e.status=r.status;e.j=j;throw e}return j}
function schedSync(){if(!SY.token)return;clearTimeout(syncT);syncT=setTimeout(sync,3000)}
async function sync(){if(!SY.token)return;
 try{const r=await api("/api/data"),lu=S._u||0;
  if(r.data&&r.updated>lu){S=r.data;S._u=r.updated;localStorage.setItem(KEY,JSON.stringify(S));syncMsg="Preuzeto sa servera";if(!A)render()}
  else{if(!lu)S._u=Date.now();await api("/api/data",{method:"PUT",body:JSON.stringify({data:S,updated:S._u})});localStorage.setItem(KEY,JSON.stringify(S));syncMsg="Sinhronizovano "+new Date().toLocaleTimeString().slice(0,5)}
 }catch(e){if(e.status===401){SY.token=null;saveSY();syncMsg="Sesija istekla, prijavi se"}else if(e.status===409){syncT=setTimeout(sync,500);return}else syncMsg="Offline / server nedostupan"}
 if(tab==="plan"&&!A)render()}
let foodView="log",recM="",recV=false,viscDay=0,viscWeek=0,tab="home",A=null,foodDate=today(),trainView="main",progEx="",lib={q:"",m:""};
try{A=JSON.parse(localStorage.getItem(AKEY))}catch(e){}
const saveA=()=>A?localStorage.setItem(AKEY,JSON.stringify(A)):localStorage.removeItem(AKEY);
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("on"),1800)}

/* ---------- helpers: data ---------- */
const dayMeals=d=>S.meals[d]||[];
const totals=d=>dayMeals(d).reduce((a,m)=>({kcal:a.kcal+m.kcal,p:a.p+m.p,c:a.c+m.c,f:a.f+m.f}),{kcal:0,p:0,c:0,f:0});
const vol=l=>l.sets.reduce((a,s)=>a+s.w*s.r,0);
const e1rm=(w,r)=>w*(1+r/30);
function lastSets(ex){for(let i=S.logs.length-1;i>=0;i--){const s=S.logs[i].sets.filter(x=>x.ex===ex);if(s.length)return s}return[]}
function prs(){const m={};S.logs.forEach(l=>l.sets.forEach(s=>{const e=e1rm(s.w,s.r);if(!m[s.ex]||e>m[s.ex].e)m[s.ex]={e,w:s.w,r:s.r,d:l.date}}));return m}
function streakWeek(){const n=new Date(),mon=addDays(today(),-wd(today()));return S.logs.filter(l=>l.date>=mon).length}
function bar(p,c){return `<div class="bar"><div style="width:${Math.min(100,Math.max(0,p))}%;background:${c}"></div></div>`}

/* ---------- charts ---------- */
function lineChart(pts,unit){
 if(pts.length<2)return `<p class="mut">Potrebna su bar 2 unosa za grafikon.</p>`;
 const W=320,H=140,p=28,ys=pts.map(a=>a.y),mn=Math.min(...ys),mx=Math.max(...ys),rg=(mx-mn)||1;
 const X=i=>p+i*(W-p-8)/(pts.length-1),Y=y=>H-p-(y-mn)/rg*(H-p-12);
 const path=pts.map((a,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(a.y).toFixed(1)).join("");
 return `<svg viewBox="0 0 ${W} ${H}" width="100%"><path d="${path}" fill="none" stroke="#ffd21f" stroke-width="2.5"/>
 ${pts.map((a,i)=>`<circle cx="${X(i)}" cy="${Y(a.y)}" r="3" fill="#ffd21f"/>`).join("")}
 <text x="2" y="${Y(mx)+4}">${r1(mx)}</text><text x="2" y="${Y(mn)+4}">${r1(mn)}</text>
 <text x="${p}" y="${H-8}">${pts[0].x}</text><text x="${W-8}" y="${H-8}" text-anchor="end">${pts.at(-1).x}</text></svg>`}
function barChart(items){
 const W=320,H=120,mx=Math.max(1,...items.map(i=>i.y)),bw=(W-10)/items.length;
 return `<svg viewBox="0 0 ${W} ${H+16}" width="100%">${items.map((it,i)=>{const h=it.y/mx*(H-14);
 return `<rect x="${5+i*bw+4}" y="${H-h}" width="${bw-8}" height="${h}" rx="4" fill="#ffd21f"/><text x="${5+i*bw+bw/2}" y="${H+12}" text-anchor="middle">${it.x}</text>`}).join("")}</svg>`}
function ring(p,c,t){const R=54,L=2*Math.PI*R,o=L*(1-Math.min(1,p));
 return `<div class="ring"><svg viewBox="0 0 130 130" width="130" height="130"><circle cx="65" cy="65" r="${R}" fill="none" stroke="#2e2e2e" stroke-width="12"/>
 <circle cx="65" cy="65" r="${R}" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${o}" transform="rotate(-90 65 65)"/></svg><div>${t}</div></div>`}

/* ---------- views ---------- */
const V={};
V.home=()=>{
 const d=today(),rid=S.schedule[wd(d)],r=S.routines.find(x=>x.id===rid),t=totals(d),g=S.goals,w=S.water[d]||0;
 const done=S.logs.find(l=>l.date===d);
 return `<div class="card"><div class="mut">${DAYS[wd(d)]}, ${d.split("-").reverse().join(".")}</div>
 <h2 style="margin:4px 0 10px">${done?"✅ Trening završen":r?esc(r.name):"😴 Dan odmora"}</h2>
 ${A?`<button class="btn full" data-a="resume">Nastavi trening</button>`:
  r&&!done?`<div class="mut" style="margin-bottom:10px">${r.items.map(i=>esc(exName(i.ex))).slice(0,4).join(" · ")}${r.items.length>4?" …":""}</div><button class="btn full" data-a="start" data-id="${r.id}">▶ Počni trening</button>`:
  `<button class="btn sec full" data-a="startFree">+ Slobodan trening</button>`}</div>
 <div class="card"><div class="row"><div>${ring(t.kcal/g.kcal,"#ffd21f",`<span><b>${Math.round(t.kcal)}</b>/ ${g.kcal} kcal</span>`)}</div>
 <div class="grow">${[["Proteini",t.p,g.p,"var(--p)"],["Ugljeni H.",t.c,g.c,"var(--c)"],["Masti",t.f,g.f,"var(--f)"]].map(([n,v,m,c])=>
  `<div class="mut row sp"><span>${n}</span><span>${Math.round(v)}/${m}g</span></div>${bar(v/m*100,c)}<div style="height:8px"></div>`).join("")}</div></div>
 <button class="btn sec full" data-a="tab" data-t="food">+ Dodaj obrok</button></div>
 <div class="card row sp" data-a="tab" data-t="visc"><div><h3>🔥 Program: visceralna mast</h3><div class="mut">Trening + ishrana + recepti</div></div><span>›</span></div>
 <div class="card row sp"><div><h3>💧 Voda</h3><div class="mut">${w} / ${g.water} čaša</div></div>
 <div class="row"><button class="btn sec sm" data-a="water" data-n="-1">−</button><button class="btn sm" data-a="water" data-n="1">+ čaša</button></div></div>
 <div class="grid3"><div class="card stat"><b>${streakWeek()}</b><span class="mut">treninga ove nedelje</span></div>
 <div class="card stat"><b>${S.logs.length}</b><span class="mut">ukupno treninga</span></div>
 <div class="card stat"><b>${S.body.length?S.body.at(-1).weight:"–"}</b><span class="mut">težina (kg)</span></div></div>`};

V.train=()=>{
 const ms=lib.m,q=lib.q.toLowerCase(),list=EX.filter(e=>(!ms||e[2]===ms)&&e[1].toLowerCase().includes(q));
 const prm=prs();
 return `<div class="row sp"><h2 style="margin:8px 0">Moje rutine</h2><button class="btn sm" data-a="newRoutine">+ Nova</button></div>
 ${S.routines.map(r=>`<div class="card"><div class="row sp"><div class="grow"><h3>${esc(r.name)}</h3><div class="mut">${r.items.length} vežbi · ${r.items.reduce((a,i)=>a+i.sets,0)} serija</div></div>
 <button class="btn sm" data-a="start" data-id="${r.id}">▶</button><button class="btn sec sm" data-a="editRoutine" data-id="${r.id}">✎</button></div></div>`).join("")||`<p class="mut">Nema rutina.</p>`}
 <button class="btn sec full" data-a="startFree">+ Slobodan trening (bez rutine)</button>
 <h2>Biblioteka vežbi</h2><input id="libq" placeholder="Pretraži vežbe…" value="${esc(lib.q)}">
 <div class="chips"><button class="chip ${ms?"":"on"}" data-a="libm" data-m="">Sve</button>${MUSCLES.map(m=>`<button class="chip ${ms===m?"on":""}" data-a="libm" data-m="${m}">${m}</button>`).join("")}</div>
 <div class="card">${list.map(e=>{const p=prm[e[0]];return `<div class="li"><div class="grow"><div>${esc(e[1])}</div><div class="mut">${e[2]} · ${e[3]}${p?` · PR ${p.w}kg×${p.r}`:""}</div></div></div>`}).join("")||`<p class="mut">Nema rezultata.</p>`}</div>
 <h2>Istorija</h2><div class="card">${S.logs.slice(-15).reverse().map((l,i)=>`<div class="li"><div class="grow"><div>${esc(l.name)}</div><div class="mut">${l.date.split("-").reverse().join(".")} · ${l.sets.length} serija · ${Math.round(vol(l))} kg volumen · ${l.min||0} min</div></div><button class="x" data-a="delLog" data-i="${l.id}">🗑</button></div>`).join("")||`<p class="mut">Još nema treninga.</p>`}</div>`};

V.food=()=>{
 const sub=`<div class="chips"><button class="chip ${foodView==="log"?"on":""}" data-a="fview" data-v="log">Dnevnik</button><button class="chip ${foodView==="rec"?"on":""}" data-a="fview" data-v="rec">Recepti</button><button class="chip" data-a="tab" data-t="visc">🔥 Program za visceralnu mast</button></div>`;
 if(foodView==="rec")return sub+V.rec();
 return sub+V.foodLog()};
V.rec=()=>{const l=RECIPES.filter(r=>(!recM||r.meal===recM)&&(!recV||r.tags.includes("visc")));
 return `<div class="chips"><button class="chip ${recM?"":"on"}" data-a="recm" data-m="">Svi</button>${MEALS.map(m=>`<button class="chip ${recM===m?"on":""}" data-a="recm" data-m="${m}">${m}</button>`).join("")}<button class="chip ${recV?"on":""}" data-a="recv">🔥 Visceralni</button></div>
 ${l.map(r=>`<div class="card" data-a="recipe" data-id="${r.id}"><div class="row sp"><h3>${esc(r.name)}</h3><b>${r.k}</b></div><div class="mut">${r.meal} · ${r.min} min · P${r.p} UH${r.c} M${r.f}${r.tags.includes("visc")?" · 🔥":""}</div></div>`).join("")}`};
V.foodLog=()=>{
 const d=foodDate,t=totals(d),g=S.goals,isT=d===today();
 return `<div class="row sp"><button class="btn sec sm" data-a="fday" data-n="-1">‹</button><b>${isT?"Danas":d.split("-").reverse().join(".")}</b><button class="btn sec sm" data-a="fday" data-n="1">›</button></div>
 <div class="card"><div class="row"><div>${ring(t.kcal/g.kcal,t.kcal>g.kcal?"#ff5c5c":"#ffd21f",`<span><b>${Math.round(g.kcal-t.kcal)}</b>kcal preostalo</span>`)}</div>
 <div class="grow">${[["P",t.p,g.p,"var(--p)"],["UH",t.c,g.c,"var(--c)"],["M",t.f,g.f,"var(--f)"]].map(([n,v,m,c])=>`<div class="mut row sp"><span>${n}</span><span>${Math.round(v)}/${m}g</span></div>${bar(v/m*100,c)}<div style="height:8px"></div>`).join("")}</div></div>
 ${MEALS.map(m=>{const it=dayMeals(d).map((x,i)=>({...x,i})).filter(x=>x.meal===m);const k=it.reduce((a,x)=>a+x.kcal,0);
 return `<div class="card"><div class="row sp"><h3>${m} <span class="mut">${Math.round(k)} kcal</span></h3><button class="btn sm" data-a="addFood" data-m="${m}">+</button></div>
 ${it.map(x=>`<div class="li"><div class="grow"><div>${esc(x.name)}</div><div class="mut">${x.amt?x.amt+"g · ":""}P${r1(x.p)} UH${r1(x.c)} M${r1(x.f)}</div></div><b>${Math.round(x.kcal)}</b><button class="x" data-a="delFood" data-i="${x.i}">✕</button></div>`).join("")}</div>`}).join("")}
 <div class="card row sp"><div><h3>💧 Voda</h3><div class="mut">${S.water[d]||0} / ${g.water} čaša</div></div><div class="row"><button class="btn sec sm" data-a="water" data-n="-1" data-d="${d}">−</button><button class="btn sm" data-a="water" data-n="1" data-d="${d}">+</button></div></div>`};

V.prog=()=>{
 const b=S.body,last=b.at(-1),first=b[0];
 const pts=b.map(x=>({x:x.date.slice(5).split("-").reverse().join("."),y:x.weight}));
 const exs=[...new Set(S.logs.flatMap(l=>l.sets.map(s=>s.ex)))];
 if(!exs.includes(progEx))progEx=exs[0]||"";
 const ep=S.logs.map(l=>({x:l.date.slice(5).split("-").reverse().join("."),y:Math.max(0,...l.sets.filter(s=>s.ex===progEx).map(s=>s.w))})).filter(p=>p.y>0);
 const weeks=[];for(let i=7;i>=0;i--){const e=addDays(today(),-wd(today())-i*7),en=addDays(e,6);
  weeks.push({x:e.slice(8)+"."+e.slice(5,7),y:Math.round(S.logs.filter(l=>l.date>=e&&l.date<=en).reduce((a,l)=>a+vol(l),0)/1000)})}
 const prm=prs();
 return `<h2 style="margin-top:8px">Telesna težina</h2><div class="card">${lineChart(pts)}
 ${last?`<div class="mut">Trenutno <b style="color:var(--tx)">${last.weight} kg</b>${first&&first!==last?` · promena ${r1(last.weight-first.weight)>0?"+":""}${r1(last.weight-first.weight)} kg`:""}</div>`:""}
 <form data-form="body"><div class="grid2"><div><label>Težina (kg)</label><input name="weight" inputmode="decimal" required></div><div><label>Struk (cm)</label><input name="waist" inputmode="decimal"></div>
 <div><label>Grudi (cm)</label><input name="chest" inputmode="decimal"></div><div><label>Nadlaktica (cm)</label><input name="arm" inputmode="decimal"></div></div>
 <button class="btn full" style="margin-top:10px">Sačuvaj merenje</button></form></div>
 ${b.length?`<div class="card">${b.slice(-6).reverse().map(x=>`<div class="li"><div class="grow">${x.date.split("-").reverse().join(".")}</div><div class="mut">${x.weight}kg${x.waist?` · struk ${x.waist}`:""}${x.chest?` · grudi ${x.chest}`:""}${x.arm?` · ruka ${x.arm}`:""}</div><button class="x" data-a="delBody" data-d="${x.date}">✕</button></div>`).join("")}</div>`:""}
 <h2>Volumen po nedeljama (tone)</h2><div class="card">${barChart(weeks)}</div>
 <h2>Napredak u vežbi</h2>${exs.length?`<select id="progEx">${exs.map(e=>`<option value="${e}" ${e===progEx?"selected":""}>${esc(exName(e))}</option>`).join("")}</select>
 <div class="card"><div class="mut">Najveća težina po treningu (kg)</div>${lineChart(ep)}</div>`:`<p class="mut">Odradi trening da vidiš napredak.</p>`}
 <h2>Lični rekordi (procena 1RM)</h2><div class="card">${Object.entries(prm).sort((a,b)=>b[1].e-a[1].e).map(([k,p])=>`<div class="li"><div class="grow">${esc(exName(k))}<div class="mut">${p.w}kg × ${p.r} · ${p.d.split("-").reverse().join(".")}</div></div><b>${Math.round(p.e)} kg</b></div>`).join("")||`<p class="mut">Još nema rekorda.</p>`}</div>`};

V.plan=()=>{
 const g=S.goals;
 return `<h2 style="margin-top:8px">Nedeljni raspored</h2><div class="card">${DAYS.map((n,i)=>`<div class="day ${i===wd(today())?"today":""}"><b>${DAYS_S[i]}</b>
 <select data-a="sched" data-d="${i}"><option value="">Odmor</option>${S.routines.map(r=>`<option value="${r.id}" ${S.schedule[i]===r.id?"selected":""}>${esc(r.name)}</option>`).join("")}</select></div>`).join("")}</div>
 <h2>Dnevni ciljevi</h2><form class="card" data-form="goals"><div class="grid2">
 <div><label>Kalorije</label><input name="kcal" inputmode="numeric" value="${g.kcal}"></div><div><label>Proteini (g)</label><input name="p" inputmode="numeric" value="${g.p}"></div>
 <div><label>Ugljeni hidrati (g)</label><input name="c" inputmode="numeric" value="${g.c}"></div><div><label>Masti (g)</label><input name="f" inputmode="numeric" value="${g.f}"></div>
 <div><label>Voda (čaša)</label><input name="water" inputmode="numeric" value="${g.water}"></div></div><button class="btn full" style="margin-top:10px">Sačuvaj ciljeve</button></form>
 <h2>Kalkulator kalorija</h2><form class="card" data-form="calc"><div class="grid2">
 <div><label>Pol</label><select name="sex"><option value="m">Muško</option><option value="f">Žensko</option></select></div><div><label>Godine</label><input name="age" inputmode="numeric" required></div>
 <div><label>Visina (cm)</label><input name="h" inputmode="numeric" required></div><div><label>Težina (kg)</label><input name="w" inputmode="decimal" value="${S.body.at(-1)?.weight||""}" required></div>
 <div><label>Aktivnost</label><select name="act"><option value="1.375">Lagana (1-3 tr./ned.)</option><option value="1.55" selected>Umerena (3-5)</option><option value="1.725">Visoka (6-7)</option></select></div>
 <div><label>Cilj</label><select name="goal"><option value="-400">Mršavljenje</option><option value="0">Održavanje</option><option value="300" selected>Masa</option></select></div></div>
 <button class="btn sec full" style="margin-top:10px">Izračunaj i primeni</button></form>
 <h2>Nalog i sinhronizacija</h2><div class="card">${SY.token?`<div class="mut">Prijavljen: ${esc(SY.email||"")}<br>${esc(syncMsg||"Povezano")}</div><div style="height:8px"></div><button class="btn full" data-a="syncNow">Sinhronizuj sada</button><div style="height:8px"></div><button class="btn sec full" data-a="logout">Odjavi se</button>`:
 `<label>Adresa servera (prazno = isti sajt)</label><input id="sy_url" value="${esc(SY.url||"")}" placeholder="https://moj-server.onrender.com" autocapitalize="off"><label>Email</label><input id="sy_em" type="email" autocapitalize="off"><label>Lozinka (min 8)</label><input id="sy_pw" type="password">
 <div class="grid2" style="margin-top:10px"><button class="btn" data-a="authgo" data-m="login">Prijavi se</button><button class="btn sec" data-a="authgo" data-m="register">Registruj</button></div><div class="mut">${esc(syncMsg)}</div>`}</div>
 <h2>Podaci</h2><div class="card"><button class="btn sec full" data-a="export">⬇ Izvezi backup (JSON)</button><div style="height:8px"></div>
 <label class="btn sec full" style="display:block;text-align:center">⬆ Uvezi backup<input type="file" accept=".json" id="imp" hidden></label><div style="height:8px"></div>
 <button class="btn bad full" data-a="reset">Obriši sve podatke</button></div>`};

V.visc=()=>{
 const [wn,wt]=VISC_WEEKS[viscWeek],pl=VISC_MEALPLAN[viscDay],last=S.body.filter(b=>b.waist).at(-1);
 const t=k=>`<ul style="margin:6px 0;padding-left:18px">${VISC_TIPS[k].map(x=>`<li style="margin:4px 0">${esc(x)}</li>`).join("")}</ul>`;
 return `<button class="btn sec sm" data-a="tab" data-t="food">‹ Nazad</button>
 <div class="card"><h3>🔥 Program za smanjenje visceralne masti</h3><p class="mut">Visceralna mast (oko organa u stomaku) ne može se skinuti „ciljanim" vežbama za stomak. Smanjuje se kombinacijom blagog kalorijskog deficita, treninga snage, kardija (hodanje + HIIT), više proteina i vlakana, sna i manje stresa. Obim struka je najbolji kućni pokazatelj${last?` (zadnje: ${last.waist} cm)`:""}. Ako imaš zdravstvenih problema, prvo se posavetuj sa lekarom.</p></div>
 <h2>1) Trening – 4 nedelje</h2><div class="chips">${VISC_WEEKS.map((w,i)=>`<button class="chip ${i===viscWeek?"on":""}" data-a="vweek" data-i="${i}">Ned. ${i+1}</button>`).join("")}</div>
 <div class="card"><b>${wn}</b><p class="mut">${wt}</p>${DAYS.map((n,i)=>{const r=VISC_ROUTINES.find(x=>x.id===VISC_SCHEDULE[i]);return `<div class="day"><b>${DAYS_S[i]}</b><span>${esc(r.name.replace("🔥 ",""))}</span></div>`}).join("")}
 <button class="btn full" data-a="applyVisc" style="margin-top:8px">Primeni raspored i rutine</button></div>
 <h2>2) Ishrana</h2><div class="card"><b>Šta jesti</b>${t("eat")}<b>Šta izbegavati</b>${t("avoid")}
 <button class="btn sec full" data-a="viscGoals">Podesi kalorije (−400) i protein (2 g/kg)</button></div>
 <h2>Plan obroka</h2><div class="chips">${DAYS_S.map((n,i)=>`<button class="chip ${i===viscDay?"on":""}" data-a="vday" data-i="${i}">${n}</button>`).join("")}</div>
 <div class="card">${pl.map((id,i)=>{const r=RECIPES.find(x=>x.id===id);return `<div class="li" data-a="recipe" data-id="${id}"><div class="grow"><div class="mut">${MEALS[i]}</div>${esc(r.name)}</div><b>${r.k}</b></div>`}).join("")}
 <div class="mut" style="margin-top:6px">Ukupno ~${pl.reduce((a,id)=>a+RECIPES.find(x=>x.id===id).k,0)} kcal · P ${pl.reduce((a,id)=>a+RECIPES.find(x=>x.id===id).p,0)}g – prilagodi porcije svom cilju.</div>
 <button class="btn full" data-a="addPlan" style="margin-top:8px">Dodaj ovaj dan u dnevnik ishrane (danas)</button></div>
 <h2>3) Navike</h2><div class="card">${t("habits")}</div>`};

/* ---------- render ---------- */
const TITLES={visc:"Visceralna mast",home:"GymFlow",train:"Trening",food:"Ishrana",prog:"Napredak",plan:"Plan"};
function render(){
 $("#view").innerHTML=V[tab]();$("#title").textContent=TITLES[tab];
 document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.t===(tab==="visc"?"food":tab)));
}
function sheet(html){$("#panel").innerHTML=html;$("#sheet").hidden=false}
function closeSheet(){$("#sheet").hidden=true;$("#panel").innerHTML=""}

/* ---------- exercise picker ---------- */
let pickCb=null,pickM="";
function picker(cb){pickCb=cb;pickM="";drawPicker("")}
function drawPicker(q){
 const l=EX.filter(e=>(!pickM||e[2]===pickM)&&e[1].toLowerCase().includes(q.toLowerCase()));
 sheet(`<h3 style="margin-bottom:8px">Izaberi vežbu</h3><input id="pq" placeholder="Pretraži…" value="${esc(q)}">
 <div class="chips"><button class="chip ${pickM?"":"on"}" data-a="pm" data-m="">Sve</button>${MUSCLES.map(m=>`<button class="chip ${pickM===m?"on":""}" data-a="pm" data-m="${m}">${m}</button>`).join("")}</div>
 ${l.map(e=>`<div class="li" data-a="pick" data-id="${e[0]}"><div class="grow">${esc(e[1])}<div class="mut">${e[2]} · ${e[3]}</div></div><span>＋</span></div>`).join("")}`);
 const i=$("#pq");i.focus();i.setSelectionRange(q.length,q.length);i.oninput=()=>drawPicker(i.value)}

/* ---------- routine builder ---------- */
let B=null;
function drawBuilder(){
 sheet(`<h3>${B.id?"Uredi rutinu":"Nova rutina"}</h3><label>Naziv</label><input id="bn" value="${esc(B.name)}" placeholder="npr. Push dan">
 ${B.items.map((it,i)=>`<div class="card" style="background:var(--card2)"><div class="row sp"><b class="grow">${esc(exName(it.ex))}</b><button class="x" data-a="bdel" data-i="${i}">✕</button></div>
 <div class="grid2"><div><label>Serije</label><input data-b="${i}" data-k="sets" inputmode="numeric" value="${it.sets}"></div><div><label>Ponavljanja</label><input data-b="${i}" data-k="reps" inputmode="numeric" value="${it.reps}"></div></div></div>`).join("")}
 <button class="btn sec full" data-a="badd" style="margin:10px 0">+ Dodaj vežbu</button>
 <button class="btn full" data-a="bsave">Sačuvaj</button>${B.id?`<div style="height:8px"></div><button class="btn bad full" data-a="bremove">Obriši rutinu</button>`:""}`)}

/* ---------- active workout ---------- */
let rest=null,tick=null;
function startSession(rid){
 const r=S.routines.find(x=>x.id===rid);
 A={name:r?r.name:"Slobodan trening",rid:rid||null,start:Date.now(),ex:(r?r.items:[]).map(i=>mkEx(i.ex,i.sets,i.reps))};
 saveA();drawSession();
}
function mkEx(id,sets,reps){const ls=lastSets(id);return {id,sets:Array.from({length:sets},(_,i)=>({w:ls[i]?ls[i].w:"",r:ls[i]?ls[i].r:reps,done:false}))}}
function drawSession(){
 const el=$("#session");if(!A){el.hidden=true;return}el.hidden=false;
 const done=A.ex.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0),all=A.ex.reduce((a,e)=>a+e.sets.length,0);
 el.innerHTML=`<div class="bar2"><div class="row sp"><div><b>${esc(A.name)}</b><div class="mut" id="clock"></div></div>
 <div class="row"><button class="btn bad sm" data-a="cancelS">Odustani</button><button class="btn sm" data-a="finish">Završi</button></div></div>${bar(all?done/all*100:0,"var(--ac)")}</div>
 ${A.ex.map((e,ei)=>{const ls=lastSets(e.id);return `<div class="card"><div class="row sp"><div><h3>${esc(exName(e.id))}</h3><div class="mut">${ls.length?"Prošli put: "+ls.map(s=>s.w+"×"+s.r).join(", "):exById(e.id)[2]}</div></div><button class="x" data-a="exdel" data-e="${ei}">🗑</button></div>
 <div class="setrow mut"><span>#</span><span>kg</span><span>pon.</span><span></span><span></span></div>
 ${e.sets.map((s,si)=>`<div class="setrow"><span class="mut">${si+1}</span><input data-s="${ei},${si}" data-k="w" inputmode="decimal" placeholder="kg" value="${s.w}"><input data-s="${ei},${si}" data-k="r" inputmode="numeric" placeholder="pon." value="${s.r}">
 <button class="ck ${s.done?"on":""}" data-a="sdone" data-e="${ei}" data-s="${si}">✓</button><button class="x" data-a="sdel" data-e="${ei}" data-s="${si}">−</button></div>`).join("")}
 <button class="btn sec sm" data-a="sadd" data-e="${ei}">+ Serija</button></div>`}).join("")}
 <button class="btn sec full" data-a="exadd">+ Dodaj vežbu</button>
 <div class="rest" id="rest" ${rest?"":"hidden"}><span>⏱ Odmor <span id="rt"></span></span><span><button class="btn sec sm" data-a="rest" data-n="30">+30s</button> <button class="btn sec sm" data-a="rest" data-n="0">Preskoči</button></span></div>`;
 clearInterval(tick);tick=setInterval(updClock,500);updClock();
}
function updClock(){
 if(!A){clearInterval(tick);return}
 const c=$("#clock");if(c){const s=Math.floor((Date.now()-A.start)/1000);c.textContent=`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`}
 const r=$("#rest");if(!r)return;
 if(rest){const left=Math.ceil((rest-Date.now())/1000);if(left<=0){rest=null;r.hidden=true;navigator.vibrate&&navigator.vibrate([200,100,200]);toast("Odmor gotov – sledeća serija!")}else{r.hidden=false;$("#rt").textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`}}
}
function finish(){
 const sets=[];A.ex.forEach(e=>e.sets.forEach(s=>{if(s.done&&num(s.r)>0)sets.push({ex:e.id,w:num(s.w),r:num(s.r)})}));
 if(!sets.length){toast("Označi bar jednu seriju ✓");return}
 const prBefore=prs();let newPR=0;
 sets.forEach(s=>{const p=prBefore[s.ex];if(s.w>0&&(!p||e1rm(s.w,s.r)>p.e+0.01)){newPR++;prBefore[s.ex]={e:e1rm(s.w,s.r)}}});
 S.logs.push({id:Date.now(),date:today(),name:A.name,rid:A.rid,sets,min:Math.round((Date.now()-A.start)/60000)});
 save();A=null;rest=null;saveA();drawSession();render();toast(newPR?`Sačuvano! 🏆 ${newPR} novih rekorda`:"Trening sačuvan 💪");
}

/* ---------- food sheet ---------- */
let F={meal:"",q:"",sel:null,mode:"db"};
function drawFood(){
 if(F.sel!==null){const f=FOODS[F.sel];return sheet(`<h3>${esc(f[0])}</h3><div class="mut">na 100g: ${f[1]} kcal · P${f[2]} UH${f[3]} M${f[4]}</div>
 <label>Količina (g)</label><input id="amt" inputmode="decimal" value="${f[5]}"><div id="prev" class="card"></div>
 <button class="btn full" data-a="foodAdd">Dodaj u ${F.meal.toLowerCase()}</button><div style="height:8px"></div><button class="btn sec full" data-a="foodBack">Nazad</button>`),calcPrev(),
 $("#amt").addEventListener("input",calcPrev)}
 if(F.mode==="man")return sheet(`<h3>Ručni unos – ${F.meal}</h3><div class="chips"><button class="chip" data-a="fmode" data-m="db">Baza</button><button class="chip on">Ručno</button></div>
 <form data-form="manual"><label>Naziv</label><input name="name" required><div class="grid2"><div><label>Kalorije</label><input name="kcal" inputmode="decimal" required></div><div><label>Proteini (g)</label><input name="p" inputmode="decimal"></div>
 <div><label>Ugljeni H. (g)</label><input name="c" inputmode="decimal"></div><div><label>Masti (g)</label><input name="f" inputmode="decimal"></div></div><button class="btn full" style="margin-top:10px">Dodaj</button></form>`);
 const l=FOODS.map((f,i)=>({f,i})).filter(x=>x.f[0].toLowerCase().includes(F.q.toLowerCase()));
 sheet(`<h3 style="margin-bottom:8px">${F.meal}</h3><div class="chips"><button class="chip on">Baza</button><button class="chip" data-a="fmode" data-m="man">Ručno</button></div>
 <input id="fq" placeholder="Pretraži hranu…" value="${esc(F.q)}">${l.map(x=>`<div class="li" data-a="fsel" data-i="${x.i}"><div class="grow">${esc(x.f[0])}<div class="mut">${x.f[1]} kcal/100g · P${x.f[2]}</div></div><span>＋</span></div>`).join("")}`);
 const i=$("#fq");i.oninput=()=>{F.q=i.value;drawFood();const n=$("#fq");n.focus();n.setSelectionRange(F.q.length,F.q.length)}}
function calcPrev(){const f=FOODS[F.sel],a=num($("#amt").value)/100;$("#prev").innerHTML=`<b>${Math.round(f[1]*a)} kcal</b> · P ${r1(f[2]*a)}g · UH ${r1(f[3]*a)}g · M ${r1(f[4]*a)}g`}

/* ---------- actions ---------- */
function addRecipe(id,meal,date){const r=RECIPES.find(x=>x.id===id);(S.meals[date]=S.meals[date]||[]).push({meal,name:r.name,amt:0,kcal:r.k,p:r.p,c:r.c,f:r.f})}
const act={
 async authgo(el){SY.url=$("#sy_url").value.trim();try{const r=await api("/api/"+el.dataset.m,{method:"POST",body:JSON.stringify({email:$("#sy_em").value,password:$("#sy_pw").value})});
  SY.token=r.token;SY.email=$("#sy_em").value.trim().toLowerCase();saveSY();syncMsg="Prijavljen";toast("Prijavljen");await sync();render()}catch(e){saveSY();syncMsg=e.message;render()}},
 syncNow(){syncMsg="Sinhronizacija…";render();sync()},
 logout(){SY.token=null;saveSY();syncMsg="";render()},
 fview(el){foodView=el.dataset.v;render()},recm(el){recM=el.dataset.m;render()},recv(){recV=!recV;render()},
 vweek(el){viscWeek=+el.dataset.i;render()},vday(el){viscDay=+el.dataset.i;render()},
 recipe(el){const r=RECIPES.find(x=>x.id===el.dataset.id);
  sheet(`<h3>${esc(r.name)}</h3><div class="mut">${r.meal} · ${r.min} min · ${r.k} kcal · P${r.p} UH${r.c} M${r.f}</div><b>Sastojci</b><ul>${r.ing.map(i=>`<li>${esc(i)}</li>`).join("")}</ul><b>Priprema</b><ol>${r.steps.map(i=>`<li>${esc(i)}</li>`).join("")}</ol>
  <label>Dodaj u</label><select id="rm">${MEALS.map(m=>`<option ${m===r.meal?"selected":""}>${m}</option>`).join("")}</select><button class="btn full" style="margin-top:10px" data-a="recAdd" data-id="${r.id}">Dodaj u dnevnik (${foodDate===today()?"danas":foodDate})</button>`)},
 recAdd(el){addRecipe(el.dataset.id,$("#rm").value,foodDate);save();closeSheet();toast("Dodato u dnevnik");render()},
 applyVisc(){VISC_ROUTINES.forEach(r=>{const i=S.routines.findIndex(x=>x.id===r.id);if(i<0)S.routines.push(structuredClone(r))});
  Object.assign(S.schedule,VISC_SCHEDULE);save();toast("Raspored primenjen – vidi Plan");},
 viscGoals(){const w=S.body.at(-1)?.weight;S.goals.kcal=Math.max(1200,S.goals.kcal-400);S.goals.p=w?Math.round(w*2):S.goals.p;S.goals.f=Math.round(S.goals.kcal*0.28/9);S.goals.c=Math.max(0,Math.round((S.goals.kcal-S.goals.p*4-S.goals.f*9)/4));save();toast(`Cilj: ${S.goals.kcal} kcal`)},
 addPlan(){VISC_MEALPLAN[viscDay].forEach((id,i)=>addRecipe(id,MEALS[i],today()));save();toast("Dan dodat u dnevnik")},
 tab(el){tab=el.dataset.t;render();scrollTo(0,0)},closeSheet,
 start(el){startSession(el.dataset.id)},startFree(){startSession(null)},resume(){drawSession()},
 water(el){const d=el.dataset.d||today();S.water[d]=Math.max(0,(S.water[d]||0)+ +el.dataset.n);save();render()},
 libm(el){lib.m=el.dataset.m;render()},
 newRoutine(){B={id:null,name:"",items:[]};drawBuilder()},
 editRoutine(el){const r=S.routines.find(x=>x.id===el.dataset.id);B=structuredClone(r);drawBuilder()},
 badd(){B.name=$("#bn").value;picker(id=>{B.items.push({ex:id,sets:3,reps:10});drawBuilder()})},
 bdel(el){B.name=$("#bn").value;B.items.splice(+el.dataset.i,1);drawBuilder()},
 bsave(){B.name=$("#bn").value.trim();if(!B.name||!B.items.length)return toast("Unesi naziv i bar jednu vežbu");
  B.items.forEach(i=>{i.sets=Math.max(1,Math.round(num(i.sets))||3);i.reps=Math.max(1,Math.round(num(i.reps))||10)});
  if(B.id)S.routines[S.routines.findIndex(r=>r.id===B.id)]=B;else{B.id="r"+Date.now();S.routines.push(B)}
  save();closeSheet();render()},
 bremove(){if(!confirm("Obrisati rutinu?"))return;S.routines=S.routines.filter(r=>r.id!==B.id);Object.keys(S.schedule).forEach(k=>{if(S.schedule[k]===B.id)S.schedule[k]=null});save();closeSheet();render()},
 pm(el){pickM=el.dataset.m;drawPicker($("#pq")?.value||"")},
 pick(el){const cb=pickCb;if(cb)cb(el.dataset.id);if(cb&&A&&!B)closeSheet()},
 delLog(el){if(confirm("Obrisati trening?")){S.logs=S.logs.filter(l=>l.id!==+el.dataset.i);save();render()}},
 /* session */
 sdone(el){const s=A.ex[+el.dataset.e].sets[+el.dataset.s];s.done=!s.done;if(s.done){rest=Date.now()+90000}saveA();drawSession()},
 sadd(el){const e=A.ex[+el.dataset.e],l=e.sets.at(-1)||{w:"",r:10};e.sets.push({w:l.w,r:l.r,done:false});saveA();drawSession()},
 sdel(el){A.ex[+el.dataset.e].sets.splice(+el.dataset.s,1);saveA();drawSession()},
 exdel(el){A.ex.splice(+el.dataset.e,1);saveA();drawSession()},
 exadd(){B=null;picker(id=>{A.ex.push(mkEx(id,3,10));saveA();drawSession()})},
 rest(el){const n=+el.dataset.n;rest=n?(rest||Date.now())+n*1000:null;drawSession()},
 cancelS(){if(confirm("Odustati od treninga? Podaci se brišu.")){A=null;rest=null;saveA();drawSession()}},
 finish,
 /* food */
 fday(el){foodDate=addDays(foodDate,+el.dataset.n);render()},
 addFood(el){F={meal:el.dataset.m,q:"",sel:null,mode:"db"};drawFood()},
 fmode(el){F.mode=el.dataset.m;drawFood()},fsel(el){F.sel=+el.dataset.i;drawFood()},foodBack(){F.sel=null;drawFood()},
 foodAdd(){const f=FOODS[F.sel],a=num($("#amt").value);if(a<=0)return;const k=a/100;
  (S.meals[foodDate]=S.meals[foodDate]||[]).push({meal:F.meal,name:f[0],amt:a,kcal:f[1]*k,p:f[2]*k,c:f[3]*k,f:f[4]*k});save();closeSheet();render()},
 delFood(el){S.meals[foodDate].splice(+el.dataset.i,1);save();render()},
 /* progress / plan */
 delBody(el){S.body=S.body.filter(b=>b.date!==el.dataset.d);save();render()},
 sched(el){S.schedule[el.dataset.d]=el.value||null;save();toast("Sačuvano")},
 export(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S)],{type:"application/json"}));a.download=`gymflow-${today()}.json`;a.click()},
 reset(){if(confirm("Obrisati SVE podatke?")&&confirm("Sigurno? Ovo se ne može poništiti.")){localStorage.removeItem(KEY);localStorage.removeItem(AKEY);location.reload()}}
};
document.addEventListener("click",e=>{const el=e.target.closest("[data-a]");if(!el||el.tagName==="SELECT")return;const f=act[el.dataset.a];if(f)f(el)});
document.addEventListener("change",e=>{const el=e.target;
 if(el.dataset.a==="sched")act.sched(el);
 if(el.id==="progEx"){progEx=el.value;render()}
 if(el.id==="imp"&&el.files[0]){const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.routines||!d.logs)throw 0;S=d;save();render();toast("Uvezeno")}catch(x){toast("Neispravan fajl")}};r.readAsText(el.files[0])}});
document.addEventListener("input",e=>{const el=e.target;
 if(el.id==="libq"){lib.q=el.value;const p=el.selectionStart;render();const n=$("#libq");n.focus();n.setSelectionRange(p,p)}
 if(el.dataset.s&&A){const [ei,si]=el.dataset.s.split(",");A.ex[ei].sets[si][el.dataset.k]=el.value;saveA()}
 if(el.dataset.b&&B){B.items[el.dataset.b][el.dataset.k]=el.value}
 if(el.id==="bn"&&B)B.name=el.value});
document.addEventListener("submit",e=>{const f=e.target.dataset.form;if(!f)return;e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 if(f==="body"){const w=num(d.weight);if(!w)return;const t=today();S.body=S.body.filter(b=>b.date!==t);S.body.push({date:t,weight:w,waist:num(d.waist)||"",chest:num(d.chest)||"",arm:num(d.arm)||""});S.body.sort((a,b)=>a.date<b.date?-1:1);save();render();toast("Merenje sačuvano")}
 if(f==="goals"){Object.keys(d).forEach(k=>S.goals[k]=Math.max(1,Math.round(num(d[k]))));save();toast("Ciljevi sačuvani")}
 if(f==="calc"){const w=num(d.w),h=num(d.h),a=num(d.age);let bmr=10*w+6.25*h-5*a+(d.sex==="m"?5:-161);const k=Math.round((bmr*num(d.act)+num(d.goal))/10)*10;
  S.goals.kcal=k;S.goals.p=Math.round(w*2);S.goals.f=Math.round(k*0.25/9);S.goals.c=Math.max(0,Math.round((k-S.goals.p*4-S.goals.f*9)/4));save();render();toast(`Cilj: ${k} kcal`)}
 if(f==="manual"){(S.meals[foodDate]=S.meals[foodDate]||[]).push({meal:F.meal,name:d.name,amt:0,kcal:num(d.kcal),p:num(d.p),c:num(d.c),f:num(d.f)});save();closeSheet();render()}});
window.addEventListener("beforeunload",()=>{saveA()});
render();if(A)drawSession();sync();
if("serviceWorker"in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
