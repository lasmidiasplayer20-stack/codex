# Movimento, bones e física

Trabalhe nas unidades do perfil original. Os ângulos precisam ser desenrolados entre registros; não interpole cruzando ±π pelo caminho longo. Use alvos contínuos e trajetórias legíveis para mãos e pés.

## Apoios e contatos

Declare peso de apoio, plano e orientação explicitamente. Um personagem com quadril baixo pode estar pendurado num buraco, não agachado no chão. Um personagem invertido precisa de pés no teto e cabeça orientada com o corpo. Nunca escolha o modo só pelo `y` do quadril.

Na marcha, use distância percorrida para alternar apoio e balanço. Mantenha o pé apoiado no mundo; ao parar, termine o balanço sem colar o pé instantaneamente ao plano. Faça transições suaves entre voo e apoio. Evite joelhos abaixo do chão em poses profundas; ajuste quadril, abertura e inclinação do tronco.

Bindings de mãos devem começar e terminar com aproximação/soltura. Verifique o alcance a partir do ombro de cada personagem, não do quadril. Em um resgate, ambos compartilham o mesmo ponto de contato. No gesto de conter dois pulsos, use dois pontos distintos e mantenha as cabeças separadas. Não encurte bones para atingir uma posição impossível.

## Física e continuidade

`assets/button-r4/src/physics.js` demonstra integração semi-implícita a 120Hz, gravidade vetorial, arrasto, restituição, limites e estado persistente de props. A atuação dos personagens é dirigida por trajetórias e IK/FK. Preserve essa distinção nos relatórios; não chame o sistema de simulador geral de colisões entre membros.

Objetos e atores precisam reagir ao evento que os afeta. Trocas de gravidade, ancoragem e forças fantásticas devem ser visíveis e limitadas; não introduza massa negativa em um solver genérico. Preserve posição/velocidade ou declare o corte. Não reinicie objetos no começo de cada parte.

A câmera transforma o mundo inteiro. Não escale cada personagem para fazê-lo caber. Confira extremos de voo, mãos, pés e cabeça com margem para o raio do desenho e os textos.
