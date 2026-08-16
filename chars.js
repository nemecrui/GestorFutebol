"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — chars.js
   Mascote/treinador em SVG (poses). A gravata assume a cor do
   clube (parâmetro tie). Usado nas celebrações, conferências,
   derrotas pesadas e ecrã do treinador. Sem dependências, ~KB.
   Poses: "celebrate" | "idle" | "talk" | "sad"
   ============================================================ */
function coachSVG(pose, tie){
  pose = pose || "idle";
  tie = tie || "#f5c518";
  const suit="#2b3a4f", suit2="#233042", skin="#f0c39a", hair="#3a2415", shirt="#f2f6fb", ink="#0b1220";

  // braço: rotação-base estática (em torno do ombro) + wiggle opcional por dentro (compõe no mesmo ponto)
  function arm(sx,sy,deg,wiggle){
    const inner=`<g ${wiggle?`class="${wiggle}" style="transform-origin:${sx}px ${sy}px"`:""}>
      <rect x="${sx-8}" y="${sy}" width="16" height="58" rx="8" fill="${suit}"/>
      <circle cx="${sx}" cy="${sy+58}" r="11" fill="${skin}"/></g>`;
    return `<g transform="rotate(${deg} ${sx} ${sy})">${inner}</g>`;
  }
  const Lx=90, Rx=130, Sy=152;

  let arms, mouth, figCls="";
  if(pose==="celebrate"){
    figCls="cw-bounce";
    arms = arm(Lx,Sy,135,"cw-armL") + arm(Rx,Sy,-135,"cw-armR");   // V bem aberto para cima
    mouth = `<path d="M97 110 Q110 125 123 110" fill="none" stroke="${ink}" stroke-width="3.6"/>`;
  } else if(pose==="talk"){
    figCls="cw-sway";
    arms = arm(Lx,Sy,8,"") + arm(Rx,Sy,-62,"");                     // braço direito a gesticular
    mouth = `<ellipse class="cw-mouth" cx="110" cy="112" rx="6" ry="4" fill="${ink}"/>`;
  } else if(pose==="sad"){
    figCls="cw-slow";
    arms = arm(Lx,Sy,6,"") + arm(Rx,Sy,-6,"");
    mouth = `<path d="M99 116 Q110 107 121 116" fill="none" stroke="${ink}" stroke-width="3.4"/>`;
  } else { // idle
    figCls="cw-breathe";
    arms = arm(Lx,Sy,10,"") + arm(Rx,Sy,-10,"");
    mouth = `<path d="M100 111 Q110 119 120 111" fill="none" stroke="${ink}" stroke-width="3.2"/>`;
  }
  const headTilt = pose==="sad" ? `transform="rotate(-6 110 100)"` : "";
  const brow = pose==="sad" ? `<path d="M95 96 L106 92 M125 96 L114 92" stroke="${ink}" stroke-width="2.6" fill="none"/>` : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 300" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" class="coachfig">
  <style>
    .coachfig .cw-bounce{animation:cwBounce 1.1s ease-in-out infinite; transform-origin:110px 285px}
    .coachfig .cw-breathe{animation:cwBreathe 3s ease-in-out infinite; transform-origin:110px 200px}
    .coachfig .cw-sway{animation:cwSway 2.4s ease-in-out infinite; transform-origin:110px 285px}
    .coachfig .cw-slow{animation:cwSway 3.6s ease-in-out infinite; transform-origin:110px 285px}
    .coachfig .cw-armL{animation:cwArmL 1.1s ease-in-out infinite}
    .coachfig .cw-armR{animation:cwArmR 1.1s ease-in-out infinite}
    .coachfig .cw-mouth{animation:cwTalk .5s ease-in-out infinite; transform-origin:110px 112px}
    @keyframes cwBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
    @keyframes cwBreathe{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.02)}}
    @keyframes cwSway{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}
    @keyframes cwArmL{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(8deg)}}
    @keyframes cwArmR{0%,100%{transform:rotate(6deg)}50%{transform:rotate(-8deg)}}
    @keyframes cwTalk{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
    @media (prefers-reduced-motion: reduce){ .coachfig *{animation:none!important} }
  </style>
  <ellipse cx="110" cy="288" rx="46" ry="8" fill="#000" opacity="0.22"/>
  <g class="${figCls}" stroke="${ink}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
    <rect x="96" y="226" width="13" height="52" rx="6" fill="${suit2}"/>
    <rect x="111" y="226" width="13" height="52" rx="6" fill="${suit2}"/>
    <ellipse cx="99" cy="280" rx="14" ry="7" fill="#12151d"/>
    <ellipse cx="121" cy="280" rx="14" ry="7" fill="#12151d"/>
    ${arms}
    <path d="M86 150 Q86 140 110 140 Q134 140 134 150 L138 224 Q110 232 82 224 Z" fill="${suit}"/>
    <path d="M110 141 L96 150 L110 176 L124 150 Z" fill="${shirt}"/>
    <path d="M110 141 L96 150 L104 168 Z" fill="#1c2836"/>
    <path d="M110 141 L124 150 L116 168 Z" fill="#1c2836"/>
    <path d="M110 150 L104 158 L110 200 L116 158 Z" fill="${tie}"/>
    <circle cx="110" cy="200" r="2.2" fill="#f5c518" stroke="none"/>
    <rect x="103" y="120" width="14" height="16" rx="6" fill="${skin}"/>
    <g ${headTilt}>
      <circle cx="110" cy="100" r="28" fill="${skin}"/>
      <circle cx="84" cy="102" r="5.5" fill="${skin}"/>
      <circle cx="136" cy="102" r="5.5" fill="${skin}"/>
      <path d="M83 96 Q84 68 110 66 Q136 68 137 96 Q130 84 110 84 Q90 84 83 96 Z" fill="${hair}"/>
      ${brow}
      <circle cx="100" cy="100" r="3.4" fill="${ink}" stroke="none"/>
      <circle cx="120" cy="100" r="3.4" fill="${ink}" stroke="none"/>
      ${mouth}
    </g>
  </g>
</svg>`;
}
if(typeof module!=="undefined" && module.exports){ module.exports={ coachSVG }; }
