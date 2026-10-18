---
name: reconstruir-take-com-referencia
description: Recriar um take em 3D editável, preservando conteúdo e timing e conferindo a exportação contra a referência.
---

Use o vídeo como referência de cenário, ação, câmera, cortes e áudio. Use o ZIP visual apenas para materiais e iluminação. Não substitua o conteúdo por cenários do ZIP.

Trabalhe por take. Para esta abertura, use quadros 0–121 a 30 fps, exportados como 244 quadros a 60 fps. Preserve o início e o tempo da trilha original.

Meça separadamente a cabeça do personagem e o movimento do fundo. Nunca troque de câmera quando a detecção da cabeça falhar; registre as lacunas e interpole mantendo continuidade. Ajuste as profundidades do personagem e do fundo antes de adicionar movimentos à câmera.

Use rig de dois ossos com comprimentos constantes. Revise os polos dos cotovelos e joelhos, o contato dos pés, a ordem de profundidade dos membros e a trajetória da mão. Escuro fica atrás, claro à frente. Objetos devem seguir as mãos correspondentes.

Construa geometria editável. Não use quadros do original como textura para simular reconstrução 3D. Use `data.json` como parâmetros observados e `opening.js` como base da cena. Refaça o holograma gradualmente e mantenha as piscadas e o flash nos tempos da referência.

Execute a auditoria, exporte e reveja o MP4 decodificado, incluindo quadros intermediários e áudio. Compare visualmente silhueta, contatos, encenação e câmera. Um teste matemático de ossos ou enquadramento não prova fidelidade. Registre diferenças e não apresente um take parcial como prévia completa ou master aprovado.

As prévias ficam dentro do projeto. `clone/vídeos/` é reservado ao filme completo final.
