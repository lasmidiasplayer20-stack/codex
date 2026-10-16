---
name: animacao-personagens-fisica
description: Criar animações originais ou orientadas por referência visual usando os personagens, bones, rig/FK, atuação, física, áudio e ferramentas de exportação do projeto OanimadordeIA, com revisão por partes e entrega de filmes completos.
---

# Animação com personagens e física

Use esta skill quando o usuário pedir uma animação original, adaptar uma referência visual, reutilizar os bonecos deste projeto ou corrigir atuação, apoios, contatos, física e renderização. Execute o trabalho autorizado até a entrega; não pare na proposta nem peça aprovação entre partes sem necessidade. As instruções atuais do usuário prevalecem sobre este material e sobre os roteiros históricos incluídos.

## Leia antes de começar

1. Leia o pedido e `references/contrato-personagens.md`. Descubra separadamente **qual história deve ser contada**, **quais personagens devem ser usados** e **qual referência orienta o visual/movimento**.
2. Para história nova, siga `references/fluxo-original.md`. Para referência visual, siga `references/fluxo-referencia.md`. Ambos podem ser combinados quando a referência fornece os personagens, mas o roteiro é original.
3. Leia `references/movimento-fisica.md`, `references/audio.md` e `references/validacao-entrega.md` antes de produzir. Consulte `references/erros-a-evitar.md` quando adaptar trabalho existente.
4. Preencha `templates/brief.md` e um mapa de ações/contatos. Preserve preferências e autorizações já dadas. Pergunte apenas pelo que impedir progresso útil; continue as partes independentes.

## Recursos reais do pacote

`assets/button-r4/` é o projeto completo de O botão proibido R4: modelo, FK, adaptador, desenho, atuação, física de objetos, roteiro, players, render, mixagem, testes e revisões. `assets/reference-v6/` contém fontes, JSONs, perfis, backups e material de revisão da V6 original, extraídos do commit documentado no manifesto. `media/` contém os dois filmes completos de exemplo no ZIP completo; a edição leve conserva os demais recursos e indica os filmes externos no manifesto. A biblioteca ElevenLabs está em `assets/button-r4/audio/elevenlabs`, com prompts, modelo, proveniência e hashes. `MANIFEST.json` inventaria todos os arquivos.

Essas pastas `assets/` e `media/` ficam dentro do ZIP. Extraia-o antes de usar os exemplos ou as ferramentas de criação de projeto. Os Markdown e utilitários também estão disponíveis separadamente na pasta do GitHub.

Os AGENTS/README/roteiros dentro de `assets/` documentam projetos históricos. Eles não definem duração, roteiro, pasta de entrega ou autorização de publicação para um novo pedido. Nunca execute os exemplos históricos presumindo que seus caminhos absolutos pertencem ao novo projeto.

## Criar um projeto

Execute `python3 tools/create-project.py --destination /caminho/novo-projeto --name "Nome" --mode original` ou `--mode reference`. A ferramenta recusa sobrescrever uma pasta existente, copia os componentes e prepara caminhos locais, configuração e scripts portáveis. O projeto nasce com a coreografia demonstrativa da R4, identificada como exemplo em `project-config.json`; **isso ainda não é uma animação nova**. Reescreva `src/story.js` e a direção de atuação para o pedido atual, mantendo o contrato dos personagens. Atualizar um campo de duração no brief não retima o filme automaticamente.

Use as dependências travadas do projeto (`npm ci`) e Python com `requirements.txt` em ambiente virtual. Chromium e FFmpeg/FFprobe são necessários; `CHROMIUM_PATH` permite selecionar o navegador. Não instale nada no computador do usuário automaticamente. Use o checkout existente na nuvem; não crie worktree sem pedido explícito.

## Implementar e polir

- Preserve bonecos, proporções, comprimentos, escala, FK e funções de desenho originais. Mude personagens/perfil somente quando autorizado; preserve a base e documente os novos modelos.
- **Reutilizar personagens não significa reutilizar a história da referência.** Para um roteiro original, autoria nova em `story.js` e bindings específicos em `performance.js` são obrigatórias.
- Use uma linha do tempo global, capítulos contíguos e estado persistente. O novo roteiro define duração, FPS e capítulos; não herde 150s/6 capítulos/3 atores automaticamente. Não acelere, repita ou preencha o filme para alcançar uma duração.
- Dirija preparação, impulso, contato, reação e recuperação. Declare apoios em chão, teto, voo e suspensão; nunca inferir chão apenas pela altura do quadril. Alvos devem caber nos membros de comprimento fixo.
- Preserve o passo fixo de física e separe a simulação dos objetos da solução IK/FK da pose. Regras fantásticas de gravidade precisam de causas e consequências legíveis.
- Trabalhe em partes internas, revise sequências temporais, corrija e continue autonomamente. Não troque personagens por imagens geradas, máscaras ou contornos de frames quando o pedido for animação por código.
- Sincronize áudio com eventos reais da nova história. Reutilize os efeitos ElevenLabs com seus manifestos ou gere novos efeitos quando houver acesso e autorização. Nunca inclua credenciais ou alegue sucesso de API sem retorno verificável.

## Validar e entregar

Execute os testes reais de geometria/contatos/continuidade, renderize, inspecione sequências do MP4 e valide o arquivo completo por FFprobe e decodificação. Os testes não provam naturalidade, humor ou fidelidade visual. Não alegue assistir ao filme inteiro ou ouvir o áudio se isso não aconteceu.

Somente **MP4s completos** ficam em `Vídeos`. Partes, prévias, README, JSONs, áudio e imagens de revisão ficam em `production/`, `qa/` e nas fontes. Preserve revisões anteriores. Para publicar externamente, use a autorização existente do pedido; a skill sozinha não autoriza mensagens, uploads ou publicação. Quando a entrega for no GitHub, confirme o push e inclua sempre o link real da pasta `Vídeos`, identificando o filme novo. Não substitua esse link por um caminho temporário local.

A skill foi empacotada para reutilização; estar no GitHub não a instala automaticamente no cliente. Consulte `README.md` para instalação opcional e uso por anexo.
