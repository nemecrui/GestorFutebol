"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — minipitch.js
   Mini-campo do jogo ao vivo. A bola segue a posse/ataques e
   pisca no golo. O piso (relva / relva_gasta / mud / sand) vem
   de st.pitch.key. Carregado ANTES do ui.js.
   ============================================================ */
function buildMiniPitch(container, key){
  const NS="http://www.w3.org/2000/svg";
  key=key||"relva";
  container.innerHTML=`<div class="mpwrap"><svg viewBox="0 0 400 170" class="mpsvg" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="mp_relva" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f8a43"/><stop offset="1" stop-color="#15692f"/></linearGradient>
      <linearGradient id="mp_relva_gasta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f7a3a"/><stop offset="1" stop-color="#3c5f2c"/></linearGradient>
      <linearGradient id="mp_mud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5a2e"/><stop offset="1" stop-color="#3a3326"/></linearGradient>
      <linearGradient id="mp_sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c79a5b"/><stop offset="1" stop-color="#a97e44"/></linearGradient>
    </defs>
    <rect id="mpbase" width="400" height="170" fill="url(#mp_relva)"/>
    <g id="mpstripes"></g><g id="mppatch"></g>
    <g id="mplines" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2">
      <rect x="12" y="10" width="376" height="150" rx="2"/><line x1="200" y1="10" x2="200" y2="160"/>
      <circle cx="200" cy="85" r="26"/><rect x="12" y="50" width="46" height="70"/><rect x="342" y="50" width="46" height="70"/>
      <rect x="12" y="68" width="16" height="34"/><rect x="372" y="68" width="16" height="34"/></g>
    <circle cx="200" cy="85" r="2" fill="#fff" opacity=".8"/>
    <rect x="8" y="72" width="4" height="26" fill="#fff" opacity=".85"/><rect x="388" y="72" width="4" height="26" fill="#fff" opacity=".85"/>
    <g id="mprain" style="display:none"></g>
    <g id="mpball"><circle r="5" fill="#fff" stroke="#111" stroke-width="1.3"/><circle r="1.6" fill="#111"/></g>
  </svg><div class="mpflash" id="mpflash"></div></div>`;
  const q=s=>container.querySelector(s);
  const base=q("#mpbase"),stripes=q("#mpstripes"),patch=q("#mppatch"),lines=q("#mplines"),rain=q("#mprain"),ball=q("#mpball"),flash=q("#mpflash");
  function el(t,a){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e;}
  function clr(g){while(g.firstChild)g.removeChild(g.firstChild);}
  function rng(seed){return function(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};}
  function blob(cx,cy,rx,ry,fill,op){patch.appendChild(el("ellipse",{cx,cy,rx,ry,fill,opacity:op}));}
  function setSurface(k){ key=k||"relva";
    const gid = key==="relva_gasta"?"mp_relva_gasta":(key==="mud"?"mp_mud":(key==="sand"?"mp_sand":"mp_relva"));
    base.setAttribute("fill","url(#"+gid+")");
    clr(stripes);clr(patch);clr(rain);rain.style.display="none";
    lines.setAttribute("stroke","#fff");lines.setAttribute("stroke-opacity",".6");
    if(key==="relva"||key==="relva_gasta"){ for(let i=0;i<4;i++)stripes.appendChild(el("rect",{x:i*100,y:0,width:50,height:170,fill:"#fff",opacity:key==="relva"?0.045:0.03})); }
    const R=rng(13);
    if(key==="relva_gasta"){ [[200,85,40,22],[34,85,24,30],[366,85,24,30]].forEach(z=>{for(let i=0;i<6;i++)blob(z[0]+(R()-.5)*z[2]*1.6,z[1]+(R()-.5)*z[3]*1.6,5+R()*8,4+R()*6,"#7a5a33",.32+R()*.22);}); for(let i=0;i<8;i++)blob(20+R()*360,14+R()*142,4+R()*6,3+R()*4,"#2e4d22",.28); }
    if(key==="mud"){ for(let i=0;i<18;i++)blob(20+R()*360,14+R()*142,7+R()*13,5+R()*9,"#5a4a2c",.42+R()*.28); [[200,85],[34,85],[366,85]].forEach(z=>{for(let i=0;i<6;i++)blob(z[0]+(R()-.5)*60,z[1]+(R()-.5)*44,7+R()*11,5+R()*7,"#3e3320",.5);}); for(let i=0;i<5;i++)blob(30+R()*340,20+R()*130,8+R()*10,4+R()*5,"#243244",.5);
      for(let i=0;i<45;i++){const x=R()*400,y=R()*170;rain.appendChild(el("line",{x1:x,y1:y,x2:x-3,y2:y+9,stroke:"#cfe0ff","stroke-width":1,"stroke-linecap":"round",opacity:.5}));} rain.style.display=""; }
    if(key==="sand"){ for(let i=0;i<22;i++)blob(20+R()*360,14+R()*142,7+R()*15,5+R()*10,R()<.5?"#b98a4e":"#8f6a39",.32+R()*.22); for(let i=0;i<10;i++)blob(20+R()*360,14+R()*142,3+R()*4,2+R()*3,"#5f7a3a",.28); lines.setAttribute("stroke","#f0e6d0");lines.setAttribute("stroke-opacity",".42"); }
  }
  let anim=true;
  function ballTo(x,y,ms){ ball.style.transition="transform "+(anim?ms:0)+"ms cubic-bezier(.5,.05,.4,1)"; ball.setAttribute("transform","translate("+x+","+y+")"); }
  function toZone(side,ms){ const R=Math.random; if(side==="H")ballTo(248+R()*112,46+R()*78,ms||650); else if(side==="A")ballTo(40+R()*112,46+R()*78,ms||650); }
  function goal(side){ ballTo(side==="H"?390:10,85,260); if(anim){flash.classList.remove("show");void flash.offsetWidth;flash.classList.add("show");} setTimeout(()=>ballTo(200,85,420),1300); }
  function reset(){ ballTo(200,85,300); }
  setSurface(key); ballTo(200,85,0);
  return {setSurface, toZone, goal, reset, setAnim:v=>{anim=v;}};
}
if(typeof module!=="undefined"&&module.exports)module.exports={buildMiniPitch};
