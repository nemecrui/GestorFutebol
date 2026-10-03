"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — minipitch.js
   Mini-campo do jogo ao vivo + AMBIENTE DE ESTÁDIO (bancada com
   público nas cores do clube, dia/noite com holofotes). A bola
   segue a posse/ataques e pisca no golo. Piso de st.pitch.key.
   opts = { key, night, crowd(0..1), homeC1, homeC2, awayC1 }
   Carregado ANTES do ui.js.
   ============================================================ */
function buildMiniPitch(container, opts){
  const NS="http://www.w3.org/2000/svg";
  opts=opts||{}; const key0=opts.key||"relva";
  const homeC1=opts.homeC1||"#2a6cf0", homeC2=opts.homeC2||"#ffffff", awayC1=opts.awayC1||"#e5323b";
  container.innerHTML=`<div class="mpwrap"><svg viewBox="0 0 400 192" class="mpsvg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="mp_relva" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f8a43"/><stop offset="1" stop-color="#15692f"/></linearGradient>
      <linearGradient id="mp_relva_gasta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f7a3a"/><stop offset="1" stop-color="#3c5f2c"/></linearGradient>
      <linearGradient id="mp_mud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a2e"/><stop offset="1" stop-color="#3a3326"/></linearGradient>
      <linearGradient id="mp_sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c79a5b"/><stop offset="1" stop-color="#a97e44"/></linearGradient>
      <radialGradient id="mp_flood" cx="50%" cy="0%" r="75%"><stop offset="0" stop-color="#fffbe0" stop-opacity=".22"/><stop offset="1" stop-color="#fffbe0" stop-opacity="0"/></radialGradient>
    </defs>
    <!-- bancada / sky -->
    <rect id="mpsky" width="400" height="24" fill="#121824"/>
    <g id="mpcrowd"></g>
    <g id="mpfloodtop"></g>
    <rect x="0" y="23.5" width="400" height="2" fill="#0a0e16"/>
    <!-- campo (deslocado 26px para baixo para abrir espaço à bancada) -->
    <g id="mpfield" transform="translate(0,26)">
      <rect id="mpbase" width="400" height="166" fill="url(#mp_relva)"/>
      <g id="mpstripes"></g><g id="mppatch"></g>
      <g id="mplines" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2">
        <rect x="12" y="10" width="376" height="146" rx="2"/><line x1="200" y1="10" x2="200" y2="156"/>
        <circle cx="200" cy="83" r="25"/><rect x="12" y="48" width="46" height="70"/><rect x="342" y="48" width="46" height="70"/>
        <rect x="12" y="66" width="16" height="34"/><rect x="372" y="66" width="16" height="34"/></g>
      <circle cx="200" cy="83" r="2" fill="#fff" opacity=".8"/>
      <rect x="8" y="70" width="4" height="26" fill="#fff" opacity=".85"/><rect x="388" y="70" width="4" height="26" fill="#fff" opacity=".85"/>
      <g id="mprain" style="display:none"></g>
      <rect id="mpnight" width="400" height="166" fill="#0a1430" opacity="0" style="pointer-events:none"/>
      <g id="mpfloodglow" style="display:none"></g>
      <g id="mpball"><circle r="5" fill="#fff" stroke="#111" stroke-width="1.3"/><circle r="1.6" fill="#111"/></g>
    </g>
  </svg><div class="mpflash" id="mpflash"></div></div>`;
  const q=s=>container.querySelector(s);
  const base=q("#mpbase"),stripes=q("#mpstripes"),patch=q("#mppatch"),lines=q("#mplines"),rain=q("#mprain"),ball=q("#mpball"),flash=q("#mpflash");
  const sky=q("#mpsky"),crowd=q("#mpcrowd"),floodTop=q("#mpfloodtop"),nightEl=q("#mpnight"),floodGlow=q("#mpfloodglow");
  function el(t,a){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;}
  function clr(g){while(g.firstChild)g.removeChild(g.firstChild);}
  function rng(seed){return function(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};}
  function blob(cx,cy,rx,ry,fill,op){patch.appendChild(el("ellipse",{cx,cy,rx,ry,fill,opacity:op}));}

  /* ----- bancada / ambiente ----- */
  function ambience(night, crowdLvl){
    clr(crowd); clr(floodTop); clr(floodGlow);
    crowdLvl=Math.max(0.1,Math.min(0.9,crowdLvl==null?0.4:crowdLvl));
    sky.setAttribute("fill", night?"#0a1020":"#121824");
    const R=rng(29), rows=[4.5,9.5,14.5,19];
    for(let yi=0;yi<rows.length;yi++){ const y=rows[yi];
      for(let x=7;x<=393;x+=6.4){
        if(R()>crowdLvl)continue;
        const awayPocket = x>332;                                  // pequena bolsa visitante à direita
        let col;
        const r=R();
        if(awayPocket){ col = r<0.7?awayC1:"#e9edf4"; }
        else { col = r<0.6?homeC1 : (r<0.78?homeC2 : (r<0.9?"#e9edf4":"#2b3344")); }
        crowd.appendChild(el("rect",{x:x+(R()-0.5)*1.4,y:y+(R()-0.5)*1.2,width:3,height:3,rx:0.8,fill:col,opacity:night?0.72:0.92}));
      }
    }
    // holofotes (noite)
    if(night){
      [60,200,340].forEach(cx=>floodTop.appendChild(el("rect",{x:cx-1,y:0,width:2,height:6,fill:"#fff7cc",opacity:.9})));
      [60,200,340].forEach(cx=>floodTop.appendChild(el("circle",{cx,cy:2,r:2.2,fill:"#fffbe0"})));
      nightEl.setAttribute("opacity","0.34");
      floodGlow.style.display="";
      [[80,20],[320,20],[120,150],[280,150]].forEach(p=>floodGlow.appendChild(el("ellipse",{cx:p[0],cy:p[1],rx:120,ry:90,fill:"url(#mp_flood)"})));
    } else {
      nightEl.setAttribute("opacity","0"); floodGlow.style.display="none";
    }
  }

  /* ----- piso ----- */
  function setSurface(k){ const key=k||"relva";
    const gid = key==="relva_gasta"?"mp_relva_gasta":(key==="mud"?"mp_mud":(key==="sand"?"mp_sand":"mp_relva"));
    base.setAttribute("fill","url(#"+gid+")");
    clr(stripes);clr(patch);clr(rain);rain.style.display="none";
    lines.setAttribute("stroke","#fff");lines.setAttribute("stroke-opacity",".6");
    if(key==="relva"||key==="relva_gasta"){ for(let i=0;i<4;i++)stripes.appendChild(el("rect",{x:i*100,y:0,width:50,height:166,fill:"#fff",opacity:key==="relva"?0.045:0.03})); }
    const R=rng(13);
    if(key==="relva_gasta"){ [[200,83,40,22],[34,83,24,30],[366,83,24,30]].forEach(z=>{for(let i=0;i<6;i++)blob(z[0]+(R()-.5)*z[2]*1.6,z[1]+(R()-.5)*z[3]*1.6,5+R()*8,4+R()*6,"#7a5a33",.32+R()*.22);}); for(let i=0;i<8;i++)blob(20+R()*360,12+R()*140,4+R()*6,3+R()*4,"#2e4d22",.28); }
    if(key==="mud"){ for(let i=0;i<18;i++)blob(20+R()*360,12+R()*140,7+R()*13,5+R()*9,"#5a4a2c",.42+R()*.28); [[200,83],[34,83],[366,83]].forEach(z=>{for(let i=0;i<6;i++)blob(z[0]+(R()-.5)*60,z[1]+(R()-.5)*44,7+R()*11,5+R()*7,"#3e3320",.5);}); for(let i=0;i<5;i++)blob(30+R()*340,18+R()*128,8+R()*10,4+R()*5,"#243244",.5);
      for(let i=0;i<42;i++){const x=R()*400,y=R()*166;rain.appendChild(el("line",{x1:x,y1:y,x2:x-3,y2:y+9,stroke:"#cfe0ff","stroke-width":1,"stroke-linecap":"round",opacity:.5}));} rain.style.display=""; }
    if(key==="sand"){ for(let i=0;i<22;i++)blob(20+R()*360,12+R()*140,7+R()*15,5+R()*10,R()<.5?"#b98a4e":"#8f6a39",.32+R()*.22); for(let i=0;i<10;i++)blob(20+R()*360,12+R()*140,3+R()*4,2+R()*3,"#5f7a3a",.28); lines.setAttribute("stroke","#f0e6d0");lines.setAttribute("stroke-opacity",".42"); }
  }

  /* ----- bola ----- */
  let anim=true;
  function ballTo(x,y,ms){ ball.style.transition="transform "+(anim?ms:0)+"ms cubic-bezier(.5,.05,.4,1)"; ball.setAttribute("transform","translate("+x+","+y+")"); }
  function toZone(side,ms){ const R=Math.random; if(side==="H")ballTo(246+R()*112,44+R()*76,ms||650); else if(side==="A")ballTo(42+R()*112,44+R()*76,ms||650); }
  function goal(side){ ballTo(side==="H"?390:10,83,260); if(anim){flash.classList.remove("show");void flash.offsetWidth;flash.classList.add("show");} setTimeout(()=>ballTo(200,83,420),1300); }
  function reset(){ ballTo(200,83,300); }

  ambience(!!opts.night, opts.crowd); setSurface(key0); ballTo(200,83,0);
  return {setSurface, toZone, goal, reset, ambience, setAnim:v=>{anim=v;}};
}
if(typeof module!=="undefined"&&module.exports)module.exports={buildMiniPitch};
