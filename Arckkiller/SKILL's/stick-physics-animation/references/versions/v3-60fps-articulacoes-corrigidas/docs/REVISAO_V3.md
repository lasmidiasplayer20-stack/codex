# Direção da revisão V3

A versão de entrada tinha boa separação entre física e desenho e um rig determinístico preservado. A inspeção dos filmes V1/V2 e dos estados revelou quatro pontos de trabalho: resolução temporal de 24 fps; pouca presença do ambiente; personagem pequeno em vários planos; e cotovelos escolhidos por índice do braço, combinados com balanço das mãos que não acompanhava a inversão da caminhada.

A direção da V3 reforça a leitura corporal sem mudar a história. Cotovelos e joelhos recebem sentidos de dobra coerentes com a orientação do personagem. As mãos oscilam contra os pés correspondentes, usando os alvos efetivos da passada. Para evitar estalos na troca de lado do IK, as viradas passam por uma pose de extensão com os membros separados, antes de flexionar no novo sentido.

O cenário é uma câmara clara de experimentos, composta inteiramente de geometria e luz por código. Painéis ao fundo, poeira, arcos técnicos e piso em perspectiva dão profundidade, enquanto a linha de contato do chão permanece legível. Apenas os planos físicos existentes colidem com o personagem; a decoração não introduz obstáculos invisíveis.

A câmera aproxima os planos de atuação e mantém espaço para o movimento. Ao mostrar dois sujeitos muito afastados, prioriza-se o personagem depois de estabelecer a origem da força. Os inserts de mão, pé, esfera e reação continuam deliberados. A exposição de movimento é reduzida em 60 fps, para conservar a silhueta nos movimentos rápidos.

A execução é dividida em descoberta (30 s), leis alteradas (45 s) e confronto/desfecho (50 s). Cada parte é renderizada a partir do tempo absoluto do mesmo estado persistente. A montagem final copia os frames de vídeo desses três arquivos e usa uma codificação contínua do áudio, evitando lacunas de AAC nas emendas.
