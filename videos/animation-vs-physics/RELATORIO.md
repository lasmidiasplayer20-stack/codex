# Relatório parcial — takes 01–15

O ZIP foi lido a partir de `LEIA_PRIMEIRO.md`, seguido da nova skill, roteiros e base. O projeto foi criado separadamente; não foram editados os bonecos, rigs ou movimentos antigos.

## Compatibilidade

O template original depende de dados de movimento de uma referência e é fixado em 60 fps. Ele não inclui esses dados. O novo adaptador gera controles nomeados a partir de física e coreografia, usa o FK original intacto e alimenta as funções de desenho originais copiadas literalmente. Um novo ponto de entrada de render exporta 24 fps; o renderer original continua intacto no backup.

O requisito de squash/stretch foi subordinado à preservação dos bonecos: não há alteração de comprimento de ossos nem escala variável de personagem. Dobras e poses produzem a compressão visual. A câmera é externa ao modelo.

## Primeiro bloco

Caminhada, esfera com três impactos amortecidos, susto, aproximação, toque, pulso, flutuação, nado sem propulsão, chute com impulso oposto, retorno da gravidade, queda dorsal, pequeno quique e levantar da cabeça. A câmera acompanha suavemente a entrada inicial para permitir passos naturais sem alterar as proporções do modelo.

Os testes conferem comprimentos, determinismo, contato, impulso e velocidade em gravidade zero. A tolerância de contato com o chão é de um pixel lógico para a resolução de restrições; o traço do chão tem três pixels. Os relatórios numéricos estão em `exports/`.

O áudio é instrumental e de efeitos sintetizados por código, sem vozes, material externo ou licenças adicionais. As prévias são renderizadas e decodificadas antes da entrega.

Este documento será ampliado após a implementação dos takes restantes. O filme completo ainda não está concluído nesta etapa.

## Segundo bloco

Atrito zero, impacto na parede transparente, três quiques com velocidades de lançamento 480/690/1100 px/s, gravidade lateral, rotação da câmera e cubo pesado/invertido. O cubo permanece com massa positiva de 80 unidades; forças invertidas são regras explícitas. As mãos alcançam as faces do cubo sem alongar braços. A travessia do cubo usa impulso de salto e troca de lados.

Validação em 9.001 estados a 120 Hz: erro máximo de ossos inferior a 1e-9 pixel, erro de alvos de contato zero, penetração máxima no chão de 0,586 pixel, nenhuma exceção do navegador. A prévia 07–15 contém 1.080 frames a 24 fps. A implementação dos takes finais ainda precisa ser ativada, refinada e renderizada.
