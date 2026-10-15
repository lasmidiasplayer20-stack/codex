# Contrato dos modelos reutilizáveis

O exemplo usa Canvas 2D com `canvas#film`, coordenadas lógicas 960×540, `Motion` global para easing e `Rig` para cinemática. Não executa sozinho: o projeto deve fornecer personagens, poses, câmera, player e renderizador.

`profile` define raio da cabeça, comprimento do pescoço, tronco, dois segmentos de braço, dois de perna e espessura. Cada pose contém tempo global, pelvis, ângulos de tronco/pescoço e alvos de mãos. Trilhas de pés definem apoio, transferência e voo.

O centro das juntas deve ser compartilhado pelos segmentos que se encontram. Em apoio, ajuste pelvis e alvos coerentemente; não alongue o membro. Em voo, alvos podem relaxar dentro do alcance. Evite cortes no ângulo da cabeça em ±180 graus e mudanças bruscas no polo do IK.

Uma espinha dobrada é formada por dois segmentos de comprimento total constante. Dobra é uma pose do corpo, não uma escala da câmera. Use-a com parcimônia: um valor extremo pode produzir uma silhueta ruim mesmo quando a geometria é válida.

A arma deve ter geometria própria e uma coordenada de empunhadura ao longo do cabo. A palma e o cabo se encontram nesse ponto. Quando duas mãos segurarem o objeto, confira as duas. Para golpes, confira a ponta ou a cabeça metálica contra a superfície atingida, não apenas a posição da palma.

Ferimentos são dados persistentes ligados às coordenadas da cabeça/corpo. Luzes e marcas faciais compartilham a orientação do rosto. A câmera é um transform do cenário inteiro; efeitos em coordenadas da tela precisam sair desse transform explicitamente.

Verificações úteis: coordenadas finitas; comprimentos dos ossos; alcance; apoio dos pés; distância de contato; continuidade da transferência de arma; duração e FPS; último frame; decodificação integral e áudio. Nenhuma dessas verificações substitui a revisão visual.
