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
      {n:"Tiago Pinto",p:"GR"},{n:"Henrique Pizzarro",p:"GR"},{n:"Rui Xavier",p:"LD"},{n:"Luís Pereira",p:"LD"},
      {n:"Alvaro Araújo",p:"LE"},{n:"Vicente Pereira",p:"LE"},{n:"Gabriel Teixeira",p:"DC"},{n:"Gonçalo Martins",p:"DC"},
      {n:"Leonardo Vitoria",p:"DC"},{n:"Tiago Veiga",p:"MDC"},{n:"Rui Francisco",p:"MDC"},{n:"João Lopes",p:"MC"},
      {n:"Domingos Barroso",p:"MC"},{n:"Ana Lopes",p:"MC"},{n:"Susana Feio",p:"MC"},{n:"Pedro Carvalho",p:"MD"},
      {n:"Luís Ferreira",p:"ME"},{n:"Duarte Pinto",p:"ME"},{n:"Filipa Rebelo",p:"MO"},{n:"Pedro Gonçalves",p:"MO"},{n:"André Calçada",p:"ED"},
      {n:"Agostinho Costa",p:"EE"},{n:"Narciso Batista",p:"PL"},{n:"Sérgio Melo",p:"PL"},{n:"António Miranda",p:"PL"}
    ]
    // Exemplo com características forçadas:
    // "ACDR Tibães": [
    //   {n:"João Silva", p:"PL", idade:24, altura:182, nivel:14, attrs:{rem:17, vel:16, cab:15}},
    //   {n:"Rui Costa",  p:"GR", idade:31, altura:190, attrs:{gr:16, rea:15}}
    // ]
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
