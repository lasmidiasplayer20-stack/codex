# O botão proibido

Curta original de 3min30. Mimo, um curioso de cachecol rosa, toca no botão de um laboratório de gravidade. Teca, a engenheira de óculos, tenta impedir o desastre; Pip, um pequeno drone, acaba sendo decisivo no resgate. Sem diálogos.

A história, os personagens, os cenários, as poses e a música foram criados para este curta. Aproveita o solver de cinemática inversa de `../../core/rig.js` e o Motion local; não reaproveita a coreografia, o vídeo ou a trilha da referência anterior.

## Produção em partes

Sete trechos de 30 segundos, 31 planos, quatro cenários. A divisão é interna; o filme final é contínuo. `story.js` é o roteiro animado; `film.js` desenha personagens, cenários, expressões, câmera e efeitos. As durações e os eventos sonoros estão em `storyboard.json`.

- 0:00–0:30 — apresentação, aviso e primeiro clique.
- 0:30–1:00 — gravidade invertida, gag da caneca e corda.
- 1:00–1:30 — corredor, saltos, drone e porta.
- 1:30–2:00 — núcleo instável, segundo erro e queda.
- 2:00–2:30 — resgate, ajuda de Pip e reconciliação.
- 2:30–3:00 — cooperação, botões e estabilização.
- 3:00–3:30 — resolução, tampa de segurança e piada final.

## Rodar e exportar

Requer Node >=22, dependências do projeto pai (`npm ci` em `Animação`), Chromium em `/usr/bin/chromium`, FFmpeg e NumPy para a trilha. Sirva a pasta `Animação` com servidor estático e abra `Originais/O-botao-proibido/index.html`.

A partir de `Animação`:

```sh
node Originais/O-botao-proibido/render.mjs --qa true --width 1280 --output /tmp/botao-qa
# Trechos intermediários internos; part varia de 0 a 6:
node Originais/O-botao-proibido/render.mjs --part 0 --output /tmp/botao-render
python3 Originais/O-botao-proibido/mix-audio.py
```

`gerar-efeitos.py` aceita `ELEVENLABS_API_KEY` ou `--credentials-file` apontando para o anexo autorizado fora do Git. Nunca grave credenciais no projeto. O domínio `api.elevenlabs.io` precisa estar liberado na rede. A folha de cues identifica a origem real dos efeitos; arquivos ElevenLabs existentes são usados na próxima mixagem.

A música é sintetizada por código com variações de andamento, harmonia, instrumentação e dinâmica. Efeitos procedurais complementam passos, saltos e impactos. A mixagem é estéreo e normalizada para -16 LUFS, teto de -1,5 dBTP.

Toda nova entrega MP4 deve ficar em `../../Vídeos/`. Os segmentos de trabalho ficam fora do checkout para revisão interna. A montagem final concatena os sete trechos e aplica a trilha uma única vez. Execute `python3 Originais/O-botao-proibido/assemble.py` a partir de `Animação`; o montador verifica as sete partes, exige 12.600 frames e decodifica o filme completo.

## Estado desta entrega

Filme montado e integralmente decodificado: 210 segundos, 12.600 frames, 1080p60, AAC estéreo. Os testes de contato e determinismo e a inspeção visual de quadros foram executados; não substituem avaliar o filme em movimento.

A rede impediu o uso da ElevenLabs antes da autenticação. Nesta versão, todos os efeitos são procedurais; a folha de cues registra zero eventos ElevenLabs. A trilha e a montagem podem ser atualizadas após a geração desses efeitos sem renderizar novamente os quadros. Nenhuma credencial está no projeto.
