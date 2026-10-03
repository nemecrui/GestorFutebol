"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — newspaper.js
   "Capa de jornal" — gera uma capa de jornal (fictícia) em canvas
   nos grandes momentos, nos maus momentos e aleatoriamente.

   Jornais: APENAS fictícios por agora (Tribuna Minhota / Bola do Ave).
   Gatilhos (decididos em maybeNewspaper, depois do jogo do utilizador):
     • dérbi ganho               (grande momento)
     • goleada / vitória gorda   (grande momento)
     • derrota pesada            (momento menos bom)
     • série de jogos sem vencer (momento menos bom)  -> G.streakNoWin
     • aleatório em alguns jogos (~8%)

   Render em canvas (reaproveita doShare do ui.js). Carregado a seguir
   ao ui.js em index.html e no sw.js (CORE).
   ============================================================ */

/* jornais FICTÍCIOS de imprensa (só impressos; rádio/TV ficam de fora da capa) */
const NEWS_PAPERS = [
  { nome:"Tribuna Minhota", cor:"#c1121f", lema:"O desporto da região, todos os dias" },
  { nome:"Bola do Ave",     cor:"#15803d", lema:"A paixão do futebol do Vale do Ave" }
];

function _npPaper(){ return NEWS_PAPERS[Math.floor(Math.random()*NEWS_PAPERS.length)]; }
function _npPick(a){ return a[Math.floor(Math.random()*a.length)]; }
function _npLast(name){ return (name||"").split(" ").slice(-1)[0]; }

function _npLoadImg(src){
  return new Promise(res=>{ if(!src)return res(null);
    try{ const im=new Image(); im.crossOrigin="anonymous"; im.onload=()=>res(im); im.onerror=()=>res(null); im.src=src; }catch(e){ res(null); } });
}

/* ---------- decisão: há capa? de que tipo? ---------- */
function maybeNewspaper(st, r){
  try{
    if(!st||!st.userSide||!r) return null;
    const home=st.home, away=st.away, uSide=st.userSide;
    const uClub=uSide==="H"?home:away, oppClub=uSide==="H"?away:home;
    const uGF=uSide==="H"?r.hg:r.ag, uGA=uSide==="H"?r.ag:r.hg;
    const derby=(typeof isDerby==="function")?isDerby(uClub.gid,oppClub.gid):false;
    const diff=uGF-uGA;
    const snw=(typeof G!=="undefined"&&G&&G.streakNoWin)||0;

    let moment=null;
    if(derby && diff>0) moment="derbyWin";
    else if(diff>=4) moment="goleada";
    else if(-diff>=4) moment="desastre";
    else if(diff>=3) moment="goleada";
    else if(-diff>=3) moment="derrota";
    else if(snw>=4 && diff<=0) moment="jejum";
    else if(Math.random()<0.08) moment="aleatorio";
    if(!moment) return null;

    // marcador do utilizador + MOTM-ish
    const us={}; (r.events||[]).forEach(e=>{ if(e.type==="goal"&&e.side===uSide&&e.gtype!=="own"&&e.scorer)us[e.scorer]=(us[e.scorer]||0)+1; });
    let topId=null,tg=0; for(const id in us){ if(us[id]>tg){tg=us[id];topId=id;} }
    const topScorer=topId?uClub.squad.find(x=>x.id==topId):null;

    let pos=null, divName="";
    try{ const d=myDivObj(); divName=d.name; pos=sortedTable(d).findIndex(x=>x.gid===uClub.gid)+1||null; }catch(e){}

    return {
      paper:_npPaper(), moment,
      home, away, uSide, uClub, oppClub,
      hg:r.hg, ag:r.ag, uGF, uGA, diff, derby,
      topScorer: topScorer?topScorer.name:null, topGoals:tg,
      streakNoWin:snw, streakW:(G&&G.streakW)||0, streakU:(G&&G.streakU)||0,
      pos, divName,
      season:(typeof G!=="undefined"&&G)?G.season:1,
      mgr:(typeof G!=="undefined"&&G&&G.manager)?G.manager.name:"O treinador"
    };
  }catch(e){ return null; }
}

/* ---------- texto (manchete / entrada / kicker / corpo / citação) ---------- */
function _npText(info){
  const U=info.uClub.name, Us=info.uClub.short, Os=info.oppClub.short, O=info.oppClub.name;
  const sc=info.hg+"–"+info.ag, scU=info.uGF+"–"+info.uGA, n=info.streakNoWin, mgr=info.mgr;
  const scorerLast=info.topScorer?_npLast(info.topScorer):null;
  let kicker,head,deck,quote,who,body;
  const posTxt=info.pos?(info.pos+"º lugar"):"";

  if(info.moment==="derbyWin"){
    kicker="DÉRBI";
    head=_npPick(["O DÉRBI É NOSSO","FESTA NO DÉRBI","ORGULHO BAIRRISTA",""+Us+" MANDA NO DÉRBI"]);
    deck=_npPick([U+" vence o rival e faz a festa com os adeptos.",
                  "Noite de bairro: "+U+" bate o "+O+" por "+scU+"."]);
    quote=_npPick(["Esta vitória é para os nossos adeptos.","Dias como este não se esquecem.","O bairro é nosso, hoje e sempre."]);
    who=mgr;
    body=["Havia nervos, havia história, havia um bairro inteiro à espera — e o "+U+" não falhou. O triunfo por "+sc+" sobre o "+O+" vale mais do que três pontos: vale orgulho.",
      (scorerLast?scorerLast+" foi a figura do encontro e selou um resultado que ficará na memória.":"O coletivo falou mais alto num jogo de enorme intensidade."),
      (posTxt?"Com este resultado, o "+Us+" segue no "+posTxt+".":"")];
  }
  else if(info.moment==="goleada"){
    kicker="GOLEADA";
    head=_npPick(["CHUVA DE GOLOS","GOLEADA SEM DÓ","EXIBIÇÃO DE LUXO",Us+" PASSA A FERRO"]);
    deck=_npPick([U+" não teve piedade e goleou o "+O+" por "+scU+".",
                  "Golos, espetáculo e muita confiança: "+U+" "+scU+" "+Os+"."]);
    quote=_npPick(["Os jogadores foram fantásticos hoje.","Queríamos dar este espetáculo aos adeptos.","É assim que gosto de ver a equipa jogar."]);
    who=mgr;
    body=["Foi um passeio. O "+U+" entrou forte, não abrandou e construiu uma goleada tranquila frente ao "+O+", que nunca encontrou resposta.",
      (scorerLast?scorerLast+" brilhou"+(info.topGoals>=2?" com "+info.topGoals+" golos":"")+" numa tarde para recordar.":"O ataque funcionou em pleno e os números falam por si."),
      (posTxt?"A vitória reforça a posição do "+Us+", agora no "+posTxt+".":"")];
  }
  else if(info.moment==="desastre"){
    kicker="DESASTRE";
    head=_npPick(["NOITE NEGRA","HUMILHAÇÃO","DESASTRE TOTAL",Us+" EM QUEDA LIVRE"]);
    deck=_npPick([U+" sofre uma pesada derrota frente ao "+O+" ("+scU+").",
                  "Exibição para esquecer: "+O+" atropela o "+U+"."]);
    quote=_npPick(["Assumo toda a responsabilidade por isto.","Temos de pedir desculpa aos adeptos.","Isto não voltará a acontecer."]);
    who=mgr;
    body=["Não há como disfarçar. O "+U+" foi completamente ultrapassado pelo "+O+" e saiu de campo sob um resultado pesado ("+sc+") que deixa muitas dúvidas.",
      "A reação dos adeptos foi de desagrado e as perguntas sobre o rumo da equipa multiplicam-se.",
      (posTxt?"O "+Us+" é, para já, "+posTxt+".":"")];
  }
  else if(info.moment==="derrota"){
    kicker="DERROTA";
    head=_npPick(["SABE A POUCO","DERROTA AMARGA",Us+" SAI DE MÃOS A ABANAR","DIA PARA ESQUECER"]);
    deck=_npPick([U+" perde frente ao "+O+" por "+scU+".",
                  "Trabalho por fazer: "+U+" cai diante do "+O+"."]);
    quote=_npPick(["Faltou-nos eficácia hoje.","Vamos trabalhar para dar a volta.","Merecíamos mais, mas o futebol é assim."]);
    who=mgr;
    body=["O "+U+" não conseguiu travar o "+O+" e somou uma derrota por "+sc+" que travou as ambições da equipa neste jogo.",
      "Fica a promessa de uma resposta já na próxima jornada.",
      (posTxt?"No campeonato, o "+Us+" ocupa o "+posTxt+".":"")];
  }
  else if(info.moment==="jejum"){
    kicker="PRESSÃO";
    head=_npPick([n+" JOGOS SEM VENCER","JEJUM CONTINUA","CRISE INSTALADA","PRESSÃO SOBRE "+mgr.toUpperCase().split(" ")[0]]);
    deck=_npPick(["O "+U+" não vence há "+n+" jogos e o ambiente aquece.",
                  "Sem vitórias há "+n+" jornadas, cresce a contestação no "+Us+"."]);
    quote=_npPick(["Estamos todos juntos nisto.","A vitória está ao virar da esquina.","Pedimos calma e confiança aos adeptos."]);
    who=mgr;
    body=["A seca prolonga-se. Com mais um jogo sem vencer frente ao "+O+" ("+sc+"), o "+U+" chega aos "+n+" encontros sem triunfos e a paciência começa a esgotar-se.",
      "A direção observa, os adeptos murmuram e a próxima jornada ganha contornos decisivos.",
      (posTxt?"O "+Us+" segue no "+posTxt+".":"")];
  }
  else { // aleatorio — depende do resultado
    if(info.diff>0){
      kicker="VITÓRIA";
      head=_npPick([Us+" SOMA E SEGUE","TRÊS PONTOS DE OURO","VITÓRIA IMPORTANTE","MAIS UM TRIUNFO"]);
      deck=U+" vence o "+O+" por "+scU+" e continua a sua caminhada.";
      quote=_npPick(["Importante somar e seguir em frente.","Os três pontos é que contam.","Parabéns ao grupo pelo esforço."]);
      body=["O "+U+" cumpriu frente ao "+O+" ("+sc+") num jogo de trabalho"+(scorerLast?", decidido por "+scorerLast:"")+".",
        "Vitória suada que vale confiança para as próximas jornadas.",
        (posTxt?"O "+Us+" é "+posTxt+".":"")];
    } else if(info.diff<0){
      kicker="FUTEBOL";
      head=_npPick([Us+" TROPEÇA","NEM TUDO CORRE BEM","DERROTA A DIGERIR"]);
      deck=U+" perde com o "+O+" por "+scU+".";
      quote=_npPick(["Cabeça erguida, já pensamos no próximo.","Temos de corrigir e seguir.","Faz parte, vamos reagir."]);
      body=["O "+U+" não foi feliz diante do "+O+" e saiu derrotado por "+sc+".",
        "O grupo garante foco total na próxima jornada.",
        (posTxt?"O "+Us+" é "+posTxt+".":"")];
    } else {
      kicker="EMPATE";
      head=_npPick(["DIVIDEM OS PONTOS","FICA-SE PELA IGUALDADE",Us+" EMPATA"]);
      deck=U+" e "+O+" empatam a "+info.uGF+".";
      quote=_npPick(["Um ponto que pode valer no final.","Sabe a pouco, mas somámos.","Jogo equilibrado, resultado justo."]);
      body=["Repartição de pontos entre "+U+" e "+O+" ("+sc+") num jogo sem vencedor.",
        "Equipa procura regressar às vitórias na próxima ronda.",
        (posTxt?"O "+Us+" é "+posTxt+".":"")];
    }
    who=mgr;
  }
  body=body.filter(Boolean);
  return {kicker,head,deck,quote,who,body};
}

/* ---------- render canvas 1080x1440 ---------- */
async function genNewspaper(info){
  const W=1080, H=1440, M=76;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const x=cv.getContext("2d");
  const SERIF="Georgia, 'Times New Roman', serif", SANS="Arial, Helvetica, sans-serif";
  const INK="#17140d", MUT="#5d564a", RULE="#2b271f", CREAM="#f3eee1";
  const acc=info.paper.cor;
  const T=_npText(info);

  // fundo papel + leve mancha
  x.fillStyle=CREAM; x.fillRect(0,0,W,H);
  const vg=x.createRadialGradient(W/2,H*0.42,120,W/2,H*0.42,H*0.75);
  vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(90,70,30,0.10)");
  x.fillStyle=vg; x.fillRect(0,0,W,H);

  const contW=W-2*M;
  const wrap=(txt,font,maxW)=>{ x.font=font; const words=(txt||"").split(" "); const lines=[]; let cur="";
    words.forEach(w=>{ const t=cur?cur+" "+w:w; if(x.measureText(t).width>maxW&&cur){lines.push(cur);cur=w;} else cur=t; }); if(cur)lines.push(cur); return lines; };
  const line=(y,w)=>{ x.strokeStyle=RULE; x.lineWidth=w||2; x.beginPath(); x.moveTo(M,y); x.lineTo(W-M,y); x.stroke(); };

  // ---- masthead ----
  x.textAlign="center"; x.fillStyle=INK;
  x.font="700 76px "+SERIF; x.fillText(info.paper.nome, W/2, 104);
  x.font="italic 24px "+SERIF; x.fillStyle=MUT; x.fillText(info.paper.lema, W/2, 138);
  line(158,4); line(166,1.5);
  x.font="700 20px "+SANS; x.fillStyle=MUT; x.textAlign="left";
  x.fillText("ÉPOCA "+info.season+(info.divName?"  ·  "+info.divName.toUpperCase():""), M, 192);
  x.textAlign="right"; x.fillText("EDIÇÃO DESPORTIVA", W-M, 192);
  line(208,1.5);

  // ---- kicker ----
  let y=244;
  x.textAlign="left";
  x.font="800 26px "+SANS; const kw=x.measureText(T.kicker).width;
  x.fillStyle=acc; x.fillRect(M, y, kw+34, 44);
  x.fillStyle="#fff"; x.fillText(T.kicker, M+17, y+31);
  y+=44+84;

  // ---- manchete ----
  x.fillStyle=INK;
  let hl=wrap(T.head,"800 96px "+SERIF,contW);
  if(hl.length>3){ hl=wrap(T.head,"800 76px "+SERIF,contW); x.font="800 76px "+SERIF; var lh=74; }
  else { x.font="800 96px "+SERIF; var lh=92; }
  hl.slice(0,3).forEach(l=>{ x.fillText(l, M, y); y+=lh; });
  y+=6;

  // ---- entrada (deck) ----
  x.fillStyle="#3a352b";
  wrap(T.deck,"italic 36px "+SERIF,contW).forEach(l=>{ x.font="italic 36px "+SERIF; x.fillText(l, M, y); y+=44; });
  y+=10;
  line(y,2.5); y+=0;

  // ---- faixa do resultado (hero) ----
  const heroY=y+14, heroH=182;
  x.fillStyle=INK; x.fillRect(M, heroY, contW, heroH);
  // crests
  const [cimg1,cimg2]=await Promise.all([
    _npLoadImg(typeof crestOf==="function"?crestOf(info.home):null),
    _npLoadImg(typeof crestOf==="function"?crestOf(info.away):null)
  ]);
  const drawCrest=(img,cx,cy,rad,club)=>{
    x.save(); x.beginPath(); x.arc(cx,cy,rad,0,Math.PI*2); x.closePath();
    x.fillStyle="#fff"; x.fill(); x.clip();
    if(img){ x.drawImage(img,cx-rad+8,cy-rad+8,rad*2-16,rad*2-16); }
    else { x.fillStyle=club.c1||"#555"; x.fillRect(cx-rad,cy-rad,rad*2,rad*2);
      x.fillStyle="#fff"; x.textAlign="center"; x.font="800 44px "+SANS; x.fillText(club.short||"",cx,cy+16); }
    x.restore();
    x.strokeStyle="rgba(255,255,255,.85)"; x.lineWidth=4; x.beginPath(); x.arc(cx,cy,rad,0,Math.PI*2); x.stroke();
  };
  const cyM=heroY+heroH/2-14, rad=66;
  drawCrest(cimg1, M+118, cyM, rad, info.home);
  drawCrest(cimg2, W-M-118, cyM, rad, info.away);
  x.textAlign="center"; x.fillStyle="#ffcf33"; x.font="800 112px "+SERIF;
  x.fillText(info.hg+" – "+info.ag, W/2, cyM+34);
  x.fillStyle="#eaf1f8"; x.font="700 26px "+SANS;
  x.fillText(info.home.short, M+118, heroY+heroH-16);
  x.fillText(info.away.short, W-M-118, heroY+heroH-16);
  y=heroY+heroH+32;

  // ---- corpo em 2 colunas ----
  const colGap=40, colW=(contW-colGap)/2, colX=[M, M+colW+colGap];
  const bodyFont="400 26px "+SERIF, blh=34;
  const footTop=H-128;
  // juntar parágrafos em linhas, distribuir por 2 colunas
  let lines=[]; T.body.forEach((p,i)=>{ wrap(p,bodyFont,colW).forEach(l=>lines.push({t:l})); if(i<T.body.length-1)lines.push({t:""}); });
  // reservar espaço p/ citação na 2ª coluna
  const quoteLines=wrap('"'+T.quote+'"',"italic 30px "+SERIF,colW-24);
  const quoteH=quoteLines.length*40+70;
  const colCap=Math.floor((footTop-y-10)/blh);
  _npBodyRender(x, {lines, colX, colW, colCap, startY:y, blh, bodyFont, INK, acc, SERIF, quoteLines, quoteH, footTop, MUT, who:T.who});

  // ---- rodapé ----
  x.fillStyle=acc; x.fillRect(0, H-96, W, 96);
  x.textAlign="left"; x.fillStyle="#fff"; x.font="800 40px "+SERIF; x.fillText("gestorfutebol.pt", M, H-40);
  x.textAlign="right"; x.font="700 22px "+SANS; x.fillStyle="rgba(255,255,255,.88)";
  x.fillText("capa fictícia · "+info.paper.nome, W-M, H-40);

  return cv.toDataURL("image/png");
}

/* corpo em 2 colunas, com drop cap e caixa de citação na coluna direita */
function _npBodyRender(x, o){
  const {lines, colX, colW, colCap, startY, blh, bodyFont, INK, acc, SERIF, quoteLines, quoteH, footTop, MUT, who}=o;
  const SANS="Arial, Helvetica, sans-serif";
  x.textAlign="left";
  let idx=0;
  // coluna 0
  let cy=startY;
  if(lines.length){
    // drop cap (ocupa ~2 linhas, com recuo)
    const first=lines[0].t||"";
    const dc=first.charAt(0)||"";
    x.fillStyle=acc; x.font="800 78px "+SERIF; x.fillText(dc, colX[0], startY+60);
    const dcW=x.measureText(dc).width+10;
    x.fillStyle=INK; x.font=bodyFont;
    x.fillText(first.slice(1), colX[0]+dcW, startY+26);
    cy=startY+26+blh; idx=1;
    if(lines[1]){ x.font=bodyFont; x.fillStyle=INK; x.fillText(lines[1].t, colX[0]+dcW, cy); cy+=blh; idx=2; }
    while(idx<lines.length && cy<footTop-10){
      x.font=bodyFont; x.fillStyle=INK; x.fillText(lines[idx].t, colX[0], cy); cy+=blh; idx++;
    }
  }
  // coluna 1 — citação em cima, depois texto
  let qy=startY+10;
  // caixa de citação
  x.fillStyle=acc; x.fillRect(colX[1], qy, 6, quoteH-24);
  x.fillStyle=INK; let ly=qy+34;
  quoteLines.forEach(l=>{ x.font="italic 30px "+SERIF; x.fillText(l, colX[1]+22, ly); ly+=40; });
  x.fillStyle=MUT; x.font="800 22px "+SANS; x.fillText("— "+(who||"").toUpperCase(), colX[1]+22, ly+6);
  let cy2=qy+quoteH+14;
  while(idx<lines.length && cy2<footTop-10){
    x.font=bodyFont; x.fillStyle=INK; x.fillText(lines[idx].t, colX[1], cy2); cy2+=blh; idx++;
  }
}

/* ---------- modal ---------- */
function openNewspaper(info, onDone){
  const fin=()=>{ try{mo.remove();}catch(e){} if(onDone)onDone(); };
  const mo=document.createElement("div"); mo.className="modal";
  mo.innerHTML=`<div class="box" style="text-align:center">
    <div class="muted" style="font-size:11px;letter-spacing:2px;margin-bottom:6px">📰 EDIÇÃO ESPECIAL</div>
    <div id="npWrap" style="min-height:220px;display:flex;align-items:center;justify-content:center">
      <div class="muted" style="font-size:13px">A imprimir a capa…</div></div>
    <button class="btn sec small" id="npShare" style="width:100%;margin-top:10px;display:none">📸 Partilhar capa</button>
    <button class="btn" id="npOk" style="margin-top:8px">Continuar</button></div>`;
  document.body.appendChild(mo);
  mo.querySelector("#npOk").onclick=fin; mo.onclick=e=>{ if(e.target===mo)fin(); };
  genNewspaper(info).then(dataURL=>{
    const w=mo.querySelector("#npWrap"); if(!w)return;
    w.innerHTML=`<img src="${dataURL}" alt="Capa de jornal" style="width:100%;border-radius:8px;box-shadow:0 10px 30px rgba(0,0,0,.4)">`;
    const bs=mo.querySelector("#npShare"); if(bs){ bs.style.display="block";
      bs.onclick=()=>{ if(typeof doShare==="function")doShare(dataURL,"jornal-gestorfutebol.png","Gestor de Futebol · "+info.paper.nome+" · gestorfutebol.pt"); }; }
  }).catch(()=>{ fin(); });
}

/* após "Simular jornada": reconstrói o jogo do utilizador e, se for caso disso, mostra a capa */
function newspaperAfterSim(onDone){
  try{
    const L=(typeof G!=="undefined"&&G)?G._lastUserMatch:null;
    if(!L||typeof clubByGid!=="function"){ if(onDone)onDone(); return; }
    const home=clubByGid(L.hGid), away=clubByGid(L.aGid);
    if(!home||!away){ if(onDone)onDone(); return; }
    const info=maybeNewspaper({home,away,userSide:L.userSide},{hg:L.hg,ag:L.ag,events:L.events||[]});
    if(info){ openNewspaper(info, onDone); return; }
  }catch(e){}
  if(onDone)onDone();
}

if(typeof module!=="undefined" && module.exports){ module.exports={ maybeNewspaper, genNewspaper, openNewspaper, newspaperAfterSim }; }
