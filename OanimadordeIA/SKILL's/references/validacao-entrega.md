# Validação e entrega

Antes de renderizar tudo, identifique duração, FPS, resolução, número de partes e recursos da máquina. Use paralelismo compatível; duas tarefas foi o limite conservador deste ambiente, não uma obrigação universal. Não reutilize uma parte se suas fontes/timing mudaram, a menos que haja prova de equivalência.

## Verificações que importam

- Hashes do modelo/FK/desenho; comprimentos de bones e finitude em todos os frames de entrega.
- Alcance e coincidência dos contatos, apoio no plano certo, separação das cabeças e ausência de saltos fortes de juntas/raiz.
- Continuidade nos limites dos capítulos e ordem causal dos eventos. Não faça passar testes removendo contatos ou desativando asserções.
- Sequências visuais antes/depois de botões, passos, viradas, lançamento, voo, queda e resgate. Frames bonitos isolados e testes numéricos não provam naturalidade.
- MP4: duração e número real de frames, FPS, dimensões, H.264/yuv420p quando requerido, AAC estéreo e decodificação integral sem erro.
- Players: carregar o filme correto, Play/Pause, seeks, capítulos, MIME do CSS/áudio e suporte a HTTP 206.
- Proveniência dos sons, ausência de credenciais e manifesto do pacote.

Os limites numéricos da R4 são uma base de diagnóstico. Para outra escala/câmera/ritmo, justifique limites adequados antes de usá-los; não relaxe asserções apenas para esconder um defeito. Os scripts gerados derivam duração/elenco/capítulos do novo `StoryV6`, mas o artista ainda precisa revisar causalidade e fidelidade do novo roteiro.

## Organização

`Vídeos/` contém apenas MP4s completos. Nenhum README, JSON, parte, prévia, WAV ou imagem. Use `production/` para intermediários, `qa/` para relatórios/revisão e `audio/` para sons. Preserve revisões anteriores.

Informe o arquivo novo, duração/resolução/FPS, o que foi verificado e limitações materiais. Inclua o link real da pasta de saída no Git quando a entrega for no GitHub. Confirme commit/push antes de dizer publicado. Publicar uma skill não fornece autorização para enviar mensagens ou publicar outros trabalhos fora do escopo solicitado.
