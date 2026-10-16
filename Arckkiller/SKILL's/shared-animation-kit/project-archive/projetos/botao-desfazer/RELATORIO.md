# Entrega — O botão de desfazer

Curta original: **210 segundos, 1920×1080, 60 fps nativos, 12.600 frames**, três personagens coloridos e sete blocos de 30s. Os MP4 estão em `../../Vídeos/O-botão-de-desfazer/`.

## Produção em partes

O roteiro foi dividido em sete blocos antes de renderizar. A primeira revisão corrigiu mudanças abruptas de orientação, chutes e poses, ajustou o apoio dos pés e separou os rostos do bolo na festa. A revisão dos quadros codificados também levou ao reposicionamento dos balões, para não cobrir a placa final. As sete partes foram exportadas individualmente, depois receberam áudio e montagem contínua.

O renderer desenha cada frame em Canvas e codifica H.264 por WebCodecs; não grava a tela em tempo real. A amostragem é em `start + frame/60`, sem acelerar um vídeo prévio. A montagem separa o vídeo dos capítulos antes de concatenar, para não carregar o priming AAC para os timestamps dos frames.

## Validação de movimento e preservação

A inspeção examinou **37,800 poses**. Todos os números são finitos e o desenho é determinístico. Maior erro de comprimento ósseo: 2.88e-13; maior deslocamento de articulação por frame: 13.30 unidades. Esses limites verificam estabilidade, não certificam naturalidade subjetiva ou colisões físicas gerais.

O perfil, o FK e as funções originais de desenho foram comparados por SHA-256 com a V6. Os testes da V6 também passaram: 27.000 poses, contatos, continuidade e hashes dos backups. As fontes e entregas anteriores não foram alteradas.

## Áudio

**24 efeitos gerados pelo ElevenLabs**, reutilizados nos **153 eventos** de ação e passos. Os prompts, o modelo e os arquivos estão em `audio/elevenlabs/`; a origem de cada evento está em `qa/audio-production.json`. Música original, ambiência e cauda sustentada do ventilador são sintetizadas por código. Mixagem estéreo, 48kHz, AAC 192kbps, com master contínuo e redução de música nos eventos principais.

O acesso ao serviço foi inicialmente bloqueado pela rede; depois da aplicação do domínio permitido, a conta solicitada foi validada e a geração concluiu. Nenhuma chave foi copiada para o projeto. A avaliação sonora foi técnica (duração, níveis, decodificação e sincronização por timestamps); não houve escuta humana.

## Revisão e reprodução

`qa/export-validation.json`: formato, duração, contagem de frames, checksum e decodificação integral de cada um dos oito MP4. `qa/encoded-review.json`: 96 frames amostrados, sete folhas temporais e pares nos limites de capítulos. As folhas foram examinadas visualmente pelo assistente; não se trata de inspeção manual de todos os frames. `qa/player.json`: controles, busca para 125s e áudio sincronizado.

Persistem sobreposições breves de silhuetas próximas ao carrinho e durante a entrega da bandeja. A atuação e as trajetórias são estilizadas e autoradas, com IK/FK; não são um solver geral de física. Veja `README.md` para reconstrução e `ROTEIRO.md` para a história.
