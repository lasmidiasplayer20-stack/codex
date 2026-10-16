# Validação do kit

Validado em ambiente isolado fora do checkout original, com Node 24, Python 3.12, Chromium e FFmpeg. Os arquivos de personagem dos exemplos permanecem byte a byte iguais aos commits de origem; os sons conservam seus manifestos.

## Verificações executadas

- Extração do ZIP em uma pasta independente e verificação de todos os caminhos/tamanhos/hashes do manifesto.
- Criação de projetos nos modos original e referência visual; ambos são marcados explicitamente como exemplos ainda contendo a coreografia demonstrativa.
- Instalação Node pelo lockfile em projeto independente. Uma tentativa offline inicial encontrou cache incompleto; a instalação normal funcionou usando um cache gravável, e as seguintes instalações offline passaram.
- Testes da demonstração de 150s: 27.000 poses, 37.685 contatos, finitude, comprimentos de bones, contatos, continuidade, alcance dos pés, enquadramento e separação das cabeças.
- Variação técnica do exemplo para 8s, 30fps e dois capítulos de 4s: 720 poses, 1.046 contatos e duração/capítulos derivados da história. Essa variação foi uma amostra de infraestrutura, não uma história nova.
- Renderização real de dois trechos, mixagem com os sons existentes, montagem de MP4 com 240 frames a 640×360 / 30fps / 8s e AAC estéreo 48kHz. Decodificação integral sem erro.
- Players: carregamento do filme configurado, Play/Pause, seeks nos dois capítulos e HTTP 206 para 1024 bytes.
- Extração de três quadros da referência V6, com timestamps e metadados de duração/FPS; geração de 20 amostras decodificadas de revisão no filme de teste.
- Manifestos completos para as duas edições do ZIP, checksum externo e busca por cópias da credencial conhecida antes do empacotamento.

## Limites concretos

A ferramenta cria um projeto executável a partir de um exemplo; não escreve a nova história automaticamente. Alterar a duração do pedido não retima a coreografia antiga: a IA precisa implementar a linha do tempo, atuação, câmera e bindings do novo roteiro.

Os testes de geometria e a extração de quadros não demonstram humor, naturalidade ou fidelidade em todos os frames. Não foi alegada reprodução humana integral nem audição humana. As ferramentas antigas de captura dentro dos arquivos históricos foram preservadas para referência e não constituem o novo fluxo padrão validado. A nova geração ElevenLabs não foi testada neste empacotamento; os efeitos existentes são reutilizáveis com sua proveniência. A skill não foi instalada automaticamente no cliente.

A edição completa inclui os dois filmes completos. A leve contém as mesmas fontes, ferramentas, sons e imagens de referência/revisão; seus manifestos apontam para os MP4s externos omitidos. Os filmes de teste e as dependências instaladas não entram nos ZIPs.
