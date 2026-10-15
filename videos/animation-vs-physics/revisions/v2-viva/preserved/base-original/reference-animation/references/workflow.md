# Fluxo técnico e adaptação

O exemplo utiliza Python com NumPy/OpenCV, Node 20+, Playwright, Chromium e FFmpeg.
Motion 14.1.0 e sua licença estão incluídos localmente. A skill não instala essas
capacidades em interfaces que não oferecem um ambiente de execução.

No exemplo preparado, o renderer abre e fecha seu próprio servidor e navegador.
`capture-rig.py` fornece extração de um grafo medial; o restante adapta detecção,
poses, objetos, contatos e cortes para a referência. Os eventos e os nomes de
objetos do template são exemplos a substituir, não regras universais.

## Comandos da base

Depois de adaptar `CAST` e as cenas à referência:

```sh
python capture-scene.py referencia.mp4 --output capture.json
python refine-scene.py referencia.mp4 --capture capture.json --output reviewed.json
python capture-effects.py referencia.mp4 --capture reviewed.json --output effects.json
python prepare-motion.py effects.json --output motion-data.js
ffmpeg -i referencia.mp4 -vn -c:a copy soundtrack.m4a
npm ci
node inspect.mjs
node render.mjs --output recreacao.mp4
python validate-export.py recreacao.mp4
```

O script de captura registra a duração total do arquivo. `--duration` pode ser
usado em `prepare-motion.py` quando for necessária uma duração explícita. O
renderizador usa a duração dos dados. Verifique uma extensão final de áudio além
do último frame de vídeo e decida como completar essa pequena diferença.

O template inclui assertivas e tempos específicos da cena demonstrada em
`inspect.mjs`. Adapte essas verificações aos personagens e ações reais do novo
vídeo. Mantenha os testes gerais de rig, player, determinismo, rotação rápida e
objetos rígidos, pois exercitam falhas concretas do método.

## Nova sessão

Forneça novamente o vídeo quando ele não estiver acessível na sessão. Não assuma
que arquivos, credenciais ou links de upload temporários da conversa anterior
existam na nova máquina. O pacote contém procedimento e código-base; a captura da
nova referência e seus ajustes continuam necessários.
