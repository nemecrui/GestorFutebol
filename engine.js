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
    {pos:"PL",x:60,y:20},{pos:"PL",x:40,y:20}]}
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

/* modelo do plantel: posições cobertas (23 jogadores) */
const SQUAD_TEMPLATE=["GR","GR","LD","LD","LE","LE","DC","DC","DC","DC",
  "MDC","MDC","MC","MC","MD","ME","MO","MO","ED","EE","PL","PL","PL"];

let G=null, PID=1;

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
function effAt(p,pos){return Math.round(roleRating(p,pos)*fam(p.pos,pos));}  // nota efetiva num slot

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
    value, contractYears:ri(1,4), energy:100, injuredWeeks:0, form:0, goals:0, apps:0, yc:0, rc:0, wage:Math.round(value*0.12*100)/100+0.01};
}
function makeSquad(level){ return SQUAD_TEMPLATE.map(pos=>makePlayer(pos, level+rnd(-1.5,2))); }
function makeSquadFromRoster(roster,level){ return roster.map(r=>{const p=makePlayer(r.p,level); p.name=r.n; return p;}); }
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
  const dPN=makeDivision("Pró-Nacional",PRONAC,0,3);
  const dH =makeDivision("Divisão de Honra",CLUBS,3,3);
  const dU =makeDivision("1ª Divisão",DIV1,3,3);
  const dD =makeDivision("2ª Divisão",DIV2,3,0);
  G={version:6, divisions:[dPN,dH,dU,dD], myDiv:divIdx, myId:clubIdx,
     week:0, season:1, date:"Set", formation:"4-4-2", mentality:"Equilibrado",
     lineup:[], news:[], seasonDone:false, midWindowDone:false,
     manager:{name:(managerName||"Treinador").slice(0,28), reputation:40, seasons:0},
     contract:{seasonsLeft:2}, board:{confidence:60}, fired:false, offers:null, transferOffers:[]};
  G.lineup=autoPickLineup(me(),G.formation);
  setObjectives();
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
  return {def:def*men.def, mid, atk:atk*men.atk, overall:(def+mid+atk)/3};
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
  function goal(side,club,line,m){
    const gone=new Set(side==="H"?expelledH:expelledA);
    const g=pickGoal(club,line,side==="H"?G.formation:"4-4-2",gone);
    events.push({m,side,type:"goal",club,line,scorer:g?g.pid:null,gtype:g?g.gtype:"open"});
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
    if(Math.random()<rt.hx/90){hg++; goal("H",home,hLine,m);}
    if(Math.random()<rt.ax/90){ag++; goal("A",away,aLine,m);}
    if(Math.random()<0.024)disciplinary("H",home,hLine,m);
    if(Math.random()<0.024)disciplinary("A",away,aLine,m);
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
    if(userMatch){ const uc=(h===G.myId)?home:away; processEnergyInjuries(uc,userLine); rateUserMatch(uc,userLine,r,(h===G.myId)); }
    weekRes.push({h,a,hg:r.hg,ag:r.ag});
  });
  d.results.push(weekRes); d.week++;
}
function playWeek(preMy){
  const myD=myDivObj(); if(myD.week>=myD.fixtures.length)return;
  simRound(myD,preMy,true);
  boardAfterUserMatch();
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
  const prize=Math.max(0.03,(d.clubs.length-meRank+1)*0.02);
  me().budget=Math.round((me().budget+prize)*100)/100;
  evaluateBoard(meRank);
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
    d.clubs.forEach(c=>{c.P=c.W=c.D=c.L=c.GF=c.GA=c.Pts=0; c.susp=[];
      c.squad.forEach(p=>{p.goals=0;p.apps=0;p.yc=0;p.rc=0;p.energy=100;p.injuredWeeks=0;p.ratings=[];p.lastRating=null;
        p.contractYears=(p.contractYears||2)-1;if(p.contractYears<=0)p.contractYears=ri(2,4);
        if(p.age<24){ // jovens evoluem para o seu potencial
          ATTR_KEYS.forEach(k=>{ if((PROFILES[p.pos]||{})[k]&&roleRatingAttrs(p.attrs,p.pos)<p.potential&&Math.random()<0.5)p.attrs[k]=clamp(p.attrs[k]+1,1,20); });
        } else if(p.age>32){ // veteranos declinam
          ATTR_KEYS.forEach(k=>{ if(["vel","res","for","rea"].includes(k)&&Math.random()<0.4)p.attrs[k]=clamp(p.attrs[k]-1,1,20); });
        }
        p.age++;
      });
    });
    d.fixtures=buildFixtures(d.clubs.length); d.results=[]; d.week=0;
  });
  for(let di=0;di<G.divisions.length;di++){ const idx=G.divisions[di].clubs.findIndex(c=>c.short===mineShort); if(idx>=0){G.myDiv=di;G.myId=idx;break;} }
  G.season++; G.week=0; G.seasonDone=false; G.date="Set"; G.midWindowDone=false;
  G.lineup=autoPickLineup(me(),G.formation);
  G.manager.seasons=(G.manager.seasons||0)+1; setObjectives();
  if(myMove==="up")addNews("Subiste de divisão!");
  else if(myMove==="down")addNews("Desceste de divisão.");
  addNews("Nova época "+G.season+" ("+myDivObj().name+").");
  transferWindow();
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
    if(G.board.confidence<=10||miss>=3||G.contract.seasonsLeft<=0) fireManager();
    else { addNews("Objetivo falhado ("+obj.label+"). A direção deu-te mais uma época para corrigir."); G.fired=false; }
  }
}
function fireManager(){ G.fired=true; addNews("A direção do "+me().name+" decidiu dispensar-te."); G.offers=makeJobOffers(); }
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
  const targets=meC.squad.slice().sort((a,b)=>ability(b)-ability(a)).slice(0,8);
  const clubs=allClubsFlat().filter(o=>!isMine(o.c,o.di)&&o.c.budget>0.08);
  shuffleArr(clubs);
  const offers=[], used=new Set(), nBids=ri(0,3);
  for(let i=0;i<nBids&&i<clubs.length;i++){
    const club=clubs[i].c, di=clubs[i].di;
    const avail=targets.filter(p=>!used.has(p.id)&&transferFee(p)*0.9<=club.budget);
    if(!avail.length)continue;
    const p=pick(avail); used.add(p.id);
    const base=transferFee(p), maxFee=Math.round(base*rnd(1.1,1.6)*100)/100;
    const fee=Math.max(0.02,Math.round(base*rnd(0.8,1.05)*100)/100);
    offers.push({clubShort:club.short,clubName:club.name,divIdx:di,playerId:p.id,playerName:p.name,fee,maxFee,round:0});
  }
  return offers;
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
function energyFactor(club,line){ const ps=line.map(id=>club.squad.find(x=>x.id===id)).filter(Boolean); const avg=ps.reduce((s,p)=>s+(p.energy==null?100:p.energy),0)/Math.max(1,ps.length); return 0.8+0.2*(avg/100); }
function processEnergyInjuries(club,playedIds){
  const played=new Set(playedIds||[]);
  club.squad.forEach(p=>{
    if(p.energy==null)p.energy=100; if(p.injuredWeeks==null)p.injuredWeeks=0;
    if(p.injuredWeeks>0){ p.injuredWeeks--; p.energy=clamp(p.energy+Math.round(recovery(p.age)*0.6),0,100); return; }
    if(played.has(p.id)){
      p.energy=clamp(p.energy-ri(8,18)-Math.max(0,p.age-30),0,100);            // titular: perde pouco (mais com idade)
      const risk=0.02+(100-p.energy)/100*0.05+Math.max(0,(p.age-30))*0.004;    // pouca energia => mais lesões
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
/* ---------- exports (para node/testes; ignorado no browser) ---------- */
if(typeof module!=="undefined"&&module.exports){
  module.exports={ POSITIONS,POS_NAME,GROUP,ATTRS,ATTR_KEYS,PROFILES,FORMATIONS,MENTAL,CLUBS,DIV1,
    rnd,ri,pick,clamp,money,roleRating,ability,effAt,fam,makePlayer,makeSquad,clubFromDef,
    buildFixtures,autoPickLineup,availableLineup,teamStrength,simulate,applyResult,pickGoal,pickFoul,
    simRound,playWeek,endSeason,newSeason,sortedTable,newGame,buyPlayer,sellPlayer,
    setObjectives,squadRating,evaluateBoard,fireManager,makeJobOffers,takeNewJob,boardAfterUserMatch,
    transferFee,transferWindow,aiTransfer,makePlayerOffers,acceptOffer,rejectOffer,
    unavailable,recovery,energyFactor,processEnergyInjuries,negotiateOffer,renewContract,rateUserMatch,avg5,PRONAC,DIV2,
    myDivObj,myClubs,me, getG:()=>G, setG:x=>{G=x}, getPID:()=>PID };
}
