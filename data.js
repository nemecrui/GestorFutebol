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
    { data:"2026-09-13", texto:"🎬 Relato ao vivo com animações! Nos momentos-chave aparece agora uma pequena animação a ilustrar o lance: golo (com a rede a abanar e confete na cor do clube), penálti, livre, cabeça, isolado, contra-ataque, autogolo e golo no último minuto (90+), além de defesa, poste, bola para fora e cartão vermelho. Até o folclore ganhou vida — cão, gaivota, galinha e pato entram em campo. Podes ligar/desligar tudo no botão «Animações» do painel (respeita o 'reduzir movimento' do telemóvel)." },
    { data:"2026-08-17", texto:"📲 Agora é mais fácil instalar: aparece um convite para instalar o Gestor de Futebol como aplicação no telemóvel (com ícone próprio e ecrã inteiro). No iPhone há um guia passo a passo. Também tens sempre o botão «Instalar como aplicação» no painel." },
    { data:"2026-08-16", texto:"🧑‍💼 Chegou o treinador-mascote! Uma personagem que festeja nas conquistas, fala nas conferências de imprensa e fica desanimada nas derrotas — com a gravata na cor do teu clube." },
    { data:"2026-08-16", texto:"✨ Mais vida e dinamismo: os ecrãs entram em cascata, as barras e o dinheiro animam, os golos trazem tremor e confete nas cores do clube, e há celebração de ecrã inteiro quando és campeão, sobes de divisão ou ganhas uma taça. Podes ligar/desligar as animações no painel (respeita também o 'reduzir movimento' do telemóvel)." },
    { data:"2026-08-16", texto:"🧠 Progressão do treinador: ganhas XP a jogar, vencer, subir de divisão e desbloquear conquistas; sobes de nível (com licenças D→Pro) e ganhas pontos para desbloquear perks permanentes — Motivador, Tático e Formador. Vê tudo no botão «Treinador» do painel." },
    { data:"2026-08-16", texto:"🔁 Empréstimos mais realistas: clubes e jogadores recusam vir de divisões muito superiores ou quando são muito melhores do que o teu plantel — deixa de ser possível encher a equipa de reforços da divisão de topo." },
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
      {n:"Pedro Magalhães", p:"MO"},
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
    ],
	"FC Prazins Corvite": [
		{n:"Fábio Freitas", p:"GR", idade:24},
		{n:"Pedro Pereira", p:"GR", idade:19},
		{n:"Rodrigo Machado", p:"GR", idade:18},
		{n:"Gonçalo Ferreira", p:"DC", idade:24},
		{n:"Leonel Batista", p:"DC", idade:26},
		{n:"João Mendes", p:"LD", idade:23},
		{n:"Hélder Ribeiro", p:"DC", idade:26},
		{n:"Leandro Silva", p:"LE", idade:26},
		{n:"João Twix", p:"LE", idade:25},
		{n:"Luís Alves", p:"LD", idade:22},
		{n:"Álvaro Silva", p:"DC", idade:39},
		{n:"Gonçalo Gouveia", p:"MC", idade:23},
		{n:"Lucas Martin", p:"MC", idade:31},
		{n:"Luís Fernandes", p:"MDC", idade:21},
		{n:"Josué Pereira", p:"MDC", idade:24},
		{n:"Ricardo Ribeiro", p:"MC", idade:26},
		{n:"Miguel Jordão", p:"MC", idade:28},
		{n:"Leandro Pinheiro", p:"MC", idade:39},
		{n:"Rui Trina", p:"ED", idade:29},
		{n:"Samuel Costa", p:"EE", idade:23},
		{n:"César Freitas", p:"PL", idade:25},
		{n:"José Gabriel", p:"PL", idade:20},
		{n:"Bruno Meira", p:"ED", idade:27},
		{n:"Zé Marco", p:"EE", idade:31},
		{n:"Rui Fernandes", p:"PL", idade:33},
	],
    "GD Gemeos":[
		{n:"Matheus Jesus", p:"GR", idade:22},
		{n:"Micoli Micoli", p:"GR", idade:25},
		{n:"Filipe Vizela", p:"GR", idade:22},
		{n:"Fábio Neves", p:"DC", idade:22},
		{n:"Vítor Oliveira", p:"DC", idade:25},
		{n:"Rodriguo Miranda", p:"DC", idade:19},
		{n:"Fábio Leite", p:"DC", idade:33},
		{n:"Zezé Pereira", p:"DC", idade:24},
		{n:"Zé Rui", p:"LE", idade:19},
		{n:"Mário Braz", p:"LD", idade:22},
		{n:"Martim Machado", p:"LD", idade:19},
		{n:"Tiago Mendes", p:"MC", idade:22},
		{n:"Léo Silva", p:"MC", idade:24},
		{n:"Augustin Gonzalez", p:"MC", idade:16},
		{n:"Samu Chilulo", p:"MC", idade:23},
		{n:"Bruninho Lima", p:"MC", idade:23},
		{n:"Tiago Trigo", p:"MDC", idade:29},
		{n:"Tiago Areu", p:"MO", idade:24},
		{n:"Luis Oliveira", p:"EE", idade:26},
		{n:"Pedro Faria", p:"ED", idade:22},
		{n:"António Ricas", p:"PL", idade:24},
		{n:"Ângelo Faria", p:"PL", idade:24},
		{n:"Joenderson Barbosa", p:"PL", idade:30}
	]
  },

  /* ---- EMBLEMAS dos clubes (só para quem autorizou) ----
     A chave é o NOME EXATO do clube (tal como aparece no jogo). O valor é o
     caminho para o ficheiro do emblema, dentro da pasta "crests/".
     - Usa de preferência SVG (nítido e leve) ou PNG quadrado com fundo transparente.
     - Quem NÃO estiver aqui continua com o losango das cores do clube.
     - Se o ficheiro faltar, o jogo volta automaticamente às cores (não fica vazio).
     Exemplo (o ficheiro de exemplo já existe em crests/exemplo.svg):
       "Cachapuz WLS": "crests/exemplo.svg" */
  crests: {
    // "Cachapuz WLS": "crests/cachapuz.svg",
    // "CD Maximinense": "crests/maximinense.png"
    "AD Oliveirense": "crests/AD_Oliveirense.png",
    "Sequeirense FC": "crests/Sequeirense_FC.png",
	"ACRD Arsenal Crespos": "crests/ArsenalCrespos.png",
	"GD Serzedelo": "crests/GD_Serzedelo.png",
	"CDC Viatodos": "crests/CDC_Viatodos.png",
	"Realense FC": "crests/Realense_FC.png",
	"GDU Torcatense": "crests/GDU_Torcatense.png",
	"ACDR Oleiros": "crests/ACDR_Oleiros.png",
	"GD Adaúfe": "crests/GD_Adaufe.png",
	"Soarense SC": "crests/Soarense_SC.png",
	"GD Gemeos": "crests/GD_Gemeos.png",
	"FC Prazins Corvite": "crests/FC_Prazins_Corvite.png",
	"GDC Serafão": "crests/GDC_Serafão.png"
  },

  /* ---- TREINADORES (nome do treinador e adjuntos por clube) ----
     A chave é o NOME EXATO do clube (tal como aparece no jogo), igual aos emblemas.
     Valor pode ser:
       • só o nome do treinador   →   "GD Gemeos": "Zé Manel",
       • nome + adjuntos          →   "GD Gemeos": { n:"Zé Manel", adjuntos:["Chico", "Toni"] }
     Quem NÃO estiver aqui recebe um nome gerado automaticamente.
     A tua equipa usa sempre o teu nome de treinador (o que escreveste ao começar). */
  treinadores: {
    // "GD Gemeos": "Nome do Treinador",
    // "FC Prazins Corvite": { n:"Nome do Treinador", adjuntos:["Adjunto 1", "Adjunto 2"] }
	"FC Prazins Corvite": { n:"Adriano Araújo", adjuntos:["Miguel Oliveira", "Marcos Pereira"] }

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
