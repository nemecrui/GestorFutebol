# Emblemas dos clubes (crests)

Aqui ficam os emblemas dos clubes **que autorizaram** o uso do símbolo. É opcional,
clube a clube — quem não tiver emblema aqui continua com o losango das cores.

## Como adicionar um emblema

1. Coloca o ficheiro do emblema nesta pasta, `crests/`.
   - Formato: **SVG** (recomendado — nítido e leve) ou **PNG** quadrado com fundo transparente.
   - Tamanho: idealmente quadrado (ex.: 100×100 ou maior). Fica pequeno no jogo, por isso o importante é ser nítido.
   - Nome do ficheiro: simples, sem espaços nem acentos (ex.: `cachapuz.svg`, `maximinense.png`).

2. Abre o `data.js` e, na secção `crests`, acrescenta uma linha com o **nome EXATO do clube**
   (tal como aparece no jogo) e o caminho do ficheiro:

   ```js
   crests: {
     "Cachapuz WLS": "crests/cachapuz.svg",
     "CD Maximinense": "crests/maximinense.png"
   },
   ```

3. Recomeça a carreira (ou recarrega a página). O emblema passa a aparecer em todo o lado:
   início, classificação, mercado e marcador do jogo ao vivo.

## Notas

- Se o caminho estiver errado ou o ficheiro faltar, o jogo volta automaticamente às cores do clube — nunca fica um espaço vazio.
- `exemplo.svg` é só uma demonstração; podes apagá-lo quando tiveres emblemas reais.
- Guarda aqui apenas emblemas de clubes que deram autorização.


cd C:\Projetos\GestorFutebol
git add data.js crests/
git commit -m "Simbolos adicionados"
git push