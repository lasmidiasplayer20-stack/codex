# Procrastinação — o primeiro passo / R2

Vídeo completo com os **52,12 segundos da narração fornecida**, em 1920×1080,
60 fps. A R2 engrossa o personagem, refina articulações e caminhada e incorpora
o WAV original ao MP4. A primeira prévia silenciosa de 12 s foi preservada como
histórico; o arquivo completo é `../vídeo/procrastinacao-completo-r2-1080p60.mp4`.

## Imagem e movimento

Fundo quase preto, figura branca, detalhes vermelhos, interfaces animadas,
movimentos de câmera e VHS leve seguem a linguagem do projeto de referência.
O desenho e as cenas foram escritos novamente. Não se utilizam os frames,
o enredo ou os áudios de `02-the-correct-reflection-project.zip` no render.

Braços e pernas passaram de 6,5 para 10,5 unidades no plano próximo; o tronco
passou de 9 para 13,5. O braço distante usa 9 unidades e a perna distante 9,5.
Curvas curtas suavizam as juntas preservando seus centros e comprimentos.
Os joelhos caminham na mesma direção, os apoios permanecem fixos no mundo
e o balanço dos braços acompanha o avanço real. Os gestos de pensar e levantar
os braços usam dobras de cotovelo próprias. O contato com o monitor e as duas
mãos na caixa também foram ajustados.

## Narração

A narração é usada uma vez, inteira, com velocidade e ganho originais, codificada
em AAC. Não há trilha ou efeito sonoro sobre a fala. Nenhum serviço de transcrição
foi utilizado. O WAV foi processado localmente e não foi publicado separadamente.

A montagem gráfica foi ajustada às pausas por análise local de amplitude. Os
títulos são editoriais sobre procrastinação; não são legendas literais da fala.
Não foi realizado alinhamento de palavras nem transcrição do conteúdo.
O efeito VHS altera a imagem, mantendo a voz limpa.

## Rodar e editar

Requer Node.js 22+, Python 3, FFmpeg/FFprobe e DejaVu Sans.

```sh
npm ci
# Copie o teste1.wav fornecido para audio/narracao.wav.
npm run qa
node scripts/check-motion.mjs
npm run render
npm run validate
npm run preview
```

Abra `http://127.0.0.1:8080`. O player oferece capítulos, navegação, play/pause, VHS e carregamento de
áudio local pelo navegador. Ele reproduz a narração do próprio MP4 exportado,
sem exigir o WAV para assistir. O link do MP4 completo abre o arquivo com som.

O WAV original está fora do Git. O render exige recolocá-lo no caminho indicado.
Não remova nem substitua o arquivo de narração para simular uma exportação.

## Arquivos e verificação

- `src/film.js`: rig, direção, objetos, câmeras, tipografia e VHS.
- `timeline.json`: 13 cenas cobrindo a gravação inteira, sem lacunas.
- `SKILL.md`: fluxo para continuar esta série.
- `scripts/render.mjs`: QA e exportação a 60 fps com áudio por padrão.
- `scripts/check-motion.mjs`: apoios, dobras, continuidade e contatos.
- `scripts/validate.py`: decodificação completa, duração, FPS e comparação da voz.
- `qa/audio-analysis.json`: análise local de pausas e metadados da narração.
- `qa/contato-r2.jpg`: quadros da revisão; `qa/walk-refino-r2.jpg`: sequência de passos.
- `qa/validation.json`: resultado da validação final.

Os testes geométricos verificam os 3.128 tempos de quadro. A validação da voz
compara a forma de onda decodificada e os dois segundos finais com o WAV local,
além de conferir cobertura temporal e áudio não silencioso. AAC é compressão
com perdas: a validação não alega identidade binária com o WAV.
Foram inspecionados quadros e sequências; isso não comprova equivalência visual
com a referência nem alinhamento palavra por palavra.
