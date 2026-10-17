# Procrastinação — projeto em preparação

**Estado: estudo visual. O vídeo final com narração ainda não foi produzido.**

A narração fornecida tem 52,12 s. O usuário escolheu manter o áudio local e
fornecer o texto da fala. Esse texto está pendente; a timeline atual demonstra
somente a linguagem visual e não representa uma montagem sincronizada.

O estudo usa fundo escuro, figuras brancas articuladas, detalhes vermelhos,
movimentos de câmera, cartões e interfaces animadas e VHS discreto. A referência
visual foi o projeto `02-the-correct-reflection-project.zip`, fornecido pelo
usuário. O desenho e as cenas deste projeto foram escritos novamente; não são
usados os frames, o enredo ou os áudios do projeto de referência.

## Arquivos

- `src/film.js`: rig de comprimentos fixos, desenho, poses, câmera, interfaces e VHS.
- `timeline.json`: estudo de linguagem visual de 52,12 s; roteiro pendente.
- `qa/previa-visual.json`: montagem demonstrativa de 12 s, sem narração.
- `index.html`: player com capítulos, posição, play/pause, legendas e VHS.
- `SKILL.md`: fluxo para continuar esta série.
- `scripts/`: servidor com suporte a busca no áudio, render e validação final.
- `qa/`: geometria, teste do player, imagens do estudo e relatório da prévia.

## Rodar

Requer Node.js 22+, FFmpeg/FFprobe e DejaVu Sans.

```sh
npm ci
npm run preview
```

Abra `http://127.0.0.1:8080`. No player, “Carregar narração” seleciona o áudio
no próprio navegador; o arquivo não é enviado a um serviço. Outra opção é copiar
o WAV original para `audio/narracao.wav`. Esse arquivo está fora do Git.

Para renderizar novamente o estudo sem voz:

```sh
FILM_PLAN=qa/previa-visual.json FILM_SILENT=1 \
FILM_OUTPUT=../vídeo/estudo-visual-sem-narracao-1080p60.mp4 npm run render
```

Para verificar geometria do estudo: `npm run qa`. O render final e
`npm run validate` devem ser usados depois de substituir a timeline pelo roteiro
correspondente à narração. O validador final exige a faixa de áudio; o relatório
`qa/preview-validation.json` valida separadamente a prévia visual sem som.

## Verificações já realizadas

O rig foi examinado nos 3.128 tempos de quadro do estudo, sem alongamento dos
ossos nem erro nos apoios. O player passou na navegação por capítulo, seleção
de posição, play/pause e alternância do VHS. As imagens do estudo foram
inspecionadas. Isso não demonstra sincronização narrativa nem aprovação do
vídeo final, que continuam pendentes do texto da narração.
