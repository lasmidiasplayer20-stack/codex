# Reconstrução procedural 3D — vídeo completo

Projeto independente em Three.js, dirigido a partir do vídeo de referência de 8min45s. O ZIP Cozy Plow foi consultado como referência de volumes arredondados, contornos escuros, sombras em bandas e luz de borda. Cenários e ações seguem o vídeo.

**Esta é uma aproximação 3D dirigida, conforme a escolha feita durante a produção. Não é uma cópia visual exata.** O roteiro autoral contém 131 planos contíguos. Desenhos, proporções, detalhes, textos, cortes e trajetórias diferem da referência. O movimento usa poses procedurais e cinemática inversa; não é captura de movimento nem simulação física geral de tecidos e corpos rígidos.

A faixa de áudio da referência foi preservada para manter a duração e a sincronização de falas, música e efeitos. A parte visual é renderizada de malhas 3D geradas por código. O renderizador não abre o vídeo original nem usa seus quadros como cenário, textura, máscara ou sobreposição. As texturas dos textos e gráficos são desenhadas localmente por código.

## Entrega

- `../../vídeos/clone-3d-completo.mp4`: filme inteiro, H.264/AAC, 640 × 360, 30 fps, aproximadamente 525,4 s. A resolução acompanha a referência recebida.
- `src/rig.js`: personagem, articulações, IK de dois segmentos, passos com fase de apoio, poses e shader cartoon.
- `src/world.js`: cenários, móveis, máquina, veículos, documentos e textos procedurais.
- `src/timeline.js`: roteiro de 131 planos cobrindo todo o intervalo.
- `src/main.js`: direção dos personagens, câmeras, adereços, efeitos e avaliação determinística por tempo.
- `audio/reference.m4a`: trilha extraída do arquivo recebido, sem cortes.
- `analysis/reference.json`: metadados e SHA-256 da referência.
- `analysis/cut-candidates.json`: candidatos automáticos a corte; são observações da análise, não o roteiro final.
- `analysis/validation.json`: resultado dos testes técnicos. Esses testes não demonstram fidelidade visual quadro a quadro.

## Reproduzir

Requisitos: Node.js 22+, npm, FFmpeg/FFprobe e Chromium. A exportação funciona sem GPU dedicada, usando SwiftShader. Não exige API ou credenciais externas.

Use o checkout existente: as tarefas de nuvem já têm isolamento; não crie um Git worktree para executar este projeto.

```sh
cd /workspace/codex/clone/projetos/clone-video
npm ci --cache /tmp/clone-npm-cache --ignore-scripts --no-audit --no-fund
npm run check
npm run dev
```

O servidor escuta localmente na porta 3000. Seu processo precisa ser reiniciado em uma nova tarefa. No player, espaço pausa e as setas avançam/recuam cinco segundos. `CHROMIUM_PATH` seleciona outro binário Chromium quando necessário.

Exportação completa:

```sh
npm run render -- --width=640 --fps=30
```

Trecho de revisão fora da pasta de entrega:

```sh
npm run render -- --start=247 --duration=5 --width=640 --output=/tmp/clone-revisao.mp4
```

Imagem de revisão:

```sh
npm run render -- --start=245 --width=960 --still=/tmp/clone-quadro.png
```

O MP4 é codificado a partir dos quadros do WebGL; o comando retorna erro se o navegador ou o codificador falhar. A pasta `clone/vídeos` deve conter somente o filme completo. Amostras e diagnósticos são gravados em `/tmp` ou `analysis`.

## Validação e limites

`npm run check` verifica a cobertura contínua do roteiro, 2.000 casos de IK com comprimentos constantes, valores finitos das articulações e renderização no início, meio e fim dos 131 planos. Também produz imagens locais de revisão em `analysis/review`, ignoradas pelo Git. O silêncio preto entre o acidente e o hospital faz parte do roteiro.

A câmera e as ações são reconstruídas por direção manual e funções de tempo; precisam de revisão artística se for necessária correspondência mais estreita com cada gesto da referência. As roupas têm volumes rígidos estilizados, sem dobras de tecido simuladas. A avaliação determinística permite renderizar qualquer instante sem depender de simular todos os quadros anteriores.

## Dependências

Three.js 0.180.0 (MIT) e Playwright 1.56.1 (Apache-2.0), fixados em `package-lock.json`. O ZIP de referência não é necessário para executar o projeto. A referência audiovisual e sua trilha continuam pertencendo aos respectivos titulares; a inclusão da faixa decorre do arquivo fornecido para esta tarefa.
