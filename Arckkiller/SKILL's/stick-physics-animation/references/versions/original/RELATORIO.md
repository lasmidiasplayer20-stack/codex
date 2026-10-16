# Relatório — Animation vs. Physics

## Resultado entregue

Filme completo com **125,000 segundos**, **25 takes de cinco segundos**, **3.000 frames**, **1920×1080**, **24 fps constantes**, vídeo **H.264 yuv420p** e áudio **AAC estéreo 48 kHz**. Há também uma versão 1280×720, três prévias por bloco e um ZIP editável. O MP4 1080p ocupa 6.970.092 bytes; o 720p, 4.943.889 bytes.

O desenvolvimento seguiu a ordem `LEIA_PRIMEIRO.md` → nova skill → roteiros técnico/original → base existente. Os blocos 01–06, 07–15 e 16–25 foram implementados, testados e exportados nessa ordem. O filme completo foi renderizado novamente a partir do estado persistente, evitando emendas de cenas ou reinicializações implícitas.

Toda a imagem é desenhada em Canvas2D por código. Objetos, cores, efeitos, partículas, maçã, som e música são procedurais. Não foram usados vídeos gerados por IA, pixels de referência, vetorização automática ou mascaramento de filmagem.

## Preservação e compatibilidade

A base original inteira foi copiada antes da implementação. `vendor/rig-controller.js` é byte a byte idêntico ao controlador fornecido. As funções `line`, `circle`, `curve` e `actor` do template estão copiadas literalmente em `src/legacy-renderer.js`; novos bindings conectam o mesmo desenho ao novo estado. São verificados 22 arquivos do template e 34 arquivos do projeto anterior, tanto no backup quanto na pasta ativa anterior. Nenhum deles foi modificado.

O template fornecido dependia de `motion-data.js`, ausente no pacote, e seu exemplo de exportação era fixado em 60 fps. A solução foi acrescentar dados de poses/física e outro ponto de entrada de renderização, mantendo o template intacto. O perfil G do sistema anterior é reutilizado sem mudar suas proporções. O fator uniforme **e constante** 0,72 converte unidades para uma figura de aproximadamente 170 px; não é uma escala animada. A instância preta corresponde à direção de arte do roteiro.

A exigência de squash/stretch foi subordinada à preservação: compressão por dobras das juntas, sem esticar ossos, aumentar a cabeça ou reconstruir personagens. O adaptador IK e os novos módulos são separados do FK e do desenho originais.

## Física, regras modificadas e coreografia

- Integração semi-implícita em passo fixo de **1/120 s**, com massas positivas, gravidade, resistência, atrito, restituição e impulsos.
- A esfera inicial tem três impactos amortecidos. Gravidade zero é acompanhada por impulso ascendente; nadar movimenta as juntas sem produzir força translacional.
- O primeiro chute aplica impulsos iguais e opostos entre personagem e esfera.
- Gelo remove atrito. A parede e o chão superelástico acrescentam energia intencionalmente; os três lançamentos têm 480, 690 e 1100 px/s.
- A gravidade lateral permanece no eixo do mundo enquanto a câmera gira. A mudança de base em 55 s não muda a posição física.
- O cubo mantém massa positiva de 80 unidades. Seu modo invertido troca explicitamente a direção de forças/impulsos aplicados; não há massa negativa genérica no solver.
- O agarre usa alvos nas duas mãos e uma restrição dirigida do corpo; a soltura conserva a velocidade adquirida. O chute duplo é seguido por uma onda de choque.
- O slow motion usa **timeScale 0,15**, preservando cinco segundos de filme por take. Um campo residual fraco de 18 px/s² curva a trajetória; o áudio é filtrado e as partículas continuam previsíveis.
- A partícula desvia após o toque. O ricochete ocorre em **105,983 s** e o cubo atinge a esfera em **110,517 s**, numa trajetória alinhada ao centro.
- O reset em **115 s** é um corte explícito coberto pelo flash do roteiro. Seguem o salto normal, três passos, brilho verde, maçã em **123,517 s**, mãos na cabeça e corte preto em **124,85 s**.

Poses, caminhada, aproximações e alguns trajetos são coreografados. A separação entre essas ações e as regras físicas está explícita nos módulos do diretor.

## Verificações executadas

Os testes de preservação e movimento passaram. Foram simulados **15.001 estados**; o último é o estado de borda em 125 s e não gera um frame extra.

| Verificação | Resultado |
|---|---:|
| Takes / frames de saída | 25 / 3000 |
| Maior erro de comprimento de osso | 8,71 × 10⁻¹³ px |
| Maior erro dos alvos de contato | 1,43 × 10⁻¹⁴ px |
| Maior penetração do personagem nos planos | 0,586 px |
| Movimento do cubo nas duas tentativas pesadas | 0 px |
| Erro de impulso total do primeiro chute | 0 |
| Erro de velocidade durante o nado em gravidade zero | 0 |
| Deslocamento físico na mudança de base em 55 s | 0 px |
| Estados com mãos presas ao cubo no take 18 | 522 |
| Erro de alinhamento da trajetória do cubo à esfera | 1,61 × 10⁻¹¹ px |
| Passos no take 25 | 3 |
| Exceções do navegador / valores não finitos | 0 / 0 |

A tolerância de penetração é inferior a um pixel lógico, em um chão com traço de três pixels. Os testes verificam juntas e cabeça; o desenho usa as curvas suaves originais do rig. Fora do reset explícito, o maior deslocamento por passo físico foi 20,994 px. Câmera e personagem foram conferidos também nos limites de takes. A simulação e o desenho após buscas em ordem diferente são determinísticos.

A exposição de **1/96 s**, com cinco amostras ponderadas, atua apenas quando a velocidade na tela supera 550 px/s. É curta, não usa histórico acumulado, não cria rastros permanentes e fica desativada perto dos cortes explícitos.

As duas versões finais passaram por FFprobe e **decodificação integral com FFmpeg**. Foram extraídos **76 frames do MP4**, incluindo 0, 119, 120, 719, 720, 1799, 1800 e 2999, frames de cada take e pares antes/depois das transições. As pranchas estão em `exports/contact-sheet-final-*.jpg`. O flash está branco e o último frame está preto dentro da tolerância do codec. O áudio fonte contém 6.000.000 amostras por canal e os intervalos de silêncio testados têm amplitude zero.

Os hashes das fontes do render permaneceram iguais após a exportação. As prévias foram publicadas em revisões imutáveis; os downloads publicados são conferidos por tamanho e SHA-256.

## Limites e evolução compatível

O personagem é um corpo com poses articuladas, IK e colisores discretos em cabeça/juntas; não é uma simulação biomecânica de cada osso. O cubo usa caixa e a esfera usa círculo. Caminhadas e restrições de mãos são coreografadas; os efeitos superelásticos e forças invertidas acrescentam energia conforme a história. As ondas desenhadas no chão são visuais e mantêm o plano de colisão estável.

Esses limites foram escolhidos para manter o roteiro e preservar os bonecos. Uma evolução possível é acrescentar colisores ao longo das curvas e juntas dinâmicas limitadas, em módulos separados, mantendo comprimentos e os arquivos originais. A presente entrega já inclui o filme inteiro e todas as ações dos 25 takes; essas evoluções não são dependências para assistir ou renderizar o projeto.
