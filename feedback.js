"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — feedback.js
   Reportar bug / dar sugestão / opinião SEM o jogador sair do
   jogo nem se registar. Envia por webhook (Discord ou Telegram),
   configurado em data.js → GAME_DATA.feedback.
   Carregado ANTES do ui.js (a seguir ao media.js).
   ============================================================ */

const FB_APP = "gestor-v5";   // versão da app (acompanha a cache do sw.js)

function _fbCfg(){ try{ return (typeof GAME_DATA!=="undefined" && GAME_DATA && GAME_DATA.feedback) || {}; }catch(e){ return {}; } }

function _fbContext(){
  const o={};
  try{ o.ecra = (typeof TAB!=="undefined") ? TAB : "?"; }catch(e){}
  try{ if(typeof G!=="undefined" && G){
    if(G.season!=null) o.epoca = G.season;
    if(typeof curSlot==="function") o.slot = curSlot();
    const c=(typeof me==="function") ? me() : null; if(c) o.clube=c.name;
  } }catch(e){}
  o.versao = FB_APP;
  try{ o.disp = navigator.userAgent; }catch(e){}
  return o;
}
function _fbContextLine(ctx){
  const p=[];
  if(ctx.ecra) p.push("ecrã: "+ctx.ecra);
  if(ctx.clube) p.push("clube: "+ctx.clube);
  if(ctx.epoca!=null) p.push("época "+ctx.epoca);
  if(ctx.slot!=null) p.push("slot "+ctx.slot);
  return p.join(" · ");
}
function _fbLabel(t){ return t==="bug"?"🐞 BUG":t==="sugestao"?"💡 SUGESTÃO":"💬 OPINIÃO"; }

function openFeedback(){
  const mo=document.createElement("div"); mo.className="modal";
  mo.innerHTML=`<div class="box"><button class="close" id="fbClose">✕</button>
    <div style="font-weight:800;font-size:16px;margin-bottom:4px">💬 Reportar / Sugerir</div>
    <div class="muted" style="font-size:12px;margin-bottom:10px">Encontraste um bug? Tens uma ideia? Conta-nos aqui mesmo — sem sair do jogo e sem te registares.</div>
    <div class="seg" id="fbType" style="margin-bottom:10px">
      <button data-ft="bug" class="active">🐞 Bug</button>
      <button data-ft="sugestao">💡 Sugestão</button>
      <button data-ft="opiniao">💬 Opinião</button></div>
    <textarea id="fbMsg" placeholder="Descreve o bug ou a tua ideia…" style="width:100%;height:118px;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font-size:13px;font-family:inherit;resize:vertical"></textarea>
    <input id="fbContact" placeholder="Nome ou contacto (opcional)" style="width:100%;margin-top:8px;background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px;font-size:13px;font-family:inherit">
    <div class="muted" style="font-size:10.5px;margin-top:8px;line-height:1.4">Para ajudar a corrigir, enviamos também: ecrã atual, clube, época e tipo de dispositivo. Sem dados pessoais.</div>
    <button class="btn" id="fbSend" style="width:100%;margin-top:12px">Enviar feedback</button>
    </div>`;
  document.body.appendChild(mo);
  const close=()=>mo.remove();
  mo.querySelector("#fbClose").onclick=close;
  mo.onclick=e=>{ if(e.target===mo) close(); };
  let ftype="bug";
  mo.querySelectorAll("#fbType [data-ft]").forEach(b=>b.onclick=()=>{ ftype=b.dataset.ft;
    mo.querySelectorAll("#fbType [data-ft]").forEach(x=>x.classList.toggle("active",x===b)); });
  mo.querySelector("#fbSend").onclick=()=>{
    const msg=(mo.querySelector("#fbMsg").value||"").trim();
    if(!msg){ toast("Escreve a tua mensagem primeiro."); return; }
    const contact=(mo.querySelector("#fbContact").value||"").trim();
    const btn=mo.querySelector("#fbSend"); btn.disabled=true; btn.textContent="A enviar…";
    sendFeedback({tipo:ftype, mensagem:msg, contacto:contact}).then(()=>{
      toast("Obrigado pelo feedback! 🙏"); close();
    }).catch(()=>{
      btn.disabled=false; btn.textContent="Enviar feedback";
      if(_fbMailtoFallback({tipo:ftype, mensagem:msg, contacto:contact})) toast("Sem ligação — abrimos o email como alternativa.");
      else toast("Não foi possível enviar agora. Tenta mais tarde.");
    });
  };
}

function sendFeedback(data){
  const cfg=_fbCfg(); const ctx=_fbContext(); const ctxLine=_fbContextLine(ctx);
  const tipo=(cfg.tipo||"discord").toLowerCase();
  const hook=(cfg.webhook||"").trim();
  if(!hook) return Promise.reject(new Error("no-webhook"));

  if(tipo==="telegram"){
    const text = `${_fbLabel(data.tipo)} · Gestor de Futebol\n${data.mensagem}`
      + (data.contacto?`\n— contacto: ${data.contacto}`:"")
      + (ctxLine?`\n${ctxLine}`:"")
      + `\n${ctx.versao}${ctx.disp?" · "+ctx.disp:""}`;
    return fetch(`https://api.telegram.org/bot${hook}/sendMessage`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ chat_id: cfg.chatId, text: text.slice(0,3900), disable_web_page_preview:true })
    }).then(r=>{ if(!r.ok) throw new Error("tg-"+r.status); return true; });
  }
  // Discord (predefinição)
  const content = `**${_fbLabel(data.tipo)}** · Gestor de Futebol\n> ${data.mensagem.replace(/\n/g,"\n> ")}`
    + (data.contacto?`\n**contacto:** ${data.contacto}`:"")
    + (ctxLine?`\n\`${ctxLine}\``:"")
    + `\n\`${ctx.versao}${ctx.disp?" · "+ctx.disp:""}\``;
  return fetch(hook, {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ username:"Gestor de Futebol", content: content.slice(0,1900) })
  }).then(r=>{ if(!r.ok && r.status!==204) throw new Error("dc-"+r.status); return true; });
}

function _fbMailtoFallback(data){
  const cfg=_fbCfg(); const email=(cfg.email||"").trim();
  if(!email) return false;
  try{
    const ctx=_fbContext(); const ctxLine=_fbContextLine(ctx);
    const subj=encodeURIComponent("["+data.tipo.toUpperCase()+"] Gestor de Futebol");
    const body=encodeURIComponent(data.mensagem + (data.contacto?"\n\nContacto: "+data.contacto:"") + "\n\n---\n"+ctxLine+"\n"+ctx.versao+"\n"+(ctx.disp||""));
    window.location.href="mailto:"+email+"?subject="+subj+"&body="+body;
    return true;
  }catch(e){ return false; }
}

if(typeof module!=="undefined" && module.exports){ module.exports={ openFeedback, sendFeedback, _fbContext, _fbCfg }; }
