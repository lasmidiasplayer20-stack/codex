# V2 Viva — revisão de direção

O objetivo desta revisão é aumentar a presença do personagem e a emoção dos acontecimentos, preservando o sistema original. A nova direção usa atuação de corpo, montagem de câmera, espaço com profundidade, efeitos ligados aos eventos e uma trilha mais dinâmica.

A V1 e seus MP4s permanecem intactos. O controlador original, as quatro funções de desenho, o perfil de comprimentos e os backups anteriores continuam idênticos. Há um backup adicional de 34 fontes da V1. A nova extensão mantém 11 nós, ossos de comprimento constante e o personagem sem rosto. Não há vídeo gerado por IA, mascaramento ou vetorização de uma referência.

Foram adicionadas 27 janelas de atuação e 19 inserts de câmera. Os closes aproximam o personagem e os contatos sem ampliar o modelo no mundo. Existem 37 limites de câmera explicitamente marcados e alinhados a frames. Cortes para mãos, pés ou objetos são planos de detalhe intencionais; nos planos de corpo inteiro a figura continua dentro do quadro. O único reset da história continua sendo o flash em 115 s.

Os joelhos agora acompanham a direção de atuação; o agachamento não troca abruptamente o lado do joelho. Ao parar ou saltar, os alvos dos pés transitam suavemente por 0,2 s. O IK e o FK preservam os comprimentos.

A física continua a 120 Hz, com massa positiva, impulso oposto, atrito, gravidade e regras superelásticas/invertidas explícitas. A imagem ganha sombras de contato, parallax, grade, iluminação, energia e efeitos causais. Esses elementos de cenário são gráficos; não introduzem obstáculos invisíveis no solver.

O novo áudio é instrumental e sintetizado, sem vozes nem gravações externas. Contém motivo de descoberta, ritmo de ação, crescendo, filtragem em câmera lenta e silêncios do roteiro. O master usa oversampling 4×, limitação com compensação de latência e saída estéreo 48 kHz. As exportações serão verificadas antes da entrega.

Nesta revisão parcial os testes de preservação, ossos, contatos, roteiro, determinismo e enquadramento passaram. O filme completo ainda depende do render e da validação final.
