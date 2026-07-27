"use strict";
/* ============================================================
   GESTOR AF BRAGA — engine.js  (modelo v2)
   Dados + motor de jogo. Sem DOM. Partilhado com ui.js.
   Atributos ao estilo CM (1-20), posições específicas.
   ============================================================ */

/* ---------- posições ---------- */
const POSITIONS=["GR","LD","DC","LE","MDC","MC","MD","ME","MO","ED","EE","PL"];
const POS_NAME={GR:"Guarda-redes",LD:"Lateral direito",DC:"Defesa central",LE:"Lateral esquerdo",
  MDC:"Médio defensivo",MC:"Médio centro",MD:"Médio direito",ME:"Médio esquerdo",
  MO:"Médio ofensivo",ED:"Extremo direito",EE:"Extremo esquerdo",PL:"Ponta de lança"};
const GROUP={GR:"GK",LD:"DEF",LE:"DEF",DC:"DEF",MDC:"MID",MC:"MID",MD:"MID",ME:"MID",MO:"ATT",ED:"ATT",EE:"ATT",PL:"ATT"};

/* ---------- atributos (1-20) ---------- */
const ATTRS=[["rem","Remate"],["cab","Cabeceamento"],["cru","Cruzamento"],["pas","Passe"],
  ["dri","Drible"],["des","Desarme"],["mar","Marcação"],["pos","Posicionamento"],
  ["vel","Velocidade"],["res","Resistência"],["for","Força"],["rea","Reação"],
  ["cri","Criatividade"],["agr","Agressividade"],["pen","Penáltis"],["liv","Livres"],["gr","Guarda-redes"]];
const ATTR_KEYS=ATTRS.map(a=>a[0]);

/* perfis por posição: atributos-chave e peso (para geração e para nota por função) */
const PROFILES={
  GR:{gr:7,pos:3,rea:2,for:1},
  DC:{des:4,mar:4,pos:3,for:2,cab:2,rea:1,vel:1},
  LD:{des:3,vel:3,cru:3,res:2,mar:2,pas:1,rea:1},
  LE:{des:3,vel:3,cru:3,res:2,mar:2,pas:1,rea:1},
  MDC:{des:3,pos:3,pas:2,mar:2,for:2,rea:1,cri:1},
  MC:{pas:3,cri:2,des:2,res:2,rea:2,dri:1,rem:1},
  MD:{cru:3,vel:3,pas:2,dri:2,res:2,cri:1},
  ME:{cru:3,vel:3,pas:2,dri:2,res:2,cri:1},
  MO:{cri:4,pas:3,dri:2,rem:2,rea:1,vel:1},
  ED:{vel:3,dri:3,cru:2,rem:2,cri:2,pas:1},
  EE:{vel:3,dri:3,cru:2,rem:2,cri:2,pas:1},
  PL:{rem:4,vel:2,cab:2,rea:2,for:1,dri:1,pos:1}
};

/* formações: cada slot tem posição e coordenadas (%) no campo (y: 90=própria baliza, 15=ataque) */
const FORMATIONS={
  "4-4-2":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:83,y:68},{pos:"DC",x:60,y:71},{pos:"DC",x:40,y:71},{pos:"LE",x:17,y:68},
    {pos:"MD",x:83,y:45},{pos:"MC",x:60,y:48},{pos:"MC",x:40,y:48},{pos:"ME",x:17,y:45},
    {pos:"PL",x:60,y:20},{pos:"PL",x:40,y:20}]},
  "4-3-3":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:83,y:68},{pos:"DC",x:62,y:71},{pos:"DC",x:38,y:71},{pos:"LE",x:17,y:68},
    {pos:"MDC",x:50,y:54},{pos:"MC",x:70,y:44},{pos:"MC",x:30,y:44},
    {pos:"ED",x:82,y:22},{pos:"PL",x:50,y:17},{pos:"EE",x:18,y:22}]},
  "3-5-2":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"DC",x:68,y:71},{pos:"DC",x:50,y:73},{pos:"DC",x:32,y:71},
    {pos:"MD",x:88,y:47},{pos:"MC",x:63,y:47},{pos:"MDC",x:50,y:57},{pos:"MC",x:37,y:47},{pos:"ME",x:12,y:47},
    {pos:"PL",x:60,y:20},{pos:"PL",x:40,y:20}]},
  "4-2-3-1":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:83,y:68},{pos:"DC",x:60,y:71},{pos:"DC",x:40,y:71},{pos:"LE",x:17,y:68},
    {pos:"MDC",x:60,y:56},{pos:"MDC",x:40,y:56},
    {pos:"ED",x:82,y:31},{pos:"MO",x:50,y:34},{pos:"EE",x:18,y:31},
    {pos:"PL",x:50,y:16}]},
  "5-3-2":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:88,y:64},{pos:"DC",x:66,y:72},{pos:"DC",x:50,y:74},{pos:"DC",x:34,y:72},{pos:"LE",x:12,y:64},
    {pos:"MC",x:66,y:46},{pos:"MDC",x:50,y:50},{pos:"MC",x:34,y:46},
    {pos:"PL",x:60,y:20},{pos:"PL",x:40,y:20}]},
  "4-1-4-1":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:83,y:68},{pos:"DC",x:60,y:71},{pos:"DC",x:40,y:71},{pos:"LE",x:17,y:68},
    {pos:"MDC",x:50,y:58},
    {pos:"MD",x:83,y:42},{pos:"MC",x:63,y:44},{pos:"MC",x:37,y:44},{pos:"ME",x:17,y:42},
    {pos:"PL",x:50,y:18}]},
  "4-5-1":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:83,y:68},{pos:"DC",x:60,y:71},{pos:"DC",x:40,y:71},{pos:"LE",x:17,y:68},
    {pos:"MD",x:85,y:45},{pos:"MC",x:63,y:47},{pos:"MDC",x:50,y:52},{pos:"MC",x:37,y:47},{pos:"ME",x:15,y:45},
    {pos:"PL",x:50,y:18}]},
  "4-4-1-1":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:83,y:68},{pos:"DC",x:60,y:71},{pos:"DC",x:40,y:71},{pos:"LE",x:17,y:68},
    {pos:"MD",x:83,y:46},{pos:"MC",x:60,y:48},{pos:"MC",x:40,y:48},{pos:"ME",x:17,y:46},
    {pos:"MO",x:50,y:30},
    {pos:"PL",x:50,y:16}]},
  "3-4-3":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"DC",x:68,y:71},{pos:"DC",x:50,y:73},{pos:"DC",x:32,y:71},
    {pos:"MD",x:83,y:48},{pos:"MC",x:60,y:50},{pos:"MC",x:40,y:50},{pos:"ME",x:17,y:48},
    {pos:"ED",x:80,y:22},{pos:"PL",x:50,y:18},{pos:"EE",x:20,y:22}]},
  "5-4-1":{slots:[
    {pos:"GR",x:50,y:90},
    {pos:"LD",x:88,y:64},{pos:"DC",x:66,y:72},{pos:"DC",x:50,y:74},{pos:"DC",x:34,y:72},{pos:"LE",x:12,y:64},
    {pos:"MD",x:83,y:46},{pos:"MC",x:60,y:48},{pos:"MC",x:40,y:48},{pos:"ME",x:17,y:46},
    {pos:"PL",x:50,y:18}]}
};
const MENTAL={"Defensivo":{atk:0.85,def:1.15},"Equilibrado":{atk:1.0,def:1.0},"Atacante":{atk:1.18,def:0.86}};

/* ---------- nomes fictícios (portugueses) ---------- */
const FIRST=["João","Rui","Nuno","Tomás","Diogo","Ivo","Marco","Rafael","Bruno","Hugo","Tiago","Miguel","André","Sérgio","Pedro","Luís","Vasco","Ricardo","Fábio","Dário","Gonçalo","Rúben","Gil","Duarte","José","Paulo","Hélder","Bernardo","Joel","Ivan","Artur","Cláudio","David","Filipe","Gustavo","Hélio","Jorge","Leandro","Márcio","Nélson","Válter"];
const LAST=["Silva","Moreira","Costa","Fernandes","Gonçalves","Oliveira","Rodrigues","Pereira","Machado","Carvalho","Sousa","Martins","Ferreira","Ribeiro","Barbosa","Pinto","Lopes","Cardoso","Antunes","Cunha","Marques","Vieira","Faria","Nogueira","Azevedo","Teixeira","Gomes","Correia","Alves","Matos","Torres","Braga","Peixoto","Sampaio","Rocha","Dias","Cruz","Freitas","Vilela","Amorim","Guimarães","Loureiro"];

/* ---------- clubes reais (cores provisórias) ---------- */
const CLUBS=[
  {n:"AD Ninense",s:"NIN",str:70,c1:"#1d4ed8",c2:"#ffffff"},
  {n:"Forjães SC",s:"FOR",str:69,c1:"#c1121f",c2:"#ffffff"},
  {n:"Este FC",s:"EST",str:66,c1:"#15803d",c2:"#111111"},
  {n:"GD Viatodos",s:"VIA",str:65,c1:"#c1121f",c2:"#1d4ed8"},
  {n:"FC Roriz",s:"ROR",str:64,c1:"#111111",c2:"#ffffff"},
  {n:"GDC Martim",s:"MAR",str:63,c1:"#15803d",c2:"#ffffff"},
  {n:"AD Pousa",s:"POU",str:63,c1:"#2f9be0",c2:"#ffffff"},
  {n:"SC Ucha",s:"UCH",str:62,c1:"#7b1e2b",c2:"#ffffff"},
  {n:"GD Alvelos",s:"ALV",str:61,c1:"#f2c200",c2:"#111111"},
  {n:"Cabreiros SC",s:"CAB",str:61,c1:"#c1121f",c2:"#111111"},
  {n:"AD Rendufe",s:"REN",str:60,c1:"#e07a1f",c2:"#ffffff"},
  {n:"S. Paio d'Arcos",s:"SPA",str:60,c1:"#1d4ed8",c2:"#f2c200"},
  {n:"GD Porto d'Ave",s:"PDA",str:59,c1:"#e8e8e8",c2:"#1d4ed8"},
  {n:"AD Guilhofrei",s:"GUI",str:58,c1:"#14274e",c2:"#ffffff"},
  {n:"CD Emilianos",s:"EMI",str:58,c1:"#6b21a8",c2:"#ffffff"},
  {n:"AC Terras de Bouro",s:"TBO",str:57,c1:"#15803d",c2:"#f2c200"}
];
const DIV1=[
  {n:"Desportivo de Ronfe",s:"RON",str:58,c1:"#c1121f",c2:"#ffffff"},
  {n:"AD Serzedelo",s:"SER",str:57,c1:"#1d4ed8",c2:"#ffffff"},
  {n:"GD Ribeirão",s:"RIB",str:56,c1:"#111111",c2:"#f2c200"},
  {n:"AD Lousado",s:"LOU",str:55,c1:"#15803d",c2:"#ffffff"},
  {n:"FC Delães",s:"DEL",str:54,c1:"#6b21a8",c2:"#ffffff"},
  {n:"GD Calendário",s:"CAL",str:54,c1:"#e07a1f",c2:"#111111"},
  {n:"CD Fradelos",s:"FRA",str:53,c1:"#1d4ed8",c2:"#c1121f"},
  {n:"GD São Cosme",s:"SCO",str:52,c1:"#7b1e2b",c2:"#ffffff"},
  {n:"GD Airão",s:"AIR",str:52,c1:"#14274e",c2:"#f2c200"},
  {n:"GD Gondifelos",s:"GON",str:51,c1:"#15803d",c2:"#111111"},
  {n:"Juv. de Mouquim",s:"MOU",str:50,c1:"#c1121f",c2:"#111111"},
  {n:"GD Louro",s:"LOR",str:49,c1:"#2f9be0",c2:"#ffffff"},
  {n:"Ruivanense FC",s:"RUI",str:48,c1:"#f2c200",c2:"#1d4ed8"},
  {n:"GD Carreira",s:"CAR",str:47,c1:"#111111",c2:"#ffffff"}
];
// ---- Pró-Nacional AF Braga (topo distrital) — reais + plausíveis. Cores provisórias ----
const PRONAC=[
  {n:"Merelinense FC",s:"MER",str:80,c1:"#1d4ed8",c2:"#ffffff"},
  {n:"Vieira SC",s:"VIE",str:79,c1:"#111111",c2:"#f2c200"},
  {n:"AD Esposende",s:"ESP",str:78,c1:"#c1121f",c2:"#ffffff"},
  {n:"Pevidém SC",s:"PEV",str:77,c1:"#1d4ed8",c2:"#c1121f"},
  {n:"Berço SC",s:"BER",str:76,c1:"#15803d",c2:"#ffffff"},
  {n:"Dumiense FC",s:"DUM",str:75,c1:"#c1121f",c2:"#111111"},
  {n:"FC Marinhas",s:"MRH",str:74,c1:"#1d4ed8",c2:"#ffffff"},
  {n:"AD Oliveirense",s:"OLI",str:74,c1:"#111111",c2:"#ffffff"},
  {n:"GD Maria da Fonte",s:"MDF",str:73,c1:"#15803d",c2:"#f2c200"},
  {n:"GD Prado",s:"PRD",str:73,c1:"#e07a1f",c2:"#111111"},
  {n:"SC Amares",s:"AMA",str:72,c1:"#6b21a8",c2:"#ffffff"},
  {n:"Palmeiras FC",s:"PAL",str:72,c1:"#15803d",c2:"#ffffff"},
  {n:"AD Fão",s:"FAO",str:72,c1:"#2f9be0",c2:"#ffffff"},
  {n:"GD Celoricense",s:"CEL",str:72,c1:"#c1121f",c2:"#1d4ed8"},
  {n:"GD Ruilhe",s:"RUL",str:71,c1:"#14274e",c2:"#f2c200"},
  {n:"AD Nogueiró",s:"NOG",str:71,c1:"#7b1e2b",c2:"#ffffff"}
];
// ---- 2ª Divisão AF Braga — inclui os clubes pedidos + plausíveis. Cores provisórias ----
const DIV2=[
  {n:"Cachapuz WLS",s:"CAC",str:48,c1:"#c1121f",c2:"#ffffff",roster:[
    {n:"Tiago Pinto",p:"GR"},{n:"Henrique Pizzarro",p:"GR"},{n:"Rui Xavier",p:"LD"},{n:"Luís Pereira",p:"LD"},
    {n:"Alvaro Araújo",p:"LE"},{n:"Vicente Pereira",p:"LE"},{n:"Gabriel Teixeira",p:"DC"},{n:"Gonçalo Martins",p:"DC"},
    {n:"Leonardo Vitoria",p:"DC"},{n:"Tiago Veiga",p:"MDC"},{n:"Rui Francisco",p:"MDC"},{n:"João Lopes",p:"MC"},
    {n:"Domingos Barroso",p:"MC"},{n:"Ana Lopes",p:"MC"},{n:"Susana Feio",p:"MC"},{n:"Pedro Carvalho",p:"MD"},
    {n:"Luís Ferreira",p:"ME"},{n:"Duarte Pinto",p:"ME"},{n:"Pedro Gonçalves",p:"MO"},{n:"André Calçada",p:"ED"},
    {n:"Agostinho Costa",p:"EE"},{n:"Narciso Batista",p:"PL"},{n:"José Pereira",p:"PL"},{n:"António Miranda",p:"PL"}]},
  {n:"GDR Trandeiras",s:"TRA",str:47,c1:"#c1121f",c2:"#ffffff"},
  {n:"GD Sete Fontes",s:"SFT",str:46,c1:"#15803d",c2:"#ffffff"},
  {n:"ACDR Tibães",s:"TIB",str:46,c1:"#111111",c2:"#ffffff"},
  {n:"GD Nogueira",s:"NGR",str:45,c1:"#1d4ed8",c2:"#ffffff"},
  {n:"AD Padim da Graça",s:"PAD",str:44,c1:"#6b21a8",c2:"#ffffff"},
  {n:"GDC Gualtar",s:"GUA",str:44,c1:"#e07a1f",c2:"#111111"},
  {n:"SC Adaúfe",s:"ADA",str:43,c1:"#c1121f",c2:"#111111"},
  {n:"GD Lamaçães",s:"LAM",str:42,c1:"#15803d",c2:"#111111"},
  {n:"ARC Panóias",s:"PAN",str:42,c1:"#2f9be0",c2:"#ffffff"},
  {n:"GD Ferreiros",s:"FER",str:41,c1:"#c1121f",c2:"#111111"},
  {n:"AD Palmeira",s:"PLM",str:40,c1:"#7b1e2b",c2:"#f2c200"},
  {n:"GDR Semelhe",s:"SEM",str:39,c1:"#111111",c2:"#c1121f"},
  {n:"GD Pousada",s:"POS",str:38,c1:"#f2c200",c2:"#1d4ed8"}
];

/* modelo do plantel: posições cobertas (27 jogadores, 3 GR) */
const SQUAD_TEMPLATE=["GR","GR","GR",
  "LD","LD","LE","LE","DC","DC","DC","DC","DC",
  "MDC","MDC","MC","MC","MC","MD","MD","ME","ME","MO",
  "ED","EE","PL","PL","PL"];

let G=null, PID=1;
const CFG = (typeof GAME_DATA!=="undefined" && GAME_DATA) ? GAME_DATA : {};
function divDefs(builtIn, idx){
  let list = (CFG.divisions && CFG.divisions[idx]) ? CFG.divisions[idx].slice() : builtIn.slice();
  if(CFG.addClubs && CFG.addClubs[idx]) list = list.concat(CFG.addClubs[idx]);
  return list.map(d=>{ const x=Object.assign({},d);
    if(CFG.clubs && CFG.clubs[x.s]) Object.assign(x, CFG.clubs[x.s]);
    if(CFG.rosters && CFG.rosters[x.s]) x.roster = CFG.rosters[x.s];
    return x; });
}
const FUNNY_FIRINGS=["O presidente sonhou que perdias a final e entrou em pânico.","Foste visto a torcer pelo rival num café.","A direção não gostou da tua escolha de fato-de-treino.","Divergências sobre a ementa do balneário.","O filho do presidente também quer ser treinador.","Discutiste com o roupeiro sobre a cor das meias.","O patrocinador exigiu um treinador 'com mais seguidores'.","Recusaste-te a fazer a dança da vitória com os adeptos.","Chegaste atrasado ao jantar de Natal do clube.","O presidente leu a tua sina e não gostou."];
function firingReasons(){ return (CFG.firingReasons||[]).concat(FUNNY_FIRINGS); }

/* ---------- utilidades ---------- */
function rnd(a,b){return a+Math.random()*(b-a)}
function ri(a,b){return Math.floor(rnd(a,b+1))}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function money(m){ if(m>=1)return "€"+(Math.round(m*10)/10)+"M"; return "€"+Math.round(m*1000)+"K"; }
function randName(){return pick(FIRST)+" "+pick(LAST);}

/* ---------- ratings a partir de atributos ---------- */
function roleRatingAttrs(a,pos){
  const prof=PROFILES[pos]; let acc=0,sw=0;
  for(const k in prof){ acc+=prof[k]*(a[k]||1); sw+=prof[k]; }
  const r=sw?acc/sw:8;                      // ~1-20
  return clamp(Math.round(r*4.6+4),30,99);
}
function roleRating(p,pos){return roleRatingAttrs(p.attrs,pos);}
function ability(p){return roleRating(p,p.pos);}          // nota na posição natural
function fam(a,b){ if(a===b)return 1; return GROUP[a]===GROUP[b]?0.9:0.75; }
function formMult(p){ return 1+clamp((p&&p.form)||0,-6,6)*0.011; }               // forma individual: ±~6.6%
function chemFactor(){ const c=(typeof G!=="undefined"&&G&&G.chem!=null)?G.chem:65; return 1+clamp(c-65,-35,35)/500; } // química da tua equipa: ±7%
function effAt(p,pos){return Math.round(roleRating(p,pos)*fam(p.pos,pos)*formMult(p));}  // nota efetiva num slot (com forma)

/* ---------- geração de jogadores ---------- */
function makePlayer(pos,level){
  const prof=PROFILES[pos]||{};
  const a={};
  ATTR_KEYS.forEach(k=>{
    const emph=prof[k]?prof[k]*0.9:-1.5;
    a[k]=clamp(Math.round(level+emph+rnd(-2.2,2.2)),1,20);
  });
  if(pos!=="GR")a.gr=clamp(Math.round(rnd(1,6)),1,20);   // só GR guarda bem
  const tall=["GR","DC","PL"].includes(pos)?184:176;
  const altura=clamp(Math.round(tall+rnd(-6,8)),162,201);
  const age=ri(16,36);
  const abil=roleRatingAttrs(a,pos);
  const potential=clamp(abil+(age<23?ri(3,14):ri(-2,4)),abil,99);
  const value=Math.max(0.03,Math.round(Math.pow(abil/60,3.4)*0.16*(age<30?1:0.6)*100)/100);
  return {id:PID++, name:randName(), pos, attrs:a, altura, age, potential,
    value, contractYears:ri(1,4), energy:100, injuredWeeks:0, transferListed:false, form:0, morale:clamp(65+ri(-5,10),0,100), trainFocus:"Equilibrado", goals:0, apps:0, yc:0, rc:0, wage:Math.round(value*0.12*100)/100+0.01};
}
function makeSquad(level){ return SQUAD_TEMPLATE.map(pos=>makePlayer(pos, level+rnd(-1.5,2))); }
function makeSquadFromRoster(roster,level){
  const squad=roster.map(r=>{const p=makePlayer(r.p,level); p.name=r.n; return p;});
  let gk=squad.filter(p=>p.pos==="GR").length; while(gk<3){ squad.push(makePlayer("GR",level)); gk++; }
  const fillPos=["DC","LD","LE","DC","MC","MDC","MC","ME","MD","MO","PL","ED","EE","PL","DC","MC","PL","LE","LD","DC","MC","MO"];
  let fi=0; while(squad.length<27){ squad.push(makePlayer(fillPos[fi%fillPos.length],level)); fi++; }
  return squad;
}
function clubFromDef(d,id){
  const level=clamp(Math.round(d.str/5),4,16);
  return {id, name:d.n, short:d.s, c1:d.c1, c2:d.c2, strength:d.str,
    budget:Math.round(rnd(0.06,0.28)*100)/100, squad:(d.roster?makeSquadFromRoster(d.roster,level):makeSquad(level)),
    susp:[], P:0,W:0,D:0,L:0,GF:0,GA:0,Pts:0};
}

/* ---------- divisões / novo jogo ---------- */
function myDivObj(){return G.divisions[G.myDiv];}
function myClubs(){return myDivObj().clubs;}
function me(){return myClubs()[G.myId];}
function makeDivision(name,defs,upSlots,downSlots){
  const clubs=defs.map((d,i)=>clubFromDef(d,i));
  return {name, clubs, fixtures:buildFixtures(clubs.length), results:[], week:0, upSlots, downSlots};
}
function newGame(divIdx,clubIdx,managerName){
  PID=1;
  const dPN=makeDivision("Pró-Nacional",divDefs(PRONAC,0),0,3);
  const dH =makeDivision("Divisão de Honra",divDefs(CLUBS,1),3,3);
  const dU =makeDivision("1ª Divisão",divDefs(DIV1,2),3,3);
  const dD =makeDivision("2ª Divisão",divDefs(DIV2,3),3,0);
  G={version:6, divisions:[dPN,dH,dU,dD], myDiv:divIdx, myId:clubIdx,
     week:0, season:1, date:"Set", formation:"4-4-2", mentality:"Equilibrado",
     lineup:[], news:[], seasonDone:false, midWindowDone:false, budgetAsked:false,
     chem:65, lastXI:[], trainFocus:"Equilibrado", meeting:null, shortObjective:null,
     manager:{name:(managerName||"Treinador").slice(0,28), reputation:40, seasons:0, trophies:[], stats:{P:0,W:0,D:0,L:0,GF:0,GA:0}},
     contract:{seasonsLeft:2}, board:{confidence:60}, fired:false, offers:null, transferOffers:[]};
  G.lineup=autoPickLineup(me(),G.formation);
  setObjectives();
  me().budget=budgetForObjective(G.myDiv,me().objective); G.seasonStartBudget=me().budget; G.budgetGranted=0; G.pendingPrize=0;
  cupCreate();
  addNews(G.manager.name+" assume o comando do "+me().name+" ("+myDivObj().name+").");
  addNews("Objetivo da direção: "+me().objective.label+".");
  addNews("Verba de transferências: "+money(me().budget)+".");
  save();
}
function buildFixtures(n){
  const ids=[...Array(n).keys()]; if(n%2)ids.push(-1);
  const m=ids.length, rounds=[]; let arr=ids.slice();
  for(let r=0;r<m-1;r++){
    const pairs=[];
    for(let i=0;i<m/2;i++){const a=arr[i],b=arr[m-1-i]; if(a!==-1&&b!==-1)pairs.push(r%2?[b,a]:[a,b]);}
    rounds.push(pairs); arr.splice(1,0,arr.pop());
  }
  return rounds.concat(rounds.map(rd=>rd.map(p=>[p[1],p[0]])));
}

/* ---------- onze (slots com posição específica) ---------- */
function bestForSlot(club,pos,used,banned){
  let best=null,bv=-1;
  for(const p of club.squad){ if(used.has(p.id)||(banned&&banned.has(p.id)))continue;
    const v=effAt(p,pos); if(v>bv){bv=v;best=p;} }
  return best;
}
function autoPickLineup(club,formation,banned){
  const slots=FORMATIONS[formation].slots, used=new Set(), ban=new Set(banned||[]), line=[];
  for(const slot of slots){ const p=bestForSlot(club,slot.pos,used,ban); if(p){used.add(p.id);line.push(p.id);} else line.push(null); }
  return line;
}
function availableLineup(club,baseLineup,formation){
  const slots=FORMATIONS[formation].slots, susp=unavailable(club), used=new Set();
  const line=baseLineup.map(id=>(id!=null&&!susp.has(id))?id:null);
  line.forEach(id=>{if(id!=null)used.add(id);});
  for(let i=0;i<slots.length;i++){ if(line[i]==null){ const p=bestForSlot(club,slots[i].pos,used,susp); if(p){line[i]=p.id;used.add(p.id);} } }
  return line.filter(x=>x!=null);
}

/* ---------- força da equipa (a partir de atributos/posições) ---------- */
function teamStrength(club,lineup,formation,mentality){
  const slots=FORMATIONS[formation].slots;
  let gk=0, defs=[], mids=[], atts=[];
  for(let i=0;i<slots.length;i++){
    const p=club.squad.find(x=>x.id===lineup[i]); if(!p)continue;
    const v=effAt(p,slots[i].pos), grp=GROUP[slots[i].pos];
    if(grp==="GK")gk=v; else if(grp==="DEF")defs.push(v); else if(grp==="MID")mids.push(v); else atts.push(v);
  }
  const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:55;
  const def=defs.length?(avg(defs)*defs.length+gk*1.4)/(defs.length+1.4):(gk||55);
  const mid=avg(mids), atk=avg(atts);
  const men=MENTAL[mentality];
  const cm=(typeof G!=="undefined"&&G&&G.myId!=null&&club===me())?chemFactor():1;  // química só afeta a tua equipa
  return {def:def*men.def*cm, mid:mid*cm, atk:atk*men.atk*cm, overall:(def+mid+atk)/3*cm};
}

/* ---------- escolha de marcador / infrator ---------- */
function weightedObj(items,w){
  if(!items.length)return null; const tot=w.reduce((a,b)=>a+b,0); let r=Math.random()*tot;
  for(let i=0;i<items.length;i++){r-=w[i]; if(r<=0)return items[i];} return items[items.length-1];
}
function bestFieldByAttr(club,lineup,attr,gone){
  let best=null,bv=-1;
  lineup.forEach(id=>{const p=club.squad.find(x=>x.id===id); if(p&&!(gone&&gone.has(p.id))&&p.attrs[attr]>bv){bv=p.attrs[attr];best=p;}});
  return best;
}
function pickGoal(club,lineup,formation,gone){
  const slots=FORMATIONS[formation].slots;
  const cands=lineup.map((id,i)=>({p:club.squad.find(x=>x.id===id),pos:slots[i]?slots[i].pos:"MC"}))
    .filter(o=>o.p&&GROUP[o.pos]!=="GK"&&!(gone&&gone.has(o.p.id)));
  if(!cands.length)return null;
  const w=cands.map(o=>{const g=GROUP[o.pos]; const base=(g==="ATT"?3:g==="MID"?1.4:0.4); return base*(o.p.attrs.rem+o.p.attrs.rea+8);});
  const sel=weightedObj(cands,w); if(!sel)return null;
  let gtype="open"; const r=Math.random();
  if(r<0.07)gtype="penalty"; else if(r<0.12)gtype="freekick";
  else if(Math.random()<0.12+sel.p.attrs.cab/70)gtype="header";
  let pid=sel.p.id;
  if(gtype==="penalty"){const b=bestFieldByAttr(club,lineup,"pen",gone); if(b)pid=b.id;}
  else if(gtype==="freekick"){const b=bestFieldByAttr(club,lineup,"liv",gone); if(b)pid=b.id;}
  return {pid,gtype};
}
function pickFoul(club,lineup,gone){
  const cands=lineup.map(id=>club.squad.find(x=>x.id===id)).filter(p=>p&&!gone.has(p.id));
  if(!cands.length)return null;
  const w=cands.map(p=>{const g=GROUP[p.pos]; const base=(g==="DEF"?3:g==="MID"?2:g==="GK"?0.4:1); return base*(p.attrs.agr+p.attrs.for*0.4+3);});
  return weightedObj(cands,w);
}

/* ---------- prolongamento (30 min) ---------- */
function simulateET(home,away,hLine,aLine,eHome,eAway,goneH,goneA){
  eHome=eHome||1;eAway=eAway||1;
  const hS=teamStrength(home,hLine,G.formation,G.mentality), aS=teamStrength(away,aLine,"4-4-2","Equilibrado");
  hS.atk*=eHome;hS.mid*=eHome;hS.def*=eHome;aS.atk*=eAway;aS.mid*=eAway;aS.def*=eAway;
  const hAtt=(hS.atk*0.6+hS.mid*0.4)+3-aS.def*0.48, aAtt=(aS.atk*0.6+aS.mid*0.4)-hS.def*0.48;
  const hx=clamp((hAtt-24)/9.5,0.12,4.2), ax=clamp((aAtt-26)/9.5,0.1,3.9);
  const events=[]; let hg=0,ag=0; const gH=new Set(goneH||[]), gA=new Set(goneA||[]);
  for(let m=91;m<=120;m++){
    if(Math.random()<hx/90){ const g=pickGoal(home,hLine,G.formation,gH); events.push({m,side:"H",type:"goal",club:home,line:hLine,scorer:g?g.pid:null,gtype:g?g.gtype:"open"}); hg++; }
    if(Math.random()<ax/90){ const g=pickGoal(away,aLine,"4-4-2",gA); events.push({m,side:"A",type:"goal",club:away,line:aLine,scorer:g?g.pid:null,gtype:g?g.gtype:"open"}); ag++; }
  }
  return {events,hg,ag};
}
/* ---------- motor de jogo ---------- */
function simulate(home,away,hLine,aLine,eHome,eAway){
  eHome=eHome||1; eAway=eAway||1;
  const hS=teamStrength(home,hLine,G.formation,G.mentality);
  const aS=teamStrength(away,aLine,"4-4-2",pick(["Defensivo","Equilibrado","Equilibrado","Atacante"]));
  hS.atk*=eHome;hS.mid*=eHome;hS.def*=eHome; aS.atk*=eAway;aS.mid*=eAway;aS.def*=eAway;
  const events=[]; let hg=0,ag=0,hRed=0,aRed=0;
  const yc={}, expelledH=[], expelledA=[];
  function offRate(){
    const hPen=1-hRed*0.18, aPen=1-aRed*0.18;
    const hAtt=((hS.atk*0.6+hS.mid*0.4)*hPen)+3-(aS.def*aPen)*0.48;
    const aAtt=((aS.atk*0.6+aS.mid*0.4)*aPen)-(hS.def*hPen)*0.48;
    return {hx:clamp((hAtt-24)/9.5,0.12,4.2), ax:clamp((aAtt-26)/9.5,0.1,3.9)};
  }
  function scoreFor(side,m){
    const club=side==="H"?home:away, line=side==="H"?hLine:aLine;
    const oppSide=side==="H"?"A":"H", oppClub=side==="H"?away:home, oppLine=side==="H"?aLine:hLine;
    const gone=new Set(side==="H"?expelledH:expelledA);
    const roll=Math.random();
    if(roll<0.02){ events.push({m,side,type:"disallowed"}); return false; }
    if(roll<0.04){ const oppGone=new Set(side==="H"?expelledA:expelledH);
      const defs=oppLine.map(id=>oppClub.squad.find(x=>x.id===id)).filter(p=>p&&!oppGone.has(p.id)&&GROUP[p.pos]!=="GK");
      const og=defs.length?pick(defs):null;
      events.push({m,side,type:"goal",club,line,scorer:null,gtype:"own",ogPid:og?og.id:null,ogSide:oppSide}); return true; }
    const g=pickGoal(club,line,side==="H"?G.formation:"4-4-2",gone);
    if(g&&g.gtype==="penalty"&&Math.random()<0.22){ events.push({m,side,type:"penmiss",pid:g.pid}); return false; }
    events.push({m,side,type:"goal",club,line,scorer:g?g.pid:null,gtype:g?g.gtype:"open"}); return true;
  }
  function sendOff(side,p,m,second){ events.push({m,side,type:"red",pid:p.id,second});
    if(side==="H"){hRed++;expelledH.push(p.id);}else{aRed++;expelledA.push(p.id);} }
  function disciplinary(side,club,line,m){
    const gone=new Set(side==="H"?expelledH:expelledA);
    const p=pickFoul(club,line,gone); if(!p)return;
    // agressividade aumenta a probabilidade de cartão vermelho direto
    if(Math.random()<0.03+p.attrs.agr/900){ sendOff(side,p,m,false); }
    else { yc[p.id]=(yc[p.id]||0)+1; events.push({m,side,type:"yellow",pid:p.id}); if(yc[p.id]>=2)sendOff(side,p,m,true); }
  }
  for(let m=1;m<=90;m++){
    const rt=offRate();
    if(Math.random()<rt.hx/90){ if(scoreFor("H",m))hg++; }
    if(Math.random()<rt.ax/90){ if(scoreFor("A",m))ag++; }
    if(Math.random()<0.0125)disciplinary("H",home,hLine,m);
    if(Math.random()<0.0125)disciplinary("A",away,aLine,m);
  }
  return {hg,ag,events,expelledH,expelledA};
}
function applyResult(home,away,hg,ag,events){
  home.P++;away.P++;home.GF+=hg;home.GA+=ag;away.GF+=ag;away.GA+=hg;
  if(hg>ag){home.W++;away.L++;home.Pts+=3;} else if(hg<ag){away.W++;home.L++;away.Pts+=3;} else {home.D++;away.D++;home.Pts++;away.Pts++;}
  events.forEach(e=>{
    if(e.type==="goal"){ const club=e.side==="H"?home:away; const s=club.squad.find(x=>x.id===e.scorer); if(s)s.goals++; }
    else { const club=e.side==="H"?home:away; const p=club.squad.find(x=>x.id===e.pid);
      if(p){ if(e.type==="yellow")p.yc=(p.yc||0)+1; else if(e.type==="red")p.rc=(p.rc||0)+1; } }
  });
}

/* ---------- época ---------- */
const MONTHS=["Set","Out","Nov","Dez","Jan","Fev","Mar","Abr","Mai"];
function advanceMonth(){ const d=myDivObj(); G.date=MONTHS[Math.min(MONTHS.length-1,Math.floor(d.week/(d.fixtures.length/MONTHS.length)))]; }
function simRound(d,preMy,hasUser){
  if(d.week>=d.fixtures.length)return;
  const round=d.fixtures[d.week], weekRes=[];
  round.forEach(([h,a])=>{
    const home=d.clubs[h], away=d.clubs[a]; let r, userLine=null;
    const userMatch=hasUser&&(h===G.myId||a===G.myId);
    if(preMy&&userMatch){ r=preMy; userLine=preMy.userLine; }
    else {
      const hLine=(hasUser&&h===G.myId)?availableLineup(home,G.lineup,G.formation):autoPickLineup(home,"4-4-2",home.susp);
      const aLine=(hasUser&&a===G.myId)?availableLineup(away,G.lineup,G.formation):autoPickLineup(away,"4-4-2",away.susp);
      let eH=1,eA=1;
      if(hasUser&&h===G.myId){eH=energyFactor(home,hLine);userLine=hLine;}
      if(hasUser&&a===G.myId){eA=energyFactor(away,aLine);userLine=aLine;}
      r=simulate(home,away,hLine,aLine,eH,eA);
    }
    applyResult(home,away,r.hg,r.ag,r.events);
    home.susp=r.expelledH||[]; away.susp=r.expelledA||[];
    if(userMatch){ const uc=(h===G.myId)?home:away, isH=(h===G.myId); recordManagerMatch(isH?r.hg:r.ag, isH?r.ag:r.hg); processEnergyInjuries(uc,userLine); rateUserMatch(uc,userLine,r,isH); updateForm(uc,userLine); updateChem(userLine); trainTick(uc,userLine); updateMorale(uc,userLine,isH?r.hg:r.ag,isH?r.ag:r.hg); }
    weekRes.push({h,a,hg:r.hg,ag:r.ag});
  });
  d.results.push(weekRes); d.week++;
}
function playWeek(preMy){
  const myD=myDivObj(); if(myD.week>=myD.fixtures.length)return;
  simRound(myD,preMy,true);
  boardAfterUserMatch();
  checkShortObjective();                    // período de prova acordado numa reunião
  if(!G.fired)maybeBoardMeeting();           // maus resultados podem gerar nova reunião
  if(!G.midWindowDone && myD.week===Math.floor(myD.fixtures.length/2)){ transferWindow(); G.midWindowDone=true; }
  G.divisions.forEach((d,di)=>{ if(di!==G.myDiv&&d.week<d.fixtures.length)simRound(d,null,false); });
  G.week=myD.week; advanceMonth();
  if(myD.week>=myD.fixtures.length){
    G.divisions.forEach((d,di)=>{ if(di!==G.myDiv){ while(d.week<d.fixtures.length)simRound(d,null,false); } });
    endSeason();
  }
  save();
}
function endSeason(){
  G.seasonDone=true;
  const d=myDivObj(), table=sortedTable(d);
  const champ=table[0], meRank=table.findIndex(c=>c.id===G.myId)+1;
  addNews("Fim da época "+G.season+" ("+d.name+"). Campeão: "+champ.name+". Ficaste em "+meRank+"º.");
  let prize=Math.max(0.03,(d.clubs.length-meRank+1)*0.02);
  if(meRank===1){ prize+=0.25; G.manager.trophies.push({type:"league",name:"Campeão · "+d.name,season:G.season}); addNews("🏆 Campeão da "+d.name+"! Prémio: +€250K."); }
  else if(d.upSlots>0 && meRank<=d.upSlots){ prize+=0.15; G.manager.trophies.push({type:"promo",name:"Subida · "+d.name,season:G.season}); addNews("⬆️ Subida garantida! Prémio: +€150K."); }
  me().budget=Math.round((me().budget+prize)*100)/100;
  addNews("Prémio de classificação: +"+money(prize)+".");
  evaluateBoard(meRank);
  while(G.cup&&G.cup.active)cupAdvanceRound();
}
function newSeason(){
  const mineShort=me().short;
  const tables=G.divisions.map(d=>sortedTable(d));
  const leaving=G.divisions.map(()=>new Set()), incoming=G.divisions.map(()=>[]);
  let myMove=null;
  for(let i=0;i<G.divisions.length-1;i++){
    const up=G.divisions[i], down=G.divisions[i+1];
    const releg=tables[i].slice(tables[i].length-up.downSlots);
    const promo=tables[i+1].slice(0,down.upSlots);
    releg.forEach(c=>{leaving[i].add(c); incoming[i+1].push(c); if(c.short===mineShort)myMove="down";});
    promo.forEach(c=>{leaving[i+1].add(c); incoming[i].push(c); if(c.short===mineShort)myMove="up";});
  }
  G.divisions.forEach((d,i)=>{ d.clubs=d.clubs.filter(c=>!leaving[i].has(c)).concat(incoming[i]); });
  G.divisions.forEach(d=>{
    d.clubs.forEach((c,i)=>c.id=i);
    const isMineClub=c=>c.short===mineShort;
    d.clubs.forEach(c=>{c.P=c.W=c.D=c.L=c.GF=c.GA=c.Pts=0; c.susp=[]; const mine=isMineClub(c);
      c.squad.forEach(p=>{
        const played=p.apps||0;                                    // jogos desta época (antes de zerar)
        p.goals=0;p.apps=0;p.yc=0;p.rc=0;p.energy=100;p.injuredWeeks=0;p.ratings=[];p.lastRating=null;p.form=0;
        p.contractYears=(p.contractYears||2)-1;if(p.contractYears<=0)p.contractYears=ri(2,4);
        if(mine){ if(p.age>32) ATTR_KEYS.forEach(k=>{ if(["vel","res","for","rea"].includes(k)&&Math.random()<0.4)p.attrs[k]=clamp(p.attrs[k]-1,1,20); }); } // tua equipa evolui por jornada; aqui só declínio
        else developPlayer(p,played,false);                        // IA: desenvolvimento no fim da época
        p.age++;
      });
    });
    d.fixtures=buildFixtures(d.clubs.length); d.results=[]; d.week=0;
  });
  for(let di=0;di<G.divisions.length;di++){ const idx=G.divisions[di].clubs.findIndex(c=>c.short===mineShort); if(idx>=0){G.myDiv=di;G.myId=idx;break;} }
  G.season++; G.week=0; G.seasonDone=false; G.date="Set"; G.midWindowDone=false; G.budgetAsked=false;
  G.lineup=autoPickLineup(me(),G.formation);
  G.manager.seasons=(G.manager.seasons||0)+1; setObjectives();
  const kitty=budgetForObjective(G.myDiv,me().objective);            // verba nova conforme aspiração desta época
  me().budget=Math.round((me().budget+kitty)*100)/100;              // soma à que transitou (incl. prémios)
  G.seasonStartBudget=me().budget; G.budgetGranted=0;
  addNews("Verba de transferências para a época: "+money(me().budget)+" (aspiração: "+me().objective.label+").");
  if(myMove==="up")addNews("Subiste de divisão!");
  else if(myMove==="down")addNews("Desceste de divisão.");
  addNews("Nova época "+G.season+" ("+myDivObj().name+").");
  transferWindow();
  cupCreate();
  save();
}
function sortedTable(d){
  return d.clubs.slice().sort((a,b)=>b.Pts-a.Pts||(b.GF-b.GA)-(a.GF-a.GA)||b.GF-a.GF||a.name.localeCompare(b.name));
}

/* ---------- mercado (básico; será enriquecido na Fase 3) ---------- */
function buyPlayer(fromClubId,playerId){
  const meC=me(), from=myClubs()[fromClubId];
  const p=from.squad.find(x=>x.id===playerId); if(!p)return {ok:false,msg:""};
  const price=Math.round(p.value*rnd(1.05,1.35)*100)/100;
  if(meC.budget<price)return {ok:false,msg:"Verba insuficiente ("+money(price)+")"};
  meC.budget=Math.round((meC.budget-price)*100)/100;
  from.squad=from.squad.filter(x=>x.id!==playerId); meC.squad.push(p);
  addNews("Contrataste "+p.name+" ("+ability(p)+") por "+money(price)+".");
  G.lineup=autoPickLineup(meC,G.formation); save();
  return {ok:true,msg:"Contratado: "+p.name};
}
/* ---- negociação de compra: o clube decide vender / recusar / contrapropor ---- */
function playerKeyRank(p,club){ return club.squad.filter(x=>ability(x)>ability(p)).length; } // 0 = melhor do plantel
function buyAsk(p,club){
  let ask=p.value*1.25;
  const better=playerKeyRank(p,club);
  ask*= better<3?1.35 : better<6?1.15 : 1.0;                 // peças importantes custam mais
  if(p.transferListed)ask*=0.8;                              // listado: mais fácil/barato
  ask*=(0.9+clamp(p.contractYears||1,0,5)*0.05);            // contrato longo => mais caro
  return Math.max(0.02,Math.round(ask*100)/100);
}
function completeBuy(fromClubId,playerId,fee){
  const meC=me(), from=myClubs()[fromClubId]; if(!from)return {ok:false,msg:""};
  const p=from.squad.find(x=>x.id===playerId); if(!p)return {ok:false,msg:""};
  fee=Math.round(fee*100)/100;
  if(meC.budget<fee)return {ok:false,msg:"Verba insuficiente ("+money(fee)+")"};
  meC.budget=Math.round((meC.budget-fee)*100)/100;
  from.squad=from.squad.filter(x=>x.id!==playerId); from.budget=Math.round(((from.budget||0)+fee)*100)/100; meC.squad.push(p);
  addNews("Contrataste "+p.name+" ("+ability(p)+") por "+money(fee)+".");
  G.lineup=autoPickLineup(meC,G.formation); save();
  return {ok:true,msg:"Contratado: "+p.name};
}
function makeBid(fromClubId,playerId,offerFee){
  const meC=me(), from=myClubs()[fromClubId]; if(!from)return {status:"gone"};
  const p=from.squad.find(x=>x.id===playerId); if(!p)return {status:"gone"};
  offerFee=Math.round(offerFee*100)/100;
  if(meC.budget<offerFee)return {status:"nofunds", msg:"Verba insuficiente ("+money(offerFee)+")."};
  if(from.squad.length<=15 && !p.transferListed)return {status:"rejected", msg:from.short+" não quer enfraquecer o plantel."};
  const ask=buyAsk(p,from), key=playerKeyRank(p,from)<3 && !p.transferListed;
  if(offerFee>=ask){
    if(key && Math.random()<0.5)return {status:"rejected", msg:from.short+" recusou: "+p.name+" não está à venda."};
    return {status:"accepted", res:completeBuy(fromClubId,playerId,offerFee)};
  }
  if(offerFee>=ask*0.8 && !key)return {status:"counter", fee:ask, msg:from.short+" pede "+money(ask)+" por "+p.name+"."};
  return {status:"rejected", msg:from.short+" recusou a proposta por "+p.name+"."};
}
function sellPlayer(playerId){
  const meC=me();
  if(meC.squad.length<=14)return {ok:false,msg:"Plantel demasiado pequeno"};
  const p=meC.squad.find(x=>x.id===playerId); if(!p)return {ok:false,msg:""};
  const price=Math.round(p.value*rnd(0.75,1.05)*100)/100;
  meC.budget=Math.round((meC.budget+price)*100)/100;
  meC.squad=meC.squad.filter(x=>x.id!==playerId);
  pick(myClubs().filter(c=>c.id!==G.myId)).squad.push(p);
  addNews("Vendeste "+p.name+" por "+money(price)+".");
  G.lineup=autoPickLineup(meC,G.formation); save();
  return {ok:true,msg:"Vendido: "+p.name+" ("+money(price)+")"};
}
function addNews(t){ if(!G.news)G.news=[]; G.news.unshift({t}); if(G.news.length>40)G.news.pop(); }

/* ---------- persistência + migração ---------- */
function save(){ if(typeof localStorage==="undefined")return; try{localStorage.setItem("gestorafb",JSON.stringify(G));}catch(e){} }
function migrate(o){ if(!o)return null; if(o.version===6)return o; return null; /* versões antigas recomeçam; migrações futuras aqui */ }
function load(){ if(typeof localStorage==="undefined")return false;
  try{ const s=localStorage.getItem("gestorafb"); if(s){ const m=migrate(JSON.parse(s)); if(m){G=m;return true;} } }catch(e){} return false; }
function wipe(){ if(typeof localStorage!=="undefined")localStorage.removeItem("gestorafb"); G=null; }

/* ---------- Fase 2: treinador, direção, objetivos ---------- */
function squadRating(club){
  const line=autoPickLineup(club,"4-4-2"), slots=FORMATIONS["4-4-2"].slots; let s=0,n=0;
  line.forEach((id,i)=>{const p=club.squad.find(x=>x.id===id); if(p){s+=effAt(p,slots[i].pos);n++;}});
  return n?s/n:55;
}
function budgetForObjective(divIdx,obj){
  const bases=[0.45,0.32,0.22,0.14];                                  // Pró-Nacional → 2ª Divisão
  const divBase=bases[divIdx]!=null?bases[divIdx]:0.16;
  const amb={title:1.6,promo:1.4,top:1.1,mid:0.9,survive:0.7}[obj&&obj.type]||1; // aspiração
  return Math.round(divBase*amb*rnd(0.85,1.15)*100)/100;
}
function objectiveFor(di,rankExp,n){
  const d=G.divisions[di], canUp=d.upSlots>0, canDown=d.downSlots>0;
  if(rankExp<=2) return canUp?{type:"promo",label:"Subir de divisão",target:d.upSlots,baseConf:55}:{type:"title",label:"Lutar pelo título",target:3,baseConf:55};
  if(rankExp<=Math.ceil(n*0.4)) return {type:"top",label:canUp?"Lutar pela subida":"Primeira metade da tabela",target:Math.max(d.upSlots+2,Math.ceil(n/2)),baseConf:58};
  if(canDown&&rankExp>n-4) return {type:"survive",label:"Manter a categoria (evitar descida)",target:n-d.downSlots,baseConf:62};
  return {type:"mid",label:"Meio da tabela, tranquilo",target:canDown?n-d.downSlots:Math.ceil(n/2),baseConf:60};
}
function setObjectives(){
  G.divisions.forEach((d,di)=>{
    const ranked=d.clubs.map(c=>({c,r:squadRating(c)})).sort((a,b)=>b.r-a.r);
    ranked.forEach((o,idx)=>{ o.c.objective=objectiveFor(di,idx+1,d.clubs.length); });
  });
  // verba de cada clube conforme a sua aspiração (a do utilizador é gerida à parte)
  G.divisions.forEach((d,di)=>d.clubs.forEach(c=>{ if(di===G.myDiv&&c.id===G.myId)return; c.budget=budgetForObjective(di,c.objective); }));
  const o=me().objective; if(!G.board)G.board={}; G.board.confidence=o?o.baseConf:60;
}
function boardAfterUserMatch(){
  if(!G.board)return;
  const d=myDivObj(), res=d.results[d.results.length-1]; if(!res)return;
  const my=res.find(x=>x.h===G.myId||x.a===G.myId); if(!my)return;
  const isHome=my.h===G.myId, gf=isHome?my.hg:my.ag, ga=isHome?my.ag:my.hg;
  let delta=gf>ga?6:gf===ga?1:-5;
  const rank=sortedTable(d).findIndex(c=>c.id===G.myId)+1, target=me().objective?me().objective.target:d.clubs.length;
  if(rank<=target)delta+=2; else delta-=Math.min(6,(rank-target)*0.8);
  G.board.confidence=clamp(Math.round(G.board.confidence+delta),0,100);
}
function evaluateBoard(meRank){
  const obj=me().objective||{target:myDivObj().clubs.length,label:"—"};
  const met=meRank<=obj.target;
  G.contract.seasonsLeft--;
  if(met){
    G.manager.reputation=clamp(G.manager.reputation+(meRank<=Math.ceil(obj.target/2)?8:4),0,100);
    G.board.confidence=clamp(G.board.confidence+15,0,100);
    if(G.contract.seasonsLeft<=0){G.contract.seasonsLeft=2;addNews("Objetivo cumprido! A direção renovou o teu contrato por +2 épocas.");}
    else addNews("Objetivo cumprido ("+obj.label+"). A direção está satisfeita.");
    G.fired=false;
  } else {
    const miss=meRank-obj.target;
    G.manager.reputation=clamp(G.manager.reputation-6,0,100);
    G.board.confidence=clamp(G.board.confidence-25,0,100);
    if(G.board.confidence<=10||miss>=3||G.contract.seasonsLeft<=0) fireManager("Resultados abaixo do esperado — objetivo \""+obj.label+"\" falhado ("+meRank+"º).");
    else { addNews("Objetivo falhado ("+obj.label+"). A direção deu-te mais uma época para corrigir."); G.fired=false; }
  }
  if(!G.fired && Math.random()<0.04) fireManager(pick(firingReasons()));
}
function fireManager(reason){ G.fired=true; G.firedReason=reason||"Decisão da direção."; addNews("A direção do "+me().name+" dispensou-te: "+G.firedReason); G.offers=makeJobOffers(); }
function makeJobOffers(){
  const all=[];
  G.divisions.forEach((d,di)=>d.clubs.forEach(c=>{ if(!(di===G.myDiv&&c.id===G.myId))all.push({divIdx:di,short:c.short,name:c.name,rating:squadRating(c)}); }));
  all.sort((a,b)=>a.rating-b.rating);
  const top=Math.max(3,Math.floor(all.length*(0.2+G.manager.reputation/220)));
  const pool=all.slice(0,top);
  for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
  return pool.slice(0,3);
}
function takeNewJob(i){
  const off=G.offers&&G.offers[i]; if(!off)return false;
  const ci=G.divisions[off.divIdx].clubs.findIndex(c=>c.short===off.short); if(ci<0)return false;
  G.myDiv=off.divIdx; G.myId=ci; G.contract={seasonsLeft:2}; G.fired=false; G.offers=null;
  addNews("Assumiste o comando do "+me().name+".");
  newSeason();
  return true;
}
/* ---------- Fase 3: transferências ---------- */
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function transferFee(p){
  const cy=p.contractYears||2, mod=cy<=1?0.55:cy===2?0.85:1.0;
  return Math.max(0.02,Math.round(p.value*mod*100)/100);
}
function allClubsFlat(){ const o=[]; G.divisions.forEach((d,di)=>d.clubs.forEach(c=>o.push({c,di}))); return o; }
function isMine(c,di){ return di===G.myDiv&&c.id===G.myId; }
function aiTransfer(){
  const clubs=allClubsFlat();
  const buyers=clubs.filter(o=>!isMine(o.c,o.di)&&o.c.budget>0.06);
  if(!buyers.length)return;
  const b=pick(buyers);
  const sellers=clubs.filter(o=>o.c!==b.c&&!isMine(o.c,o.di)&&o.c.squad.length>17);
  if(!sellers.length)return;
  const s=pick(sellers);
  const cand=s.c.squad.filter(p=>transferFee(p)<=b.c.budget).sort((x,y)=>ability(y)-ability(x))[0];
  if(!cand)return;
  const fee=transferFee(cand);
  b.c.budget=Math.round((b.c.budget-fee)*100)/100; s.c.budget=Math.round((s.c.budget+fee)*100)/100;
  s.c.squad=s.c.squad.filter(p=>p.id!==cand.id); b.c.squad.push(cand);
}
function makePlayerOffers(){
  const meC=me(); if(meC.squad.length<=14)return [];
  const listed=meC.squad.filter(p=>p.transferListed);
  const best=meC.squad.slice().sort((a,b)=>ability(b)-ability(a)).slice(0,8);
  const targets=listed.length?listed.concat(best):best;
  const clubs=allClubsFlat().filter(o=>!isMine(o.c,o.di)&&o.c.budget>0.08);
  shuffleArr(clubs);
  const offers=[], used=new Set(), nBids=listed.length?ri(3,6):ri(0,3);
  for(let i=0;i<nBids&&i<clubs.length;i++){
    const club=clubs[i].c, di=clubs[i].di;
    const pool=targets.filter(p=>!used.has(p.id)&&transferFee(p)*0.9<=club.budget);
    const lp=pool.filter(p=>p.transferListed);
    const avail=lp.length?lp:pool;
    if(!avail.length)continue;
    const p=pick(avail); used.add(p.id);
    const base=transferFee(p), maxFee=Math.round(base*rnd(1.1,1.6)*100)/100;
    const fee=Math.max(0.02,Math.round(base*rnd(0.8,1.05)*100)/100);
    offers.push({clubShort:club.short,clubName:club.name,divIdx:di,playerId:p.id,playerName:p.name,fee,maxFee,round:0});
  }
  return offers;
}
function releasePlayer(pid){
  const c=me(); if(c.squad.length<=14)return {ok:false,msg:"Plantel demasiado pequeno"};
  const p=c.squad.find(x=>x.id===pid); if(!p)return {ok:false,msg:""};
  c.squad=c.squad.filter(x=>x.id!==pid);
  addNews("Dispensaste "+p.name+" (sem receita).");
  G.lineup=autoPickLineup(c,G.formation); save();
  return {ok:true,msg:"Dispensado: "+p.name};
}
function toggleTransferList(pid){
  const c=me(); const p=c.squad.find(x=>x.id===pid); if(!p)return false;
  p.transferListed=!p.transferListed;
  addNews(p.transferListed?("Colocaste "+p.name+" na lista de transferências."):("Retiraste "+p.name+" da lista de transferências."));
  save(); return p.transferListed;
}
function transferWindow(){
  G.divisions.forEach(()=>{const n=ri(2,5);for(let k=0;k<n;k++)aiTransfer();});
  G.transferOffers=makePlayerOffers();
  if(G.transferOffers.length)addNews(G.transferOffers.length+" proposta(s) recebida(s) por jogadores teus.");
}
function acceptOffer(i){
  const o=G.transferOffers&&G.transferOffers[i]; if(!o)return {ok:false,msg:""};
  const meC=me();
  if(meC.squad.length<=14)return {ok:false,msg:"Plantel demasiado pequeno para vender"};
  const p=meC.squad.find(x=>x.id===o.playerId); if(!p)return {ok:false,msg:"Jogador já não está no plantel"};
  meC.budget=Math.round((meC.budget+o.fee)*100)/100;
  meC.squad=meC.squad.filter(x=>x.id!==o.playerId);
  const buyer=G.divisions[o.divIdx].clubs.find(c=>c.short===o.clubShort); if(buyer)buyer.squad.push(p);
  addNews("Vendeste "+p.name+" ao "+o.clubName+" por "+money(o.fee)+".");
  G.transferOffers=G.transferOffers.filter((_,j)=>j!==i);
  G.lineup=autoPickLineup(meC,G.formation); save();
  return {ok:true,msg:"Vendido: "+p.name+" ("+money(o.fee)+")"};
}
function rejectOffer(i){
  const o=G.transferOffers&&G.transferOffers[i]; if(!o)return;
  addNews("Recusaste a proposta do "+o.clubName+" por "+o.playerName+".");
  G.transferOffers=G.transferOffers.filter((_,j)=>j!==i); save();
}
/* ---------- Fase 4: energia/forma, lesões, renovação, negociação ---------- */
function unavailable(club){ const set=new Set(club.susp||[]); club.squad.forEach(p=>{ if((p.injuredWeeks||0)>0)set.add(p.id); }); return set; }
function recovery(age){ return clamp(Math.round(22-(age-20)*0.7),6,22); }
function energyFactor(club,line){ const ps=line.map(id=>club.squad.find(x=>x.id===id)).filter(Boolean); const avg=ps.reduce((s,p)=>s+(p.energy==null?100:p.energy),0)/Math.max(1,ps.length); return 0.86+0.14*(avg/100); }
function processEnergyInjuries(club,playedIds){
  const played=new Set(playedIds||[]);
  club.squad.forEach(p=>{
    if(p.energy==null)p.energy=100; if(p.injuredWeeks==null)p.injuredWeeks=0;
    if(p.injuredWeeks>0){ p.injuredWeeks--; p.energy=clamp(p.energy+Math.round(recovery(p.age)*0.6),0,100); return; }
    if(played.has(p.id)){
      p.energy=clamp(p.energy-ri(4,9)-Math.max(0,p.age-32),0,100);             // titular: desgaste menor (dura mais jogos)
      const risk=0.015+(100-p.energy)/100*0.04+Math.max(0,(p.age-31))*0.003;   // pouca energia => mais lesões
      if(Math.random()<risk){ p.injuredWeeks=ri(1,5); addNews(p.name+" lesionou-se — fora "+p.injuredWeeks+" jornada"+(p.injuredWeeks>1?"s":"")+"."); }
    } else { p.energy=clamp(p.energy+Math.round(recovery(p.age)*2.5),0,100); } // suplente: recupera muito (menos com idade)
  });
}
function rateUserMatch(club,playedIds,r,isHome){
  if(!playedIds)return;
  const gf=isHome?r.hg:r.ag, ga=isHome?r.ag:r.hg, won=gf>ga, draw=gf===ga, side=isHome?"H":"A";
  const gp={}, cp={};
  (r.events||[]).forEach(e=>{ if(e.side!==side)return;
    if(e.type==="goal"&&e.scorer)gp[e.scorer]=(gp[e.scorer]||0)+1;
    else if(e.type==="yellow")cp[e.pid]=(cp[e.pid]||0)-0.3;
    else if(e.type==="red")cp[e.pid]=(cp[e.pid]||0)-1.5; });
  playedIds.forEach(id=>{ const p=club.squad.find(x=>x.id===id); if(!p)return;
    let rt=6.0+(won?0.5:draw?0:-0.5);
    rt+=(gp[id]||0)*1.2; rt+=(cp[id]||0);
    const grp=GROUP[p.pos];
    if(grp==="GK")rt+= ga===0?1.4 : ga>=3?-1.2 : -0.35*ga;
    else if(grp==="DEF")rt+= ga===0?0.6 : ga>=3?-0.6:0;
    rt+=rnd(-0.5,0.5);
    rt=clamp(Math.round(rt*10)/10,1,10);
    if(!p.ratings)p.ratings=[]; p.ratings.push(rt); if(p.ratings.length>10)p.ratings.shift(); p.lastRating=rt;
  });
}
function avg5(p){ if(!p.ratings||!p.ratings.length)return null; const a=p.ratings.slice(-5); return Math.round(a.reduce((s,x)=>s+x,0)/a.length*10)/10; }
/* ---------- forma & moral (equipa do utilizador) ---------- */
function updateForm(club,playedIds){
  const played=new Set(playedIds||[]);
  club.squad.forEach(p=>{
    if(p.form==null)p.form=0;
    if(played.has(p.id)){
      const rt=(p.lastRating!=null)?p.lastRating:6.3;          // forma segue a nota do jogo (média com decaimento)
      p.form=Math.round(clamp(p.form*0.7+(rt-6.3)*0.9,-6,6)*100)/100;
    } else { p.form=Math.round(p.form*0.82*100)/100; }         // quem não joga vê a forma esbater-se
  });
}
function teamForm(club){ const arr=(club.squad||[]).filter(p=>p.form).map(p=>p.form); return arr.length?Math.round(arr.reduce((s,x)=>s+x,0)/arr.length*10)/10:0; }
/* ---------- química de equipa (entrosamento do onze) ---------- */
function updateChem(startXI){
  if(G.chem==null)G.chem=65;
  const prev=G.lastXI||[], cur=(startXI||[]).filter(id=>id!=null);
  if(prev.length){
    let changes=0; cur.forEach(id=>{ if(prev.indexOf(id)<0)changes++; });
    G.chem=changes===0?clamp(G.chem+5,30,100):clamp(G.chem-changes*2,30,100);
  }
  G.lastXI=cur;
}
/* ---------- treino & desenvolvimento (fim de época) ---------- */
const FOCUS_ATTRS={ "Ataque":["rem","cab","dri","cri","pen","liv"], "Defesa":["des","mar","pos","cab","agr"], "Físico":["vel","res","for","rea"], "Equilibrado":null };
function developPlayer(p,played,isMine){
  const focus=(isMine&&G.trainFocus)?G.trainFocus:"Equilibrado";
  const foc=FOCUS_ATTRS[focus]||null, prof=PROFILES[p.pos]||{};
  const relevant=()=>{ let pool=ATTR_KEYS.filter(k=>prof[k]&&(!foc||foc.includes(k))); if(!pool.length)pool=ATTR_KEYS.filter(k=>prof[k]); return pool; };
  if(p.age<24){
    let ups=(played>=18?3:played>=8?2:1);                      // jovens: quanto mais jogam, mais evoluem
    if(isMine&&focus!=="Equilibrado")ups++;                    // treino focado dá um extra ao teu plantel
    let tries=0;
    while(ups>0&&tries<40){ tries++;
      const pool=relevant(); if(!pool.length)break; const k=pick(pool);
      if(roleRatingAttrs(p.attrs,p.pos)<p.potential && p.attrs[k]<20 && Math.random()<0.6)p.attrs[k]=clamp(p.attrs[k]+1,1,20);
      ups--;
    }
  } else if(p.age<31){
    if(played>=14 && roleRatingAttrs(p.attrs,p.pos)<p.potential){ // pico: pequena evolução se jogou muito
      const pool=relevant(); if(pool.length&&Math.random()<0.5){ const k=pick(pool); p.attrs[k]=clamp(p.attrs[k]+1,1,20); }
    }
  } else if(p.age>32){
    ATTR_KEYS.forEach(k=>{ if(["vel","res","for","rea"].includes(k)&&Math.random()<0.4)p.attrs[k]=clamp(p.attrs[k]-1,1,20); });
  }
}
/* evolução a CADA jornada (equipa do utilizador): quem não joga evolui mais; mais novos evoluem mais */
function trainTick(club,playedIds){
  if(!club||!club.squad)return;
  const played=new Set(playedIds||[]);
  club.squad.forEach(p=>{
    if(roleRatingAttrs(p.attrs,p.pos)>=p.potential)return;                 // já atingiu o potencial
    const ageF=p.age<=19?1.5:p.age<=23?1.15:p.age<=27?0.7:p.age<=31?0.4:0.15; // mais novo => maior incremento
    const playF=played.has(p.id)?0.55:1.4;                                 // quem não joga evolui mais
    if(Math.random()<0.11*ageF*playF){
      const focus=p.trainFocus||"Equilibrado", foc=FOCUS_ATTRS[focus]||null, prof=PROFILES[p.pos]||{};
      let pool=ATTR_KEYS.filter(k=>prof[k]&&(!foc||foc.includes(k))); if(!pool.length)pool=ATTR_KEYS.filter(k=>prof[k]);
      if(pool.length){ const k=pick(pool); if(p.attrs[k]<20)p.attrs[k]=clamp(p.attrs[k]+1,1,20); }
    }
  });
}
/* ---------- moral dos jogadores (equipa do utilizador) ---------- */
function updateMorale(club,playedIds,gf,ga){
  const played=new Set(playedIds||[]);
  const teamDelta=gf>ga?2:gf<ga?-2:0;
  club.squad.forEach(p=>{
    if(p.morale==null)p.morale=70;
    let d=teamDelta;
    if(played.has(p.id)){ d+=2; if(p.lastRating!=null)d+=(p.lastRating-6.3)*0.5; } // jogar e jogar bem sobe a moral
    else d-=2;                                                                      // ficar de fora corrói (estável se a equipa vence)
    if(p.promise&&p.promise.active&&G.week>=p.promise.until){                        // avaliar promessa de minutos
      const got=(p.apps||0)-(p.promise.apps0||0);
      if(got>=3){ d+=8; addNews(p.name+" está satisfeito: cumpriste a promessa de minutos."); }
      else { d-=25; addNews(p.name+" sente-se enganado — prometeste minutos que não deste."); }
      p.promise.active=false;
    }
    p.morale=clamp(Math.round(p.morale+d),0,100);
  });
  club.squad.forEach(p=>{                                                            // jogadores muito insatisfeitos agem
    if(p.morale<=10 && !p.transferListed){ p.transferListed=true; p.wantsTalk=false; addNews(p.name+" pediu para ser colocado na lista de transferências (moral muito baixa)."); }
    else if(p.morale<=22 && !p.wantsTalk && !p.transferListed){ p.wantsTalk=true; addNews(p.name+" pediu para reunir contigo — está descontente."); }
  });
}
function playerMeetingResolve(pid,option){
  const p=me().squad.find(x=>x.id===pid); if(!p)return {msg:""};
  p.wantsTalk=false;
  if(option==="minutos"){ p.morale=clamp((p.morale||70)+15,0,100); p.promise={active:true,from:G.week,until:G.week+5,apps0:p.apps||0}; save(); return {msg:"Prometeste mais minutos a "+p.name+" — cumpre nos próximos jogos."}; }
  if(option==="paciencia"){ const ok=Math.random()<0.5; p.morale=clamp((p.morale||70)+(ok?8:3),0,100); save(); return {msg:ok?p.name+" aceitou lutar pelo lugar.":p.name+" ouviu-te, mas continua reticente."}; }
  if(option==="listar"){ p.transferListed=true; p.morale=clamp((p.morale||70)+10,0,100); save(); return {msg:p.name+" foi colocado na lista de transferências."}; }
  p.morale=clamp((p.morale||70)-8,0,100); save(); return {msg:"Ignoraste o desabafo de "+p.name+"."};
}
/* ---------- reunião com a direção após maus resultados ---------- */
function userResultAt(weekIdx){ const d=myDivObj(); const wk=d.results[weekIdx]; if(!wk)return null; const m=wk.find(x=>x.h===G.myId||x.a===G.myId); if(!m)return null; const isH=m.h===G.myId, gf=isH?m.hg:m.ag, ga=isH?m.ag:m.hg; return {gf,ga,res:gf>ga?"W":gf<ga?"L":"D", opp:isH?m.a:m.h}; }
function recentUserResults(n){ const d=myDivObj(); const out=[]; for(let i=d.results.length-1;i>=0&&out.length<n;i--){ const r=userResultAt(i); if(r)out.push(r); } return out; }
function setShortObjective(pts,games){ G.shortObjective={active:true, need:pts, games, played:0, points:0, deadline:G.week+games, label:pts+" pontos em "+games+" jogos"}; }
function maybeBoardMeeting(){
  if(G.fired||(G.meeting&&G.meeting.active)||(G.shortObjective&&G.shortObjective.active))return;
  const recent=recentUserResults(3); if(!recent.length)return;
  const last=recent[0], oppClub=myClubs()[last.opp];
  const heavy=last.res==="L" && (last.ga-last.gf)>=3;
  const upset=last.res==="L" && oppClub && (squadRating(me())-squadRating(oppClub))>=8;
  const streak=recent.length>=3 && recent.every(r=>r.res==="L");
  const twoOfThree=recent.length>=3 && recent.filter(r=>r.res==="L").length>=2 && (G.board?G.board.confidence:60)<45;
  let reason=null;
  if(heavy)reason="a derrota pesada por "+last.ga+"-"+last.gf+(oppClub?" frente ao "+oppClub.name:"");
  else if(upset)reason="a derrota frente a um adversário muito inferior"+(oppClub?" ("+oppClub.name+")":"");
  else if(streak)reason="uma série de três derrotas seguidas";
  else if(twoOfThree)reason="os maus resultados recentes";
  if(reason){ G.meeting={active:true, reason, week:G.week}; addNews("A direção convocou-te para uma reunião: "+reason+"."); }
}
function resolveBoardMeeting(option){
  if(!G.meeting||!G.meeting.active)return {msg:""};
  const conf=G.board?G.board.confidence:60; G.meeting.active=false; G.meeting=null;
  if(option==="assumir"){ G.board.confidence=clamp(conf+6,0,100); setShortObjective(4,4); save(); return {msg:"Assumiste a responsabilidade. Objetivo: 4 pontos nos próximos 4 jogos."}; }
  if(option==="prometer"){ G.board.confidence=clamp(conf+2,0,100); setShortObjective(7,3); save(); return {msg:"Prometeste resultados imediatos. Objetivo: 7 pontos nos próximos 3 jogos."}; }
  if(conf<35){ fireManager("Confrontaste a direção após maus resultados — e foste dispensado na hora."); return {msg:"A direção não gostou. Estás despedido."}; }
  G.board.confidence=clamp(conf-8,0,100); save(); return {msg:"Discordaste da direção. Ficas sob forte pressão, sem margem para erro."};
}
function checkShortObjective(){
  const so=G.shortObjective; if(!so||!so.active)return;
  const last=userResultAt(myDivObj().results.length-1); if(!last)return;
  so.played++; so.points+=last.res==="W"?3:last.res==="D"?1:0;
  if(so.points>=so.need){ so.active=false; G.shortObjective=null; if(G.board)G.board.confidence=clamp(G.board.confidence+15,0,100); addNews("Cumpriste o objetivo de curto prazo da direção. Confiança recuperada."); }
  else if(so.played>=so.games){ so.active=false; G.shortObjective=null; fireManager("Não cumpriste o objetivo de curto prazo ("+so.label+") acordado com a direção."); }
}
function negotiateOffer(i,counterFee){
  const o=G.transferOffers&&G.transferOffers[i]; if(!o)return {status:"gone"};
  o.round=(o.round||0)+1;
  if(counterFee<=o.maxFee){ o.fee=counterFee; return {status:"accepted", res:acceptOffer(i)}; }
  if(o.round<2 && counterFee<=o.maxFee*1.15){ o.fee=Math.round(((counterFee+o.maxFee)/2)*100)/100; addNews(o.clubName+" contrapôs "+money(o.fee)+" por "+o.playerName+"."); save(); return {status:"counter", fee:o.fee}; }
  addNews(o.clubName+" retirou-se da negociação por "+o.playerName+"."); G.transferOffers=G.transferOffers.filter((_,j)=>j!==i); save(); return {status:"withdrawn"};
}
function renewContract(pid){
  const c=me(), p=c.squad.find(x=>x.id===pid); if(!p)return {ok:false,msg:""};
  const cost=Math.max(0.01,Math.round(p.value*0.08*100)/100);
  if(c.budget<cost)return {ok:false,msg:"Verba insuficiente ("+money(cost)+")"};
  c.budget=Math.round((c.budget-cost)*100)/100; p.contractYears=clamp((p.contractYears||1)+2,2,5);
  addNews("Renovaste com "+p.name+" ("+p.contractYears+" anos, custo "+money(cost)+").");
  save(); return {ok:true,msg:"Renovado: "+p.name};
}
/* ---------- Taça (eliminação direta, todas as equipas) ---------- */
function allClubShorts(){ const a=[]; G.divisions.forEach(d=>d.clubs.forEach(c=>a.push(c.short))); return a; }
function clubByShort(sh){ for(const d of G.divisions){ const c=d.clubs.find(x=>x.short===sh); if(c)return c; } return null; }
function divOfShort(sh){ for(let i=0;i<G.divisions.length;i++){ if(G.divisions[i].clubs.some(x=>x.short===sh))return i; } return -1; }
function cupRoundName(){ const t=G.cup?G.cup.remaining.length:0; if(t<=2)return "Final"; if(t<=4)return "Meias-finais"; if(t<=8)return "Quartos-de-final"; if(t<=16)return "Oitavos-de-final"; return (G.cup.round+1)+"ª eliminatória"; }
function cupCreate(){
  const rem=shuffleArr(allClubShorts());
  G.cup={active:true,round:0,remaining:rem,ties:[],history:[],winner:null,userAlive:true,schedule:[]};
  cupDraw();
  let n=rem.length, rounds=0; while(n>1){ n=Math.ceil(n/2); rounds++; }
  const L=myDivObj().fixtures.length;
  for(let i=0;i<rounds;i++) G.cup.schedule.push(Math.max(1,Math.round((i+1)/(rounds+1)*L)));
}
function cupRoundDue(){ return (G.cup&&G.cup.schedule&&G.cup.round<G.cup.schedule.length)?G.cup.schedule[G.cup.round]:999; }
function cupAvailable(){ return !!(G.cup&&G.cup.active&&myDivObj().week>=cupRoundDue()); }
function cupDraw(){ const rem=G.cup.remaining.slice(), ties=[]; while(rem.length>=2){ ties.push({a:rem.shift(),b:rem.shift(),sa:null,sb:null,w:null}); } if(rem.length===1)ties.push({a:rem.shift(),b:null,sa:null,sb:null,w:null}); G.cup.ties=ties; }
function cupUserTie(){ if(!G.cup||!G.cup.active)return null; const ms=me().short; return G.cup.ties.find(t=>t.a===ms||t.b===ms)||null; }
/* desempate por penáltis: 5 para cada equipa (termina quando uma não pode empatar), depois séries de 1 */
function penaltyShootout(saStr,sbStr){
  const pA=clamp(0.72+((saStr||60)-(sbStr||60))/500,0.55,0.9), pB=clamp(0.72+((sbStr||60)-(saStr||60))/500,0.55,0.9);
  let a=0,b=0,ka=0,kb=0; const kicks=[];
  const decided=()=> (a> b+Math.max(0,5-kb)) || (b> a+Math.max(0,5-ka));
  while(ka<5||kb<5){
    if(ka<=kb && ka<5){ const sc=Math.random()<pA; if(sc)a++; kicks.push({team:"A",scored:sc,n:ka+1}); ka++; }
    else if(kb<5){ const sc=Math.random()<pB; if(sc)b++; kicks.push({team:"B",scored:sc,n:kb+1}); kb++; }
    else break;
    if(decided())break;
  }
  if(a===b){ let n=5; while(a===b){ n++;
    const sa=Math.random()<pA; if(sa)a++; kicks.push({team:"A",scored:sa,n});
    const sb=Math.random()<pB; if(sb)b++; kicks.push({team:"B",scored:sb,n}); } }
  return {kicks,a,b,winner:a>b?"A":"B"};
}
function cupResolveTie(t){
  if(!t.b){ t.w=t.a; return; }
  const ms=me().short, involvesUser=(t.a===ms||t.b===ms);
  const ca=clubByShort(t.a), cb=clubByShort(t.b);
  const aLine=(involvesUser&&t.a===ms)?availableLineup(ca,G.lineup,G.formation):autoPickLineup(ca,"4-4-2",ca.susp);
  const bLine=(involvesUser&&t.b===ms)?availableLineup(cb,G.lineup,G.formation):autoPickLineup(cb,"4-4-2",cb.susp);
  const eA=(involvesUser&&t.a===ms)?energyFactor(ca,aLine):1, eB=(involvesUser&&t.b===ms)?energyFactor(cb,bLine):1;
  const r=simulate(ca,cb,aLine,bLine,eA,eB);
  let hg=r.hg, ag=r.ag;
  if(hg===ag){ const et=simulateET(ca,cb,aLine,bLine,eA,eB,r.expelledH,r.expelledA); hg+=et.hg; ag+=et.ag; t.et=true; }
  t.sa=hg; t.sb=ag;
  if(hg>ag)t.w=t.a; else if(ag>hg)t.w=t.b;
  else { const sa=teamStrength(ca,aLine,"4-4-2","Equilibrado").overall, sb=teamStrength(cb,bLine,"4-4-2","Equilibrado").overall; t.w=(penaltyShootout(sa,sb).winner==="A")?t.a:t.b; t.pens=true; }
  if(involvesUser){ const uc=me(), uLine=(t.a===ms)?aLine:bLine; processEnergyInjuries(uc,uLine); rateUserMatch(uc,uLine,r,(t.a===ms)); updateForm(uc,uLine); updateChem(uLine); trainTick(uc,uLine); updateMorale(uc,uLine,(t.a===ms)?hg:ag,(t.a===ms)?ag:hg); }
}
function cupAdvanceRound(preUser){
  if(!G.cup||!G.cup.active)return null;
  const ms=me().short;
  const userTie=G.cup.ties.find(t=>t.a===ms||t.b===ms)||null;
  G.cup.ties.forEach(t=>{ if(t===userTie&&preUser){ t.sa=preUser.sa;t.sb=preUser.sb;t.w=preUser.w;t.pens=!!preUser.pens;t.et=!!preUser.et; } else cupResolveTie(t); });
  if(userTie && userTie.b){ const ug=(userTie.a===ms)?userTie.sa:userTie.sb, ua=(userTie.a===ms)?userTie.sb:userTie.sa; recordManagerMatch(ug,ua); }
  if(userTie && userTie.b && userTie.w!==ms)G.cup.userAlive=false;
  if(userTie && userTie.b && userTie.w===ms){                          // prémio pequeno por vencer clube superior/muito mais forte
    const oppShort=(userTie.a===ms)?userTie.b:userTie.a, opp=clubByShort(oppShort);
    if(opp){ const higher=(()=>{const oi=divOfShort(oppShort);return oi>=0&&oi<G.myDiv;})();
      const stronger=squadRating(opp)-squadRating(me())>=8;
      if(higher||stronger){ const bonus=higher?0.06:0.04; me().budget=Math.round((me().budget+bonus)*100)/100;
        addNews("💪 Surpresa na Taça! Eliminaste o "+opp.name+" ("+(higher?"divisão superior":"muito mais forte")+"). Prémio: +"+money(bonus)+"."); } }
  }
  G.cup.history.push({name:cupRoundName(), ties:G.cup.ties.map(t=>({a:t.a,b:t.b,sa:t.sa,sb:t.sb,w:t.w,pens:!!t.pens}))});
  const winners=G.cup.ties.map(t=>t.w);
  G.cup.remaining=winners; G.cup.round++;
  if(winners.length===1){ G.cup.active=false; G.cup.winner=winners[0]; const wc=clubByShort(winners[0]); addNews("🏆 Taça: "+(wc?wc.name:winners[0])+" é o vencedor!"); if(winners[0]===me().short){ G.manager.trophies.push({type:"cup",name:"Vencedor da Taça",season:G.season}); me().budget=Math.round((me().budget+0.30)*100)/100; addNews("🏆 Prémio de vencedor da Taça: +€300K."); } }
  else cupDraw();
  save();
  return userTie;
}
function budgetCapRoom(){
  const start=G.seasonStartBudget||me().budget||0.1;
  const capTotal=Math.round(start*0.30*100)/100;                     // reforço total ≤ 30% da verba inicial
  return Math.max(0,Math.round((capTotal-(G.budgetGranted||0))*100)/100);
}
function requestBudget(){
  if(!G.board||!G.manager)return {ok:false,msg:"—"};
  const room=budgetCapRoom();
  if(room<=0.005)return {ok:false,msg:"A direção já reforçou o máximo desta época (30% da verba inicial)."};
  const conf=G.board.confidence;
  const chance=clamp((conf-30)/60,0.05,0.9);                         // coerente com a satisfação da direção
  if(Math.random()<chance){
    let amount=Math.round((0.04+conf/500)*100)/100;                  // pedaço do reforço
    if(amount>room)amount=room;                                      // nunca ultrapassa o teto de 30%
    me().budget=Math.round((me().budget+amount)*100)/100;
    G.budgetGranted=Math.round(((G.budgetGranted||0)+amount)*100)/100;
    G.board.confidence=clamp(conf-10,0,100);                         // conceder custa "folga" à direção
    addNews("A direção reforçou a verba de transferências: +"+money(amount)+".");
    save();
    return {ok:true,amount,msg:"Aprovado! +"+money(amount)+" · ainda podes pedir até "+money(budgetCapRoom())};
  }
  G.board.confidence=clamp(conf-4,0,100);
  addNews("A direção recusou reforçar a verba de transferências.");
  save();
  return {ok:false,msg:"A direção recusou o pedido (a confiança baixou um pouco)."};
}
function recordManagerMatch(gf,ga){ const s=G.manager&&G.manager.stats; if(!s)return; s.P++; s.GF+=gf; s.GA+=ga; if(gf>ga)s.W++; else if(gf<ga)s.L++; else s.D++; }
/* ---------- exports (para node/testes; ignorado no browser) ---------- */
if(typeof module!=="undefined"&&module.exports){
  module.exports={ POSITIONS,POS_NAME,GROUP,ATTRS,ATTR_KEYS,PROFILES,FORMATIONS,MENTAL,CLUBS,DIV1,
    rnd,ri,pick,clamp,money,roleRating,ability,effAt,fam,makePlayer,makeSquad,clubFromDef,
    buildFixtures,autoPickLineup,availableLineup,teamStrength,simulate,applyResult,pickGoal,pickFoul,
    simRound,playWeek,endSeason,newSeason,sortedTable,newGame,buyPlayer,sellPlayer,
    setObjectives,squadRating,evaluateBoard,fireManager,makeJobOffers,takeNewJob,boardAfterUserMatch,
    buyAsk,makeBid,completeBuy,
    transferFee,transferWindow,aiTransfer,makePlayerOffers,acceptOffer,rejectOffer,
    unavailable,recovery,energyFactor,processEnergyInjuries,negotiateOffer,renewContract,rateUserMatch,avg5,releasePlayer,toggleTransferList,
    formMult,chemFactor,updateForm,updateChem,teamForm,developPlayer,trainTick,
    updateMorale,playerMeetingResolve,maybeBoardMeeting,resolveBoardMeeting,checkShortObjective,setShortObjective,recentUserResults,userResultAt,
    cupCreate,cupAdvanceRound,cupUserTie,clubByShort,cupRoundName,cupRoundDue,cupAvailable,simulateET,divDefs,firingReasons,requestBudget,budgetForObjective,budgetCapRoom,divOfShort,penaltyShootout,PRONAC,DIV2,
    myDivObj,myClubs,me, getG:()=>G, setG:x=>{G=x}, getPID:()=>PID };
}
