# Day Two — The Signal

Segundo episódio da história do surto zumbi. Narração, legendas e textos em inglês. Projeto baseado no editável enviado pelo usuário, com o desenho e o elenco preservados.

## Entrega

- [Filme completo para postar](Vídeos/day-two-the-signal-1080p60.mp4): 1920×1080, 60 fps, H.264 e AAC estéreo. Duração após os cortes: **8min30,800s**.
- [ZIP editável](day-two-editavel.zip): projeto portátil, sem o MP4 e sem dependências instaladas.
- [Legendas em inglês](day-two-en.srt).
- [Projeto](projeto/): player HTML, código, roteiro, narração tratada, música e efeitos.
- [Verificações](qa/): transcrição local, cortes, medições de áudio e verificações desta versão.

CTAs pequenos, com entrada e saída suaves, em **00:45**, **04:15,4** e **07:55,8**, durante cinco segundos cada. Permanecem acima das legendas e junto à borda direita.

O MP4 foi validado por decodificação completa: **30.648 quadros**, vídeo e áudio começando em 0,000s, H.264 e AAC estéreo de 160 kbps a 48 kHz. O áudio codificado mediu **−16,06 LUFS**, pico verdadeiro de **−3,17 dBTP** e faixa de sonoridade de **2,7 LU**. Veja [o relatório final](qa/final-validation.json) e [os checksums](SHA256SUMS.txt).

## Tratamento da narração

O WAV foi fornecido pelo usuário. A identificação das falas foi feita localmente com Whisper base.en; o áudio não foi enviado a um serviço de transcrição. Foram removidos quatro títulos de cena lidos: “The power fades”, “The noise returns”, “Not leaving anyone behind” e “On the rooftop”. Os cortes acontecem em pausas, com fades de 8 ms. Não foram encontradas leituras de timestamps numéricos na transcrição.

A gravação original não apresentou samples recortados no limite digital. Foi aplicado nivelamento gradual, filtro de graves, compressão leve e normalização da voz, além de redução automática da trilha durante a fala. A mixagem busca -16 LUFS e teto de -1,5 dBTP; os valores medidos após codificação ficam em `qa/`.

## Editar e exportar

Instale Node.js, Python e FFmpeg, então:

```sh
cd projeto
npm install
python -m http.server 8765
```

Abra `http://localhost:8765`. Para exportar novamente, encerre o servidor e execute:

```sh
python pipeline.py --workers 2
```

O áudio final fornecido já está no pacote; não é necessário usar uma API nem inserir uma chave. `story.json` contém os tempos das cenas e das legendas. `film.js` mantém a animação em tempo nativo; `cta.js` desenha os CTAs. `audio.py` gera a trilha e o Foley sintéticos a partir da montagem.

Os scripts em `projeto/tools/` registram o processamento local do áudio. Para refazê-lo a partir do WAV original, instale `pip install -r requirements.txt`, execute `tools/01_clean_narration.py CAMINHO_DO_WAV`, `tools/02_level_voice.py`, `audio.py` e `tools/03_finish_audio.py`, nessa ordem. A lista de cortes é específica ao WAV original e o primeiro script confere seu SHA-256 antes de cortar.

## Skill e limites

Fluxo de revisão orientado pela skill [`animation-from-reference`](https://github.com/lasmidiasplayer20-stack/codex/blob/entrega-animacao-20261014-caf07810/Arckkiller/SKILL%27s/animation-from-reference/SKILL.md), já existente no repositório. O destino desta entrega segue o pedido explícito `zumbi/zumbi 2/`. A animação é dirigida em Canvas, com rig vetorial e trajetórias autoradas; não é uma simulação física geral. A montagem preserva as 24 cenas do projeto enviado. A revisão de áudio usa transcrição e medições automatizadas; não constitui avaliação auditiva humana.

Chaves, dependências instaladas, WAVs de trabalho e partes de renderização ficam fora do Git e do ZIP editável.
