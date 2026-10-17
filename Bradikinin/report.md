# Relatório de produção

Episódio: **If Your Elevator Shows Your Name, Don't Press It**. Produção em 16/10/2026 (data do cliente, America/Sao_Paulo).

## Inputs e privacidade

O TXT anexado inicia na etapa de verificação de prévia e contém as seções 15–18 e um pedido reutilizável. Foi seguido como guia de produção. O nome de saída e o pedido posterior de 1080p do usuário substituem o nome de exemplo sobre micro-ondas.

O roteiro foi extraído do MP3 anexado por Whisper base.en local, usando sherpa-onnx 1.13.8; as palavras foram alinhadas localmente com PocketSphinx 5.0.4. Nenhum envio de áudio a serviço de transcrição ocorreu. A tentativa de preparar esse envio foi bloqueada antes da execução pela revisão automática; após o usuário optar por processamento local, baixou-se apenas o modelo público. Os hashes dos três inputs constam em `manifests/inputs.json` do projeto. Originais preservados em attachments; a referência não foi usada como fonte de imagem nem de áudio no episódio.

## Resultado e escolhas visuais

55 cenas originais em Canvas 2D: painel, cabine, espelho, carrinho, corredor, etiquetas e encerramento. Fundo preto, figuras brancas, linhas simples, acentos amarelo/vermelho/verde e ruído discreto seguem a linguagem da referência. A encenação mantém os humanos em poses estáveis, com movimentos pequenos de braço. O protagonista permanece dentro da cabine nas vistas do corredor. Não há ragdoll, deformação de tronco ou alongamento de membros.

Final: 1920×1080, 30 fps, 8360 frames, 278.666667 s, 8.95 MiB. O MP3 tem duração de contêiner de 278.648163 s; a fala decodificada cobre 278.597959 s. O mix foi preenchido até a duração de contêiner. A quantização do vídeo em 30 fps explica os milissegundos adicionais. Nenhum fim de fala foi cortado.

## Música e efeitos

Música original sintetizada localmente em Python/NumPy, seed 42017, três stems separados e mix de música. Drone grave e pulsos discretos com fades de entrada/saída. Cinco efeitos ElevenLabs gerados a partir de descrições de texto: campainha, portas, motor, batidas e botão. Consumo informado pelo provedor: **180 créditos**, somados dos cabeçalhos `character-cost`; não se infere cobrança monetária. Sete colocações na timeline reutilizam esses cinco arquivos. Prompts, posições, ganhos e hashes estão nos manifests e nos metadados do cache. Render e mix não fazem novas chamadas pagas.

A voz foi importada uma única vez, sem alteração de velocidade; o vídeo de referência não entra no grafo de áudio. Música e efeitos usam níveis contidos. O mix usa limiter a 0,95, sem ganho automático de normalização. Não houve audição humana integral do mix, portanto não se declara avaliação perceptual completa de clareza ou naturalidade.

## Verificações automáticas executadas

- Todos os 8360 PNGs finais existem, têm dimensões 1920×1080 e pertencem a intervalos semiabertos contíguos, sem cortes duplicados.
- Decodificação integral do MP4 com FFmpeg `-xerror` concluída. Uma única faixa AAC e vídeo H.264/yuv420p a 30 fps.
- Conteúdo claro presente em cada frame: menor pico de luminância amostrado a 480×270 = 210; nenhum frame vazio/preto acidental detectado por esse critério.
- Maior erro numérico no comprimento dos segmentos: 2.13e-14 unidades; alvos IK inalcançáveis: 0.
- Pixels da região dos pés idênticos no começo, meio e fim do gesto de apoio: diferença máxima 0. Esse teste cobre o gesto representativo; não é uma prova geral de anatomia.
- Correlação da voz original com o áudio AAC final em oito trechos: mínimo 0.9503; maior desvio temporal medido 0.000 ms. Isso verifica preservação temporal nesses pontos, sem prometer alinhamento perfeito de todas as palavras das legendas.
- SHA-256 local: `c09734bd9e062110262b5e7389822c2ec731cf9b699a2f9ec030128878e5f95e`.

## Inspeção visual e limites

A folha de contato da referência foi examinada; depois, poses de início/meio/fim e uma sequência densa do gesto de apoio foram inspecionadas visualmente. Corrigiram-se braços em repouso, flexão dos joelhos e o símbolo de pessoa deitada. Foi produzido também um trecho a 960×540 e 30 fps. A prévia entregue tem 14 segundos de dois trechos do MP4 final.

Não houve reprodução audiovisual integral em tempo real. As legendas são uma transcrição automática alinhada localmente e podem conter erros de palavras ou pontuação. A estética é de pictogramas e movimentos contidos; não se promete realismo humano. Os números do teste de IK não constituem aprovação estética ou anatômica por si só.

## Reprodutibilidade e exportação

O ZIP inclui JavaScript, scripts Python, versões, seed, timeline, transcrição/alinhamento, manifests, legendas, efeitos em cache e stems musicais. Exclui o áudio original, o vídeo de referência, mix com voz, modelos, frames temporários, node_modules e segredos. A reprodução com voz requer o MP3 original que o usuário já forneceu. O README do projeto contém comandos implementados e uma orquestração completa sem novas gerações pagas.

A raiz de saída `/codex/browser/projectless/0005-files-mentioned-by-the-user-uploaded-file-pointe/output` não pôde ser criada neste executor (diretório pai sem permissão). Os arquivos foram produzidos em `/workspace/work/output/Bradikinin` para exportação binária ao repositório conectado. O checkout original permanece preservado; usa-se um clone exclusivo do mesmo remoto para a entrega em uma nova branch, sem force push. A publicação só é considerada concluída após o push e a conferência posterior do payload remoto; consulte a resposta final para o estado real da exportação.
