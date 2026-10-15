# Relatório — implementação dos 25 takes

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

## Terceiro bloco

Esfera 3×, três ondas com regras distintas, agarre por restrição de mãos, soltura por inércia, chute duplo, slow motion 0,15×, partículas desviáveis, ricochete, lançamento do cubo, colisão central, rachaduras, flash, reset explícito, salto normal e maçã com corte preto. Os testes cobrem 15.001 estados a 120 Hz; todos os 25 takes têm cinco segundos.

O erro máximo de alvos de contato é inferior a 1e-12 pixel; o erro de comprimentos é inferior a 1e-9 pixel. Há três passos no take 25. O cubo atinge a esfera em 110,517 s; a maçã atinge a cabeça em 123,517 s. A mudança grande de posição em 115 s é o reset explícito oculto pelo flash do roteiro. Nos demais estados o deslocamento máximo é 20,994 pixels por passo físico; não há saltos de continuidade nos limites de takes.

As poses rápidas usam cinco amostras de uma exposição curta de 1/96 s, somente quando a velocidade na tela supera 550 px/s. O efeito é independente do rig e determinístico, e fica desativado perto de cortes explícitos. O áudio original sintetizado inclui filtragem durante a câmera lenta e silêncios do roteiro.

Os arquivos finais MP4 ainda dependem da validação do encode completo nesta revisão.
