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
const FIRST=["João","Rui","Nuno","Tomás","Diogo","Ivo","Marco","Rafael","Bruno","Hugo","Tiago","Miguel","André","Sérgio","Pedro","Luís","Vasco","Ricardo","Fábio","Dário","Gonçalo","Rúben","Gil","Duarte","José","Paulo","Hélder","Bernardo","Joel","Ivan","Artur","Cláudio","David","Filipe","Gustavo","Hélio","Jorge","Leandro","Márcio","Nélson","Válter","António","Lucas","César","Jorge","Manuel","Mário","Marco","Cláudio","Joca","Henrique","Pietro","Juan","Vicente","Vasco","Chico","Francisco","Nel","Manu","Duarte","Domingos","Mingos","Renato","Sandro","Sílvio","Humberto","Afonso","Tadeu","Adão"];
const LAST=["Silva","Moreira","Costa","Fernandes","Gonçalves","Oliveira","Rodrigues","Pereira","Machado","Carvalho","Sousa","Martins","Ferreira","Ribeiro","Barbosa","Pinto","Lopes","Cardoso","Antunes","Cunha","Marques","Vieira","Faria","Nogueira","Azevedo","Teixeira","Gomes","Correia","Alves","Matos","Torres","Braga","Peixoto","Sampaio","Rocha","Dias","Cruz","Freitas","Vilela","Amorim","Guimarães","Loureiro","Xavier","Ferreira","Caldas","Rei","Lisboa","Macedo","Vilaça","Magalhães"];

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
    {n:"Luís Ferreira",p:"ME"},{n:"Duarte Pinto",p:"ME"},{n:"Pedro Magalhães",p:"MO"},{n:"André Calçada",p:"ED"},
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

let G=null, PID=1, GID=1;
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
  const p={id:PID++, name:randName(), pos, attrs:a, altura, age, potential,
    value, contractYears:ri(1,4), energy:100, injuredWeeks:0, transferListed:false, form:0, morale:clamp(65+ri(-5,10),0,100), trainFocus:"Equilibrado", goals:0, apps:0, yc:0, rc:0, banMatches:0, ycBanned:0, wage:0};
  assignTraits(p);
  p.wage=wageFor(p); return p;
}
function wageFor(p){ return Math.max(0.005, Math.round(Math.pow(ability(p)/55,2.6)*0.042*100)/100); }
/* ---------- Traços de personalidade ---------- */
const TRAITS={
  lider:{lbl:"Líder",ic:"🧠"}, veterano:{lbl:"Veterano",ic:"🎖️"}, profissional:{lbl:"Profissional",ic:"✅"},
  temperamental:{lbl:"Temperamental",ic:"🌋"}, boaVida:{lbl:"Boa-vida",ic:"🍺"}, criaCaso:{lbl:"Cria-caso",ic:"🎭"}, ambicioso:{lbl:"Ambicioso",ic:"🚀"}
};
function assignTraits(p){
  if(p.traits)return p.traits;
  const t=[];
  if(p.age>=31 && Math.random()<0.5)t.push(Math.random()<0.6?"veterano":"lider");
  else if(p.age<=21 && Math.random()<0.4)t.push("ambicioso");
  if(!t.length && Math.random()<0.55)t.push(pick(["lider","profissional","temperamental","boaVida","criaCaso","ambicioso"]));
  if(t.length && Math.random()<0.14){ const extra=pick(Object.keys(TRAITS)); if(t.indexOf(extra)<0)t.push(extra); }
  p.traits=t.slice(0,2); return p.traits;
}
function hasTrait(p,k){ return !!(p&&p.traits&&p.traits.indexOf(k)>=0); }
function traitLabels(p){ return ((p&&p.traits)||[]).map(k=>TRAITS[k]?TRAITS[k]:{lbl:k,ic:"•"}); }
function ensureTraits(){ const apply=arr=>(arr||[]).forEach(p=>{ if(p&&!p.traits)assignTraits(p); });
  (G.divisions||[]).forEach(d=>d.clubs.forEach(c=>apply(c.squad)));
  if(G.academy)apply(G.academy.youth); apply(G.freeAgents);
  (G.loans||[]).forEach(L=>{ if(L&&L.player&&!L.player.traits)assignTraits(L.player); });
}
function makeSquad(level){ return SQUAD_TEMPLATE.map(pos=>makePlayer(pos, level+rnd(-1.5,2))); }
function applyRosterEntry(p,r){                 // aplica overrides opcionais de um jogador definido à mão
  if(r.idade!=null)p.age=clamp(Math.round(r.idade),15,42);
  if(r.altura!=null)p.altura=clamp(Math.round(r.altura),150,215);
  if(r.attrs){ for(const k in r.attrs){ if(ATTR_KEYS.indexOf(k)>=0)p.attrs[k]=clamp(Math.round(r.attrs[k]),1,20); } }
  if(r.idade!=null||r.altura!=null||r.attrs||r.nivel!=null){    // recalcular derivados coerentes com os overrides
    const abil=roleRatingAttrs(p.attrs,p.pos);
    p.potential=clamp(Math.max(p.potential||abil, abil, (p.age<23?abil+ri(2,10):abil)),abil,99);
    p.value=Math.max(0.03,Math.round(Math.pow(abil/60,3.4)*0.16*(p.age<30?1:0.6)*100)/100);
    p.wage=wageFor(p);
  }
  return p;
}
function makeSquadFromRoster(roster,level){
  const squad=roster.map(r=>{const p=makePlayer(r.p, r.nivel!=null?clamp(r.nivel,1,20):level); p.name=r.n; return applyRosterEntry(p,r);});
  let gk=squad.filter(p=>p.pos==="GR").length; while(gk<3){ squad.push(makePlayer("GR",level)); gk++; }
  const fillPos=["DC","LD","LE","DC","MC","MDC","MC","ME","MD","MO","PL","ED","EE","PL","DC","MC","PL","LE","LD","DC","MC","MO"];
  let fi=0; while(squad.length<27){ squad.push(makePlayer(fillPos[fi%fillPos.length],level)); fi++; }
  return squad;
}
function clubFromDef(d,id){
  const level=clamp(Math.round(d.str/5),4,16);
  return {id, name:d.n, short:d.s, c1:d.c1, c2:d.c2, strength:d.str, crest:d.crest||null,
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
/* ---------- construção das competições a partir de LEAGUES (divisões com séries) ---------- */
const TIER_SLOTS={0:{up:0,down:4}, 1:{up:2,down:3}, 2:{up:1,down:1}, 3:{up:6,down:0}};   // por escalão
function buildGroups(){
  const src=(typeof LEAGUES!=="undefined"&&LEAGUES)?LEAGUES:[];
  const groups=[];
  src.forEach(div=>{
    const slots=TIER_SLOTS[div.tier]||{up:0,down:0};
    div.series.forEach(se=>{
      const name=div.name+(se.name?" · Série "+se.name:"");
      const defs=se.clubs.map(c=>{ const x=Object.assign({},c);
        if(typeof CFG!=="undefined"&&CFG.clubs&&CFG.clubs[x.s])Object.assign(x,CFG.clubs[x.s]);
        if(typeof CFG!=="undefined"&&CFG.rosters&&CFG.rosters[x.n])x.roster=CFG.rosters[x.n];   // plantel real por NOME do clube
        if(typeof CFG!=="undefined"&&CFG.crests&&CFG.crests[x.n])x.crest=CFG.crests[x.n];        // emblema real por NOME do clube (opt-in)
        return x; });
      const clubs=defs.map((d,i)=>{ const c=clubFromDef(d,i); c.gid=GID++; c.tier=div.tier; c.serie=se.name; return c; });
      groups.push({name, tier:div.tier, serie:se.name, upSlots:slots.up, downSlots:slots.down,
        clubs, fixtures:buildFixtures(clubs.length), results:[], week:0});
    });
  });
  return groups;
}
function clubByGid(gid){ for(const d of G.divisions){ const c=d.clubs.find(x=>x.gid===gid); if(c)return c; } return null; }
function groupIndexOf(tier,serie){ return G.divisions.findIndex(d=>d.tier===tier && (d.serie||"")===(serie||"")); }
function allClubGids(){ const a=[]; G.divisions.forEach(d=>d.clubs.forEach(c=>a.push(c.gid))); return a; }
function newGame(divIdx,clubIdx,managerName){
  PID=1; GID=1;
  const groups=buildGroups();
  G={version:7, divisions:groups, myDiv:divIdx, myTier:(groups[divIdx]?groups[divIdx].tier:0), myId:clubIdx,
     week:0, season:1, date:"Set", formation:"4-4-2", mentality:"Equilibrado",
     lineup:[], news:[], seasonDone:false, midWindowDone:false, budgetAsked:false,
     chem:65, lastXI:[], trainFocus:"Equilibrado", meeting:null, shortObjective:null, grace:0,
     academy:{level:1,focus:"Equilibrado",youth:[]}, records:{}, awards:[], streakU:0, streakW:0, wageBase:0, freeAgents:[], playoff:null, superCup:null, finalissima:null, event:null, eventCd:ri(1,2), rival:null, loans:[], windowOpen:false,
     manager:{name:(managerName||"Treinador").slice(0,28), reputation:40, seasons:0, trophies:[], stats:{P:0,W:0,D:0,L:0,GF:0,GA:0}},
     contract:{seasonsLeft:2}, board:{confidence:60}, fired:false, offers:null, transferOffers:[]};
  G.lineup=autoPickLineup(me(),G.formation);
  setObjectives();
  me().budget=budgetForObjective(G.myTier,me().objective); G.seasonStartBudget=me().budget; G.budgetGranted=0; G.pendingPrize=0;
  cupCreate();
  academyIntake();
  seedFreeAgents(6, clamp(Math.round(me().strength/5),4,15)); G.wageBase=wageBill(me()); ensureRivals(); pickRival();
  ensureCareer();                                                    // inicia a história de carreira (1ª passagem)
  ensureRoles();                                                      // papéis de equipa (capitão/penáltis/livres/cantos)
  ensureInstr();                                                      // instruções táticas rápidas
  ensureAch();                                                        // conquistas
  startGap();                                                         // abre o período de dias até ao 1º jogo (pré-época)
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
/* ---------- onze da IA: exclui lesionados/suspensos e roda por energia (descansa cansados) ---------- */
function aiPickLineup(club,formation){
  const slots=FORMATIONS[formation].slots, un=unavailable(club), used=new Set(), line=[];
  const ew=p=>0.55+0.45*((p.energy==null?100:p.energy)/100);   // cansado vale menos na escolha → o CPU roda o plantel
  for(const slot of slots){
    let best=null,bv=-1;
    for(const p of club.squad){ if(used.has(p.id)||un.has(p.id))continue;
      const v=effAt(p,slot.pos)*ew(p); if(v>bv){bv=v;best=p;} }
    if(best){used.add(best.id);line.push(best.id);} else line.push(null);
  }
  return line;
}
function aiEnergyTick(club,playedIds){                          // energia do CPU: quem jogou cansa, o resto recupera (sem notícias)
  const played=new Set(playedIds||[]);
  club.squad.forEach(p=>{
    if(p.energy==null)p.energy=100; if(p.injuredWeeks==null)p.injuredWeeks=0;
    if(p.injuredWeeks>0){ p.injuredWeeks--; p.energy=clamp(p.energy+Math.round(recovery(p.age)*0.6),0,100); return; }
    if(played.has(p.id)){ p.energy=clamp(p.energy-ri(4,9)-Math.max(0,p.age-32),0,100);
      const risk=0.012+(100-p.energy)/100*0.03+Math.max(0,(p.age-31))*0.002;
      if(Math.random()<risk)p.injuredWeeks=rollInjury(); }
    else p.energy=clamp(p.energy+Math.round(recovery(p.age)*2.5),0,100);
  });
  trainingInjuryTick(club,true);              // lesões de treino também no CPU
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
  const mine=(typeof G!=="undefined"&&G&&G.myId!=null&&club===me());
  const cm=mine?chemFactor():1;                                                     // química só afeta a tua equipa
  const cap=mine?captainFactor():1;                                                 // capitão dá um pequeno empurrão
  const f=cm*cap;
  return {def:def*men.def*f, mid:mid*f, atk:atk*men.atk*f, overall:(def+mid+atk)/3*f};
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
/* ---------- Papéis de equipa (capitão, penáltis, livres, cantos) ---------- */
function ensureRoles(){
  if(!G.roles)G.roles={captain:null,penalty:null,freekick:null,corner:null};
  const ids=new Set(((typeof me==="function"&&G.myId!=null&&me())?me().squad:[]).map(p=>p.id));
  ["captain","penalty","freekick","corner"].forEach(k=>{ if(G.roles[k]!=null && !ids.has(G.roles[k]))G.roles[k]=null; });
  return G.roles;
}
function setRole(role,pid){ ensureRoles(); if(["captain","penalty","freekick","corner"].indexOf(role)<0)return G.roles; G.roles[role]=(pid==null?null:pid); save(); return G.roles; }
function isUserClub(club){ return typeof me==="function" && G && G.myId!=null && club===me(); }
function roleTakerId(club,lineup,gone,role,attr){                  // batedor escolhido (se estiver em campo) ou o melhor por atributo
  if(isUserClub(club) && G.roles && G.roles[role]!=null){
    const rid=G.roles[role];
    if(lineup.indexOf(rid)>=0 && !(gone&&gone.has(rid)))return rid;
  }
  const b=bestFieldByAttr(club,lineup,attr,gone); return b?b.id:null;
}
function penMissChance(club,pid){ const p=club&&club.squad.find(x=>x.id===pid); const pen=(p&&p.attrs)?(p.attrs.pen||10):10; return clamp(0.32-(pen/20)*0.24,0.05,0.32); }
function fkMissChance(club,pid){ const p=club&&club.squad.find(x=>x.id===pid); const liv=(p&&p.attrs)?(p.attrs.liv||10):10; return clamp(0.62-(liv/20)*0.42,0.20,0.62); }
function captainFactor(){                                          // pequeno empurrão da tua equipa se o capitão jogar e estiver bem
  if(typeof me!=="function"||!G||!G.roles)return 1;
  const cid=G.roles.captain; if(cid==null)return 1;
  if((G.lineup||[]).indexOf(cid)<0)return 1;                       // tem de estar no onze
  const cap=me().squad.find(p=>p.id===cid); if(!cap)return 1;
  const mor=cap.morale==null?70:cap.morale;
  return mor>=70?1.03 : mor>=50?1.015 : 1.0;
}
function cornerBoost(club,lineup,gone){                            // bom batedor de cantos: pequeno reforço aos golos de cabeça
  if(!isUserClub(club))return 0;
  const id=roleTakerId(club,lineup,gone,"corner","cru"); if(id==null)return 0;
  const p=club.squad.find(x=>x.id===id); if(!p||!p.attrs)return 0;
  return clamp(((p.attrs.cru||10)-10)/400,0,0.03);
}
/* ---------- Instruções táticas rápidas ---------- */
function ensureInstr(){ if(!G.instr)G.instr={pressao:"normal",ritmo:"normal",foco:"equilibrado",entradas:"normais"};
  ["pressao","ritmo","foco","entradas"].forEach(k=>{ if(G.instr[k]==null)G.instr[k]=(k==="foco"?"equilibrado":k==="entradas"?"normais":"normal"); });
  return G.instr; }
function setInstr(key,val){ ensureInstr(); if(["pressao","ritmo","foco","entradas"].indexOf(key)>=0)G.instr[key]=val; save(); return G.instr; }
function instrEffect(userEnergy){                                   // multiplicadores conforme as instruções (perspetiva do utilizador)
  const I=G.instr||{}; const e={uAtk:1,uMid:1,uDef:1,oAtk:1,oMid:1,oDef:1,uRate:1,oRate:1,uEnergy:1,uFoul:1,headerBoost:0};
  const tired=1-clamp(userEnergy==null?1:userEnergy,0,1);
  if(I.pressao==="alta"){ e.uAtk*=1.06; e.uMid*=1.05; e.oMid*=0.95; e.oAtk*=(1+0.16*tired); e.uEnergy*=1.35; e.uFoul*=1.3; }
  else if(I.pressao==="baixa"){ e.uAtk*=0.90; e.oAtk*=0.86; e.uDef*=1.06; e.uEnergy*=0.82; }
  if(I.ritmo==="acelerado"){ e.uRate*=1.14; e.oRate*=1.12; e.uEnergy*=1.2; }
  else if(I.ritmo==="cauteloso"){ e.uRate*=0.85; e.oRate*=0.85; e.uEnergy*=0.85; }
  if(I.foco==="alas"){ e.headerBoost=0.06; }
  else if(I.foco==="meio"){ e.uMid*=1.05; }
  if(I.entradas==="duras"){ e.oAtk*=0.95; e.uFoul*=1.6; }
  return e;
}
function instrHeaderBoost(club,lineup,gone){
  if(!isUserClub(club)||!G.instr||G.instr.foco!=="alas")return 0;
  const b=bestFieldByAttr(club,lineup,"cru",gone); const cru=(b&&b.attrs)?b.attrs.cru:10;
  return 0.06*clamp(cru/20,0.3,1);
}
/* ---------- Descontentamento do capitão (Fase 2) ---------- */
function ensureCapMood(){
  const cid=G.roles?G.roles.captain:null;
  if(!G.capMood || G.capMood.pid!==cid)G.capMood={pid:cid,discontent:0,benched:0,subbed:0,protest:false,warned:false,met:false};
  return G.capMood;
}
function captainMoodTick(userRes){                                  // corre após o teu jogo da jornada
  const cid=G.roles?G.roles.captain:null;
  if(cid==null){ if(G.capMood)G.capMood.protest=false; return; }
  const c=me(), cap=c.squad.find(p=>p.id===cid); if(!cap)return;
  const M=ensureCapMood();
  if(new Set(unavailable(c)).has(cid))return;                      // lesionado/suspenso: não é decisão tua
  const started=(G.lineup||[]).indexOf(cid)>=0;
  const subbedOff=!!(userRes && (userRes.events||[]).some(e=>e.type==="sub" && e.outId===cid));
  if(!started){ M.discontent=clamp(M.discontent+14,0,100); M.benched++; }
  else if(subbedOff){ M.discontent=clamp(M.discontent+8,0,100); M.subbed++; }  // a saída é do calor do jogo, mas acumula
  else { M.discontent=clamp(M.discontent-12,0,100); }              // jogou o jogo todo: acalma
  if(M.discontent<25)M.warned=false;
  if(M.discontent<50)M.met=false;
  if(M.discontent<70)M.protest=false;
  captainMoodConsequences(M,cap,c);
}
function captainMoodConsequences(M,cap,c){
  if(M.discontent>=30 && !M.warned){ M.warned=true;
    cap.morale=clamp((cap.morale==null?70:cap.morale)-6,0,100);
    c.squad.filter(p=>p.id!==cap.id&&p.morale!=null).sort((a,b)=>ability(b)-ability(a)).slice(0,5).forEach(p=>p.morale=clamp(p.morale-3,0,100));
    addNews("🧢 O balneário está incomodado com o pouco uso do capitão "+cap.name+" — a moral ressente-se.");
  }
  if(M.discontent>=55 && !M.met && !(G.capMeeting&&G.capMeeting.active)){ M.met=true;
    G.capMeeting={active:true, name:cap.name};
    addNews("📋 A direção convocou-te para falar sobre o capitão "+cap.name+".");
  }
  if(M.discontent>=80 && !M.protest && Math.random()<0.6){ M.protest=true;
    addNews("✊ O balneário ameaça protestar no próximo jogo por causa do capitão "+cap.name+".");
  }
}
function resolveCaptainMeeting(choice){
  const M=ensureCapMood(), c=me();
  if(choice==="prometer"){ M.discontent=clamp(M.discontent-40,0,100); if(G.board)G.board.confidence=clamp(G.board.confidence+3,0,100); addNews("Prometeste à direção dar mais minutos ao capitão. O balneário acalma."); }
  else { M.discontent=clamp(M.discontent-12,0,100); if(G.board)G.board.confidence=clamp(G.board.confidence-4,0,100); G.manager.reputation=(G.manager.reputation||40)+1; addNews("Disseste à direção que o capitão joga quando merecer. Firmeza registada."); }
  M.met=true; G.capMeeting=null; save();
  return {ok:true};
}
/* ---------- Indisciplina (cartões de decisão) ---------- */
function _disPools(){
  if(typeof RELATO!=="undefined" && RELATO && RELATO.disciplina)return RELATO.disciplina;
  return { situacoes:["chegou atrasado ao treino","faltou ao treino sem avisar","foi apanhado num bar na véspera do jogo"],
    justSeria:["explicou que teve uma emergência familiar","disse que o carro se avariou","estava doente e não avisou a tempo"],
    justComica:["jurou que o despertador mudou de fuso sozinho","disse que o cão comeu as chuteiras","garantiu que fazia 'recuperação ativa' no bar"],
    multas:["uma grade de cerveja para o balneário","limpar o balneário depois do jogo","pagar o lanche à equipa uma semana"] };
}
function teamMoraleDelta(c,dv,exceptId){ c.squad.forEach(p=>{ if(exceptId!=null&&p.id===exceptId)return; if(p.morale!=null)p.morale=clamp(p.morale+dv,0,100); }); }
function maybeDiscipline(){
  if(G.discipline&&G.discipline.active)return;
  if((G.meeting&&G.meeting.active)||(G.capMeeting&&G.capMeeting.active)||G.event)return;   // não empilhar cartões
  if(Math.random()>=0.10)return;                                     // ~10% por jornada
  const c=me(); const pool=(c.squad||[]).filter(p=>(p.injuredWeeks||0)<=0); if(!pool.length)return;
  const w=pool.map(x=>{ let v=1; if(hasTrait(x,"criaCaso"))v+=4; if(hasTrait(x,"boaVida"))v+=3; if(hasTrait(x,"temperamental"))v+=1.5; if(hasTrait(x,"profissional"))v=0.15; if(hasTrait(x,"lider")||hasTrait(x,"veterano"))v*=0.5; return v; });
  const p=weightedObj(pool,w)||pick(pool), D=_disPools();     // traços tornam uns mais dados a indisciplina que outros
  const serious=Math.random()<0.4;
  G.discipline={active:true, pid:p.id, name:p.name,
    situation:pick(D.situacoes), justification:serious?pick(D.justSeria):pick(D.justComica), serious, multa:pick(D.multas)};
  addNews("⚠️ Indisciplina: "+p.name+" "+G.discipline.situation+".");
}
function resolveDiscipline(choice){
  const D=G.discipline; if(!D||!D.active)return {ok:false};
  const c=me(), p=c.squad.find(x=>x.id===D.pid);
  const setMor=(pl,dv)=>{ if(!pl)return; pl.morale=clamp((pl.morale==null?70:pl.morale)+dv,0,100); };
  if(choice==="suspender"){
    if(p){ p.banMatches=(p.banMatches||0)+1; c.susp=c.squad.filter(x=>(x.banMatches||0)>0).map(x=>x.id); setMor(p,-12); }
    G.manager.reputation=(G.manager.reputation||40)+1; teamMoraleDelta(c,1,D.pid);
    addNews("🚫 Suspendeste "+D.name+" do próximo jogo por indisciplina.");
  } else if(choice==="multa"){
    setMor(p,-6); teamMoraleDelta(c,1,D.pid);
    addNews("💶 "+D.name+" foi multado: "+D.multa+".");
  } else if(choice==="moral"){
    setMor(p,-3);
    addNews("🗣️ Repreendeste "+D.name+" em privado.");
  } else {   // ilibar
    setMor(p,5);
    if(!D.serious){ teamMoraleDelta(c,-3,D.pid); if(G.board)G.board.confidence=clamp(G.board.confidence-2,0,100); G.manager.reputation=Math.max(0,(G.manager.reputation||40)-1);
      addNews("🤷 Ilibaste "+D.name+" — o balneário achou a desculpa fraca e não gostou."); }
    else { addNews("✅ Ilibaste "+D.name+" — a justificação parecia legítima."); }
  }
  G.discipline=null; save(); return {ok:true};
}
/* ---------- Pedidos de jogador (traço ambicioso) ---------- */
function maybePlayerRequest(){
  if(G.playerReq&&G.playerReq.active)return null;
  if((G.meeting&&G.meeting.active)||(G.capMeeting&&G.capMeeting.active)||G.event||(G.discipline&&G.discipline.active)||(G.press&&G.press.active))return null;
  const c=me(), xi=new Set(G.lineup||[]);
  const cand=(c.squad||[]).filter(p=>hasTrait(p,"ambicioso") && !xi.has(p.id) && (p.injuredWeeks||0)<=0 && !p.onLoanIn);
  if(!cand.length || Math.random()>=0.5)return null;
  const p=pick(cand);
  G.playerReq={active:true, pid:p.id, name:p.name};
  addNews("🚀 "+p.name+" (ambicioso) pediu para falar contigo — quer mais minutos.");
  return "request";
}
function resolvePlayerRequest(choice){
  const R=G.playerReq; if(!R||!R.active)return {ok:false};
  const c=me(), p=c.squad.find(x=>x.id===R.pid);
  const setMor=(pl,dv)=>{ if(pl)pl.morale=clamp((pl.morale==null?70:pl.morale)+dv,0,100); };
  if(choice==="prometer"){ if(p){ p.promise={active:true, until:(G.week||0)+4, apps0:(p.apps||0)}; setMor(p,6); } addNews("Prometeste mais minutos a "+R.name+"."); }
  else if(choice==="elogiar"){ setMor(p,3); addNews("Deste um voto de confiança a "+R.name+"."); }
  else { setMor(p,-6); addNews("Disseste a "+R.name+" que tem de merecer o lugar."); }
  G.playerReq=null; save(); return {ok:true};
}
/* ---------- Conferências de imprensa ---------- */
function nextOppName(){ const d=myDivObj(); if(d.week>=d.fixtures.length)return "o adversário";
  for(const [h,a] of d.fixtures[d.week]){ if(h===G.myId)return d.clubs[a].name; if(a===G.myId)return d.clubs[h].name; } return "o adversário"; }
function _pressPools(){
  if(typeof RELATO!=="undefined" && RELATO && RELATO.imprensa)return RELATO.imprensa;
  return { pre:[{q:"Sentes pressão neste jogo?",opts:[{label:"Assumo a pressão",fx:{board:1}},{label:"Foco no trabalho",fx:{}}]}],
           post:[{q:"O que dizes do resultado?",opts:[{label:"Assumo a responsabilidade",fx:{board:1}},{label:"Seguimos em frente",fx:{}}]}] };
}
function buildPress(when,opts){
  const c=me(), P=_pressPools(); let pool=(when==="pre"?P.pre:P.post)||[]; if(!pool.length)return null;
  if(when==="post" && opts&&opts.result){ const f=pool.filter(t=>!t.cond||t.cond==="any"||t.cond===opts.result); if(f.length)pool=f; }
  const tpl=pick(pool);
  const ctx={ clube:c.name, adv:nextOppName(), rival:(G.rival?G.rival.name:"o rival") };
  let targetPid=null;
  const mentionsPlayer=/\{jogador\}/.test(tpl.q)||(tpl.opts||[]).some(o=>/\{jogador\}/.test(o.label));
  if(mentionsPlayer){ const p=pick(c.squad); ctx.jogador=lastNameOf(p.name); targetPid=p.id; }
  const fill=s=>String(s).replace(/\{(\w+)\}/g,(m,k)=>ctx[k]!=null?ctx[k]:m);
  return { active:true, when, q:fill(tpl.q), opts:(tpl.opts||[]).map(o=>({label:fill(o.label), fx:o.fx||{}})), targetPid };
}
function lastNameOf(n){ return String(n||"").split(" ").slice(-1)[0]; }
function resolvePress(i){
  const pr=G.press; if(!pr||!pr.active)return {ok:false};
  const fx=(pr.opts&&pr.opts[i]&&pr.opts[i].fx)||{};
  const c=me();
  if(fx.morale)teamMoraleDelta(c, fx.morale, null);
  if(fx.pmorale && pr.targetPid!=null){ const p=c.squad.find(x=>x.id===pr.targetPid); if(p)p.morale=clamp((p.morale==null?70:p.morale)+fx.pmorale,0,100); }
  if(fx.board && G.board)G.board.confidence=clamp(G.board.confidence+fx.board,0,100);
  if(fx.rep)G.manager.reputation=clamp((G.manager.reputation||40)+fx.rep,0,100);
  if(fx.rival && G.rival)G.rival.mood=clamp((G.rival.mood||0)+fx.rival,-10,10);
  addNews("🎤 Conferência de imprensa: «"+(pr.opts[i]?pr.opts[i].label:"...")+"»");
  G.press=null; save(); return {ok:true};
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
  else if(Math.random()<0.12+sel.p.attrs.cab/70+cornerBoost(club,lineup,gone)+instrHeaderBoost(club,lineup,gone))gtype="header";
  let pid=sel.p.id;
  if(gtype==="penalty"){const id=roleTakerId(club,lineup,gone,"penalty","pen"); if(id!=null)pid=id;}
  else if(gtype==="freekick"){const id=roleTakerId(club,lineup,gone,"freekick","liv"); if(id!=null)pid=id;}
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
  const hx=clamp((hAtt-21)/8.6,0.16,4.6), ax=clamp((aAtt-23)/8.6,0.13,4.3);
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
  let uRateH=1,uRateA=1,uFoulH=1,uFoulA=1;                          // instruções táticas do utilizador
  const uH=(typeof me==="function"&&home===me()), uA=(typeof me==="function"&&away===me());
  if((uH||uA)&&typeof instrEffect==="function"){ const eE=instrEffect(uH?eHome:eAway); const uS=uH?hS:aS, oS=uH?aS:hS;
    uS.atk*=eE.uAtk;uS.mid*=eE.uMid;uS.def*=eE.uDef; oS.atk*=eE.oAtk;oS.mid*=eE.oMid;oS.def*=eE.oDef;
    if(uH){uRateH=eE.uRate;uRateA=eE.oRate;uFoulH=eE.uFoul;} else {uRateA=eE.uRate;uRateH=eE.oRate;uFoulA=eE.uFoul;} }
  const events=[]; let hg=0,ag=0,hRed=0,aRed=0;
  const yc={}, expelledH=[], expelledA=[];
  function offRate(){ return offRateFrom(hS,aS,hRed,aRed); }
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
    if(g&&g.gtype==="penalty"&&Math.random()<penMissChance(club,g.pid)){ events.push({m,side,type:"penmiss",pid:g.pid}); return false; }
    if(g&&g.gtype==="freekick"&&Math.random()<fkMissChance(club,g.pid)){ events.push({m,side,type:"fkmiss",pid:g.pid}); return false; }
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
    if(Math.random()<rt.hx*uRateH/90){ if(scoreFor("H",m))hg++; }
    if(Math.random()<rt.ax*uRateA/90){ if(scoreFor("A",m))ag++; }
    if(Math.random()<0.0125*uFoulH)disciplinary("H",home,hLine,m);
    if(Math.random()<0.0125*uFoulA)disciplinary("A",away,aLine,m);
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

/* ---------- taxa de golo (partilhada) ---------- */
function offRateFrom(hS,aS,hRed,aRed){
  const RED=0.30;                                            // impacto de cada expulsão (forte)
  const hPen=Math.max(0.35,1-(hRed||0)*RED), aPen=Math.max(0.35,1-(aRed||0)*RED);
  const hAtk=(hS.atk*0.62+hS.mid*0.38)*hPen, aAtk=(aS.atk*0.62+aS.mid*0.38)*aPen;
  const hDef=hS.def*hPen, aDef=aS.def*aPen;
  const SC=12, BASE=1.74;                                    // baseado na DIFERENÇA ataque-defesa → comprime entre divisões
  const hx=BASE+0.15+(hAtk-aDef)/SC;                         // +0.15 vantagem caseira
  const ax=BASE-0.05+(aAtk-hDef)/SC;
  return {hx:clamp(hx,0.30,3.7), ax:clamp(ax,0.25,3.5)};
}
/* ---------- lesões (gravidade variável) ---------- */
function rollInjury(){ const r=Math.random();
  if(r<0.60)return ri(1,2);      // ligeira
  if(r<0.85)return ri(3,5);      // moderada
  if(r<0.97)return ri(6,9);      // grave
  return ri(10,16);              // muito grave
}
function injuryLabel(w){ return w<=2?"ligeira":w<=5?"moderada":w<=9?"grave":"muito grave"; }
/* ---------- suspensões (vermelho + acumulação de amarelos) ---------- */
function applyMatchSuspensions(club, events){
  const mine=(typeof G!=="undefined"&&G&&G.myId!=null&&club===me());
  club.squad.forEach(p=>{ if((p.banMatches||0)>0)p.banMatches--; });               // quem estava suspenso cumpriu 1 jogo
  const newBans=[];
  (events||[]).forEach(e=>{ if(e.type==="red"){ const p=club.squad.find(x=>x.id===e.pid); if(p){ const add=e.second?1:2; p.banMatches=(p.banMatches||0)+add; newBans.push({p,reason:e.second?"2º amarelo":"vermelho direto",games:add}); } } });
  club.squad.forEach(p=>{ const th=Math.floor((p.yc||0)/5), prev=(p.ycBanned||0);     // 5 amarelos → 1 jogo
    if(th>prev){ const add=th-prev; p.banMatches=(p.banMatches||0)+add; p.ycBanned=th; if(!newBans.find(b=>b.p===p))newBans.push({p,reason:(th*5)+" amarelos acumulados",games:add}); } });
  club.susp=club.squad.filter(p=>(p.banMatches||0)>0).map(p=>p.id);
  if(mine)newBans.forEach(b=>addNews("🟥 "+b.p.name+" suspenso "+b.games+" jogo"+(b.games>1?"s":"")+" ("+b.reason+")."));
}
/* ---------- simulação AO VIVO (jogo animado com substituições/tática) ---------- */
function createLive(home,away,hLine,aLine,cfg){
  cfg=cfg||{};
  const sH=ri(1,7), sA=ri(1,7);                                          // compensação de cada parte (1-7 min)
  const st={ home,away, minute:0, stopH:sH, stopA:sA, et:false, maxMin:(cfg.maxMin||90)+sH+sA, hg:0, ag:0, events:[], userSide:cfg.userSide||null,
    talkFactor:1, talkFrom:0, talkUntil:0,
    H:{line:hLine.slice(), form:cfg.hForm||"4-4-2", ment:cfg.hMent||"Equilibrado", subs:0, appeared:new Set(hLine), gone:[], off:new Set(), yc:{}},
    A:{line:aLine.slice(), form:cfg.aForm||"4-4-2", ment:cfg.aMent||"Equilibrado", subs:0, appeared:new Set(aLine), gone:[], off:new Set(), yc:{}},
    fit:{} };
  const initFit=(club,line)=>line.forEach(id=>{const p=club.squad.find(x=>x.id===id); st.fit[id]=(p&&p.energy!=null)?p.energy:100;});
  initFit(home,hLine); initFit(away,aLine);
  return st;
}
function liveMaxSubs(st){ return st.et?6:5; }
function liveReg(st){ return 90+(st.stopH||0)+(st.stopA||0); }           // minuto absoluto do fim do tempo regulamentar
function liveHalftime(st){ return 45+(st.stopH||0); }                    // minuto absoluto do intervalo
function liveDispMin(st,m){                                              // etiqueta do relógio: 45+x na 1ª parte, 90+x na 2ª
  const sH=st.stopH||0, sA=st.stopA||0, reg=90+sH+sA;
  if(m<=45)return ""+m;
  if(m<=45+sH)return "45+"+(m-45);
  if(m<=90+sH)return ""+(m-sH);                                         // 46..90
  if(m<=reg)return "90+"+(m-90-sH);                                     // 90+1..90+sA
  return ""+(m-sH-sA);                                                   // prolongamento: 91..120
}
function liveRate(st){
  const hS=teamStrength(st.home,st.H.line,st.H.form,st.H.ment), aS=teamStrength(st.away,st.A.line,st.A.form,st.A.ment);
  const ff=(S)=>{ if(!S.line.length)return 0.85; let s=0; S.line.forEach(id=>s+=(st.fit[id]==null?100:st.fit[id])); return 0.82+0.18*((s/S.line.length)/100); };
  const fH=ff(st.H), fA=ff(st.A);
  hS.atk*=fH;hS.mid*=fH;hS.def*=fH; aS.atk*=fA;aS.mid*=fA;aS.def*=fA;
  if(st.userSide && st.minute<st.talkUntil && st.talkUntil>st.talkFrom){   // efeito da conversa de balneário, a esvair-se
    const prog=(st.talkUntil-st.minute)/(st.talkUntil-st.talkFrom), mult=1+(st.talkFactor-1)*prog;
    if(st.userSide==="H"){hS.atk*=mult;hS.mid*=mult;hS.def*=mult;} else {aS.atk*=mult;aS.mid*=mult;aS.def*=mult;}
  }
  let irH=1, irA=1;
  if(st.userSide && typeof instrEffect==="function"){                     // instruções táticas do utilizador
    const uH=st.userSide==="H", uFit=(((uH?fH:fA)-0.82)/0.18);              // fração de energia média (0..1)
    const eE=instrEffect(clamp(uFit,0,1)); const uS=uH?hS:aS, oS=uH?aS:hS;
    uS.atk*=eE.uAtk;uS.mid*=eE.uMid;uS.def*=eE.uDef; oS.atk*=eE.oAtk;oS.mid*=eE.oMid;oS.def*=eE.oDef;
    if(uH){irH=eE.uRate;irA=eE.oRate;} else {irA=eE.uRate;irH=eE.oRate;}
  }
  const rt=offRateFrom(hS,aS,st.H.gone.length,st.A.gone.length);
  rt.hx*=irH; rt.ax*=irA;
  return rt;
}
function liveGoal(st,side,m){
  const S=side==="H"?st.H:st.A, club=side==="H"?st.home:st.away, line=S.line;
  const oppS=side==="H"?st.A:st.H, oppClub=side==="H"?st.away:st.home, oppLine=oppS.line;
  const gone=new Set(S.gone), roll=Math.random();
  if(roll<0.02)return {m,side,type:"disallowed"};
  if(roll<0.04){ const oppGone=new Set(oppS.gone); const defs=oppLine.map(id=>oppClub.squad.find(x=>x.id===id)).filter(p=>p&&!oppGone.has(p.id)&&GROUP[p.pos]!=="GK"); const og=defs.length?pick(defs):null;
    return {m,side,type:"goal",scorer:null,gtype:"own",ogPid:og?og.id:null,ogSide:(side==="H"?"A":"H")}; }
  const g=pickGoal(club,line,S.form,gone);
  if(g&&g.gtype==="penalty"&&Math.random()<penMissChance(club,g.pid))return {m,side,type:"penmiss",pid:g.pid};
  if(g&&g.gtype==="freekick"&&Math.random()<fkMissChance(club,g.pid))return {m,side,type:"fkmiss",pid:g.pid};
  return {m,side,type:"goal",scorer:g?g.pid:null,gtype:g?g.gtype:"open"};
}
function liveFoul(st,side,m,out){
  const S=side==="H"?st.H:st.A, club=side==="H"?st.home:st.away, gone=new Set(S.gone);
  const p=pickFoul(club,S.line,gone); if(!p)return;
  if(Math.random()<0.03+p.attrs.agr/900){ out.push({m,side,type:"red",pid:p.id,second:false}); S.gone.push(p.id); S.line=S.line.filter(id=>id!==p.id); }
  else { S.yc[p.id]=(S.yc[p.id]||0)+1; out.push({m,side,type:"yellow",pid:p.id});
    if(S.yc[p.id]>=2){ out.push({m,side,type:"red",pid:p.id,second:true}); S.gone.push(p.id); S.line=S.line.filter(id=>id!==p.id); } }
}
function liveStep(st){
  if(st.minute>=st.maxMin)return [];
  st.minute++; const m=st.minute, out=[];
  const IE=(st.userSide&&typeof instrEffect==="function")?instrEffect(1):null;   // energia/faltas não dependem da fadiga
  const uEn=IE?IE.uEnergy:1, uFoul=IE?IE.uFoul:1;
  const decay=(club,S,side)=>{ const mul=(st.userSide===side)?uEn:1; S.line.forEach(id=>{const p=club.squad.find(x=>x.id===id); if(!p)return; const d=(0.22+Math.max(0,(p.age-30))*0.02)*mul; st.fit[id]=clamp((st.fit[id]==null?100:st.fit[id])-d,0,100);}); };
  decay(st.home,st.H,"H"); decay(st.away,st.A,"A");
  const rt=liveRate(st);
  if(Math.random()<rt.hx/90){ const e=liveGoal(st,"H",m); if(e){out.push(e); if(e.type==="goal")st.hg++;} }
  if(Math.random()<rt.ax/90){ const e=liveGoal(st,"A",m); if(e){out.push(e); if(e.type==="goal")st.ag++;} }
  if(Math.random()<0.0125*(st.userSide==="H"?uFoul:1))liveFoul(st,"H",m,out);
  if(Math.random()<0.0125*(st.userSide==="A"?uFoul:1))liveFoul(st,"A",m,out);
  st.events.push(...out);
  return out;
}
function liveSub(st,side,outId,inId){
  const S=side==="H"?st.H:st.A, club=side==="H"?st.home:st.away;
  if(S.subs>=liveMaxSubs(st))return {ok:false,msg:"Já usaste todas as substituições."};
  const idx=S.line.indexOf(outId); if(idx<0)return {ok:false,msg:"Esse jogador não está em campo."};
  if(S.line.includes(inId))return {ok:false,msg:"Esse jogador já está em campo."};
  if(S.off&&S.off.has(inId))return {ok:false,msg:"Esse jogador já foi substituído e não pode voltar."};
  const pin=club.squad.find(x=>x.id===inId); if(!pin)return {ok:false,msg:""};
  if((pin.injuredWeeks||0)>0||(club.susp||[]).includes(inId))return {ok:false,msg:"Indisponível (lesionado ou suspenso)."};
  S.line[idx]=inId; S.subs++; S.appeared.add(inId); if(S.off)S.off.add(outId);
  st.fit[inId]=(pin.energy!=null?pin.energy:100);
  st.events.push({m:st.minute,side,type:"sub",outId,inId});
  return {ok:true,outId,inId};
}
function liveSetTactic(st,side,form,ment){ const S=side==="H"?st.H:st.A; if(form)S.form=form; if(ment)S.ment=ment; }
function aiMaybeSub(st,side){
  const S=side==="H"?st.H:st.A, club=side==="H"?st.home:st.away;
  if(S.subs>=liveMaxSubs(st))return null;
  const gone=new Set(S.gone);
  const onOut=S.line.map(id=>club.squad.find(x=>x.id===id)).filter(p=>p&&GROUP[p.pos]!=="GK");
  onOut.sort((a,b)=>(st.fit[a.id]==null?100:st.fit[a.id])-(st.fit[b.id]==null?100:st.fit[b.id]));
  const worst=onOut[0]; if(!worst)return null;   // troca o mais cansado em campo (a decisão de quando é feita por janelas)
  const susp=new Set(club.susp||[]);
  const bench=club.squad.filter(p=>!S.line.includes(p.id)&&!gone.has(p.id)&&!(S.off&&S.off.has(p.id))&&(p.injuredWeeks||0)<=0&&!susp.has(p.id)&&GROUP[p.pos]!=="GK");
  const cand=bench.filter(p=>GROUP[p.pos]===GROUP[worst.pos]).sort((a,b)=>ability(b)-ability(a))[0] || bench.sort((a,b)=>ability(b)-ability(a))[0];
  if(!cand)return null;
  const r=liveSub(st,side,worst.id,cand.id); return r.ok?r:null;
}
function liveBench(st,side){ const S=side==="H"?st.H:st.A, club=side==="H"?st.home:st.away, gone=new Set(S.gone), susp=new Set(club.susp||[]);
  return club.squad.filter(p=>!S.line.includes(p.id)&&!gone.has(p.id)&&!(S.off&&S.off.has(p.id))&&(p.injuredWeeks||0)<=0&&!susp.has(p.id)); }
function liveResult(st){ return {hg:st.hg, ag:st.ag, events:st.events, expelledH:st.H.gone.slice(), expelledA:st.A.gone.slice(), maxMinute:st.maxMin, hadET:!!st.et, liveUser:true, userAppeared:[...(st.userSide==="H"?st.H.appeared:st.A.appeared)]}; }
function liveApplyEnergy(st){
  const proc=(club,S,full)=>{ club.squad.forEach(p=>{
    if(S.appeared.has(p.id)){ p.apps=(p.apps||0)+1;
      if(full){ const start=(p.energy==null?100:p.energy), endFit=(st.fit[p.id]!=null?st.fit[p.id]:start);
        const loss=Math.round(Math.max(0,start-endFit)*0.35);        // só uma fração do gás gasto vira desgaste persistente
        p.energy=clamp(start-loss,0,100);
        if((p.injuredWeeks||0)<=0 && endFit<38 && Math.random()<0.02+(38-endFit)/100*0.05){ p.injuredWeeks=rollInjury(); if(club===me())addNews("🤕 "+p.name+" lesionou-se ("+injuryLabel(p.injuredWeeks)+") — fora "+p.injuredWeeks+" jornada"+(p.injuredWeeks>1?"s":"")+"."); } }
    } else if(full){ if((p.injuredWeeks||0)>0){ p.injuredWeeks--; p.energy=clamp((p.energy==null?100:p.energy)+Math.round(recovery(p.age)*0.6),0,100); }
      else { p.energy=clamp((p.energy==null?100:p.energy)+Math.round(recovery(p.age)*2.5),0,100); } }
  }); };
  proc(st.home,st.H,st.userSide==="H"); proc(st.away,st.A,st.userSide==="A");
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
      const hUser=hasUser&&h===G.myId, aUser=hasUser&&a===G.myId;
      const hLine=hUser?availableLineup(home,G.lineup,G.formation):aiPickLineup(home,"4-4-2");   // IA: onze por energia (descansa cansados, exclui lesionados)
      const aLine=aUser?availableLineup(away,G.lineup,G.formation):aiPickLineup(away,"4-4-2");
      const eH=energyFactor(home,hLine), eA=energyFactor(away,aLine);   // energia afeta a força de ambos (IA incluída)
      if(hUser)userLine=hLine; if(aUser)userLine=aLine;
      r=simulate(home,away,hLine,aLine,eH,eA);
      [[home,hLine],[away,aLine]].forEach(([cl,ln])=>ln.forEach(id=>{const p=cl.squad.find(x=>x.id===id); if(p)p.apps=(p.apps||0)+1;})); // presenças (IA e simulados)
      if(!hUser)aiEnergyTick(home,hLine);   // desgaste/recuperação de energia dos clubes CPU
      if(!aUser)aiEnergyTick(away,aLine);
    }
    applyResult(home,away,r.hg,r.ag,r.events);
    applyMatchSuspensions(home,(r.events||[]).filter(e=>e.side==="H"));
    applyMatchSuspensions(away,(r.events||[]).filter(e=>e.side==="A"));
    if(userMatch){ const uc=(h===G.myId)?home:away, isH=(h===G.myId), played=r.userAppeared||userLine;
      recordManagerMatch(isH?r.hg:r.ag, isH?r.ag:r.hg);
      updateRecordsMatch(isH?r.hg:r.ag, isH?r.ag:r.hg, (h===G.myId?away:home).name);
      if(!r.liveUser)processEnergyInjuries(uc,userLine);   // no jogo ao vivo a energia já foi tratada
      trainingInjuryTick(uc,false);                         // lesões de treino podem acontecer em qualquer jornada
      const opp=(h===G.myId?away:home), derby=isDerby(me().gid,opp.gid);
      rateUserMatch(uc,played,r,isH); updateForm(uc,played); updateChem(userLine); trainTick(uc,played); updateMorale(uc,played,isH?r.hg:r.ag,isH?r.ag:r.hg,derby);
      if(G.rival&&opp.gid===G.rival.gid)rivalReact(isH?r.hg:r.ag,isH?r.ag:r.hg);
      const gfU=isH?r.hg:r.ag, gaU=isH?r.ag:r.hg;                              // conquistas & desafio
      let hh=0,aa=0,down2=false; (r.events||[]).filter(e=>e.type==="goal").sort((x,y)=>x.m-y.m).forEach(e=>{ if(e.side==="H")hh++; else aa++; const mine=isH?hh:aa, thrs=isH?aa:hh; if(thrs-mine>=2)down2=true; });
      checkMatchAch(gfU,gaU,derby,down2);
      const cardsU=(r.events||[]).filter(e=>(e.type==="yellow"||e.type==="red")&&e.side===(isH?"H":"A")).length;
      resolveChallenge(gfU,gaU,cardsU); }
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
  if(!G.fired)maybeEvent();                  // eventos de história (reação ao último jogo)
  if(!G.fired)captainMoodTick(preMy);        // descontentamento do capitão (banco/substituições)
  if(!G.fired && !G.press && Math.random()<0.55){                                  // conferência de imprensa pós-jogo
    const res=myDivObj().results[myDivObj().results.length-1]||[]; const my=res.find(x=>x.h===G.myId||x.a===G.myId);
    let r="draw"; if(my){ const isH=my.h===G.myId, gf=isH?my.hg:my.ag, ga=isH?my.ag:my.hg; r=gf>ga?"win":gf<ga?"loss":"draw"; }
    const pr=buildPress("post",{result:r}); if(pr)G.press=pr;
  }
  if(G.grace>0)G.grace--;                    // margem após assumir um clube a meio da época
  G.divisions.forEach((d,di)=>{ if(di!==G.myDiv&&d.week<d.fixtures.length)simRound(d,null,false); });
  G.week=myD.week; advanceMonth();
  transferWindowState();                     // abre/fecha as janelas (set / jan) conforme o mês
  if(myD.week>=myD.fixtures.length){
    G.divisions.forEach((d,di)=>{ if(di!==G.myDiv){ while(d.week<d.fixtures.length)simRound(d,null,false); } });
    endSeason();
  } else { startGap(); }                     // abre o intervalo de dias até ao próximo jogo
  save();
}
/* ---------- Calendário híbrido: dias entre jogos + "Continuar" ---------- */
function ensureDays(){ if(typeof G.dayGap!=="number"){ G.dayGap=ri(6,8); G.dayCursor=G.dayGap; } if(typeof G.dayCursor!=="number")G.dayCursor=G.dayGap; return G; }
function startGap(){ G.dayGap=ri(6,8); G.dayCursor=0; G.pressPreDone=false; if(typeof newChallenge==="function")newChallenge(); }   // dias variáveis até ao próximo jogo (+ desafio da jornada)
function matchDay(){ ensureDays(); const d=myDivObj(); if(d.week>=d.fixtures.length)return true; return G.dayCursor>=G.dayGap; }
function daysToMatch(){ ensureDays(); return Math.max(0,(G.dayGap||0)-(G.dayCursor||0)); }
function dayTick(){                                              // o que pode acontecer num dia entre jogos
  if(G.fired)return null;
  const busy=(G.discipline&&G.discipline.active)||G.event||(G.meeting&&G.meeting.active)||(G.capMeeting&&G.capMeeting.active)||(G.press&&G.press.active)||(G.playerReq&&G.playerReq.active);
  if(!busy && !G.pressPreDone && daysToMatch()<=2 && Math.random()<0.55){ const pr=buildPress("pre"); if(pr){ G.press=pr; G.pressPreDone=true; return "press"; } }   // conferência da véspera
  if(!busy){ const rq=maybePlayerRequest(); if(rq)return rq; }   // pedido de um jogador ambicioso
  if(!busy && Math.random()<0.2){ maybeDiscipline(); if(G.discipline&&G.discipline.active)return "discipline"; }
  const o=transferDayTick(); if(o)return o;                     // proposta recebida (paragem "soft")
  return null;
}
function advanceDay(){                                           // avança 1 dia; devolve o que o fez parar (se algo)
  ensureDays();
  if(matchDay())return {stop:"match",blocking:true};
  G.dayCursor++;
  const reason=dayTick();
  save();
  if(reason)return {stop:reason, blocking:(reason!=="offer")};
  if(matchDay())return {stop:"match",blocking:true};
  return {stop:null,blocking:false};
}
function advanceToNextStop(){ let g=0; while(g++<90){ const r=advanceDay(); if(r.stop)return r.stop; } return "match"; }   // "Continuar": pára em qualquer coisa
function flushToMatch(){ ensureDays(); let g=0; while(g++<90){ const r=advanceDay(); if(r.stop==="match")return null; if(r.stop&&r.blocking)return r.stop; } return null; }  // Jogar/Simular: só pára em decisões
/* ---------- Supertaça + Play-off de subida ---------- */
function poSimTie(aGid,bGid){                 // simula rapidamente uma eliminatória (empate → moeda ponderada = "penáltis")
  const a=clubByGid(aGid), b=clubByGid(bGid); if(!a||!b)return {sa:0,sb:0,w:a?aGid:bGid,pens:false};
  const la=autoPickLineup(a,"4-4-2",a.susp), lb=autoPickLineup(b,"4-4-2",b.susp);
  const r=simulate(a,b,la,lb,1,1);
  let w;
  if(r.hg>r.ag)w=aGid; else if(r.ag>r.hg)w=bGid;
  else { const oa=teamStrength(a,la,"4-4-2","Equilibrado").overall, ob=teamStrength(b,lb,"4-4-2","Equilibrado").overall; w=(Math.random()<oa/(oa+ob))?aGid:bGid; }
  return {sa:r.hg,sb:r.ag,w,pens:(r.hg===r.ag)};
}
function simPlayoffWinner(seeds){                  // seeds[0..3] (1º melhor classificado)
  if(seeds.length<2)return seeds[0]||null;
  if(seeds.length===2)return poSimTie(seeds[0],seeds[1]).w;
  if(seeds.length===3)return poSimTie(seeds[0], poSimTie(seeds[1],seeds[2]).w).w;
  const w1=poSimTie(seeds[0],seeds[3]).w, w2=poSimTie(seeds[1],seeds[2]).w;
  return poSimTie(w1,w2).w;
}
function playoffZoneInfo(d){                        // { N, auto:[...], po:[4 seeds] } para uma divisão que sobe
  const N=d.upSlots; if(N<=0)return null;
  const t=sortedTable(d), a0=Math.max(0,N-1);
  return { N, auto:t.slice(0,a0), po:t.slice(a0, a0+4) };
}
function setupPlayoff(){                            // só cria play-off jogável se o utilizador estiver na zona
  G.playoff=null;
  const d=myDivObj(); if(!d||d.upSlots<=0)return;
  const info=playoffZoneInfo(d); if(!info||info.po.length!==4)return;
  const ms=me().short; if(!info.po.some(c=>c.short===ms))return;
  const s=info.po.map(c=>c.short);                 // s[0]=melhor seed
  G.playoff={ div:G.myDiv, divName:d.name, seeds:s,
    semis:[{a:s[0],b:s[3],w:null,sa:null,sb:null,pens:false},{a:s[1],b:s[2],w:null,sa:null,sb:null,pens:false}],
    final:{a:null,b:null,w:null,sa:null,sb:null,pens:false},
    stage:"semi", winner:null, userIn:true, pending:true };
}
function resolvePlayoffOutcome(){                   // notícia + (se fores tu) troféu/prémio de subida
  const po=G.playoff; if(!po||!po.winner)return;
  const w=clubByShort(po.winner), ms=me().short;
  addNews("⬆️ Play-off de subida ("+(po.divName||"")+"): "+(w?w.name:po.winner)+" conquista o último lugar de subida.");
  if(po.winner===ms){
    G.manager.trophies.push({type:"promo",name:"Subida (play-off) · "+(po.divName||""),season:G.season});
    me().budget=Math.round((me().budget+0.6)*100)/100;
    addNews("⬆️ Ganhaste o play-off e subiste de divisão! Prémio: +€600K.");
  }
}
function superCupSetup(){                           // campeão do topo (Pró-Nacional) vs vencedor da Taça
  G.superCup=null;
  const top=G.divisions.find(d=>d.tier===0); if(!top)return;
  const champ=sortedTable(top)[0], cupW=G.cup?G.cup.winner:null;
  if(!champ||cupW==null)return;
  const champGid=champ.gid, ms=me().gid;
  if(champGid===cupW){                              // dobradinha → Supertaça automática
    const club=clubByGid(cupW);
    addNews("🏆 Supertaça: "+(club?club.name:cupW)+" conquista a Supertaça (dobradinha de campeão e Taça).");
    if(cupW===ms){ G.manager.trophies.push({type:"supercup",name:"Supertaça",season:G.season}); me().budget=Math.round((me().budget+0.5)*100)/100; addNews("🏆 Prémio de Supertaça: +€500K."); unlockAch("supertaca"); }
    return;
  }
  const userIn=(champGid===ms||cupW===ms);
  G.superCup={ champ:champGid, cup:cupW, season:G.season, userIn, pending:true, winner:null, sa:null, sb:null, pens:false };
  if(!userIn)superCupResolve(null);                 // sem o utilizador → simula já
}
function superCupResolve(userResult){
  const sc=G.superCup; if(!sc)return null;
  const a=clubByGid(sc.champ), b=clubByGid(sc.cup), ms=me().gid;
  let sa,sb,w,pens=false;
  if(userResult){ sa=userResult.sa; sb=userResult.sb; w=userResult.w; pens=!!userResult.pens; }
  else { const r=poSimTie(sc.champ,sc.cup); sa=r.sa; sb=r.sb; w=r.w; pens=r.pens; }
  const wc=clubByGid(w);
  addNews("🏆 Supertaça "+sc.season+": "+(a?a.name:sc.champ)+" "+sa+"–"+sb+" "+(b?b.name:sc.cup)+(pens?" (nos penáltis)":"")+" · vencedor: "+(wc?wc.name:w)+".");
  if(w===ms){ G.manager.trophies.push({type:"supercup",name:"Supertaça",season:sc.season}); me().budget=Math.round((me().budget+0.5)*100)/100; addNews("🏆 Prémio de Supertaça: +€500K."); unlockAch("supertaca"); }
  sc.winner=w; sc.sa=sa; sc.sb=sb; sc.pens=pens; sc.pending=false;
  return {w,sa,sb,pens};
}
function endSeason(){
  G.seasonDone=true;
  const d=myDivObj(), table=sortedTable(d);
  const champ=table[0], meRank=table.findIndex(c=>c.id===G.myId)+1;
  addNews("Fim da época "+G.season+" ("+d.name+"). Campeão: "+champ.name+". Ficaste em "+meRank+"º.");
  let prize=Math.max(0.1,(d.clubs.length-meRank+1)*0.08);
  if(meRank===1){ prize+=1.0; G.manager.trophies.push({type:"league",name:"Campeão · "+d.name,season:G.season}); addNews("🏆 Campeão da "+d.name+"! Prémio: +€1M."); unlockAch("campeao"); if((me().L||0)===0)unlockAch("invicto"); }
  else if(d.upSlots>0 && meRank<=d.upSlots){ prize+=0.6; G.manager.trophies.push({type:"promo",name:"Subida · "+d.name,season:G.season}); addNews("⬆️ Subida garantida! Prémio: +€600K."); }
  if(d.upSlots>0 && meRank<=d.upSlots){ const A=ensureAch(); A.promos=(A.promos||0)+1; unlockAch("subida"); if(A.promos>=3)unlockAch("subir3"); }
  me().budget=Math.round((me().budget+prize)*100)/100;
  addNews("Prémio de classificação: +"+money(prize)+".");
  endSeasonAwards(meRank);
  recordCareerSeason(meRank,d);
  resolveRivalDuel(table,meRank);
  evaluateBoard(meRank);
  while(G.cup&&G.cup.active)cupAdvanceRound();
  finalissimaSetup();      // Divisão de Honra: vencedores Série A vs Série B (troféu)
  superCupSetup();         // Supertaça (campeão do Pró vs vencedor da Taça)
}
/* ---------- Finalíssima da Divisão de Honra (vencedor Série A vs Série B) ---------- */
function finalissimaSetup(){
  G.finalissima=null;
  const gs=G.divisions.filter(d=>d.tier===1); if(gs.length<2)return;
  const wa=sortedTable(gs[0])[0], wb=sortedTable(gs[1])[0]; if(!wa||!wb)return;
  const ms=me().gid, userIn=(wa.gid===ms||wb.gid===ms);
  G.finalissima={a:wa.gid, b:wb.gid, season:G.season, userIn, pending:true, winner:null, sa:null, sb:null, pens:false};
  if(!userIn)finalissimaResolve(null);
}
function finalissimaResolve(userResult){
  const f=G.finalissima; if(!f)return null;
  const a=clubByGid(f.a), b=clubByGid(f.b), ms=me().gid;
  let sa,sb,w,pens=false;
  if(userResult){ sa=userResult.sa; sb=userResult.sb; w=userResult.w; pens=!!userResult.pens; }
  else { const r=poSimTie(f.a,f.b); sa=r.sa; sb=r.sb; w=r.w; pens=r.pens; }
  const wc=clubByGid(w);
  addNews("🏆 Finalíssima da Divisão de Honra "+f.season+": "+(a?a.name:f.a)+" "+sa+"–"+sb+" "+(b?b.name:f.b)+(pens?" (penáltis)":"")+" · Campeão: "+(wc?wc.name:w)+".");
  if(w===ms){ G.manager.trophies.push({type:"honra",name:"Campeão da Divisão de Honra",season:f.season}); me().budget=Math.round((me().budget+0.6)*100)/100; addNews("🏆 És Campeão da Divisão de Honra! Prémio: +€600K."); unlockAch("honra"); }
  f.winner=w; f.sa=sa; f.sb=sb; f.pens=pens; f.pending=false;
  return {w,sa,sb,pens};
}
function newSeason(){
  returnLoans();                                     // emprestados regressam antes de acertar a época
  const mineGid=me().gid, oldTier=me().tier;
  const tables=G.divisions.map(d=>sortedTable(d));
  const T=i=>tables[i], top=(i,n)=>T(i).slice(0,n), bottom=(i,n)=>T(i).slice(Math.max(0,T(i).length-n));
  const pro=groupIndexOf(0,""), honA=groupIndexOf(1,"A"), honB=groupIndexOf(1,"B");
  const prim=["A","B","C","D","E","F"].map(s=>groupIndexOf(2,s)), seg=groupIndexOf(3,"");
  const leaving=G.divisions.map(()=>new Set()), incoming=G.divisions.map(()=>[]);
  const move=(club,fromIdx,toIdx)=>{ if(fromIdx<0||toIdx<0||!club)return; leaving[fromIdx].add(club); incoming[toIdx].push(club); };
  // Pró: descem 4 → Honra (2 p/ Série A, 2 p/ Série B)
  if(pro>=0) bottom(pro,4).forEach((c,k)=> move(c,pro,(k%2===0)?honA:honB));
  // Honra: sobem 2 de cada série → Pró
  [honA,honB].forEach(hi=>{ if(hi>=0) top(hi,2).forEach(c=>move(c,hi,pro)); });
  // Honra: descem 3 de cada série → 1ª (uma por cada uma das 6 séries)
  const honDown=[]; [honA,honB].forEach(hi=>{ if(hi>=0) bottom(hi,3).forEach(c=>honDown.push([c,hi])); });
  honDown.forEach(([c,hi],k)=> move(c,hi,prim[k%prim.length]));
  // 1ª: sobe 1 de cada série → Honra (séries A/B/C→A, D/E/F→B); desce 1 de cada série → 2ª
  prim.forEach((pi,k)=>{ if(pi<0)return; move(top(pi,1)[0],pi,(k<3)?honA:honB); move(bottom(pi,1)[0],pi,seg); });
  // 2ª: sobem 6 (o melhor para a Série A, ... o 6º para a Série F)
  if(seg>=0) top(seg,6).forEach((c,k)=> move(c,seg,prim[k%prim.length]));

  G.divisions.forEach((d,i)=>{ d.clubs=d.clubs.filter(c=>!leaving[i].has(c)).concat(incoming[i]); });
  G.divisions.forEach(d=>{
    d.clubs.forEach((c,i)=>{ c.id=i; c.tier=d.tier; c.serie=d.serie; });
    const isMineClub=c=>c.gid===mineGid;
    d.clubs.forEach(c=>{c.P=c.W=c.D=c.L=c.GF=c.GA=c.Pts=0; c.susp=[]; const mine=isMineClub(c);
      c.squad.forEach(p=>{
        const played=p.apps||0;                                    // jogos desta época (antes de zerar)
        p.goals=0;p.apps=0;p.yc=0;p.rc=0;p.banMatches=0;p.ycBanned=0;p.energy=100;p.injuredWeeks=0;p.ratings=[];p.lastRating=null;p.form=0;
        p.contractYears=(p.contractYears||2)-1; if(!mine && p.contractYears<=0)p.contractYears=ri(2,4);  // IA auto-renova; a tua equipa pode expirar
        if(mine){ if(p.age>32) ATTR_KEYS.forEach(k=>{ if(["vel","res","for","rea"].includes(k)&&Math.random()<0.4)p.attrs[k]=clamp(p.attrs[k]-1,1,20); }); } // tua equipa evolui por jornada; aqui só declínio
        else developPlayer(p,played,false);                        // IA: desenvolvimento no fim da época
        p.age++;
      });
      if(mine){ // fim de contrato: jogadores saem livres (mantendo um mínimo de 18)
        let exp=c.squad.filter(p=>p.contractYears<=0).sort((a,b)=>ability(a)-ability(b));
        while(c.squad.length-exp.length<18 && exp.length){ const k=exp.pop(); k.contractYears=ri(2,3); }
        if(exp.length){ ensureFreeAgents(); c.squad=c.squad.filter(p=>exp.indexOf(p)<0);
          exp.forEach(p=>{ p.contractYears=0; p.transferListed=false; p.wage=wageFor(p); G.freeAgents.unshift(p); addNews("📄 "+p.name+" saiu em fim de contrato (agora livre)."); });
          if(G.freeAgents.length>40)G.freeAgents.length=40; }
      }
    });
    d.fixtures=buildFixtures(d.clubs.length); d.results=[]; d.week=0;
  });
  for(let di=0;di<G.divisions.length;di++){ const idx=G.divisions[di].clubs.findIndex(c=>c.gid===mineGid); if(idx>=0){G.myDiv=di;G.myId=idx;break;} }
  G.myTier=myDivObj().tier;
  let myMove = G.myTier<oldTier ? "up" : (G.myTier>oldTier ? "down" : null);
  G.season++; G.week=0; G.seasonDone=false; G.date="Set"; G.windowOpen=false; G.budgetAsked=false;
  G.lineup=autoPickLineup(me(),G.formation);
  G.manager.seasons=(G.manager.seasons||0)+1; setObjectives(); pickRival(true);
  const kitty=budgetForObjective(G.myTier,me().objective);            // verba nova conforme aspiração desta época
  me().budget=Math.round((me().budget+kitty)*100)/100;              // soma à que transitou (incl. prémios)
  G.seasonStartBudget=me().budget; G.budgetGranted=0;
  refreshFreeAgents(); G.wageBase=wageBill(me());
  addNews("Verba de transferências para a época: "+money(me().budget)+" (aspiração: "+me().objective.label+").");
  if(myMove==="up")addNews("Subiste de divisão!");
  else if(myMove==="down")addNews("Desceste de divisão.");
  addNews("Nova época "+G.season+" ("+myDivObj().name+").");
  developYouth(); academyIntake();     // academia: evoluir juniores + nova camada
  transferWindow();
  cupCreate();
  G.playoff=null; G.superCup=null; G.finalissima=null;
  startGap();                                                        // dias até ao 1º jogo da nova época
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
  if(!transferWindowOpen())return {status:"closed", msg:"Janela de transferências fechada. Fora das janelas só podes assinar jogadores sem clube."};
  const meC=me(), from=myClubs()[fromClubId]; if(!from)return {status:"gone"};
  const p=from.squad.find(x=>x.id===playerId); if(!p)return {status:"gone"};
  offerFee=Math.round(offerFee*100)/100;
  if(meC.budget<offerFee)return {status:"nofunds", msg:"Verba insuficiente ("+money(offerFee)+")."};
  if(wageRoom()<(p.wage!=null?p.wage:wageFor(p)))return {status:"nofunds", msg:"Sem espaço salarial para o salário dele ("+money(p.wage!=null?p.wage:wageFor(p))+"/época)."};
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
  if(p.onLoanIn)return {ok:false,msg:"Não podes vender um jogador emprestado."};
  const price=Math.round(p.value*rnd(0.75,1.05)*100)/100;
  meC.budget=Math.round((meC.budget+price)*100)/100;
  meC.squad=meC.squad.filter(x=>x.id!==playerId);
  pick(myClubs().filter(c=>c.id!==G.myId)).squad.push(p);
  addNews("Vendeste "+p.name+" por "+money(price)+".");
  G.lineup=autoPickLineup(meC,G.formation); save();
  return {ok:true,msg:"Vendido: "+p.name+" ("+money(price)+")"};
}
function addNews(t){ if(!G.news)G.news=[]; G.news.unshift({t}); if(G.news.length>40)G.news.pop(); }

/* ---------- persistência (com slots) + export/import + migração ---------- */
const SAVE_PREFIX="gestorafb_";
function slotKey(n){ return SAVE_PREFIX+(n||1); }
function curSlot(){ try{ return parseInt(localStorage.getItem("gestorafb_slot"))||1; }catch(e){ return 1; } }
function setSlot(n){ try{ localStorage.setItem("gestorafb_slot",String(n||1)); }catch(e){} }
function migrate(o){ if(!o)return null; if(o.version===7)return o; return null; /* versões antigas recomeçam; migrações futuras aqui */ }
function migrateLegacy(){ try{ const legacy=localStorage.getItem("gestorafb"); if(legacy && !localStorage.getItem(slotKey(1))){ localStorage.setItem(slotKey(1),legacy); localStorage.removeItem("gestorafb"); } }catch(e){} }
function save(){ if(typeof localStorage==="undefined")return; try{localStorage.setItem(slotKey(curSlot()),JSON.stringify(G));}catch(e){} }
function loadSlot(n){ if(typeof localStorage==="undefined")return false; try{ const s=localStorage.getItem(slotKey(n)); if(s){ const m=migrate(JSON.parse(s)); if(m){G=m; setSlot(n); return true;} } }catch(e){} return false; }
function load(){ if(typeof localStorage==="undefined")return false; migrateLegacy(); return loadSlot(curSlot()); }
function wipeSlot(n){ try{ localStorage.removeItem(slotKey(n)); }catch(e){} if(n===curSlot())G=null; }
function wipe(){ wipeSlot(curSlot()); }
function slotInfo(n){ try{ const s=localStorage.getItem(slotKey(n)); if(!s)return {exists:false}; const o=JSON.parse(s); if(!o||o.version!==7)return {exists:true,broken:true};
  const d=o.divisions&&o.divisions[o.myDiv], club=d&&d.clubs[o.myId];
  return {exists:true, name:(o.manager&&o.manager.name)||"—", club:club?club.name:"—", division:d?d.name:"—", season:o.season||1, fired:!!o.fired}; }catch(e){ return {exists:true,broken:true}; } }
function exportSave(){ try{ return JSON.stringify(G||JSON.parse(localStorage.getItem(slotKey(curSlot()))||"null")); }catch(e){ return ""; } }
function importSave(str,n){ try{ const o=migrate(JSON.parse(str)); if(!o)return {ok:false,msg:"Ficheiro inválido ou de versão diferente."}; const slot=n||curSlot(); localStorage.setItem(slotKey(slot),JSON.stringify(o)); setSlot(slot); G=o; return {ok:true}; }catch(e){ return {ok:false,msg:"Não foi possível ler a gravação."}; } }
function requestPersist(){ try{ if(navigator.storage&&navigator.storage.persist)navigator.storage.persist(); }catch(e){} }

/* ---------- Fase 2: treinador, direção, objetivos ---------- */
function squadRating(club){
  const line=autoPickLineup(club,"4-4-2"), slots=FORMATIONS["4-4-2"].slots; let s=0,n=0;
  line.forEach((id,i)=>{const p=club.squad.find(x=>x.id===id); if(p){s+=effAt(p,slots[i].pos);n++;}});
  return n?s/n:55;
}
function budgetForObjective(divIdx,obj){
  const bases=[1.7,1.15,0.78,0.55];                                   // Pró-Nacional → 2ª Divisão (saldos que permitem comprar)
  const divBase=bases[divIdx]!=null?bases[divIdx]:0.6;
  const amb={title:1.6,promo:1.4,top:1.1,mid:0.9,survive:0.7}[obj&&obj.type]||1; // aspiração mantém as diferenças
  return Math.round(divBase*amb*rnd(0.85,1.15)*100)/100;
}
function objectiveFor(di,rankExp,n){
  const d=G.divisions[di], canUp=d.upSlots>0, canDown=d.downSlots>0;
  if(rankExp<=2) return canUp?{type:"promo",label:"Subir de divisão",target:d.upSlots,baseConf:55}:{type:"title",label:"Lutar pelo título",target:3,baseConf:55};
  if(rankExp<=Math.ceil(n*0.4)) return {type:"top",label:canUp?"Lutar pela subida":"Primeira metade da tabela",target:Math.max(d.upSlots+2,Math.ceil(n/2)),baseConf:58};
  if(canDown&&rankExp>n-4) return {type:"survive",label:"Manter a categoria (evitar descida)",target:n-d.downSlots,baseConf:62};
  return {type:"mid",label:"Meio da tabela, tranquilo",target:n-5,baseConf:60};   // cumprido se não ficar nas últimas 5
}
function setObjectives(){
  G.divisions.forEach((d,di)=>{
    const ranked=d.clubs.map(c=>({c,r:squadRating(c)})).sort((a,b)=>b.r-a.r);
    ranked.forEach((o,idx)=>{ o.c.objective=objectiveFor(di,idx+1,d.clubs.length); });
  });
  // verba de cada clube conforme a sua aspiração (a do utilizador é gerida à parte)
  G.divisions.forEach((d,di)=>d.clubs.forEach(c=>{ if(di===G.myDiv&&c.id===G.myId)return; c.budget=budgetForObjective(d.tier,c.objective); }));
  const o=me().objective; if(!G.board)G.board={}; G.board.confidence=o?o.baseConf:60;
}
/* ---------- rivalidades / dérbis ---------- */
function ensureRivals(){ if(G.rivals)return G.rivals; const r={};   // rivais emparelhados por gid, dentro de cada série
  G.divisions.forEach(d=>{ const cl=d.clubs; for(let i=0;i+1<cl.length;i+=2){ r[cl[i].gid]=cl[i+1].gid; r[cl[i+1].gid]=cl[i].gid; } });
  G.rivals=r; return r;
}
function rivalOf(gid){ return ensureRivals()[gid]||null; }
function isDerby(a,b){ if(a==null||b==null)return false; const r=ensureRivals(); return r[a]===b||r[b]===a; }
function boardAfterUserMatch(){
  if(!G.board)return;
  const d=myDivObj(), res=d.results[d.results.length-1]; if(!res)return;
  const my=res.find(x=>x.h===G.myId||x.a===G.myId); if(!my)return;
  const isHome=my.h===G.myId, gf=isHome?my.hg:my.ag, ga=isHome?my.ag:my.hg;
  let delta=gf>ga?6:gf===ga?1:-5;
  const oppShort=d.clubs[isHome?my.a:my.h].short, derby=isDerby(me().short,oppShort);
  if(derby){ delta += gf>ga?4 : gf<ga?-4 : 1;    // dérbi pesa mais na confiança da direção
    addNews("🔥 Dérbi frente ao "+oppShort+": "+(gf>ga?"que vitória!":gf<ga?"derrota que dói.":"empate no dérbi.")); }
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
  const midSeason = !G.seasonDone && G.divisions[off.divIdx].week < G.divisions[off.divIdx].fixtures.length;
  G.myDiv=off.divIdx; G.myId=ci; G.contract={seasonsLeft:2}; G.fired=false; G.offers=null; G.firedReason=null;
  G.meeting=null; G.shortObjective=null;
  if(midSeason){
    // continua a MESMA época a partir da jornada atual, com o novo clube
    G.board={confidence:(me().objective?me().objective.baseConf:55)};
    G.chem=65; G.lastXI=[]; G.grace=5;
    G.seasonStartBudget=me().budget; G.budgetGranted=0;
    G.lineup=autoPickLineup(me(),G.formation,[...unavailable(me())]);
    const jornada=(myDivObj().week||0)+1;
    addNews("Assumiste o comando do "+me().name+" a meio da época (jornada "+jornada+"). Tens algumas jornadas de margem com a nova direção.");
    save();
  } else {
    addNews("Assumiste o comando do "+me().name+".");
    newSeason();
  }
  careerNewSpell();                          // regista a passagem por este clube na história de carreira
  startGap();
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
  if(p.onLoanIn)return {ok:false,msg:"Não podes dispensar um jogador emprestado."};
  c.squad=c.squad.filter(x=>x.id!==pid);
  addNews("Dispensaste "+p.name+" (sem receita).");
  G.lineup=autoPickLineup(c,G.formation); save();
  return {ok:true,msg:"Dispensado: "+p.name};
}
function toggleTransferList(pid){
  const c=me(); const p=c.squad.find(x=>x.id===pid); if(!p)return false;
  p.transferListed=!p.transferListed;
  addNews(p.transferListed?("Colocaste "+p.name+" na lista de transferências (venda)."):("Retiraste "+p.name+" da lista de vendas."));
  save(); return p.transferListed;
}
function toggleLoanList(pid){
  const c=me(); const p=c.squad.find(x=>x.id===pid); if(!p)return false;
  if(p.onLoanIn){ addNews("Não podes ceder um jogador que está emprestado ao teu clube."); return false; }
  p.loanListed=!p.loanListed;
  addNews(p.loanListed?("Disponibilizaste "+p.name+" para empréstimo."):("Retiraste "+p.name+" da lista de empréstimos."));
  save(); return p.loanListed;
}
function acceptLoanOffer(i,userShare){                    // userShare: 0 = clube que recebe paga tudo · 0.5 = dividido
  const o=G.transferOffers&&G.transferOffers[i]; if(!o||o.type!=="loan")return {ok:false,msg:""};
  const meC=me(); const p=meC.squad.find(x=>x.id===o.playerId); if(!p)return {ok:false,msg:"Jogador já não está no plantel."};
  if(meC.squad.length<=14)return {ok:false,msg:"Plantel demasiado pequeno para emprestar."};
  const borrower=G.divisions[o.divIdx].clubs.find(c=>c.short===o.clubShort); if(!borrower)return {ok:false,msg:""};
  meC.squad=meC.squad.filter(x=>x.id!==o.playerId); borrower.squad.push(p); p.onLoanOut=true;
  if(!G.loans)G.loans=[];
  G.loans.push({pid:p.id, player:p, name:p.name, fromGid:meC.gid, toGid:borrower.gid, toShort:borrower.short, wage:(p.wage!=null?p.wage:wageFor(p)), userShare:(userShare||0), season:G.season});
  addNews("🔁 Emprestaste "+p.name+" ao "+o.clubName+((userShare||0)>0?" (dividem o salário)":" (pagam o salário todo)")+". Regressa no fim da época.");
  G.transferOffers=G.transferOffers.filter((_,j)=>j!==i);
  G.lineup=autoPickLineup(meC,G.formation); save();
  return {ok:true,msg:"Emprestado: "+p.name};
}
function loanInList(){                                     // jogadores de outros clubes disponíveis para receber por empréstimo
  if(!transferWindowOpen())return [];
  let out=[];
  allClubsFlat().forEach(({c,di})=>{ if(isMine(c,di))return; if((c.squad||[]).length<=16)return;
    c.squad.slice().sort((a,b)=>ability(b)-ability(a)).slice(12).forEach(p=>{     // do 13º para baixo (suplentes)
      if((p.injuredWeeks||0)>0||p.onLoanOut||p.onLoanIn)return;
      out.push({gid:c.gid, di, short:c.short, cname:c.name, p});
    });
  });
  out.sort((a,b)=>ability(b.p)-ability(a.p));
  return out.slice(0,60);
}
function loanInPlayer(fromGid,pid,borrowerShare){         // borrowerShare: 1 = pagas tudo · 0.5 = dividido
  if(!transferWindowOpen())return {ok:false,msg:"Janela fechada. Só podes pedir empréstimos nas janelas."};
  const meC=me(); if(meC.squad.length>=30)return {ok:false,msg:"Plantel cheio (máximo 30)."};
  const origin=clubByGid(fromGid); if(!origin)return {ok:false,msg:""};
  const p=origin.squad.find(x=>x.id===pid); if(!p||(p.injuredWeeks||0)>0||p.onLoanOut||p.onLoanIn)return {ok:false,msg:"Jogador indisponível."};
  const wage=(p.wage!=null?p.wage:wageFor(p)), bShare=(borrowerShare==null?1:borrowerShare);
  if(wageRoom() < wage*bShare)return {ok:false,msg:"Sem espaço salarial para este empréstimo."};
  origin.squad=origin.squad.filter(x=>x.id!==pid);
  meC.squad.push(p); p.onLoanIn=true; p.loanFromGid=fromGid; p.transferListed=false; p.loanListed=false;
  if(!G.loans)G.loans=[];
  G.loans.push({pid:p.id, player:p, name:p.name, fromGid:origin.gid, toGid:meC.gid, toShort:meC.short, fromName:origin.name,
    wage, originShare:(1-bShare), borrowerShare:bShare, userShare:(1-bShare), season:G.season});
  addNews("🔁 Contrataste "+p.name+" ("+ability(p)+") por empréstimo do "+origin.name+(bShare<1?" (salário dividido 50/50)":" (pagas o salário)")+". Regressa no fim da época.");
  G.lineup=autoPickLineup(meC,G.formation); save();
  return {ok:true,msg:"Recebido por empréstimo: "+p.name};
}
function transferWindowOpen(){ return G.date==="Set"||G.date==="Jan"; }   // janela 1: até fim de setembro · janela 2: janeiro
function transferWindow(){   // reformulação de plantéis da IA (pré-época) — as propostas chegam depois, graduais
  G.divisions.forEach(()=>{const n=ri(2,5);for(let k=0;k<n;k++)aiTransfer();});
  if(!G.transferOffers)G.transferOffers=[];
}
function makeOneOffer(){
  const meC=me(); if(meC.squad.length<=14)return null;
  const listedSale=meC.squad.filter(p=>p.transferListed&&!p.onLoanIn), listedLoan=meC.squad.filter(p=>p.loanListed&&!p.onLoanIn);
  const best=meC.squad.filter(p=>!p.onLoanIn).sort((a,b)=>ability(b)-ability(a)).slice(0,8);
  const wantLoan = listedLoan.length && (!listedSale.length || Math.random()<0.5);
  if(wantLoan){
    const p=pick(listedLoan); if(!p)return null;
    const cl=pick(allClubsFlat().filter(o=>!isMine(o.c,o.di))); if(!cl)return null;
    return {type:"loan",clubShort:cl.c.short,clubName:cl.c.name,divIdx:cl.di,playerId:p.id,playerName:p.name,wage:(p.wage!=null?p.wage:wageFor(p))};
  }
  const pool=listedSale.length?listedSale.concat(best):best; const p=pick(pool); if(!p)return null;
  const base=transferFee(p);
  const buyers=allClubsFlat().filter(o=>!isMine(o.c,o.di)&&o.c.budget>=base*0.8); if(!buyers.length)return null;
  const cl=pick(buyers);
  return {type:"sale",clubShort:cl.c.short,clubName:cl.c.name,divIdx:cl.di,playerId:p.id,playerName:p.name,
    fee:Math.max(0.02,Math.round(base*rnd(0.8,1.05)*100)/100),maxFee:Math.round(base*rnd(1.1,1.6)*100)/100,round:0};
}
function transferWindowState(){                           // abre/fecha a janela (corre à mudança de mês)
  const open=transferWindowOpen();
  if(open){ if(!G.windowOpen){ G.windowOpen=true; addNews("🔁 Abriu a janela de transferências."); } }
  else if(G.windowOpen){ G.windowOpen=false; if((G.transferOffers||[]).length)addNews("🔁 Fechou a janela — as propostas pendentes caducaram."); G.transferOffers=[]; }
}
function transferDayTick(){                               // atividade de mercado num dia (só com janela aberta)
  if(!transferWindowOpen())return null;
  for(let k=0;k<ri(0,1);k++)aiTransfer();
  if((G.transferOffers||[]).length<7 && Math.random()<0.35){ const o=makeOneOffer();
    if(o){ G.transferOffers.push(o); addNews("📩 "+o.clubName+" fez uma proposta"+(o.type==="loan"?" de empréstimo":"")+" por "+o.playerName+"."); return "offer"; } }
  return null;
}
function transferTick(){ transferWindowState(); transferDayTick(); }   // compat: estado + 1 tick diário
function returnLoans(){                                   // no fim da época, os emprestados regressam ao clube de origem
  (G.loans||[]).forEach(L=>{ const b=clubByGid(L.toGid), o=clubByGid(L.fromGid), p=L.player; if(!p)return;
    if(b)b.squad=b.squad.filter(x=>x.id!==p.id); p.onLoanOut=false; p.onLoanIn=false; p.loanFromGid=null;
    if(o&&o.squad.indexOf(p)<0)o.squad.push(p);
    if(o&&G.myId!=null&&o===me())addNews("🔁 "+p.name+" regressou do empréstimo (era teu).");            // cedeste-o: volta ao teu plantel
    else if(b&&G.myId!=null&&b===me())addNews("🔁 "+p.name+" terminou o empréstimo e regressou ao "+(o?o.name:"clube de origem")+".");  // recebeste-o: sai
  });
  G.loans=[];
}
function acceptOffer(i){
  const o=G.transferOffers&&G.transferOffers[i]; if(!o)return {ok:false,msg:""};
  if(o.type==="loan")return {ok:false,msg:"Usa a opção de empréstimo (aceitar com salário)."};
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
/* ---------- Academia de jovens ---------- */
function ensureAcademy(){ if(!G.academy)G.academy={level:1,focus:"Equilibrado",youth:[]}; return G.academy; }
function makeYouth(level){
  const pos=(Math.random()<0.10)?"GR":pick(POSITIONS.filter(p=>p!=="GR"));
  const p=makePlayer(pos, clamp(level+ri(-1,1),4,12));
  p.age=ri(15,18);
  const cur=roleRatingAttrs(p.attrs,p.pos);
  p.potential=clamp(cur+ri(6,13)+(level-1)*3, cur, 99);
  p.youth=true; p.onLoan=false; p.contractYears=ri(2,4);
  p.value=Math.max(0.02,Math.round(Math.pow(p.potential/70,3)*0.10*100)/100);
  return p;
}
function academyCost(level){ return [0.12,0.20,0.34,0.55][level-1]||null; }
function youthStars(p){ return clamp(Math.round((p.potential||40)/20),1,5); }
function upgradeAcademy(){
  const A=ensureAcademy();
  if(A.level>=5)return {ok:false,msg:"A academia já está no nível máximo."};
  const cost=academyCost(A.level);
  if(me().budget<cost)return {ok:false,msg:"Verba insuficiente ("+money(cost)+")."};
  me().budget=Math.round((me().budget-cost)*100)/100; A.level++;
  addNews("Investiste na academia — passou a nível "+A.level+".");
  save(); return {ok:true,msg:"Academia melhorada para nível "+A.level+" ("+money(cost)+")."};
}
function academyIntake(){ const A=ensureAcademy();
  const n=Math.max(1,Math.round(1+A.level*0.7));
  for(let k=0;k<n;k++)A.youth.push(makeYouth(A.level));
  A.youth.sort((a,b)=>b.potential-a.potential);
  while(A.youth.length>16)A.youth.pop();
  addNews("🎓 Dia da formação: "+n+" jovens entraram na academia.");
}
function developYouth(){ const A=ensureAcademy(); const kept=[];
  A.youth.forEach(p=>{
    const times=A.level+(p.onLoan?2:0);
    for(let t=0;t<times;t++)developPlayer(p, p.onLoan?20:8, true, A.focus);
    if(p.onLoan){ addNews("Empréstimo: "+p.name+" regressou mais evoluído."); p.onLoan=false; }
    p.age++;
    if(p.age>=20){ addNews("Formação: "+p.name+" deixou a academia (idade)."); } else kept.push(p);
  });
  A.youth=kept;
}
function promoteYouth(id){ const A=ensureAcademy(); const i=A.youth.findIndex(p=>p.id===id); if(i<0)return {ok:false,msg:""};
  if(me().squad.length>=32)return {ok:false,msg:"Plantel cheio (32) — dispensa alguém primeiro."};
  const p=A.youth.splice(i,1)[0]; p.youth=false; p.onLoan=false; me().squad.push(p);
  addNews("Promoveste "+p.name+" da academia ao plantel."); unlockAch("formador"); save();
  return {ok:true,msg:p.name+" promovido ao plantel."};
}
function releaseYouth(id){ const A=ensureAcademy(); const i=A.youth.findIndex(p=>p.id===id); if(i<0)return; const p=A.youth.splice(i,1)[0]; addNews("Dispensaste "+p.name+" da academia."); save(); }
function loanYouth(id){ const A=ensureAcademy(); const p=A.youth.find(x=>x.id===id); if(!p)return {ok:false}; p.onLoan=!p.onLoan; save(); return {ok:true,loaned:p.onLoan}; }
function setAcademyFocus(f){ ensureAcademy().focus=f; save(); }
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
      if(Math.random()<risk){ p.injuredWeeks=rollInjury(); addNews("🤕 "+p.name+" lesionou-se ("+injuryLabel(p.injuredWeeks)+") — fora "+p.injuredWeeks+" jornada"+(p.injuredWeeks>1?"s":"")+"."); }
    } else { p.energy=clamp(p.energy+Math.round(recovery(p.age)*2.5),0,100); } // suplente: recupera muito (menos com idade)
  });
}
function trainingInjuryTick(club,silent){    // lesões esporádicas nos treinos (acontecem mesmo com energia alta)
  (club.squad||[]).forEach(p=>{ if((p.injuredWeeks||0)>0)return;
    if(Math.random()<0.006){ p.injuredWeeks=rollInjury(); if(!silent)addNews("🤕 "+p.name+" lesionou-se no treino ("+injuryLabel(p.injuredWeeks)+") — fora "+p.injuredWeeks+" jornada"+(p.injuredWeeks>1?"s":"")+"."); } });
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
  // Compara SEMPRE o onze inicial (as substituições feitas durante o jogo não contam para a química).
  // Até 3 mudanças no onze de uma jornada para a outra não afetam a química; só a partir de 4 há decréscimo.
  if(G.chem==null)G.chem=65;
  const prev=G.lastXI||[], cur=(startXI||[]).filter(id=>id!=null);
  if(prev.length){
    let changes=0; cur.forEach(id=>{ if(prev.indexOf(id)<0)changes++; });
    if(changes===0)G.chem=clamp(G.chem+5,30,100);            // onze estável → sobe
    else if(changes<=3)G.chem=clamp(G.chem,30,100);          // até 3 mudanças → sem efeito
    else G.chem=clamp(G.chem-(changes-3)*3,30,100);          // 4+ mudanças → decréscimo
  }
  G.lastXI=cur;
}
/* ---------- treino & desenvolvimento (fim de época) ---------- */
const FOCUS_ATTRS={ "Ataque":["rem","cab","dri","cri","pen","liv"], "Defesa":["des","mar","pos","cab","agr"], "Físico":["vel","res","for","rea"], "Equilibrado":null };
function developPlayer(p,played,isMine,focusOverride){
  const focus=focusOverride||((isMine&&G.trainFocus)?G.trainFocus:"Equilibrado");
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
/* evolução a CADA jornada (equipa do utilizador): quem JOGA evolui mais; mais novos evoluem mais */
function trainTick(club,playedIds){
  if(!club||!club.squad)return;
  const played=new Set(playedIds||[]);
  club.squad.forEach(p=>{
    if(roleRatingAttrs(p.attrs,p.pos)>=p.potential)return;                 // já atingiu o potencial
    const ageF=p.age<=19?1.5:p.age<=23?1.15:p.age<=27?0.7:p.age<=31?0.4:0.15; // mais novo => maior incremento
    const playF=played.has(p.id)?1.35:0.35;                                // JOGAR (mesmo poucos minutos) evolui mais; no banco evolui pouco
    if(Math.random()<0.11*ageF*playF){
      const focus=p.trainFocus||"Equilibrado", foc=FOCUS_ATTRS[focus]||null, prof=PROFILES[p.pos]||{};
      let pool=ATTR_KEYS.filter(k=>prof[k]&&(!foc||foc.includes(k))); if(!pool.length)pool=ATTR_KEYS.filter(k=>prof[k]);
      if(pool.length){ const k=pick(pool); if(p.attrs[k]<20)p.attrs[k]=clamp(p.attrs[k]+1,1,20); }
    }
  });
}
/* ---------- moral dos jogadores (equipa do utilizador) ---------- */
function updateMorale(club,playedIds,gf,ga,derby){
  const played=new Set(playedIds||[]);
  const teamDelta=(gf>ga?2:gf<ga?-2:0)*(derby?2:1);   // dérbi mexe mais com a moral
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
    if(d<0){ let m=1; if(hasTrait(p,"temperamental"))m*=1.5; if(hasTrait(p,"profissional")||hasTrait(p,"veterano")||hasTrait(p,"lider"))m*=0.6; d*=m; }  // traços moldam as quedas de moral
    p.morale=clamp(Math.round(p.morale+d),0,100);
  });
  club.squad.forEach(p=>{                                                            // jogadores muito insatisfeitos agem
    if(p.morale<=10 && !p.transferListed){ p.transferListed=true; p.wantsTalk=false; addNews(p.name+" pediu para ser colocado na lista de transferências (moral muito baixa)."); }
    else if(p.morale<=22 && !p.wantsTalk && !p.transferListed){ p.wantsTalk=true; addNews(p.name+" pediu para reunir contigo — está descontente."); }
  });
}
/* ---------- conversa de balneário ---------- */
const TALK_MSG={ bom:["A equipa entrou eletrizada!","Reagiram bem às tuas palavras.","Sentiu-se a equipa mais ligada.","Deste-lhes a faísca certa."],
  neutro:["A equipa ouviu, sem grande reação.","Palavras recebidas com naturalidade.","Nada de especial no balneário."],
  mau:["Alguns jogadores não gostaram do tom.","O balneário ficou tenso.","Não caíram bem as tuas palavras.","Sentiu-se algum desconforto."] };
function talkResolve(tone, ctx){
  ctx=ctx||{}; const fav=ctx.fav||0, mor=(ctx.morale==null?70:ctx.morale), phase=ctx.phase||"pre", diff=ctx.diff||0;
  let s=0;
  if(tone==="Motivador") s=0.35+(fav<=0?0.3:0)+(mor<55?0.2:0)+((phase==="ht"&&diff<=0)?0.2:0);
  else if(tone==="Calmo") s=0.1+(fav>=1?0.4:0)+(mor<50?0.35:0)+((phase==="ht"&&diff>0)?0.4:0)-((phase==="ht"&&diff<0)?0.2:0);
  else if(tone==="Exigente") s=(mor>=55?0.3:-0.6)+(fav<=0?0.2:0)+((phase==="ht"&&diff<0)?0.4:0)-(fav>=2?0.3:0);
  else if(tone==="Confiante") s=0.05+(fav>=1?0.45:0)+(mor>=65?0.3:0)-(fav<=-1?0.4:0)-((phase==="ht"&&diff>=2)?0.4:0);
  s+=rnd(-0.25,0.25);
  if(s>=0.45)return {result:"bom", moraleDelta:6, boost:0.06, msg:pick(TALK_MSG.bom)};
  if(s<=-0.35)return {result:"mau", moraleDelta:-6, boost:-0.05, msg:pick(TALK_MSG.mau)};
  return {result:"neutro", moraleDelta:1, boost:0, msg:pick(TALK_MSG.neutro)};
}
function applyTeamTalkMorale(delta){ me().squad.forEach(p=>{ p.morale=clamp((p.morale==null?70:p.morale)+delta,0,100); }); }
function liveApplyTalk(st, boostDelta, dur){ st.talkFactor=1+(boostDelta||0); st.talkFrom=st.minute; st.talkUntil=st.minute+(dur||35); }
function favTier(myOverall, oppOverall){ const d=(myOverall||60)-(oppOverall||60); return d>=12?2:d>=5?1:d<=-12?-2:d<=-5?-1:0; }
function clubRecentForm(club, n){ // últimos n resultados do clube na sua divisão
  let di=-1; for(let i=0;i<G.divisions.length;i++){ if(G.divisions[i].clubs.some(x=>x===club)){di=i;break;} }
  if(di<0)return []; const d=G.divisions[di], out=[];
  for(let w=d.results.length-1; w>=0 && out.length<(n||5); w--){ const m=(d.results[w]||[]).find(x=>d.clubs[x.h]===club||d.clubs[x.a]===club); if(!m)continue;
    const isH=d.clubs[m.h]===club, gf=isH?m.hg:m.ag, ga=isH?m.ag:m.hg; out.push(gf>ga?"V":gf<ga?"D":"E"); }
  return out;
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
  if(G.fired||(G.grace>0)||(G.meeting&&G.meeting.active)||(G.shortObjective&&G.shortObjective.active))return;
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
/* ---------- salários, teto salarial e mercado de livres ---------- */
function wageBill(club){ let s=(club.squad||[]).reduce((a,p)=>a+(p.onLoanIn?0:(p.wage!=null?p.wage:wageFor(p))),0);  // emprestados-in contam pela fatia do empréstimo (abaixo)
  if(typeof G!=="undefined"&&G&&G.loans&&club&&club.gid!=null)G.loans.forEach(L=>{               // empréstimos: cada clube paga a sua fatia
    const oShare=(L.originShare!=null?L.originShare:(L.userShare||0)), bShare=(L.borrowerShare!=null?L.borrowerShare:(1-(L.userShare||0)));
    if(L.fromGid===club.gid)s+=oShare*(L.wage||0);      // parte que a origem continua a pagar (cedeste)
    if(L.toGid===club.gid)  s+=bShare*(L.wage||0);      // parte que o clube que recebe paga (recebeste)
  });
  return Math.round(s*100)/100; }
function wageHead(){ const obj=me().objective||{};
  return {title:1.75,promo:1.60,top:1.48,mid:1.38,survive:1.25}[obj.type]||1.42;  // folga sobre a massa de arranque, conforme aspiração
}
function ensureWageBase(){ if(G.wageBase==null||G.wageBase<=0)G.wageBase=wageBill(me()); return G.wageBase; }  // massa salarial no início da época (referência fixa)
function wageCapFor(){ return Math.round(ensureWageBase()*wageHead()*100)/100; }
function ensureWageCap(){ return wageCapFor(); }
function wageRoom(){ return Math.round((wageCapFor()-wageBill(me()))*100)/100; }
function ensureFreeAgents(){ if(!G.freeAgents)G.freeAgents=[]; return G.freeAgents; }
function makeFreeAgent(level){ const p=makePlayer(pick(POSITIONS.filter(x=>x!=="GR"||Math.random()<0.12)), level); if(p.age<22)p.age=ri(22,30); p.contractYears=0; p.transferListed=false; p.onLoan=false; return p; }
function seedFreeAgents(n,level){ const A=ensureFreeAgents(); for(let k=0;k<n;k++)A.push(makeFreeAgent(clamp(level+ri(-2,2),4,15))); }
function signFreeAgent(id){ const A=ensureFreeAgents(); const i=A.findIndex(p=>p.id===id); if(i<0)return {ok:false,msg:""};
  const p=A[i]; if(me().squad.length>=32)return {ok:false,msg:"Plantel cheio (32)."};
  if(wageRoom()<p.wage)return {ok:false,msg:"Sem espaço salarial ("+money(p.wage)+"/época)."};
  A.splice(i,1); p.contractYears=ri(2,4); p.free=false; me().squad.push(p);
  addNews("Assinaste "+p.name+" a custo zero (salário "+money(p.wage)+").");
  G.lineup=autoPickLineup(me(),G.formation); save(); return {ok:true,msg:"Contratado (livre): "+p.name};
}
function refreshFreeAgents(){ const A=ensureFreeAgents();
  for(let i=A.length-1;i>=0;i--){ A[i].age++; if(A[i].age>35||Math.random()<0.2)A.splice(i,1); }
  const level=clamp(Math.round((myDivObj().clubs.reduce((s,c)=>s+c.strength,0)/myDivObj().clubs.length)/5),4,15);
  seedFreeAgents(ri(2,4), level);
  if(A.length>40)A.length=40;
}
function renewContract(pid){
  const c=me(), p=c.squad.find(x=>x.id===pid); if(!p)return {ok:false,msg:""};
  const cost=Math.max(0.02,Math.round(p.value*0.10*100)/100);       // prémio de assinatura
  const newWage=Math.max(p.wage||0, wageFor(p)), delta=Math.round((newWage-(p.wage||0))*100)/100;
  if(delta>0 && wageRoom()<delta)return {ok:false,msg:"Sem espaço salarial para o novo salário ("+money(newWage)+"/época)."};
  if(c.budget<cost)return {ok:false,msg:"Verba insuficiente ("+money(cost)+")"};
  c.budget=Math.round((c.budget-cost)*100)/100; p.contractYears=clamp((p.contractYears||1)+2,2,5); p.wage=newWage;
  addNews("Renovaste com "+p.name+" ("+p.contractYears+" anos · salário "+money(newWage)+" · custo "+money(cost)+").");
  save(); return {ok:true,msg:"Renovado: "+p.name};
}
/* ---------- Taça (eliminação direta, todas as equipas) ---------- */
function allClubShorts(){ const a=[]; G.divisions.forEach(d=>d.clubs.forEach(c=>a.push(c.short))); return a; }
function clubByShort(sh){ for(const d of G.divisions){ const c=d.clubs.find(x=>x.short===sh); if(c)return c; } return null; }
function divOfShort(sh){ for(let i=0;i<G.divisions.length;i++){ if(G.divisions[i].clubs.some(x=>x.short===sh))return i; } return -1; }
function cupRoundName(){ const t=G.cup?G.cup.remaining.length:0; if(t<=2)return "Final"; if(t<=4)return "Meias-finais"; if(t<=8)return "Quartos-de-final"; if(t<=16)return "Oitavos-de-final"; return (G.cup.round+1)+"ª eliminatória"; }
function cupCreate(){
  const rem=shuffleArr(allClubGids());
  G.cup={active:true,round:0,remaining:rem,ties:[],history:[],winner:null,userAlive:true,schedule:[]};
  cupDraw();
  let n=rem.length, rounds=0; while(n>1){ n=Math.ceil(n/2); rounds++; }
  const L=myDivObj().fixtures.length;
  for(let i=0;i<rounds;i++) G.cup.schedule.push(Math.max(1,Math.round((i+1)/(rounds+1)*L)));
}
function cupRoundDue(){ return (G.cup&&G.cup.schedule&&G.cup.round<G.cup.schedule.length)?G.cup.schedule[G.cup.round]:999; }
function cupAvailable(){ return !!(G.cup&&G.cup.active&&myDivObj().week>=cupRoundDue()); }
function cupDraw(){ const rem=G.cup.remaining.slice(), ties=[]; while(rem.length>=2){ ties.push({a:rem.shift(),b:rem.shift(),sa:null,sb:null,w:null}); } if(rem.length===1)ties.push({a:rem.shift(),b:null,sa:null,sb:null,w:null}); G.cup.ties=ties; }
function cupUserTie(){ if(!G.cup||!G.cup.active)return null; const ms=me().gid; return G.cup.ties.find(t=>t.a===ms||t.b===ms)||null; }
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
  const ms=me().gid, involvesUser=(t.a===ms||t.b===ms);
  const ca=clubByGid(t.a), cb=clubByGid(t.b);
  const aLine=(involvesUser&&t.a===ms)?availableLineup(ca,G.lineup,G.formation):aiPickLineup(ca,"4-4-2");
  const bLine=(involvesUser&&t.b===ms)?availableLineup(cb,G.lineup,G.formation):aiPickLineup(cb,"4-4-2");
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
  const ms=me().gid;
  const userTie=G.cup.ties.find(t=>t.a===ms||t.b===ms)||null;
  G.cup.ties.forEach(t=>{ if(t===userTie&&preUser){ t.sa=preUser.sa;t.sb=preUser.sb;t.w=preUser.w;t.pens=!!preUser.pens;t.et=!!preUser.et; } else cupResolveTie(t); });
  if(userTie && userTie.b){ const ug=(userTie.a===ms)?userTie.sa:userTie.sb, ua=(userTie.a===ms)?userTie.sb:userTie.sa; recordManagerMatch(ug,ua); }
  if(userTie && userTie.b && userTie.w!==ms)G.cup.userAlive=false;
  if(userTie && userTie.b && userTie.w===ms){                          // prémio pequeno por vencer clube superior/muito mais forte
    const oppGid=(userTie.a===ms)?userTie.b:userTie.a, opp=clubByGid(oppGid);
    if(opp){ const higher=(opp.tier!=null && opp.tier<me().tier);       // escalão superior = tier menor
      const stronger=squadRating(opp)-squadRating(me())>=8;
      if(higher||stronger){ const bonus=higher?0.25:0.15; me().budget=Math.round((me().budget+bonus)*100)/100;
        addNews("💪 Surpresa na Taça! Eliminaste o "+opp.name+" ("+(higher?"divisão superior":"muito mais forte")+"). Prémio: +"+money(bonus)+"."); } }
  }
  G.cup.history.push({name:cupRoundName(), ties:G.cup.ties.map(t=>({a:t.a,b:t.b,sa:t.sa,sb:t.sb,w:t.w,pens:!!t.pens}))});
  const winners=G.cup.ties.map(t=>t.w);
  G.cup.remaining=winners; G.cup.round++;
  if(winners.length===1){ G.cup.active=false; G.cup.winner=winners[0]; const wc=clubByGid(winners[0]); addNews("🏆 Taça: "+(wc?wc.name:winners[0])+" é o vencedor!"); if(winners[0]===me().gid){ G.manager.trophies.push({type:"cup",name:"Vencedor da Taça",season:G.season}); me().budget=Math.round((me().budget+1.2)*100)/100; addNews("🏆 Prémio de vencedor da Taça: +€1.2M."); unlockAch("taca"); } }
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
    let amount=Math.round((G.seasonStartBudget||0.6)*(0.06+conf/700)*100)/100;   // reforço proporcional ao saldo inicial
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
function recordManagerMatch(gf,ga){ const s=G.manager&&G.manager.stats; if(!s)return; s.P++; s.GF+=gf; s.GA+=ga; if(gf>ga)s.W++; else if(gf<ga)s.L++; else s.D++;
  if(typeof onManagerMatch==="function"){ try{ onManagerMatch(gf,ga); }catch(e){} } }   // hook opcional (a UI usa-o para analytics de jogos jogados)
/* ---------- recordes de carreira + prémios de fim de época ---------- */
function ensureRecords(){ if(!G.records)G.records={}; if(!G.awards)G.awards=[]; if(G.streakU==null)G.streakU=0; if(G.streakW==null)G.streakW=0; return G.records; }
/* ---------- História de carreira do treinador ---------- */
function ensureCareer(){
  if(!G.career)G.career={spells:[],seasons:[]};
  if((G.career.spells||[]).length===0 && G.manager){
    try{ const c=me(); if(c)G.career.spells.push({gid:c.gid, name:c.name, tier:c.tier, tierName:myDivObj().name, from:G.season||1, to:null}); }catch(e){}
  }
  return G.career;
}
function careerNewSpell(){                                     // ao mudar de clube: fecha a passagem anterior e abre nova
  const C=ensureCareer(); const c=me(); if(!c)return;
  const open=C.spells.find(s=>s.to==null);
  if(open){ if(open.gid===c.gid){ open.name=c.name; open.tierName=myDivObj().name; return; } open.to=G.season; }
  C.spells.push({gid:c.gid, name:c.name, tier:c.tier, tierName:myDivObj().name, from:G.season||1, to:null});
}
function recordCareerSeason(meRank,d){                        // guarda o resumo da época terminada
  const C=ensureCareer(), c=me();
  const e={ season:G.season, name:c.name, gid:c.gid, div:d.name, tier:c.tier, pos:meRank, of:d.clubs.length,
    W:c.W||0, D:c.D||0, L:c.L||0, GF:c.GF||0, GA:c.GA||0, pts:c.Pts||0 };
  const i=C.seasons.findIndex(s=>s.season===e.season);
  if(i>=0)C.seasons[i]=e; else C.seasons.push(e);
}
/* ---------- Conquistas & desafios ---------- */
const ACHS=[
  {k:"estreia",   ic:"🎬", t:"Primeira vitória", d:"Vence o teu primeiro jogo."},
  {k:"campeao",   ic:"🥇", t:"Campeão", d:"Vence um campeonato."},
  {k:"invicto",   ic:"🛡️", t:"Campeão invicto", d:"Vence o campeonato sem perder um jogo."},
  {k:"subida",    ic:"⬆️", t:"Subida", d:"Sobe de divisão."},
  {k:"subir3",    ic:"🚀", t:"Escalada", d:"Consegue 3 subidas na carreira."},
  {k:"taca",      ic:"🏆", t:"Rei da Taça", d:"Vence a Taça."},
  {k:"supertaca", ic:"🏅", t:"Supertaça", d:"Vence a Supertaça."},
  {k:"honra",     ic:"🏆", t:"Finalíssima", d:"Vence a Finalíssima da Divisão de Honra."},
  {k:"derbi",     ic:"🔥", t:"Senhor do dérbi", d:"Vence um dérbi."},
  {k:"goleada",   ic:"💥", t:"Goleada", d:"Vence marcando 5 golos ou mais."},
  {k:"remontada", ic:"🔄", t:"Remontada", d:"Vence depois de estares a perder por 2 golos."},
  {k:"rival",     ic:"🏁", t:"Acima do rival", d:"Termina a época à frente do rival."},
  {k:"formador",  ic:"🎓", t:"Formador", d:"Promove um jovem da academia ao plantel."},
  {k:"vit10",     ic:"⭐", t:"10 vitórias", d:"Chega às 10 vitórias na carreira."},
  {k:"vit50",     ic:"🌟", t:"50 vitórias", d:"Chega às 50 vitórias na carreira."},
  {k:"vit100",    ic:"💫", t:"100 vitórias", d:"Chega às 100 vitórias na carreira."}
];
function ensureAch(){ if(!G.ach)G.ach={un:{},nn:[],promos:0}; if(!G.ach.un)G.ach.un={}; if(!G.ach.nn)G.ach.nn=[]; if(G.ach.promos==null)G.ach.promos=0; return G.ach; }
function achDef(k){ return ACHS.find(a=>a.k===k); }
function unlockAch(k){ const A=ensureAch(); if(A.un[k])return false; const def=achDef(k); if(!def)return false;
  A.un[k]=G.season||1; A.nn.push(k); addNews("🏅 Conquista desbloqueada: "+def.t+" — "+def.d); return true; }
function checkCareerAch(){ const w=(G.manager&&G.manager.stats&&G.manager.stats.W)||0; if(w>=10)unlockAch("vit10"); if(w>=50)unlockAch("vit50"); if(w>=100)unlockAch("vit100"); }
function checkMatchAch(gf,ga,derby,wasDown2){
  if(gf>ga){ unlockAch("estreia"); if(gf>=5)unlockAch("goleada"); if(derby)unlockAch("derbi"); if(wasDown2)unlockAch("remontada"); }
  checkCareerAch();
}
/* desafios de jornada */
const CHALS=[
  {k:"cs",  t:"Vencer sem sofrer golos",  chk:(gf,ga,cards)=>gf>ga&&ga===0},
  {k:"m2",  t:"Vencer por 2 ou mais golos", chk:(gf,ga,cards)=>gf-ga>=2},
  {k:"g3",  t:"Marcar 3 golos ou mais",   chk:(gf,ga,cards)=>gf>=3},
  {k:"fair",t:"Jogo limpo (sem cartões)", chk:(gf,ga,cards)=>cards===0}
];
function newChallenge(){ const c=pick(CHALS); G.challenge={key:c.k, label:c.t}; }
function resolveChallenge(gf,ga,cards){
  const ch=G.challenge; if(!ch)return; const def=CHALS.find(x=>x.k===ch.key);
  if(def&&def.chk(gf,ga,cards)){ G.manager.reputation=clamp((G.manager.reputation||40)+2,0,100); teamMoraleDelta(me(),2,null); addNews("✅ Desafio da jornada cumprido: "+ch.label+" (+reputação, +moral)."); }
  else addNews("❌ Desafio da jornada falhado: "+ch.label+".");
  G.challenge=null;
}
function updateRecordsMatch(gf,ga,oppName){
  const R=ensureRecords();
  if(gf>ga){ G.streakW++; G.streakU++; const m=gf-ga;
    if(!R.bigWin||m>R.bigWin.margin||(m===R.bigWin.margin&&gf>R.bigWin.gf))R.bigWin={gf,ga,opp:oppName,margin:m,season:G.season}; }
  else if(gf<ga){ G.streakW=0; G.streakU=0; const m=ga-gf;
    if(!R.bigLoss||m>R.bigLoss.margin||(m===R.bigLoss.margin&&ga>R.bigLoss.ga))R.bigLoss={gf,ga,opp:oppName,margin:m,season:G.season}; }
  else { G.streakW=0; G.streakU++; }
  if(!R.bestUnbeaten||G.streakU>R.bestUnbeaten.n)R.bestUnbeaten={n:G.streakU,season:G.season};
  if(!R.bestWins||G.streakW>R.bestWins.n)R.bestWins={n:G.streakW,season:G.season};
}
function endSeasonAwards(meRank){
  ensureRecords(); const R=G.records, d=myDivObj();
  let top=null; d.clubs.forEach(c=>c.squad.forEach(p=>{ if((p.goals||0)>0 && (!top||p.goals>top.p.goals))top={p,c}; }));
  if(top){ const mine=top.c.id===G.myId; G.awards.unshift({type:"bota",season:G.season,division:d.name,player:top.p.name,club:top.c.short,goals:top.p.goals,mine});
    addNews("🥇 Bota de Ouro ("+d.name+"): "+top.p.name+" — "+top.p.goals+" golos ("+top.c.short+")"+(mine?" · é teu!":"")); }
  let best=null; d.clubs.forEach(c=>c.squad.forEach(p=>{ const sc=(p.goals||0)*3+ability(p); if(!best||sc>best.sc)best={p,c,sc}; }));
  if(best){ const mine=best.c.id===G.myId; G.awards.unshift({type:"mvp",season:G.season,division:d.name,player:best.p.name,club:best.c.short,mine});
    if(mine)addNews("⭐ Jogador do Ano da "+d.name+": "+best.p.name+" (teu)!"); }
  const meC=me();
  if(!R.mostGoals||meC.GF>R.mostGoals.n)R.mostGoals={n:meC.GF,season:G.season};
  if(!R.mostPoints||meC.Pts>R.mostPoints.n)R.mostPoints={n:meC.Pts,season:G.season};
  if(!R.bestPos||meRank<R.bestPos.n)R.bestPos={n:meRank,division:d.name,season:G.season};
  if(G.awards.length>60)G.awards.length=60;
  save();
}
/* ---------- Eventos de história (cartões com escolhas: sérios e bizarros) ----------
   Efeitos possíveis em fx: morale (moral do balneário), board (confiança da direção),
   budget (€M), rep (reputação), chem (química). Placeholders no texto: {clube} {jogador} {rival} {treinador} {epoca}.
   cond: "any" | "win" | "loss" | "draw" | "bigwin" | "bigloss" | "derby". young:true → escolhe um jovem. */
const DEFAULT_EVENTS=[
  {tone:"serio",cond:"any",icon:"jovem",young:true,title:"Talento na academia",
   text:"{jogador} está a brilhar nos treinos e o balneário só fala nele.",
   choices:[{label:"Promover ao plantel",result:"Subiste {jogador} à equipa principal. O grupo aplaudiu a aposta.",fx:{morale:6,rep:1}},
            {label:"Deixar amadurecer",result:"Preferiste ter calma com {jogador}.",fx:{}},
            {label:"Ouvir propostas",result:"Abriste a porta a uma venda de {jogador}. Alguns torceram o nariz.",fx:{budget:0.2,morale:-5}}]},
  {tone:"serio",cond:"loss",icon:"presidente",title:"Reação exigida",
   text:"Depois da derrota, o presidente do {clube} quer ver garra na resposta.",
   choices:[{label:"Assumir a culpa publicamente",result:"Protegeste o grupo. A direção valorizou a postura.",fx:{board:4,morale:3}},
            {label:"Apontar o dedo aos jogadores",result:"Puseste pressão no plantel. A moral ressentiu-se.",fx:{board:2,morale:-6}}]},
  {tone:"serio",cond:"win",icon:"adepto",title:"Onda de entusiasmo",
   text:"A vitória encheu os adeptos do {clube} de esperança.",
   choices:[{label:"Pedir os pés na terra",result:"Manténs o foco. Trabalho, trabalho, trabalho.",fx:{}},
            {label:"Prometer lutar pelo topo",result:"Abraçaste o sonho. A moral disparou, a pressão também.",fx:{morale:6,board:2}}]},
  {tone:"serio",cond:"any",icon:"presidente",title:"Sondagem por {jogador}",
   text:"Um clube de escalão superior sondou {jogador}.",
   choices:[{label:"Segurar a estrela",result:"Recusaste conversar. {jogador} sentiu-se valorizado.",fx:{morale:5}},
            {label:"Negociar a saída",result:"Encaixaste uma verba com a saída de {jogador}.",fx:{budget:0.35,morale:-6}}]},
  {tone:"serio",cond:"derby",icon:"rival",title:"Semana de dérbi",
   text:"O confronto com o {rival} mexe com toda a gente.",
   choices:[{label:"Focar o grupo no jogo",result:"Canalizaste a tensão para o campo.",fx:{morale:4}},
            {label:"Alimentar a rivalidade",result:"Deste lenha à fogueira. Os adeptos adoraram, a direção nem tanto.",fx:{rep:2,board:-2,morale:3}}]},
  {tone:"serio",cond:"any",icon:"adepto",title:"Adepto de sempre",
   text:"Um sócio de 80 anos do {clube} nunca falhou um jogo em 50 épocas.",
   choices:[{label:"Homenageá-lo no estádio",result:"O gesto emocionou a comunidade.",fx:{rep:2,morale:2}},
            {label:"Enviar camisola assinada",result:"Um miminho que ficou na história do clube.",fx:{rep:1}}]},
  {tone:"bizarro",cond:"any",icon:"bizarro",title:"Equipamentos cor-de-rosa",
   text:"O roupeiro do {clube} lavou as camisolas com uma peça vermelha. Ficaram... cor-de-rosa.",
   choices:[{label:"Jogar de rosa com orgulho",result:"Entraram de rosa e viraram tendência. Os adeptos aderiram!",fx:{rep:2,morale:4}},
            {label:"Comprar equipamento à pressa",result:"Gastaste uns trocos para salvar a honra.",fx:{budget:-0.05}}]},
  {tone:"bizarro",cond:"any",icon:"cabra",title:"Invasão no relvado",
   text:"Uma cabra fugiu de um terreno vizinho e invadiu o treino do {clube}.",
   choices:[{label:"Adotá-la como mascote",result:"A 'Cabritas' é agora mascote oficial. Virou fenómeno local!",fx:{rep:3,morale:5}},
            {label:"Chamar o dono",result:"Devolveste a cabra. Pena, dava uma boa história.",fx:{}}]},
  {tone:"bizarro",cond:"any",icon:"telemovel",title:"Viral nas redes",
   text:"Um vídeo de {jogador} a dançar no balneário rebentou nas redes.",
   choices:[{label:"Aproveitar a fama",result:"Deste palco à estrela. O {clube} ganhou seguidores.",fx:{rep:3}},
            {label:"Mandar focar no futebol",result:"Puseste ordem na casa. {jogador} guardou a dança para os golos.",fx:{morale:-2,board:2}}]},
  {tone:"bizarro",cond:"any",icon:"presidente",title:"Sonho do presidente",
   text:"O presidente do {clube} sonhou que eram campeões e quer festa já.",
   choices:[{label:"Alinhar na festa",result:"Houve arraial. A moral subiu, a carteira encolheu.",fx:{morale:6,budget:-0.08,board:2}},
            {label:"Travar o entusiasmo",result:"Puseste os pés na terra. O presidente ficou de trombas.",fx:{board:-3}}]},
  {tone:"bizarro",cond:"any",icon:"bizarro",title:"Autocarro furado",
   text:"O autocarro do {clube} furou um pneu a caminho do jogo.",
   choices:[{label:"Ir a pé para aquecer",result:"Chegaram a suar mas inspirados. História para contar aos netos.",fx:{morale:3}},
            {label:"Esperar pelo reboque",result:"Esperaram com calma. Sem drama.",fx:{}}]},
  {tone:"bizarro",cond:"any",icon:"rival",title:"Provocação do rival",
   text:"O {rivaltreinador}, do {rival}, gozou com o {clube} numa entrevista.",
   choices:[{label:"Responder à letra",result:"Não deixaste passar. Os adeptos vibraram com a picardia.",fx:{rep:2,morale:3}},
            {label:"Ficar calado e trabalhar",result:"Guardaste a resposta para o campo. A direção gostou da classe.",fx:{board:3}}]}
];
function allEvents(){ return DEFAULT_EVENTS.concat((typeof CFG!=="undefined"&&CFG.eventos)||[]); }
function weightedPick(arr){ const tot=arr.reduce((s,e)=>s+(e.w||1),0); let r=Math.random()*tot; for(const e of arr){ r-=(e.w||1); if(r<=0)return e; } return arr[arr.length-1]; }
function buildEvent(tmpl){
  const sq=me().squad;
  const young=sq.slice().filter(p=>p.age<=21).sort((a,b)=>(b.potential||0)-(a.potential||0))[0];
  const player=tmpl.young ? (young||sq.reduce((a,b)=>a.age<b.age?a:b)) : (pick(sq.filter(p=>GROUP[p.pos]!=="GK"))||pick(sq));
  const rc=clubByGid(rivalOf(me().gid)); const rivalName=rc?rc.name:"clube rival";
  const rmn=(G.rival&&G.rival.name)||"o treinador rival";
  const fill=s=>String(s).replace(/\{clube\}/g,me().name).replace(/\{jogador\}/g,player?player.name:"um jogador").replace(/\{rivaltreinador\}/g,rmn).replace(/\{rival\}/g,rivalName).replace(/\{treinador\}/g,(G.manager&&G.manager.name)||"Treinador").replace(/\{epoca\}/g,G.season);
  return {icon:tmpl.icon||"bizarro", tone:tmpl.tone||"serio", title:fill(tmpl.title), text:fill(tmpl.text),
    choices:(tmpl.choices||[]).map(c=>({label:c.label, result:fill(c.result), fx:c.fx||{}})), done:false, result:null};
}
function maybeEvent(){
  if(G.event||(G.meeting&&G.meeting.active)||G.fired)return;
  if((G.eventCd||0)>0){ G.eventCd--; return; }
  const d=myDivObj(); if(d.week<2)return;
  const res=d.results[d.results.length-1]||[]; const my=res.find(x=>x.h===G.myId||x.a===G.myId);
  const flags=["any"];
  if(my){ const isH=my.h===G.myId, gf=isH?my.hg:my.ag, ga=isH?my.ag:my.hg;
    flags.push(gf>ga?"win":gf<ga?"loss":"draw");
    if(gf-ga>=3)flags.push("bigwin"); if(ga-gf>=3)flags.push("bigloss");
    const opp=(my.h===G.myId?d.clubs[my.a]:d.clubs[my.h]); if(opp&&isDerby(me().gid,opp.gid))flags.push("derby"); }
  if(Math.random()>0.42)return;
  const pool=allEvents().filter(e=>flags.includes(e.cond||"any"));
  if(!pool.length)return;
  G.event=buildEvent(weightedPick(pool)); G.eventCd=ri(2,4); save();
}
function applyEventEffects(fx){ if(!fx)return;
  if(fx.morale)me().squad.forEach(p=>p.morale=clamp((p.morale==null?65:p.morale)+fx.morale,0,100));
  if(fx.board&&G.board)G.board.confidence=clamp(G.board.confidence+fx.board,0,100);
  if(fx.budget)me().budget=Math.round((me().budget+fx.budget)*100)/100;
  if(fx.rep&&G.manager)G.manager.reputation=clamp((G.manager.reputation||40)+fx.rep,0,100);
  if(fx.chem&&G.chem!=null)G.chem=clamp(G.chem+fx.chem,30,100);
}
function resolveEvent(i){ const e=G.event; if(!e||e.done)return null; const c=e.choices[i]; if(!c)return null;
  applyEventEffects(c.fx); e.result=c.result; e.done=true; addNews("📎 "+e.title+" — "+c.result); save(); return c.result; }
function dismissEvent(){ G.event=null; save(); }
/* ---------- Rival recorrente (personagem + duelo de época + reações no feed) ---------- */
const RIVAL_NAMES=["Zé Mourão","Toni Brandão","Quim Sequeira","Nando Peixoto","Mário Basílio","Vítor Canário","Cátia Nogueira","Rui Bastos","Paulo Trovão","Nuno Vinagre","Dídio Faria","Sérgio Cunha"];
const RIVAL_WON=["Ganhar-vos a vocês sabe sempre melhor.","O {clube}? Nem nos aqueceu.","Escrevam lá: quem manda aqui somos nós.","Foi fácil. Para a próxima tragam mais gente."];
const RIVAL_LOST=["Tiveram sorte, não se habituem.","Um dia mau acontece. Voltamos mais fortes.","Aproveitem, que não se repete.","Parabéns ao {clube}... desta vez."];
const RIVAL_DREW=["Empate? Fugiram foi à derrota.","Guardo a vitória para o próximo.","Nada mau, para o que costuma ser o {clube}."];
function fillRival(s){ const rc=G.rival?clubByGid(G.rival.gid):null;
  return String(s).replace(/\{rivaltreinador\}/g,(G.rival&&G.rival.name)||"o rival").replace(/\{rivalclube\}/g,rc?rc.name:"o rival").replace(/\{clube\}/g,me().name); }
function pickRival(keepNameIfSame){
  const d=myDivObj(); const cands=d.clubs.filter(c=>c.gid!==me().gid); if(!cands.length){G.rival=null;return;}
  let rc=null; const rg=rivalOf(me().gid); if(rg)rc=cands.find(c=>c.gid===rg);      // preferir o par de dérbi, se estiver na série
  if(!rc){ const my=me().strength||60; rc=cands.slice().sort((a,b)=>Math.abs((a.strength||60)-my)-Math.abs((b.strength||60)-my))[0]; }
  const same=G.rival&&keepNameIfSame&&G.rival.gid===rc.gid;
  G.rival={ gid:rc.gid, name: same?G.rival.name:(pick(RIVAL_NAMES)||randName()), mood: same?G.rival.mood:0, h2h: same?G.rival.h2h:{w:0,d:0,l:0} };
}
function rivalReact(gf,ga){                        // reação do rival a um confronto direto
  const r=G.rival; if(!r)return; const rc=clubByGid(r.gid);
  let line;
  if(gf>ga){ r.h2h.w++; r.mood=clamp(r.mood-2,-10,10); line=pick(RIVAL_LOST); }
  else if(gf<ga){ r.h2h.l++; r.mood=clamp(r.mood+2,-10,10); line=pick(RIVAL_WON); }
  else { r.h2h.d++; line=pick(RIVAL_DREW); }
  addNews("🗣️ "+r.name+" ("+(rc?rc.name:"rival")+"): «"+fillRival(line)+"»");
}
function resolveRivalDuel(table,meRank){           // no fim da época: quem terminou mais acima
  const r=G.rival; if(!r||!table)return; const rr=table.findIndex(c=>c.gid===r.gid)+1; if(!rr)return;
  const rc=clubByGid(r.gid), rn=rc?rc.name:"o rival";
  if(meRank<rr){ G.manager.reputation=clamp((G.manager.reputation||40)+2,0,100);
    addNews("🏁 Duelo da época ganho! Terminaste à frente do "+rn+" ("+meRank+"º vs "+rr+"º). O "+r.name+" que se cale. (+reputação)"); unlockAch("rival"); }
  else if(meRank>rr){ addNews("🏁 Duelo da época perdido: o "+rn+" ("+r.name+") ficou à tua frente ("+rr+"º vs "+meRank+"º). Para o ano acertas contas."); }
  else { addNews("🏁 Duelo da época: tu e o "+rn+" lado a lado na tabela."); }
}
/* ---------- exports (para node/testes; ignorado no browser) ---------- */
if(typeof module!=="undefined"&&module.exports){
  module.exports={ __state:()=>(typeof G!=="undefined"?G:null),
    POSITIONS,POS_NAME,GROUP,ATTRS,ATTR_KEYS,PROFILES,FORMATIONS,MENTAL,CLUBS,DIV1,
    rnd,ri,pick,clamp,money,roleRating,ability,effAt,fam,makePlayer,makeSquad,clubFromDef,
    buildFixtures,autoPickLineup,availableLineup,aiPickLineup,aiEnergyTick,teamStrength,simulate,applyResult,pickGoal,pickFoul,
    simRound,playWeek,endSeason,newSeason,sortedTable,newGame,buyPlayer,sellPlayer,
    setObjectives,squadRating,evaluateBoard,fireManager,makeJobOffers,takeNewJob,boardAfterUserMatch,
    buyAsk,makeBid,completeBuy,
    offRateFrom,createLive,liveStep,liveSub,liveSetTactic,aiMaybeSub,liveBench,liveResult,liveApplyEnergy,liveMaxSubs,liveReg,liveHalftime,liveDispMin,
    transferFee,transferWindow,transferWindowOpen,transferTick,transferWindowState,transferDayTick,makeOneOffer,aiTransfer,makePlayerOffers,acceptOffer,rejectOffer,
    ensureDays,startGap,matchDay,daysToMatch,dayTick,advanceDay,advanceToNextStop,flushToMatch,
    toggleLoanList,acceptLoanOffer,loanInList,loanInPlayer,returnLoans,trainingInjuryTick,
    unavailable,recovery,energyFactor,processEnergyInjuries,negotiateOffer,renewContract,rateUserMatch,avg5,releasePlayer,toggleTransferList,
    rollInjury,injuryLabel,applyMatchSuspensions,
    formMult,chemFactor,updateForm,updateChem,teamForm,developPlayer,trainTick,
    updateMorale,playerMeetingResolve,maybeBoardMeeting,resolveBoardMeeting,checkShortObjective,setShortObjective,recentUserResults,userResultAt,
    ensureAcademy,academyCost,youthStars,upgradeAcademy,academyIntake,developYouth,promoteYouth,releaseYouth,loanYouth,setAcademyFocus,
    ensureRecords,updateRecordsMatch,endSeasonAwards,ensureCareer,careerNewSpell,recordCareerSeason,
    ACHS,ensureAch,unlockAch,achDef,checkMatchAch,CHALS,newChallenge,resolveChallenge,
    ensureRoles,setRole,roleTakerId,penMissChance,fkMissChance,captainFactor,cornerBoost,bestFieldByAttr,
    ensureInstr,setInstr,instrEffect,instrHeaderBoost,
    ensureCapMood,captainMoodTick,resolveCaptainMeeting,maybeDiscipline,resolveDiscipline,teamMoraleDelta,
    TRAITS,assignTraits,hasTrait,traitLabels,ensureTraits,
    maybePlayerRequest,resolvePlayerRequest,buildPress,resolvePress,nextOppName,
    talkResolve,applyTeamTalkMorale,liveApplyTalk,favTier,clubRecentForm,
    wageFor,wageBill,wageCapFor,ensureWageCap,wageRoom,ensureFreeAgents,signFreeAgent,refreshFreeAgents,
    ensureRivals,rivalOf,isDerby,
    poSimTie,simPlayoffWinner,playoffZoneInfo,setupPlayoff,resolvePlayoffOutcome,superCupSetup,superCupResolve,
    buildGroups,clubByGid,groupIndexOf,allClubGids,finalissimaSetup,finalissimaResolve,
    maybeEvent,buildEvent,resolveEvent,dismissEvent,applyEventEffects,allEvents,
    pickRival,rivalReact,resolveRivalDuel,
    cupCreate,cupAdvanceRound,cupUserTie,clubByShort,cupRoundName,cupRoundDue,cupAvailable,simulateET,divDefs,firingReasons,requestBudget,budgetForObjective,budgetCapRoom,divOfShort,penaltyShootout,PRONAC,DIV2,
    curSlot,setSlot,loadSlot,wipeSlot,slotInfo,exportSave,importSave,requestPersist,
    myDivObj,myClubs,me, getG:()=>G, setG:x=>{G=x}, getPID:()=>PID };
}
