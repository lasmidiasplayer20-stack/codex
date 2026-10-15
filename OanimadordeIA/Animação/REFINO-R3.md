# Revisão R3 — refino após consulta à referência

## Resultado

Referência recebida: `YTDown.com_YouTube_Media_IsA2bXWLyxA_Animation-vs-math-6-alanbecker-Fan-made-by-Octovex_001_1080p.mp4`.

É o mesmo conteúdo do vídeo de 1:34,60 usado na reconstrução. As cenas foram conferidas e todos os 4.074 pacotes AAC e seus timestamps coincidem com a montagem anterior. Os bytes do contêiner diferem da cópia do WhatsApp. O original tem 24 fps; a reconstrução por código é exportada a 60 fps. A referência não foi incorporada ao renderizador nem publicada.

## Refino por parte

| Parte | Revisão nesta montagem | Trabalho |
|---|---|---|
| 1 | R2 preservada | Abertura, avanço, corte, bloqueio, desarme e saída do vermelho consultados na referência. Mantida a versão anterior. |
| 2 | R1 preservada | Mantidos entrada, desequilíbrio, exame, confronto, feixe e queda. |
| 3 | R3 | Melhor definido o bloqueio perto de 48,5 s, com mão em contato com a arma e breve efeito de contato. Acrescentados giro, recuperação e guarda. A pose do laranja mantém o aro circular e os comprimentos dos segmentos de tronco. |
| 4 | R3 | Restituídos floreios entre 65,6 e 67,5 s, impacto com a ponta do cabo, inclinação e recuperação do vermelho. Adiado o close e corrigida sua escala. Preparações com os braços acima da cabeça precedem os golpes metálicos de 72,583 e 73,583 s. |
| 5 | R2 preservada | Mantidas as correções da cabeça e do tronco, a chegada do azul e o final. |

As versões anteriores continuam disponíveis. Esta R3 usa os mesmos intervalos das cinco partes; nenhum trecho foi eliminado.

## Conferência visual e técnica

Foram examinados quadros e sequências extraídos, inclusive em intervalos de 1/12 s nos floreios e golpes. Não se afirma reprodução visual idêntica quadro a quadro. O método permanece desenho por Canvas e coreografia de um rig próprio; não usa vídeo como fundo, imagens de quadros, máscaras, contornos vetorizados ou optical flow.

- O bloqueio de 48,5 s tem distância zero entre a mão e o ponto de contato definido na arma, sem erro de alcance.
- A ponta do cabo alcança a cabeça em 67,5 s. A cabeça metálica permanece acima: são partes diferentes da arma.
- Os dois impactos metálicos posteriores mantêm contato com o alvo. As preparações de 72,5, 73,125 e 73,5 s têm as mãos acima da cabeça.
- A câmera permanece no plano aberto em 67,5 s e passa ao plano médio depois, conforme as sequências consultadas.
- As partes 3 e 4 foram verificadas a 60 fps: 1.085 e 1.180 quadros, com comprimentos constantes dos membros, comprimentos constantes dos segmentos da espinha, apoio dos pés e empunhadura. As regressões da cabeça e do tronco continuam passando.
- A montagem é decodificada por inteiro, contém 5.676 quadros, dura 94,6 s e preserva os 4.074 pacotes AAC e seus timestamps. Cada quadro decodificado é comparado com a respectiva parte exportada; os trechos 1, 2 e 5 mantêm os vídeos anteriores.

Relatórios: `exports/refino-r3-validation.json`, `rig-validation-03-r3.json`, `rig-validation-04-r3.json`, `head-torso-regression-r3.json`, `reference-validation-r3.json` e `full-export-validation-r3.json`.

## Limites

Ainda existem diferenças de proporções projetadas, trajetórias intermediárias, cenário e materiais em relação à referência. Esta revisão restitui e melhora as ações especificadas; não certifica equivalência visual ou física de todos os frames. O dano da cabeça foi estilizado para preservar a leitura do aro, conforme o pedido de evitar a aparência amassada.

## Reproduzir

Requisitos: Node, Chromium, FFmpeg e as dependências do `package-lock.json`.

```
npm ci
node scripts/check-refino-r3.mjs
node scripts/inspect-part.mjs 03
node scripts/inspect-part.mjs 04
node render.mjs --part 03 --output exports/parte-03-previa-r3-1080p60.mp4
node render.mjs --part 04 --output exports/parte-04-previa-r3-1080p60.mp4
python scripts/assemble-refino-r3.py
```

O ZIP contém código, trilhas dos trechos e relatórios, sem os MP4s. A montagem usa os MP4s das partes disponíveis no repositório e copia o áudio da montagem R1, que foi conferido contra a referência reenviada.
