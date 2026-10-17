# Day Three — The Other Side

Parte 3 da série do surto zumbi, continuando diretamente da voz de Rosa no fim do Day 2. Narração, legendas e textos visíveis em inglês. A história acompanha os quatro sobreviventes na travessia do canal e desenvolve o mistério das transmissões.

## Entrega

- [Vídeo completo para postar](Vídeos/day-three-someone-was-listening-1080p60.mp4): 1920×1080, 60 fps, H.264 e AAC estéreo.
- [Capa do Day 3](capa/day-three-thumbnail.jpg): JPG 1280×720, abaixo de 2 MB.
- [Título e descrição em inglês](youtube-metadata.md), prontos para copiar.
- [ZIP editável](day-three-editavel.zip), com projeto, áudio tratado, capa, roteiro e legendas.
- [Legendas em inglês](day-three-en.srt).
- [Projeto](projeto/) e [relatórios de revisão](qa/).

Título: **Day 3 of the Zombie Outbreak — Someone Was Listening**.

A montagem tem **11min32,167s**, incluindo abertura de 3 segundos e encerramento de 3 segundos. São 32 cenas, 129 planos e 210 legendas. Os CTAs discretos duram cinco segundos, aos **00:45**, **05:46,083** e **10:57,167**, acima das legendas e próximos à borda direita.

O MP4 final passou pela decodificação completa de **41.530 quadros**. O áudio AAC estéreo a 48 kHz mediu **-16.06 LUFS**, pico verdadeiro de **-2.96 dBTP** e faixa de sonoridade de **3.60 LU**. Vídeo e áudio começam em 0,000s. O vídeo já inclui as legendas em inglês; o SRT também é fornecido para edição. Veja [a validação final](qa/final-validation.json) e [os checksums](SHA256SUMS.txt).

## Animação e continuidade

Novos cenários e direção para a estação de bombeamento, o canal, a passarela inundada, o portão com corrente, o abrigo e a sala do rádio. Ação em tempo contínuo, mudanças de enquadramento, expressões, chuva, fumaça, incêndios, deslocamentos de sobreviventes e infectados e detalhes de objetos. O portão, a corrente e o deslocamento na passarela seguem a progressão da fuga.

O protagonista mantém o gorro laranja, a roupa verde-azulada, a mochila e a faixa no braço. O funcionário continua com a perna ferida; a senhora e o policial permanecem com o grupo. Rosa tem cabelo escuro e casaco em tom terracota. Os módulos `character.js` e `chaos.js` foram preservados byte a byte do episódio 2; a direção nova fica em `film.js`.

Fluxo orientado pela skill [`original-stick-animation`](https://github.com/lasmidiasplayer20-stack/codex/blob/entrega-animacao-20261014-caf07810/Arckkiller/SKILL%27s/original-stick-animation/SKILL.md). A referência narrativa completa disponível é o roteiro da parte 2; a transcrição integral do Day 1 não foi fornecida. A capa segue a identidade visual anterior, com preparação orientada pela skill vidIQ packaging studio.

## Áudio e revisão

O WAV fornecido tem 11min26,160s. A transcrição foi feita localmente com Whisper base.en. Não foram identificados títulos de produção nem timestamps falados nessa transcrição; nenhuma fala foi cortada. O roteiro canônico foi alinhado aos segmentos reconhecidos, com 95,65% das palavras correspondentes diretamente. As legendas usam tempos de segmento e interpolação entre palavras, sem alinhamento fonético.

Foi aplicado nivelamento gradual com ganho limitado, filtro de graves, filtro de agudos a 10 kHz e compressão leve. Música e efeitos sintéticos originais acompanham as cenas; a trilha baixa automaticamente durante a voz. A mixagem busca −16 LUFS e teto de −1,5 dBTP. Os valores medidos no MP4 entregue ficam no [relatório final](qa/final-validation.json).

A revisão visual inclui amostras das 32 cenas, sequências de quadros próximos nas ações de risco e quadros decodificados do MP4. A revisão de geometria usa poses efetivamente desenhadas, amostradas a cada segundo, e verifica coordenadas finitas, proporções dos membros e busca determinística. A animação é dirigida em Canvas; os relatórios não equivalem a uma simulação física geral nem a uma avaliação auditiva humana.

## Editar e exportar

Instale Node.js, Python e FFmpeg. Para o player editável:

```sh
cd projeto
npm install
python -m http.server 8765
```

Abra `http://localhost:8765`. `story.json` contém cenas, planos, roteiro e legendas; `story.js` é a versão para o navegador. Para revisar e exportar com o áudio já fornecido:

```sh
node review.cjs
python pipeline.py --workers 2
python validate.py
```

O render usa partes internas e gera o MP4 completo ao final. A codificação H.264 em duas passagens distribui o bitrate ao longo do filme para caber no limite de arquivo comum do GitHub. As partes ficam em `rendered/`, fora da entrega e do ZIP. `--resume` reaproveita partes com a quantidade esperada de quadros; remova as partes antigas antes de exportar mudanças visuais.

`audio.py` registra a composição e os efeitos; `level_voice.py` registra o tratamento de volume. Refazer o tratamento a partir do áudio bruto exige o WAV original, com 3 segundos de silêncio antes e 3 depois, como documentado em `qa/provenance.json`. O WAV bruto e os masters sem compressão ficam fora do pacote. O player e a exportação de vídeo usam a mixagem final já incluída, sem APIs nem chaves.

Chaves, dependências instaladas e arquivos temporários não entram no Git nem no ZIP.
