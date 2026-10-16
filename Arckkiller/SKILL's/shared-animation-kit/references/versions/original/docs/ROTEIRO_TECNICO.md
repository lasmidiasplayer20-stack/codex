# Animation vs. Physics — roteiro técnico para geração por código

**Duração:** 125 s | **25 takes:** 5 s cada | **24 fps:** 120 frames por take | **Total:** 3000 frames | **Resolução:** 1920×1080

## Contrato global

Manter a narração visual integral do arquivo `ROTEIRO_ORIGINAL.md`. O texto abaixo complementa cada take com direção técnica; a IA implementadora deve consultar ambos. Fundo branco, traços pretos, esfera azul, cubo cinza/roxo; sem diálogo/narração. Todos os tempos são absolutos e todos os takes são intervalos semiabertos [início,fim), evitando frames duplicados. A continuidade é por estado persistente, exceto cortes explicitamente escritos.

## Estados compartilhados

`character={rootPosition,rootVelocity,rootRotation,joints,contactPoints,poseMode}`; `orb={position,velocity,radius,color,charge,state}`; `cube={position,velocity,size,color,responseMode}`; `world={gravity,friction,restitution,walls}`; `camera={position,rotation,zoom}`; `effects=[]`. Os eventos devem ser reproduzíveis por timestamp absoluto e seed fixa.

## Takes — descrição integral + instruções de implementação

### Take 01 — Uma caminhada normal (0:00–0:05)

**Descrição visual original:**

Uma tela completamente branca. Uma linha preta horizontal representa o chão, posicionada a aproximadamente 75% da altura da imagem. Um stickman preto entra caminhando pelo lado esquerdo, com passos naturais e braços balançando alternadamente. Ele caminha até o centro da tela e para. Seu corpo permanece ereto e a cabeça se inclina ligeiramente para a direita, como se tivesse percebido algo estranho no chão.

**Som:** passos leves, depois silêncio.

**Direção técnica adicional:** Caminhada com contatos alternados; finalizar personagem parado e olhando à direita.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 02 — O objeto misterioso (0:05–0:10)

**Descrição visual original:**

Uma pequena esfera azul brilhante, com aproximadamente metade do tamanho da cabeça do stickman, cai verticalmente do topo da tela. Ela atinge o chão a uma distância visual de aproximadamente um metro à direita do personagem, quica três vezes com alturas progressivamente menores e finalmente para. O stickman recua um passo assustado, inclina o tronco para trás e levanta os braços. Depois, lentamente, aproxima a cabeça da esfera.

**Som:** assobio de queda e três impactos elásticos.

**Direção técnica adicional:** Esfera entra do topo, três colisões amortecidas; orb.state=idle_on_ground.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 03 — A gravidade desaparece (0:10–0:15)

**Descrição visual original:**

O stickman se agacha e toca a esfera azul com o indicador direito. No instante do contato, a esfera emite um pulso circular azul transparente que se expande rapidamente por toda a tela. A linha do chão fica azul por meio segundo. O personagem se levanta, mas seus pés começam a sair lentamente do chão. Ele sobe cerca de um corpo de altura, com braços e pernas pendurados, como se estivesse em gravidade zero.

**Som:** pulso eletrônico suave, seguido de um zumbido.

**Direção técnica adicional:** Toque mão-esfera ativa pulso; aplicar impulso ascendente leve além de g=0.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 04 — Tentando nadar no ar (0:15–0:20)

**Descrição visual original:**

Suspenso no centro da tela, o stickman movimenta braços e pernas como se estivesse nadando. Seu corpo gira lentamente no sentido horário. Ele tenta correr no ar, mas não consegue se deslocar. Então estica o braço esquerdo na direção do chão, sem alcançá-lo. A esfera azul também está flutuando, um pouco abaixo dele.

**Som:** movimentos rápidos no ar e um efeito cômico de giro.

**Direção técnica adicional:** Membros nadam sem propulsão; rotação lenta do corpo em gravidade zero.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 05 — A primeira solução (0:20–0:25)

**Descrição visual original:**

O stickman percebe que pode alcançar a esfera com o pé direito. Ele estica a perna e dá um chute na esfera para a esquerda. A esfera dispara para fora da tela, enquanto o corpo do personagem se desloca lentamente para a direita, girando no sentido contrário ao movimento do chute. Ele percebe a reação e tenta se equilibrar abrindo os braços.

**Som:** pequeno impacto e deslocamento no ar.

**Direção técnica adicional:** Chute com reação de impulso oposta; esfera sai à esquerda; personagem desloca à direita.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 06 — O retorno da gravidade (0:25–0:30)

**Descrição visual original:**

A esfera azul reaparece pela esquerda, bate no chão e pisca em vermelho. Instantaneamente, a gravidade retorna. O stickman, que estava flutuando, cai verticalmente e aterrissa de costas, com braços e pernas espalhados. Seu corpo dá um pequeno quique. Ele permanece imóvel por meio segundo e depois levanta a cabeça, olhando para a esfera.

**Som:** estalo eletrônico e impacto cômico.

**Direção técnica adicional:** Esfera retorna por trajetória dirigida; g volta ao padrão; queda e contato dorsal.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 07 — O chão sem atrito (0:30–0:35)

**Descrição visual original:**

O stickman se levanta e caminha cuidadosamente até a esfera. Quando seu pé direito toca uma região azul brilhante do chão, perde completamente a aderência. O pé desliza rapidamente para a frente, enquanto o tronco fica para trás. Ele balança os braços tentando recuperar o equilíbrio, mas acaba deslizando para a direita como se estivesse sobre gelo perfeitamente liso.

**Som:** escorregão agudo e vento.

**Direção técnica adicional:** Zona de atrito ~0; pé desliza; manter centro de massa e reação de braços.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 08 — A parede invisível (0:35–0:40)

**Descrição visual original:**

Deslizando cada vez mais rápido, o stickman tenta frear com os pés, mas não consegue. De repente, bate com as duas mãos em uma parede vertical transparente, revelada apenas por um contorno azul no momento do impacto. Seu corpo se comprime levemente contra a parede e depois é lançado para trás como uma mola.

**Som:** impacto elástico exagerado.

**Direção técnica adicional:** Parede transparente revelada no impacto; colisão com restituição alta.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 09 — Elasticidade absurda (0:40–0:45)

**Descrição visual original:**

O stickman voa para a esquerda, atinge o chão com as costas e, em vez de parar, quica como uma bola de borracha. A cada impacto, seu corpo se comprime e se estica de forma cartunesca. Ele dá três saltos, cada um mais alto que o anterior, até atingir quase o topo da tela. No último salto, abre os braços em pânico.

**Som:** três boings crescentes.

**Direção técnica adicional:** Três quiques de altura crescente: animação dirigida superelástica.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 10 — Gravidade lateral (0:45–0:50)

**Descrição visual original:**

Enquanto o stickman está no ar, a esfera azul emite outro pulso. Uma seta azul luminosa aparece brevemente apontando para a direita. O personagem deixa de cair e passa a ser acelerado horizontalmente, com os pés apontando para a esquerda e a cabeça para a direita. Ele atravessa a tela e desaparece pela borda direita.

**Som:** pulso elétrico e aceleração rápida.

**Direção técnica adicional:** Gravidade muda para +x; saída do personagem à direita.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 11 — O mundo gira (0:50–0:55)

**Descrição visual original:**

A câmera acompanha o stickman e revela uma parede preta vertical à direita. Ele cai sobre essa parede, que agora funciona como chão devido à gravidade lateral. A câmera gira suavemente 90 graus no sentido anti-horário, fazendo a parede parecer horizontal. O stickman fica em pé, confuso, e olha para os dois lados.

**Som:** movimento mecânico grave e um toque cômico.

**Direção técnica adicional:** Revelar parede direita, câmera gira -90°; gravidade permanece vetor do mundo.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 12 — O cubo pesado (0:55–1:00)

**Descrição visual original:**

Um cubo cinza de aproximadamente duas vezes o tamanho da cabeça do stickman surge acima dele e cai sobre o novo chão. O personagem se aproxima e tenta empurrá-lo com as duas mãos, inclinando o corpo e dobrando os joelhos. O cubo não se move. Ele tenta novamente, fazendo ainda mais força, mas continua imóvel.

**Som:** esforço cômico e atrito pesado.

**Direção técnica adicional:** Cubo surge e pousa; tentativa de empurrar falha; cubo inicialmente pesado.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 13 — Massa invertida (1:00–1:05)

**Descrição visual original:**

A esfera azul aparece rolando lentamente atrás do cubo e emite um pulso roxo. O cubo começa a brilhar em roxo. O stickman tenta empurrá-lo novamente, mas o cubo se desloca inesperadamente em sua direção, no sentido oposto ao empurrão. O personagem recua assustado, e o cubo continua deslizando na direção dele.

**Som:** pulso roxo e vibração crescente.

**Direção técnica adicional:** Cubo muda para modo resposta invertida (não massa negativa real).

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 14 — A perseguição impossível (1:05–1:10)

**Descrição visual original:**

O stickman corre para a esquerda. O cubo roxo desliza atrás dele, acelerando sempre que o personagem tenta empurrá-lo para longe. O stickman muda de direção bruscamente, salta por cima do cubo e aterrissa do outro lado. O cubo para por um instante, tremendo.

**Som:** passos rápidos, deslizamento e batidas eletrônicas.

**Direção técnica adicional:** Cubo persegue por forças dirigidas; salto e troca de lados.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 15 — O experimento (1:10–1:15)

**Descrição visual original:**

O stickman percebe que o cubo reage de maneira contrária às forças aplicadas. Ele se aproxima cautelosamente, fica atrás do cubo e o puxa com as duas mãos em sua direção. O cubo dispara para a frente, afastando-se dele. O personagem observa o resultado, inclina a cabeça e levanta um dedo, demonstrando que teve uma ideia.

**Som:** movimento rápido e pequeno toque de descoberta.

**Direção técnica adicional:** Puxar cubo para perto provoca aceleração para longe; descoberta gestual.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 16 — A esfera se transforma (1:15–1:20)

**Descrição visual original:**

A esfera azul começa a vibrar violentamente no centro da tela. O stickman se afasta. Pequenos símbolos físicos aparecem ao redor dela: setas, vetores, espirais e linhas de trajetória. A esfera cresce até ficar três vezes maior e passa a alternar rapidamente entre azul, roxo e vermelho. O chão treme, criando pequenas ondas na linha horizontal.

**Som:** energia aumentando e pulsos graves.

**Direção técnica adicional:** Esfera cresce, oscila RGB, símbolos de vetores; preservar posição do personagem.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 17 — O caos físico (1:20–1:25)

**Descrição visual original:**

A esfera dispara três ondas concêntricas de energia. A primeira inverte a gravidade, fazendo o stickman subir. A segunda cria uma força horizontal que o lança para a esquerda. A terceira altera a elasticidade do chão, fazendo o personagem quicar quando o atinge. Os efeitos se sucedem rapidamente, deixando rastros coloridos.

**Som:** três explosões eletrônicas em sequência.

**Direção técnica adicional:** Três ondas sucessivas: gravidade, força horizontal e quique.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 18 — Usando a inércia (1:25–1:30)

**Descrição visual original:**

O stickman está sendo arremessado para a esquerda. Ele agarra o cubo roxo que passa próximo dele. Ao puxá-lo para trás, o cubo acelera para a frente, arrastando o personagem na direção da esfera. O stickman segura firme, com o corpo esticado horizontalmente pelo movimento.

**Som:** aceleração, vento e vibração.

**Direção técnica adicional:** Personagem agarra cubo; contato da mão fixo; reação dirigida acelera conjunto.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 19 — O lançamento (1:30–1:35)

**Descrição visual original:**

Perto da esfera, o stickman solta o cubo e continua avançando por inércia. Ele gira o corpo no ar, coloca os pés para a frente e atinge a esfera com um chute duplo. A esfera recua ligeiramente e libera uma onda de choque que lança o stickman para trás.

**Som:** impacto metálico forte e explosão de energia.

**Direção técnica adicional:** Solta cubo, conserva inércia; chute duplo e onda de choque.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 20 — O tempo desacelera (1:35–1:40)

**Descrição visual original:**

O stickman voa para trás em câmera lenta. Pequenos fragmentos luminosos flutuam ao redor dele. Sua trajetória aparece desenhada como uma curva pontilhada azul. A câmera se aproxima lentamente do personagem enquanto ele gira a cabeça em direção à esfera e estende uma mão.

**Som:** áudio abafado e batida grave lenta.

**Direção técnica adicional:** Slow motion visual e trajetória pontilhada; duração de take permanece 5s.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 21 — A descoberta final (1:40–1:45)

**Descrição visual original:**

O stickman percebe que os fragmentos seguem trajetórias previsíveis. Ele observa uma pequena partícula passando à sua frente, estende a mão e a toca. A partícula muda de direção. O personagem olha para sua própria mão e depois para a esfera. Uma pequena seta azul aparece sobre a palma, mostrando a direção da força aplicada.

**Som:** toque cristalino e breve silêncio.

**Direção técnica adicional:** Partícula desvia ao toque; seta vetorial sobre a palma.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 22 — O plano (1:45–1:50)

**Descrição visual original:**

A velocidade normal retorna. O stickman aterrissa, desliza sobre o chão sem atrito e utiliza uma parede elástica para ricochetear. Ele direciona o próprio corpo em direção ao cubo roxo, segura sua borda e o puxa para trás. O cubo acelera para a frente, apontado diretamente para a esfera instável.

**Som:** sequência rápida de impactos e aceleração.

**Direção técnica adicional:** Ricochete na parede; agarrar e puxar cubo para lançá-lo à esfera.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 23 — A colisão decisiva (1:50–1:55)

**Descrição visual original:**

O cubo roxo atinge a esfera exatamente no centro. Uma onda de choque circular se expande. A esfera se comprime, sua superfície racha em linhas brancas e todas as cores convergem para um ponto luminoso. A tela inteira fica branca durante uma fração de segundo.

**Som:** explosão profunda, seguida de silêncio absoluto.

**Direção técnica adicional:** Colisão cubo-esfera; compressão, rachaduras, flash branco breve.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 24 — Tudo volta ao normal (1:55–2:00)

**Descrição visual original:**

A tela branca revela novamente o chão preto horizontal. O stickman está deitado de costas no centro. A esfera azul agora é pequena, sem brilho, e repousa ao lado dele. O personagem se senta lentamente, olha para os próprios pés e se levanta. Dá um pequeno salto de teste e aterrissa normalmente, aliviado.

**Som:** ambiente calmo e dois passos suaves.

**Direção técnica adicional:** Restaurar g e atrito normais; esfera pequena apagada; salto-teste.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

### Take 25 — A última surpresa (2:00–2:05)

**Descrição visual original:**

O stickman começa a caminhar para a direita, deixando a esfera para trás. Após três passos, a esfera emite um pequeno brilho verde. O personagem para imediatamente e olha por cima do ombro. Uma maçã vermelha aparece acima de sua cabeça e cai, acertando-o. Ele se agacha e segura a cabeça com as duas mãos. Corte instantâneo para preto.

**Som:** pequeno brilho eletrônico, impacto cômico e corte seco.

**Direção técnica adicional:** Caminhada, pulso verde, maçã cai na cabeça; corte final preto.

**Janela de execução:** 120 frames; definir antecipação, ação, reação e pose final com keyframes locais; conferir primeiro e último frame com takes vizinhos.

## Plano de testes

- Renderizar frames 0, 119, 120, 719, 720, 1799, 1800, 2999 e contact sheet por take.
- Conferir gravidade normal/zero/lateral, impulso oposto do chute, atrito zero, colisão com parede, squash/stretch, cubo invertido e câmera giratória.
- Detectar saltos de posição/rotação e contatos inválidos nos limites entre takes; permitir cortes apenas quando explícitos.
- Comparar duração de vídeo e áudio com FFprobe; não mascarar falhas com afirmações de sucesso.

## Nota de design

A história é deliberadamente estilizada, não uma demonstração rigorosa de física. O solver real fornece coerência local; o diretor impõe ações impossíveis de modo intencional.