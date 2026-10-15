# Animation vs. Physics

Projeto original programado: 25 takes de cinco segundos, 1920×1080, 24 fps, 3.000 frames previstos. Fundo branco, chão preto, um stickman preto, esfera azul e cubo. Sem falas ou vídeo gerado por IA.

## Estado

Takes 01–15 implementados e testados. Prévias: 01–06 (30 s) e 07–15 (45 s). O módulo dos takes finais está em desenvolvimento e ainda não está ativado nesta revisão.

## Preservação não destrutiva

O controlador `vendor/rig-controller.js` é uma cópia byte a byte do pacote fornecido. As funções originais de desenho de corpo/cabeça/curvas estão copiadas literalmente em `src/legacy-renderer.js`, com novos bindings. As bases originais completas estão em `preserved/` e não são alteradas.

O pacote não fornece `motion-data.js` nem um perfil de comprimentos capturado. Reutilizamos o perfil G do projeto anterior (`preserved/previous-system/parts/02-medico-confronto/choreography.js`) sem mudar suas proporções. Um fator uniforme e constante de unidades, 0,72, coloca a figura na altura de aproximadamente 170 pixels solicitada pelo novo roteiro. A cor preta é um parâmetro da nova instância do mesmo modelo.

Os módulos de física e direção estão em `src/`. Eles alimentam o FK original; não substituem o rig ou reescrevem seus componentes. O teste de preservação confere também os arquivos do projeto anterior ainda presentes no repositório.

## Física e coreografia

Passo fixo de 1/120 s; massa positiva; gravidade, resistência do ar, atrito, restituição e impulsos. Poses e contatos são dirigidos por um adaptador IK compatível com as juntas existentes. O chute conserva o impulso total. Nadar não produz força translacional. Efeitos impossíveis serão regras explícitas do diretor, nunca massa negativa no solver.

A compressão cartunesca é produzida dobrando juntas, preservando comprimentos e tamanho da cabeça, conforme a regra obrigatória do usuário.

## Executar na nuvem

Node 22+, Chromium/Playwright, FFmpeg e Python com as dependências de `requirements.txt`.

```bash
npm ci
npm test
npm run inspect
python scripts/audio.py --events .qa/inspection/report.json --duration 30 --output exports/audio.wav
node render.mjs --duration 30 --audio exports/audio.wav --output exports/previa.mp4
python scripts/validate-export.py exports/previa.mp4 --duration 30
```

O renderizador abre e fecha seu próprio servidor e navegador. A reprodução é em `index.html`; o script de render seleciona exatamente 24 fps. Não há instalação no computador do usuário.
