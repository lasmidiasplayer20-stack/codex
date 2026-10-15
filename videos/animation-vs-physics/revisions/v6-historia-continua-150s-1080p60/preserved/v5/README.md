# Animation vs. Physics — V5 · ritmo e comédia

**78 segundos, três personagens, seis partes de 13s, 1080p60.** Esta versão responde à lentidão da V4: ações principais condensadas, cortes rápidos, pausas curtas e 26,4s de coreografias cômicas novas. Todos os textos que aparecem no vídeo e nos players estão em inglês.

- [Filme completo — 1min18s](exports/animation-vs-physics-v5-trio-1080p60.mp4)
- [Parte 1 — luva surpresa](exports/parte-01-descoberta-1080p60.mp4)
- [Parte 2 — lançamento errado](exports/parte-02-alavanca-1080p60.mp4)
- [Parte 3 — cubo sem freio](exports/parte-03-carga-em-movimento-1080p60.mp4)
- [Parte 4 — espirro orbital](exports/parte-04-sem-gravidade-1080p60.mp4)
- [Parte 5 — multibola](exports/parte-05-reacao-em-cadeia-1080p60.mp4)
- [Parte 6 — vitória e pato de borracha](exports/parte-06-juntos-na-passagem-1080p60.mp4)
- [Projeto editável, seis partes e filme — ZIP](exports/projeto-editavel-v5-com-filme.zip)
- [Visão geral das piadas](exports/seis-piadas-v5.jpg)
- [Relatório de revisão e comparação de ritmo](RELATORIO.md)

No GitHub, use **Download raw file** no MP4. `assistir.html` oferece o filme e os seis capítulos. `index.html` desenha a animação editável. Não é preciso instalar programas para assistir aos vídeos prontos.

O preto explora, o ciano tenta controlar a situação e o âmbar provoca os acidentes. A nova sequência inclui luva com mola, lançamentos em cadeia, cubo com rodas, espirro em gravidade zero, três bolas fora de controle e um pato sobre a cabeça do preto. O áudio foi recomposto para o novo timing, com percussão mais rápida e 36 eventos de piada.

O filme foi renderizado novamente por código a 60 fps; não é uma aceleração do MP4 anterior. O rig original continua com comprimentos fixos e identidades dos membros preservadas. A V4 e as demais revisões continuam disponíveis nas pastas irmãs.

## Editar e reconstruir

Requer Node 22+, Chromium, FFmpeg, Python 3, NumPy e Pillow. Para abrir o projeto na nuvem ou em ambiente preparado:

```sh
npm ci
npm test
npm run serve
```

Para gerar áudio e vídeos:

```sh
node scripts/preview-v5.mjs
python3 scripts/score-v5.py
npm run render:parts
node tests/player-v5.mjs
python3 scripts/review-v5.py
```

- `src/tempo-v5.js`: mapa de ritmo, seis coreografias novas e eventos cômicos.
- `src/trio-story.js`: base de atuação, IK, contatos e trilhas nativas de 120 Hz.
- `src/trio-world.js`: câmeras, luva, rodas, multibolas, pato, cenário e efeitos.
- `scripts/score-v5.py`: música e efeitos sintetizados, com master contínuo.
- `docs/ROTEIRO-V5.md`: ações e textos visíveis em inglês.
- `exports/sequencia-comica-0*.jpg`: revisão de sequências densas de movimento.
- `exports/comparacao-ritmo-v4-v5.json`: método e medidas do ritmo.
- `preserved/`: fontes e hashes da base original e da V4.

WAVs intermediários estão separados no repositório e podem ser regenerados; o ZIP inclui a trilha AAC, os sete MP4, fontes e relatórios. Física e mecanismos fantásticos são coreografados por tempo absoluto, com cortes explícitos entre as estações.
