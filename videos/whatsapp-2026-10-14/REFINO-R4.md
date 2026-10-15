# Revisão R4 — cabeça amassada e cutucada em pé

## Alterações

- A pancada em 48,833 s passou a tocar a cabeça do laranja com a parte metálica da arma. A deformação aparece no impacto e permanece depois dele.
- O contorno da cabeça é uma forma paramétrica escrita à mão. A deformação acompanha a rotação do rosto durante a queda e a reação ao pé. As marcas faciais acompanham a superfície deformada. Não se escala o corpo nem se altera o comprimento dos ossos para produzir esse efeito.
- A aproximação foi ajustada para o vermelho estar junto do laranja ao iniciar a cutucada. Entre 55,333 e 55,833 s, ele permanece com o tronco vertical e uma perna apoiada. A perna levantada acompanha a superfície da cabeça por cinemática inversa.
- A cabeça do laranja reage pelo pescoço mantendo o tronco próximo do apoio. O pé retorna ao chão após o toque. A ação posterior de se abaixar foi preservada como outro movimento.
- As partes 4 e 5 conservam a deformação recebida na parte 3. O restante da coreografia e os cortes da R3 foram mantidos.
- As partes 1 e 2 usam os vídeos anteriores, sem alterações. As versões R1, R2 e R3 permanecem no repositório.

## Verificação

A referência foi consultada em sequências de 1/24 s perto da pancada e 1/12 s perto da cutucada. Foram examinados quadros e sequências da reconstrução. A obra continua sendo uma aproximação dirigida por código, com diferenças de materiais, desenho e poses intermediárias.

`node scripts/check-refino-r4.mjs` confirma:

- cabeça circular antes do golpe e deformação após o contato metálico;
- deformação persistente nas partes seguintes;
- contato exato entre o pé levantado e a superfície da cabeça durante a reação;
- nenhuma deriva do pé de apoio no intervalo verificado;
- tronco vertical, cabeça elevada e pelvis acima da posição de agachamento durante a cutucada;
- coordenadas finitas e renderização das partes seguintes.

As três partes foram verificadas a 60 fps: 1.085, 1.180 e 771 quadros. Os comprimentos dos ossos e dos segmentos da espinha permanecem constantes, os apoios ficam no alcance e a arma permanece na mão. Os testes de contatos e câmera da R3 também passaram.

A montagem completa contém 5.676 quadros, 94,6 s, 1920×1080 a 60 fps. A validação decodifica o arquivo inteiro, compara todos os quadros com as partes correspondentes e verifica os 4.074 pacotes AAC e seus timestamps contra a montagem anterior, já conferida com a referência.

## Reproduzir

```
npm ci
node scripts/check-refino-r4.mjs
node scripts/inspect-part.mjs 03
node scripts/inspect-part.mjs 04
node scripts/inspect-part.mjs 05
node render.mjs --part 03 --output exports/parte-03-previa-r4-1080p60.mp4
node render.mjs --part 04 --output exports/parte-04-previa-r4-1080p60.mp4
node render.mjs --part 05 --output exports/parte-05-previa-r4-1080p60.mp4
python scripts/assemble-refino-r4.py
```

O pacote contém código, trilhas e relatórios. Os MP4s e a referência original não estão no ZIP. A referência não foi publicada nem usada como imagem, máscara ou camada do renderizador.
