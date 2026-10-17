# Procrastinação — o primeiro passo / R3

Vídeo completo de 52,12 s com a narração original, 1920×1080 a 60 fps.
A R3 usa o protagonista de touca de `day-three-editavel.zip` e acrescenta atuação
e contatos nas 13 cenas. A R2 e a prévia inicial permanecem disponíveis.

## Personagem

O rosto, a touca laranja, a paleta da blusa verde-azulada, a mochila, as mãos
e os sapatos vêm do componente `character.js` do projeto enviado pelo usuário.
`src/day-three-character.js` contém esse desenho e um adaptador que o liga ao
rig de Procrastinação. O personagem não foi extraído de uma imagem.

As poses mantêm os comprimentos do rig existente: tronco 55, pescoço 18,
braços 33+32 e pernas 50+50. As mangas e as calças têm espessura próxima de
10,5 unidades; o corpo passa a ser a peça preenchida da blusa do personagem.
O traje acompanha o tronco e a touca acompanha a cabeça. O solver da caminhada
preserva os pés de apoio e a direção dos joelhos corrigidos na R2.
A adaptação preserva a identidade visual; as proporções são retargeteadas ao
rig deste vídeo e não reproduzem literalmente toda a anatomia do Day Three.

## Atuação e interações

- Abertura e encerramento: personagem toca o botão gráfico ao lado do título.
- Ciclo e pensamento: gestos junto ao rosto, olhos e expressões animados.
- Celular: mão de apoio, toques sobre a tela e notificações que se alternam.
- Escolhas: as mãos exploram as opções e selecionam “começar”.
- Mesa: aproximação, alcance do monitor e reação ao toque.
- Tarefas: cartões passam pela mão; os três checkboxes avançam em sequência.
- Cronômetro: toque no botão antes da contagem.
- Caixa e passos: esforço e deslocamento com os contatos mantidos.
- Progresso e resultado: acompanha a barra, aproxima as mãos e comemora.

Câmeras, interfaces, tipografia e VHS leve compartilham o mesmo renderizador
no MP4 e no player. As cenas de Procrastinação continuam próprias; não são
usados os cenários, o enredo, as imagens ou os áudios do Day Three.

## Narração e som

A narração continua sendo o teste1.wav completo, uma vez, na velocidade e ganho
originais, codificado em AAC. O WAV fica local, fora do Git e do ZIP. Nenhum
serviço de transcrição foi usado. O player usa a voz do próprio MP4 exportado.

Os cortes foram ajustados às pausas por amplitude. Os títulos são editoriais
sobre procrastinação, não legendas literais. Não foi realizado alinhamento de
palavras. O VHS altera a imagem, mantendo a voz limpa.

## Editar e reproduzir

Requer Node.js 22+, Python 3, FFmpeg/FFprobe e DejaVu Sans.

```sh
npm ci
# Para renderizar novamente: coloque o WAV original em audio/narracao.wav.
npm run qa
npm run motion
npm run interactions
npm run render
npm run validate
npm run preview
```

Abra `http://127.0.0.1:8080`. O player tem capítulos, busca, play/pause e opção
de VHS. Para assistir, não é necessário recolocar o WAV: o MP4 já tem a voz.
Ao extrair apenas o ZIP de código, coloque o MP4 na pasta irmã `vídeo/`,
conforme a estrutura do repositório.

## Arquivos e verificações

- `src/film.js`: rig, direção, objetos, câmeras, tipografia e VHS.
- `src/day-three-character.js`: personagem fornecido e adaptação visual.
- `timeline.json`: 13 cenas cobrindo a gravação inteira, sem lacunas.
- `SKILL.md`: fluxo para continuar a série.
- `scripts/check-interactions.mjs`: presença e atuação em todas as cenas,
  toques nos botões, celular, cartões e contatos com monitor e caixa.
- `qa/character-provenance-r3.json`: hashes da origem e do componente adaptado.
- `qa/interacoes-r3.jpg`: sequência de poses; `qa/contato-r3.jpg`: visão das cenas.
- `qa/validation.json`: validação do MP4 atual; `qa/validation-r2.json`: histórico.

A auditoria cobre os 3.128 tempos de quadro e verifica geometria finita,
comprimentos constantes e apoio. A validação final decodifica o vídeo inteiro,
confere duração, 60 fps e voz até o fim, comparando a forma de onda com o WAV.
AAC é compressão com perdas; não se alega identidade binária com o WAV.
Foram inspecionados quadros e sequências, incluindo os do MP4 exportado.
Os testes não demonstram cópia pixel a pixel do projeto de referência.
