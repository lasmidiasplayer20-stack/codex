# V5 — ritmo rápido e situações cômicas

Entrega: **78 segundos, seis partes de 13s, três personagens, 1920×1080, 60 fps nativos e 4.680 frames**. Todos os textos visíveis no vídeo e nos players estão em inglês. A V4 permanece na pasta irmã.

## Resposta à crítica de ritmo

A V4 tinha 150s; esta versão tem 78s, uma redução de 48%, apesar de acrescentar 26,4s de coreografias novas. O timing das ações principais foi refeito com um mapa de tempo; os seis blocos foram renderizados novamente por código. Não se acelerou o vídeo antigo. Não há fades demorados entre capítulos. As pausas são curtas e servem à preparação e à reação das piadas.

A comparação a 60 Hz mede o deslocamento médio do quadril, cabeça, mãos e pés dos três personagens, excluindo saltos de cena. V4: 34.22 unidades/s. V5: 114.54 unidades/s — **3.35×**. A fração do filme acima do limiar de movimento de 20 unidades/s subiu de 63.8% para 91.2%. O maior trecho abaixo desse limiar caiu de 6.13s para **0.83s**. Essas medidas ajudam a detectar lentidão; não substituem a avaliação subjetiva de quem assiste.

## Novas situações

1. **Don't touch that!** — luva com mola, esquiva do ciano, voo do âmbar e retorno da esfera para atrapalhar o preto.
2. **Wrong way up** — gangorra causa lançamentos duplos; preto e âmbar giram e aterrissam em sequência.
3. **No brakes!** — o cubo ganha rodas, dispara e inverte; ciano tenta se equilibrar na carga e os outros correm ou saltam para escapar.
4. **Zero gravity, big sneeze** — espirro lança o trio, tensiona o cabo e provoca reações com mola e aterrissagens escalonadas.
5. **Multiball trouble** — três bolas circulam pelo grupo, gerando esquivas e um impacto final.
6. **Perfectly normal.** — a comemoração é interrompida por um pato de borracha na cabeça do preto, com tentativas de se livrar dele, reações dos colegas e quack final.

Há **36 eventos cômicos novos**, 374 eventos sonoros no total e música original entre 152 e 178 BPM. Impactos, motor, catraca, espirro, quique, borracha e quack são sintetizados. Medição do AAC: −16,1 LUFS, LRA 3,0 LU e pico real −1,3 dBFS. A verificação sonora foi por eventos e medidores; não houve avaliação auditiva humana nesta execução.

## Movimento e revisão temporal

`npm test` passou: 14040 poses a 60 Hz, coordenadas finitas, erro máximo de comprimento de 2.34e-13 unidades e 630 amostras de contato com erro máximo de 1.61e-13. Maior deslocamento do quadril entre frames dentro da estação: 16.59 unidades. Maior variação angular medida: 54.79°. Os gestos muito rápidos recebem um acompanhamento angular de 33ms nos braços, preservando os trechos de contato. Os nós e comprimentos originais permanecem fixos.

Foram revistos **227 frames decodificados**, os dois lados dos cortes e seis sequências densas de piada. `sequencia-comica-0*.jpg` documenta preparação, impulso e reação em intervalos curtos. Houve também uma prévia em 960×540/60fps para estudar o timing da primeira piada. As folhas foram examinadas visualmente pelo assistente; isso é revisão por amostragem, não inspeção manual de todos os frames.

O player MP4 passou em 78s/1080p, seis capítulos, seis buscas no tempo e HTTP 206. Os sete MP4 passaram no FFprobe e em decodificação completa. As partes têm 780 frames/13s; o filme tem 4.680 frames/78s. Os hashes de **todos os frames** confirmam que a montagem preserva a sequência exata das seis partes. O som do filme usa um master contínuo.

## Arquivos e limites

O ZIP inclui fontes, player, trilha AAC, seis partes, filme completo, backups essenciais e relatórios. WAVs regeneráveis ficam separados no repositório. Há SHA-256 por arquivo e hash do ZIP. O FK, o perfil e as funções originais de desenho foram comparados byte a byte; os backups da V3 e da V4 têm hashes preservados.

As ações fantásticas são coreografadas por tempo absoluto, com IK/FK e cenário geométrico; não é um solver geral de corpos rígidos. As estações mudam por cortes explícitos. Os textos de edição estão em português; os textos que aparecem nos players e no vídeo estão em inglês.
