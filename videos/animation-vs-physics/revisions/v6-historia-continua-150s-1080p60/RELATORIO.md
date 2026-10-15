# V6 — história contínua e atuação em tempo próprio

Entrega: **150 segundos, seis partes de 25s, três personagens, 1920×1080, 60fps nativos e 9.000 frames**. Textos visíveis em inglês. As revisões anteriores estão preservadas nas pastas irmãs.

## Mudança de direção

Esta versão reescreve a história em torno de uma entrega: levar o núcleo ao receptor para liberar a saída. Um objeto que cai liga a esteira; a alavanca mal regulada devolve o núcleo ao carrinho; uma frenagem o prende no anel; o resgate permite um segundo lançamento; o mesmo freio causa o susto na ponte. O humor acompanha as tentativas de âmbar e as reações dos amigos. Não há mudança de estação, teleporte de objetos por capítulo ou uso de `TempoV5`. O relógio amostrado é `frame/60`, de 0 a 150s.

## Movimento

A atuação recebe posição, velocidade de deslocamento, pose, direção de olhar e contatos em estado persistente. Há marcha com alternância de apoio, balanço de braços relacionado aos pés, flexão para esforços e aterrissagens, braços estendidos durante viradas e continuidade ao agarrar ou soltar objetos. A interpolação de gestos usa arcos para evitar a passagem abrupta da mão pelo ombro. Mãos no carrinho, no núcleo, nos controles, na alavanca e no resgate são alvos explícitos do IK. O perfil, os comprimentos, o FK e o desenho originais permanecem preservados.

Os testes examinaram **27,000 poses**, em 60 amostras por segundo para cada ator. Erro máximo de comprimento: 1.99e-13; **11,231 amostras de contato** com erro máximo de 2.54e-13. Maior passo do quadril: 6.08 unidades/frame; maior passo de cabeça/mãos/pés: 20.77. Nos limites dos capítulos, comparar amostras a ±10µs produziu diferença máxima de 0.0102 unidades, sem reset.

O maior intervalo com movimento agregado do trio abaixo de 1,5 unidade/frame foi 1.33s. Esta medida detecta pausas do conjunto; não prova que toda atuação é natural ou que o filme será percebido como dinâmico. Há reações e pausas de leitura deliberadas. A coreografia é dirigida por curvas e trajetórias balísticas, sem solver geral de corpos rígidos.

## Revisão audiovisual

Os sete MP4 passaram no FFprobe e em decodificação completa. Cada parte tem 1.500 frames; o filme tem 9.000 frames. Hashes dos frames decodificados confirmam que a montagem preserva exatamente a sequência das seis partes. O filme recebe um master contínuo de 150s, sem concatenação de áudio AAC por capítulo.

Foram amostrados **195 frames codificados**, incluindo os dois lados dos cinco limites de capítulo e nove sequências de movimento com intervalos de 200ms. As folhas `motion-review-01.jpg` a `motion-review-09.jpg` foram examinadas visualmente pelo assistente. São amostras temporais, não inspeção manual de todos os frames. As observações estão em `exports/visual-review-v6.json`.

A trilha é sintetizada, estéreo 48kHz, com música original entre 100 e 120 BPM, 45 eventos de ação e 111 passos. Motor e campo magnético têm camadas sustentadas nos períodos em que funcionam. A medição do AAC está em `exports/audio-analysis-v6.txt`. A avaliação sonora nesta execução foi técnica, por timestamps, decodificação e medidores; não houve escuta humana.

O player de vídeo foi verificado em 150s/1920×1080, com seis botões de capítulo, buscas em 25/50/75/100/125/0s e HTTP 206. O player por código produziu o mesmo frame ao retornar ao mesmo instante. Todos os backups têm hashes verificados; FK, perfil, adaptador e funções de desenho foram comparados byte a byte com as fontes preservadas.

## Reproduzir ou editar

Veja `README.md` e `docs/ROTEIRO-V6.md`. O ZIP contém fontes, players, seis partes, filme, trilha AAC, backups essenciais e relatórios. WAVs regeneráveis ficam separados no repositório. `SHA256SUMS-v6.txt` cobre as fontes e entregas; `ZIP-SHA256.txt` cobre o pacote.
