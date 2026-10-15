# Animation vs. Physics — V2 Viva

Revisão de direção da animação programada: personagem maior no quadro, mais atuação, 19 inserts de câmera, cenário com profundidade e respostas aos impactos, e uma nova trilha instrumental dinâmica. Permanecem a história dos 25 takes, 125 segundos, 1920×1080, 24 fps e o rig original sem rosto.

A versão anterior continua intacta na pasta principal de `animation-vs-physics`. Seus 34 arquivos de fonte usados nesta revisão também foram copiados para `preserved/revision-v1/`, com hashes de verificação.

## Estado desta revisão

A atuação e a direção estão implementadas. As exportações desta revisão estão em processamento. Cada prévia é publicada após validação; o relatório será atualizado com a validação do filme inteiro.

## O que mudou

- 27 janelas de atuação: curiosidade, hesitação, susto, desequilíbrio, esforço, exaustão, confiança e alívio;
- câmera mais próxima, com planos médios, detalhes de contato, reações e planos abertos nas ações grandes;
- 19 inserts e 37 limites de corte explícitos, alinhados a frames; o mundo físico não reinicia nesses cortes;
- correção do sentido de flexão dos joelhos, inclinação da caminhada e soltura suave dos pés ao parar/saltar;
- cenário procedural em camadas: grade, luz, sombras de contato, parallax, energia, poeira e faíscas;
- cubo com leitura de volume, esfera com luz e halo, e colapso com fragmentos convergentes;
- música original com motivo, baixo, percussão, crescendo, câmera lenta, pausas cômicas e efeitos sincronizados.

## Preservação

Não foram substituídos o controlador original, as quatro funções originais de desenho, as proporções ou os projetos anteriores. Os 11 nós do rig e os comprimentos são constantes. A atuação atua como uma extensão antes do IK/FK. O boneco continua preto, sem rosto e sem acessórios permanentes. Seu tamanho no mundo não muda; são as câmeras que o aproximam.

## Módulos novos

- `src/performance.js`: atuação, direção de flexão e transição da caminhada;
- `src/cinematic.js`: enquadramentos, inserts, cortes e reação de câmera aos impactos;
- `src/living-world.js`: cenário, iluminação e respostas dos objetos/eventos;
- `scripts/score-v2.py`: nova música e efeitos sintetizados, com master limitado em 4× oversampling;
- `tests/direction.mjs`: enquadramento dos sujeitos em cada tipo de plano e rig constante.

A base, os módulos de física e a história estão documentados nos arquivos preservados e em `docs/`.

## Executar na nuvem

Node 22+, Chromium em `/usr/bin/chromium`, FFmpeg, Python, NumPy e Pillow.

```bash
npm ci
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
npm test
npm run serve
```

Para renderizar:

```bash
node scripts/inspect.mjs .qa/inspection
.venv/bin/python scripts/score-v2.py --events .qa/inspection/report.json --duration 125 --output exports/audio-v2.wav
node render.mjs --duration 125 --audio exports/audio-v2.wav --output exports/animation-vs-physics-v2-1080p24.mp4
python3 scripts/validate-export.py exports/animation-vs-physics-v2-1080p24.mp4 --duration 125
```

O ZIP inclui fontes, backups, testes e a trilha AAC pronta para o player. Os MP4s e a comparação são entregues separadamente. Nada precisa ser instalado no computador de trabalho para assistir aos arquivos.
