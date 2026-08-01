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
    { data:"2026-08-01", texto:"🔥 Dérbis! Cada clube tem um rival — os jogos entre eles pesam mais na moral do balneário e na confiança da direção, com destaque na antevisão e no relato." },
    { data:"2026-08-01", texto:"💶 Contratos e salários: cada jogador tem um salário e a direção dá-te um teto de massa salarial. Ao fim do contrato os jogadores saem livres — renova a tempo! Há mercado de livres e os saldos dos clubes subiram para poderes comprar." },
    { data:"2026-07-31", texto:"📋 Relatório pós-jogo: no fim de cada jogo, vês o Homem do Jogo, os golos, expulsões e as notas dos teus jogadores." },
    { data:"2026-07-31", texto:"🗣️ Antevisão do adversário + conversa de balneário! Ao jogar, vês a antevisão (forma, onze provável, forças) e falas à equipa (antes e ao intervalo) — o tom certo dá vantagem real." },
    { data:"2026-07-30", texto:"🏅 Prémios e recordes de fim de época: Bota de Ouro, Jogador do Ano e os teus recordes de carreira (Início › Recordes & Prémios)." },
    { data:"2026-07-30", texto:"🎓 Academia de jovens! Forma os teus juniores, investe no nível da academia, empresta-os para crescerem e promove os melhores ao plantel. (Plantel › Academia)" },
    { data:"2026-07-29", texto:"⚽ Podes fazer substituições e mudar de tática durante o jogo — e agora influenciam mesmo o resultado e as estatísticas." },
    { data:"2026-07-29", texto:"Os jogos passaram a ser simulados ao vivo, minuto a minuto." },
    { data:"2026-07-29", texto:"A energia dos jogadores foi reequilibrada e dura muito mais." },
    { data:"2026-07-29", texto:"🔔 Novo painel de Novidades (este!) para acompanhares as atualizações." },
    { data:"2026-07-28", texto:"🥅 Desempates da Taça com penáltis animados e suspense." },
    { data:"2026-07-28", texto:"🧠 Reuniões com a direção, objetivos de curto prazo e moral dos jogadores." },
    { data:"2026-07-27", texto:"💱 Vê o plantel de qualquer clube e negoceia as compras (o clube pode recusar ou contrapropor)." },
    { data:"2026-07-27", texto:"💾 Gravações: exportar/importar a carreira e 3 espaços de jogo." },
    { data:"2026-07-27", texto:"🎨 Visual novo estilo transmissão de TV e novo logótipo." }
  ],

  /* ---- ALTERAR clubes já existentes (por sigla) ----
     Muda nome (n), cores (c1/c2) ou força (str, ~35-85). */
  clubs: {
    // "FER": { c1:"#c1121f", c2:"#111111" },
    // "TIB": { n:"ACDR Tibães", c1:"#111111", c2:"#ffffff" }
  },

  /* ---- PLANTEL fixo de um clube (por sigla) ----
     Substitui os jogadores gerados por estes. {n:"Nome", p:"POSIÇÃO"} */
  rosters: {
    "CAC": [
      {n:"Tiago Pinto",p:"GR"},{n:"Henrique Pizzarro",p:"GR"},{n:"Rui Xavier",p:"LD"},{n:"Luís Pereira",p:"LD"},
      {n:"Alvaro Araújo",p:"LE"},{n:"Vicente Pereira",p:"LE"},{n:"Gabriel Teixeira",p:"DC"},{n:"Gonçalo Martins",p:"DC"},
      {n:"Leonardo Vitoria",p:"DC"},{n:"Tiago Veiga",p:"MDC"},{n:"Rui Francisco",p:"MDC"},{n:"João Lopes",p:"MC"},
      {n:"Domingos Barroso",p:"MC"},{n:"Ana Lopes",p:"MC"},{n:"Susana Feio",p:"MC"},{n:"Pedro Carvalho",p:"MD"},
      {n:"Luís Ferreira",p:"ME"},{n:"Duarte Pinto",p:"ME"}, {n:"Filipa Rebelo",p:"MO"}, {n:"Pedro Gonçalves",p:"MO"},{n:"André Calçada",p:"ED"},
      {n:"Agostinho Costa",p:"EE"},{n:"Narciso Batista",p:"PL"},{n:"Sérgio Melo",p:"PL"},{n:"António Miranda",p:"PL"}
    ],
	"TIB": [ {n: "António Xavier", p:"ED"}],
	"PAD": [ {n: "André Correia", p:"ED"}]
    // Exemplo para outro clube:
    // "SFT": [ {n:"Guarda-Redes X",p:"GR"}, {n:"Avançado Y",p:"PL"} ]
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

  /* ---- RAZÕES de despedimento (juntam-se às do jogo) ---- */
  firingReasons: [
    // "A tua razão personalizada aqui."
	"O presidente descobriu que torces pelo rival.",
	"Vetaste o bolo de aniversário do reoupeiro.",
	"Apareceste bêbado no último treino.",
	"O afilhado do presidente jogou menos do que esperava."
  ]
};
