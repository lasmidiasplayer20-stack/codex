# Take 01 · revisão R2

[Assistir ou baixar o MP4](preview-take-01-r2.mp4) · [Projeto editável](projeto-take-01-r2.zip) · [Skill](SKILL.md)

Reconstrução independente em Three.js dos quadros 0–121 do original: **4,067 segundos**, 1280×720, 60 fps, com áudio original. Esta revisão substitui apenas a abertura da prévia anterior de 60 s, que foi reprovada visualmente pelo usuário. O restante da prévia e o vídeo completo continuam pendentes. Não é uma reprodução exata aprovada.

O cenário, a encenação e o timing seguem o vídeo de referência. O ZIP do jogo serve apenas como referência de acabamento visual. Não há quadros do vídeo usados como fundo nem como textura: personagem, laboratório e holograma são geometria editável, luzes e efeitos procedurais.

## Alterações

- Câmera contínua, ajustada pela escala da cabeça e pelo movimento do fundo em duas profundidades.
- Cabeça redonda, corpo com moletom arredondado, olhos com piscada e mão com trajetória revisada.
- Braços e pernas com dois ossos de comprimento fixo; membros escuros atrás dos claros.
- Holograma com entrada gradual, pontos luminosos e flash final; texto com os tempos do original.

A silhueta do corpo, a trajetória exata das articulações e a densidade da névoa do holograma ainda têm diferenças em relação ao original. A auditoria numérica verifica continuidade e comprimentos; não constitui aprovação visual.

## Abrir e exportar

Node.js 22+, FFmpeg e Chromium:

```bash
npm install
npx playwright install chromium
npm run serve
# abrir http://127.0.0.1:8080
npm run audit
npm run export
```

`npm run export` gera o MP4 com `audio-original.m4a`, um trecho da trilha original, sem sintetizar nem substituir narração, música ou efeitos. Pode-se informar o original completo com `npm run export -- /caminho/original.mp4`. Defina `CHROMIUM` para usar um executável existente e `PLAYWRIGHT_MODULE` para uma instalação alternativa do Playwright.

`opening.js` contém cena, rig, câmera e composição; `data.json`, os parâmetros geométricos e as observações por quadro. `index.html` é o editor ao vivo; o console expõe `film.scene`, `film.camera` e `film.frame(tempo)` para inspeção. Para recalcular medições, instale `opencv-python`, `numpy`, `scipy` e `Pillow`:

```bash
python analyse.py /caminho/original.mp4 ../../tracking/calibration-first-minute.json
python build_data.py /caminho/original.mp4
```

O modelo de câmera usa duas profundidades e não representa uma solução 3D única do vídeo. As chaves da mão e o contorno do holograma têm autoria manual. Veja `qa/` para a auditoria e amostras do render exportado. A biblioteca Three.js mantém sua licença MIT em `vendor/THREE-LICENSE.txt`; não se atribui nova licença ao conteúdo original.
