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

  /* ---- RAZÕES de despedimento (juntam-se às do jogo) ---- */
  firingReasons: [
    // "A tua razão personalizada aqui."
	"O presidente descobriu que torces pelo rival.",
	"Vetaste o bolo de aniversário do reoupeiro.",
	"Apareceste bêbado no último treino.",
	"O afilhado do presidente jogou menos do que esperava."
  ]
};
