# IQ 10 vezes maior — reconstrução 3D e rastreamento

[Assistir à prévia de 1 minuto](previas/preview-60s-720p60.mp4) · [Abrir o projeto](editor.html) · [Rastreamento completo](rastreamento.html) · [Skill de recriação](skill/SKILL.md)

**Estado:** o rastreamento automático cobre os **15.759 quadros do original**, de 8min45s. O primeiro minuto tem **36 takes com revisão editorial** e uma prévia 3D editável, com áudio original. A reconstrução ainda é preliminar: cenários, gestos, encenação e câmera precisam de comparação e refinamento para atingir a fidelidade solicitada. O teste do rig não equivale a aprovação de semelhança. Os 7min45s restantes ainda não foram reconstruídos em 3D.

A referência de conteúdo é `videoplayback (13).mp4`: 640×360, 30 fps, 525,300 s de imagem e 525,397914 s com o áudio. O ZIP `3d-cozy-snow-plow-game.zip` fornece o acabamento visual: cel shading, contornos, luz quente, sombras frias e retícula. Seus cenários, animais e movimentos de jogo não foram usados. O MP4 original e o ZIP não estão incluídos.

## Ver e editar

Requer Node.js 22 ou mais recente. Execute `npm run serve` nesta pasta e abra `http://127.0.0.1:8080`. O player inicial mostra o MP4 exportado; o link «Cena 3D editável» abre a renderização ao vivo e o link de rastreamento abre as medições de todo o original.

No rastreamento, escolha opcionalmente seu MP4 original local. Ele fica no navegador, sem upload. Os dados são carregados por trecho, com os pontos e vetores sobrepostos à imagem. Sem o original, é possível examinar as trajetórias sobre uma grade. A reprodução da prévia exportada funciona diretamente no player do MP4.

- `src/scene.js`: personagens, objetos, locais e rig de duas articulações por membro.
- `src/timeline.js`: os 36 takes revisados do primeiro minuto, com limites em quadros.
- `src/staging.js`: posicionamento das câmeras por plano.
- `src/reference-fit.js`: ajuste à observação de cabeças e candidatos a mãos; interpolações a 60 fps.
- `src/materials.js`: acabamento adaptado do ZIP, com correção da transformação das normais.
- `src/compositor.js`: transições procedurais e máscaras de pálpebras medidas no original.
- `tracking/calibration-first-minute.json`: observações usadas pela prévia, sem quadros rasterizados do vídeo.

Em falhas curtas de detecção, a câmera continua pelo movimento medido do fundo e mantém o último ajuste válido do personagem. Esses quadros são previstos, não novas observações.

Os membros escuros ficam na profundidade de trás do rig. As pernas mantêm comprimentos constantes, os pés usam fases de apoio/balanço e os objetos de mão seguem a transformação da mão. O paciente se inclina a partir da pelve, em vez de girar todo o corpo em torno dos pés. Estes controles evitam erros estruturais, mas os contatos com o cenário e o movimento em relação ao original ainda precisam de revisão visual.

## Exportar novamente

Instale FFmpeg, execute `npm install` e `npx playwright install chromium`. Depois:

```bash
npm run audit
npm run export -- /caminho/para/videoplayback.mp4
```

Se usar um Chromium já instalado, defina `CHROMIUM` com o executável. A exportação contém 3.600 quadros, 1280×720, 60 fps, H.264 e áudio AAC copiado do original, sem alteração de velocidade. `scripts/export.mjs` incorpora os primeiros 60 segundos da trilha existente, mantendo narração, música e efeitos. Não é necessária transcrição nem API de áudio.

A reprodução WebGL pode variar ligeiramente entre GPUs. A prévia acompanha o código e permite conferir o resultado exportado.

## O que foi rastreado no vídeo inteiro

Os arquivos numéricos registram cada quadro, o ajuste afim do fundo, confiança e erro, pontos com IDs e movimentos residuais, fluxo óptico denso reduzido a uma grade, iluminação, cabeças detectadas, candidatos de mãos/pés e máscaras pretas conectadas às bordas. Também há eventos de variação de luz e **1.595 ataques de áudio não classificados**; a análise não separou voz, música e efeitos em pistas independentes.

**355 segmentos automáticos são candidatos a takes, não 355 cortes confirmados.** Uma segunda análise fotométrica cobre todos os quadros e aponta outros candidatos. No primeiro minuto, a revisão distinguiu cortes, dissolvências, desfoque horizontal, flash e abertura de pálpebras. Rejeitou, por exemplo, o limpador de para-brisa e a movimentação do paciente como falsos cortes.

O [ZIP editável](projeto-editavel.zip) contém o código, a skill e os dados de calibração do primeiro minuto. O MP4 e os arquivos completos de rastreamento ficam separados para facilitar o download. Para baixar apenas os 7 arquivos de rastreamento depois de extrair o ZIP, execute `python scripts/download_tracking.py`.

A câmera medida é uma transformação **2D** do fundo, não uma solução completa de posição e orientação 3D. As observações de membros são candidatas, com oclusões e lacunas explícitas. Elas não são captura anatômica validada. A prévia utiliza 26 trechos com acompanhamento supervisionado da cabeça principal, além dos dados automáticos.

O índice `tracking/full-index.json` permite buscar cada membro gzip dentro de 7 arquivos binários, preservando os bytes originais e seus hashes SHA-256. Para verificar a integridade e recuperar todos os JSONs:

```bash
python scripts/unpack_tracking.py
```

O resultado fica em `tracking/unpacked/`. Os 15.759 quadros são verificados quanto à ordem e à ausência de lacunas. O CSV de câmera está em `tracking/camera.csv.gz`. Os relatórios de análise e revisão ficam em `tracking/`; os testes da reconstrução, em `qa/`. [Visão geral das medições](tracking/visao-geral.png).

## Recalcular a análise localmente

Instale Python 3.10+, FFmpeg e `pip install -r requirements.txt`. Faça uma cópia do projeto para a nova análise:

```bash
python scripts/track_reference.py --source /caminho/original.mp4 --output tracking
python scripts/refine_labels.py /caminho/original.mp4 tracking
python scripts/review_cuts.py /caminho/original.mp4 tracking
python scripts/review_first_minute.py
python scripts/track_primary_subject.py /caminho/original.mp4
python scripts/pack_tracking.py
```

Os seeds e a revisão editorial fornecidos se referem especificamente a este original. Não devem ser aplicados automaticamente a outro vídeo. O SHA-256 esperado é `b59551464516ad17142246342999d19a05c120c6832aac335e014355067c6604`.

## Próximas revisões de fidelidade

Refinar os elementos dos locais e as proporções em comparação com os quadros originais; revisar individualmente mãos, pés, objetos e oclusões; resolver a câmera 3D por plano; revisar os candidatos a cortes e reconstruir a sequência de 60 s até o fim. A prévia não é o master completo. Apenas o master final deve entrar em `clone/vídeos/`.

A biblioteca Three.js incluída em `vendor/` é distribuída sob sua licença MIT. Os materiais foram adaptados da referência fornecida pelo usuário. Este projeto não atribui uma licença nova ao conteúdo original.
