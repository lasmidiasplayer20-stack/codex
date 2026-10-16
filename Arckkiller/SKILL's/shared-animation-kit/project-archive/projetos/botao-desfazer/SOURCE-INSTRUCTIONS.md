# Curta original — O botão de desfazer

Este novo projeto tem 210s, sete partes de 30s, 60fps e 1920×1080. Todo texto visível no filme ou no player deve estar em inglês, incluindo títulos, placas, indicadores e encerramento. O pedido atual substitui os 150s da entrega V6 apenas neste subprojeto. Não modifique as fontes V6 ou os arquivos preservados para editar esta história.

Preserve `vendor/rig-controller.js`, `src/model.js` e `src/legacy-renderer.js`, copiados byte a byte da base. Nova atuação está em `src/performance.js`, nova história em `src/story.js` e novo cenário em `src/world.js`.

Todos os MP4, inclusive testes e intermediários de montagem, ficam em `../../Vídeos/O-botão-de-desfazer/`. Revise as sete partes antes da montagem. Execute `npm test`, revise quadros temporais e rode `assemble.py` para validação completa.

Chaves de API vêm de arquivos fora do checkout. Nunca registre valores nos fontes, logs, commits ou relatórios. `generate-elevenlabs.py` lê somente a chave da conta solicitada no arquivo de credenciais. Diferencie efeitos ElevenLabs de síntese local; não alegue uso do serviço sem arquivos de áudio gerados. Não alegue escuta humana que não ocorreu.

## Current export layout
Only complete final MP4 films belong in Vídeos. Intermediate MP4 parts, smoke tests, raw streams and their metadata belong in this project’s production/parts/ directory. This user-requested layout supersedes the earlier all-MP4 delivery rule. Preserve the completed film and its URL.
