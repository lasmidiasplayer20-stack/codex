# Recriação por código — entrega para revisão

Vídeo completo de aproximadamente 1min35s, em **1920×1080 a 60 fps**, com a trilha original preservada. Personagens mais espessos, membros curvos e ajustes nas rotações rápidas e no contato com as armas.

- [Baixar o MP4](recriacao-movimento-elastico-1080p60.mp4)
- [Baixar o projeto em código](codigo-recriacao-elastica.zip)
- [Baixar a skill reutilizável](skill-reference-animation.zip)

Abra o arquivo escolhido e use **Download raw file / Baixar arquivo bruto** no GitHub. Os downloads são iniciados apenas pelo usuário.

## Prévia curta

![Trecho de quatro segundos do MP4 exportado](previa-movimentos.gif)

A prévia tem resolução e fps menores. Para avaliar a fluidez final, use o MP4 completo.

## Método e verificação

Os movimentos são reconstruídos a partir de articulações 2D nomeadas. O desenho usa Canvas, cinemática direta, curvas e Motion 14.1.0. O renderer não usa frames, imagens extraídas nem o vídeo original como fundo. O áudio original está incluído. Poses ocultas e detalhes do cenário são aproximações; a animação é dirigida pela referência, não uma simulação física autônoma.

O MP4 foi completamente decodificado na validação: 5676 frames, 60 fps, duração 94,6 segundos. Os 4074 pacotes AAC são idênticos aos da referência. Relatórios estão no projeto ZIP; checksums desta entrega estão em `checksums.json`.

## Usar a skill em outro chat

Extraia `skill-reference-animation.zip` e anexe `SKILL.md` junto da nova referência. Peça: “Leia a skill reference-animation e use seu fluxo para recriar o vídeo anexado em código, com movimentos fluidos e personagens mais grossos e curvos.” A instalação como skill depende da interface; anexar leva as instruções, sem registrar automaticamente ferramentas.

Os arquivos foram preparados na nuvem. Esta entrega pública no GitHub foi autorizada pelo usuário porque os anexos da conversa e o envio privado ao Drive não estavam disponíveis. O pacote não contém tokens, credenciais, sessões de upload ou o vídeo original.
