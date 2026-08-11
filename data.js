"use strict";
/* ============================================================
   GESTOR DE FUTEBOL — data.js  (CONFIGURAÇÃO — edita à vontade)
   Carregado ANTES do engine.js. Aqui acrescentas/alteras clubes,
   plantéis (jogadores fixos) e razões de despedimento, SEM mexer
   no motor. Depois de editar, recomeça a carreira para carregar.

   Posições válidas: GR, LD, DC, LE, MDC, MC, MD, ME, MO, ED, EE, PL
     GR=guarda-redes · LD/LE=laterais · DC=defesa central
     MDC=médio defensivo · MC=médio centro · MD/ME=médios ala
     MO=médio ofensivo · ED/EE=extremos · PL=ponta de lança
   Divisões: 0=Pró-Nacional · 1=Divisão de Honra · 2=1ª Divisão · 3=2ª Divisão
   ============================================================ */
const GAME_DATA = {

  /* ---- ESTATÍSTICAS DE UTILIZAÇÃO (opcional) ----
     Para saberes quantas pessoas jogaram e quantas temporadas começam.
     1) Cria uma conta gratuita em https://www.goatcounter.com (escolhe um "código", ex: "gestorfutebol")
     2) Cola aqui esse código. Deixa "" para desligar (não conta nada).
     Vês tudo no painel: CODIGO.goatcounter.com  (visitas + eventos "nova-carreira" e "nova-epoca"). */
  goatcounter: "nemecrui",

  /* ---- NOVIDADES (aparecem no painel 🔔 do jogo) ----
     Acrescenta uma linha no topo sempre que atualizares. A mais recente fica em cima.
     Formato: { data:"AAAA-MM-DD", texto:"O que mudou" } */
  novidades: [
    { data:"2026-08-11", texto:"🔁 Janelas de transferências a sério: só contratas de outros clubes no início da época (até fim de setembro) e em janeiro. Fora das janelas só assinas jogadores sem clube. As propostas chegam aos poucos, não todas de uma vez." },
    { data:"2026-08-11", texto:"🤝 Empréstimos: podes disponibilizar um jogador (ou jovem) só para empréstimo ou para venda + empréstimo. O emprestado não paga transferência e regressa no fim da época; o salário pode ser pago 100% pelo clube que recebe ou dividido 50/50." },
    { data:"2026-08-11", texto:"📈 Evolução por minutos: quem joga evolui mais (mesmo com poucos minutos). Jovens evoluem mais depressa; ao banco cresce-se pouco. 🤕 Passam a existir lesões esporádicas nos treinos, mesmo com energia alta." },
    { data:"2026-08-02", texto:"🏟️ GRANDE ATUALIZAÇÃO — competições reformuladas! Agora com os clubes reais da AF Braga: Pró-Nacional (18), Divisão de Honra em 2 séries, 1ª Divisão em 6 séries e 2ª Divisão. Jogas na tua série e sobes/desces entre elas. Nova carreira obrigatória (a estrutura mudou)." },
    { data:"2026-08-02", texto:"🏆 Finalíssima da Divisão de Honra (vencedor da Série A vs Série B pelo título) e Supertaça (campeão do Pró-Nacional vs vencedor da Taça) — jogáveis quando estás envolvido." },
    { data:"2026-08-02", texto:"📲 Novo símbolo da app (prancheta tática) e instalação como aplicação a sério no telemóvel (Adicionar ao ecrã inicial), com ícone próprio." },
    { data:"2026-08-01", texto:"🟥 Suspensões e lesões: 5 amarelos = 1 jogo de castigo, vermelho direto = 2 jogos (2º amarelo = 1). As lesões passam a ter gravidade variável (de ligeira a muito grave). Vês os castigos e o aviso de amarelos no plantel e na ficha do jogador." },
  ],

  /* ---- ALTERAR clubes já existentes (por sigla) ----
     Muda nome (n), cores (c1/c2) ou força (str, ~35-85). */
  clubs: {
    // "FER": { c1:"#c1121f", c2:"#111111" },
    // "TIB": { n:"ACDR Tibães", c1:"#111111", c2:"#ffffff" }
  },

  /* ---- PLANTÉIS REAIS de um clube (por NOME EXATO do clube) ----
     Só para clubes que autorizem nomes reais. A chave é o nome do clube tal como aparece no jogo.
     Cada jogador: { n:"Nome", p:"POSIÇÃO", ...opcionais }
       Obrigatórios:  n = nome · p = posição
       Opcionais:     idade (15-42) · altura (em cm) · nivel (1-20, força geral do jogador)
                      attrs = { código:1-20, ... }  → força atributos específicos
     POSIÇÕES: GR · LD · DC · LE · MDC · MC · MD · ME · MO · ED · EE · PL
     ATRIBUTOS (códigos): rem=Remate cab=Cabeceamento cru=Cruzamento pas=Passe dri=Drible
       des=Desarme mar=Marcação pos=Posicionamento vel=Velocidade res=Resistência for=Força
       rea=Reação cri=Criatividade agr=Agressividade pen=Penáltis liv=Livres gr=Guarda-redes
     Notas: não precisas de listar 27 jogadores — o resto é preenchido automaticamente (com pelo
       menos 3 GR). Se não indicares idade/altura/attrs, são gerados ao nível do clube.
     Recomeça a carreira depois de editar. */
  rosters: {
    "Cachapuz WLS": [
      {n:"Tiago Pinto", p:"GR"},
      {n:"Henrique Pizzarro", p:"GR"},
      {n:"Rui Xavier", p:"LD"},
      {n:"Luís Pereira", p:"LD"},
      {n:"Alvaro Araújo", p:"LE"},
      {n:"Vicente Pereira", p:"LE"},
      {n:"Gabriel Teixeira", p:"DC"},
      {n:"Gonçalo Martins", p:"DC"},
      {n:"Leonardo Vitoria", p:"DC"},
      {n:"Tiago Veiga", p:"MDC"},
      {n:"Rui Francisco", p:"MDC"},
      {n:"João Lopes", p:"MC"},
      {n:"Domingos Barroso", p:"MC"},
      {n:"Ana Lopes", p:"MC"},
      {n:"Susana Feio", p:"MC"},
      {n:"Pedro Carvalho", p:"MD"},
      {n:"Luís Ferreira", p:"ME"},
      {n:"Duarte Pinto", p:"ME"},
      {n:"Filipa Rebelo", p:"MO"},
      {n:"Pedro Gonçalves", p:"MO"},
      {n:"André Calçada", p:"ED"},
      {n:"Agostinho Costa", p:"EE"},
      {n:"Narciso Batista", p:"PL"},
      {n:"Sérgio Melo", p:"PL"},
      {n:"António Miranda", p:"PL"}
    ],
    "CD Maximinense": [
      {n:"Marcos Ferreira", p:"GR", idade:39, altura:180, nivel:20, attrs:{pas:20, des:20, pos:20, vel:20, res:20, for:20, rea:20, gr:20}}
    ],
    "SuperBraga": [
      {n:"Victor Fernandes", p:"GR"},
      {n:"Zé Gusman", p:"GR", altura:189},
      {n:"Hugo Pinto", p:"DC"},
      {n:"Nuno Pinto", p:"DC"},
      {n:"Pirata", p:"LD", altura:169},
      {n:"Artur Monteiro", p:"LE"},
      {n:"Nuno Santos", p:"LE"},
      {n:"Joni", p:"MC"},
      {n:"Jorge Sousa", p:"MDC"},
      {n:"Jota Castro", p:"DC"},
      {n:"Luís Mico", p:"GR"},
      {n:"Rui Xavier", p:"LD", altura:160, attrs:{des:18, pos:15, vel:20}},
      {n:"David Rodrigues", p:"MD"},
      {n:"Miguel Rodrigues", p:"MO"},
      {n:"Ricardo Machado", p:"PL", attrs:{rem:19}},
      {n:"Bruno Brandão", p:"MC", attrs:{rem:17, cru:17, pas:19, dri:18, pos:18}},
      {n:"Miguel Gonçalves", p:"MC"},
      {n:"João Vaz", p:"MO"},
      {n:"Berto Pinhão", p:"MDC"},
      {n:"Cláudio Correia", p:"MD", altura:163},
      {n:"Nuno Alpoim", p:"MC"},
      {n:"Igor", p:"PL"},
      {n:"Bruno Caravana", p:"ME"},
      {n:"Carlos Vaz", p:"MC"},
      {n:"Rodrigo", p:"EE"},
      {n:"Paulo Paraíso", p:"ME"},
      {n:"Lininho 1", p:"PL", attrs:{rem:20, cab:20, cru:20, pas:20, dri:20}}
    ]
  },

  /* ---- ADICIONAR clubes novos a uma divisão ----
     Acrescenta ao fim da lista dessa divisão. Mantém, de preferência,
     um número PAR de equipas por divisão. Podes incluir um "roster". */
  addClubs: {
    // 3: [ {n:"Novo Clube FC", s:"NVC", str:44, c1:"#1d4ed8", c2:"#ffffff"} ]
  },

  /* ---- SUBSTITUIR toda uma divisão ----
     Se preencheres, substitui por completo os clubes dessa divisão. */
  divisions: {
    // 3: [ {n:"Clube A", s:"CLA", str:45, c1:"#c1121f", c2:"#ffffff"} ]
  },

  /* ---- RIVALIDADES / DÉRBIS (opcional) ----
     Define rivais por sigla; os jogos entre eles são "dérbis" (pesam mais na moral e na direção).
     Basta indicar um lado (fica automaticamente recíproco). O que não indicares é emparelhado automaticamente. */
  rivalidades: {
    // "TIB":"PAD",
    // "CAC":"FER"
  },

  /* ---- EVENTOS DE HISTÓRIA (juntam-se aos do jogo) ----
     Cartões com escolhas que aparecem durante a época. Tom livre (sérios ou bizarros).
       tone: "serio" | "bizarro"
       cond: "any" | "win" | "loss" | "draw" | "bigwin" | "bigloss" | "derby"   (quando aparece)
       young: true  → o {jogador} escolhido é um jovem do plantel
       text/result: podes usar {clube} {jogador} {rival} {treinador} {epoca}
       fx (efeitos da escolha): morale (moral), board (confiança direção), budget (€M), rep (reputação), chem (química)
     Exemplo:
       { tone:"bizarro", cond:"win", icon:"telemovel", title:"Desafio de dança viral",
         text:"O balneário do {clube} inventou uma dança de vitória.",
         choices:[ {label:"Gravar e publicar", result:"Virou febre nas redes!", fx:{rep:2, morale:3}},
                   {label:"Manter o foco",     result:"Trabalho primeiro.",     fx:{board:2}} ] } */
  eventos: [
  ],

  /* ---- RAZÕES de despedimento (juntam-se às do jogo) ---- */
  firingReasons: [
    // "A tua razão personalizada aqui."
	"O presidente descobriu que torces pelo rival.",
	"Vetaste o bolo de aniversário do reoupeiro.",
	"Apareceste bêbado no último treino.",
	"O afilhado do presidente jogou menos do que esperava."
  ]
};
