# Produção autoral — Andar ou correr na chuva?

Esta versão foi criada neste trabalho com a narração fornecida, o tutorial “Criei 60 vídeos virais…” e o vídeo de exemplo enviado. Não utiliza o filme nem o renderizador de `codex-2`.

## Referências e adaptação

O tutorial orienta a construção gradual de personagens, objetos, cenários, roteiro, sincronização da voz e revisão por trechos. O exemplo orienta a alternância entre personagens, comparações e explicações, com planos gerais, aproximações e movimentos de câmera. Não há imagens extraídas, vídeo de fundo ou rastreamento de pixels das referências no renderizador.

A proposta própria tem 57 planos e dois personagens com cabeça escura, olhos claros e roupas amarela/ciano. As cenas de rua usam geometria 3D, articulação calculada, iluminação, chuva determinística e câmera em perspectiva. Os diagramas didáticos e as legendas são desenhados em Canvas. A combinação é uma adaptação da linguagem do exemplo, não uma cópia exata da animação.

A narração não é substituída. A transcrição serve para marcar cenas e legendas. A trilha reúne ruído de chuva, passos e efeitos sintetizados em Python/NumPy. Não usa áudio de biblioteca nem solicita novas credenciais.

## Revisões realizadas

- A história foi organizada ao redor da física da chuva: tempo, distância, duas superfícies, vento, poças, tecidos e controle experimental.
- Foram corrigidos contraste, enquadramento, tamanho de cartões e erros evidentes de escrita da transcrição.
- A arquitetura 3D foi agrupada por material para reduzir custo de renderização.
- O Canvas usa leitura frequente e composição por CPU para a exportação offline.
- A exportação tem gráficos e texto em 1920 × 1080, com as cenas 3D calculadas em 1280 × 720 e compostas nesse quadro.

As comparações de volume e a curva são qualitativas. Os números explícitos de tempo correspondem ao exemplo de 100 m a 1,25 m/s e 4 m/s. Não são medições de uma experiência filmada. A narração fornecida contém os limites do modelo e os cuidados com segurança.

## Reproduzir

1. Instale Node >=22, Chromium, FFmpeg, Python 3 e as dependências de `requirements.txt`.
2. Execute `npm ci` dentro de `project/`.
3. Rode `python3 generate_sfx.py` e `python3 mix_audio.py` na raiz deste projeto.
4. Rode `python3 render_all.py` para gerar quatro partes de 120 segundos, com dois processos em paralelo.
5. Rode `bash assemble.sh` para montar o MP4 1080p com áudio.

O renderizador aceita `CHROMIUM_PATH` e `PLAYWRIGHT_MODULE`. Em sistemas sem `/usr/bin/chromium`, defina o caminho do navegador instalado. Os arquivos intermediários de renderização devem permanecer fora dos diretórios de filmes entregues.

Para abrir o player, sirva esta pasta com `python3 -m http.server 8000` e abra `project/index.html`. A busca e a reprodução do áudio controlam a posição da animação.

## Conferência

A produção registra tempos, contagem de quadros e erros de página por parte. A exportação final deve passar por FFprobe e por decodificação integral de vídeo e áudio. A inspeção por quadros e os checks automatizados não equivalem à revisão humana de cada frame ou à escuta humana completa.
