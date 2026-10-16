# Animation vs. Physics — V2 Viva

## Entrega concluída

Filme inteiramente programado com 25 takes, 125 segundos, 3000 frames, 1920×1080, 24 fps, H.264 yuv420p e AAC estéreo 48 kHz. Há uma versão 720p, três prévias por bloco (30, 45 e 50 segundos), um comparativo antes/depois de 30 segundos e o projeto editável. Os MP4s passaram por FFprobe e decodificação completa sem erros. Nenhum vídeo ou imagem de referência alimenta o renderer.

## Direção e atuação

O personagem ganhou 27 janelas de atuação corporal, com curiosidade, hesitação, susto, esforço, exaustão, ideia e alívio. A câmera agora alterna planos de ação com 19 inserts de reação/contato, totalizando 37 limites de corte alinhados a frames. A mediana de zoom nas amostras de reação é 4.76×. Os testes de enquadramento não encontraram cortes involuntários dos nós relevantes para cada plano. Nos inserts de mãos, pés ou objetos o recorte é intencional; o rig continua inteiro no mundo.

A orientação dos joelhos acompanha a direção da atuação. Alvos dos pés transitam por 0,2 s ao parar/saltar, evitando uma troca instantânea de postura. O sistema original de IK/FK permanece responsável pelos comprimentos e articulações. A câmera não aumenta o corpo no mundo.

O cenário recebeu camadas de luz, grade, parallax, sombras, materiais dos objetos e reações visuais a 76 eventos físicos/coreografados. Há faíscas, poeira, ondas e fragmentos convergentes no colapso. O filme continua sem falas ou textos sobrepostos; os rótulos antes/depois aparecem somente no comparativo auxiliar.

## Preservação

A V1 no commit `18f3a7d3624b2b256a4ebd96f18b63f149069742` e todos os projetos anteriores permanecem intactos. Os 34 arquivos fonte da V1 utilizados foram copiados, com hashes, para `preserved/revision-v1/`. A validação comparou também a V1 viva. O controlador, o perfil de proporções e as quatro funções originais de desenho são idênticos. Os 11 nós, a cabeça, os comprimentos e a identidade sem rosto foram preservados. As extensões estão em `performance.js`, `cinematic.js` e `living-world.js`.

## Física, continuidade e validação

- Passo fixo: 1/120 s, 15.001 estados; seed determinística.
- Ossos: maior erro 8.99e-13 px.
- Contatos travados: maior erro 1.42e-14 px.
- Penetração máxima na amostragem do solver: 0.5858 px (tolerância < 1 px).
- Testes de física, roteiro, determinismo e direção passaram; estados e imagens repetidos são determinísticos.
- Verificados os 25 takes, três quiques amortecidos, impulso oposto do chute, natação sem propulsão do centro de massa, duas tentativas de mover o cubo pesado, regras invertidas com massa positiva, três ondas de caos, contatos do cubo, soltura por inércia, chute duplo, câmera lenta, ricochete, lançamento, colisão central e desfecho da maçã.
- Os cortes de câmera não reiniciam corpos nem giram a gravidade. O único reset físico explícito é o flash em 115 s.
- Fonte de render e áudio permaneceram com os mesmos hashes durante a exportação (`render-freeze-v2.json`).

Foram extraídos 145 frames do MP4 final para conferir os 25 takes, último/primeiro frame de cada transição e frames adjacentes aos 37 limites de câmera, dentro da duração do filme. As pranchas `contact-sheet-final-takes.jpg`, `contact-sheet-final-transitions.jpg` e `contact-sheet-camera-cuts.jpg` registram a revisão. Também foram examinados frames intermediários da aceleração, soltura e chute duplo. O último frame é preto (máximo RGB 1); o flash tem mínimo RGB 253.

## Som

Trilha instrumental e efeitos sintetizados por código, sem gravações ou vozes externas. Motivo de descoberta, baixo/percussão de ação, crescendos, sons do cubo e esfera, impacto final, pausas cômicas e silêncio no colapso/reset. PCM com 6.000.000 amostras por canal, estéreo 48 kHz. Master com oversampling 4×, limitador e compensação de latência. AAC medido em −17,3 LUFS, LRA 12,3 LU e pico verdadeiro −1,1 dBFS. Os intervalos de silêncio do roteiro foram verificados no PCM.

## Limites do modelo e edição

O corpo usa o rig articulado existente com colisões amostradas nos nós contra planos e objetos simples; não é uma simulação anatômica de tecido mole. A atuação é coreografada e a integração física continua separada dela. Superelasticidade e resposta invertida são regras explícitas do roteiro com velocidades limitadas e massa positiva. A grade deformada, halos, sombras e materiais são efeitos gráficos; não acrescentam colisores invisíveis. Há cortes de montagem deliberados e exposição curta em movimentos rápidos, desativada junto aos cortes para evitar mistura de planos.

Para editar, ajuste `performance.js`, `cinematic.js`, `living-world.js` e os módulos de física/diretor, mantendo os arquivos preservados. O ZIP inclui a trilha AAC pronta para o player/render; o WAV pode ser regenerado com `score-v2.py`. O comparativo usa os dois filmes programados já renderizados somente para comparação; ele não participa da criação da V2.

## Integridade dos filmes completos

| Arquivo | Bytes | SHA-256 |
| --- | ---: | --- |
| 1080p | 44678765 | `257d7b4ec8de23dbd56f77c31a52271aaa4ac87b1d805109e09ed49ad327030e` |
| 720p | 19751685 | `106033a855fc14b07edcf2677fd711fb35da401a14b7c0d73fc50036d3e51490` |

Publicação e downloads são conferidos por tamanho e SHA-256 em links fixos por commit. Nenhum software foi instalado no computador do usuário.
