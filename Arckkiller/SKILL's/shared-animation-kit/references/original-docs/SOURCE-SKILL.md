---
name: code-animation-physics
description: Criar animações 2D originais por código com rig articulado existente, coreografia determinística, leis físicas normais ou estilizadas, renderização e validação audiovisual.
---

# Skill: animação original por código — Animation vs. Physics

## Objetivo e prioridade
Produzir um filme 2D de 125 segundos (25 takes de 5s), 1920x1080, 24 fps, 3000 frames, com stickman consistente, fundo branco, chão preto, esfera azul, cubo e efeitos. Sem narração ou diálogos. Roteiro em `ROTEIRO_TECNICO.md`; preservar o conteúdo de `ROTEIRO_ORIGINAL.md` como intenção criativa. **Não alegar que o filme foi renderizado sem executá-lo e verificá-lo.**

## Reaproveitamento obrigatório
Inspecionar `base-original/reference-animation/SKILL.md`, `references/workflow.md` e `template/`. Reutilizar, quando adequado, `rig-controller.js`, `film.js`, `render.mjs`, `inspect.mjs`, o fornecedor local `vendor/motion.js` e os scripts de validação. A base foi projetada para reconstrução por referência: **não** exigir vídeo de referência para este projeto original. Não copiar a coreografia do exemplo de quatro personagens. `capture-*` e `refine-scene.py` são opcionais e só devem ser usados quando houver uma referência apropriada. Não alterar os originais: criar uma pasta de projeto nova.

## Arquitetura sugerida
- `src/rig.js`: adaptador do rig existente, identidade fixa de cabeça, ombros, quadril, cotovelos, mãos, joelhos e pés; comprimentos constantes salvo squash/stretch intencional.
- `src/physics.js`: física 2D em unidades de mundo com passo fixo 1/120 s; gravidade vetorial, velocidade, atrito, restituição, colisões e impulsos. Não usar delta variável para integração.
- `src/director.js`: agenda de eventos determinística por tempo absoluto, modos `physical`, `modified`, `directed` e blends suaves.
- `src/scenes.js`: 25 cenas com eventos, poses e estados de entrada/saída; cada cena inicia do estado final da anterior ou de um corte explicitamente marcado.
- `src/camera.js`: transformação de câmera separada do mundo físico; rotação do take 11 não deve trocar os vetores de gravidade inadvertidamente.
- `src/render.js`: render vetorial de corpo, objetos, efeitos e composição em canvas/SVG conforme infraestrutura existente.
- `src/audio.js` ou trilha offline: SFX originais/licenciados sincronizados por timestamp; silêncio deliberado quando indicado.
- `tests/`: validações de continuidade, duração, contato, determinismo e render.

## Sistema de coordenadas
Viewport 1920x1080. Mundo de referência em pixels lógicos, origem superior esquerda, +x para direita, +y para baixo. Chão inicial y=810; personagem em pé altura alvo ~170 px, cabeça diâmetro ~34 px, espessura de traço ~6 px; valores iniciais ajustáveis ao rig existente. Esfera raio ~9 px; cubo lado ~65 px. A esfera inicia x≈1100, o stickman centro x≈900 após a caminhada. Esses valores são **guias**, não substituem composição visual e limites de colisão. Câmera/escala preservam coerência em todos os takes.

## Física e direção artística
- Gravidade padrão g=(0,+900) px/s²; gravidade zero g=(0,0); lateral g=(+900,0), com mudanças em eventos explicitamente marcados.
- Atrito normal parametrizado; zona azul pode usar atrito dinâmico próximo de zero. Coeficiente de restituição normal 0.2–0.5, modo superelástico dirigido >1 apenas como efeito cartunesco.
- Impulso e inércia coerentes quando possível. Quando o roteiro pede resultado impossível (massa negativa/cubo atraído por empurrão), **não** implementar massa física negativa em solver genérico: usar força dirigida invertida com limites de velocidade e colisões seguras.
- Não confundir gravidade zero com levitação espontânea: aplicar pequeno impulso ascendente dirigido no take 03; no take 04 movimento dos membros sozinho não deve transladar centro de massa.
- No take 05, aplicar impulso de reação ao chute; no take 13/15, usar regra especial de resposta invertida do cubo; no take 20, câmera lenta cinematográfica por time-scale sem alterar o relógio do vídeo.
- Separar pose/IK de integração do corpo rígido; travar pé/mão em contato quando aplicável, soltar contato explicitamente antes de voo/ricochete.

## Pipeline obrigatório
1. Ler roteiro original, roteiro técnico, base e requisitos. Listar incompatibilidades reais antes de implementar.
2. Prototipar rig, esfera, cubo, chão e câmera; validar silhouette e contatos em 5 frames.
3. Implementar take 01–06, exportar preview; depois 07–15; depois 16–25.
4. Implementar a continuidade por estado persistente: `character`, `orb`, `cube`, `world`, `camera`, `effects`; nunca reiniciar posições implicitamente entre takes.
5. Produzir 24 fps, 3000 frames, H.264 MP4 1920x1080, áudio opcional AAC; se áudio não estiver disponível, entregar vídeo silencioso e relatório explícito.
6. Validar com FFprobe e decodificação completa; gerar contact sheet com frames por take e frames de transição (último/primeiro).
7. Revisar visualmente física, anatomia, colisões, efeitos, cortes e sincronização; corrigir e renderizar novamente.

## Critérios de aceite
Duração 125s ± 1 frame; 3000 frames a 24 fps; um stickman consistente; todos os 25 takes presentes; sem textos inesperados, falas ou frames de vídeos de terceiros; movimento determinístico por seed; continuidade sem teleporte não intencional; gravidade, atrito, elasticidade e cubo invertido visíveis; sem pés atravessando chão nem mãos desconectadas em contatos; câmera não perde personagem nos takes 10–11; sem flicker/NaN; arquivo MP4 decodificável; registrar limitações e evidências em `RELATORIO.md`.

## Política de execução
Não baixar assets desnecessários nem presumir internet. Não substituir toda a animação por geração de vídeo. Não inventar conclusão da renderização. Caso dependências estejam ausentes, explicar o bloqueio, produzir código executável e testes, e solicitar apenas o recurso estritamente necessário.
