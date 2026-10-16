# Kit reutilizável de animação

Use os mesmos bonecos, bones, rig/FK e recursos de física em **histórias originais** ou em trabalhos com **referência visual**.

- [Baixar o ZIP completo](animacao-personagens-fisica-v1.zip?raw=true)
- [Baixar a versão leve para anexar em novos pedidos](animacao-personagens-fisica-v1-leve.zip?raw=true)
- [Instruções da skill — SKILL.md](SKILL.md)
- [Conteúdo e proveniência](MANIFEST.json)
- [Checksums dos ZIPs](SHA256SUMS.txt)
- [Testes executados e limites](VALIDACAO.md)

O ZIP completo reúne o projeto R4 completo, as fontes e referências da V6 original, os dois filmes completos para comparação, os efeitos ElevenLabs utilizados, as configurações travadas, roteiros, JSONs, física, testes, imagens de revisão e ferramentas de produção. Também inclui um criador de projetos e um extrator de quadros de referência. Credenciais, node_modules, caches, ZIPs duplicados, partes de vídeo redundantes e WAVs intermediários regeneráveis não fazem parte do pacote; os geradores e as fontes correspondentes estão incluídos.

## Usar em um novo pedido

Anexe o ZIP leve a uma conversa (ou disponibilize o completo pelo repositório) e escreva, por exemplo:

> Use a skill deste ZIP. Crie uma história original sobre [ideia], usando os personagens, bones e sistema de movimento do kit. Quero [duração], [resolução/FPS] e [idioma]. A referência é apenas dos personagens; mantenha a minha história. Revise internamente em partes e entregue somente o filme completo em Vídeos.

Ou:

> Use a skill deste ZIP e esta referência visual [arquivo/link]. Recrie/adapte [ações ou aspectos desejados], preservando os personagens do kit. Extraia sequências para análise, faça o mapa de ações/contatos e confira a duração antes de implementar.

A versão leve mantém código, sons, documentação e imagens de revisão; os dois MP4s completos ficam na versão completa e são indicados no manifesto da leve.

O ZIP não acessa esta conversa automaticamente. Inclua o roteiro atual, a referência acessível e o destino da entrega no novo pedido.

## Instalar como skill no Codex — opcional

Extraia a pasta `animacao-personagens-fisica/` do ZIP para o diretório de skills do seu cliente. Em clientes que leem skills do repositório, use `.agents/skills/animacao-personagens-fisica/SKILL.md`; para instalação pessoal, siga o diretório configurado no seu cliente. Reabra a sessão e invoque `$animacao-personagens-fisica`. O diretório e o mecanismo de instalação dependem do cliente; apenas publicar esta pasta no GitHub não instala a skill.

## Usar as ferramentas

Após extrair o ZIP:

```sh
python3 animacao-personagens-fisica/tools/verify-kit.py animacao-personagens-fisica
python3 animacao-personagens-fisica/tools/create-project.py --destination /tmp/meu-filme --name "Meu filme" --mode original
# No projeto gerado: npm ci, preparar venv/requirements.txt, npm test.
```

O projeto gerado é um ponto de partida executável com a **história demonstrativa**; a IA precisa escrever o novo roteiro e a nova atuação. O criador corrige caminhos fixos dos exemplos e prepara `production`, `qa` e `Vídeos`. Não inventa uma história automaticamente.

Para extrair quadros de uma referência:

```sh
python3 animacao-personagens-fisica/tools/sample-reference.py --input /caminho/referencia.mp4 --output /tmp/analise-referencia --interval 0.5
```

Não é necessário ElevenLabs para rodar os exemplos: os efeitos existentes estão incluídos. Geração nova requer acesso à API e uma credencial fornecida com segurança, fora do projeto/ZIP. A física dos personagens é coreografia autorada com IK/FK; os objetos têm integração de gravidade, arrasto e colisões. O kit não é um simulador geral de corpos articulados.

O utilitário `tools/build-kit.py` recompõe o ZIP a partir do checkout Git e dos commits de origem; não é necessário para usar o pacote extraído. O fluxo foi testado com Node 24, Python 3.12, Chromium e FFmpeg.
