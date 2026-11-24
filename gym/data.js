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
