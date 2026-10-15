# Revisão R5 — interação final entre azul e vermelho

## Alterações

A sequência final foi consultada no MP4 original, com quadros a cada 1/12 s
entre 90,083 e 92,417 s e amostras da chegada do azul e da saída da arma.
O gesto de recusa não existia na R4: o vermelho ficava parado nesse intervalo.

- O azul termina a aproximação junto ao vermelho, inclina o corpo para perto
e depois leva as mãos à cabeça, antes do passeio da câmera pelo cenário.
- No retorno da câmera, o vermelho faz duas oscilações de cabeça entre cerca
de 90,5 e 91,6 s. A rotação passa pelo pescoço; o tronco, os pés e as mãos que
seguram a arma permanecem estáveis durante a recusa.
- O rig e as proporções do vermelho são os mesmos da R4, preservando a
continuidade com a parte anterior. A recusa movimenta apenas o pescoço.
- A preparação para soltar a arma ocorre em 92,25–92,625 s. Os braços terminam
abaixados em aproximadamente 92,96 s. A cartela mantém o início em 93,708333 s.
- A cabeça amassada do laranja continua presente. As partes 1 a 4 usam os
mesmos vídeos da montagem R4, e as revisões anteriores continuam disponíveis.

## Verificação

`node scripts/check-refino-r5.mjs` verifica as alternâncias laterais da cabeça,
apoios, tronco e arma estáveis durante a recusa; aproximação do
azul, mãos junto à cabeça, saída da arma, braços abaixados e dano persistente.
As oscilações têm três inversões de lado, com deslocamentos laterais de cerca
de −14,08 e +15,17 unidades. Os apoios não apresentam deriva no intervalo.

`node scripts/inspect-part.mjs 05` verifica os 771 quadros: comprimentos dos
ossos constantes, pés no alcance, arma na mão enquanto presente, coordenadas
finitas e nenhuma imagem do vídeo original solicitada pelo renderizador.
Os quadros e as sequências correspondentes foram inspecionados visualmente.

A montagem completa é validada por `python scripts/assemble-refino-r5.py`:
5.676 quadros, 94,6 s, 1920×1080, 60 fps, decodificação integral, comparação de
todos os quadros com as cinco partes e preservação dos 4.074 pacotes AAC e
seus timestamps. Os resultados estão em `exports/*r5*.json`.

A reconstrução continua sendo uma aproximação dirigida por código. Desenho,
materiais, poses intermediárias e proporções entre os rigs das partes ainda
podem diferir da referência. Os testes comprovam as propriedades descritas,
e não igualdade visual de todos os quadros.

## Reproduzir

```
npm ci
node scripts/check-refino-r5.mjs
node scripts/inspect-part.mjs 05
node render.mjs --part 05 --output exports/parte-05-previa-r5-1080p60.mp4
python scripts/assemble-refino-r5.py
```

O ZIP contém código, trilhas e relatórios. Não inclui MP4s nem o vídeo de
referência. As comparações públicas (JPG e GIF animado) usam apenas quadros renderizados da R4 e R5;
os quadros extraídos do original foram usados somente para consulta privada.
