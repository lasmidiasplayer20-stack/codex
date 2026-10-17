# Procrastinação — o primeiro passo / R4

Vídeo completo de 52,12 s com a narração original, 1920×1080 a 60 fps.
A R4 corrige as dobras e os cruzamentos dos membros do protagonista de touca.
Os membros escuros ficam atrás; os claros, na frente, inclusive mãos e sapatos.
As 13 cenas e a narração integral permanecem. R2, R3 e a prévia foram preservadas.

## Personagem

O rosto, a touca laranja, a paleta da blusa verde-azulada, a mochila, as mãos
e os sapatos vêm do componente `character.js` do projeto enviado pelo usuário.
`src/day-three-character.js` contém esse desenho e um adaptador que o liga ao
rig de Procrastinação. O personagem não foi extraído de uma imagem.

O rig agora tem encaixes próprios para os dois ombros e os dois quadris.
O tronco mede 55, o pescoço 26, os braços 33+32 e as pernas 50+50 unidades.
O pescoço foi ajustado ao desenho preenchido para evitar que a manga comece
sobre a boca. A espessura próxima continua em 10,5 unidades.

Os joelhos dobram para a frente, com apoio travado, e as pernas ficam separadas
na postura parada. A caminhada tem passada mais curta e menor elevação do pé.
Os alcances mantêm o cotovelo abaixo do braço; a comemoração levanta as mãos
em arcos em torno dos ombros. Não há troca de ramo do cotovelo dentro da cena.
A adaptação preserva a identidade visual e usa proporções próprias deste vídeo.

A profundidade é fixa: perna, sapato, braço e mão escuros são pintados antes
dos membros claros. Não se ordenam membros pela posição na tela. No celular,
a mão escura sustenta o aparelho e a clara toca a tela, redesenhada à frente.

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
npm run anatomy
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
- `qa/character-provenance-r4.json`: hashes da origem e do componente adaptado.
- `qa/poses-r4.jpg`: sequência de poses; `qa/contato-r4.jpg`: visão das cenas.
- `scripts/check-anatomy.mjs`: poses nos 3.128 quadros, limites de dobra,
  continuidade, apoios e testes de pixels nos cruzamentos de membros.
- `qa/comparacao-r3-r4.jpg`: quadros dos MP4s antes/depois.
- `qa/validation.json`: validação do MP4 atual; `qa/validation-r2.json`: histórico.

A auditoria cobre os 3.128 tempos de quadro e verifica geometria finita,
comprimentos constantes e apoio. A validação final decodifica o vídeo inteiro,
confere duração, 60 fps e voz até o fim, comparando a forma de onda com o WAV.
AAC é compressão com perdas; não se alega identidade binária com o WAV.
Foram inspecionados quadros e sequências, incluindo os do MP4 exportado.
Os testes não demonstram cópia pixel a pixel do projeto de referência.
