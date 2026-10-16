# One More Take — O botão de desfazer

Curta original de **3min30s · 1080p · 60 fps · colorido**. Sete partes produzidas separadamente e montadas em tempo próprio. O roteiro, o cenário e a atuação são novos; o perfil, o FK e o desenho-base dos personagens são preservados da entrega V6.

Os MP4 ficam em [Vídeos/O-botão-de-desfazer](../../Vídeos/O-botão-de-desfazer/). O roteiro está em `ROTEIRO.md`; relatórios atuais em `qa/`.

## Reproduzir

Node ≥20, Chromium em `/usr/bin/chromium`, FFmpeg/FFprobe e Python 3 com NumPy e Pillow. Instale as dependências Node com `npm ci`. Para o Python, use um ambiente virtual e `pip install numpy==2.3.5 Pillow==12.3.0`. Sirva esta pasta com `python3 -m http.server 8001 --bind 127.0.0.1` e abra o player em navegador local. A API não é necessária para assistir aos arquivos prontos.

```sh
npm test
python3 score.py
node render-parts.mjs 0 1
node render-parts.mjs 2 3
node render-parts.mjs 4 5 6
python3 assemble.py
python3 review.py
```

O renderizador usa WebCodecs H.264 em Chromium: cada quadro é desenhado em Canvas em `start + frame/60`, sem captura em tempo real nem interpolação artificial de fps. A atuação é preparada a 120Hz e reconstruída pelo FK original. `inspect.mjs` verifica 37.800 poses, comprimentos dos ossos, limites de deslocamento e determinismo. `assemble.py` confirma formato, frames e decodificação completa dos oito MP4. Os nomes das partes são índices internos; o filme contém os capítulos correspondentes.

## Som e ElevenLabs

`score.py` cria música original, passos, efeitos sincronizados e mix estéreo contínuo. Usa os efeitos em `audio/elevenlabs/` quando disponíveis; registra a origem de cada evento em `qa/audio-production.json`.

O acesso ao ElevenLabs foi inicialmente bloqueado pela rede. Após a aplicação da liberação de `api.elevenlabs.io`, a chave da conta solicitada foi validada e **24 efeitos foram gerados pelo ElevenLabs**. A mixagem final usa esses arquivos nos eventos de ação e nos passos; música, ambiência e cauda de motor são sintetizadas por código. Os arquivos MP3 e os prompts estão em `audio/elevenlabs/`. Para reproduzir a geração em outro ambiente com acesso liberado:

```sh
python3 generate-elevenlabs.py --credentials /caminho/externo/variavel.txt
python3 score.py
python3 assemble.py
```

O gerador procura a chave abaixo de `lasmidiasplayer20`, não imprime o valor e não copia o anexo. Ele gera apenas efeitos, sem voz e sem música. O manifesto registra os prompts e o fornecedor. Os scripts não alegam avaliação auditiva humana; a validação sonora automatizada verifica duração, níveis e decodificação.

Os WAVs regeneráveis e os quadros individuais de revisão são ignorados pelo Git. A trilha AAC, o código, os relatórios, as folhas de revisão e os MP4 finais são entregues. Não sobrescreva os MP4 da V6 em `exports/`.
