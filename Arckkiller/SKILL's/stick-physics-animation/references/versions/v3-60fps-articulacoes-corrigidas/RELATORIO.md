# Animation vs. Physics — V3 · relatório de entrega

O filme final foi renderizado e validado: **1920 × 1080, 60 fps, 125 segundos e 7.500 frames**, H.264 yuv420p com AAC estéreo a 48 kHz. O vídeo começa em 0,000 s e termina em 125,000 s. As três partes foram renderizadas no mesmo relógio absoluto e montadas sem recodificar a imagem. O áudio completo recebe uma codificação contínua, sem juntar o atraso de AAC de cada parte.

## Correções pedidas durante a revisão

Os dois braços usavam lados diferentes do solver de IK, independentemente da orientação do corpo. Além disso, o balanço das mãos não acompanhava a inversão da caminhada. A V3 corrige cotovelos e joelhos pelo sentido corporal, faz as mãos se oporem aos pés efetivos da passada e usa uma extensão breve e aberta dos membros nas viradas. Os membros não trocam de identidade e seus comprimentos não mudam.

Foram verificados os **15.001 estados** da simulação: nenhuma dobra de braço ou perna no sentido indevido. A maior mudança local de cotovelo/joelho nas janelas das viradas foi 5.35 px por passo de 1/120 s. A correlação entre deslocamento da mão e do pé correspondente ficou em -1.0000 ao caminhar à direita e -0.9999 à esquerda; os sinais negativos confirmam a alternância.

O personagem ganhou planos principais cerca de 32% mais próximos do que na primeira passagem da V3. A aproximação respeita os limites de enquadramento. O mundo e os comprimentos do boneco permanecem constantes; os inserts de contato e reação têm recortes intencionais. O teste de direção não encontrou recortes involuntários dos nós exigidos em cada tipo de plano.

## Cenário, atuação e som

O ambiente ganhou painéis translúcidos, camadas de luz e poeira, arcos de medição, piso em perspectiva, sombras e reflexos de energia. Esfera e cubo têm materiais próprios. Ondas, faíscas e respostas do piso acompanham os impactos. As mudanças de cor da esfera são contínuas. Respiração, atraso da cabeça, recuperação dos gestos e reações amortecidas complementam a atuação herdada da V2.

A composição instrumental foi ressincronizada com os eventos físicos da V3 e recebeu texturas espaciais de gelo, ar, atrito do cubo e energia. Permanecem os silêncios cômicos. Não há falas ou narração. O AAC final foi medido em aproximadamente −17,2 LUFS, LRA 12,3 LU e pico verdadeiro −1,4 dBFS. O PCM possui 6.000.000 amostras por canal.

## Arquivos por parte

| Arquivo | Frames | Duração |
| --- | ---: | ---: |
| parte-01-descoberta-1080p60.mp4 | 1800 | 30 s |
| parte-02-leis-enlouquecem-1080p60.mp4 | 2700 | 45 s |
| parte-03-confronto-final-1080p60.mp4 | 3000 | 50 s |

As três partes e o filme completo passaram por FFprobe e decodificação integral. A revisão do MP4 final extraiu **194 frames**, cobrindo os 25 takes, limites dos takes/câmeras e amostras densas das ações rápidas. O último frame tem RGB máximo 1; o flash tem RGB mínimo 253.

## Física e preservação

Os testes de história, determinismo, contatos, direção e membros passaram. O maior erro de comprimento foi 8.88e-13 px; o maior erro dos contatos travados foi 1.42e-14 px. A maior penetração amostrada nos planos foi 0.5858 px, abaixo da tolerância de 1 px.

O controlador, o perfil de proporções, os 11 nós e as quatro funções originais de desenho foram preservados. As fontes V1/V2 e os templates permanecem em `preserved/`, com hashes. Os vídeos de entrada foram baixados e analisados; seus hashes estão em `preserved/source-videos.json`, e suas versões continuam no repositório de origem. Não há frames de vídeos anteriores dentro do renderer da V3.

## Edição e limites

O personagem usa articulações e contatos simples; não é uma simulação anatômica de tecido mole. A superelasticidade e a resposta invertida do cubo são regras coreografadas da história. A decoração e a luz não acrescentam colisores. A reprodução foi verificada com Node 24, Chromium 154 e FFmpeg 7.1.5 no ambiente de nuvem.

O player HTML também foi testado: duração e resolução corretas, navegação para 30 s, 75 s e retorno a 0 s, suporte a requisições parciais HTTP e nenhum erro de página.

O ZIP editável inclui fontes, áudio AAC pronto, testes, backups, relatórios e o filme completo. O WAV regenerável está disponível separadamente nesta pasta do repositório, fora do ZIP, para respeitar o limite por arquivo do GitHub. As três partes também são entregues separadamente. `assistir.html` abre o MP4; `index.html` abre o player por código. `npm run render:parts` reproduz o pipeline. Os roteiros históricos de 24 fps foram preservados como referência; esta revisão atende ao pedido atual de 60 fps.

SHA-256 do filme completo: `0b4cc387f708dd2145a55f5bf96818db5983ae20e673460270cdb30724656492`.
