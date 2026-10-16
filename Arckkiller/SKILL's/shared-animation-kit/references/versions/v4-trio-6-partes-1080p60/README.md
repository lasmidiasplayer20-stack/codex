# Animation vs. Physics — Trio V4

**Três personagens, seis desafios.** Uma nova história de 2min30s em 1920×1080, 60 fps nativos e 9.000 frames. O preto explora, o ciano planeja e o âmbar improvisa. Esta pasta é independente e preserva a V3 no repositório.

## Assistir e baixar

- [Filme completo — 1080p60](exports/animation-vs-physics-v4-trio-1080p60.mp4)
- [Parte 1 — A descoberta](exports/parte-01-descoberta-1080p60.mp4)
- [Parte 2 — A alavanca](exports/parte-02-alavanca-1080p60.mp4)
- [Parte 3 — Carga em movimento](exports/parte-03-carga-em-movimento-1080p60.mp4)
- [Parte 4 — Sem gravidade](exports/parte-04-sem-gravidade-1080p60.mp4)
- [Parte 5 — Reação em cadeia](exports/parte-05-reacao-em-cadeia-1080p60.mp4)
- [Parte 6 — Juntos na passagem](exports/parte-06-juntos-na-passagem-1080p60.mp4)
- [Projeto editável com filme e trilha — ZIP](exports/projeto-editavel-v4-com-filme.zip)
- [Visão geral dos seis capítulos](exports/seis-capitulos-v4.jpg)
- [Relatório de testes e revisão](RELATORIO.md)

No GitHub, use **Download raw file** no MP4. Abra `assistir.html` para o player com seis capítulos. `index.html` desenha a animação editável em Canvas e toca a trilha incluída. Ambos funcionam pelo servidor local abaixo.

## O que mudou

A história agora depende da colaboração do trio. Há dominós, gangorra, mola de lançamento, esteira, cubo com corda, roldanas, campo de gravidade zero, cabo de segurança, rebatedores, turbina, botões, ponte articulada e portal. O cenário tem luz difusa, janelas, painéis, plantas em movimento, poeira, sombras e reflexos de energia. Câmeras aproximam os contatos e abrem para os voos.

Os gestos usam arcos em torno das articulações para evitar mãos atravessando os ombros; as viradas estendem os membros antes de mudar o lado de dobra. Os pés têm fase de apoio por distância percorrida e os braços acompanham em oposição. Os mesmos 11 nós e comprimentos do boneco original são usados nos três personagens. A leitura visual vem das cores, poses e funções na ação.

Há composição original para cada capítulo e efeitos sintetizados sincronizados por eventos, com posição estéreo. O filme é montado com uma única trilha contínua para evitar lacunas entre as partes.

## Editar e reproduzir

Requer Node 22+, Chromium, FFmpeg, Python 3, NumPy e Pillow para reconstruir; os vídeos prontos não exigem instalação.

```sh
npm ci
npm test
npm run serve
```

Para refazer áudio e todos os vídeos:

```sh
node scripts/preview-v4.mjs
python3 scripts/score-v4.py
npm run render:parts
python3 scripts/review-v4.py
```

- `src/trio-story.js`: seis sequências, três trilhas de atuação, IK e eventos.
- `src/trio-world.js`: cenário, mecanismos, câmeras, luz e efeitos.
- `src/trio-player.js`: player editável com acesso aos seis capítulos.
- `docs/ROTEIRO-V4.md`: ações e intenções de cada capítulo.
- `scripts/score-v4.py`: trilha, foley e master contínuo regenerável.
- `scripts/render-v4.mjs`: seis renders de 25s, validação e montagem.
- `tests/`: comprimentos, continuidade, contatos, determinismo e preservação.
- `preserved/`: fontes essenciais da V3 e hashes. O restante da V3 permanece na pasta irmã publicada anteriormente.

A animação é inteiramente gerada por código. As coreografias e mecanismos são dirigidos e determinísticos em 120 Hz, com exportação direta em 60 fps; não é uma simulação física geral nem reutilização de imagens de outro vídeo. As seis estações têm cortes de cenário explícitos. WAVs intermediários são regeneráveis e ficam fora do ZIP para manter o download compacto.
