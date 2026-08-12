"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — relato.js
   Catálogo de relato ao vivo com PAUSA nos momentos-chave.
   Cada momento tem uma "construção" (frases neutras que NÃO
   entregam o desfecho) e vários desfechos ramificados (só o
   último é revelado). Ver RELATO_CATALOGO.md para a versão
   humana/editável.

   Placeholders: {jog} jogador do lance · {jog2} outro jogador ·
     {gr} guarda-redes adversário · {def} defesa · {clube} equipa
     em ataque · {adv} equipa adversária · {trein} treinador.
   Carregado ANTES do ui.js (depois do engine.js).
   ============================================================ */

const RELATO = {

  /* ---- MOMENTOS-CHAVE (com pausa): build + desfechos ---- */
  seq: {

    // Remate / ocasião de ataque genérica
    chance: {
      build: [
        "{jog} ganha a bola no meio-campo e acelera...",
        "{clube} troca a bola com paciência à procura de uma brecha...",
        "{jog} levanta a cabeça e vê espaço nas costas da defesa...",
        "Cruzamento tenso para a área, toda a gente salta...",
        "{jog} corta para dentro e arma o pé...",
        "Combinação rápida à entrada da área, a defesa recua...",
        "{jog2} serve {jog} de primeira, que se prepara para rematar...",
        "A jogada cresce pela direita, o estádio começa a levantar-se...",
        "{jog} recebe de costas, gira sobre o defesa e encara a baliza...",
        "Bola em profundidade, {jog} entra na área a todo o gás...",
        "{jog} finta um, finta dois e procura ângulo para o remate...",
        "Passe atrasado para a entrada da área, {jog} chega a rematar de primeira..."
      ],
      goal: [
        "...e coloca-a rasteira ao canto, imparável. GOLOOO do {clube}!",
        "...remate seco e a bola morre lá dentro! Que estrondo!",
        "...toca-lhe de raspão e engana o {gr}. Está lá dentro!",
        "...e o {gr} faz um frango de campeonato, a bola escorrega-lhe por baixo do corpo. GOLO!",
        "...a bola vai tão colada ao poste que o {gr} nem se mexeu. GOLO!",
        "...fuzila o {gr} de pé esquerdo! Golaço do {clube}!",
        "...desvia ao segundo poste e a bola beija a rede. Golo!",
        "...nem ele acredita — festeja a olhar para o banco de boca aberta!"
      ],
      save: [
        "...mas o {gr} cresce na baliza e adivinha tudo!",
        "...defesa monumental do {gr}, com a ponta dos dedos!",
        "...o {gr} fecha o ângulo e a bola bate-lhe no corpo.",
        "...o {gr} voa e tira-a de junto do poste! Que defesa!",
        "...grande mão do {gr} a mandar para canto!"
      ],
      post: [
        "...a bola bate no ferro e sai a escorrer pela linha!",
        "...trave cheia! O estádio leva as mãos à cabeça.",
        "...na trave, com o {gr} já batido!",
        "...o poste tornou-se o melhor defesa do {adv} hoje."
      ],
      out: [
        "...mas atira ao lado, por pouco.",
        "...manda-a para as couves, ninguém sabe onde a bola caiu.",
        "...envia-a para a segunda plateia. Levou as mãos à cara.",
        "...ao lado do poste, a bola morre no fundo da baliza pelo lado de fora.",
        "...e o remate sai tão torto que quase acerta na bandeirola de canto."
      ],
      cleared: [
        "...mas aparece {def} a cortar mesmo em cima da linha!",
        "...tapado à última fração por um corte providencial de {def}.",
        "...{def} atira-se de carrinho e manda para canto!"
      ],
      disallowed: [
        "...a bola entra... mas o árbitro assinala fora de jogo! Anulado.",
        "...festejam nas bancadas... mas havia falta no início do lance. Nada feito."
      ]
    },

    // Grande penalidade
    penalty: {
      build: [
        "Penálti! O {clube} tem aqui uma oportunidade de ouro...",
        "{jog} coloca a bola na marca e respira fundo...",
        "Silêncio no estádio: {jog} contra {gr}, frente a frente...",
        "O {gr} salta em cima da linha a tentar intimidar...",
        "{jog} olha para a marca, olha para o {gr}, olha para o céu...",
        "Toda a gente atrás da baliza a fazer barulho para desconcentrar...",
        "O árbitro aponta para a marca de grande penalidade — protestos do {adv}...",
        "{jog} limpa a marca com o pé, coloca a bola, afasta-se uns passos...",
        "O {gr} tenta ganhar tempo e conversa com o árbitro...",
        "Tensão máxima: a época do {clube} pode passar por aqui..."
      ],
      goal: [
        "...bate com frieza ao canto, o {gr} foi para o outro lado. Golo!",
        "...meio-chapa ao meio, o {gr} atirou-se cedo. Está lá dentro!",
        "...encosta a bola ao poste, o {gr} nem se mexeu. Golo!",
        "...pé cheio ao ângulo, indefensável. Está lá dentro!",
        "...picadinha ao meio com uma lata do tamanho do estádio. Golo!"
      ],
      save: [
        "...mas o {gr} voa e defende! Que penálti agarrado!",
        "...o {gr} adivinha o canto e trava tudo com os pés! Herói do dia!",
        "...o {gr} mergulha e segura a bola contra o peito! Defendeu!"
      ],
      miss: [
        "...e atira por cima da barra! Desperdiçou por completo.",
        "...bate no poste e sai! Não acredita no que fez.",
        "...manda a bola para as couves! Falhou um penálti incrível.",
        "...escorrega no momento do remate e a bola vai mansa para as mãos do {gr}."
      ]
    },

    // Livre perigoso
    freekick: {
      build: [
        "Falta perigosa à entrada da área, boa posição para o livre...",
        "{jog} coloca a bola, mede a barreira, dá uns passos atrás...",
        "A barreira salta, o {gr} organiza os companheiros...",
        "{jog} pede à barreira que salte menos; a barreira ignora-o...",
        "Livre em zona frontal, a uns 20 metros. Perigo para o {adv}...",
        "{jog} e {jog2} discutem quem vai bater o livre...",
        "O árbitro conta os passos da barreira, o estádio em silêncio...",
        "A barreira do {adv} nervosa, salta antes de tempo..."
      ],
      goal: [
        "...e faz uma curva perfeita por cima da barreira! Golaço!",
        "...rasteiro por baixo da barreira, o {gr} ficou pregado. Golo!",
        "...contorna a barreira e enfia-a no ângulo! Que livre!"
      ],
      wall: [
        "...mas a bola bate na barreira e afasta-se.",
        "...a barreira aguenta e alivia o perigo.",
        "...a barreira do {adv} come a bola com o peito e alivia."
      ],
      save: [
        "...boa tentativa, mas defesa segura do {gr}.",
        "...o {gr} desvia para canto com um manápula enorme."
      ],
      out: [
        "...e manda-a a rasar o poste, por centímetros!",
        "...manda-a para as couves, por cima de tudo e de todos.",
        "...a bola foi tão por cima que quase acertou no relógio do estádio."
      ]
    },

    // Cabeceamento / bola parada
    header: {
      build: [
        "Canto para o {clube}, sobem os centrais para a área...",
        "Cruzamento fechado, confusão na pequena área...",
        "{jog} desmarca-se ao primeiro poste, o {gr} hesita...",
        "O {gr} grita \"minha!\" e depois arrepende-se a meio do salto...",
        "Livre lateral para a área, sobem os gigantes do {clube}...",
        "Cruzamento tenso ao segundo poste, {jog} ataca a bola...",
        "Pontapé de canto ensaiado do {clube}, a defesa desorganiza-se...",
        "A bola sobra na área após o canto, confusão total..."
      ],
      goal: [
        "...{jog} cabeceia para o fundo das redes! Golo de bola parada!",
        "...o {gr} sai da baliza e fica a apanhar bonés — {jog} cabeceia para o golo!",
        "...cabeceamento picado, a bola bate no chão e sobe para dentro! Golo!",
        "...desvio ao primeiro poste e a bola entra! Golo!"
      ],
      save: [
        "...mas o {gr} sai bem e agarra no ar.",
        "...o {gr} soca para longe e desfaz o perigo.",
        "...o {gr} sai dos postes e faz a recolha segura."
      ],
      out: [
        "...cabeceamento ao lado, escapou a boa ocasião.",
        "...cabeceia por cima com o golo à sua mercê. Que falhanço!",
        "...cabeça em cima da bola e a bola vai por cima. Que desperdício."
      ]
    },

    // Isolado / cara a cara
    solo: {
      build: [
        "Passe a rasgar a defesa — {jog} fica isolado!",
        "{jog} ganha as costas ao último defesa e parte sozinho para a baliza...",
        "Só o {gr} pela frente, o estádio prende a respiração...",
        "{jog} tem tanto tempo que quase pede indicações ao banco...",
        "Falha a linha defensiva do {adv} e {jog} fica em posição de golo!",
        "Bola nas costas dos centrais, {jog} corre atrás dela com o {gr} a sair...",
        "{jog} dribla o último homem e fica de baliza aberta...",
        "Duelo individual: {jog} contra o {gr}, mano a mano..."
      ],
      goal: [
        "...atira à figura do {gr} e ainda encosta no ressalto! Golo!",
        "...espera, espera e coloca ao canto. Que sangue-frio! Golo!",
        "...finta o {gr} e encosta para a baliza deserta. Golo!"
      ],
      save: [
        "...mas o {gr} sai dos postes e fecha-lhe o ângulo. Defesa enorme!",
        "...o {gr} faz-se enorme e fecha-lhe a baliza toda!",
        "...pensou tanto que o {gr} teve tempo de lhe roubar a bola dos pés."
      ],
      out: [
        "...e, sozinho, atira ao lado! Impossível de explicar.",
        "...com a baliza à sua frente, atira para as couves! Inacreditável.",
        "...tenta o chapéu e manda a bola muito por cima. Que falhanço!"
      ]
    },

    // Contra-ataque relâmpago
    counter: {
      build: [
        "Rouba o {clube} e sai a correr — contra-ataque letal!",
        "Três contra dois, o {clube} voa para a baliza adversária...",
        "{jog} conduz a bola meio-campo fora, a defesa a recuar em pânico...",
        "Perde o {adv} a bola no ataque e o {clube} lança o contra-ataque!",
        "Espaços enormes, o {clube} corre para a baliza com tudo a favor...",
        "{jog} conduz em velocidade, dois companheiros a acompanhar...",
        "Transição rápida, a defesa do {adv} completamente aberta...",
        "Dois passes e o {clube} está à entrada da área contrária..."
      ],
      goal: [
        "...{jog} serve {jog2} que só tem de encostar. Golo em velocidade!",
        "...tabela perfeita e {jog} finaliza! Contra-ataque de manual!",
        "...define com classe e coloca ao canto. Contra-ataque letal!"
      ],
      save: [
        "...mas o {gr} sai a tempo e trava o contra-ataque!",
        "...a defesa do {adv} recupera à última e corta o lance.",
        "...o {gr} sai como um foguetão e desarma na hora certa!"
      ],
      out: [
        "...e, com tudo a favor, {jog} atira para fora! Que desperdício.",
        "...precipita-se no último passe e deita tudo a perder.",
        "...precipita-se e manda a bola para as couves. Contra-ataque estragado."
      ]
    },

    // Cartão vermelho / falta violenta
    red: {
      build: [
        "Entrada dura de {jog}, o árbitro corre para o lance...",
        "{jog2} foi ceifado a meio do campo, ficou toda a gente a olhar...",
        "{jog} arranca o adversário pela raíz — muita confusão no relvado...",
        "{jog} já pede desculpa antes de o árbitro decidir o que fazer...",
        "Carrinho por trás de {jog} — o estádio levanta-se a protestar...",
        "Cotovelada na disputa de bola, o árbitro viu tudo...",
        "{jog} trava o contra-ataque com falta tática, era a última linha...",
        "O árbitro chama {jog} e leva a mão ao bolso muito devagar..."
      ],
      direct: [
        "...cartão vermelho! {jog} deixa o {clube} com dez!",
        "...expulso! Entrada demasiado dura, não há discussão.",
        "...vermelho direto! Não havia outra decisão. {clube} reduzido a dez."
      ],
      second: [
        "...segundo amarelo e rua! {jog} vai para o balneário mais cedo.",
        "...amarelo que é o segundo — está expulso! O {clube} fica com menos um."
      ],
      yellowonly: [
        "...fica-se pelo amarelo. {jog} respira de alívio.",
        "...só admoestação verbal, o árbitro perdoa desta vez.",
        "...mostra só o amarelo. Ficou muito perto do vermelho."
      ]
    },

    // Lesão
    injury: {
      build: [
        "{jog} fica caído no relvado, a equipa médica entra...",
        "{jog} pede substituição e o {trein} finge que não vê...",
        "{jog} sente qualquer coisa e pede assistência a coxear...",
        "Choque de cabeças na área, {jog} fica no chão...",
        "O jogo pára, {jog} pede a maca a fazer sinal para o banco..."
      ],
      light: [
        "...recupera e continua, foi apenas um susto.",
        "...levanta-se, sacode a poeira e volta ao jogo.",
        "...faz uns alongamentos e segue em frente. Falso alarme."
      ],
      grave: [
        "...sai de maca, não tem condições para continuar. Má notícia para o {clube}.",
        "...abana a cabeça para o banco: não dá para continuar.",
        "...pela cara de dor, isto vai deixá-lo de fora uns bons tempos."
      ]
    },

    // Autogolo (quase sempre caricato)
    own: {
      build: [
        "{def} tenta o alívio tranquilo para trás...",
        "Cruzamento perigoso, {def} tenta cortar de qualquer maneira...",
        "Cruzamento venenoso rasteiro, {def} tenta cortar em cima da linha...",
        "Recuo de cabeça de {def} para o guarda-redes, sem olhar..."
      ],
      goal: [
        "...e faz o autogolo mais bonito da jornada! O banco não quer acreditar.",
        "...corta para a própria baliza, o {gr} nem teve tempo de protestar.",
        "...o alívio sai torto e engana o próprio guarda-redes. Autogolo!"
      ]
    },

    // Drama do último minuto (90+x)
    latedrama: {
      build: [
        "Última jogada do jogo, tudo ou nada para o {clube}...",
        "O quarto árbitro levanta a placa e há mais uma bola na área...",
        "O {trein} já não olha para o campo, olha só para o relógio...",
        "Últimos segundos, sobe até o guarda-redes do {clube} para a área...",
        "É agora ou nunca, canto para o {clube} no descontar do tempo...",
        "O relógio a correr, o {adv} só quer que o árbitro apite..."
      ],
      goal: [
        "...{jog} aparece do nada e marca no último suspiro! Loucura total!",
        "...golo em cima do apito! O {clube} arranca o resultado do fundo do baú!",
        "...e o {clube} marca já para lá do minuto 90! Delírio absoluto!"
      ],
      miss: [
        "...{jog} atira por cima na última bola do jogo. Ficou pela vontade.",
        "...o {gr} agarra em cima da hora e segura o resultado. Fim!",
        "...a última bola do jogo sai ao lado. Fim: ficou o que ficou."
      ]
    }
  },

  /* ---- Reação caricata do CAPITÃO ao ser substituído (sem efeito na moral) ---- */
  captainSub: [
    "O capitão sai a resmungar e atira o colete para o banco.",
    "O capitão nem olha para o treinador ao sair — senta-se de braços cruzados.",
    "O capitão sai visivelmente aziado e dá um pontapé numa garrafa de água.",
    "O capitão abana a cabeça a caminho do banco. Não gostou nada de sair.",
    "O capitão tira a braçadeira devagar e entrega-a sem uma palavra.",
    "O capitão aponta para o próprio peito a protestar antes de se sentar."
  ],

  /* ---- AMBIENTE (frases de contexto, sem pausa) ---- */
  ambient: {
    press: ["{clube} carrega para a frente", "grande pressão do {clube}", "{clube} instala-se no meio-campo adversário", "{clube} manda no jogo"],
    balance: ["jogo equilibrado", "muita luta pela bola", "as equipas estudam-se", "ritmo mais partido agora"],
    defensive: ["O {adv} estacionou o autocarro em frente à baliza — muralha total.", "O {adv} meteu toda a gente atrás da linha da bola.", "Nem com uma escada o {clube} passa este autocarro."]
  },

  /* ---- SITUAÇÕES INSÓLITAS (folclore — não mexem no resultado) ---- */
  folclore: [
    ["O jogo pára: um cão entra a correr no relvado e ninguém o apanha.", "Lá vai o cão a driblar meio plantel antes de sair."],
    ["Uma gaivota pousa no meio-campo, muito confiante, e o árbitro espera."],
    ["Uma galinha atravessa a área — o {gr} não sabe se defende ela ou a bola."],
    ["Um gato passeia junto à linha lateral como se pagasse bilhete."],
    ["Um pato instala-se numa poça e recusa-se a sair do relvado."],
    ["Uma cabra fugida do monte decide inspecionar a baliza. Jogo interrompido."],
    ["Um pombo pousa no travessão e assiste ao jogo do melhor lugar do estádio."],
    ["{jog} dá um chuto na atmosfera e falha a bola por completo. Fica a olhar para o pé."],
    ["A bola fura no meio do lance e desincha ali mesmo. Vai buscar-se outra."],
    ["{jog} escorrega e senta-se na relva; levanta-se a fingir que não foi nada."],
    ["{jog} perde uma chuteira e continua a jogar de meia num pé só."],
    ["{jog} faz um passe magnífico... para o árbitro."],
    ["O árbitro avisa {jog} de que tem a camisola do avesso. Toca a corrigir."],
    ["O árbitro deixa cair todos os cartões ao tirar um do bolso."],
    ["O apito não funciona e o árbitro sopra três vezes até sair som."],
    ["Os aspersores ligam-se sozinhos a meio do jogo. Banho geral."],
    ["A bandeirola de canto cai e ninguém sabe de quem é a culpa."],
    ["O altifalante toca o hino de golo... da equipa errada."],
    ["Nevoeiro cerrado desce sobre o estádio; mal se vê a outra baliza."],
    ["Uma rajada de vento leva o boné do {trein} para o meio do campo."],
    ["Um adepto atira um cachecol para o relvado e {jog} devolve-o com um sorriso."],
    ["A bola vai para a bancada e o adepto recusa-se a devolvê-la. Negociação em curso."],
    ["Rebenta um petardo de alegria nas bancadas — susto geral, jogo parado."],
    ["{jog} amarra os atacadores com tanta calma que o árbitro já espera por ele."]
  ],

  /* ---- INSÓLITAS LIGADAS AO LANCE (mexem no resultado) ---- */
  /* goal = sequências que TERMINAM em golo · miss = ocasião perdida pelo insólito */
  folcloreLance: {
    goal: [
      { build:["Canto batido para a área do {adv}...","O {gr} distrai-se com uma gaivota pousada no travessão..."],
        reveal:"...e {jog} aproveita a distração para marcar! Golo dos mais insólitos!" },
      { build:["Sai o canto e levanta-se uma rajada de vento forte...","A bola ganha um efeito impossível a caminho da baliza..."],
        reveal:"...e entra directa, sem ninguém lhe tocar! Golo olímpico à conta do vento!" },
      { build:["{def} recebe tranquilo para atrasar ao seu guarda-redes...","...mas o relvado está encharcado e a bola trava..."],
        reveal:"...escorrega e serve {jog} para o golo mais fácil da carreira!" },
      { build:["Bola dividida à entrada da área, toda a gente a saltar...","...a bola bate num pé, bate noutro, ressalta três vezes..."],
        reveal:"...e enfia-se na baliza pelo meio da confusão! Golo pastelão, mas conta na mesma!" }
    ],
    miss: [
      { build:["{jog} ganha as costas à defesa e fica isolado...","...mas um cão entra a correr no relvado!"],
        reveal:"...o árbitro pára tudo e a enorme ocasião do {clube} evapora-se na confusão." },
      { build:["{jog} arma o remate em plena área do {adv}..."],
        reveal:"...e a bola FURA mesmo no momento do disparo! O lance morre ali, desinchado." },
      { build:["Contra-ataque perigoso do {clube}, {jog} conduz para a baliza...","...quando os aspersores disparam de repente!"],
        reveal:"...a bola pára morta numa poça e a defesa alivia. Contra-ataque estragado pela rega." },
      { build:["{jog} prepara-se para rematar à baliza aberta...","...e uma galinha atravessa-lhe a frente!"],
        reveal:"...distrai-se, atira para as couves e fica a olhar para a galinha. Que desperdício." }
    ]
  }
};

/* ---- utilitários de escolha/preenchimento ---- */
function _relFill(s, ctx){ return String(s).replace(/\{(\w+)\}/g, (m,k)=> (ctx && ctx[k]!=null) ? ctx[k] : m); }
function _relPick(a){ return a[Math.floor(Math.random()*a.length)]; }
function _relPickN(a, n){ const c=a.slice(); const o=[]; n=Math.min(n, c.length);
  for(let i=0;i<n;i++){ const j=Math.floor(Math.random()*c.length); o.push(c.splice(j,1)[0]); } return o; }

/* Constrói uma sequência: 2-3 frases de construção + 1 desfecho (revelado no fim).
   kind: chave de RELATO.seq · branch: desfecho (goal/save/out/...) · ctx: substituições. */
function relatoSeq(kind, branch, ctx, opts){
  opts=opts||{};
  const K=RELATO.seq[kind]; if(!K)return null;
  const nBuild = opts.nBuild || (2 + Math.floor(Math.random()*2));      // 2 ou 3
  const build = _relPickN(K.build||[], nBuild).map(s=>_relFill(s,ctx));
  const rpool = K[branch] || [];
  const reveal = rpool.length ? _relFill(_relPick(rpool), ctx) : null;
  return { build, reveal };
}
function relatoFolclore(ctx){ const f=_relPick(RELATO.folclore)||[]; return f.map(s=>_relFill(s,ctx)); }
function relatoAmbient(key, ctx){ const p=(RELATO.ambient||{})[key]; return p? _relFill(_relPick(p),ctx) : ""; }
function relatoCaptainSub(){ const p=RELATO.captainSub||[]; return p.length?_relPick(p):""; }
/* Insólita ligada ao lance: branch "goal" (termina em golo) ou "miss" (ocasião perdida). */
function relatoLance(branch, ctx){
  const pool=((RELATO.folcloreLance||{})[branch])||[]; if(!pool.length)return null;
  const o=_relPick(pool);
  return { build:(o.build||[]).map(s=>_relFill(s,ctx)), reveal:o.reveal?_relFill(o.reveal,ctx):null };
}

if(typeof module!=="undefined" && module.exports){
  module.exports = { RELATO, relatoSeq, relatoFolclore, relatoAmbient, relatoLance, relatoCaptainSub, _relFill };
}
