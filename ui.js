"use strict";
/* ============================================================
   GESTOR AF BRAGA — ui.js  (interface)
   Usa as funções/dados globais definidos em engine.js.
   ============================================================ */

let TAB="home", tacSel=null, squadFilter="all", marketPos="all", tableTab="table", leagueDiv=null;
const $=s=>document.querySelector(s);

function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("show");clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove("show"),1900);}
/* ---------- som (sintetizado, sem ficheiros) + vibração ---------- */
let SND=true; try{ SND=(localStorage.getItem("gf_sound")!=="0"); }catch(e){}
let _ac=null;
function _actx(){ if(!SND)return null; try{ if(!_ac)_ac=new (window.AudioContext||window.webkitAudioContext)(); if(_ac.state==="suspended")_ac.resume(); return _ac; }catch(e){return null;} }
function sndWhistle(times){ const c=_actx(); if(!c)return; const n=times||1; for(let k=0;k<n;k++){ const t=c.currentTime+k*0.22, o=c.createOscillator(),g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain(); o.type="sine";o.frequency.setValueAtTime(2050,t); lfo.frequency.value=26;lg.gain.value=110;lfo.connect(lg).connect(o.frequency);lfo.start(t);lfo.stop(t+0.19); g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.22,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.19); o.connect(g).connect(c.destination);o.start(t);o.stop(t+0.21);} }
function sndCheer(){ const c=_actx(); if(!c)return; const t=c.currentTime,dur=1.2, buf=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=buf.getChannelData(0); for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1; const src=c.createBufferSource();src.buffer=buf; const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=850;bp.Q.value=0.6; const g=c.createGain();g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.35,t+0.22);g.gain.linearRampToValueAtTime(0.22,t+0.6);g.gain.exponentialRampToValueAtTime(0.0001,t+dur); src.connect(bp).connect(g).connect(c.destination);src.start(t);src.stop(t+dur); }
function sndThud(){ const c=_actx(); if(!c)return; const t=c.currentTime,o=c.createOscillator(),g=c.createGain(); o.type="sine";o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(70,t+0.25); g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(0.25,t+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+0.3); o.connect(g).connect(c.destination);o.start(t);o.stop(t+0.32); }
function vib(p){ if(SND&&navigator.vibrate){try{navigator.vibrate(p);}catch(e){}} }
function setSound(on){ SND=on; try{localStorage.setItem("gf_sound",on?"1":"0");}catch(e){} if(on)_actx(); }
function textOn(hex){const c=hex.replace("#","");const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);return (0.299*r+0.587*g+0.114*b)>150?"#111":"#fff";}
function ratingClass(v){return v>=72?"r-hi":v>=60?"r-mid":"r-lo";}
function posClass(pos){return "pos-"+GROUP[pos];}
function swatch(cl,sm){return `<span class="swatch ${sm?'sm':''}" style="background:linear-gradient(135deg,${cl.c1} 0 55%,${cl.c2} 55% 100%)"></span>`;}
function clubTag(cl,sm){return swatch(cl,sm)+`<span>${cl.short}</span>`;}
function clubTagFull(cl){return swatch(cl)+`<span class="full clink" data-club="${cl.short}">${cl.name}</span>`;}
function attrColor(v){return v>=15?"#16a34a":v>=11?"#d9a400":"#e5484d";}

/* ---------- render ---------- */
function header(){
  const c=me();
  $("#hName").textContent=(G.manager&&G.manager.name)?G.manager.name:"Gestor";
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
  m.classList.remove("vin");void m.offsetWidth;m.classList.add("vin");  // transição suave entre ecrãs
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

function formIcon(p){ const f=(p&&p.form)||0; if(f>=1.2)return '<span style="color:var(--green2)" title="Em alta">▲</span>'; if(f<=-1.2)return '<span style="color:var(--red)" title="Em baixo">▼</span>'; return '<span class="muted" title="Estável">▬</span>'; }
function enColor(e){ e=(e==null?100:e); return e>=70?'#16a34a':e>=45?'#f2c200':'#e5484d'; }
function enHtml(e){ e=(e==null?100:e); return '<span style="color:'+enColor(e)+';font-weight:800">⚡'+e+'</span>'; }
function enBar(e){ e=(e==null?100:e); return '<div style="height:4px;width:100%;background:#0006;border-radius:2px;margin-top:2px;overflow:hidden"><i style="display:block;height:100%;width:'+e+'%;background:'+enColor(e)+'"></i></div>'; }
function moraleTag(p){ const m=(p&&p.morale!=null)?p.morale:70; const c=m>=66?'#16a34a':m>=40?'#f2c200':'#e5484d'; const l=m>=66?'Alta':m>=40?'Média':'Baixa'; return '<span style="color:'+c+';font-weight:700">'+l+'</span>'; }
function openTalk(p){
  const mo=document.createElement("div");mo.className="modal";
  const m=p.morale!=null?p.morale:70;
  const mood=m<=22?"Está muito insatisfeito e quer falar sobre a sua situação.":m<45?"Anda descontente com a falta de protagonismo.":"Sente-se bem, mas ouve o que tens para dizer.";
  mo.innerHTML=`<div class="box"><button class="close" id="tClose">✕</button>
    <div style="font-weight:800;font-size:16px;margin-bottom:4px">Reunião com ${p.name}</div>
    <div class="muted" style="font-size:12px;margin-bottom:10px">${mood} (Moral: ${moraleTag(p)})</div>
    <button class="btn sec small" data-opt="minutos" style="width:100%;margin-bottom:6px">Prometer mais minutos</button>
    <button class="btn sec small" data-opt="paciencia" style="width:100%;margin-bottom:6px">Pedir para lutar pelo lugar</button>
    <button class="btn sec small" data-opt="listar" style="width:100%;margin-bottom:6px">Colocar na lista de transferências</button>
    <button class="btn warn small" data-opt="ignorar" style="width:100%">Ignorar o desabafo</button></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#tClose").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
  mo.querySelectorAll("[data-opt]").forEach(b=>b.onclick=()=>{const r=playerMeetingResolve(p.id,b.dataset.opt);toast(r.msg);close();render();});
}
/* ---------- INÍCIO ---------- */
function viewHome(){
  const c=me(), d=myDivObj(), table=sortedTable(d);
  const rank=table.findIndex(x=>x.id===G.myId)+1;
  const next=nextFixture(), done=d.week>=d.fixtures.length;
  let h="";
  if(G.fired){
    let fh=`<div class="card center"><h2 style="color:var(--red);justify-content:center">Foste despedido</h2>
      <div class="muted" style="margin:6px 0 4px">A direção do ${c.name} dispensou-te.</div>
      <div style="margin:2px 0 12px;font-size:13px">${G.firedReason||"—"}</div>`;
    if((G.offers||[]).length){
      fh+=`<div class="muted" style="font-size:13px;margin-bottom:8px">Clubes interessados em ti:</div>`;
      G.offers.forEach((o,i)=>{fh+=`<button class="btn sec" data-job="${i}" style="margin-bottom:8px">Assumir ${o.name} · ${G.divisions[o.divIdx].name}</button>`;});
    } else { fh+=`<div class="muted" style="margin-bottom:8px">Sem propostas de momento.</div>`; }
    fh+=`<button class="btn warn small" id="btnJobRestart" style="width:100%;margin-top:4px">↺ Recomeçar carreira do zero</button></div>`;
    fh+=`<div class="card"><h2>Notícias</h2>${(G.news||[]).slice(0,6).map(n=>`<div class="ev">${n.t}</div>`).join("")}</div>`;
    return fh;
  }
  if(G.meeting&&G.meeting.active){
    h+=`<div class="card" style="border-color:var(--red)"><h2 style="color:var(--red)">Reunião com a direção</h2>
      <div style="font-size:13px;margin-bottom:10px">A direção está preocupada com ${G.meeting.reason}. Que resposta lhes dás?</div>
      <button class="btn sec small" data-meet="assumir" style="width:100%;margin-bottom:6px">Assumo a responsabilidade e corrijo já</button>
      <button class="btn sec small" data-meet="prometer" style="width:100%;margin-bottom:6px">Prometo resultados imediatos</button>
      <button class="btn warn small" data-meet="desafiar" style="width:100%">O plantel é fraco — a culpa não é minha</button>
      <div class="muted" style="font-size:11px;margin-top:8px">Tens de responder antes do próximo jogo.</div></div>`;
  }
  if(G.shortObjective&&G.shortObjective.active){
    const so=G.shortObjective;
    h+=`<div class="card" style="border-color:var(--accent)"><h2 style="color:var(--accent)">Objetivo de curto prazo</h2>
      <div style="font-size:13px">A direção exige <b>${so.label}</b>. Vais em <b>${so.points}</b> ponto(s) em ${so.played}/${so.games} jogos.${so.need-so.points>0?" Faltam "+(so.need-so.points)+".":" Já cumprido!"}</div></div>`;
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
  if(G.cup){
    const cup=G.cup, ms=c.short;
    if(!cup.active&&cup.winner){ const wc=clubByShort(cup.winner);
      h+=`<div class="card center"><h2>🏆 Taça</h2><div class="muted">Vencedor: <b>${wc?wc.name:cup.winner}</b></div></div>`;
    } else if(cup.active){
      const ut=cupUserTie(), avail=cupAvailable();
      h+=`<div class="card"><h2>🏆 Taça · ${cupRoundName()}</h2>`;
      if(cup.userAlive&&ut&&ut.b){
        const opp=(ut.a===ms?ut.b:ut.a), oc=clubByShort(opp);
        h+=`<div class="fx"><div class="t">${clubTagFull(c)}</div><div class="sc">vs</div><div class="t a">${oc?clubTagFull(oc):opp}</div></div>`;
        h+= avail ? `<button class="btn" id="btnCup" style="margin-top:4px">▶ Jogar eliminatória da Taça</button>`
                  : `<div class="center muted" style="font-size:12px;margin-top:6px">Disponível a partir da jornada ${cupRoundDue()} do campeonato.</div>`;
      } else if(cup.userAlive&&ut&&!ut.b){
        h+=`<div class="center muted" style="margin-bottom:8px">Passas por folga (bye) nesta eliminatória.</div>`;
        h+= avail ? `<button class="btn" id="btnCup">▶ Avançar na Taça</button>` : `<div class="center muted" style="font-size:12px">Disponível na jornada ${cupRoundDue()}.</div>`;
      } else {
        h+=`<div class="center muted" style="margin-bottom:8px">Foste eliminado da Taça (${cup.remaining.length} equipas em prova).</div>`;
        h+= avail ? `<button class="btn sec" id="btnCup">⏩ Simular eliminatória</button>` : `<div class="center muted" style="font-size:12px">Próxima eliminatória na jornada ${cupRoundDue()}.</div>`;
      }
      h+=`</div>`;
    }
  }
  h+=`<div class="card"><h2>Situação · ${d.name}</h2><div class="grid2">
      <div class="stat"><div class="v">${rank}º</div><div class="l">Classificação</div></div>
      <div class="stat"><div class="v">${c.Pts}</div><div class="l">Pontos</div></div>
      <div class="stat"><div class="v">${c.W}-${c.D}-${c.L}</div><div class="l">V-E-D</div></div>
      <div class="stat"><div class="v">${c.GF}:${c.GA}</div><div class="l">Golos</div></div></div></div>`;
  {
    const chem=G.chem!=null?G.chem:65, tf=teamForm(c);
    const chemLbl=chem>=80?"Excelente":chem>=65?"Boa":chem>=50?"Razoável":"Fraca";
    const formLbl=tf>1.2?"Em alta":tf<-1.2?"Em baixo":"Estável";
    h+=`<div class="card"><h2>Treino & Balneário</h2>
      <div class="grid2" style="margin-bottom:8px">
        <div class="stat"><div class="v">${chem}<span style="font-size:11px">/100</span></div><div class="l">Química (${chemLbl})</div></div>
        <div class="stat"><div class="v">${tf>0?"+":""}${tf}</div><div class="l">Forma (${formLbl})</div></div></div>
      <div class="muted" style="font-size:11px">A química sobe quando mantens o mesmo onze e desce com muitas trocas. Define o foco de treino de cada jogador na ficha dele — os jogadores evoluem a cada jornada (quem joga menos e os mais novos evoluem mais depressa).</div></div>`;
  }
  if(d.results.length){
    const last=d.results[d.results.length-1];
    h+=`<div class="card"><h2>Última jornada</h2>`+last.map(r=>{const H=myClubs()[r.h],A=myClubs()[r.a],mine=(r.h===G.myId||r.a===G.myId);
      return `<div class="fx" style="${mine?'border-color:var(--accent)':''}"><div class="t">${clubTagFull(H)}</div><div class="sc">${r.hg} - ${r.ag}</div><div class="t a">${clubTagFull(A)}</div></div>`;}).join("")+`</div>`;
  }
  h+=`<div class="card"><h2>Notícias</h2>${(G.news||[]).slice(0,5).map(n=>`<div class="ev">${n.t}</div>`).join("")||'<div class="muted">Sem notícias.</div>'}</div>`;
  if(G.manager){
    const st=G.manager.stats||{P:0,W:0,D:0,L:0,GF:0,GA:0}, tr=G.manager.trophies||[];
    h+=`<div class="card"><h2>🏅 Palmarés · ${G.manager.name}</h2>
      <div class="grid2" style="margin-bottom:8px">
        <div class="stat"><div class="v">${st.W}-${st.D}-${st.L}</div><div class="l">V-E-D (carreira)</div></div>
        <div class="stat"><div class="v">${st.P}</div><div class="l">Jogos</div></div>
        <div class="stat"><div class="v">${st.GF}</div><div class="l">Golos marcados</div></div>
        <div class="stat"><div class="v">${st.GA}</div><div class="l">Golos sofridos</div></div></div>
      <div class="muted" style="font-size:12px;margin-bottom:4px">Troféus (${tr.length})</div>
      ${tr.length? tr.slice().reverse().map(t=>`<div class="row between" style="border-bottom:1px solid var(--line);padding:5px 2px;font-size:13px"><span>${t.type==="cup"?"🏆":t.type==="league"?"🥇":"⬆️"} ${t.name}</span><span class="muted" style="font-size:12px">época ${t.season}</span></div>`).join("") : `<div class="muted" style="font-size:13px">Ainda sem troféus — vai à luta!</div>`}
    </div>`;
  }
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
      <div class="info"><div class="nm">${p.name}${p.wantsTalk?' 💬':''}${tag?` <span class="tag" style="color:var(--red);font-weight:800;font-size:11px">${tag}</span>`:''}${p.transferListed?` <span class="tag" style="color:var(--accent);font-weight:800;font-size:11px">LT</span>`:''}</div>
        <div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · ${enHtml(p.energy)} · ${formIcon(p)} · ⭐${avg5(p)!=null?avg5(p):"—"} · ⚽${p.goals}</div></div>
      <span class="muted" style="font-size:18px">›</span></div>`;
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
    <div class="muted" style="font-size:11px;margin-bottom:6px">Energia: ${enHtml(p.energy)}${(p.injuredWeeks||0)>0?` · <span style="color:var(--red)">🏥 Lesionado (${p.injuredWeeks} jornada${p.injuredWeeks>1?"s":""})</span>`:""}</div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">⭐ Última avaliação: ${p.lastRating!=null?p.lastRating:"—"} · Média (5 jogos): ${avg5(p)!=null?avg5(p):"—"} · Forma: ${formIcon(p)} ${((p.form||0)>0?"+":"")+(Math.round((p.form||0)*10)/10)}</div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">🙂 Moral: ${moraleTag(p)}${p.wantsTalk?' · <span style="color:var(--accent)">pediu para reunir</span>':''}</div>
    <button class="btn sec small" id="pTalk" style="width:100%;margin-bottom:8px">💬 Reunir com o jogador</button>
    <div class="muted" style="font-size:11px;margin-bottom:3px">🎯 Foco de treino:</div>
    <select id="pTrain" style="margin-bottom:8px">${["Equilibrado","Ataque","Defesa","Físico"].map(f=>`<option${(p.trainFocus||"Equilibrado")===f?" selected":""}>${f}</option>`).join("")}</select>
    <button class="btn sec small" id="pRenew" style="width:100%;margin-bottom:8px">📄 Renovar contrato (${money(Math.max(0.01,Math.round(p.value*0.08*100)/100))})</button>
    <button class="btn sec small" id="pList" style="width:100%;margin-bottom:8px">${p.transferListed?"⭐ Retirar da lista de transferências":"📋 Colocar na lista de transferências"}</button>
    <button class="btn warn small" id="pRelease" style="width:100%;margin-bottom:8px">🚪 Dispensar (sem receita)</button>
    <h2 style="margin:10px 0 4px;color:var(--muted);font-size:12px">Atributos</h2>
    <div class="attrs">${attrRows}</div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#pClose").onclick=close;
  const pt=mo.querySelector("#pTrain");if(pt)pt.onchange=()=>{p.trainFocus=pt.value;save();toast(p.name+": foco de treino "+pt.value);};
  const ptk=mo.querySelector("#pTalk");if(ptk)ptk.onclick=()=>{close();openTalk(p);};
  mo.querySelector("#pRenew").onclick=()=>{const r=renewContract(p.id);if(r.msg)toast(r.msg);close();render();};
  mo.querySelector("#pList").onclick=()=>{const listed=toggleTransferList(p.id);toast(listed?"Colocado na lista de transferências":"Retirado da lista");close();render();};
  mo.querySelector("#pRelease").onclick=()=>{if(confirm("Dispensar "+p.name+"? Sai sem qualquer receita.")){const r=releasePlayer(p.id);if(r.msg)toast(r.msg);close();render();}};
  mo.onclick=e=>{if(e.target===mo)close();};
}
/* ---------- ficha só-leitura (scouting) + proposta ---------- */
function openScout(p,opts){
  opts=opts||{};
  const mo=document.createElement("div");mo.className="modal";
  const abil=ability(p);
  const attrRows=ATTRS.filter(([k])=>k!=="gr"||p.pos==="GR").map(([k,label])=>{
    const v=p.attrs[k]||1;
    return `<div class="attr"><span class="an">${label}</span><span class="abar"><i style="width:${v/20*100}%;background:${attrColor(v)}"></i></span><span class="av">${v}</span></div>`;
  }).join("");
  const canBid=opts.fromId!=null, offer=canBid?Math.round(p.value*1.2*100)/100:null;
  mo.innerHTML=`<div class="box"><button class="close" id="sClose">✕</button>
    <div class="row" style="gap:10px;margin-bottom:4px"><div class="rating ${ratingClass(abil)}" style="width:44px;height:44px;font-size:18px">${abil}</div>
      <div><div style="font-weight:800;font-size:16px">${p.name}</div>
      <div class="muted" style="font-size:12px"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${POS_NAME[p.pos]}${opts.clubName?" · "+opts.clubName:""}</div></div></div>
    <div class="grid2" style="margin:10px 0">
      <div class="stat"><div class="v">${p.age}</div><div class="l">Idade</div></div>
      <div class="stat"><div class="v">${p.altura}cm</div><div class="l">Altura</div></div>
      <div class="stat"><div class="v">${p.potential}</div><div class="l">Potencial</div></div>
      <div class="stat"><div class="v">${money(p.value)}</div><div class="l">Valor</div></div></div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">⚽ ${p.goals||0} golos · 📄 ${p.contractYears||"—"} ano(s)${p.transferListed?' · <span style="color:var(--accent)">na lista de transferências</span>':''}</div>
    ${canBid?`<div id="bidBox"><button class="btn small" id="bidBtn" style="width:100%;margin-bottom:8px">💰 Oferecer ${money(offer)}</button></div>`:''}
    <h2 style="margin:10px 0 4px;color:var(--muted);font-size:12px">Atributos</h2>
    <div class="attrs">${attrRows}</div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#sClose").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
  if(canBid){
    const box=mo.querySelector("#bidBox");
    const doBid=fee=>{
      const r=makeBid(opts.fromId,p.id,fee);
      if(r.status==="accepted"){toast((r.res&&r.res.msg)||"Contratado");close();render();}
      else if(r.status==="counter"){
        box.innerHTML=`<div class="muted" style="font-size:12px;margin-bottom:6px">${r.msg}</div>
          <button class="btn small" id="bidAccept" style="width:100%;margin-bottom:6px">✅ Aceitar ${money(r.fee)}</button>
          <button class="btn sec small" id="bidWalk" style="width:100%">✋ Desistir</button>`;
        const ba=box.querySelector("#bidAccept");if(ba)ba.onclick=()=>{const r2=makeBid(opts.fromId,p.id,r.fee);if(r2.status==="accepted"){toast((r2.res&&r2.res.msg)||"Contratado");}else{toast(r2.msg||"Negociação terminada");}close();render();};
        const bw=box.querySelector("#bidWalk");if(bw)bw.onclick=close;
      }
      else {toast(r.msg||"Proposta recusada");if(r.status!=="nofunds")close();}
    };
    const bb=mo.querySelector("#bidBtn");if(bb)bb.onclick=()=>doBid(offer);
  }
}
function openClubSquad(short){
  const club=clubByShort(short);if(!club)return;
  const mo=document.createElement("div");mo.className="modal";
  const negotiable=(club.id!=null && myClubs()[club.id]===club && club.id!==G.myId);
  const rows=club.squad.slice().sort((a,b)=>POSITIONS.indexOf(a.pos)-POSITIONS.indexOf(b.pos)||ability(b)-ability(a)).map(p=>
    `<div class="pl" data-scout="${p.id}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · pot.${p.potential}${p.transferListed?' · <span style="color:var(--accent)">LT</span>':''}</div></div>
      <span class="muted" style="font-size:18px">›</span></div>`).join("");
  mo.innerHTML=`<div class="box"><button class="close" id="cClose">✕</button>
    <div class="row" style="gap:8px;margin-bottom:6px">${swatch(club,true)}<div style="font-weight:800;font-size:16px">${club.name}</div></div>
    <div class="muted" style="font-size:12px;margin-bottom:8px">${club.squad.length} jogadores${negotiable?" · toca num jogador para ver ficha e propor":" · (não é da tua divisão — só consulta)"}</div>
    <div class="plist">${rows}</div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#cClose").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
  mo.querySelectorAll("[data-scout]").forEach(el=>el.onclick=()=>{const p=club.squad.find(x=>x.id===+el.dataset.scout);if(p)openScout(p,{fromId:negotiable?club.id:null,clubName:club.short});});
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
        <div class="lbl">${p.name.split(" ").slice(-1)[0]}</div><div class="ppos">${s.pos} · ${enHtml(p.energy)} · ⭐${avg5(p)!=null?avg5(p):"—"}</div>${enBar(p.energy)}</div>`;
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
      <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · ${enHtml(p.energy)} · ⭐${avg5(p)!=null?avg5(p):"—"}${tag}</div>${enBar(p.energy)}</div></div>`;
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
  const room=budgetCapRoom(), askDis=room<=0.005;
  h+=`<div class="card" style="padding:8px"><button class="btn sec small" id="btnAskBudget" style="width:100%${askDis?';opacity:.45':''}"${askDis?' disabled':''}>🏦 ${askDis?'Teto de reforço atingido (30%)':'Pedir reforço de verba à direção'}</button>
    <div class="muted" style="font-size:11px;margin-top:6px;text-align:center">A direção decide conforme a confiança atual (e conceder reduz essa folga). Reforço disponível esta época: até ${money(room)}.</div></div>`;
  h+=`<div class="seg" id="segMkt">`+[["all","Todos"],["GK","GR"],["DEF","DEF"],["MID","MED"],["ATT","ATA"]].map(([k,l])=>
    `<button data-p="${k}" class="${marketPos===k?'active':''}">${l}</button>`).join("")+`</div>`;
  h+=`<div class="muted" style="font-size:11px;margin-bottom:6px">Toca num jogador para ver a ficha e fazer uma proposta. Toca no nome do clube para ver o plantel.</div>`;
  h+=`<div class="plist">`+pool.map(x=>{
    const p=x.p;
    return `<div class="pl" data-scoutmk="${p.id}" data-mkfrom="${x.from}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · <span class="clink" data-club="${x.fromName}" style="text-decoration:underline">${x.fromName}</span> · pot.${p.potential}</div></div>
      <span class="muted" style="font-size:18px">›</span></div>`;
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
    <button data-t="fixtures" class="${tableTab==='fixtures'?'active':''}">Jornada</button>
    <button data-t="cup" class="${tableTab==='cup'?'active':''}">Taça</button></div>`;
  if(tableTab==="table"){
    const t=sortedTable(d), n=t.length;
    h+=`<div class="card" style="padding:6px"><table><thead><tr><th>#</th><th class="name">Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>DG</th><th>P</th></tr></thead><tbody>`;
    t.forEach((c,i)=>{const zone=(d.upSlots&&i<d.upSlots)?"zone-up":((d.downSlots&&i>=n-d.downSlots)?"zone-down":"");
      h+=`<tr class="${(mineHere&&c.id===G.myId)?'me':''} ${zone}"><td>${i+1}</td><td class="name">${swatch(c,true)} <span class="clink" data-club="${c.short}">${c.name}</span></td><td>${c.P}</td><td>${c.W}</td><td>${c.D}</td><td>${c.L}</td><td>${(c.GF-c.GA>0?'+':'')+(c.GF-c.GA)}</td><td><b>${c.Pts}</b></td></tr>`;});
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
  } else if(tableTab==="cup"){
    const cup=G.cup, ms=me().short;
    if(!cup){ h+=`<div class="card muted">Sem Taça.</div>`; }
    else {
      if(cup.active){
        const ut=cup.ties.find(t=>t.a===ms||t.b===ms);
        h+=`<div class="card"><h2>🏆 ${cupRoundName()}</h2>`;
        if(ut){const a=clubByShort(ut.a),b=ut.b?clubByShort(ut.b):null;h+=`<div class="fx" style="border-color:var(--accent)"><div class="t">${a?clubTag(a):ut.a}</div><div class="sc">${ut.b?"vs":"bye"}</div><div class="t a">${b?clubTag(b):""}</div></div>`;}
        h+=`<div class="center muted" style="font-size:12px">${cup.ties.length} jogos · ${cup.remaining.length} equipas em prova</div></div>`;
      }
      const path=[]; cup.history.forEach(hr=>{const t=hr.ties.find(x=>x.a===ms||x.b===ms); if(t)path.push({name:hr.name,t});});
      if(path.length){ h+=`<div class="card"><h2>O teu percurso</h2>`+path.slice().reverse().map(o=>{const a=clubByShort(o.t.a),b=o.t.b?clubByShort(o.t.b):null,won=o.t.w===ms;return `<div class="fx"><div class="t">${a?clubTag(a):o.t.a}</div><div class="sc">${o.t.b?(o.t.sa+"-"+o.t.sb):"bye"}</div><div class="t a">${b?clubTag(b):""}</div></div><div class="muted" style="font-size:11px;margin:-2px 0 6px">${o.name}${o.t.pens?" (penáltis)":""} — ${won?"passou":"eliminado"}</div>`;}).join("")+`</div>`; }
      if(cup.winner){const wc=clubByShort(cup.winner);h+=`<div class="card center"><h2>🏆 Vencedor da Taça</h2><div class="big">${wc?wc.name:cup.winner}</div></div>`;}
    }
  } else {
    const wk=Math.min(d.week,d.fixtures.length-1), round=d.fixtures[wk]||[], res=d.results[wk];
    h+=`<div class="card"><h2>${d.name} · Jornada ${wk+1}${d.week>=d.fixtures.length?' (final)':''}</h2>`+
      round.map(([hh,aa],i)=>{const H=d.clubs[hh],A=d.clubs[aa],r=res&&res[i];const mine=(mineHere&&(hh===G.myId||aa===G.myId));
        return `<div class="fx" style="${mine?'border-color:var(--accent)':''}"><div class="t">${clubTagFull(H)}</div><div class="sc">${r?r.hg+' - '+r.ag:'–'}</div><div class="t a">${clubTagFull(A)}</div></div>`;}).join("")+`</div>`;
  }
  return h;
}

/* ---------- jogo animado (partilhado por campeonato e Taça) ---------- */
function animateMatch(home, away, r, onFinish, userClub, userLine, pensPlay){
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box live-box"><div id="goalFlash"></div><div id="phaseBanner"></div><button id="sndBtn" class="sndbtn"></button><div id="goalBanner">⚽ GOLO!</div>
    <div class="center"><h2 style="justify-content:center">${home.name} vs ${away.name}</h2></div>
    <div class="scorebug"><div class="t">${clubTag(home)}</div><div class="sc" id="liveScore">0 - 0</div><div class="t a">${clubTag(away)}</div></div>
    <div id="liveScorers"><div class="sc-col" id="scH">—</div><div class="sc-col a" id="scA">—</div></div>
    <div class="center muted livemin" id="liveMin">0'</div>
    <div id="liveTL"><i id="liveTLfill"></i></div>
    <div id="liveMom"><i id="liveMomH"></i><i id="liveMomA"></i></div>
    <div class="livecomment" id="liveComment">Apito inicial — rola a bola!</div>
    <div class="livestats" id="liveStats">
      <div class="statline"><b id="posH">50%</b><span class="lbl">Posse</span><b id="posA">50%</b></div>
      <div class="statline"><b id="shH">0</b><span class="lbl">Remates</span><b id="shA">0</b></div>
      <div class="statline"><b id="sotH">0</b><span class="lbl">À baliza</span><b id="sotA">0</b></div>
      <div class="statline"><b id="corH">0</b><span class="lbl">Cantos</span><b id="corA">0</b></div></div>
    <div class="live" id="liveEv"></div>
    <div id="liveSquad" class="livesquad"></div>
    <button class="btn" id="liveDone" style="display:none">Continuar</button>
    <button class="btn sec small" id="liveSkip" style="width:100%;margin-top:8px">Saltar</button></div>`;
  document.body.appendChild(mo);
  const evBox=mo.querySelector("#liveEv"),scoreEl=mo.querySelector("#liveScore"),minEl=mo.querySelector("#liveMin"),goalBanner=mo.querySelector("#goalBanner");
  const tlFill=mo.querySelector("#liveTLfill"),tlEl=mo.querySelector("#liveTL"),momH=mo.querySelector("#liveMomH"),momA=mo.querySelector("#liveMomA"),commentEl=mo.querySelector("#liveComment");
  const maxMin=r.maxMinute||90;
  let hg=0,ag=0,i=0,minute=0,timer,pauseUntil=0,htDone=false,mom=50,momSumH=0,momSumA=0,commentHold=0;
  const st={H:{sh:0,sot:0,cor:0},A:{sh:0,sot:0,cor:0}};
  const evs=r.events.slice().sort((a,b)=>a.m-b.m);
  const setW=(el,pct)=>{el.style.width=pct+"%";};
  momH.style.background=home.c1;momA.style.background=away.c1;setW(momH,50);setW(momA,50);
  function shortOf(side){return side==="H"?home.short:away.short;}
  function nameOf(side){return side==="H"?home.name:away.name;}
  function showPhase(txt){const b=mo.querySelector("#phaseBanner");if(!b)return;b.textContent=txt;b.classList.remove("show");void b.offsetWidth;b.classList.add("show");}
  function nameByPid(side,pid){const club=side==="H"?home:away;const p=club.squad.find(x=>x.id===pid);return p?p.name:"jogador";}
  function gtypeSuffix(t){return t==="penalty"?" (g.p.)":t==="freekick"?" (livre)":t==="header"?" (cabeça)":"";}
  function addEvLine(side,icon,txt){const d=document.createElement("div");d.className="ev ev-"+(side==="H"?"h":"a");d.innerHTML=`<b>${txt.m}'</b> ${icon} ${shortOf(side)} — ${txt.name}`;evBox.prepend(d);}
  function tlDot(m,color){const s=document.createElement("span");s.className="tl-dot";s.style.left=clamp(m/maxMin*100,0,100)+"%";s.style.background=color;tlEl.appendChild(s);}
  function updateStats(){const tot=momSumH+momSumA||1,pH=Math.round(momSumH/tot*100);mo.querySelector("#posH").textContent=pH+"%";mo.querySelector("#posA").textContent=(100-pH)+"%";mo.querySelector("#shH").textContent=st.H.sh;mo.querySelector("#shA").textContent=st.A.sh;mo.querySelector("#sotH").textContent=st.H.sot;mo.querySelector("#sotA").textContent=st.A.sot;mo.querySelector("#corH").textContent=st.H.cor;mo.querySelector("#corA").textContent=st.A.cor;}
  function setComment(txt,hold){commentEl.style.opacity=0;setTimeout(()=>{commentEl.textContent=txt;commentEl.style.opacity=1;},110);commentHold=hold||0;}
  function colorFlash(side){const cl=side==="H"?home:away,f=mo.querySelector("#goalFlash");f.style.background=`radial-gradient(circle at 50% 38%, ${cl.c1}, transparent 70%)`;f.classList.remove("show");void f.offsetWidth;f.classList.add("show");}
  function goalCelebrate(side,nm){goalBanner.innerHTML=`⚽ GOLO!<div class="gb-sc">${nm}</div>`;goalBanner.classList.remove("show");void goalBanner.offsetWidth;goalBanner.classList.add("show");colorFlash(side);if(scoreEl.animate)scoreEl.animate([{transform:"scale(1)"},{transform:"scale(1.4)"},{transform:"scale(1)"}],{duration:500});sndCheer();vib([40,30,90]);}
  const PRESS=["{T} carrega para a frente","grande pressão do {T}","{T} instala-se no meio-campo adversário","{T} procura o golo","{T} manda no jogo"];
  const BAL=["jogo equilibrado","muita luta pela bola","as equipas estudam-se","ritmo mais partido agora"];
  const CHANCE=["quase golo do {T}!","que defesa do guarda-redes!","por muito pouco!","travessão! esteve lá perto"];
  function phrase(pool,side){return pick(pool).replace("{T}",nameOf(side));}
  const userSide=userClub?(userClub===home?"H":userClub===away?"A":null):null;
  const scorers={H:[],A:[]}, liveR={}, mk={};
  if(userSide)(userLine||[]).forEach(id=>{liveR[id]=6.0;mk[id]={g:0,yc:false,red:false};});
  const lastName=n=>String(n).split(" ").slice(-1)[0];
  function refreshScorers(){mo.querySelector("#scH").innerHTML=scorers.H.map(s=>s.n+" "+s.m+"'").join("<br>")||"—";mo.querySelector("#scA").innerHTML=scorers.A.map(s=>s.n+" "+s.m+"'").join("<br>")||"—";}
  function bumpR(pid,d){if(liveR[pid]==null)return;liveR[pid]=clamp(liveR[pid]+d,1,10);}
  function concedePenalty(){(userLine||[]).forEach(id=>{const p=userClub.squad.find(x=>x.id===id);if(!p)return;const g=GROUP[p.pos];bumpR(id,g==="GK"?-0.3:g==="DEF"?-0.14:-0.04);});}
  function renderSquad(final){ if(!userSide)return; const rc=v=>v>=7?"#16a34a":v>=5?"#d9a400":"#e5484d";
    const rows=(userLine||[]).map(id=>{const p=userClub.squad.find(x=>x.id===id);if(!p)return "";
      const m=mk[id]||{}; let ic=""; for(let k=0;k<(m.g||0);k++)ic+="⚽"; if(m.yc)ic+="🟨"; if(m.red)ic+="🟥"; if(final&&(p.injuredWeeks||0)>0)ic+="🤕";
      const rv=final?(p.lastRating!=null?p.lastRating:(liveR[id]||6)):(liveR[id]!=null?liveR[id]:6);
      return `<div class="sq-row"><span class="sq-nm"><span class="pill ${posClass(p.pos)}" style="font-size:9px">${p.pos}</span> ${p.name} ${ic}</span><b style="color:${rc(rv)}">${(+rv).toFixed(1)}</b></div>`;
    }).join("");
    const el=mo.querySelector("#liveSquad"); if(el)el.innerHTML='<div class="sq-h">A tua equipa</div>'+rows; }
  if(userSide)renderSquad(false);
  function finish(){clearInterval(timer);scoreEl.textContent=r.hg+" - "+r.ag;minEl.textContent="Final";setW(tlFill,100);showPhase("Final");sndWhistle(3);vib([40,50,40,50,80]);setComment("Apito final. "+home.name+" "+r.hg+"–"+r.ag+" "+away.name,0);
    if(onFinish)onFinish();
    if(userSide)renderSquad(true);
    const done=mo.querySelector("#liveDone");done.style.display="block";mo.querySelector("#liveSkip").style.display="none";
    if(pensPlay){done.textContent="Ir aos penáltis →";done.onclick=()=>pensPlay(mo);}
    else done.onclick=()=>{mo.remove();render();};}
  mo.querySelector("#liveSkip").onclick=finish;
  const sb=mo.querySelector("#sndBtn");if(sb){const upd=()=>sb.textContent=SND?"🔊":"🔇";upd();sb.onclick=()=>{setSound(!SND);upd();if(SND)sndWhistle(1);};}
  showPhase("Início");sndWhistle(1);vib([30]);pauseUntil=Date.now()+1100;
  timer=setInterval(()=>{
    if(Date.now()<pauseUntil)return;
    if(!htDone && maxMin>=90 && minute>=45){htDone=true;minEl.textContent="Intervalo";showPhase("Intervalo");sndWhistle(2);vib([30,40,30]);setComment("Intervalo — "+home.name+" "+hg+"–"+ag+" "+away.name,3);pauseUntil=Date.now()+2200;updateStats();return;}
    minute+=3;if(minute>maxMin)minute=maxMin;minEl.textContent=minute+"'"+(minute>90?" (prol.)":"");
    setW(tlFill,minute/maxMin*100);
    mom=clamp(mom+ri(-9,9),12,88);momSumH+=mom;momSumA+=(100-mom);setW(momH,mom);setW(momA,100-mom);
    const pres=mom>=55?"H":mom<=45?"A":null;
    let hadEvent=false;
    while(i<evs.length&&evs[i].m<=minute){const e=evs[i];i++;hadEvent=true;
      if(e.type==="goal"){if(e.side==="H")hg++;else ag++;scoreEl.textContent=hg+" - "+ag;st[e.side].sh++;st[e.side].sot++;
        const own=e.gtype==="own", realName=own?nameByPid(e.ogSide,e.ogPid):nameByPid(e.side,e.scorer), nm=own?(realName+" (auto-golo)"):(realName+gtypeSuffix(e.gtype));
        goalCelebrate(e.side,nm);addEvLine(e.side,"⚽",{m:e.m,name:nm});tlDot(e.m,"#ffcf33");
        scorers[e.side].push({n:lastName(realName)+(own?" (ag)":""),m:e.m});refreshScorers();
        if(userSide){ if(!own&&e.side===userSide){bumpR(e.scorer,1.3);if(mk[e.scorer])mk[e.scorer].g++;} else if(own&&e.ogSide===userSide)bumpR(e.ogPid,-1.0); else if(e.side!==userSide)concedePenalty(); renderSquad(false); }
        setComment("GOLO do "+nameOf(e.side)+"! "+nm,4);pauseUntil=Date.now()+2600;}
      else if(e.type==="yellow"){addEvLine(e.side,"🟨",{m:e.m,name:nameByPid(e.side,e.pid)});tlDot(e.m,"#f2c200");if(userSide&&e.side===userSide){bumpR(e.pid,-0.3);if(mk[e.pid])mk[e.pid].yc=true;renderSquad(false);}setComment("Amarelo — "+nameOf(e.side)+" · "+nameByPid(e.side,e.pid),2);pauseUntil=Date.now()+1500;}
      else if(e.type==="red"){addEvLine(e.side,"🟥",{m:e.m,name:nameByPid(e.side,e.pid)+(e.second?" (2º amarelo)":"")});tlDot(e.m,"#ef4657");if(userSide&&e.side===userSide){bumpR(e.pid,-1.3);if(mk[e.pid])mk[e.pid].red=true;renderSquad(false);}setComment("Vermelho para o "+nameOf(e.side)+"! "+nameByPid(e.side,e.pid),4);pauseUntil=Date.now()+2000;}
      else if(e.type==="disallowed"){addEvLine(e.side,"🚫",{m:e.m,name:"golo anulado"});st[e.side].sot++;setComment("Golo anulado ao "+nameOf(e.side)+"!",3);pauseUntil=Date.now()+1700;}
      else if(e.type==="penmiss"){addEvLine(e.side,"❌",{m:e.m,name:nameByPid(e.side,e.pid)+" — penálti falhado"});st[e.side].sh++;st[e.side].sot++;if(userSide&&e.side===userSide){bumpR(e.pid,-0.8);renderSquad(false);}setComment("Penálti falhado — "+nameOf(e.side)+" · "+nameByPid(e.side,e.pid),3);pauseUntil=Date.now()+1800;}
    }
    if(pres){if(Math.random()<0.5)st[pres].sh++;if(Math.random()<0.22)st[pres].sot++;if(Math.random()<0.14)st[pres].cor++;
      if(userSide&&pres===userSide){const ids=(userLine||[]).filter(id=>{const p=userClub.squad.find(x=>x.id===id);return p&&GROUP[p.pos]!=="GK";});if(ids.length)bumpR(pick(ids),0.05);}}
    if(userSide)renderSquad(false);
    if(commentHold>0)commentHold--;
    else if(!hadEvent){const roll=Math.random();
      if(roll<0.12&&pres){setComment(phrase(CHANCE,pres),1);st[pres].sh++;if(Math.random()<0.5)st[pres].sot++;pauseUntil=Date.now()+1000;}
      else if(roll<0.5){setComment(pres?phrase(PRESS,pres):pick(BAL),0);pauseUntil=Date.now()+750;}}
    updateStats();
    if(minute>=maxMin)finish();
  },240);
}
function playMatchAnimated(){
  const next=nextFixture(); if(!next){playWeek();render();return;}
  const c=me(), opp=myClubs()[next.opp];
  const home=next.home?c:opp, away=next.home?opp:c;
  const myLine=availableLineup(c,G.lineup,G.formation), oppLine=autoPickLineup(opp,"4-4-2",opp.susp);
  const hLine=next.home?myLine:oppLine, aLine=next.home?oppLine:myLine;
  const eMy=energyFactor(c,myLine);
  const r=simulate(home,away,hLine,aLine,next.home?eMy:1,next.home?1:eMy);
  r.userLine=myLine;
  animateMatch(home,away,r,()=>playWeek(r),c,myLine);
}

/* ---------- Taça ---------- */
function playCupTie(){
  const cup=G.cup; if(!cup||!cup.active)return;
  if(!cupAvailable()){ toast("A próxima eliminatória é na jornada "+cupRoundDue()+" do campeonato"); return; }
  const ms=me().short, ut=cupUserTie();
  if(!cup.userAlive||!ut){ cupAdvanceRound(); render(); toast("Eliminatória simulada"); return; }
  if(!ut.b){ cupAdvanceRound(); render(); toast("Passaste por folga (bye)"); return; }
  if(!ensureValidXI())return;
  const c=me(), aShort=ut.a, bShort=ut.b, ca=clubByShort(aShort), cb=clubByShort(bShort), userIsA=(aShort===ms);
  const aLine=userIsA?availableLineup(c,G.lineup,G.formation):autoPickLineup(ca,"4-4-2",ca.susp);
  const bLine=userIsA?autoPickLineup(cb,"4-4-2",cb.susp):availableLineup(c,G.lineup,G.formation);
  const eA=userIsA?energyFactor(c,aLine):1, eB=userIsA?1:energyFactor(c,bLine);
  const r=simulate(ca,cb,aLine,bLine,eA,eB);
  const userLine=userIsA?aLine:bLine;
  if(r.hg===r.ag){ const et=simulateET(ca,cb,aLine,bLine,eA,eB,r.expelledH,r.expelledA); r.events=r.events.concat(et.events); r.hg+=et.hg; r.ag+=et.ag; r.maxMinute=120; r.hadET=true; }
  const needsPens=(r.hg===r.ag);
  const shoot=needsPens?penaltyShootout(teamStrength(ca,aLine,"4-4-2","Equilibrado").overall,teamStrength(cb,bLine,"4-4-2","Equilibrado").overall):null;
  animateMatch(ca,cb,r,()=>{
    processEnergyInjuries(c,userLine); rateUserMatch(c,userLine,r,userIsA); updateForm(c,userLine); updateChem(userLine); trainTick(c,userLine); updateMorale(c,userLine,userIsA?r.hg:r.ag,userIsA?r.ag:r.hg);
    if(!needsPens){ const w=r.hg>r.ag?aShort:bShort; cupAdvanceRound({sa:r.hg,sb:r.ag,w,pens:false,et:r.hadET}); const how=r.hadET?" no prolongamento":""; toast(w===ms?("Passaste"+how+"!"):("Eliminado da Taça"+how)); }
  }, c, userLine, needsPens?(matchMo)=>{
    animateShootout(ca,cb,shoot,(winSide)=>{
      const w=winSide==="A"?aShort:bShort;
      cupAdvanceRound({sa:r.hg,sb:r.ag,w,pens:true,et:r.hadET});
      if(matchMo)matchMo.remove();
      toast(w===ms?"Passaste nos penáltis!":"Eliminado nos penáltis");
      render();
    });
  }:null);
}
function animateShootout(ca,cb,shoot,onDone){
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box pen-box">
    <div class="center"><h2 style="justify-content:center">⚽ Grande penalidade</h2></div>
    <div class="scorebug"><div class="t">${clubTag(ca)}</div><div class="sc" id="penScore">0 - 0</div><div class="t a">${clubTag(cb)}</div></div>
    <div class="pen-row" id="penRowA"></div>
    <div class="pen-row" id="penRowB"></div>
    <div class="pen-status" id="penStatus">Preparados…</div>
    <button class="btn" id="penDone" style="display:none">Continuar</button></div>`;
  document.body.appendChild(mo);
  const scoreEl=mo.querySelector("#penScore"),rowA=mo.querySelector("#penRowA"),rowB=mo.querySelector("#penRowB"),statusEl=mo.querySelector("#penStatus");
  const na=shoot.kicks.filter(k=>k.team==="A").length, nb=shoot.kicks.filter(k=>k.team==="B").length;
  for(let i=0;i<Math.max(5,na);i++){const s=document.createElement("span");s.className="pen-mark";s.textContent="•";rowA.appendChild(s);}
  for(let i=0;i<Math.max(5,nb);i++){const s=document.createElement("span");s.className="pen-mark";s.textContent="•";rowB.appendChild(s);}
  let a=0,b=0,idx=0,aIdx=0,bIdx=0;
  function step(){
    if(idx>=shoot.kicks.length){finishPens();return;}
    const k=shoot.kicks[idx], team=k.team==="A"?ca:cb;
    statusEl.textContent=team.name+" prepara-se para bater…";
    setTimeout(()=>{
      const mark=(k.team==="A"?rowA:rowB).children[k.team==="A"?aIdx:bIdx];
      if(k.scored){ if(k.team==="A")a++;else b++; if(mark){mark.textContent="⚽";mark.classList.add("pgoal");} statusEl.innerHTML='<b style="color:var(--green2)">GOLO!</b>'; sndCheer(); vib([40,30,80]); }
      else { if(mark){mark.textContent="❌";mark.classList.add("pmiss");} statusEl.innerHTML='<b style="color:var(--red)">Falhou!</b>'; sndThud(); vib([130]); }
      if(k.team==="A")aIdx++;else bIdx++;
      scoreEl.textContent=a+" - "+b; idx++;
      setTimeout(step,950);
    },1000);
  }
  function finishPens(){
    const wc=shoot.winner==="A"?ca:cb;
    statusEl.innerHTML='<b style="color:var(--accent)">'+wc.name+' vence nos penáltis! ('+a+'–'+b+')</b>';
    sndWhistle(3); vib([40,50,40]);
    const d=mo.querySelector("#penDone");d.style.display="block";d.onclick=()=>{mo.remove();onDone(shoot.winner);};
  }
  setTimeout(step,800);
}
function showCupResult(userTie){
  const cup=G.cup, ms=me().short;
  const mo=document.createElement("div");mo.className="modal";
  let inner=`<div class="box"><div class="center"><h2 style="justify-content:center">🏆 Taça</h2></div>`;
  if(userTie&&userTie.b){
    const a=clubByShort(userTie.a), b=clubByShort(userTie.b), adv=userTie.w===ms;
    inner+=`<div class="fx"><div class="t">${a?clubTag(a):userTie.a}</div><div class="sc">${userTie.sa} - ${userTie.sb}</div><div class="t a">${b?clubTag(b):userTie.b}</div></div>`;
    if(userTie.pens)inner+=`<div class="center muted" style="font-size:12px">decidido nos penáltis</div>`;
    inner+=`<div class="center" style="margin:10px 0;font-weight:800;color:${adv?'var(--green2)':'var(--red)'}">${adv?"Passaste à eliminatória seguinte!":"Foste eliminado da Taça."}</div>`;
  } else if(userTie&&!userTie.b){ inner+=`<div class="center" style="margin:10px 0">Passaste por folga (bye).</div>`; }
  else { inner+=`<div class="center muted" style="margin:10px 0">Eliminatória simulada.</div>`; }
  if(!cup.active&&cup.winner){ const wc=clubByShort(cup.winner); inner+=`<div class="center" style="margin:10px 0"><b>🏆 ${wc?wc.name:cup.winner}</b> venceu a Taça.</div>`; }
  else if(cup.active){ inner+=`<div class="center muted" style="font-size:12px;margin-bottom:8px">Segue para: ${cupRoundName()} (${cup.remaining.length} equipas)</div>`; }
  inner+=`<button class="btn" id="cupDone">Continuar</button></div>`;
  mo.innerHTML=inner; document.body.appendChild(mo);
  mo.querySelector("#cupDone").onclick=()=>{mo.remove();render();};
}

/* ---------- eventos ---------- */
function cupBlocksLeague(){
  if(!cupAvailable())return false;
  const ut=cupUserTie();
  if(G.cup.userAlive&&ut&&ut.b)return true;   // tens mesmo de jogar a tua eliminatória
  cupAdvanceRound();                           // folga (bye) ou já eliminado — resolve sozinho
  return false;
}
function bindView(){
  document.querySelectorAll("[data-meet]").forEach(b=>b.onclick=()=>{const r=resolveBoardMeeting(b.dataset.meet);toast(r.msg);TAB="home";render();});
  const meetBlock=()=>{ if(G.meeting&&G.meeting.active){ toast("Responde primeiro à reunião com a direção.");TAB="home";render();return true; } return false; };
  const bp=$("#btnPlay");if(bp)bp.onclick=()=>{if(meetBlock())return;if(cupBlocksLeague()){toast("Joga primeiro a eliminatória da Taça (jornada "+cupRoundDue()+")");TAB="home";render();return;}if(!ensureValidXI())return;playMatchAnimated();};
  const bcup=$("#btnCup");if(bcup)bcup.onclick=()=>{if(meetBlock())return;playCupTie();};
  const bs=$("#btnSim");if(bs)bs.onclick=()=>{if(meetBlock())return;if(cupBlocksLeague()){toast("Joga primeiro a eliminatória da Taça");TAB="home";render();return;}if(!ensureValidXI())return;const d=myDivObj();while(d.week<d.fixtures.length){playWeek();if(G.meeting&&G.meeting.active)break;}toast("Época simulada");render();};
  const bn=$("#btnNewSeason");if(bn)bn.onclick=()=>{newSeason();track("nova-epoca", G.manager.name+" · "+me().name+" ("+myDivObj().name+")");TAB="home";render();};
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
  document.querySelectorAll("[data-scoutmk]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-club]"))return;const from=+el.dataset.mkfrom,p=myClubs()[from]&&myClubs()[from].squad.find(x=>x.id===+el.dataset.scoutmk);if(p)openScout(p,{fromId:from,clubName:myClubs()[from].short});});
  document.querySelectorAll("[data-club]").forEach(el=>el.onclick=e=>{e.stopPropagation();openClubSquad(el.dataset.club);});
  const bab=$("#btnAskBudget");if(bab)bab.onclick=()=>{const r=requestBudget();toast(r.msg);render();};
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
    <div class="muted" style="font-size:11px;margin-top:16px;max-width:340px">Clubes e nomes reais da AF Braga. Cores provisórias. Jogadores e atributos fictícios.</div>
    <div class="muted" style="font-size:10px;margin-top:22px;opacity:.55">made by Rui Xavier - Nemec</div>`;
  document.body.appendChild(el);
  const divSel=el.querySelector("#divSel"), clubSel=el.querySelector("#clubSel");
  function fillClubs(){clubSel.innerHTML=divDefs[+divSel.value].clubs.map((c,i)=>`<option value="${i}">${c.n}</option>`).join("");}
  fillClubs(); divSel.onchange=fillClubs;
  el.querySelector("#startBtn").onclick=()=>{
    const nm=(el.querySelector("#mgrName").value||"").trim();
    if(nm.length<4){
      let e=el.querySelector("#nmErr");
      if(!e){e=document.createElement("div");e.id="nmErr";e.style.cssText="color:var(--red);font-size:12px;margin-top:8px";el.querySelector("#startBtn").after(e);}
      e.textContent="O nome do treinador precisa de pelo menos 4 caracteres.";
      el.querySelector("#mgrName").focus(); return;
    }
    newGame(+divSel.value,+clubSel.value,nm);track("nova-carreira/"+me().short, G.manager.name+" · "+me().name+" ("+myDivObj().name+")");el.remove();TAB="home";render();
  };
}
function boot(){
  document.getElementById("splash")?.remove();
  if(load()&&G){TAB="home";render();}
  else{splashScreen();}
}

/* ---------- estatísticas de utilização (GoatCounter, opcional) ---------- */
function initAnalytics(){
  try{
    const code=(typeof GAME_DATA!=="undefined"&&GAME_DATA&&GAME_DATA.goatcounter)||"";
    if(!code)return;
    const sc=document.createElement("script");
    sc.async=true; sc.src="//gc.zgo.at/count.js";
    sc.setAttribute("data-goatcounter","https://"+code+".goatcounter.com/count");
    document.head.appendChild(sc);
  }catch(e){}
}
function track(path,title){ try{ if(window.goatcounter&&window.goatcounter.count) window.goatcounter.count({path:path,title:title||path,event:true}); }catch(e){} }

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
initAnalytics();
boot();
