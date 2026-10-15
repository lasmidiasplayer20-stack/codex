# Fluxo em partes

## Análise

Leia metadados da referência. Anote uma linha do tempo global antes de escrever animação: entradas, saídas, mudanças de postura, golpes, objetos, cortes de câmera, efeitos e áudio. Não confunda uma lanterna/câmera com uma lâmina apenas pela primeira silhueta.

Use quadros espaçados para entender a sequência e intervalos de 1/24 a 1/12 s ao redor de ações rápidas. Isso serve à observação e à autoria de poses; não gere contornos ou texturas a partir desses quadros.

## Organização

```text
videos/nome-da-referencia/
  core/                 rig, materiais, props e desenho reutilizável
  parts/manifest.json   início, fim e estado de cada parte
  parts/01-.../         poses, direção, trilha do trecho
  parts/02-.../         próxima coreografia
  exports/              MP4s e código para entrega
  scripts/              render, inspeção e montagem
```

Prefira cinco partes quando isso se ajustar às ações, sem interromper um contato no meio. Os limites devem cobrir todo o vídeo sem lacunas. Converta limites para índices de frame na montagem para não acumular quadros por arredondamento decimal.

## Iteração

Faça um estudo curto de locomoção e das ações mais difíceis. Corrija proporções, apoios e juntas antes de renderizar minutos. Durante uma correção local, compare quadros anteriores para garantir que uma mudança no núcleo não alterou partes já entregues. Não reutilize poses inferidas de uma versão rejeitada como se fossem observações da referência.

Ao terminar uma parte, exporte o MP4, confira leitura e áudio, examine sequências ao redor dos eventos rápidos, disponibilize o link e continue a próxima. Publique versões com nomes distintos, sem sobrescrever a prévia anterior.

## Montagem

Some as contagens de frames de cada parte. Concatene apenas o vídeo, com durações explícitas por frame, e aplique a trilha original uma vez. AAC cortado pode conter preroll com timestamps negativos: não confunda esses pacotes com áudio válido perdido. Confira os hashes dos pacotes preservados e seu alinhamento.

Faça uma decodificação completa com FFmpeg e verifique o último frame/cartela. Registre tamanho e SHA-256 dos arquivos entregues e verifique o download pelos mesmos links que serão enviados ao usuário.
