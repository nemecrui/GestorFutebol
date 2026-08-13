"use strict";
/* ============================================================
   GESTOR AF BRAGA — ui.js  (interface)
   Usa as funções/dados globais definidos em engine.js.
   ============================================================ */

let TAB="home", tacSel=null, squadFilter="all", marketPos="all", tableTab="table", leagueDiv=null, squadTab="main", marketTab="clubs";
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
/* ---------- novidades / changelog ---------- */
const NEWS_LIST=(typeof GAME_DATA!=="undefined"&&GAME_DATA&&GAME_DATA.novidades)||[];
function newsSig(){ return NEWS_LIST.length+"|"+(NEWS_LIST[0]?NEWS_LIST[0].data:""); }
function hasNewsNew(){ if(!NEWS_LIST.length)return false; try{ return localStorage.getItem("gf_news")!==newsSig(); }catch(e){ return false; } }
function markNewsSeen(){ try{ localStorage.setItem("gf_news",newsSig()); }catch(e){} }
function openNews(){
  markNewsSeen();
  const fmt=d=>{const p=String(d||"").split("-");return p.length===3?p[2]+"/"+p[1]+"/"+p[0]:(d||"");};
  const rows=NEWS_LIST.length? NEWS_LIST.map(n=>`<div style="border-bottom:1px solid var(--line);padding:9px 2px"><div class="muted" style="font-size:11px">${fmt(n.data)}</div><div style="font-size:14px;line-height:1.35">${n.texto}</div></div>`).join("") : `<div class="muted">Sem novidades de momento.</div>`;
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><button class="close" id="nwClose">✕</button>
    <div style="font-weight:800;font-size:16px;margin-bottom:4px">🔔 Novidades</div>
    <div class="muted" style="font-size:12px;margin-bottom:8px">O que mudou no jogo recentemente.</div>
    ${rows}
    <button class="btn" id="nwOk" style="margin-top:12px">Fechar</button></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#nwClose").onclick=close; mo.querySelector("#nwOk").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
}
function openRecords(){
  const R=(typeof ensureRecords==="function")?ensureRecords():(G.records||{}); const aw=G.awards||[];
  const rec=(icon,label,val)=>val?`<div class="row between" style="border-bottom:1px solid var(--line);padding:6px 2px;font-size:13px"><span>${icon} ${label}</span><b>${val}</b></div>`:"";
  const recs=[
    rec("💥","Maior vitória", R.bigWin?(R.bigWin.gf+"–"+R.bigWin.ga+" vs "+(R.bigWin.opp||"?")+" (ép. "+R.bigWin.season+")"):null),
    rec("🔻","Maior derrota", R.bigLoss?(R.bigLoss.gf+"–"+R.bigLoss.ga+" vs "+(R.bigLoss.opp||"?")+" (ép. "+R.bigLoss.season+")"):null),
    rec("🛡️","Melhor série sem perder", R.bestUnbeaten?(R.bestUnbeaten.n+" jogos"):null),
    rec("🔥","Melhor série de vitórias", R.bestWins?(R.bestWins.n+" jogos"):null),
    rec("⚽","Mais golos numa época", R.mostGoals?(R.mostGoals.n+" (ép. "+R.mostGoals.season+")"):null),
    rec("📊","Mais pontos numa época", R.mostPoints?(R.mostPoints.n+" (ép. "+R.mostPoints.season+")"):null),
    rec("🥇","Melhor classificação", R.bestPos?(R.bestPos.n+"º · "+R.bestPos.division+" (ép. "+R.bestPos.season+")"):null)
  ].join("")||`<div class="muted" style="font-size:13px">Ainda sem recordes — joga umas jornadas.</div>`;
  const awards=aw.length? aw.map(a=>{ const icon=a.type==="bota"?"🥇":"⭐"; const t=a.type==="bota"?("Bota de Ouro · "+a.player+" ("+a.goals+")"):("Jogador do Ano · "+a.player);
      return `<div class="row between" style="border-bottom:1px solid var(--line);padding:6px 2px;font-size:13px"><span${a.mine?' style="color:var(--accent)"':''}>${icon} ${t} <span class="muted">${a.club}</span></span><span class="muted" style="font-size:12px">ép. ${a.season}</span></div>`;
    }).join("") : `<div class="muted" style="font-size:13px">Ainda sem prémios individuais.</div>`;
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><button class="close" id="rcClose">✕</button>
    <div style="font-weight:800;font-size:16px;margin-bottom:8px">🏅 Recordes & Prémios</div>
    <h2 style="color:var(--muted);font-size:12px;margin:6px 0 2px">Recordes de carreira</h2>${recs}
    <h2 style="color:var(--muted);font-size:12px;margin:12px 0 2px">Prémios por época</h2>${awards}
    <button class="btn" id="rcOk" style="margin-top:12px">Fechar</button></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#rcClose").onclick=close; mo.querySelector("#rcOk").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
}
function openCareer(){
  const C=(typeof ensureCareer==="function")?ensureCareer():(G.career||{spells:[],seasons:[]});
  const M=G.manager||{name:"Treinador",reputation:40,seasons:0,stats:{},trophies:[]};
  const st=M.stats||{P:0,W:0,D:0,L:0,GF:0,GA:0}, tr=(M.trophies||[]).slice();
  const winPct=st.P?Math.round(st.W/st.P*100):0;
  // palmarés agrupado
  const groups=[
    {k:"league", ic:"🥇", label:"Campeonatos"},
    {k:"honra",  ic:"🏆", label:"Divisão de Honra"},
    {k:"cup",    ic:"🏆", label:"Taças"},
    {k:"supercup",ic:"🏅",label:"Supertaças"},
    {k:"promo",  ic:"⬆️", label:"Subidas"}
  ];
  const palmares=groups.map(g=>{ const items=tr.filter(t=>t.type===g.k); if(!items.length)return "";
    return `<div class="row between" style="border-bottom:1px solid var(--line);padding:6px 2px;font-size:13px"><span>${g.ic} ${g.label}</span><b>${items.length}</b></div>`;
  }).join("")||`<div class="muted" style="font-size:13px">Ainda sem troféus.</div>`;
  // passagens por clube
  const spells=(C.spells||[]).slice().reverse().map(s=>{
    const per=s.to==null?("ép. "+s.from+" – atual"):(s.from===s.to?("ép. "+s.from):("ép. "+s.from+"–"+s.to));
    return `<div class="row between" style="border-bottom:1px solid var(--line);padding:6px 2px;font-size:13px"><span>${s.name}</span><span class="muted" style="font-size:12px">${per}</span></div>`;
  }).join("")||`<div class="muted" style="font-size:13px">—</div>`;
  // época a época
  const posCol=(p,of)=>{ const c=p===1?"#f5c518":p<=Math.max(1,Math.round(of*0.25))?"#16a34a":p>of-3?"#e5484d":"var(--muted)"; return `<b style="color:${c}">${p}º</b>`; };
  const seasons=(C.seasons||[]).slice().reverse().map(s=>{
    const tsea=(M.trophies||[]).filter(t=>t.season===s.season);
    const trIc=tsea.map(t=>t.type==="league"?"🥇":t.type==="cup"?"🏆":t.type==="honra"?"🏆":t.type==="supercup"?"🏅":"⬆️").join("");
    return `<div style="border-bottom:1px solid var(--line);padding:6px 2px;font-size:12px">
      <div class="row between"><span><b>ép. ${s.season}</b> · ${s.name} ${trIc}</span>${posCol(s.pos,s.of)}</div>
      <div class="muted" style="font-size:11px">${s.div} · ${s.W}-${s.D}-${s.L} · ${s.pts} pts · ${s.GF}-${s.GA} golos (${s.pos}/${s.of})</div></div>`;
  }).join("")||`<div class="muted" style="font-size:13px">Ainda sem épocas concluídas — o resumo aparece no fim de cada época.</div>`;
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><button class="close" id="caClose">✕</button>
    <div style="font-weight:800;font-size:17px;margin-bottom:2px">📖 ${M.name}</div>
    <div class="muted" style="font-size:12px;margin-bottom:10px">Reputação ${M.reputation} · ${M.seasons||0} época(s) na carreira</div>
    <div class="grid2" style="margin-bottom:8px">
      <div class="stat"><div class="v">${st.W}-${st.D}-${st.L}</div><div class="l">V-E-D</div></div>
      <div class="stat"><div class="v">${winPct}%</div><div class="l">Vitórias</div></div>
      <div class="stat"><div class="v">${st.P}</div><div class="l">Jogos</div></div>
      <div class="stat"><div class="v">${st.GF}-${st.GA}</div><div class="l">Golos M-S</div></div></div>
    <h2 style="color:var(--muted);font-size:12px;margin:10px 0 2px">🏅 Palmarés (${tr.length})</h2>${palmares}
    <h2 style="color:var(--muted);font-size:12px;margin:12px 0 2px">👔 Clubes</h2>${spells}
    <h2 style="color:var(--muted);font-size:12px;margin:12px 0 2px">📅 Época a época</h2>${seasons}
    <button class="btn" id="caOk" style="margin-top:12px">Fechar</button></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#caClose").onclick=close; mo.querySelector("#caOk").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
}
function textOn(hex){const c=hex.replace("#","");const r=parseInt(c.substr(0,2),16),g=parseInt(c.substr(2,2),16),b=parseInt(c.substr(4,2),16);return (0.299*r+0.587*g+0.114*b)>150?"#111":"#fff";}
function ratingClass(v){return v>=72?"r-hi":v>=60?"r-mid":"r-lo";}
function posClass(pos){return "pos-"+GROUP[pos];}
function swatch(cl,sm){return `<span class="swatch ${sm?'sm':''}" style="background:linear-gradient(135deg,${cl.c1} 0 55%,${cl.c2} 55% 100%)"></span>`;}
function clubTag(cl,sm){return swatch(cl,sm)+`<span>${cl.short}</span>`;}
function clubTagFull(cl){return swatch(cl)+`<span class="full clink" data-club="${cl.gid}">${cl.name}</span>`;}
function attrColor(v){return v>=15?"#16a34a":v>=11?"#d9a400":"#e5484d";}
function teamMoraleAvg(club){const a=club.squad||[];return a.length?a.reduce((s,p)=>s+(p.morale==null?70:p.morale),0)/a.length:70;}

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
function lastUserResultTxt(){
  const d=myDivObj(); if(!d.results.length)return "—";
  const round=d.results[d.results.length-1]; const m=round.find(r=>r.h===G.myId||r.a===G.myId); if(!m)return "—";
  const isH=m.h===G.myId, opp=myClubs()[isH?m.a:m.h], gf=isH?m.hg:m.ag, ga=isH?m.ag:m.hg;
  return me().short+" "+gf+"–"+ga+" "+(opp?opp.short:"?");
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
function eventIcon(key,tone){
  const bg=tone==="bizarro"?"#3b2f00":"#12233f", ac=tone==="bizarro"?"#ffcf33":"#3b8cff";
  let g="";
  if(key==="jovem")g=`<polygon points="24,10 28,20 39,20 30,27 33,38 24,31 15,38 18,27 9,20 20,20" fill="${ac}"/>`;
  else if(key==="presidente")g=`<rect x="19" y="12" width="10" height="6" rx="2" fill="${ac}"/><polygon points="24,18 28,22 24,38 20,22" fill="${ac}"/>`;
  else if(key==="adepto")g=`<rect x="12" y="20" width="24" height="7" rx="3" fill="${ac}"/><rect x="20" y="24" width="7" height="14" rx="3" fill="${ac}"/><rect x="14" y="20" width="4" height="9" fill="#ffffff" opacity=".5"/>`;
  else if(key==="rival")g=`<circle cx="24" cy="24" r="13" fill="none" stroke="${ac}" stroke-width="3"/><line x1="17" y1="19" x2="22" y2="21" stroke="${ac}" stroke-width="3" stroke-linecap="round"/><line x1="31" y1="19" x2="26" y2="21" stroke="${ac}" stroke-width="3" stroke-linecap="round"/><path d="M19 31 Q24 27 29 31" stroke="${ac}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  else if(key==="telemovel")g=`<rect x="17" y="10" width="14" height="28" rx="3" fill="none" stroke="${ac}" stroke-width="3"/><circle cx="24" cy="33" r="1.6" fill="${ac}"/>`;
  else g=`<circle cx="24" cy="24" r="3" fill="${ac}"/><line x1="24" y1="9" x2="24" y2="16" stroke="${ac}" stroke-width="3" stroke-linecap="round"/><line x1="24" y1="32" x2="24" y2="39" stroke="${ac}" stroke-width="3" stroke-linecap="round"/><line x1="9" y1="24" x2="16" y2="24" stroke="${ac}" stroke-width="3" stroke-linecap="round"/><line x1="32" y1="24" x2="39" y2="24" stroke="${ac}" stroke-width="3" stroke-linecap="round"/><line x1="14" y1="14" x2="18" y2="18" stroke="${ac}" stroke-width="3" stroke-linecap="round"/><line x1="34" y1="14" x2="30" y2="18" stroke="${ac}" stroke-width="3" stroke-linecap="round"/>`;
  return `<span style="display:inline-flex;width:48px;height:48px;border-radius:12px;background:${bg};align-items:center;justify-content:center;flex:0 0 auto"><svg width="48" height="48" viewBox="0 0 48 48">${g}</svg></span>`;
}
function eventCardHtml(e){
  const toneTag=e.tone==="bizarro"?'<span class="tag" style="color:#ffcf33;font-weight:800;font-size:10px">😜 BIZARRO</span>':'<span class="tag" style="color:#3b8cff;font-weight:800;font-size:10px">📌 HISTÓRIA</span>';
  let inner=`<div class="card" style="border-color:${e.tone==="bizarro"?"rgba(255,207,51,.4)":"rgba(59,140,255,.4)"}">
    <div class="row" style="gap:10px;align-items:flex-start;margin-bottom:8px">${eventIcon(e.icon,e.tone)}
      <div><div style="font-weight:800;font-size:15px">${e.title}</div><div style="margin-top:1px">${toneTag}</div></div></div>
    <div style="font-size:13px;line-height:1.5;margin-bottom:10px">${e.text}</div>`;
  if(!e.done){
    inner+=e.choices.map((c,i)=>`<button class="btn sec small" data-evc="${i}" style="width:100%;margin-bottom:8px;text-align:left">${c.label}</button>`).join("");
  } else {
    inner+=`<div style="font-size:13px;line-height:1.5;color:var(--accent);margin-bottom:10px">${e.result}</div>
      <button class="btn" id="btnEventCont">Continuar</button>`;
  }
  return inner+`</div>`;
}
/* ---------- Cartão partilhável dos grandes momentos ---------- */
function _hex(h){h=(h||"#1d4ed8").replace("#","");return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
function mixHex(a,b,t){const A=_hex(a),B=_hex(b);return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("");}
function _rrPath(x,X,Y,W,H,R){x.beginPath();x.moveTo(X+R,Y);x.arcTo(X+W,Y,X+W,Y+H,R);x.arcTo(X+W,Y+H,X,Y+H,R);x.arcTo(X,Y+H,X,Y,R);x.arcTo(X,Y,X+W,Y,R);x.closePath();}
function shareCard(o){
  const S=1080, cv=document.createElement("canvas");cv.width=cv.height=S;const x=cv.getContext("2d");
  const c1=o.c1||"#1d4ed8", c2=o.c2||"#ffffff";
  const g=x.createLinearGradient(0,0,S,S);g.addColorStop(0,mixHex(c1,"#0a0e14",0.55));g.addColorStop(1,"#070a10");x.fillStyle=g;x.fillRect(0,0,S,S);
  x.fillStyle=c1;x.fillRect(0,0,S,16);
  x.textAlign="center";
  x.fillStyle="#ffcf33";x.font="800 42px Arial";x.fillText("GESTOR DE FUTEBOL",S/2,120);
  _rrPath(x,S/2-95,175,190,190,26);x.fillStyle=c1;x.fill();                 // chip do clube (2 cores)
  x.save();_rrPath(x,S/2-95,175,190,190,26);x.clip();x.fillStyle=c2;x.fillRect(S/2,175,95,190);x.restore();
  x.fillStyle="#ffffff";x.strokeStyle="#0a0e14";x.lineWidth=6;x.font="800 66px Arial";x.strokeText(o.ini||"",S/2,295);x.fillText(o.ini||"",S/2,295);
  const t=o.title||"";x.fillStyle="#eaf1f8";x.font="800 "+(t.length>11?76:118)+"px Arial";x.fillText(t,S/2,530);
  if(o.sub){x.fillStyle="#cfe0f0";x.font="700 46px Arial";x.fillText(o.sub,S/2,608);}
  if(o.detail){_rrPath(x,120,676,S-240,116,24);x.fillStyle="rgba(255,207,51,0.15)";x.fill();x.fillStyle="#ffe9a8";x.font="700 44px Arial";x.fillText(o.detail,S/2,748);}
  x.fillStyle="#22c55e";x.font="800 62px Arial";x.fillText("gestorfutebol.pt",S/2,980);
  x.fillStyle="#93a2b6";x.font="600 32px Arial";x.fillText("joga grátis no telemóvel",S/2,1030);
  return cv.toDataURL("image/png");
}
function _dlImg(dataURL,filename){ try{const a=document.createElement("a");a.href=dataURL;a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),500);toast("Imagem guardada — partilha nos stories!");}catch(e){toast("Não foi possível gerar a imagem.");} }
function doShare(dataURL,filename,text){
  try{ if(navigator.canShare){ fetch(dataURL).then(r=>r.blob()).then(b=>{ const file=new File([b],filename,{type:"image/png"});
        if(navigator.canShare({files:[file]}))return navigator.share({files:[file],text}).catch(()=>_dlImg(dataURL,filename));
        _dlImg(dataURL,filename); }).catch(()=>_dlImg(dataURL,filename)); return; } }catch(e){}
  _dlImg(dataURL,filename);
}
function shareTrophy(kind){
  const c=me(); let title="GESTOR DE FUTEBOL", sub=c.name;
  if(kind==="champ"){title="CAMPEÕES!";sub=myDivObj().name;}
  else if(kind==="promo"){title="SUBIMOS!";sub=myDivObj().name;}
  else if(kind==="cup"){title="TAÇA CONQUISTADA!";sub="Vencedor da Taça";}
  else if(kind==="final"){title="CAMPEÃO DA HONRA!";sub="Finalíssima";}
  else if(kind==="super"){title="SUPERTAÇA!";sub="Campeão da Supertaça";}
  doShare(shareCard({c1:c.c1,c2:c.c2,ini:c.short,title,sub,detail:c.name+" · Época "+G.season}),"gestorfutebol.png","Gestor de Futebol — "+title+" · gestorfutebol.pt");
}
function rivalCardHtml(){
  const r=G.rival; if(!r)return ""; const rc=clubByGid(r.gid); if(!rc)return "";
  const mood=r.mood>=3?"confiante 😏":(r.mood<=-3?"em baixo 😰":"atento 👀"), h2h=r.h2h||{w:0,d:0,l:0};
  return `<div class="card"><h2>🗣️ Rival da época</h2>
    <div class="row between" style="align-items:center">
      <div class="row" style="gap:8px">${swatch(rc,true)}<div><b>${rc.name}</b><div class="muted" style="font-size:11px">Treinador: ${r.name} · ${mood}</div></div></div>
      <div style="text-align:right"><div class="muted" style="font-size:11px">Confrontos</div><b>${h2h.w}V · ${h2h.d}E · ${h2h.l}D</b></div>
    </div></div>`;
}
function viewHome(){
  const c=me(), d=myDivObj(), table=sortedTable(d);
  const rank=table.findIndex(x=>x.id===G.myId)+1;
  const next=nextFixture(), done=d.week>=d.fixtures.length;
  let h="";
  if(G.event && !G.fired) h+=eventCardHtml(G.event);
  if(G.fired){
    let fh=`<div class="card center"><h2 style="color:var(--red);justify-content:center">Foste despedido</h2>
      <div class="muted" style="margin:6px 0 4px">A direção do ${c.name} dispensou-te.</div>
      <div style="margin:2px 0 12px;font-size:13px">${G.firedReason||"—"}</div>`;
    const midFire = !G.seasonDone && myDivObj().week < myDivObj().fixtures.length;
    if((G.offers||[]).length){
      fh+=`<div class="muted" style="font-size:12px;margin-bottom:8px;line-height:1.4">${midFire
        ? "Assumindo agora, <b style=\"color:var(--accent)\">continuas esta época</b> a partir da jornada "+(myDivObj().week+1)+" (herdas a posição do clube), com algumas jornadas de margem."
        : "Escolhendo um clube, <b style=\"color:var(--accent)\">começas uma época nova</b> nesse clube."}</div>`;
      fh+=`<div class="muted" style="font-size:13px;margin-bottom:8px">Clubes interessados em ti:</div>`;
      G.offers.forEach((o,i)=>{fh+=`<button class="btn sec" data-job="${i}" style="margin-bottom:8px">Assumir ${o.name} · ${G.divisions[o.divIdx].name} <span style="opacity:.7;font-weight:600">(${midFire?"continuar época":"nova época"})</span></button>`;});
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
  if(G.capMeeting&&G.capMeeting.active){
    h+=`<div class="card" style="border-color:#f5c518"><h2 style="color:#f5c518">🧢 Reunião sobre o capitão</h2>
      <div style="font-size:13px;margin-bottom:10px">A direção acha que o capitão <b>${G.capMeeting.name}</b> anda a jogar de menos e o balneário está incomodado. O que respondes?</div>
      <button class="btn sec small" data-capmeet="prometer" style="width:100%;margin-bottom:6px">Vou voltar a dar-lhe minutos</button>
      <button class="btn warn small" data-capmeet="firme" style="width:100%">Ele joga quando merecer</button>
      <div class="muted" style="font-size:11px;margin-top:8px">Tens de responder antes do próximo jogo.</div></div>`;
  }
  if(G.discipline&&G.discipline.active){
    const D=G.discipline;
    h+=`<div class="card" style="border-color:#e5484d"><h2 style="color:#e5484d">⚠️ Caso de indisciplina</h2>
      <div style="font-size:13px;margin-bottom:6px"><b>${D.name}</b> ${D.situation}.</div>
      <div class="muted" style="font-size:12px;margin-bottom:10px">Na conversa contigo, ${D.justification}.</div>
      <button class="btn warn small" data-disc="suspender" style="width:100%;margin-bottom:6px">🚫 Suspender do próximo jogo (mais grave)</button>
      <button class="btn sec small" data-disc="multa" style="width:100%;margin-bottom:6px">💶 Multa: ${D.multa}</button>
      <button class="btn sec small" data-disc="moral" style="width:100%;margin-bottom:6px">🗣️ Repreensão em privado (leve)</button>
      <button class="btn sec small" data-disc="ilibar" style="width:100%">🤝 Ilibar (perdoar)</button>
      <div class="muted" style="font-size:11px;margin-top:8px">Decide antes do próximo jogo. Ilibar uma desculpa fraca pode desagradar ao balneário.</div></div>`;
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
      ${isDerby(c.gid,opp.gid)?`<div class="center" style="margin:4px 0 2px"><span style="background:linear-gradient(180deg,#ef4657,#b3121f);color:#fff;font-weight:800;font-size:11px;padding:2px 10px;border-radius:20px;letter-spacing:1px">🔥 DÉRBI</span></div>`:""}
      ${(G.rival&&opp.gid===G.rival.gid)?`<div class="center" style="margin:2px 0"><span style="background:linear-gradient(180deg,#3b8cff,#1d4ed8);color:#fff;font-weight:800;font-size:11px;padding:2px 10px;border-radius:20px;letter-spacing:1px">🗣️ RIVAL DA ÉPOCA</span></div>`:""}
      ${(function(){const iss=lineupIssues(c);if(iss.ok)return "";const nm=c.squad.filter(p=>(c.susp||[]).includes(p.id)).map(p=>p.name);return `<div class="center" style="color:var(--red);font-size:12px;margin:6px 0">⚠ Onze inválido${iss.sus?` — suspenso(s): ${nm.join(", ")}`:""}${iss.vac?`${iss.sus?"; ":" — "}${iss.vac} vazio(s)`:""}. Corrige na Tática.</div>`;})()}
      <button class="btn" id="btnPlay" style="margin-top:4px">▶ Jogar jornada</button>
      <div class="row" style="gap:6px;margin-top:8px">
        <button class="btn sec small" id="btnSim1" style="flex:1">⏩ Simular jornada</button>
        <button class="btn sec small" id="btnSim" style="flex:1">⏩⏩ Resto da época</button></div></div>`;
  } else if(G.seasonDone){
    const bota=(G.awards||[]).find(a=>a.season===G.season&&a.type==="bota");
    const meScorer=c.squad.slice().sort((a,b)=>(b.goals||0)-(a.goals||0))[0];
    h+=`<div class="card center"><h2>Época ${G.season} terminada</h2><div class="big">${rank}º lugar</div>
      <div class="muted" style="margin:6px 0 10px">${table[0].name} — campeão da ${d.name}</div>
      <div class="grid2" style="margin-bottom:10px">
        <div class="stat"><div class="v" style="font-size:14px">${bota?bota.player+" ("+bota.goals+")":"—"}</div><div class="l">🥇 Bota de Ouro${bota&&bota.mine?" · TEU":""}</div></div>
        <div class="stat"><div class="v" style="font-size:14px">${meScorer?meScorer.name+" ("+(meScorer.goals||0)+")":"—"}</div><div class="l">Teu melhor marcador</div></div></div>
      <button class="btn sec small" id="btnRecords" style="width:100%;margin-bottom:8px">🏅 Recordes & Prémios</button>
      ${rank===1?'<button class="btn sec small" data-sharetrophy="champ" style="width:100%;margin-bottom:8px">📸 Partilhar o título</button>':(d.upSlots&&rank<=d.upSlots?'<button class="btn sec small" data-sharetrophy="promo" style="width:100%;margin-bottom:8px">📸 Partilhar a subida</button>':'')}
      ${(function(){ const sc=G.superCup; if(sc&&!sc.pending&&sc.winner&&!sc.userIn){ const wc=clubByGid(sc.winner); return `<div class="muted" style="font-size:12px;margin-bottom:2px">🏆 Supertaça: <b>${wc?wc.name:sc.winner}</b> venceu.</div>`; } return ""; })()}
      ${(G.finalissima&&G.finalissima.pending&&G.finalissima.userIn)||(G.superCup&&G.superCup.pending&&G.superCup.userIn)?"":`<button class="btn" id="btnNewSeason">▶ Começar época ${G.season+1}</button>`}</div>`;
    if(G.finalissima&&G.finalissima.pending&&G.finalissima.userIn){ h+=finalissimaCardHtml(); }
    else if(G.superCup&&G.superCup.pending&&G.superCup.userIn){ h+=superCupCardHtml(); }
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
    h+=`<div class="card"><h2>Propostas recebidas</h2>`+G.transferOffers.map((o,i)=>{
      if(o.type==="loan"){
        return `<div class="pl" style="flex-wrap:wrap"><div class="info" style="flex:1 1 100%;margin-bottom:6px"><div class="nm">${o.playerName} <span class="pill" style="background:#7c3aed">EMPRÉSTIMO</span></div>
        <div class="sub">${o.clubName} quer por empréstimo até ao fim da época · salário ${money(o.wage)}/época</div></div>
        <button class="btn small" data-loan="${i}" data-share="0">Aceitar (pagam salário)</button>
        <button class="btn small sec" data-loan="${i}" data-share="0.5">Aceitar (dividir 50/50)</button>
        <button class="btn small warn" data-reject="${i}">Recusar</button></div>`;
      }
      return `<div class="pl" style="flex-wrap:wrap"><div class="info" style="flex:1 1 100%;margin-bottom:6px"><div class="nm">${o.playerName}</div>
        <div class="sub">${o.clubName} oferece <b style="color:var(--accent)">${money(o.fee)}</b></div></div>
        <button class="btn small" data-accept="${i}">Aceitar</button>
        <button class="btn small sec" data-counter="${i}">Pedir +20%</button>
        <button class="btn small warn" data-reject="${i}">Recusar</button></div>`;
    }).join("")+`</div>`;
  }
  if(G.rival&&!G.seasonDone)h+=rivalCardHtml();
  if(G.cup){
    const cup=G.cup, ms=c.gid;
    if(!cup.active&&cup.winner){ const wc=clubByGid(cup.winner);
      h+=`<div class="card center"><h2>🏆 Taça</h2><div class="muted">Vencedor: <b>${wc?wc.name:cup.winner}</b></div>${cup.winner===c.gid?'<button class="btn sec small" data-sharetrophy="cup" style="width:100%;margin-top:8px">📸 Partilhar a conquista</button>':''}</div>`;
    } else if(cup.active){
      const ut=cupUserTie(), avail=cupAvailable();
      h+=`<div class="card"><h2>🏆 Taça · ${cupRoundName()}</h2>`;
      if(cup.userAlive&&ut&&ut.b){
        const opp=(ut.a===ms?ut.b:ut.a), oc=clubByGid(opp);
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
      <button class="btn sec small" id="btnCareer" style="width:100%;margin-top:10px">📖 História de carreira</button>
      <button class="btn sec small" id="btnRecords2" style="width:100%;margin-top:8px">🏅 Recordes & Prémios</button>
    </div>`;
  }
  h+=`<div class="card"><button class="btn sec small" id="btnNews" style="width:100%;margin-bottom:8px">🔔 Novidades${hasNewsNew()?' <span style="color:var(--red);font-weight:900">•</span>':''}</button>
    <button class="btn sec small" id="btnSaves" style="width:100%;margin-bottom:8px">💾 Gravações · exportar / importar / trocar</button>
    <button class="btn warn small" id="btnReset" style="width:100%">↺ Novo jogo (apaga este slot)</button></div>`;
  return h;
}

/* ---------- PLANTEL ---------- */
function viewSquad(){
  const nA=(G.academy&&G.academy.youth?G.academy.youth.length:0);
  const tabSeg=`<div class="seg" id="segSquadTab"><button data-st="main" class="${squadTab==='main'?'active':''}">Plantel</button><button data-st="academy" class="${squadTab==='academy'?'active':''}">🎓 Academia${nA?" ("+nA+")":""}</button></div>`;
  if(squadTab==="academy")return tabSeg+viewAcademy();
  const c=me(), inXI=new Set(G.lineup);
  let list=c.squad.slice().sort((a,b)=>POSITIONS.indexOf(a.pos)-POSITIONS.indexOf(b.pos)||ability(b)-ability(a));
  if(squadFilter!=="all")list=list.filter(p=>GROUP[p.pos]===squadFilter);
  const xi=G.lineup.map(id=>c.squad.find(p=>p.id===id)).filter(Boolean);
  const avg=Math.round(xi.reduce((s,p)=>s+ability(p),0)/Math.max(1,xi.length));
  let h=tabSeg+`<div class="card between row"><div class="row">${swatch(c)}<div><b>${c.name}</b><div class="muted" style="font-size:11px">${c.squad.length} jogadores · toca para ver atributos</div></div></div>
    <div class="rating ${ratingClass(avg)}">${avg}</div></div>`;
  h+=`<div class="seg" id="segPos">`+[["all","Todos"],["GK","GR"],["DEF","DEF"],["MID","MED"],["ATT","ATA"]].map(([k,l])=>
    `<button data-p="${k}" class="${squadFilter===k?'active':''}">${l}</button>`).join("")+`</div>`;
  h+=`<div class="plist">`+list.map(p=>{
    const on=inXI.has(p.id), susp=(c.susp||[]).includes(p.id), inj=(p.injuredWeeks||0)>0;
    const tag=susp?('SUSP'+((p.banMatches||0)>1?' '+p.banMatches:'')):inj?('LES '+p.injuredWeeks):'';
    const nearBan=!susp&&((p.yc||0)%5===4);   // a um amarelo da suspensão
    return `<div class="pl" data-detail="${p.id}"><div class="num">${on?'<span style="color:var(--accent)">●</span>':'○'}</div>
      <div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}${p.wantsTalk?' 💬':''}${(p.contractYears||0)<=1?' <span title="último ano de contrato" style="color:var(--red);font-weight:800;font-size:11px">⏳</span>':''}${tag?` <span class="tag" style="color:var(--red);font-weight:800;font-size:11px">${tag}</span>`:''}${nearBan?` <span title="a um amarelo da suspensão" style="font-size:11px">🟨⚠</span>`:''}${p.transferListed?` <span class="tag" style="color:var(--accent);font-weight:800;font-size:11px">LT</span>`:''}</div>
        <div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · ${enHtml(p.energy)} · ${formIcon(p)} · ⭐${avg5(p)!=null?avg5(p):"—"} · ⚽${p.goals}</div></div>
      <span class="muted" style="font-size:18px">›</span></div>`;
  }).join("")+`</div>`;
  return h;
}

/* ---------- ACADEMIA ---------- */
function stars(n){ n=clamp(n||0,0,5); return "★".repeat(n)+"☆".repeat(5-n); }
function viewAcademy(){
  const A=ensureAcademy(), cost=academyCost(A.level);
  let h=`<div class="card"><div class="row between"><div><b>Academia de jovens</b><div class="muted" style="font-size:12px">Nível ${A.level}/5 · <span style="color:var(--accent)">${stars(A.level)}</span></div></div>
      <div class="rating ${A.level>=4?'r-hi':A.level>=2?'r-mid':'r-lo'}">${A.level}</div></div>
    ${cost!=null?`<button class="btn sec small" id="acUpgrade" style="width:100%;margin-top:8px">⬆️ Melhorar academia — ${money(cost)}</button>`:`<div class="muted" style="font-size:12px;margin-top:8px">Nível máximo atingido.</div>`}
    <div class="muted" style="font-size:11px;margin-top:6px">Nível mais alto = mais jovens, com maior potencial e evolução mais rápida. Pago da tua verba de transferências.</div></div>`;
  h+=`<div class="card"><div class="muted" style="font-size:12px;margin-bottom:4px">Foco de formação:</div>
    <select id="acFocus">${["Equilibrado","Ataque","Defesa","Físico"].map(f=>`<option${A.focus===f?' selected':''}>${f}</option>`).join("")}</select></div>`;
  const list=A.youth.slice().sort((a,b)=>youthStars(b)-youthStars(a)||ability(b)-ability(a));
  h+=`<div class="card"><h2>Juniores (${A.youth.length})</h2>`;
  if(!list.length)h+=`<div class="muted" style="font-size:13px">Sem jovens de momento. Aparecem no "Dia da formação", no início de cada época.</div>`;
  else h+=`<div class="plist">`+list.map(p=>`<div class="pl" data-youth="${p.id}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}${p.onLoan?' <span class="tag" style="color:var(--blue);font-weight:800;font-size:11px">EMPRÉSTIMO</span>':''}</div>
        <div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · pot. <span style="color:var(--accent)">${stars(youthStars(p))}</span></div></div>
      <span class="muted" style="font-size:18px">›</span></div>`).join("")+`</div>`;
  h+=`</div>`;
  return h;
}
function openYouth(id){
  const A=ensureAcademy(), p=A.youth.find(x=>x.id===id); if(!p)return;
  const mo=document.createElement("div");mo.className="modal";const abil=ability(p);
  const attrRows=ATTRS.filter(([k])=>k!=="gr"||p.pos==="GR").map(([k,label])=>{const v=p.attrs[k]||1;return `<div class="attr"><span class="an">${label}</span><span class="abar"><i style="width:${v/20*100}%;background:${attrColor(v)}"></i></span><span class="av">${v}</span></div>`;}).join("");
  mo.innerHTML=`<div class="box"><button class="close" id="yClose">✕</button>
    <div class="row" style="gap:10px;margin-bottom:4px"><div class="rating ${ratingClass(abil)}" style="width:44px;height:44px;font-size:18px">${abil}</div>
      <div><div style="font-weight:800;font-size:16px">${p.name}</div>
      <div class="muted" style="font-size:12px"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${POS_NAME[p.pos]} · ${p.age} anos</div></div></div>
    <div class="muted" style="font-size:12px;margin:8px 0">Potencial: <span style="color:var(--accent)">${stars(youthStars(p))}</span> · Valor ~ ${money(p.value)}${p.onLoan?' · <span style="color:var(--blue)">emprestado esta época</span>':''}</div>
    <button class="btn small" id="yPromote" style="width:100%;margin-bottom:8px">⬆️ Promover ao plantel principal</button>
    <button class="btn sec small" id="yLoan" style="width:100%;margin-bottom:8px">${p.onLoan?"↩️ Cancelar empréstimo":"🔁 Emprestar (evolui mais esta época)"}</button>
    <button class="btn warn small" id="yRelease" style="width:100%;margin-bottom:8px">🚪 Dispensar</button>
    <h2 style="margin:10px 0 4px;color:var(--muted);font-size:12px">Atributos</h2>
    <div class="attrs">${attrRows}</div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#yClose").onclick=close; mo.onclick=e=>{if(e.target===mo)close();};
  mo.querySelector("#yPromote").onclick=()=>{const r=promoteYouth(p.id);toast(r.msg||"");close();render();};
  mo.querySelector("#yLoan").onclick=()=>{const r=loanYouth(p.id);toast(r&&r.loaned?"Emprestado — vai evoluir mais esta época.":"Empréstimo cancelado.");close();render();};
  mo.querySelector("#yRelease").onclick=()=>{if(confirm("Dispensar "+p.name+" da academia?")){releaseYouth(p.id);close();render();}};
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
    <div class="muted" style="font-size:11px;margin-bottom:2px">⚽ ${p.goals} golos · 🟨 ${p.yc||0} · 🟥 ${p.rc||0}${(p.banMatches||0)>0?` · <span style="color:var(--red);font-weight:800">🟥 Suspenso ${p.banMatches} jogo${p.banMatches>1?"s":""}</span>`:((p.yc||0)%5===4?` · <span style="color:var(--accent);font-weight:800">🟨⚠ a 1 amarelo da suspensão</span>`:"")}</div>
    <div class="muted" style="font-size:11px;margin-bottom:2px">📄 Contrato: ${p.contractYears||"—"} ano(s)${(p.contractYears||0)<=1?' <span style="color:var(--red);font-weight:800">⏳ último ano</span>':''} · 💶 salário ${money(p.wage!=null?p.wage:0)}/época · venda ~ ${money(transferFee(p))}</div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">Energia: ${enHtml(p.energy)}${(p.injuredWeeks||0)>0?` · <span style="color:var(--red)">🏥 Lesionado — ${injuryLabel(p.injuredWeeks)} (${p.injuredWeeks} jornada${p.injuredWeeks>1?"s":""})</span>`:""}</div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">⭐ Última avaliação: ${p.lastRating!=null?p.lastRating:"—"} · Média (5 jogos): ${avg5(p)!=null?avg5(p):"—"} · Forma: ${formIcon(p)} ${((p.form||0)>0?"+":"")+(Math.round((p.form||0)*10)/10)}</div>
    <div class="muted" style="font-size:11px;margin-bottom:6px">🙂 Moral: ${moraleTag(p)}${p.wantsTalk?' · <span style="color:var(--accent)">pediu para reunir</span>':''}</div>
    <button class="btn sec small" id="pTalk" style="width:100%;margin-bottom:8px">💬 Reunir com o jogador</button>
    <div class="muted" style="font-size:11px;margin-bottom:3px">🎯 Foco de treino:</div>
    <select id="pTrain" style="margin-bottom:8px">${["Equilibrado","Ataque","Defesa","Físico"].map(f=>`<option${(p.trainFocus||"Equilibrado")===f?" selected":""}>${f}</option>`).join("")}</select>
    ${p.onLoanIn
      ? `<div class="muted" style="font-size:12px;margin:2px 0 8px;color:#7c3aed">🤝 Emprestado por ${(function(){const o=clubByGid&&p.loanFromGid?clubByGid(p.loanFromGid):null;return o?o.name:"outro clube";})()} — regressa no fim da época. Não pode ser vendido nem cedido.</div>`
      : `<button class="btn sec small" id="pRenew" style="width:100%;margin-bottom:8px">📄 Renovar contrato (${money(Math.max(0.01,Math.round(p.value*0.08*100)/100))})</button>
    <button class="btn sec small" id="pList" style="width:100%;margin-bottom:8px">${p.transferListed?"⭐ Retirar da lista de transferências":"📋 Colocar na lista de transferências"}</button>
    <button class="btn sec small" id="pLoan" style="width:100%;margin-bottom:8px">${p.loanListed?"⭐ Retirar da lista de empréstimos":"🤝 Disponibilizar para empréstimo"}</button>
    <button class="btn warn small" id="pRelease" style="width:100%;margin-bottom:8px">🚪 Dispensar (sem receita)</button>`}
    <h2 style="margin:10px 0 4px;color:var(--muted);font-size:12px">Atributos</h2>
    <div class="attrs">${attrRows}</div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#pClose").onclick=close;
  const pt=mo.querySelector("#pTrain");if(pt)pt.onchange=()=>{p.trainFocus=pt.value;save();toast(p.name+": foco de treino "+pt.value);};
  const ptk=mo.querySelector("#pTalk");if(ptk)ptk.onclick=()=>{close();openTalk(p);};
  const pRn=mo.querySelector("#pRenew");if(pRn)pRn.onclick=()=>{const r=renewContract(p.id);if(r.msg)toast(r.msg);close();render();};
  const pLi=mo.querySelector("#pList");if(pLi)pLi.onclick=()=>{const listed=toggleTransferList(p.id);toast(listed?"Colocado na lista de transferências":"Retirado da lista");close();render();};
  const pLo=mo.querySelector("#pLoan");if(pLo)pLo.onclick=()=>{const listed=toggleLoanList(p.id);toast(listed?"Disponível para empréstimo":"Retirado da lista de empréstimos");close();render();};
  const pRe=mo.querySelector("#pRelease");if(pRe)pRe.onclick=()=>{if(confirm("Dispensar "+p.name+"? Sai sem qualquer receita.")){const r=releasePlayer(p.id);if(r.msg)toast(r.msg);close();render();}};
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
function openClubSquad(gid){
  const club=clubByGid(+gid);if(!club)return;
  const mo=document.createElement("div");mo.className="modal";
  const negotiable=(myClubs().indexOf(club)>=0 && club.gid!==me().gid);
  const rows=club.squad.slice().sort((a,b)=>POSITIONS.indexOf(a.pos)-POSITIONS.indexOf(b.pos)||ability(b)-ability(a)).map(p=>
    `<div class="pl" data-scout="${p.id}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}${p.onLoanIn?' <span title="Emprestado" style="color:#7c3aed;font-weight:800;font-size:10px">EMP</span>':''}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · pot.${p.potential}${p.transferListed?' · <span style="color:var(--accent)">LT</span>':''}</div></div>
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
  h+=rolesCardHTML(c);
  h+=`<div class="card"><h2>Força do onze</h2>${bar("Defesa",s.def)}${bar("Meio-campo",s.mid)}${bar("Ataque",s.atk)}
    <div class="center" style="margin-top:10px"><span class="rating ${ratingClass(Math.round(s.overall))}" style="display:inline-flex">${Math.round(s.overall)}</span> <span class="muted">global</span></div></div>`;
  h+=`<div class="card"><button class="btn" id="btnAuto">✨ Escolher melhor onze automaticamente</button></div>`;
  return h;
}
function rolesCardHTML(c){
  const R=(typeof ensureRoles==="function")?ensureRoles():(G.roles||{captain:null,penalty:null,freekick:null,corner:null});
  const xi=(G.lineup||[]).map(id=>c.squad.find(p=>p.id===id)).filter(Boolean);
  if(!xi.length)return `<div class="card"><h2>Papéis de equipa</h2><div class="muted" style="font-size:12px">Preenche o onze para escolher os papéis.</div></div>`;
  const lead=p=>Math.round(ability(p)+Math.max(0,(p.age||24)-25)*0.8);
  const defs=[
    {role:"captain", label:"🧢 Capitão",  val:lead,               hint:"experiência/qualidade"},
    {role:"penalty", label:"🎯 Penáltis", val:p=>p.attrs.pen||0,  hint:"Penáltis"},
    {role:"freekick",label:"🅕 Livres",   val:p=>p.attrs.liv||0,  hint:"Livres"},
    {role:"corner",  label:"🚩 Cantos",   val:p=>p.attrs.cru||0,  hint:"Cruzamento"}
  ];
  const rows=defs.map(d=>{
    const ordered=xi.slice().sort((a,b)=>d.val(b)-d.val(a));
    const cur=R[d.role];
    const opts=`<option value="">— automático (melhor) —</option>`+ordered.map(p=>`<option value="${p.id}" ${cur===p.id?'selected':''}>${lastNameU(p.name)} (${d.val(p)})</option>`).join("");
    return `<div class="row between" style="gap:8px;margin-bottom:6px;align-items:center"><span style="min-width:88px;font-size:13px">${d.label}</span><select class="roleSel" data-role="${d.role}" style="flex:1">${opts}</select></div>`;
  }).join("");
  const dc=(G.capMood&&G.capMood.pid===R.captain)?(G.capMood.discontent||0):0;
  const capWarn=(R.captain!=null&&dc>=20)?`<div style="font-size:11px;margin-top:8px;color:${dc>=55?'var(--red)':'#f5c518'}">🧢 Descontentamento do capitão: ${dc}/100 ${dc>=55?'— a direção está de olho':dc>=30?'— o balneário nota':''}. Dá-lhe minutos para acalmar.</div>`:"";
  return `<div class="card"><h2>Papéis de equipa</h2>
    <div class="muted" style="font-size:11px;margin-bottom:8px">Restrito ao onze, ordenado do melhor para o pior. Vazio = o jogo escolhe o melhor. O capitão dá um pequeno empurrão à equipa; o penaltista/batedor de livres bons convertem mais.</div>${rows}${capWarn}</div>`;
}
function lastNameU(n){ return String(n).split(" ").slice(-1)[0]; }
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
        <div class="lbl">${p.name.split(" ").slice(-1)[0]}${(G.roles&&G.roles.captain===id)?' <span title="Capitão" style="color:#f5c518;font-weight:900">Ⓒ</span>':''}</div><div class="ppos">${s.pos} · ${enHtml(p.energy)} · ⭐${avg5(p)!=null?avg5(p):"—"}</div>${enBar(p.energy)}</div>`;
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
  myClubs().forEach(cl=>{if(cl.id===G.myId)return;cl.squad.forEach(p=>pool.push({p,from:cl.id,fromName:cl.short,fromGid:cl.gid}));});
  if(marketPos!=="all")pool=pool.filter(x=>GROUP[x.p.pos]===marketPos);
  pool.sort((a,b)=>ability(b.p)-ability(a.p)); pool=pool.slice(0,40);
  const bill=wageBill(meC), cap=ensureWageCap(), room2=wageRoom();
  let h=`<div class="card between row"><div>Verba · ${myDivObj().name}</div><div class="big" style="font-size:18px">${money(meC.budget)}</div></div>`;
  h+=`<div class="card between row" style="padding:10px 12px"><div>Massa salarial <span class="muted" style="font-size:11px">/época</span></div>
    <div style="text-align:right"><b>${money(bill)}</b> <span class="muted">/ ${money(cap)}</span><div class="muted" style="font-size:11px;color:${room2<0.03?'var(--red)':'var(--muted)'}">espaço ${money(room2)}</div></div></div>`;
  const room=budgetCapRoom(), askDis=room<=0.005;
  h+=`<div class="card" style="padding:8px"><button class="btn sec small" id="btnAskBudget" style="width:100%${askDis?';opacity:.45':''}"${askDis?' disabled':''}>🏦 ${askDis?'Teto de reforço atingido (30%)':'Pedir reforço de verba à direção'}</button>
    <div class="muted" style="font-size:11px;margin-top:6px;text-align:center">Reforço disponível esta época: até ${money(room)}.</div></div>`;
  const winOpen=(typeof transferWindowOpen==="function")&&transferWindowOpen();
  h+=`<div class="card" style="padding:9px 12px;border-left:3px solid ${winOpen?'var(--accent)':'var(--red)'}">
    <b>${winOpen?"🟢 Janela de transferências ABERTA":"🔴 Janela fechada"}</b>
    <div class="muted" style="font-size:11px;margin-top:3px">${winOpen?"Podes contratar de outros clubes e assinar livres.":"Só podes assinar jogadores sem clube (livres). As janelas abrem no início da época (até fim de setembro) e em janeiro."}</div></div>`;
  const nFree=(G.freeAgents||[]).length;
  h+=`<div class="seg" id="segMktTab"><button data-mt="clubs" class="${marketTab==='clubs'?'active':''}">Clubes</button><button data-mt="loanin" class="${marketTab==='loanin'?'active':''}">Empréstimos</button><button data-mt="free" class="${marketTab==='free'?'active':''}">Livres${nFree?" ("+nFree+")":""}</button></div>`;
  if(marketTab==="loanin"){
    h+=`<div class="seg" id="segMkt">`+[["all","Todos"],["GK","GR"],["DEF","DEF"],["MID","MED"],["ATT","ATA"]].map(([k,l])=>`<button data-p="${k}" class="${marketPos===k?'active':''}">${l}</button>`).join("")+`</div>`;
    if(!winOpen){ h+=`<div class="muted" style="font-size:13px">A janela está fechada — só podes pedir empréstimos nas janelas (setembro e janeiro).</div>`; return h; }
    let list=(typeof loanInList==="function")?loanInList():[];
    if(marketPos!=="all")list=list.filter(x=>GROUP[x.p.pos]===marketPos);
    list=list.slice(0,40);
    h+=`<div class="muted" style="font-size:11px;margin-bottom:6px">Recebe jogadores por empréstimo — sem custo de transferência. Escolhes pagar o salário todo ou dividir 50/50. Regressam ao clube de origem no fim da época.</div>`;
    if(!list.length)h+=`<div class="muted" style="font-size:13px">Sem jogadores disponíveis para empréstimo nesta posição.</div>`;
    else h+=`<div class="plist">`+list.map(x=>{const p=x.p, okHalf=room2>=p.wage*0.5;
      return `<div class="pl"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
        <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · ${x.short} · salário ${money(p.wage)}</div></div>
        <div class="row" style="gap:4px"><button class="btn small ${room2>=p.wage?'':'warn'}" data-loanin="${p.id}" data-from="${x.gid}" data-share="1" title="Pagas o salário todo">Todo</button><button class="btn small sec ${okHalf?'':'warn'}" data-loanin="${p.id}" data-from="${x.gid}" data-share="0.5" title="Dividem o salário">50/50</button></div></div>`;}).join("")+`</div>`;
    return h;
  }
  if(marketTab==="free"){
    let fa=(G.freeAgents||[]).slice();
    if(marketPos!=="all")fa=fa.filter(p=>GROUP[p.pos]===marketPos);
    fa.sort((a,b)=>ability(b)-ability(a));
    h+=`<div class="seg" id="segMkt">`+[["all","Todos"],["GK","GR"],["DEF","DEF"],["MID","MED"],["ATT","ATA"]].map(([k,l])=>`<button data-p="${k}" class="${marketPos===k?'active':''}">${l}</button>`).join("")+`</div>`;
    h+=`<div class="muted" style="font-size:11px;margin-bottom:6px">Jogadores sem clube — assinas a custo zero, pagas só o salário (tem de caber no teto).</div>`;
    if(!fa.length)h+=`<div class="muted" style="font-size:13px">Sem livres nesta posição.</div>`;
    else h+=`<div class="plist">`+fa.map(p=>{const okW=room2>=p.wage;
      return `<div class="pl" data-freescout="${p.id}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
        <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · salário ${money(p.wage)}</div></div>
        <button class="btn small ${okW?'':'warn'}" data-signfree="${p.id}">Assinar</button></div>`;}).join("")+`</div>`;
    return h;
  }
  h+=`<div class="seg" id="segMkt">`+[["all","Todos"],["GK","GR"],["DEF","DEF"],["MID","MED"],["ATT","ATA"]].map(([k,l])=>
    `<button data-p="${k}" class="${marketPos===k?'active':''}">${l}</button>`).join("")+`</div>`;
  h+=`<div class="muted" style="font-size:11px;margin-bottom:6px">Toca num jogador para ver a ficha e propor. Toca no nome do clube para ver o plantel.</div>`;
  h+=`<div class="plist">`+pool.map(x=>{
    const p=x.p;
    return `<div class="pl" data-scoutmk="${p.id}" data-mkfrom="${x.from}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div>
      <div class="info"><div class="nm">${p.name}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${p.age}a · <span class="clink" data-club="${x.fromGid}" style="text-decoration:underline">${x.fromName}</span> · salário ${money(p.wage)}</div></div>
      <span class="muted" style="font-size:18px">›</span></div>`;
  }).join("")+`</div>`;
  return h;
}

/* ---------- LIGA ---------- */
function viewTable(){
  if(leagueDiv===null)leagueDiv=G.myDiv;
  const d=G.divisions[leagueDiv], mineHere=leagueDiv===G.myDiv;
  const divMeta=[]; G.divisions.forEach((x,i)=>{ if(!divMeta.some(o=>o.tier===x.tier))divMeta.push({tier:x.tier,name:x.name.split(" · ")[0],idx:i}); });
  const shortDiv={"Pró-Nacional":"Pró-Nac.","Divisão de Honra":"Honra","1ª Divisão":"1ª Div","2ª Divisão":"2ª Div"};
  let h=`<div class="seg" id="segDivT">`+divMeta.map(o=>`<button data-dt="${o.tier}" data-idx="${o.idx}" class="${d.tier===o.tier?'active':''}">${shortDiv[o.name]||o.name}</button>`).join("")+`</div>`;
  const sameTier=G.divisions.map((x,i)=>({x,i})).filter(o=>o.x.tier===d.tier);
  if(sameTier.length>1){ h+=`<div class="seg" id="segSerT">`+sameTier.map(o=>`<button data-d="${o.i}" class="${leagueDiv===o.i?'active':''}">${o.x.serie||"—"}</button>`).join("")+`</div>`; }
  h+=`<div class="seg" id="segLeague">
    <button data-t="table" class="${tableTab==='table'?'active':''}">Classificação</button>
    <button data-t="scorers" class="${tableTab==='scorers'?'active':''}">Marcadores</button>
    <button data-t="fixtures" class="${tableTab==='fixtures'?'active':''}">Jornada</button>
    <button data-t="cup" class="${tableTab==='cup'?'active':''}">Taça</button></div>`;
  if(tableTab==="table"){
    const t=sortedTable(d), n=t.length;
    h+=`<div class="card" style="padding:6px"><table><thead><tr><th>#</th><th class="name">Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>DG</th><th>P</th></tr></thead><tbody>`;
    t.forEach((c,i)=>{const zone=(d.upSlots&&i<d.upSlots)?"zone-up":((d.downSlots&&i>=n-d.downSlots)?"zone-down":"");
      h+=`<tr class="${(mineHere&&c.id===G.myId)?'me':''} ${zone}"><td>${i+1}</td><td class="name">${swatch(c,true)} <span class="clink" data-club="${c.gid}">${c.name}</span></td><td>${c.P}</td><td>${c.W}</td><td>${c.D}</td><td>${c.L}</td><td>${(c.GF-c.GA>0?'+':'')+(c.GF-c.GA)}</td><td><b>${c.Pts}</b></td></tr>`;});
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
    const cup=G.cup, ms=me().gid;
    if(!cup){ h+=`<div class="card muted">Sem Taça.</div>`; }
    else {
      if(cup.active){
        const ut=cup.ties.find(t=>t.a===ms||t.b===ms);
        h+=`<div class="card"><h2>🏆 ${cupRoundName()}</h2>`;
        if(ut){const a=clubByGid(ut.a),b=ut.b?clubByGid(ut.b):null;h+=`<div class="fx" style="border-color:var(--accent)"><div class="t">${a?clubTag(a):ut.a}</div><div class="sc">${ut.b?"vs":"bye"}</div><div class="t a">${b?clubTag(b):""}</div></div>`;}
        h+=`<div class="center muted" style="font-size:12px">${cup.ties.length} jogos · ${cup.remaining.length} equipas em prova</div></div>`;
      }
      const path=[]; cup.history.forEach(hr=>{const t=hr.ties.find(x=>x.a===ms||x.b===ms); if(t)path.push({name:hr.name,t});});
      if(path.length){ h+=`<div class="card"><h2>O teu percurso</h2>`+path.slice().reverse().map(o=>{const a=clubByGid(o.t.a),b=o.t.b?clubByGid(o.t.b):null,won=o.t.w===ms;return `<div class="fx"><div class="t">${a?clubTag(a):o.t.a}</div><div class="sc">${o.t.b?(o.t.sa+"-"+o.t.sb):"bye"}</div><div class="t a">${b?clubTag(b):""}</div></div><div class="muted" style="font-size:11px;margin:-2px 0 6px">${o.name}${o.t.pens?" (penáltis)":""} — ${won?"passou":"eliminado"}</div>`;}).join("")+`</div>`; }
      if(cup.winner){const wc=clubByGid(cup.winner);h+=`<div class="card center"><h2>🏆 Vencedor da Taça</h2><div class="big">${wc?wc.name:cup.winner}</div></div>`;}
    }
  } else {
    const wk=Math.min(d.week,d.fixtures.length-1), round=d.fixtures[wk]||[], res=d.results[wk];
    h+=`<div class="card"><h2>${d.name} · Jornada ${wk+1}${d.week>=d.fixtures.length?' (final)':''}</h2>`+
      round.map(([hh,aa],i)=>{const H=d.clubs[hh],A=d.clubs[aa],r=res&&res[i];const mine=(mineHere&&(hh===G.myId||aa===G.myId));
        return `<div class="fx" style="${mine?'border-color:var(--accent)':''}"><div class="t">${clubTagFull(H)}</div><div class="sc">${r?r.hg+' - '+r.ag:'–'}</div><div class="t a">${clubTagFull(A)}</div></div>`;}).join("")+`</div>`;
  }
  return h;
}

/* ---------- jogo animado AO VIVO (subs + tática influenciam o resultado) ---------- */
function animateMatch(st, userClub, userLine, onFinish, cupPens){
  const home=st.home, away=st.away, userSide=st.userSide, cup=!!cupPens;
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box live-box"><div id="goalFlash"></div><div id="phaseBanner"></div><button id="sndBtn" class="sndbtn"></button><button id="liveSpeed" class="sndbtn" style="right:52px;width:auto;padding:0 9px;font-weight:800" title="Velocidade do jogo">1×</button><div id="goalBanner">⚽ GOLO!</div>
    <div class="center"><h2 style="justify-content:center">${home.name} vs ${away.name}${isDerby(home.gid,away.gid)?' <span style="color:#ef4657">🔥</span>':''}</h2></div>
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
    ${userSide?`<button class="btn sec small" id="liveChg" style="width:100%;margin:2px 0 8px">🔁 Alterações · subs / tática</button>`:''}
    <div class="live" id="liveEv"></div>
    <div id="liveSquad" class="livesquad"></div>
    <button class="btn" id="liveDone" style="display:none">Continuar</button>
    <button class="btn sec small" id="liveSkip" style="width:100%;margin-top:8px">Saltar</button></div>`;
  document.body.appendChild(mo);
  const evBox=mo.querySelector("#liveEv"),scoreEl=mo.querySelector("#liveScore"),minEl=mo.querySelector("#liveMin"),goalBanner=mo.querySelector("#goalBanner");
  const tlFill=mo.querySelector("#liveTLfill"),tlEl=mo.querySelector("#liveTL"),momH=mo.querySelector("#liveMomH"),momA=mo.querySelector("#liveMomA"),commentEl=mo.querySelector("#liveComment");
  let timer,pauseUntil=0,paused=false,htDone=false,mom=50,momSumH=0,momSumA=0,commentHold=0,windowsUsed=0;
  let seqActive=false,seqTimer=null,seqSkip=null,evQueue=[],lastSeqAt=-99999,possSide=null,speed=1;
  const aiSide = userSide==="H"?"A":userSide==="A"?"H":null;
  const aiWins=[46,63,74,84,105,115]; const aiWinUsed={};   // momentos em que a IA pondera substituir
  const stat={H:{sh:0,sot:0,cor:0},A:{sh:0,sot:0,cor:0}};
  const setW=(el,pct)=>{el.style.width=pct+"%";};
  momH.style.background=home.c1;momA.style.background=away.c1;setW(momH,50);setW(momA,50);
  function shortOf(side){return side==="H"?home.short:away.short;}
  function nameOf(side){return side==="H"?home.name:away.name;}
  function showPhase(txt){const b=mo.querySelector("#phaseBanner");if(!b)return;b.textContent=txt;b.classList.remove("show");void b.offsetWidth;b.classList.add("show");}
  function nameByPid(side,pid){const club=side==="H"?home:away;const p=club.squad.find(x=>x.id===pid);return p?p.name:"jogador";}
  function gtypeSuffix(t){return t==="penalty"?" (g.p.)":t==="freekick"?" (livre)":t==="header"?" (cabeça)":"";}
  const lastName=n=>String(n).split(" ").slice(-1)[0];
  function addEvLine(side,icon,txt){const d=document.createElement("div");d.className="ev ev-"+(side==="H"?"h":"a");d.innerHTML=`<b>${liveDispMin(st,txt.m)}'</b> ${icon} ${shortOf(side)} — ${txt.name}`;evBox.prepend(d);}
  function tlDot(m,color){const s=document.createElement("span");s.className="tl-dot";s.style.left=clamp(m/st.maxMin*100,0,100)+"%";s.style.background=color;tlEl.appendChild(s);}
  function updateStats(){const tot=momSumH+momSumA||1,pH=Math.round(momSumH/tot*100);mo.querySelector("#posH").textContent=pH+"%";mo.querySelector("#posA").textContent=(100-pH)+"%";mo.querySelector("#shH").textContent=stat.H.sh;mo.querySelector("#shA").textContent=stat.A.sh;mo.querySelector("#sotH").textContent=stat.H.sot;mo.querySelector("#sotA").textContent=stat.A.sot;mo.querySelector("#corH").textContent=stat.H.cor;mo.querySelector("#corA").textContent=stat.A.cor;}
  function setComment(txt,hold){commentEl.style.opacity=0;setTimeout(()=>{commentEl.textContent=txt;commentEl.style.opacity=1;},110);commentHold=hold||0;}
  function colorFlash(side){const cl=side==="H"?home:away,f=mo.querySelector("#goalFlash");f.style.background=`radial-gradient(circle at 50% 38%, ${cl.c1}, transparent 70%)`;f.classList.remove("show");void f.offsetWidth;f.classList.add("show");}
  function goalCelebrate(side,nm){goalBanner.innerHTML=`⚽ GOLO!<div class="gb-sc">${nm}</div>`;goalBanner.classList.remove("show");void goalBanner.offsetWidth;goalBanner.classList.add("show");colorFlash(side);if(scoreEl.animate)scoreEl.animate([{transform:"scale(1)"},{transform:"scale(1.4)"},{transform:"scale(1)"}],{duration:500});sndCheer();vib([40,30,90]);}
  const PRESS=["{T} carrega para a frente","grande pressão do {T}","{T} instala-se no meio-campo adversário","{T} procura o golo","{T} manda no jogo"];
  const BAL=["jogo equilibrado","muita luta pela bola","as equipas estudam-se","ritmo mais partido agora"];
  const CHANCE=["quase golo do {T}!","que defesa do guarda-redes!","por muito pouco!","travessão! esteve lá perto"];
  function phrase(pool,side){return pick(pool).replace("{T}",nameOf(side));}
  const scorers={H:[],A:[]}, liveR={}, mk={};
  if(userSide)(userLine||[]).forEach(id=>{liveR[id]=6.0;mk[id]={g:0,yc:false,red:false,on:false,off:false};});
  function refreshScorers(){mo.querySelector("#scH").innerHTML=scorers.H.map(s=>s.n+" "+liveDispMin(st,s.m)+"'").join("<br>")||"—";mo.querySelector("#scA").innerHTML=scorers.A.map(s=>s.n+" "+liveDispMin(st,s.m)+"'").join("<br>")||"—";}
  function bumpR(pid,d){if(liveR[pid]==null)return;liveR[pid]=clamp(liveR[pid]+d,1,10);}
  function concedePenalty(){(st[userSide].line||[]).forEach(id=>{const p=userClub.squad.find(x=>x.id===id);if(!p)return;const g=GROUP[p.pos];bumpR(id,g==="GK"?-0.3:g==="DEF"?-0.14:-0.04);});}
  function renderSquad(final){ if(!userSide)return; const rc=v=>v>=7?"#16a34a":v>=5?"#d9a400":"#e5484d"; const S=st[userSide];
    const rows=[...S.appeared].map(id=>{const p=userClub.squad.find(x=>x.id===id);if(!p)return "";
      const m=mk[id]||{}, onPitch=S.line.includes(id); let ic=""; for(let k=0;k<(m.g||0);k++)ic+="⚽"; if(m.yc)ic+="🟨"; if(m.red)ic+="🟥"; if(m.on)ic+="⬆️"; if(m.off)ic+="⬇️"; if(final&&(p.injuredWeeks||0)>0)ic+="🤕";
      const rv=final?(p.lastRating!=null?p.lastRating:(liveR[id]||6)):(liveR[id]!=null?liveR[id]:6);
      return `<div class="sq-row" style="${onPitch?'':'opacity:.5'}"><span class="sq-nm"><span class="pill ${posClass(p.pos)}" style="font-size:9px">${p.pos}</span> ${p.name} ${ic}</span><b style="color:${rc(rv)}">${(+rv).toFixed(1)}</b></div>`;
    }).join("");
    const el=mo.querySelector("#liveSquad"); if(el)el.innerHTML='<div class="sq-h">A tua equipa</div>'+rows; }
  if(userSide)renderSquad(false);
  function processEvent(e){
    const m=e.m;
    if(e.type==="goal"){ scoreEl.textContent=st.hg+" - "+st.ag; stat[e.side].sh++;stat[e.side].sot++;
      const own=e.gtype==="own", realName=own?nameByPid(e.ogSide,e.ogPid):nameByPid(e.side,e.scorer), nm=own?(realName+" (auto-golo)"):(realName+gtypeSuffix(e.gtype));
      goalCelebrate(e.side,nm);addEvLine(e.side,"⚽",{m,name:nm});tlDot(m,"#ffcf33");
      scorers[e.side].push({n:lastName(realName)+(own?" (ag)":""),m});refreshScorers();
      if(userSide){ if(!own&&e.side===userSide){bumpR(e.scorer,1.3);if(mk[e.scorer])mk[e.scorer].g++;} else if(own&&e.ogSide===userSide)bumpR(e.ogPid,-1.0); else if(e.side!==userSide)concedePenalty(); }
      setComment("GOLO do "+nameOf(e.side)+"! "+nm,4);pauseUntil=Date.now()+2600; }
    else if(e.type==="yellow"){ addEvLine(e.side,"🟨",{m,name:nameByPid(e.side,e.pid)});tlDot(m,"#f2c200"); if(userSide&&e.side===userSide){bumpR(e.pid,-0.3);if(mk[e.pid])mk[e.pid].yc=true;} setComment("Amarelo — "+nameOf(e.side)+" · "+nameByPid(e.side,e.pid),2);pauseUntil=Date.now()+1500; }
    else if(e.type==="red"){ addEvLine(e.side,"🟥",{m,name:nameByPid(e.side,e.pid)+(e.second?" (2º amarelo)":"")});tlDot(m,"#ef4657"); if(userSide&&e.side===userSide){bumpR(e.pid,-1.3);if(mk[e.pid])mk[e.pid].red=true;} setComment("Vermelho para o "+nameOf(e.side)+"! "+nameByPid(e.side,e.pid),4);pauseUntil=Date.now()+2000; }
    else if(e.type==="disallowed"){ addEvLine(e.side,"🚫",{m,name:"golo anulado"});stat[e.side].sot++;setComment("Golo anulado ao "+nameOf(e.side)+"!",3);pauseUntil=Date.now()+1700; }
    else if(e.type==="penmiss"){ addEvLine(e.side,"❌",{m,name:nameByPid(e.side,e.pid)+" — penálti falhado"});stat[e.side].sh++;stat[e.side].sot++; if(userSide&&e.side===userSide)bumpR(e.pid,-0.8); setComment("Penálti falhado — "+nameOf(e.side)+" · "+nameByPid(e.side,e.pid),3);pauseUntil=Date.now()+1800; }
    else if(e.type==="fkmiss"){ addEvLine(e.side,"🧱",{m,name:nameByPid(e.side,e.pid)+" — livre desperdiçado"});stat[e.side].sh++; setComment("Livre desperdiçado — "+nameOf(e.side)+" · "+nameByPid(e.side,e.pid),2);pauseUntil=Date.now()+1500; }
    else if(e.type==="sub"){ const outN=lastName(nameByPid(e.side,e.outId)), inN=lastName(nameByPid(e.side,e.inId));
      addEvLine(e.side,"🔁",{m,name:"sai "+outN+", entra "+inN});tlDot(m,"#3b8cff");
      if(userSide&&e.side===userSide){ if(mk[e.outId])mk[e.outId].off=true; mk[e.inId]={g:0,yc:false,red:false,on:true,off:false}; if(liveR[e.inId]==null)liveR[e.inId]=6.0; }
      const capLine=(userSide&&e.side===userSide&&G.roles&&e.outId===G.roles.captain&&typeof relatoCaptainSub==="function")?relatoCaptainSub():null;
      setComment(capLine||("Substituição no "+nameOf(e.side)+": entra "+inN), capLine?2:1); }
    if(userSide)renderSquad(false);
  }
  function aiSubTry(side){ const r=aiMaybeSub(st,side); if(r)processEvent({m:st.minute,side,type:"sub",outId:r.outId,inId:r.inId}); }
  function openChanges(atHT){ if(!userSide)return; paused=true; const S=st[userSide], club=userClub; let sel=null, subsThisOpen=0, talkedHT=false, talkMsg="";
    const cm=document.createElement("div");cm.className="modal";cm.style.zIndex="45";
    function draw(){ const maxS=liveMaxSubs(st);
      let talkBlock="";
      if(atHT){ talkBlock = talkedHT
        ? `<div class="muted" style="font-size:12px;margin-bottom:10px">🗣️ ${talkMsg}</div>`
        : `<div class="muted" style="font-size:11px;margin-bottom:4px">🗣️ Conversa ao intervalo:</div><div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:10px">${["Confiante","Exigente","Calmo","Motivador"].map(t=>`<button class="btn sec small" data-htone="${t}" style="flex:1;min-width:44%">${t}</button>`).join("")}</div>`; }
      const onRows=S.line.map(id=>{const p=club.squad.find(x=>x.id===id);if(!p)return"";const fit=Math.round(st.fit[id]==null?100:st.fit[id]);
        const m=mk[id]||{}; let ic=""; for(let k=0;k<(m.g||0);k++)ic+="⚽"; if(m.yc)ic+="🟨"; if(m.red)ic+="🟥";
        const rv=liveR[id]!=null?liveR[id]:6, rcol=rv>=7?"#16a34a":rv>=5?"#d9a400":"#e5484d";
        return `<div class="pl" data-out="${id}" style="${sel===id?'outline:2px solid var(--accent)':''}"><div class="rating ${ratingClass(ability(p))}">${ability(p)}</div><div class="info"><div class="nm">${p.name}${ic?' '+ic:''}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${enHtml(fit)}</div></div><b style="color:${rcol};font-size:15px;margin-left:6px">${(+rv).toFixed(1)}</b></div>`;}).join("");
      // suplentes ordenados da melhor para a pior opção para o lugar de quem sai
      let sortPos=null; if(sel!=null){ const idx=S.line.indexOf(sel), slots=FORMATIONS[S.form].slots; sortPos=(idx>=0&&slots[idx])?slots[idx].pos:((club.squad.find(x=>x.id===sel)||{}).pos); }
      let bench=liveBench(st,userSide).filter(p=>!S.line.includes(p.id));
      if(sortPos)bench.sort((a,b)=>effAt(b,sortPos)-effAt(a,sortPos) || ((st.fit[b.id]==null?100:st.fit[b.id])-(st.fit[a.id]==null?100:st.fit[a.id])));
      const benchRows=bench.length?bench.map((p,i)=>{const fit=Math.round(st.fit[p.id]==null?(p.energy==null?100:p.energy):st.fit[p.id]);
        const rr=sortPos?effAt(p,sortPos):ability(p), tag=(sortPos&&i===0)?' <span class="tag" style="color:var(--green2);font-weight:800;font-size:10px">melhor p/ '+sortPos+'</span>':'';
        return `<div class="pl" data-in="${p.id}"><div class="rating ${ratingClass(rr)}">${rr}</div><div class="info"><div class="nm">${p.name}${tag}</div><div class="sub"><span class="pill ${posClass(p.pos)}">${p.pos}</span> ${enHtml(fit)}</div></div></div>`;}).join(""):`<div class="muted" style="font-size:12px">Sem suplentes disponíveis.</div>`;
      cm.innerHTML=`<div class="box"><button class="close" id="cgClose">✕</button>
        <div style="font-weight:800;font-size:16px;margin-bottom:6px">${atHT?"Intervalo · "+st.hg+"–"+st.ag:"Alterações · "+st.minute+"'"}</div>
        ${talkBlock}
        <div class="muted" style="font-size:12px;margin-bottom:8px">Substituições ${S.subs}/${maxS} · janelas ${windowsUsed}/3${atHT?" · intervalo (livre)":""}. Tática à vontade.</div>
        <div class="row" style="gap:6px;margin-bottom:8px">
          <select id="cgForm" style="flex:1">${Object.keys(FORMATIONS).map(f=>`<option${S.form===f?' selected':''}>${f}</option>`).join("")}</select>
          <select id="cgMent" style="flex:1">${["Defensivo","Equilibrado","Atacante"].map(f=>`<option${S.ment===f?' selected':''}>${f}</option>`).join("")}</select></div>
        <div class="muted" style="font-size:11px;margin-bottom:4px">Em campo — toca em quem SAI${sel!=null?' (selecionado, escolhe quem entra)':''}:</div>
        <div class="plist" style="max-height:150px;overflow:auto">${onRows}</div>
        <div class="muted" style="font-size:11px;margin:8px 0 4px">Suplentes — toca em quem ENTRA:</div>
        <div class="plist" style="max-height:150px;overflow:auto">${benchRows}</div>
        <button class="btn" id="cgDone" style="margin-top:10px">Continuar jogo ▶</button></div>`;
      cm.querySelectorAll("[data-htone]").forEach(b=>b.onclick=()=>{
        const myS=teamStrength(st.home,st.H.line,st.H.form,st.H.ment).overall, opS=teamStrength(st.away,st.A.line,st.A.form,st.A.ment).overall;
        const fav=favTier(userSide==="H"?myS:opS, userSide==="H"?opS:myS), diff=(userSide==="H"?st.hg-st.ag:st.ag-st.hg);
        const r=talkResolve(b.dataset.htone,{fav,morale:teamMoraleAvg(club),phase:"ht",diff});
        applyTeamTalkMorale(r.moraleDelta); liveApplyTalk(st,r.boost,35); talkedHT=true; talkMsg=r.msg; toast(r.msg); draw();
      });
      cm.querySelector("#cgForm").onchange=e=>liveSetTactic(st,userSide,e.target.value,null);
      cm.querySelector("#cgMent").onchange=e=>liveSetTactic(st,userSide,null,e.target.value);
      cm.querySelectorAll("[data-out]").forEach(el=>el.onclick=()=>{sel=+el.dataset.out;draw();});
      cm.querySelectorAll("[data-in]").forEach(el=>el.onclick=()=>{ if(sel==null){toast("Escolhe primeiro quem sai.");return;}
        if(S.subs>=maxS){toast("Já usaste todas as substituições.");return;}
        if(!atHT && windowsUsed>=3 && subsThisOpen===0){toast("Sem janelas de substituição restantes.");return;}
        const r2=liveSub(st,userSide,sel,+el.dataset.in);
        if(r2.ok){ subsThisOpen++; processEvent({m:st.minute,side:userSide,type:"sub",outId:r2.outId,inId:r2.inId}); sel=null; draw(); }
        else toast(r2.msg||"Não foi possível."); });
      cm.querySelector("#cgClose").onclick=fin; cm.querySelector("#cgDone").onclick=fin;
    }
    function fin(){ if(subsThisOpen>0 && !atHT)windowsUsed++; cm.remove(); paused=false; renderSquad(false); }
    draw(); document.body.appendChild(cm);
  }
  function finish(){ clearInterval(timer); if(seqTimer){clearTimeout(seqTimer);seqTimer=null;} seqActive=false; seqSkip=null; evQueue=[];
    const r=liveResult(st); r.userLine=userLine; liveApplyEnergy(st);
    scoreEl.textContent=st.hg+" - "+st.ag;minEl.textContent="Final";setW(tlFill,100);showPhase("Final");sndWhistle(3);vib([40,50,40,50,80]);setComment("Apito final. "+home.name+" "+st.hg+"–"+st.ag+" "+away.name,0);
    if(userSide)renderSquad(true);
    const chg=mo.querySelector("#liveChg"); if(chg)chg.style.display="none";
    const done=mo.querySelector("#liveDone");done.style.display="block";mo.querySelector("#liveSkip").style.display="none";
    if(cup && st.hg===st.ag){ done.textContent="Ir aos penáltis →"; done.onclick=()=>cupPens(mo,r); }
    else { if(onFinish)onFinish(r); done.textContent="Relatório do jogo →"; done.onclick=()=>{ mo.style.display="none"; showPostMatch(st,r,()=>{mo.remove();render();}); }; }
  }
  mo.querySelector("#liveSkip").onclick=()=>{ // saltar: simula o resto sem parar
    while(st.minute<st.maxMin)liveStep(st);
    if(cup && !st.et && st.hg===st.ag){ st.et=true; st.maxMin=liveReg(st)+30; while(st.minute<st.maxMin)liveStep(st); }
    finish();
  };
  const bchg=mo.querySelector("#liveChg"); if(bchg)bchg.onclick=()=>{ if(!paused)openChanges(false); };
  const sb=mo.querySelector("#sndBtn");if(sb){const upd=()=>sb.textContent=SND?"🔊":"🔇";upd();sb.onclick=()=>{setSound(!SND);upd();if(SND)sndWhistle(1);};}
  // ---------- Relato com PAUSA nos momentos-chave ----------
  const otherSide=s=>s==="H"?"A":"H";
  function nmPid(side,pid){ return lastName(nameByPid(side,pid)); }
  function oppGKName(side){ const opp=side==="H"?away:home, ol=st[otherSide(side)].line;
    const gk=ol.map(id=>opp.squad.find(x=>x.id===id)).find(p=>p&&GROUP[p.pos]==="GK"); return gk?lastName(gk.name):"o guarda-redes"; }
  function someAttacker(side){ const cl=side==="H"?home:away, ln=st[side].line;
    const a=ln.map(id=>cl.squad.find(x=>x.id===id)).filter(p=>p&&GROUP[p.pos]!=="GK"); return a.length?lastName(pick(a).name):"o avançado"; }
  function mkCtx(side,extra){ const o=otherSide(side);
    const c={clube:nameOf(side),adv:nameOf(o),gr:oppGKName(side),trein:(side===userSide&&typeof G!=="undefined"&&G.manager?G.manager.name:"o treinador"),jog:someAttacker(side),jog2:someAttacker(side),def:"o defesa"};
    if(extra)Object.assign(c,extra); return c; }
  function relAmb(key,side){ side=side||"H"; if(typeof relatoAmbient==="function"){const s=relatoAmbient(key,mkCtx(side,{}));if(s)return s;}
    return key==="balance"?pick(BAL):phrase(PRESS,side); }
  const dwell=t=>Math.round(clamp(900+45*String(t).length,1400,3000)/speed);   // ritmo da leitura acompanha a velocidade
  function hexA(hex,a){ hex=String(hex||"#888888").replace("#",""); if(hex.length===3)hex=hex.split("").map(c=>c+c).join(""); const n=parseInt(hex,16)||0; return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a+")"; }
  function setPossTint(side){ if(!side){commentEl.style.background="";commentEl.style.borderLeft="";commentEl.style.borderRight="";return;}
    const cl=side==="H"?home:away, c=cl.c1||"#888";
    commentEl.style.background="linear-gradient("+(side==="H"?"90deg":"270deg")+","+hexA(c,0.32)+","+hexA(c,0.04)+")";
    commentEl.style.borderRadius="8px"; commentEl.style.padding="4px 10px";
    commentEl.style.borderLeft=(side==="H"?"4px solid "+c:"none"); commentEl.style.borderRight=(side==="A"?"4px solid "+c:"none"); }
  function fadeComment(){ if(commentEl.textContent){ commentEl.style.opacity="0"; setTimeout(()=>{ if(commentEl.style.opacity==="0")commentEl.textContent=""; },300); } }
  function playSeq(buildLines,onReveal){
    seqActive=true; paused=true; let i=0, done=false;
    function reveal(){ if(done)return; done=true; if(seqTimer){clearTimeout(seqTimer);seqTimer=null;} seqSkip=null;
      let hold=1300; if(onReveal){const rc=onReveal(); if(rc){setComment(rc,0); hold=Math.max(hold,dwell(rc));}}
      seqActive=false; paused=false; lastSeqAt=Date.now(); pauseUntil=Date.now()+hold; drainQueue(); }
    function nextLine(){ if(done)return; if(i<buildLines.length){const t=buildLines[i++]; setComment(t,0); seqTimer=setTimeout(nextLine,dwell(t));} else reveal(); }
    seqSkip=reveal; if(!buildLines||!buildLines.length){reveal();} else nextLine(); }
  function isKeyMoment(e){ return e&&(e.type==="goal"||e.type==="penmiss"||e.type==="fkmiss"||e.type==="red"||e.type==="disallowed"); }
  function mapEvent(e){ const side=e.side, ctx=mkCtx(side,{});
    if(e.type==="goal"){
      if(e.gtype==="own"){ ctx.def=nmPid(e.ogSide,e.ogPid); return {kind:"own",branch:"goal",ctx}; }
      if(e.scorer)ctx.jog=nmPid(e.side,e.scorer);
      if(st.minute>90+(st.stopH||0)) return {kind:"latedrama",branch:"goal",ctx};
      const k=e.gtype==="penalty"?"penalty":e.gtype==="freekick"?"freekick":e.gtype==="header"?"header":pick(["chance","solo","counter"]);
      return {kind:k,branch:"goal",ctx}; }
    if(e.type==="penmiss"){ if(e.pid)ctx.jog=nmPid(e.side,e.pid); return {kind:"penalty",branch:(Math.random()<0.55?"miss":"save"),ctx}; }
    if(e.type==="fkmiss"){ if(e.pid)ctx.jog=nmPid(e.side,e.pid); return {kind:"freekick",branch:pick(["wall","save","out"]),ctx}; }
    if(e.type==="red"){ if(e.pid)ctx.jog=nmPid(e.side,e.pid); return {kind:"red",branch:(e.second?"second":"direct"),ctx}; }
    if(e.type==="disallowed"){ return {kind:"chance",branch:"disallowed",ctx}; }
    return null; }
  function startEventSeq(e){ const mp=(typeof relatoSeq==="function")?mapEvent(e):null;
    let seq=mp?relatoSeq(mp.kind,mp.branch,mp.ctx):null;
    if(mp && e.type==="goal" && e.gtype!=="own" && typeof relatoLance==="function" && Math.random()<0.12){
      const l=relatoLance("goal", mp.ctx); if(l)seq=l;                    // ~12% dos golos são insólitos (gaivota, vento...)
    }
    if(e.side)setPossTint(possSide=e.side);
    if(!seq){ processEvent(e); lastSeqAt=Date.now(); drainQueue(); return; }
    playSeq(seq.build, ()=>{
      processEvent(e);
      if(e.type==="goal"){                                               // deixa o festejo brilhar, mostra o relato quando desvanece
        const rc=seq.reveal;
        if(rc)setTimeout(()=>{ if(mo.parentNode && !seqActive){ setComment(rc,0); pauseUntil=Date.now()+Math.max(1700,dwell(rc)); } },1250);
        return null;
      }
      return seq.reveal;
    }); }
  function startFailedChance(side){ if(typeof relatoSeq!=="function")return false;
    const ctx=mkCtx(side,{}); let seq=null, isSave=false;
    if(typeof relatoLance==="function" && Math.random()<0.22){ seq=relatoLance("miss",ctx); }  // ocasião estragada pelo insólito
    if(!seq){ const kind=pick(["chance","solo","header","counter"]);
      const branch=pick(kind==="chance"?["save","post","out","cleared"]:["save","out"]);
      isSave=(branch==="save"); seq=relatoSeq(kind,branch,ctx); }
    if(!seq)return false;
    setPossTint(possSide=side); stat[side].sh++; if(isSave)stat[side].sot++;
    playSeq(seq.build, ()=>seq.reveal); return true; }
  function startFolclore(side){ if(typeof relatoFolclore!=="function")return false;
    const lines=relatoFolclore(mkCtx(side,{})); if(!lines||!lines.length)return false;
    if(side)setPossTint(possSide=side);
    playSeq(lines, null); return true; }
  function drainQueue(){ if(seqActive)return;
    while(evQueue.length){ const e=evQueue.shift();
      if(isKeyMoment(e)){ startEventSeq(e); return; } else processEvent(e); } }
  commentEl.style.cursor="pointer"; commentEl.title="Tocar para avançar"; commentEl.onclick=()=>{ if(seqSkip)seqSkip(); };
  function startTimer(){ if(timer)clearInterval(timer); timer=setInterval(loopTick, Math.round(240/speed)); }   // intervalo do relógio conforme a velocidade
  const spdBtn=mo.querySelector("#liveSpeed");
  if(spdBtn){ spdBtn.textContent=speed+"×"; spdBtn.onclick=()=>{ speed=speed>=3?1:speed+1; spdBtn.textContent=speed+"×"; startTimer(); }; }
  showPhase("Início");sndWhistle(1);vib([30]);pauseUntil=Date.now()+1100;
  if(userSide && G.capMood && G.capMood.protest){                         // protesto raro: 1º minuto quase parados
    liveApplyTalk(st,-0.25,2); G.capMood.protest=false; try{save();}catch(e){}
    setTimeout(()=>{ if(mo.parentNode)setComment("Protesto no relvado: os jogadores do "+(userSide==="H"?home.name:away.name)+" quase não se mexem no primeiro minuto, em apoio ao capitão.",3); },350);
  }
  function loopTick(){
    if(Date.now()<pauseUntil||paused)return;
    if(!htDone && st.minute>=liveHalftime(st)){ htDone=true; minEl.textContent="Intervalo"; showPhase("Intervalo"); sndWhistle(2); vib([30,40,30]); setComment("Intervalo — "+home.name+" "+st.hg+"–"+st.ag+" "+away.name,3); updateStats(); if(userSide){pauseUntil=Date.now()+1400; setTimeout(()=>{ if(mo.parentNode)openChanges(true); },900);} else pauseUntil=Date.now()+2000; return; }
    let batch=[]; for(let k=0;k<3 && st.minute<st.maxMin;k++)batch=batch.concat(liveStep(st));
    const minute=st.minute; minEl.textContent=liveDispMin(st,minute)+"'"+((st.et&&minute>liveReg(st))?" (prol.)":""); setW(tlFill,minute/st.maxMin*100);
    const biasNow=clamp(50+((home.strength||60)-(away.strength||60))*0.3+((st.hg-st.ag)*6),20,80);
    mom=clamp(Math.round(mom+ri(-6,6)+(biasNow-mom)*0.2),8,92);momSumH+=mom;momSumA+=(100-mom);setW(momH,mom);setW(momA,100-mom);
    const pres=mom>=55?"H":mom<=45?"A":null;
    if(pres)possSide=pres; if(!seqActive)setPossTint(possSide);           // fundo do relato com a cor de quem tem a bola
    let hadEvent=batch.length>0;
    if(batch.length){ evQueue.push(...batch); drainQueue(); }
    if(aiSide && !seqActive)aiWins.forEach(wm=>{ if(!aiWinUsed[wm] && minute>=wm && st.maxMin>=wm){ aiWinUsed[wm]=true; if(Math.random()<0.8)aiSubTry(aiSide); } });
    if(pres){if(Math.random()<0.5)stat[pres].sh++;if(Math.random()<0.22)stat[pres].sot++;if(Math.random()<0.14)stat[pres].cor++;
      if(userSide&&pres===userSide){const ids=st[userSide].line.filter(id=>{const p=userClub.squad.find(x=>x.id===id);return p&&GROUP[p.pos]!=="GK";});if(ids.length)bumpR(pick(ids),0.05);}}
    if(userSide)renderSquad(false);
    if(commentHold>0)commentHold--;
    else if(!hadEvent && !seqActive && evQueue.length===0 && st.minute<st.maxMin){
      const roll=Math.random(), cool=(Date.now()-lastSeqAt)>6000;
      if(cool && roll<0.06){ startFolclore(pres||(Math.random()<0.5?"H":"A")); }
      else if(cool && pres && roll<0.22){ startFailedChance(pres); }
      else { fadeComment(); }                                            // entre momentos-chave o relato desaparece
    }
    updateStats();
    if(st.minute>=st.maxMin && !seqActive && evQueue.length===0){
      if(cup && !st.et && st.hg===st.ag){ st.et=true; st.maxMin=liveReg(st)+30; showPhase("Prolongamento"); sndWhistle(2); vib([30,40,30]); setComment("Prolongamento! Mais 30 minutos, sem tempo de compensação.",3); pauseUntil=Date.now()+2200; return; }
      finish();
    }
  }
  startTimer();
}
function showPostMatch(st, r, onClose){
  const home=st.home, away=st.away, userSide=st.userSide;
  const goalsByPid={}, goalList=[], cardList=[];
  (r.events||[]).forEach(e=>{
    if(e.type==="goal"){ const club=e.side==="H"?home:away;
      if(e.gtype==="own"){ const ogClub=e.ogSide==="H"?home:away, p=ogClub.squad.find(x=>x.id===e.ogPid); goalList.push({m:e.m,side:e.side,txt:(p?p.name.split(" ").slice(-1)[0]:"?")+" (ag)",club:club.short}); }
      else { const p=club.squad.find(x=>x.id===e.scorer); if(e.scorer)goalsByPid[e.scorer]=(goalsByPid[e.scorer]||0)+1; goalList.push({m:e.m,side:e.side,txt:(p?p.name.split(" ").slice(-1)[0]:"?"),club:club.short}); } }
    else if(e.type==="red"){ const club=e.side==="H"?home:away, p=club.squad.find(x=>x.id===e.pid); cardList.push({m:e.m,txt:(p?p.name.split(" ").slice(-1)[0]:"?"),club:club.short}); }
  });
  goalList.sort((a,b)=>a.m-b.m); cardList.sort((a,b)=>a.m-b.m);
  let motm=null,best=-1;
  const consider=(club,side)=>{ const S=side==="H"?st.H:st.A; [...S.appeared].forEach(id=>{ const p=club.squad.find(x=>x.id===id); if(!p)return;
    const g=goalsByPid[id]||0, rate=(side===userSide&&p.lastRating!=null)?(p.lastRating-6):0, conc=side==="H"?st.ag:st.hg, gk=(GROUP[p.pos]==="GK"&&conc===0)?1.5:0;
    const sc=g*2.2+rate+ability(p)/25+gk; if(sc>best){best=sc;motm={p,side,g,club};} }); };
  consider(home,"H"); consider(away,"A");
  const uClub=userSide==="H"?home:away, uS=userSide==="H"?st.H:st.A, rc=v=>v>=7?"#16a34a":v>=5?"#d9a400":"#e5484d";
  const yourR=[...uS.appeared].map(id=>uClub.squad.find(p=>p.id===id)).filter(Boolean).sort((a,b)=>(b.lastRating||0)-(a.lastRating||0));
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><div class="center"><h2 style="justify-content:center">Relatório do jogo</h2></div>
    <div class="scorebug"><div class="t">${clubTag(home)}</div><div class="sc">${r.hg} - ${r.ag}</div><div class="t a">${clubTag(away)}</div></div>
    ${r.hadET?`<div class="center muted" style="font-size:11px;margin-bottom:4px">após prolongamento</div>`:""}
    ${motm?`<div class="card" style="padding:10px;margin:8px 0;text-align:center;border-color:var(--accent)"><div class="muted" style="font-size:11px;letter-spacing:1px">⭐ HOMEM DO JOGO</div><div style="font-weight:800;font-size:16px">${motm.p.name}</div><div class="muted" style="font-size:12px"><span class="pill ${posClass(motm.p.pos)}">${motm.p.pos}</span> ${motm.club.short}${motm.g?" · "+motm.g+" golo"+(motm.g>1?"s":""):""}${motm.side===userSide&&motm.p.lastRating!=null?" · nota "+motm.p.lastRating:""}</div></div>`:""}
    <h2 style="color:var(--muted);font-size:12px;margin:8px 0 4px">⚽ Golos</h2>
    ${goalList.length?goalList.map(g=>`<div class="row between" style="font-size:13px;padding:3px 2px"><span>${liveDispMin(st,g.m)}' ${g.txt}</span><span class="muted">${g.club}</span></div>`).join(""):`<div class="muted" style="font-size:13px">Sem golos.</div>`}
    ${cardList.length?`<h2 style="color:var(--muted);font-size:12px;margin:10px 0 4px">🟥 Expulsões</h2>`+cardList.map(c=>`<div class="row between" style="font-size:13px;padding:3px 2px"><span>${liveDispMin(st,c.m)}' 🟥 ${c.txt}</span><span class="muted">${c.club}</span></div>`).join(""):""}
    <h2 style="color:var(--muted);font-size:12px;margin:10px 0 4px">As tuas notas</h2>
    ${yourR.map(p=>`<div class="row between" style="border-bottom:1px solid var(--line);padding:4px 2px;font-size:13px"><span>${p.name} <span class="pill ${posClass(p.pos)}" style="font-size:9px">${p.pos}</span></span><b style="color:${rc(p.lastRating||6)}">${p.lastRating!=null?p.lastRating:"—"}</b></div>`).join("")}
    <button class="btn sec small" id="pmrShare" style="width:100%;margin-top:10px">📸 Partilhar resultado</button>
    <button class="btn" id="pmrOk" style="margin-top:8px">Continuar</button></div>`;
  document.body.appendChild(mo);
  const done=()=>{ mo.remove(); if(onClose)onClose(); };
  mo.querySelector("#pmrOk").onclick=done; mo.onclick=e=>{if(e.target===mo)done();};
  const bsh=mo.querySelector("#pmrShare");
  if(bsh)bsh.onclick=()=>{
    const uGF=userSide==="H"?r.hg:r.ag, uGA=userSide==="H"?r.ag:r.hg;
    const word=uGF>uGA?(uGF-uGA>=3?"GOLEADA!":"VITÓRIA!"):uGF<uGA?"DERROTA":"EMPATE";
    const us={}; (r.events||[]).forEach(e=>{ if(e.type==="goal"&&e.side===userSide&&e.gtype!=="own"&&e.scorer)us[e.scorer]=(us[e.scorer]||0)+1; });
    let topId=null,tg=0; for(const id in us){ if(us[id]>tg){tg=us[id];topId=id;} }
    const late=uGF>uGA&&(r.events||[]).some(e=>e.type==="goal"&&e.side===userSide&&e.m>=88);
    let detail="";
    if(tg>=3){ const p=uClub.squad.find(x=>x.id==topId); detail="⚽ HAT-TRICK de "+(p?p.name:"?"); }
    else if(late)detail="⚽ Golo ao 90'!";
    else if(motm&&motm.side===userSide)detail="⭐ "+motm.p.name;
    doShare(shareCard({c1:uClub.c1,c2:uClub.c2,ini:uClub.short,title:word,sub:`${home.short} ${r.hg}–${r.ag} ${away.short}`,detail}),"gestorfutebol.png","Gestor de Futebol · gestorfutebol.pt");
  };
}
function openPreMatch(next, startFn){
  const c=me(), opp=myClubs()[next.opp];
  const myLine=availableLineup(c,G.lineup,G.formation), oppLine=aiPickLineup(opp,"4-4-2");
  const myS=teamStrength(c,myLine,G.formation,G.mentality), opS=teamStrength(opp,oppLine,"4-4-2","Equilibrado");
  const fav=favTier(myS.overall,opS.overall), form=clubRecentForm(opp,5);
  const tbl=sortedTable(myDivObj()), oppPos=tbl.findIndex(x=>x.id===opp.id)+1;
  const keys=opp.squad.slice().sort((a,b)=>ability(b)-ability(a)).slice(0,3);
  const scorer=opp.squad.slice().sort((a,b)=>(b.goals||0)-(a.goals||0))[0];
  const bar=(l,m1,m2)=>{const t=m1+m2||1,pm=Math.round(m1/t*100);return `<div style="margin:5px 0"><div style="font-size:11px;color:var(--muted)">${l}</div><div style="display:flex;height:8px;border-radius:4px;overflow:hidden;background:#0006"><i style="width:${pm}%;background:var(--green2)"></i><i style="width:${100-pm}%;background:var(--red)"></i></div></div>`;};
  const favTxt=fav>=2?"És claro favorito":fav>=1?"Ligeiro favorito":fav<=-2?"És claramente mais fraco":fav<=-1?"És ligeiramente mais fraco":"Jogo equilibrado";
  const fmtForm=f=>f.length?f.map(x=>`<span style="color:${x==='V'?'#22c55e':x==='D'?'#ef4657':'#93a2b6'};font-weight:800">${x}</span>`).join(" "):"—";
  const mo=document.createElement("div");mo.className="modal";
  const derby=isDerby(c.gid,opp.gid);
  mo.innerHTML=`<div class="box"><button class="close" id="pmClose">✕</button>
    <div class="center"><h2 style="justify-content:center">Antevisão · ${next.home?"em casa":"fora"}</h2></div>
    ${derby?`<div class="center" style="margin:2px 0 8px"><span style="background:linear-gradient(180deg,#ef4657,#b3121f);color:#fff;font-weight:800;font-size:12px;padding:3px 12px;border-radius:20px;letter-spacing:1px">🔥 DÉRBI</span></div>`:""}
    <div class="scorebug"><div class="t">${clubTag(c)}</div><div class="sc" style="font-size:15px">VS</div><div class="t a">${clubTag(opp)}</div></div>
    <div class="muted center" style="font-size:12px;margin-bottom:8px">${opp.name} · ${oppPos}º · forma: ${fmtForm(form)}</div>
    <div class="card" style="padding:9px;margin-bottom:8px">
      ${bar("Ataque",Math.round(myS.atk),Math.round(opS.atk))}${bar("Meio-campo",Math.round(myS.mid),Math.round(opS.mid))}${bar("Defesa",Math.round(myS.def),Math.round(opS.def))}
      <div class="center" style="font-size:11px;margin-top:5px"><b>${favTxt}</b> · <span style="color:var(--green2)">tu</span> vs <span style="color:var(--red)">eles</span></div></div>
    <div class="muted" style="font-size:12px;margin-bottom:8px">👀 A vigiar: ${keys.map(p=>p.name+" ("+ability(p)+")").join(", ")}${scorer&&scorer.goals?`<br>⚽ Melhor marcador: ${scorer.name} (${scorer.goals})`:""}</div>
    <h2 style="color:var(--muted);font-size:12px;margin:6px 0 4px">🗣️ Conversa de balneário</h2>
    <div id="pmTalk"><div class="row" style="gap:6px;flex-wrap:wrap">${["Confiante","Exigente","Calmo","Motivador"].map(t=>`<button class="btn sec small" data-tone="${t}" style="flex:1;min-width:44%">${t}</button>`).join("")}</div>
      <button class="btn sec small" id="pmSkip" style="width:100%;margin-top:6px">Não falar</button>
      <div class="muted" style="font-size:11px;margin-top:6px">Muda o onze na Tática antes de jogar, se precisares.</div></div>
    <div id="pmStart" style="display:none;margin-top:8px"></div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#pmClose").onclick=close; mo.onclick=e=>{if(e.target===mo)close();};
  let boost=0;
  const showStart=(reaction)=>{ mo.querySelector("#pmTalk").style.display="none"; const el=mo.querySelector("#pmStart"); el.style.display="block";
    el.innerHTML=`${reaction?`<div class="muted center" style="font-size:12px;margin-bottom:8px">🗣️ ${reaction}</div>`:""}<button class="btn" id="pmGo" style="width:100%">▶ Começar jogo</button>`;
    el.querySelector("#pmGo").onclick=()=>{ close(); startFn(boost); }; };
  mo.querySelectorAll("[data-tone]").forEach(b=>b.onclick=()=>{ const r=talkResolve(b.dataset.tone,{fav,morale:teamMoraleAvg(c),phase:"pre"}); applyTeamTalkMorale(r.moraleDelta); boost=r.boost; showStart(r.msg); });
  mo.querySelector("#pmSkip").onclick=()=>{ boost=0; showStart(""); };
}
function playMatchAnimated(talkBoost){
  const next=nextFixture(); if(!next){playWeek();render();return;}
  const c=me(), opp=myClubs()[next.opp];
  const home=next.home?c:opp, away=next.home?opp:c;
  const myLine=availableLineup(c,G.lineup,G.formation), oppLine=aiPickLineup(opp,"4-4-2");
  const hLine=next.home?myLine:oppLine, aLine=next.home?oppLine:myLine;
  const userSide=next.home?"H":"A";
  const st=createLive(home,away,hLine,aLine,{maxMin:90,userSide,
    hForm:next.home?G.formation:"4-4-2", aForm:next.home?"4-4-2":G.formation,
    hMent:next.home?G.mentality:"Equilibrado", aMent:next.home?"Equilibrado":G.mentality});
  if(talkBoost)liveApplyTalk(st, talkBoost, 35);   // efeito da conversa de pré-jogo na 1ª parte
  animateMatch(st,c,myLine,(r)=>{ playWeek(r); }, null);
}

/* ---------- Taça ---------- */
function playCupTie(){
  const cup=G.cup; if(!cup||!cup.active)return;
  if(!cupAvailable()){ toast("A próxima eliminatória é na jornada "+cupRoundDue()+" do campeonato"); return; }
  const ms=me().gid, ut=cupUserTie();
  if(!cup.userAlive||!ut){ cupAdvanceRound(); render(); toast("Eliminatória simulada"); return; }
  if(!ut.b){ cupAdvanceRound(); render(); toast("Passaste por folga (bye)"); return; }
  if(!ensureValidXI())return;
  const c=me(), aShort=ut.a, bShort=ut.b, ca=clubByGid(aShort), cb=clubByGid(bShort), userIsA=(aShort===ms);
  const aLine=userIsA?availableLineup(c,G.lineup,G.formation):aiPickLineup(ca,"4-4-2");
  const bLine=userIsA?aiPickLineup(cb,"4-4-2"):availableLineup(c,G.lineup,G.formation);
  const userSide=userIsA?"H":"A", userLine=userIsA?aLine:bLine;
  const st=createLive(ca,cb,aLine,bLine,{maxMin:90,userSide,
    hForm:userIsA?G.formation:"4-4-2", aForm:userIsA?"4-4-2":G.formation,
    hMent:userIsA?G.mentality:"Equilibrado", aMent:userIsA?"Equilibrado":G.mentality});
  const perPlayer=(r)=>{ const played=r.userAppeared||userLine; rateUserMatch(c,played,r,userIsA); updateForm(c,played); updateChem(userLine); trainTick(c,played); updateMorale(c,played,userIsA?r.hg:r.ag,userIsA?r.ag:r.hg); };
  const settle=(r)=>{ perPlayer(r); const w=r.hg>r.ag?aShort:bShort; cupAdvanceRound({sa:r.hg,sb:r.ag,w,pens:false,et:r.hadET}); const how=r.hadET?" no prolongamento":""; toast(w===ms?("Passaste"+how+"!"):("Eliminado da Taça"+how)); };
  const pens=(matchMo,r)=>{ perPlayer(r);
    const shoot=penaltyShootout(teamStrength(ca,st.H.line,st.H.form,st.H.ment).overall,teamStrength(cb,st.A.line,st.A.form,st.A.ment).overall);
    animateShootout(ca,cb,shoot,(winSide)=>{ const w=winSide==="A"?aShort:bShort; cupAdvanceRound({sa:r.hg,sb:r.ag,w,pens:true,et:true}); if(matchMo)matchMo.remove(); toast(w===ms?"Passaste nos penáltis!":"Eliminado nos penáltis"); render(); }); };
  animateMatch(st,c,userLine,settle,pens);
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
  const cup=G.cup, ms=me().gid;
  const mo=document.createElement("div");mo.className="modal";
  let inner=`<div class="box"><div class="center"><h2 style="justify-content:center">🏆 Taça</h2></div>`;
  if(userTie&&userTie.b){
    const a=clubByGid(userTie.a), b=clubByGid(userTie.b), adv=userTie.w===ms;
    inner+=`<div class="fx"><div class="t">${a?clubTag(a):userTie.a}</div><div class="sc">${userTie.sa} - ${userTie.sb}</div><div class="t a">${b?clubTag(b):userTie.b}</div></div>`;
    if(userTie.pens)inner+=`<div class="center muted" style="font-size:12px">decidido nos penáltis</div>`;
    inner+=`<div class="center" style="margin:10px 0;font-weight:800;color:${adv?'var(--green2)':'var(--red)'}">${adv?"Passaste à eliminatória seguinte!":"Foste eliminado da Taça."}</div>`;
  } else if(userTie&&!userTie.b){ inner+=`<div class="center" style="margin:10px 0">Passaste por folga (bye).</div>`; }
  else { inner+=`<div class="center muted" style="margin:10px 0">Eliminatória simulada.</div>`; }
  if(!cup.active&&cup.winner){ const wc=clubByGid(cup.winner); inner+=`<div class="center" style="margin:10px 0"><b>🏆 ${wc?wc.name:cup.winner}</b> venceu a Taça.</div>`; }
  else if(cup.active){ inner+=`<div class="center muted" style="font-size:12px;margin-bottom:8px">Segue para: ${cupRoundName()} (${cup.remaining.length} equipas)</div>`; }
  inner+=`<button class="btn" id="cupDone">Continuar</button></div>`;
  mo.innerHTML=inner; document.body.appendChild(mo);
  mo.querySelector("#cupDone").onclick=()=>{mo.remove();render();};
}

/* ---------- Play-off de subida + Supertaça ---------- */
function poTieRow(tie,ms){
  const a=clubByShort(tie.a), b=clubByShort(tie.b);
  const an=a?a.name:(tie.a||"?"), bn=b?b.name:(tie.b||"?");
  const sc=tie.w?`${tie.sa} - ${tie.sb}${tie.pens?" (p)":""}`:"vs";
  const you=t=>(t===ms)?' style="color:var(--accent);font-weight:800"':'';
  const wmk=t=>(tie.w===t)?" ✓":"";
  return `<div class="fx" style="font-size:13px"><div class="t"${you(tie.a)}>${an}${wmk(tie.a)}</div><div class="sc" style="font-size:13px">${sc}</div><div class="t a"${you(tie.b)}>${bn}${wmk(tie.b)}</div></div>`;
}
function playoffCardHtml(){
  const po=G.playoff, ms=me().short;
  let inner=`<div class="card"><h2>⬆️ Play-off de subida · ${po.divName}</h2>
    <div class="muted" style="font-size:12px;margin-bottom:6px">O vencedor conquista o último lugar de subida.</div>
    <div class="muted" style="font-size:11px;margin-bottom:2px">Meias-finais</div>
    ${poTieRow(po.semis[0],ms)}${poTieRow(po.semis[1],ms)}`;
  if(po.stage==="final"&&po.final.a){ inner+=`<div class="muted" style="font-size:11px;margin:6px 0 2px">Final</div>${poTieRow(po.final,ms)}`; }
  inner+=`<button class="btn" id="btnPlayoff" style="margin-top:8px">${po.stage==="final"?"▶ Jogar a final":"▶ Jogar a meia-final"}</button></div>`;
  return inner;
}
function superCupCardHtml(){
  const sc=G.superCup, ms=me().gid, a=clubByGid(sc.champ), b=clubByGid(sc.cup);
  return `<div class="card"><h2>🏆 Supertaça</h2>
    <div class="muted" style="font-size:12px;margin-bottom:6px">Campeão do Pró-Nacional vs vencedor da Taça.</div>
    <div class="fx"><div class="t"${sc.champ===ms?' style="color:var(--accent);font-weight:800"':''}>${a?clubTagFull(a):sc.champ}</div><div class="sc">VS</div><div class="t a"${sc.cup===ms?' style="color:var(--accent);font-weight:800"':''}>${b?clubTagFull(b):sc.cup}</div></div>
    <button class="btn" id="btnSuperCup" style="margin-top:8px">▶ Jogar a Supertaça</button></div>`;
}
function finalissimaCardHtml(){
  const f=G.finalissima, ms=me().gid, a=clubByGid(f.a), b=clubByGid(f.b);
  return `<div class="card"><h2>🏆 Finalíssima · Divisão de Honra</h2>
    <div class="muted" style="font-size:12px;margin-bottom:6px">Vencedor da Série A vs vencedor da Série B — troféu de Campeão da Divisão de Honra.</div>
    <div class="fx"><div class="t"${f.a===ms?' style="color:var(--accent);font-weight:800"':''}>${a?clubTagFull(a):f.a}</div><div class="sc">VS</div><div class="t a"${f.b===ms?' style="color:var(--accent);font-weight:800"':''}>${b?clubTagFull(b):f.b}</div></div>
    <button class="btn" id="btnFinalissima" style="margin-top:8px">▶ Jogar a Finalíssima</button></div>`;
}
function playFinalissima(){
  const f=G.finalissima; if(!f||!f.pending||!f.userIn)return;
  if(!ensureValidXI())return;
  const ms=me().gid, c=me();
  const ca=clubByGid(f.a), cb=clubByGid(f.b), userIsA=(f.a===ms);
  const aLine=userIsA?availableLineup(c,G.lineup,G.formation):aiPickLineup(ca,"4-4-2");
  const bLine=userIsA?aiPickLineup(cb,"4-4-2"):availableLineup(c,G.lineup,G.formation);
  const userSide=userIsA?"H":"A", userLine=userIsA?aLine:bLine;
  const st=createLive(ca,cb,aLine,bLine,{maxMin:90,userSide,hForm:userIsA?G.formation:"4-4-2",aForm:userIsA?"4-4-2":G.formation,hMent:userIsA?G.mentality:"Equilibrado",aMent:userIsA?"Equilibrado":G.mentality});
  const settle=(r)=>{ const w=r.hg>r.ag?f.a:f.b; finalissimaResolve({sa:r.hg,sb:r.ag,w,pens:false}); toast(w===ms?"🏆 És Campeão da Divisão de Honra!":"Finalíssima perdida."); };
  const pens=(matchMo,r)=>{ const shoot=penaltyShootout(teamStrength(ca,st.H.line,st.H.form,st.H.ment).overall,teamStrength(cb,st.A.line,st.A.form,st.A.ment).overall);
    animateShootout(ca,cb,shoot,(winSide)=>{ const w=winSide==="A"?f.a:f.b; finalissimaResolve({sa:r.hg,sb:r.ag,w,pens:true}); if(matchMo)matchMo.remove(); toast(w===ms?"🏆 Campeão da Honra nos penáltis!":"Finalíssima perdida nos penáltis"); render(); }); };
  animateMatch(st,c,userLine,settle,pens);
}
function playPoTie(tie,onDone){
  const ms=me().short, c=me();
  const ca=clubByShort(tie.a), cb=clubByShort(tie.b), userIsA=(tie.a===ms);
  const aLine=userIsA?availableLineup(c,G.lineup,G.formation):aiPickLineup(ca,"4-4-2");
  const bLine=userIsA?aiPickLineup(cb,"4-4-2"):availableLineup(c,G.lineup,G.formation);
  const userSide=userIsA?"H":"A", userLine=userIsA?aLine:bLine;
  const st=createLive(ca,cb,aLine,bLine,{maxMin:90,userSide,hForm:userIsA?G.formation:"4-4-2",aForm:userIsA?"4-4-2":G.formation,hMent:userIsA?G.mentality:"Equilibrado",aMent:userIsA?"Equilibrado":G.mentality});
  const settle=(r)=>{ tie.sa=r.hg;tie.sb=r.ag;tie.w=r.hg>r.ag?tie.a:tie.b;tie.pens=false; onDone(); };
  const pens=(matchMo,r)=>{ const shoot=penaltyShootout(teamStrength(ca,st.H.line,st.H.form,st.H.ment).overall,teamStrength(cb,st.A.line,st.A.form,st.A.ment).overall);
    animateShootout(ca,cb,shoot,(winSide)=>{ tie.sa=r.hg;tie.sb=r.ag;tie.w=winSide==="A"?tie.a:tie.b;tie.pens=true; if(matchMo)matchMo.remove(); onDone(); render(); }); };
  animateMatch(st,c,userLine,settle,pens);
}
function afterUserSemi(){
  const po=G.playoff, ms=me().short;
  const other=po.semis.find(t=>t.w===null&&t.a!==ms&&t.b!==ms);
  if(other){ const rs=poSimTie(other.a,other.b); other.sa=rs.sa;other.sb=rs.sb;other.w=rs.w;other.pens=rs.pens; }
  po.final.a=po.semis[0].w; po.final.b=po.semis[1].w; po.stage="final";
  if(po.final.a!==ms&&po.final.b!==ms){                 // não chegaste à final → simula-a
    const rf=poSimTie(po.final.a,po.final.b); po.final.sa=rf.sa;po.final.sb=rf.sb;po.final.w=rf.w;po.final.pens=rf.pens;
    po.winner=po.final.w; po.pending=false; resolvePlayoffOutcome(); toast("Eliminado no play-off (meias-finais).");
  } else { toast("Passaste à final do play-off!"); }
  render();
}
function playPlayoff(){
  const po=G.playoff; if(!po||!po.pending)return;
  if(!ensureValidXI())return;
  const ms=me().short;
  if(po.stage==="semi"){
    const tie=po.semis.find(t=>t.a===ms||t.b===ms); if(!tie)return;
    playPoTie(tie,()=>afterUserSemi());
  } else if(po.stage==="final"){
    playPoTie(po.final,()=>{ po.winner=po.final.w; po.pending=false; resolvePlayoffOutcome();
      toast(po.winner===ms?"⬆️ Subiste pelo play-off!":"Perdeste a final do play-off."); render(); });
  }
}
function playSuperCup(){
  const sc=G.superCup; if(!sc||!sc.pending||!sc.userIn)return;
  if(!ensureValidXI())return;
  const ms=me().gid, c=me();
  const ca=clubByGid(sc.champ), cb=clubByGid(sc.cup), userIsA=(sc.champ===ms);
  const aLine=userIsA?availableLineup(c,G.lineup,G.formation):aiPickLineup(ca,"4-4-2");
  const bLine=userIsA?aiPickLineup(cb,"4-4-2"):availableLineup(c,G.lineup,G.formation);
  const userSide=userIsA?"H":"A", userLine=userIsA?aLine:bLine;
  const st=createLive(ca,cb,aLine,bLine,{maxMin:90,userSide,hForm:userIsA?G.formation:"4-4-2",aForm:userIsA?"4-4-2":G.formation,hMent:userIsA?G.mentality:"Equilibrado",aMent:userIsA?"Equilibrado":G.mentality});
  const settle=(r)=>{ const w=r.hg>r.ag?sc.champ:sc.cup; superCupResolve({sa:r.hg,sb:r.ag,w,pens:false}); toast(w===ms?"🏆 Ganhaste a Supertaça!":"Supertaça perdida."); };
  const pens=(matchMo,r)=>{ const shoot=penaltyShootout(teamStrength(ca,st.H.line,st.H.form,st.H.ment).overall,teamStrength(cb,st.A.line,st.A.form,st.A.ment).overall);
    animateShootout(ca,cb,shoot,(winSide)=>{ const w=winSide==="A"?sc.champ:sc.cup; superCupResolve({sa:r.hg,sb:r.ag,w,pens:true}); if(matchMo)matchMo.remove(); toast(w===ms?"🏆 Supertaça nos penáltis!":"Supertaça perdida nos penáltis"); render(); }); };
  animateMatch(st,c,userLine,settle,pens);
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
  document.querySelectorAll("[data-capmeet]").forEach(b=>b.onclick=()=>{if(typeof resolveCaptainMeeting==="function")resolveCaptainMeeting(b.dataset.capmeet);TAB="home";render();});
  document.querySelectorAll("[data-disc]").forEach(b=>b.onclick=()=>{if(typeof resolveDiscipline==="function")resolveDiscipline(b.dataset.disc);TAB="home";render();});
  const meetBlock=()=>{ if(G.meeting&&G.meeting.active){ toast("Responde primeiro à reunião com a direção.");TAB="home";render();return true; } if(G.capMeeting&&G.capMeeting.active){ toast("Responde primeiro à reunião sobre o capitão.");TAB="home";render();return true; } if(G.discipline&&G.discipline.active){ toast("Resolve primeiro o caso de indisciplina.");TAB="home";render();return true; } return false; };
  const bp=$("#btnPlay");if(bp)bp.onclick=()=>{if(meetBlock())return;if(cupBlocksLeague()){toast("Joga primeiro a eliminatória da Taça (jornada "+cupRoundDue()+")");TAB="home";render();return;}if(!ensureValidXI())return;const nx=nextFixture();if(!nx){playWeek();render();return;}openPreMatch(nx,(boost)=>playMatchAnimated(boost));};
  const bcup=$("#btnCup");if(bcup)bcup.onclick=()=>{if(meetBlock())return;playCupTie();};
  const bs=$("#btnSim");if(bs)bs.onclick=()=>{if(meetBlock())return;if(cupBlocksLeague()){toast("Joga primeiro a eliminatória da Taça");TAB="home";render();return;}if(!ensureValidXI())return;const d=myDivObj();let n=0;while(d.week<d.fixtures.length){playWeek();n++;if((G.meeting&&G.meeting.active)||(G.capMeeting&&G.capMeeting.active)||(G.discipline&&G.discipline.active)||(G.event&&!G.fired)||G.fired||G.seasonDone)break;}toast(n+" jornada(s) simulada(s)");render();};
  const bs1=$("#btnSim1");if(bs1)bs1.onclick=()=>{if(meetBlock())return;if(cupBlocksLeague()){toast("Joga primeiro a eliminatória da Taça (jornada "+cupRoundDue()+")");TAB="home";render();return;}if(!ensureValidXI())return;const nx=nextFixture();if(!nx){playWeek();render();return;}playWeek();toast("Resultado: "+lastUserResultTxt());render();};
  const brc=$("#btnRecords");if(brc)brc.onclick=()=>openRecords();
  const brc2=$("#btnRecords2");if(brc2)brc2.onclick=()=>openRecords();
  const bcar=$("#btnCareer");if(bcar)bcar.onclick=()=>openCareer();
  const bpo=$("#btnPlayoff");if(bpo)bpo.onclick=()=>{if(meetBlock())return;playPlayoff();};
  const bsc=$("#btnSuperCup");if(bsc)bsc.onclick=()=>{if(meetBlock())return;playSuperCup();};
  const bfi=$("#btnFinalissima");if(bfi)bfi.onclick=()=>{if(meetBlock())return;playFinalissima();};
  document.querySelectorAll("[data-sharetrophy]").forEach(b=>b.onclick=()=>shareTrophy(b.dataset.sharetrophy));
  document.querySelectorAll("[data-evc]").forEach(b=>b.onclick=()=>{resolveEvent(+b.dataset.evc);render();});
  const bec=$("#btnEventCont");if(bec)bec.onclick=()=>{dismissEvent();render();};
  const bn=$("#btnNewSeason");if(bn)bn.onclick=()=>{newSeason();track("nova-epoca", G.manager.name+" · "+me().name+" ("+myDivObj().name+")");TAB="home";render();};
  const bnw=$("#btnNews");if(bnw)bnw.onclick=()=>{openNews();render();};
  const bsv=$("#btnSaves");if(bsv)bsv.onclick=()=>openSaves();
  const br=$("#btnReset");if(br)br.onclick=()=>{if(confirm("Apagar o jogo atual e começar de novo?")){wipe();boot();}};
  document.querySelectorAll("[data-job]").forEach(b=>b.onclick=()=>{takeNewJob(+b.dataset.job);TAB="home";render();});
  const bjr=$("#btnJobRestart");if(bjr)bjr.onclick=()=>{if(confirm("Recomeçar carreira do zero?")){wipe();boot();}};
  document.querySelectorAll("[data-accept]").forEach(b=>b.onclick=()=>{const r=acceptOffer(+b.dataset.accept);if(r.msg)toast(r.msg);render();});
  document.querySelectorAll("[data-reject]").forEach(b=>b.onclick=()=>{rejectOffer(+b.dataset.reject);render();});
  document.querySelectorAll("[data-loan]").forEach(b=>b.onclick=()=>{const r=acceptLoanOffer(+b.dataset.loan,+b.dataset.share);if(r&&r.msg)toast(r.msg);render();});
  document.querySelectorAll("[data-counter]").forEach(b=>b.onclick=()=>{const i=+b.dataset.counter;const o=G.transferOffers[i];if(!o)return;const r=negotiateOffer(i,Math.round(o.fee*1.2*100)/100);if(r.status==="accepted")toast((r.res&&r.res.msg)||"Vendido");else if(r.status==="counter")toast("Contraproposta do clube: "+money(r.fee));else if(r.status==="withdrawn")toast("O clube retirou-se da negociação");render();});
  const sst=$("#segSquadTab");if(sst)sst.querySelectorAll("button").forEach(b=>b.onclick=()=>{squadTab=b.dataset.st;render();});
  const acu=$("#acUpgrade");if(acu)acu.onclick=()=>{const r=upgradeAcademy();toast(r.msg);render();};
  const acf=$("#acFocus");if(acf)acf.onchange=()=>{setAcademyFocus(acf.value);toast("Foco de formação: "+acf.value);};
  document.querySelectorAll("[data-youth]").forEach(el=>el.onclick=()=>openYouth(+el.dataset.youth));
  const sp=$("#segPos");if(sp)sp.querySelectorAll("button").forEach(b=>b.onclick=()=>{squadFilter=b.dataset.p;render();});
  document.querySelectorAll("[data-sell]").forEach(b=>b.onclick=e=>{e.stopPropagation();if(confirm("Vender este jogador?")){const r=sellPlayer(+b.dataset.sell);toast(r.msg);render();}});
  document.querySelectorAll("[data-detail]").forEach(el=>el.onclick=()=>openPlayer(+el.dataset.detail));
  const sf=$("#selForm");if(sf)sf.onchange=()=>{tacSel=null;G.formation=sf.value;G.lineup=autoPickLineup(me(),G.formation,[...unavailable(me())]);save();render();};
  const sm=$("#selMent");if(sm)sm.onchange=()=>{G.mentality=sm.value;save();render();};
  document.querySelectorAll(".roleSel").forEach(sel=>sel.onchange=()=>{ if(typeof setRole==="function")setRole(sel.dataset.role, sel.value?+sel.value:null); render(); });
  const ba=$("#btnAuto");if(ba)ba.onclick=()=>{tacSel=null;G.lineup=autoPickLineup(me(),G.formation,[...unavailable(me())]);save();toast("Onze otimizado");render();};
  const bva=$("#btnVacate");if(bva)bva.onclick=()=>{if(tacSel&&tacSel.type==="slot"){G.lineup[tacSel.slot]=null;tacSel=null;save();render();}};
  const bcs=$("#btnCancelSel");if(bcs)bcs.onclick=()=>{tacSel=null;render();};
  const smk=$("#segMkt");if(smk)smk.querySelectorAll("button").forEach(b=>b.onclick=()=>{marketPos=b.dataset.p;render();});
  const smt=$("#segMktTab");if(smt)smt.querySelectorAll("button").forEach(b=>b.onclick=()=>{marketTab=b.dataset.mt;render();});
  document.querySelectorAll("[data-signfree]").forEach(b=>b.onclick=e=>{e.stopPropagation();const r=signFreeAgent(+b.dataset.signfree);toast(r.msg);render();});
  document.querySelectorAll("[data-loanin]").forEach(b=>b.onclick=e=>{if(e)e.stopPropagation();if(typeof loanInPlayer!=="function")return;const r=loanInPlayer(+b.dataset.from,+b.dataset.loanin,+b.dataset.share);toast(r.msg);render();});
  document.querySelectorAll("[data-freescout]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-signfree]"))return;const p=(G.freeAgents||[]).find(x=>x.id===+el.dataset.freescout);if(p)openScout(p,{});});
  document.querySelectorAll("[data-scoutmk]").forEach(el=>el.onclick=e=>{if(e.target.closest("[data-club]"))return;const from=+el.dataset.mkfrom,p=myClubs()[from]&&myClubs()[from].squad.find(x=>x.id===+el.dataset.scoutmk);if(p)openScout(p,{fromId:from,clubName:myClubs()[from].short});});
  document.querySelectorAll("[data-club]").forEach(el=>el.onclick=e=>{e.stopPropagation();openClubSquad(el.dataset.club);});
  const bab=$("#btnAskBudget");if(bab)bab.onclick=()=>{const r=requestBudget();toast(r.msg);render();};
  const sl=$("#segLeague");if(sl)sl.querySelectorAll("button").forEach(b=>b.onclick=()=>{tableTab=b.dataset.t;render();});
  const segDT=$("#segDivT");if(segDT)segDT.querySelectorAll("button").forEach(b=>b.onclick=()=>{const dt=+b.dataset.dt; if(G.divisions[leagueDiv].tier!==dt)leagueDiv=+b.dataset.idx; render();});
  const segST=$("#segSerT");if(segST)segST.querySelectorAll("button").forEach(b=>b.onclick=()=>{leagueDiv=+b.dataset.d;render();});
  if(document.querySelector(".pitch"))initTacticsTap();
}

/* ---------- ecrã inicial ---------- */
function splashScreen(){
  const el=document.createElement("div");el.className="splash";el.id="splash";
  const GRPS=[]; let _fi=0;
  (typeof LEAGUES!=="undefined"?LEAGUES:[]).forEach(dv=>dv.series.forEach(se=>GRPS.push({fi:_fi++,divName:dv.name,serie:se.name,clubs:se.clubs})));
  const DIVN=[...new Set(GRPS.map(g=>g.divName))];
  el.innerHTML=`<svg width="78" height="78" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 6px 16px rgba(0,0,0,.5))">
      <defs><linearGradient id="lgSplash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#12213a"/><stop offset="1" stop-color="#0a0e14"/></linearGradient></defs>
      <rect width="100" height="100" rx="24" fill="url(#lgSplash)" stroke="#ffcf33" stroke-width="2"/>
      <rect x="24" y="20" width="52" height="62" rx="6" fill="#182338" stroke="#ffcf33" stroke-width="3.2"/>
      <rect x="44" y="15" width="12" height="7" rx="2.2" fill="#ffcf33"/>
      <rect x="29" y="27" width="42" height="50" rx="3" fill="#0e7a3a"/>
      <line x1="29" y1="52" x2="71" y2="52" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.3"/>
      <circle cx="50" cy="52" r="7.5" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.3"/>
      <path d="M 37 71 Q 44 44 60 40" fill="none" stroke="#ffcf33" stroke-width="4" stroke-linecap="round"/>
      <polygon points="66.5,39.5 57.5,36 59,45.2" fill="#ffcf33"/>
      <circle cx="37" cy="71" r="3" fill="#f3f7fb"/></svg>
    <h1 style="font-size:24px;margin:14px 0 2px">Gestor de Futebol</h1>
    <div class="muted" style="margin-bottom:20px">4 divisões da AF Braga</div>
    <div style="width:100%;max-width:360px">
      <div class="muted" style="text-align:left;margin-bottom:6px;font-size:13px">O teu nome (treinador):</div>
      <input id="mgrName" maxlength="28" placeholder="Ex: Nemec Rui" style="width:100%;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:11px;font-size:15px;margin-bottom:12px">
      <div class="muted" style="text-align:left;margin-bottom:6px;font-size:13px">Divisão:</div>
      <select id="divSel" style="margin-bottom:12px">${DIVN.map((n,i)=>`<option value="${i}">${n}</option>`).join("")}</select>
      <div class="muted" style="text-align:left;margin-bottom:6px;font-size:13px" id="serieLbl">Série:</div>
      <select id="serieSel" style="margin-bottom:12px"></select>
      <div class="muted" style="text-align:left;margin-bottom:6px;font-size:13px">Clube:</div>
      <select id="clubSel" style="margin-bottom:14px"></select>
      <button class="btn" id="startBtn">▶ Começar carreira</button></div>
    <div class="muted" style="font-size:11px;margin-top:16px;max-width:340px">Cores provisórias, jogadores e atributos fictícios.</div>`;
  document.body.appendChild(el);
  const divSel=el.querySelector("#divSel"), serieSel=el.querySelector("#serieSel"), clubSel=el.querySelector("#clubSel"), serieLbl=el.querySelector("#serieLbl");
  const curGroup=()=>GRPS.find(g=>g.fi===+serieSel.value)||GRPS[0];
  function fillClubs(){ const g=curGroup(); clubSel.innerHTML=g.clubs.map((c,i)=>`<option value="${i}">${c.n}</option>`).join(""); }
  function fillSeries(){ const dn=DIVN[+divSel.value], ss=GRPS.filter(g=>g.divName===dn);
    serieSel.innerHTML=ss.map(g=>`<option value="${g.fi}">${g.serie?("Série "+g.serie):"Série única"}</option>`).join("");
    const one=ss.length<=1; serieSel.style.display=one?"none":""; serieLbl.style.display=one?"none":""; fillClubs(); }
  fillSeries(); divSel.onchange=fillSeries; serieSel.onchange=fillClubs;
  el.querySelector("#startBtn").onclick=()=>{
    const nm=(el.querySelector("#mgrName").value||"").trim();
    if(nm.length<4){
      let e=el.querySelector("#nmErr");
      if(!e){e=document.createElement("div");e.id="nmErr";e.style.cssText="color:var(--red);font-size:12px;margin-top:8px";el.querySelector("#startBtn").after(e);}
      e.textContent="O nome do treinador precisa de pelo menos 4 caracteres.";
      el.querySelector("#mgrName").focus(); return;
    }
    newGame(curGroup().fi,+clubSel.value,nm);track("nova-carreira/"+me().short, G.manager.name+" · "+me().name+" ("+myDivObj().name+")");el.remove();TAB="home";render();
  };
}
function boot(){
  document.getElementById("splash")?.remove();
  requestPersist();                          // pede ao browser para não despejar a gravação
  if(load()&&G){if(typeof ensureCareer==="function")ensureCareer();if(typeof ensureRoles==="function")ensureRoles();TAB="home";render(); if(hasNewsNew())setTimeout(()=>{ if(G)openNews(); },700);}
  else{ markNewsSeen(); splashScreen(); }
}
function downloadText(filename,text){ try{ const blob=new Blob([text],{type:"application/json"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(url);a.remove();},600); }catch(e){ toast("Descarregar não disponível — usa o copiar código."); } }
function openExport(){
  const data=exportSave(); if(!data||data==="null"){ toast("Nada para exportar."); return; }
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><button class="close" id="exClose">✕</button>
    <div style="font-weight:800;font-size:16px;margin-bottom:6px">Exportar gravação</div>
    <div class="muted" style="font-size:12px;margin-bottom:10px">Guarda o ficheiro (recomendado) ou copia o código — serve de cópia de segurança e para levar o jogo para outro dispositivo.</div>
    <button class="btn" id="exDl" style="margin-bottom:8px">💾 Descarregar ficheiro</button>
    <button class="btn sec small" id="exCopy" style="width:100%;margin-bottom:8px">📋 Copiar código</button>
    <textarea id="exTxt" readonly style="width:100%;height:110px;background:var(--panel2);color:var(--muted);border:1px solid var(--line);border-radius:10px;padding:8px;font-size:11px"></textarea></div>`;
  document.body.appendChild(mo);
  mo.querySelector("#exTxt").value=data;
  mo.querySelector("#exClose").onclick=()=>mo.remove();
  mo.onclick=e=>{if(e.target===mo)mo.remove();};
  mo.querySelector("#exDl").onclick=()=>downloadText("gestor-futebol-"+Date.now()+".json",data);
  mo.querySelector("#exCopy").onclick=()=>{const t=mo.querySelector("#exTxt");t.select();try{document.execCommand("copy");}catch(e){} if(navigator.clipboard)navigator.clipboard.writeText(data).catch(()=>{}); toast("Código copiado");};
}
function openImport(onDone){
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><button class="close" id="imClose">✕</button>
    <div style="font-weight:800;font-size:16px;margin-bottom:6px">Importar gravação</div>
    <div class="muted" style="font-size:12px;margin-bottom:10px">Escolhe um ficheiro exportado ou cola o código. Substitui o jogo do slot atual.</div>
    <button class="btn" id="imFile" style="margin-bottom:8px">📂 Escolher ficheiro</button>
    <textarea id="imTxt" placeholder="…ou cola aqui o código" style="width:100%;height:96px;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:8px;font-size:11px;margin-bottom:8px"></textarea>
    <button class="btn sec small" id="imGo" style="width:100%">Importar código colado</button></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#imClose").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
  const finish=(txt)=>{ const r=importSave(txt); if(r.ok){ toast("Gravação importada!"); close(); if(onDone)onDone(); } else toast(r.msg||"Falhou a importação"); };
  mo.querySelector("#imGo").onclick=()=>{const t=mo.querySelector("#imTxt").value.trim(); if(!t){toast("Cola o código primeiro.");return;} finish(t);};
  mo.querySelector("#imFile").onclick=()=>{ const inp=document.createElement("input");inp.type="file";inp.accept=".json,.txt,application/json";inp.onchange=()=>{const f=inp.files&&inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>finish(String(rd.result));rd.readAsText(f);};inp.click(); };
}
function openSaves(){
  const mo=document.createElement("div");mo.className="modal";
  mo.innerHTML=`<div class="box"><button class="close" id="svClose">✕</button>
    <div style="font-weight:800;font-size:16px;margin-bottom:4px">Gravações</div>
    <div class="muted" style="font-size:12px;margin-bottom:10px">3 espaços de jogo neste dispositivo. Exporta para teres cópia de segurança ou mudares de telemóvel.</div>
    <div id="slotList"></div>
    <div class="row" style="gap:8px;margin-top:4px">
      <button class="btn sec small" id="svExport" style="flex:1">⬇️ Exportar</button>
      <button class="btn sec small" id="svImport" style="flex:1">⬆️ Importar</button></div></div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#svClose").onclick=close;
  mo.onclick=e=>{if(e.target===mo)close();};
  function renderSlots(){
    const cur=curSlot(); let rows="";
    for(let n=1;n<=3;n++){ const info=slotInfo(n), active=n===cur;
      const desc=info.exists?(info.broken?"(gravação inválida)":(info.name+" · "+info.club+" · época "+info.season+(info.fired?" · despedido":""))):"vazio";
      rows+=`<div class="card" style="padding:10px;margin-bottom:8px;${active?'border-color:var(--accent)':''}">
        <div style="font-weight:700">Slot ${n}${active?' · <span style="color:var(--accent)">atual</span>':''}</div>
        <div class="muted" style="font-size:12px;margin:4px 0 8px">${desc}</div>
        <div class="row" style="gap:6px">
          <button class="btn sec small" data-open="${n}" style="flex:1">${info.exists&&!info.broken?'Abrir':'Nova carreira'}</button>
          ${info.exists?`<button class="btn warn small" data-del="${n}">Apagar</button>`:''}</div></div>`;
    }
    mo.querySelector("#slotList").innerHTML=rows;
    mo.querySelectorAll("[data-open]").forEach(b=>b.onclick=()=>{const n=+b.dataset.open, info=slotInfo(n);
      if(info.exists&&!info.broken){ if(loadSlot(n)){ close(); TAB="home"; render(); } }
      else { setSlot(n); close(); document.getElementById("splash")?.remove(); splashScreen(); } });
    mo.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>{const n=+b.dataset.del; if(confirm("Apagar a gravação do slot "+n+"?")){ const wasCur=(n===curSlot()); wipeSlot(n); if(wasCur){ close(); boot(); } else renderSlots(); }});
  }
  mo.querySelector("#svExport").onclick=()=>openExport();
  mo.querySelector("#svImport").onclick=()=>openImport(()=>{ close(); TAB="home"; render(); });
  renderSlots();
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
// chamado pelo motor a cada jogo do campeonato — conta jogos jogados por equipa (com treinador no título)
function onManagerMatch(){ try{ if(typeof G!=="undefined"&&G&&G.manager) track("jogo/"+me().short, G.manager.name+" · "+me().name+" ("+myDivObj().name+")"); }catch(e){} }

/* ---------- PWA ---------- */
function initPWA(){
  // manifest, ícones e apple-touch são ficheiros estáticos (ligados no index.html) para o Android
  // instalar como app real (WebAPK, sem o crachá do Chrome). Aqui só registamos o service worker.
  try{
    if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }
  }catch(e){}
}
function iconDataURL(size){
  const s=size, c=document.createElement("canvas");c.width=c.height=s;const x=c.getContext("2d");
  const F=v=>v*s;
  const rr=(X,Y,W,H,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath();};
  const g=x.createLinearGradient(0,0,0,s);g.addColorStop(0,"#12213a");g.addColorStop(1,"#0a0e14");x.fillStyle=g;x.fillRect(0,0,s,s);
  rr(F(0.24),F(0.20),F(0.52),F(0.62),F(0.06));x.fillStyle="#182338";x.fill();x.lineWidth=F(0.032);x.strokeStyle="#ffcf33";x.stroke();  // prancheta
  rr(F(0.44),F(0.15),F(0.12),F(0.07),F(0.022));x.fillStyle="#ffcf33";x.fill();                                                        // clip
  rr(F(0.29),F(0.27),F(0.42),F(0.50),F(0.03));x.fillStyle="#0e7a3a";x.fill();                                                         // relvado
  x.strokeStyle="rgba(255,255,255,0.55)";x.lineWidth=Math.max(1,F(0.013));
  x.beginPath();x.moveTo(F(0.29),F(0.52));x.lineTo(F(0.71),F(0.52));x.stroke();
  x.beginPath();x.arc(F(0.5),F(0.52),F(0.075),0,7);x.stroke();
  x.strokeStyle="#ffcf33";x.lineWidth=F(0.040);x.lineCap="round";x.lineJoin="round";                                                  // seta tática
  x.beginPath();x.moveTo(F(0.37),F(0.71));x.quadraticCurveTo(F(0.44),F(0.44),F(0.60),F(0.40));x.stroke();
  x.fillStyle="#ffcf33";x.beginPath();x.moveTo(F(0.665),F(0.395));x.lineTo(F(0.575),F(0.360));x.lineTo(F(0.590),F(0.452));x.closePath();x.fill();
  x.fillStyle="#f3f7fb";x.beginPath();x.arc(F(0.37),F(0.71),F(0.030),0,7);x.fill();                                                    // ponto de partida
  return c.toDataURL("image/png");
}
initPWA();
initAnalytics();
boot();
