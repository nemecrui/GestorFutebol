"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — player_card.js
   "Encontra-te no jogo" + cartão de jogador partilhável (estilo FC).
   Qualquer pessoa escolhe divisão → clube → o seu nome e partilha o
   cartão num toque. Reaproveita doShare() / mixHex() / _rrPath() do ui.js.
   Carregado a seguir ao ui.js. Requer notas estáveis (seed) no engine.
   ============================================================ */

/* escala de um atributo (1-20) para display 20-99 */
function _pcStat(a){ return Math.max(20,Math.min(99,Math.round((a||1)*4.6+6))); }

/* 6 estatísticas por grupo de posição */
function _pcStatsFor(p){
  const a=p.attrs||{}, g=(typeof GROUP!=="undefined"?GROUP[p.pos]:"MID");
  let defs;
  if(g==="GK") defs=[["DEFESA","gr"],["POSIÇÃO","pos"],["REFLEXOS","rea"],["FÍSICO","for"],["PÉS","pas"],["CRITÉRIO","cri"]];
  else if(g==="DEF") defs=[["DESARME","des"],["MARCAÇÃO","mar"],["POSIÇÃO","pos"],["FÍSICO","for"],["VELOCIDADE","vel"],["CABECEIO","cab"]];
  else if(g==="ATT") defs=[["REMATE","rem"],["VELOCIDADE","vel"],["DRIBLE","dri"],["CABECEIO","cab"],["CRUZAMENTO","cru"],["FÍSICO","for"]];
  else defs=[["PASSE","pas"],["DRIBLE","dri"],["VISÃO","cri"],["REMATE","rem"],["RESISTÊNCIA","res"],["VELOCIDADE","vel"]];
  return defs.map(([lbl,k])=>[lbl,_pcStat(a[k])]);
}

function _pcLoadImg(src){ return new Promise(r=>{ if(!src)return r(null);
  try{ const im=new Image(); im.crossOrigin="anonymous"; im.onload=()=>r(im); im.onerror=()=>r(null); im.src=src; }catch(e){ r(null); } }); }

/* ---------- canvas do cartão (1080x1350) ---------- */
async function buildPlayerCardCanvas(p, club){
  const S=1080, H=1350, cv=document.createElement("canvas"); cv.width=S; cv.height=H;
  const x=cv.getContext("2d");
  const c1=(club&&club.c1)||"#1d4ed8", c2=(club&&club.c2)||"#f2c200";
  const rt=(typeof ability==="function")?ability(p):60;
  const mix=(typeof mixHex==="function")?mixHex:(a=>a);

  // fundo: cor do clube -> escuro
  const g=x.createLinearGradient(0,0,0,H);
  g.addColorStop(0,c1); g.addColorStop(.30,mix(c1,"#0a0e14",.5));
  g.addColorStop(.68,mix(c1,"#070a10",.8)); g.addColorStop(1,"#06090f");
  x.fillStyle=g; x.fillRect(0,0,S,H);
  // moldura dourada
  x.strokeStyle="rgba(242,194,0,.85)"; x.lineWidth=3;
  if(typeof _rrPath==="function"){ _rrPath(x,26,26,S-52,H-52,30); x.stroke(); }

  x.textAlign="center";
  // topo
  x.fillStyle="#f2c200"; x.font="800 26px Arial";
  x.save(); x.letterSpacing && (x.letterSpacing="4px");
  x.fillText("★  CARTÃO DE JOGADOR  ★", S/2, 84); x.restore();

  // rating + posição (topo esq)
  x.textAlign="left";
  x.fillStyle="#f2c200"; x.font="800 150px Arial"; x.fillText(String(rt), 70, 230);
  x.font="800 42px Arial"; x.fillStyle="#fff"; x.fillText(p.pos, 78, 280);

  // emblema (topo dir)
  const crest = (typeof crestOf==="function")?crestOf(club):null;
  const img = await _pcLoadImg(crest);
  const drawCrest=(cx,cy,r)=>{
    x.save(); x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); x.closePath(); x.fillStyle="#fff"; x.fill(); x.clip();
    if(img) x.drawImage(img,cx-r+10,cy-r+10,2*r-20,2*r-20);
    else { x.fillStyle=c1; x.fillRect(cx-r,cy-r,2*r,2*r); x.fillStyle="#fff"; x.textAlign="center"; x.font="800 "+Math.round(r*0.7)+"px Arial"; x.fillText((club&&club.short)||"",cx,cy+r*0.25); }
    x.restore();
    x.strokeStyle="rgba(242,194,0,.9)"; x.lineWidth=5; x.beginPath(); x.arc(cx,cy,r,0,Math.PI*2); x.stroke();
  };
  // emblema grande ao centro
  drawCrest(S/2, 470, 170);

  // nome + clube
  x.textAlign="center";
  const nm=(p.name||"").toUpperCase();
  x.fillStyle="#fff"; x.font="800 "+(nm.length>16?62:78)+"px Arial";
  x.fillText(nm, S/2, 760);
  x.fillStyle=mix(c2,"#ffffff",.3); x.font="700 30px Arial";
  x.fillText(((club&&club.name)||"").toUpperCase()+"  ·  "+(p.age||"?")+" ANOS", S/2, 808);

  // estatísticas (2 colunas x 3)
  const stats=_pcStatsFor(p);
  const colX=[120, S/2+40], rowY=[900, 1010, 1120];
  const colW=S/2-160;
  x.textAlign="left";
  stats.forEach((st,i)=>{
    const cx=colX[i%2], cy=rowY[Math.floor(i/2)];
    x.fillStyle="#e9dede"; x.font="700 25px Arial"; x.fillText(st[0], cx, cy);
    x.textAlign="right"; x.fillStyle="#f2c200"; x.font="800 34px Arial"; x.fillText(String(st[1]), cx+colW, cy); x.textAlign="left";
    // barra
    x.fillStyle="rgba(255,255,255,.18)"; if(typeof _rrPath==="function"){_rrPath(x,cx,cy+10,colW,8,4);x.fill();}
    x.fillStyle="#f2c200"; if(typeof _rrPath==="function"){_rrPath(x,cx,cy+10,colW*st[1]/99,8,4);x.fill();}
  });

  // rodapé
  x.textAlign="center";
  x.fillStyle="#34d399"; x.font="800 36px Arial"; x.fillText("gestorfutebol.pt", S/2, 1255);
  x.fillStyle="#cdd8ea"; x.font="600 25px Arial"; x.fillText("Joga grátis com os clubes reais da AF Braga", S/2, 1295);

  try{ return cv.toDataURL("image/png"); }catch(e){ return null; }
}

/* ---------- modal "Encontra-te" ---------- */
function openFindYourself(){
  const mo=document.createElement("div"); mo.className="modal";
  mo.innerHTML=`<div class="box" id="fyBox"></div>`;
  document.body.appendChild(mo);
  const box=mo.querySelector("#fyBox");
  const close=()=>{ try{mo.remove();}catch(e){} };
  mo.onclick=e=>{ if(e.target===mo)close(); };
  const sw=(typeof swatch==="function")?swatch:(()=>"");
  const pc=(typeof posClass==="function")?posClass:(()=>"");
  const ab=(typeof ability==="function")?ability:(()=>0);
  function header(t){ return `<button class="close" id="fyX">✕</button><div class="center"><h2 style="justify-content:center">${t}</h2></div>`; }
  function bindX(){ const b=box.querySelector("#fyX"); if(b)b.onclick=close; }

  function divisions(){
    let h=header("📇 Encontra-te no jogo")+`<div class="muted center" style="font-size:12px;margin-bottom:12px">Escolhe a divisão, o teu clube e o teu nome — e partilha o teu cartão.</div>`;
    (G.divisions||[]).forEach((d,i)=>{ h+=`<button class="btn sec" data-div="${i}" style="width:100%;margin-bottom:6px">${d.name}</button>`; });
    box.innerHTML=h; bindX();
    box.querySelectorAll("[data-div]").forEach(b=>b.onclick=()=>clubs(+b.dataset.div));
  }
  function clubs(di){
    const d=G.divisions[di]; let cl=d.clubs.filter(c=>c.squad.some(p=>p.real)); if(!cl.length)cl=d.clubs.slice(); cl=cl.sort((a,b)=>a.name.localeCompare(b.name,"pt"));
    let h=header(d.name)+`<button class="btn sec small" id="fyBack" style="margin-bottom:8px">← Divisões</button>`;
    cl.forEach(c=>{ h+=`<button class="btn sec" data-c="${encodeURIComponent(c.name)}" style="width:100%;margin-bottom:6px;display:flex;align-items:center;gap:8px;justify-content:flex-start">${sw(c,true)}<span>${c.name}</span></button>`; });
    box.innerHTML=h; bindX();
    box.querySelector("#fyBack").onclick=divisions;
    box.querySelectorAll("[data-c]").forEach(b=>b.onclick=()=>players(di,decodeURIComponent(b.dataset.c)));
  }
  function players(di,cname){
    const d=G.divisions[di], c=d.clubs.find(x=>x.name===cname);
    let sq=c.squad.filter(p=>p.real); if(!sq.length)sq=c.squad.slice(); sq=sq.sort((a,b)=>ab(b)-ab(a));
    let h=header(c.name)+`<button class="btn sec small" id="fyBack" style="margin-bottom:8px">← Clubes</button>
      <div class="muted center" style="font-size:11px;margin-bottom:8px">Toca no teu nome para gerar o cartão</div>`;
    sq.forEach(p=>{ h+=`<button class="btn sec" data-pid="${p.id}" style="width:100%;margin-bottom:5px;display:flex;justify-content:space-between;align-items:center">
      <span><span class="pill ${pc(p.pos)}" style="font-size:9px">${p.pos}</span> ${p.name}</span><b style="color:var(--accent)">${ab(p)}</b></button>`; });
    box.innerHTML=h; bindX();
    box.querySelector("#fyBack").onclick=()=>clubs(di);
    box.querySelectorAll("[data-pid]").forEach(b=>b.onclick=()=>preview(di,cname,+b.dataset.pid));
  }
  async function preview(di,cname,pid){
    const d=G.divisions[di], c=d.clubs.find(x=>x.name===cname), p=c.squad.find(x=>x.id===pid);
    box.innerHTML=header(c.name)+`<div class="center" style="min-height:300px;display:flex;align-items:center;justify-content:center"><div class="muted">A gerar o cartão…</div></div>`;
    bindX();
    const url=await buildPlayerCardCanvas(p,c);
    if(!url){ box.innerHTML=header(c.name)+`<div class="muted center">Não foi possível gerar o cartão.</div><button class="btn sec" id="fyBack" style="width:100%;margin-top:8px">← Voltar</button>`; bindX(); box.querySelector("#fyBack").onclick=()=>players(di,cname); return; }
    box.innerHTML=header("O teu cartão")+
      `<img src="${url}" alt="cartão de jogador" style="width:100%;border-radius:10px;box-shadow:0 12px 32px rgba(0,0,0,.45)">
       <button class="btn" id="fyShare" style="width:100%;margin-top:12px">📸 Partilhar o meu cartão</button>
       <button class="btn sec small" id="fyBack" style="width:100%;margin-top:6px">← Escolher outro</button>
       <button class="btn sec small" id="fyFix" style="width:100%;margin-top:6px;opacity:.85">Corrigir ou remover o meu nome</button>`;
    bindX();
    box.querySelector("#fyBack").onclick=()=>players(di,cname);
    box.querySelector("#fyShare").onclick=()=>{ if(typeof doShare==="function")doShare(url,"cartao-gestorfutebol.png","O meu cartão no Gestor de Futebol 🔥 gestorfutebol.pt"); };
    box.querySelector("#fyFix").onclick=()=>{ close(); if(typeof openFeedback==="function")openFeedback(); };
  }
  divisions();
}

if(typeof module!=="undefined" && module.exports){ module.exports={ buildPlayerCardCanvas, openFindYourself, _pcStatsFor, _pcStat }; }
