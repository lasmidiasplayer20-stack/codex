# Refino visual R2 — 15/10/2026

## Correções feitas

- Parte 4: removidas as dobras de espinha de 50° a 120° do vermelho. As reações usam o ângulo do corpo inteiro, com tronco de comprimento constante.
- Parte 5: removidas as dobras persistentes de 65° a 80° do vermelho, incluindo o plano final. Mantidos os tempos e os alvos de mãos e pés. O ajuste de apoio do rig pode alterar a posição projetada do corpo.
- Partes 4 e 5: substituído o preenchimento irregular que invadia a cabeça oca do laranja por marcas restritas ao aro. O círculo, o corte no rosto e os respingos existentes permanecem.
- Partes 1 a 3: preservadas integralmente nesta prévia. Nenhum movimento novo foi acrescentado sem a referência.

## Verificação

Foram examinados quadros e sequências, incluindo os golpes rápidos e os closes; não foi feita avaliação de reprodução lado a lado com a referência, que está ausente.

O teste `node scripts/check-refino-r2.mjs` percorre 1.180 quadros da parte 4 e 771 da parte 5. Confere tronco sem colapso, comprimentos de braços/pernas, coordenadas finitas e empunhadura. A camada de dano não muda pixels na área central da cabeça oca. Os contatos metálicos existentes em 1:12,583 e 1:13,583 foram preservados. Os relatórios geométricos anteriores não certificavam a fidelidade dos golpes.

A montagem copia o vídeo de cada parte, preserva os 4.074 pacotes AAC da montagem R1 e seus timestamps e é decodificada integralmente. O relatório `exports/full-export-validation-r2.json` compara todos os quadros decodificados de cada trecho com a montagem, incluindo as partes 1 a 3 sem alterações. Formato: 1:34,60, 5.676 quadros, 1920×1080, 60 fps.

## Pendências para continuar

O arquivo de referência esperado é `WhatsApp Video 2026-10-14 at 10.28.28.mp4`, SHA-256 `e2147274a9188c4d5ad9d420a0382c0c8ce509e00a6e00d05ebd03750866b866`. Ele não está no repositório nem nos anexos disponíveis nesta sessão. É necessário reenviá-lo para comparar a coreografia das cinco partes e identificar os ataques, bloqueios e reações que faltam.

Na primeira sequência de giro da parte 4, entre 1:05,7 e 1:07,5, a cabeça metálica da arma não toca a cabeça do laranja na coreografia atual: a menor distância até o centro é aproximadamente 91,24 unidades para um raio de 31,8. O movimento e sua intenção precisam ser conferidos na referência. Este ponto não foi certificado como corrigido.

Esta revisão não é aprovação final de fidelidade ao original. As versões R1 e anteriores permanecem no repositório.

## Reproduzir

Execute `npm ci` em um ambiente com acesso ao registro. Requisitos: Node, Chromium e FFmpeg.

```
node scripts/check-refino-r2.mjs
node render.mjs --part 04 --output exports/parte-04-previa-r2-1080p60.mp4
node render.mjs --part 05 --output exports/parte-05-previa-r2-1080p60.mp4
python scripts/assemble-refino-r2.py
```

A montagem usa a trilha já preservada em `exports/video-completo-previa-r1-1080p60.mp4`, sem precisar do original para muxar o áudio. Isso não substitui a referência para revisão dos movimentos.
