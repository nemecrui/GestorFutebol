"use strict";
/* ============================================================
   GESTOR AF BRAGA — ui.js  (interface)
   Usa as funções/dados globais definidos em engine.js.
   ============================================================ */

let TAB="home", tacSel=null, squadFilter="all", marketPos="all", tableTab="table", leagueDiv=null;
const $=s=>document.querySelector(s);

function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1900);}
function textOn(hex){const c=hex.replace("#","");const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);return (0.299*r+0.587*g+0.114*b)>150?"#111":"#fff";}
function ratingClass(v){return v>=72?"r-hi":v>=60?"r-mid":"r-lo";}
function posClass(pos){return "pos-"+GROUP[pos];}
function swatch(cl,sm){return `<span class="swatch ${sm?'sm':''}" style="background:linear-gradient(135deg,${cl.c1} 0 55%,${cl.c2} 55% 100%)"></span>`;}
function clubTag(cl,sm){return swatch(cl,sm)+`<span>${cl.short}</span>`;}
function clubTagFull(cl){return swatch(cl)+`<span class="full">${cl.name}</span>`;}
function attrColor(v){return v>=15?"#16a34a":v>=11?"#d9a400":"#e5484d";}

/* ---------- render ---------- */
function header(){
  const c=me();
  $("#hBadge").style.background=`linear-gradient(135deg,${c.c1} 0 55%,${c.c2} 55% 100%)`;
  $("#hSub").textContent=c.name+" · "+myDivObj().name;
  $("#hCash").textContent=money(c.budget);
}
function render(){
  if(!G)return; header();
  const m=$("#main");
  if(TAB==="home")m.innerHTML=viewHome();
  else if(TAB==="squad")m.innerHTML=viewSquad();
  else if(TAB==="tactics")m.innerHTML=viewTactics();
  else if(TAB==="market")m.innerHTML=viewMarket();
  else if(TAB==="table")m.innerHTML=viewTable();
  bindView(); renderNav();
}
function renderNav(){
  const items=[["home","🏠","Início"],["squad","👥","Plantel"],["tactics","📋","Tática"],["market","💱","Mercado"],["table","🏆","Liga"]];
  $("#nav").innerHTML=items.map(([id,ic,l])=>`<button data-tab="${id}" class="${TAB===id?'active':''}"><span class="ic">${ic}</span>${l}</button>`).join("");
  $("#nav").querySelectorAll("button").forEach(b=>b.onclick=()=>{TAB=b.dataset.tab;tacSel=null;render();});
}
function nextFixture(){
  const d=myDivObj(); if(d.week>=d.fixtures.length)return null;
  for(const [h,a] of d.fixtures[d.week]){ if(h===G.myId)return{opp:a,home:true}; if(a===G.myId)return{opp:h,home:false}; }
  return null;
}

/* ---------- INÍCIO ---------- */
function viewHome(){
  const c=me(), d=myDivObj(), table=sortedTable(d);
  const rank=table.findIndex(x=>x.id===G.myId)+1;
  const next=nextFixture(), done=d.week>=d.fixtures.length;
  let h="";
  if(G.fired){
    let fh=`<div class="card center"><h2 style="color:var(--red);justify-content:center">Foste despedido</h2>
      <div class="muted" style="margin:6px 0 12px">A direção do ${c.name} dispensou-te dos teus serviços.</div>`;
    if((G.offers||[]).length){
      fh+=`<div class="muted" style="font-size:13px;margin-bottom:8px">Clubes interessados em ti:</div>`;
      G.offers.forEach((o,i)=>{fh+=`<button class="btn sec" data-job="${i}" style="margin-bottom:8px">Assumir ${o.name} · ${G.divisions[o.divIdx].name}</button>`;});
    } else { fh+=`<div class="muted" style="margin-bottom:8px">Sem propostas de momento.</div>`; }
    fh+=`<button class="btn warn small" id="btnJobRestart" style="width:100%;margin-top:4px">↺ Recomeçar carreira do zero</button></div>`;
    fh+=`<div class="card"><h2>Notícias</h2>${(G.news||[]).slice(0,6).map(n=>`<div class="ev">${n.t}</div>`).join("")}</div>`;
    return fh;
  }
  if(!done&&next){
    const opp=myClubs()[next.opp], home=next.home?c:opp, away=next.home?opp:c;
    h+=`<div class="card"><h2>${d.name} · Jornada ${d.week+1} · ${G.date}</h2>
      <div class="fx"><div class="t">${clubTagFull(home)}</div><div class="sc">${next.home?"CASA":"FORA"}</div><div class="t a">${clubTagFull(away)}</div></div>
      ${(function(){const iss=lineupIssues(c);if(iss.ok)return "";const nm=c.squad.filter(p=>(c.susp||[]).includes(p.id)).map(p=>p.name);return `<div class="center" style="color:var(--red);font-size:12px;margin:6px 0">⚠ Onze inválido${iss.sus?` — suspenso(s): ${nm.join(", ")}`:""}${iss.vac?`${iss.sus?"; ":" — "}${iss.vac} vazio(s)`:""}. Corrige na Tática.</div>`;})()}
      <button class="btn" id="btnPlay" style="margin-top:4px">▶ Jogar jornada</button>
      <button class="btn sec small" id="btnSim" style="width:100%;margin-top:8px">⏩ Simular resto da época</button></div>`;
  } else if(G.seasonDone){
    h+=`<div class="card center"><h2>Época ${G.season} terminada</h2><div class="big">${rank}º lugar</div>
      <div class="muted" style="margin:6px 0 12px">${table[0].name} — campeão da ${d.name}</div>
      <button class="btn" id="btnNewSeason">▶ Começar época ${G.season+1}</button></div>`;
  }
  if(G.manager&&!G.fired){
    const conf=G.board?G.board.confidence:60;
    const confColor=conf>=55?"var(--green2)":conf>=30?"var(--accent)":"var(--red)";
    h+=`<div class="card"><h2>Direção · ${G.manager.name}</h2>
      <div class="row between" style="margin-bottom:6px"><span class="muted">Objetivo</span><b>${me().objective?me().objective.label:"—"}</b></div>
      <div class="row between" style="margin-bottom:2px"><span class="muted">Confiança da direção</span><b>${conf}%</b></div>
      <div class="barwrap"><div class="bar" style="width:${conf}%;background:${confColor}"></div></div>
      <div class="row between" style="margin-top:8px"><span class="muted">Contrato</span><b>${G.contract?G.contract.seasonsLeft:"—"} época(s)</b></div>
      <div class="row between"><span class="muted">Reputação</span><b>${G.manager.reputation}</b></div></div>`;
  }
  if(G.transferOffers&&G.transferOffers.length){
    h+=`<div class="card"><h2>Propostas recebidas</h2>`+G.transferOffers.map((o,i)=>
      `<div class="pl" style="flex-wrap:wrap"><div class="info" style="flex:1 1 100%;margin-bottom:6px"><div class="nm">${o.playerName}</div>
        <div class="sub">${o.clubName} oferece <b style="color:var(--accent)">${money(o.fee)}</b></div></div>
        <button class="btn small" data-accept="${i}">Aceitar</button>
        <button class="btn small sec" data-counter="${i}">Pedir +20%</button>
        <button class="btn small warn" data-reject="${i}">Recusar</button></div>`).join("")+`</div>`;
  }
  h+=`<div class="card"><h2>Situação · ${d.name}</h2><div class="grid2">
      <div class="stat"><div class="v">${rank}º</div><div class="l">Classificação</div></div>
      <div class="stat"><div class="v">${c.Pts}</div><div class="l">Pontos</div></div>
      <div class="stat"><div class="v">${c.W}-${c.D}-${c.L}</div><div class="l">V-E-D</div></div>
      <div class="stat"><div class="v">${c.GF}:${c.GA}</div><div class="l">Golos</div></div></div></div>`;
  if(d.results.length){
    const last=d.results[d.results.length-1];
    h+=`<div class="card"><h2>Última jornada</h2>`+last.map(r=>{const H=myClubs()[r.h],A=myClubs()[r.a],mine=(r.h===G.myId||r.a===G.myId);
      return `<div class="fx" style="${mine?'border-color:var(--accent)':''}"><div class="t">${clubTagFull(H)}</div><div class="sc">${r.hg} - ${r.ag}</div><div class="t a">${clubTagFull(A)}</div></div>`;}).join("")+`</div>`;
  }
  h+=`<div class="card"><h2>Notícias</h2>${(G.news||[]).slice(0,5).map(n=>`<div class="ev">${n.t}</div>`).join("")||'<div class="muted">Sem notícias.</div>'}</div>`;
  h+=`<div class="card"><button class="btn warn small" id="btnReset" style="width:100%">↺ Novo jogo (apaga progresso)</button></div>`;
  return h;
}

/* ---------- PLANTEL ---------- */
function viewSquad(){
  const c=me(), inXI=new Set(G.lineup);
  let list=c.squad.slice().sort((a,b)=>POSITIONS.indexOf(a.pos)-POSITIONS.indexOf(b.pos)||ability(b)-ability(a));
  if(squadFilter!=="all")list=list.filter(p=>GROUP[p.pos]===squadFilter);
  const xi=G.lineup.map(id=>c.squad.find(p=>p.id===id)).filter(Boolean);
  const avg=Math.round(xi.reduce((s,p)=>s+ability(p),0)/Math.max(1,xi.length));
  let h=`<div class="card between row"><div class="row">${swatch(c)}<div><b>${c.name}</b><div class="muted" style="font-size:11px">${c.squad.length} jogadores · toca para ver atributos</div></div></div>
    <div class="rating ${ratingClass(avg)}">${avg}</div></div>`;
  h+=`<div class="seg" id="segPos">`+[["all","Todos"],["GK","GR"],["DEF","DEF"],["MID","MED"],["ATT","ATA"]].map(([k,l])=>
    `<button data-p="${k}" class="${squadFilter===k?'active':''}">${l}</button>`).join("")+`</div>`;
  h+=`<div class="plist">`+list.map(p=>{
    const on=inXI.has(p.id), susp=(c.susp||[]).includes(p.id), inj=(p.injuredWeeks||0)>0, tag=susp?'SUSP':inj?'LES':'';
    return `<div class="pl" data-detail="${p.id}"><div class="num">${on?'<span style="color:var(--accent)">●</span>':'○'}</div>
      <div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}${tag?` <span class="tag" style="color:var(--red);font-weight:800;font-size:11px">${tag}</span>`:''}</div>
        <div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · ⚡${p.energy==null?100:p.energy}% · ${money(p.value)} · ⚽${p.goals}</div></div>
      <button class="btn small ${on?'warn':'sec'}" data-sell="${p.id}">Vender</button></div>`;
  }).join("")+`</div>`;
  return h;
}

/* ---------- ficha de jogador ---------- */
function openPlayer(pid){
  const c=me(); const p=c.squad.find(x=>x.id===pid); if(!p)return;
  const mo=document.createElement("div");mo.className="modal";
  const abil=ability(p);
  const attrRows=ATTRS.filter(([k])=>k!=="gr"||p.pos==="GR").map(([k,label])=>{
    const v=p.attrs[k]||1;
    return `<div class="attr"><span class="an">${label}</span><span class="abar"><i style="width:${v/20*100}%;background:${attrColor(v)}"></i></span><span class="av">${v}</span></div>`;
  }).join("");
  mo.innerHTML=`<div class="box"><button class="close" id="pClose">✕</button>
    <div class="row" style="gap:10px;margin-bottom:4px"><div class="rating ${ratingClass(abil)}" style="width:44px;height:44px;font-size:18px">${abil}</div>
      <div><div style="font-weight:800;font-size:16px">${p.name}</div>
      <div class="muted" style="font-size:12px"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${POS_NAME[p.pos]}</div></div></div>
    <div class="grid2" style="margin:10px 0">
      <div class="stat"><div class="v">${p.age}</div><div class="l">Idade</div></div>
      <div class="stat"><div class="v">${p.altura}cm</div><div class="l">Altura</div></div>
      <div class="stat"><div class="v">${p.potential}</div><div class="l">Potencial</div></div>
      <div class="stat"><div class="v">${money(p.value)}</div><div class="l">Valor</div></div></div>
    <div class="muted" style="font-size:11px;margin-bottom:2px">⚽ ${p.goals} golos · 🟨 ${p.yc||0} · 🟥 ${p.rc||0}</div>
    <div class="muted" style="font-size:11px;margin-bottom:2px">📄 Contrato: ${p.contractYears||"—"} ano(s) · valor de venda ~ ${money(transferFee(p))}</div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">⚡ Energia: ${p.energy==null?100:p.energy}%${(p.injuredWeeks||0)>0?` · <span style="color:var(--red)">🏥 Lesionado (${p.injuredWeeks} jornada${p.injuredWeeks>1?"s":""})</span>`:""}</div>
    <button class="btn sec small" id="pRenew" style="width:100%;margin-bottom:8px">📄 Renovar contrato (${money(Math.max(0.01,Math.round(p.value*0.08*100)/100))})</button>
    <h2 style="margin:10px 0 4px;color:var(--muted);font-size:12px">Atributos</h2>
    <div class="attrs">${attrRows}</div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#pClose").onclick=close;
  mo.querySelector("#pRenew").onclick=()=>{const r=renewContract(p.id);if(r.msg)toast(r.msg);close();render();};
  mo.onclick=e=>{if(e.target===mo)close();};
}

/* ---------- TÁTICA ---------- */
function lineupIssues(club){
  const susp=new Set(club.susp||[]); let vac=0,sus=0,inj=0;
  for(let i=0;i<11;i++){const id=G.lineup[i]; if(id==null){vac++;continue;} if(susp.has(id))sus++; const p=club.squad.find(x=>x.id===id); if(p&&(p.injuredWeeks||0)>0)inj++;}
  const filled=G.lineup.filter(x=>x!=null).length;
  return {vac,sus,inj,filled,ok:vac===0&&sus===0&&inj===0&&filled===11};
}
function ensureValidXI(){
  const iss=lineupIssues(me());
  if(iss.ok)return true;
  toast((iss.sus||iss.inj)?"Tens indisponíveis no onze (suspensos/lesionados) — substitui na Tática":"Onze incompleto — precisas de 11 jogadores em campo");
  TAB="tactics"; render(); return false;
}
function selLabel(cl){
  if(!tacSel)return "";
  if(tacSel.type==="bench"){const p=cl.squad.find(x=>x.id===tacSel.pid);return p?p.name:"—";}
  const id=G.lineup[tacSel.slot]; const p=id!=null?cl.squad.find(x=>x.id===id):null;
  return p?p.name:"posição vazia";
}
function viewTactics(){
  const c=me();
  const s=teamStrength(c,G.lineup,G.formation,G.mentality);
  const iss=lineupIssues(c);
  let h="";
  if(tacSel){
    const occupied=tacSel.type==="slot"&&G.lineup[tacSel.slot]!=null;
    h+=`<div class="selbar"><span class="grow">Selecionado: <b>${selLabel(c)}</b> — toca no destino</span>
      ${occupied?`<button class="btn small warn" id="btnVacate">Tirar</button>`:""}<button class="btn small sec" id="btnCancelSel">✕</button></div>`;
  } else {
    h+=`<div class="card muted" style="font-size:12px;margin-bottom:8px">Toca num jogador (campo ou banco) e depois no destino para trocar. Toca numa posição para a esvaziar ou preencher.</div>`;
  }
  if(!iss.ok){
    h+=`<div class="card" style="border-color:var(--red);padding:10px"><div style="color:var(--red);font-size:13px">⚠ Onze inválido${iss.sus?` — ${iss.sus} suspenso(s) em campo`:""}${iss.vac?`${iss.sus?" e":" —"} ${iss.vac} posição(ões) vazia(s)`:""}. Corrige antes de jogar.</div></div>`;
  }
  h+=`<div class="card"><h2>Campo · ${G.formation}</h2>${pitchHTML(c)}</div>`;
  h+=`<div class="card"><h2>Suplentes ${iss.sus?'<span style="color:var(--red);font-size:11px">(há suspensos)</span>':''}</h2>${benchHTML(c)}</div>`;
  h+=`<div class="card"><h2>Formação</h2><select id="selForm">${Object.keys(FORMATIONS).map(f=>`<option ${f===G.formation?'selected':''}>${f}</option>`).join("")}</select></div>`;
  h+=`<div class="card"><h2>Mentalidade</h2><select id="selMent">${Object.keys(MENTAL).map(m=>`<option ${m===G.mentality?'selected':''}>${m}</option>`).join("")}</select></div>`;
  h+=`<div class="card"><h2>Força do onze</h2>${bar("Defesa",s.def)}${bar("Meio-campo",s.mid)}${bar("Ataque",s.atk)}
    <div class="center" style="margin-top:10px"><span class="rating ${ratingClass(Math.round(s.overall))}" style="display:inline-flex">${Math.round(s.overall)}</span> <span class="muted">global</span></div></div>`;
  h+=`<div class="card"><button class="btn" id="btnAuto">✨ Escolher melhor onze automaticamente</button></div>`;
  return h;
}
function pitchHTML(cl){
  const slots=FORMATIONS[G.formation].slots, tc=textOn(cl.c1), susp=new Set(cl.susp||[]);
  let spots="";
  for(let slot=0;slot<slots.length;slot++){
    const s=slots[slot], id=G.lineup[slot], p=id!=null?cl.squad.find(x=>x.id===id):null;
    const isSel=tacSel&&tacSel.type==="slot"&&tacSel.slot===slot;
    if(!p){
      spots+=`<div class="spot empty${isSel?' sel':''}" data-slot="${slot}" style="left:${s.x}%;top:${s.y}%"><div class="dot">+</div><div class="ppos">${s.pos}</div></div>`;
    } else {
      const isSusp=susp.has(id), isInj=(p.injuredWeeks||0)>0, bad=isSusp||isInj, tag=isSusp?'SUSP':isInj?'LES':'';
      spots+=`<div class="spot${isSel?' sel':''}${bad?' susp':''}" data-slot="${slot}" style="left:${s.x}%;top:${s.y}%">
        ${tag?`<div class="susp-tag">${tag}</div>`:''}
        <div class="dot" style="background:${cl.c1};color:${tc};border-color:${cl.c2}">${effAt(p,s.pos)}</div>
        <div class="lbl">${p.name.split(" ").slice(-1)[0]}</div><div class="ppos">${s.pos}</div></div>`;
    }
  }
  return `<div class="pitch"><div class="lines">
    <svg width="100%" height="100%" viewBox="0 0 68 100" preserveAspectRatio="none" style="position:absolute;inset:0">
      <g fill="none" stroke="#ffffff55" stroke-width="0.5"><rect x="1" y="1" width="66" height="98"/><line x1="1" y1="50" x2="67" y2="50"/>
      <circle cx="34" cy="50" r="8"/><rect x="20" y="1" width="28" height="14"/><rect x="20" y="85" width="28" height="14"/></g></svg>
    </div>${spots}</div>`;
}
function subsOf(cl){const inXI=new Set(G.lineup);return cl.squad.filter(p=>!inXI.has(p.id)).sort((a,b)=>POSITIONS.indexOf(a.pos)-POSITIONS.indexOf(b.pos)||ability(b)-ability(a));}
function benchHTML(cl){
  const subs=subsOf(cl), susp=new Set(cl.susp||[]);
  if(!subs.length)return `<div class="muted">Sem suplentes.</div>`;
  return `<div class="benchgrid" id="benchList">`+subs.map(p=>{
    const isSusp=susp.has(p.id), isInj=(p.injuredWeeks||0)>0, isSel=tacSel&&tacSel.type==="bench"&&tacSel.pid===p.id;
    const tag=isSusp?' · <span class="tag">SUSP</span>':isInj?' · <span class="tag">LES</span>':'';
    return `<div class="benchpl${isSel?' sel':''}${(isSusp||isInj)?' susp':''}" data-pid="${p.id}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · ⚡${p.energy==null?100:p.energy}%${tag}</div></div></div>`;
  }).join("")+`</div>`;
}
function bar(l,v){const pct=clamp((v-40)/55*100,3,100);return `<div style="margin:7px 0"><div class="row between"><span>${l}</span><b>${Math.round(v)}</b></div><div class="barwrap"><div class="bar" style="width:${pct}%"></div></div></div>`;}

function tacTap(el){
  const cl=me();
  const isSlot=el.hasAttribute("data-slot");
  const slot=isSlot?+el.dataset.slot:null, pid=isSlot?null:+el.dataset.pid;
  if(!isSlot){const bp=cl.squad.find(x=>x.id===pid); if((cl.susp||[]).includes(pid)||(bp&&(bp.injuredWeeks||0)>0)){toast("Jogador indisponível (suspenso ou lesionado)");return;}}
  if(!tacSel){tacSel={type:isSlot?"slot":"bench",slot,pid};render();return;}
  const sameSlot=isSlot&&tacSel.type==="slot"&&tacSel.slot===slot;
  const sameBench=!isSlot&&tacSel.type==="bench"&&tacSel.pid===pid;
  if(sameSlot||sameBench){tacSel=null;render();return;}
  if(tacSel.type==="slot"&&isSlot){const t=G.lineup[tacSel.slot];G.lineup[tacSel.slot]=G.lineup[slot];G.lineup[slot]=t;}
  else{const sSlot=tacSel.type==="slot"?tacSel.slot:slot;const sPid=tacSel.type==="bench"?tacSel.pid:pid;G.lineup[sSlot]=sPid;}
  tacSel=null;save();render();
}
function initTacticsTap(){document.querySelectorAll(".pitch .spot, #benchList .benchpl").forEach(el=>{el.onclick=()=>tacTap(el);});}

/* ---------- MERCADO ---------- */
function viewMarket(){
  const meC=me();
  let pool=[];
  myClubs().forEach(cl=>{if(cl.id===G.myId)return;cl.squad.forEach(p=>pool.push({p,from:cl.id,fromName:cl.short}));});
  if(marketPos!=="all")pool=pool.filter(x=>GROUP[x.p.pos]===marketPos);
  pool.sort((a,b)=>ability(b.p)-ability(a.p)); pool=pool.slice(0,40);
  let h=`<div class="card between row"><div>Verba · ${myDivObj().name}</div><div class="big" style="font-size:18px">${money(meC.budget)}</div></div>`;
  h+=`<div class="seg" id="segMkt">`+[["all","Todos"],["GK","GR"],["DEF","DEF"],["MID","MED"],["ATT","ATA"]].map(([k,l])=>
    `<button data-p="${k}" class="${marketPos===k?'active':''}">${l}</button>`).join("")+`</div>`;
  h+=`<div class="plist">`+pool.map(x=>{
    const p=x.p, price=Math.round(p.value*1.2*100)/100, ok=meC.budget>=price;
    return `<div class="pl" data-detailmk="${p.id}" data-mkfrom="${x.from}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · ${x.fromName} · pot.${p.potential}</div></div>
      <button class="btn small ${ok?'':'warn'}" data-buy="${p.id}" data-from="${x.from}">${money(price)}</button></div>`;
  }).join("")+`</div>`;
  return h;
}

/* ---------- LIGA ---------- */
function viewTable(){
  if(leagueDiv===null)leagueDiv=G.myDiv;
  const d=G.divisions[leagueDiv], mineHere=leagueDiv===G.myDiv;
  let h=`<div class="seg" id="segDiv">`+G.divisions.map((dv,i)=>`<button data-d="${i}" class="${leagueDiv===i?'active':''}">${dv.name}</button>`).join("")+`</div>`;
  h+=`<div class="seg" id="segLeague">
    <button data-t="table" class="${tableTab==='table'?'active':''}">Classificação</button>
    <button data-t="scorers" class="${tableTab==='scorers'?'active':''}">Marcadores</button>
    <button data-t="fixtures" class="${tableTab==='fixtures'?'active':''}">Jornada</button></div>`;
  if(tableTab==="table"){
    const t=sortedTable(d), n=t.length;
    h+=`<div class="card" style="padding:6px"><table><thead><tr><th>#</th><th class="name">Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>DG</th><th>P</th></tr></thead><tbody>`;
    t.forEach((c,i)=>{const zone=(d.upSlots&&i<d.upSlots)?"zone-up":((d.downSlots&&i>=n-d.downSlots)?"zone-down":"");
      h+=`<tr class="${(mineHere&&c.id===G.myId)?'me':''} ${zone}"><td>${i+1}</td><td class="name">${swatch(c,true)} ${c.name}</td><td>${c.P}</td><td>${c.W}</td><td>${c.D}</td><td>${c.L}</td><td>${(c.GF-c.GA>0?'+':'')+(c.GF-c.GA)}</td><td><b>${c.Pts}</b></td></tr>`;});
    h+=`</tbody></table></div>`;
    const leg=[];
    if(d.upSlots)leg.push(`<span style="color:var(--green2)">▌</span> Sobe à Divisão de Honra (${d.upSlots})`);
    if(d.downSlots)leg.push(`<span style="color:var(--red)">▌</span> Desce à 1ª Divisão (${d.downSlots})`);
    if(leg.length)h+=`<div class="card muted" style="font-size:12px">${leg.join(" &nbsp; ")}</div>`;
  } else if(tableTab==="scorers"){
    const all=[]; d.clubs.forEach(c=>c.squad.forEach(p=>{if(p.goals>0)all.push({p,c});}));
    all.sort((a,b)=>b.p.goals-a.p.goals);
    h+=`<div class="card" style="padding:6px"><table><thead><tr><th>#</th><th class="name">Jogador</th><th>Clube</th><th>⚽</th></tr></thead><tbody>`;
    all.slice(0,20).forEach((x,i)=>{h+=`<tr class="${(mineHere&&x.c.id===G.myId)?'me':''}"><td>${i+1}</td><td class="name">${x.p.name} <span class="pill ${posClass(x.p.pos)}" style="font-size:9px">${x.p.pos}</span></td><td class="name">${swatch(x.c,true)} ${x.c.short}</td><td><b>${x.p.goals}</b></td></tr>`;});
    if(!all.length)h+=`<tr><td colspan="4" class="muted">Ainda sem golos.</td></tr>`;
    h+=`</tbody></table></div>`;
  } else {
    const wk=Math.min(d.week,d.fixtures.length-1), round=d.fixtures[wk]||[], res=d.results[wk];
    h+=`<div class="card"><h2>${d.name} · Jornada ${wk+1}${d.week>=d.fixtures.length?' (final)':''}</h2>`+
      round.map(([hh,aa],i)=>{const H=d.clubs[hh],A=d.clubs[aa],r=res&&res[i];const mine=(mineHere&&(hh===G.myId||aa===G.myId));
        return `<div class="fx" style="${mine?'border-color:var(--accent)':''}"><div class="t">${clubTagFull(H)}</div><div class="sc">${r?r.hg+' - '+r.ag:'–'}</div><div class="t a">${clubTagFull(A)}</div></div>`;}).join("")+`</div>`;
  }
  return h;
}

/* ---------- jogo animado ---------- */
function playMatchAnimated(){
  const next=nextFixture(); if(!next){playWeek();render();return;}
  const c=me(), opp=myClubs()[next.opp];
  const home=next.home?c:opp, away=next.home?opp:c;
  const myLine=availableLineup(c,G.lineup,G.formation), oppLine=autoPickLineup(opp,"4-4-2",opp.susp);
  const hLine=next.home?myLine:oppLine, aLine=next.home?oppLine:myLine;
  const r=simulate(home,away,hLine,aLine);
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><div id="goalBanner">⚽ GOLO!</div>
    <div class="center"><h2 style="justify-content:center">${home.name} vs ${away.name}</h2></div>
    <div class="fx"><div class="t">${clubTag(home)}</div><div class="sc" id="liveScore">0 - 0</div><div class="t a">${clubTag(away)}</div></div>
    <div class="center muted" id="liveMin">0'</div><div class="live" id="liveEv"></div>
    <button class="btn" id="liveDone" style="display:none">Continuar</button>
    <button class="btn sec small" id="liveSkip" style="width:100%;margin-top:8px">Saltar</button></div>`;
  document.body.appendChild(mo);
  const evBox=mo.querySelector("#liveEv"),scoreEl=mo.querySelector("#liveScore"),minEl=mo.querySelector("#liveMin"),goalBanner=mo.querySelector("#goalBanner");
  let hg=0,ag=0,i=0,minute=0,timer,pauseUntil=0;
  const evs=r.events.slice().sort((a,b)=>a.m-b.m);
  function nameByPid(side,pid){const club=side==="H"?home:away;const p=club.squad.find(x=>x.id===pid);return p?p.name:"jogador";}
  function gtypeSuffix(t){return t==="penalty"?" (g.p.)":t==="freekick"?" (livre)":t==="header"?" (cabeça)":"";}
  function addEvLine(side,icon,txt){const club=side==="H"?home.short:away.short;const d=document.createElement("div");d.className="ev ev-"+(side==="H"?"h":"a");d.innerHTML=`<b>${txt.m}'</b> ${icon} ${club} — ${txt.name}`;evBox.prepend(d);}
  function goalFlash(){goalBanner.classList.remove("show");void goalBanner.offsetWidth;goalBanner.classList.add("show");if(scoreEl.animate)scoreEl.animate([{transform:"scale(1)"},{transform:"scale(1.35)"},{transform:"scale(1)"}],{duration:450});}
  function finish(){clearInterval(timer);scoreEl.textContent=r.hg+" - "+r.ag;minEl.textContent="Final";playWeek(r);
    const done=mo.querySelector("#liveDone");done.style.display="block";mo.querySelector("#liveSkip").style.display="none";done.onclick=()=>{mo.remove();render();};}
  mo.querySelector("#liveSkip").onclick=finish;
  timer=setInterval(()=>{
    if(Date.now()<pauseUntil)return;
    minute+=3;if(minute>90)minute=90;minEl.textContent=minute+"'";
    while(i<evs.length&&evs[i].m<=minute){const e=evs[i];i++;
      if(e.type==="goal"){if(e.side==="H")hg++;else ag++;scoreEl.textContent=hg+" - "+ag;goalFlash();
        addEvLine(e.side,"⚽",{m:e.m,name:nameByPid(e.side,e.scorer)+gtypeSuffix(e.gtype)});pauseUntil=Date.now()+900;}
      else if(e.type==="yellow"){addEvLine(e.side,"🟨",{m:e.m,name:nameByPid(e.side,e.pid)});}
      else if(e.type==="red"){addEvLine(e.side,"🟥",{m:e.m,name:nameByPid(e.side,e.pid)+(e.second?" (2º amarelo)":"")});}
    }
    if(minute>=90)finish();
  },220);
}

/* ---------- eventos ---------- */
function bindView(){
  const bp=$("#btnPlay");if(bp)bp.onclick=()=>{if(!ensureValidXI())return;playMatchAnimated();};
  const bs=$("#btnSim");if(bs)bs.onclick=()=>{if(!ensureValidXI())return;const d=myDivObj();while(d.week<d.fixtures.length)playWeek();toast("Época simulada");render();};
  const bn=$("#btnNewSeason");if(bn)bn.onclick=()=>{newSeason();TAB="home";render();};
  const br=$("#btnReset");if(br)br.onclick=()=>{if(confirm("Apagar o jogo atual e começar de novo?")){wipe();boot();}};
  document.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{takeNewJob(+b.dataset.job);TAB="home";render();});
  const bjr=$("#btnJobRestart");if(bjr)bjr.onclick=()=>{if(confirm("Recomeçar carreira do zero?")){wipe();boot();}};
  document.querySelectorAll("[data-accept]").forEach(b=>b.onclick=()=>{const r=acceptOffer(+b.dataset.accept);if(r.msg)toast(r.msg);render();});
  document.querySelectorAll("[data-reject]").forEach(b=>b.onclick=()=>{rejectOffer(+b.dataset.reject);render();});
  document.querySelectorAll("[data-counter]").forEach(b=>b.onclick=()=>{const i=+b.dataset.counter;const o=G.transferOffers[i];if(!o)return;const r=negotiateOffer(i,Math.round(o.fee*1.2*100)/100);if(r.status==="accepted")toast((r.res&&r.res.msg)||"Vendido");else if(r.status==="counter")toast("Contraproposta do clube: "+money(r.fee));else if(r.status==="withdrawn")toast("O clube retirou-se da negociação");render();});
  const sp=$("#segPos");if(sp)sp.querySelectorAll("button").forEach(b=>b.onclick=()=>{squadFilter=b.dataset.p;render();});
  document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(confirm("Vender este jogador?")){const r=sellPlayer(+b.dataset.sell);toast(r.msg);render();}});
  document.querySelectorAll("[data-detail]").forEach(el=>el.onclick=()=>openPlayer(+el.dataset.detail));
  const sf=$("#selForm");if(sf)sf.onchange=()=>{tacSel=null;G.formation=sf.value;G.lineup=autoPickLineup(me(),G.formation,[...unavailable(me())]);save();render();};
  const sm=$("#selMent");if(sm)sm.onchange=()=>{G.mentality=sm.value;save();render();};
  const ba=$("#btnAuto");if(ba)ba.onclick=()=>{tacSel=null;G.lineup=autoPickLineup(me(),G.formation,[...unavailable(me())]);save();toast("Onze otimizado");render();};
  const bva=$("#btnVacate");if(bva)bva.onclick=()=>{if(tacSel&&tacSel.type==="slot"){G.lineup[tacSel.slot]=null;tacSel=null;save();render();}};
  const bcs=$("#btnCancelSel");if(bcs)bcs.onclick=()=>{tacSel=null;render();};
  const smk=$("#segMkt");if(smk)smk.querySelectorAll("button").forEach(b=>b.onclick=()=>{marketPos=b.dataset.p;render();});
  document.querySelectorAll("[data-buy]").forEach(b=>b.onclick=e=>{e.stopPropagation();const r=buyPlayer(+b.dataset.from,+b.dataset.buy);toast(r.msg);render();});
  const sl=$("#segLeague");if(sl)sl.querySelectorAll("button").forEach(b=>b.onclick=()=>{tableTab=b.dataset.t;render();});
  const sdv=$("#segDiv");if(sdv)sdv.querySelectorAll("button").forEach(b=>b.onclick=()=>{leagueDiv=+b.dataset.d;render();});
  if(document.querySelector(".pitch"))initTacticsTap();
}

/* ---------- ecrã inicial ---------- */
function splashScreen(){
  const el=document.createElement("div");el.className="splash";el.id="splash";
  const divDefs=[{name:"Pró-Nacional",clubs:PRONAC},{name:"Divisão de Honra",clubs:CLUBS},{name:"1ª Divisão",clubs:DIV1},{name:"2ª Divisão",clubs:DIV2}];
  el.innerHTML=`<div style="width:56px;height:56px;border-radius:14px;border:1px solid #ffffff55;background:linear-gradient(135deg,#1d4ed8 0 55%,#ffffff 55% 100%)"></div>
    <h1 style="font-size:24px;margin:14px 0 2px">Gestor de Futebol</h1>
    <div class="muted" style="margin-bottom:20px">Época 2025/26 · 4 divisões da AF Braga</div>
    <div style="width:100%;max-width:360px">
      <div class="muted" style="text-align:left;margin-bottom:6px;font-size:13px">O teu nome (treinador):</div>
      <input id="mgrName" maxlength="28" placeholder="Ex: Nemec Rui" style="width:100%;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:11px;font-size:15px;margin-bottom:12px">
      <div class="muted" style="text-align:left;margin-bottom:6px;font-size:13px">Divisão:</div>
      <select id="divSel" style="margin-bottom:12px">${divDefs.map((d,i)=>`<option value="${i}">${d.name}</option>`).join("")}</select>
      <div class="muted" style="text-align:left;margin-bottom:6px;font-size:13px">Clube:</div>
      <select id="clubSel" style="margin-bottom:14px"></select>
      <button class="btn" id="startBtn">▶ Começar carreira</button></div>
    <div class="muted" style="font-size:11px;margin-top:16px;max-width:340px">Clubes e nomes reais da AF Braga. Cores provisórias. Jogadores e atributos fictícios.</div>`;
  document.body.appendChild(el);
  const divSel=el.querySelector("#divSel"), clubSel=el.querySelector("#clubSel");
  function fillClubs(){clubSel.innerHTML=divDefs[+divSel.value].clubs.map((c,i)=>`<option value="${i}">${c.n}</option>`).join("");}
  fillClubs(); divSel.onchange=fillClubs;
  el.querySelector("#startBtn").onclick=()=>{const nm=(el.querySelector("#mgrName").value||"").trim()||"Treinador";newGame(+divSel.value,+clubSel.value,nm);el.remove();TAB="home";render();};
}
function boot(){
  document.getElementById("splash")?.remove();
  if(load()&&G){TAB="home";render();}
  else{splashScreen();}
}

/* ---------- PWA ---------- */
function initPWA(){
  try{
    const manifest={name:"Gestor de Futebol",short_name:"Gestor",display:"standalone",background_color:"#0d1117",theme_color:"#0b7a3b",orientation:"portrait",start_url:".",
      icons:[{src:iconDataURL(192),sizes:"192x192",type:"image/png"},{src:iconDataURL(512),sizes:"512x512",type:"image/png"}]};
    const link=document.createElement("link");link.rel="manifest";link.href=URL.createObjectURL(new Blob([JSON.stringify(manifest)],{type:"application/json"}));document.head.appendChild(link);
    const ic=document.createElement("link");ic.rel="apple-touch-icon";ic.href=iconDataURL(192);document.head.appendChild(ic);
    if("serviceWorker" in navigator){
      const sw=`self.addEventListener("install",e=>self.skipWaiting());self.addEventListener("activate",e=>self.clients.claim());self.addEventListener("fetch",e=>{});`;
      navigator.serviceWorker.register(URL.createObjectURL(new Blob([sw],{type:"text/javascript"}))).catch(()=>{});
    }
  }catch(e){}
}
function iconDataURL(size){
  const c=document.createElement("canvas");c.width=c.height=size;const x=c.getContext("2d");
  x.fillStyle="#0b7a3b";x.fillRect(0,0,size,size);x.fillStyle="#ffcc00";x.beginPath();x.arc(size/2,size/2,size*0.28,0,7);x.fill();
  x.fillStyle="#0b7a3b";x.font="bold "+Math.round(size*0.26)+"px sans-serif";x.textAlign="center";x.textBaseline="middle";x.fillText("AFB",size/2,size*0.54);
  return c.toDataURL("image/png");
}
initPWA();
boot();
