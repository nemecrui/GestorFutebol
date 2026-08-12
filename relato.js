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
        "Bola em profundidade, {jog} entra na área a todo o gás..."
      ],
      goal: [
        "...e coloca-a rasteira ao canto, imparável. GOLOOO do {clube}!",
        "...remate seco e a bola morre lá dentro! Que estrondo!",
        "...toca-lhe de raspão e engana o {gr}. Está lá dentro!",
        "...e o {gr} faz um frango de campeonato, a bola escorrega-lhe por baixo do corpo. GOLO!",
        "...a bola vai tão colada ao poste que o {gr} nem se mexeu. GOLO!",
        "...nem ele acredita — festeja a olhar para o banco de boca aberta!"
      ],
      save: [
        "...mas o {gr} cresce na baliza e adivinha tudo!",
        "...defesa monumental do {gr}, com a ponta dos dedos!",
        "...o {gr} fecha o ângulo e a bola bate-lhe no corpo.",
        "...o {gr} voa e tira-a de junto do poste! Que defesa!"
      ],
      post: [
        "...a bola bate no ferro e sai a escorrer pela linha!",
        "...trave cheia! O estádio leva as mãos à cabeça.",
        "...o poste tornou-se o melhor defesa do {adv} hoje."
      ],
      out: [
        "...mas atira ao lado, por pouco.",
        "...manda-a para as couves, ninguém sabe onde a bola caiu.",
        "...envia-a para a segunda plateia. Levou as mãos à cara.",
        "...e o remate sai tão torto que quase acerta na bandeirola de canto."
      ],
      cleared: [
        "...mas aparece {def} a cortar mesmo em cima da linha!",
        "...tapado à última fração por um corte providencial de {def}."
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
        "Toda a gente atrás da baliza a fazer barulho para desconcentrar..."
      ],
      goal: [
        "...bate com frieza ao canto, o {gr} foi para o outro lado. Golo!",
        "...meio-chapa ao meio, o {gr} atirou-se cedo. Está lá dentro!",
        "...picadinha ao meio com uma lata do tamanho do estádio. Golo!"
      ],
      save: [
        "...mas o {gr} voa e defende! Que penálti agarrado!",
        "...o {gr} adivinha o canto e trava tudo! Herói do dia!"
      ],
      miss: [
        "...e atira por cima da barra! Desperdiçou por completo.",
        "...bate no poste e sai! Não acredita no que fez.",
        "...escorrega no momento do remate e a bola vai mansa para as mãos do {gr}."
      ]
    },

    // Livre perigoso
    freekick: {
      build: [
        "Falta perigosa à entrada da área, boa posição para o livre...",
        "{jog} coloca a bola, mede a barreira, dá uns passos atrás...",
        "A barreira salta, o {gr} organiza os companheiros...",
        "{jog} pede à barreira que salte menos; a barreira ignora-o..."
      ],
      goal: [
        "...e faz uma curva perfeita por cima da barreira! Golaço!",
        "...rasteiro por baixo da barreira, o {gr} ficou pregado. Golo!"
      ],
      wall: [
        "...mas a bola bate na barreira e afasta-se.",
        "...a barreira aguenta e alivia o perigo."
      ],
      save: [
        "...boa tentativa, mas defesa segura do {gr}.",
        "...o {gr} desvia para canto com um manápula enorme."
      ],
      out: [
        "...e manda-a a rasar o poste, por centímetros!",
        "...a bola foi tão por cima que quase acertou no relógio do estádio."
      ]
    },

    // Cabeceamento / bola parada
    header: {
      build: [
        "Canto para o {clube}, sobem os centrais para a área...",
        "Cruzamento fechado, confusão na pequena área...",
        "{jog} desmarca-se ao primeiro poste, o {gr} hesita...",
        "O {gr} grita \"minha!\" e depois arrepende-se a meio do salto..."
      ],
      goal: [
        "...{jog} cabeceia para o fundo das redes! Golo de bola parada!",
        "...o {gr} sai da baliza e fica a apanhar bonés — {jog} cabeceia para o golo!",
        "...desvio ao primeiro poste e a bola entra! Golo!"
      ],
      save: [
        "...mas o {gr} sai bem e agarra no ar.",
        "...o {gr} soca para longe e desfaz o perigo."
      ],
      out: [
        "...cabeceamento ao lado, escapou a boa ocasião.",
        "...cabeça em cima da bola e a bola vai por cima. Que desperdício."
      ]
    },

    // Isolado / cara a cara
    solo: {
      build: [
        "Passe a rasgar a defesa — {jog} fica isolado!",
        "{jog} ganha as costas ao último defesa e parte sozinho para a baliza...",
        "Só o {gr} pela frente, o estádio prende a respiração...",
        "{jog} tem tanto tempo que quase pede indicações ao banco..."
      ],
      goal: [
        "...atira à figura do {gr} e ainda encosta no ressalto! Golo!",
        "...espera, espera e coloca ao canto. Que sangue-frio! Golo!"
      ],
      save: [
        "...mas o {gr} sai dos postes e fecha-lhe o ângulo. Defesa enorme!",
        "...pensou tanto que o {gr} teve tempo de lhe roubar a bola dos pés."
      ],
      out: [
        "...e, sozinho, atira ao lado! Impossível de explicar.",
        "...tenta o chapéu e manda a bola para as couves. Que falhanço!"
      ]
    },

    // Contra-ataque relâmpago
    counter: {
      build: [
        "Rouba o {clube} e sai a correr — contra-ataque letal!",
        "Três contra dois, o {clube} voa para a baliza adversária...",
        "{jog} conduz a bola meio-campo fora, a defesa a recuar em pânico..."
      ],
      goal: [
        "...{jog} serve {jog2} que só tem de encostar. Golo em velocidade!",
        "...tabela perfeita e {jog} finaliza! Contra-ataque de manual!"
      ],
      save: [
        "...mas o {gr} sai a tempo e trava o contra-ataque!",
        "...a defesa do {adv} recupera à última e corta o lance."
      ],
      out: [
        "...e, com tudo a favor, {jog} atira para fora! Que desperdício.",
        "...precipita-se e manda a bola para as couves. Contra-ataque estragado."
      ]
    },

    // Cartão vermelho / falta violenta
    red: {
      build: [
        "Entrada dura de {jog}, o árbitro corre para o lance...",
        "{jog2} foi ceifado a meio do campo, ficou toda a gente a olhar...",
        "{jog} arranca o adversário pela raíz — muita confusão no relvado...",
        "{jog} já pede desculpa antes de o árbitro decidir o que fazer..."
      ],
      direct: [
        "...cartão vermelho! {jog} deixa o {clube} com dez!",
        "...expulso! Entrada demasiado dura, não há discussão."
      ],
      second: [
        "...segundo amarelo e rua! {jog} vai para o balneário mais cedo."
      ],
      yellowonly: [
        "...fica-se pelo amarelo. {jog} respira de alívio.",
        "...só admoestação verbal, o árbitro perdoa desta vez."
      ]
    },

    // Lesão
    injury: {
      build: [
        "{jog} fica caído no relvado, a equipa médica entra...",
        "{jog} pede substituição e o {trein} finge que não vê..."
      ],
      light: [
        "...recupera e continua, foi apenas um susto.",
        "...levanta-se, sacode a poeira e volta ao jogo."
      ],
      grave: [
        "...sai de maca, não tem condições para continuar. Má notícia para o {clube}.",
        "...pela cara de dor, isto vai deixá-lo de fora uns bons tempos."
      ]
    },

    // Autogolo (quase sempre caricato)
    own: {
      build: [
        "{def} tenta o alívio tranquilo para trás...",
        "Cruzamento perigoso, {def} tenta cortar de qualquer maneira..."
      ],
      goal: [
        "...e faz o autogolo mais bonito da jornada! O banco não quer acreditar.",
        "...corta para a própria baliza, o {gr} nem teve tempo de protestar."
      ]
    },

    // Drama do último minuto (90+x)
    latedrama: {
      build: [
        "Última jogada do jogo, tudo ou nada para o {clube}...",
        "O quarto árbitro levanta a placa e há mais uma bola na área...",
        "O {trein} já não olha para o campo, olha só para o relógio..."
      ],
      goal: [
        "...{jog} aparece do nada e marca no último suspiro! Loucura total!",
        "...golo em cima do apito! O {clube} arranca o resultado do fundo do baú!"
      ],
      miss: [
        "...{jog} atira por cima na última bola do jogo. Ficou pela vontade.",
        "...o {gr} agarra em cima da hora e segura o resultado. Fim!"
      ]
    }
  },

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
    ["Uma rajada de vento leva o boné do {trein} para o meio do campo."]
  ]
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

if(typeof module!=="undefined" && module.exports){
  module.exports = { RELATO, relatoSeq, relatoFolclore, relatoAmbient, _relFill };
}
