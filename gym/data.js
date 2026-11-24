// [id, naziv, mišić, oprema]
const EX = [
["bp","Bench press (šipka)","Grudi","Šipka"],["dbp","Potisak bučicama (ravna klupa)","Grudi","Bučice"],
["ibp","Potisak bučicama (kosa klupa)","Grudi","Bučice"],["fly","Razvođenje bučica","Grudi","Bučice"],
["pu","Sklekovi","Grudi","Telo"],["cable_fly","Razvođenje na sajli","Grudi","Sajla"],
["dl","Mrtvo dizanje","Leđa","Šipka"],["row","Veslanje šipkom","Leđa","Šipka"],
["dbrow","Veslanje bučicom (jedna ruka)","Leđa","Bučice"],["pull","Zgibovi","Leđa","Telo"],
["lat","Lat pulldown","Leđa","Sajla"],["srow","Veslanje na sajli (sedeći)","Leđa","Sajla"],
["sq","Čučanj (šipka)","Noge","Šipka"],["gsq","Goblet čučanj","Noge","Bučice"],
["lp","Leg press","Noge","Sprava"],["lunge","Iskoraci s bučicama","Noge","Bučice"],
["bss","Bugarski čučanj","Noge","Bučice"],["rdl","Rumunsko mrtvo dizanje","Noge","Bučice"],
["sldl","Stiff leg mrtvo dizanje (bučice)","Noge","Bučice"],["lcurl","Leg curl","Noge","Sprava"],
["lext","Leg extension","Noge","Sprava"],["hip","Hip thrust","Noge","Šipka"],
["calf","Listovi (stojeći)","Noge","Sprava"],
["ohp","Vojnički potisak (šipka)","Ramena","Šipka"],["dbohp","Potisak bučicama (sedeći)","Ramena","Bučice"],
["dbohp1","Potisak jednom bučicom","Ramena","Bučice"],["lat_r","Bočno podizanje","Ramena","Bučice"],
["fr","Prednje podizanje","Ramena","Bučice"],["fr1","Prednje podizanje (jedna ruka)","Ramena","Bučice"],
["rdelt","Zadnje rame (reverse fly)","Ramena","Bučice"],["shrug","Zleđa (shrugs)","Ramena","Bučice"],
["bc","Biceps curl bučicama","Biceps","Bučice"],["bbc","Biceps curl šipkom","Biceps","Šipka"],
["hc","Hammer curl","Biceps","Bučice"],["drag","Drag curl","Biceps","Bučice"],["ccurl","Concentration curl","Biceps","Bučice"],
["tex","Triceps ekstenzija (stojeći, bučica)","Triceps","Bučice"],["cg","Bench s uskim hvatom","Triceps","Šipka"],
["dip","Propadanja (dips)","Triceps","Telo"],["pd","Triceps pushdown","Triceps","Sajla"],["kick","Triceps kickback","Triceps","Bučice"],
["plank","Plank (sek)","Trbuh","Telo"],["crunch","Kruncevi","Trbuh","Telo"],["legr","Podizanje nogu","Trbuh","Telo"],
["rus","Ruski twist","Trbuh","Bučice"],["abw","Ab wheel","Trbuh","Sprava"]
];
const MUSCLES = ["Grudi","Leđa","Noge","Ramena","Biceps","Triceps","Trbuh"];
// [naziv, kcal, P, UH, M] na 100g, [porcija g]
const FOODS = [
["Pileće grudi (kuvane)",165,31,0,3.6,150],["Ćureće belo meso",135,30,0,1,150],["Junetina (posna)",180,26,0,8,150],
["Losos",208,20,0,13,150],["Tunjevina (konzerva, voda)",116,26,0,1,100],["Jaje (1 kom ≈ 55g)",143,13,1,10,55],
["Belance",52,11,0.7,0.2,100],["Grčki jogurt (0-2%)",59,10,3.6,0.4,200],["Posni sir/skyr",63,11,4,0.2,150],
["Kefir",52,3.4,4.5,2.5,250],["Mleko 2.8%",58,3.3,4.8,2.8,250],["Whey protein (1 mera 30g)",400,80,8,6,30],
["Pirinač (kuvan)",130,2.7,28,0.3,200],["Testenina (kuvana)",157,5.8,31,0.9,200],["Krompir (kuvan)",87,1.9,20,0.1,200],
["Ovsene pahuljice (suve)",370,13,60,7,60],["Hleb integralni",247,13,41,4,60],["Batat (pečen)",90,2,21,0.2,200],
["Pasulj/sočivo (kuvano)",116,9,20,0.4,200],["Kinoa (kuvana)",120,4.4,21,1.9,180],
["Banana",89,1.1,23,0.3,120],["Jabuka",52,0.3,14,0.2,180],["Borovnice",57,0.7,14,0.3,100],["Pomorandža",47,0.9,12,0.1,150],
["Brokoli",34,2.8,7,0.4,150],["Špinat",23,2.9,3.6,0.4,100],["Paradajz",18,0.9,3.9,0.2,150],["Krastavac",15,0.7,3.6,0.1,150],["Mešana salata",20,1.5,3.5,0.2,150],
["Maslinovo ulje",884,0,0,100,10],["Puter od kikirikija",588,25,20,50,30],["Badem",579,21,22,50,30],["Orasi",654,15,14,65,30],
["Avokado",160,2,9,15,100],["Čokolada (tamna 70%)",598,8,46,43,20],["Kačkavalj",350,25,1,28,30],["Pizza (parče)",266,11,33,10,120],["Hamburger",254,13,30,9,200]
];
const MEALS = ["Doručak","Ručak","Večera","Užina"];
const DAYS = ["Ponedeljak","Utorak","Sreda","Četvrtak","Petak","Subota","Nedelja"];
const DAYS_S = ["Pon","Uto","Sre","Čet","Pet","Sub","Ned"];
const DEFAULT_ROUTINES = [
{id:"r_push",name:"Push (grudi/ramena/triceps)",items:[["bp",4,8],["ibp",3,10],["dbohp",3,10],["lat_r",3,15],["tex",3,12],["pd",3,12]]},
{id:"r_pull",name:"Pull (leđa/biceps)",items:[["pull",4,8],["row",4,8],["lat",3,10],["srow",3,12],["bc",3,12],["hc",3,12]]},
{id:"r_legs",name:"Noge",items:[["sq",4,8],["rdl",3,10],["lp",3,12],["lunge",3,12],["lcurl",3,12],["calf",4,15]]},
{id:"r_db",name:"Bučice – cela telo (kućni)",items:[["gsq",4,12],["dbp",4,10],["dbrow",4,10],["dbohp",3,10],["sldl",3,12],["bc",3,12],["tex",3,12]]},
{id:"r_arms",name:"Ruke i ramena (bučice)",items:[["bc",3,12],["drag",3,12],["hc",3,12],["tex",3,12],["fr",3,12],["lat_r",3,15],["dbohp1",3,10]]}
].map(r=>({id:r.id,name:r.name,items:r.items.map(([ex,sets,reps])=>({ex,sets,reps}))}));

/* ===== Kardio / metabolički ===== */
EX.push(["walk","Brzo hodanje (min)","Kardio","Telo"],["hiitrun","Trčanje intervali 30s/30s (min)","Kardio","Telo"],
["bike","Bicikl (min)","Kardio","Sprava"],["rope","Vijača (min)","Kardio","Telo"],["burp","Burpees","Kardio","Telo"],
["mc","Mountain climbers","Kardio","Telo"],["jj","Jumping jacks","Kardio","Telo"],["swing","Swing bučicom","Kardio","Bučice"]);
MUSCLES.push("Kardio");
const VISC_ROUTINES=[
{id:"v_str",name:"🔥 Snaga – cela telo (def.)",items:[["gsq",4,12],["dbp",4,10],["dbrow",4,10],["rdl",3,12],["lunge",3,12],["dbohp",3,10],["plank",3,45]]},
{id:"v_walk",name:"🔥 Brzo hodanje 45 min (zona 2)",items:[["walk",1,45]]},
{id:"v_hiit",name:"🔥 HIIT 20 min",items:[["burp",4,12],["swing",4,15],["mc",4,30],["jj",4,40],["rope",1,5]]},
{id:"v_core",name:"🔥 Core + lagani kardio",items:[["plank",3,45],["legr",3,12],["crunch",3,20],["rus",3,20],["mc",3,30],["walk",1,20]]}
].map(r=>({id:r.id,name:r.name,items:r.items.map(([ex,sets,reps])=>({ex,sets,reps}))}));
const VISC_SCHEDULE={0:"v_str",1:"v_walk",2:"v_hiit",3:"v_walk",4:"v_str",5:"v_core",6:"v_walk"};
const VISC_WEEKS=[
["Nedelja 1 – temelj","Savladaj tehniku, 3 snage/HIIT + 3 hodanja. Cilj: 7.000–8.000 koraka dnevno, deficit ~300 kcal."],
["Nedelja 2 – ritam","Dodaj 1 seriju na snažne vežbe, hodanje 50 min. 8.000–9.000 koraka."],
["Nedelja 3 – pojačanje","HIIT 5 rundi, hodanje po blagom usponu. 9.000–10.000 koraka, deficit do ~500 kcal."],
["Nedelja 4 – vrhunac + provera","Najteža nedelja, zatim izmeri struk i težinu i uporedi sa početkom. Nova nedelja = ponovi sa većim opterećenjem."]];
const VISC_TIPS={
eat:["Proteini u svakom obroku (1,6–2 g/kg): jaja, piletina, riba, skyr, mahunarke","Vlakna 30g+ dnevno: povrće, ovas, mahunarke, bobičasto voće – rastvorljiva vlakna posebno smanjuju visceralnu mast","Masna riba (losos, sardina) 2×/ned. i maslinovo ulje, orašasti plodovi","Pola tanjira povrća uz ručak i večeru","Voda 2–3 l, nezaslađen čaj/kafa"],
avoid:["Zaslađena pića i sokovi (fruktoza ide pravo u jetru i trbušnu mast)","Alkohol – direktno podiže trbušnu mast","Industrijske grickalice, peciva, brza hrana, trans masti","Kasni noćni obroci i prejedanje večerom","Dijete sa ekstremno malo kalorija – dižu kortizol"],
habits:["Spavanje 7–9 h (manjak sna i stres podižu kortizol i visceralnu mast)","10 min šetnje posle većih obroka","Smanji stres: disanje, šetnja, ekran off 1 h pre sna","Meri struk jednom nedeljno, ujutru, na istom mestu (kod muškaraca cilj < 94 cm, kod žena < 80 cm)","Doslednost: 4 nedelje pa ponovi – rezultati dolaze sporo, a visceralna mast se gubi među prvima"]};
// jedan obrok = jedna porcija
const RECIPES=[
{id:"c1",name:"Ovsena kaša sa borovnicama i whey",meal:"Doručak",min:8,k:380,p:32,c:45,f:8,tags:["visc"],ing:["50g ovsenih pahuljica","250ml mleka/vode","1 mera whey (30g)","80g borovnica","cimet"],steps:["Kuvaj ovas u tečnosti 4–5 min.","Skloni sa vatre, umešaj whey i cimet.","Dodaj borovnice."]},
{id:"c2",name:"Omlet sa spanaćem i paradajzom",meal:"Doručak",min:10,k:330,p:24,c:6,f:23,tags:["visc"],ing:["3 jaja","handful spanaća","1 paradajz","1 kašičica maslinovog ulja","so, biber"],steps:["Zagrej ulje, dinstaj spanać i paradajz 2 min.","Ulij umućena jaja.","Peci na tihoj vatri 3–4 min, preklopi."]},
{id:"c3",name:"Grčki jogurt, bobice i orasi",meal:"Doručak",min:3,k:310,p:24,c:22,f:14,tags:["visc"],ing:["200g grčkog jogurta","100g bobičastog voća","20g oraha"],steps:["Sve sjedini u činiji."]},
{id:"c4",name:"Proteinske palačinke (ovas + banana)",meal:"Doručak",min:15,k:360,p:26,c:44,f:9,tags:[],ing:["40g ovsenih pahuljica","1 mala banana","2 jaja","prstohvat cimeta"],steps:["Izblendaj sve.","Peci male palačinke 2 min sa svake strane u tiganju bez masnoće."]},
{id:"c5",name:"Piletina sa kinoom i brokolijem",meal:"Ručak",min:25,k:480,p:48,c:42,f:10,tags:["visc"],ing:["150g pilećih grudi","60g kinoe (suva)","150g brokolija","1 kašičica maslinovog ulja","beli luk, začini"],steps:["Skuvaj kinou 12–15 min.","Isecite piletinu, začini i ispeci 6–7 min.","Brokoli kuvaj na pari 5 min, sve servirati."]},
{id:"c6",name:"Losos sa pečenim povrćem i batatom",meal:"Ručak",min:30,k:540,p:40,c:38,f:24,tags:["visc"],ing:["150g lososa","150g batata","tikvica, paprika","maslinovo ulje, limun"],steps:["Batat i povrće u rernu na 200°C 15 min.","Dodaj lososa, peci još 12 min.","Posluži sa limunom."]},
{id:"c7",name:"Salata sa tunjevinom i leblebijama",meal:"Ručak",min:10,k:420,p:38,c:32,f:16,tags:["visc"],ing:["1 konzerva tunjevine u vodi","100g leblebija (kuvane)","krastavac, paradajz, crni luk","1 kašika maslinovog ulja, limun"],steps:["Iseckaj povrće.","Dodaj tunjevinu i leblebije.","Začini uljem i limunom."]},
{id:"c8",name:"Čili od sočiva i povrća",meal:"Ručak",min:35,k:390,p:24,c:56,f:7,tags:["visc"],ing:["100g crvenog sočiva (suvo)","1 šargarepa, 1 paprika, luk","200g seckanog paradajza","ljuta paprika, kumin"],steps:["Prodinstaj luk i povrće.","Dodaj sočivo, paradajz, začine i 400ml vode.","Kuvaj 20 min."]},
{id:"c9",name:"Ćureće ćufte sa tikvicama i testeninom",meal:"Ručak",min:30,k:470,p:42,c:48,f:12,tags:[],ing:["150g mlevene ćuretine","1 jaje, začini","1 tikvica","60g integralne testenine (suva)","pasirani paradajz"],steps:["Oblikuj ćufte, ispeci u rerni 15 min na 200°C.","Skuvaj testeninu.","Dinstaj tikvicu sa paradajzom, sve sjedini."]},
{id:"c10",name:"Beli file ribe sa spanaćem i krompirom",meal:"Večera",min:25,k:430,p:40,c:38,f:12,tags:["visc"],ing:["180g belog filea (oslić)","150g krompira","100g spanaća","maslinovo ulje, limun, beli luk"],steps:["Skuvaj krompir.","Ribu peci u rerni 12–15 min sa limunom.","Spanać prodinstaj sa belim lukom."]},
{id:"c11",name:"Salata sa piletinom i avokadom",meal:"Večera",min:15,k:450,p:40,c:12,f:28,tags:["visc"],ing:["150g pilećih grudi","½ avokada","mešana salata, krastavac","limun, maslinovo ulje"],steps:["Ispeci piletinu i iseci.","Poređaj na salatu sa avokadom.","Začini."]},
{id:"c12",name:"Pileći gulaš sa povrćem",meal:"Večera",min:35,k:380,p:38,c:22,f:14,tags:[],ing:["170g pileće karabatak/grudi","luk, šargarepa, paprika","pasirani paradajz","začinska paprika"],steps:["Prodinstaj luk, dodaj meso i povrće.","Dodaj paradajz i vodu.","Krčkaj 25 min."]},
{id:"c13",name:"Skyr sa cimetom i bademima",meal:"Užina",min:2,k:220,p:24,c:12,f:8,tags:["visc"],ing:["150g skyra/posnog sira","15g badema","cimet"],steps:["Sjedini i posluži."]},
{id:"c14",name:"Humus sa štapićima povrća",meal:"Užina",min:5,k:200,p:8,c:22,f:9,tags:["visc"],ing:["50g humusa","šargarepa, krastavac, paprika"],steps:["Iseci povrće na štapiće i umakaj."]},
{id:"c15",name:"Kefir smoothie spanać-banana",meal:"Užina",min:3,k:230,p:14,c:32,f:5,tags:[],ing:["250ml kefira","1 mala banana","handful spanaća"],steps:["Izblendaj do glatkoće."]},
{id:"c16",name:"2 tvrdo kuvana jaja + krastavac",meal:"Užina",min:12,k:170,p:13,c:2,f:12,tags:["visc"],ing:["2 jaja","1 krastavac"],steps:["Kuvaj jaja 9–10 min, ohladi i oljušti."]}];
// [doručak, ručak, večera, užina] po danima
const VISC_MEALPLAN=[["c1","c5","c10","c13"],["c2","c8","c11","c14"],["c3","c6","c12","c16"],["c1","c7","c10","c13"],["c2","c5","c11","c15"],["c4","c9","c10","c14"],["c3","c6","c11","c16"]];
