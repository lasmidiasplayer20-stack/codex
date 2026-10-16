# Animation vs. Physics — V3 · 60 fps

Filme original por código, com 25 takes, 125 segundos, 1920 × 1080 e **7.500 frames a 60 fps**. Esta revisão parte da V2 Viva e atende ao pedido de mais vida no cenário, personagem maior e correção de braços/pernas invertidos.

## Downloads desta revisão

- [Filme completo — 1080p60, 2min05s](exports/animation-vs-physics-v3-1080p60.mp4)
- [Parte 1 — A descoberta, 30s](exports/parte-01-descoberta-1080p60.mp4)
- [Parte 2 — As leis enlouquecem, 45s](exports/parte-02-leis-enlouquecem-1080p60.mp4)
- [Parte 3 — O confronto final, 50s](exports/parte-03-confronto-final-1080p60.mp4)
- [Projeto editável com o filme — ZIP](exports/projeto-editavel-v3-com-filme.zip)
- [Comparação V2/V3](exports/comparacao-v2-v3.jpg)
- [Relatório de validação](RELATORIO.md)

No GitHub, abra o MP4 e use a opção de baixar o arquivo bruto. O ZIP inclui filme completo, código, trilha AAC, backups e relatórios. O áudio WAV regenerável está separado no repositório; o player e o render também aceitam o AAC incluído no ZIP.

## Assistir

Abra `assistir.html` ou `exports/animation-vs-physics-v3-1080p60.mp4`. O player de vídeo possui acesso aos três atos. O player editável está em `index.html`; ele desenha a animação por código e usa a trilha incluída.

- Ato 1: 0:00–0:30 — A descoberta.
- Ato 2: 0:30–1:15 — As leis enlouquecem.
- Ato 3: 1:15–2:05 — O confronto final.

## Mudanças da V3

Os cotovelos agora usam a direção corporal, em vez de lados opostos escolhidos pelo índice do braço. Os joelhos dobram no sentido complementar. As mãos acompanham em oposição os pés reais do ciclo de caminhada, inclusive ao caminhar para a esquerda. Nas viradas, uma extensão breve dos membros permite mudar o sentido de dobra suavemente, sem trocar braços por pernas ou cruzar os joelhos instantaneamente. A identidade dos 11 nós, os comprimentos e as funções originais de desenho foram preservados.

Os planos principais se aproximam em cerca de 32% em relação à primeira passagem da V3, respeitando os limites de enquadramento. A câmera prioriza o personagem na queda e depois da segunda onda de caos, além de manter os detalhes de contato e reação. O tamanho no mundo permanece constante.

O ambiente ganhou painéis translúcidos em profundidade, arcos de medição, luz ambiente, poeira em movimento, piso em perspectiva, reflexos de energia, materiais na esfera e no cubo, faíscas e propagação dos impactos. A energia muda de cor suavemente. A atuação inclui respiração, atrasos da cabeça, recuperação dos gestos e reações amortecidas.

O vídeo é amostrado diretamente a cada 1/60 s da simulação de 120 Hz. Não foi convertido do MP4 antigo. A exposição de movimento é curta e só entra nas ações rápidas. A trilha foi ressincronizada com os eventos da V3, recebeu texturas espaciais e conserva os silêncios cômicos.

## Arquivos e edição

| Arquivo | Função |
| --- | --- |
| `src/rig-adapter.js` | IK/FK e contatos, com lados dos membros consistentes |
| `src/performance.js` | Atuação, orientação e alternância de mãos/pés |
| `src/acting-v3.js` | Reação secundária e transições das viradas |
| `src/cinematic.js` | Câmera, planos maiores e cortes alinhados a 60 Hz |
| `src/world-v3.js` | Ambiente, luz, piso, energia e respostas aos impactos |
| `src/material-v3.js` | Luz discreta na borda do personagem preto |
| `src/shutter.js` | Exposição curta para o render nativo em 60 fps |
| `scripts/score-v2.py` + `foley-v3.py` | Composição original sincronizada e camadas sonoras da V3 |
| `scripts/render-parts.mjs` | Render dos três atos e montagem sem lacunas no áudio |
| `exports/` | Filmes, áudio, verificações, hashes e relatórios |
| `preserved/` | Controlador, templates e fontes das versões anteriores |

## Reproduzir na nuvem

Requer Node 22+, Chromium, FFmpeg, Python 3, NumPy e Pillow. A entrega em vídeo não requer instalação de programas.

```sh
npm ci
npm test
npm run render:parts
```

O comando renderiza os três atos em 1080p60, verifica os arquivos e monta o filme com uma única trilha contínua. Para uma parte isolada, use o tempo absoluto da história:

```sh
node render.mjs --start 30 --duration 45 --fps 60 --width 1920 --audio exports/soundtrack-v3.m4a --output exports/parte-02-leis-enlouquecem-1080p60.mp4
python3 scripts/validate-export.py exports/parte-02-leis-enlouquecem-1080p60.mp4 --duration 45 --fps 60
```

Para revisar o arquivo codificado:

```sh
node scripts/direction-export.mjs
python3 scripts/review-v3.py exports/animation-vs-physics-v3-1080p60.mp4 --duration 125 --out .qa/review-final
```

Os roteiros e skills históricos em `docs/` registram a especificação original de 24 fps e fundo branco. O pedido atual do usuário e `AGENTS.md` desta revisão substituem esses dois requisitos por 60 fps e cenário enriquecido. A história, os 25 takes e os 125 segundos continuam iguais.
