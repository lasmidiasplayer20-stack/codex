# Entrega V4 — Trio em seis partes

Filme concluído: **150 segundos, 1920×1080, 60 fps nativos, 9.000 frames**, H.264/yuv420p, AAC estéreo a 48 kHz. Seis partes de 25s/1.500 frames, além do MP4 contínuo. A V3 e os arquivos anteriores permanecem na pasta irmã.

## Conteúdo

Preto, ciano e âmbar participam de uma nova história em seis estações: descoberta, alavanca, carga em movimento, gravidade zero, reação em cadeia e passagem em equipe. Há gestos de preparação, saltos com rotação, aterrissagens, reações, apoios de mãos, operação conjunta de manivela e botões, esteira, cabos, mecanismos e uma ponte desdobrável. O cenário tem iluminação, plantas móveis, poeira, sombras, materiais e resposta visual aos eventos.

Os 11 nós e comprimentos do modelo original são preservados em cada personagem. O controlador FK, o perfil, o adaptador histórico e as quatro funções de desenho têm comparação byte a byte com a V3. Os módulos da V4 são novos. A câmera usa 30 planos; os personagens ficam maiores nos planos de contato. As mudanças de estação têm transições explícitas.

## Movimento e testes

`npm test` passou. Foram verificados **27,000 estados de personagem** em amostras a 60 Hz das três trilhas autorais de 120 Hz. Todas as coordenadas e ângulos são finitos; erro máximo de comprimento: 2.13e-13 unidades. Os gestos percorrem arcos em torno das articulações, as viradas têm extensão e abertura dos membros, e o alcance tem aproximação suave à extensão máxima. A maior variação angular medida entre frames é 17.90°. A maior translação do quadril entre frames dentro de uma estação é 4.617 unidades.

Foram conferidas 1764 amostras com contatos de mão explicitamente vinculados aos objetos, com erro máximo 1.61e-13 unidades. O centro mais baixo de um pé ficou em y=808.161, acima do piso y=814, incluindo margem do traço. Caminhadas usam apoio por distância percorrida e balanço dos braços em oposição aos pés. No trecho principal de transporte, pernas e quadril mantêm ao menos 6.179 unidades de distância da face do cubo. Nem toda proximidade entre personagem e objeto é um contato restrito; os momentos com vínculo são definidos no diretor.

O desenho é determinístico: ir ao fim e voltar a um tempo anterior produz o mesmo Canvas. O player MP4 reconheceu 150s/1080p, os seis capítulos, seis buscas no tempo e respostas HTTP 206 de byte range.

## Vídeo e revisão

Os sete MP4 passaram no FFprobe e em **decodificação completa**. Cada parte tem exatamente 1.500 frames e 25s, o filme tem 9.000 frames e 150s; todos começam em zero e contêm AAC estéreo a 48 kHz. O vídeo completo é montado sem recodificar a imagem e usa uma trilha única contínua. Os hashes de **todos os 9.000 frames decodificados** confirmaram que a montagem preserva integralmente os seis vídeos, na ordem, sem perdas ou duplicações.

A revisão inclui 102 frames decodificados do MP4 final, momentos de ação, contatos e os dois lados dos cortes. As seis folhas `revisao-parte-0*.jpg` e a visão geral estão em exports/. As folhas foram examinadas visualmente para enquadramentos, leitura dos personagens, cenário e transições. A checagem visual por amostragem não equivale a inspeção manual dos 9.000 frames.

## Som

Composição e efeitos originais sintetizados com seed 2026101504. São 306 eventos, incluindo passos, quiques, molas, campo de gravidade, mecanismos, impactos e notas de resolução. Os efeitos têm posição estéreo conforme sua origem. Medição do AAC: **−16,8 LUFS integrados, LRA 3,5 LU, pico real −1,3 dBFS**. A verificação sonora foi técnica, por eventos e medidores; não houve avaliação auditiva humana nesta execução.

## Arquivos e limites

O código gera formas e rig no Canvas, sem frames de outro vídeo. Esta é animação autoral dirigida, não um solver físico geral: voos, mecanismos e regras fantásticas são coreografados por tempo absoluto. A história foi expandida para três personagens e 150s conforme o pedido atual; os roteiros antigos de um personagem/125s estão preservados como histórico.

O ZIP contém fonte, dependências declaradas, player, trilha AAC, backups essenciais, seis partes, filme completo e relatórios. WAVs intermediários ficam separados no repositório e podem ser regenerados. SHA-256 por arquivo está em `exports/SHA256SUMS-v4.txt`; os relatórios de vídeo também registram tamanho e hash. A publicação adiciona somente a nova pasta `v4-trio-6-partes-1080p60`.
