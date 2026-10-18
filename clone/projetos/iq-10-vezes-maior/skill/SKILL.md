---
name: reconstruir-video-iq-toon
description: Recriar o vídeo IQ 10 vezes maior em cenas 3D editáveis, usando a encenação do original e o acabamento toon da referência visual, com rastreamento local, rig e áudio preservado.
---

# Reconstrução por takes, com conferência ao original

Use esta skill junto com os arquivos deste projeto. Leia o README e os relatórios de `tracking/` antes de alterar a animação. A prévia antiga de 60 segundos foi reprovada visualmente. A revisão atual está em `revisoes/take-01-r2/` e refaz apenas os primeiros 4,067 segundos; leia também sua `SKILL.md`. Os demais takes precisam ser refeitos. Não descreva o rastreamento óptico como uma captura 3D completa, nem um teste de comprimentos de ossos como uma aprovação visual.

## Entradas e escopo

1. Obtenha o MP4 original localmente e confira seu SHA-256 com `tracking/report.json`. Conte os quadros decodificados e confira fps, resolução, duração de imagem e duração de áudio.
2. Use o original para os cenários, ações, câmera, personagens, takes, transições e trilha sonora. Use o ZIP de referência apenas para acabamento: contornos, materiais, iluminação e paleta. Não importe seu cenário de neve nem seus animais.
3. A escolha deste projeto é reconstrução 3D editável. Não substitua essa entrega por um filtro aplicado ao original ou por imagens do original usadas como planos de fundo da reconstrução.

## Análise por partes

- Mantenha um índice do vídeo inteiro. Analise todos os quadros com `scripts/track_reference.py`, revise os rótulos com `refine_labels.py` e compare cortes com `review_cuts.py`.
- Observe a confiança do ajuste de câmera, os vetores residuais, as oclusões, os flashes e as máscaras. Diferencie corte, ação contínua e transição; não trate uma mudança grande de pixels como prova de corte.
- Use `rastreamento.html` com o MP4 local para revisar cada trecho. Os dados são carregados por faixa de bytes de `tracking/archives/`, sem upload do original.
- O primeiro minuto tem 36 takes revisados em `reviewed-first-minute.json`; o restante ainda tem candidatos automáticos. Registre correções em quadros de origem, a 30 fps, e preserve os dados automáticos separados da revisão.
- Confira os seeds supervisionados antes de recalcular `track_primary_subject.py`. São caixas aproximadas de cabeça para este vídeo, não anotações anatômicas completas.

## Construção e animação

- Crie cena, câmera, personagens e objetos independentes por take. Não invente takes intermediários para preencher trechos difíceis. Faça a câmera coincidir com o enquadramento antes de refinar a ação.
- Mantenha comprimentos de braços e pernas constantes. Use IK com polos estáveis, respeite o limite de alcance e registre os alvos rejeitados. Não estique membros para alcançar um ponto mal detectado.
- Mantenha os membros escuros atrás e os claros à frente na profundidade do rig. Não decida a ordem apenas pela posição horizontal na imagem.
- Verifique o apoio dos pés, a flexão de joelhos e cotovelos, a transição entre apoio e balanço, o peso e o contato com cadeiras, camas, mesas e objetos.
- Ao deitar/sentar, mova o tronco a partir da pelve e preserve os contatos com a cama. Mantenha papéis, telefone e outros objetos presos à mão durante a pegada; dê-lhes trajetória própria ao soltar.
- Interpole observações válidas dentro do take. Não interpole através de cortes, oclusões ou rótulos de personagens diferentes. Onde não houver medida confiável, indique a lacuna e revise visualmente.
- Recrie efeitos com geometria, partículas, luzes e composição procedural. As máscaras de pálpebras podem usar os polígonos medidos. A profundidade e as articulações ocultas precisam de decisão de animação, não podem ser inferidas como fatos do fluxo óptico.

## Áudio, exportação e verificação

- Preserve a trilha do original localmente, com FFmpeg, sem mudar velocidade, sincronismo, música ou efeitos. Não é necessário enviar o arquivo para transcrição.
- Gere a prévia com `npm run export -- /caminho/original.mp4`. Confira duração, 3.600 quadros e 60 fps, presença do áudio, decodificação integral e quadros próximos de cada corte.
- Execute `npm run audit` e inspecione a prévia em movimento. Confira mãos, pés, câmera, objetos, sombras e transições contra o original. Registre a semelhança separadamente dos testes de estabilidade e comprimentos do rig.
- Antes de considerar o clone completo, revise também os takes além dos primeiros 60 s, preserve a cauda do áudio de 525,397914 s e confira a sequência inteira.

## Organização da entrega

Código, esta skill, dados, relatórios e prévias ficam em `clone/projetos/iq-10-vezes-maior/`. Somente o vídeo completo final deve ir para `clone/vídeos/`. Não publique o MP4 original bruto. Ao publicar, informe claramente o intervalo reconstruído e os pontos ainda pendentes de fidelidade.
