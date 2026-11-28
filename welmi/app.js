const $=s=>document.querySelector(s),KEY='welmi.v1';
const today=()=>new Date().toISOString().slice(0,10);
let S=JSON.parse(localStorage.getItem(KEY)||'null')||{profile:null,log:{},water:{},weights:[],ob:0,draft:{sex:'m',age:30,height:175,weight:80,target:72,act:1.4}};
let tab='today',day=today();
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const MEALS=[['breakfast','Doručak','🍳'],['lunch','Ručak','🍝'],['dinner','Večera','🥗'],['snack','Užina','🍎']];
const r=n=>Math.round(n||0);
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2000)}
function calc(d){ // Mifflin-St Jeor
 const bmr=10*d.weight+6.25*d.height-5*d.age+(d.sex==='m'?5:-161),tdee=bmr*d.act;
 let k=d.target<d.weight-.5?tdee-500:d.target>d.weight+.5?tdee+300:tdee;k=Math.max(k,d.sex==='m'?1500:1200);
 return {kcal:r(k),carbs:r(k*.4/4),protein:r(k*.3/4),fat:r(k*.3/9)};
}
const entries=d=>S.log[d]||[];
const sum=d=>entries(d).reduce((a,e)=>({k:a.k+e.kcal,p:a.p+e.p,c:a.c+e.c,f:a.f+e.f}),{k:0,p:0,c:0,f:0});
function streak(){let n=0,d=new Date();if(!entries(d.toISOString().slice(0,10)).length)d.setDate(d.getDate()-1);
 while(entries(d.toISOString().slice(0,10)).length){n++;d.setDate(d.getDate()-1)}return n}
function addEntry(e){(S.log[day]=S.log[day]||[]).push({id:Date.now()+Math.random(),ts:Date.now(),...e});save();closeSheet();render();toast('Dodato ✓')}
function closeSheet(){$('#sheet').classList.add('hidden')}
function sheet(h){const s=$('#sheet');s.innerHTML='<div>'+h+'</div>';s.classList.remove('hidden');s.onclick=e=>{if(e.target===s)closeSheet()}}

/* ---------- ONBOARDING ---------- */
const OB=[
 {t:'Ko si ti?',s:'Za tačan proračun kalorija',f:d=>`<label>Pol</label><div class="seg"><button class="sec ${d.sex=='m'?'on':''}" data-set="sex" data-v="m">Muško</button><button class="sec ${d.sex=='f'?'on':''}" data-set="sex" data-v="f">Žensko</button></div><br><label>Godine</label><input type="number" data-num="age" value="${d.age}">`},
 {t:'Kolika ti je visina?',s:'Visina oblikuje proporcije tela',f:d=>`<div class="big">${d.height} cm</div><input type="range" min="130" max="220" value="${d.height}" data-num="height">`},
 {t:'Kolika ti je težina?',s:'Trenutna težina',f:d=>`<div class="big">${d.weight} kg</div><input type="range" min="35" max="200" step=".5" value="${d.weight}" data-num="weight">`},
 {t:'Ciljna težina?',s:'Postavi cilj koji možeš da dostigneš',f:d=>{const h=d.height/100,lo=(18.5*h*h).toFixed(0),hi=(24.9*h*h).toFixed(0);return `<div class="big">${d.target} kg</div><input type="range" min="35" max="200" step=".5" value="${d.target}" data-num="target"><div class="card mu">✅ Zdrav opseg za tvoju visinu: ${lo}–${hi} kg</div>`}},
 {t:'Koliko si aktivan?',s:'Prosečna nedeljna aktivnost',f:d=>`<select data-num="act">${[[1.2,'Sedentaran'],[1.4,'Lagano aktivan (1-3 treninga)'],[1.55,'Umereno aktivan (3-5)'],[1.75,'Veoma aktivan (6-7)']].map(([v,n])=>`<option value="${v}" ${d.act==v?'selected':''}>${n}</option>`).join('')}</select>`}
];
function onboarding(){
 const d=S.draft,st=OB[S.ob],last=S.ob==OB.length-1;
 $('#app').innerHTML=`<div class="top"><b style="font-size:24px">Wel<span style="color:var(--red)">mi</span></b></div>
 <div class="dots">${OB.map((_,i)=>`<i class="${i<=S.ob?'on':''}"></i>`).join('')}</div><h1>${st.t}</h1><p class="mu">${st.s}</p>${st.f(d)}
 <button class="pri" id="next">${last?'Izračunaj moj plan':'Dalje'}</button>${S.ob?'<button class="sec" id="back" style="width:100%;margin-top:8px">Nazad</button>':''}`;
 document.querySelectorAll('[data-set]').forEach(b=>b.onclick=()=>{d[b.dataset.set]=b.dataset.v;save();onboarding()});
 document.querySelectorAll('[data-num]').forEach(i=>{i.oninput=()=>{d[i.dataset.num]=+i.value;if(i.type=='range'){i.previousElementSibling.textContent=i.value+(i.dataset.num?' ':'')+'kg'.replace('kg',i.dataset.num=='height'?'cm':'kg')}};i.onchange=save});
 $('#next').onclick=()=>{document.querySelectorAll('[data-num]').forEach(i=>d[i.dataset.num]=+i.value);
  if(!last){S.ob++;save();return onboarding()}
  S.profile={...d,...calc(d)};S.weights=[{date:today(),kg:d.weight}];save();render()};
 if($('#back'))$('#back').onclick=()=>{S.ob--;save();onboarding()};
}

/* ---------- TODAY ---------- */
function today_(){
 const p=S.profile,t=sum(day),left=p.kcal-t.k,pct=Math.min(1,t.k/p.kcal),C=2*Math.PI*75;
 const mac=(n,v,g,c)=>`<div><span style="color:${c}">●</span> ${n}<div class="bar"><i style="width:${Math.min(100,v/g*100)}%;background:${c}"></i></div>${r(v)}/${g}g</div>`;
 const w=S.water[day]||0;
 return `<div class="top"><div><h1>${day==today()?'Danas':day}</h1><span class="mu">${new Date(day).toLocaleDateString('sr-Latn',{weekday:'long',day:'numeric',month:'long'})}</span></div><div class="pill">🔥 ${streak()}</div></div>
 <div class="card"><div class="ringwrap"><div class="side"><b>${r(t.k)}</b><span class="mu">uneto</span></div>
 <div class="ring"><svg width="170" height="170"><circle cx="85" cy="85" r="75" fill="none" stroke="#eef0f5" stroke-width="9"/><circle cx="85" cy="85" r="75" fill="none" stroke="${left<0?'#f59e0b':'#ff3b4e'}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg><div class="c"><b>${Math.abs(r(left))}</b><span class="mu">kcal ${left<0?'preko':'ostalo'}</span></div></div>
 <div class="side"><b>0</b><span class="mu">potrošeno</span></div></div>
 <div class="macros">${mac('Ugljeni h.',t.c,p.carbs,'#f59e0b')}${mac('Proteini',t.p,p.protein,'#ef4444')}${mac('Masti',t.f,p.fat,'#3b82f6')}</div></div>
 <div class="card"><div class="row sp"><h2>Ishrana</h2><span class="mu">${entries(day).length?entries(day).length+' stavki':'Još nema obroka'}</span></div>
 <div class="meals">${MEALS.map(([k,n,e])=>{const x=entries(day).filter(i=>i.meal==k),kc=x.reduce((a,i)=>a+i.kcal,0);return `<div class="meal" data-add="${k}"><div class="o ${x.length?'on':''}">${x.length?e:'+'}</div>${n}<br><span class="mu">${r(kc)} kcal</span></div>`}).join('')}</div></div>
 ${entries(day).length?`<div class="card">${entries(day).slice().reverse().map(e=>`<div class="item" data-edit="${e.id}"><div><b>${e.name}</b><br><span class="mu">${MEALS.find(m=>m[0]==e.meal)[1]} · ${e.serv||'1 porcija'} · P${r(e.p)} U${r(e.c)} M${r(e.f)}</span></div><b>${r(e.kcal)}</b></div>`).join('')}</div>`:''}
 <div class="card"><div class="row sp"><h2>💧 Voda</h2><span class="mu">${w*250} / 2000 ml</span></div><div class="cups">${Array.from({length:8},(_,i)=>`<div class="cup ${i<w?'on':''}" data-cup="${i+1}"></div>`).join('')}</div></div>`;
}

/* ---------- PROGRESS / PROFILE ---------- */
function progress(){
 const ws=S.weights,p=S.profile,last=ws[ws.length-1].kg,days=[...Array(7)].map((_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);const k=d.toISOString().slice(0,10);return [k,sum(k).k]}),mx=Math.max(p.kcal,...days.map(d=>d[1]));
 let svg='';if(ws.length>1){const a=ws.slice(-12),mn=Math.min(...a.map(x=>x.kg))-1,mxw=Math.max(...a.map(x=>x.kg))+1;
  svg=`<svg viewBox="0 0 300 100" width="100%"><polyline fill="none" stroke="#ff3b4e" stroke-width="3" points="${a.map((x,i)=>`${i*300/(a.length-1)},${100-(x.kg-mn)/(mxw-mn)*90-5}`).join(' ')}"/></svg>`}
 return `<h1>Napredak</h1><div class="card"><div class="row sp"><div><span class="mu">Trenutno</span><div class="big" style="margin:4px 0;text-align:left">${last} kg</div></div><div style="text-align:right"><span class="mu">Cilj</span><div style="font-size:24px;font-weight:800">${p.target} kg</div></div></div>${svg}<button class="sec" id="logw" style="width:100%;margin-top:10px">+ Unesi težinu</button></div>
 <div class="card"><h2>Kalorije – 7 dana</h2><div class="row" style="align-items:flex-end;height:110px">${days.map(([k,v])=>`<div style="flex:1;text-align:center"><div style="height:${v/mx*90}px;background:${v>p.kcal?'#f59e0b':'#ff3b4e'};border-radius:6px;min-height:2px"></div><span class="mu">${k.slice(8)}</span></div>`).join('')}</div></div>
 <div class="card"><h2>Tvoj plan</h2>${p.kcal} kcal · U ${p.carbs}g · P ${p.protein}g · M ${p.fat}g<br><button class="sec" id="redo" style="margin-top:10px">Ponovo podesi profil</button></div>`;
}

/* ---------- ADD FLOW ---------- */
function addMenu(meal){
 meal=meal||(()=>{const h=new Date().getHours();return h<11?'breakfast':h<15?'lunch':h<21?'dinner':'snack'})();
 sheet(`<h2>Dodaj u: <select id="mealsel" style="width:auto;display:inline;padding:4px">${MEALS.map(m=>`<option value="${m[0]}" ${m[0]==meal?'selected':''}>${m[1]}</option>`).join('')}</select></h2>
 <div class="grid2"><div class="act" id="a-scan"><span>📸</span>Skeniraj obrok</div><div class="act" id="a-bar"><span>▮▯▮</span>Barkod</div><div class="act" id="a-desc"><span>🎤</span>Opiši</div><div class="act" id="a-search"><span>🔍</span>Pretraži</div></div>
 <input type="file" accept="image/*" capture="environment" id="file" hidden>`);
 const m=()=>$('#mealsel').value;
 $('#a-scan').onclick=()=>$('#file').click();$('#file').onchange=e=>scan(e.target.files[0],m());
 $('#a-bar').onclick=()=>barcode(m());$('#a-desc').onclick=()=>describe(m());$('#a-search').onclick=()=>search(m());
}
function confirmItem(it,meal,img){
 let q=1;const v=()=>({meal,name:it.name,serv:it.serv,kcal:it.kcal*q,p:it.p*q,c:it.c*q,f:it.f*q});
 const draw=()=>{sheet(`${img?`<img class="ph" src="${img}">`:''}<h2 style="margin-top:10px">${it.name}</h2><div class="row sp"><span class="mu">${it.serv||'1 porcija'}</span><div class="row"><button class="sec" id="mi">−</button><b>${q}×</b><button class="sec" id="pl">+</button></div></div>
 <div class="card"><div style="font-size:26px;font-weight:800">🔥 ${r(it.kcal*q)} <span class="mu">kcal</span></div><div class="macros" style="margin-top:8px"><div>Ugljeni<br><b>${r(it.c*q)} g</b></div><div>Proteini<br><b>${r(it.p*q)} g</b></div><div>Masti<br><b>${r(it.f*q)} g</b></div></div></div>
 <button class="pri" id="ok">Dodaj u dnevnik</button>`);
  $('#mi').onclick=()=>{q=Math.max(.5,q-.5);draw()};$('#pl').onclick=()=>{q+=.5;draw()};$('#ok').onclick=()=>addEntry(v())};draw();
}
const fromFood=f=>({name:f[0],serv:f[6],kcal:f[1]*f[5]/100,p:f[2]*f[5]/100,c:f[3]*f[5]/100,f:f[4]*f[5]/100});
function search(meal){
 const draw=q=>{const L=FOODS.filter(f=>f[0].toLowerCase().includes(q.toLowerCase())).slice(0,30);
  $('#sl').innerHTML=L.map((f,i)=>`<div class="item" data-i="${FOODS.indexOf(f)}"><div><b>${f[0]}</b><br><span class="mu">${f[6]}</span></div><b>${r(f[1]*f[5]/100)}</b></div>`).join('')+`<div class="item" id="custom"><b>+ Unesi ručno</b></div>`;
  document.querySelectorAll('#sl [data-i]').forEach(e=>e.onclick=()=>confirmItem(fromFood(FOODS[e.dataset.i]),meal));$('#custom').onclick=()=>manual(meal,$('#q').value)};
 sheet('<input id="q" placeholder="Pretraži hranu…" autofocus><div id="sl"></div>');draw('');$('#q').oninput=e=>draw(e.target.value);
}
function manual(meal,name='',pre={}){
 sheet(`<h2>Ručni unos</h2><label>Naziv</label><input id="n" value="${name}"><label>Kalorije</label><input id="k" type="number" value="${pre.kcal?r(pre.kcal):''}"><div class="grid2"><div><label>Proteini g</label><input id="p" type="number" value="${r(pre.p)||''}"></div><div><label>Ugljeni g</label><input id="c" type="number" value="${r(pre.c)||''}"></div></div><label>Masti g</label><input id="f" type="number" value="${r(pre.f)||''}"><button class="pri" id="ok">Dodaj</button>`);
 $('#ok').onclick=()=>{if(!$('#n').value||!$('#k').value)return toast('Unesi naziv i kalorije');addEntry({meal,name:$('#n').value,serv:pre.serv,kcal:+$('#k').value,p:+$('#p').value,c:+$('#c').value,f:+$('#f').value})}
}
async function ai(payload){
 const res=await fetch('/api/analyze',{method:'POST',body:JSON.stringify(payload)});const j=await res.json().catch(()=>({error:'Server nedostupan'}));
 if(!res.ok||j.error)throw new Error(j.error||'AI greška');return {name:j.name,serv:j.serving,kcal:+j.kcal,p:+j.protein,c:+j.carbs,f:+j.fat};
}
function resize(file){return new Promise(ok=>{const im=new Image();im.onload=()=>{const s=Math.min(1,1024/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);ok(c.toDataURL('image/jpeg',.8))};im.src=URL.createObjectURL(file)})}
async function scan(file,meal){
 if(!file)return;const url=await resize(file);sheet(`<img class="ph" src="${url}"><p class="mu" style="text-align:center">🔎 Analiziram obrok…</p>`);
 try{confirmItem(await ai({image:url.split(',')[1]}),meal,url)}catch(e){toast(e.message);manual(meal,'',{})}
}
function describe(meal){
 sheet(`<h2>Opiši šta si jeo</h2><input id="d" placeholder="npr. 2 jaja i parče hleba sa sirom"><button class="pri" id="go">Analiziraj</button>`);
 $('#go').onclick=async()=>{const t=$('#d').value;if(!t)return;$('#go').textContent='Analiziram…';
  try{confirmItem(await ai({text:t}),meal)}catch(e){toast(e.message);manual(meal,t)}}
}
function barcode(meal){
 sheet(`<h2>Barkod</h2><video id="v" playsinline style="width:100%;border-radius:16px;display:none"></video><input id="b" inputmode="numeric" placeholder="Unesi barkod (EAN)"><button class="pri" id="go">Pronađi</button>`);
 let stream,stop=false;const end=()=>{stop=true;stream&&stream.getTracks().forEach(t=>t.stop())};
 const look=async code=>{end();try{const j=await(await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`)).json();if(j.status!==1)throw 0;const n=j.product.nutriments||{},g=+j.product.serving_quantity||100,f=g/100;
  confirmItem({name:(j.product.product_name||'Proizvod')+(j.product.brands?' – '+j.product.brands.split(',')[0]:''),serv:g+' g',kcal:(n['energy-kcal_100g']||0)*f,p:(n.proteins_100g||0)*f,c:(n.carbohydrates_100g||0)*f,f:(n.fat_100g||0)*f},meal)}catch{toast('Proizvod nije pronađen');manual(meal,'')}};
 $('#go').onclick=()=>$('#b').value&&look($('#b').value.trim());
 if('BarcodeDetector'in window&&navigator.mediaDevices){navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(async s=>{stream=s;const v=$('#v');v.style.display='block';v.srcObject=s;await v.play();
  const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});(async function loop(){if(stop)return;try{const c=await det.detect(v);if(c[0])return look(c[0].rawValue)}catch{}setTimeout(loop,400)})()}).catch(()=>{})}
 $('#sheet').addEventListener('click',e=>{if(e.target.id==='sheet')end()},{once:true});
}
function editItem(id){
 const e=entries(day).find(x=>x.id==id);sheet(`<h2>${e.name}</h2><p class="mu">${r(e.kcal)} kcal · P${r(e.p)} U${r(e.c)} M${r(e.f)}</p><button class="pri" id="del" style="background:var(--red)">Obriši</button>`);
 $('#del').onclick=()=>{S.log[day]=S.log[day].filter(x=>x.id!=id);save();closeSheet();render()};
}

/* ---------- SHELL ---------- */
function render(){
 if(!S.profile)return onboarding();
 $('#app').innerHTML=(tab=='today'?today_():progress())+`<div class="nav"><div><a data-tab="today" class="${tab=='today'?'on':''}">🍎<br>Ishrana</a><button class="fab" id="fab">+</button><a data-tab="progress" class="${tab=='progress'?'on':''}">📊<br>Napredak</a></div></div>`;
 document.querySelectorAll('[data-tab]').forEach(a=>a.onclick=()=>{tab=a.dataset.tab;render()});
 $('#fab').onclick=()=>addMenu();
 document.querySelectorAll('[data-add]').forEach(m=>m.onclick=()=>addMenu(m.dataset.add));
 document.querySelectorAll('[data-edit]').forEach(m=>m.onclick=()=>editItem(m.dataset.edit));
 document.querySelectorAll('[data-cup]').forEach(c=>c.onclick=()=>{const n=+c.dataset.cup;S.water[day]=(S.water[day]||0)===n?n-1:n;save();render()});
 if($('#logw'))$('#logw').onclick=()=>{sheet(`<h2>Težina (kg)</h2><input id="w" type="number" step=".1" value="${S.weights.at(-1).kg}"><button class="pri" id="ok">Sačuvaj</button>`);$('#ok').onclick=()=>{const kg=+$('#w').value;if(!kg)return;S.weights=S.weights.filter(x=>x.date!=today());S.weights.push({date:today(),kg});S.profile.weight=kg;save();closeSheet();render()}};
 if($('#redo'))$('#redo').onclick=()=>{S.draft={...S.profile};S.ob=0;S.profile=null;save();render()};
}
render();
