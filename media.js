"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — media.js
   Órgãos de comunicação social (fictícios) que fazem as perguntas
   nas conferências de imprensa. Cada pergunta é atribuída a um órgão,
   e o painel mostra o logótipo + nome do órgão.

   Quando um órgão REAL autorizar o nome/logo, acrescenta-o no data.js
   (secção "orgaos") e ele entra na rotação — ver data.js.

   Carregado ANTES do ui.js (a seguir ao chars.js).
   ============================================================ */

const MEDIA = [
  { id:"tribuna", nome:"Tribuna Minhota", tipo:"Jornal", cor:"#c1121f",
    svg:`<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#c1121f"/>
      <rect x="12" y="13" width="24" height="22" rx="2.5" fill="#fff"/>
      <rect x="15" y="16" width="13" height="4" rx="1" fill="#c1121f"/>
      <rect x="15" y="22.5" width="18" height="1.9" rx="0.9" fill="#c1121f" opacity=".82"/>
      <rect x="15" y="26" width="18" height="1.9" rx="0.9" fill="#c1121f" opacity=".82"/>
      <rect x="15" y="29.5" width="11" height="1.9" rx="0.9" fill="#c1121f" opacity=".82"/>
    </svg>` },
  { id:"cavado", nome:"Rádio Cávado", tipo:"Rádio", cor:"#1d4ed8",
    svg:`<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#1d4ed8"/>
      <circle cx="24" cy="26" r="3.6" fill="#fff"/>
      <path d="M18 20.5 a9 9 0 0 0 0 11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M30 20.5 a9 9 0 0 1 0 11" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M14 16.5 a15 15 0 0 0 0 19" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".65"/>
      <path d="M34 16.5 a15 15 0 0 1 0 19" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".65"/>
    </svg>` },
  { id:"bolaave", nome:"Bola do Ave", tipo:"Desporto", cor:"#15803d",
    svg:`<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#15803d"/>
      <circle cx="24" cy="24" r="13" fill="#fff"/>
      <path d="M24 18.2 l5.2 3.8 -2 6.1 h-6.4 l-2 -6.1 Z" fill="#15803d"/>
      <g stroke="#15803d" stroke-width="1.5" stroke-linecap="round">
        <path d="M24 11.2 v3.4"/><path d="M12.4 21.5 l3.2 1.1"/><path d="M35.6 21.5 l-3.2 1.1"/>
        <path d="M17.6 34.5 l2 -3.1"/><path d="M30.4 34.5 l-2 -3.1"/>
      </g>
    </svg>` },
  { id:"bracaratv", nome:"Bracara TV", tipo:"Televisão", cor:"#7c3aed",
    svg:`<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <rect x="2" y="2" width="44" height="44" rx="10" fill="#7c3aed"/>
      <rect x="11" y="14.5" width="26" height="17" rx="3.2" fill="#fff"/>
      <path d="M21.5 19.5 l7.5 4 -7.5 4 Z" fill="#7c3aed"/>
      <rect x="19.5" y="33.2" width="9" height="2.3" rx="1.1" fill="#fff"/>
    </svg>` }
];

/* pool = 4 fictícios + os que estiverem no data.js (orgaos) */
function mediaPool(){
  let extra=[];
  try{ if(typeof GAME_DATA!=="undefined" && GAME_DATA && Array.isArray(GAME_DATA.orgaos)) extra=GAME_DATA.orgaos; }catch(e){}
  const norm=extra.map((o,i)=>({ id:"cfg"+i, nome:o.nome||"Órgão", tipo:o.tipo||"", cor:o.cor||"#f2c200", svg:o.svg||null, logo:o.logo||null }))
    .filter(o=>o.nome);
  return MEDIA.concat(norm);
}
function pickMedia(){ const p=mediaPool(); return p.length? p[Math.floor(Math.random()*p.length)] : null; }

/* HTML do logótipo (svg inline, imagem, ou crachá de iniciais) */
function orgaoLogoHTML(o,size){ size=size||34; if(!o)return "";
  const box=`display:inline-flex;flex:0 0 auto;width:${size}px;height:${size}px;align-items:center;justify-content:center`;
  if(o.svg)  return `<span class="orglogo" style="${box}">${o.svg}</span>`;
  if(o.logo) return `<img class="orglogo" src="${o.logo}" alt="${o.nome||''}" style="${box};object-fit:contain;border-radius:8px">`;
  const ini=(o.nome||"?").split(/\s+/).map(w=>w[0]).slice(0,2).join("").toUpperCase();
  return `<span class="orglogo" style="${box};background:${o.cor||'#888'};color:#fff;border-radius:8px;font-weight:800;font-size:${Math.round(size*0.42)}px">${ini}</span>`;
}

if(typeof module!=="undefined" && module.exports){ module.exports={ MEDIA, mediaPool, pickMedia, orgaoLogoHTML }; }
