# Animation vs. Physics — V6

**150s · 1920×1080 · 60fps nativos · três personagens · seis partes de 25s.** Uma entrega dá errado e cada tentativa de recuperar o núcleo provoca o próximo problema, no mesmo laboratório. Esta revisão reescreve a coreografia em tempo próprio: não usa a aceleração ou os resets da V5.

- Filme: `exports/animation-vs-physics-v6-continuous-1080p60.mp4`
- Seis partes: `exports/part-01-…` até `part-06-…`
- Player de vídeo: `video.html`; player da animação por código: `index.html`
- História: `docs/ROTEIRO-V6.md`; validação e revisão: `RELATORIO.md`
- Pacote editável: `exports/projeto-editavel-v6-com-filme.zip`

Textos visíveis em inglês. Áudio original instrumental e efeitos sintetizados, sem diálogo. As versões anteriores permanecem nas pastas irmãs. O FK, o perfil, o adaptador e as funções originais de desenho estão preservados byte a byte; novos módulos dirigem a atuação.

## Executar

Requer Node ≥20, Chromium, FFmpeg, Python 3, NumPy e Pillow. No projeto:

```sh
npm ci
npm run serve
npm test
python3 scripts/score-v6.py
npm run render:parts
python3 scripts/review-v6.py
node scripts/check-player-v6.mjs
python3 scripts/package-v6.py
```

`npm test` gera o mapa de eventos necessário à trilha. O renderer amostra o relógio absoluto em `frame/60`, a performance é calculada a 120Hz e o FK original reconstrói ossos de comprimento fixo. A montagem concatena somente o vídeo das seis partes e acrescenta um único master de áudio de 150s para evitar lacunas de AAC entre capítulos. `npm run serve` usa a porta exibida no terminal.

## Edição

`src/story-v6.js`: curvas de posição, relações de causa, trajetórias do núcleo e estados persistentes. `src/rig-v6.js`: atuação, apoio, marcha, contatos e poses para o FK. `src/world-v6.js`: laboratório, câmera e efeitos. `scripts/score-v6.py`: música e efeitos por timestamp. `render.mjs`: exportação por frames. Os arquivos `preserved/` documentam as fontes anteriores e seus hashes.
