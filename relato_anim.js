"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — relato_anim.js
   Pequenas animações (SVG + CSS) para os desfechos do relato ao vivo.
   Carregado a seguir ao relato.js (antes do ui.js).

   Uso a partir do ui.js:
     showRelatoAnim(container, kind, branch, corDoClube)
   - kind/branch são os mesmos do relato.js (mapEvent): kind∈{chance,penalty,
     freekick,header,solo,counter,latedrama,own,red,injury}, branch∈{goal,save,
     post,out,miss,wall,cleared,direct,second,...}.
   - Respeita animOn() (o teu interruptor de animações + "reduzir movimento").
   - A cor do clube entra no brilho/confete (a bola fica sempre branca).
   ============================================================ */

/* mapeia (kind,branch) -> tipo de animação */
function relatoAnimType(kind, branch){
  if(kind==="red")    return (branch==="yellowonly") ? null : "red";
  if(kind==="injury") return "injury";
  if(branch==="goal"){ return kind==="penalty" ? "pk_goal" : "goal"; }
  if(branch==="save" || branch==="wall" || branch==="cleared") return (kind==="penalty") ? "pk_save" : "save";
  if(branch==="post") return "post";
  if(branch==="out" || branch==="miss") return "out";
  return null; // disallowed, second-amarelo-only, etc. → sem animação
}

/* CSS injetado uma vez */
const _RA_CSS = `
.gfra{position:relative;width:100%;max-width:340px;margin:0 auto;border-radius:12px;overflow:hidden;
  background:linear-gradient(180deg,#0c1730 0%,#0b1428 100%);border:1px solid rgba(255,255,255,.08)}
.gfra svg{display:block;width:100%;height:auto}
.gfra .grass{fill:#1f7a3d}.gfra .gline{stroke:rgba(255,255,255,.85);stroke-width:3;fill:none}
.gfra .net{stroke:rgba(255,255,255,.30);stroke-width:1}
.gfra .ball{fill:#fff;stroke:#0a1020;stroke-width:1.5}
.gfra .glow{opacity:.5}
.gfra .conf{position:absolute;top:6%;width:7px;height:11px;border-radius:2px;opacity:0}
body.noanim .gfra *{animation:none!important}
body.noanim .gfra .conf{display:none}

@keyframes gfra_goalBall{0%{transform:translate(150px,150px) scale(1);opacity:1}
  40%{transform:translate(214px,72px) scale(.7);opacity:1}88%{transform:translate(214px,72px) scale(.7);opacity:1}
  94%{opacity:0}100%{transform:translate(150px,150px) scale(1);opacity:0}}
@keyframes gfra_netBulge{0%,36%{transform:scale(0);opacity:0}44%{transform:scale(1.3);opacity:.55}62%,100%{transform:scale(1);opacity:0}}
@keyframes gfra_conf{0%,40%{transform:translateY(0) rotate(0);opacity:0}46%{opacity:1}100%{transform:translateY(120px) rotate(300deg);opacity:0}}
@keyframes gfra_keeper{0%,16%{transform:translateX(0) rotate(0)}48%{transform:translate(-42px,-14px) rotate(-26deg)}72%{transform:translate(-42px,-11px) rotate(-22deg)}100%{transform:translateX(0) rotate(0)}}
@keyframes gfra_keeperBall{0%{transform:translate(250px,96px);opacity:1}42%{transform:translate(118px,104px)}52%{transform:translate(150px,120px)}74%{transform:translate(58px,44px);opacity:1}90%{opacity:0}100%{opacity:0}}
@keyframes gfra_postBall{0%{transform:translate(150px,150px);opacity:1}36%{transform:translate(84px,72px)}46%{transform:translate(110px,96px)}72%{transform:translate(250px,120px);opacity:1}84%{opacity:0}100%{opacity:0}}
@keyframes gfra_postShake{0%,32%{transform:translateX(0)}37%{transform:translateX(-3px)}42%{transform:translateX(3px)}47%{transform:translateX(-2px)}52%,100%{transform:translateX(0)}}
@keyframes gfra_clang{0%,34%{transform:scale(0);opacity:0}38%{opacity:.85}58%{transform:scale(2.1);opacity:0}100%{opacity:0}}
@keyframes gfra_outBall{0%{transform:translate(150px,150px) scale(1);opacity:1}56%{transform:translate(236px,-14px) scale(.5);opacity:1}72%{opacity:0}100%{transform:translate(150px,150px) scale(1);opacity:0}}
@keyframes gfra_cabbage{0%,58%{opacity:0;transform:translateY(6px)}66%{opacity:1;transform:translateY(0)}100%{opacity:1}}
@keyframes gfra_pkLeg{0%,30%{transform:rotate(0)}40%{transform:rotate(-46deg)}55%{transform:rotate(6deg)}100%{transform:rotate(0)}}
@keyframes gfra_pkBall{0%,34%{transform:translate(150px,138px);opacity:1}60%{transform:translate(210px,74px) scale(.72);opacity:1}86%{transform:translate(210px,74px) scale(.72)}92%{opacity:0}100%{opacity:0}}
@keyframes gfra_pkKeeper{0%,38%{transform:translateX(0) rotate(0)}62%{transform:translate(34px,6px) rotate(22deg)}100%{transform:translateX(0) rotate(0)}}
@keyframes gfra_pkSaveBall{0%,34%{transform:translate(150px,138px);opacity:1}56%{transform:translate(96px,84px)}66%{transform:translate(120px,104px)}84%{transform:translate(40px,150px);opacity:1}94%{opacity:0}100%{opacity:0}}
@keyframes gfra_rcRaise{0%{transform:translateY(60px) rotate(-6deg)}30%{transform:translateY(0) rotate(0)}72%{transform:translateY(0) rotate(0)}100%{transform:translateY(60px) rotate(-6deg)}}
@keyframes gfra_rcGlow{0%,30%{filter:none}50%{filter:drop-shadow(0 0 9px rgba(239,68,68,.9))}72%,100%{filter:none}}
@keyframes gfra_cross{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.14);opacity:1}}
@keyframes gfra_twitch{0%,42%,100%{transform:rotate(0)}47%{transform:rotate(-2deg)}53%{transform:rotate(2deg)}59%{transform:rotate(0)}}

.gfra .goalBall{animation:gfra_goalBall 2.8s cubic-bezier(.4,0,.5,1) 1 both}
.gfra .netB{transform-origin:214px 72px;animation:gfra_netBulge 2.8s ease-in-out 1 both}
.gfra .conf{animation:gfra_conf 2.8s linear 1 both}
.gfra .kFig{transform-origin:150px 120px;animation:gfra_keeper 2.6s cubic-bezier(.5,0,.4,1) 1 both}
.gfra .kBall{animation:gfra_keeperBall 2.6s ease-in 1 both}
.gfra .pBall{animation:gfra_postBall 2.4s ease-in-out 1 both}
.gfra .pPost{transform-origin:80px 100px;animation:gfra_postShake 2.4s ease-in-out 1 both}
.gfra .pClang{transform-origin:82px 72px;animation:gfra_clang 2.4s ease-out 1 both}
.gfra .oBall{animation:gfra_outBall 2.6s cubic-bezier(.3,0,.5,1) 1 both}
.gfra .cabbage{animation:gfra_cabbage 2.6s ease-in-out 1 both}
.gfra .pkLeg{transform-origin:126px 122px;animation:gfra_pkLeg 2.8s ease-in-out 1 both}
.gfra .pkBall{animation:gfra_pkBall 2.8s ease-out 1 both}
.gfra .pkKeeper{transform-origin:150px 92px;animation:gfra_pkKeeper 2.8s ease-in-out 1 both}
.gfra .pkSaveBall{animation:gfra_pkSaveBall 2.8s ease-in 1 both}
.gfra .pkKeeperS{transform-origin:150px 92px;animation:gfra_keeper 2.8s cubic-bezier(.5,0,.4,1) 1 both}
.gfra .rcHand{transform-origin:150px 170px;animation:gfra_rcRaise 2.6s cubic-bezier(.3,.7,.3,1) 1 both}
.gfra .rcCard{animation:gfra_rcGlow 2.6s ease-in-out 1 both}
.gfra .injCross{transform-origin:214px 52px;animation:gfra_cross 1.5s ease-in-out infinite}
.gfra .injBody{transform-origin:110px 140px;animation:gfra_twitch 2.6s ease-in-out 1 both}
`;

function _raEnsureCSS(){
  if(typeof document==="undefined")return;
  if(document.getElementById("gfraCSS"))return;
  const s=document.createElement("style"); s.id="gfraCSS"; s.textContent=_RA_CSS;
  document.head.appendChild(s);
}

/* baliza reutilizável (frente) */
function _raGoal(x1,x2,top){ return `
  <g class="net">
    <line x1="${x1}" y1="${top}" x2="${x1}" y2="130"/><line x1="${x2}" y1="${top}" x2="${x2}" y2="130"/>
    <line x1="${(x1+x2)/2}" y1="${top}" x2="${(x1+x2)/2}" y2="130"/>
    <line x1="${x1}" y1="${top+30}" x2="${x2}" y2="${top+30}"/><line x1="${x1}" y1="${top+60}" x2="${x2}" y2="${top+60}"/>
  </g>
  <path class="gline" d="M${x1} 130 L${x1} ${top} L${x2} ${top} L${x2} 130"/>`;
}
function _ball(cls,r){ r=r||8; return `<g class="${cls}"><circle class="ball" r="${r}"/><circle r="2" fill="#0a1020" cx="-2" cy="-1"/><circle r="1.5" fill="#0a1020" cx="2.5" cy="2.5"/></g>`; }

/* SVG por tipo. `color` = cor do clube em ataque (brilho/confete). */
function relatoAnimSVG(type, color){
  color = color || "#f2c200";
  const stage = (inner)=>`<svg viewBox="0 0 300 165" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="130" width="300" height="35" class="grass"/>${inner}<line class="gline" x1="20" y1="130" x2="280" y2="130"/></svg>`;
  switch(type){
    case "goal": {
      const conf = [ [44,color],[52,"#34d399"],[60,"#fff"],[66,color],[38,"#60a5fa"] ]
        .map((c,i)=>`<i class="conf" style="left:${c[0]}%;background:${c[1]};animation-delay:${0.05+i*0.05}s"></i>`).join("");
      return `<div class="gfra">${stage(`
        <ellipse class="glow" cx="150" cy="80" rx="120" ry="60" fill="${color}" opacity=".16"/>
        ${_raGoal(80,240,40)}
        <ellipse class="netB" cx="214" cy="72" rx="18" ry="14" fill="#fff"/>
        ${_ball("goalBall",9)}
      `)}<div class="confbox">${conf}</div></div>`;
    }
    case "pk_goal": {
      const conf = [ [46,color],[54,"#34d399"],[60,"#fff"] ]
        .map((c,i)=>`<i class="conf" style="left:${c[0]}%;background:${c[1]};animation-delay:${0.5+i*0.05}s"></i>`).join("");
      return `<div class="gfra">${stage(`
        <ellipse class="glow" cx="150" cy="80" rx="120" ry="60" fill="${color}" opacity=".14"/>
        ${_raGoal(90,230,45)}
        <g class="pkKeeper"><rect x="142" y="80" width="16" height="30" rx="8" fill="#22c55e"/><circle cx="150" cy="72" r="9" fill="#f0c39a"/><rect x="126" y="84" width="20" height="8" rx="4" fill="#22c55e"/><rect x="154" y="84" width="20" height="8" rx="4" fill="#22c55e"/></g>
        <circle cx="150" cy="150" r="3" fill="#0a1020"/>
        <g class="pkLeg"><rect x="119" y="122" width="11" height="34" rx="6" fill="#0a1020"/><ellipse cx="124" cy="158" rx="9" ry="4" fill="#111"/></g>
        ${_ball("pkBall",7)}
      `)}<div class="confbox">${conf}</div></div>`;
    }
    case "save":
      return `<div class="gfra">${stage(`
        ${_raGoal(80,240,40)}
        <g class="kFig">
          <rect x="141" y="86" width="18" height="34" rx="9" fill="#f2c200"/>
          <circle cx="150" cy="78" r="11" fill="#f0c39a"/>
          <rect x="120" y="90" width="24" height="10" rx="5" fill="#f2c200"/>
          <rect x="156" y="90" width="24" height="10" rx="5" fill="#f2c200"/>
          <circle cx="118" cy="95" r="7" fill="#fff" stroke="#0a1020" stroke-width="1.5"/>
          <circle cx="182" cy="95" r="7" fill="#fff" stroke="#0a1020" stroke-width="1.5"/>
        </g>
        ${_ball("kBall",7)}
      `)}</div>`;
    case "pk_save":
      return `<div class="gfra">${stage(`
        ${_raGoal(90,230,45)}
        <g class="pkKeeperS">
          <rect x="141" y="84" width="18" height="32" rx="9" fill="#22c55e"/>
          <circle cx="150" cy="76" r="10" fill="#f0c39a"/>
          <rect x="120" y="88" width="24" height="9" rx="4" fill="#22c55e"/>
          <rect x="156" y="88" width="24" height="9" rx="4" fill="#22c55e"/>
          <circle cx="118" cy="93" r="7" fill="#fff" stroke="#0a1020" stroke-width="1.5"/>
        </g>
        <circle cx="150" cy="150" r="3" fill="#0a1020"/>
        ${_ball("pkSaveBall",7)}
      `)}</div>`;
    case "post":
      return `<div class="gfra">${stage(`
        <g class="net"><line x1="160" y1="40" x2="160" y2="130"/><line x1="80" y1="75" x2="240" y2="75"/></g>
        <path class="gline" d="M240 130 L240 40 L80 40"/>
        <g class="pPost"><line class="gline" x1="80" y1="130" x2="80" y2="40"/></g>
        <circle class="pClang" cx="82" cy="72" r="10" fill="none" stroke="${color}" stroke-width="3"/>
        ${_ball("pBall",9)}
      `)}</div>`;
    case "out":
      return `<div class="gfra">${stage(`
        <path class="gline" d="M80 130 L80 55 L240 55 L240 130"/>
        <g class="cabbage">
          <circle cx="266" cy="128" r="14" fill="#3f7d3f"/><circle cx="266" cy="128" r="9" fill="#5aa95a"/>
          <circle cx="246" cy="134" r="10" fill="#3f7d3f"/><circle cx="246" cy="134" r="6" fill="#5aa95a"/>
        </g>
        ${_ball("oBall",9)}
      `)}</div>`;
    case "red":
      return `<div class="gfra">${stage(`
        <g class="rcHand">
          <rect x="140" y="92" width="16" height="70" rx="8" fill="#1c2836"/>
          <circle cx="148" cy="90" r="12" fill="#f0c39a"/>
          <g class="rcCard"><rect x="150" y="46" width="32" height="46" rx="4" fill="#ef4444" transform="rotate(8 166 69)"/></g>
        </g>
      `)}</div>`;
    case "injury":
      return `<div class="gfra">${stage(`
        <g class="injBody">
          <ellipse cx="110" cy="146" rx="56" ry="7" fill="#000" opacity=".18"/>
          <rect x="62" y="130" width="82" height="15" rx="7" fill="#f2c200"/>
          <circle cx="56" cy="138" r="11" fill="#f0c39a"/>
          <rect x="138" y="122" width="11" height="23" rx="5" fill="#0a1020"/>
        </g>
        <g class="injCross">
          <rect x="196" y="30" width="36" height="36" rx="7" fill="#fff"/>
          <rect x="210" y="36" width="8" height="24" rx="2" fill="#ef4444"/>
          <rect x="202" y="44" width="24" height="8" rx="2" fill="#ef4444"/>
        </g>
      `)}</div>`;
  }
  return "";
}

/* Mostra a animação no container. Devolve true se mostrou algo. */
function showRelatoAnim(container, kind, branch, color, opts){
  opts = opts || {};
  if(!container) return false;
  if(typeof animOn==="function" && !animOn()){ container.hidden=true; container.innerHTML=""; return false; }
  const type = relatoAnimType(kind, branch);
  if(!type){ container.hidden=true; container.innerHTML=""; return false; }
  _raEnsureCSS();
  const html = relatoAnimSVG(type, color);
  if(!html){ container.hidden=true; container.innerHTML=""; return false; }
  container.innerHTML = html;
  container.hidden = false;
  void container.offsetWidth;               // reinicia as animações CSS
  const dur = opts.hold || 2900;
  if(container._raT) clearTimeout(container._raT);
  container._raT = setTimeout(()=>{ container.hidden=true; container.innerHTML=""; }, dur);
  return true;
}

if(typeof module!=="undefined" && module.exports){
  module.exports = { relatoAnimType, relatoAnimSVG, showRelatoAnim };
}
